import {google} from 'googleapis';
import {sheetAuth} from './sheets';
import {EDITOR_WORKSPACES} from './editor-workspaces';
import {mutate,readState} from './store';
import {generateVO,listVoices} from './elevenlabs';
import {selectableVoices} from './voice-library';
import {putMedia,existingMedia} from './media';
import {withEditorLocks} from './editor-locks';
import {syncAssignedEditor} from './editor-sync';
import {additionalUploadInput,additionalInput,mergeAdditionalLinks,appendAdditionalLink,additionalLinkRuns,type AdditionalFile,type AdditionalState} from './additional-files-model';
const master=()=>process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY';
const api=()=>google.sheets({version:'v4',auth:sheetAuth()});
const key=(adId:string)=>{if(!/^MEL-\d+$/.test(adId))throw Error('Invalid Ad ID.');return 'additional-files-'+adId;};
function workspace(editorId:string){const w=EDITOR_WORKSPACES.find(w=>w.id===editorId);if(!w)throw Error('Choose a valid editor.');return w;}
async function masterRows(){return (await api().spreadsheets.values.get({spreadsheetId:master(),range:"'Daily Briefs'!A1:AC502",valueRenderOption:'UNFORMATTED_VALUE'})).data.values||[];}
export async function additionalAds(editorId:string){workspace(editorId);const rows=await masterRows(),h=rows[0]||[];return rows.slice(1).filter(r=>r[h.indexOf('Editor ID')]===editorId&&/^MEL-\d+$/.test(String(r[h.indexOf('Ad ID')]))).map(r=>({adId:String(r[h.indexOf('Ad ID')]),name:String(r[h.indexOf('Ad name')]||''),script:String(r[h.indexOf('Adapted script')]||''),hooks:[String(r[h.indexOf('Hook 1')]||''),String(r[h.indexOf('Hook 2')]||'')]})).reverse();}
async function selectedAd(editorId:string,adId:string){workspace(editorId);key(adId);const rows=await masterRows(),h=rows[0]||[],matches=rows.map((r,i)=>({r,i})).filter(x=>x.i>0&&x.r[h.indexOf('Ad ID')]===adId);if(matches.length!==1)throw Error('Ad not found or duplicated.');const {r,i}=matches[0];if(r[h.indexOf('Editor ID')]!==editorId)throw Error('This ad is assigned to another editor. Refresh the list.');const col=h.indexOf('Additional files');if(col<0)throw Error('Additional files column is not configured.');return {row:i+1,col,links:String(r[col]||'')};}
export async function additionalHistory(editorId:string,adId:string){const ad=await selectedAd(editorId,adId);const state=(await readState<AdditionalState>(key(adId),{files:[]})).value;const w=workspace(editorId);const rows=(await api().spreadsheets.values.get({spreadsheetId:w.sheetId,range:"'My Tasks'!A1:R501",valueRenderOption:'UNFORMATTED_VALUE'})).data.values||[];const h=rows[0]||[],r=rows.find((r,i)=>i>0&&r[h.indexOf('Ad ID')]===adId);return {files:state.files,links:mergeAdditionalLinks(ad.links,String(r?.[h.indexOf('Additional files')]||''))};}
export async function requestAdditional(input:Record<string,unknown>){
 const b=additionalInput(input);await selectedAd(b.editorId,b.adId);
 const prior=(await readState<AdditionalState>(key(b.adId),{files:[]})).value.files.find(f=>f.id===b.requestId);
 if(prior){if((prior.provider&&prior.provider!=='elevenlabs')||prior.hookIndex!==b.hookIndex||prior.text!==b.text||prior.voiceId!==b.voiceId||prior.label!==b.label||prior.editorId!==b.editorId||JSON.stringify(prior.processing)!==JSON.stringify(b.processing))throw Error('Request already exists with different settings.');return prior;}
 const voice=selectableVoices(await listVoices()).find(v=>v.voice_id===b.voiceId);if(!voice)throw Error('Choose a voice from the current list.');
 return mutate<AdditionalState,AdditionalFile>(key(b.adId),{files:[]},s=>{
  const old=s.files.find(f=>f.id===b.requestId);if(old)return old;
  if(s.files.some(f=>f.status==='generating'&&Date.now()-f.createdAt<360000))throw Error('A recording is already in progress for this ad.');
  if(s.files.length>=200)throw Error('This ad has reached its recording history limit.');
  const f:AdditionalFile={id:b.requestId,adId:b.adId,editorId:b.editorId,label:b.label,hookIndex:b.hookIndex,text:b.text,voiceId:b.voiceId,voiceName:voice.name,processing:b.processing,createdAt:Date.now(),status:'generating'};s.files.unshift(f);return f;
 });
}
export async function generateAdditional(adId:string,id:string){
 const f=await mutate<AdditionalState,AdditionalFile|undefined>(key(adId),{files:[]},s=>{const f=s.files.find(f=>f.id===id);if(!f||f.provider&&f.provider!=='elevenlabs'||f.status!=='generating'||f.startedAt)return;f.startedAt=Date.now();return {...f};});
 if(!f)return;
 const update=(fn:(f:AdditionalFile)=>void)=>mutate<AdditionalState,void>(key(adId),{files:[]},s=>{const f=s.files.find(f=>f.id===id);if(!f)throw Error('Recording not found.');fn(f);});
 try{
  const audio=await generateVO(f.text,f.voiceId,async raw=>{const originalUrl=await putMedia(`vo/additional-${id}-original.mp3`,Buffer.from(raw),'audio/mpeg');await update(f=>{f.originalUrl=originalUrl;});},f.processing,f.hookIndex===undefined?'voiceover':'hook');
  const url=await putMedia(`vo/additional-${id}.wav`,Buffer.from(audio),'audio/wav');
  await update(f=>{f.url=url;f.status='draft';delete f.error;});
 }catch(e){console.error('Additional recording failed:',(e as Error).message);await update(f=>{f.status='error';f.error='Recording could not be completed. You can generate a new take; any saved original remains available.';});}
}
export async function recoverAdditional(editorId:string,adId:string,id:string){
 await selectedAd(editorId,adId);const f=(await readState<AdditionalState>(key(adId),{files:[]})).value.files.find(f=>f.id===id);
 if(!f)throw Error('Recording not found.');
 if(f.provider==='vmake'){if(f.status==='generating'){await scheduleAdditionalVideo(adId,id);return;}throw Error(f.error||'Check the VMake task before starting a new request.');}
 const url=await existingMedia(f.provider==='none'?f.sourcePath!:`vo/additional-${f.id}.wav`)||(f.provider!=='none'?await existingMedia(`vo/additional-${f.id}.mp3`):undefined);
 if(url)await mutate<AdditionalState,void>(key(adId),{files:[]},s=>{const item=s.files.find(x=>x.id===id)!;if(item.status!=='approved'){item.url=url;item.status='draft';delete item.error;}});
 else if(f.status==='generating'&&Date.now()-f.createdAt<360000)throw Error('Recording is still running.');
 else throw Error('No completed file was found. Generate a new take when ready.');
}
export async function approveAdditional(editorId:string,adId:string,id:string){
 const w=workspace(editorId);
 await withEditorLocks(['ad-'+adId],async()=>{
  const ad=await selectedAd(editorId,adId),f=(await readState<AdditionalState>(key(adId),{files:[]})).value.files.find(f=>f.id===id);
  if(!f?.url||!['draft','approved'].includes(f.status))throw Error('Wait for a completed recording before approving.');
  const next=appendAdditionalLink(ad.links,f),client=api();
  // Cell writes use the live Ad ID and header, never a client-provided row or URL.
  await client.spreadsheets.batchUpdate({spreadsheetId:master(),requestBody:{requests:[{updateCells:{range:{sheetId:802,startRowIndex:ad.row-1,endRowIndex:ad.row,startColumnIndex:ad.col,endColumnIndex:ad.col+1},rows:[{values:[{userEnteredValue:{stringValue:next},textFormatRuns:additionalLinkRuns(next)}]}],fields:'userEnteredValue,textFormatRuns'}}]}});
 });
 await syncAssignedEditor(adId);
 // Confirm delivery before showing success. Retrying only reuses the saved file.
 await selectedAd(editorId,adId);
 const rows=(await api().spreadsheets.values.get({spreadsheetId:w.sheetId,range:"'My Tasks'!A1:R501",valueRenderOption:'UNFORMATTED_VALUE'})).data.values||[],h=rows[0]||[],r=rows.find((r,i)=>i>0&&r[h.indexOf('Ad ID')]===adId);
 const file=(await readState<AdditionalState>(key(adId),{files:[]})).value.files.find(f=>f.id===id)!;
 if(!String(r?.[h.indexOf('Additional files')]||'').includes(file.url!))throw Error('File saved; editor delivery has not been confirmed. Click Approve again to retry without recording again.');
 await mutate<AdditionalState,void>(key(adId),{files:[]},s=>{const f=s.files.find(f=>f.id===id)!;f.status='approved';f.approvedAt=f.approvedAt||Date.now();});
 return {url:`https://docs.google.com/spreadsheets/d/${w.sheetId}/edit#gid=801`};
}

export async function requestAdditionalUpload(input:Record<string,unknown>){
 const b=additionalUploadInput(input);await selectedAd(b.editorId,b.adId);
 const url=await existingMedia(b.sourcePath);if(!url)throw Error('Upload has not completed. Try again.');
 return mutate<AdditionalState,AdditionalFile>(key(b.adId),{files:[]},s=>{
  const old=s.files.find(f=>f.id===b.requestId);
  if(old){if(old.provider!==b.provider||old.sourcePath!==b.sourcePath||old.vmakeMode!==b.vmakeMode||old.editorId!==b.editorId||old.label!==b.label)throw Error('Request already exists with different settings.');return old;}
  if(s.files.length>=200)throw Error('This ad has reached its file history limit.');
  const f:AdditionalFile={id:b.requestId,adId:b.adId,editorId:b.editorId,label:b.label,provider:b.provider,mediaType:b.mediaType,sourcePath:b.sourcePath,vmakeMode:b.vmakeMode,originalUrl:url,text:'',voiceId:'',voiceName:b.provider==='vmake'?'VMake':'Original file',processing:{mode:'standard',normalize:false,emotion:'off'},createdAt:Date.now(),status:b.provider==='none'?'draft':'generating',...(b.provider==='none'?{url}:{videoStep:b.vmakeMode==='remove'?'remove':'enhance'})};
  s.files.unshift(f);return f;
 });
}
export async function scheduleAdditionalVideo(adId:string,id:string,delaySeconds=0){
 const {send}=await import('@vercel/queue');await send('szekspir-additional-video',{adId,id},{region:'iad1',delaySeconds,retentionSeconds:86400});
}
export async function advanceAdditionalVideo(adId:string,id:string){
 const update=(fn:(f:AdditionalFile)=>void)=>mutate<AdditionalState,void>(key(adId),{files:[]},s=>{const f=s.files.find(f=>f.id===id);if(!f)throw Error('File not found.');fn(f);});
 const f=await mutate<AdditionalState,AdditionalFile|undefined>(key(adId),{files:[]},s=>{
  const f=s.files.find(f=>f.id===id);if(!f||f.provider!=='vmake'||f.status!=='generating'||(f.leaseUntil||0)>Date.now())return;
  if(f.pendingSubmit){f.status='error';f.error='VMake submission was interrupted. Check the provider before starting another paid request.';return;}
  if(Date.now()-f.createdAt>2*60*60*1000){f.status='error';f.error='VMake has not returned a file within two hours. Check the provider before starting again.';return;}
  f.leaseUntil=Date.now()+360000;return {...f};
 });
 if(!f)return;
 const {pythonCall,finalise}=await import('./jobs');
 try{
  if(f.videoStep==='save'){
   const url=await finalise(f.outputUrl!,`additional-${id}`);await update(x=>{x.url=url;x.status='draft';delete x.error;});
  }else if(f.taskId){
   const result=await pythonCall(`/api/vmake_status?task_id=${encodeURIComponent(f.taskId)}`);
   if(result.failed||result.resubmit_required){await update(x=>{x.status='error';x.error=result.message||'VMake processing failed. Check the provider before starting again.';});return;}
   if(result.done){if(!result.output_urls?.[0])throw Error('VMake completed without a video.');await update(x=>{x.outputUrl=result.output_urls[0];x.taskId=undefined;x.videoStep=x.videoStep==='enhance'&&x.vmakeMode==='both'?'remove':'save';});}
  }else{
   await update(x=>{x.pendingSubmit=true;});
   const result=await pythonCall('/api/vmake_submit',{url:f.outputUrl||f.originalUrl,operation:f.videoStep});
   if(!result.task_id&&!result.output_urls?.[0])throw Error('VMake did not return a task or video.');
   await update(x=>{x.pendingSubmit=false;if(result.task_id)x.taskId=String(result.task_id);else{x.outputUrl=result.output_urls[0];x.videoStep=x.videoStep==='enhance'&&x.vmakeMode==='both'?'remove':'save';}});
  }
 }catch(e){
  // Polling/storage errors can retry safely; never repeat an uncertain paid submission.
  if(!f.taskId&&f.videoStep!=='save')await update(x=>{x.status='error';x.error='VMake submission could not be confirmed. Check the provider before starting another paid request.';});
  else if(f.taskId&&/failed|without a video/i.test((e as Error).message))await update(x=>{x.status='error';x.error=(e as Error).message;});
  else throw e;
 }finally{await update(x=>{x.leaseUntil=0;});}
}
export async function additionalVideoPending(adId:string,id:string){return (await readState<AdditionalState>(key(adId),{files:[]})).value.files.some(f=>f.id===id&&f.provider==='vmake'&&f.status==='generating');}
