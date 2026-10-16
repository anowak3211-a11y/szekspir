const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
let submits=0,polls=0,uploads=0,writes=0,fail=false,expectedVideo='https://stored.test/enhanced.mp4';
require.cache[require.resolve('../lib/jobs.ts')]={exports:{pythonCall:async(p,b)=>{if(b){submits++;assert.deepEqual(b,{url:'https://stored.test/mixed.mp4',operation:'enhance'});if(fail)throw Error('timeout');return {task_id:'legacy-task'};}polls++;assert(p.includes('legacy-task'));return {done:true,output_urls:['https://provider.test/enhanced.mp4']};},finalise:async()=> 'https://stored.test/enhanced.mp4'}};
require.cache[require.resolve('../lib/drive-video.ts')]={exports:{saveOriginalToDrive:async(j,remember)=>{assert.equal(j.sourceUrl,expectedVideo);await remember('drive-id');uploads++;return 'https://drive.google.com/file/d/drive-id/view';}}};
require.cache[require.resolve('../lib/sheets.ts')]={exports:{appendToAdminBriefs:async r=>{assert.equal(r.editorId,'mine');assert.equal(r.noSpeech,true);assert(r.reference.includes('drive-id'));assert(r.jobId.startsWith('voice-swap-'));writes++;return {adId:'MEL-00400',url:'https://docs.google.com/spreadsheets/d/admin'};}}};
const {advanceSwapDelivery}=require('../lib/voice-swap-delivery.ts');
(async()=>{
 const record=()=>({id:'fixture',name:'ad.mp4',mixKey:'abc',outputUrl:'https://stored.test/mixed.mp4',status:'queued',stage:'enhance',delivery:{mixKey:'abc',started:Date.now()}});
 const s=record(),update=async fn=>fn(s);
 await advanceSwapDelivery(structuredClone(s),update);assert.equal(submits,1);assert.equal(s.delivery.taskId,'legacy-task');
 s.delivery.nextCheckAt=Date.now()+60000;await advanceSwapDelivery(structuredClone(s),update);assert.equal(polls,0,'Duplicate deliveries respect the saved one-minute status limit');
 s.delivery.nextCheckAt=0;await advanceSwapDelivery(structuredClone(s),update);assert.equal(s.stage,'drive');await advanceSwapDelivery(structuredClone(s),update);assert.equal(s.stage,'sheet');await advanceSwapDelivery(structuredClone(s),update);assert.equal(s.status,'done');assert.equal(s.delivery.adId,'MEL-00400');assert.equal(submits,1);assert.equal(uploads,1);assert.equal(writes,1);
 const direct=record();direct.stage='drive';direct.delivery.mode='direct';expectedVideo=direct.outputUrl;const d=async fn=>fn(direct);const before=[submits,polls];await advanceSwapDelivery(structuredClone(direct),d);await advanceSwapDelivery(structuredClone(direct),d);assert.equal(direct.status,'done');assert.deepEqual([submits,polls],before,'Direct save never calls VMake');assert.equal(uploads,2);assert.equal(writes,2);
 fail=true;const uncertain=record(),u=async fn=>fn(uncertain);await assert.rejects(()=>advanceSwapDelivery(structuredClone(uncertain),u),/timeout/);assert.equal(uncertain.delivery.submitted,true);await assert.rejects(()=>advanceSwapDelivery(structuredClone(uncertain),u),/unknown/);assert.equal(submits,2,'Unknown paid submissions are not repeated');
 console.log('PASS delivery: one legacy enhancement, bounded status checks, enhanced film to Drive and admin brief, no repeated uncertain submission');
})().catch(e=>{console.error(e);process.exitCode=1;});
