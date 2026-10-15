const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {indexedDB}=require('fake-indexeddb');global.indexedDB=indexedDB;
const moduleDraft=require('../lib/meta-workspace-draft.ts');
const selection={accountId:'12345',campaignId:'23456',adSetId:'34567',pageId:'45678',url:'https://example.com/?x=1&y=2',cta:'SHOP_NOW'};
(async()=>{
 const literal='  Exact copy.\n\n⭐️ Paragraph two.  ';
 const row={localId:'row-1',key:'H1',name:'Hook 1',primaryTexts:[literal,''],headline:'Headline',media:{kind:'video',url:'https://example.com/original.mp4',filename:'original.mp4'},localPreview:'blob:must-not-persist',progress:100,file:new File(['original bytes'],'original.mp4'),token:'must-not-persist'};
 const clean=moduleDraft.workspaceCreative(row,{...selection,...row});
 assert.equal(clean.primaryTexts[0],literal);assert.equal(clean.primaryTexts[1],'');assert.equal(clean.url,selection.url);assert.equal(clean.file,undefined,'Uploaded files use the saved URL, not another binary backup');assert.equal(clean.localPreview,undefined);assert.equal(clean.progress,undefined);assert.equal(clean.token,undefined);
 const backup={version:1,id:'tab-one',batchId:'same-id-after-timeout',batchName:'My batch',selection,drafts:[clean],chosen:['row-1'],updated:1};
 await moduleDraft.saveWorkspace(backup);const restored=await moduleDraft.readWorkspace('tab-one');assert.deepEqual(restored,backup);assert.equal(await moduleDraft.readWorkspace('tab-two'),undefined,'Independent tabs cannot overwrite each other');
 const pending=moduleDraft.workspaceCreative({...row,media:{...row.media,url:''},fileError:'Upload interrupted'},selection);assert.ok(pending.file instanceof File);assert.equal(pending.fileError,'Upload interrupted');
 await moduleDraft.saveWorkspace({...backup,id:'tab-two',drafts:[pending]});const second=await moduleDraft.readWorkspace('tab-two');assert.equal(await second.drafts[0].file.text(),'original bytes');assert.equal(second.drafts[0].media.url,'','Restoring must not claim that a transfer completed');
 await moduleDraft.removeWorkspace('tab-one');assert.equal(await moduleDraft.readWorkspace('tab-one'),undefined);assert.equal((await moduleDraft.readWorkspace('tab-two')).batchId,backup.batchId);
 // New edits replace the same workspace; batch id remains stable for uncertain saves.
 await moduleDraft.saveWorkspace({...backup,batchName:'Edited'});assert.equal((await moduleDraft.readWorkspace('tab-one')).batchName,'Edited');await moduleDraft.removeWorkspace('tab-one');await moduleDraft.removeWorkspace('tab-two');
 console.log('PASS: literal copy, pending original file recovery, uploaded URL reuse, per-tab isolation, stable request identity, replace/discard and credential/blob-URL exclusion. No network or advertising writes.');
})().catch(e=>{console.error(e);process.exitCode=1;});
