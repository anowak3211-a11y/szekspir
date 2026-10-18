// Actual media cache against synthetic storage/provider; no external requests.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module'),sharp=require('sharp');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
let now=1800000000000,bytes,posts=0;const states=new Map(),load=Module._load,realFetch=global.fetch,realNow=Date.now;Date.now=()=>now;
Module._load=function(n,p,i){if(p?.filename.endsWith('/lib/meta-upload-media.ts')){
 if(n==='./store')return {readState:async(k,d)=>({value:states.get(k)||d}),mutate:async(k,d,fn)=>{const s=states.get(k)||d;fn(s);states.set(k,s);}};
 if(n==='./safe-fetch')return {safeDownload:async()=>({buffer:bytes,contentType:'image/png'}),publicIP:()=>true};
 if(n==='./meta-rate-limit')return {withMetaBudget:async fn=>fn(),recordMetaUsage:async()=>0,isMetaRateLimit:()=>false,MetaBudgetWait:class extends Error{}};
 if(n==='./meta-client')return {metaToken:async()=>'OFFLINE',metaProof:async()=>undefined,META_VERSION:'v99.0',MetaError:class extends Error{}};
 if(n==='./drive-video')return {driveClient:async()=>{throw Error('No Drive calls expected');}};
 }return load.call(this,n,p,i);};
global.fetch=async()=>{posts++;return Response.json({images:{image:{hash:'a'.repeat(32)}}});};
(async()=>{bytes=await sharp({create:{width:2,height:2,channels:3,background:'red'}}).png().toBuffer();const {uploadImage}=require('../lib/meta-upload-media.ts'),item={ad:{accountId:'100001',media:{kind:'image',url:'https://example.com/image.png',filename:'image.png'}}};await uploadImage(item);now+=3600000;await uploadImage(item);assert.equal(posts,1,'Delayed pair reuses its confirmed same-account exact-byte hash');await uploadImage({...item,ad:{...item.ad,accountId:'100002'}});assert.equal(posts,2,'No reuse across accounts');bytes=await sharp({create:{width:2,height:2,channels:3,background:'blue'}}).png().toBuffer();await uploadImage(item);assert.equal(posts,3,'Changed bytes upload separately');now+=86400001;await uploadImage(item);assert.equal(posts,4,'Expired confirmed cache uploads again');console.log('PASS: delayed exact-image reuse, account/byte isolation and 24-hour expiry. No live requests.');})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{Module._load=load;global.fetch=realFetch;Date.now=realNow;});
