import {retireLegacySync,retireV2Sync} from './editor-sync-version';
import {withEditorLocks} from './editor-locks';
import {additionalLinkRuns} from './additional-files-model';
import {voiceLinkRuns} from './voice-links';
import {randomUUID} from 'node:crypto';
import {google} from 'googleapis';
import {sheetAuth} from './sheets';
import {mutate,readState} from './store';
import {planAssignedSync,Snapshot,Change} from './editor-sync-plan';
const adminId=()=>process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY';
import {EDITOR_WORKSPACES} from './editor-workspaces';
type State={snapshot:Snapshot;lease?:string;leaseUntil?:number;lastSuccess?:number;lastError?:string};
const initial=():State=>({snapshot:{}});
function letter(n:number){let out='';for(n++;n>0;n=Math.floor((n-1)/26))out=String.fromCharCode(65+(n-1)%26)+out;return out;}
async function syncOne(workspace:typeof EDITOR_WORKSPACES[number]){
 const editorId=()=>workspace.sheetId;
 const legacySnapshot=await retireV2Sync(editorId(),await retireLegacySync(editorId()));
 const name='editor-sync-v3-'+editorId(),token=randomUUID();let saved:State;

 try{saved=await mutate<State,State>(name,{snapshot:legacySnapshot},s=>{if((s.leaseUntil||0)>Date.now())throw Error('SYNC_BUSY');s.lease=token;s.leaseUntil=Date.now()+360000;return structuredClone(s);});}catch(e){if((e as Error).message==='SYNC_BUSY')return {busy:true};throw e;}
 const sheets=google.sheets({version:'v4',auth:sheetAuth()});
 try{
  const load=async(spreadsheetId:string,title:string)=>{const capacity=title==='Daily Briefs'?502:501;const r=await sheets.spreadsheets.values.get({spreadsheetId,range:`'${title}'!A1:${title==='Daily Briefs'?'AC':'R'}${capacity}`,valueRenderOption:'UNFORMATTED_VALUE'});return {rows:r.data.values||[],capacity};};
  const [admin,editor]=await Promise.all([load(adminId(),'Daily Briefs'),load(editorId(),'My Tasks')]);
  const plan=planAssignedSync(admin.rows,editor.rows,saved.snapshot,editor.capacity,workspace.id);
  if(!plan.adminChanges.length&&!plan.editorChanges.length&&JSON.stringify(plan.snapshot)===JSON.stringify(saved.snapshot)){await mutate<State,void>(name,initial(),s=>{if(s.lease===token){s.lease=undefined;s.leaseUntil=undefined;}});return {unchanged:true};}
  const write=async(spreadsheetId:string,title:string,changes:Change[])=>{if(changes.length)await sheets.spreadsheets.values.batchUpdate({spreadsheetId,requestBody:{valueInputOption:'RAW',data:changes.map(c=>({range:`'${title}'!${letter(c.col)}${c.row}`,values:[[c.value]]}))}});};
  const formatVoice=async(spreadsheetId:string,title:string,changes:Change[])=>{const links=changes.filter(c=>typeof c.value==='string'&&(voiceLinkRuns(c.value).length||additionalLinkRuns(c.value).length));if(!links.length)return;const meta=await sheets.spreadsheets.get({spreadsheetId,fields:'sheets.properties'});const sheetId=meta.data.sheets?.find(s=>s.properties?.title===title)?.properties?.sheetId;if(sheetId===undefined||sheetId===null)return;await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:links.map(c=>({updateCells:{range:{sheetId,startRowIndex:c.row-1,endRowIndex:c.row,startColumnIndex:c.col,endColumnIndex:c.col+1},rows:[{values:[{textFormatRuns:voiceLinkRuns(String(c.value)).length?voiceLinkRuns(String(c.value)):additionalLinkRuns(String(c.value))}]}],fields:'textFormatRuns'}}))}});};
  // Save both review versions before any sync write, including conflicting versions.
  const reviews=(rows:unknown[][])=>{const h=rows[0]||[];return rows.slice(1).filter(r=>r[h.indexOf('Ad ID')]).map(r=>Object.fromEntries(['Ad ID','Feedback','Approval','Approval after changes'].map(k=>[k,r[h.indexOf(k)]??''])));};
  await mutate<{entries:{at:number;admin:unknown;editor:unknown}[]},void>('review-history-'+workspace.id,{entries:[]},s=>{const entry={at:Date.now(),admin:reviews(admin.rows),editor:reviews(editor.rows)};const last=s.entries.at(-1);if(!last||JSON.stringify([last.admin,last.editor])!==JSON.stringify([entry.admin,entry.editor])){s.entries.push(entry);s.entries=s.entries.slice(-200);}});
  // Stable Ad IDs and a three-way baseline keep existing editor work attached to its ad.
  await write(adminId(),'Daily Briefs',plan.adminChanges);
  await write(editorId(),'My Tasks',plan.editorChanges);await formatVoice(editorId(),'My Tasks',plan.editorChanges);
  const time=new Date().toLocaleString('en-GB',{timeZone:'Europe/London'});
  await sheets.spreadsheets.values.update({spreadsheetId:adminId(),range:"'Dashboard'!B23",valueInputOption:'RAW',requestBody:{values:[[`Active · ${time}${plan.conflicts?' · '+plan.conflicts+' simultaneous edit(s): review conflicts preserved for inspection':''}`]]}});
  await sheets.spreadsheets.values.update({spreadsheetId:editorId(),range:"'Dashboard'!B4:C4",valueInputOption:'RAW',requestBody:{values:[['Connected',`Last synced ${time} · checks every 5 minutes; timestamp shows last change`]]}});
  await mutate<State,void>(name,initial(),s=>{if(s.lease!==token)throw Error('Sync lease expired');s.snapshot=plan.snapshot;s.lastSuccess=Date.now();s.lastError=undefined;s.lease=undefined;s.leaseUntil=undefined;});
  return {ads:plan.ads,toEditor:plan.editorChanges.length,toAdmin:plan.adminChanges.length,conflicts:plan.conflicts};
 }catch(e){await mutate<State,void>(name,initial(),s=>{if(s.lease===token){s.lease=undefined;s.leaseUntil=undefined;s.lastError=(e as Error).message;}});throw e;}
}

async function syncWorkspace(workspace:typeof EDITOR_WORKSPACES[number]){
 const result=await syncOne(workspace);if('busy' in result)throw Error('Previous editor sync is still finishing. Please retry.');return result;
}
export async function syncEditorWorkspace(){
 const results=await Promise.allSettled(EDITOR_WORKSPACES.map(workspace=>withEditorLocks(['workspace-'+workspace.id],()=>syncWorkspace(workspace))));
 const failure=results.find(r=>r.status==='rejected');if(failure?.status==='rejected')throw failure.reason;
 return results.map(r=>r.status==='fulfilled'?r.value:null);
}
export async function editorAssignment(adId:string){
 const api=google.sheets({version:'v4',auth:sheetAuth()});const r=await api.spreadsheets.values.get({spreadsheetId:adminId(),range:"'Daily Briefs'!A1:W502"});const rows=r.data.values||[],idCol=rows[0]?.indexOf('Ad ID'),assignmentCol=rows[0]?.indexOf('Editor ID'),nameCol=rows[0]?.indexOf('Editor name'),row=rows.findIndex((r,i)=>i>0&&r[idCol]===adId);if(row<1)throw Error('Ad not found in master sheet');return {api,row:row+1,assignmentCol,nameCol,current:String(rows[row][assignmentCol]||'mine')};
}
export async function assignEditor(adId:string,editorId:string){
 editorId=editorId||'mine';
 if(editorId!==''&&!EDITOR_WORKSPACES.some(x=>x.id===editorId))throw Error('Unknown editor');
 const deadline=Date.now()+180000;
 return withEditorLocks(['ad-'+adId],async()=>{
  const previous=(await editorAssignment(adId)).current;
  const source=EDITOR_WORKSPACES.find(w=>w.id===previous),target=EDITOR_WORKSPACES.find(w=>w.id===editorId)!;
  return withEditorLocks([...(source?['workspace-'+source.id]:[]),'workspace-'+target.id],async()=>{
   // Preserve submitted work before changing ownership; other editors remain independent.
   if(source)await syncWorkspace(source);
   const {api,row,assignmentCol,nameCol}=await editorAssignment(adId);
   const data=[{range:`'Daily Briefs'!${letter(assignmentCol)}${row}`,values:[[editorId]]}];
   if(nameCol>=0)data.push({range:`'Daily Briefs'!${letter(nameCol)}${row}`,values:[[target.name]]});
   await api.spreadsheets.values.batchUpdate({spreadsheetId:adminId(),requestBody:{valueInputOption:'RAW',data}});
   if(source&&source.id!==target.id)await syncWorkspace(source);
   await syncWorkspace(target);return {editorId};
  },deadline);
 },deadline);
}
export async function syncAssignedEditor(adId:string){const deadline=Date.now()+180000;return withEditorLocks(['ad-'+adId],async()=>{
 const {current}=await editorAssignment(adId),workspace=EDITOR_WORKSPACES.find(e=>e.id===current);
 if(!workspace)throw Error('Unknown assigned editor');
 return withEditorLocks(['workspace-'+workspace.id],()=>syncWorkspace(workspace),deadline);
},deadline);}

export async function verifyEditorDelivery(job:import('./jobs').Job,synchronise=true){
 if(!job.adId)throw Error('Save the brief before finishing.');
 return withEditorLocks(['ad-'+job.adId],async()=>{
  const {api,current}=await editorAssignment(job.adId!);const workspace=EDITOR_WORKSPACES.find(w=>w.id===current);if(!workspace)throw Error('Assigned editor not found.');
  return withEditorLocks(['workspace-'+workspace.id],async()=>{
   if(synchronise)await syncWorkspace(workspace);
   const response=await api.spreadsheets.values.get({spreadsheetId:workspace.sheetId,range:"'My Tasks'!A1:R501",valueRenderOption:'UNFORMATTED_VALUE'});
   const rows=response.data.values||[],headers=(rows[0]||[]).map(String),idCol=headers.indexOf('Ad ID');
   const matching=rows.slice(1).filter(row=>row[idCol]===job.adId);if(matching.length>1)throw Error('The editor sheet contains duplicate rows for this ad.');
   const {editorChecklist,deliveryVersion}=await import('./editor-checklist');const checks=editorChecklist(job,headers,matching[0]||[]);
   return {version:deliveryVersion(job),ok:checks.every(check=>check.ok),checks,editor:workspace.name,url:`https://docs.google.com/spreadsheets/d/${workspace.sheetId}/edit#gid=801`,checkedAt:Date.now()};
  });
 });
}
