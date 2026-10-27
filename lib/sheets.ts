import {accountEditors} from './account-editors';
import {accountEnv,accountDefault} from './account-context';
import {assertAdActive,assertJobActive} from './cancellation';
import {EDITOR_WORKSPACES,activeEditorId} from './editor-workspaces';
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
  accountEnv('ADMIN_SHEET_ID') || accountDefault('ADMIN_SHEET_ID','17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY');
const BRIEFS_TAB = "Daily Briefs";
export function shiftAdminRange(value:string,offset:number){return offset?value.replace(/([A-Z]+)(?=\d|$)/g,letters=>{let n=0;for(const c of letters)n=n*26+c.charCodeAt(0)-64;n+=offset;let out='';while(n){out=String.fromCharCode(65+(n-1)%26)+out;n=Math.floor((n-1)/26);}return out;}):value;}
type AdminLayout={offset:number;landingPage:boolean;workFirst?:boolean};
export function adminColumnIndex(letters:string){let n=0;for(const c of letters)n=n*26+c.charCodeAt(0)-64;return n-1;}
export function mapAdminRange(value:string,layout:AdminLayout){const shifted=shiftAdminRange(value,layout.offset);return shifted.replace(/([A-Z]+)(?=\d|$)/g,letters=>{let n=adminColumnIndex(letters)+1;if(layout.landingPage&&n>=9)n++;if(layout.workFirst){if(n===18)n=10;else if(n>18)n--;}return shiftAdminRange('A',n-1);});}
async function adminLayout(sheets:ReturnType<typeof google.sheets>,spreadsheetId:string):Promise<AdminLayout>{const [h,lp,work]=await Promise.all([sheets.spreadsheets.values.get({spreadsheetId,range:"'Daily Briefs'!A1:B1"}),sheets.spreadsheets.values.get({spreadsheetId,range:"'Daily Briefs'!I1"}),sheets.spreadsheets.values.get({spreadsheetId,range:"'Daily Briefs'!J1"})]);return {offset:h.data.values?.[0]?.[0]==='Editor name'?1:0,landingPage:lp.data.values?.[0]?.[0]==='Landing page',workFirst:work.data.values?.[0]?.[0]==='Your work'};}



import {mutate} from './store';
import {opening} from './validation';
export interface BriefRow {mediaType?:'video'|'image';sheetProduct?:import("./sheet-product").SheetProduct;noSpeech?:boolean;editorNotes?:string;editorId?:string;uk:string;hooks:string[];hookOg:string;desire:string;angle:string;mechanism:string;funnel:string;reference:string; jobId:string;}
function slug(s:string){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);}
type Reservation={adId:string;row:number};
type Allocations={max:number;lastRow:number;reservations:Record<string,Reservation>};
export async function appendToAdminBriefs(row:BriefRow){
 if(!/^[\w-]{8,100}$/.test(row.jobId))throw Error('Invalid brief');
 return withEditorLocks(['brief-job-'+row.jobId],async()=>{await assertJobActive(row.jobId);return writeAdminBrief(row);});
}
async function writeAdminBrief(row:BriefRow){
 const editor=accountEditors().find(e=>e.id===activeEditorId(row.editorId));if(!editor)throw Error('Unknown editor');
 if(!/^[\w-]{8,100}$/.test(row.jobId)||(!row.uk.trim()&&!row.noSpeech)||![0,2,3].includes(row.hooks.length)||!['TOF','MOF','BOF'].includes(row.funnel))throw new Error('Invalid brief');
 const sheets=google.sheets({version:'v4',auth:sheetAuth()}),spreadsheetId=ADMIN_SHEET();
 const layout=await adminLayout(sheets,spreadsheetId),offset=layout.offset,r=(value:string)=>mapAdminRange(value,layout);
 const ids=await sheets.spreadsheets.values.get({spreadsheetId,range:r(`'${BRIEFS_TAB}'!A2:A`)});
 let max=0,lastRow=1;
 (ids.data.values||[]).forEach((r,i)=>{if(r.some(x=>String(x).trim()))lastRow=i+2;const m=String(r[0]||'').match(/^(?:MEL|VID|IMG)-(\d+)$/i);if(m)max=Math.max(max,Number(m[1]));});
 const prefix=row.mediaType==='image'?'IMG':row.mediaType==='video'?'VID':'MEL';
 const reserved=await mutate<Allocations,Reservation>('sheet-allocations',{max:0,lastRow:1,reservations:{}},state=>{
  const prior=state.reservations[row.jobId];
  if(prior){const at=(ids.data.values||[]).findIndex(v=>v[0]===prior.adId);if(at>=0)prior.row=at+2;return prior;}
  const occupied=new Set<number>();
  (ids.data.values||[]).forEach((v,i)=>{if(v.some(x=>String(x).trim()))occupied.add(i+2);});
  Object.values(state.reservations).forEach(v=>occupied.add(v.row));
  let next=2;while(occupied.has(next))next++;
  state.max=Math.max(state.max,max)+1;state.lastRow=Math.max(state.lastRow,next);
  const value={adId:`${prefix}-${String(state.max).padStart(5,'0')}`,row:next};state.reservations[row.jobId]=value;return value;
 });
 await assertAdActive(reserved.adId);
 const n=reserved.row;
 const current=await sheets.spreadsheets.values.get({spreadsheetId,range:r(`'${BRIEFS_TAB}'!A${n}:V${n}`)});
 const existing=current.data.values?.[0]||[];
 const prior=(column:string)=>existing[adminColumnIndex(r(column))-adminColumnIndex(r('A'))];
 if(existing.some(x=>String(x).trim())&&prior('A')!==reserved.adId)throw new Error('Reserved row has changed outside this app. No data overwritten.');
 const adName=`${reserved.adId}_${row.funnel}_${slug(row.desire)}_${slug(row.angle)}`;
 // Only write owned columns; landing-page choices and all editor fields survive edits/retries.
 const data=[{range:r(`'${BRIEFS_TAB}'!A${n}:F${n}`),values:[[reserved.adId,adName,row.desire,row.angle,row.mechanism,row.funnel]]},{range:r(`'${BRIEFS_TAB}'!I${n}:M${n}`),values:[[row.uk,opening(row.uk),row.hooks[0]||'',row.hooks[1]||'','']]}];
 if(!prior('U')){data.push({range:r(`'${BRIEFS_TAB}'!U${n}`),values:[[editor.id]]});if(offset)data.push({range:`'${BRIEFS_TAB}'!A${n}`,values:[[editor.name]]});}
 if(!prior('N'))data.push({range:r(`'${BRIEFS_TAB}'!N${n}`),values:[[row.reference.replace(/^clean video:\s*/i,'')]]});
 if(row.sheetProduct&&!prior('A')){
  const header=(await sheets.spreadsheets.values.get({spreadsheetId,range:"'Daily Briefs'!A1:AZ1"})).data.values?.[0]||[];
  const col=header.indexOf('Product');if(col<0)throw Error('Product column is not configured');
  data.push({range:`'Daily Briefs'!${shiftAdminRange('A',col)}${n}`,values:[[row.sheetProduct]]});
 }
 try{
  await sheets.spreadsheets.values.batchUpdate({spreadsheetId,requestBody:{valueInputOption:'RAW',data}});
 }catch(e){
  if(Number((e as {code?:number}).code)===403||/permission|protected/i.test((e as Error).message)){
   for(const item of data){
    await sheets.spreadsheets.values.update({spreadsheetId,range:item.range,valueInputOption:'RAW',requestBody:{values:item.values}}).catch(()=>{});
   }
  }else throw e;
 }
 if(row.editorNotes){const header=(await sheets.spreadsheets.values.get({spreadsheetId,range:"'Daily Briefs'!A1:AZ1"})).data.values?.[0]||[];const col=header.indexOf('Notes');if(col>=0)await sheets.spreadsheets.values.update({spreadsheetId,range:`'Daily Briefs'!${shiftAdminRange('A',col)}${n}`,valueInputOption:'RAW',requestBody:{values:[[row.editorNotes]]}}).catch(()=>{});}
 // Formula reacts to actual values, not cell fill colours. Existing workflows are preserved.
 if(!prior('T'))await sheets.spreadsheets.values.update({spreadsheetId,range:r(`'${BRIEFS_TAB}'!T${n}`),valueInputOption:'USER_ENTERED',requestBody:{values:[[productionFormula(n,offset,layout.landingPage,layout.workFirst)]]}}).catch(()=>{});
 return {adId:reserved.adId,url:`https://docs.google.com/spreadsheets/d/${spreadsheetId}`};
}
export function productionFormula(n:number,offset=0,landingPage=false,workFirst=false){return mapAdminRange(`=IF(A${n}="","",IF(REGEXMATCH(LOWER(TO_TEXT(R${n})),"^(approved|green|🟢 approved)$"),"Launched",IF(REGEXMATCH(LOWER(TO_TEXT(R${n})),"changes requested|rejected|red|🔴"),"Changes requested",IF(P${n}<>"","Ready for review",IF(OR(U${n}<>"",V${n}<>""),"Editing","To do")))))`,{offset,landingPage,workFirst});}
export async function updateReference(adId:string,reference:string,voiceover?:string){
 await withEditorLocks(['sheet-write-'+adId],async()=>{
 await assertAdActive(adId);
 const sheets=google.sheets({version:'v4',auth:sheetAuth()}),spreadsheetId=ADMIN_SHEET();
 const layout=await adminLayout(sheets,spreadsheetId),offset=layout.offset,r=(value:string)=>mapAdminRange(value,layout);
 const ids=await sheets.spreadsheets.values.get({spreadsheetId,range:r(`'${BRIEFS_TAB}'!A2:A`)});
 const idx=(ids.data.values||[]).findIndex(r=>r[0]===adId);if(idx<0)throw new Error('Ad ID not found');
 await sheets.spreadsheets.values.update({spreadsheetId,range:r(`'${BRIEFS_TAB}'!N${idx+2}`),valueInputOption:'RAW',requestBody:{values:[[reference.replace(/^clean video:\s*/i,'')]]}});
 });
 if(voiceover!==undefined)await updateVoiceover(adId,voiceover);
}

export async function updateVoiceover(adId:string,links:string){return withEditorLocks(['sheet-write-'+adId,'voice-'+adId],async()=>{await assertAdActive(adId);return writeVoiceover(adId,links);});}
async function writeVoiceover(adId:string,links:string){
 const sheets=google.sheets({version:'v4',auth:sheetAuth()}),spreadsheetId=ADMIN_SHEET();
 const layout=await adminLayout(sheets,spreadsheetId),offset=layout.offset,r=(value:string)=>mapAdminRange(value,layout);
 const ids=await sheets.spreadsheets.values.get({spreadsheetId,range:r("'Daily Briefs'!A2:A502")});
 const idx=(ids.data.values||[]).findIndex(r=>r[0]===adId);if(idx<0)throw Error('Ad ID not found');
 const previous=await sheets.spreadsheets.values.get({spreadsheetId,range:r(`'Daily Briefs'!O${idx+2}`)});links=mergeVoiceLinks(String(previous.data.values?.[0]?.[0]||''),links);
 await sheets.spreadsheets.values.update({spreadsheetId,range:r(`'Daily Briefs'!O${idx+2}`),valueInputOption:'RAW',requestBody:{values:[[links]]}});
 const meta=await sheets.spreadsheets.get({spreadsheetId,fields:'sheets.properties'});const sheetId=meta.data.sheets?.find(s=>s.properties?.title===BRIEFS_TAB)?.properties?.sheetId;if(sheetId!==undefined&&sheetId!==null&&links)await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[{updateCells:{range:{sheetId,startRowIndex:idx+1,endRowIndex:idx+2,startColumnIndex:14+offset+(layout.landingPage?1:0),endColumnIndex:15+offset+(layout.landingPage?1:0)},rows:[{values:[{textFormatRuns:voiceLinkRuns(links)}]}],fields:'textFormatRuns'}}]}});
}
