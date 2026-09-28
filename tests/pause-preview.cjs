const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('assert/strict'),Module=require('module');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
const load=Module._load,cache=new Map();let cleans=0,fetches=0;
Module._load=function(name,parent,main){
 if(name==='@/lib/media')return {existingMedia:async p=>p.endsWith('-10s-v2.wav')?'https://sample/original.mp3':cache.get(p),putMedia:async(p,b)=>{cache.set(p,'https://sample/'+p);return cache.get(p)}};
 if(name==='@/lib/elevenlabs')return {listVoices:async()=>{throw Error('A saved sample must never be regenerated')}};
 if(name==='@/lib/vo-cleanup')return {VO_CLEANUP_VERSION:'test-v9',cleanVoiceover:async()=>{cleans++;return new ArrayBuffer(256)}};
 if(name.startsWith('@/'))name=path.join(__dirname,'..',name.slice(2));
 return load.call(this,name,parent,main);
};
global.fetch=async()=>{fetches++;return new Response(new Uint8Array(256))};
const {POST}=require('../app/api/vo/preview/route.ts');
const call=async(mode='standard',normalize=false)=>{const r=await POST(new Request('http://localhost',{method:'POST',body:JSON.stringify({voiceId:'testVoice',processing:{mode,normalize}})}));return {status:r.status,...await r.json()}};
(async()=>{const a=await call(),b=await call();assert.equal(a.status,200);assert.deepEqual(a,b);assert.equal(cleans,1);assert.equal(fetches,1);const c=await call('gentle');assert.equal(c.original,a.original);assert.notEqual(c.processed,a.processed);await call('gentle',true);assert.equal(cleans,2);assert.equal((await call('bad')).status,400);console.log('PASS fixed original, cached repeats, separate profiles, normalization ignored, invalid input');})().catch(e=>{console.error(e);process.exitCode=1});
