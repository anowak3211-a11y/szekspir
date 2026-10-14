const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
let rows=[],tab=false,writes=0,failRead=false;
const column=s=>[...s].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0)-1;
function read(range){const m=range.match(/!([A-Z]+)(\d+):([A-Z]+)(\d+)/);assert(m);return rows.slice(+m[2]-1,+m[4]).map(r=>(r||[]).slice(column(m[1]),column(m[3])+1));}
const sheets={spreadsheets:{get:async()=>({data:{sheets:tab?[{properties:{title:'Upload Antki',sheetId:55}}]:[]}}),values:{
get:async({range})=>{if(failRead&&range.includes('A2:X2')){failRead=false;throw Error('offline interrupted read');}return {data:{values:read(range)}};},
batchGet:async({ranges})=>({data:{valueRanges:ranges.map(r=>({values:read(r)}))}}),
update:async({range,requestBody})=>{writes++;const m=range.match(/!([A-Z]+)(\d+)/);rows[+m[2]-1]||=[];rows[+m[2]-1].splice(column(m[1]),requestBody.values[0].length,...requestBody.values[0]);}},
batchUpdate:async({requestBody})=>{for(const r of requestBody.requests){if(r.addSheet)tab=true;if(r.updateCells)rows[r.updateCells.range.startRowIndex][22]=r.updateCells.rows[0].values[0].userEnteredValue.formulaValue;}return {data:{replies:[{addSheet:{properties:{sheetId:55,title:'Upload Antki'}}}]}};}}};
const original=Module._load;Module._load=function(n,p,i){if(p?.filename.endsWith('/lib/antki-approval-sheet.ts')){if(n==='googleapis')return {google:{sheets:()=>sheets}};if(n==='./sheets')return {sheetAuth:()=>({})};if(n==='./editor-locks')return {withEditorLocks:async(k,f)=>f()};}return original.call(this,n,p,i);};
(async()=>{const service=require('../lib/antki-approval-sheet.ts');const work={id:'facebook_1234567890123',revision:4,ukText:'  Long UK copy.\n'.repeat(7000),ukHeadline:'UK headline',imageDriveUrl:'https://drive.google.com/file/d/image-id/view',imageFileId:'image-id',approval:{approvedAt:'2026-10-14T20:00:00.000Z'}};const ad={id:work.id};
const url=await service.exportApprovedAntki(work,ad);assert(url.includes('gid=55'));assert.equal(rows[1][7]+rows[1][16]+rows[1][17],work.ukText);assert.equal(rows[1][5],work.imageDriveUrl);assert.equal(rows[1][8],work.ukHeadline);assert.equal(rows[1][21],'Approved');assert.equal(rows[1][3],'');const before=writes;await service.exportApprovedAntki(work,ad);assert.equal(rows.length,2);assert.equal(writes,before);
rows[1][8]='Manual edit';await assert.rejects(()=>service.exportApprovedAntki(work,ad),/edited in Sheet/);assert.equal(rows[1][8],'Manual edit');rows[1][8]=work.ukHeadline;
work.revision=5;work.ukHeadline='Revised headline';await service.exportApprovedAntki(work,ad);assert.equal(rows.length,3);assert.equal(rows[1][8],'UK headline');assert.equal(rows[2][8],'Revised headline');
rows[0][8]='Owner header';await assert.rejects(()=>service.exportApprovedAntki(work,ad),/headers changed/);console.log('PASS: compatible upload columns, lossless long copy, durable image link, idempotent approval, immutable revisions and manual/header conflict refusal. No live Sheet writes.');
})().catch(e=>{console.error(e);process.exitCode=1;});
