import {randomUUID} from 'node:crypto';
import {send} from './account-queue';
import {getJob,type Job} from './jobs';
import {mutate} from './store';
import {deliveryVersion} from './editor-checklist';
import {forceFinishJob} from './force-finish';
import {verifyEditorDelivery,syncAssignedEditor} from './editor-sync';
import {appendToAdminBriefs,updateReference,updateVoiceover} from './sheets';
import {editorHooks} from './hook-delivery';
import {videoLinks} from './video-links';
import {voiceLinks} from './voice-links';
import {opening,validateResult} from './validation';
type Receipt=Awaited<ReturnType<typeof verifyEditorDelivery>>&{forced?:boolean};
export type Publication={token:string;status:'queued'|'processing'|'complete'|'blocked';requestedAt:number;attempts:number;script:string;hooks:string[];dualVoice?:unknown;force:boolean;version:string;error?:string;receipt?:Receipt};
async function enqueue(id:string,token:string,delaySeconds=0){await send('szekspir-editor-sync',{kind:'publish',id,token},{region:'fra1',retentionSeconds:86400,delaySeconds,idempotencyKey:`publish-${token}-${delaySeconds?Math.floor(Date.now()/1000):'start'}`});}
export async function requestPublication(id:string,script:string,hooks:string[],force:boolean,dualVoice?:unknown){
 const p=await mutate<Job|null,Publication>('job-'+id,null,j=>{
  if(!j?.result||!j.adId||j.cancelledAt||j.abortedAt)throw Error('Save an active brief before publishing.');
  validateResult({...j.result,uk_script:script,hooks,narration:j.result.narration||script});
  if(j.publication&&['queued','processing'].includes(j.publication.status))return j.publication;
  const value:Publication={token:randomUUID(),status:'queued',requestedAt:Date.now(),attempts:0,script,hooks,dualVoice,force,version:deliveryVersion(j)};
  j.publication=value;return value;
 });
 await enqueue(id,p.token);return {queued:true,publication:p};
}
export async function consumePublication(id:string,token:string){
 const job=await getJob(id),p=job?.publication;
 if(!job||!p||p.token!==token||!['queued','processing'].includes(p.status))return;
 if((job.leaseUntil||0)>Date.now()){
  if(Date.now()-p.requestedAt>20*60000){await set(id,token,{status:'blocked',error:'Processing has not released this job. Please review and publish again.'});return;}
  await enqueue(id,token,60);return;
 }
 await set(id,token,{status:'processing',attempts:p.attempts+1,error:undefined});
 try{
  const receipt=await forceFinishJob(id,p.script,p.hooks,async saved=>{
   await set(id,token,{version:deliveryVersion(saved)});
   // A ready sheet needs no export, allocation rewrite or workspace sync.
   let result=await verifyEditorDelivery(saved,false);
   if(!result.ok){
    const r=saved.result!;
    await appendToAdminBriefs({mediaType:saved.nativeAdId?'image':'video',jobId:id,editorId:saved.editorId,sheetProduct:saved.sheetProduct,uk:r.uk_script,hooks:editorHooks(saved),hookOg:opening(r.uk_script),desire:r.ad_desire,angle:r.ad_angle,mechanism:r.unique_mechanism,funnel:r.funnel,reference:videoLinks(saved)});
    if(videoLinks(saved))await updateReference(saved.adId!,videoLinks(saved));
    if(voiceLinks(saved))await updateVoiceover(saved.adId!,voiceLinks(saved));
    await syncAssignedEditor(saved.adId!);
    result=await verifyEditorDelivery(saved,false);
   }
   if(!p.force&&!result.ok){await set(id,token,{status:'blocked',receipt:result,error:'Some materials are missing. Check the delivery checklist.'});const e=Error('Publication incomplete');e.name='PublicationIncomplete';throw e;}
   return {...result,forced:p.force};
  },p.dualVoice,{normal:!p.force,expectedVersion:p.version});
  await set(id,token,{status:'complete',receipt});
 }catch(error){
  if((error as Error).name==='PublicationIncomplete')return;
  const message=(error as Error).message;
  const retryable=/EditorSyncBusyError/.test((error as Error).name)||/Database|database|timeout|timed out|sync is|sync.*finishing|429|quota|current recording|current step/i.test(message);
  if(retryable&&p.attempts<7){await set(id,token,{status:'queued',error:message});await enqueue(id,token,Math.min(300,30*2**Math.min(p.attempts,3)));return;}
  await set(id,token,{status:'blocked',error:message});
 }
}
async function set(id:string,token:string,patch:Partial<Publication>){await mutate<Job|null,void>('job-'+id,null,j=>{if(j?.publication?.token===token&&j.publication.status!=='complete')Object.assign(j.publication,patch);});}
