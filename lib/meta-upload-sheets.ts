import {accountEnv,accountDefault} from './account-context';
import {google} from 'googleapis';
import {sheetAuth} from './sheets';
import {draftsFromTable} from './meta-uploader-model';
const admin=()=>accountEnv('ADMIN_SHEET_ID')||accountDefault('ADMIN_SHEET_ID','17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY');
export async function uploadSheetTabs(){const r=await google.sheets({version:'v4',auth:sheetAuth()}).spreadsheets.get({spreadsheetId:admin(),fields:'sheets.properties(title,sheetId)'});return (r.data.sheets||[]).map(s=>({name:s.properties?.title||'',id:s.properties?.sheetId})).filter(s=>/^Upload(?:\s|$)/i.test(s.name));}
export async function readUploadSheet(tab:string){
 const tabs=await uploadSheetTabs();if(!tabs.some(t=>t.name===tab))throw Error('Choose an existing Upload tab.');
 const r=await google.sheets({version:'v4',auth:sheetAuth()}).spreadsheets.values.get({spreadsheetId:admin(),range:`'${tab.replaceAll("'","''")}'!A1:AZ301`,valueRenderOption:'UNFORMATTED_VALUE'});
 const rows=r.data.values||[];const h=(rows[0]||[]).map(v=>String(v).toLowerCase()),status=h.indexOf('status');
 const selected=status>=0?[rows[0],...rows.slice(1).filter(row=>/^(approved|ready for launch)$/i.test(String(row[status]??'').trim()))]:rows;
 const drafts=draftsFromTable(selected).map(d=>tab==='Upload Antki'&&d.media&&d.media.kind!=='library'?{...d,media:{...d.media,kind:'image' as const,filename:(d.key||d.name||'original')+'.png'}}:d);return {drafts,tab,hasApprovalColumn:status>=0};
}
