import {sourcePace,type SourcePace} from './source-pace';
import {parseMarket} from './market';
import {editorHooks,sendsHook} from './hook-delivery';
import {parseCtaMode,type CtaMode} from './cta-mode';
import {voiceProcessing,type VoiceProcessing} from './voice-processing';
import {advanceParallel,retryParallel,editParallel} from './parallel-pipeline';
import type {Stage,StageState} from './parallel-pipeline';
import {readState,writeState,mutate} from './store';
import {localize,transcribeWithDuration,Provider,prepareNarration} from './localize';
import {validateResult,opening,hasTokens,LocalizeResult} from './validation';
import {getProducts} from './products';
import {fetchAdVideo} from './fetchad';
import {safeDownload} from './safe-fetch';
import {EDITOR_WORKSPACES} from './editor-workspaces';
import {syncAssignedEditor} from './editor-sync';
import {appendToAdminBriefs,updateReference} from './sheets';
import {generateVO} from './elevenlabs';
import {existingMedia,putMedia} from './media';
import {randomUUID} from 'node:crypto';
export type Job={voPace?:SourcePace;market?:import('./market').Market;hooksToEditor?:Record<number,boolean>;hookDeliveryPending?:number;generateHooks?:boolean;ctaMode?:CtaMode;editorNotes?:string;voiceProcessing?:VoiceProcessing;vmakeMode?:'enhance'|'remove'|'both'|'combo';enhancedSavedUrl?:string;singingAd?:boolean;cancelledAt?:number;hookVoNeedsRegeneration?:Record<number,boolean>;hookVoInputs?:Record<number,{text:string;voiceId:string}>;voNeedsRegeneration?:boolean;editorId?:string;videoDestination?:'vmake'|'drive'|'none';driveUrl?:string;driveFileId?:string;voRegeneratedFrom?:number;previousVo?:{url:string;originalUrl?:string;hooks?:Record<number,string>;revision:number};enhanceVideo?:boolean;enhanceTaskId?:string;enhanceSubmittedAt?:number;enhancedUrl?:string;voiceoverEnabled?:boolean;voOriginalUrl?:string;voTiming?:import("./vo-cleanup").VoiceTiming;hookVoOriginalUrls?:Record<number,string>;hookVoTimings?:Record<number,import("./vo-cleanup").VoiceTiming>;abortedAt?:number;hookVoUrls?:Record<number,string>;hookVoPending?:Record<number,boolean>;voApprovedRevision?:number;startedAt?:number;engine?:number;stages?:Partial<Record<Stage,StageState>>;resolvedVideoUrl?:string;videoOutputUrl?:string;completedAt?:number;transcript?:string;progress?:string;id:string;name:string;sourceUrl:string;audioUrl?:string;video:boolean;provider:Provider;model:string;productName:string;productVersion:string;productContext:string;voiceId:string;generateVo:boolean;duration?:number;status:string;step:'localise'|'export'|'vo'|'submit'|'poll'|'references'|'done';updated:number;created:number;leaseUntil?:number;lease?:string;error?:string;uncertain?:boolean;result?:LocalizeResult&{us_script:string;video_url?:string};adId?:string;voUrl?:string;cleanUrl?:string;taskId?:string;submittedAt?:number;pendingStep?:string;revision?:number;history?:{at:number;script:string;promptVersion?:string}[]};
type Index={ids:string[]};
export async function getJob(id:string){if(!/^[\w-]{8,100}$/.test(id))throw new Error('Invalid job ID');return (await readState<Job|null>(`job-${id}`,null)).value;}
export async function jobs(){const index=(await readState<Index>('jobs',{ids:[]})).value;return (await Promise.all(index.ids.slice().reverse().map(getJob))).filter((j):j is Job=>!!j);}
export async function createJob(input:Partial<Job>){
 const market=parseMarket(input.market);
 if(market==='pl'&&input.singingAd)throw Error('Polish localisation does not support singing ads yet.');
 const ctaMode=parseCtaMode(input.ctaMode);
 const text=typeof input.transcript==='string'?input.transcript.trim():'';
 if(!input.id||(!input.sourceUrl&&!text))throw new Error('Job ID and source required');
 if(text.length>100000)throw new Error('Script is too long');
 if(input.vmakeMode&&!['enhance','remove','both','combo'].includes(input.vmakeMode))throw Error('Invalid VMake mode');
 if(input.videoDestination&&!['vmake','drive','none'].includes(input.videoDestination))throw Error('Invalid video destination');
 if(input.editorId!==undefined&&!EDITOR_WORKSPACES.some(e=>e.id===input.editorId))throw Error('Unknown editor');
 const old=await getJob(input.id);if(old&&parseMarket(old.market)!==market)throw Error('Job already exists for a different market.');if(old){await register(old.id);return old;}
 if(input.voiceoverEnabled!==false&&(typeof input.voiceId!=='string'||!input.voiceId.trim()))throw new Error('ElevenLabs voice is required before starting production');
 if(!['anthropic','openai','custom'].includes(input.provider||''))throw new Error('Invalid provider');
 
 if(input.sourceUrl)new URL(input.sourceUrl);
 const product=input.productName?(await getProducts()).find(p=>p.name===input.productName):undefined;
 if(input.productName&&!product)throw new Error('Product not found');
 const context=product?.markdown||'';
 const startedAt=typeof input.startedAt==='number'&&Number.isFinite(input.startedAt)&&input.startedAt>0&&input.startedAt<=Date.now()?input.startedAt:undefined;
 const destination=text||input.video===false?'none':input.videoDestination||'drive';
 if(destination==='drive')await (await import('./drive-video')).driveUploadTarget();
 const job:Job={market,generateHooks:input.generateHooks!==false,ctaMode:input.singingAd===true?'original':ctaMode,editorNotes:typeof input.editorNotes==='string'?input.editorNotes.trim().slice(0,5000):'',singingAd:input.singingAd===true,editorId:input.editorId||'mine',videoDestination:destination,startedAt,engine:text||input.video!==false?2:process.env.PIPELINE_V2==='0'?undefined:2,vmakeMode:input.vmakeMode||'both',enhanceVideo:destination==='vmake'&&input.vmakeMode!=='remove',id:input.id,name:String(input.name||'Ad').slice(0,200),sourceUrl:input.sourceUrl||'',transcript:text||undefined,stages:text?{transcribe:{done:true}}:undefined,audioUrl:input.audioUrl,video:destination==='vmake',voiceoverEnabled:input.voiceoverEnabled!==false,provider:input.provider as Provider,model:String(input.model||''),productName:input.productName||(market==='pl'?'Orthomax StepMax':''),productContext:context,productVersion:(product as {version?:string})?.version||(market==='pl'?'orthomax-base-v1':''),voiceId:input.voiceId||'',generateVo:false,duration:input.duration,status:'Queued',step:'localise',created:Date.now(),updated:Date.now()};
 try{await writeState(`job-${job.id}`,job);}catch(e){if(!/AlreadyExists|Precondition/.test((e as Error).name)&&!/already exists/i.test((e as Error).message))throw e;}
 await register(job.id);return (await getJob(job.id))!;
}
async function register(id:string){await mutate<Index,void>('jobs',{ids:[]},s=>{if(!s.ids.includes(id))s.ids.push(id);});}
export async function retryJob(id:string,confirmUncertain=false){
 if(!/^[\w-]{8,100}$/.test(id))throw new Error('Invalid job ID');
 return mutate<Job|null,Job>(`job-${id}`,null,s=>{if(!s)throw new Error('Job not found');if(s.abortedAt)throw Error('This job was stopped');if(s.leaseUntil&&s.leaseUntil>Date.now())throw new Error('Job still running');if(s.uncertain&&!confirmUncertain)throw new Error('The provider may have accepted the previous paid request. Confirm before retrying it.');if(s.engine===2)retryParallel(s);s.status='Queued';s.error=undefined;s.uncertain=false;s.pendingStep=undefined;s.updated=Date.now();return s;});
}
export async function editJob(id:string,script:string,hooks:string[]){
 if(!/^[\w-]{8,100}$/.test(id))throw new Error('Invalid job ID');
 const prior=await getJob(id);let recovered:string|undefined;
 if(prior&&!prior.voUrl&&prior.history?.length&&!(prior.leaseUntil&&prior.leaseUntil>Date.now())){
  for(let revision=prior.revision||0;revision>=Math.max(0,(prior.revision||0)-30);revision--){recovered=await existingMedia(`vo/${id}-r${revision}.wav`)||await existingMedia(`vo/${id}-r${revision}.mp3`);if(recovered)break;}
 }
 return mutate<Job|null,Job>(`job-${id}`,null,s=>{
  if(s?.hookDeliveryPending!==undefined)throw Error('Finish saving the hook delivery selection first.');if(s?.abortedAt)throw Error('This job was stopped');if(!s?.result)throw new Error('No result yet');if(s.leaseUntil&&s.leaseUntil>Date.now())throw new Error('Wait for the current step to finish');
  const validated=validateResult({...s.result,uk_script:script,hooks,narration:s.result.narration||script,data_gaps:hasTokens(script)?s.result.data_gaps:[]});
  if(!s.voUrl&&recovered&&s.revision===prior?.revision){s.voUrl=recovered;s.voNeedsRegeneration=s.history?.at(-1)?.script.trim()!==s.result.uk_script.trim();}
  for(const i of [0,1,2])if(hooks[i]!==s.result.hooks[i]&&s.hookVoUrls?.[i])s.hookVoNeedsRegeneration={...s.hookVoNeedsRegeneration,[i]:true};
  const scriptChanged=script.trim()!==s.result.uk_script.trim();
  s.history=[...(s.history||[]),{at:Date.now(),script:s.result.uk_script,promptVersion:s.result.prompt_version}].slice(-30);
  s.result={...s.result,...validated,hook_og:opening(script)};s.result.narration='';s.revision=(s.revision||0)+1;
  if(s.engine===2)editParallel(s);s.generateVo=false;s.voApprovedRevision=undefined;s.voNeedsRegeneration=!!s.voUrl&&(scriptChanged||!!s.voNeedsRegeneration);s.status='Queued';s.step='export';s.error=undefined;s.updated=Date.now();return s;
 });
}
export async function pythonCall(path:string,body?:unknown){
 const origin=process.env.APP_ORIGIN||(process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:'http://localhost:3000');
 const r=await fetch(origin+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:`Basic ${Buffer.from(':'+process.env.APP_PASSWORD).toString('base64')}`},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(240000)});
 if(!r.headers.get('content-type')?.includes('application/json'))throw new Error(`VMake endpoint HTTP ${r.status}: non-JSON response`);
 const data=await r.json();if(!r.ok||data.error){const error=Object.assign(new Error(data.error||`VMake HTTP ${r.status}`),{safeToRetry:data.safe_to_retry===true});throw error;}return data;
}
export async function advance(id:string){
 if((await getJob(id))?.engine===2){await advanceParallel(id);return;}
 const token=randomUUID();let job:Job;
 try{job=await mutate<Job|null,Job>(`job-${id}`,null,s=>{
  if(!s||s.hookDeliveryPending!==undefined||s.step==='done'||s.status==='Failed'||(s.leaseUntil||0)>Date.now())throw new Error('NOT_RUNNABLE');
  if(s.pendingStep){s.status='Failed';s.error='Previous request was interrupted. Check the provider before retrying a potentially paid step.';s.uncertain=true;return s;}
  s.lease=token;s.leaseUntil=Date.now()+360000;s.status='Running';return structuredClone(s);
 });}catch(e){if((e as Error).message==='NOT_RUNNABLE')return;throw e;}
 if(job.uncertain)return;
 const commit=async()=>{await mutate<Job|null,void>(`job-${id}`,null,s=>{if(!s||s.lease!==token)throw new Error('Lease expired');Object.assign(s,job,{updated:Date.now(),lease:undefined,leaseUntil:undefined,pendingStep:undefined});});};
 const beforePaid=async()=>{await mutate<Job|null,void>(`job-${id}`,null,s=>{if(!s||s.lease!==token)throw new Error('Lease expired');s.pendingStep=job.step;});};
 try{
  if(job.step==='localise'){
   const checkpoint=async(progress:string)=>{job.progress=progress;await mutate<Job|null,void>(`job-${id}`,null,s=>{if(!s||s.lease!==token)throw new Error('Lease expired');s.progress=progress;s.transcript=job.transcript;s.duration=job.duration;s.result=job.result;s.updated=Date.now();});};
   let video_url=job.result?.video_url||job.sourceUrl;
   if(!job.transcript){
    await checkpoint('Downloading audio');let file:File;
    if(job.audioUrl){const d=await safeDownload(job.audioUrl,24*1024*1024);file=new File([new Uint8Array(d.buffer)],'audio.mp3',{type:'audio/mpeg'});}
    else {const fetched=await fetchAdVideo(job.sourceUrl);file=fetched.file;video_url=fetched.videoUrl;}
    await checkpoint('Transcribing');await beforePaid();
    const transcript=await transcribeWithDuration(file);job.transcript=transcript.text;job.duration=job.duration||transcript.duration;
    await checkpoint('Localising');
   }
   await checkpoint('Localising');await beforePaid();
   const us_script=job.transcript!;
   const result=await localize(us_script,job.provider,job.model,job.productContext,job.generateVo,job.singingAd,(job.productName||"MELLOW").toUpperCase(),job.ctaMode,job.generateHooks!==false,job.market);
   job.result={...result,us_script,video_url};if(result.no_speech){job.generateVo=false;job.voiceoverEnabled=false;job.generateHooks=false;}job.step='export';job.progress='Localisation complete';
  }else if(job.step==='export'){
   const r=job.result!;
   const exported=await appendToAdminBriefs({jobId:job.id,editorId:job.editorId,editorNotes:job.editorNotes,noSpeech:r.no_speech,uk:r.uk_script,hooks:editorHooks(job),hookOg:opening(r.uk_script),desire:r.ad_desire,angle:(job.name.startsWith('SYSTEM TEST')?'SYSTEM TEST / ':'')+r.ad_angle,mechanism:r.unique_mechanism,funnel:r.funnel,reference:job.cleanUrl||''});
   job.adId=exported.adId;await syncAssignedEditor(job.adId);job.step=job.generateVo?'vo':job.video&&!job.cleanUrl?'submit':'references';
  }else if(job.step==='vo'){
   const r=job.result!;if(job.voApprovedRevision!==(job.revision||0))throw Error('Review the script and click Get voiceover first');if(hasTokens(r.uk_script))throw new Error('Script has unresolved product data. Edit the draft before recording narration.');
   const path=`vo/${job.id}-r${job.revision||0}.wav`;
   job.voUrl=await existingMedia(path)||await existingMedia(path.replace(/\.wav$/,'.mp3'));
   if(!job.voUrl){await beforePaid();const narration=await prepareNarration(r.uk_script,job.provider,job.model,job.market);r.narration=narration;
    const audio=await generateVO(narration,job.voiceId,async(raw,timing)=>{job.voOriginalUrl=await putMedia(`vo/${job.id}-r${job.revision||0}-original.mp3`,Buffer.from(raw),'audio/mpeg');job.voTiming=timing;},job.voiceProcessing,'voiceover',job.market,job.voPace);job.voUrl=await putMedia(path,Buffer.from(audio),'audio/wav');
   }
   job.step=job.video&&!job.cleanUrl?'submit':'references';
  }else if(job.step==='submit'){
   if(job.taskId){job.step='poll';}else{
    await beforePaid();const sub=await pythonCall('/api/vmake_submit',{url:job.result?.video_url||job.sourceUrl});
    if(sub.task_id){job.taskId=String(sub.task_id);job.submittedAt=Date.now();job.step='poll';}
    else if(sub.output_urls?.[0]){job.cleanUrl=await finalise(sub.output_urls[0],job.id);job.step='references';}
    else throw new Error('VMake did not return a task or output');
   }
  }else if(job.step==='poll'){
   const st=await pythonCall(`/api/vmake_status?task_id=${encodeURIComponent(job.taskId!)}`);
   if(st.failed)throw new Error(String(st.message||'VMake failed'));
   if(st.done){if(!st.output_urls?.[0])throw new Error('VMake completed without a video');job.cleanUrl=await finalise(st.output_urls[0],job.id);job.step='references';}
   else if(Date.now()-(job.submittedAt||Date.now())>60*60*1000)throw new Error('VMake still processing after one hour; retry status without resubmitting');
  }else if(job.step==='references'){
   if(job.generateVo&&!job.voUrl)throw new Error('Voiceover missing');if(job.video&&!job.cleanUrl)throw new Error('Clean video missing');
   await updateReference(job.adId!,job.cleanUrl||'');await syncAssignedEditor(job.adId!);
   job.step='done';
  }
  job.status=job.step==='done'?(job.result?.data_gaps.length?'Draft saved — product details needed':'Complete'):'Queued';job.error=undefined;
 }catch(e){job.status='Failed';job.error=e instanceof Error?e.message:'Processing failed';job.uncertain=['localise','vo','submit'].includes(job.step)&&(await getJob(id))?.pendingStep!==undefined;}
 await commit();
}
export async function finalise(url:string,id:string){
 if((await import('./media')).mediaBackend()==='supabase')return (await import('./stream-media')).storeVideoStream(url,id);
 const path=`clean/${id}.mp4`;const prior=await existingMedia(path);if(prior)return prior;
 const d=await safeDownload(url,200*1024*1024);
 if(!/^video\//.test(d.contentType)&&!d.buffer.subarray(4,12).includes(Buffer.from('ftyp')))throw new Error('Output is not a video');
 return putMedia(path,d.buffer,'video/mp4');
}
// Durable platform messages replace recursive HTTP handoffs.
export async function scheduleJob(id:string,delaySeconds=0){
 const {send}=await import('@vercel/queue');
 await send('szekspir-jobs',{id},{region:'iad1',delaySeconds,retentionSeconds:86400});
}
export async function workQueue(){
 const pending=(await jobs()).filter(j=>j.step!=='done'&&j.status!=='Failed');
 for(const j of pending)await scheduleJob(j.id,Math.max(0,Math.ceil(((j.leaseUntil||0)-Date.now())/1000)));
}
export async function consumeJob(id:string){
 const before=await getJob(id);if(!before||before.step==='done'||before.status==='Failed')return;
 if(before.hookDeliveryPending!==undefined){await scheduleJob(id,15);return;}
 if((before.leaseUntil||0)>Date.now()){await scheduleJob(id,Math.ceil((before.leaseUntil!-Date.now())/1000)+1);return;}
 const delay=before.engine===2?await advanceParallel(id):(await advance(id),undefined);
 const current=await getJob(id);
 if(current&&current.step!=='done'&&current.status!=='Failed')await scheduleJob(id,delay??(current.step==='poll'?20:0));
}

export async function requestVoiceover(id:string,script:string,hooks:string[],voiceId:string,regenerateRevision?:number,processingInput?:unknown){
 const processing=voiceProcessing(processingInput);
 if(!/^[\w-]{8,100}$/.test(id)||!voiceId)throw Error('Choose a voice first');
 return mutate<Job|null,Job>(`job-${id}`,null,s=>{
  if(s?.hookDeliveryPending!==undefined)throw Error('Finish saving the hook delivery selection first.');if(s?.abortedAt)throw Error('This job was stopped');if(!s?.result)throw Error('Wait for the script to finish');if(s.result.no_speech)throw Error('No dialogue detected. This video does not need a voiceover.');
  for(const i of [0,1,2])if(s.hookVoPending?.[i]&&(s.hookVoInputs?.[i]?.text!==hooks[i]||s.hookVoInputs?.[i]?.voiceId!==voiceId))throw Error('A hook is recording with different text or voice. Keep those settings or wait for that hook.');
  if(regenerateRevision!==undefined){if(s.voRegeneratedFrom===regenerateRevision)return s;if(!Number.isSafeInteger(regenerateRevision)||regenerateRevision!==(s.revision||0))throw Error('This voiceover changed. Refresh before regenerating.');if(!s.voUrl||s.stages?.vo&&!s.stages.vo.done)throw Error('Wait for the current recording to finish');}
  if((s.leaseUntil||0)>Date.now())throw Error('A step is saving right now. Try again in a few seconds.');
  if(s.stages?.vo?.uncertain||s.stages?.vo?.pending)throw Error('The previous voice request needs checking before another recording.');
  if(hasTokens(script))throw Error('Replace unfinished placeholders in the script before recording.');
  if(regenerateRevision===undefined&&s.generateVo&&s.voApprovedRevision===(s.revision||0)&&s.result.uk_script===script&&s.voiceId===voiceId&&JSON.stringify(s.result.hooks)===JSON.stringify(hooks)&&!s.stages?.vo?.error)return s;
  const validated=validateResult({...s.result,uk_script:script,hooks,narration:script});
  s.history=[...(s.history||[]),{at:Date.now(),script:s.result.uk_script,promptVersion:s.result.prompt_version}].slice(-30);
  if(regenerateRevision!==undefined){s.previousVo={url:s.voUrl!,originalUrl:s.voOriginalUrl,hooks:s.hookVoUrls,revision:s.revision||0};s.voRegeneratedFrom=regenerateRevision;}
  s.voPace=sourcePace(s,script,voiceId,processing);
  s.result={...s.result,...validated,narration:''};s.revision=(s.revision||0)+1;
  s.voOriginalUrl=undefined;s.voTiming=undefined;s.hookVoOriginalUrls=Object.fromEntries(Object.entries(s.hookVoOriginalUrls||{}).filter(([i])=>s.hookVoPending?.[Number(i)]||!sendsHook(s,Number(i))));s.hookVoTimings=Object.fromEntries(Object.entries(s.hookVoTimings||{}).filter(([i])=>s.hookVoPending?.[Number(i)]||!sendsHook(s,Number(i))));s.hookVoUrls=Object.fromEntries(Object.entries(s.hookVoUrls||{}).filter(([i])=>s.hookVoPending?.[Number(i)]||!sendsHook(s,Number(i))));s.voiceProcessing=processing;s.voApprovedRevision=s.revision;s.voiceoverEnabled=true;s.generateVo=true;s.voiceId=voiceId;s.voUrl=undefined;
  if(s.engine===2)s.stages={...s.stages,localise:{done:true},export:{},vo:{},references:{}};
  s.completedAt=undefined;s.step='export';s.status='Queued';s.error=undefined;s.updated=Date.now();return s;
 });
}

export async function abortJob(id:string){if(!/^[\w-]{8,100}$/.test(id))throw Error('Invalid ID');return mutate<Job|null,Job>(`job-${id}`,null,s=>{if(!s)throw Error('Job not found');if(s.step==='done')return s;s.status='Aborted';s.step='done';s.progress='Stopped by you';s.abortedAt=Date.now();s.completedAt=s.abortedAt;s.updated=s.abortedAt;s.lease=undefined;s.leaseUntil=undefined;s.error=undefined;return s;});}

export async function cancelJob(id:string){
 if(!/^[\w-]{8,100}$/.test(id))throw Error('Invalid ID');
 const now=Date.now();
 // A tombstone prevents a still-uploading browser from creating this job later.
 if(!await getJob(id)){const tombstone:Job={id,name:'Cancelled upload',sourceUrl:'',video:false,provider:'openai',model:'',productName:'',productVersion:'',productContext:'',voiceId:'',generateVo:false,status:'Cancelled',step:'done',created:now,updated:now,cancelledAt:now,abortedAt:now};try{await writeState(`job-${id}`,tombstone);}catch(error){if(!await getJob(id))throw error;}}
 return mutate<Job|null,Job>(`job-${id}`,null,s=>{if(!s)throw Error('Job not found');s.cancelledAt=now;s.abortedAt=now;s.status='Cancelled';s.step='done';s.progress=undefined;s.completedAt=now;s.updated=now;s.lease=undefined;s.leaseUntil=undefined;s.error=undefined;s.pendingStep=undefined;s.uncertain=false;s.hookVoPending={};return s;});
}
