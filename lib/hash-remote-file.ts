import {lookup} from 'node:dns/promises';
import {createHash} from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import {publicIP} from './safe-fetch';
// Streaming, DNS-pinned and bounded; never hashes a login/HTML error as a video.
export async function hashRemoteFile(input:string,hops=0):Promise<{hash:string;bytes:number}>{
 if(hops>4)throw Error('Too many redirects');const url=new URL(input);
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.port&&!['80','443'].includes(url.port))throw Error('Unsupported media URL');
 const addresses=await lookup(url.hostname.replace(/^\[|\]$/g,''),{all:true});
 if(!addresses.length||addresses.some(a=>!publicIP(a.address)))throw Error('Only public media URLs are allowed');
 const address=addresses.find(a=>a.family===4)||addresses[0];
 return new Promise((resolve,reject)=>{
  const req=(url.protocol==='https:'?https:http).get(url,{lookup:((_host:unknown,opts:{all?:boolean},cb:(...args:unknown[])=>void)=>opts.all?cb(null,[address]):cb(null,address.address,address.family)) as never},res=>{
   if(res.statusCode&&res.statusCode>=300&&res.statusCode<400&&res.headers.location){res.destroy();hashRemoteFile(new URL(res.headers.location,url).href,hops+1).then(resolve,reject);return;}
   const type=String(res.headers['content-type']||'');
   if(res.statusCode!==200||!(/^(video|audio)\//.test(type)||/^application\/octet-stream/.test(type))){res.destroy();reject(Error('Original media unavailable (HTTP '+res.statusCode+')'));return;}
   const hash=createHash('sha256');let bytes=0;const limit=2*1024*1024*1024;
   res.on('data',(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>limit)res.destroy(Error('Original exceeds 2 GB'));else hash.update(chunk);});
   res.on('error',reject);res.on('aborted',()=>reject(Error('Original transfer interrupted')));
   res.on('end',()=>{if(!res.complete||!bytes){reject(Error('Incomplete original file'));return;}resolve({hash:hash.digest('hex'),bytes});});
  });const timer=setTimeout(()=>req.destroy(Error('Original download timed out')),90000);req.on('close',()=>clearTimeout(timer));req.on('error',reject);
 });
}
