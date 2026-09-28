import {lookup} from 'node:dns/promises';
import https from 'node:https';
import http from 'node:http';
import {Readable} from 'node:stream';
import {publicIP} from './safe-fetch';
import {MEDIA_LIMIT,MEDIA_BUCKET,existingMedia} from './media';
export async function openVideoStream(input:string,hops=0):Promise<http.IncomingMessage>{
 if(hops>4)throw Error('Too many redirects');const u=new URL(input);
 if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.port&&!['80','443'].includes(u.port))throw Error('Unsupported media URL');
 const all=await lookup(u.hostname.replace(/^\[|\]$/g,''),{all:true});if(!all.length||all.some(a=>!publicIP(a.address)))throw Error('Only public media URLs are allowed');const addr=all.find(a=>a.family===4)||all[0];
 return new Promise((resolve,reject)=>{const req=(u.protocol==='https:'?https:http).get(u,{headers:{'User-Agent':'Mozilla/5.0'},lookup:((_h:unknown,o:{all?:boolean},cb:(...a:unknown[])=>void)=>o.all?cb(null,[addr]):cb(null,addr.address,addr.family)) as never},r=>{
 if(r.statusCode&&r.statusCode>=300&&r.statusCode<400&&r.headers.location){r.destroy();openVideoStream(new URL(r.headers.location,u).href,hops+1).then(resolve,reject);return;}
 if(r.statusCode!==200||Number(r.headers['content-length']||0)>MEDIA_LIMIT){r.destroy();reject(Error('Video download failed or exceeds the 2 GB limit'));return;}resolve(r);});req.setTimeout(30000,()=>req.destroy(Error('Video transfer stalled')));req.on('error',reject);});
}
export async function storeVideoStream(url:string,id:string){
 if(!/^[\w-]{8,100}$/.test(id))throw Error('Invalid video ID');const path=`clean/${id}.mp4`,prior=await existingMedia(path);if(prior)return prior;
 const response=await openVideoStream(url);let total=0,first=true;
 const body=Readable.from((async function*(){for await(const piece of response){const b=Buffer.from(piece);if(first){first=false;if(!/^video\//.test(String(response.headers['content-type']))&&!b.subarray(4,12).includes(Buffer.from('ftyp')))throw Error('Output is not a video');}total+=b.length;if(total>MEDIA_LIMIT)throw Error('Video exceeds the 2 GB limit');yield b;}if(!total)throw Error('Empty video');})());
 const origin=process.env.SUPABASE_URL!,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;if(!origin||!key){response.destroy();throw Error('Storage is not configured');}
 try{const r=await fetch(`${origin}/storage/v1/object/${MEDIA_BUCKET}/${path}`,{method:'POST',headers:{Authorization:`Bearer ${key}`,apikey:key,'Content-Type':'video/mp4','x-upsert':'false'},body:body as unknown as BodyInit,duplex:'half',signal:AbortSignal.timeout(230000)} as RequestInit);
 if(!r.ok){if(r.status===409){const saved=await existingMedia(path);if(saved)return saved;}throw Error(`Video storage returned HTTP ${r.status}`);}return `${origin}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
 }finally{body.destroy();response.destroy();}
}
