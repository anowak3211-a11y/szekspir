import {accountRoute} from '@/lib/account-route';
import {useOriginalVoiceover,OriginalVoiceoverSaveError,type OriginalVoiceoverJob} from '@/lib/use-original-voiceover';
export const maxDuration=300;
async function accountPOST(req:Request){
 const origin=req.headers.get('origin');
 if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'Use this action from the Szekspir page.'},{status:403});
 const input=await req.json();
 if(input.forceUnlock&&typeof input.id==='string'){
  const {mutate}=await import('@/lib/store');
  const unlocked=await mutate<OriginalVoiceoverJob|null,OriginalVoiceoverJob|null>(`job-${input.id}`,null,s=>{
   if(!s)return null;
   s.lease=undefined;
   s.leaseUntil=undefined;
   s.hookVoPending=undefined;
   s.hookDeliveryPending=undefined;
   delete (s as OriginalVoiceoverJob&{hookTextDelivery?:unknown}).hookTextDelivery;
   s.originalVoiceoverDelivery=undefined;
   if(s.stages?.vo){s.stages.vo.pending=false;s.stages.vo.uncertain=false;s.stages.vo.done=true;}
   s.updated=Date.now();
   return s;
  }).catch(()=>null);
  if(unlocked)input.revision=unlocked.revision||0;
 }
 try{
  const job=await useOriginalVoiceover({id:input.id,revision:input.revision,factor:input.factor,adjustments:input.adjustments});
  return Response.json({job});
 }catch(error){
  if(input.forceUnlock&&typeof input.id==='string'){
   try{
    const {getJob}=await import('@/lib/jobs');
    const {mutate}=await import('@/lib/store');
    const {safeDownload}=await import('@/lib/safe-fetch');
    const {cleanVoiceover}=await import('@/lib/vo-cleanup');
    const {slightlyFasterVoice}=await import('@/lib/slightly-faster-voice');
    const {putMedia}=await import('@/lib/media');
    const {updateVoiceover}=await import('@/lib/sheets');
    const {voiceLinks}=await import('@/lib/voice-links');
    const {syncAssignedEditor}=await import('@/lib/editor-sync');
    const {randomUUID}=await import('node:crypto');
    const current=await getJob(input.id);
    const origUrl=current?.voOriginalUrl||current?.previousVo?.originalUrl;
    if(current?.result&&origUrl){
     const raw=(await safeDownload(origUrl,150*1024*1024)).buffer;
     const processing={...current.voiceProcessing,mode:'gentle' as const,normalize:false,breaths:false,matchSourcePace:false,pauseShorteningMs:input.adjustments?.pauseShorteningMs??0,tempoFactor:input.adjustments?.tempoFactor??1};
     let timing:import('@/lib/vo-cleanup').VoiceTiming|undefined;
     let audio=await cleanVoiceover(new Uint8Array(raw).buffer,t=>{timing=t;},processing,'voiceover');
     if(!timing)throw error;
     if(input.factor===1.05)audio=await slightlyFasterVoice(audio,timing,1.05);
     const url=await putMedia(`vo/${input.id}-r${current.revision||0}-native-${randomUUID()}.wav`,Buffer.from(audio),'audio/wav');
     const saved=await mutate<OriginalVoiceoverJob|null,OriginalVoiceoverJob|null>(`job-${input.id}`,null,s=>{
      if(!s)return null;
      s.voUrl=url;
      s.voTiming=timing;
      s.voiceProcessing=processing;
      s.voNeedsRegeneration=false;
      s.originalVoiceoverDelivery=undefined;
      s.lease=undefined;
      s.leaseUntil=undefined;
      s.updated=Date.now();
      return s;
     });
     if(saved?.adId){
      await updateVoiceover(saved.adId,voiceLinks(saved)).catch(()=>{});
      await syncAssignedEditor(saved.adId).catch(()=>{});
     }
     if(saved)return Response.json({job:saved});
    }
   }catch{}
  }
  if(error instanceof OriginalVoiceoverSaveError)return Response.json({error:error.message,job:error.job},{status:error.status});
  return Response.json({error:error instanceof Error?error.message:'Could not use the saved original recording.'},{status:409});
 }
}

export const POST=accountRoute(accountPOST);
