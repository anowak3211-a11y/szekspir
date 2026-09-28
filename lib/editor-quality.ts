import {google,sheets_v4,drive_v3} from 'googleapis';
import {createHash,randomUUID} from 'node:crypto';
import {sheetAuth} from './sheets';
import {EDITOR_WORKSPACES} from './editor-workspaces';
import {readState,mutate} from './store';
import {compareVideoSize,readMp4Size,VideoMeasurement} from './video-quality';

type Cell=sheets_v4.Schema$CellData;
type Workspace=typeof EDITOR_WORKSPACES[number];
export type QualityResult={adId:string;editor:string;editorId:string;field:string;row:number;col:number;sheetUrl:string;status:'low'|'pass'|'unknown';message:string;files:VideoMeasurement[];reference?:VideoMeasurement;checkedAt:number;fingerprint:string};
type QualityState={results:QualityResult[];checkedAt?:number;error?:string;lease?:string;until?:number};
const empty=():QualityState=>({results:[]});
const stateName=(id:string)=>'editor-video-quality-v1-'+id;
const marker='SZEKSPIR_VIDEO_QUALITY_V1';
const noteStart='[SZEKSPIR VIDEO QUALITY]';
const noteEnd='[/SZEKSPIR VIDEO QUALITY]';
const title='My Tasks';
const text=(c:Cell|undefined)=>c?.userEnteredValue?.stringValue||c?.formattedValue||'';
export function cellLinks(c:Cell|undefined){
 const candidates=[c?.userEnteredValue?.stringValue,c?.userEnteredValue?.formulaValue,c?.hyperlink,...(c?.textFormatRuns||[]).map(r=>r.format?.link?.uri),...(c?.chipRuns||[]).map(r=>r.chip?.richLinkProperties?.uri)];
 return [...new Set(candidates.flatMap(s=>String(s||'').match(/https:\/\/[^\s<>"\)]+/g)||[]))];
}
export function qualityNote(existing:string|null|undefined,message?:string){
 const clean=(existing||'').replace(/\n?\[SZEKSPIR VIDEO QUALITY\][\s\S]*?\[\/SZEKSPIR VIDEO QUALITY\]/g,'').trimEnd();
 return [clean,message?`${noteStart}\n${message}\n${noteEnd}`:''].filter(Boolean).join('\n');
}
const fingerprint=(ad:string,ref:Cell|undefined,work:Cell|undefined)=>createHash('sha256').update(JSON.stringify([ad,cellLinks(ref),cellLinks(work),cellLinks(work).length?'':text(work)])).digest('hex');
function trustedMedia(url:URL){
 if(url.protocol!=='https:'||url.port||url.username||url.password)return false;
 const hosts=new Set(['mhanrmumnogrmwkkmarc.supabase.co']);
 for(const env of ['SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL']){try{if(process.env[env])hosts.add(new URL(process.env[env]!).hostname);}catch{}}
 return hosts.has(url.hostname)&&url.pathname.startsWith('/storage/v1/object/public/szekspir-media/');
}
async function remoteSize(url:string){
 if(!trustedMedia(new URL(url)))throw Error('This video host is not supported for automatic checks.');
 return readMp4Size(async(start,length)=>{
  const r=await fetch(url,{headers:{Range:`bytes=${start}-${start+length-1}`},redirect:'error',signal:AbortSignal.timeout(12000)});
  if(r.status!==206){await r.body?.cancel();throw Error('The video server did not allow a metadata-only read.');}
  const range=r.headers.get('content-range')||'';if(!range.startsWith(`bytes ${start}-`)){await r.body?.cancel();throw Error('Invalid video metadata response.');}
  const reader=r.body?.getReader();if(!reader)throw Error('Empty video metadata response.');
  const chunks:Buffer[]=[];let size=0;try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>length)throw Error('Video metadata response exceeded its limit.');chunks.push(Buffer.from(value));}}finally{await reader.cancel();}
  return Buffer.concat(chunks);
 });
}
function driveId(url:URL){if(!['drive.google.com','docs.google.com'].includes(url.hostname))return '';return url.pathname.match(/\/(?:d|folders)\/([\w-]+)/)?.[1]||url.searchParams.get('id')||'';}
export function resolver(drive:drive_v3.Drive){
 const cache=new Map<string,Promise<VideoMeasurement[]>>();
 const resolve=(link:string):Promise<VideoMeasurement[]>=>{
  if(cache.has(link))return cache.get(link)!;
  const pending=(async()=>{const url=new URL(link),id=driveId(url);
   if(!id){const size=await remoteSize(link);return [{...size,name:url.pathname.split('/').pop()||'Video',url:link}];}
   const fields='id,name,mimeType,videoMediaMetadata,shortcutDetails';
   let inspected=0;
   const get=async(fileId:string,depth=0):Promise<VideoMeasurement[]>=>{
    if(++inspected>100)throw Error('Too many files in this folder. Link completed videos directly.');
    if(depth>3)throw Error('Too many nested folders or shortcuts. Link the video files directly.');
    const f=(await drive.files.get({fileId,fields,supportsAllDrives:true},{timeout:15000})).data;
    if(f.shortcutDetails?.targetId)return get(f.shortcutDetails.targetId,depth+1);
    if(f.mimeType==='application/vnd.google-apps.folder'){
     const all:drive_v3.Schema$File[]=[];let pageToken:string|undefined;
     do{const page=await drive.files.list({q:`'${fileId}' in parents and trashed = false`,fields:`nextPageToken,files(${fields})`,pageSize:100,pageToken,supportsAllDrives:true,includeItemsFromAllDrives:true},{timeout:15000});all.push(...page.data.files||[]);pageToken=page.data.nextPageToken||undefined;if(all.length>100)throw Error('Folder is too large. Link the completed videos directly.');}while(pageToken);
     const videos=all.filter(v=>v.mimeType?.startsWith('video/')||v.mimeType==='application/vnd.google-apps.folder'||v.shortcutDetails);
     if(!videos.length)throw Error('No video found in the linked folder.');
     return (await Promise.all(videos.map(v=>get(v.id!,depth+1)))).flat();
    }
    const m=f.videoMediaMetadata;if(!f.mimeType?.startsWith('video/')||!m?.width||!m?.height)throw Error('Video is unavailable or Drive has not finished reading its resolution.');
    return [{width:m.width,height:m.height,name:f.name||'Video',url:`https://drive.google.com/file/d/${f.id}/view`,id:f.id!}];
   };return get(id);
  })();cache.set(link,pending);return pending;
 };return resolve;
}
export async function loadSheet(sheets:sheets_v4.Sheets,spreadsheetId:string,tab:string){
 const meta=(await sheets.spreadsheets.get({spreadsheetId,fields:'sheets.properties'},{timeout:15000})).data.sheets?.find(s=>s.properties?.title===tab)?.properties;
 if(meta?.sheetId==null)throw Error(`Missing ${tab} sheet.`);
 const end=Math.min(meta.gridProperties?.rowCount||501,502),cols=Math.min(meta.gridProperties?.columnCount||18,32);
 const letter=(n:number):string=>n<=26?String.fromCharCode(64+n):'A'+String.fromCharCode(64+n-26);
 const data=await sheets.spreadsheets.get({spreadsheetId,ranges:[`'${tab}'!A1:${letter(cols)}${end}`],fields:'sheets(properties,conditionalFormats,data(rowData(values(userEnteredValue,formattedValue,hyperlink,chipRuns,textFormatRuns,note))))'},{timeout:15000});
 const sheet=data.data.sheets?.find(s=>s.properties?.title===tab);return {sheetId:meta.sheetId,rows:(sheet?.data?.[0]?.rowData||[]).map(r=>r.values||[]),rules:sheet?.conditionalFormats||[]};
}
function heads(rows:Cell[][]){return (rows[0]||[]).map(c=>text(c).toLowerCase());}
export async function inspectQualityRows(rows:Cell[][],workspace:Workspace,sheetId:number,resolve:(s:string)=>Promise<VideoMeasurement[]>,deadline=Infinity):Promise<QualityResult[]>{
 const h=heads(rows),idCol=h.indexOf('ad id'),refCol=Math.max(h.indexOf('video'),h.indexOf('reference file'));
 if(idCol<0||refCol<0)throw Error('Video quality headers are missing.');
 const fields=['your work','your revised work'].map(name=>h.indexOf(name)).filter(c=>c>=0),results:QualityResult[]=[];
 for(let i=1;i<rows.length;i++){
  const row=rows[i],adId=text(row[idCol]);if(!adId)continue;
  for(const col of fields){const work=row[col];if(!text(work)&&!cellLinks(work).length)continue;
   const r:QualityResult={adId,editor:workspace.name,editorId:workspace.id,field:text(rows[0][col]),row:i+1,col,sheetUrl:`https://docs.google.com/spreadsheets/d/${workspace.sheetId}/edit#gid=${sheetId}&range=${String.fromCharCode(65+col)}${i+1}`,status:'unknown',message:'',files:[],checkedAt:Date.now(),fingerprint:fingerprint(adId,row[refCol],work)};
   try{
    if(Date.now()>deadline)throw Error('Check pending: remaining files will be checked on the next scan.');
    const refLinks=cellLinks(row[refCol]),workLinks=cellLinks(work);if(!refLinks.length||!workLinks.length)throw Error('Add a readable reference and completed-video link.');
    const references=(await Promise.all(refLinks.map(resolve))).flat();r.reference=references.sort((a,b)=>b.width*b.height-a.width*a.height)[0];
    if(!r.reference)throw Error('Reference resolution is unavailable.');
    // Retain failures alongside known low-resolution files; never report a partial check as passed.
    const files=await Promise.allSettled(workLinks.map(resolve));r.files=files.flatMap(f=>f.status==='fulfilled'?f.value:[]);
    const low=r.files.filter(f=>compareVideoSize(r.reference!,f).low);
    if(low.length){r.status='low';r.message='Improve export quality. '+low.map(f=>`${f.name}: ${f.width}×${f.height} vs reference ${r.reference!.width}×${r.reference!.height} (${compareVideoSize(r.reference!,f).percent}% fewer pixels).`).join(' ')+' Re-export from the supplied reference at its original resolution. Do not upscale a low-resolution export.';}
    else if(files.some(f=>f.status==='rejected')||!r.files.length)throw Error('Some submitted files are unavailable or have no readable video resolution.');
    else{r.status='pass';r.message='Resolution check passed. This does not certify visual quality or compression.';}
   }catch(e){r.message='Could not verify quality. '+(e as Error).message;}
   results.push(r);
  }
 }
 return results;
}
export async function applyQualityMarks(sheets:sheets_v4.Sheets,spreadsheetId:string,tab:string,results:QualityResult[],editor=true){
 const live=await loadSheet(sheets,spreadsheetId,tab),h=heads(live.rows),idCol=h.indexOf('ad id'),refCol=Math.max(h.indexOf('video'),h.indexOf('reference file'));
 const requests:sheets_v4.Schema$Request[]=[],ranges:sheets_v4.Schema$GridRange[]=[];
 const applicable:QualityResult[]=[];
 for(let row=1;row<live.rows.length;row++){
  const adId=text(live.rows[row][idCol]);
  if(!editor&&adId){
   const assignmentCol=h.indexOf('editor id'),assignment=text(live.rows[row][assignmentCol]);
   const candidates=results.filter(r=>r.adId===adId&&(!assignment||r.editorId===assignment));
   const latest=candidates.find(r=>r.field.toLowerCase()==='your revised work')||candidates.find(r=>r.field.toLowerCase()==='your work');
   const cell=live.rows[row][idCol],note=qualityNote(cell?.note,latest&&latest.status!=='pass'?`${latest.editor} · ${latest.field}: ${latest.message}\n${latest.sheetUrl}`:undefined);
   const range={sheetId:live.sheetId,startRowIndex:row,endRowIndex:row+1,startColumnIndex:idCol,endColumnIndex:idCol+1};
   if(note!==(cell?.note||''))requests.push({updateCells:{range,rows:[{values:[{note}]}],fields:'note'}});
   if(latest?.status==='low')ranges.push(range);
  }
  for(const field of ['your work','your revised work']){const col=h.indexOf(field);if(col<0)continue;
   const cell=live.rows[row][col];const result=results.find(r=>r.adId===adId&&r.field.toLowerCase()===field&&r.fingerprint===fingerprint(adId,live.rows[row][refCol],cell));
   const note=qualityNote(cell?.note,result&&result.status!=='pass'?result.message:undefined);
   const range={sheetId:live.sheetId,startRowIndex:row,endRowIndex:row+1,startColumnIndex:col,endColumnIndex:col+1};
   if(note!==(cell?.note||''))requests.push({updateCells:{range,rows:[{values:[{note}]}],fields:'note'}});
   if(result?.status==='low')ranges.push(range);
   if(result)applicable.push(result);
  }
 }
 const owned=live.rules.map((r,i)=>({r,i})).filter(({r})=>r.booleanRule?.condition?.values?.some(v=>v.userEnteredValue===`=N("${marker}")=0`));
 const wanted=ranges.length?[{ranges,booleanRule:{condition:{type:'CUSTOM_FORMULA',values:[{userEnteredValue:`=N("${marker}")=0`}]},format:{backgroundColor:{red:1,green:0.8,blue:0.8},textFormat:{foregroundColor:{red:0.6,green:0,blue:0},bold:true}}}}]:[];
 if(JSON.stringify(owned.map(x=>x.r))!==JSON.stringify(wanted)){
  for(const {i} of [...owned].reverse())requests.push({deleteConditionalFormatRule:{sheetId:live.sheetId,index:i}});
  if(wanted[0])requests.push({addConditionalFormatRule:{index:0,rule:wanted[0]}});
 }
 if(requests.length)await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests}},{timeout:20000});
 return editor?applicable:results;
}
export async function scanVideoQuality(){
 const sheets=google.sheets({version:'v4',auth:sheetAuth()}),drive=google.drive({version:'v3',auth:sheetAuth()}),resolve=resolver(drive),deadline=Date.now()+240000;
 const scan=async(w:Workspace)=>{
  const name=stateName(w.id),token=randomUUID();const acquired=await mutate<QualityState,boolean>(name,empty(),s=>{if((s.until||0)>Date.now())return false;s.lease=token;s.until=Date.now()+300000;return true;});if(!acquired)return;
  try{
   const sheet=await loadSheet(sheets,w.sheetId,title);
   const results=await inspectQualityRows(sheet.rows,w,sheet.sheetId,resolve,deadline);
   const verified=await applyQualityMarks(sheets,w.sheetId,title,results);
   await mutate<QualityState,void>(name,empty(),s=>{if(s.lease!==token)return;s.results=verified;s.checkedAt=Date.now();s.error=undefined;s.lease=undefined;s.until=undefined;});
  }catch(e){await mutate<QualityState,void>(name,empty(),s=>{if(s.lease!==token)return;s.error=(e as Error).message;s.lease=undefined;s.until=undefined;});}
 };
 // Two workspaces at a time keeps Drive / Sheets calls within quotas.
 for(let i=0;i<EDITOR_WORKSPACES.length;i+=2)await Promise.all(EDITOR_WORKSPACES.slice(i,i+2).map(scan));
 const summary=await qualitySummary();
 const adminId=process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY';
 await applyQualityMarks(sheets,adminId,'Daily Briefs',summary.results,false);
 return summary;
}
export async function qualitySummary(){
 const states=await Promise.all(EDITOR_WORKSPACES.map(async w=>({workspace:w,...(await readState<QualityState>(stateName(w.id),empty())).value})));
 return {threshold:30,metric:'pixel-count',results:states.flatMap(s=>s.results),checks:states.map(s=>({editor:s.workspace.name,checkedAt:s.checkedAt||null,error:s.error||null})),checkedAt:Math.min(...states.map(s=>s.checkedAt||0))||null};
}
