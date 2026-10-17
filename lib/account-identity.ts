import {createHmac,timingSafeEqual} from 'node:crypto';
export type AccountIdentity={id:string;email:string;owner:boolean;workspace?:string};
export const ACCOUNT_HEADER='x-szekspir-identity';
export const WORKSPACE_COOKIE='__Host-szekspir-workspace';
function secret(){const value=process.env.JOB_ENCRYPTION_KEY||process.env.BLOB_READ_WRITE_TOKEN;if(!value)throw Error('Account signing is not configured.');return value;}
export function ownerEmail(email:string){return (process.env.AUTH_OWNER_EMAILS||process.env.AUTH_ALLOWED_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).includes(email.toLowerCase());}
export function signAccount(value:unknown,ttl=120000){const data=Buffer.from(JSON.stringify({...value as object,expires:Date.now()+ttl})).toString('base64url');return data+'.'+createHmac('sha256',secret()).update('account-v1:'+data).digest('base64url');}
export function verifyAccount<T>(raw:string|null,maxAge=125000):T|undefined{try{if(!raw||raw.length>4096||raw.split('.').length!==2)return;const [data,mac]=raw.split('.'),expected=createHmac('sha256',secret()).update('account-v1:'+data).digest(),actual=Buffer.from(mac,'base64url');if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return;const result=JSON.parse(Buffer.from(data,'base64url').toString());if(result.expires<Date.now()||result.expires>Date.now()+maxAge)return;return result;}catch{return;}}
