import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {VoiceTiming} from './vo-cleanup';
import {putMedia} from './media';
const run=promisify(execFile);
export const AMBIENCE_PROMPTS={
 car:'Seamless natural ambience recorded inside a parked car with the engine idling. Soft steady low engine rumble, closed windows. No voices, speech, music, horns, acceleration or sudden sounds.',
 room:'Seamless subtle indoor room tone in a quiet lived-in home. Very soft steady ventilation and distant air movement. No voices, speech, music, footsteps or sudden sounds.',
 outdoors:'Seamless gentle outdoor ambience in a quiet garden, faint soft breeze through leaves and distant occasional birds. No voices, speech, music, traffic or sudden sounds.'
} as const;
/** Mix a low-level bed without changing voice gain, speed or dynamic range. */
export async function mixStoryAmbience(voice:ArrayBuffer,background:ArrayBuffer,seconds:number):Promise<ArrayBuffer>{
 if(!ffmpeg||!Number.isFinite(seconds)||seconds<=0)throw Error('Invalid ambience mix');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-ambience-'));
 try{
  const vo=join(dir,'voice.wav'),bed=join(dir,'bed.mp3'),out=join(dir,'mix.wav');
  await writeFile(vo,Buffer.from(voice),{mode:0o600});await writeFile(bed,Buffer.from(background),{mode:0o600});
  const filter=`[1:a]aresample=44100,aloop=loop=-1:size=1323000,volume=0.025,atrim=duration=${seconds},afade=t=in:d=0.2,afade=t=out:st=${Math.max(0,seconds-.3)}:d=0.3[bed];[0:a][bed]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[out]`;
  await run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-n','-i',vo,'-i',bed,'-filter_complex',filter,'-map','[out]','-t',String(seconds),'-c:a','pcm_f32le',out],{timeout:90000,maxBuffer:1024*1024});
  return new Uint8Array(await readFile(out)).buffer;
 }finally{await rm(dir,{recursive:true,force:true});}
}
export async function addStoryAmbience(clean:ArrayBuffer,scene:keyof typeof AMBIENCE_PROMPTS,timing:VoiceTiming,apiKey:string){
 // Keep dry narration usable even if the optional provider call fails. Never retry a paid call here.
 try{
  const id=crypto.randomUUID();
  timing.dryUrl=await putMedia(`vo/${id}-dry.wav`,Buffer.from(clean),'audio/wav');
  const r=await fetch('https://api.elevenlabs.io/v1/sound-generation',{
   method:'POST',headers:{'xi-api-key':apiKey,'Content-Type':'application/json'},
   body:JSON.stringify({text:AMBIENCE_PROMPTS[scene],model_id:'eleven_text_to_sound_v2',duration_seconds:10,loop:true,prompt_influence:0.5}),signal:AbortSignal.timeout(90000)
  });
  if(!r.ok)throw Error('Background generation failed');
  const background=await r.arrayBuffer();
  try{
   const mixed=await mixStoryAmbience(clean,background,timing.trimmedSeconds);
   timing.ambienceUrl=await putMedia(`vo/${id}-ambience.mp3`,Buffer.from(background),'audio/mpeg');
   return mixed;
  }finally{new Uint8Array(background).fill(0);}
 }catch{
  timing.ambienceWarning='Background sound could not be completed. This recording contains the clean voice only; no paid request was retried. You can add ambience separately in the edit.';
  return clean;
 }
}
