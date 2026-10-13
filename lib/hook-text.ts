import {randomUUID} from 'node:crypto';
import {google} from 'googleapis';
import {assertAdActive,assertJobActive} from './cancellation';
import {editorAssignment} from './editor-sync';
import {withEditorLocks} from './editor-locks';
import {EDITOR_WORKSPACES} from './editor-workspaces';
import type {Snapshot} from './editor-sync-plan';
import {sendsHook} from './hook-delivery';
import {getJob,type Job} from './jobs';
import {sheetAuth,shiftAdminRange} from './sheets';
import {mutate} from './store';
import {canonicalUkMedicationName} from './uk-medication';
import {hasTokens} from './validation';

type HookTextDelivery={token:string;index:number;previousText:string;text:string;error?:string};
type HookTextJob=Job&{hookTextDelivery?:HookTextDelivery};
export type HookTextInput={id:string;index:number;text:string;expectedText:string};
export class HookTextSaveError extends Error{
 readonly status=503;
 constructor(message:string,readonly job:Job|null){super(message);this.name='HookTextSaveError';}
}

function assertEditable(job:HookTextJob|null,index:number){
 if(!job||job.abortedAt||job.cancelledAt||['Cancelled','Aborted'].includes(job.status))throw Error('This job was stopped.');
 if(!job.result?.hooks[index]||!job.adId)throw Error('Wait for the brief to be saved.');
 if((job.leaseUntil||0)>Date.now()||'originalVoiceoverDelivery' in job&&job.originalVoiceoverDelivery||job.hookVoPending?.[index])throw Error('A recording or save is in progress. Try again when it finishes.');
}
function sameDelivery(delivery:HookTextDelivery|undefined,input:HookTextInput){
 return !!delivery&&delivery.index===input.index&&delivery.previousText===input.expectedText&&delivery.text===input.text;
}
function validateInput(input:HookTextInput){
 if(typeof input.id!=='string'||!/^[\w-]{8,100}$/.test(input.id))throw Error('Invalid job ID.');
 if(!Number.isInteger(input.index)||input.index<0||input.index>1)throw Error('Invalid hook selection.');
 if(typeof input.text!=='string'||!input.text.trim()||input.text.length>5000||hasTokens(input.text))throw Error('Enter a complete hook before saving.');
 if(typeof input.expectedText!=='string'||input.expectedText.length>5000)throw Error('The previous hook is required. Refresh and try again.');
}

/** Save one explicitly accepted hook; every other copy/audio field stays intact. */
export async function saveHookText(input:HookTextInput):Promise<Job>{
 validateInput(input);
 const before=await getJob(input.id) as HookTextJob|null;
 assertEditable(before,input.index);
 // This is the owner's explicit UK literal edit, not a rewrite of the hook.
 if(before!.market!=='pl')input={...input,text:canonicalUkMedicationName(input.text)};
 const adId=before!.adId!,assignment=await editorAssignment(adId),workspace=EDITOR_WORKSPACES.find(w=>w.id===assignment.current);
 if(!workspace)throw Error('Editor not found.');
 return withEditorLocks(['ad-'+adId,'sheet-write-'+adId,'workspace-'+workspace.id],async()=>{
  await assertJobActive(input.id);await assertAdActive(adId);
  if((await editorAssignment(adId)).current!==workspace.id)throw Error('Editor changed. Refresh and try again.');
  const token=randomUUID();
  const reserved=await mutate<HookTextJob|null,HookTextJob>(`job-${input.id}`,null,job=>{
   assertEditable(job,input.index);
   if(job!.adId!==adId)throw Error('The brief changed. Refresh and try again.');
   if(job!.hookDeliveryPending!==undefined){
    if(job!.hookDeliveryPending!==input.index||!sameDelivery(job!.hookTextDelivery,input))throw Error('Finish saving the previous hook change first.');
   }else if(job!.hookTextDelivery)throw Error('Finish saving the previous hook change first.');
   if(job!.result!.hooks[input.index]!==input.expectedText)throw Error('This hook changed in another tab. Refresh and try again.');
   // Reserve without changing the displayed result until both sheets confirm it.
   job!.hookDeliveryPending=input.index;job!.hookTextDelivery={token,index:input.index,previousText:input.expectedText,text:input.text};job!.updated=Date.now();return structuredClone(job!);
  });
  try{
   const api=google.sheets({version:'v4',auth:sheetAuth()}),targets=[{id:process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY',title:'Daily Briefs',range:'A1:AE502'},{id:workspace.sheetId,title:'My Tasks',range:'A1:S501'}];
   const sheets=await Promise.all(targets.map(async target=>{
    const data=(await api.spreadsheets.values.get({spreadsheetId:target.id,range:`'${target.title}'!${target.range}`,valueRenderOption:'UNFORMATTED_VALUE'})).data.values||[],headers=data[0]||[];
    const idCol=headers.indexOf('Ad ID'),hookCol=headers.indexOf(`Hook ${input.index+1}`);
    if(idCol<0||hookCol<0)throw Error('Ad ID or hook column missing.');
    const matches=data.map((row,i)=>({row,i})).filter(x=>x.i>0&&x.row[idCol]===adId);
    if(matches.length!==1)throw Error('Ad is missing or duplicated in the sheet.');
    return {...target,row:matches[0].i+1,hookCol};
   }));
   const text=sendsHook(reserved,input.index)?input.text:'';
   for(const target of sheets){
    // Cancellation marks state immediately, before it waits for these sheet locks.
    await assertJobActive(input.id);await assertAdActive(adId);
    const range=`'${target.title}'!${shiftAdminRange('A',target.hookCol)}${target.row}`;
    await api.spreadsheets.values.update({spreadsheetId:target.id,range,valueInputOption:'RAW',requestBody:{values:[[text]]}});
    const read=await api.spreadsheets.values.get({spreadsheetId:target.id,range,valueRenderOption:'UNFORMATTED_VALUE'});
    if(String(read.data.values?.[0]?.[0]||'')!==text)throw Error('The updated hook could not be confirmed in the sheet.');
   }
   await assertJobActive(input.id);await assertAdActive(adId);
   // Keep the three-way sync baseline aligned only for this one hook column.
   await mutate<{snapshot:Snapshot},void>('editor-sync-v3-'+workspace.sheetId,{snapshot:{}},state=>{
    const row=state.snapshot[adId]??={};row[`Hook ${input.index+1}`]=text;delete row[`manual:Hook ${input.index+1}`];
   });
   return await mutate<HookTextJob|null,Job>(`job-${input.id}`,null,job=>{
    if(!job||job.abortedAt||job.cancelledAt)throw Error('This job was stopped.');
    if(job.hookTextDelivery?.token!==token||job.hookDeliveryPending!==input.index||job.result!.hooks[input.index]!==input.expectedText)throw Error('The hook changed before its save could finish. Refresh and try again.');
    job.result!.hooks[input.index]=input.text;
    if(input.text!==input.expectedText&&(job.hookVoUrls?.[input.index]||job.hookVoOriginalUrls?.[input.index]))job.hookVoNeedsRegeneration={...job.hookVoNeedsRegeneration,[input.index]:true};
    delete job.hookTextDelivery;job.hookDeliveryPending=undefined;job.updated=Date.now();return structuredClone(job);
   });
  }catch(error){
   const message='Hook delivery was not confirmed. Retry saving this same hook. '+(error instanceof Error?error.message:'Please try again.');
   const latest=await mutate<HookTextJob|null,Job|null>(`job-${input.id}`,null,job=>{
    if(job&&!job.abortedAt&&!job.cancelledAt&&job.hookTextDelivery?.token===token)job.hookTextDelivery.error=message;
    return job?structuredClone(job):null;
   });
   throw new HookTextSaveError(message,latest);
  }
 });
}
