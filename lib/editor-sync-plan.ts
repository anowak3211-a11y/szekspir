import {mergeAdditionalLinks} from './additional-files-model';
export type Cell=string|number|boolean;
export type Snapshot=Record<string,Record<string,Cell>>;
export type Change={row:number;col:number;value:Cell};
const owned=['Adapted script','HOOK OG','Hook 1','Hook 2','Video','Voice Over','Feedback','Approval','Hours spent'];
const shared=['Your work'];
const value=(x:unknown):Cell=>typeof x==='number'||typeof x==='boolean'?x:typeof x==='string'?x:'';
const same=(a:unknown,b:unknown)=>String(a??'')===String(b??'');
function columns(rows:unknown[][]){const h=(rows[0]||[]).map(x=>String(x)==='Reference file'?'Video':String(x));for(const field of ['Ad ID',...owned,...shared])if(h.filter(x=>x===field).length!==1)throw new Error('Missing or duplicate header: '+field);return Object.fromEntries(h.map((x,i)=>[x,i]));}
function index(rows:unknown[][],idCol:number){const map=new Map<string,number>();for(let i=1;i<rows.length;i++){const id=String(rows[i]?.[idCol]||'').trim();if(!id)continue;if(!/^MEL-\d+$/.test(id))throw new Error('Invalid Ad ID at row '+(i+1));if(map.has(id))throw new Error('Duplicate Ad ID: '+id);map.set(id,i);}return map;}
export function planSync(admin:unknown[][],editor:unknown[][],previous:Snapshot,editorCapacity:number){
 const ac=columns(admin),ec=columns(editor),ai=index(admin,ac['Ad ID']),ei=index(editor,ec['Ad ID']);
 const adminChanges:Change[]=[],editorChanges:Change[]=[],snapshot:Snapshot={...previous};let conflicts=0;
 const occupied=new Set(ei.values());
 const add=(list:Change[],rows:unknown[][],row:number,col:number,v:Cell)=>{if(!same(rows[row]?.[col],v))list.push({row:row+1,col,value:v});};
 for(const [id,ar] of ai){let er=ei.get(id);const isNew=er===undefined;
  // A previously delivered row that disappears was deliberately removed in the workspace.
  // Keep a durable marker: a later master update must never recreate it.
  if(isNew&&previous[id]){snapshot[id]={...previous[id],'deleted:row':true};continue;}
  if(er===undefined){er=1;while(er<editorCapacity&&(occupied.has(er)||(editor[er]||[]).some((v,c)=>c!==ec['Production status']&&!((c===ec['Ready for review']||c===ec['Changes applied'])&&(v===false||v==='FALSE'))&&String(v??'').trim()!=='')))er++;if(er>=editorCapacity)throw new Error('Editor Workspace has no empty task rows');occupied.add(er);add(editorChanges,editor,er,ec['Ad ID'],id);}
  const saved:Record<string,Cell>={};
  // Once edited in the workspace, including deletion, a cell stays editor-owned.
  // Missing historical baselines never justify replacing existing workspace data.
  for(const field of [...owned.filter(f=>f!=='Feedback'&&f!=='Approval'),'Notes']){
   if(ac[field]===undefined||ec[field]===undefined)continue;
   const a=value(admin[ar]?.[ac[field]]),e=value(editor[er]?.[ec[field]]),old=previous[id]?.[field];
   const manual=previous[id]?.['manual:'+field]===true||(!isNew&&(old===undefined?!same(a,e):!same(e,old)));
   const resolved=manual?e:a;
   if(manual){saved['manual:'+field]=true;add(adminChanges,admin,ar,ac[field],e);}
   else add(editorChanges,editor,er,ec[field],resolved);
   saved[field]=resolved;
  }
  if(ac['Changes applied']!==undefined&&ec['Changes applied']!==undefined){
   const checked=editor[er]?.[ec['Changes applied']];
   add(adminChanges,admin,ar,ac['Changes applied'],checked===true||checked==='TRUE');
  }
  if(ac['Additional files']!==undefined&&ec['Additional files']!==undefined){
   const field='Additional files',a=String(admin[ar]?.[ac[field]]||''),e=String(editor[er]?.[ec[field]]||''),old=previous[id]?.[field];
   const oldLines=String(old??'').split('\n').map(x=>x.trim()).filter(Boolean),current=new Set(e.split('\n').map(x=>x.trim()).filter(Boolean));
   const manual=previous[id]?.['manual:'+field]===true||(!isNew&&old!==undefined&&oldLines.some(line=>!current.has(line)));
   const resolved=manual?e:mergeAdditionalLinks(a,e);
   if(manual)saved['manual:'+field]=true;
   add(editorChanges,editor,er,ec[field],resolved);add(adminChanges,admin,ar,ac[field],resolved);saved[field]=resolved;
  }
  // A deletion relative to the saved baseline is an edit, not missing data.
  for(const field of ['Feedback','Approval']){
   const after=ac['Approval after changes']===undefined?'':value(admin[ar]?.[ac['Approval after changes']]);
   const source=field==='Approval'&&after!==''&&after!=='Pending'?'Approval after changes':field;
   const a=value(admin[ar]?.[ac[source]]),e=value(editor[er]?.[ec[field]]),old=previous[id]?.[field];
   let resolved:Cell;
   const deleted=previous[id]?.['manual:'+field]===true||(!isNew&&old!==undefined&&old!==''&&e==='');
   if(deleted){saved['manual:'+field]=true;resolved=e;}
   else if(same(a,e))resolved=a;
   else if(old!==undefined&&same(a,old))resolved=e;
   else if(old!==undefined&&same(e,old))resolved=a;
   else if(old===undefined&&a==='')resolved=e;
   else if(old===undefined&&e==='')resolved=a;
   else if(source==='Approval after changes'&&old===undefined&&same(e,admin[ar]?.[ac['Approval']]))resolved=a;
   else if(old!==undefined&&same(e,old))resolved=a;
   else if(old!==undefined&&same(a,old))resolved=e;
   else {conflicts++;if(old!==undefined)saved[field]=old;continue;}
   add(adminChanges,admin,ar,ac[source],resolved);add(editorChanges,editor,er,ec[field],resolved);saved[field]=resolved;
  }
  for(const field of shared){const a=value(admin[ar]?.[ac[field]]),e=value(editor[er]?.[ec[field]]);const old=previous[id]?.[field];let resolved:Cell;
   if(previous[id]?.['manual:'+field]===true||(!isNew&&old!==undefined&&old!==''&&e==='')){saved['manual:'+field]=true;resolved=e;}
   else if(old===undefined)resolved=e!==''?e:a;
   else if(!same(e,old)){resolved=e;if(!same(a,old)&&!same(a,e))conflicts++;}
   else resolved=a;
   add(adminChanges,admin,ar,ac[field],resolved);add(editorChanges,editor,er,ec[field],resolved);saved[field]=resolved;
  }
  if(ac['Ready for review']!==undefined&&ec['Ready for review']!==undefined){
   const checked=editor[er]?.[ec['Ready for review']];
   add(adminChanges,admin,ar,ac['Ready for review'],checked===true||checked==='TRUE');
  }
  snapshot[id]=saved;
 }
 return {adminChanges,editorChanges,snapshot,conflicts,ads:ai.size};
}

// Keep source row positions so returned master-sheet writes remain correct.
export function planAssignedSync(admin:unknown[][],editor:unknown[][],previous:Snapshot,capacity:number,editorId:string){
 const col=(admin[0]||[]).indexOf('Editor ID');if(col<0)throw Error('Missing Editor ID column');
 const scoped=admin.map((r,i)=>i===0||String(r[col]||'')===editorId?r:[]);
 const result=planSync(scoped,editor,previous,capacity);
 const idCol=(editor[0]||[]).indexOf('Ad ID'),statusCol=(editor[0]||[]).indexOf('Production status');
 const adminIdCol=(admin[0]||[]).indexOf('Ad ID');
 const assigned=new Set(scoped.slice(1).map(r=>String(r[adminIdCol]||'')));
 for(let i=1;i<editor.length;i++){const id=String(editor[i]?.[idCol]||'');if(!id||assigned.has(id))continue;
  if(!/^MEL-\d+$/.test(id))throw Error('Unexpected editor row');
  for(let c=0;c<(editor[0]||[]).length;c++)if(c!==statusCol&&String(editor[i]?.[c]??'')!=='')result.editorChanges.push({row:i+1,col:c,value:''});
  delete result.snapshot[id];
 }
 return result;
}
