import {randomBytes,timingSafeEqual} from 'node:crypto';
import {mutate} from './store';
import {META_VERSION,saveMetaToken,metaApp} from './meta-client';
export const META_COOKIE='__Host-szekspir-meta-state';
export const META_ORIGIN=process.env.APP_ORIGIN||'https://szekspir.vercel.app';
export const META_CALLBACK=META_ORIGIN+'/api/meta/callback';
type Attempt={expires:number;used?:boolean};
async function app(){const {id,secret,configId}=await metaApp();if(!id||!/^\d+$/.test(id)||!secret)throw Error('Meta application is not configured yet.');return {id,secret,configId};}
export async function startMetaOauth(){const {id,configId}=await app(),state=randomBytes(32).toString('base64url');await mutate<Attempt,void>('meta-oauth-'+state,{expires:Date.now()+600000},()=>{});const url=new URL(`https://www.facebook.com/${META_VERSION}/dialog/oauth`);url.search=new URLSearchParams({client_id:id,redirect_uri:META_CALLBACK,state,response_type:'code',...(configId?{config_id:configId,override_default_response_type:'true'}:{scope:'ads_management,ads_read,pages_show_list,pages_read_engagement'})}).toString();return {state,url:url.href};}
async function exchange(params:Record<string,string>){const u=new URL(`https://graph.facebook.com/${META_VERSION}/oauth/access_token`);u.search=new URLSearchParams(params).toString();let r:Response,d:{access_token?:string;expires_in?:number};try{r=await fetch(u,{cache:'no-store',signal:AbortSignal.timeout(20000)});d=await r.json();}catch{throw Error('Meta sign-in could not be confirmed.');}if(!r.ok||!d.access_token)throw Error('Meta did not grant access.');return d;}
export async function finishMetaOauth(state:string,cookie:string,code:string){
 if(!/^[\w-]{43}$/.test(state)||state.length!==cookie.length||!timingSafeEqual(Buffer.from(state),Buffer.from(cookie))||!code||code.length>4096)throw Error('Invalid sign-in response.');
 await mutate<Attempt,void>('meta-oauth-'+state,{expires:0},a=>{if(a.used||a.expires<Date.now())throw Error('Sign-in expired.');a.used=true;});
 const {id,secret}=await app(),short=await exchange({client_id:id,client_secret:secret,redirect_uri:META_CALLBACK,code});
 const long=await exchange({grant_type:'fb_exchange_token',client_id:id,client_secret:secret,fb_exchange_token:short.access_token!});
 await saveMetaToken(long.access_token!,long.expires_in?Date.now()+long.expires_in*1000:undefined);
}
