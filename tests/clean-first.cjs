const fs=require('fs'),ts=require('typescript'),assert=require('assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {advanceCleanFirst,retryCleanFirst}=require('../lib/clean-first-video.ts');
(async()=>{
 for(const count of [1,3]){
  const j={id:'new-clean-first',sourceUrl:'source',duration:count===1?93:1200,...(count===3?{videoParts:[0,1,2].map(i=>({sourceUrl:'part-'+i}))}:{})};
  const calls=[];let pending=false,paid=0;
  const h={paid:async()=>{pending=true;paid++},save:async fn=>{fn(j);pending=false},call:async(path,body)=>{if(body){assert(pending);calls.push(body);return {task_id:'task-'+calls.length}}return {done:true,output_urls:['result-'+calls.length]}},finalise:async url=>'saved:'+url,join:async urls=>'joined:'+urls.join(',')};
  let done=false;for(let i=0;i<30&&!done;i++)done=await advanceCleanFirst(structuredClone(j),h);
  assert(done);assert.equal(paid,count*2);assert.equal(calls.length,count*2);
  for(let i=0;i<count;i++){assert.equal(calls[2*i].operation,'remove');assert.equal(calls[2*i+1].operation,'enhance');assert.equal(calls[2*i+1].url,j.cleanFirst.parts[i].removedUrl);}
  assert(j.cleanUrl);await advanceCleanFirst(j,h);assert.equal(paid,count*2);
 }
 const state={parts:[{sourceUrl:'x',removedUrl:'kept-clean',taskId:'failed-enhancer',terminalFailure:true},{sourceUrl:'y',taskId:'running'}]};
 retryCleanFirst(state);assert.equal(state.parts[0].taskId,undefined);assert.equal(state.parts[0].removedUrl,'kept-clean');assert.equal(state.parts[1].taskId,'running');
 let paid=0;const j={id:'failed',sourceUrl:'x',cleanFirst:{parts:[{sourceUrl:'x',taskId:'running',submittedAt:Date.now()}]}};
 const h={paid:async()=>{paid++},save:async fn=>fn(j),call:async()=>({done:false})};
 await advanceCleanFirst(j,h);assert.equal(paid,0);assert.equal(j.cleanFirst.parts[0].taskId,'running');
 h.call=async()=>({failed:true,resubmit_required:true,message:'provider failed'});await assert.rejects(advanceCleanFirst(j,h),/provider failed/);assert.equal(j.cleanFirst.parts[0].taskId,'running');assert(j.cleanFirst.parts[0].terminalFailure);
 console.log('PASS clean-first sequence, 3 parts, original URLs, saved checkpoints, status-only polls, terminal retry, completed idempotency; no transcoding/provider calls');
})().catch(e=>{console.error(e);process.exitCode=1});
