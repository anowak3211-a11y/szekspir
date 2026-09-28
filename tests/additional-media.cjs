const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText,f);
const model=require('../lib/additional-files-model.ts');const input={adId:'MEL-00016',editorId:'editor-4',requestId:'12345678-1234-1234-1234-123456789abc',voiceId:'abcdefghijk123',text:'A corrected voiceover.',label:'Corrected take'};assert.equal(model.additionalInput(input).text,input.text);assert.throws(()=>model.additionalInput({...input,adId:'bad'}));assert.throws(()=>model.additionalInput({...input,text:''}));const link={url:'https://example.com/a.mp3',label:'Take',createdAt:1};const appended=model.appendAdditionalLink('Earlier file',link);assert.equal(model.appendAdditionalLink(appended,link),appended);assert(appended.startsWith('Earlier file\n'));assert.equal(model.additionalLinkRuns(appended)[0].format.link.uri,link.url);
const {planSync}=require('../lib/editor-sync-plan.ts');const h=['Ad ID','Adapted script','HOOK OG','Hook 1','Hook 2','Video','Voice Over','Feedback','Approval','Hours spent','Your work','Ready for review','Production status','Changes applied','Additional files'];const a=Array(h.length).fill(''),e=Array(h.length).fill('');a[0]=e[0]=input.adId;a[6]=e[6]='original VO';a[14]=appended;const plan=planSync([h,a],[h,e],{},501);assert(plan.editorChanges.some(c=>c.col===14&&c.value===appended));assert(!plan.editorChanges.some(c=>c.col===6));
let state={files:[]},links='',delivered='',calls=0;const headers=['Ad ID','Editor ID','Additional files','Adapted script'];const api={spreadsheets:{values:{get:async ({spreadsheetId})=>({data:{values:spreadsheetId==='editor-sheet'?[['Ad ID','Additional files'],[input.adId,delivered]]:[headers,[input.adId,'editor-4',links,input.text]]}})},batchUpdate:async ({requestBody})=>{links=requestBody.requests[0].updateCells.rows[0].values[0].userEnteredValue.stringValue;}}};const orig=Module._load;Module._load=function(name,parent,...rest){if(parent?.filename.endsWith('/lib/additional-files.ts')){if(name==='googleapis')return {google:{sheets:()=>api}};if(name==='./jobs')return {pythonCall:async(path,body)=>{if(body){submissions.push(body);return {task_id:'task-'+submissions.length}}return {done:true,output_urls:['https://example.com/output.mp4']}},finalise:async()=> 'https://example.com/final.mp4'};if(name==='./sheets')return {sheetAuth:()=>({})};if(name==='./editor-workspaces')return {EDITOR_WORKSPACES:[{id:'editor-4',sheetId:'editor-sheet'}]};if(name==='./store')return {readState:async()=>({value:structuredClone(state)}),mutate:async(k,d,f)=>f(state)};if(name==='./elevenlabs')return {listVoices:async()=>[],generateVO:async(t,v,save)=>{calls++;await save(Buffer.from('original'));return Buffer.from('processed')}};if(name==='./voice-library')return {selectableVoices:()=>[{voice_id:input.voiceId,name:'Test voice'}]};if(name==='./media')return {putMedia:async p=>'https://example.com/'+p,existingMedia:async p=>'https://example.com/'+p};if(name==='./editor-locks')return {withEditorLocks:async(k,f)=>f()};if(name==='./editor-sync')return {syncAssignedEditor:async()=>{delivered=links}};}return orig.call(this,name,parent,...rest);};

let submissions=[];
(async()=>{
 const service=require('../lib/additional-files.ts');
 const base={...input,sourcePath:'sources/12345678-1234-1234-1234-123456789abc/source.mp4',provider:'none'};
 assert.throws(()=>model.additionalUploadInput({...base,sourcePath:'https://evil.test/video.mp4'}));
 assert.throws(()=>model.additionalUploadInput({...base,provider:'vmake',vmakeMode:'both',sourcePath:base.sourcePath.replace('mp4','mp3')}));
 const original=await service.requestAdditionalUpload(base);assert.equal(original.status,'draft');assert.equal(links,'');assert.equal(submissions.length,0);
 await service.approveAdditional(input.editorId,input.adId,original.id);assert(links.includes('/source.mp4'));
 for(const mode of ['enhance','remove','both']){
  submissions=[];const requestId=require('crypto').randomUUID();
  const request={...base,provider:'vmake',vmakeMode:mode,requestId};
  const f=await service.requestAdditionalUpload(request);await service.requestAdditionalUpload(request);
  await assert.rejects(()=>service.approveAdditional(input.editorId,input.adId,f.id));
  for(let i=0;i<6;i++)await service.advanceAdditionalVideo(input.adId,f.id);
  assert.deepEqual(submissions.map(x=>x.operation),mode==='both'?['enhance','remove']:[mode]);
  assert.equal(state.files.find(x=>x.id===f.id).status,'draft');
  await service.advanceAdditionalVideo(input.adId,f.id);assert.equal(submissions.length,mode==='both'?2:1);
 }
 const f=await service.requestAdditionalUpload({...base,provider:'vmake',vmakeMode:'enhance',requestId:require('crypto').randomUUID()});
 state.files.find(x=>x.id===f.id).pendingSubmit=true;submissions=[];
 await service.advanceAdditionalVideo(input.adId,f.id);assert.equal(submissions.length,0);assert.equal(state.files.find(x=>x.id===f.id).status,'error');
 console.log('PASS: original upload, approval gate, all VMake modes, duplicate deliveries, interrupted paid submission protection');
})().catch(e=>{console.error(e);process.exitCode=1});
