import {graph,graphList,cachedMetaResource} from './meta-client';
import {accountNumber} from './meta-uploader-preferences';
export type InsightDay={date:string;spend:number;purchases:number;cpa:number|null};
export type Analytics={currency:string;days:InsightDay[];spend:number;purchases:number;cpa:number|null;active:number;fetchedAt:number};
export function purchaseCount(actions:unknown){if(!Array.isArray(actions))return 0;const purchase=actions.find(a=>a.action_type==='omni_purchase')||actions.find(a=>a.action_type==='purchase')||actions.find(a=>a.action_type==='offsite_conversion.fb_pixel_purchase');return Number(purchase?.value||0);}
export async function readAnalytics(raw:unknown,period:unknown){const account=accountNumber(raw),days=Number(period);if(![7,14,30].includes(days))throw Error('Choose 7, 14 or 30 days.');const result=await cachedMetaResource<Analytics>(`analytics:${account}:${days}`,600000,async token=>{
 const accountInfo=await graph<{currency:string;timezone_name?:string}>(`act_${account}`,{fields:'currency,timezone_name'},'GET',token);
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:accountInfo.timezone_name||'UTC',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),part=(kind:string)=>parts.find(p=>p.type===kind)?.value;
 const end=new Date(`${part('year')}-${part('month')}-${part('day')}T12:00:00Z`),start=new Date(end);start.setUTCDate(start.getUTCDate()-days+1);const date=(d:Date)=>d.toISOString().slice(0,10);
 const rows=await graphList(`act_${account}/insights`,'date_start,spend,actions',{time_range:{since:date(start),until:date(end)},time_increment:1,level:'account'},token);
 const ads=await graphList(`act_${account}/ads`,'id,effective_status',{filtering:[{field:'effective_status',operator:'IN',value:['ACTIVE']}]},token);
 const timeline:InsightDay[]=[];for(let i=0;i<days;i++){const d=new Date(start);d.setUTCDate(d.getUTCDate()+i);const row=rows.find(r=>r.date_start===date(d)),spend=Number(row?.spend||0),purchases=purchaseCount(row?.actions);timeline.push({date:date(d),spend,purchases,cpa:purchases?spend/purchases:null});}
 const spend=timeline.reduce((s,d)=>s+d.spend,0),purchases=timeline.reduce((s,d)=>s+d.purchases,0);return {currency:accountInfo.currency,days:timeline,spend,purchases,cpa:purchases?spend/purchases:null,active:ads.length,fetchedAt:Date.now()};});return {...result.value,cached:result.cached};
}
