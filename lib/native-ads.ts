import {google} from 'googleapis';
import {Readable} from 'node:stream';
import {sheetAuth} from './sheets';
import {driveUploadTarget} from './drive-video';
import {safeDownload} from './safe-fetch';
import {withEditorLocks} from './editor-locks';
import {mutate,readState} from './store';
import {NATIVE_TAB,NATIVE_HEADERS,NATIVE_WORK_HEADERS,characterCount,nativeRow,nativeFromRow,parseNativeExport,type NativeAd} from './native-ad-model';
const spreadsheetId=()=>process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY';
const client=()=>google.sheets({version:'v4',auth:sheetAuth()});
async function library(){
 const sheets=client(),id=spreadsheetId();
 const meta=(await sheets.spreadsheets.get({spreadsheetId:id,fields:'sheets.properties'})).data.sheets||[];
 const tab=meta.find(s=>s.properties?.title===NATIVE_TAB)?.properties;
 if(!tab)return {sheets,id,tab:undefined,rows:[] as unknown[][],sheetUrl:`https://docs.google.com/spreadsheets/d/${id}/edit`};
 const header=(await sheets.spreadsheets.values.get({spreadsheetId:id,range:`'${NATIVE_TAB}'!A1:AB1`})).data.values?.[0]||[];
 if(NATIVE_HEADERS.some((h,i)=>header[i]!==h))throw Error('Native Ads headers were changed. Restore the original headers before importing.');
 const ids=(await sheets.spreadsheets.values.get({spreadsheetId:id,range:`'${NATIVE_TAB}'!A2:A2000`})).data.values||[];
 const rows=[header,...ids.map(r=>[r[0]])];
 return {sheets,id,tab,rows,sheetUrl:`https://docs.google.com/spreadsheets/d/${id}/edit?gid=${tab.sheetId}#gid=${tab.sheetId}`};
}
export async function listNativeAds(){
 const l=await library();if(!l.tab)return {ads:[],sheetUrl:l.sheetUrl};
 // Listing excludes both long US and UK copy. Read only row metadata and links.
 const ranges=[`'${NATIVE_TAB}'!A2:D2000`,`'${NATIVE_TAB}'!H2:V2000`,`'${NATIVE_TAB}'!Z2:AB2000`];
 const result=(await l.sheets.spreadsheets.values.batchGet({spreadsheetId:l.id,ranges})).data.valueRanges||[];
 const count=l.rows.length-1,ads=[];
 for(let i=0;i<count;i++){
  const row:unknown[]=[];(result[0]?.values?.[i]||[]).forEach((v,n)=>row[n]=v);(result[1]?.values?.[i]||[]).forEach((v,n)=>row[n+7]=v);(result[2]?.values?.[i]||[]).forEach((v,n)=>row[n+25]=v);
  if(!row[0])continue;const ad=nativeFromRow(row,i+2,l.sheetUrl);ad.wordCount=Number(row[3]||0);ads.push(ad);
 }
 return {ads,sheetUrl:l.sheetUrl};
}
export async function getNativeAd(id:string,rowHint?:number){
 if(!/^facebook_\d{5,30}$/.test(id))throw Error('Invalid native ad ID.');
 if(typeof rowHint==='number'&&Number.isSafeInteger(rowHint)&&rowHint>=2&&rowHint<=2000){const values=(await client().spreadsheets.values.get({spreadsheetId:spreadsheetId(),range:`'${NATIVE_TAB}'!A${rowHint}:AA${rowHint}`})).data.values?.[0]||[];if(values[0]===id)return nativeFromRow(values,rowHint,`https://docs.google.com/spreadsheets/d/${spreadsheetId()}/edit`);}
 const l=await library(),matches=l.rows.flatMap((r,i)=>r[0]===id?[i+1]:[]);
 if(matches.length!==1)throw Error(matches.length?'Duplicate native ad IDs in Sheet.':'Native ad not found.');
 const row=matches[0],values=(await l.sheets.spreadsheets.values.get({spreadsheetId:l.id,range:`'${NATIVE_TAB}'!A${row}:AA${row}`})).data.values?.[0]||[];
 if(values[0]!==id)throw Error('Source rows changed while loading. Retry.');return nativeFromRow(values,row,l.sheetUrl);
}
export async function getNativeAds(ids:string[]){
 if(!Array.isArray(ids)||!ids.length||ids.length>60||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'||!/^facebook_\d{5,30}$/.test(id)))throw Error('Choose 1–60 distinct saved adverts.');
 const l=await library(),positions=ids.map(id=>{const matches=l.rows.flatMap((r,i)=>r[0]===id?[i+1]:[]);if(matches.length!==1)throw Error('Source is missing or duplicated.');return matches[0];});
 const values=(await l.sheets.spreadsheets.values.batchGet({spreadsheetId:l.id,ranges:positions.map(row=>`'${NATIVE_TAB}'!A${row}:AA${row}`)})).data.valueRanges||[];
 return ids.map((id,i)=>{const row=values[i]?.values?.[0]||[];if(row[0]!==id)throw Error('Source rows changed. Retry loading.');return nativeFromRow(row,positions[i],l.sheetUrl);});
}
async function createLibrary(l:Awaited<ReturnType<typeof library>>){
 const response=await l.sheets.spreadsheets.batchUpdate({spreadsheetId:l.id,requestBody:{requests:[{addSheet:{properties:{title:NATIVE_TAB,gridProperties:{rowCount:2000,columnCount:20,frozenRowCount:1,frozenColumnCount:2,hideGridlines:true}}}}]}});
 const sheetId=response.data.replies?.[0]?.addSheet?.properties?.sheetId;if(sheetId===null||sheetId===undefined)throw Error('Google did not return the new Native Ads tab.');
 await l.sheets.spreadsheets.values.update({spreadsheetId:l.id,range:`'${NATIVE_TAB}'!A1:T1`,valueInputOption:'RAW',requestBody:{values:[NATIVE_HEADERS]}});
 await l.sheets.spreadsheets.batchUpdate({spreadsheetId:l.id,requestBody:{requests:[
  {repeatCell:{range:{sheetId,startRowIndex:0,endRowIndex:1},cell:{userEnteredFormat:{backgroundColor:{red:.21,green:.41,blue:.33},textFormat:{bold:true,foregroundColor:{red:1,green:1,blue:1}},wrapStrategy:'WRAP'}},fields:'userEnteredFormat'}},
  {updateDimensionProperties:{range:{sheetId,dimension:'ROWS',startIndex:0,endIndex:1},properties:{pixelSize:48},fields:'pixelSize'}},
  ...NATIVE_HEADERS.map((_,i)=>({updateDimensionProperties:{range:{sheetId,dimension:'COLUMNS' as const,startIndex:i,endIndex:i+1},properties:{pixelSize:i===1?210:i>=4&&i<=6?420:i===0?210:i===2?210:i>=7&&i<=11?240:160},fields:'pixelSize'}})),
  {setBasicFilter:{filter:{range:{sheetId,startRowIndex:0,endRowIndex:2000,startColumnIndex:0,endColumnIndex:20}}}}
 ]}});
}
export function imageType(b:Buffer){if(b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {mime:'image/png',ext:'png'};if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)return {mime:'image/jpeg',ext:'jpg'};if(b.length>=12&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP')return {mime:'image/webp',ext:'webp'};throw Error('The source is not a supported image.');}
async function saveImage(ad:NativeAd,restoreTrashed=false){
 const {drive,folderId}=await driveUploadTarget();
 const key=`native-image-${ad.id}`;let fileId=(await readState<{fileId?:string}>(key,{})).value.fileId;
 if(!fileId){const candidate=(await drive.files.generateIds({count:1,space:'drive'})).data.ids?.[0];if(!candidate)throw Error('Drive did not allocate an image ID.');fileId=await mutate<{fileId?:string},string>(key,{},s=>s.fileId||(s.fileId=candidate));}
 let exists=false;try{let f=await drive.files.get({fileId,supportsAllDrives:true,fields:'id,size,trashed,appProperties'});if(f.data.trashed){if(!restoreTrashed)throw Error('The saved native image is in Trash. Restore it before retrying.');if(f.data.appProperties?.szekspirNativeId!==ad.id)throw Error('The trashed file does not match this advert. Restore it manually.');f=await drive.files.update({fileId,supportsAllDrives:true,requestBody:{trashed:false},fields:'id,size,trashed,appProperties'});if(f.data.trashed||!Number(f.data.size))throw Error('Drive did not confirm restoring the saved image.');}exists=Number(f.data.size)>0;}catch(e){if(Number((e as {code?:number}).code)!==404)throw e;}
 if(!exists){const source=await safeDownload(ad.imageUrl,12*1024*1024);const kind=imageType(source.buffer);await drive.files.create({supportsAllDrives:true,requestBody:{id:fileId,name:`native-${ad.id}.${kind.ext}`,parents:[folderId],appProperties:{szekspirNativeId:ad.id}},media:{mimeType:kind.mime,body:Readable.from(source.buffer)},fields:'id'},{timeout:60000,retry:false});}
 const permissions=(await drive.permissions.list({fileId,supportsAllDrives:true,fields:'permissions(type,role)'})).data.permissions||[];
 if(!permissions.some(p=>p.type==='anyone'))await drive.permissions.create({fileId,supportsAllDrives:true,requestBody:{type:'anyone',role:'reader',allowFileDiscovery:false}});
 return fileId;
}
export async function importNativeAds(input:unknown){
 const restoreTrashed=!!input&&typeof input==='object'&&!Array.isArray(input)&&(input as {restoreTrashed?:unknown}).restoreTrashed===true;
 const ads=parseNativeExport(input);if(ads.length>10)throw Error('Save up to 10 ads per request.');
 return withEditorLocks(['native-ads-library'],async()=>{
  let l=await library();if(!l.tab){await createLibrary(l);l=await library();}
  await ensureWorkColumns(l);
  const results:{id:string;status:'saved'|'existing'|'failed';error?:string}[]=[];
  for(const ad of ads){try{
   const prior=l.rows.filter(r=>r[0]===ad.id);if(prior.length>1)throw Error('Duplicate IDs in Native Ads.');if(prior.length){results.push({id:ad.id,status:'existing'});continue;}
   let row=l.rows.length+1;if(row>2000)throw Error('Native Ads library is full (1,999 ads).');
   const fileId=await saveImage(ad,restoreTrashed),values=[...nativeRow(ad,fileId),ad.headline||'',...Array(6).fill(''),characterCount(ad.primaryText)];
   await l.sheets.spreadsheets.values.update({spreadsheetId:l.id,range:`'${NATIVE_TAB}'!A${row}:AB${row}`,valueInputOption:'RAW',requestBody:{values:[values]}});
   const sheetId=l.tab!.sheetId!;
   await l.sheets.spreadsheets.batchUpdate({spreadsheetId:l.id,requestBody:{requests:[
    {updateCells:{range:{sheetId,startRowIndex:row-1,endRowIndex:row,startColumnIndex:1,endColumnIndex:2},rows:[{values:[{userEnteredValue:{formulaValue:`=IMAGE("${ad.imageUrl}",1)`},note:'Original image preview. A permanent copy is saved in Drive (columns I–J) and loaded by Szekspir through the protected image endpoint.'}]}],fields:'userEnteredValue,note'}},
    {repeatCell:{range:{sheetId,startRowIndex:row-1,endRowIndex:row,startColumnIndex:0,endColumnIndex:20},cell:{userEnteredFormat:{verticalAlignment:'TOP',wrapStrategy:'CLIP',textFormat:{fontSize:10}}},fields:'userEnteredFormat'}},
    {updateDimensionProperties:{range:{sheetId,dimension:'ROWS',startIndex:row-1,endIndex:row},properties:{pixelSize:180},fields:'pixelSize'}}
   ]}});
   const readback=(await l.sheets.spreadsheets.values.get({spreadsheetId:l.id,range:`'${NATIVE_TAB}'!A${row}:AB${row}`})).data.values?.[0]||[];
   if(values.some((v,i)=>i!==1&&String(v)!==String(readback[i]??'')))throw Error('Sheet readback did not match. Inspect this row before retrying.');
   l.rows.push(readback);results.push({id:ad.id,status:'saved'});
  }catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});l=await library();}}
  return {results,sheetUrl:l.sheetUrl};
 });
}
export async function nativeImage(id:string){if(!/^facebook_\d{5,30}$/.test(id))throw Error('Invalid native ad ID.');const saved=(await readState<{fileId?:string}>(`native-image-${id}`,{})).value.fileId,driveFileId=saved||(await getNativeAd(id)).driveFileId;if(!/^[-\w]{10,100}$/.test(driveFileId))throw Error('Missing saved image.');const {drive}=await driveUploadTarget();const response=await drive.files.get({fileId:driveFileId,alt:'media',supportsAllDrives:true},{responseType:'arraybuffer',timeout:30000,retry:false});const buffer=Buffer.from(response.data as ArrayBuffer);if(buffer.length>12*1024*1024)throw Error('Saved image exceeds size limit.');return {buffer,...imageType(buffer)};}

async function ensureWorkColumns(l:Awaited<ReturnType<typeof library>>){
 if(!l.tab)throw Error('Import a source before preparing it.');
 const existing=l.rows[0]?.slice(20)||[];
 if(existing.some((v,i)=>v&&v!==NATIVE_WORK_HEADERS[i]))throw Error('Antki work columns conflict with existing Sheet data.');
 if((l.tab.gridProperties?.columnCount||20)<28)await l.sheets.spreadsheets.batchUpdate({spreadsheetId:l.id,requestBody:{requests:[{appendDimension:{sheetId:l.tab.sheetId,dimension:'COLUMNS',length:28-(l.tab.gridProperties?.columnCount||20)}}]}});
 await l.sheets.spreadsheets.values.update({spreadsheetId:l.id,range:`'${NATIVE_TAB}'!U1:AB1`,valueInputOption:'RAW',requestBody:{values:[NATIVE_WORK_HEADERS]}});
}
export async function saveNativeWorkOutput(id:string,sourceText:string,output:{headline:string;text:string;imageUrl:string;status:string},expected?:{headline:string;text:string;imageUrl:string}){
 return withEditorLocks(['native-ads-library'],async()=>{
  const l=await library();await ensureWorkColumns(l);
  const matches=l.rows.flatMap((r,i)=>r[0]===id?[{r,i}]:[]);if(matches.length!==1)throw Error('Source is missing or duplicated.');
  const {i}=matches[0];const r=(await l.sheets.spreadsheets.values.get({spreadsheetId:l.id,range:`'${NATIVE_TAB}'!A${i+1}:AA${i+1}`})).data.values?.[0]||[];if(r[0]!==id||nativeFromRow(r,i+1,l.sheetUrl).primaryText!==sourceText)throw Error('The US source changed. Review before saving UK work.');
  const range=`'${NATIVE_TAB}'!V${i+1}:AA${i+1}`;
  // Formula-rendered UK cells reveal owner formulas instead of silently replacing them.
  const before=(await l.sheets.spreadsheets.values.get({spreadsheetId:l.id,range,valueRenderOption:'FORMULA'})).data.values?.[0]||[];
  const contentValues=[output.headline,...(await import('./native-ad-model')).textParts(output.text),output.imageUrl];
  const current={headline:String(before[0]||''),text:[before[1],before[2],before[3]].map(v=>String(v||'')).join(''),imageUrl:String(before[4]||'')};
  const candidate={headline:output.headline,text:output.text,imageUrl:output.imageUrl};
  const equal=(a:typeof current,b:typeof current)=>a.headline===b.headline&&a.text===b.text&&a.imageUrl===b.imageUrl;
  if(!equal(current,candidate)){
   if(!equal(current,expected||{headline:'',text:'',imageUrl:''}))throw Error('UK cells were changed in Sheet. Your Sheet edits and this draft are preserved; reconcile them before retrying.');
   const status=before[5]&&before[5]!=='Ready for review'?String(before[5]):output.status;
   await l.sheets.spreadsheets.values.update({spreadsheetId:l.id,range,valueInputOption:'RAW',requestBody:{values:[[...contentValues,status]]}});
  }
  const actual=(await l.sheets.spreadsheets.values.get({spreadsheetId:l.id,range,valueRenderOption:'FORMULA'})).data.values?.[0]||[];
  if(contentValues.some((v,n)=>v!==String(actual[n]??'')))throw Error('UK Sheet readback failed. Retry saving; no new generation is needed.');

 });
}
