import {lookup} from 'node:dns/promises';
import https from 'node:https';
import {publicIP} from './safe-fetch';
export function validateAiEndpoint(value:unknown){if(typeof value!=='string'||value.length>2048)throw Error('Podaj adres API HTTPS.');const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.port&&u.port!=='443'||!u.hostname.includes('.'))throw Error('Użyj publicznego adresu API HTTPS bez danych logowania.');return u;}
/** Pin validated DNS for the actual connection and refuse redirects carrying API keys. */
export const publicAiFetch:typeof fetch=async(input,init)=>{
 const request=new Request(input,init),url=validateAiEndpoint(request.url);
 request.signal.throwIfAborted();
 const addresses=await lookup(url.hostname,{all:true});request.signal.throwIfAborted();
 if(!addresses.length||addresses.some(a=>!publicIP(a.address)))throw Error('API musi być dostępne w publicznym internecie.');
 const address=addresses.find(a=>a.family===4)||addresses[0],body=Buffer.from(await request.arrayBuffer());
 if(body.length>20*1024*1024)throw Error('AI request exceeds size limit.');
 return new Promise<Response>((resolve,reject)=>{
  const req=https.request(url,{method:request.method,headers:Object.fromEntries(request.headers),signal:request.signal,lookup:((_host:unknown,opts:{all?:boolean},cb:(...args:unknown[])=>void)=>opts.all?cb(null,[address]):cb(null,address.address,address.family)) as never},res=>{
   if((res.statusCode||0)>=300&&(res.statusCode||0)<400){res.destroy();reject(Error('Przekierowanie API zostało odrzucone. Wpisz końcowy adres API.'));return;}
   const chunks:Buffer[]=[];let size=0;res.on('data',(b:Buffer)=>{size+=b.length;if(size>10*1024*1024){res.destroy(Error('AI response exceeds size limit.'));return;}chunks.push(b);});res.on('error',reject);res.on('aborted',()=>reject(Error('AI response interrupted')));res.on('end',()=>{const headers=new Headers();for(const [k,v] of Object.entries(res.headers))if(v)headers.set(k,Array.isArray(v)?v.join(', '):v);resolve(new Response(Buffer.concat(chunks),{status:res.statusCode||502,headers}));});
  });req.on('error',reject);req.end(body);
 });
};
