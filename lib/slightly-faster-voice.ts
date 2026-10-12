import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {audioDuration,type VoiceTiming} from './vo-cleanup';
const run=promisify(execFile);
export type OriginalVoiceTempo=1|1.05;

/** An explicit 5% playback change; never calibrates against the source video. */
export async function slightlyFasterVoice(audio:ArrayBuffer,timing:VoiceTiming,factor:OriginalVoiceTempo):Promise<ArrayBuffer>{
 if(factor===1)return audio;
 if(factor!==1.05||!Number.isFinite(timing.trimmedSeconds)||timing.trimmedSeconds<=0)throw Error('Choose original pace or 5% faster.');
 if(!ffmpeg)throw Error('The small voice tempo adjustment is unavailable.');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-small-tempo-'));
 try{
  const input=join(dir,'original.wav'),output=join(dir,'slightly-faster.wav'),seconds=timing.trimmedSeconds;
  await writeFile(input,Buffer.from(audio),{mode:0o600});
  await run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-n','-i',input,'-af','atempo=1.05','-c:a','pcm_f32le',output],{timeout:90000,maxBuffer:1024*1024});
  const outputSeconds=await audioDuration(output);
  if(Math.abs(outputSeconds-seconds/factor)>Math.max(.1,seconds*.001))throw Error('The 5% tempo change could not be confirmed.');
  const result=await readFile(output);if(result.length<128)throw Error('Empty adjusted voiceover.');
  timing.tempoAdjustment={version:'explicit-tempo-v1',factor,inputSeconds:seconds,outputSeconds};timing.trimmedSeconds=outputSeconds;
  return new Uint8Array(result).buffer;
 }finally{await rm(dir,{recursive:true,force:true});}
}
