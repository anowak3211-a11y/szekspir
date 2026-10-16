const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
process.env.MEDIA_BACKEND='supabase';process.env.SUPABASE_URL='https://fixture.supabase.co';process.env.SUPABASE_SECRET_KEY='fixture-only';
let allowed=['video/mp4','audio/wav','audio/mpeg'],reads=0;const load=Module._load;Module._load=function(n,p,i){if(n==='@supabase/supabase-js')return {createClient:()=>({storage:{getBucket:async()=>{reads++;return {data:{allowed_mime_types:allowed},error:null};}}})};return load.call(this,n,p,i);};
const media=require('../lib/media.ts');
(async()=>{await assert.rejects(()=>media.assertMediaTypeSupported('application/zip'),/application\/zip/);allowed.push('application/zip');await media.assertMediaTypeSupported('application/zip');assert.equal(reads,2);console.log('PASS separation preflight: reject blocked ZIP before paid request, accept explicit allowed ZIP');})().catch(e=>{console.error(e);process.exitCode=1;});
