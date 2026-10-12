import type {Job} from './jobs';
import type {Stage} from './parallel-pipeline';
import {readState,mutate} from './store';
import {readProviderReceipt,type ProviderReceipt} from './provider-receipts';
export function applyProviderReceipt(job:Job,key:Stage,receipt:ProviderReceipt){
 const stage=job.stages?.[key],submission=stage?.submission;
 if(!stage?.pending||!submission||job.abortedAt||job.cancelledAt||receipt.jobId!==job.id||receipt.stage!==key||receipt.submission.id!==submission.id||receipt.submission.operation!==submission.operation||receipt.submission.part!==submission.part||(!receipt.taskId&&!receipt.outputUrls?.[0]))return false;
 const part=submission.part??0,url=receipt.outputUrls?.[0];
 if(key==='cleanFirst'){
  const p=job.cleanFirst?.parts[part];if(!p)return false;
  if(url){p[submission.operation==='remove'?'removedUrl':'enhancedUrl']=url;p.taskId=undefined;p.operation=undefined;}
  else{p.taskId=receipt.taskId;p.operation=submission.operation;p.submittedAt=receipt.at;}
 }else if(key==='enhanceSubmit'){
  if(job.videoParts){const p=job.videoParts[part];if(!p)return false;p.enhanceTaskId=receipt.taskId;p.enhancedUrl=url;p.enhanceSubmittedAt=receipt.at;stage.done=job.videoParts.every(p=>!!(p.enhanceTaskId||p.enhancedUrl));}
  else{job.enhanceTaskId=receipt.taskId;job.enhancedUrl=url;job.enhanceSubmittedAt=receipt.at;stage.done=true;}
 }else if(key==='videoSubmit'){
  if(job.videoParts){const p=job.videoParts[part];if(!p)return false;p.removeTaskId=receipt.taskId;p.removedUrl=url;p.removeSubmittedAt=receipt.at;stage.done=job.videoParts.every(p=>!!(p.removeTaskId||p.removedUrl));}
  else{job.taskId=receipt.taskId;job.videoOutputUrl=url;job.submittedAt=receipt.at;stage.done=true;}
 }else return false;
 stage.pending=false;stage.uncertain=false;stage.error=undefined;stage.nextAt=0;return true;
}
export async function recoverVmakeReceipts(id:string,onlyStage?:Stage){
 const job=(await readState<Job|null>('job-'+id,null)).value;if(!job||job.abortedAt||job.cancelledAt)return false;
 let recovered=false;
 for(const key of (onlyStage?[onlyStage]:['cleanFirst','enhanceSubmit','videoSubmit']) as Stage[]){
  const submission=job.stages?.[key]?.pending&&job.stages[key]?.submission;if(!submission)continue;
  let receipt:ProviderReceipt|undefined;try{receipt=await readProviderReceipt(submission.id);}catch{continue;}
  if(!receipt)continue;
  const applied=await mutate<Job|null,boolean>('job-'+id,null,j=>{if(!j||!applyProviderReceipt(j,key,receipt!))return false;j.error=Object.entries(j.stages||{}).filter(([,s])=>s.error).map(([k,s])=>k+': '+s.error).join(' ')||undefined;j.uncertain=Object.values(j.stages||{}).some(s=>s.uncertain);if(j.status==='Failed'&&!j.error)j.status='Queued';j.updated=Date.now();return true;});
  recovered=applied||recovered;
 }
 return recovered;
}
