import {accountEditors} from './account-editors';
import {accountEnv,accountDefault} from './account-context';
import {fitPhraseAnchor,validatePhraseAnchor} from './phrase-pace';
import {createHash,randomUUID} from 'node:crypto';
import {google} from 'googleapis';
import {getJob,type Job} from './jobs';
import {mutate} from './store';
import {assertAdActive,assertJobActive} from './cancellation';
import {safeDownload} from './safe-fetch';
import {cleanVoiceover,type VoiceTiming} from './vo-cleanup';
import {mixStoryAmbience} from './story-ambience';
import {slightlyFasterVoice,type OriginalVoiceTempo} from './slightly-faster-voice';
import {putMedia} from './media';
import {withEditorLocks} from './editor-locks';
import {editorAssignment} from './editor-sync';
import {EDITOR_WORKSPACES} from './editor-workspaces';
import {sheetAuth,shiftAdminRange} from './sheets';
import {voiceLinkRuns} from './voice-links';
import type {Snapshot} from './editor-sync-plan';
import {voiceProcessing,type VoiceProcessing,type VoiceAudioAdjustments} from './voice-processing';

type Candidate={url:string;timing:VoiceTiming};
type OriginalDelivery={adjustments?:VoiceAudioAdjustments;token:string;revision:number;originalUrl:string;factor?:OriginalVoiceTempo;fingerprint:string;candidate?:Candidate;error?:string};
type OriginalRestore={adjustments?:VoiceAudioAdjustments;revision:number;originalUrl:string;url:string;factor?:OriginalVoiceTempo;at:number};
type PreviousTake={at:number;revision:number;url:string;originalUrl?:string;timing?:VoiceTiming;processing?:VoiceProcessing};
export type OriginalVoiceoverJob=Job&{originalVoiceoverDelivery?:OriginalDelivery;originalVoiceoverRestore?:OriginalRestore;originalVoiceoverHistory?:PreviousTake[]};
export type UseOriginalVoiceoverInput={id:string;revision:number;factor?:OriginalVoiceTempo;adjustments?:VoiceAudioAdjustments};
export class OriginalVoiceoverSaveError extends Error{
 readonly status=503;
 constructor(message:string,readonly job:Job|null){super(message);this.name='OriginalVoiceoverSaveError';}
}

function validate(input:UseOriginalVoiceoverInput){
 if(typeof input.id!=='string'||!/^[\w-]{8,100}$/.test(input.id))throw Error('Invalid job ID.');
 if(!Number.isSafeInteger(input.revision)||input.revision<0)throw Error('Refresh this recording before changing it.');
 if(input.adjustments!==undefined){
  if(!input.adjustments||typeof input.adjustments!=='object'||input.adjustments.pauseShorteningMs===undefined||input.adjustments.tempoFactor===undefined)throw Error('Choose pause shortening and speech speed.');
  voiceProcessing({mode:'gentle',normalize:false,matchSourcePace:false,...input.adjustments});
  if(input.adjustments.sourceAnchor){validatePhraseAnchor(input.adjustments.sourceAnchor);if(input.adjustments.pauseShorteningMs!==0||input.adjustments.tempoFactor!==1)throw Error('Apply phrase alignment separately from pause and speed adjustments.');}
  if(input.factor!==undefined)throw Error('Use either the preset or the sliders.');
 }
 if(input.factor!==undefined&&input.factor!==1&&input.factor!==1.05)throw Error('Choose original pace or 5% faster.');
}
function active(job:OriginalVoiceoverJob|null){
 if(!job||job.abortedAt||job.cancelledAt||['Cancelled','Aborted'].includes(job.status))throw Error('This job was stopped.');
 if(!job.result||!job.adId||!job.voOriginalUrl||!job.voUrl)throw Error('Wait for the original recording and brief to finish.');
 if(job.dualVoice||job.voTiming?.speakerSwitchSeconds!==undefined||Object.keys(job.speakerTakes||{}).length)throw Error('Original playback for a two-speaker recording is not available here.');
}
function idle(job:OriginalVoiceoverJob){
 if((job.leaseUntil||0)>Date.now())throw Error('A recording or save is in progress. Try again when it finishes.');
 if(job.hookDeliveryPending!==undefined||(job as Job&{hookTextDelivery?:unknown}).hookTextDelivery||Object.values(job.hookVoPending||{}).some(Boolean)||job.stages?.vo?.pending||job.stages?.vo?.uncertain||job.generateVo&&job.stages?.vo&&!job.stages.vo.done&&!job.stages.vo.error)throw Error('Wait for the current recording or hook save to finish.');
}
function fingerprint(job:OriginalVoiceoverJob,factor:OriginalVoiceTempo=1,adjustments?:VoiceAudioAdjustments){
 return createHash('sha256').update(JSON.stringify([factor,job.revision||0,job.adId,job.result,job.voUrl,job.voOriginalUrl,job.voTiming,job.voNeedsRegeneration,job.voApprovedRevision,job.voiceId,job.voiceProcessing,job.dualVoice,job.speakerTakes,job.hookVoUrls,job.hookVoOriginalUrls,job.hookVoTimings,job.hookVoNeedsRegeneration,job.hookVoPending,job.hooksToEditor,job.editorId,job.generateVo,job.pendingStep])).update(adjustments?JSON.stringify(adjustments):'').digest('hex');
}
function owned(job:OriginalVoiceoverJob|null,token:string){
 active(job);
 if(job!.lease!==token||job!.originalVoiceoverDelivery?.token!==token||(job!.leaseUntil||0)<=Date.now())throw Error('The recording save expired. Retry using the original.');
 if(fingerprint(job!,job!.originalVoiceoverDelivery!.factor??1,job!.originalVoiceoverDelivery!.adjustments)!==job!.originalVoiceoverDelivery!.fingerprint)throw Error('The script, recording or hooks changed in another tab. Refresh and try again.');
}
/** Replace one known Main VO line, retaining every other line exactly. */
export function originalVoiceoverCell(previous:string,url:string,previousUrl:string,stale:boolean){
 const lines=previous?previous.split('\n'):[],main=lines.map((line,index)=>({line,index})).filter(x=>/^Main VO(?: \(previous script — regenerate\))?: /.test(x.line));
 if(main.length>1)throw Error('The sheet contains more than one main recording. Review it before changing the audio.');
 if(main.length){
  const known=main[0].line.match(/^Main VO(?: \(previous script — regenerate\))?: (https:\/\/\S+)$/)?.[1];
  if(known!==previousUrl&&known!==url)throw Error('The main recording was edited in the sheet. Refresh and review it first.');
 }
 const line=`Main VO${stale?' (previous script — regenerate)':''}: ${url}`;
 if(main.length)lines[main[0].index]=line;else lines.unshift(line);
 return lines.join('\n');
}

/** Restore an existing provider take, optionally 5% faster; no generation or source fitting. */
export async function useOriginalVoiceover(input:UseOriginalVoiceoverInput):Promise<Job>{
 validate(input);
 const factor=input.factor??1;
 const adjustments=input.adjustments?{pauseShorteningMs:input.adjustments.pauseShorteningMs,tempoFactor:input.adjustments.tempoFactor,...(input.adjustments.sourceAnchor?{sourceAnchor:input.adjustments.sourceAnchor}:{})}:undefined;
 const existing=await getJob(input.id) as OriginalVoiceoverJob|null;
 active(existing);idle(existing!);
 if(adjustments?.sourceAnchor&&(!existing!.duration||adjustments.sourceAnchor.sourceSeconds>=existing!.duration))throw Error('Source phrase anchor must be inside the original recording.');
 if((existing!.revision||0)!==input.revision)throw Error('This recording changed. Refresh and try again.');
 const restored=existing!.originalVoiceoverRestore;
 if(!existing!.originalVoiceoverDelivery&&restored?.revision===input.revision&&(restored.factor??1)===factor&&JSON.stringify(restored.adjustments)===JSON.stringify(adjustments)&&restored.originalUrl===existing!.voOriginalUrl&&restored.url===existing!.voUrl&&existing!.voiceProcessing?.matchSourcePace===!!adjustments?.sourceAnchor&&!existing!.voTiming?.paceAdjustment)return existing!;
 const token=randomUUID();
 const reserved=await mutate<OriginalVoiceoverJob|null,OriginalVoiceoverJob>(`job-${input.id}`,null,job=>{
  active(job);idle(job!);
  if((job!.revision||0)!==input.revision)throw Error('This recording changed. Refresh and try again.');
  const previous=job!.originalVoiceoverDelivery,current=fingerprint(job!,factor,adjustments);
  if(previous&&(previous.revision!==input.revision||(previous.factor??1)!==factor||JSON.stringify(previous.adjustments)!==JSON.stringify(adjustments)||previous.originalUrl!==job!.voOriginalUrl||previous.fingerprint!==current))throw Error('The saved original operation no longer matches this script or tempo. Refresh and review the recording.');
  job!.originalVoiceoverDelivery={...previous,token,revision:input.revision,originalUrl:job!.voOriginalUrl!,factor,adjustments,fingerprint:current,error:undefined};
  job!.lease=token;job!.leaseUntil=Date.now()+360000;job!.updated=Date.now();return structuredClone(job!);
 });
 const assertCurrent=async()=>{await assertJobActive(input.id);await assertAdActive(reserved.adId!);const current=await getJob(input.id) as OriginalVoiceoverJob|null;owned(current,token);return current!;};
 try{
  let candidate=reserved.originalVoiceoverDelivery!.candidate;
  if(!candidate){
   const raw=(await safeDownload(adjustments?.sourceAnchor?(reserved.voTiming?.dryUrl||reserved.voUrl!):reserved.voOriginalUrl!,150*1024*1024)).buffer;
   const processing:VoiceProcessing={...reserved.voiceProcessing,mode:'gentle',normalize:false,breaths:false,matchSourcePace:false,pauseShorteningMs:adjustments?.pauseShorteningMs??0,tempoFactor:adjustments?.tempoFactor??1};
   let timing:VoiceTiming|undefined;
   let audio:ArrayBuffer|undefined,background:Buffer|undefined;
   try{
    await assertCurrent();
    audio=await cleanVoiceover(new Uint8Array(raw).buffer,value=>{timing=value;},processing,'voiceover');
    if(!timing)throw Error('The original recording timing could not be confirmed.');
    timing.modelId=reserved.voTiming?.modelId;
    if(adjustments?.sourceAnchor){const aligned=await fitPhraseAnchor(audio,timing,adjustments.sourceAnchor);new Uint8Array(audio).fill(0);audio=aligned;}
    if(factor===1.05){const adjusted=await slightlyFasterVoice(audio,timing,factor);new Uint8Array(audio).fill(0);audio=adjusted;}
    await assertCurrent();
    const path=`vo/${input.id}-r${input.revision}-native-${randomUUID()}`;
    if(reserved.voTiming?.ambienceUrl){
     // Reuse the saved bed only; no sound-generation request is allowed here.
     background=(await safeDownload(reserved.voTiming.ambienceUrl,30*1024*1024)).buffer;
     await assertCurrent();
     const mixed=await mixStoryAmbience(audio,new Uint8Array(background).buffer,timing.trimmedSeconds);
     timing.dryUrl=await putMedia(`${path}-dry.wav`,Buffer.from(audio),'audio/wav');
     new Uint8Array(audio).fill(0);audio=mixed;
     timing.ambienceUrl=reserved.voTiming.ambienceUrl;
    }
    await assertCurrent();
    const url=await putMedia(`${path}.wav`,Buffer.from(audio),'audio/wav');
    candidate={url,timing};
    await mutate<OriginalVoiceoverJob|null,void>(`job-${input.id}`,null,job=>{owned(job,token);job!.originalVoiceoverDelivery!.candidate=candidate;job!.updated=Date.now();});
   }finally{raw.fill(0);background?.fill(0);if(audio)new Uint8Array(audio).fill(0);}
  }
  const savedCandidate=candidate;
  const assignment=await editorAssignment(reserved.adId!),workspace=accountEditors().find(w=>w.id===assignment.current);
  if(!workspace)throw Error('Assigned editor not found.');
  return await withEditorLocks(['ad-'+reserved.adId,'sheet-write-'+reserved.adId,'voice-'+reserved.adId,'workspace-'+workspace.id],async()=>{
   const current=await assertCurrent();
   if((await editorAssignment(reserved.adId!)).current!==workspace.id)throw Error('Assigned editor changed. Refresh and try again.');
   const api=google.sheets({version:'v4',auth:sheetAuth()});
   const targets=[{id:accountEnv('ADMIN_SHEET_ID')||accountDefault('ADMIN_SHEET_ID','17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY'),title:'Daily Briefs',range:'A1:AE502'},{id:workspace.sheetId,title:'My Tasks',range:'A1:S501'}];
   const rows=await Promise.all(targets.map(async target=>{
    const data=(await api.spreadsheets.values.get({spreadsheetId:target.id,range:`'${target.title}'!${target.range}`,valueRenderOption:'UNFORMATTED_VALUE'})).data.values||[],headers=data[0]||[];
    const idCol=headers.indexOf('Ad ID'),voiceCol=headers.indexOf('Voice Over');if(idCol<0||voiceCol<0)throw Error('Ad ID or Voice Over column missing.');
    const matches=data.map((row,i)=>({row,i})).filter(x=>x.i>0&&x.row[idCol]===reserved.adId);if(matches.length!==1)throw Error('The advert is missing or duplicated in the sheet.');
    const previous=String(matches[0].row[voiceCol]||''),value=originalVoiceoverCell(previous,savedCandidate.url,current.voUrl!,!!current.voNeedsRegeneration);
    return {...target,row:matches[0].i+1,voiceCol,previous,value};
   }));
   for(const target of rows){
    await assertCurrent();
    const range=`'${target.title}'!${shiftAdminRange('A',target.voiceCol)}${target.row}`;
    const latest=(await api.spreadsheets.values.get({spreadsheetId:target.id,range,valueRenderOption:'UNFORMATTED_VALUE'})).data.values?.[0]?.[0]??'';
    if(String(latest)!==target.previous)throw Error('The voiceover cell changed during the save. Retry after reviewing it.');
    await assertCurrent();
    await api.spreadsheets.values.update({spreadsheetId:target.id,range,valueInputOption:'RAW',requestBody:{values:[[target.value]]}});
    const read=await api.spreadsheets.values.get({spreadsheetId:target.id,range,valueRenderOption:'UNFORMATTED_VALUE'});
    if(String(read.data.values?.[0]?.[0]||'')!==target.value)throw Error('The original recording could not be confirmed in the sheet.');
    // Keep clickable links, without changing other cells or synchronising copy.
    const meta=await api.spreadsheets.get({spreadsheetId:target.id,fields:'sheets.properties'}),sheetId=meta.data.sheets?.find(s=>s.properties?.title===target.title)?.properties?.sheetId;
    if(sheetId!==undefined&&sheetId!==null){await assertCurrent();await api.spreadsheets.batchUpdate({spreadsheetId:target.id,requestBody:{requests:[{updateCells:{range:{sheetId,startRowIndex:target.row-1,endRowIndex:target.row,startColumnIndex:target.voiceCol,endColumnIndex:target.voiceCol+1},rows:[{values:[{textFormatRuns:voiceLinkRuns(target.value)}]}],fields:'textFormatRuns'}}]}});}
   }
   await assertCurrent();
   const editorValue=rows[1].value,masterValue=rows[0].value;
   if(editorValue===masterValue)await mutate<{snapshot:Snapshot},void>('editor-sync-v3-'+workspace.sheetId,{snapshot:{}},state=>{const row=state.snapshot[reserved.adId!]??={};row['Voice Over']=editorValue;delete row['manual:Voice Over'];});
   return mutate<OriginalVoiceoverJob|null,Job>(`job-${input.id}`,null,job=>{
    owned(job,token);
    job!.originalVoiceoverHistory=[...(job!.originalVoiceoverHistory||[]),{at:Date.now(),revision:job!.revision||0,url:job!.voUrl!,originalUrl:job!.voOriginalUrl,timing:job!.voTiming,processing:job!.voiceProcessing}].slice(-20);
    job!.voUrl=savedCandidate.url;job!.voTiming=savedCandidate.timing;job!.voiceProcessing=savedCandidate.timing.processing;
    // Script approval/staleness, original URL, revision and every hook stay intact.
    job!.originalVoiceoverRestore={revision:input.revision,originalUrl:job!.voOriginalUrl!,url:savedCandidate.url,factor,adjustments,at:Date.now()};
    delete job!.originalVoiceoverDelivery;job!.lease=undefined;job!.leaseUntil=undefined;job!.updated=Date.now();return structuredClone(job!);
   });
  });
 }catch(error){
  const stopped=await getJob(input.id);if(!stopped||stopped.abortedAt||stopped.cancelledAt)throw Error('This job was stopped.');
  const message='Using the original recording was not confirmed. Retry the same action. '+(error instanceof Error?error.message:'Please try again.');
  const latest=await mutate<OriginalVoiceoverJob|null,Job|null>(`job-${input.id}`,null,job=>{if(job&&job.originalVoiceoverDelivery?.token===token&&!job.abortedAt&&!job.cancelledAt){job.originalVoiceoverDelivery.error=message;if(job.lease===token){job.lease=undefined;job.leaseUntil=undefined;}job.updated=Date.now();}return job?structuredClone(job):null;});
  throw new OriginalVoiceoverSaveError(message,latest);
 }
}
