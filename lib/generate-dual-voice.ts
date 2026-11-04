import {accountEnv} from './account-context';
import type {Job} from './jobs';
import type {VoiceTiming} from './vo-cleanup';
import {dualVoice,resolveSpeakerSegments} from './dual-voice';
import {prepareNarration} from './localize';
import {generateVO} from './elevenlabs';
import {putMedia} from './media';
import {safeDownload} from './safe-fetch';
import {joinVoices,fitIntroduction} from './join-voices';
export type SpeakerTake={url:string;originalUrl:string;timing:VoiceTiming;voiceId:string;speakerNumber?:1|2|3;startSeconds?:number;endSeconds?:number};
export async function generateDualVoice(job:Job,paid:()=>Promise<void>,save:(update:(job:Job)=>void)=>Promise<void>){
 const script=job.result!.uk_script,settings=dualVoice(job.dualVoice,script,job.voiceId)!;
 const segments=resolveSpeakerSegments(script,job.voiceId,settings);
 const takes:SpeakerTake[]=[];
 for(let i=0;i<segments.length;i++){
  const seg=segments[i];
  const cached=job.speakerTakes?.[i];if(cached){takes.push(cached);continue;}
  await paid();
  const narration=await prepareNarration(seg.text,job.provider,job.model,job.market);
  let originalUrl='',timing:VoiceTiming|undefined;
  // One ambience bed is applied after all voices are joined.
  const audio=await generateVO(narration,seg.voiceId,async(raw,t)=>{originalUrl=await putMedia(`vo/${job.id}-r${job.revision||0}-speaker-${i+1}-original.mp3`,Buffer.from(raw),'audio/mpeg');timing=t;},{...job.voiceProcessing!,ambience:'none'},'voiceover',job.market);
  if(!timing)throw Error('Speaker timing is missing.');
  const url=await putMedia(`vo/${job.id}-r${job.revision||0}-speaker-${i+1}.wav`,Buffer.from(audio),'audio/wav');
  const take:SpeakerTake={url,originalUrl,timing,voiceId:seg.voiceId,speakerNumber:seg.speakerNumber,startSeconds:seg.startSeconds,endSeconds:seg.endSeconds};
  takes.push(take);
  await save(j=>{j.speakerTakes={...j.speakerTakes,[i]:take};});
 }
 const load=async(url:string)=>new Uint8Array((await safeDownload(url,150*1024*1024)).buffer).buffer;
 const cleanParts=await Promise.all(takes.map(t=>load(t.url)));
 const paddings=segments.map(()=>0);
 let speed=1;
 const isMultiRange=segments.length>2||settings.endSeconds!==undefined||!!settings.speaker3;
 for(let i=0;i<segments.length;i++){
  const targetDur=segments[i].targetDurationSeconds;
  if(targetDur!==undefined&&targetDur>0){
   const fitted=await fitIntroduction(cleanParts[i],targetDur,isMultiRange?1.35:1.15);
   cleanParts[i]=fitted.audio;
   paddings[i]=fitted.paddingSeconds;
   if(i===0)speed=fitted.speed;
  }
 }
 const switchSeconds=settings.startSeconds??takes[0].timing.trimmedSeconds;
 const totalTrimmed=segments.reduce((sum,seg,i)=>sum+(seg.targetDurationSeconds!==undefined&&seg.targetDurationSeconds>0?seg.targetDurationSeconds:takes[i].timing.trimmedSeconds),0);
 const timing:VoiceTiming={originalSeconds:takes.reduce((n,t)=>n+t.timing.originalSeconds,0),trimmedSeconds:totalTrimmed,removedSeconds:takes.reduce((n,t)=>n+t.timing.removedSeconds,0),cleanupVersion:'dual-voice-v1',processing:job.voiceProcessing,speakerSwitchSeconds:switchSeconds,speaker1Speed:speed};
 const padArg=segments.length===2&&paddings.slice(1).every(p=>p===0)?paddings[0]:paddings;
 let audio=await joinVoices(cleanParts,padArg);
 const original=await joinVoices(await Promise.all(takes.map(t=>load(t.originalUrl))));
 const originalUrl=await putMedia(`vo/${job.id}-r${job.revision||0}-original.wav`,Buffer.from(original),'audio/wav');
 if(job.voiceProcessing?.ambience&&job.voiceProcessing.ambience!=='none'&&job.voiceProcessing.mode!=='aggressive'){
  await paid();const {addStoryAmbience}=await import('./story-ambience');audio=await addStoryAmbience(audio,job.voiceProcessing.ambience,timing,accountEnv('ELEVENLABS_API_KEY')!);
 }
 const url=await putMedia(`vo/${job.id}-r${job.revision||0}.wav`,Buffer.from(audio),'audio/wav');
 await save(j=>{j.voUrl=url;j.voOriginalUrl=originalUrl;j.voTiming=timing;});return url;
}
