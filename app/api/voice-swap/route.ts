import {accountEnv} from '@/lib/account-context';
import {accountRoute} from '@/lib/account-route';
import {requestSwapAlignment,requestSwapTranscript,requestSwapNarration,recoverSwapSeparation,sendVoiceSwap,getVoiceSwap,startVoiceSwap,mixVoiceSwap,resumeVoiceSwap,scheduleVoiceSwap} from '@/lib/voice-swap';
export const maxDuration=60;
async function accountGET(req:Request){try{
 const id=new URL(req.url).searchParams.get('id');return Response.json(id?{job:await getVoiceSwap(id)}:{configured:!!accountEnv('ELEVENLABS_API_KEY')},{headers:{'Cache-Control':'no-store'}});
}catch(error){return Response.json({error:(error as Error).message},{status:400});}}
async function accountPOST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin.'},{status:403});
 const input=await req.json();const job=input.action==='align'?await requestSwapAlignment(input.id,input.takeId):input.action==='transcribe'?await requestSwapTranscript(input.id):input.action==='record'?await requestSwapNarration(input.id,input):input.action==='save'?await sendVoiceSwap(input.id,false):input.action==='start'?await startVoiceSwap(input):input.action==='mix'?await mixVoiceSwap(input.id,input):input.action==='recover'?await recoverSwapSeparation(input.id):input.action==='retry-separation'?await recoverSwapSeparation(input.id,input.confirmNewCharge===true):input.action==='send'?await sendVoiceSwap(input.id):input.action==='resume'?await resumeVoiceSwap(input.id):null;
 if(!job)throw Error('Unknown Voice Swapper action.');
 if(job.status==='queued'){
  try{await scheduleVoiceSwap(job.id);}catch{return Response.json({job,error:'Saved, but dispatch was not confirmed. Use Resume; it reuses this job.'},{status:503});}
 }
 return Response.json({job},{status:202,headers:{'Cache-Control':'no-store'}});
}catch(error){return Response.json({error:(error as Error).message},{status:400});}}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
