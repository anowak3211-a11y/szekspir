import {accountCacheKey} from './account-context';
import {createHash,randomUUID} from 'node:crypto';
import {mutate,readState} from './store';
import {MetaBudgetWait} from './meta-rate-limit';
type Entry<T>={value?:T;expires?:number;lease?:string;leaseUntil?:number};
const inFlight=new Map<string,Promise<{value:unknown;cached:boolean}>>();
export function metaCacheKey(scope:string,operation:string){return 'meta-read-v1-'+createHash('sha256').update(scope+'\0'+operation).digest('hex');}
// Encrypted durable cache + CAS lease coordinate independent Vercel workers.
export async function cachedMetaRead<T>(key:string,ttlMs:number,load:()=>Promise<T>,staleMs=0):Promise<{value:T;cached:boolean;stale?:boolean}>{
 const flightKey=accountCacheKey(key)+(staleMs?':listing':':fresh');
 const running=inFlight.get(flightKey);if(running)return running as Promise<{value:T;cached:boolean}>;
 const task=(async()=>{
  const saved=(await readState<Entry<T>>(key,{})).value;
  if(saved.value!==undefined&&(saved.expires||0)>Date.now())return {value:saved.value,cached:true};
  const staleAvailable=staleMs>0&&saved.value!==undefined&&(saved.expires||0)+staleMs>Date.now();
  const token=randomUUID(),decision=await mutate<Entry<T>,{value?:T;cached:boolean;stale?:boolean}>(key,{},s=>{
   if(s.value!==undefined&&(s.expires||0)>Date.now())return {value:s.value,cached:true};
   if((s.leaseUntil||0)>Date.now()){if(staleAvailable)return {value:saved.value,cached:true,stale:true};throw new MetaBudgetWait(2,'busy');}
   s.lease=token;s.leaseUntil=Date.now()+180000;return {cached:false};
  });
  if(decision.cached)return {value:decision.value as T,cached:true,...(decision.stale?{stale:true}:{})};
  try{const value=await load();await mutate<Entry<T>,void>(key,{},s=>{if(s.lease!==token)throw new MetaBudgetWait(2,'busy');s.value=value;s.expires=Date.now()+ttlMs;s.lease=undefined;s.leaseUntil=undefined;});return {value,cached:false};}
  catch(e){await mutate<Entry<T>,void>(key,{},s=>{if(s.lease===token){s.lease=undefined;s.leaseUntil=undefined;}});if(staleAvailable&&(e instanceof MetaBudgetWait||!!(e as {rateLimited?:boolean})?.rateLimited))return {value:saved.value as T,cached:true,stale:true};throw e;}
 })();inFlight.set(flightKey,task);
 try{return await task;}finally{if(inFlight.get(flightKey)===task)inFlight.delete(flightKey);}
}
