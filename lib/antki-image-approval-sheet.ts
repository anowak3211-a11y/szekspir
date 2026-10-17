import {accountEnv,accountDefault} from './account-context';
import {google} from 'googleapis';
import {sheetAuth} from './sheets';
import {withEditorLocks} from './editor-locks';
import type {AntkiWork} from './antki-model';
export const IMAGE_APPROVAL_HEADERS=['Ad ID','Approved image · Drive','Image preview','Drive file ID','Approved at','Workspace','Status'];
export async function exportApprovedAntkiImage(work:AntkiWork){return withEditorLocks(['antki-upload-sheet'],async()=>{
 const sheets=google.sheets({version:'v4',auth:sheetAuth()}),spreadsheetId=accountEnv('ADMIN_SHEET_ID')||accountDefault('ADMIN_SHEET_ID','17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY'),title='Upload Antki Images';
 const meta=(await sheets.spreadsheets.get({spreadsheetId,fields:'sheets.properties'})).data.sheets||[];
 let tab=meta.find(s=>s.properties?.title===title)?.properties;
 if(!tab){const result=await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[{addSheet:{properties:{title,gridProperties:{rowCount:2000,columnCount:7,frozenRowCount:1,hideGridlines:true}}}}]}});tab=result.data.replies?.[0]?.addSheet?.properties;}
 if(tab?.sheetId===undefined||tab.sheetId===null)throw Error('Could not create image approval Sheet. Retry.');
 const sheetId=tab.sheetId,range=`'${title}'`;
 const header=(await sheets.spreadsheets.values.get({spreadsheetId,range:range+'!A1:G1',valueRenderOption:'FORMULA'})).data.values?.[0]||[];
 if(header.some((v,i)=>v&&v!==IMAGE_APPROVAL_HEADERS[i]))throw Error('Image approval headers changed. No data overwritten.');
 if(header.length!==7||header.some((v,i)=>v!==IMAGE_APPROVAL_HEADERS[i])){
  await sheets.spreadsheets.values.update({spreadsheetId,range:range+'!A1:G1',valueInputOption:'RAW',requestBody:{values:[IMAGE_APPROVAL_HEADERS]}});
  await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[
   {repeatCell:{range:{sheetId,startRowIndex:0,endRowIndex:1,startColumnIndex:0,endColumnIndex:7},cell:{userEnteredFormat:{backgroundColor:{red:.21,green:.41,blue:.33},textFormat:{bold:true,foregroundColor:{red:1,green:1,blue:1}},wrapStrategy:'WRAP'}},fields:'userEnteredFormat'}},
   {updateDimensionProperties:{range:{sheetId,dimension:'COLUMNS',startIndex:0,endIndex:7},properties:{pixelSize:240},fields:'pixelSize'}},
   {updateDimensionProperties:{range:{sheetId,dimension:'ROWS',startIndex:0,endIndex:1},properties:{pixelSize:48},fields:'pixelSize'}}
  ]}});
 }
 const rows=(await sheets.spreadsheets.values.get({spreadsheetId,range:range+'!A2:G2000',valueRenderOption:'FORMULA'})).data.values||[];
 const matches=rows.flatMap((r,i)=>r[0]===work.id&&r[3]===work.imageFileId?[i]:[]);
 if(matches.length>1)throw Error('Duplicate approved images in Sheet.');
 const row=matches.length?matches[0]+2:rows.length+2;if(row>2000)throw Error('Image approval Sheet is full.');
 const values=[work.id,work.imageDriveUrl!,'',work.imageFileId!,work.imageApproval!.approvedAt,`https://szekspir.vercel.app/antki/${work.id}`,'Image approved'];
 const preview=`=IMAGE("https://drive.google.com/uc?export=view&id=${work.imageFileId}",1)`;
 const prior=rows[row-2];if(prior&&values.some((v,i)=>i!==2&&String(v)!==String(prior[i]??'')))throw Error('Approved image row was edited. No data overwritten.');
 if(!prior)await sheets.spreadsheets.values.update({spreadsheetId,range:range+`!A${row}:G${row}`,valueInputOption:'RAW',requestBody:{values:[values]}});
 await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[
  {updateCells:{range:{sheetId,startRowIndex:row-1,endRowIndex:row,startColumnIndex:2,endColumnIndex:3},rows:[{values:[{userEnteredValue:{formulaValue:preview}}]}],fields:'userEnteredValue'}},
  {updateDimensionProperties:{range:{sheetId,dimension:'ROWS',startIndex:row-1,endIndex:row},properties:{pixelSize:160},fields:'pixelSize'}}
 ]}});
 const actual=(await sheets.spreadsheets.values.get({spreadsheetId,range:range+`!A${row}:G${row}`,valueRenderOption:'FORMULA'})).data.values?.[0]||[];
 if(values.some((v,i)=>i!==2&&String(v)!==String(actual[i]??''))||actual[2]!==preview)throw Error('Image approval readback failed. Retry the same export.');
 return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${sheetId}#gid=${sheetId}&range=A${row}:G${row}`;
});}
