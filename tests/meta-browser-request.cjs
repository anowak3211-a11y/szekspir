const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const client=require('../lib/meta-browser-request.ts'),realFetch=global.fetch,realTimer=global.setTimeout;
let calls=0,mode='busy';
global.setTimeout=(fn)=>{queueMicrotask(fn);return 0;};
global.fetch=async()=>{calls++;if(mode==='busy'&&calls===1)return Response.json({kind:'queue_wait',retryAfterSeconds:2,error:'Queue busy'},{status:503});if(mode==='provider')return Response.json({kind:'provider_limit',retryAfterSeconds:600,error:'Meta requested a pause'},{status:429});if(mode==='post')return Response.json({kind:'queue_wait',retryAfterSeconds:2,error:'Queue busy'},{status:503});return Response.json({items:['fixture']});};
(async()=>{
 const r=await Promise.all(Array.from({length:6},()=>client.uploaderRequest('/offline/read')));assert.equal(calls,2,'One initial read and one retry shared by all callers');assert.equal(r.length,6);
 mode='post';calls=0;await assert.rejects(()=>client.uploaderRequest('/offline/write',{action:'start'}),e=>e instanceof client.UploaderWait);assert.equal(calls,1,'A write is never automatically replayed');
 mode='provider';calls=0;await assert.rejects(()=>client.uploaderRequest('/offline/limit'),e=>e instanceof client.UploaderWait&&e.retryAfterSeconds===600);assert.equal(calls,1,'No repeated attempts during a provider cooldown');
 mode='busy';calls=0;await client.uploaderRequest('/offline/read');assert.equal(calls,2,'Failed in-flight requests do not poison future retries');
 console.log('PASS: browser read sharing, bounded local wait recovery, no write replay, provider cooldown respected and failed promises removed. No network.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{global.fetch=realFetch;global.setTimeout=realTimer;});
