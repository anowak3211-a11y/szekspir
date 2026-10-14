import {randomUUID} from 'node:crypto';
import {mutate} from './store';
const KEY='meta-api-shared-budget';
type Budget={calls:number[];lease?:string;leaseUntil?:number;next?:number;cooldown?:number;strikes?:number;usage?:number};
const initial=():Budget=>({calls:[]});
export class MetaBudgetWait extends Error{
 constructor(public retryAfterSeconds:number){super(`Meta request queue is resting. Retry in ${retryAfterSeconds} seconds.`);}
}
// Shared across processes, batches, discovery, Graph and raw media requests.
export async function withMetaBudget<T>(fn:()=>Promise<T>){
 const token=randomUUID();let acquired=false;
 for(let attempt=0;attempt<2;attempt++){
  const wait=await mutate<Budget,number>(KEY,initial(),s=>{
   const now=Date.now();s.calls=s.calls.filter(t=>t>now-3600000);
   const hourly=s.calls.length>=240?s.calls[0]+3600000:0;
   const until=Math.max(s.cooldown||0,hourly,(s.leaseUntil||0)>now?s.leaseUntil!:0,s.next||0);
   if(until>now)return Math.ceil((until-now)/1000);
   s.lease=token;s.leaseUntil=now+210000;s.next=now+5000;s.calls.push(now);return 0;
  });
  if(!wait){acquired=true;break;}
  // Small spacing waits are bounded; long cooldowns are rescheduled by the queue.
  if(wait>5||attempt===1)throw new MetaBudgetWait(wait);
  await new Promise(resolve=>setTimeout(resolve,wait*1000+25));
 }
 if(!acquired)throw new MetaBudgetWait(5);
 try{return await fn();}finally{await mutate<Budget,void>(KEY,initial(),s=>{if(s.lease===token){s.lease=undefined;s.leaseUntil=undefined;}});}
}
export function isMetaRateLimit(code:number){return [4,17,32,613,429,1675004].includes(code)||(code>=80000&&code<80100);}
export function metaUsage(headers:Headers){
 let usage=0,minutes=0;
 for(const name of ['x-app-usage','x-ad-account-usage','x-business-use-case-usage']){
  try{
   const raw=headers.get(name);if(!raw)continue;
   const visit=(v:unknown)=>{if(!v||typeof v!=='object')return;for(const [k,n] of Object.entries(v)){if(['call_count','total_cputime','total_time','acc_id_util_pct'].includes(k)&&typeof n==='number'&&Number.isFinite(n))usage=Math.max(usage,n);if(k==='estimated_time_to_regain_access'&&typeof n==='number'&&Number.isFinite(n))minutes=Math.max(minutes,n);else if(n&&typeof n==='object')visit(n);}};
   visit(JSON.parse(raw));
  }catch{/* Invalid headers are never shown or persisted raw. */}
 }
 const retry=Number(headers.get('retry-after'));
 return {usage,seconds:Math.max(minutes*60,Number.isFinite(retry)&&retry>0?retry:0)};
}
export async function recordMetaUsage(headers:Headers,rateLimited=false){
 const signal=metaUsage(headers);
 return mutate<Budget,number>(KEY,initial(),s=>{
  s.usage=signal.usage;
  if(rateLimited||signal.usage>=80||signal.seconds>0){
   s.strikes=rateLimited?(s.strikes||0)+1:s.strikes||0;
   const seconds=Math.max(signal.seconds,rateLimited?Math.min(3600,300*2**Math.min(4,(s.strikes||1)-1)):signal.usage>=80?300:0);
   s.cooldown=Math.max(s.cooldown||0,Date.now()+seconds*1000);
  }else s.strikes=0;
  return Math.max(0,Math.ceil(((s.cooldown||0)-Date.now())/1000));
 });
}
