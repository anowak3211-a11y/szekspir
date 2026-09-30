const assert=require('assert/strict'),fs=require('fs'),ts=require('typescript'),Module=require('module');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,n);
let job={adId:'TEST-97'},missing=false,fail=false,writes=[];
const rows={admin:[['Ad ID','Notes'],['TEST-97','Admin note']],editor:[['Notes','Ad ID'],['Editor note','TEST-97']]};
const api={spreadsheets:{values:{get:async({spreadsheetId})=>({data:{values:missing&&spreadsheetId==='editor'?[rows.editor[0]]:rows[spreadsheetId]}}),update:async p=>{if(fail&&p.spreadsheetId==='editor')throw Error('temporary');writes.push(p);rows[p.spreadsheetId][1][p.spreadsheetId==='admin'?1:0]=p.requestBody.values[0][0];}}}};
const load=Module._load;Module._load=function(n,p,i){if(n==='./jobs')return {getJob:async()=>job};if(n==='./store')return {mutate:async(k,d,f)=>f(job)};if(n==='./editor-sync')return {editorAssignment:async()=>({current:'assigned-now',api})};if(n==='./editor-locks')return {withEditorLocks:async(k,f)=>f()};if(n==='./editor-workspaces')return {EDITOR_WORKSPACES:[{id:'assigned-now',name:'Current editor',sheetId:'editor'}]};if(n==='./sheets')return {shiftAdminRange:(_,c)=>String.fromCharCode(65+c)};return load.call(this,n,p,i)};
process.env.ADMIN_SHEET_ID='admin';const {addEditorComment}=require('../lib/editor-comment.ts');
(async()=>{
 await assert.rejects(addEditorComment('job',' '),/Enter a comment/);assert.equal(writes.length,0);
 missing=true;await assert.rejects(addEditorComment('job','Sound effects'),/matching ad/);assert.equal(writes.length,0);missing=false;
 fail=true;await assert.rejects(addEditorComment('job','Sound effects'),/temporary/);fail=false;
 const result=await addEditorComment('job','Sound effects');assert.equal(result.editor,'Current editor');assert.equal(result.notes,'Admin note\n\nEditor note\n\nSound effects');assert.equal(job.editorNotes,result.notes);
 const count=writes.length;await addEditorComment('job','Sound effects');assert.equal(writes.length,count);assert(writes.every(w=>/![AB]2$/.test(w.range)));assert.equal(job.status,undefined);
 console.log('PASS comments: preserve notes, current assignment, narrow writes, missing row, partial failure and idempotent retry');
})().catch(e=>{console.error(e);process.exitCode=1});
