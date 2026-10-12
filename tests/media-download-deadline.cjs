const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
let pendingDns=false,clock=1000,serial=0,timers=new Map(),req,res;const fakeDate={now:()=>clock};
const transport={get:(url,options,callback)=>{req=new EventEmitter();req.destroy=e=>{req.emit('error',e);};res=new EventEmitter();res.statusCode=200;res.headers={'content-type':'video/mp4'};res.destroy=()=>{};queueMicrotask(()=>callback(res));return req;}};
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/safe-fetch.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,Buffer,URL,Error,Date:fakeDate,setTimeout:(fn,ms)=>{const id=++serial;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),require:n=>n==='node:dns/promises'?{lookup:async()=>pendingDns?new Promise(()=>{}):[{address:'1.1.1.1',family:4}]}:n==='node:net'?require(n):transport});
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
(async()=>{
let p=m.exports.safeDownload('https://media.test/video.mp4');await flush();assert.equal(timers.size,1);req.emit('close');assert.equal(timers.size,1,'Request close must not cancel the response-body deadline');res.emit('data',Buffer.from('video'));res.emit('end');assert.equal((await p).buffer.toString(),'video');assert.equal(timers.size,0);
p=m.exports.safeDownload('https://media.test/video.mp4');await flush();const rejection=assert.rejects(p,/timed out/);req.emit('close');const timer=[...timers.values()][0];assert.equal(timer.ms,90000);timer.fn();await rejection;assert.equal(timers.size,0);
p=m.exports.safeDownload('https://media.test/video.mp4');await flush();const aborted=assert.rejects(p,/interrupted/);res.emit('aborted');await aborted;assert.equal(timers.size,0);
pendingDns=true;p=m.exports.safeDownload('https://media.test/video.mp4');await flush();const dns=assert.rejects(p,/DNS lookup timed out/);const dnsTimer=[...timers.values()][0];assert.equal(dnsTimer.ms,15000);dnsTimer.fn();await dns;assert.equal(timers.size,0);
await assert.rejects(()=>m.exports.safeDownload('https://media.test/video.mp4',100,0,clock-1),/timed out/);
console.log('PASS bounded DNS/body deadlines, request-close regression, aborted streams, cleanup and expired total deadline; offline HTTP mocks');
})().catch(e=>{console.error(e);process.exitCode=1});
