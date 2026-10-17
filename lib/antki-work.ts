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
import {repairableAntkiImage,knownImageFailure,ANTKI_COPYWRITING_VERSION,newAntkiWork,antkiImagePrompt,localiseAntkiPurchaseLinks,type AntkiWork} from './antki-model';
import {localiseAntkiChunk,validateAntkiChunk,submitAntkiImage,pollAntkiImage} from './antki-providers';
export type {AntkiWork} from './antki-model';
const key=(id:string)=>{if(!/^facebook_\d{5,30}$/.test(id))throw Error('Invalid Antki ID.');return 'antki-work-'+id;};
async function persist(work:AntkiWork){
 work.updated=Date.now();await mutate<{work?:AntkiWork},void>(key(work.id)+'-record',{},s=>{s.work=work;});
 await mutate<Record<string,{status:string;phase:string}>,void>('antki-work-index',{},s=>{s[work.id]={status:work.approval?.state==='approved'?'approved':work.approval?.state==='pending'?'exporting':work.status,phase:work.phase};});
}
export async function antkiWorkIndex(){return (await readState<Record<string,{status:string;phase:string}>>('antki-work-index',{})).value;}
// A single record envelope supports atomic replacement through the existing CAS store.
export async function readAntkiWork(id:string){const work=(await readState<{work?:AntkiWork}>(key(id)+'-record',{})).value.work||null;if(work?.phase==='image'&&work.pending==='image'&&work.error==='Kie request failed (200/402).'){work.pending=undefined;work.status='failed';work.error='Kie: insufficient credits (402). Top up the connected Kie account before retrying.';work.imageAttempts=Math.max(0,(work.imageAttempts||1)-1);}return work;}
export async function scheduleAntki(id:string,delaySeconds=0){const at=await mutate<{next?:number},number>('antki-queue-pacing',{},s=>{const at=Math.max(Date.now()+delaySeconds*1000,s.next||0);s.next=at+15000;return at;});delaySeconds=Math.max(0,Math.ceil((at-Date.now())/1000));await send('szekspir-antki',{id},{region:'fra1',delaySeconds,retentionSeconds:86400});}
export async function startAntkiWork(id:string,retry=false,confirmUncertain=false,source?:SavedNativeAd,completeImage=false){
 key(id);const result=await withEditorLocks(['antki-work-'+id],async()=>{
  const ad=source||await getNativeAd(id);let work=await readAntkiWork(id);
  if(work){if(work.sourceText!==ad.primaryText||work.sourceHeadline!==(ad.headline||'')||work.sourceImage!==ad.imageUrl)throw Error('Source changed. Existing UK work is preserved; review the source.');
   if(!work.sourceRow){work.sourceRow=ad.row;await persist(work);}
   if(retry&&['failed','uncertain'].includes(work.status)){if(work.pending&&!confirmUncertain)throw Error('The previous provider request may have completed. Confirm before submitting another paid request.');work.pending=undefined;work.error=undefined;work.status='queued';if(completeImage&&work.textRewrite)work.textRewrite.completeImage=true;await persist(work);}
  }else{work=newAntkiWork(ad);work.targetProduct=await accountProduct();await persist(work);}
  return work;
 });
 if(['queued','working'].includes(result.status))await scheduleAntki(id);return result;
}
export async function rewriteAntkiText(id:string,revision:unknown,completeImage=false,source?:SavedNativeAd){
 key(id);const work=await withEditorLocks(['antki-work-'+id],async()=>{
  const previous=await readAntkiWork(id);if(!previous||previous.revision!==revision)throw Error('Reload this advert before rewriting.');
  if(previous.textRewrite||previous.pending||['queued','working'].includes(previous.status))throw Error('Finish or check the current request before rewriting.');
  if((previous.approval&&!completeImage)||previous.approval?.state==='pending'||previous.imageApproval?.state==='pending')throw Error('Review the approved/exporting advert before rewriting.');
  const ad=source||await getNativeAd(id,previous.sourceRow);if(ad.primaryText!==previous.sourceText||ad.imageUrl!==previous.sourceImage||(ad.headline||'')!==previous.sourceHeadline)throw Error('Source changed. Review it before rewriting.');
  await mutate<{versions:unknown[]},void>('antki-copy-history-'+id,{versions:[]},s=>{s.versions.push({revision:previous.revision,copywritingVersion:previous.copywritingVersion,text:previous.ukText,headline:previous.ukHeadline,chunks:previous.ukChunks,at:Date.now()});s.versions=s.versions.slice(-3);});
  const next=newAntkiWork(ad);previous.targetProduct=await accountProduct();if(completeImage)previous.approval=undefined;previous.textRewrite={completeImage,phase:previous.phase,status:previous.status,error:previous.error};previous.copywritingVersion=next.copywritingVersion;previous.rejectedText=undefined;previous.ukText='';previous.ukHeadline='';previous.ukChunks=[];previous.chunks=next.chunks;previous.phase='text';previous.status='queued';previous.error=undefined;previous.revision++;await persist(previous);return previous;
 });await scheduleAntki(id);return work;
}
export async function startAntkiBatch(ids:string[]){
 const ads=await getNativeAds(ids),results:{id:string;status:string;error?:string}[]=[];
 for(const ad of ads){try{const prior=await readAntkiWork(ad.id),retry=prior?.status==='failed'&&!prior.pending&&(/Quota exceeded|rate limit|Too Many Requests/i.test(prior.error||'')||knownImageFailure(prior.phase,prior.error||''));const work=await startAntkiWork(ad.id,retry,false,ad);results.push({id:ad.id,status:work.status});}catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});}}
 return results;
}
export async function repairAntkiLinks(ids:string[]){
 if(!Array.isArray(ids)||!ids.length||ids.length>60||new Set(ids).size!==ids.length)throw Error('Choose 1–60 distinct adverts.');
 ids.forEach(key);const results:{id:string;status:string;error?:string}[]=[];
 for(const id of ids){try{await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work){results.push({id,status:'unchanged'});return;}
  const text=localiseAntkiPurchaseLinks(work.ukText,work.targetProduct?.url),headline=localiseAntkiPurchaseLinks(work.ukHeadline,work.targetProduct?.url),chunks=work.ukChunks.map(text=>localiseAntkiPurchaseLinks(text,work.targetProduct?.url));
  if(text===work.ukText&&headline===work.ukHeadline&&chunks.every((v,i)=>v===work.ukChunks[i])){results.push({id,status:'unchanged'});return;}
  if(work.approval||work.imageApproval?.state==='pending')throw Error('Approved/exporting advert needs review before changing links.');
  if(work.delivered){const output={headline,text,imageUrl:work.imageDriveUrl||work.delivered.imageUrl,status:'Ready for review'};await saveNativeWorkOutput(id,work.sourceText,output,work.delivered);work.delivered={headline,text,imageUrl:output.imageUrl};}
  work.ukText=localiseAntkiPurchaseLinks(text,work.targetProduct?.url);work.ukHeadline=localiseAntkiPurchaseLinks(headline,work.targetProduct?.url);work.ukChunks=chunks;work.revision++;await persist(work);results.push({id,status:'updated'});
 });}catch(e){results.push({id,status:'failed',error:(e as Error).message});}}
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
 key(id);let delay:number|undefined;
 await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work||['ready','failed','uncertain'].includes(work.status))return;
  if(work.pending){work.status='uncertain';work.error='Previous provider request has no saved result. Review before retrying.';await persist(work);return;}
  try{
   if(work.phase!=='poll'){const ad=await getNativeAd(id,work.sourceRow);if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage||(ad.headline||'')!==work.sourceHeadline)throw Error('Source changed during preparation.');}
   work.ukText=localiseAntkiPurchaseLinks(work.ukText,work.targetProduct?.url);work.ukHeadline=localiseAntkiPurchaseLinks(work.ukHeadline,work.targetProduct?.url);work.ukChunks=work.ukChunks.map(text=>localiseAntkiPurchaseLinks(text,work.targetProduct?.url));
   work.status='working';
   if(work.phase==='text'){
    assertBrain();
    work.pending='text';await persist(work);const result=await localiseAntkiChunk(work);work.pending=undefined;
    if(!work.ukChunks.length)work.ukHeadline=result.headline;work.reviewNotes=[...new Set([...(work.reviewNotes||[]),...(result.reviewNotes||[])])].slice(0,50);work.ukChunks.push(result.text);work.rejectedText=undefined;
    if(work.ukChunks.length===work.chunks.length){work.ukText=work.ukChunks.join('');work.imagePrompt=antkiImagePrompt(work);work.phase=work.textRewrite?'deliver':'image';}
    delay=0;
   }else if(work.phase==='image'){
    if(!accountEnv('KIE_API_KEY'))throw Error('Kie image generation is not configured.');
    work.imagePrompt=antkiImagePrompt(work);work.imageAttempts=(work.imageAttempts||0)+1;work.pending='image';await persist(work);work.imageTaskId=await submitAntkiImage(work);work.pending=undefined;work.phase='poll';delay=20;
   }else if(work.phase==='poll'){
    work.imageResultUrl=await pollAntkiImage(work.imageTaskId!);work.polls++;
    if(work.imageResultUrl){work.phase='check';delay=0;}else if(work.polls>=180)throw Error('Image still processing. Retry resumes the existing task without another generation.');else delay=Math.min(60,20+work.polls*2);
   }else if(work.phase==='check'){
    work.pending='review';await persist(work);work.imageReview=await reviewAntkiImage(work);work.pending=undefined;
    if(work.imageReview.personChanged===true&&work.imageReview.different&&work.imageReview.realistic&&work.imageReview.congruent){work.phase='archive';delay=0;}
    else if((work.imageAttempts||1)<2){work.imageTaskId=undefined;work.imageResultUrl=undefined;work.imagePrompt=antkiImagePrompt(work);work.phase='image';delay=0;}
    else throw Error('Image rejected: '+work.imageReview.change+' Generate a new variation; this image has not been delivered.');
   }else if(work.phase==='archive'){await archiveImage(work);work.phase='deliver';delay=0;
   }else if(work.phase==='deliver'){
    await saveNativeWorkOutput(id,work.sourceText,{headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||'',status:'Ready for review'},work.delivered);work.delivered={headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||''};if(work.textRewrite){const resume=work.textRewrite;work.phase=resume.status==='ready'?'done':resume.phase;work.status=resume.status;work.error=resume.error;work.lastTextRewriteAt=Date.now();work.textRewrite=undefined;if(resume.completeImage&&(!work.imageDriveUrl||!work.imageFileId)){work.phase=work.imageResultUrl?'check':work.imageTaskId?'poll':'image';work.status='queued';work.error=undefined;delay=0;}}else{work.phase='done';work.status='ready';}
   }
   await persist(work);
  }catch(e){const candidate=(e as {candidate?:AntkiWork['rejectedText']}).candidate;if(candidate&&candidate.index===work.ukChunks.length&&candidate.text.length<=50000)work.rejectedText=candidate;if(!work.pending&&(/Quota exceeded|rate limit|Too Many Requests/i.test((e as Error).message)||Number((e as {code?:unknown}).code)===429)){work.status='queued';work.error='Google Sheets limit reached. Resuming automatically after cooldown.';await persist(work);delay=60;return;}if(['antki_text_rejected','antki_output_rejected','antki_image_rejected'].includes((e as {code?:string}).code||''))work.pending=undefined;if((e as {code?:string}).code==='antki_image_failed'){work.failedImageTaskId=work.imageTaskId;work.imageTaskId=undefined;work.phase='image';}work.status=work.pending?'uncertain':'failed';work.error=(e as Error).message;await persist(work);delay=undefined;}
 });
 if(delay!==undefined)await scheduleAntki(id,delay);
}
/** Correct a retained rejected draft without generating another response. */
export async function reviseRejectedAntkiText(id:string,text:unknown,headline:unknown,revision:unknown){
 key(id);if(typeof text!=='string'||!text.trim()||text.length>50000||typeof headline!=='string'||headline.length>1500)throw Error('Podaj zapisany tekst i nagłówek do poprawienia.');
 const work=await withEditorLocks(['antki-work-'+id],async()=>{const work=await readAntkiWork(id);if(!work||work.revision!==revision||work.phase!=='text'||work.status!=='failed'||work.pending||!work.rejectedText)throw Error('Odśwież zapisany wynik przed poprawieniem.');const candidate={...work.rejectedText,text,headline};validateAntkiChunk(work,candidate);work.rejectedText=candidate;work.revision++;work.status='queued';work.error=undefined;await persist(work);return work;});await scheduleAntki(id);return work;
}
export async function editAntkiWork(id:string,text:unknown,headline:unknown,revision:unknown){
 if(typeof text!=='string'||!text.trim()||text.length>135000||text.trim().split(/\s+/).length>15000||typeof headline!=='string'||headline.length>1500)throw Error('UK text must contain 1–15,000 words and headline up to 1,500 characters.');
 key(id);const work=await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work||!['ready','failed'].includes(work.status)||!['done','deliver'].includes(work.phase))throw Error('Wait for preparation to finish before editing.');
  if(work.approval?.state==='pending')throw Error('Finish approval export before editing.');
  if(work.revision!==revision)throw Error('Another tab changed this draft. Reload before saving.');
  if(work.phase==='done'&&!work.delivered)work.delivered={headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||''};
  work.approval=undefined;work.ukText=localiseAntkiPurchaseLinks(text,work.targetProduct?.url);work.ukHeadline=localiseAntkiPurchaseLinks(headline,work.targetProduct?.url);work.revision++;work.phase='deliver';work.status='queued';work.error=undefined;await persist(work);return work;
 });await scheduleAntki(id);return work;
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
  work.imagePrompt=antkiImagePrompt(work);work.imageApproval=undefined;work.imageTaskId=undefined;work.imageResultUrl=undefined;work.imageFileId=undefined;work.imageAttempts=0;work.polls=0;
  work.phase='image';work.status='queued';work.error=undefined;work.revision++;await persist(work);return work;
 });if(work)await scheduleAntki(id);return work;
}

/** Explicit bounded recovery: reuses copy, skips active/unknown/refused requests, and reserves the normal paced queue. */
export async function repairAntkiImages(ids:string[]){
 if(!Array.isArray(ids)||!ids.length||ids.length>60||new Set(ids).size!==ids.length)throw Error('Choose 1–60 distinct adverts.');
 ids.forEach(key);const ads=await getNativeAds(ids),results:{id:string;status:string;error?:string}[]=[];
 for(const ad of ads){try{if(ad.sourceKind==='reference-test'){results.push({id:ad.id,status:'unchanged'});continue;}const work=await regenerateAntkiImage(ad.id,ad,true);results.push({id:ad.id,status:work?.status||'unchanged'});}catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});}}
 return results;
}

export async function approveAntkiWork(id:string,revision:unknown){
 key(id);return withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);
  if(!work||work.status!=='ready'||work.phase!=='done'||work.pending||work.revision!==revision)throw Error('Save and finish this version before approving. Reload if another tab changed it.');
  if(work.approval?.state==='approved')return work;
  if(!work.imageDriveUrl||!work.imageFileId||work.imageReview?.personChanged!==true)throw Error('Generate a new photo with a changed personal characteristic before approval.');
  const ad=await getNativeAd(id);if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage||(ad.headline||'')!==work.sourceHeadline)throw Error('Source changed. Review before approval.');
  if(!work.approval){work.approval={revision:work.revision,state:'pending',approvedAt:new Date().toISOString()};await persist(work);}
  await saveNativeWorkOutput(id,work.sourceText,{headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl,status:'Ready for review'},work.delivered);
  const sheetUrl=await exportApprovedAntki(work,ad);
  work.approval={...work.approval,state:'approved',sheetUrl};await persist(work);return work;
 });
}

export async function approveAntkiImage(id:string,revision:unknown){
 key(id);return withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);
  if(!work||work.status!=='ready'||work.phase!=='done'||work.pending||work.revision!==revision||!work.imageFileId||!work.imageDriveUrl||work.imageReview?.personChanged!==true)throw Error('Finish this image and reload before approving.');
  if(work.imageApproval?.state==='approved'&&work.imageApproval.fileId===work.imageFileId)return work;
  const ad=await getNativeAd(id);if(ad.imageUrl!==work.sourceImage)throw Error('Source image changed. Review before approval.');
  if(!work.imageApproval){work.imageApproval={fileId:work.imageFileId,state:'pending',approvedAt:new Date().toISOString()};await persist(work);}
  const sheetUrl=await exportApprovedAntkiImage(work);
  work.imageApproval={...work.imageApproval,state:'approved',sheetUrl};await persist(work);return work;
 });
}

/** Explicit owner-requested batch: snapshot/rewrite once per rule version; retain finished photos and known tasks. */
export async function refreshAntkiBatch(ids:string[]){const ads=await getNativeAds(ids),results:{id:string;status:string;error?:string}[]=[];for(const ad of ads){try{const prior=await readAntkiWork(ad.id);if(!prior){const work=await startAntkiWork(ad.id,false,false,ad);results.push({id:ad.id,status:work.status});continue;}if(prior.pending||['queued','working'].includes(prior.status)){results.push({id:ad.id,status:'in-progress',error:prior.pending?'Previous paid request needs reconciliation.':undefined});continue;}if(prior.textRewrite&&prior.status==='failed'){await startAntkiWork(ad.id,true,false,ad,true);results.push({id:ad.id,status:'rewrite-queued'});continue;}if(prior.copywritingVersion!==ANTKI_COPYWRITING_VERSION||!prior.lastTextRewriteAt){await rewriteAntkiText(ad.id,prior.revision,true,ad);results.push({id:ad.id,status:'rewrite-queued'});}else if(!prior.imageDriveUrl||!prior.imageFileId){await startAntkiWork(ad.id,true,false,ad);results.push({id:ad.id,status:'image-queued'});}else results.push({id:ad.id,status:'already-current'});}catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});}}return results;}
