import {dualVoice} from './dual-voice';
import {randomUUID} from 'node:crypto';
import type {Job} from './jobs';
import {mutate} from './store';
import {validateResult,opening,hasTokens} from './validation';

// Hold the job lease while saving delivery; never enqueue provider work.
export async function forceFinishJob(id:string,script:string,hooks:string[],deliver:(job:Job)=>Promise<unknown>,dualInput?:unknown){
 const token=randomUUID();
 const job=await mutate<Job|null,Job>(`job-${id}`,null,j=>{
  if(!j?.result||!j.adId)throw Error('Wait for the brief to be saved before finishing.');
  if(j.abortedAt||j.cancelledAt)throw Error('This job was stopped.');
  if((j.leaseUntil||0)>Date.now()||j.pendingStep||Object.values(j.hookVoPending||{}).some(Boolean)||Object.values(j.stages||{}).some(s=>s.pending)||j.generateVo&&!j.stages?.vo?.done&&!j.stages?.vo?.error)throw Error('Wait for the current recording or processing to finish.');
  if(j.hookDeliveryPending!==undefined)throw Error('Finish saving the hook selection first.');
  const result=validateResult({...j.result,uk_script:script,hooks,narration:j.result.narration||script,data_gaps:hasTokens(script)?j.result.data_gaps:[]});
  const speakers=dualInput===undefined?j.dualVoice:dualVoice(dualInput,script,j.voiceId);
  const speakersChanged=JSON.stringify(speakers)!==JSON.stringify(j.dualVoice);j.dualVoice=speakers;
  const changed=speakersChanged||script.trim()!==j.result.uk_script.trim();
  if(changed||JSON.stringify(hooks)!==JSON.stringify(j.result.hooks)){
   j.history=[...(j.history||[]),{at:Date.now(),script:j.result.uk_script,promptVersion:j.result.prompt_version}].slice(-30);
   for(const i of [0,1,2])if(hooks[i]!==j.result.hooks[i]&&j.hookVoUrls?.[i])j.hookVoNeedsRegeneration={...j.hookVoNeedsRegeneration,[i]:true};
   j.voNeedsRegeneration=!!j.voUrl&&(changed||!!j.voNeedsRegeneration);j.revision=(j.revision||0)+1;j.voApprovedRevision=undefined;
   j.result={...j.result,...result,hook_og:opening(script),narration:''};
  }
  j.lease=token;j.leaseUntil=Date.now()+360000;j.updated=Date.now();return structuredClone(j);
 });
 try{
  const receipt=await deliver(job);
  await mutate<Job|null,void>(`job-${id}`,null,j=>{
   if(!j||j.lease!==token)throw Error('The job changed. Please retry finishing.');
   j.forceFinishedAt=Date.now();j.completedAt=j.forceFinishedAt;j.updated=j.forceFinishedAt;j.step='done';j.status='Complete';j.error=undefined;
  });
  return receipt;
 }finally{await mutate<Job|null,void>(`job-${id}`,null,j=>{if(j?.lease===token){j.lease=undefined;j.leaseUntil=undefined;}});}
}
