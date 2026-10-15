import {mutate} from './store';
import type {Job} from './jobs';

export async function setVoiceoverEnabled(id:string,enabled:unknown){
 if(!/^[\w-]{8,100}$/.test(id)||typeof enabled!=='boolean')throw Error('Choose whether to include voiceover.');
 return mutate<Job|null,Job>(`job-${id}`,null,job=>{
  if(!job?.result||job.cancelledAt||job.abortedAt||job.result.no_speech)throw Error('Wait for an active script before changing voiceover.');
  if((job.leaseUntil||0)>Date.now()||job.pendingStep||job.hookDeliveryPending!==undefined||'originalVoiceoverDelivery' in job&&job.originalVoiceoverDelivery||'copyTextDelivery' in job&&job.copyTextDelivery||Object.values(job.hookVoPending||{}).some(Boolean)||job.stages?.vo?.pending||job.stages?.vo?.uncertain||job.generateVo&&job.stages?.vo?.started&&!job.stages.vo.done&&!job.stages.vo.error)throw Error('Wait for the current recording or save to finish.');
  job.voiceoverEnabled=enabled;
  if(!enabled)job.generateVo=false;
  job.updated=Date.now();
  return structuredClone(job);
 });
}
