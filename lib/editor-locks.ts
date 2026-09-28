import {randomUUID} from 'node:crypto';
import {mutate,readState} from './store';
type Lock={token?:string;until?:number};
const delay=()=>new Promise(resolve=>setTimeout(resolve,300+Math.random()*400));
export async function withEditorLocks<T>(keys:string[],fn:()=>Promise<T>,deadline=Date.now()+180000):Promise<T>{
 const token=randomUUID(),held:string[]=[];
 try{
  // Drain old deployments that still hold the former global lock.
  while(((await readState<Lock>('editor-assignment-lock',{})).value.until||0)>Date.now()){
   if(Date.now()>deadline)throw Error('Editor sync is taking longer than expected. Please retry.');await delay();
  }
  // Stable ordering prevents two reassignments from deadlocking.
  for(const key of [...new Set(keys)].sort()){
   const name='editor-lock-'+key;
   for(;;){
    const acquired=await mutate<Lock,boolean>(name,{},s=>{if((s.until||0)>Date.now())return false;s.token=token;s.until=Date.now()+360000;return true;});
    if(acquired){held.push(name);break;}
    if(Date.now()>deadline)throw Error('Editor sync is taking longer than expected. Please retry.');await delay();
   }
  }
  return await fn();
 }finally{
  const results=await Promise.allSettled(held.map(name=>mutate<Lock,void>(name,{},s=>{if(s.token===token){s.token=undefined;s.until=undefined;}})));
  if(results.some(r=>r.status==='rejected'))console.error('Could not release an editor lock; it will expire automatically.');
 }
}
