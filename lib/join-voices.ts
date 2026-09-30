import {audioDuration} from './vo-cleanup';
import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const run=promisify(execFile);
/** Concatenate full takes without stretching, normalisation, or overlapping speech. */
export async function joinVoices(parts:ArrayBuffer[],paddingSeconds=0):Promise<ArrayBuffer>{
 if(parts.length!==2||!ffmpeg||!Number.isFinite(paddingSeconds)||paddingSeconds<0||paddingSeconds>3600)throw Error('Invalid speaker audio.');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-speakers-'));
 try{
  const paths=parts.map((_,i)=>join(dir,`${i}.audio`));
  await Promise.all(paths.map((p,i)=>writeFile(p,Buffer.from(parts[i]),{mode:0o600})));
  const out=join(dir,'joined.wav');
  const filter=`[0:a]aresample=44100,aformat=sample_fmts=flt:channel_layouts=mono,asetpts=PTS-STARTPTS${paddingSeconds?`,apad=pad_dur=${paddingSeconds}`:''}[a];[1:a]aresample=44100,aformat=sample_fmts=flt:channel_layouts=mono,asetpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=0:a=1[out]`;
  await run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-n',...paths.flatMap(p=>['-i',p]),'-filter_complex',filter,'-map','[out]','-c:a','pcm_f32le',out],{timeout:90000,maxBuffer:1024*1024});
  return new Uint8Array(await readFile(out)).buffer;
 }finally{await rm(dir,{recursive:true,force:true});}
}

/** Fit only the introduction. Never truncate speech or silently move the switch. */
export async function fitIntroduction(audio:ArrayBuffer,target:number){
 if(!ffmpeg||!Number.isFinite(target)||target<=0||target>3600)throw Error('Choose a positive start time for speaker 2.');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-intro-'));
 try{
  const input=join(dir,'intro.wav'),output=join(dir,'fitted.wav');
  await writeFile(input,Buffer.from(audio),{mode:0o600});
  const duration=await audioDuration(input);
  const speed=duration>target?duration/Math.max(.001,target-.05):1;
  if(speed>1.15)throw Error(`The introduction lasts ${duration.toFixed(2)}s and cannot fit before ${target.toFixed(2)}s without excessive acceleration. Shorten speaker 1’s text or choose a later start. Both takes are saved; no words were cut.`);
  if(speed>1){await run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-n','-i',input,'-af',`atempo=${speed}`,'-c:a','pcm_f32le',output],{timeout:90000,maxBuffer:1024*1024});}
  const path=speed>1?output:input,actual=await audioDuration(path);
  if(actual>target+.00001)throw Error('The introduction could not be fitted safely. Choose a slightly later start; no words were cut.');
  return {audio:new Uint8Array(await readFile(path)).buffer,paddingSeconds:target-actual,speed};
 }finally{await rm(dir,{recursive:true,force:true});}
}
