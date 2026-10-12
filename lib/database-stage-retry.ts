import type {Stage,StageState} from './parallel-pipeline';
export function transientDatabaseError(error:unknown){
 const message=error instanceof Error?error.message:String(error);
 return message==='Database connection unavailable. Please try again.'||/^Database state request failed \(HTTP (408|429|500|502|503|504|520|521|522|523|524)\)$/.test(message);
}
/** A durable pending paid request must never be treated as a safe status retry. */
export function retryDatabaseStage(stage:StageState,key:Stage,error:unknown,now=Date.now(),beforeProviderCall=false){
 if((!beforeProviderCall&&!['transcribe','localise','segment','driveUpload','cleanFirst','enhanceSubmit','videoSubmit','enhancePoll','videoPoll','export','references','vo'].includes(key))||stage.pending||stage.uncertain||!transientDatabaseError(error)||(stage.databaseRetries||0)>=5)return false;
 stage.databaseRetries=(stage.databaseRetries||0)+1;
 stage.nextAt=now+Math.min(60000,10000*2**(stage.databaseRetries-1));
 stage.error=undefined;stage.uncertain=false;
 stage.retryReason='Reconnecting to the database. Resuming saved progress.';
 return true;
}
/** Recover old non-paid failures only where the durable job proves what to resume. */
export function recoverDatabaseStages(job:import('./jobs').Job,now=Date.now()){
 if(job.engine!==2||job.cancelledAt||job.abortedAt||job.step==='done'||(job.leaseUntil||0)>now)return false;
 let recovered=false;
 for(const [key,stage] of Object.entries(job.stages||{})){
  if(!stage.error||stage.done||stage.pending||stage.uncertain)continue;
  const durable=key==='cleanFirst'?job.cleanFirst?.parts.some(p=>!!(p.taskId||p.removedUrl||p.enhancedUrl)):key==='enhancePoll'?!!(job.enhanceTaskId||job.videoParts?.some(p=>p.enhanceTaskId)):key==='videoPoll'?!!(job.taskId||job.videoParts?.some(p=>p.removeTaskId)):key==='export'?!!(stage.briefSaved&&job.adId):key==='references'?!!job.adId:false;
  if(durable&&retryDatabaseStage(stage,key as Stage,stage.error,now))recovered=true;
 }
 if(recovered){job.error=Object.entries(job.stages||{}).filter(([,s])=>s.error).map(([k,s])=>k+': '+s.error).join(' ')||undefined;job.uncertain=Object.values(job.stages||{}).some(s=>s.uncertain);if(job.status==='Failed'&&!job.error)job.status='Queued';job.updated=now;}
 return recovered;
}
