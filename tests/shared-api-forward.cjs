const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {sharedApiForward}=require('../lib/shared-api-forward.ts'),backend='https://szekspir.vercel.app';
const forwarded=sharedApiForward(new Request('https://bakki.example/api/profile?view=brain',{method:'POST',headers:{origin:'https://bakki.example',cookie:'session=fixture','content-type':'application/json',authorization:'Bearer owner-secret','x-szekspir-identity':'forged','x-forwarded-host':'evil.example'}}),backend);
assert.equal(forwarded.url.href,backend+'/api/profile?view=brain');assert.equal(forwarded.headers.get('origin'),backend);assert.equal(forwarded.headers.get('cookie'),'session=fixture');
for(const name of ['authorization','x-szekspir-identity','x-forwarded-host'])assert.equal(forwarded.headers.get(name),null);
assert.throws(()=>sharedApiForward(new Request('https://bakki.example/api/profile',{method:'POST',headers:{origin:'https://evil.example'}}),backend));
assert.throws(()=>sharedApiForward(new Request('https://bakki.example/api/profile',{method:'POST'}),backend));
assert.throws(()=>sharedApiForward(new Request('https://bakki.example/api/profile'),'https://evil.example'));
assert.equal(sharedApiForward(new Request('https://bakki.example/login'),backend),null);
console.log('PASS shared frontend: fixed backend, same-origin writes, session forwarding, no owner/machine headers, no local backend credentials.');

const configPath=require.resolve('../vercel.ts'),saved=process.env.APP_SHARED_API_ORIGIN;delete process.env.APP_SHARED_API_ORIGIN;delete require.cache[configPath];assert.deepEqual(require(configPath).config,require('../vercel.backend.json'));process.env.APP_SHARED_API_ORIGIN=backend;delete require.cache[configPath];const frontend=require(configPath).config;assert.equal(frontend.functions,undefined);assert.equal(frontend.crons,undefined);assert.equal(frontend.git.deploymentEnabled['collab/bakki77'],true);if(saved===undefined)delete process.env.APP_SHARED_API_ORIGIN;else process.env.APP_SHARED_API_ORIGIN=saved;
