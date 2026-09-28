import {google} from 'googleapis';
import {sheetAuth,shiftAdminRange} from './sheets';
import {getJob,type Job} from './jobs';
import {editorAssignment} from './editor-sync';
import {EDITOR_WORKSPACES} from './editor-workspaces';
import {withEditorLocks} from './editor-locks';
import {mutate} from './store';
import type {Snapshot} from './editor-sync-plan';
import {replaceHookLink} from './hook-delivery';
import {voiceLinkRuns} from './voice-links';

export async function saveHookDelivery(id:string,index:number,enabled:boolean){
 if(!Number.isInteger(index)||index<0||index>1||typeof enabled!=='boolean')throw Error('Invalid hook selection.');
 const before=await getJob(id);if(!before?.result?.hooks[index]||!before.adId)throw Error('Wait for the brief to be saved.');
 const adId=before.adId,assignment=await editorAssignment(adId),workspace=EDITOR_WORKSPACES.find(w=>w.id===assignment.current);if(!workspace)throw Error('Editor not found.');
 return withEditorLocks(['ad-'+adId,'voice-'+adId,'workspace-'+workspace.id],async()=>{
  if((await editorAssignment(adId)).current!==workspace.id)throw Error('Editor changed. Refresh and try again.');
  const api=google.sheets({version:'v4',auth:sheetAuth()});
  const targets=[{id:process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY',title:'Daily Briefs',range:'A1:AC502'},{id:workspace.sheetId,title:'My Tasks',range:'A1:R501'}];
  const sheets=await Promise.all(targets.map(async target=>{
   const meta=await api.spreadsheets.get({spreadsheetId:target.id,fields:'sheets.properties'}),sheetId=meta.data.sheets?.find(s=>s.properties?.title===target.title)?.properties?.sheetId;if(sheetId==null)throw Error('Sheet missing.');
   const data=(await api.spreadsheets.values.get({spreadsheetId:target.id,range:`'${target.title}'!${target.range}`,valueRenderOption:'UNFORMATTED_VALUE'})).data.values||[],headers=data[0]||[];
   const matches=data.map((row,i)=>({row,i})).filter(x=>x.i>0&&x.row[headers.indexOf('Ad ID')]===adId);if(matches.length!==1)throw Error('Ad is missing or duplicated in the sheet.');
   const hookCol=headers.indexOf(`Hook ${index+1}`),voiceCol=headers.indexOf('Voice Over');if(hookCol<0||voiceCol<0)throw Error('Hook or voiceover column missing.');
   return {...target,sheetId,hookCol,voiceCol,row:matches[0].i+1,links:String(matches[0].row[voiceCol]||'')};
  }));
  // Persist intent before external writes. A failed delivery is visible and retryable.
  const job=await mutate<Job|null,Job>(`job-${id}`,null,j=>{
   if(!j?.result||j.abortedAt)throw Error('This job is unavailable.');
   if((j.leaseUntil||0)>Date.now()||Object.values(j.hookVoPending||{}).some(Boolean))throw Error('A recording or save is in progress. Try again when it finishes.');
   if(j.hookDeliveryPending!==undefined&&j.hookDeliveryPending!==index)throw Error('Retry the unfinished hook selection first.');
   j.hooksToEditor={...j.hooksToEditor,[index]:enabled};j.hookDeliveryPending=index;j.updated=Date.now();return structuredClone(j);
  });
  const text=enabled?job.result!.hooks[index]:'';
  const editorLinks=replaceHookLink(sheets[1].links,index,enabled?job.hookVoUrls?.[index]:undefined);
  for(const target of sheets){
   const links=replaceHookLink(target.links,index,enabled?job.hookVoUrls?.[index]:undefined);
   await api.spreadsheets.batchUpdate({spreadsheetId:target.id,requestBody:{requests:[
    {updateCells:{range:{sheetId:target.sheetId,startRowIndex:target.row-1,endRowIndex:target.row,startColumnIndex:target.hookCol,endColumnIndex:target.hookCol+1},rows:[{values:[{userEnteredValue:{stringValue:text}}]}],fields:'userEnteredValue'}},
    {updateCells:{range:{sheetId:target.sheetId,startRowIndex:target.row-1,endRowIndex:target.row,startColumnIndex:target.voiceCol,endColumnIndex:target.voiceCol+1},rows:[{values:[{userEnteredValue:{stringValue:links},textFormatRuns:voiceLinkRuns(links)}]}],fields:'userEnteredValue,textFormatRuns'}}
   ]}});
   const read=await api.spreadsheets.values.batchGet({spreadsheetId:target.id,ranges:[target.hookCol,target.voiceCol].map(c=>`'${target.title}'!${shiftAdminRange('A',c)}${target.row}`)});
   if(String(read.data.valueRanges?.[0].values?.[0]?.[0]||'')!==text||String(read.data.valueRanges?.[1].values?.[0]?.[0]||'')!==links)throw Error('Selection saved, but sheet delivery could not be confirmed. Retry saving the selection.');
  }
  // The checkbox is an explicit edit: make it the new baseline for future syncs.
  await mutate<{snapshot:Snapshot},void>('editor-sync-v3-'+workspace.sheetId,{snapshot:{}},s=>{
   const row=s.snapshot[adId]??={};row[`Hook ${index+1}`]=text;row['Voice Over']=editorLinks;delete row[`manual:Hook ${index+1}`];
  });
  return mutate<Job|null,Job>(`job-${id}`,null,j=>{if(!j)throw Error('Job missing.');j.hookDeliveryPending=undefined;j.updated=Date.now();return j;});
 });
}
