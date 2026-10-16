const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),ts=require('typescript'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const resource='docs/antki/zasady-lokalizacji-us-uk.md';
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(resource)).digest('hex'),'c40acb79d70118dfc6542b37e667f474a84cbc5fb074bd162a80632f8b152e95','Owner attachment must remain verbatim');
const {ukLocalisationGuide}=require('../lib/uk-localisation-guide.ts');
for(const mode of ['native','video','full-video']){
 const guide=ukLocalisationGuide(mode);
 assert(guide.includes(fs.readFileSync(resource,'utf8')));
 assert(guide.includes(mode==='video'?'VARIANT A':'VARIANT B'));
 assert(guide.includes('do not dilute'));
 assert(guide.includes('Never blindly change $ to £'));
 assert(guide.includes('real attribution stays unchanged'));
 assert(guide.includes('not two versions'));
}
let calls=0;
const load=Module._load;Module._load=function(n,p,i){if(n==='openai')return {__esModule:true,default:class{chat={completions:{create:async()=>{calls++;throw Error('Unexpected provider call');}}};}};return load.call(this,n,p,i);};
(async()=>{
 const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'szekspir-guide-test-'));
 process.env.OPENAI_API_KEY='offline-only';
 try{
  fs.mkdirSync(path.join(temp,'docs/antki'),{recursive:true});fs.copyFileSync('docs/antki/kompendium-uk-us-ads.md',path.join(temp,'docs/antki/kompendium-uk-us-ads.md'));
  // A new process/module instance has not cached a successfully loaded document.
  delete require.cache[require.resolve('../lib/uk-localisation-guide.ts')];
  delete require.cache[require.resolve('../lib/antki-localisation-guide.ts')];
  delete require.cache[require.resolve('../lib/antki-providers.ts')];
  process.chdir(temp);
  await assert.rejects(()=>require(path.join(cwd,'lib/antki-providers.ts')).localiseAntkiChunk({chunks:['Mom was tired.'],ukChunks:[]}),/UK localisation rules are unavailable/);
  assert.equal(calls,0);
 }finally{process.chdir(cwd);fs.rmSync(temp,{recursive:true,force:true});}
 const config=fs.readFileSync('next.config.ts','utf8');assert(config.includes('./'+resource));
 console.log('PASS: exact owner document, native/video contracts, factual precedence, deployment resource and missing-file failure before paid requests. Offline only.');
})().catch(e=>{console.error(e);process.exitCode=1;});
