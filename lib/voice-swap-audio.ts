import {currentWorkspace} from './account-context';
import {accountEnv} from './account-context';
import ffmpeg from 'ffmpeg-static';
import {execFile,spawn} from 'node:child_process';
import {Transform,type Readable} from 'node:stream';
import {promisify} from 'node:util';
import {createWriteStream} from 'node:fs';
import {readFile,stat} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';
import {inflateRawSync} from 'node:zlib';
import {openVideoStream} from './stream-media';
import {SWAP_MAX_BYTES,SWAP_MAX_SECONDS,swapMixFilter,type SwapMix} from './voice-swap-model';
const run=promisify(execFile);
/** Remote FFmpeg inputs must be our stored MP4/MOV, never an arbitrary user URL or playlist. */
export function storedSwapSource(value:string){
 const url=new URL(value),base=process.env.SUPABASE_URL;
 const prefix=currentWorkspace()?'users/'+currentWorkspace()!.id+'/':'';const supabase=base&&url.origin===new URL(base).origin&&url.pathname.startsWith('/storage/v1/object/public/szekspir-media/'+prefix+'sources/');
 const blob=url.hostname.endsWith('.public.blob.vercel-storage.com')&&url.pathname.startsWith('/'+prefix+'sources/');
 if(url.protocol!=='https:'||url.username||url.password||url.port||(!supabase&&!blob)||!/^\/.*\/source\.(mp4|mov)$/i.test(url.pathname))throw Error('Only the saved original video can be processed.');
 return url.href;
}
function sourceInput(source:string){return source.startsWith('https:')?['-rw_timeout','30000000','-protocol_whitelist','https,tls,tcp','-f','mov','-i',source]:['-i',source];}
export async function swapFfmpeg(args:string[]){if(!ffmpeg)throw Error('Audio processor is unavailable.');return run(ffmpeg,['-hide_banner','-nostdin','-y',...args],{timeout:200000,maxBuffer:4*1024*1024});}
export async function downloadSwapMedia(url:string,path:string,limit=SWAP_MAX_BYTES){
 const input=await openVideoStream(url);let bytes=0;
 try{await pipeline(input,new Transform({transform(chunk:Buffer,_e,cb){bytes+=chunk.length;cb(bytes>limit?Error('Media exceeds the processing size limit.'):null,chunk);}}),createWriteStream(path,{mode:0o600}));}finally{input.destroy();}
 if(!bytes)throw Error('Empty media file.');
}
export async function probeSwapMedia(path:string,video=false){
 const {stderr}=await swapFfmpeg([...sourceInput(path),'-map',video?'0:v:0':'0:a:0','-c','copy','-t','0','-f','null','-']);
 const m=/Duration: (\d+):(\d+):([\d.]+)/.exec(stderr);const seconds=m?Number(m[1])*3600+Number(m[2])*60+Number(m[3]):0;
 if(!seconds||seconds>SWAP_MAX_SECONDS)throw Error('Use a recording up to 5 minutes long.');return seconds;
}
export async function prepareSwapAudio(input:string,output:string){
 const seconds=await probeSwapMedia(input,true);
 await swapFfmpeg(['-v','error',...sourceInput(input),'-map','0:a:0','-vn','-ar','44100','-ac','2','-c:a','pcm_s16le',output]);return seconds;
}
/** Bounded ZIP reader: central-directory sizes are checked before inflation; filenames never touch disk. */
export function readSwapStems(zip:Buffer){
 if(zip.length>60*1024*1024)throw Error('Stem archive is too large.');
 let end=-1;for(let i=zip.length-22;i>=Math.max(0,zip.length-65557);i--)if(zip.readUInt32LE(i)===0x06054b50){end=i;break;}
 if(end<0)throw Error('Provider did not return a ZIP archive.');
 const count=zip.readUInt16LE(end+10);let at=zip.readUInt32LE(end+16);if(count<2||count>12)throw Error('Unexpected number of audio stems.');
 const result:{background?:Buffer;vocals?:Buffer}={};let total=0;
 for(let i=0;i<count;i++){
  if(at+46>zip.length||zip.readUInt32LE(at)!==0x02014b50)throw Error('Invalid stem archive.');
  const method=zip.readUInt16LE(at+10),compressed=zip.readUInt32LE(at+20),size=zip.readUInt32LE(at+24),nameSize=zip.readUInt16LE(at+28),extra=zip.readUInt16LE(at+30),comment=zip.readUInt16LE(at+32),local=zip.readUInt32LE(at+42);
  const name=zip.subarray(at+46,at+46+nameSize).toString().split('/').pop()||'';at+=46+nameSize+extra+comment;total+=size;
  if(total>120*1024*1024||size>60*1024*1024||local+30>zip.length||zip.readUInt32LE(local)!==0x04034b50)throw Error('Stem archive exceeds safe limits.');
  const base=name.replace(/\.mp3$/i,'');const kind=!/\.mp3$/i.test(name)?undefined:/(?:^|[_ .-])(?:instrumental|background|accompaniment|no[_ -]?vocals)(?:$|[_ .-])/i.test(base)?'background':/(?:^|[_ .-])(?:vocals?|voice)(?:$|[_ .-])/i.test(base)?'vocals':undefined;
  if(!kind)continue;if(result[kind])throw Error('Ambiguous audio stems.');
  const start=local+30+zip.readUInt16LE(local+26)+zip.readUInt16LE(local+28);if(start+compressed>zip.length||![0,8].includes(method)||zip.readUInt16LE(local+6)&1)throw Error('Unsupported stem archive.');
  const raw=zip.subarray(start,start+compressed);const data=method===0?Buffer.from(raw):inflateRawSync(raw,{maxOutputLength:Math.max(1,size)});
  if(data.length!==size||!data.length)throw Error('Incomplete audio stem.');result[kind]=data;
 }
 if(!result.background||!result.vocals)throw Error('Could not identify the instrumental and vocal stems. Separation is saved; do not submit it again.');return {background:result.background,vocals:result.vocals};
}
export async function requestSwapStems(audioPath:string){
 const key=accountEnv('ELEVENLABS_API_KEY');if(!key)throw Error('ElevenLabs is not configured.');
 const form=new FormData();form.set('file',new Blob([new Uint8Array(await readFile(audioPath))],{type:'audio/wav'}),'source.wav');form.set('stem_variation_id','two_stems_v1');
 // Never retry a paid request: a transport timeout has an unknown provider outcome.
 const r=await fetch('https://api.elevenlabs.io/v1/music/stem-separation?output_format=mp3_44100_128',{method:'POST',headers:{'xi-api-key':key},body:form,signal:AbortSignal.timeout(230000)});
 if(!r.ok)throw Error(`ElevenLabs separation returned HTTP ${r.status}. Check your account before starting another paid separation.`);
 const reader=r.body?.getReader();if(!reader)throw Error('Empty provider response.');const parts:Buffer[]=[];let bytes=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>60*1024*1024)throw Error('Stem archive is too large.');parts.push(Buffer.from(value));}}finally{await reader.cancel().catch(()=>{});}
 return Buffer.concat(parts);
}
export async function renderSwapVideo(source:string,background:string,voice:string,output:string,mix:SwapMix,seconds:number){
 const voiceSeconds=await probeSwapMedia(voice);
 if(voiceSeconds+mix.offset>seconds+.1)throw Error('The new voiceover extends past the video. Shorten the voiceover or reduce its start offset; speech was not cut.');
 await swapFfmpeg(['-v','error','-i',source,'-i',background,'-i',voice,'-filter_complex',swapMixFilter(mix,seconds),'-map','0:v:0','-map','[mix]','-map_metadata','0','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(seconds),'-movflags','+faststart',output]);
 if((await stat(output)).size>SWAP_MAX_BYTES)throw Error('Output exceeds the processing size limit.');
}
export async function streamSwapVideo(source:string,background:string,voice:string,mix:SwapMix,seconds:number,save:(body:Readable)=>Promise<string>){
 const voiceSeconds=await probeSwapMedia(voice);
 if(voiceSeconds+mix.offset>seconds+.1)throw Error('The new voiceover extends past the video. Shorten the voiceover or reduce its start offset; speech was not cut.');
 if(!ffmpeg)throw Error('Audio processor is unavailable.');
 const child=spawn(ffmpeg,['-hide_banner','-nostdin','-v','error',...sourceInput(source),'-i',background,'-i',voice,'-filter_complex',swapMixFilter(mix,seconds),'-map','0:v:0','-map','[mix]','-map_metadata','0','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(seconds),'-movflags','+frag_keyframe+delay_moov+default_base_moof','-f','mp4','pipe:1'],{stdio:['ignore','pipe','pipe']});
 let stderr='';child.stderr.on('data',b=>{stderr=(stderr+b.toString()).slice(-1500);});
 const completed=new Promise<void>((resolve,reject)=>{child.once('error',reject);child.once('close',code=>code===0?resolve():reject(Error(`Video export failed: ${stderr.slice(-350)}`)));});
 // Observe rejection immediately while storage applies backpressure to FFmpeg stdout.
 void completed.catch(()=>{});const timer=setTimeout(()=>child.kill('SIGKILL'),230000);
 const output=new Transform({transform(chunk,_encoding,done){done(null,chunk);},flush(done){void completed.then(()=>done(),error=>done(error));}});child.stdout.on('error',error=>output.destroy(error));child.stdout.pipe(output);
 try{const [url]=await Promise.all([save(output),completed]);return url;}
 finally{clearTimeout(timer);if(child.exitCode===null)child.kill('SIGKILL');child.stdout.unpipe(output);child.stdout.destroy();output.destroy();}
}
