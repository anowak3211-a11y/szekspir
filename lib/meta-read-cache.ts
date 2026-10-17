import {accountCacheKey} from './account-context';
import {createHash,randomUUID} from 'node:crypto';
import {mutate,readState} from './store';
import {MetaBudgetWait} from './meta-rate-limit';
type Entry<T>={value?:T;expires?:number;lease?:string;leaseUntil?:number};
const inFlight=new Map<string,Promise<{value:unknown;cached:boolean}>>();
export function metaCacheKey(scope:string,operation:string){return 'meta-read-v1-'+createHash('sha256').update(scope+'\0'+operation).digest('hex');}
// Encrypted durable cache + CAS lease coordinate independent Vercel workers.
export async function cachedMetaRead<T>(key:string,ttlMs:number,load:()=>Promise<T>):Promise<{value:T;cached:boolean}>{
 const running=inFlight.get(accountCacheKey(key));if(running)return running as Promise<{value:T;cached:boolean}>;
 const task=(async()=>{
  const saved=(await readState<Entry<T>>(key,{})).value;
  if(saved.value!==undefined&&(saved.expires||0)>Date.now())return {value:saved.value,cached:true};
  const token=randomUUID(),decision=await mutate<Entry<T>,{value?:T;cached:boolean}>(key,{},s=>{
   if(s.value!==undefined&&(s.expires||0)>Date.now())return {value:s.value,cached:true};
   if((s.leaseUntil||0)>Date.now())throw new MetaBudgetWait(2,'busy');
   s.lease=token;s.leaseUntil=Date.now()+180000;return {cached:false};
  });
  if(decision.cached)return {value:decision.value as T,cached:true};
  try{const value=await load();await mutate<Entry<T>,void>(key,{},s=>{if(s.lease!==token)throw new MetaBudgetWait(2,'busy');s.value=value;s.expires=Date.now()+ttlMs;s.lease=undefined;s.leaseUntil=undefined;});return {value,cached:false};}
  catch(e){await mutate<Entry<T>,void>(key,{},s=>{if(s.lease===token){s.lease=undefined;s.leaseUntil=undefined;}});throw e;}
 })();inFlight.set(accountCacheKey(key),task);
 try{return await task;}finally{if(inFlight.get(accountCacheKey(key))===task)inFlight.delete(accountCacheKey(key));}
}
