import type {Job} from './jobs';
import type {VoiceTiming} from './vo-cleanup';
import {dualVoice} from './dual-voice';
import {prepareNarration} from './localize';
import {generateVO} from './elevenlabs';
import {putMedia} from './media';
import {safeDownload} from './safe-fetch';
import {joinVoices,fitIntroduction} from './join-voices';
export type SpeakerTake={url:string;originalUrl:string;timing:VoiceTiming;voiceId:string};
export async function generateDualVoice(job:Job,paid:()=>Promise<void>,save:(update:(job:Job)=>void)=>Promise<void>){
 const script=job.result!.uk_script,settings=dualVoice(job.dualVoice,script,job.voiceId)!;
 const texts=[script.slice(0,settings.splitAt),script.slice(settings.splitAt)],voices=[job.voiceId,settings.voiceId];
 const takes:SpeakerTake[]=[];
 for(let i=0;i<2;i++){
  const cached=job.speakerTakes?.[i];if(cached){takes.push(cached);continue;}
  await paid();
  const narration=await prepareNarration(texts[i],job.provider,job.model,job.market);
  let originalUrl='',timing:VoiceTiming|undefined;
  // One ambience bed is applied after both voices are joined.
  const audio=await generateVO(narration,voices[i],async(raw,t)=>{originalUrl=await putMedia(`vo/${job.id}-r${job.revision||0}-speaker-${i+1}-original.mp3`,Buffer.from(raw),'audio/mpeg');timing=t;},{...job.voiceProcessing!,ambience:'none'},'voiceover',job.market);
  if(!timing)throw Error('Speaker timing is missing.');
  const url=await putMedia(`vo/${job.id}-r${job.revision||0}-speaker-${i+1}.wav`,Buffer.from(audio),'audio/wav');
  const take={url,originalUrl,timing,voiceId:voices[i]};takes.push(take);
  await save(j=>{j.speakerTakes={...j.speakerTakes,[i]:take};});
 }
 const load=async(url:string)=>new Uint8Array((await safeDownload(url,150*1024*1024)).buffer).buffer;
 const cleanParts=await Promise.all(takes.map(t=>load(t.url)));
 let padding=0,speed=1;
 if(settings.startSeconds!==undefined){const fitted=await fitIntroduction(cleanParts[0],settings.startSeconds);cleanParts[0]=fitted.audio;padding=fitted.paddingSeconds;speed=fitted.speed;}
 const switchSeconds=settings.startSeconds??takes[0].timing.trimmedSeconds;
 const timing:VoiceTiming={originalSeconds:takes.reduce((n,t)=>n+t.timing.originalSeconds,0),trimmedSeconds:switchSeconds+takes[1].timing.trimmedSeconds,removedSeconds:takes.reduce((n,t)=>n+t.timing.removedSeconds,0),cleanupVersion:'dual-voice-v1',processing:job.voiceProcessing,speakerSwitchSeconds:switchSeconds,speaker1Speed:speed};
 let audio=await joinVoices(cleanParts,padding);
 const original=await joinVoices(await Promise.all(takes.map(t=>load(t.originalUrl))));
 const originalUrl=await putMedia(`vo/${job.id}-r${job.revision||0}-original.wav`,Buffer.from(original),'audio/wav');
 if(job.voiceProcessing?.ambience&&job.voiceProcessing.ambience!=='none'&&job.voiceProcessing.mode!=='aggressive'){
  await paid();const {addStoryAmbience}=await import('./story-ambience');audio=await addStoryAmbience(audio,job.voiceProcessing.ambience,timing,process.env.ELEVENLABS_API_KEY!);
 }
 const url=await putMedia(`vo/${job.id}-r${job.revision||0}.wav`,Buffer.from(audio),'audio/wav');
 await save(j=>{j.voUrl=url;j.voOriginalUrl=originalUrl;j.voTiming=timing;});return url;
}
