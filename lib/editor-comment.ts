import {getJob,type Job} from './jobs';
import {mutate} from './store';
import {editorAssignment} from './editor-sync';
import {withEditorLocks} from './editor-locks';
import {EDITOR_WORKSPACES} from './editor-workspaces';
import {shiftAdminRange} from './sheets';
export function mergeComment(values:string[],comment:string){
 const parts=[...new Set([...values,comment].flatMap(s=>s.split(/\n\s*\n/)).map(s=>s.trim()).filter(Boolean))];
 return parts.join('\n\n');
}
export async function addEditorComment(id:string,input:unknown){
 if(typeof input!=='string'||!input.trim()||input.trim().length>5000)throw Error('Enter a comment of up to 5,000 characters.');
 const comment=input.trim(),job=await getJob(id);
 if(!job?.adId)throw Error('Wait until the ad has been saved to the editor sheet.');
 const adId=job.adId;
 return withEditorLocks(['ad-'+adId],async()=>{
  const assignment=await editorAssignment(adId),workspace=EDITOR_WORKSPACES.find(w=>w.id===assignment.current);
  if(!workspace)throw Error('This ad has no active editor assignment.');
  return withEditorLocks(['workspace-'+workspace.id],async()=>{
   const api=assignment.api,admin=process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY';
   const targets=[{spreadsheetId:admin,tab:'Daily Briefs'},{spreadsheetId:workspace.sheetId,tab:'My Tasks'}];
   const cells=await Promise.all(targets.map(async target=>{
    const rows=(await api.spreadsheets.values.get({spreadsheetId:target.spreadsheetId,range:`'${target.tab}'!A1:AZ502`})).data.values||[];
    const header=rows[0]||[],idCol=header.indexOf('Ad ID'),col=header.indexOf('Notes');
    const matches=rows.map((row,i)=>i>0&&row[idCol]===adId?i:-1).filter(i=>i>=0);
    if(idCol<0||col<0||matches.length!==1)throw Error('Cannot find one matching ad and Notes column. No row will be recreated.');
    const row=matches[0];return {...target,range:`'${target.tab}'!${shiftAdminRange('A',col)}${row+1}`,value:String(rows[row][col]||'')};
   }));
   const notes=mergeComment(cells.map(c=>c.value),comment);
   if(notes.length>49000)throw Error('The Notes cell is too long. Shorten the existing notes first.');
   for(const cell of cells)if(cell.value!==notes)await api.spreadsheets.values.update({spreadsheetId:cell.spreadsheetId,range:cell.range,valueInputOption:'RAW',requestBody:{values:[[notes]]}});
   await mutate<Job|null,void>(`job-${id}`,null,s=>{if(!s)throw Error('Job not found');s.editorNotes=notes;});
   return {ok:true,notes,editor:workspace.name};
  });
 });
}
