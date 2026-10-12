import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import https from 'node:https';
import http from 'node:http';
export function publicIP(ip:string){
 if(isIP(ip)===4){const a=ip.split('.').map(Number);return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||a[0]===169&&a[1]===254||a[0]===172&&a[1]>=16&&a[1]<=31||a[0]===192&&a[1]===168||a[0]===100&&a[1]>=64&&a[1]<=127||a[0]===198&&(a[1]===18||a[1]===19));}
 // Accept global unicast IPv6 only; reject mapped IPv4, local and transition ranges.
 return isIP(ip)===6&&/^[23][0-9a-f]{3}:/i.test(ip)&&!/^2001:(?:0:|db8:)/i.test(ip)&&!/^2002:/i.test(ip);
}
export async function safeDownload(input:string,limit=200*1024*1024,hops=0,deadline=Date.now()+90000):Promise<{buffer:Buffer;contentType:string;url:string}>{
 if(hops>4)throw new Error('Too many redirects');
 const url=new URL(input);
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port&&!['80','443'].includes(url.port))throw new Error('Unsupported media URL');
 const hostname=url.hostname.replace(/^\[|\]$/g,'');
 const remaining=deadline-Date.now();if(remaining<=0)throw Error('Media download timed out');
 let dnsTimer:ReturnType<typeof setTimeout>|undefined;
 const addresses=await Promise.race([lookup(hostname,{all:true}),new Promise<never>((_,reject)=>{dnsTimer=setTimeout(()=>reject(Error('Media DNS lookup timed out')),Math.min(15000,remaining));})]).finally(()=>clearTimeout(dnsTimer));
 if(!addresses.length||addresses.some(a=>!publicIP(a.address)))throw new Error('Only public internet media URLs are allowed');
 const address=addresses.find(a=>a.family===4)||addresses[0];
 return new Promise((resolve,reject)=>{
  let finished=false;let timer:ReturnType<typeof setTimeout>|undefined;
  const fail=(error:Error)=>{if(finished)return;finished=true;clearTimeout(timer);reject(error);};
  const done=(value:{buffer:Buffer;contentType:string;url:string})=>{if(finished)return;finished=true;clearTimeout(timer);resolve(value);};
  const request=(url.protocol==='https:'?https:http).get(url,{headers:{'User-Agent':'Mozilla/5.0'},lookup:((_host:unknown,opts:{all?:boolean},callback:(...args:unknown[])=>void)=>opts.all?callback(null,[address]):callback(null,address.address,address.family)) as never},res=>{
   if(res.statusCode&&res.statusCode>=300&&res.statusCode<400&&res.headers.location){res.destroy();safeDownload(new URL(res.headers.location,url).href,limit,hops+1,deadline).then(done,fail);return;}
   if(res.statusCode!==200){res.destroy();fail(new Error(`Media download returned HTTP ${res.statusCode}`));return;}
   if(Number(res.headers['content-length']||0)>limit){res.destroy();fail(new Error('Media exceeds size limit'));return;}
   const chunks:Buffer[]=[];let size=0;
   res.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>limit){res.destroy(new Error('Media exceeds size limit'));return;}chunks.push(chunk);});
   res.on('aborted',()=>fail(Error('Media download interrupted')));res.on('error',fail);res.on('end',()=>done({buffer:Buffer.concat(chunks),contentType:String(res.headers['content-type']||'application/octet-stream'),url:url.href}));
  });
  // Keep the deadline through the response body, even after the request closes.
  timer=setTimeout(()=>{const error=Error('Media download timed out');request.destroy(error);fail(error);},Math.max(1,deadline-Date.now()));
  request.on('error',fail);
 });
}
