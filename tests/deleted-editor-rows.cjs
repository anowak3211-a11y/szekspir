const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {planAssignedSync}=require('../lib/editor-sync-plan.ts');
const h=['Ad ID','Adapted script','HOOK OG','Hook 1','Hook 2','Video','Voice Over','Feedback','Approval','Hours spent','Your work','Notes','Additional files','Editor ID'];
const row=(id,owner)=>[id,'script','og','hook1','hook2','video','vo','review','Changes requested',1,'work','note','First: https://one\nSecond: https://two',owner];
const apply=(rows,changes)=>changes.forEach(c=>{rows[c.row-1]??=[];rows[c.row-1][c.col]=c.value});
for(const owner of ['mine','editor-2','editor-3','editor-4','editor-5','editor-6','editor-7','editor-8']){
 const admin=[h,row('MEL-00001',owner),row('MEL-00002',owner)],editor=structuredClone(admin);let p=planAssignedSync(admin,editor,{},501,owner);
 editor.splice(1,1);p=planAssignedSync(admin,editor,p.snapshot,501,owner);assert.equal(p.snapshot['MEL-00001']['deleted:row'],true);assert(!p.editorChanges.some(c=>c.value==='MEL-00001'));assert(!p.adminChanges.some(c=>c.row===2),'Deleted row never blanks master');
 admin[1][1]='Regenerated';admin.push(row('MEL-00003',owner));for(let n=0;n<3;n++){p=planAssignedSync(admin,editor,JSON.parse(JSON.stringify(p.snapshot)),501,owner);assert(!p.editorChanges.some(c=>c.value==='MEL-00001'));apply(admin,p.adminChanges);apply(editor,p.editorChanges);}assert(editor.some(r=>r[0]==='MEL-00003'),'New jobs still arrive');
 // Explicitly restoring the Ad ID in the editor sheet restores normal ownership tracking.
 editor.push(row('MEL-00001',owner));p=planAssignedSync(admin,editor,p.snapshot,501,owner);assert(!p.snapshot['MEL-00001']['deleted:row']);
 const target=editor.find(r=>r[0]==='MEL-00002');for(const field of ['Feedback','Approval','Your work','Hook 1'])target[h.indexOf(field)]='';target[h.indexOf('Additional files')]='Second: https://two';
 p=planAssignedSync(admin,editor,p.snapshot,501,owner);apply(admin,p.adminChanges);apply(editor,p.editorChanges);
 const master=admin.find(r=>r[0]==='MEL-00002');for(const field of ['Feedback','Approval','Your work','Hook 1','Additional files'])master[h.indexOf(field)]='Stale master data';
 p=planAssignedSync(admin,editor,p.snapshot,501,owner);assert(!p.editorChanges.some(c=>['Feedback','Approval','Your work','Hook 1','Additional files'].includes(h[c.col])),'Deleted fields cannot return');
}
console.log('PASS all 8 workspaces: row deletion persists across reloads/master changes; new jobs arrive; manual restore works; deleted review/work/links stay deleted');
