const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
let job={id:'cancel-hook-test',adId:'MEL-00122',result:{hooks:['Approved original','Second hook']},hookVoPending:{}};
let release,began,uploads=0;const started=new Promise(r=>began=r),gate=new Promise(r=>release=r),real=Module._load;
const store={readState:async(k,d)=>({value:k==='job-'+job.id?job:d}),mutate:async(k,d,fn)=>fn(job)};
Module._load=function(n,p,...args){
 if(n==='@/lib/jobs')return {getJob:async()=>job};
 if(n==='@/lib/store'||n==='./store')return store;
 if(n==='@/lib/elevenlabs')return {generateVO:async(text,voice,preserve)=>{began();await gate;await preserve(new ArrayBuffer(16),{});return new ArrayBuffer(16);}};
 if(n==='@/lib/media')return {putMedia:async()=>{uploads++;return 'https://offline.invalid/raw.wav'}};
 if(n==='@/lib/sheets')return {updateVoiceover:async()=>assert.fail('Stopped hooks must not reach a sheet')};
 if(n==='@/lib/editor-sync')return {syncAssignedEditor:async()=>assert.fail('Stopped hook cannot be delivered')};
 if(n==='@/lib/editor-locks')return {withEditorLocks:async(_,fn)=>fn()};
 if(n.startsWith('@/'))return real.call(this,path.resolve(n.slice(2)),p,...args);
 return real.call(this,n,p,...args);
};
(async()=>{
 const {POST}=require('../app/api/vo/route.ts');
 const request=()=>new Request('https://offline/api/vo',{method:'POST',body:JSON.stringify({jobId:job.id,hookIndex:0,text:'Edited hook',voiceId:'fake-voice'})});
 const recording=POST(request());await started;assert(job.hookVoPending[0]);
 job.abortedAt=job.cancelledAt=Date.now();job.hookVoPending={};
 const stopped=await POST(request());assert.equal(stopped.status,409,'New recording requests must fail before reaching the provider');
 release();const response=await recording;assert.equal(response.status,409);assert.equal(job.result.hooks[0],'Approved original');assert(!job.hookVoUrls?.[0]);assert(!job.hookVoOriginalUrls?.[0]);assert.equal(uploads,0,'Cancelled callback cannot upload a new recording');
 console.log('PASS new hook requests stopped; late provider response cannot overwrite cancelled hook or publish to Sheets (offline)');
})().catch(e=>{console.error(e);process.exitCode=1});
