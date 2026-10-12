import {voiceProcessing,pauseShorteningMs,voiceTempoFactor,breathsEnabled,PAUSE_PROFILES,EXTRA_PAUSE_SECONDS,type VoiceProcessing} from './voice-processing';
import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const run=promisify(execFile);
export const VO_CLEANUP_VERSION='pause-cleanup-v17-adjustable';
// Profile-controlled trimming preserves speech samples and retains quiet gap margins.
async function trimPass(input:string,output:string,duration:number,profile:ReadonlyArray<readonly [number,number,number]>,protectBreaths:boolean,hook:boolean,extraPauseSeconds=EXTRA_PAUSE_SECONDS){
 const minimum=Math.min(...profile.map(p=>p[0]));
 const detected=await run(ffmpeg!,['-hide_banner','-nostdin','-i',input,'-af',`silencedetect=noise=${protectBreaths?-60:-34}dB:d=${minimum}`,'-f','null','-'],{timeout:90000,maxBuffer:8*1024*1024});
 const cuts:Array<[number,number]>=[];let start:number|undefined;
 for(const match of detected.stderr.matchAll(/silence_(start|end): ([\d.]+)/g)){
  if(match[1]==='start'){start=Number(match[2]);continue;}
  const end=Number(match[2]);
  if(start!==undefined&&start>.1&&end<duration-.1&&end-start>=minimum){
   let remaining=end-start;
   for(const [threshold,remove,retain] of profile){if(remaining>=threshold)remaining-=Math.min(remove,Math.max(0,remaining-retain));}
   // Storytelling only trims near-silence, with at least 200 ms untouched on each side.
   const amount=Math.max(0,Math.min(end-start-remaining-extraPauseSeconds,end-start-(protectBreaths ? 0.4 : 0))),middle=(start+end)/2;
   const a=middle-amount/2,b=Math.min(middle+amount/2,hook?duration-.5:duration);
   if(amount>0&&b>a)cuts.push([a,b]);
  }
  start=undefined;
 }
 const segments:Array<[number,number]>=[];let previous=0;
 for(const [a,b] of cuts){segments.push([previous,a]);previous=b;}
 segments.push([previous,duration]);
 const filters=segments.map(([a,b],i)=>`[0:a]atrim=start=${a}${i===segments.length-1?'':`:end=${b}`},asetpts=PTS-STARTPTS[a${i}]`);
 filters.push(segments.map((_,i)=>`[a${i}]`).join('')+`concat=n=${segments.length}:v=0:a=1${hook?',apad=pad_dur=0.5':''}[out]`);
 await run(ffmpeg!,['-hide_banner','-loglevel','error','-nostdin','-n','-i',input,'-filter_complex',filters.join(';'),'-map','[out]','-c:a','pcm_f32le',output],{timeout:90000,maxBuffer:1024*1024});
}
export async function audioDuration(input:string){
 const check=await run(ffmpeg!,['-hide_banner','-loglevel','info','-nostdin','-i',input,'-map','0:a:0','-af','ashowinfo','-f','null','-'],{timeout:30000,maxBuffer:16*1024*1024});
 const frames=[...check.stderr.matchAll(/rate:(\d+).*?nb_samples:(\d+)/g)];
 const duration=frames.reduce((sum,m)=>sum+Number(m[2])/Number(m[1]),0);
 if(!Number.isFinite(duration)||duration<=0)throw Error('Invalid audio duration');
 return duration;
}
export type VoiceTiming={tempoAdjustment?:{version:string;factor:number;inputSeconds:number;outputSeconds:number};modelId?:string;speakerSwitchSeconds?:number;speakerTimingWarning?:string;speaker1Speed?:number;pace?:import('./source-pace').SourcePace;paceAdjustment?:{version:string;inputSeconds:number;outputSeconds:number;targetSeconds:number;factor:number};paceWarning?:string;originalSeconds:number;trimmedSeconds:number;removedSeconds:number;cleanupVersion:string;processing?:VoiceProcessing;addedTailSeconds?:number;dryUrl?:string;ambienceUrl?:string;ambienceWarning?:string};
export async function cleanVoiceover(raw:ArrayBuffer,onTiming?:(timing:VoiceTiming)=>void,options?:VoiceProcessing,kind:'voiceover'|'hook'='voiceover'):Promise<ArrayBuffer>{
 const processing=voiceProcessing(options);
 if(!ffmpeg)throw Error('Voiceover cleanup is unavailable');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-vo-'));
 try{
  const input=join(dir,'raw.audio'),output=join(dir,'clean.wav');
  await writeFile(input,Buffer.from(raw),{mode:0o600});
  const originalSeconds=await audioDuration(input);
  const shortening=pauseShorteningMs(processing)/1000;
  if(processing.mode==='gentle'&&shortening>0){
   // Cut only the middle of long near-silent gaps; retain 200 ms on either side.
   await trimPass(input,output,originalSeconds,[[.7,shortening,.4]],true,kind==='hook',0);
  }else if(processing.mode==='gentle'){
   await run(ffmpeg!,['-hide_banner','-loglevel','error','-nostdin','-n','-i',input,...(kind==='hook'?['-af','apad=pad_dur=0.5']:[]),'-c:a','pcm_f32le',output],{timeout:90000,maxBuffer:1024*1024});
  }else await trimPass(input,output,originalSeconds,PAUSE_PROFILES[processing.mode],breathsEnabled(processing)||kind==='hook',kind==='hook');
  const pauseSeconds=await audioDuration(output),addedTailSeconds=kind==='hook'?0.5:0;
  const timing:VoiceTiming={originalSeconds,trimmedSeconds:pauseSeconds,removedSeconds:Math.max(0,originalSeconds+addedTailSeconds-pauseSeconds),cleanupVersion:VO_CLEANUP_VERSION,processing,addedTailSeconds};
  const factor=voiceTempoFactor(processing);
  let delivered=output;
  if(factor>1){
   delivered=join(dir,'tempo.wav');
   const filters=kind==='hook'?`atrim=end=${pauseSeconds-addedTailSeconds},asetpts=PTS-STARTPTS,atempo=${factor},apad=pad_dur=0.5`:`atempo=${factor}`;
   await run(ffmpeg!,['-hide_banner','-loglevel','error','-nostdin','-n','-i',output,'-af',filters,'-c:a','pcm_f32le',delivered],{timeout:90000,maxBuffer:1024*1024});
   const seconds=await audioDuration(delivered),expected=(pauseSeconds-addedTailSeconds)/factor+addedTailSeconds;
   if(Math.abs(seconds-expected)>Math.max(.1,pauseSeconds*.001))throw Error('Speech tempo could not be confirmed');
   timing.tempoAdjustment={version:'manual-tempo-v1',factor,inputSeconds:pauseSeconds,outputSeconds:seconds};timing.trimmedSeconds=seconds;
  }
  onTiming?.(timing);
  const clean=await readFile(delivered);if(clean.length<128)throw Error('Empty cleaned audio');
  return new Uint8Array(clean).buffer;
 }catch{throw Error('Voiceover pause cleanup failed. No unprocessed audio was published.');}
 finally{await rm(dir,{recursive:true,force:true});}
}
