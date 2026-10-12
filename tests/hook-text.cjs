const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const id='hook-text-test-001',adId='MEL-00001',workspace={id:'editor-4',sheetId:'editor-sheet'},headers=['Ad ID','Adapted script','Hook 1','Hook 2','Voice Over','Notes'];
const original={id,adId,status:'Complete',step:'done',created:1,updated:2,result:{uk_script:'Main script stays byte for byte.',narration:'Approved narration.',hooks:['First hook.','Second hook.'],hook_og:'Main opening.',notes:[{original:'a',replacement:'b',reason:'saved'}]},voUrl:'https://test/main',voOriginalUrl:'https://test/main-original',revision:9,voApprovedRevision:9,generateVo:true,hookVoUrls:{0:'https://test/hook1',1:'https://test/hook2'},hookVoNeedsRegeneration:{0:false,1:false},hookVoInputs:{0:{text:'First hook.',voiceId:'saved'}},history:[{at:1,script:'Prior main.'}],stages:{references:{status:'done'}}};
let mem,db,writes,failEditor=false,mismatch=false,cancelAfterWrite=false,locks;
function reset(overrides={}){mem={};mem['job-'+id]={...structuredClone(original),...overrides};db={master:[headers.slice(),[adId,'Manual main','First hook.','Second hook.','All existing voice links','Master note']], 'editor-sheet':[headers.slice(),[adId,'Editor main','First hook.','Second hook.','Manual voice links','Editor note']]};writes=[];failEditor=false;mismatch=false;cancelAfterWrite=false;locks=[];}
function rows(sheetId){return db[sheetId==='editor-sheet'?sheetId:'master'];}
function cell(range){const m=range.match(/!([A-Z]+)(\d+)$/);return m?{row:Number(m[2])-1,col:[...m[1]].reduce((a,c)=>a*26+c.charCodeAt(0)-64,0)-1}:null;}
const api={spreadsheets:{values:{get:async({spreadsheetId,range})=>{const at=cell(range);return {data:{values:at?[[mismatch?'wrong value':rows(spreadsheetId)[at.row][at.col]]]:structuredClone(rows(spreadsheetId))}};},update:async({spreadsheetId,range,requestBody})=>{if(failEditor&&spreadsheetId==='editor-sheet'){failEditor=false;throw Error('Temporary sheet failure');}const at=cell(range);writes.push({spreadsheetId,range,value:requestBody.values[0][0]});rows(spreadsheetId)[at.row][at.col]=requestBody.values[0][0];if(cancelAfterWrite){mem['job-'+id].cancelledAt=Date.now();mem['job-'+id].abortedAt=Date.now();mem['job-'+id].status='Cancelled';cancelAfterWrite=false;}return {data:{}};}}}};
const real=Module._load;Module._load=function(n,p,i){if(p?.filename.endsWith('hook-text.ts')){
 if(n==='googleapis')return {google:{sheets:()=>api}};
 if(n==='./jobs')return {getJob:async()=>structuredClone(mem['job-'+id])};
 if(n==='./editor-sync')return {editorAssignment:async()=>({current:workspace.id})};
 if(n==='./editor-workspaces')return {EDITOR_WORKSPACES:[workspace]};
 if(n==='./editor-locks')return {withEditorLocks:async(keys,fn)=>{locks.push(keys);return fn();}};
 if(n==='./sheets')return {sheetAuth:()=>null,shiftAdminRange:(_,i)=>String.fromCharCode(65+i)};
 if(n==='./cancellation')return {assertAdActive:async()=>{},assertJobActive:async()=>{const j=mem['job-'+id];if(j?.abortedAt||j?.cancelledAt)throw Error('This job was stopped.');}};
 if(n==='./store')return {mutate:async(key,initial,fn)=>{const state=structuredClone(mem[key]??initial),out=fn(state);mem[key]=state;return structuredClone(out);}};
 }if(p?.filename.endsWith('/hook-text/route.ts')&&n==='@/lib/hook-text')return require('../lib/hook-text.ts');return real.call(this,n,p,i);};
const {saveHookText,HookTextSaveError}=require('../lib/hook-text.ts');
const {POST}=require('../app/api/jobs/hook-text/route.ts');
const input=(index=1,text='Stronger second hook.',expectedText='Second hook.')=>({id,index,text,expectedText});
(async()=>{
 reset();const job=await saveHookText(input());
 assert.equal(job.result.hooks[0],original.result.hooks[0]);assert.equal(job.result.hooks[1],'Stronger second hook.');
 for(const key of ['uk_script','narration','hook_og','notes'])assert.deepEqual(job.result[key],original.result[key]);
 for(const key of ['voUrl','voOriginalUrl','revision','voApprovedRevision','generateVo','hookVoUrls','hookVoInputs','history','stages','status','step'])assert.deepEqual(job[key],original[key]);
 assert.deepEqual(job.hookVoNeedsRegeneration,{0:false,1:true});assert.equal(job.hookDeliveryPending,undefined);assert.equal(job.hookTextDelivery,undefined);
 assert.deepEqual(writes.map(w=>w.range),["'Daily Briefs'!D2","'My Tasks'!D2"]);assert(locks[0].includes('ad-'+adId)&&locks[0].includes('workspace-editor-4'));
 assert.equal(db.master[1][1],'Manual main');assert.equal(db['editor-sheet'][1][4],'Manual voice links');assert.equal(db['editor-sheet'][1][5],'Editor note');assert.deepEqual(mem['editor-sync-v3-editor-sheet'].snapshot[adId],{'Hook 2':'Stronger second hook.'});
 reset();await assert.rejects(()=>saveHookText(input(1,'Different.','Stale second hook.')),/another tab/);assert.equal(writes.length,0);assert.deepEqual(mem['job-'+id],original);
 for(const overrides of [{abortedAt:1},{cancelledAt:1},{status:'Cancelled'},{leaseUntil:Date.now()+10000},{hookVoPending:{1:true}},{hookDeliveryPending:0},{hookDeliveryPending:1}]){
  reset(overrides);await assert.rejects(()=>saveHookText(input()),/stopped|in progress|previous hook/);assert.equal(writes.length,0);
 }
 reset({hookVoPending:{0:true}});await saveHookText(input());assert.equal(mem['job-'+id].hookVoPending[0],true);
 reset({hooksToEditor:{1:false}});await saveHookText(input());assert.equal(db.master[1][3],'');assert.equal(db['editor-sheet'][1][3],'');assert.equal(mem['job-'+id].result.hooks[1],'Stronger second hook.');
 reset();failEditor=true;await assert.rejects(()=>saveHookText(input()),error=>error instanceof HookTextSaveError&&error.status===503&&!!error.job.hookTextDelivery.error);
 assert.equal(mem['job-'+id].result.hooks[1],'Second hook.');assert.equal(mem['job-'+id].hookDeliveryPending,1);assert.equal(db.master[1][3],'Stronger second hook.');
 await assert.rejects(()=>saveHookText(input(1,'Different proposed hook.')),/previous hook/);await saveHookText(input());assert.equal(mem['job-'+id].hookDeliveryPending,undefined);assert.equal(mem['job-'+id].result.hooks[1],'Stronger second hook.');
 reset();mismatch=true;await assert.rejects(()=>saveHookText(input()),/not confirmed/);assert.equal(mem['job-'+id].result.hooks[1],'Second hook.');assert.equal(mem['job-'+id].hookDeliveryPending,1);
 reset();cancelAfterWrite=true;await assert.rejects(()=>saveHookText(input()),/stopped/);assert.equal(writes.length,1);assert.equal(mem['job-'+id].result.hooks[1],'Second hook.');assert.equal(mem['job-'+id].status,'Cancelled');
 reset();await saveHookText(input(1,'Why did Ritalin leave them struggling?'));assert.equal(mem['job-'+id].result.hooks[1],'Why did Concerta XL leave them struggling?');
 reset({market:'pl'});await saveHookText(input(1,'Ritalin w źródle.'));assert.equal(mem['job-'+id].result.hooks[1],'Ritalin w źródle.');
 for(const bad of [{...input(),index:2},{...input(),text:' '},{...input(),text:'[[CONFIRM ingredient]]'},{...input(),expectedText:null},{...input(),id:'invalid'}]){reset();await assert.rejects(()=>saveHookText(bad));assert.equal(writes.length,0);}
 reset();let response=await POST(new Request('https://test/api/jobs/hook-text',{method:'POST',body:JSON.stringify(input())}));assert.equal(response.status,200);assert.equal((await response.json()).job.result.hooks[1],'Stronger second hook.');
 reset();failEditor=true;response=await POST(new Request('https://test/api/jobs/hook-text',{method:'POST',body:JSON.stringify(input())}));assert.equal(response.status,503);const failed=await response.json();assert.match(failed.error,/not confirmed/);assert.equal(failed.job.result.hooks[1],'Second hook.');assert.equal(failed.job.hookTextDelivery.text,'Stronger second hook.');
 response=await POST(new Request('https://test/api/jobs/hook-text',{method:'POST',body:JSON.stringify({...input(),index:5})}));assert.equal(response.status,400);
 console.log('PASS atomic one-hook save, unchanged approved main/audio/revision/other hook, exact two-cell delivery, excluded hook, stale conflict, stop/lease/recording guards, visible partial failure and exact retry, readback, cancellation race, UK literal name');
})().catch(error=>{console.error(error);process.exitCode=1;});
