'use client';
import {fingerprintFile} from './file-fingerprint';
import type {DuplicateFile} from './file-dedup';
export type SelectedFileCheck={status:'checking';percent:number}|{status:'ready';hash:string;duplicate?:DuplicateFile}|{status:'error';message:string};
export async function checkSelectedFile(file:Blob,signal:AbortSignal,progress:(percent:number)=>void=()=>{}){
 const hash=await fingerprintFile(file,progress,signal);
 signal.throwIfAborted();
 const response=await fetch('/api/uploads/check',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(60000)]),body:JSON.stringify({action:'lookup',hash})});
 const result=await response.json();
 signal.throwIfAborted();
 if(!response.ok||result.ok!==true)throw Error(result.error||'Could not check this file. Try again.');
 return {status:'ready',hash,duplicate:result.duplicate} as SelectedFileCheck;
}
