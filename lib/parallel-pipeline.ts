import {videoLinks} from './video-links';
import {editorHooks,sendsHook} from './hook-delivery';
import {voiceLinks} from './voice-links';
import type {Job} from './jobs';
import {getJob,finalise,pythonCall} from './jobs';
import {mutate} from './store';
import {fetchAdVideo} from './fetchad';
import {safeDownload} from './safe-fetch';
import {localize,transcribeWithDuration,prepareNarration} from './localize';
import {generateVO} from './elevenlabs';
import {syncAssignedEditor} from './editor-sync';
import {appendToAdminBriefs,updateReference,updateVoiceover} from './sheets';
import {opening,hasTokens} from './validation';
import {existingMedia,putMedia} from './media';
import {randomUUID} from 'node:crypto';
export type Stage='driveUpload'|'transcribe'|'localise'|'enhanceSubmit'|'enhancePoll'|'videoSubmit'|'videoPoll'|'export'|'vo'|'references';
export type StageState={resubmitRequired?:boolean;done?:boolean;pending?:boolean;error?:string;uncertain?:boolean;attempts?:number;ms?:number;started?:number;finished?:number;nextAt?:number};
const labels:Record<Stage,string>={driveUpload:'Saving original video to Drive',transcribe:'Transcribing',localise:'Localising',enhanceSubmit:'Starting video enhancement',enhancePoll:'Enhancing video',videoSubmit:'Starting video cleanup',videoPoll:'Cleaning video',export:'Saving brief',vo:'Generating and trimming voiceover',references:'Finishing'};
export function readyStages(j:Job,now=Date.now()):Stage[]{
 if(j.abortedAt||j.cancelledAt||j.hookDeliveryPending!==undefined)return [];
 const s=j.stages||{},done=(k:Stage)=>!!s[k]?.done;
 const list:Stage[]=[];
 if(!done('transcribe'))list.push('transcribe');
 if(done('transcribe')&&!done('localise'))list.push('localise');
 if(j.video&&j.enhanceVideo&&!done('enhanceSubmit')&&(j.audioUrl||j.resolvedVideoUrl||/\.(mp4|mov|webm)(\?|#|$)/i.test(j.sourceUrl)))list.push('enhanceSubmit');
 if(j.video&&j.enhanceVideo&&done('enhanceSubmit')&&!done('enhancePoll'))list.push('enhancePoll');
 if(j.video&&j.vmakeMode!=='enhance'&&(!j.enhanceVideo||done('enhancePoll'))&&!done('videoSubmit')&&(j.audioUrl||j.resolvedVideoUrl||/\.(mp4|mov|webm)(\?|#|$)/i.test(j.sourceUrl)))list.push('videoSubmit');
 if(j.video&&(j.vmakeMode==='enhance'?done('enhancePoll'):done('videoSubmit'))&&!done('videoPoll'))list.push('videoPoll');
 if(j.videoDestination==='drive'&&!done('driveUpload')&&(j.audioUrl||j.resolvedVideoUrl))list.push('driveUpload');
 if(done('localise')&&!done('export'))list.push('export');
 if(done('localise')&&j.generateVo&&j.voApprovedRevision===(j.revision||0)&&!done('vo'))list.push('vo');
 if(done('export')&&(j.videoDestination!=='drive'||done('driveUpload'))&&(!j.video||done('videoPoll'))&&(!j.generateVo||done('vo'))&&!done('references'))list.push('references');
 return list.filter(k=>!s[k]?.error&&(s[k]?.nextAt||0)<=now);
}
export function retryParallel(j:Job){
 if(j.stages?.enhancePoll?.resubmitRequired&&!j.enhancedUrl){j.enhanceTaskId=undefined;j.enhanceSubmittedAt=undefined;j.stages.enhanceSubmit={};j.stages.enhancePoll={};}
 if(j.stages?.videoPoll?.resubmitRequired&&!j.cleanUrl&&!j.videoOutputUrl){j.taskId=undefined;j.submittedAt=undefined;j.stages.videoSubmit={};j.stages.videoPoll={};}
for(const s of Object.values(j.stages||{})){if(!s.done){s.error=undefined;s.pending=false;s.uncertain=false;s.nextAt=undefined;s.started=undefined;s.finished=undefined;}}}
export function editParallel(j:Job){j.stages={...j.stages,localise:{done:true},export:{},vo:{},references:{}};j.completedAt=undefined;}
// Shared leases bound provider activity across processes, not just within one instance.
async function acquire(id:string,token:string){return mutate<Record<string,{token:string;until:number}>,boolean>('pipeline-capacity',{},s=>{const now=Date.now();for(const k of Object.keys(s))if(s[k].until<=now)delete s[k];if(s[id]||Object.keys(s).length>=3)return false;s[id]={token,until:now+360000};return true;});}
async function release(id:string,token:string){await mutate<Record<string,{token:string;until:number}>,void>('pipeline-capacity',{},s=>{if(s[id]?.token===token)delete s[id];});}
export async function advanceParallel(id:string):Promise<number>{
 const token=randomUUID();if(!await acquire(id,token))return 10;
 let claimed=false;
 try{
  const j=await mutate<Job|null,Job>(`job-${id}`,null,s=>{
   if(!s||s.status==='Failed'||s.step==='done'||s.hookDeliveryPending!==undefined||(s.leaseUntil||0)>Date.now())throw Error('NOT_RUNNABLE');
   s.stages??={};
   for(const v of Object.values(s.stages))if(v.pending){v.error??='Previous paid request was interrupted. Check the provider before retrying.';v.uncertain=true;}
   s.lease=token;s.leaseUntil=Date.now()+360000;s.status='Running';return structuredClone(s);
  });claimed=true;
  const patch=async(fn:(s:Job)=>void)=>mutate<Job|null,void>(`job-${id}`,null,s=>{if(!s||s.lease!==token)throw Error('Lease expired');fn(s);s.updated=Date.now();});
  const runStage=async(k:Stage)=>{
   const start=Date.now();await patch(s=>{const old=s.stages![k]||{};s.stages![k]={...old,attempts:(old.attempts||0)+1,started:old.started||(k==='videoPoll'?s.submittedAt:undefined)||start};});
   const paid=()=>patch(s=>{s.stages![k]!.pending=true;});
   const save=async(fn:(s:Job)=>void)=>{
    // Keep the provider response in memory and retry its checkpoint, not its paid request.
    for(let attempt=0;;attempt++)try{return await patch(s=>{fn(s);s.stages![k]!.pending=false;});}
    catch(e){if(attempt>=1||!/Database (connection|state request)/.test((e as Error).message))throw e;await new Promise(r=>setTimeout(r,1500));}
   };
   try{
    const job=(await getJob(id))!;
    if(k==='transcribe'){
     if(!job.transcript){let file:File;
      if(job.audioUrl){const d=await safeDownload(job.audioUrl,24*1024*1024);file=new File([new Uint8Array(d.buffer)],'audio.mp3',{type:'audio/mpeg'});}
      else{const d=await fetchAdVideo(job.sourceUrl);file=d.file;await save(s=>{s.resolvedVideoUrl=d.videoUrl;});}
      await paid();const t=await transcribeWithDuration(file);await save(s=>{s.transcript=t.text;s.duration=s.duration||t.duration;});
     }
    }else if(k==='localise'){
     if(!job.result){await paid();const r=await localize(job.transcript!,job.provider,job.model,job.productContext,job.generateVo,job.singingAd,(job.productName||"MELLOW").toUpperCase(),job.ctaMode,job.generateHooks!==false);await save(s=>{s.result={...r,us_script:s.transcript!,video_url:s.resolvedVideoUrl||s.sourceUrl};if(r.no_speech){s.generateVo=false;s.voiceoverEnabled=false;s.generateHooks=false;}});}
    }else if(k==='enhanceSubmit'){
     if(!job.enhanceTaskId&&!job.enhancedUrl){await paid();const r=await pythonCall('/api/vmake_submit',{url:job.resolvedVideoUrl||job.sourceUrl,operation:'enhance'});
      if(!r.task_id&&!r.output_urls?.[0])throw Error('VMake enhancer returned no task or output');
      await save(s=>{s.enhanceTaskId=r.task_id?String(r.task_id):undefined;s.enhanceSubmittedAt=Date.now();s.enhancedUrl=r.output_urls?.[0];});
     }
    }else if(k==='enhancePoll'){
     if(!job.enhancedUrl){const r=await pythonCall(`/api/vmake_status?task_id=${encodeURIComponent(job.enhanceTaskId!)}`);
      if(r.failed){await patch(s=>{s.stages![k]!.resubmitRequired=r.resubmit_required===true;});throw Error(String(r.message||'VMake enhancement failed'));}
      if(!r.done){if(Date.now()-(job.enhanceSubmittedAt||Date.now())>3600000)throw Error('VMake enhancement still processing after one hour. Retry status without resubmitting.');await patch(s=>{s.stages![k]!.nextAt=Date.now()+20000;});return;}
      const url=r.output_urls?.[0];if(!url)throw Error('VMake enhancement completed without video');await save(s=>{s.enhancedUrl=url;});
     }
     if(job.vmakeMode==='combo'&&!job.enhancedSavedUrl){
      const enhanced=(await getJob(id))!.enhancedUrl;
      if(!enhanced)throw Error('Enhanced video missing');
      const saved=await finalise(enhanced,id+'-enhanced');
      await save(s=>{s.enhancedSavedUrl=saved;});
     }
    }else if(k==='videoSubmit'){
     if(!job.taskId&&!job.cleanUrl&&!job.videoOutputUrl){await paid();const r=await pythonCall('/api/vmake_submit',{url:job.enhanceVideo?(job.enhancedSavedUrl||job.enhancedUrl):job.resolvedVideoUrl||job.sourceUrl,operation:'remove'});
      if(!r.task_id&&!r.output_urls?.[0])throw Error('VMake returned no task or output');
      await save(s=>{s.taskId=r.task_id?String(r.task_id):undefined;s.submittedAt=Date.now();s.videoOutputUrl=r.output_urls?.[0];});
     }
    }else if(k==='videoPoll'){
     if(!job.cleanUrl){let url=job.vmakeMode==='enhance'?job.enhancedUrl:job.videoOutputUrl;
      if(!url){const r=await pythonCall(`/api/vmake_status?task_id=${encodeURIComponent(job.taskId!)}`);
       if(r.failed){await patch(s=>{s.stages![k]!.resubmitRequired=r.resubmit_required===true;});throw Error(String(r.message||'VMake failed'));}
       if(!r.done){if(Date.now()-(job.submittedAt||Date.now())>3600000)throw Error('VMake still processing after one hour. Retry status without resubmitting.');await patch(s=>{s.stages![k]!.nextAt=Date.now()+20000;});return;}
       url=r.output_urls?.[0];if(!url)throw Error('VMake completed without video');await save(s=>{s.videoOutputUrl=url;});
      }
      const clean=await finalise(url!,id);await save(s=>{s.cleanUrl=clean;});
     }
    }else if(k==='driveUpload'){
     const {saveOriginalToDrive}=await import('./drive-video');
     const url=await saveOriginalToDrive(job,async fileId=>{await save(s=>{s.driveFileId=fileId;});});
     await save(s=>{s.driveUrl=url;});
    }else if(k==='export'){
     const r=job.result!,out=await appendToAdminBriefs({jobId:id,editorId:job.editorId,editorNotes:job.editorNotes,noSpeech:r.no_speech,uk:r.uk_script,hooks:editorHooks(job),hookOg:opening(r.uk_script),desire:r.ad_desire,angle:r.ad_angle,mechanism:r.unique_mechanism,funnel:r.funnel,reference:videoLinks(job)});await save(s=>{s.adId=out.adId;});await syncAssignedEditor(out.adId);
    }else if(k==='vo'){
     const r=job.result!;if(job.voApprovedRevision!==(job.revision||0))throw Error('Review the script and click Get voiceover first');if(hasTokens(r.uk_script))throw Error('Fill in missing product details before recording narration');
     const path=`vo/${id}-r${job.revision||0}.wav`;let url=job.voUrl||await existingMedia(path)||await existingMedia(path.replace(/\.wav$/,'.mp3'));
     if(!url){let narration=r.narration;if(!narration){await paid();narration=await prepareNarration(r.uk_script,job.provider,job.model);await save(s=>{s.result!.narration=narration;});}
      await paid();const audio=await generateVO(narration,job.voiceId,async(raw,timing)=>{const original=await putMedia(`vo/${id}-r${job.revision||0}-original.mp3`,Buffer.from(raw),'audio/mpeg');await save(s=>{s.voOriginalUrl=original;s.voTiming=timing;});},job.voiceProcessing);url=await putMedia(path,Buffer.from(audio),'audio/wav');}
     await save(s=>{s.voUrl=url;s.voNeedsRegeneration=false;});if(job.adId)await updateVoiceover(job.adId,voiceLinks((await getJob(id))!));
     for(let i=0;i<Math.min(2,r.hooks.length);i++){
      const latest=(await getJob(id))!;if(latest.abortedAt)throw Error('Stopped by you');
      if(!sendsHook(latest,i)||latest.hookVoPending?.[i]||latest.hookVoUrls?.[i])continue;
      if(hasTokens(r.hooks[i]))throw Error('Replace unfinished placeholders in the hook before recording.');
      const claimedHook=await mutate<Job|null,boolean>(`job-${id}`,null,s=>{if(!s||s.lease!==token)throw Error('Lease expired');if(!sendsHook(s,i)||s.hookVoPending?.[i]||s.hookVoUrls?.[i])return false;s.hookVoPending={...s.hookVoPending,[i]:true};s.hookVoInputs={...s.hookVoInputs,[i]:{text:r.hooks[i],voiceId:job.voiceId}};return true;});
      if(!claimedHook)continue;
      const hookPath=`vo/${id}-r${job.revision||0}-hook-${i+1}.wav`;
      let hookUrl=await existingMedia(hookPath)||await existingMedia(hookPath.replace(/\.wav$/,'.mp3'));
      if(!hookUrl){await paid();const audio=await generateVO(await prepareNarration(r.hooks[i],job.provider,job.model),job.voiceId,async(raw,timing)=>{const original=await putMedia(`vo/${id}-r${job.revision||0}-hook-${i+1}-original.mp3`,Buffer.from(raw),'audio/mpeg');await save(s=>{s.hookVoOriginalUrls={...s.hookVoOriginalUrls,[i]:original};s.hookVoTimings={...s.hookVoTimings,[i]:timing};});},job.voiceProcessing,'hook');hookUrl=await putMedia(hookPath,Buffer.from(audio),'audio/wav');}
      await save(s=>{s.hookVoUrls={...s.hookVoUrls,[i]:hookUrl!};s.hookVoPending={...s.hookVoPending,[i]:false};s.hookVoNeedsRegeneration={...s.hookVoNeedsRegeneration,[i]:false};});
      if(job.adId)await updateVoiceover(job.adId,voiceLinks((await getJob(id))!));
     }
     const completed=(await getJob(id))!;if(r.hooks.slice(0,2).some((_,i)=>sendsHook(completed,i)&&(completed.hookVoPending?.[i]||!completed.hookVoUrls?.[i]))){await patch(s=>{s.stages![k]!.nextAt=Date.now()+5000;});return;}
    }else if(k==='references'){await updateReference(job.adId!,videoLinks(job),voiceLinks(job));await syncAssignedEditor(job.adId!);}
    await patch(s=>{s.stages![k]!.done=true;s.stages![k]!.pending=false;s.stages![k]!.finished=Date.now();s.stages![k]!.nextAt=undefined;});
   }catch(e){await patch(s=>{const stage=s.stages![k]!;stage.finished=Date.now();
    const safe=(e as Error&{safeToRetry?:boolean}).safeToRetry===true;
    if(safe)stage.pending=false;
    stage.uncertain=!!stage.pending;
    if(safe&&(k==='enhanceSubmit'||k==='videoSubmit')&&(stage.attempts||0)<3){stage.nextAt=Date.now()+30000;stage.error=undefined;}
    else stage.error=(e as Error).message;
   });}
   finally{await patch(s=>{s.stages![k]!.ms=(s.stages![k]!.ms||0)+Date.now()-start;});}
  };
  const stages=readyStages(j);await patch(s=>{s.progress=stages.map(k=>labels[k]).join(' · ')||'Waiting for video';});
  const outcomes=await Promise.allSettled(stages.map(runStage));
  const rejected=outcomes.find(r=>r.status==='rejected');if(rejected?.status==='rejected')throw rejected.reason;
  await patch(s=>{const failures=Object.entries(s.stages!).filter(([,v])=>v.error);s.uncertain=failures.some(([,v])=>v.uncertain);s.error=failures.map(([k,v])=>`${labels[k as Stage]}: ${v.error}`).join(' ')||undefined;
   const independentWork=!!(s.video&&((s.stages!.videoSubmit?.done&&!s.stages!.videoPoll?.done&&!s.stages!.videoPoll?.error)||(s.enhanceVideo&&s.stages!.enhanceSubmit?.done&&!s.stages!.enhancePoll?.done&&!s.stages!.enhancePoll?.error)));
   s.status=s.stages!.references?.done?'Complete':failures.length&&!independentWork&&!readyStages(s).length?'Failed':'Queued';
   if(s.stages!.references?.done){s.step='done';s.completedAt=Date.now();s.progress='Complete';}
   s.lease=undefined;s.leaseUntil=undefined;
  });claimed=false;
  const latest=(await getJob(id))!;return readyStages(latest).length?0:20;
 }catch(e){if((e as Error).message==='NOT_RUNNABLE')return 10;throw e;}
 finally{
  // On unexpected persistence failure retain stage pending flags to prevent blind paid retries.
  try{if(claimed)await mutate<Job|null,void>(`job-${id}`,null,s=>{if(s?.lease===token){s.lease=undefined;s.leaseUntil=undefined;}});}finally{await release(id,token);}
 }
}
