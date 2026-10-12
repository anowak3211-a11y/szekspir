import {voiceApprovalPending} from './voice-approval';
import type {Job} from './jobs';
export type UploadStatus={name:string;stage:string;error?:string;startedAt?:number;updated:number;duplicate?:{id:string;adId?:string;market:'uk'|'pl'}};
export type ProgressRow={key:string;label:string;detail:string;state:'done'|'active'|'waiting'|'error';started?:number;finished?:number;percent?:number};
export function progressRows(job?:Job,upload?:UploadStatus|null):ProgressRow[]{
 if(!job){
  const stage=upload?.stage||'';
  const labels=['Prepare audio','Upload video','Upload audio','Save localisation'];
  const index=stage.startsWith('Preparing')?0:stage.startsWith('Uploading video')?1:stage.startsWith('Uploading audio')?2:stage.startsWith('Saving')?3:stage.startsWith('Upload complete')?4:-1;
  const percent=Number(stage.match(/(\d+)%/)?.[1]);
  return labels.map((label,i)=>({key:String(i),label,state:i<index?'done':i===index?(upload?.error?'error':'active'):'waiting',detail:i===index?(percent===100?'Transfer sent. Waiting for storage confirmation.':stage):'',percent:i===index&&Number.isFinite(percent)?percent:undefined}));
 }
 const defs:[string,string,string][]=[['transcribe','Transcription','Reading the speech from your recording.'],...(job.duplicateCheckRequired?[['duplicateCheck','Check previous rips','Comparing the original script with saved adverts.']] as [string,string,string][]:[]),['localise',job.market==='pl'?(job.generateHooks===false?'Polski skrypt':'Polski skrypt i hooki'):job.generateHooks===false?'UK script':'UK script & hooks',job.market==='pl'?'Przygotowywanie polskiej wersji reklamy.':job.generateHooks===false?'Adapting the script to British English.':'Adapting the script and preparing alternative hooks.'],...(job.video&&Number(job.duration)>600?[['segment','Prepare video parts','Splitting the long video into VMake-safe sections.']] as [string,string,string][]:[]),...(job.video&&job.enhanceVideo?[['enhanceSubmit','Send to enhancer','Sending the video to VMake enhancement.'],['enhancePoll','Enhance video',job.vmakeMode==='enhance'?'Waiting for the enhanced video.':job.vmakeOrder==='clean-first'?'Preparing the separate enhanced copy with original subtitles.':'Waiting for the enhanced video before removing subtitles.']] as [string,string,string][]:[]),...(job.video&&job.vmakeMode==='enhance'?[['videoPoll','Save enhanced video','Saving the enhanced video.']] as [string,string,string][]:[]),...(job.video&&job.vmakeMode!=='enhance'?[['videoSubmit','Send video to VMake','Submitting the video for subtitle removal.'],['videoPoll','Clean video','Waiting for VMake to finish, then saving the clean video.']] as [string,string,string][]:[]),...(job.videoDestination==='drive'?[['driveUpload','Send to Drive','Saving the original video for scene-by-scene editing.']] as [string,string,string][]:[]),['export','Save Daily Brief','Writing the script and hooks to the admin sheet.'],...(job.generateVo||voiceApprovalPending(job)?[['vo',job.market==='pl'?'Polski lektor':'British voiceover','Generating and saving the approved voiceover.']] as [string,string,string][]:[]),['references','Finalise links','Updating the reference link in Daily Briefs.']];
 if(job.vmakeOrder==='clean-first'&&job.video&&job.enhanceVideo&&job.vmakeMode!=='enhance'){
  for(let i=defs.length-1;i>=0;i--)if(['videoSubmit','videoPoll',...(job.vmakeMode==='combo'?[]:['enhanceSubmit','enhancePoll'])].includes(defs[i][0]))defs.splice(i,1);
  const part=job.cleanFirst?.parts.find(p=>!p.enhancedUrl);
  const detail=part?(part.removedUrl?'Enhancing the cleaned video. No intermediary compression.':'Removing subtitles from the original video.'):job.cleanFirst?'Saving the full-quality result.':'Clean first, then enhance. No intermediary compression.';
  defs.splice(defs.findIndex(d=>d[0]==='export'),0,['cleanFirst','Clean → enhance',detail]);
 }
 return defs.map(([key,label,detail])=>{const s=job.stages?.[key as keyof NonNullable<Job['stages']>];
  if(key==='vo'&&voiceApprovalPending(job))return {key,label,detail:'Review your script, then send it to ElevenLabs to record.',state:'waiting' as const};
  const legacyDone=!job.stages&&(job.step==='done'||(key==='transcribe'&&!!job.transcript)||(key==='localise'&&!!job.result)||(key==='videoSubmit'&&!!job.taskId)||(key==='videoPoll'&&!!job.cleanUrl)||(key==='export'&&!!job.adId)||(key==='vo'&&!!job.voUrl));
  const legacyActive=job.engine!==2&&job.status==='Running'&&!job.stages&&({localise:'localise',submit:'videoSubmit',poll:'videoPoll',export:'export',vo:'vo',references:'references'} as Record<string,string>)[job.step]===key;
  const state=s?.error?'error':s?.done||legacyDone?'done':(s?.started||legacyActive)&&job.status!=='Failed'?'active':'waiting';
  return {key,label,detail:state==='error'?s?.error||'Needs attention':state==='active'?(s?.retryReason||detail):state==='done'?(job.result?.no_speech&&(key==='localise'||key==='transcribe')?'No dialogue detected — script, hooks and voiceover skipped.':'Finished'):job.status==='Queued'?'Queued — processing has not started.':'Waiting for earlier stages',state,started:s?.started,finished:s?.finished};
 });
}
