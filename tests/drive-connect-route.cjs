const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=fs.readFileSync('app/api/drive/connect/route.ts','utf8');
let starts=0;
const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:mod.exports,Response,File,require:n=>n==='@/lib/auth'?{authorised:h=>h==='test-auth'}:{DRIVE_ORIGIN:'https://szekspir.vercel.app',DRIVE_CALLBACK:'https://szekspir.vercel.app/api/drive/callback',DRIVE_COOKIE:'__Host-szekspir-drive-state',driveConnection:async()=>({pending:{}}),startDriveConnection:async()=>{starts++;return {state:'test-state',url:'https://accounts.google.com/oauth'};}}});
(async()=>{
 const get=await mod.exports.GET(new Request('https://szekspir.vercel.app/api/drive/connect',{headers:{authorization:'test-auth'}}));
 assert.equal(get.headers.get('referrer-policy'),'same-origin','Native same-origin POST must retain Origin; no-referrer produces null');
 for(const origin of ['null','https://evil.example','']){const response=await mod.exports.POST(new Request('https://szekspir.vercel.app/api/drive/connect',{method:'POST',headers:{authorization:'test-auth',origin}}));assert.equal(response.status,403);}
 assert.equal(starts,0);
 const ok=await mod.exports.POST(new Request('https://szekspir.vercel.app/api/drive/connect',{method:'POST',headers:{authorization:'test-auth',origin:'https://szekspir.vercel.app'}}));assert.equal(ok.status,303);assert.equal(starts,1);
 const unauth=await mod.exports.POST(new Request('https://szekspir.vercel.app/api/drive/connect',{method:'POST',headers:{origin:'https://szekspir.vercel.app'}}));assert.equal(unauth.status,401);
 console.log('PASS connect route: form Origin preserved, foreign/null Origin rejected, authentication required');
})().catch(e=>{console.error(e);process.exitCode=1;});
