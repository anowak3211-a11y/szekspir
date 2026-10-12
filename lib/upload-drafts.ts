'use client';
import type {Job} from './jobs';
export type UploadDraft={id:string;name:string;market:'uk'|'pl';settings:Partial<Job>;startedAt:number;sourceUrl?:string;audioUrl?:string;duration?:number;video:boolean;fileName?:string;sourceHash?:string};
const database='szekspir-upload-recovery-v1';
// If browser storage is unavailable, retain the exact files in this tab until
// the server confirms the upload. This fallback cannot survive a tab reload.
const activeFiles=new Map<string,{file?:File;audio?:File}>();
const temporary=new Map<string,{draft:UploadDraft;file?:File;audio?:File}>();
export function uploadNeedsOpenTab(id?:string){return id?temporary.has(id):temporary.size>0;}
function retain(items:{draft:UploadDraft;file?:File;audio?:File}[]){for(const item of items){const prior=temporary.get(item.draft.id);temporary.set(item.draft.id,{...prior,...item,draft:structuredClone(item.draft),file:item.file||prior?.file,audio:item.audio||prior?.audio});}changed();}

function changed(){try{if(typeof window!=='undefined'){window.dispatchEvent(new Event('szekspir-upload-recovery'));localStorage.setItem('szekspir-recovery-change',String(Date.now()));}}catch{}}
async function transaction<T>(mode:IDBTransactionMode,work:(tx:IDBTransaction,result:(value:T)=>void)=>void):Promise<T>{
 return new Promise((resolve,reject)=>{
  let db:IDBDatabase|undefined,tx:IDBTransaction|undefined,value:T,finished=false;
  const finish=(error?:unknown)=>{if(finished)return;finished=true;clearTimeout(timer);db?.close();if(error)reject(Error('Could not access the local upload backup. Check browser storage space/settings; your original file is unchanged.'));else resolve(value);};
  const timer=setTimeout(()=>{tx?.abort();finish(Error('Storage timeout'));},30000);
  try{
   const open=indexedDB.open(database,1);
   open.onupgradeneeded=()=>{open.result.createObjectStore('drafts',{keyPath:'id'});open.result.createObjectStore('media');};
   open.onerror=()=>finish(open.error);open.onblocked=()=>finish(Error('Storage blocked'));
   open.onsuccess=()=>{db=open.result;if(finished){db.close();return;}try{tx=db.transaction(['drafts','media'],mode);tx.oncomplete=()=>finish();tx.onerror=()=>finish(tx?.error);tx.onabort=()=>finish(Error('Storage aborted'));work(tx,result=>{value=result;});}catch(e){tx?.abort();finish(e);}};
  }catch(e){finish(e);}
 });
}
export async function saveUploadDrafts(items:{draft:UploadDraft;file?:File}[]){
 for(const {draft,file} of items){if(file)activeFiles.set(draft.id,{...activeFiles.get(draft.id),file});}
 const durable=items.filter(item=>!temporary.has(item.draft.id));
 retain(items.filter(item=>temporary.has(item.draft.id)));
 if(!durable.length)return;
 return transaction<void>('readwrite',(tx,done)=>{for(const {draft,file} of durable){tx.objectStore('drafts').put(draft);if(file)tx.objectStore('media').put(file,draft.id+':file');}done();}).then(changed).catch(()=>retain(durable.map(item=>({...activeFiles.get(item.draft.id),...item,file:item.file||activeFiles.get(item.draft.id)?.file}))));}
export function saveUploadDraft(draft:UploadDraft,file?:File){return saveUploadDrafts([{draft,file}]);}
export async function listUploadDrafts(){const saved=await transaction<UploadDraft[]>('readonly',(tx,done)=>{const r=tx.objectStore('drafts').getAll();r.onsuccess=()=>done(r.result);}).catch(error=>{if(!temporary.size)throw error;return [];});return [...new Map([...saved,...Array.from(temporary.values(),item=>item.draft)].map(d=>[d.id,d])).values()];}
export function readUploadDraft(id:string){if(temporary.has(id))return Promise.resolve(structuredClone(temporary.get(id)!.draft));return transaction<UploadDraft|undefined>('readonly',(tx,done)=>{const r=tx.objectStore('drafts').get(id);r.onsuccess=()=>done(r.result);});}
export function readUploadMedia(id:string,kind:'file'|'audio'){if(temporary.has(id))return Promise.resolve(temporary.get(id)![kind]);return transaction<File|undefined>('readonly',(tx,done)=>{const r=tx.objectStore('media').get(id+':'+kind);r.onsuccess=()=>done(r.result);});}
export async function saveUploadAudio(draft:UploadDraft,audio:File){activeFiles.set(draft.id,{...activeFiles.get(draft.id),audio});if(temporary.has(draft.id)){retain([{draft,audio}]);return Promise.resolve();}const file=activeFiles.get(draft.id)?.file||await readUploadMedia(draft.id,'file');return transaction<void>('readwrite',(tx,done)=>{tx.objectStore('drafts').put(draft);tx.objectStore('media').put(audio,draft.id+':audio');done();}).catch(()=>retain([{draft,file,audio}]));}
export async function removeUploadDraft(id:string){const inMemory=temporary.has(id);return transaction<void>('readwrite',(tx,done)=>{tx.objectStore('drafts').delete(id);tx.objectStore('media').delete(id+':file');tx.objectStore('media').delete(id+':audio');done();}).catch(error=>{if(!inMemory)throw error;}).then(()=>{temporary.delete(id);activeFiles.delete(id);changed();});}
