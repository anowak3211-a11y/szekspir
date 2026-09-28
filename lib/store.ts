import {readDatabaseState,writeDatabaseState} from './supabase-state';
import {get,put} from '@vercel/blob';
import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
function backend(){const value=process.env.STATE_BACKEND||'blob';if(value!=='blob'&&value!=='supabase')throw Error('Invalid state backend');return value;}
function stateToken(){const token=process.env.STATE_READ_WRITE_TOKEN;if(!token)throw new Error('Private job storage is not configured');return token;}
function key(){const secret=process.env.JOB_ENCRYPTION_KEY||process.env.BLOB_READ_WRITE_TOKEN;if(!secret)throw new Error('Blob storage is not configured');return createHash('sha256').update(secret).digest();}
function seal(value:unknown){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv);return Buffer.concat([iv,cipher.update(JSON.stringify(value)),cipher.final(),cipher.getAuthTag()]);}
function open(buf:Buffer){const decipher=createDecipheriv('aes-256-gcm',key(),buf.subarray(0,12));decipher.setAuthTag(buf.subarray(-16));return JSON.parse(Buffer.concat([decipher.update(buf.subarray(12,-16)),decipher.final()]).toString());}
export async function readState<T>(name:string,fallback:T):Promise<{value:T;etag?:string}>{
 if(backend()==='supabase'){const row=await readDatabaseState(name);return row?{value:open(Buffer.from(row.payload,'base64')) as T,etag:row.version}:{value:fallback};}
 const blob=await get(`state-v2/${name}.bin`,{access:'private',token:stateToken(),useCache:false});
 if(!blob)return {value:fallback};
 if(blob.statusCode!==200)throw new Error('Unexpected storage response');
 return {value:open(Buffer.from(await new Response(blob.stream).arrayBuffer())) as T,etag:blob.blob.etag.replace(/^W\//,'')};
}
export async function writeState<T>(name:string,value:T,etag?:string){
 if(process.env.STATE_MAINTENANCE==='1')throw Error('Storage migration in progress; please try again shortly');
 if(backend()==='supabase')return writeDatabaseState(name,seal(value).toString('base64'),etag);
 return put(`state-v2/${name}.bin`,seal(value),{access:'private',token:stateToken(),addRandomSuffix:false,contentType:'application/octet-stream',cacheControlMaxAge:0,...(etag?{ifMatch:etag}:{allowOverwrite:false})});
}
export async function mutate<T,R>(name:string,fallback:T,fn:(state:T)=>R):Promise<R>{
 for(let i=0;i<8;i++){
  const {value,etag}=await readState(name,fallback);const result=fn(value);
  try{await writeState(name,value,etag);return result;}catch(e){
   const n=e instanceof Error?e.name:'';if(!/Precondition|AlreadyExists|Conflict/.test(n)&&!/already exists|precondition failed.*etag|conditional request.*conflicting operation/i.test((e as Error).message))throw e;
   await new Promise(resolve=>setTimeout(resolve,Math.min(1000,25*2**i)+Math.random()*30));
  }
 }
 throw new Error('Concurrent update; retry shortly');
}
