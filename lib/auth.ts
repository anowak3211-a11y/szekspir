import {timingSafeEqual} from 'node:crypto';
export function authorised(header:string|null,cron=false){
 const secret=cron?process.env.CRON_SECRET:process.env.APP_PASSWORD;
 if(!secret)return !cron&&process.env.NODE_ENV==='development';
 let candidate='';try{if(cron)candidate=header?.startsWith('Bearer ')?header.slice(7):'';else if(header?.startsWith('Basic ')){const d=Buffer.from(header.slice(6),'base64').toString();const i=d.indexOf(':');if(i>=0)candidate=d.slice(i+1);}}catch{return false;}
 const a=Buffer.from(candidate),b=Buffer.from(secret);return a.length===b.length&&timingSafeEqual(a,b);
}
