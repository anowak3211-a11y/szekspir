import {google} from 'googleapis';
import {Readable} from 'node:stream';
import {sheetAuth} from './sheets';
import {driveUploadTarget} from './drive-video';
import {safeDownload} from './safe-fetch';
import {withEditorLocks} from './editor-locks';
import {mutate,readState} from './store';
import {NATIVE_TAB,NATIVE_HEADERS,nativeRow,nativeFromRow,parseNativeExport,type NativeAd} from './native-ad-model';
const spreadsheetId=()=>process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY';
const client=()=>google.sheets({version:'v4',auth:sheetAuth()});
const range=`'${NATIVE_TAB}'!A1:T2000`;
async function library(){
 const sheets=client(),id=spreadsheetId();
 const meta=(await sheets.spreadsheets.get({spreadsheetId:id,fields:'sheets.properties'})).data.sheets||[];
 const tab=meta.find(s=>s.properties?.title===NATIVE_TAB)?.properties;
 if(!tab)return {sheets,id,tab:undefined,rows:[] as unknown[][],sheetUrl:`https://docs.google.com/spreadsheets/d/${id}/edit`};
 const rows=(await sheets.spreadsheets.values.get({spreadsheetId:id,range})).data.values||[];
 if(NATIVE_HEADERS.some((h,i)=>rows[0]?.[i]!==h))throw Error('Native Ads headers were changed. Restore the original headers before importing.');
 return {sheets,id,tab,rows,sheetUrl:`https://docs.google.com/spreadsheets/d/${id}/edit?gid=${tab.sheetId}#gid=${tab.sheetId}`};
}
export async function listNativeAds(){const l=await library();return {ads:l.rows.slice(1).map((r,i)=>nativeFromRow(r,i+2,l.sheetUrl)).filter(a=>a.id),sheetUrl:l.sheetUrl};}
export async function getNativeAd(id:string){if(!/^facebook_\d{5,30}$/.test(id))throw Error('Invalid native ad ID.');const matches=(await listNativeAds()).ads.filter(a=>a.id===id);if(matches.length!==1)throw Error(matches.length?'Duplicate native ad IDs in Sheet.':'Native ad not found.');return matches[0];}
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
function imageType(b:Buffer){if(b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {mime:'image/png',ext:'png'};if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)return {mime:'image/jpeg',ext:'jpg'};if(b.length>=12&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP')return {mime:'image/webp',ext:'webp'};throw Error('The source is not a supported image.');}
async function saveImage(ad:NativeAd){
 const {drive,folderId}=await driveUploadTarget();
 const key=`native-image-${ad.id}`;let fileId=(await readState<{fileId?:string}>(key,{})).value.fileId;
 if(!fileId){const candidate=(await drive.files.generateIds({count:1,space:'drive'})).data.ids?.[0];if(!candidate)throw Error('Drive did not allocate an image ID.');fileId=await mutate<{fileId?:string},string>(key,{},s=>s.fileId||(s.fileId=candidate));}
 let exists=false;try{const f=await drive.files.get({fileId,supportsAllDrives:true,fields:'id,size,trashed'});if(f.data.trashed)throw Error('The saved native image is in Trash. Restore it before retrying.');exists=Number(f.data.size)>0;}catch(e){if(Number((e as {code?:number}).code)!==404)throw e;}
 if(!exists){const source=await safeDownload(ad.imageUrl,12*1024*1024);const kind=imageType(source.buffer);await drive.files.create({supportsAllDrives:true,requestBody:{id:fileId,name:`native-${ad.id}.${kind.ext}`,parents:[folderId],appProperties:{szekspirNativeId:ad.id}},media:{mimeType:kind.mime,body:Readable.from(source.buffer)},fields:'id'},{timeout:60000,retry:false});}
 const permissions=(await drive.permissions.list({fileId,supportsAllDrives:true,fields:'permissions(type,role)'})).data.permissions||[];
 if(!permissions.some(p=>p.type==='anyone'))await drive.permissions.create({fileId,supportsAllDrives:true,requestBody:{type:'anyone',role:'reader',allowFileDiscovery:false}});
 return fileId;
}
export async function importNativeAds(input:unknown){
 const ads=parseNativeExport(input);if(ads.length>10)throw Error('Save up to 10 ads per request.');
 return withEditorLocks(['native-ads-library'],async()=>{
  let l=await library();if(!l.tab){await createLibrary(l);l=await library();}
  const results:{id:string;status:'saved'|'existing'|'failed';error?:string}[]=[];
  for(const ad of ads){try{
   const prior=l.rows.filter(r=>r[0]===ad.id);if(prior.length>1)throw Error('Duplicate IDs in Native Ads.');if(prior.length){results.push({id:ad.id,status:'existing'});continue;}
   let row=l.rows.length+1;if(row>2000)throw Error('Native Ads library is full (1,999 ads).');
   const fileId=await saveImage(ad),values=nativeRow(ad,fileId);
   await l.sheets.spreadsheets.values.update({spreadsheetId:l.id,range:`'${NATIVE_TAB}'!A${row}:T${row}`,valueInputOption:'RAW',requestBody:{values:[values]}});
   const sheetId=l.tab!.sheetId!;
   await l.sheets.spreadsheets.batchUpdate({spreadsheetId:l.id,requestBody:{requests:[
    {updateCells:{range:{sheetId,startRowIndex:row-1,endRowIndex:row,startColumnIndex:1,endColumnIndex:2},rows:[{values:[{userEnteredValue:{formulaValue:`=IMAGE("${ad.imageUrl}",1)`},note:'Original image preview. A permanent copy is saved in Drive (columns I–J) and loaded by Szekspir through the protected image endpoint.'}]}],fields:'userEnteredValue,note'}},
    {repeatCell:{range:{sheetId,startRowIndex:row-1,endRowIndex:row,startColumnIndex:0,endColumnIndex:20},cell:{userEnteredFormat:{verticalAlignment:'TOP',wrapStrategy:'CLIP',textFormat:{fontSize:10}}},fields:'userEnteredFormat'}},
    {updateDimensionProperties:{range:{sheetId,dimension:'ROWS',startIndex:row-1,endIndex:row},properties:{pixelSize:180},fields:'pixelSize'}}
   ]}});
   const readback=(await l.sheets.spreadsheets.values.get({spreadsheetId:l.id,range:`'${NATIVE_TAB}'!A${row}:T${row}`})).data.values?.[0]||[];
   if(values.some((v,i)=>i!==1&&String(v)!==String(readback[i]??'')))throw Error('Sheet readback did not match. Inspect this row before retrying.');
   l.rows.push(readback);results.push({id:ad.id,status:'saved'});
  }catch(e){results.push({id:ad.id,status:'failed',error:(e as Error).message});l=await library();}}
  return {results,sheetUrl:l.sheetUrl};
 });
}
export async function nativeImage(id:string){const ad=await getNativeAd(id);if(!/^[-\w]{10,100}$/.test(ad.driveFileId))throw Error('Missing saved image.');const {drive}=await driveUploadTarget();const response=await drive.files.get({fileId:ad.driveFileId,alt:'media',supportsAllDrives:true},{responseType:'arraybuffer',timeout:30000,retry:false});const buffer=Buffer.from(response.data as ArrayBuffer);if(buffer.length>12*1024*1024)throw Error('Saved image exceeds size limit.');return {buffer,...imageType(buffer)};}
