const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {parseCtaMode}=require('../lib/cta-mode.ts');assert.equal(parseCtaMode(undefined),'original');assert.throws(()=>parseCtaMode('anything'));
const calls=[];let invalidOnce=false;const original=Module._load;
class FakeAI{constructor(){this.chat={completions:{create:async ({messages})=>{calls.push(messages);const critic=messages[0].content.startsWith('Find ONLY');if(critic)return{choices:[{message:{content:'{"fixes":[]}'}}]};if(invalidOnce){invalidOnce=false;return{choices:[{message:{content:'{}'}}]};}return{choices:[{message:{content:JSON.stringify({uk_script:'Original body. Click below to learn more.',narration:'Ignored narration',hooks:messages[0].content.includes('MANUAL HOOK CHOICE')?[]:['Opening one.','Opening two.'],ad_desire:'Learn about it',ad_angle:'Education',unique_mechanism:'',funnel:'TOF',notes:[],data_gaps:[]})}}]};}}};}}
Module._load=function(n,...args){if(n==='openai')return FakeAI;return original.call(this,n,...args)};
const {localize}=require('../lib/localize.ts');
(async()=>{
 invalidOnce=true;const result=await localize('Original body. Buy now.','openai','test','Offer: Buy 2 Get 1 Free',false,false,'MELLOW','learn-more');
 const generations=calls.filter(c=>!c[0].content.startsWith('Find ONLY'));assert.equal(generations.length,2);for(const c of generations)assert(c[0].content.includes('MANUAL CTA CHOICE — LEARN MORE, NO OFFER'));assert.equal(result.narration,result.uk_script);assert(result.prompt_version.endsWith('-cta-learn-more'));
 calls.length=0;await localize('Original body. Buy now.','openai','test');assert(calls[0][0].content.includes('MANUAL CTA CHOICE — ORIGINAL'));
 calls.length=0;const sung=await localize('Original sung words.','openai','test',undefined,false,true,'MELLOW','learn-more');assert.equal(sung.uk_script,'Original sung words.');assert(!calls[0][0].content.includes('MANUAL CTA CHOICE — LEARN MORE'));
 calls.length=0;const noHooks=await localize('Original body. Buy now.','openai','test',undefined,false,false,'MELLOW','original',false);assert.deepEqual(noHooks.hooks,[]);assert.equal(calls.filter(c=>c[0].content.startsWith('Find ONLY')).length,1);
 console.log('PASS CTA defaults, invalid input, generation/retry instructions, matching narration, singing fidelity');
})().catch(e=>{console.error(e);process.exitCode=1});
