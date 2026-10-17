import {neutralAntkiDraft,validateAntkiNeutralVariants,validateAntkiNeutral} from './antki-neutral';
import {assertBrain} from './account-brain';
import {accountProduct} from './account-product';
import {accountEnv,requiredAccountEnv} from './account-context';
import type {SavedNativeAd} from './native-ad-model';
import {exportApprovedAntkiImage} from './antki-image-approval-sheet';
import {exportApprovedAntki} from './antki-approval-sheet';
import {reviewAntkiImage} from './antki-image-review';
import {send} from './account-queue';
import {Readable} from 'node:stream';
import {getNativeAd,getNativeAds,imageType,saveNativeWorkOutput} from './native-ads';
import {driveUploadTarget} from './drive-video';
import {safeDownload} from './safe-fetch';
import {withEditorLocks} from './editor-locks';
import {readState,mutate} from './store';
import {advanceAntkiImageFallback,selectOriginalAntkiImage,usableAntkiImage,repairableAntkiImage,knownImageFailure,ANTKI_COPYWRITING_VERSION,newAntkiWork,antkiImagePrompt,antkiTargetCopy,type AntkiWork} from './antki-model';
import {localiseAntkiChunk,validateAntkiChunk,submitAntkiImage,pollAntkiImage} from './antki-providers';
export type {AntkiWork} from './antki-model';
const key=(id:string)=>{if(!/^facebook_\d{5,30}$/.test(id))throw Error('Invalid Antki ID.');return 'antki-work-'+id;};
async function persist(work:AntkiWork){
 work.updated=Date.now();await mutate<{work?:AntkiWork},void>(key(work.id)+'-record',{},s=>{s.work=work;});
 await mutate<Record<string,{status:string;phase:string;localizedStatus?:string}>,void>('antki-work-index',{},s=>{s[work.id]={status:work.approval?.state==='approved'?'approved':work.approval?.state==='pending'?'exporting':work.status,phase:work.phase,...(work.localizedVersion?{localizedStatus:work.localizedVersion.status}:{})};});
}
export async function antkiWorkIndex(){return (await readState<Record<string,{status:string;phase:string;localizedStatus?:string}>>('antki-work-index',{})).value;}
// A single record envelope supports atomic replacement through the existing CAS store.
export async function readAntkiWork(id:string){const work=(await readState<{work?:AntkiWork}>(key(id)+'-record',{})).value.work||null;if(work?.phase==='image'&&work.pending==='image'&&work.error==='Kie request failed (200/402).'){work.pending=undefined;work.status='failed';work.error='Kie: insufficient credits (402). Top up the connected Kie account before retrying.';work.imageAttempts=Math.max(0,(work.imageAttempts||1)-1);}return work;}
// Reserve by expected Sheet reads, rather than delaying a one-read text step like a multi-read delivery.
// Three seconds per read unit caps Antki scheduling at ~20 Sheet reads/minute, leaving room for UI/legacy jobs.
async function antkiQueueDelay(delaySeconds:number,units:number){const at=await mutate<{next?:number},number>('antki-queue-pacing-v2',{},s=>{const at=Math.max(Date.now()+delaySeconds*1000,s.next||0);s.next=at+Math.max(1000,units*3000);return at;});return Math.max(0,Math.ceil((at-Date.now())/1000));}
export async function scheduleAntki(id:string,delaySeconds=0,phase?:AntkiWork['phase']){delaySeconds=await antkiQueueDelay(delaySeconds,phase==='poll'?0:phase==='deliver'?5:!phase?10:1);await send('szekspir-antki',{id},{region:'fra1',delaySeconds,retentionSeconds:86400});}

export async function startAntkiWork(id:string,retry=false,confirmUncertain=false,source?:SavedNativeAd,completeImage=false){
 key(id);const result=await withEditorLocks(['antki-work-'+id],async()=>{
  const ad=source||await getNativeAd(id);let work=await readAntkiWork(id);
  if(work){if(work.sourceText!==ad.primaryText||work.sourceHeadline!==(ad.headline||'')||work.sourceImage!==ad.imageUrl)throw Error('Source changed. Existing UK work is preserved; review the source.');
   if(!work.sourceRow){work.sourceRow=ad.row;await persist(work);}
   if(retry&&['failed','uncertain'].includes(work.status)){if(work.pending&&!confirmUncertain)throw Error('The previous provider request may have completed. Confirm before submitting another paid request.');if(repairableAntkiImage(work)){work.imageFallbackPolicy='gpt-seedream-original';advanceAntkiImageFallback(work,work.error||'Confirmed image failure');}work.pending=undefined;work.error=undefined;work.status='queued';if(completeImage&&work.textRewrite)work.textRewrite.completeImage=true;await persist(work);}
  }else{work=newAntkiWork(ad);work.targetProduct=await accountProduct();await persist(work);}
  return work;
 });
 if(['queued','working'].includes(result.status))await scheduleAntki(id,0,result.phase);return result;
}
export async function rewriteAntkiText(id:string,revision:unknown,completeImage=false,source?:SavedNativeAd){
 key(id);const work=await withEditorLocks(['antki-work-'+id],async()=>{
  const previous=await readAntkiWork(id);if(!previous||previous.revision!==revision)throw Error('Reload this advert before rewriting.');
  if(previous.textRewrite||previous.pending||['queued','working'].includes(previous.status))throw Error('Finish or check the current request before rewriting.');
  if((previous.approval&&!completeImage)||previous.approval?.state==='pending'||previous.imageApproval?.state==='pending')throw Error('Review the approved/exporting advert before rewriting.');
  const ad=source||await getNativeAd(id,previous.sourceRow);if(ad.primaryText!==previous.sourceText||ad.imageUrl!==previous.sourceImage||(ad.headline||'')!==previous.sourceHeadline)throw Error('Source changed. Review it before rewriting.');
  await mutate<{versions:unknown[]},void>('antki-copy-history-'+id,{versions:[]},s=>{s.versions.push({revision:previous.revision,copywritingVersion:previous.copywritingVersion,text:previous.ukText,headline:previous.ukHeadline,chunks:previous.ukChunks,at:Date.now()});s.versions=s.versions.slice(-3);});
  const next=newAntkiWork(ad);previous.targetProduct=await accountProduct();if(completeImage)previous.approval=undefined;previous.textRewrite={completeImage,phase:previous.phase,status:previous.status,error:previous.error};previous.copywritingVersion=next.copywritingVersion;previous.rejectedText=undefined;previous.ukText='';previous.ukHeadline='';previous.ukChunks=[];previous.chunks=next.chunks;previous.phase='text';previous.status='queued';previous.error=undefined;previous.revision++;await persist(previous);return previous;
 });await scheduleAntki(id,0,work.phase);return work;
}
export async function startAntkiBatch(ids:string[]){
 const ads=await getNativeAds(ids),results:{id:string;status:string;error?:string}[]=[];
 for(const ad of ads){try{const prior=await readAntkiWork(ad.id),retry=prior?.status==='failed'&&!prior.pending&&(/Quota exceeded|rate limit|Too Many Requests/i.test(prior.error||'')||knownImageFailure(prior.phase,prior.error||''));const work=await startAntkiWork(ad.id,retry,false,ad);results.push({id:ad.id,status:work.status});}catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});}}
 return results;
}
/** Repair both UK variants without paid generation or a burst of Sheet writes. */
export async function repairAntkiLinks(ids:string[]){
 if(!Array.isArray(ids)||!ids.length||ids.length>60||new Set(ids).size!==ids.length)throw Error('Choose 1–60 distinct adverts.');
 ids.forEach(key);const results:{id:string;status:string;error?:string}[]=[];
 for(const id of ids){try{let deliver=false;await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work){results.push({id,status:'unchanged'});return;}
  const adapt=(text:string)=>antkiTargetCopy(text,work.targetProduct?.url,work.targetProduct?.name);
  const text=adapt(work.ukText),headline=adapt(work.ukHeadline),chunks=work.ukChunks.map(adapt),v=work.localizedVersion;
  const localized=v?.status==='ready'?{text:adapt(v.text),headline:adapt(v.headline),chunks:v.chunks.map(adapt)}:undefined;
  const rewrittenChanged=text!==work.ukText||headline!==work.ukHeadline||chunks.some((t,i)=>t!==work.ukChunks[i]);
  const localizedChanged=!!localized&&(localized.text!==v!.text||localized.headline!==v!.headline||localized.chunks.some((t,i)=>t!==v!.chunks[i]));
  if(!rewrittenChanged&&!localizedChanged){results.push({id,status:'unchanged'});return;}
  if(work.pending||!['ready','failed'].includes(work.status)||!['done','deliver'].includes(work.phase)||work.approval?.state==='pending'||work.imageApproval?.state==='pending')throw Error('Finish the active operation before repairing target copy.');
  if(localizedChanged)work.localizedVersion={...v!,...localized!,revision:v!.revision+1,updated:Date.now()};
  if(rewrittenChanged){
   if(work.phase==='done'&&!work.delivered)work.delivered={headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||''};
   work.approval=undefined;work.ukText=text;work.ukHeadline=headline;work.ukChunks=chunks;work.phase='deliver';work.status='queued';work.error=undefined;deliver=true;
  }
  work.revision++;await persist(work);results.push({id,status:'updated'});
 });if(deliver)await scheduleAntki(id,0,'deliver');}catch(e){results.push({id,status:'failed',error:(e as Error).message});}}
 return results;
}
async function archiveImage(work:AntkiWork){
 const {drive,folderId}=await driveUploadTarget();
 if(!work.imageFileId){const id=(await drive.files.generateIds({count:1,space:'drive'})).data.ids?.[0];if(!id)throw Error('Drive did not allocate an image ID.');work.imageFileId=id;await persist(work);}
 let exists=false;try{const response=await drive.files.get({fileId:work.imageFileId,supportsAllDrives:true,fields:'size,trashed'});if(response.data.trashed)throw Error('Generated image is in Trash.');exists=Number(response.data.size)>0;}catch(e){if(Number((e as {code?:number}).code)!==404)throw e;}
 if(!exists){const downloaded=await safeDownload(work.imageResultUrl!,24*1024*1024),kind=imageType(downloaded.buffer);await drive.files.create({supportsAllDrives:true,requestBody:{id:work.imageFileId,name:`antki-uk-${work.id}.${kind.ext}`,parents:[folderId]},media:{mimeType:kind.mime,body:Readable.from(downloaded.buffer)},fields:'id'},{timeout:60000,retry:false});}
 const permissions=(await drive.permissions.list({fileId:work.imageFileId,supportsAllDrives:true,fields:'permissions(type)'})).data.permissions||[];
 if(!permissions.some(p=>p.type==='anyone'))await drive.permissions.create({fileId:work.imageFileId,supportsAllDrives:true,requestBody:{type:'anyone',role:'reader',allowFileDiscovery:false}});
 work.imageDriveUrl=`https://drive.google.com/file/d/${work.imageFileId}/view`;
}
export async function consumeAntki(id:string){
 key(id);let delay:number|undefined,nextPhase:AntkiWork['phase']|undefined;
 await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work||['ready','failed','uncertain'].includes(work.status))return;
  if(work.pending){work.status='uncertain';work.error='Previous provider request has no saved result. Review before retrying.';await persist(work);return;}
  try{
   if(work.phase!=='poll'){const ad=await getNativeAd(id,work.sourceRow);if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage||(ad.headline||'')!==work.sourceHeadline)throw Error('Source changed during preparation.');}
   work.ukText=antkiTargetCopy(work.ukText,work.targetProduct?.url,work.targetProduct?.name);work.ukHeadline=antkiTargetCopy(work.ukHeadline,work.targetProduct?.url,work.targetProduct?.name);work.ukChunks=work.ukChunks.map(text=>antkiTargetCopy(text,work.targetProduct?.url,work.targetProduct?.name));
   work.status='working';
   if(work.phase==='text'){
    assertBrain();
    work.pending='text';await persist(work);const result=await localiseAntkiChunk(work);work.pending=undefined;
    if(!work.ukChunks.length)work.ukHeadline=result.headline;work.reviewNotes=[...new Set([...(work.reviewNotes||[]),...(result.reviewNotes||[])])].slice(0,50);work.ukChunks.push(result.text);work.rejectedText=undefined;
    if(work.ukChunks.length===work.chunks.length){work.ukText=work.ukChunks.join('');work.imagePrompt=antkiImagePrompt(work);work.phase=work.textRewrite?'deliver':'image';}
    delay=0;
   }else if(work.phase==='image'){
    if(!accountEnv('KIE_API_KEY'))throw Error('Kie image generation is not configured.');
    work.imageOrigin='generated';work.imagePrompt=antkiImagePrompt(work);work.imageAttempts=(work.imageAttempts||0)+1;work.pending='image';await persist(work);work.imageTaskId=await submitAntkiImage(work);work.pending=undefined;work.phase='poll';delay=20;
   }else if(work.phase==='poll'){
    work.imageResultUrl=await pollAntkiImage(work.imageTaskId!);work.polls++;
    if(work.imageResultUrl){work.phase='check';delay=0;}else if(work.polls>=180)throw Error('Image still processing. Retry resumes the existing task without another generation.');else delay=Math.min(60,20+work.polls*2);
   }else if(work.phase==='check'){
    work.pending='review';await persist(work);work.imageReview=await reviewAntkiImage(work);work.pending=undefined;
    if(work.imageReview.personChanged===true&&work.imageReview.different&&work.imageReview.realistic&&work.imageReview.congruent){work.phase='archive';delay=0;}
    else if(work.imageFallbackPolicy==='gpt-seedream-original'){advanceAntkiImageFallback(work,'Image rejected: '+work.imageReview.change);delay=0;}
    else if((work.imageAttempts||1)<2){work.imageTaskId=undefined;work.imageResultUrl=undefined;work.imagePrompt=antkiImagePrompt(work);work.phase='image';delay=0;}
    else throw Error('Image rejected: '+work.imageReview.change+' Generate a new variation; this image has not been delivered.');
   }else if(work.phase==='archive'){await archiveImage(work);work.phase='deliver';delay=0;
   }else if(work.phase==='deliver'){
    await saveNativeWorkOutput(id,work.sourceText,{headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||'',status:'Ready for review'},work.delivered,work.sourceRow);work.delivered={headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||''};if(work.textRewrite){const resume=work.textRewrite;work.phase=resume.status==='ready'?'done':resume.phase;work.status=resume.status;work.error=resume.error;work.lastTextRewriteAt=Date.now();work.textRewrite=undefined;if(resume.completeImage&&(!work.imageDriveUrl||!work.imageFileId)){work.phase=work.imageResultUrl?'check':work.imageTaskId?'poll':'image';work.status='queued';work.error=undefined;delay=0;}}else{work.phase='done';work.status='ready';}
   }
   await persist(work);
  }catch(e){const candidate=(e as {candidate?:AntkiWork['rejectedText']}).candidate;if(candidate&&candidate.index===work.ukChunks.length&&candidate.text.length<=50000)work.rejectedText=candidate;if(!work.pending&&(/Quota exceeded|rate limit|Too Many Requests/i.test((e as Error).message)||Number((e as {code?:unknown}).code)===429)){work.status='queued';work.error='Google Sheets limit reached. Resuming automatically after cooldown.';await persist(work);delay=60;return;}if(['antki_text_rejected','antki_output_rejected','antki_image_rejected'].includes((e as {code?:string}).code||''))work.pending=undefined;if(work.imageFallbackPolicy==='gpt-seedream-original'&&['antki_image_failed','antki_image_rejected'].includes((e as {code?:string}).code||'')){if(work.imageTaskId)work.failedImageTaskId=work.imageTaskId;advanceAntkiImageFallback(work,(e as Error).message);await persist(work);delay=0;return;}if((e as {code?:string}).code==='antki_image_failed'){work.failedImageTaskId=work.imageTaskId;work.imageTaskId=undefined;work.phase='image';}work.status=work.pending?'uncertain':'failed';work.error=(e as Error).message;await persist(work);delay=undefined;}finally{nextPhase=work.phase;}
 });
 if(delay!==undefined)await scheduleAntki(id,delay,nextPhase);
}
/** Correct a retained rejected draft without generating another response. */
export async function reviseRejectedAntkiText(id:string,text:unknown,headline:unknown,revision:unknown){
 key(id);if(typeof text!=='string'||!text.trim()||text.length>50000||typeof headline!=='string'||headline.length>1500)throw Error('Podaj zapisany tekst i nagłówek do poprawienia.');
 const work=await withEditorLocks(['antki-work-'+id],async()=>{const work=await readAntkiWork(id);if(!work||work.revision!==revision||work.phase!=='text'||work.status!=='failed'||work.pending||!work.rejectedText)throw Error('Odśwież zapisany wynik przed poprawieniem.');const candidate={...work.rejectedText,text,headline};validateAntkiChunk(work,candidate);work.rejectedText=candidate;work.revision++;work.status='queued';work.error=undefined;await persist(work);return work;});await scheduleAntki(id,0,work.phase);return work;
}
export async function editAntkiWork(id:string,text:unknown,headline:unknown,revision:unknown){
 if(typeof text!=='string'||!text.trim()||text.length>135000||text.trim().split(/\s+/).length>15000||typeof headline!=='string'||headline.length>1500)throw Error('UK text must contain 1–15,000 words and headline up to 1,500 characters.');
 key(id);const work=await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work||!['ready','failed'].includes(work.status)||!['done','deliver'].includes(work.phase))throw Error('Wait for preparation to finish before editing.');
  if(work.approval?.state==='pending')throw Error('Finish approval export before editing.');
  if(work.revision!==revision)throw Error('Another tab changed this draft. Reload before saving.');
  if(work.phase==='done'&&!work.delivered)work.delivered={headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||''};
  work.approval=undefined;work.ukText=antkiTargetCopy(text,work.targetProduct?.url,work.targetProduct?.name);work.ukHeadline=antkiTargetCopy(headline,work.targetProduct?.url,work.targetProduct?.name);work.revision++;work.phase='deliver';work.status='queued';work.error=undefined;await persist(work);return work;
 });await scheduleAntki(id,0,work.phase);return work;
}
export async function antkiGeneratedImage(id:string){await getNativeAd(id);const work=await readAntkiWork(id);const fileId=work?.imageFileId&&work.imageDriveUrl?.includes(`/d/${work.imageFileId}/`)?work.imageFileId:work?.previousImage?.fileId;if(!fileId)throw Error('UK image is not ready yet.');const {drive}=await driveUploadTarget();const response=await drive.files.get({fileId,alt:'media',supportsAllDrives:true},{responseType:'arraybuffer',timeout:30000,retry:false});const buffer=Buffer.from(response.data as ArrayBuffer);if(buffer.length>24*1024*1024)throw Error('Image exceeds size limit.');return {buffer,...imageType(buffer)};}

export async function regenerateAntkiImage(id:string,source?:SavedNativeAd,onlyFailed=false){
 key(id);const work=await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(onlyFailed&&(!work||!repairableAntkiImage(work)))return null;if(!work||work.pending||!['ready','failed'].includes(work.status)||!work.ukText)throw Error('Finish or review the previous request before generating a new photo.');
  if(work.imageApproval?.state==='pending')throw Error('Finish image approval export before generating a new photo.');
  if(work.approval?.state==='pending')throw Error('Finish approval export before generating a new photo.');
  const ad=source||await getNativeAd(id);if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage)throw Error('The source changed; review it first.');
  work.approval=undefined;
  if(!work.delivered&&work.phase==='done')work.delivered={headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||''};
  if(work.imageFileId&&work.imageDriveUrl)work.previousImage={fileId:work.imageFileId,url:work.imageDriveUrl};
  work.imageFallbackPolicy='gpt-seedream-original';const failure=work.error||'Confirmed failed photo';if(!onlyFailed)work.imageModel='gpt-image-2-image-to-image';work.imagePrompt=antkiImagePrompt(work);work.imageApproval=undefined;work.imageTaskId=undefined;work.imageResultUrl=undefined;work.imageFileId=undefined;work.imageAttempts=0;work.polls=0;
  work.phase='image';work.status='queued';work.error=undefined;if(onlyFailed)advanceAntkiImageFallback(work,failure);work.revision++;await persist(work);return work;
 });if(work)await scheduleAntki(id,0,work.phase);return work;
}

/** Explicit bounded recovery: reuses copy, skips active/unknown/refused requests, and reserves the normal paced queue. */
export async function repairAntkiImages(ids:string[]){
 if(!Array.isArray(ids)||!ids.length||ids.length>60||new Set(ids).size!==ids.length)throw Error('Choose 1–60 distinct adverts.');
 ids.forEach(key);const ads=await getNativeAds(ids),results:{id:string;status:string;error?:string}[]=[];
 for(const ad of ads){try{if(ad.sourceKind==='reference-test'){results.push({id:ad.id,status:'unchanged'});continue;}const work=await regenerateAntkiImage(ad.id,ad,true);results.push({id:ad.id,status:work?.status||'unchanged'});}catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});}}
 return results;
}

/** Restore the pre-rewrite UK snapshot when available; generate only genuinely missing close localisations. */
export async function prepareAntkiLocalizedBatch(ids:string[],resumeQueued=false){
 const ads=await getNativeAds(ids),results:{id:string;status:string;error?:string}[]=[];
 for(const ad of ads){try{let queue=false;const result=await withEditorLocks(['antki-work-'+ad.id],async()=>{
  const work=await readAntkiWork(ad.id);if(!work)throw Error('Prepare the advert before adding its second UK version.');
  if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage||(ad.headline||'')!==work.sourceHeadline)throw Error('Source changed. Existing UK versions are preserved.');
  if(work.localizedVersion){if(resumeQueued){if(work.localizedVersion.status==='queued'&&!work.localizedVersion.pending)queue=true;await persist(work);}return work.localizedVersion.status;}
  const history=(await readState<{versions:{text?:string;headline?:string;copywritingVersion?:string;at?:number}[]}>('antki-copy-history-'+ad.id,{versions:[]})).value.versions;
  const saved=history.find(v=>v.copywritingVersion!==ANTKI_COPYWRITING_VERSION&&typeof v.text==='string'&&!!v.text.trim());
  if(saved){work.localizedVersion={revision:1,status:'ready',headline:antkiTargetCopy(saved.headline||'',work.targetProduct?.url,work.targetProduct?.name),text:antkiTargetCopy(saved.text!,work.targetProduct?.url,work.targetProduct?.name),chunks:[],source:'saved-version',updated:Date.now()};}
  else{work.localizedVersion={revision:1,status:'queued',headline:'',text:'',chunks:[],source:'generated',updated:Date.now()};queue=true;}
  await persist(work);return saved?'restored':'queued';
 });if(queue)await scheduleAntkiLocalized(ad.id);results.push({id:ad.id,status:result});}catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});}}
 return results;
}
async function scheduleAntkiLocalized(id:string,delay=0){await send('szekspir-antki',{id,version:'localized'},{region:'fra1',delaySeconds:await antkiQueueDelay(delay,1),retentionSeconds:86400});}

export async function consumeAntkiLocalized(id:string){
 key(id);let delay:number|undefined;
 await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id),v=work?.localizedVersion;if(!work||!v||['ready','failed','uncertain'].includes(v.status))return;
  if(v.pending){v.status='uncertain';v.error='Previous localisation request has no saved result. Check before retrying.';await persist(work);return;}
  try{const ad=await getNativeAd(id,work.sourceRow);if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage||(ad.headline||'')!==work.sourceHeadline)throw Error('Source changed. UK versions preserved.');
   v.status='working';v.pending=true;v.updated=Date.now();await persist(work);
   const result=await localiseAntkiChunk({...work,copywritingVersion:'antki-localized-v1',rejectedText:v.rejectedText,ukChunks:v.chunks});
   v.pending=undefined;v.rejectedText=undefined;if(!v.chunks.length)v.headline=result.headline;v.chunks.push(result.text);v.updated=Date.now();
   if(v.chunks.length===work.chunks.length){v.text=antkiTargetCopy(v.chunks.join(''),work.targetProduct?.url,work.targetProduct?.name);v.status='ready';}else{v.status='queued';delay=0;}
   await persist(work);
  }catch(e){const candidate=(e as {candidate?:AntkiWork['rejectedText']}).candidate;if(candidate){v.rejectedText=candidate;v.pending=undefined;}if(['antki_text_rejected','antki_output_rejected'].includes((e as {code?:string}).code||''))v.pending=undefined;if(!v.pending&&(/Quota exceeded|rate limit|Too Many Requests/i.test((e as Error).message)||Number((e as {code?:unknown}).code)===429)){v.status='queued';delay=60;}else v.status=v.pending?'uncertain':'failed';v.error=(e as Error).message;await persist(work);}
 });if(delay!==undefined)await scheduleAntkiLocalized(id,delay);
}
export async function reviseAntkiLocalized(id:string,text:unknown,headline:unknown,revision:unknown){
 key(id);if(typeof text!=='string'||!text.trim()||text.length>50000||typeof headline!=='string'||headline.length>1500)throw Error('Provide the retained localisation draft.');
 const work=await withEditorLocks(['antki-work-'+id],async()=>{const work=await readAntkiWork(id),v=work?.localizedVersion;if(!work||!v||v.revision!==revision||v.status!=='failed'||v.pending||!v.rejectedText)throw Error('Reload the retained localisation before editing.');const candidate={...v.rejectedText,text,headline};validateAntkiChunk({...work,copywritingVersion:'antki-localized-v1'},candidate);v.rejectedText=candidate;v.status='queued';v.error=undefined;v.revision++;await persist(work);return work;});await scheduleAntkiLocalized(id);return work;
}
export async function saveAntkiLocalized(id:string,text:unknown,headline:unknown,revision:unknown){
 key(id);if(typeof text!=='string'||!text.trim()||text.length>135000||text.trim().split(/\s+/).length>15000||typeof headline!=='string'||headline.length>1500)throw Error('Provide the UK localisation text and headline.');
 return withEditorLocks(['antki-work-'+id],async()=>{const work=await readAntkiWork(id),v=work?.localizedVersion;if(!work||!v||v.revision!==revision||v.status!=='ready')throw Error('Reload the saved UK versions before editing.');work.localizedVersion={...v,revision:v.revision+1,text:antkiTargetCopy(text,work.targetProduct?.url,work.targetProduct?.name),headline:antkiTargetCopy(headline,work.targetProduct?.url,work.targetProduct?.name),updated:Date.now()};await persist(work);return work;});
}

/** Explicit original-image fallback. Keep a saved generated image if one already exists. */
export async function useOriginalAntkiImages(ids:string[]){
 const ads=await getNativeAds(ids),results:{id:string;status:string;error?:string}[]=[];
 for(const ad of ads){try{const result=await withEditorLocks(['antki-work-'+ad.id],async()=>{
  const work=await readAntkiWork(ad.id);
  if(!work||work.status!=='failed'||work.pending||!['image','check','archive'].includes(work.phase)||!work.ukText||ad.sourceKind==='reference-test')return null;
  if(work.approval||work.imageApproval?.state==='pending')throw Error('Review approval before replacing an image.');
  if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage||(ad.headline||'')!==work.sourceHeadline)throw Error('Source changed. Original and UK drafts are preserved.');
  if(!/^[-\w]{10,100}$/.test(ad.driveFileId))throw Error('Missing saved original image.');
  if(work.imageFileId&&work.imageDriveUrl)work.previousImage={fileId:work.imageFileId,url:work.imageDriveUrl};
  work.sourceDriveId=ad.driveFileId;work.imageFileId=ad.driveFileId;work.imageDriveUrl=`https://drive.google.com/file/d/${ad.driveFileId}/view`;work.imageOrigin='original';work.imageApproval=undefined;work.imageReview=undefined;work.error=undefined;work.phase='deliver';work.status='queued';work.revision++;await persist(work);return work;
 });if(result)await scheduleAntki(ad.id,0,result.phase);results.push({id:ad.id,status:result?.status||'unchanged'});}catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});}}
 return results;
}

export async function approveAntkiWork(id:string,revision:unknown){
 key(id);return withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);
  if(!work||work.status!=='ready'||work.phase!=='done'||work.pending||work.revision!==revision)throw Error('Save and finish this version before approving. Reload if another tab changed it.');
  if(work.approval?.state==='approved')return work;
  if(!work.imageDriveUrl||!work.imageFileId||!usableAntkiImage(work))throw Error('Generate a new photo with a changed personal characteristic before approval.');
  const ad=await getNativeAd(id);if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage||(ad.headline||'')!==work.sourceHeadline)throw Error('Source changed. Review before approval.');
  if(!work.approval){work.approval={revision:work.revision,state:'pending',approvedAt:new Date().toISOString()};await persist(work);}
  await saveNativeWorkOutput(id,work.sourceText,{headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl,status:'Ready for review'},work.delivered,work.sourceRow);
  const sheetUrl=await exportApprovedAntki(work,ad);
  work.approval={...work.approval,state:'approved',sheetUrl};await persist(work);return work;
 });
}

export async function approveAntkiImage(id:string,revision:unknown){
 key(id);return withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);
  if(!work||work.status!=='ready'||work.phase!=='done'||work.pending||work.revision!==revision||!work.imageFileId||!work.imageDriveUrl||!usableAntkiImage(work))throw Error('Finish this image and reload before approving.');
  if(work.imageApproval?.state==='approved'&&work.imageApproval.fileId===work.imageFileId)return work;
  const ad=await getNativeAd(id);if(ad.imageUrl!==work.sourceImage)throw Error('Source image changed. Review before approval.');
  if(!work.imageApproval){work.imageApproval={fileId:work.imageFileId,state:'pending',approvedAt:new Date().toISOString()};await persist(work);}
  const sheetUrl=await exportApprovedAntkiImage(work);
  work.imageApproval={...work.imageApproval,state:'approved',sheetUrl};await persist(work);return work;
 });
}

/** Explicit owner-requested batch: snapshot/rewrite once per rule version; retain finished photos and known tasks. */
export async function refreshAntkiBatch(ids:string[]){const ads=await getNativeAds(ids),results:{id:string;status:string;error?:string}[]=[];for(const ad of ads){try{const prior=await readAntkiWork(ad.id);if(!prior){const work=await startAntkiWork(ad.id,false,false,ad);results.push({id:ad.id,status:work.status});continue;}if(prior.pending||['queued','working'].includes(prior.status)){results.push({id:ad.id,status:'in-progress',error:prior.pending?'Previous paid request needs reconciliation.':undefined});continue;}if(prior.textRewrite&&prior.status==='failed'){await startAntkiWork(ad.id,true,false,ad,true);results.push({id:ad.id,status:'rewrite-queued'});continue;}if(prior.copywritingVersion!==ANTKI_COPYWRITING_VERSION||!prior.lastTextRewriteAt){await rewriteAntkiText(ad.id,prior.revision,true,ad);results.push({id:ad.id,status:'rewrite-queued'});}else if(!prior.imageDriveUrl||!prior.imageFileId){await startAntkiWork(ad.id,true,false,ad);results.push({id:ad.id,status:'image-queued'});}else results.push({id:ad.id,status:'already-current'});}catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});}}return results;}

/** Save only the neutral alternative; existing copy, approval, media and delivery remain untouched. */
export async function saveAntkiNeutral(id:string,text:unknown,headline:unknown,revision:unknown){
 key(id);const draft=validateAntkiNeutral(text,headline);
 return withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work)throw Error('Otwórz przygotowanego Antka przed zapisaniem wariantu.');
  const previous=work.neutralVersion?.revision||0;if(revision!==previous)throw Error('Inna karta zmieniła ten wariant. Odśwież stronę przed zapisem.');
  work.neutralVersion={...work.neutralVersion,...draft,revision:previous+1,updated:Date.now()};await persist(work);return work;
 });
}

/** Independent four-option save; retains the earlier one-word variant and all advertising work. */
export async function saveAntkiNeutralVariants(id:string,input:unknown,revision:unknown){
 key(id);const variants=validateAntkiNeutralVariants(input);
 return withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work)throw Error('Otwórz przygotowanego Antka przed zapisaniem wariantów.');
  const previous=work.neutralVersion?.revision||0;if(revision!==previous)throw Error('Inna karta zmieniła te warianty. Odśwież stronę przed zapisem.');
  work.neutralVersion={...neutralAntkiDraft(id),...work.neutralVersion,variants,revision:previous+1,updated:Date.now()};await persist(work);return work;
 });
}
