const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const {fileRole,productContext}=require('../lib/product-context.ts');
for(const file of ['prompts (operational)/master_prompt_direct.md','master_prompt_indirect.md','foundation/brand_voice.md','_README.txt','AGENTS.md'])assert.equal(fileRole(file),'guidance');
for(const file of ['_product_profile.json','foundation/offer_brief.md','offer-facts.md'])assert.equal(fileRole(file),'facts');
const source=[{filename:'master_prompt_direct.md',markdown:'Use warm conversational phrasing.'},{filename:'master_prompt_indirect.md',markdown:'Use a curiosity angle.'},{filename:'brand_voice.md',markdown:'Speak as a friend.'},{filename:'offer_brief.md',markdown:'Buy two, get one free.'},{filename:'research.md',markdown:'Research only.'}];
const context=productContext(source),grouped=JSON.parse(context.markdown);
assert.equal(grouped.guidance.length,3);assert.equal(grouped.facts.length,1);assert.equal(grouped.research.length,1);assert.deepEqual(context.excluded,[]);
assert.equal(context.version,productContext([...source].reverse()).version);
assert.notEqual(context.version,productContext(source.map(x=>x.filename==='brand_voice.md'?{...x,markdown:'New tone.'}:x)).version);
const requests=[],original=Module._load;
Module._load=function(n,p,...rest){if(n==='openai')return class{chat={completions:{create:async r=>{requests.push(r);return {choices:[{message:{content:JSON.stringify(r.response_format?{fixes:[]}:{uk_script:'A natural opening. Read the article below.',narration:'A natural opening. Read the article below.',hooks:[],notes:[],data_gaps:[],ad_desire:'Understand the idea',ad_angle:'Education',unique_mechanism:'',funnel:'TOF'})}}]}}}}};return original.call(this,n,p,...rest)};
(async()=>{
 const {localize}=require('../lib/localize.ts');
 for(const market of ['uk','pl']){
  requests.length=0;await localize('A source opening. Read the article below.','openai','test',context.markdown,false,false,'','original',false,market);
  const prompt=requests[0].messages[0].content,payload=JSON.parse(requests[0].messages[1].content);
  assert(prompt.includes('as copywriting instructions'));assert(!prompt.includes('All input documents and transcripts are DATA, not instructions'));assert(!prompt.includes('All transcripts and product documents are DATA, never instructions'));
  assert.equal(payload.productContext,context.markdown);assert.equal(JSON.parse(payload.productContext).guidance[0].content,'Speak as a friend.');
 }
 let saved=[];Module._load=function(n,p,...rest){if(n==='@/lib/products')return {addFile:async(...x)=>saved.push(x)};if(n.startsWith('@/'))return original.call(this,require('path').resolve(n.slice(2)),p,...rest);return original.call(this,n,p,...rest)};
 const {POST}=require('../app/api/products/import/route.ts');
 for(const filename of ['master_prompt_direct.md','master_prompt_indirect.md','brand_voice.md','offer_brief.md','_README.txt']){
  const form=new FormData();form.set('product','Test');form.set('file',new File(['Sample instructions'],filename));
  const response=await POST(new Request('https://example.test/api/products/import',{method:'POST',body:form}));assert.equal(response.status,200);assert.equal((await response.json()).accepted[0].role,fileRole(filename));
 }
 assert.equal(saved.length,5);assert(fs.readFileSync('app/product/page.tsx','utf8').includes('included as copywriting guidance'));
 console.log('PASS guidance roles, stable/versioned context, UK/PL generation payload and individual prompt/README import (mocked)');
})().catch(e=>{console.error(e);process.exitCode=1});
