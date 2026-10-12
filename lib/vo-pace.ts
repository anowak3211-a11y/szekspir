import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {audioDuration,type VoiceTiming} from './vo-cleanup';
import {paceCheck,type SourcePace} from './source-pace';

const run=promisify(execFile);
export const VO_PACE_VERSION='source-pace-v1';
export const MAX_VO_TEMPO=1.35;

/** Fit a measured take without rewriting, truncating speech, changing pitch or slowing it down. */
export async function fitVoiceoverPace(audio:ArrayBuffer,timing:VoiceTiming,pace?:SourcePace):Promise<ArrayBuffer>{
 if(!pace||timing.processing?.matchSourcePace===false)return audio;
 timing.pace={...pace,speed:1,calibrated:false};
 timing.paceWarning=undefined;
 const target=pace.targetSeconds,input=timing.trimmedSeconds;
 if(!Number.isFinite(target)||target<1||!Number.isFinite(input)||input<=0)throw Error('Invalid voiceover timing reference.');
 if(input<=target*1.05)return audio;
 const factor=input/target;
 if(factor>MAX_VO_TEMPO){
  timing.paceWarning=`This take needs ${factor.toFixed(2)}× speed to match the source, above the ${MAX_VO_TEMPO.toFixed(2)}× limit. Original timing retained; choose a faster delivery.`;
  return audio;
 }
 if(!ffmpeg)throw Error('Voiceover pace matching is unavailable.');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-pace-'));
 try{
  const source=join(dir,'source.wav'),output=join(dir,'matched.wav');
  await writeFile(source,Buffer.from(audio),{mode:0o600});
  await run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-n','-i',source,'-af',`atempo=${factor}`,'-c:a','pcm_f32le',output],{timeout:90000,maxBuffer:1024*1024});
  const seconds=await audioDuration(output);
  if(!paceCheck(seconds,target).withinTarget)throw Error('The voiceover could not be matched within 5% of the source timing.');
  const fitted=await readFile(output);
  if(fitted.length<128)throw Error('Empty matched voiceover.');
  timing.paceAdjustment={version:VO_PACE_VERSION,inputSeconds:input,outputSeconds:seconds,targetSeconds:target,factor};
  timing.trimmedSeconds=seconds;
  return new Uint8Array(fitted).buffer;
 }finally{await rm(dir,{recursive:true,force:true});}
}
