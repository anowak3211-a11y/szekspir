const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),{Readable}=require('node:stream');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
process.env.MEDIA_BACKEND='supabase';process.env.SUPABASE_URL='https://fixture.supabase.co';process.env.SUPABASE_SECRET_KEY='fixture-only';
const {putMediaStream,MEDIA_LIMIT}=require('../lib/media.ts');
const block=Buffer.alloc(1024*1024);let transferred=0;
global.fetch=async(_url,options)=>{assert.equal(options.duplex,'half');assert(!Buffer.isBuffer(options.body));for await(const piece of options.body)transferred+=piece.length;return new Response(null,{status:200});};
function source(bytes){return Readable.from((async function*(){while(bytes>0){const n=Math.min(block.length,bytes);yield block.subarray(0,n);bytes-=n;}})());}
(async()=>{
 const before=process.memoryUsage().arrayBuffers;
 const result=await putMediaStream('clean/stream-fixture.mp4',source(MEDIA_LIMIT),'video/mp4');assert(result.endsWith('/clean/stream-fixture.mp4'));assert.equal(transferred,MEDIA_LIMIT,'Full 2 GiB is accepted without allocating a 2 GiB file');
 assert(process.memoryUsage().arrayBuffers-before<64*1024*1024,'Streaming memory remains bounded');
 await assert.rejects(()=>putMediaStream('clean/stream-over-limit.mp4',source(MEDIA_LIMIT+1),'video/mp4'),/2 GB/);
 await assert.rejects(()=>putMediaStream('../invalid',source(1),'video/mp4'),/Invalid/);
 console.log('PASS media stream: 2 GiB accepted, over-limit rejected, bounded memory, no external requests');
})().catch(e=>{console.error(e);process.exitCode=1;});
