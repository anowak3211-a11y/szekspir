import {google} from 'googleapis';
import {sheetAuth} from './sheets';
import {withEditorLocks} from './editor-locks';
import {EDITOR_WORKSPACES} from './editor-workspaces';
import {readState,mutate} from './store';
import {canonicalAdId,markAdCancelled} from './cancellation';
function column(index:number){let result='';for(index++;index;index=Math.floor((index-1)/26))result=String.fromCharCode(65+(index-1)%26)+result;return result;}
export async function cleanupCancelledBrief(jobId:string){
 const deadline=Date.now()+180000;
 // Drain an export that reserved an Ad ID before its job checkpoint was cancelled.
 return withEditorLocks(['brief-job-'+jobId],async()=>{
  const job=(await readState<{adId?:string;cancelledAt?:number}|null>('job-'+jobId,null)).value;
  if(!job?.cancelledAt)throw Error('Stop the job before removing its sheet records.');
  const reservations=(await readState<{reservations:Record<string,{adId:string}>}>('sheet-allocations',{reservations:{}})).value.reservations;
  const adIds=[...new Set([job.adId,reservations[jobId]?.adId].filter((id):id is string=>!!id).map(canonicalAdId))];
  for(const id of adIds)await markAdCancelled(id,jobId,job.cancelledAt);
  if(!adIds.length)return adIds;
  // Sheet writes and syncs must finish before clearing rows; no row indexes shift.
  return withEditorLocks([...adIds.flatMap(id=>['ad-'+id,'sheet-write-'+id]),...EDITOR_WORKSPACES.map(w=>'workspace-'+w.id)],async()=>{
   const api=google.sheets({version:'v4',auth:sheetAuth()});
   const targets=[{id:process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY',tab:'Daily Briefs'},...EDITOR_WORKSPACES.map(w=>({id:w.sheetId,tab:'My Tasks'}))];
   const plans=await Promise.all(targets.map(async target=>{
    const meta=await api.spreadsheets.get({spreadsheetId:target.id,fields:'sheets.properties(sheetId,title,gridProperties)'});
    const properties=meta.data.sheets?.find(s=>s.properties?.title===target.tab)?.properties;
    if(properties?.sheetId===undefined||properties.sheetId===null||!properties.gridProperties?.rowCount||!properties.gridProperties.columnCount)throw Error('Cancellation could not inspect '+target.tab+'.');
    const end=column(properties.gridProperties.columnCount-1);
    const headers=(await api.spreadsheets.values.get({spreadsheetId:target.id,range:`'${target.tab}'!A1:${end}1`})).data.values?.[0]||[];
    const idCol=headers.indexOf('Ad ID');if(idCol<0||headers.lastIndexOf('Ad ID')!==idCol)throw Error('Cancellation could not identify the Ad ID column.');
    const ids=(await api.spreadsheets.values.get({spreadsheetId:target.id,range:`'${target.tab}'!${column(idCol)}2:${column(idCol)}${properties.gridProperties.rowCount}`})).data.values||[];
    const rows=ids.flatMap((row,i)=>{const id=String(row[0]||'').trim();return /^MEL-\d+$/i.test(id)&&adIds.includes(canonicalAdId(id))?[i+2]:[];});
    return {...target,sheetId:properties.sheetId,cols:properties.gridProperties.columnCount,end,idCol,statusCol:headers.indexOf('Production status'),rowCount:properties.gridProperties.rowCount,rows};
   }));
   for(const plan of plans){
    if(!plan.rows.length)continue;
    const backup=await api.spreadsheets.get({spreadsheetId:plan.id,ranges:plan.rows.map(row=>`'${plan.tab}'!A${row}:${plan.end}${row}`),includeGridData:true,fields:'sheets(properties(sheetId),data(startRow,rowData(values(formattedValue,userEnteredValue,userEnteredFormat,dataValidation,textFormatRuns,note))))'});
    const data=backup.data.sheets?.find(s=>s.properties?.sheetId===plan.sheetId)?.data||[];
    for(const row of plan.rows){const cell=data.find(d=>d.startRow===row-1)?.rowData?.[0]?.values?.[plan.idCol];const id=String(cell?.formattedValue??cell?.userEnteredValue?.stringValue??'').trim();if(!/^MEL-\d+$/i.test(id)||!adIds.includes(canonicalAdId(id)))throw Error('Cancellation row changed. Retry without deleting another ad.');}
    await mutate<{entries:unknown[]},void>('cancelled-sheet-rows-'+jobId,{entries:[]},s=>{s.entries.push({at:Date.now(),spreadsheetId:plan.id,tab:plan.tab,rows:plan.rows,cells:backup.data});});
    await api.spreadsheets.batchUpdate({spreadsheetId:plan.id,requestBody:{requests:plan.rows.map(row=>({updateCells:{range:{sheetId:plan.sheetId,startRowIndex:row-1,endRowIndex:row,startColumnIndex:0,endColumnIndex:plan.cols},rows:[{values:Array.from({length:plan.cols},(_,col)=>{const formula=data.find(d=>d.startRow===row-1)?.rowData?.[0]?.values?.[col]?.userEnteredValue?.formulaValue;return col===plan.statusCol&&formula?{userEnteredValue:{formulaValue:formula}}:{};})}],fields:'userEnteredValue,textFormatRuns,note'}}))}});
    const remaining=(await api.spreadsheets.values.get({spreadsheetId:plan.id,range:`'${plan.tab}'!${column(plan.idCol)}2:${column(plan.idCol)}${plan.rowCount}`})).data.values||[];
    if(remaining.some(r=>/^MEL-\d+$/i.test(String(r[0]||''))&&adIds.includes(canonicalAdId(String(r[0])))))throw Error('Cancellation sheet removal was not confirmed. Retry cleanup.');
   }
   await mutate<{max:number;lastRow:number;reservations:Record<string,{adId:string;row:number}>},void>('sheet-allocations',{max:0,lastRow:1,reservations:{}},s=>{const reservation=s.reservations[jobId];if(reservation&&adIds.includes(canonicalAdId(reservation.adId)))reservation.row=0;});
   return adIds;
  },deadline);
 },deadline);
}
