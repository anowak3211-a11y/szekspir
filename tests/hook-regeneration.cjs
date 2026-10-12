const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const original={id:'hook-preview-test-001',status:'Complete',provider:'openai',model:'saved-model',productContext:'Saved selected target facts.',productName:'MELLOW SAFFRON GUMMIES',market:'uk',ctaMode:'original',result:{uk_script:'The full saved main.',hooks:['Existing one.','Existing two.']}};
let job=structuredClone(original),calls=[],afterStop=false,preview='A stronger opening.';
const real=Module._load;Module._load=function(n,p,i){if(p?.filename.endsWith('hook-regeneration.ts')){
 if(n==='./jobs')return {getJob:async()=>structuredClone(job)};
 if(n==='./localize')return {generateStrongerHook:async(params)=>{calls.push(params);if(afterStop)job.cancelledAt=1;return preview;}};
 }if(p?.filename.endsWith('/regenerate-hook/route.ts')&&n==='@/lib/hook-regeneration')return require('../lib/hook-regeneration.ts');return real.call(this,n,p,i);};
const {regenerateHook}=require('../lib/hook-regeneration.ts'),{POST}=require('../app/api/jobs/regenerate-hook/route.ts');
(async()=>{
 assert.equal(await regenerateHook({id:job.id,index:1}),'A stronger opening.');assert.deepEqual(job,original);assert.equal(calls[0].currentHook,'Existing two.');assert.equal(calls[0].otherHook,'Existing one.');assert.equal(calls[0].script,original.result.uk_script);assert.equal(calls[0].provider,'openai');assert.equal(calls[0].productContext,original.productContext);
 await regenerateHook({id:job.id,index:0,script:'Unsaved main draft.',currentHook:'Unsaved selected hook.',otherHook:'Unsaved other hook.'});assert.equal(calls[1].script,'Unsaved main draft.');assert.equal(calls[1].currentHook,'Unsaved selected hook.');assert.deepEqual(job,original);
 for(const input of [{id:job.id,index:2},{id:'bad',index:0},{id:job.id,index:0,script:4},{id:job.id,index:0,currentHook:' '},{id:job.id,index:0,otherHook:null}]){const before=calls.length;await assert.rejects(()=>regenerateHook(input));assert.equal(calls.length,before);}
 for(const overrides of [{abortedAt:1},{cancelledAt:1},{status:'Cancelled'},{result:{...original.result,no_speech:true}},{result:{...original.result,hooks:[]}}]){job={...structuredClone(original),...overrides};const before=calls.length;await assert.rejects(()=>regenerateHook({id:job.id,index:1}));assert.equal(calls.length,before);}
 job=structuredClone(original);afterStop=true;await assert.rejects(()=>regenerateHook({id:job.id,index:1}),/stopped/);afterStop=false;job=structuredClone(original);preview='';await assert.rejects(()=>regenerateHook({id:job.id,index:1}),/invalid/);preview='A stronger opening.';
 const response=await POST(new Request('https://test/api/jobs/regenerate-hook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:job.id,index:1})}));assert.equal(response.status,200);assert.deepEqual(await response.json(),{hook:'A stronger opening.'});assert.deepEqual(job,original);
 const invalid=await POST(new Request('https://test/api/jobs/regenerate-hook',{method:'POST',body:JSON.stringify({id:job.id,index:3})}));assert.equal(invalid.status,400);assert.match((await invalid.json()).error,/selection/);
 console.log('PASS one-hook preview contract, saved provider/context and unsaved draft inputs, no mutations, stopped pre/post guards, malformed inputs and route responses; paid requests mocked');
})().catch(error=>{console.error(error);process.exitCode=1;});
