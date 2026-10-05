import {parseMarket,matchesMarket} from '@/lib/market';
import {after} from 'next/server';
import {cancelJob,abortJob,requestVoiceover,createJob,getJob,jobs,editJob,retryJob,advance,workQueue,scheduleJob} from '@/lib/jobs';
import {claimFile,releaseFile,DuplicateFileError} from '@/lib/file-dedup';
export const maxDuration=300;
export async function GET(req:Request){try{const params=new URL(req.url).searchParams;const id=params.get('id');const market=params.has('market')?parseMarket(params.get('market')):undefined;const job=id?await getJob(id):null;const list=id?(job?[job]:[]):await jobs();return Response.json({jobs:market?list.filter(j=>matchesMarket(j,market)):list},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:(e as Error).message},{status:500});}}
export async function POST(req:Request){let hash:string|undefined,id:string|undefined;try{const b=await req.json();
 if(!b.action&&b.sourceHash){hash=b.sourceHash;id=b.id;await claimFile(b.sourceHash,b.id,parseMarket(b.market),true);}
 const job=b.action==='cancel'?await cancelJob(b.id):b.action==='abort'?await abortJob(b.id):(b.action==='voiceover'||b.action==='regenerate-voiceover')?await requestVoiceover(b.id,b.script,b.hooks,b.voiceId,b.action==='regenerate-voiceover'?(typeof b.revision==='number'?b.revision:-1):undefined,b.voiceProcessing,b.dualVoice):b.action==='retry'?await retryJob(b.id,!!b.confirmUncertain):b.action==='edit'?await editJob(b.id,b.script,b.hooks,b.dualVoice):await createJob(b);await scheduleJob(job.id);return Response.json({job});
 }catch(e){if(e instanceof DuplicateFileError)return Response.json({duplicate:e.duplicate},{status:409});if(hash&&id)await releaseFile(hash,id).catch(()=>{});return Response.json({error:(e as Error).message},{status:400});}}
