const assert=require('assert/strict'),fs=require('fs'),ts=require('typescript'),Module=require('module');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,n);
let job;const load=Module._load;Module._load=function(n,p,i){if(n==='./store')return {mutate:async(k,d,f)=>f(job)};if(n==='./validation')return {validateResult:r=>r,opening:s=>s,hasTokens:()=>false};return load.call(this,n,p,i)};
const {forceFinishJob}=require('../lib/force-finish.ts'),{canCloseFinishedTab}=require('../lib/finish-tab.ts');
const fresh=()=>({id:'force-test',adId:'TEST',result:{uk_script:'Script',hooks:['one','two']},step:'done',status:'Complete',revision:2,voUrl:'saved.wav',stages:{vo:{done:true}},generateVo:false});
(async()=>{
 job=fresh();const receipt=await forceFinishJob(job.id,'Script',['one','two'],async j=>{assert(j.lease);return {ok:false,checks:[{ok:false}]}});
 assert.equal(receipt.ok,false);assert(job.forceFinishedAt);assert.equal(job.step,'done');assert.equal(job.revision,2);assert.equal(job.voUrl,'saved.wav');assert.equal(job.lease,undefined);
 assert(canCloseFinishedTab({...receipt,forced:true}));assert(!canCloseFinishedTab(receipt));
 job=fresh();await assert.rejects(forceFinishJob(job.id,'Script',['one','two'],async()=>{throw Error('Sheets unavailable')}),/Sheets unavailable/);assert(!job.forceFinishedAt);assert(!job.lease);
 job=fresh();job.hookVoPending={0:true};await assert.rejects(forceFinishJob(job.id,'Script',['one','two'],async()=>assert.fail()),/current recording/);
 job=fresh();await forceFinishJob(job.id,'Changed',['one','two'],async()=>({ok:false}));assert.equal(job.result.uk_script,'Changed');assert(job.voNeedsRegeneration);assert.equal(job.voUrl,'saved.wav');
 console.log('PASS force finish: missing assets, saved media, lock, failure and changed script');
})().catch(e=>{console.error(e);process.exitCode=1});
