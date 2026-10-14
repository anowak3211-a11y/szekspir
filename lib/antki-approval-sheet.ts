import {google} from 'googleapis';
import {sheetAuth} from './sheets';
import {withEditorLocks} from './editor-locks';
import {ANTKI_MELLOW_SAFFRON_URL} from './antki-model';
import {textParts} from './native-ad-model';
import type {SavedNativeAd} from './native-ad-model';
import type {AntkiWork} from './antki-model';

export const ANTKI_UPLOAD_TAB='Upload Antki';
// A:P matches the existing Upload tab. Native long copy continues losslessly in Q:R.
export const ANTKI_UPLOAD_HEADERS=['Ad ID','Ad desire','Funnel','Angle produktu','Landing page','Your work','Adapted script','Primary text','Headline','Description','Primary text 2','Headline 2','Description 2','Primary text 3','Headline 3','Description 3','Primary text · continued 2','Primary text · continued 3','Approved at','Revision','Workspace','Status','Image preview','Original ad'];
export function approvedAntkiRow(work:AntkiWork,ad:SavedNativeAd){
 const parts=textParts(work.ukText);
 return [work.id,'','','',work.ukText.includes(ANTKI_MELLOW_SAFFRON_URL)?ANTKI_MELLOW_SAFFRON_URL:'',work.imageDriveUrl||'','',parts[0],work.ukHeadline,'','','','','','','',parts[1],parts[2],work.approval!.approvedAt,String(work.revision),`https://szekspir.vercel.app/antki/${work.id}`,'Approved','',`https://www.facebook.com/ads/library/?id=${ad.id.replace('facebook_','')}`];
}
export async function exportApprovedAntki(work:AntkiWork,ad:SavedNativeAd){
 return withEditorLocks(['antki-upload-sheet'],async()=>{
  const sheets=google.sheets({version:'v4',auth:sheetAuth()}),spreadsheetId=process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY';
  const meta=(await sheets.spreadsheets.get({spreadsheetId,fields:'sheets.properties'})).data.sheets||[];
  let tab=meta.find(s=>s.properties?.title===ANTKI_UPLOAD_TAB)?.properties;
  if(!tab){
   const response=await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[{addSheet:{properties:{title:ANTKI_UPLOAD_TAB,gridProperties:{rowCount:2000,columnCount:24,frozenRowCount:1,frozenColumnCount:1,hideGridlines:true}}}}]}});
   tab=response.data.replies?.[0]?.addSheet?.properties;
   if(tab?.sheetId===undefined||tab.sheetId===null)throw Error('Could not create Upload Antki. Retry approval.');
  }
  const sheetId=tab.sheetId!;
  const header=(await sheets.spreadsheets.values.get({spreadsheetId,range:`'${ANTKI_UPLOAD_TAB}'!A1:X1`})).data.values?.[0]||[];
  if(header.some((value,i)=>value&&value!==ANTKI_UPLOAD_HEADERS[i]))throw Error('Upload Antki headers changed. No data overwritten.');
  if(header.length!==24||header.some((v,i)=>v!==ANTKI_UPLOAD_HEADERS[i])){
   await sheets.spreadsheets.values.update({spreadsheetId,range:`'${ANTKI_UPLOAD_TAB}'!A1:X1`,valueInputOption:'RAW',requestBody:{values:[ANTKI_UPLOAD_HEADERS]}});
   await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[
    {repeatCell:{range:{sheetId,startRowIndex:0,endRowIndex:1,startColumnIndex:0,endColumnIndex:24},cell:{userEnteredFormat:{backgroundColor:{red:.21,green:.41,blue:.33},textFormat:{bold:true,foregroundColor:{red:1,green:1,blue:1}},wrapStrategy:'WRAP'}},fields:'userEnteredFormat'}},
    {updateDimensionProperties:{range:{sheetId,dimension:'ROWS',startIndex:0,endIndex:1},properties:{pixelSize:48},fields:'pixelSize'}},
    ...ANTKI_UPLOAD_HEADERS.map((_,i)=>({updateDimensionProperties:{range:{sheetId,dimension:'COLUMNS' as const,startIndex:i,endIndex:i+1},properties:{pixelSize:[7,16,17].includes(i)?420:i===22?200:220},fields:'pixelSize'}})),
    {setBasicFilter:{filter:{range:{sheetId,startRowIndex:0,endRowIndex:2000,startColumnIndex:0,endColumnIndex:24}}}}
   ]}});
  }
  const keys=(await sheets.spreadsheets.values.batchGet({spreadsheetId,ranges:[`'${ANTKI_UPLOAD_TAB}'!A2:A2000`,`'${ANTKI_UPLOAD_TAB}'!T2:T2000`]})).data.valueRanges||[];
  const ids=keys[0]?.values||[],revisions=keys[1]?.values||[];
  const matches=ids.flatMap((r,i)=>r[0]===work.id&&String(revisions[i]?.[0])===String(work.revision)?[i]:[]);
  if(matches.length>1)throw Error('Duplicate approval rows. Review Upload Antki before retrying.');
  const row=matches.length?matches[0]+2:Math.max(2,Math.max(ids.length,revisions.length)+2);
  if(row>2000)throw Error('Upload Antki is full.');
  const values=approvedAntkiRow(work,ad),existing=(await sheets.spreadsheets.values.get({spreadsheetId,range:`'${ANTKI_UPLOAD_TAB}'!A${row}:X${row}`,valueRenderOption:'FORMULA'})).data.values?.[0]||[],prior=existing.some(v=>String(v).trim())?existing:undefined;
  if(prior&&values.some((v,i)=>i!==22&&String(v)!==String(prior[i]??'')))throw Error('Approved upload row was edited in Sheet. No data overwritten.');
  if(!prior)await sheets.spreadsheets.values.update({spreadsheetId,range:`'${ANTKI_UPLOAD_TAB}'!A${row}:X${row}`,valueInputOption:'RAW',requestBody:{values:[values]}});
  const preview=`=IMAGE("https://drive.google.com/uc?export=view&id=${work.imageFileId}",1)`;
  await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[
   {updateCells:{range:{sheetId,startRowIndex:row-1,endRowIndex:row,startColumnIndex:22,endColumnIndex:23},rows:[{values:[{userEnteredValue:{formulaValue:preview}}]}],fields:'userEnteredValue'}},
   {repeatCell:{range:{sheetId,startRowIndex:row-1,endRowIndex:row,startColumnIndex:0,endColumnIndex:24},cell:{userEnteredFormat:{verticalAlignment:'TOP',wrapStrategy:'CLIP'}},fields:'userEnteredFormat'}},
   {updateDimensionProperties:{range:{sheetId,dimension:'ROWS',startIndex:row-1,endIndex:row},properties:{pixelSize:160},fields:'pixelSize'}}
  ]}});
  const actual=(await sheets.spreadsheets.values.get({spreadsheetId,range:`'${ANTKI_UPLOAD_TAB}'!A${row}:X${row}`,valueRenderOption:'FORMULA'})).data.values?.[0]||[];
  if(values.some((v,i)=>i!==22&&String(v)!==String(actual[i]??''))||actual[22]!==preview)throw Error('Approval Sheet readback failed. Retry exports the same version.');
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${sheetId}#gid=${sheetId}&range=A${row}:X${row}`;
 });
}
