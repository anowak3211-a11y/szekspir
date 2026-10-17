import {currentWorkspace} from './account-context';
import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const run=promisify(execFile);
export function storedCopyVideo(value:string){
 const url=new URL(value),base=process.env.SUPABASE_URL,prefix=currentWorkspace()?'users/'+currentWorkspace()!.id+'/':'';
 const ours=base&&url.origin===new URL(base).origin&&url.pathname.startsWith('/storage/v1/object/public/szekspir-media/'+prefix+'sources/');
 const blob=url.hostname.endsWith('.public.blob.vercel-storage.com')&&url.pathname.startsWith('/'+prefix+'sources/');
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||(!ours&&!blob)||!url.pathname.match(/\/source\.(mp4|mov|webm)$/i))throw Error('Upload the original video first, or use an exact saved Szekspir video link.');
 return url.href;
}
/** Force a single-file demuxer: media cannot supply a playlist or another network input. */
export async function videoCopyAudio(value:string){
 const url=storedCopyVideo(value);if(!ffmpeg)throw Error('Audio processor is unavailable.');
 const input=['-rw_timeout','20000000','-protocol_whitelist','https,tls,tcp','-f',/\.webm$/i.test(new URL(url).pathname)?'matroska':'mov','-i',url];
 const probe=await run(ffmpeg,['-hide_banner','-nostdin',...input,'-map','0:a:0','-c','copy','-t','0','-f','null','-'],{timeout:30000,maxBuffer:1024*1024});
 const match=/Duration: (\d+):(\d+):([\d.]+)/.exec(probe.stderr),seconds=match?Number(match[1])*3600+Number(match[2])*60+Number(match[3]):0;
 if(!seconds||seconds>1200)throw Error('Automatic video copy supports speech recordings up to 20 minutes. Use a saved script for longer videos.');
 const dir=await mkdtemp(join(tmpdir(),'meta-video-copy-'));
 try{
  const path=join(dir,'speech.mp3');
  await run(ffmpeg,['-hide_banner','-nostdin','-y',...input,'-map','0:a:0','-vn','-t','1200','-ac','1','-ar','16000','-b:a','32k',path],{timeout:90000,maxBuffer:1024*1024});
  const bytes=await readFile(path);if(!bytes.length||bytes.length>24*1024*1024)throw Error('Video audio exceeds the transcription limit.');
  return new File([new Uint8Array(bytes)],'speech.mp3',{type:'audio/mpeg'});
 }finally{await rm(dir,{recursive:true,force:true});}
}
