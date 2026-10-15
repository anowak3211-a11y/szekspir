'use client';
import {readUploadDraft,readUploadMedia,saveUploadDraft,saveUploadAudio,removeUploadDraft} from './upload-drafts';
import {uploadMedia} from './media-upload';
type Status=(id:string,status:{name:string;stage:string;error?:string;startedAt?:number;duplicate?:{id:string;adId?:string;market:'uk'|'pl'}})=>void;
// Only these insert-only/same-owner operations may be replayed after an ambiguous response.
export async function requestUploadStage(url:'/api/uploads/check'|'/api/jobs',body:object,timeout:number,active:()=>void,waiting:(seconds:number)=>void){
 const serialized=JSON.stringify(body);
 for(let attempt=0;;attempt++){
  active();let failure:unknown,delay=30000*2**attempt;
  try{
   const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(timeout),body:serialized});
   const data=await response.json();
   const temporary=response.status===408||response.status===429||response.status>=500||response.status===400&&/timed? ?out|timeout|statement timeout|database.*unavailable/i.test(data.error||'');
   if(!temporary)return {response,data};
   failure=Error(data.error||`Upload service unavailable (HTTP ${response.status})`);
   const after=response.headers.get('Retry-After');
   if(after){const seconds=Number(after),ms=Number.isFinite(seconds)?seconds*1000:Date.parse(after)-Date.now();if(Number.isFinite(ms))delay=Math.max(delay,ms);}
  }catch(error){
   if(!['TimeoutError','AbortError','TypeError','SyntaxError'].includes((error as Error).name)&&!/timed? ?out|timeout/i.test((error as Error).message))throw error;
   failure=error;
  }
  if(attempt>=2||delay>300000)throw failure;
  active();waiting(Math.ceil(delay/1000));await new Promise(resolve=>setTimeout(resolve,delay));
 }
}
export async function resumeUpload(id:string,status:Status){
 if(!navigator.locks)throw Error('Upload recovery requires a browser with Web Locks support. Use a current Chrome, Safari or Firefox.');
 return navigator.locks.request('szekspir-upload-'+id,{ifAvailable:true},async lock=>{
  if(!lock)throw Error('This upload is already active in another tab. Return to that tab or close it before resuming here.');
  const draft=await readUploadDraft(id);if(!draft)throw Error('No local recovery copy remains. Check Saved jobs: another tab may have completed this upload.');
  const active=()=>{if(localStorage.getItem('szekspir-cancelled-'+id))throw Error('Cancelled by you');};
  const report=(stage:string,error?:string)=>status(id,{name:draft.name,startedAt:draft.startedAt,stage,error});
  const rejectDuplicate=async(duplicate:{id:string;adId?:string;market:'uk'|'pl'})=>{await removeUploadDraft(id);status(id,{name:draft.name,stage:'Duplicate file',startedAt:draft.startedAt,duplicate});return {duplicate};};
  try{
   active();
   if(draft.fileName){
    if(!draft.sourceHash){const original=await readUploadMedia(id,'file');if(!original)throw Error('The local file backup is unavailable. Select the original file again.');
     const {fingerprintFile}=await import('./file-fingerprint');draft.sourceHash=await fingerprintFile(original,n=>{active();report(`Checking exact file · ${n}%`);});await saveUploadDraft(draft);}
    report('Checking for duplicates');
    const {response:check,data:checked}=await requestUploadStage('/api/uploads/check',{hash:draft.sourceHash,id,market:draft.market},60000,active,seconds=>report(`Duplicate check paused · retry in ${seconds}s`));
    if(check.status===409&&checked.duplicate)return await rejectDuplicate(checked.duplicate);
    if(!check.ok)throw Error(checked.error||'Could not check for duplicates. Resume to try again.');
    let audio=await readUploadMedia(id,'audio');
    const file=(!audio||(!draft.sourceUrl&&draft.video))?await readUploadMedia(id,'file'):undefined;
    if(!audio){if(!file)throw Error('The local file backup is unavailable. Select the original file again.');report('Preparing audio');
     const {extractAudioAsMp3}=await import('./audio');audio=await extractAudioAsMp3(file,seconds=>{draft.duration=seconds;});
     if(audio.size>24*1024*1024)throw Error('Extracted audio is too long; split the recording');
     await saveUploadAudio(draft,audio);
    }
    active();
    if(draft.video&&!draft.sourceUrl){if(!file)throw Error('The local video backup is unavailable. Select the original file again.');
     const ext=(draft.fileName.split('.').pop()||'mp4').toLowerCase().replace(/[^a-z0-9]/g,'')||'mp4';
     report('Uploading video');draft.sourceUrl=(await uploadMedia(`sources/${id}/source.${ext}`,file,n=>report(`Uploading video · ${Math.round(n)}%`))).url;
     await saveUploadDraft(draft);
    }
    active();if(!draft.audioUrl){report('Uploading audio');draft.audioUrl=(await uploadMedia(`sources/${id}/audio.mp3`,audio,n=>report(`Uploading audio · ${Math.round(n)}%`))).url;await saveUploadDraft(draft);}
   }
   active();report('Saving localisation');
   const {response,data:saved}=await requestUploadStage('/api/jobs',{...draft.settings,id:draft.id,name:draft.name,market:draft.market,startedAt:draft.startedAt,sourceHash:draft.sourceHash,sourceUrl:draft.sourceUrl||draft.audioUrl,audioUrl:draft.audioUrl,video:draft.video,duration:draft.duration},120000,active,seconds=>report(`Saving paused · retry in ${seconds}s`));
   if(response.status===409&&saved.duplicate)return await rejectDuplicate(saved.duplicate);if(!response.ok||saved.job?.id!==id)throw Error(saved.error||'Could not confirm the saved job. Resume upload to check the same job again.');
   report('Upload complete · loading localisation');
   // A cleanup failure must not masquerade as a failed server save. A later resume
   // still uses the same UUID and the server's insert-only/idempotent create path.
   await removeUploadDraft(id).catch(()=>{});
  }catch(error){if(draft.sourceHash)await fetch('/api/uploads/check',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({action:'release',hash:draft.sourceHash,id})}).catch(()=>{});if(localStorage.getItem('szekspir-cancelled-'+id))await removeUploadDraft(id).catch(()=>{});report('Upload not completed',(error as Error).message);throw error;}
 });
}
