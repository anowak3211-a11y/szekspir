import {voiceProcessing,breathsEnabled,PAUSE_PROFILES,EXTRA_PAUSE_SECONDS,type VoiceProcessing} from './voice-processing';
import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const run=promisify(execFile);
export const VO_CLEANUP_VERSION='pause-cleanup-v15-standard-breaths';
// Profile-controlled trimming preserves speech samples and retains quiet gap margins.
async function trimPass(input:string,output:string,duration:number,profile:ReadonlyArray<readonly [number,number,number]>,protectBreaths:boolean,hook:boolean){
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
   const amount=Math.max(0,Math.min(end-start-remaining-EXTRA_PAUSE_SECONDS,end-start-(protectBreaths ? 0.4 : 0))),middle=(start+end)/2;
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
async function audioDuration(input:string){
 const check=await run(ffmpeg!,['-hide_banner','-loglevel','info','-nostdin','-i',input,'-map','0:a:0','-af','ashowinfo','-f','null','-'],{timeout:30000,maxBuffer:16*1024*1024});
 const frames=[...check.stderr.matchAll(/rate:(\d+).*?nb_samples:(\d+)/g)];
 const duration=frames.reduce((sum,m)=>sum+Number(m[2])/Number(m[1]),0);
 if(!Number.isFinite(duration)||duration<=0)throw Error('Invalid audio duration');
 return duration;
}
export type VoiceTiming={originalSeconds:number;trimmedSeconds:number;removedSeconds:number;cleanupVersion:string;processing?:VoiceProcessing;addedTailSeconds?:number;dryUrl?:string;ambienceUrl?:string;ambienceWarning?:string};
export async function cleanVoiceover(raw:ArrayBuffer,onTiming?:(timing:VoiceTiming)=>void,options?:VoiceProcessing,kind:'voiceover'|'hook'='voiceover'):Promise<ArrayBuffer>{
 const processing=voiceProcessing(options);
 if(!ffmpeg)throw Error('Voiceover cleanup is unavailable');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-vo-'));
 try{
  const input=join(dir,'raw.audio'),output=join(dir,'clean.wav');
  await writeFile(input,Buffer.from(raw),{mode:0o600});
  const originalSeconds=await audioDuration(input);
  if(processing.mode==='gentle'){
   // Preserve every decoded sample, including breathing, hesitation and the full ending.
   await run(ffmpeg!,['-hide_banner','-loglevel','error','-nostdin','-n','-i',input,...(kind==='hook'?['-af','apad=pad_dur=0.5']:[]),'-c:a','pcm_f32le',output],{timeout:90000,maxBuffer:1024*1024});
  }else await trimPass(input,output,originalSeconds,PAUSE_PROFILES[processing.mode],breathsEnabled(processing)||kind==='hook',kind==='hook');
  const trimmedSeconds=await audioDuration(output),addedTailSeconds=kind==='hook'?0.5:0;
  onTiming?.({originalSeconds,trimmedSeconds,removedSeconds:Math.max(0,originalSeconds+addedTailSeconds-trimmedSeconds),cleanupVersion:VO_CLEANUP_VERSION,processing,addedTailSeconds});
  const clean=await readFile(output);if(clean.length<128)throw Error('Empty cleaned audio');
  return new Uint8Array(clean).buffer;
 }catch{throw Error('Voiceover pause cleanup failed. No unprocessed audio was published.');}
 finally{await rm(dir,{recursive:true,force:true});}
}
