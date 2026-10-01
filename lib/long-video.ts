import ffmpeg from 'ffmpeg-static';
import {spawn} from 'node:child_process';
import {createReadStream,createWriteStream} from 'node:fs';
import {mkdtemp,rm,stat,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import {put} from '@vercel/blob';
import {existingMedia,MEDIA_BUCKET,MEDIA_LIMIT,mediaBackend} from './media';
import {openVideoStream} from './stream-media';

const PART_SECONDS=500; // keyframe-aligned cuts have ample room below ten minutes
const MAX_TEMP_BYTES=450*1024*1024;
export type VideoPart={start:number;duration:number;sourceUrl?:string;enhanceTaskId?:string;enhanceSubmittedAt?:number;enhancedUrl?:string;removeTaskId?:string;removeSubmittedAt?:number;removedUrl?:string};
export function needsParts(duration?:number){return Number.isFinite(duration)&&Number(duration)>600;}
export function planParts(duration:number):VideoPart[]{
 if(!Number.isFinite(duration)||duration<=600||duration>1200)throw Error('VMake videos longer than 10 minutes must be at most 20 minutes.');
 const parts:VideoPart[]=[];
 for(let start=0;start<duration;start+=PART_SECONDS)parts.push({start,duration:Math.min(PART_SECONDS,duration-start)});
 return parts;
}
function runFfmpeg(args:string[],input?:NodeJS.ReadableStream){
 const executable=ffmpeg;if(!executable)throw Error('Video processing is unavailable on this server');
 return new Promise<void>((resolve,reject)=>{
  const child=spawn(executable,args,{stdio:['pipe','ignore','pipe']});let stderr='';
  child.stderr.on('data',(b:Buffer)=>{stderr=(stderr+b.toString()).slice(-2000);});
  child.on('error',reject);
  child.on('close',code=>code===0?resolve():reject(Error(`Video processing failed (${code}): ${stderr.slice(-350)}`)));
  if(input){input.on('error',()=>child.kill());input.pipe(child.stdin);child.stdin.on('error',()=>{});}else child.stdin.end();
 });
}
function probeDuration(path:string){
 const executable=ffmpeg;if(!executable)throw Error('Video processing is unavailable on this server');
 return new Promise<number>((resolve,reject)=>{
  const child=spawn(executable,['-hide_banner','-i',path],{stdio:['ignore','ignore','pipe']});let output='';
  child.stderr.on('data',(b:Buffer)=>{output=(output+b.toString()).slice(-4000);});
  child.on('error',reject);
  child.on('close',()=>{const match=output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);const seconds=match?Number(match[1])*3600+Number(match[2])*60+Number(match[3]):NaN;Number.isFinite(seconds)&&seconds>0?resolve(seconds):reject(Error('Could not verify video duration.'));});
 });
}
function sizeGuard(limit:number){let bytes=0;return new Transform({transform(chunk:Buffer,_encoding,callback){bytes+=chunk.length;callback(bytes>limit?Error('Video is too large for server processing; use a lower-bitrate source.'):null,chunk);}});}
async function storeFile(path:string,file:string){
 const size=(await stat(file)).size;if(!size||size>MEDIA_LIMIT)throw Error('Processed video is empty or exceeds the 2 GB storage limit.');
 const prior=await existingMedia(path);if(prior)return prior;
 if(mediaBackend()==='blob')return (await put(path,createReadStream(file),{access:'public',addRandomSuffix:false,contentType:'video/mp4'})).url;
 const origin=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!origin||!key)throw Error('Media storage is not configured');
 const body=createReadStream(file);
 try{
  const r=await fetch(`${origin}/storage/v1/object/${MEDIA_BUCKET}/${path}`,{method:'POST',headers:{Authorization:`Bearer ${key}`,apikey:key,'Content-Type':'video/mp4','Content-Length':String(size),'x-upsert':'false'},body:body as unknown as BodyInit,duplex:'half',signal:AbortSignal.timeout(230000)} as RequestInit);
  if(!r.ok){if(r.status===409){const saved=await existingMedia(path);if(saved)return saved;}throw Error(`Video storage returned HTTP ${r.status}`);}
  return `${origin}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
 }finally{body.destroy();}
}
export async function preparePart(sourceUrl:string,jobId:string,index:number,part:VideoPart){
 if(!/^[\w-]{8,100}$/.test(jobId)||!Number.isSafeInteger(index)||index<0||index>2)throw Error('Invalid video segment');
 const path=`sources/${jobId}/part-${index}.mp4`,prior=await existingMedia(path);if(prior)return prior;
 const dir=await mkdtemp(join(tmpdir(),'szekspir-part-')),input=join(dir,'source.mp4'),output=join(dir,`part-${index}.mp4`);
 try{
  const source=await openVideoStream(sourceUrl);
  try{await pipeline(source,sizeGuard(MAX_TEMP_BYTES/2),createWriteStream(input));}finally{source.destroy();}
  const sourceSize=(await stat(input)).size;
  if(!sourceSize||sourceSize>MAX_TEMP_BYTES/2)throw Error('Source video is too large for 20-minute VMake processing; use a lower-bitrate file.');
  // The segment muxer cuts at shared keyframes, so neighbouring pieces have no
  // dropped or duplicated frames from independent seek operations.
  await runFfmpeg(['-hide_banner','-loglevel','error','-nostdin','-i',input,'-map','0:v:0','-map','0:a:0?','-c','copy','-f','segment','-segment_time',String(PART_SECONDS),'-segment_format','mp4','-segment_format_options','movflags=+faststart','-reset_timestamps','1','-y',join(dir,'part-%d.mp4')]);
  if(part.duration<=0)throw Error('Invalid video segment duration.');
  const outputInfo=await stat(output).catch(e=>{if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;});
  if(!outputInfo)return null; // The previous keyframe-aligned part already contains the short tail.
  if(await probeDuration(output)>=600)throw Error('A source video part still exceeds VMake’s 10-minute limit; re-encode with keyframes at least every minute.');
  if(sourceSize+outputInfo.size>MAX_TEMP_BYTES)throw Error('Video segment is too large for server processing; use a lower-bitrate source.');
  return await storeFile(path,output);
 }finally{await rm(dir,{recursive:true,force:true});}
}
export async function joinParts(urls:string[],jobId:string,suffix='',expectedDuration?:number){
 if(!/^[\w-]{8,100}$/.test(jobId)||!['','-enhanced'].includes(suffix)||urls.length<2||urls.length>3)throw Error('Invalid video join');
 const path=`clean/${jobId}${suffix}.mp4`,prior=await existingMedia(path);if(prior)return prior;
 const dir=await mkdtemp(join(tmpdir(),'szekspir-join-'));
 try{
  const paths:string[]=[];let total=0;
  for(let i=0;i<urls.length;i++){
   const file=join(dir,`part-${i}.mp4`),source=await openVideoStream(urls[i]);
   try{await pipeline(source,sizeGuard(MAX_TEMP_BYTES/2-total),createWriteStream(file));}finally{source.destroy();}
   const size=(await stat(file)).size;total+=size;
   if(!size||total>MAX_TEMP_BYTES/2)throw Error('Enhanced parts are too large to join on this server; use lower-bitrate source video.');
   paths.push(file);
  }
  const list=join(dir,'parts.txt');await writeFile(list,paths.map(p=>`file '${p.replace(/'/g,"'\\''")}'`).join('\n'));
  const output=join(dir,'joined.mp4');await runFfmpeg(['-hide_banner','-loglevel','error','-nostdin','-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart','-y',output]);
  if(expectedDuration&&Math.abs((await probeDuration(output))-expectedDuration)>Math.max(5,expectedDuration*.01))throw Error('Joined video duration differs from the original. The provider parts need manual review.');
  const size=(await stat(output)).size;if(!size||total+size>MAX_TEMP_BYTES)throw Error('Joined video exceeds the server processing limit.');
  return await storeFile(path,output);
 }finally{await rm(dir,{recursive:true,force:true});}
}
