import {accountRoute} from '@/lib/account-route';
import {getJob} from '@/lib/jobs';
import {readState,mutate} from '@/lib/store';
import {hashRemoteFile} from '@/lib/hash-remote-file';
import {claimFile,DuplicateFileError} from '@/lib/file-dedup';
export const maxDuration=180;
async function accountGET(){try{const index=(await readState<{ids:string[]}>('jobs',{ids:[]})).value;return Response.json({jobs:[...new Set(index.ids)].map(id=>({id}))});}catch{return Response.json({error:'Could not read history'},{status:503});}}
async function accountPOST(req:Request){try{
 const {id}=await req.json();if(typeof id!=='string'||! /^[\w-]{8,100}$/.test(id))throw Error('Invalid job ID');const job=await getJob(id);if(!job||job.cancelledAt)return Response.json({id,status:'unavailable',reason:'Job missing or cancelled'});
 const saved=(await readState<{hash?:string}>('source-hash-'+id,{})).value;
 let hash=saved.hash;
 if(!hash){
  // Only unchanged stored source files are valid references. Cleaned/enhanced
  // output and extracted audio are NOT the original uploaded video.
  const source=[job.sourceUrl,job.resolvedVideoUrl].find(u=>u&&/\/sources\/[^/]+\/source\.[a-z0-9]+(?:[?#]|$)/i.test(u));
  if(!source)return Response.json({id,adId:job.adId,status:'unavailable',reason:'No retained original upload; extracted audio and processed video are excluded.'});
  hash=(await hashRemoteFile(source)).hash;await mutate<{hash?:string},void>('source-hash-'+id,{},s=>{s.hash=hash;});
 }
 try{await claimFile(hash,id,job.market==='pl'?'pl':'uk',true);}catch(e){if(e instanceof DuplicateFileError)return Response.json({id,adId:job.adId,status:'indexed',duplicate:e.duplicate});throw e;}
 return Response.json({id,adId:job.adId,status:'indexed'});
 }catch(e){return Response.json({error:(e as Error).message},{status:400});}}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
