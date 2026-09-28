const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const {compareVideoSize,readMp4Size}=require('../lib/video-quality.ts');
const ref={width:1000,height:1000};
assert.equal(compareVideoSize(ref,{width:1000,height:701}).low,false);
assert.equal(compareVideoSize(ref,{width:1000,height:700}).low,true);
assert.equal(compareVideoSize(ref,{width:1000,height:699}).low,true);
assert.equal(compareVideoSize({width:1440,height:2560},{width:1080,height:1920}).percent,44);
assert.equal(compareVideoSize({width:1440,height:2560},{width:720,height:1278}).percent,75);
assert.equal(compareVideoSize(ref,{width:1000,height:1000}).low,false);
assert.equal(compareVideoSize(ref,{width:2000,height:2000}).low,false);
assert.throws(()=>compareVideoSize(ref,{width:0,height:0}));
const box=(type,data)=>{const h=Buffer.alloc(8);h.writeUInt32BE(data.length+8);h.write(type,4);return Buffer.concat([h,data]);};
function movie(version=0){const tkhd=Buffer.alloc(version?96:84);tkhd[0]=version;tkhd.writeUInt32BE(1440*65536,version?88:76);tkhd.writeUInt32BE(2560*65536,version?92:80);const hdlr=Buffer.alloc(24);hdlr.write('vide',8);return box('moov',box('trak',Buffer.concat([box('tkhd',tkhd),box('mdia',box('hdlr',hdlr))])));}
const load=Module._load;
Module._load=function(req,...args){if(req==='./sheets')return {sheetAuth:()=>({})};if(req==='./store')return {};return load.call(this,req,...args);};
const {cellLinks,qualityNote,inspectQualityRows,applyQualityMarks}=require('../lib/editor-quality.ts');
Module._load=load;
const cell=s=>({userEnteredValue:{stringValue:s}}),link=s=>cell('https://drive.google.com/file/d/'+s+'/view');
const headers=['Ad ID','Video','Your work','Your Revised Work'].map(cell);
const w={id:'editor-4',name:'Editor',sheetId:'sheet-id'};
(async()=>{
 for(const version of [0,1]){
  const prefix=box('ftyp',Buffer.alloc(16)),mdat=box('mdat',Buffer.alloc(1024*1024)),file=Buffer.concat([prefix,mdat,movie(version)]),reads=[];
  const size=await readMp4Size(async(s,n)=>{reads.push(n);return file.subarray(s,s+n)});assert.deepEqual(size,{width:1440,height:2560});assert(reads.reduce((a,b)=>a+b,0)<1000,'must skip video bytes');
 }
 assert.deepEqual(cellLinks({userEnteredValue:{stringValue:'@'},chipRuns:[{chip:{richLinkProperties:{uri:'https://drive.google.com/drive/folders/abc'}}}]}),['https://drive.google.com/drive/folders/abc']);
 assert.equal(qualityNote('Manual feedback\n[SZEKSPIR VIDEO QUALITY]\nold\n[/SZEKSPIR VIDEO QUALITY]','new'),'Manual feedback\n[SZEKSPIR VIDEO QUALITY]\nnew\n[/SZEKSPIR VIDEO QUALITY]');
 assert.equal(qualityNote('Manual feedback\n[SZEKSPIR VIDEO QUALITY]\nold\n[/SZEKSPIR VIDEO QUALITY]'),'Manual feedback');
 const rows=[headers,[cell('MEL-00058'),link('ref'),link('folder'),link('revised')],[cell('MEL-00059'),link('ref'),link('missing')]];
 const resolve=async url=>{if(url.includes('missing'))throw Error('No access');return [{name:url,url,...(url.includes('folder')?{width:720,height:1278}:{width:1440,height:2560})}];};
 const result=await inspectQualityRows(rows,w,801,resolve);
 assert.deepEqual(result.map(r=>r.status),['low','pass','unknown']);assert.match(result[0].message,/75% fewer pixels/);
 // A failed link must not hide a known low-quality file or turn a partial check green.
 const partial=await inspectQualityRows([headers,[cell('MEL-00060'),link('ref'),cell('https://drive.google.com/file/d/folder/view\nhttps://drive.google.com/file/d/missing/view')]],w,801,resolve);assert.equal(partial[0].status,'low');
 const seen=[];const foreign={ranges:[{sheetId:801}],booleanRule:{condition:{type:'TEXT_CONTAINS',values:[{userEnteredValue:'manual'}]}}};
 let liveRows=rows;
 const sheets={spreadsheets:{get:async p=>({data:{sheets:[{properties:{title:'My Tasks',sheetId:801,gridProperties:{rowCount:501,columnCount:18}},conditionalFormats:[foreign],data:[{rowData:liveRows.map(values=>({values}))}]}]}}),batchUpdate:async p=>seen.push(...p.requestBody.requests)}};
 await applyQualityMarks(sheets,'sheet-id','My Tasks',result);
 assert(seen.some(r=>r.addConditionalFormatRule));assert(!seen.some(r=>r.deleteConditionalFormatRule));
 assert(seen.filter(r=>r.updateCells).every(r=>r.updateCells.fields==='note'),'must never replace cell values or chips');
 assert.equal(seen.find(r=>r.addConditionalFormatRule).addConditionalFormatRule.rule.ranges.length,1);
 // User changed the link while inspecting: stale result must not color the new file.
 liveRows=structuredClone(rows);liveRows[1][2]=link('new-file');seen.length=0;
 const valid=await applyQualityMarks(sheets,'sheet-id','My Tasks',result);assert(!valid.some(r=>r.status==='low'));assert(!seen.some(r=>r.addConditionalFormatRule));
 // Remove only our rule after correction; retain unrelated conditional formatting and manual notes.
 const owned={ranges:[],booleanRule:{condition:{values:[{userEnteredValue:'=N("SZEKSPIR_VIDEO_QUALITY_V1")=0'}]}}};
 sheets.spreadsheets.get=async()=>({data:{sheets:[{properties:{title:'My Tasks',sheetId:801},conditionalFormats:[foreign,owned],data:[{rowData:liveRows.map(values=>({values}))}]}]}});seen.length=0;await applyQualityMarks(sheets,'sheet-id','My Tasks',[]);assert.deepEqual(seen.filter(r=>r.deleteConditionalFormatRule),[{deleteConditionalFormatRule:{sheetId:801,index:1}}]);
 // Admin Ad ID must warn even when its manually preserved work link differs.
 liveRows=structuredClone(rows);liveRows[1][2]=link('different-admin-link');seen.length=0;
 const adminApi={spreadsheets:{get:async()=>({data:{sheets:[{properties:{title:'Daily Briefs',sheetId:802},conditionalFormats:[],data:[{rowData:liveRows.map(values=>({values}))}]}]}}),batchUpdate:async p=>seen.push(...p.requestBody.requests)}};
 await applyQualityMarks(adminApi,'admin','Daily Briefs',[result[0]],false);
 assert(seen.find(r=>r.addConditionalFormatRule).addConditionalFormatRule.rule.ranges.some(r=>r.startColumnIndex===0));
 assert(seen.filter(r=>r.updateCells).every(r=>r.updateCells.fields==='note'));
 // A good revised file clears the task-level alert about the previous poor export.
 seen.length=0;await applyQualityMarks(adminApi,'admin','Daily Briefs',result,false);
 assert(!seen.some(r=>r.addConditionalFormatRule?.rule.ranges.some(r=>r.startColumnIndex===0)));
 console.log('PASS: exact 30% threshold, upscaling, MP4 metadata v0/v1 and bounded reads, smart chips, partial failures, revised work, note preservation, race guard, conditional-rule cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1});
