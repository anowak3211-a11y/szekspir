import {createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {mutate,readState} from './store';
import {existingMedia,putMedia} from './media';
import {swapId,swapSourcePath,swapMix,type VoiceSwap,type SwapMix} from './voice-swap-model';
import {downloadSwapMedia,prepareSwapAudio,readSwapStems,requestSwapStems,renderSwapVideo,probeSwapMedia} from './voice-swap-audio';
const key=(id:string)=>`voice-swap-${swapId(id)}`;
const active=(s:VoiceSwap)=>['queued','preparing','separating','mixing','enhancing','delivering'].includes(s.status);
export async function getVoiceSwap(id:string){const s=(await readState<VoiceSwap|null>(key(id),null)).value;if(!s)throw Error('Voice swap not found.');return s;}
export async function startVoiceSwap(input:Record<string,unknown>){
 const id=swapId(input.id),sourcePath=swapSourcePath(id,input.sourcePath);
 if(input.confirmCost!==true)throw Error('Confirm the paid ElevenLabs separation first.');
 if(!process.env.ELEVENLABS_API_KEY)throw Error('ElevenLabs is not configured.');
 const sourceUrl=await existingMedia(sourcePath);if(!sourceUrl)throw Error('Finish uploading the original video first.');
 const {value,etag}=await readState<VoiceSwap|null>(key(id),null);
 if(value){if(value.sourcePath!==sourcePath)throw Error('This ID belongs to another source.');return value;}
 const record:VoiceSwap={id,name:String(input.name||'Video').slice(0,160),sourcePath,sourceUrl,created:Date.now(),updated:Date.now(),status:'queued',stage:'prepare'};
 try{const {writeState}=await import('./store');await writeState(key(id),record,etag);}catch(error){if(/Conflict|AlreadyExists|Precondition/.test((error as Error).name)||/already exists|conflict|precondition/i.test((error as Error).message))return getVoiceSwap(id);throw error;}
 return record;
}
export async function scheduleVoiceSwap(id:string,delaySeconds=0){const {send}=await import('@vercel/queue');await send('szekspir-voice-swap',{id:swapId(id)},{region:'fra1',delaySeconds,retentionSeconds:86400});}
export async function mixVoiceSwap(id:string,input:Record<string,unknown>){
 const mix=swapMix(input);const voiceUrl=await existingMedia(mix.voicePath);if(!voiceUrl)throw Error('Finish uploading the new voiceover first.');
 const mixKey=createHash('sha256').update(JSON.stringify(mix)).digest('hex');
 return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,s=>{
  if(s?.delivery){if(s.mixKey===mixKey)return s;throw Error('This film has already been sent for delivery. Start a new film to change the mix.');}
  if(!s?.backgroundUrl)throw Error('Separate the background first.');
  if(active(s)){if(s.mixKey===mixKey)return s;throw Error('A voice swap is already in progress.');}
  if(s.mixKey===mixKey&&s.outputUrl&&s.status==='done'){if(input.sendToVmake===true){s.delivery={mixKey,started:Date.now()};s.stage='enhance';s.status='queued';s.updated=Date.now();}return s;}
  if(input.sendToVmake===true)s.delivery={mixKey,started:Date.now()};
  s.mix=mix;s.mixKey=mixKey;s.voiceUrl=voiceUrl;s.outputUrl=undefined;s.status='queued';s.stage='mix';s.error=undefined;s.updated=Date.now();return s;
 });
}
export async function resumeVoiceSwap(id:string){
 return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,s=>{
  if(!s)throw Error('Voice swap not found.');
  if((s.leaseUntil||0)>Date.now())return s;
  if(s.status==='done'||s.status==='review')return s;
  if(s.stage==='enhance'&&s.delivery?.submitted&&!s.delivery.taskId&&!s.delivery.providerUrl)throw Error('Check the saved VMake submission before retrying.');
  if(s.paidIntent&&!s.archiveUrl&&s.stage==='separate')throw Error('The separation outcome is unknown. Check ElevenLabs before paying for another request.');
  s.status='queued';s.error=undefined;s.updated=Date.now();return s;
 });
}
export async function advanceVoiceSwap(id:string){
 const s=await mutate<VoiceSwap|null,VoiceSwap|undefined>(key(id),null,s=>{
  if(!s||!active(s)||(s.leaseUntil||0)>Date.now())return;
  if(s.stage==='separate'&&s.paidIntent&&!s.archiveUrl){s.status='uncertain';s.error='Separation was interrupted. Check ElevenLabs; the paid request will not be repeated.';s.updated=Date.now();return;}
  s.leaseUntil=Date.now()+330000;s.status=s.stage==='prepare'?'preparing':s.stage==='mix'?'mixing':s.stage==='separate'?'separating':s.stage==='enhance'?'enhancing':'delivering';s.updated=Date.now();return {...s};
 });
 if(!s)return false;
 const update=(fn:(s:VoiceSwap)=>void)=>mutate<VoiceSwap|null,void>(key(id),null,x=>{if(!x)throw Error('Voice swap disappeared.');fn(x);x.updated=Date.now();});
 const dir=await mkdtemp(join(tmpdir(),'voice-swap-'));
 try{
  if(s.stage==='prepare'){
   const source=join(dir,'source.video'),audio=join(dir,'source.wav');await downloadSwapMedia(s.sourceUrl,source);const duration=await prepareSwapAudio(source,audio);
   if(!await existingMedia(`voice-swaps/${id}/source.wav`))await putMedia(`voice-swaps/${id}/source.wav`,await readFile(audio),'audio/wav');
   await update(x=>{x.duration=duration;x.stage='separate';x.status='queued';});
  }else if(s.stage==='separate'){
   let archive:Buffer;
   if(s.archiveUrl){const path=join(dir,'stems.zip');await downloadSwapMedia(s.archiveUrl,path,60*1024*1024);archive=await readFile(path);}
   else{
    const url=await existingMedia(`voice-swaps/${id}/source.wav`);if(!url)throw Error('Prepared audio is missing.');
    const audio=join(dir,'source.wav');await downloadSwapMedia(url,audio,60*1024*1024);
    await update(x=>{x.paidIntent=true;});
    archive=await requestSwapStems(audio);
    // Save the provider response before parsing. Recovery never pays for the same request again.
    const archiveUrl=await putMedia(`voice-swaps/${id}/stems.zip`,archive,'application/zip');await update(x=>{x.archiveUrl=archiveUrl;});
   }
   const stems=readSwapStems(archive),path=join(dir,'background.mp3');await writeFile(path,stems.background,{mode:0o600});const seconds=await probeSwapMedia(path);
   if(Math.abs(seconds-s.duration!)>.5)throw Error('Separated background length differs from the original. Review the saved stems; no new paid request was made.');
   const backgroundUrl=await existingMedia(`voice-swaps/${id}/background.mp3`)||await putMedia(`voice-swaps/${id}/background.mp3`,stems.background,'audio/mpeg');
   const vocalsUrl=await existingMedia(`voice-swaps/${id}/vocals.mp3`)||await putMedia(`voice-swaps/${id}/vocals.mp3`,stems.vocals,'audio/mpeg');
   await update(x=>{x.backgroundUrl=backgroundUrl;x.vocalsUrl=vocalsUrl;x.status='review';x.error=undefined;});
  }else if(['enhance','drive','sheet'].includes(s.stage)){
   const {advanceSwapDelivery}=await import('./voice-swap-delivery');await advanceSwapDelivery(s,update);
  }else{
   const outputPath=`voice-swaps/${id}/${s.mixKey}.mp4`;let outputUrl=await existingMedia(outputPath);
   if(!outputUrl){
    const source=join(dir,'source.video'),bed=join(dir,'background.mp3'),voice=join(dir,'voice.audio'),output=join(dir,'output.mp4');
    await downloadSwapMedia(s.sourceUrl,source);await downloadSwapMedia(s.backgroundUrl!,bed,30*1024*1024);await downloadSwapMedia(s.voiceUrl!,voice,30*1024*1024);
    await renderSwapVideo(source,bed,voice,output,s.mix as SwapMix,s.duration!);outputUrl=await putMedia(outputPath,await readFile(output),'video/mp4');
   }
   await update(x=>{x.outputUrl=outputUrl;x.status=x.delivery?'queued':'done';if(x.delivery)x.stage='enhance';x.error=undefined;});
  }
 }catch(error){
  await update(x=>{x.status=x.paidIntent&&!x.archiveUrl&&x.stage==='separate'?'uncertain':'error';x.error=x.status==='uncertain'?'ElevenLabs did not return a confirmed result. Check the provider before any new paid separation.':(error as Error).message.slice(0,350);});
 }finally{await rm(dir,{recursive:true,force:true});await update(x=>{x.leaseUntil=0;});}
 const latest=await getVoiceSwap(id);return latest.status==='queued';
}

export async function sendVoiceSwap(id:string){return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,s=>{if(!s?.outputUrl||!s.mixKey)throw Error('Prepare the mixed film first.');if(s.delivery)return s;if(s.status!=='done')throw Error('Wait for the mix to finish.');s.delivery={mixKey:s.mixKey,started:Date.now()};s.stage='enhance';s.status='queued';s.updated=Date.now();return s;});}
