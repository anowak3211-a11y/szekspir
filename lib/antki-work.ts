import {exportApprovedAntki} from './antki-approval-sheet';
import {reviewAntkiImage} from './antki-image-review';
import {send} from '@vercel/queue';
import {Readable} from 'node:stream';
import {getNativeAd,imageType,saveNativeWorkOutput} from './native-ads';
import {driveUploadTarget} from './drive-video';
import {safeDownload} from './safe-fetch';
import {withEditorLocks} from './editor-locks';
import {readState,mutate} from './store';
import {newAntkiWork,antkiImagePrompt,type AntkiWork} from './antki-model';
import {localiseAntkiChunk,submitAntkiImage,pollAntkiImage} from './antki-providers';
export type {AntkiWork} from './antki-model';
const key=(id:string)=>{if(!/^facebook_\d{5,30}$/.test(id))throw Error('Invalid Antki ID.');return 'antki-work-'+id;};
async function persist(work:AntkiWork){
 work.updated=Date.now();await mutate<{work?:AntkiWork},void>(key(work.id)+'-record',{},s=>{s.work=work;});
 await mutate<Record<string,{status:string;phase:string}>,void>('antki-work-index',{},s=>{s[work.id]={status:work.approval?.state==='approved'?'approved':work.approval?.state==='pending'?'exporting':work.status,phase:work.phase};});
}
export async function antkiWorkIndex(){return (await readState<Record<string,{status:string;phase:string}>>('antki-work-index',{})).value;}
// A single record envelope supports atomic replacement through the existing CAS store.
export async function readAntkiWork(id:string){return (await readState<{work?:AntkiWork}>(key(id)+'-record',{})).value.work||null;}
export async function scheduleAntki(id:string,delaySeconds=0){await send('szekspir-antki',{id},{region:'fra1',delaySeconds,retentionSeconds:86400});}
export async function startAntkiWork(id:string,retry=false,confirmUncertain=false){
 key(id);const result=await withEditorLocks(['antki-work-'+id],async()=>{
  const ad=await getNativeAd(id);let work=await readAntkiWork(id);
  if(work){if(work.sourceText!==ad.primaryText||work.sourceHeadline!==(ad.headline||'')||work.sourceImage!==ad.imageUrl)throw Error('Source changed. Existing UK work is preserved; review the source.');
   if(retry&&['failed','uncertain'].includes(work.status)){if(work.pending&&!confirmUncertain)throw Error('The previous provider request may have completed. Confirm before submitting another paid request.');work.pending=undefined;work.error=undefined;work.status='queued';await persist(work);}
  }else{work=newAntkiWork(ad);await persist(work);}
  return work;
 });
 if(['queued','working'].includes(result.status))await scheduleAntki(id);return result;
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
   if(work.phase!=='poll'){const ad=await getNativeAd(id);if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage||(ad.headline||'')!==work.sourceHeadline)throw Error('Source changed during preparation.');}
   work.status='working';
   if(work.phase==='text'){
    if(!process.env.OPENAI_API_KEY)throw Error('OpenAI is not configured.');
    work.pending='text';await persist(work);const result=await localiseAntkiChunk(work);work.pending=undefined;
    if(!work.ukChunks.length)work.ukHeadline=result.headline;work.ukChunks.push(result.text);
    if(work.ukChunks.length===work.chunks.length){work.ukText=work.ukChunks.join('');work.imagePrompt=antkiImagePrompt(work);work.phase='image';}
    delay=0;
   }else if(work.phase==='image'){
    if(!process.env.KIE_API_KEY)throw Error('Kie image generation is not configured.');
    work.imageAttempts=(work.imageAttempts||0)+1;work.pending='image';await persist(work);work.imageTaskId=await submitAntkiImage(work);work.pending=undefined;work.phase='poll';delay=20;
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
    await saveNativeWorkOutput(id,work.sourceText,{headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||'',status:'Ready for review'},work.delivered);work.delivered={headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||''};work.phase='done';work.status='ready';
   }
   await persist(work);
  }catch(e){if(['antki_text_rejected','antki_output_rejected'].includes((e as {code?:string}).code||''))work.pending=undefined;if((e as {code?:string}).code==='antki_image_failed'){work.imageTaskId=undefined;work.phase='image';}work.status=work.pending?'uncertain':'failed';work.error=(e as Error).message;await persist(work);delay=undefined;}
 });
 if(delay!==undefined)await scheduleAntki(id,delay);
}
export async function editAntkiWork(id:string,text:unknown,headline:unknown,revision:unknown){
 if(typeof text!=='string'||!text.trim()||text.length>135000||text.trim().split(/\s+/).length>15000||typeof headline!=='string'||headline.length>1500)throw Error('UK text must contain 1–15,000 words and headline up to 1,500 characters.');
 key(id);const work=await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work||!['ready','failed'].includes(work.status)||!['done','deliver'].includes(work.phase))throw Error('Wait for preparation to finish before editing.');
  if(work.approval?.state==='pending')throw Error('Finish approval export before editing.');
  if(work.revision!==revision)throw Error('Another tab changed this draft. Reload before saving.');
  if(work.phase==='done'&&!work.delivered)work.delivered={headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||''};
  work.approval=undefined;work.ukText=text;work.ukHeadline=headline;work.revision++;work.phase='deliver';work.status='queued';work.error=undefined;await persist(work);return work;
 });await scheduleAntki(id);return work;
}
export async function antkiGeneratedImage(id:string){await getNativeAd(id);const work=await readAntkiWork(id);const fileId=work?.imageFileId&&work.imageDriveUrl?.includes(`/d/${work.imageFileId}/`)?work.imageFileId:work?.previousImage?.fileId;if(!fileId)throw Error('UK image is not ready yet.');const {drive}=await driveUploadTarget();const response=await drive.files.get({fileId,alt:'media',supportsAllDrives:true},{responseType:'arraybuffer',timeout:30000,retry:false});const buffer=Buffer.from(response.data as ArrayBuffer);if(buffer.length>24*1024*1024)throw Error('Image exceeds size limit.');return {buffer,...imageType(buffer)};}

export async function regenerateAntkiImage(id:string){
 key(id);const work=await withEditorLocks(['antki-work-'+id],async()=>{
  const work=await readAntkiWork(id);if(!work||work.pending||!['ready','failed'].includes(work.status)||!work.ukText)throw Error('Finish or review the previous request before generating a new photo.');
  if(work.approval?.state==='pending')throw Error('Finish approval export before generating a new photo.');
  const ad=await getNativeAd(id);if(ad.primaryText!==work.sourceText||ad.imageUrl!==work.sourceImage)throw Error('The source changed; review it first.');
  work.approval=undefined;
  if(!work.delivered&&work.phase==='done')work.delivered={headline:work.ukHeadline,text:work.ukText,imageUrl:work.imageDriveUrl||''};
  if(work.imageFileId&&work.imageDriveUrl)work.previousImage={fileId:work.imageFileId,url:work.imageDriveUrl};
  work.imageTaskId=undefined;work.imageResultUrl=undefined;work.imageFileId=undefined;work.imageReview=undefined;work.imageAttempts=0;work.polls=0;
  work.imagePrompt=antkiImagePrompt(work);work.phase='image';work.status='queued';work.error=undefined;work.revision++;await persist(work);return work;
 });await scheduleAntki(id);return work;
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
