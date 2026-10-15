import {randomUUID} from 'node:crypto';
import {mutate,readState} from './store';
type Lock={token?:string;until?:number};
export class EditorSyncBusyError extends Error{constructor(){super('Editor sync is busy. Retrying automatically.');this.name='EditorSyncBusyError';}}
const delay=(attempt:number)=>new Promise(resolve=>setTimeout(resolve,Math.min(10000,1500*2**Math.min(attempt,3))+Math.random()*500));
export async function withEditorLocks<T>(keys:string[],fn:()=>Promise<T>,deadline=Date.now()+180000):Promise<T>{
 const token=randomUUID(),held:string[]=[];
 try{
  // Drain old deployments that still hold the former global lock.
  let waits=0;
  while(((await readState<Lock>('editor-assignment-lock',{})).value.until||0)>Date.now()){
   if(Date.now()>deadline)throw new EditorSyncBusyError();await delay(waits++);
  }
  // Stable ordering prevents two reassignments from deadlocking.
  for(const key of [...new Set(keys)].sort()){
   const name='editor-lock-'+key;
   for(;;){
    // Read occupied leases without rewriting them. Recheck inside CAS for races.
    if(((await readState<Lock>(name,{})).value.until||0)<=Date.now()){
     try{await mutate<Lock,void>(name,{},s=>{if((s.until||0)>Date.now())throw new EditorSyncBusyError();s.token=token;s.until=Date.now()+360000;});held.push(name);break;}
     catch(error){if(!(error instanceof EditorSyncBusyError))throw error;}
    }
    if(Date.now()>deadline)throw new EditorSyncBusyError();await delay(waits++);
   }
  }
  return await fn();
 }finally{
  const results=await Promise.allSettled(held.map(name=>mutate<Lock,void>(name,{},s=>{if(s.token===token){s.token=undefined;s.until=undefined;}})));
  if(results.some(r=>r.status==='rejected'))console.error('Could not release an editor lock; it will expire automatically.');
 }
}
