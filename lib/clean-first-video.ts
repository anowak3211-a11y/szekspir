// Versioned per job: existing enhance-first tasks keep their paid checkpoints.
export type CleanPart={sourceUrl:string;removedUrl?:string;enhancedUrl?:string;taskId?:string;operation?:'remove'|'enhance';submittedAt?:number;statusUnavailable?:boolean;terminalFailure?:boolean};
export type CleanFirstState={parts:CleanPart[]};
type Context={id:string;duration?:number;cleanUrl?:string;cleanFirst?:CleanFirstState;sourceUrl:string;resolvedVideoUrl?:string;videoParts?:{sourceUrl?:string}[]};
type Hooks={paid:(submission?:{operation:'enhance'|'remove';part?:number})=>Promise<unknown>;save:(fn:(job:any)=>void)=>Promise<unknown>;call:(path:string,body?:object)=>Promise<any>;finalise:(url:string,id:string)=>Promise<string>;join:(urls:string[],id:string,suffix:string,duration?:number)=>Promise<string>};
export async function advanceCleanFirst(job:Context,h:Hooks):Promise<boolean>{
 if(job.cleanUrl)return true;
 if(!job.cleanFirst){
  const urls=job.videoParts?.map(p=>p.sourceUrl)||[job.resolvedVideoUrl||job.sourceUrl];
  if(urls.some(u=>!u))throw Error('Source video parts are not ready.');
  await h.save(j=>{j.cleanFirst={parts:urls.map(sourceUrl=>({sourceUrl}))};});
  return false;
 }
 const index=job.cleanFirst.parts.findIndex(p=>!p.enhancedUrl);
 if(index<0){
  const urls=job.cleanFirst.parts.map(p=>p.enhancedUrl!);
  const url=urls.length===1?await h.finalise(urls[0],job.id):await h.join(urls,job.id,'',job.duration);
  await h.save(j=>{j.cleanUrl=url;});return true;
 }
 const part=job.cleanFirst.parts[index],operation=part.removedUrl?'enhance':'remove';
 const remember=async(r:any)=>{
  const url=r.output_urls?.[0];
  if(!url)throw Error('VMake completed without video.');
  await h.save(j=>{const p=j.cleanFirst.parts[index];p[operation==='remove'?'removedUrl':'enhancedUrl']=url;p.taskId=undefined;p.operation=undefined;p.terminalFailure=undefined;});
 };
 if(part.taskId){
  const r=await h.call(`/api/vmake_status?task_id=${encodeURIComponent(part.taskId)}`);
  const unavailable=r.status_unavailable===true;if(!!part.statusUnavailable!==unavailable){await h.save(j=>{j.cleanFirst.parts[index].statusUnavailable=unavailable;});part.statusUnavailable=unavailable;}
  if(r.failed){await h.save(j=>{j.cleanFirst.parts[index].terminalFailure=r.resubmit_required===true;});throw Error(String(r.message||'VMake failed.'));}
  if(r.done)await remember(r);
  // An unfinished saved task remains pollable; elapsed time cannot prove failure.
 }else{
  // No intermediary recompression, resizing or frame-rate changes.
  await h.paid({operation,part:index});
  const r=await h.call('/api/vmake_submit',{url:operation==='remove'?part.sourceUrl:part.removedUrl,operation});
  if(r.task_id)await h.save(j=>{Object.assign(j.cleanFirst.parts[index],{taskId:String(r.task_id),operation,submittedAt:Date.now()});});
  else await remember(r);
 }
 return false;
}
export function retryCleanFirst(state?:CleanFirstState){
 for(const part of state?.parts||[])if(part.terminalFailure){part.taskId=undefined;part.terminalFailure=undefined;}
}
