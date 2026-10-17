import {accountRoute} from '@/lib/account-route';
import {stateVersion} from '@/lib/store';
import {voiceApprovalPending} from '@/lib/voice-approval';
import {parseMarket,matchesMarket} from '@/lib/market';
import {after} from 'next/server';
import {cancelJob,abortJob,requestVoiceover,createJob,getJob,jobs,jobsPage,editJob,retryJob,advance,workQueue,scheduleJob} from '@/lib/jobs';
import {claimFile,releaseFile,DuplicateFileError} from '@/lib/file-dedup';
export const maxDuration=300;
async function accountGET(req:Request){try{
 const params=new URL(req.url).searchParams,id=params.get('id'),market=params.has('market')?parseMarket(params.get('market')):undefined;
 if(!id&&params.get('summary')==='1'){
  const page=await jobsPage(Number(params.get('offset')||0)),filtered=market?page.jobs.filter(j=>matchesMarket(j,market)):page.jobs;
  const summaries=filtered.map(j=>{const{id,name,adId,status,progress,step,market,created,updated,cancelledAt,cancelCleanup,error,scriptDuplicate}=j;return {id,name,adId,status,progress,step,market,created,updated,cancelledAt,cancelCleanup,error,scriptDuplicate,voiceReviewRequired:j.step==='done'&&voiceApprovalPending(j)};});
  return Response.json({...page,jobs:summaries},{headers:{'Cache-Control':'no-store'}});
 }
 let etag:string|undefined;if(id){if(!/^[\w-]{8,100}$/.test(id))throw Error('Invalid job ID');const version=await stateVersion('job-'+id);if(version){etag='\"'+id+'-'+version+'\"';if(req.headers.get('if-none-match')===etag)return new Response(null,{status:304,headers:{ETag:etag,'Cache-Control':'private, no-cache'}});}}
 const job=id?await getJob(id):null,list=id?(job?[job]:[]):await jobs(),filtered=market?list.filter(j=>matchesMarket(j,market)):list;
 return Response.json({jobs:filtered.map(({productContext,history,transcript,...visible})=>visible)},{headers:{'Cache-Control':'private, no-cache',...(etag?{ETag:etag}:{})}});
}catch(e){return Response.json({error:(e as Error).message},{status:500});}}

async function accountPOST(req:Request){let hash:string|undefined,id:string|undefined;try{const b=await req.json();
 if(b.action==='cancel'){const job=await cancelJob(b.id);return Response.json({job,...(job.cancelCleanup?.status==='failed'?{error:job.cancelCleanup.error}:{})},{status:job.cancelCleanup?.status==='failed'?503:200});}
 if(b.action==='abort')return Response.json({job:await abortJob(b.id)});
 if(!b.action&&b.sourceHash){hash=b.sourceHash;id=b.id;await claimFile(b.sourceHash,b.id,parseMarket(b.market),true);}
 const job=(b.action==='voiceover'||b.action==='regenerate-voiceover')?await requestVoiceover(b.id,b.script,b.hooks,b.voiceId,b.action==='regenerate-voiceover'?(typeof b.revision==='number'?b.revision:-1):undefined,b.voiceProcessing,b.dualVoice):b.action==='retry'?await retryJob(b.id,!!b.confirmUncertain):b.action==='edit'?await editJob(b.id,b.script,b.hooks,b.dualVoice):await createJob(b);if(!job.cancelledAt&&!job.abortedAt)await scheduleJob(job.id);return Response.json({job});
 }catch(e){if(e instanceof DuplicateFileError)return Response.json({duplicate:e.duplicate},{status:409});if(hash&&id)await releaseFile(hash,id).catch(()=>{});return Response.json({error:(e as Error).message},{status:400});}}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
