const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),Module=require('module');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,n);
let job;const load=Module._load;Module._load=function(n,p,i){if(n==='./store')return {mutate:async(k,d,f)=>{const draft=structuredClone(job);const result=f(draft);job=draft;return result;}};return load.call(this,n,p,i)};
const {setVoiceoverEnabled}=require('../lib/voiceover-setting.ts'),{editorChecklist,deliveryVersion}=require('../lib/editor-checklist.ts');
const fresh=()=>({id:'setting-test',adId:'TEST',result:{uk_script:'Script',hooks:[]},voiceoverEnabled:true,generateVo:false,voUrl:'saved.wav',hookVoUrls:{0:'hook.wav'},stages:{vo:{done:true}},step:'done',status:'Complete'});
(async()=>{
 job=fresh();const version=deliveryVersion(job);await setVoiceoverEnabled(job.id,false);assert.equal(job.generateVo,false);assert.equal(job.voiceoverEnabled,false);assert.equal(job.voUrl,'saved.wav');assert.equal(job.hookVoUrls[0],'hook.wav');assert.notEqual(deliveryVersion(job),version);assert(editorChecklist(job,['Adapted script'],['Script']).every(c=>c.ok));
 await setVoiceoverEnabled(job.id,true);assert.equal(job.generateVo,false,'Re-enabling cannot queue a paid recording');assert.equal(job.voiceoverEnabled,true);
 for(const patch of [{leaseUntil:Date.now()+60000},{stages:{vo:{pending:true}}},{stages:{vo:{uncertain:true}}},{generateVo:true,stages:{vo:{started:Date.now()}}},{hookVoPending:{0:true}},{copyTextDelivery:{token:'saving'}}]){job={...fresh(),...patch};await assert.rejects(setVoiceoverEnabled(job.id,false),/current recording or save/);assert.equal(job.voiceoverEnabled,true);}
 job={...fresh(),generateVo:true,stages:{vo:{}}};await setVoiceoverEnabled(job.id,false);assert.equal(job.generateVo,false,'Unstarted queued VO is skipped');
 job={...fresh(),cancelledAt:1};await assert.rejects(setVoiceoverEnabled(job.id,false),/active script/);
 console.log('PASS VO off/on, asset preservation, checklist invalidation, queued VO skip and active/uncertain recording guards');
})().catch(e=>{console.error(e);process.exitCode=1});
