const fs=require('fs'),ts=require('typescript'),Module=require('module'),assert=require('assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
let request,reply={content:'{"fixes":[{"original":"color","replacement":"colour","reason":"UK spelling"}]}'};
const load=Module._load;
Module._load=function(n,p,i){
 if(n==='openai')return class{chat={completions:{create:async r=>{request=r;return {choices:[{message:reply}]}}}}};
 if(n==='@anthropic-ai/sdk')return class{messages={create:async r=>{request=r;return {content:[{type:'text',text:reply.content}]}}}};
 return load.call(this,n,p,i);
};
const {critic,languageCheckError}=require('../lib/localize.ts');
(async()=>{
 for(const provider of ['openai','custom']){
  const r=await critic('The color is blue.',provider,'unused');
  assert.equal(r.uk_script,'The colour is blue.');
  assert.equal(request.model,'gpt-6-sol');assert.equal(request.reasoning_effort,'low');
  assert.equal(request.response_format.type,'json_schema');assert.equal(request.response_format.json_schema.strict,true);
 }
 await critic('The color is blue.','anthropic','unused');assert.equal(request.model,'claude-haiku-4-5-20251001');
 reply={content:'{"fixes":[{"original":"Buy for £29.99","replacement":"Buy for £19.99","reason":"rewrite"}]}'};
 assert.equal((await critic('Buy for £29.99.','openai','unused')).uk_script,'Buy for £29.99.');
 reply={refusal:'private response'};
 await assert.rejects(()=>critic('Example.','openai','unused'),e=>e.code==='content_refusal');
 assert(languageCheckError({status:429},1).includes('Hook 1'));assert(languageCheckError({status:401}).includes('authentication'));assert(languageCheckError({status:404}).includes('model'));assert(!languageCheckError({message:'secret transcript'}).includes('secret'));
 console.log('PASS GPT-6 Sol low critic on OpenAI/custom; Anthropic unchanged; strict schema, bounded edits and refusal handling');
})().catch(e=>{console.error(e);process.exitCode=1});
