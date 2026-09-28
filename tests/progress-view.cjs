const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,n);
const {progressRows}=require('../lib/progress-view.ts');
const base={id:'job-test',video:true,generateVo:false,status:'Running',step:'localise',stages:{transcribe:{done:true},localise:{started:1},videoSubmit:{done:true},videoPoll:{started:2}}};
let rows=progressRows(base);assert.deepEqual(rows.filter(r=>r.state==='active').map(r=>r.key),['localise','videoPoll']);assert(!rows.some(r=>r.key==='vo'));
rows=progressRows({...base,generateVo:true,stages:{...base.stages,vo:{error:'Provider failed',started:3}}});assert.equal(rows.find(r=>r.key==='vo').state,'error');
rows=progressRows(undefined,{stage:'Uploading audio · 100%',name:'a.mp4',updated:1});assert.equal(rows[2].state,'active');assert.equal(rows[2].percent,100);assert.equal(rows[3].state,'waiting');assert.equal(rows.filter(r=>r.state==='done').length,2);
rows=progressRows({...base,video:false});assert(!rows.some(r=>r.key.startsWith('video')));
rows=progressRows({...base,status:'Complete',step:'done',stages:Object.fromEntries(progressRows(base).map(r=>[r.key,{done:true}]))});assert(rows.every(r=>r.state==='done'));
rows=progressRows({...base,stages:undefined,status:'Complete',step:'done'});assert(rows.every(r=>r.state==='done'));
console.log('PASS: parallel stages, optional stages, failures, upload confirmation and completion');

rows=progressRows({...base,engine:2,status:'Queued',stages:undefined});assert(!rows.some(r=>r.state==='active'));assert.equal(rows.filter(r=>r.state==='done').length,0);
