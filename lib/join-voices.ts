import {audioDuration} from './vo-cleanup';
import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const run=promisify(execFile);
/** Concatenate full takes without stretching, normalisation, or overlapping speech. */
export async function joinVoices(parts:ArrayBuffer[],paddingSeconds:number|number[]=0):Promise<ArrayBuffer>{
 const paddings=Array.isArray(paddingSeconds)?paddingSeconds:parts.map((_,i)=>i===0?paddingSeconds:0);
 if(parts.length<2||!ffmpeg||paddings.some(p=>!Number.isFinite(p)||p<0||p>3600))throw Error('Invalid speaker audio.');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-speakers-'));
 try{
  const paths=parts.map((_,i)=>join(dir,`${i}.audio`));
  await Promise.all(paths.map((p,i)=>writeFile(p,Buffer.from(parts[i]),{mode:0o600})));
  const out=join(dir,'joined.wav');
  const chains=parts.map((_,i)=>{
   const pad=paddings[i]||0;
   return `[${i}:a]aresample=44100,aformat=sample_fmts=flt:channel_layouts=mono,asetpts=PTS-STARTPTS${pad?`,apad=pad_dur=${pad}`:''}[a${i}]`;
  });
  const filter=`${chains.join(';')};${parts.map((_,i)=>`[a${i}]`).join('')}concat=n=${parts.length}:v=0:a=1[out]`;
  await run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-n',...paths.flatMap(p=>['-i',p]),'-filter_complex',filter,'-map','[out]','-c:a','pcm_f32le',out],{timeout:90000,maxBuffer:1024*1024});
  return new Uint8Array(await readFile(out)).buffer;
 }finally{await rm(dir,{recursive:true,force:true});}
}

/** Fit a speaker segment to its target duration window. Never truncate speech or silently move the switch. */
export async function fitIntroduction(audio:ArrayBuffer,target:number,maxSpeed=1.15){
 if(!ffmpeg||!Number.isFinite(target)||target<=0||target>3600)throw Error('Choose a positive start time for speaker 2.');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-intro-'));
 try{
  const input=join(dir,'intro.wav'),output=join(dir,'fitted.wav');
  await writeFile(input,Buffer.from(audio),{mode:0o600});
  const duration=await audioDuration(input);
  const speed=duration>target?duration/Math.max(.001,target-.05):1;
  if(speed>maxSpeed)throw Error(`The segment lasts ${duration.toFixed(2)}s and cannot fit inside ${target.toFixed(2)}s without excessive acceleration. Shorten the text or widen the time range. All takes are saved; no words were cut.`);
  if(speed>1){await run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-n','-i',input,'-af',`atempo=${speed}`,'-c:a','pcm_f32le',output],{timeout:90000,maxBuffer:1024*1024});}
  const path=speed>1?output:input,actual=await audioDuration(path);
  if(actual>target+.00001)throw Error('The segment could not be fitted safely. Choose a slightly wider time window; no words were cut.');
  return {audio:new Uint8Array(await readFile(path)).buffer,paddingSeconds:Math.max(0,target-actual),speed};
 }finally{await rm(dir,{recursive:true,force:true});}
}
