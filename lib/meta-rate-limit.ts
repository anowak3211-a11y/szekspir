import {randomUUID} from 'node:crypto';
import {mutate,readState} from './store';
const KEY='meta-api-shared-budget';
// Application throughput guards, not advertised Meta quotas. Provider headers and
// cooldowns remain authoritative; limited/unknown access uses one request at a time.
const HOURLY_CAP=6000,FIVE_MINUTE_POINT_CAP=1200,MIN_SPACING_MS=1000,MAX_IN_FLIGHT=5;
export type WaitReason='busy'|'spacing'|'local_budget'|'provider_cooldown';
export type MetaDiagnostic={at:number;operation:string;method:string;status:number;code:number;subcode:number;durationMs:number;requestId?:string};
type Budget={calls:number[];points?:{at:number;cost:number}[];accessTier?:'limited'|'full';leases?:Record<string,number>;lease?:string;leaseUntil?:number;next?:number;cooldown?:number;strikes?:number;usage?:number;localWaits?:number;signals?:ReturnType<typeof metaUsage>;diagnostics?:MetaDiagnostic[]};
const initial=():Budget=>({calls:[]});
function limits(tier?:Budget['accessTier']){return tier==='full'?{points:FIVE_MINUTE_POINT_CAP,spacing:MIN_SPACING_MS,concurrency:MAX_IN_FLIGHT}:{points:45,spacing:3000,concurrency:1};}
export class MetaBudgetWait extends Error{
 constructor(public retryAfterSeconds:number,public reason:WaitReason='busy'){super(reason==='provider_cooldown'?`Meta requested a pause. Retry in ${retryAfterSeconds} seconds.`:`Upload queue is waiting. Retry in ${retryAfterSeconds} seconds.`);this.name='MetaBudgetWait';}
}
// Shared leases enforce the confirmed access tier. Lease expiry is crash recovery, not a retry delay.
export async function withMetaBudget<T>(fn:()=>Promise<T>,cost=1){
 if(cost!==1&&cost!==3)throw Error('Invalid Meta request cost.');
 const token=randomUUID();let acquired=false;
 for(let attempt=0;attempt<2;attempt++){
  const decision=await mutate<Budget,{seconds:number;reason:WaitReason}>(KEY,initial(),s=>{
   const now=Date.now(),guard=limits(s.accessTier);s.calls=s.calls.filter(t=>t>now-3600000);
   s.points=(s.points||s.calls.map(at=>({at,cost:3}))).filter(p=>p.at>now-300000);
   const hourly=s.calls.length>=HOURLY_CAP?s.calls[0]+3600000:0;
   if((s.cooldown||0)>now)return {seconds:Math.ceil((s.cooldown!-now)/1000),reason:'provider_cooldown'};
   if(hourly>now)return {seconds:Math.ceil((hourly-now)/1000),reason:'local_budget'};
   // Read=1, write=3. Limited/unknown access keeps a conservative five-minute budget.
   // This local guard never overrides provider cooldowns or usage-header backoff.
   let excess=s.points.reduce((n,p)=>n+p.cost,0)+cost-guard.points;
   if(excess>0){for(const point of [...s.points].sort((a,b)=>a.at-b.at)){excess-=point.cost;if(excess<=0)return {seconds:Math.max(1,Math.ceil((point.at+300000-now)/1000)),reason:'local_budget'};}}
   s.leases=Object.fromEntries(Object.entries(s.leases||{}).filter(([,until])=>until>now));
   // Drain an in-flight request from the previous single-lease implementation.
   if(s.lease&&(s.leaseUntil||0)>now)s.leases[s.lease]=s.leaseUntil!;
   if(Object.keys(s.leases).length>=guard.concurrency){s.localWaits=(s.localWaits||0)+1;return {seconds:2,reason:'busy'};}
   if((s.next||0)>now)return {seconds:Math.ceil((s.next!-now)/1000),reason:'spacing'};
   s.leases[token]=now+210000;s.next=now+guard.spacing;s.calls.push(now);s.points.push({at:now,cost});return {seconds:0,reason:'spacing'};
  });
  if(!decision.seconds){acquired=true;break;}
  if(decision.reason!=='spacing'||attempt===1)throw new MetaBudgetWait(decision.seconds,decision.reason);
  await new Promise(resolve=>setTimeout(resolve,decision.seconds*1000+25));
 }
 if(!acquired)throw new MetaBudgetWait(2);
 try{return await fn();}finally{await mutate<Budget,void>(KEY,initial(),s=>{if(s.leases)delete s.leases[token];if(s.lease===token){s.lease=undefined;s.leaseUntil=undefined;}});}
}
// Do not spend the last available read points revalidating a write that cannot
// yet run. This is only an optimistic preflight; every actual request still
// acquires its own lease and obeys the unchanged provider/local limits.
export async function assertMetaStageBudget(cost:number){
 if(!Number.isInteger(cost)||cost<1||cost>45)throw Error('Invalid Meta stage cost.');
 const s=(await readState<Budget>(KEY,initial())).value,now=Date.now();
 if((s.cooldown||0)>now)throw new MetaBudgetWait(Math.ceil((s.cooldown!-now)/1000),'provider_cooldown');
 const points=(s.points||s.calls.map(at=>({at,cost:3}))).filter(p=>p.at>now-300000).sort((a,b)=>a.at-b.at);
 let excess=points.reduce((sum,p)=>sum+p.cost,0)+cost-limits(s.accessTier).points;
 if(excess>0)for(const point of points){excess-=point.cost;if(excess<=0)throw new MetaBudgetWait(Math.max(1,Math.ceil((point.at+300000-now)/1000)),'local_budget');}
}
export function isMetaRateLimit(code:number){return [4,17,32,613,429,1675004].includes(code)||(code>=80000&&code<80100);}
export function metaUsage(headers:Headers){
 let usage=0,seconds=0;const buckets:{header:string;type?:string;usage:number;regainSeconds:number;tier?:string}[]=[];
 for(const header of ['x-app-usage','x-ad-account-usage','x-business-use-case-usage','x-fb-ads-insights-throttle']){
  try{
   const raw=headers.get(header);if(!raw)continue;
   const visit=(v:unknown)=>{if(!v||typeof v!=='object')return;const fields=v as Record<string,unknown>;
    const pct=Math.max(0,...['call_count','total_cputime','total_time','acc_id_util_pct','app_id_util_pct'].map(k=>typeof fields[k]==='number'&&Number.isFinite(fields[k])?fields[k] as number:0));
    const regain=Math.max(0,typeof fields.estimated_time_to_regain_access==='number'?fields.estimated_time_to_regain_access*60:0,typeof fields.reset_time_duration==='number'?fields.reset_time_duration:0);
    if(pct||regain||['call_count','acc_id_util_pct','app_id_util_pct','ads_api_access_tier'].some(k=>Object.hasOwn(fields,k))){buckets.push({header,type:typeof fields.type==='string'?fields.type.slice(0,60):undefined,usage:pct,regainSeconds:Number.isFinite(regain)?regain:0,tier:typeof fields.ads_api_access_tier==='string'?fields.ads_api_access_tier.slice(0,40):undefined});usage=Math.max(usage,pct);seconds=Math.max(seconds,Number.isFinite(regain)?regain:0);}
    for(const n of Object.values(fields))if(n&&typeof n==='object')visit(n);
   };visit(JSON.parse(raw));
  }catch{/* Never persist raw headers. */}
 }
 const raw=headers.get('retry-after'),number=Number(raw),date=raw?Date.parse(raw):NaN;
 const retry=raw?(Number.isFinite(number)?number:Number.isFinite(date)?Math.ceil((date-Date.now())/1000):0):0;
 return {usage,seconds:Math.max(seconds,retry>0?retry:0),buckets};
}
export async function recordMetaUsage(headers:Headers,rateLimited=false,diagnostic?:Omit<MetaDiagnostic,'at'|'requestId'>){
 const signal=metaUsage(headers);
 return mutate<Budget,number>(KEY,initial(),s=>{
  s.usage=signal.usage;s.signals=signal;
  const tiers=signal.buckets.map(b=>b.tier);if(tiers.some(t=>t==='development_access'||t==='limited_access'))s.accessTier='limited';else if(tiers.some(t=>t==='standard_access'||t==='full_access'))s.accessTier='full';
  if(diagnostic){const id=headers.get('x-fb-request-id');s.diagnostics=[...(s.diagnostics||[]),{...diagnostic,at:Date.now(),operation:diagnostic.operation.replace(/\d+/g,':id').slice(0,100),requestId:id&&/^[\w-]{1,100}$/.test(id)?id:undefined}].slice(-100);}
  // reset_time_duration may be supplied while usage is low; it is not a pause by itself.
  if(rateLimited||signal.usage>=80){
   s.strikes=rateLimited?(s.strikes||0)+1:s.strikes||0;
   const seconds=Math.max(signal.seconds,rateLimited?Math.min(3600,300*2**Math.min(4,(s.strikes||1)-1)):300);
   s.cooldown=Math.max(s.cooldown||0,Date.now()+seconds*1000);
  }else if(headers.has('retry-after'))s.cooldown=Math.max(s.cooldown||0,Date.now()+signal.seconds*1000);
  else if((s.cooldown||0)<=Date.now())s.strikes=0;
  return Math.max(0,Math.ceil(((s.cooldown||0)-Date.now())/1000));
 });
}
export async function metaBudgetStatus(){const s=(await readState<Budget>(KEY,initial())).value,now=Date.now(),guard=limits(s.accessTier);return {callsInRollingHour:s.calls.filter(t=>t>now-3600000).length,localHourlyCap:HOURLY_CAP,minSpacingSeconds:guard.spacing/1000,accessTier:s.accessTier||'unknown',pointsInFiveMinutes:(s.points||[]).filter(p=>p.at>now-300000).reduce((n,p)=>n+p.cost,0),localFiveMinutePointCap:guard.points,maxConcurrentRequests:guard.concurrency,inFlightRequests:Object.values(s.leases||{}).filter(until=>until>now).length+((s.leaseUntil||0)>now&&!s.leases?.[s.lease||'']?1:0),busy:Object.values(s.leases||{}).filter(until=>until>now).length>=guard.concurrency||(s.leaseUntil||0)>now,cooldownUntil:(s.cooldown||0)>now?s.cooldown:null,usage:s.usage||0,signals:s.signals,localWaits:s.localWaits||0,diagnostics:s.diagnostics||[]};}
