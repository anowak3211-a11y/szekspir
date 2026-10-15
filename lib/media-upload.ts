'use client';
import {upload as blobUpload} from '@vercel/blob/client';
import {Upload} from 'tus-js-client';
export const UPLOAD_IDLE_MS=120000;
const idleMessage='Upload stopped: no data moved for two minutes. Check your connection and click Retry upload in the original upload tab.';
export function uploadFailure(error:unknown){
 const response=(error as {originalResponse?:{getStatus?:()=>number}}|undefined)?.originalResponse;
 const status=response?.getStatus?.()||0;
 if(status===401||status===403)return new Error(`Upload permission expired or was rejected (HTTP ${status}). Please select the file again and retry.`);
 if(status===413)return new Error('Storage rejected the file as too large (HTTP 413).');
 if(status===415)return new Error('Storage does not accept this file type (HTTP 415). Contact the workspace owner to check supported upload formats.');
 if(status===429)return new Error('Storage is temporarily limiting uploads (HTTP 429). Please wait a moment and retry.');
 if(status>=500)return new Error(`The storage service could not finish the upload (HTTP ${status}). Please retry shortly.`);
 if(status)return new Error(`Storage rejected the upload (HTTP ${status}). Please try again.`);
 return new Error('The browser could not confirm the upload after retrying. The connection to storage may have been interrupted. Please try again.');
}
export async function uploadMedia(path:string,file:File|Blob,onProgress?:(percentage:number)=>void):Promise<{url:string}>{
 const contentType=file.type||(/\.(?:jpg|jpeg)$/i.test(path)?'image/jpeg':/\.png$/i.test(path)?'image/png':/\.webp$/i.test(path)?'image/webp':/\.mp3$/i.test(path)?'audio/mpeg':/\.mov$/i.test(path)?'video/quicktime':'video/mp4');
 const r=await fetch('/api/upload',{signal:AbortSignal.timeout(30000),method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'sign',path,size:file.size,contentType})});
 const target=await r.json();if(!r.ok)throw Error(target.error||'Could not start upload');
 if(target.backend==='blob'){
  const controller=new AbortController();let lastProgress=Date.now(),lastPercentage=-1,stalled=false;
  const timer=setInterval(()=>{if(Date.now()-lastProgress>=UPLOAD_IDLE_MS){stalled=true;controller.abort();}},10000);
  try{return await blobUpload(path,file,{access:'public',handleUploadUrl:'/api/upload',multipart:true,abortSignal:controller.signal,onUploadProgress:({percentage})=>{if(percentage>lastPercentage){lastPercentage=percentage;lastProgress=Date.now();onProgress?.(percentage);}}});}
  catch(error){if(stalled)throw Error(idleMessage);throw error;}finally{clearInterval(timer);}
 }
 if(target.backend!=='supabase')throw Error('Invalid upload configuration');
 return new Promise((resolve,reject)=>{
  let settled=false,sentAll=false,lastProgress=Date.now(),lastSent=-1,checkingStall=false;let verifying:Promise<void>|undefined;
  const finish=(error?:Error)=>{if(settled)return;settled=true;clearInterval(timer);clearTimeout(deadline);void upload.abort().catch(()=>{});if(error)reject(error);else resolve({url:target.url});};
  const verify=(force=false):Promise<void>=>{
   if(settled||(!sentAll&&!force))return Promise.resolve();
   if(verifying)return verifying;
   verifying=(async()=>{try{const r=await fetch('/api/upload',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({action:'verify',path,size:file.size})});if(r.ok&&(await r.json()).complete)finish();}catch{}finally{verifying=undefined;}})();
   return verifying;
  };
  const timer=setInterval(()=>{
   if(!settled&&!checkingStall&&Date.now()-lastProgress>=UPLOAD_IDLE_MS){
    checkingStall=true;
    void verify(true).finally(()=>{checkingStall=false;if(!settled&&Date.now()-lastProgress>=UPLOAD_IDLE_MS)finish(Error(idleMessage));});
   }else void verify();
  },10000);
  const deadline=setTimeout(()=>finish(Error('Upload confirmation timed out. The file may already be saved.')),60*60*1000);

  const upload=new Upload(file,{endpoint:target.endpoint,headers:{'x-signature':target.token,apikey:target.publishableKey},chunkSize:6*1024*1024,retryDelays:[0,1000,3000,5000,10000],uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,storeFingerprintForResuming:true,fingerprint:async()=>`szekspir:${target.bucket}:${path}:${file.size}:${contentType}`,metadata:{bucketName:target.bucket,objectName:target.path,contentType,cacheControl:'3600'},onProgress:(sent,total)=>{if(settled)return;sentAll=total>0&&sent>=total;if(sent>lastSent){lastSent=sent;lastProgress=Date.now();onProgress?.(total?100*sent/total:0);}},onError:error=>{void verify(true).finally(()=>{if(!settled)finish(uploadFailure(error));});},onSuccess:()=>finish()});
  void (async()=>{try{
   const previous=await upload.findPreviousUploads();
   const resumable=previous.find(item=>{try{return item.size===file.size&&item.metadata.objectName===target.path&&item.metadata.bucketName===target.bucket&&!!item.uploadUrl&&new URL(item.uploadUrl).origin===new URL(target.endpoint).origin;}catch{return false;}});
   if(settled)return;if(resumable)upload.resumeFromPreviousUpload(resumable);upload.start();
  }catch{finish(Error('Could not start upload. Check browser storage and retry.'));}})();
 });
}
