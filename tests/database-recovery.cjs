const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm'),crypto=require('node:crypto');
const load=(file,deps={},extra={})=>{const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:n=>deps[n],Date,Error,Buffer,Response,process:{env:{STATE_READ_WRITE_TOKEN:'private-token',JOB_ENCRYPTION_KEY:'test-encryption-key'}},...extra});return module.exports;};
const retry=load('lib/database-stage-retry.ts'),error=Error('Database connection unavailable. Please try again.');
for(const key of ['cleanFirst','enhancePoll','videoPoll','export','references']){const s={};assert(retry.retryDatabaseStage(s,key,error,100));assert.equal(s.nextAt,10100);assert.equal(s.error,undefined);for(let i=0;i<4;i++)assert(retry.retryDatabaseStage(s,key,error,100));assert(!retry.retryDatabaseStage(s,key,error,100));assert.equal(s.nextAt,60100);}
for(const s of [{pending:true},{uncertain:true}])assert(!retry.retryDatabaseStage(s,'cleanFirst',error));
assert(!retry.retryDatabaseStage({},'enhancePoll',Error('Provider failed')));assert(!retry.retryDatabaseStage({},'references',Error('Database state request failed (HTTP 401)')));
const fixture=()=>({id:'job-recovery-01',engine:2,step:'export',status:'Failed',adId:'MEL-99999',enhanceTaskId:'saved-paid-task',stages:{enhancePoll:{error:error.message},export:{error:error.message,briefSaved:true}}});
let j=fixture();assert(retry.recoverDatabaseStages(j,100));assert.equal(j.status,'Queued');assert.equal(j.enhanceTaskId,'saved-paid-task');assert(!j.stages.export.error);
for(const change of [{abortedAt:1},{cancelledAt:1},{step:'done'},{leaseUntil:101}]){j={...fixture(),...change};assert(!retry.recoverDatabaseStages(j,100));}
j=fixture();j.stages.enhancePoll.pending=true;j.stages.export.briefSaved=false;assert(!retry.recoverDatabaseStages(j,100));
const memory=new Map(),receipts=load('lib/provider-receipts.ts',{'node:crypto':crypto,'@vercel/blob':{put:async(p,b,o)=>{assert.equal(o.access,'private');assert.equal(o.allowOverwrite,false);assert.equal(o.token,'private-token');if(memory.has(p))throw Error('immutable');memory.set(p,Buffer.from(b));},get:async(p,o)=>{assert.equal(o.access,'private');assert.equal(o.useCache,false);return memory.has(p)?{statusCode:200,stream:new Response(memory.get(p)).body}:null;}}});
const recovery=load('lib/recover-vmake.ts',{'./provider-receipts':receipts,'./store':{}});
(async()=>{
const receipt={jobId:'job-receipt-01',stage:'cleanFirst',submission:{id:'submission-0001',operation:'enhance',part:0},at:100,taskId:'paid-task-01'};await receipts.saveProviderReceipt(receipt);
const stored=memory.values().next().value;assert(!stored.includes(Buffer.from('paid-task')));assert.equal(JSON.stringify(await receipts.readProviderReceipt('submission-0001')),JSON.stringify(receipt));await assert.rejects(()=>receipts.saveProviderReceipt(receipt),/immutable/);
assert.equal(await receipts.readProviderReceipt('missing-0001'),undefined);await assert.rejects(()=>receipts.readProviderReceipt('../bad-path'),/Invalid/);
const job=()=>({id:receipt.jobId,status:'Failed',cleanFirst:{parts:[{}]},stages:{cleanFirst:{pending:true,uncertain:true,error:error.message,submission:receipt.submission}}});
j=job();assert(recovery.applyProviderReceipt(j,'cleanFirst',receipt));assert.equal(j.cleanFirst.parts[0].taskId,'paid-task-01');assert.equal(j.cleanFirst.parts[0].operation,'enhance');assert(!j.stages.cleanFirst.pending);assert(!recovery.applyProviderReceipt(j,'cleanFirst',receipt),'Cannot reapply after durable checkpoint');
for(const patch of [{cancelledAt:1},{abortedAt:1},{id:'different-job'}])assert(!recovery.applyProviderReceipt({...job(),...patch},'cleanFirst',receipt));
assert(!recovery.applyProviderReceipt(job(),'cleanFirst',{...receipt,submission:{...receipt.submission,id:'other-submission'}}));assert(!recovery.applyProviderReceipt(job(),'cleanFirst',{...receipt,submission:{...receipt.submission,operation:'remove'}}));
for(const [key,field] of [['enhanceSubmit','enhanceTaskId'],['videoSubmit','taskId']]){j={id:receipt.jobId,stages:{[key]:{pending:true,submission:receipt.submission}}};assert(recovery.applyProviderReceipt(j,key,{...receipt,stage:key}));assert.equal(j[field],receipt.taskId);assert(j.stages[key].done);}
stored[13]^=1;await assert.rejects(()=>receipts.readProviderReceipt('submission-0001'));
console.log('PASS bounded database retries, durable old-task recovery, stopped/uncertain guards, encrypted immutable independent receipts, exact nonce/operation scoping and tamper detection');
})().catch(e=>{console.error(e);process.exitCode=1});
