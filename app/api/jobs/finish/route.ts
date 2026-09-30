import {forceFinishJob} from '@/lib/force-finish';
import {videoLinks} from '@/lib/video-links';
import {editorHooks,sendsHook} from '@/lib/hook-delivery';
import {after} from 'next/server';
import {editJob,getJob,workQueue} from '@/lib/jobs';
import {appendToAdminBriefs,updateVoiceover,updateReference} from '@/lib/sheets';
import {voiceLinks} from '@/lib/voice-links';
import {opening} from '@/lib/validation';
import {verifyEditorDelivery} from '@/lib/editor-sync';
export const maxDuration=300;
export async function POST(request:Request){
 try{
  const {id,script,hooks,force,dualVoice}=await request.json();let job=await getJob(id);if(!job?.result||!job.adId)throw Error('Wait for the brief to be saved before finishing.');
  if(force===true){
   const receipt=await forceFinishJob(id,script,hooks,async saved=>{
    const r=saved.result!;
    await appendToAdminBriefs({jobId:id,editorId:saved.editorId,uk:r.uk_script,hooks:editorHooks(saved),hookOg:opening(r.uk_script),desire:r.ad_desire,angle:r.ad_angle,mechanism:r.unique_mechanism,funnel:r.funnel,reference:videoLinks(saved)});
    if(videoLinks(saved))await updateReference(saved.adId!,videoLinks(saved));
    await updateVoiceover(saved.adId!,voiceLinks(saved));
    return verifyEditorDelivery(saved);
   },dualVoice);
   return Response.json({...receipt as object,forced:true});
  }
  if(Object.entries(job.hookVoPending||{}).some(([i,pending])=>pending&&sendsHook(job!,Number(i)))||job.generateVo&&!job.stages?.vo?.done&&!job.stages?.vo?.error){return Response.json({...await verifyEditorDelivery(job),ok:false});}
  job=await editJob(id,script,hooks,dualVoice);after(workQueue);
  const r=job.result!;
  await appendToAdminBriefs({jobId:id,editorId:job.editorId,uk:r.uk_script,hooks:editorHooks(job),hookOg:opening(r.uk_script),desire:r.ad_desire,angle:r.ad_angle,mechanism:r.unique_mechanism,funnel:r.funnel,reference:videoLinks(job)});
  if(videoLinks(job))await updateReference(job.adId!,videoLinks(job));
  await updateVoiceover(job.adId!,voiceLinks(job));
  return Response.json(await verifyEditorDelivery(job));
 }catch(error){return Response.json({error:(error as Error).message},{status:400});}
}
