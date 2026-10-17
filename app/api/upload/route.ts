import {accountMediaPath,logicalMediaPath} from '@/lib/account-context';
import {accountRoute} from '@/lib/account-route';
import {handleUpload,HandleUploadBody} from '@vercel/blob/client';
import {mediaBackend,signMediaUpload,MEDIA_LIMIT,existingMedia} from '@/lib/media';
async function accountGET(){return Response.json({maximumSizeInBytes:mediaBackend()==='supabase'?MEDIA_LIMIT:200*1024*1024},{headers:{'Cache-Control':'no-store'}});}
async function accountPOST(req:Request){try{
 if(process.env.STATE_MAINTENANCE==='1')return Response.json({error:'Storage migration in progress. Please try again shortly.'},{status:503});
 const input=await req.json();
 if(input.action==='verify'){
  if(!/^sources\/[\w-]+\/(?:source|audio)\.[a-z0-9]+$/i.test(input.path)||!Number.isSafeInteger(input.size)||input.size<=0||input.size>MEDIA_LIMIT)return Response.json({error:'Invalid upload'},{status:400});
  const url=await existingMedia(input.path);if(!url)return Response.json({complete:false});
  const response=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(10000),cache:'no-store'});
  return Response.json({complete:response.ok&&Number(response.headers.get('content-length'))===input.size},{headers:{'Cache-Control':'no-store'}});
 }
 if(input.action==='sign')return Response.json(mediaBackend()==='supabase'?await signMediaUpload(input.path,input.size,input.contentType):{backend:'blob',path:accountMediaPath(input.path)},{headers:{'Cache-Control':'no-store'}});
 if(mediaBackend()!=='blob')return Response.json({error:'Please refresh the upload page.'},{status:409});
 const body=input as HandleUploadBody;
 const result=await handleUpload({request:req,body,onBeforeGenerateToken:async(pathname)=>{
  if(accountMediaPath(pathname)!==pathname||!/^sources\/[\w-]+\/(?:source|audio)\.[a-z0-9]+$/i.test(logicalMediaPath(pathname)))throw new Error('Invalid upload path');
  return {allowedContentTypes:['video/mp4','video/quicktime','video/webm','audio/mpeg','audio/mp4','audio/wav','audio/x-wav','image/jpeg','image/png','image/webp'],maximumSizeInBytes:/\.(?:jpe?g|png|webp)$/i.test(pathname)?24*1024*1024:200*1024*1024,addRandomSuffix:true};
 }});return Response.json(result);
}catch(e){return Response.json({error:(e as Error).message},{status:400});}}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
