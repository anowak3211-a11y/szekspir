'use client';
import {workspaceSessionStorage,browserWorkspaceKey} from './browser-workspace';
import type {VideoCopyState} from './meta-video-copy-model';
import type {ImageCopyState} from './meta-image-copy-model';
import type {UploadDraft} from './meta-uploader-model';

export type WorkspaceCreative=UploadDraft&{copy?:ImageCopyState|VideoCopyState;localId:string;file?:File;localPreview?:string;progress?:number;fileError?:string};
export type WorkspaceSelection={accountId:string;campaignId:string;adSetId:string;pageId:string;url:string;cta:'SHOP_NOW'|'LEARN_MORE'};
export type WorkspaceBackup={version:1;id:string;batchId:string;batchName:string;selection:WorkspaceSelection;drafts:WorkspaceCreative[];chosen:string[];updated:number};
const database='szekspir-meta-workspace-v1';
const allowed=['key','name','accountId','campaignId','adSetId','pageId','url','cta','primaryTexts','headline','description','headlines','descriptions','urlTags','enhancements','media'] as const;

// Only creative data is persisted. Connection credentials, preferences, React
// state and blob preview URLs must never enter a workspace backup.
export function workspaceCreative(draft:WorkspaceCreative,resolved:UploadDraft):WorkspaceCreative{
 const result:WorkspaceCreative={localId:draft.localId};
 const source={...resolved,...draft};
 for(const key of allowed)if(source[key]!==undefined)Object.assign(result,{[key]:structuredClone(source[key])});
 if(draft.file&&!(draft.media&&draft.media.kind!=='library'&&draft.media.kind!=='carousel'&&draft.media.url))result.file=draft.file;
 if(draft.fileError)result.fileError=draft.fileError;
 if(draft.copy)result.copy=structuredClone(draft.copy);
 return result;
}
export function workspaceTabId(){
 const key='szekspir-meta-workspace-tab';
 const saved=workspaceSessionStorage.getItem(key);if(saved)return saved;
 const id=crypto.randomUUID();workspaceSessionStorage.setItem(key,id);return id;
}
function transaction<T>(mode:IDBTransactionMode,work:(store:IDBObjectStore,done:(value:T)=>void)=>void):Promise<T>{
 return new Promise((resolve,reject)=>{
  let db:IDBDatabase|undefined,tx:IDBTransaction|undefined,value:T,finished=false;
  const finish=(error?:unknown)=>{if(finished)return;finished=true;clearTimeout(timer);db?.close();if(error)reject(Error('Local creative backup is unavailable. Keep this tab open or save a reviewed batch.'));else resolve(value);};
  const timer=setTimeout(()=>{tx?.abort();finish(Error('Storage timeout'));},15000);
  try{
   const open=indexedDB.open(browserWorkspaceKey(database),1);
   open.onupgradeneeded=()=>open.result.createObjectStore('workspaces',{keyPath:'id'});
   open.onerror=()=>finish(open.error);open.onblocked=()=>finish(Error('Storage blocked'));
   open.onsuccess=()=>{db=open.result;if(finished){db.close();return;}try{tx=db.transaction('workspaces',mode);tx.oncomplete=()=>finish();tx.onerror=()=>finish(tx?.error);tx.onabort=()=>finish(Error('Storage aborted'));work(tx.objectStore('workspaces'),v=>{value=v;});}catch(e){tx?.abort();finish(e);}};
  }catch(e){finish(e);}
 });
}
export function saveWorkspace(backup:WorkspaceBackup){return transaction<void>('readwrite',(store,done)=>{store.put(backup);done();});}
export function readWorkspace(id:string){return transaction<WorkspaceBackup|undefined>('readonly',(store,done)=>{const request=store.get(id);request.onsuccess=()=>{const value=request.result;done(value?.version===1&&Array.isArray(value.drafts)?value:undefined);};});}
export function removeWorkspace(id:string){return transaction<void>('readwrite',(store,done)=>{store.delete(id);done();});}
