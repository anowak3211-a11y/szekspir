import {accountEnv} from './account-context';
import {withMetaBudget,recordMetaUsage,isMetaRateLimit,MetaBudgetWait} from './meta-rate-limit';
import {createHmac} from 'node:crypto';
import {readState,mutate} from './store';
import {numericId} from './meta-uploader-model';
import {cachedMetaRead,metaCacheKey} from './meta-read-cache';

type Connection={token?:string;expiresAt?:number;connectedAt?:number;appId?:string;appSecret?:string;loginConfigId?:string};
const KEY='meta-uploader-connection';
export const META_VERSION=process.env.META_API_VERSION||'v26.0';
function version(){if(!/^v\d+\.0$/.test(META_VERSION))throw Error('Invalid Meta API version.');return META_VERSION;}
export class MetaError extends Error{
 retryAfterSeconds?:number;rateLimited=false;
 constructor(public code:number,public subcode:number,public transient:boolean,public uncertain:boolean,message:string){super(message);this.name='MetaError';}
}
export async function metaConnection(){return (await readState<Connection>(KEY,{})).value;}
export async function metaApp(){const c=await metaConnection();return c.appId?{id:c.appId,secret:c.appSecret,configId:c.loginConfigId}:{id:accountEnv('META_APP_ID'),secret:accountEnv('META_APP_SECRET'),configId:accountEnv('META_LOGIN_CONFIG_ID')};}
export async function metaProof(token:string){const {secret}=await metaApp();return secret?createHmac('sha256',secret).update(token).digest('hex'):undefined;}
export async function saveMetaApp(appId:unknown,secret:unknown,configId:unknown){const id=numericId(appId,'App ID'),config=configId?numericId(configId,'Login configuration ID'):undefined;if(typeof secret!=='string'||secret.length<20||secret.length>256||!/^[a-zA-Z0-9_-]+$/.test(secret))throw Error('Invalid application secret.');await mutate<Connection,void>(KEY,{},c=>{if((c.token||accountEnv('META_ACCESS_TOKEN'))&&(c.appId||accountEnv('META_APP_ID'))!==id)throw Error('A different application already has a connected token. Keep its settings until the connection is explicitly replaced.');c.appId=id;c.appSecret=secret;c.loginConfigId=config;});}
export async function metaToken(){const c=await metaConnection();const token=c.token||accountEnv('META_ACCESS_TOKEN');if(!token||c.token&&c.expiresAt&&c.expiresAt<Date.now())throw Error('Connect Meta in the uploader settings.');return token;}
export async function connectionStatus(){const c=await metaConnection(),app=await metaApp();return {connected:!!(c.token||accountEnv('META_ACCESS_TOKEN'))&&!(c.token&&c.expiresAt&&c.expiresAt<Date.now()),oauthConfigured:!!(app.id&&app.secret),appId:app.id,loginConfigId:app.configId,expiresAt:c.expiresAt,connectedAt:c.connectedAt};}
export async function saveMetaToken(token:string,expiresAt?:number){
 if(typeof token!=='string'||token.length<20||token.length>4096||/[\r\n\s]/.test(token))throw Error('Invalid Meta access token.');
 // Validate the supplied credential before replacing a working connection.
 await graph<{id:string}>('me',{fields:'id'},'GET',token);
 await mutate<Connection,void>(KEY,{},c=>{c.token=token;c.expiresAt=expiresAt;c.connectedAt=Date.now();});
}
export async function graph<T=Record<string,unknown>>(path:string,params:Record<string,unknown>={},method:'GET'|'POST'='GET',credential?:string,video=false):Promise<T>{
 if(!/^(?:me|act_\d+|\d+)(?:\/[a-z_]+)?$/.test(path))throw Error('Invalid Meta operation.');
 const token=credential||await metaToken(),url=new URL(`https://${video?'graph-video':'graph'}.facebook.com/${version()}/${path}`),body=new URLSearchParams();
 for(const [key,value] of Object.entries(params))if(value!==undefined)body.set(key,typeof value==='string'?value:JSON.stringify(value));
 const proof=await metaProof(token);if(proof)body.set('appsecret_proof',proof);
 if(method==='GET')url.search=body.toString();
 let response:Response,data:Record<string,unknown>={},cooldown=0;
 try{response=await withMetaBudget(async()=>{const started=Date.now(),r=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,...(method==='POST'?{'Content-Type':'application/x-www-form-urlencoded'}:{})},body:method==='POST'?body:undefined,cache:'no-store',signal:AbortSignal.timeout(video?180000:45000)});try{data=await r.json();}finally{const error=data.error as {code?:number;error_subcode?:number}|undefined;const code=Number(error?.code||r.status);cooldown=await recordMetaUsage(r.headers,isMetaRateLimit(code),{operation:path,method,status:r.status,code,subcode:Number(error?.error_subcode||0),durationMs:Date.now()-started});}return r;},method==='POST'?3:1);}

 catch(e){if(e instanceof MetaBudgetWait)throw e;throw new MetaError(0,0,true,method==='POST',method==='POST'?'Meta did not confirm the request. Check its result before retrying.':'Meta is temporarily unavailable.');}
 if(!response.ok||data.error){const e=data.error as {code?:number;error_subcode?:number;is_transient?:boolean;error_user_msg?:string}|undefined;const code=Number(e?.code||response.status),subcode=Number(e?.error_subcode||0);const rate=isMetaRateLimit(code);const detail=String(e?.error_user_msg||'').replaceAll(token,'[redacted]').replace(/https?:\/\/\S+/g,'[link]').slice(0,300);const error=new MetaError(code,subcode,rate||!!e?.is_transient||response.status>=500,response.status>=500,`Meta rejected the request (${code}${subcode?'/'+subcode:''}).${detail?' '+detail:''}`);error.rateLimited=rate;if(rate)error.retryAfterSeconds=Math.max(300,cooldown);throw error;}
 return data as T;
}
export async function graphList(path:string,fields:string,extra:Record<string,unknown>={},token?:string,maxPages=20){
 const result:Record<string,unknown>[]=[];let after:string|undefined;
 for(let i=0;i<maxPages;i++){const r=await graph<{data:Record<string,unknown>[];paging?:{cursors?:{after?:string};next?:string}}>(path,{fields,limit:100,...extra,after},'GET',token);if(!Array.isArray(r.data))throw Error('Invalid Meta list response.');result.push(...r.data);if(!r.paging?.next)return result;const next=r.paging.cursors?.after;if(!next||next===after)throw Error('Meta pagination could not be confirmed.');after=next;}
 throw Error('Too many Meta results. Narrow the selected account or ad set.');
}
export async function cachedMetaResource<T>(operation:string,ttlMs:number,load:(token:string)=>Promise<T>,credential?:string){const token=credential||await metaToken();return cachedMetaRead(metaCacheKey(`${META_VERSION}:${token}`,operation),ttlMs,()=>load(token));}
export async function metaAccounts(token?:string){return (await cachedMetaResource('accounts',300000,t=>graphList('me/adaccounts','id,name,currency,account_status',{},t),token)).value;}
function pageSummary(p:Record<string,unknown>){
 const raw=(p.picture as {data?:{url?:unknown}}|undefined)?.data?.url;let pictureUrl:string|undefined;
 if(typeof raw==='string')try{const url=new URL(raw);if(url.protocol==='https:'&&!url.username&&!url.password&&!url.searchParams.has('access_token'))pictureUrl=url.href;}catch{}
 return {id:p.id,name:p.name,...(pictureUrl?{pictureUrl}:{})};
}
export async function metaResources(kind:string,accountId:string,campaignId?:string){
 const account=numericId(accountId.replace(/^act_/,''),'account');
 if(kind==='campaigns')return (await cachedMetaResource(`campaigns:${account}`,30000,t=>graphList(`act_${account}/campaigns`,'id,name,status,daily_budget,lifetime_budget',{},t))).value;
 if(kind==='pages')return (await cachedMetaResource(`pages-with-pictures-v2:${account}`,300000,async t=>{
  const pages=await graphList(`act_${account}/promote_pages`,'id,name,picture.type(square){url}',{},t);if(pages.length)return pages.map(pageSummary);
  // Some legacy accounts return no promote_pages despite the connected user
  // already having advertising tasks on the Page. Never infer access from a
  // public Page lookup or return Page access tokens to the browser.
  return (await graphList('me/accounts','id,name,tasks,picture.type(square){url}',{},t)).filter(p=>Array.isArray(p.tasks)&&p.tasks.some((task:unknown)=>task==='ADVERTISE'||task==='PROFILE_PLUS_ADVERTISE')).map(pageSummary);
 })).value;
 if(kind==='adsets'){const campaign=numericId(campaignId,'campaign');return (await cachedMetaResource(`adsets:${account}:${campaign}`,30000,async t=>{const c=await graph<{account_id:string}>(campaign,{fields:'account_id'},'GET',t);if(c.account_id!==account)throw Error('Campaign belongs to another account.');return graphList(`${campaign}/adsets`,'id,name,status,campaign_id,account_id,destination_type,optimization_goal,promoted_object',{},t);})).value;}
 throw Error('Unknown resource.');
}
export async function assertUploadTarget(ad:{accountId:string;campaignId:string;adSetId:string;pageId:string;publishStatus?:'ACTIVE'|'PAUSED'}){
 const set=(await cachedMetaResource(`target-with-conversion:${ad.accountId}:${ad.adSetId}`,300000,t=>graph<{account_id:string;campaign_id:string;destination_type?:string;optimization_goal?:string;promoted_object?:{pixel_id?:string;application_id?:string}}>(ad.adSetId,{fields:'account_id,campaign_id,destination_type,optimization_goal,promoted_object'},'GET',t))).value;
 if(set.account_id!==ad.accountId||set.campaign_id!==ad.campaignId)throw Error('The ad set does not belong to the selected account and campaign.');
 const campaign=ad.publishStatus===undefined?await graph<{status:string}>(ad.campaignId,{fields:'status'}):(await cachedMetaResource(`explicit-publication-campaign:${ad.accountId}:${ad.campaignId}`,30000,t=>graph<{status:string}>(ad.campaignId,{fields:'status'},'GET',t))).value;if(ad.publishStatus===undefined&&campaign.status!=='PAUSED')throw Error('This uploader requires a paused campaign. Pause it in Meta first.');
 if(ad.publishStatus!==undefined&&!['ACTIVE','PAUSED'].includes(campaign.status))throw Error('Choose an active or paused campaign for publication.');
 // UNDEFINED alone does not identify a website. Legacy pixel conversion
 // sets must additionally prove offsite/value optimisation and no app target.
 const legacyWebsite=set.destination_type==='UNDEFINED'&&!!set.promoted_object?.pixel_id&&!set.promoted_object.application_id&&['OFFSITE_CONVERSIONS','VALUE'].includes(set.optimization_goal||'');
 if(set.destination_type&&set.destination_type!=='WEBSITE'&&!legacyWebsite)throw Error(`Choose a Website ad set. Meta returned ${set.destination_type}.`);
 const pages=await metaResources('pages',ad.accountId);if(!pages.some(p=>p.id===ad.pageId))throw Error('Selected Page is not available for this account.');
}
