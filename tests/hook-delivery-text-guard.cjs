const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const base={id:'hook-delivery-guard-001',adId:'MEL-00001',result:{hooks:['One','Two']}},workspace={id:'mine',sheetId:'editor'};
let before,current,sheetWrites=0;
const api={spreadsheets:{get:async()=>({data:{sheets:[{properties:{title:'Daily Briefs',sheetId:801}},{properties:{title:'My Tasks',sheetId:801}}]}}),values:{get:async()=>({data:{values:[['Ad ID','Hook 1','Hook 2','Voice Over'],['MEL-00001','One','Two','untouched audio']]}})},batchUpdate:async()=>{sheetWrites++;}}};
const real=Module._load;Module._load=function(n,p,i){if(p?.filename.endsWith('save-hook-delivery.ts')){
 if(n==='googleapis')return {google:{sheets:()=>api}};
 if(n==='./sheets')return {sheetAuth:()=>null,shiftAdminRange:(_,i)=>String.fromCharCode(65+i)};
 if(n==='./jobs')return {getJob:async()=>structuredClone(before)};
 if(n==='./editor-sync')return {editorAssignment:async()=>({current:'mine'})};
 if(n==='./editor-workspaces')return {EDITOR_WORKSPACES:[workspace]};
 if(n==='./editor-locks')return {withEditorLocks:async(_,fn)=>fn()};
 if(n==='./store')return {mutate:async(_,fallback,fn)=>fn(current)};
 }return real.call(this,n,p,i);};
const {saveHookDelivery}=require('../lib/save-hook-delivery.ts');
(async()=>{
 const marker={token:'one',index:1,previousText:'Two',text:'New two'};
 before=current={...structuredClone(base),hookDeliveryPending:1,hookTextDelivery:marker};
 await assert.rejects(()=>saveHookDelivery(base.id,1,true),/hook text/);assert.equal(sheetWrites,0);assert.equal(current.hookTextDelivery,marker);
 before=structuredClone(base);current={...structuredClone(base),hookDeliveryPending:1,hookTextDelivery:marker};
 await assert.rejects(()=>saveHookDelivery(base.id,1,true),/hook text/);assert.equal(sheetWrites,0);assert.equal(current.hookTextDelivery,marker);assert.equal(current.hooksToEditor,undefined);
 console.log('PASS hook-delivery pre-read and atomic race guards preserve pending text save without any sheet writes or checkbox changes');
})().catch(error=>{console.error(error);process.exitCode=1;});
