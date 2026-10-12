const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module'),path=require('node:path');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
global.fetch=async()=>{throw Error('No live network in cancellation tests');};
process.env.ADMIN_SHEET_ID='master';
const state=new Map(),writes=[];let failSheet='',exportGate,exportStarted,queued=0;
const workspaces=[{id:'editor-a',sheetId:'editor-a',name:'A'},{id:'editor-b',sheetId:'editor-b',name:'B'}];
const headers=['Ad ID','Ad name','Ad desire','Ad angle','Unique mechanism','Funnel','LP','Likes','Adapted script','HOOK OG','Hook 1','Hook 2','Hook 3','Video','Voice Over','Your work','Feedback','Approval','Hours','Production status','Editor ID'];
const row=(id,owner)=>[id,'Saved '+id,'desire','angle','','TOF','','','keep script','og','hook1','hook2','','video','audio','edited work','','',0,'Editing',owner];
const db={master:[headers,row('MEL-00113','editor-a'),row('MEL-00120','editor-b'),row('MEL-00121','editor-a')], 'editor-a':[['Product','Ad ID','Adapted script'],['Gummies','MEL-00113','A work'],['Gummies','MEL-00121','Neighbour A']], 'editor-b':[['Ad ID','Adapted script'],['MEL-00120','B work']]};
db.master[1][19]='=IF(A2="","","Editing")';db['editor-a'][0].push('Production status');db['editor-a'][1].push('=IF(B2="","","Editing")');db['editor-a'][2].push('=IF(B3="","","Editing")');
const before=structuredClone(db);
const letters=s=>[...s].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0)-1;
const decode=range=>{const m=range.match(/!([A-Z]+)(\d+)(?::([A-Z]+)(\d+)?)?$/);assert(m,'Unexpected range '+range);return {r:+m[2]-1,endR:m[4]?+m[4]-1:m[3]?30:+m[2]-1,c:letters(m[1]),endC:letters(m[3]||m[1])};};
const api={spreadsheets:{
 get:async({spreadsheetId,ranges})=>({data:{sheets:[{properties:{sheetId:spreadsheetId==='master'?802:801,title:spreadsheetId==='master'?'Daily Briefs':'My Tasks',gridProperties:{rowCount:31,columnCount:db[spreadsheetId][0].length}},...(ranges?{data:ranges.map(range=>{const p=decode(range);return {startRow:p.r,rowData:[{values:Array.from({length:db[spreadsheetId][0].length},(_,c)=>({userEnteredValue:String(db[spreadsheetId][p.r]?.[c]??'').startsWith('=')?{formulaValue:db[spreadsheetId][p.r][c]}:{stringValue:String(db[spreadsheetId][p.r]?.[c]??'')},userEnteredFormat:{wrapStrategy:'WRAP'}}))}]};})}:{})}]}}),
 values:{get:async({spreadsheetId,range})=>{const p=decode(range);return {data:{values:Array.from({length:p.endR-p.r+1},(_,i)=>(db[spreadsheetId][p.r+i]||[]).slice(p.c,p.endC+1).map(v=>typeof v==='string'&&v.startsWith('=')?'':v))}};},
 update:async({spreadsheetId,range,requestBody})=>{const p=decode(range);db[spreadsheetId][p.r]??=[];requestBody.values[0].forEach((v,i)=>db[spreadsheetId][p.r][p.c+i]=v);return{};},
 batchUpdate:async({spreadsheetId,requestBody})=>{if(exportGate){exportStarted();await exportGate;}for(const d of requestBody.data){const p=decode(d.range);db[spreadsheetId][p.r]??=[];d.values[0].forEach((v,i)=>db[spreadsheetId][p.r][p.c+i]=v);}return{};}},
 batchUpdate:async({spreadsheetId,requestBody})=>{if(failSheet===spreadsheetId){failSheet='';throw Error('Mock sheet unavailable');}for(const request of requestBody.requests){assert(!request.deleteDimension,'Cancellation must not shift rows under other writers');const u=request.updateCells;assert.equal(u.fields,'userEnteredValue,textFormatRuns,note');assert.equal(u.rows.length,1);writes.push({sheet:spreadsheetId,row:u.range.startRowIndex});db[spreadsheetId][u.range.startRowIndex]=u.rows[0].values.map(cell=>cell.userEnteredValue?.formulaValue||cell.userEnteredValue?.stringValue||'');}return{};}
}};
const real=Module._load;
Module._load=function(n,p,...rest){
 if(n==='./store')return {readState:async(k,d)=>({value:structuredClone(state.get(k)??d)}),writeState:async(k,v)=>{if(state.has(k))throw Object.assign(Error('Already exists'),{name:'AlreadyExists'});state.set(k,structuredClone(v));},mutate:async(k,d,fn)=>{const s=structuredClone(state.get(k)??d),result=fn(s);state.set(k,s);return structuredClone(result);}};
 if(n==='./editor-workspaces')return {EDITOR_WORKSPACES:workspaces};
 if(n==='googleapis')return {google:{auth:{GoogleAuth:class{}},sheets:()=>api}};
 if(n==='@vercel/queue')return {send:async()=>{queued++;}};
 if(n==='next/server')return {after:()=>assert.fail('Cancel must not enqueue after-work')};
 if(n.startsWith('@/'))return real.call(this,path.resolve(n.slice(2)),p,...rest);
 return real.call(this,n,p,...rest);
};
const makeJob=(id,adId)=>({id,adId,name:'Test',step:'export',status:'Running',engine:2,lease:'old-worker',leaseUntil:Date.now()+90000,hookVoPending:{0:true},result:{uk_script:'Manual text'},voUrl:'saved.wav'});
(async()=>{
 const jobs=require('../lib/jobs.ts'),sheets=require('../lib/sheets.ts'),guard=require('../lib/cancellation.ts');
 const id='cancel-job-113';state.set('job-'+id,makeJob(id,'MEL-00113'));state.set('pipeline-capacity',{[id]:{token:'old-worker',until:Date.now()+90000}});
 let j=await jobs.cancelJob(id);assert.equal(j.cancelCleanup.status,'complete');assert(j.cancelledAt);assert.equal(j.lease,undefined);assert.equal(j.result.uk_script,'Manual text');assert.equal(j.voUrl,'saved.wav');assert.deepEqual(j.hookVoPending,{});assert(!state.get('pipeline-capacity')[id]);assert(await guard.adCancelled('MEL-113'));
 assert.equal(db.master[1][0],'');assert.equal(db['editor-a'][1][1],'');assert.equal(db.master[1][19],before.master[1][19]);assert.equal(db['editor-a'][1][3],before['editor-a'][1][3],'Template status formulas survive deletion');assert.deepEqual(db.master[3],before.master[3]);assert.deepEqual(db['editor-a'][2],before['editor-a'][2]);assert.equal(db.master[2][0],'MEL-00120');
 const count=writes.length;await jobs.cancelJob(id);assert.equal(writes.length,count,'Complete cancellation is idempotent');
 await assert.rejects(()=>sheets.appendToAdminBriefs({jobId:id,uk:'Do not recreate',hooks:[],funnel:'TOF'}),/stopped/);
 await assert.rejects(()=>sheets.updateReference('MEL-00113','new link'),/cancelled/);await assert.rejects(()=>sheets.updateVoiceover('MEL-00113','new audio'),/cancelled/);
 await assert.rejects(()=>jobs.retryJob(id),/stopped/);
 const service=require('../lib/additional-files.ts');await service.generateAdditional('MEL-00113','queued-file');await service.advanceAdditionalVideo('MEL-00113','queued-file');assert.equal(await service.additionalVideoPending('MEL-00113','queued-file'),false);
 // Partial sheet failure stays stopped, reports failure, and retries only remaining rows.
 const other='cancel-job-120';state.set('job-'+other,makeJob(other,'MEL-00120'));failSheet='editor-b';
 const {POST}=require('../app/api/jobs/route.ts');const request=()=>new Request('https://offline/api/jobs',{method:'POST',body:JSON.stringify({action:'cancel',id:other})});
 let response=await POST(request());assert.equal(response.status,503);const failed=await response.json();assert(failed.job.cancelledAt);assert.equal(failed.job.cancelCleanup.status,'failed');assert.equal(db.master[2][0],'');assert.equal(db['editor-b'][1][0],'MEL-00120');assert.equal(queued,0);
 response=await POST(request());assert.equal(response.status,200);assert.equal((await response.json()).job.cancelCleanup.status,'complete');assert.equal(db['editor-b'][1][0],'');assert.equal(queued,0);assert(state.get('cancelled-sheet-rows-'+other).entries.length>=2);
 // An export may be in flight before its Ad ID is checkpointed. Drain it and remove its reservation.
 const racing='cancel-export-race';state.set('job-'+racing,makeJob(racing,undefined));
 let start,release;const started=new Promise(r=>start=r);exportStarted=start;exportGate=new Promise(r=>release=r);
 const exporting=sheets.appendToAdminBriefs({jobId:racing,editorId:'editor-a',uk:'Original script',hooks:[],hookOg:'Original script',desire:'Focus',angle:'Test',mechanism:'',funnel:'TOF',reference:'source'});
 await started;
 const cancelling=jobs.cancelJob(racing);
 for(let i=0;i<20&&!state.get('job-'+racing).cancelledAt;i++)await new Promise(r=>setTimeout(r,1));
 assert(state.get('job-'+racing).cancelledAt,'Stop must persist before the export drains');release();exportGate=null;
 const exported=await exporting;j=await cancelling;assert.equal(j.cancelCleanup.status,'complete');assert(j.cancelCleanup.adIds.includes(exported.adId));assert.equal(state.get('sheet-allocations').reservations[racing].row,0,'Cancelled export releases its row without reusing its Ad ID');assert(await guard.adCancelled(exported.adId));assert(!db.master.some(r=>r[0]===exported.adId));await assert.rejects(()=>sheets.updateReference(exported.adId,'late result'),/cancelled/);
 console.log('PASS cancellation clears exact master/editor rows, preserves neighbours and recordings, gates delayed writes/queued providers, retries partial failures without enqueueing, and drains export-before-Ad-ID races (offline)');
})().catch(e=>{console.error(e);process.exitCode=1});
