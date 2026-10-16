import {swapId,type VoiceSwap,type SwapTake} from './voice-swap-model';
import {existingMedia,putMedia} from './media';
import {generateVO} from './elevenlabs';
import {v4RecordingSettings} from './voice-processing';
export function narrationInput(input:Record<string,unknown>){
 if(input.confirmCost!==true)throw Error('Confirm the paid voice recording first.');
 const requestId=swapId(input.requestId),text=typeof input.text==='string'?input.text.trim():'';
 if(!text||text.length>10000)throw Error('Enter a script between 1 and 10,000 characters.');
 if(typeof input.voiceId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(input.voiceId))throw Error('Choose a voice first.');
 return {requestId,text,voiceId:input.voiceId};
}
export async function advanceSwapNarration(s:VoiceSwap,update:(fn:(s:VoiceSwap)=>void)=>Promise<void>){
 const take=s.takes?.find(t=>t.id===s.selectedTake);if(!take)throw Error('Saved voice recording is missing.');
 const change=(fn:(t:SwapTake)=>void)=>update(x=>{const t=x.takes?.find(t=>t.id===take.id);if(!t)throw Error('Recording disappeared.');fn(t);});
 let url=take.url||await existingMedia(take.path);
 if(!url){
  if(take.submitted)throw Error('Voice recording outcome is unknown. The paid request will not be repeated automatically.');
  await change(t=>{t.submitted=true;});
  const bytes=await generateVO(take.text,take.voiceId,async raw=>{
   const originalUrl=await putMedia(take.path.replace(/\.wav$/,'-original.mp3'),Buffer.from(raw),'audio/mpeg');await change(t=>{t.originalUrl=originalUrl;});
  },v4RecordingSettings({mode:'gentle',normalize:false,matchSourcePace:false,pauseShorteningMs:0,tempoFactor:1}));
  url=await putMedia(take.path,Buffer.from(bytes),'audio/wav');
 }
 await change(t=>{t.url=url;});await update(x=>{x.status='review';x.error=undefined;});
}
