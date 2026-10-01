import {createClient} from '@supabase/supabase-js';
import {put,head,BlobNotFoundError} from '@vercel/blob';
export const MEDIA_LIMIT=2*1024*1024*1024;
export const MEDIA_BUCKET='szekspir-media';
export function mediaBackend(){const backend=process.env.MEDIA_BACKEND||'blob';if(!['blob','supabase'].includes(backend))throw Error('Invalid media backend');return backend;}
export function storageClient(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw Error('Media storage is not configured');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(120000)})}});
}
function checkPath(path:string){if(!/^(sources\/[\w-]+\/(?:(?:source|audio)\.[a-z0-9]+|part-[0-2]\.mp4)|(?:clean|vo)\/[\w-]+\.(?:mp4|mp3|wav))$/i.test(path))throw Error('Invalid media path');}
export async function existingMedia(path:string){
 checkPath(path);
 if(mediaBackend()==='blob'){try{return (await head(path)).url;}catch(e){if(e instanceof BlobNotFoundError||(e as Error).name==='BlobNotFoundError')return undefined;throw e;}}
 const bucket=storageClient().storage.from(MEDIA_BUCKET);
 const {data,error}=await bucket.info(path);
 if(error){if('statusCode' in error&&['404','400'].includes(String(error.statusCode))&&/not found|does not exist/i.test(error.message))return undefined;throw Error('Could not check stored media');}
 return data?bucket.getPublicUrl(path).data.publicUrl:undefined;
}
export async function putMedia(path:string,body:Buffer,contentType:string){
 checkPath(path);
 if(mediaBackend()==='blob')return (await put(path,body,{access:'public',addRandomSuffix:false,contentType})).url;
 if(body.length>MEDIA_LIMIT)throw Error('This media file exceeds the 2 GB storage limit. Use a smaller file.');
 const bucket=storageClient().storage.from(MEDIA_BUCKET);
 const {error}=await bucket.upload(path,body,{contentType,upsert:false});
 if(error){if('statusCode' in error&&String(error.statusCode)==='409'){const prior=await existingMedia(path);if(prior)return prior;}throw Error('Media upload failed. Please retry.');}
 return bucket.getPublicUrl(path).data.publicUrl;
}
export async function signMediaUpload(path:string,size:number,contentType:string){
 checkPath(path);
 if(!path.startsWith('sources/'))throw Error('Invalid upload path');
 if(!Number.isSafeInteger(size)||size<=0||size>MEDIA_LIMIT)throw Error('Choose a file smaller than 2 GB.');
 if(!['video/mp4','video/quicktime','video/webm','audio/mpeg','audio/mp4','audio/wav','audio/x-wav'].includes(contentType))throw Error('Unsupported media type');
 const client=storageClient(),bucket=client.storage.from(MEDIA_BUCKET);
 const {data,error}=await bucket.createSignedUploadUrl(path,{upsert:false});
 if(error||!data)throw Error('Could not start upload. Please retry.');
 const origin=new URL(process.env.SUPABASE_URL!).origin;
 const publishableKey=process.env.SUPABASE_PUBLISHABLE_KEY;if(!publishableKey?.startsWith('sb_publishable_'))throw Error('Upload client is not configured');
 return {backend:'supabase',publishableKey,bucket:MEDIA_BUCKET,path,token:data.token,endpoint:origin.replace('.supabase.co','.storage.supabase.co')+'/storage/v1/upload/resumable/sign',url:bucket.getPublicUrl(path).data.publicUrl};
}
