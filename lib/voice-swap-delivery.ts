import type {VoiceSwap} from './voice-swap-model';
import {pythonCall,finalise} from './jobs';
import {saveOriginalToDrive} from './drive-video';
import {appendToAdminBriefs} from './sheets';
type Update=(fn:(s:VoiceSwap)=>void)=>Promise<void>;
export async function advanceSwapDelivery(s:VoiceSwap,update:Update){
 const d=s.delivery;if(!d||d.mixKey!==s.mixKey||!s.outputUrl)throw Error('Saved delivery does not match the completed film.');
 if(s.stage==='enhance'){
  if(!d.providerUrl){
   if(d.taskId){
    if((d.nextCheckAt||0)>Date.now()){await update(x=>{x.status='queued';});return;}
    await update(x=>{x.delivery!.nextCheckAt=Date.now()+60000;});
    const result=await pythonCall(`/api/vmake_status?task_id=${encodeURIComponent(d.taskId)}`);
    if(result.failed||result.resubmit_required)throw Error('VMake enhancement failed. Check the saved task before submitting again.');
    if(result.done){if(!result.output_urls?.[0])throw Error('VMake returned no video.');d.providerUrl=result.output_urls[0];await update(x=>{x.delivery!.providerUrl=d.providerUrl;});}
   }else{
    if(d.submitted)throw Error('VMake submission outcome is unknown. It will not be submitted again automatically.');
    // Persist intent before the paid legacy request. Never repeat an uncertain submission.
    await update(x=>{x.delivery!.submitted=true;});
    const result=await pythonCall('/api/vmake_submit',{url:s.outputUrl,operation:'enhance'});
    if(!result.task_id&&!result.output_urls?.[0])throw Error('VMake did not confirm a task. Check the provider before retrying.');
    d.taskId=result.task_id?String(result.task_id):undefined;d.providerUrl=result.output_urls?.[0];
    await update(x=>{x.delivery!.taskId=d.taskId;x.delivery!.providerUrl=d.providerUrl;});
   }
  }
  if(d.providerUrl){const enhancedUrl=d.enhancedUrl||await finalise(d.providerUrl,`voice-swap-${s.id}-${d.mixKey.slice(0,12)}`);await update(x=>{x.delivery!.enhancedUrl=enhancedUrl;x.stage='drive';x.status='queued';});}
  else{if(Date.now()-d.started>2*60*60*1000)throw Error('VMake has not completed within two hours. The saved task is retained.');await update(x=>{x.status='queued';});}
 }else if(s.stage==='drive'){
  const videoUrl=d.mode==='direct'?s.outputUrl:d.enhancedUrl;if(!videoUrl)throw Error('Finished film is missing.');
  const driveUrl=d.driveUrl||await saveOriginalToDrive({id:`voice-swap-${s.id}`,name:s.name,sourceUrl:videoUrl,driveFileId:d.driveFileId} as import('./jobs').Job,async id=>{await update(x=>{x.delivery!.driveFileId=id;});});
  await update(x=>{x.delivery!.driveUrl=driveUrl;x.stage='sheet';x.status='queued';});
 }else if(s.stage==='sheet'){
  if(!d.driveUrl)throw Error('Save the finished film to Drive first.');
  const script=s.takes?.find(t=>t.path===s.mix?.voicePath||t.alignedPath===s.mix?.voicePath)?.text||'';
  const row=await appendToAdminBriefs({jobId:`voice-swap-${s.id}`,editorId:'mine',uk:script,noSpeech:!script,hooks:[],hookOg:'',desire:'Voice swap',angle:d.mode==='direct'?'Original picture':'Enhanced original',mechanism:'',funnel:'MOF',reference:d.driveUrl,editorNotes:'Voice Swapper: original speech replaced with the selected voiceover. Background audio retained. '+(d.mode==='direct'?'Mixed video saved in Drive without enhancement.':'Enhanced video saved in Drive.')});
  await update(x=>{x.delivery!.adId=row.adId;x.delivery!.sheetUrl=row.url;x.status='done';x.error=undefined;});
 }
}
