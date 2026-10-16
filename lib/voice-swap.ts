import {createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {mutate,readState} from './store';
import {existingMedia,putMedia,putMediaStream,assertMediaTypeSupported} from './media';
import {swapId,swapSourcePath,swapMix,type VoiceSwap,type SwapMix} from './voice-swap-model';
import {downloadSwapMedia,prepareSwapAudio,readSwapStems,requestSwapStems,streamSwapVideo,storedSwapSource,probeSwapMedia} from './voice-swap-audio';
const key=(id:string)=>`voice-swap-${swapId(id)}`;
const active=(s:VoiceSwap)=>['queued','preparing','separating','mixing','voicing','transcribing','aligning','enhancing','delivering'].includes(s.status);
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
 if(input.sendToVmake===true&&input.saveToDrive===true)throw Error('Choose one save destination.');
 const deliveryMode=input.sendToVmake===true?'vmake':input.saveToDrive===true?'direct':undefined;
 return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,s=>{
  if(s?.delivery){if(s.mixKey===mixKey)return s;throw Error('This film has already been sent for delivery. Start a new film to change the mix.');}
  if(mix.voicePath.startsWith('vo/')&&!s?.takes?.some(t=>(t.path===mix.voicePath&&t.url)||(t.alignedPath===mix.voicePath&&t.alignedUrl)))throw Error('Choose a completed voiceover from this film.');
  if(!s?.backgroundUrl)throw Error('Separate the background first.');
  if(active(s)){if(s.mixKey===mixKey)return s;throw Error('A voice swap is already in progress.');}
  if(s.mixKey===mixKey&&s.outputUrl&&s.status==='done'){if(deliveryMode){s.delivery={mode:deliveryMode,mixKey,started:Date.now()};s.stage=deliveryMode==='direct'?'drive':'enhance';s.status='queued';s.updated=Date.now();}return s;}
  if(deliveryMode)s.delivery={mode:deliveryMode,mixKey,started:Date.now()};
  s.mix=mix;s.mixKey=mixKey;s.voiceUrl=voiceUrl;s.outputUrl=undefined;s.status='queued';s.stage='mix';s.error=undefined;s.updated=Date.now();return s;
 });
}
export async function resumeVoiceSwap(id:string){
 const current=await getVoiceSwap(id),take=current.stage==='voice'?current.takes?.find(t=>t.id===current.selectedTake):undefined;
 const savedTake=take?.submitted?(take.url||await existingMedia(take.path)):undefined;
 return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,s=>{
  if(!s)throw Error('Voice swap not found.');
  if((s.leaseUntil||0)>Date.now())return s;
  if(s.status==='done'||s.status==='review')return s;
  if(s.stage==='voice'&&take&&savedTake&&s.selectedTake===take.id){const selected=s.takes?.find(t=>t.id===take.id);if(selected)selected.url=savedTake;s.status='review';s.error=undefined;s.updated=Date.now();return s;}
  if(s.stage==='transcribe'&&s.transcriptionSubmitted&&s.transcript===undefined){s.status='review';s.error=undefined;s.transcriptionError='Wynik transkrypcji nie został potwierdzony. Wklej tekst ręcznie; nie ponawiamy płatnego żądania.';s.updated=Date.now();return s;}
  if(s.stage==='voice'&&s.takes?.find(t=>t.id===s.selectedTake)?.submitted)throw Error('Check the previous voice generation before paying for another take.');
  if(s.stage==='enhance'&&s.delivery?.submitted&&!s.delivery.taskId&&!s.delivery.providerUrl)throw Error('Check the saved VMake submission before retrying.');
  if(s.paidIntent&&!s.archiveUrl&&s.stage==='separate')throw Error('The separation outcome is unknown. Check ElevenLabs before paying for another request.');
  s.status='queued';s.error=undefined;s.updated=Date.now();return s;
 });
}
export async function advanceVoiceSwap(id:string){
 const s=await mutate<VoiceSwap|null,VoiceSwap|undefined>(key(id),null,s=>{
  if(!s||!active(s)||(s.leaseUntil||0)>Date.now())return;
  if(s.stage==='separate'&&s.paidIntent&&!s.archiveUrl){s.status='uncertain';s.error='Separation was interrupted. Check ElevenLabs; the paid request will not be repeated.';s.updated=Date.now();return;}
  s.leaseUntil=Date.now()+330000;s.status=s.stage==='prepare'?'preparing':s.stage==='mix'?'mixing':s.stage==='voice'?'voicing':s.stage==='transcribe'?'transcribing':s.stage==='align'?'aligning':s.stage==='separate'?'separating':s.stage==='enhance'?'enhancing':'delivering';s.updated=Date.now();return {...s};
 });
 if(!s)return false;
 const update=(fn:(s:VoiceSwap)=>void)=>mutate<VoiceSwap|null,void>(key(id),null,x=>{if(!x)throw Error('Voice swap disappeared.');fn(x);x.updated=Date.now();});
 const dir=await mkdtemp(join(tmpdir(),'voice-swap-'));
 try{
  if(s.stage==='prepare'){
   const source=storedSwapSource(s.sourceUrl),audio=join(dir,'source.wav');const duration=await prepareSwapAudio(source,audio);
   if(!await existingMedia(`voice-swaps/${id}/source.wav`))await putMedia(`voice-swaps/${id}/source.wav`,await readFile(audio),'audio/wav');
   await update(x=>{x.duration=duration;x.stage='separate';x.status='queued';});
  }else if(s.stage==='separate'){
   let archive:Buffer;
   if(s.archiveUrl){const path=join(dir,'stems.zip');await downloadSwapMedia(s.archiveUrl,path,60*1024*1024);archive=await readFile(path);}
   else{
    const url=await existingMedia(`voice-swaps/${id}/source.wav`);if(!url)throw Error('Prepared audio is missing.');
    const audio=join(dir,'source.wav');await downloadSwapMedia(url,audio,60*1024*1024);
    await assertMediaTypeSupported('application/zip');
    await update(x=>{x.paidIntent=true;});
    archive=await requestSwapStems(audio);
    await update(x=>{x.separationReceived=true;});
    // Save the provider response before parsing. Recovery never pays for the same request again.
    const archiveUrl=await putMedia(`voice-swaps/${id}/stems.zip`,archive,'application/zip');await update(x=>{x.archiveUrl=archiveUrl;});
   }
   const stems=readSwapStems(archive),path=join(dir,'background.mp3');await writeFile(path,stems.background,{mode:0o600});const seconds=await probeSwapMedia(path);
   if(Math.abs(seconds-s.duration!)>.5)throw Error('Separated background length differs from the original. Review the saved stems; no new paid request was made.');
   const backgroundUrl=await existingMedia(`voice-swaps/${id}/background.mp3`)||await putMedia(`voice-swaps/${id}/background.mp3`,stems.background,'audio/mpeg');
   const vocalsUrl=await existingMedia(`voice-swaps/${id}/vocals.mp3`)||await putMedia(`voice-swaps/${id}/vocals.mp3`,stems.vocals,'audio/mpeg');
   await update(x=>{x.backgroundUrl=backgroundUrl;x.vocalsUrl=vocalsUrl;x.stage='transcribe';x.status='queued';x.error=undefined;});
  }else if(s.stage==='transcribe'){
   const {advanceSwapTranscript}=await import('./voice-swap-transcript');await advanceSwapTranscript(s,update,dir);
  }else if(s.stage==='align'){
   const {advanceSwapAlignment}=await import('./voice-swap-alignment');await advanceSwapAlignment(s,update,dir);
  }else if(s.stage==='voice'){
   const {advanceSwapNarration}=await import('./voice-swap-narration');await advanceSwapNarration(s,update);
  }else if(['enhance','drive','sheet'].includes(s.stage)){
   const {advanceSwapDelivery}=await import('./voice-swap-delivery');await advanceSwapDelivery(s,update);
  }else{
   const outputPath=`voice-swaps/${id}/${s.mixKey}.mp4`;let outputUrl=await existingMedia(outputPath);
   if(!outputUrl){
    const source=storedSwapSource(s.sourceUrl),bed=join(dir,'background.mp3'),voice=join(dir,'voice.audio');
    await downloadSwapMedia(s.backgroundUrl!,bed,30*1024*1024);await downloadSwapMedia(s.voiceUrl!,voice,30*1024*1024);
    outputUrl=await streamSwapVideo(source,bed,voice,s.mix as SwapMix,s.duration!,body=>putMediaStream(outputPath,body,'video/mp4'));
   }
   await update(x=>{x.outputUrl=outputUrl;x.status=x.delivery?'queued':'done';if(x.delivery)x.stage=x.delivery.mode==='direct'?'drive':'enhance';x.error=undefined;});
  }
 }catch(error){
  await update(x=>{const message=(error as Error).message.slice(0,350);if(x.stage==='separate')x.separationError=message;x.status=x.paidIntent&&!x.archiveUrl&&x.stage==='separate'?'uncertain':'error';x.error=x.status==='uncertain'?(x.separationReceived?'ElevenLabs returned the separation, but Szekspir could not save it. No automatic paid retry was made.':'The separation result could not be confirmed. No automatic paid retry was made.'):message;});
 }finally{await rm(dir,{recursive:true,force:true});await update(x=>{x.leaseUntil=0;});}
 const latest=await getVoiceSwap(id);return latest.status==='queued';
}

export async function sendVoiceSwap(id:string,enhance=true){return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,s=>{if(!s?.outputUrl||!s.mixKey)throw Error('Prepare the mixed film first.');if(s.delivery)return s;if(s.status!=='done')throw Error('Wait for the mix to finish.');s.delivery={mode:enhance?'vmake':'direct',mixKey:s.mixKey,started:Date.now()};s.stage=enhance?'enhance':'drive';s.status='queued';s.updated=Date.now();return s;});}

export async function recoverSwapSeparation(id:string,confirmNewCharge=false){
 const s=await getVoiceSwap(id);if(s.stage!=='separate'||(s.leaseUntil||0)>Date.now()||!['error','uncertain'].includes(s.status))throw Error('This separation is not ready for recovery.');
 const archiveUrl=s.archiveUrl||await existingMedia(`voice-swaps/${s.id}/stems.zip`);
 if(!archiveUrl&&!confirmNewCharge)throw Error('Nie znaleziono zapisanego ZIP-a. Oryginalny film i przygotowane audio pozostają zapisane. Ponowienie separacji może naliczyć nową opłatę i wymaga Twojego potwierdzenia.');
 await assertMediaTypeSupported('application/zip');
 return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,x=>{if(!x||x.stage!=='separate'||(x.leaseUntil||0)>Date.now()||!['error','uncertain'].includes(x.status))throw Error('Separation state changed. Refresh first.');x.archiveUrl=archiveUrl;if(!archiveUrl){x.paidIntent=false;x.separationReceived=false;}x.status='queued';x.error=undefined;x.separationError=undefined;x.updated=Date.now();return x;});
}

export async function requestSwapNarration(id:string,input:Record<string,unknown>){
 const {narrationInput}=await import('./voice-swap-narration');const b=narrationInput(input);
 const prior=await getVoiceSwap(id);const old=prior.takes?.find(t=>t.id===b.requestId);if(old){if(old.text!==b.text||old.voiceId!==b.voiceId)throw Error('This recording request belongs to another script or voice.');return prior;}
 if(active(prior)||prior.delivery||!prior.backgroundUrl)throw Error('Wait for the background and finish the current operation first.');
 const {getVoice}=await import('./elevenlabs');const voice=await getVoice(b.voiceId);
 return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,s=>{
  if(!s?.backgroundUrl||s.delivery)throw Error('This film cannot record a new voiceover now.');
  const old=s.takes?.find(t=>t.id===b.requestId);if(old){if(old.text!==b.text||old.voiceId!==b.voiceId)throw Error('Recording request changed.');return s;}if(active(s))throw Error('An operation is already running.');
  if((s.takes?.length||0)>=20)throw Error('This film has reached its take history limit.');
  s.takes=[{id:b.requestId,text:b.text,voiceId:b.voiceId,voiceName:voice.name,path:`vo/swap-${s.id}-${b.requestId}.wav`,created:Date.now()},...(s.takes||[])];
  s.selectedTake=b.requestId;s.stage='voice';s.status='queued';s.error=undefined;s.updated=Date.now();return s;
 });
}

/** Existing separated films can request the same one-time transcription without separating again. */
export async function requestSwapTranscript(id:string){return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,s=>{
 if(!s?.backgroundUrl||!s.vocalsUrl)throw Error('Separate the original voice first.');
 if(s.transcript!==undefined)return s;
 if(s.stage==='transcribe'&&active(s))return s;
 if(s.transcriptionSubmitted)throw Error('Previous transcription could not be confirmed. Paste the script; no automatic paid retry was made.');
 if(active(s)||s.delivery)throw Error('Wait for the current operation to finish.');
 s.stage='transcribe';s.status='queued';s.error=undefined;s.updated=Date.now();return s;
});}

export async function requestSwapAlignment(id:string,takeId:string){swapId(takeId);return mutate<VoiceSwap|null,VoiceSwap>(key(id),null,s=>{
 const t=s?.takes?.find(t=>t.id===takeId);if(!s||!t?.url||!s.vocalsUrl)throw Error('Choose a saved recording and original voice first.');
 if(t.alignedUrl)return s;if(s.stage==='align'&&s.alignmentTake===takeId&&active(s))return s;
 if(active(s)||s.delivery)throw Error('Wait for the current operation to finish.');
 s.alignmentTake=takeId;s.stage='align';s.status='queued';s.error=undefined;s.updated=Date.now();return s;
});}
