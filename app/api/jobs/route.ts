import {accountRoute} from '@/lib/account-route';
import {currentWorkspace,inWorkspace} from '@/lib/account-context';
import {stateVersion,mutate} from '@/lib/store';
import {voiceApprovalPending} from '@/lib/voice-approval';
import {parseMarket,matchesMarket} from '@/lib/market';
import {after} from 'next/server';
import {cancelJob,abortJob,requestVoiceover,createJob,getJob,jobs,jobsPage,editJob,retryJob,scheduleJob,stripPlaceholderTokens,type Job} from '@/lib/jobs';
import {claimFile,releaseFile,DuplicateFileError} from '@/lib/file-dedup';
import {prepareNarration} from '@/lib/localize';
import {generateVO} from '@/lib/elevenlabs';
import {putMedia,existingMedia} from '@/lib/media';
import {sendsHook} from '@/lib/hook-delivery';
import {updateVoiceover} from '@/lib/sheets';
import {voiceLinks} from '@/lib/voice-links';
import {syncAssignedEditor} from '@/lib/editor-sync';
export const maxDuration=300;

async function runDirectVoiceover(id:string,targetRevision:number){
 try{
  const job=await getJob(id);
  if(!job?.result||job.abortedAt||job.cancelledAt||job.voApprovedRevision!==targetRevision)return;
  if(job.voUrl&&job.stages?.vo?.done)return;
  await mutate<Job|null,void>(`job-${id}`,null,s=>{
   if(!s)return;
   s.stages??={};
   s.stages.vo={...(s.stages.vo||{}),started:s.stages.vo?.started||Date.now(),pending:true,error:undefined,done:false};
   s.status='Running';
   s.updated=Date.now();
  });
  const current=(await getJob(id))!;
  const r=current.result!;
  const cleanScript=stripPlaceholderTokens(r.uk_script);
  const path=`vo/${id}-r${targetRevision}.wav`;
  let url=current.voUrl||await existingMedia(path)||await existingMedia(path.replace(/\.wav$/,'.mp3'));
  if(!url&&current.dualVoice){
   const {generateDualVoice}=await import('@/lib/generate-dual-voice');
   url=await generateDualVoice(current,async()=>{},async fn=>{await mutate<Job|null,void>(`job-${id}`,null,s=>{if(s){fn(s);s.updated=Date.now();}});});
  }
  if(!url){
   const narration=await prepareNarration(cleanScript,current.provider,current.model,current.market);
   const audio=await generateVO(
    narration,
    current.voiceId,
    async(raw,timing)=>{
     const original=await putMedia(`vo/${id}-r${targetRevision}-original.mp3`,Buffer.from(raw),'audio/mpeg');
     await mutate<Job|null,void>(`job-${id}`,null,s=>{if(s){s.voOriginalUrl=original;s.voTiming=timing;s.updated=Date.now();}});
    },
    current.voiceProcessing,
    'voiceover',
    current.market,
    current.voPace
   );
   url=await putMedia(path,Buffer.from(audio),'audio/wav');
  }
  await mutate<Job|null,void>(`job-${id}`,null,s=>{
   if(!s)return;
   s.voUrl=url;
   s.voNeedsRegeneration=false;
   if(s.result)s.result.narration=cleanScript;
   s.updated=Date.now();
  });
  for(let i=0;i<Math.min(2,r.hooks.length);i++){
   const latest=(await getJob(id))!;
   if(latest.abortedAt||latest.cancelledAt)return;
   if(!sendsHook(latest,i)||latest.hookVoUrls?.[i])continue;
   const hookText=stripPlaceholderTokens(r.hooks[i]||'');
   if(!hookText)continue;
   await mutate<Job|null,void>(`job-${id}`,null,s=>{
    if(!s)return;
    s.hookVoPending={...s.hookVoPending,[i]:true};
    s.hookVoInputs={...s.hookVoInputs,[i]:{text:hookText,voiceId:current.voiceId}};
   });
   const hookPath=`vo/${id}-r${targetRevision}-hook-${i+1}.wav`;
   let hookUrl=await existingMedia(hookPath)||await existingMedia(hookPath.replace(/\.wav$/,'.mp3'));
   if(!hookUrl){
    const hookNarration=await prepareNarration(hookText,current.provider,current.model,current.market);
    const audio=await generateVO(
     hookNarration,
     current.voiceId,
     async(raw,timing)=>{
      const original=await putMedia(`vo/${id}-r${targetRevision}-hook-${i+1}-original.mp3`,Buffer.from(raw),'audio/mpeg');
      await mutate<Job|null,void>(`job-${id}`,null,s=>{if(s){s.hookVoOriginalUrls={...s.hookVoOriginalUrls,[i]:original};s.hookVoTimings={...s.hookVoTimings,[i]:timing};s.updated=Date.now();}});
     },
     current.voiceProcessing,
     'hook',
     current.market
    );
    hookUrl=await putMedia(hookPath,Buffer.from(audio),'audio/wav');
   }
   await mutate<Job|null,void>(`job-${id}`,null,s=>{
    if(!s)return;
    s.hookVoUrls={...s.hookVoUrls,[i]:hookUrl!};
    s.hookVoPending={...s.hookVoPending,[i]:false};
    s.hookVoNeedsRegeneration={...s.hookVoNeedsRegeneration,[i]:false};
    s.updated=Date.now();
   });
  }
  await mutate<Job|null,void>(`job-${id}`,null,s=>{
   if(!s)return;
   s.stages??={};
   s.stages.vo={...(s.stages.vo||{}),done:true,pending:false,error:undefined,finished:Date.now()};
   const videoDone=!s.video||!!s.cleanUrl||!!s.stages.videoPoll?.done||!!s.stages.cleanFirst?.done;
   const driveDone=s.videoDestination!=='drive'||!!s.driveUrl||!!s.stages.driveUpload?.done;
   if(videoDone&&driveDone&&s.adId){
    s.stages.references={done:true,finished:Date.now()};
    s.step='done';
    s.status=s.result?.data_gaps?.length?'Draft saved — product details needed':'Complete';
    s.completedAt=Date.now();
   }
   s.updated=Date.now();
  });
  const finished=await getJob(id);
  if(finished?.adId){
   await updateVoiceover(finished.adId,voiceLinks(finished)).catch(()=>{});
   await syncAssignedEditor(finished.adId).catch(()=>{});
  }
 }catch(e){
  const msg=e instanceof Error?e.message:'Voiceover generation failed';
  await mutate<Job|null,void>(`job-${id}`,null,s=>{
   if(!s)return;
   s.stages??={};
   s.stages.vo={...(s.stages.vo||{}),pending:false,done:false,error:msg};
   s.error=msg;
   s.updated=Date.now();
  }).catch(()=>{});
 }
}

async function accountGET(req:Request){try{
 const params=new URL(req.url).searchParams,id=params.get('id'),market=params.has('market')?parseMarket(params.get('market')):undefined;
 if(!id&&params.get('summary')==='1'){
  const page=await jobsPage(Number(params.get('offset')||0)),filtered=market?page.jobs.filter(j=>matchesMarket(j,market)):page.jobs;
  const summaries=filtered.map(j=>{const{id,name,adId,status,progress,step,market,created,updated,cancelledAt,cancelCleanup,error,scriptDuplicate}=j;return {id,name,adId,status,progress,step,market,created,updated,cancelledAt,cancelCleanup,error,scriptDuplicate,voiceReviewRequired:j.step==='done'&&voiceApprovalPending(j)};});
  return Response.json({...page,jobs:summaries},{headers:{'Cache-Control':'no-store'}});
 }
 let etag:string|undefined;if(id){if(!/^[\w-]{8,100}$/.test(id))throw Error('Invalid job ID');const current=await getJob(id);if(current?.stages?.export?.error&&/permission/i.test(current.stages.export.error)&&current.adId){await mutate<Job|null,void>('job-'+id,null,s=>{if(!s?.stages?.export)return;s.stages.export.error=undefined;s.stages.export.done=true;s.stages.export.pending=false;s.stages.export.finished=Date.now();if(s.error&&/permission/i.test(s.error)){s.error=undefined;if(s.status==='Failed')s.status=s.step==='done'?'Complete':'Running';}}).catch(()=>{});await scheduleJob(id).catch(()=>{});}const version=await stateVersion('job-'+id);if(version){etag='\"'+id+'-'+version+'\"';if(req.headers.get('if-none-match')===etag)return new Response(null,{status:304,headers:{ETag:etag,'Cache-Control':'private, no-cache'}});}}
 const job=id?await getJob(id):null,list=id?(job?[job]:[]):await jobs(),filtered=market?list.filter(j=>matchesMarket(j,market)):list;
 return Response.json({jobs:filtered.map(({productContext,history,transcript,...visible})=>visible)},{headers:{'Cache-Control':'private, no-cache',...(etag?{ETag:etag}:{})}});
}catch(e){return Response.json({error:(e as Error).message},{status:500});}}

async function accountPOST(req:Request){let hash:string|undefined,id:string|undefined;try{const b=await req.json();
 if(b.action==='cancel'){const job=await cancelJob(b.id);return Response.json({job,...(job.cancelCleanup?.status==='failed'?{error:job.cancelCleanup.error}:{})},{status:job.cancelCleanup?.status==='failed'?503:200});}
 if(b.action==='abort')return Response.json({job:await abortJob(b.id)});
 if(!b.action&&b.sourceHash){hash=b.sourceHash;id=b.id;await claimFile(b.sourceHash,b.id,parseMarket(b.market),true);}
 const isVo=b.action==='voiceover'||b.action==='regenerate-voiceover';
 const job=isVo?await requestVoiceover(b.id,b.script,b.hooks,b.voiceId,b.action==='regenerate-voiceover'?(typeof b.revision==='number'?b.revision:-1):undefined,b.voiceProcessing,b.dualVoice,true):b.action==='retry'?await retryJob(b.id,!!b.confirmUncertain):b.action==='edit'?await editJob(b.id,b.script,b.hooks,b.dualVoice):await createJob(b);
 if(!job.cancelledAt&&!job.abortedAt){
  if(isVo){
   const workspace=currentWorkspace();
   const rev=job.revision||0;
   after(async()=>{await inWorkspace(workspace,()=>runDirectVoiceover(job.id,rev));});
  }
  await scheduleJob(job.id).catch(()=>{});
 }
 return Response.json({job});
 }catch(e){if(e instanceof DuplicateFileError)return Response.json({duplicate:e.duplicate},{status:409});if(hash&&id)await releaseFile(hash,id).catch(()=>{});return Response.json({error:(e as Error).message},{status:400});}}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
