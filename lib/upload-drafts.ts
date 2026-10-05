'use client';
import type {Job} from './jobs';
export type UploadDraft={id:string;name:string;market:'uk'|'pl';settings:Partial<Job>;startedAt:number;sourceUrl?:string;audioUrl?:string;duration?:number;video:boolean;fileName?:string;sourceHash?:string};
const database='szekspir-upload-recovery-v1';
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
export function saveUploadDrafts(items:{draft:UploadDraft;file?:File}[]){return transaction<void>('readwrite',(tx,done)=>{for(const {draft,file} of items){tx.objectStore('drafts').put(draft);if(file)tx.objectStore('media').put(file,draft.id+':file');}done();}).then(changed);}
export function saveUploadDraft(draft:UploadDraft,file?:File){return saveUploadDrafts([{draft,file}]);}
export function listUploadDrafts(){return transaction<UploadDraft[]>('readonly',(tx,done)=>{const r=tx.objectStore('drafts').getAll();r.onsuccess=()=>done(r.result);});}
export function readUploadDraft(id:string){return transaction<UploadDraft|undefined>('readonly',(tx,done)=>{const r=tx.objectStore('drafts').get(id);r.onsuccess=()=>done(r.result);});}
export function readUploadMedia(id:string,kind:'file'|'audio'){return transaction<File|undefined>('readonly',(tx,done)=>{const r=tx.objectStore('media').get(id+':'+kind);r.onsuccess=()=>done(r.result);});}
export function saveUploadAudio(draft:UploadDraft,audio:File){return transaction<void>('readwrite',(tx,done)=>{tx.objectStore('drafts').put(draft);tx.objectStore('media').put(audio,draft.id+':audio');done();});}
export function removeUploadDraft(id:string){return transaction<void>('readwrite',(tx,done)=>{tx.objectStore('drafts').delete(id);tx.objectStore('media').delete(id+':file');tx.objectStore('media').delete(id+':audio');done();}).then(changed);}
