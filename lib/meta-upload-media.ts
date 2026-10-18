import {createHash} from 'node:crypto';
import {readState,mutate} from './store';
import {metaImageUploadCopy} from './meta-image-upload-copy';
import {withMetaBudget,recordMetaUsage,isMetaRateLimit,MetaBudgetWait} from './meta-rate-limit';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {safeDownload,publicIP} from './safe-fetch';
import {graph,metaToken,metaProof,META_VERSION,MetaError} from './meta-client';
import type {UploadItem} from './meta-uploader-model';
import {driveClient} from './drive-video';

export function driveFileId(url:string){const u=new URL(url);if(u.hostname!=='drive.google.com')return undefined;const match=u.pathname.match(/^\/file\/d\/([\w-]+)\//);return match?.[1]||u.searchParams.get('id')||undefined;}
export async function validateMediaHost(url:string){const u=new URL(url),host=u.hostname.replace(/^\[|\]$/g,'');const ips=isIP(host)?[{address:host}]:await lookup(host,{all:true});if(!ips.length||ips.some(a=>!publicIP(a.address)))throw Error('Only public original media URLs are accepted.');}
export async function originalImage(url:string){
 const id=driveFileId(url);if(!id)return safeDownload(url,24*1024*1024);
 const {drive}=await driveClient(),r=await drive.files.get({fileId:id,alt:'media',supportsAllDrives:true},{responseType:'stream',timeout:45000,retry:false});
 const chunks:Buffer[]=[];let size=0;try{for await(const part of r.data as AsyncIterable<Uint8Array>){size+=part.length;if(size>24*1024*1024)throw Error('Image exceeds 24 MB.');chunks.push(Buffer.from(part));}}finally{(r.data as {destroy:()=>void}).destroy();}
 return {buffer:Buffer.concat(chunks),contentType:String(r.headers['content-type']||'image/jpeg'),url};
}
export async function uploadImage(item:UploadItem){
 if(item.ad.media.kind!=='image')throw Error('Wrong media type.');const original=await originalImage(item.ad.media.url),image=await metaImageUploadCopy(original.buffer,original.contentType,item.ad.media.filename);if(!/^image\/(?:jpeg|png|webp)$/.test(image.contentType.split(';')[0]))throw Error('Choose an original JPEG, PNG or WebP.');
 const cacheKey='meta-image-upload-'+createHash('sha256').update(item.ad.accountId+'\0').update(image.buffer).digest('hex'),cached=(await readState<{hash?:string;at?:number}>(cacheKey,{})).value;
 if(cached.hash&&/^[a-f0-9]{32}$/i.test(cached.hash)&&(cached.at||0)>Date.now()-86400000)return cached.hash;
 const form=new FormData();form.set('filename',new Blob([new Uint8Array(image.buffer)],{type:image.contentType}),image.filename);const token=await metaToken(),proof=await metaProof(token);if(proof)form.set('appsecret_proof',proof);let cooldown=0;let r:Response,d:{images?:Record<string,{hash?:string}>;error?:{code?:number;error_subcode?:number;error_user_msg?:string;message?:string}}={};
 try{r=await withMetaBudget(async()=>{const started=Date.now(),response=await fetch(`https://graph.facebook.com/${META_VERSION}/act_${item.ad.accountId}/adimages`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form,signal:AbortSignal.timeout(90000)});try{d=await response.json();}finally{cooldown=await recordMetaUsage(response.headers,isMetaRateLimit(Number(d.error?.code||response.status)),{operation:'act_:id/adimages',method:'POST',status:response.status,code:Number(d.error?.code||response.status),subcode:Number(d.error?.error_subcode||0),durationMs:Date.now()-started});}return response;},3);}catch(e){budgetWait(e);throw new MetaError(0,0,true,true,'Image upload was not confirmed. Check the library before retrying.');}
 const hash=d.images&&Object.values(d.images)[0]?.hash;if(!r.ok||!hash){const code=Number(d.error?.code||r.status),rate=isMetaRateLimit(code);throw Object.assign(new MetaError(code,Number(d.error?.error_subcode||0),rate||r.status>=500,r.status>=500,`Meta image upload rejected (${code}/${Number(d.error?.error_subcode||0)}). ${String(d.error?.error_user_msg||d.error?.message||'No image hash returned.').replaceAll(token,'[redacted]').replace(/https?:\/\/\S+/g,'[link]').slice(0,250)}`),{rateLimited:rate,retryAfterSeconds:rate?Math.max(300,cooldown):undefined});}await mutate<{hash?:string;at?:number},void>(cacheKey,{},s=>{s.hash=hash;s.at=Date.now();});return hash;
}
function offsets(data:{start_offset?:string;end_offset?:string},size:number){const start=Number(data.start_offset),end=Number(data.end_offset);if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start||end>size||end-start>32*1024*1024)throw Error('Invalid Meta upload offsets.');return {start,end};}
export async function startRemoteVideo(item:UploadItem):Promise<Pick<UploadItem,'videoId'|'transfer'|'phase'>>{
 if(item.ad.media.kind!=='video')throw Error('Wrong media type.');await validateMediaHost(item.ad.media.url);
 const fileId=driveFileId(item.ad.media.url);
 if(fileId){const {drive}=await driveClient();const meta=(await drive.files.get({fileId,supportsAllDrives:true,fields:'size,mimeType,md5Checksum,trashed'},{timeout:15000,retry:false})).data;const size=Number(meta.size);if(meta.trashed||!meta.mimeType?.startsWith('video/')||!Number.isSafeInteger(size)||size<=0||size>2*1024*1024*1024||!meta.md5Checksum)throw Error('Drive original is unavailable, empty, or exceeds 2 GB.');
  const r=await graph<{video_id:string;upload_session_id:string;start_offset:string;end_offset:string}>(`act_${item.ad.accountId}/advideos`,{upload_phase:'start',file_size:size},'POST',undefined,true);
  if(!/^\d+$/.test(r.video_id)||!/^\d+$/.test(r.upload_session_id))throw Error('Invalid Meta video session.');return {videoId:r.video_id,phase:'transfer',transfer:{sessionId:r.upload_session_id,fileId,size,checksum:meta.md5Checksum,...offsets(r,size)}};
 }
 const r=await graph<{id:string}>(`act_${item.ad.accountId}/advideos`,{file_url:item.ad.media.url,title:item.ad.media.filename},'POST',undefined,true);if(!/^\d+$/.test(r.id))throw Error('Meta did not return a video ID.');return {videoId:r.id,phase:'processing'};
}
export async function transferOriginalChunk(item:UploadItem){
 const t=item.transfer;if(!t)throw Error('Missing upload session.');if(t.start===t.end)return {...t};const {drive}=await driveClient();
 const meta=(await drive.files.get({fileId:t.fileId,supportsAllDrives:true,fields:'size,md5Checksum,trashed'},{timeout:15000,retry:false})).data;
 if(meta.trashed||Number(meta.size)!==t.size||meta.md5Checksum!==t.checksum)throw Error('The original Drive file changed during upload. Previous media is preserved.');
 const r=await drive.files.get({fileId:t.fileId,alt:'media',supportsAllDrives:true},{responseType:'stream',headers:{Range:`bytes=${t.start}-${t.end-1}`},timeout:60000,retry:false});
 const wanted=t.end-t.start,chunks:Buffer[]=[];let n=0;try{for await(const chunk of r.data as AsyncIterable<Uint8Array>){n+=chunk.length;if(n>wanted)throw Error('Drive did not honour the original byte range.');chunks.push(Buffer.from(chunk));}}finally{(r.data as {destroy:()=>void}).destroy();}
 if(n!==wanted||r.status!==206||!String(r.headers['content-range']).startsWith(`bytes ${t.start}-${t.end-1}/`))throw Error('Original video chunk could not be verified.');
 const body=new FormData();body.set('upload_phase','transfer');body.set('upload_session_id',t.sessionId);body.set('start_offset',String(t.start));body.set('video_file_chunk',new Blob([new Uint8Array(Buffer.concat(chunks))]),'original.mp4');const token=await metaToken(),proof=await metaProof(token);if(proof)body.set('appsecret_proof',proof);
 let cooldown=0;let response:Response,d:{start_offset?:string;end_offset?:string;error?:{code?:number;error_subcode?:number;error_data?:{start_offset?:string;end_offset?:string}}}={};
 try{response=await withMetaBudget(async()=>{const started=Date.now(),r=await fetch(`https://graph-video.facebook.com/${META_VERSION}/act_${item.ad.accountId}/advideos`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body,signal:AbortSignal.timeout(90000)});try{d=await r.json();}finally{cooldown=await recordMetaUsage(r.headers,isMetaRateLimit(Number(d.error?.code||r.status)),{operation:'act_:id/advideos.transfer',method:'POST',status:r.status,code:Number(d.error?.code||r.status),subcode:Number(d.error?.error_subcode||0),durationMs:Date.now()-started});}return r;},3);}catch(e){budgetWait(e);throw new MetaError(0,0,true,false,'Video transfer interrupted. Resume uses this same upload session.');}
 if(d.error?.error_subcode===1363037&&d.error.error_data)return {...t,...offsets(d.error.error_data,t.size)};
 if(!response.ok||d.error){const code=Number(d.error?.code||response.status),rate=isMetaRateLimit(code);throw Object.assign(new MetaError(code,Number(d.error?.error_subcode||0),rate||[429,500,502,503,504].includes(response.status),false,'Meta video transfer was rejected; the original is unchanged.'),{rateLimited:rate,retryAfterSeconds:rate?Math.max(300,cooldown):undefined});}
 const next=offsets(d,t.size);if(next.start<=t.start)throw Error('Meta upload made no progress.');return {...t,...next};
}
export async function finishOriginalVideo(item:UploadItem){if(!item.transfer||item.ad.media.kind!=='video')throw Error('Missing upload session.');return graph(`act_${item.ad.accountId}/advideos`,{upload_phase:'finish',upload_session_id:item.transfer.sessionId,title:item.ad.media.filename},'POST',undefined,true);}

function budgetWait(e:unknown){if(e instanceof MetaBudgetWait)throw e;}
