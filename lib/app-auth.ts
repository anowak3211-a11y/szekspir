/** Server-only identity/MFA gateway. Provider tokens never enter browser storage. */
import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import {createClient, type Session, type User} from '@supabase/supabase-js';
import {mutate} from './store';

export const AUTH_COOKIE='__Host-szekspir-session';
const DEV_COOKIE='szekspir-session-dev';
const DAY_MS=24*60*60*1000,SESSION_MS=30*DAY_MS,SETUP_MS=15*60*1000;
type Tokens={access_token:string;refresh_token:string};
export type AppSession=Tokens&{until:number;needsPassword?:boolean};
export class AuthFailure extends Error{constructor(message='Sign in again.',public status=401){super(message);}}
export function mfaRequired(){return process.env.APP_AUTH_MODE==='supabase-mfa';}
export function allowedEmail(email:string|undefined){return !!email&&(process.env.AUTH_ALLOWED_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());}
/** Explicit per-account exception; the invitation allowlist remains mandatory. */
export function secondFactorRequired(user:Pick<User,'email'>){
 const email=user.email?.trim().toLowerCase();
 return !email||!allowedEmail(email)||!(process.env.AUTH_PASSWORD_ONLY_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean).includes(email);
}
function encryptionKey(){const secret=process.env.JOB_ENCRYPTION_KEY||process.env.BLOB_READ_WRITE_TOKEN;if(!secret)throw new AuthFailure('Sign-in is not configured.',503);return createHash('sha256').update('szekspir-auth-v1\0'+secret).digest();}
export function authClient(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key||!process.env.AUTH_ALLOWED_EMAILS)throw new AuthFailure('Sign-in is not configured.',503);
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,experimental:{recoveryCodes:true}}});
}
export function sealSession(tokens:Tokens,until=Date.now()+SETUP_MS,needsPassword=false){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',encryptionKey(),iv);
 cipher.setAAD(Buffer.from(AUTH_COOKIE));
 return Buffer.concat([iv,cipher.update(JSON.stringify({...tokens,until,needsPassword})),cipher.final(),cipher.getAuthTag()]).toString('base64url');
}
export function readSession(cookie:string|null):AppSession|null{
 const name=process.env.NODE_ENV==='production'?AUTH_COOKIE:DEV_COOKIE;
 const raw=(cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1);
 if(!raw||raw.length>6000)return null;
 try{const buf=Buffer.from(raw,'base64url');if(buf.length<29)return null;const cipher=createDecipheriv('aes-256-gcm',encryptionKey(),buf.subarray(0,12));cipher.setAAD(Buffer.from(AUTH_COOKIE));cipher.setAuthTag(buf.subarray(-16));const value=JSON.parse(Buffer.concat([cipher.update(buf.subarray(12,-16)),cipher.final()]).toString()) as AppSession;
  if(typeof value.access_token!=='string'||typeof value.refresh_token!=='string'||!Number.isFinite(value.until)||value.until<=Date.now()||value.until>Date.now()+SESSION_MS+60000)return null;return value;
 }catch{return null;}
}
export function sessionCookie(tokens:Tokens,until:number,needsPassword=false){return `${process.env.NODE_ENV==='production'?AUTH_COOKIE:DEV_COOKIE}=${sealSession(tokens,until,needsPassword)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0,Math.floor((until-Date.now())/1000))}${process.env.NODE_ENV==='production'?'; Secure':''}`;}
export function clearSessionCookie(){return `${process.env.NODE_ENV==='production'?AUTH_COOKIE:DEV_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV==='production'?'; Secure':''}`;}
export function tokenClaims(token:string){try{return JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()) as {sub?:string;aal?:string;exp?:number};}catch{return {};}}
function assertUser(user:User|null){if(!user?.id||!user.email_confirmed_at||user.is_anonymous||!allowedEmail(user.email))throw new AuthFailure();return user;}
export function hasMfa(user:User){return (user.factors||[]).some(f=>f.status==='verified'&&['totp','webauthn','phone'].includes(f.factor_type));}
export async function checkedSession(cookie:string|null,requireMfa=true){
 const saved=readSession(cookie);if(!saved)throw new AuthFailure();
 const client=authClient();
 // setSession validates the access token with Auth, and refreshes expired tokens.
 const {data,error}=await client.auth.setSession(saved);
 if(error||!data.session)throw new AuthFailure();
 const user=assertUser(data.user),session=data.session,claims=tokenClaims(session.access_token);
 // Claims are inspected only after provider validation of this exact token.
 if(claims.sub!==user.id||!claims.exp||claims.exp*1000<=Date.now())throw new AuthFailure();
 const requiresSecondFactor=secondFactorRequired(user);
 const complete=!saved.needsPassword&&(!requiresSecondFactor||(claims.aal==='aal2'&&hasMfa(user)));
 if(requireMfa&&!complete)throw new AuthFailure('Complete two-factor authentication.',403);
 // Renew during an existing validated request, at most once daily. No background polling.
 const until=complete&&saved.until<Date.now()+SESSION_MS-DAY_MS?completeUntil():saved.until;
 return {client,user,session,until,complete,requiresSecondFactor,aal:claims.aal,needsPassword:!!saved.needsPassword,changed:until!==saved.until||session.access_token!==saved.access_token||session.refresh_token!==saved.refresh_token};
}
export async function signIn(email:string,password:string){
 if(!allowedEmail(email))throw new AuthFailure('Email or password is incorrect.');
 const {data,error}=await authClient().auth.signInWithPassword({email,password});
 if(error||!data.session)throw new AuthFailure('Email or password is incorrect.');assertUser(data.user);return data.session;
}
/** Distributed bounded attempts; fail closed if the shared private store is unavailable. */
export async function authAttempt(bucket:string,limit:number,windowMs=15*60*1000){
 const name='auth-rate-'+createHash('sha256').update(bucket.toLowerCase()).digest('hex');
 const ok=await mutate<{start:number;count:number},boolean>(name,{start:Date.now(),count:0},state=>{if(Date.now()-state.start>=windowMs){state.start=Date.now();state.count=0;}if(state.count>=limit)return false;state.count++;return true;});
 if(!ok)throw new AuthFailure('Too many attempts. Try again in 15 minutes.',429);
}
export function requestBucket(request:Request){return process.env.VERCEL?request.headers.get('x-vercel-forwarded-for')||'unknown':'local';}
export function completeUntil(){return Date.now()+SESSION_MS;}
export function tokens(session:Session|Tokens):Tokens{return {access_token:session.access_token,refresh_token:session.refresh_token};}
