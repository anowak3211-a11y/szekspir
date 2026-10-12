import {get,put} from '@vercel/blob';
import {createHash,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import type {Stage} from './parallel-pipeline';
export type VmakeSubmission={id:string;operation:'enhance'|'remove';part?:number};
export type ProviderReceipt={jobId:string;stage:Stage;submission:VmakeSubmission;at:number;taskId?:string;outputUrls?:string[]};
function blobToken(){const token=process.env.STATE_READ_WRITE_TOKEN;if(!token)throw Error('Private receipt storage unavailable');return token;}
function receiptKey(){const secret=process.env.JOB_ENCRYPTION_KEY||process.env.BLOB_READ_WRITE_TOKEN;if(!secret)throw Error('Private receipt encryption unavailable');return createHash('sha256').update('vmake-receipt-v1:'+secret).digest();}
function path(id:string){if(!/^[\w-]{8,100}$/.test(id))throw Error('Invalid receipt ID');return 'provider-receipts-v1/'+id+'.bin';}
export async function saveProviderReceipt(receipt:ProviderReceipt){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',receiptKey(),iv);
 const body=Buffer.concat([iv,cipher.update(JSON.stringify(receipt)),cipher.final(),cipher.getAuthTag()]);
 await put(path(receipt.submission.id),body,{access:'private',token:blobToken(),addRandomSuffix:false,allowOverwrite:false,contentType:'application/octet-stream'});
}
export async function readProviderReceipt(id:string):Promise<ProviderReceipt|undefined>{
 const blob=await get(path(id),{access:'private',token:blobToken(),useCache:false});if(!blob)return;
 if(blob.statusCode!==200)throw Error('Private receipt read unavailable');
 const body=Buffer.from(await new Response(blob.stream).arrayBuffer()),decipher=createDecipheriv('aes-256-gcm',receiptKey(),body.subarray(0,12));decipher.setAuthTag(body.subarray(-16));
 return JSON.parse(Buffer.concat([decipher.update(body.subarray(12,-16)),decipher.final()]).toString());
}
