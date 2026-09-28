import {EDITOR_WORKSPACES} from './editor-workspaces';
import {withEditorLocks} from './editor-locks';
import {voiceLinkRuns,mergeVoiceLinks} from './voice-links';
import { google } from "googleapis";
import path from "path";

export function sheetAuth() {
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ];
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    return new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
      scopes,
    });
  }
  return new google.auth.GoogleAuth({
    keyFile:
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.join(process.cwd(), "google-service-account.json"),
    scopes,
  });
}

const ADMIN_SHEET = () =>
  process.env.ADMIN_SHEET_ID || "17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY";
const BRIEFS_TAB = "Daily Briefs";
export function shiftAdminRange(value:string,offset:number){return offset?value.replace(/([A-Z]+)(?=\d|$)/g,letters=>{let n=0;for(const c of letters)n=n*26+c.charCodeAt(0)-64;n+=offset;let out='';while(n){out=String.fromCharCode(65+(n-1)%26)+out;n=Math.floor((n-1)/26);}return out;}):value;}
async function adminOffset(sheets:ReturnType<typeof google.sheets>,spreadsheetId:string){const h=await sheets.spreadsheets.values.get({spreadsheetId,range:"'Daily Briefs'!A1:B1"});return h.data.values?.[0]?.[0]==='Editor name'?1:0;}



import {mutate} from './store';
import {opening} from './validation';
export interface BriefRow {noSpeech?:boolean;editorNotes?:string;editorId?:string;uk:string;hooks:string[];hookOg:string;desire:string;angle:string;mechanism:string;funnel:string;reference:string; jobId:string;}
function slug(s:string){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);}
type Reservation={adId:string;row:number};
type Allocations={max:number;lastRow:number;reservations:Record<string,Reservation>};
export async function appendToAdminBriefs(row:BriefRow){
 const editor=EDITOR_WORKSPACES.find(e=>e.id===(row.editorId||'mine'));if(!editor)throw Error('Unknown editor');
 if(!/^[\w-]{8,100}$/.test(row.jobId)||(!row.uk.trim()&&!row.noSpeech)||![0,2,3].includes(row.hooks.length)||!['TOF','MOF','BOF'].includes(row.funnel))throw new Error('Invalid brief');
 const sheets=google.sheets({version:'v4',auth:sheetAuth()}),spreadsheetId=ADMIN_SHEET();
 const offset=await adminOffset(sheets,spreadsheetId),r=(value:string)=>shiftAdminRange(value,offset);
 const ids=await sheets.spreadsheets.values.get({spreadsheetId,range:r(`'${BRIEFS_TAB}'!A2:A`)});
 let max=0,lastRow=1;
 (ids.data.values||[]).forEach((r,i)=>{if(r.some(x=>String(x).trim()))lastRow=i+2;const m=String(r[0]||'').match(/^MEL-(\d+)$/);if(m)max=Math.max(max,Number(m[1]));});
 const reserved=await mutate<Allocations,Reservation>('sheet-allocations',{max:0,lastRow:1,reservations:{}},state=>{
  const prior=state.reservations[row.jobId];
  if(prior){const at=(ids.data.values||[]).findIndex(v=>v[0]===prior.adId);if(at>=0)prior.row=at+2;return prior;}
  const occupied=new Set<number>();
  (ids.data.values||[]).forEach((v,i)=>{if(v.some(x=>String(x).trim()))occupied.add(i+2);});
  Object.values(state.reservations).forEach(v=>occupied.add(v.row));
  let next=2;while(occupied.has(next))next++;
  state.max=Math.max(state.max,max)+1;state.lastRow=Math.max(state.lastRow,next);
  const value={adId:`MEL-${String(state.max).padStart(5,'0')}`,row:next};state.reservations[row.jobId]=value;return value;
 });
 const n=reserved.row;
 const current=await sheets.spreadsheets.values.get({spreadsheetId,range:r(`'${BRIEFS_TAB}'!A${n}:V${n}`)});
 const existing=current.data.values?.[0]||[];
 if(existing.some(x=>String(x).trim())&&existing[0]!==reserved.adId)throw new Error('Reserved row has changed outside this app. No data overwritten.');
 const adName=`${reserved.adId}_${row.funnel}_${slug(row.desire)}_${slug(row.angle)}`;
 // Only write owned columns; LP, likes and all editor fields survive edits/retries.
 const data=[{range:r(`'${BRIEFS_TAB}'!A${n}:F${n}`),values:[[reserved.adId,adName,row.desire,row.angle,row.mechanism,row.funnel]]},{range:r(`'${BRIEFS_TAB}'!I${n}:M${n}`),values:[[row.uk,opening(row.uk),row.hooks[0]||'',row.hooks[1]||'','']]}];
 if(!existing[20]){data.push({range:r(`'${BRIEFS_TAB}'!U${n}`),values:[[editor.id]]});if(offset)data.push({range:`'${BRIEFS_TAB}'!A${n}`,values:[[editor.name]]});}
 if(!existing[13])data.push({range:r(`'${BRIEFS_TAB}'!N${n}`),values:[[row.reference.replace(/^clean video:\s*/i,'')]]});
 await sheets.spreadsheets.values.batchUpdate({spreadsheetId,requestBody:{valueInputOption:'RAW',data}});
 if(row.editorNotes){const header=(await sheets.spreadsheets.values.get({spreadsheetId,range:"'Daily Briefs'!A1:AZ1"})).data.values?.[0]||[];const col=header.indexOf('Notes');if(col<0)throw Error('Notes column is not configured');await sheets.spreadsheets.values.update({spreadsheetId,range:`'Daily Briefs'!${shiftAdminRange('A',col)}${n}`,valueInputOption:'RAW',requestBody:{values:[[row.editorNotes]]}});}
 // Formula reacts to actual values, not cell fill colours. Existing workflows are preserved.
 if(!existing[19])await sheets.spreadsheets.values.update({spreadsheetId,range:r(`'${BRIEFS_TAB}'!T${n}`),valueInputOption:'USER_ENTERED',requestBody:{values:[[productionFormula(n,offset)]]}});
 return {adId:reserved.adId,url:`https://docs.google.com/spreadsheets/d/${spreadsheetId}`};
}
export function productionFormula(n:number,offset=0){return shiftAdminRange(`=IF(A${n}="","",IF(REGEXMATCH(LOWER(TO_TEXT(R${n})),"^(approved|green|🟢 approved)$"),"Launched",IF(REGEXMATCH(LOWER(TO_TEXT(R${n})),"changes requested|rejected|red|🔴"),"Changes requested",IF(P${n}<>"","Ready for review",IF(OR(U${n}<>"",V${n}<>""),"Editing","To do")))))`,offset);}
export async function updateReference(adId:string,reference:string,voiceover?:string){
 const sheets=google.sheets({version:'v4',auth:sheetAuth()}),spreadsheetId=ADMIN_SHEET();
 const offset=await adminOffset(sheets,spreadsheetId),r=(value:string)=>shiftAdminRange(value,offset);
 const ids=await sheets.spreadsheets.values.get({spreadsheetId,range:r(`'${BRIEFS_TAB}'!A2:A`)});
 const idx=(ids.data.values||[]).findIndex(r=>r[0]===adId);if(idx<0)throw new Error('Ad ID not found');
 await sheets.spreadsheets.values.update({spreadsheetId,range:r(`'${BRIEFS_TAB}'!N${idx+2}`),valueInputOption:'RAW',requestBody:{values:[[reference.replace(/^clean video:\s*/i,'')]]}});
 if(voiceover!==undefined)await updateVoiceover(adId,voiceover);
}

export async function updateVoiceover(adId:string,links:string){return withEditorLocks(['voice-'+adId],()=>writeVoiceover(adId,links));}
async function writeVoiceover(adId:string,links:string){
 const sheets=google.sheets({version:'v4',auth:sheetAuth()}),spreadsheetId=ADMIN_SHEET();
 const offset=await adminOffset(sheets,spreadsheetId),r=(value:string)=>shiftAdminRange(value,offset);
 const ids=await sheets.spreadsheets.values.get({spreadsheetId,range:r("'Daily Briefs'!A2:A502")});
 const idx=(ids.data.values||[]).findIndex(r=>r[0]===adId);if(idx<0)throw Error('Ad ID not found');
 const previous=await sheets.spreadsheets.values.get({spreadsheetId,range:r(`'Daily Briefs'!O${idx+2}`)});links=mergeVoiceLinks(String(previous.data.values?.[0]?.[0]||''),links);
 await sheets.spreadsheets.values.update({spreadsheetId,range:r(`'Daily Briefs'!O${idx+2}`),valueInputOption:'RAW',requestBody:{values:[[links]]}});
 const meta=await sheets.spreadsheets.get({spreadsheetId,fields:'sheets.properties'});const sheetId=meta.data.sheets?.find(s=>s.properties?.title===BRIEFS_TAB)?.properties?.sheetId;if(sheetId!==undefined&&sheetId!==null&&links)await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[{updateCells:{range:{sheetId,startRowIndex:idx+1,endRowIndex:idx+2,startColumnIndex:14+offset,endColumnIndex:15+offset},rows:[{values:[{textFormatRuns:voiceLinkRuns(links)}]}],fields:'textFormatRuns'}}]}});
}
