const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
global.fetch=async()=>{throw Error('No live network in composition tests');};
// Public test fixture transcribed from the supplied foundation profile on 5 October 2026.
const profile={product_name:'Mellow Mood Munchies',ingredients:['Saffron extract','Magnesium glycinate','L-theanine','Vitamin D','B vitamins']};
const {productContext}=require('../lib/product-context.ts');
const context=productContext([{filename:'_product_profile.json',markdown:JSON.stringify(profile)}]).markdown;
const ingredientText='Saffron, magnesium glycinate, L-theanine, vitamin D and B vitamins.';
let outputs=[],requests=[];
const real=Module._load;
Module._load=function(n,p,...rest){
 if(n==='openai')return class{chat={completions:{create:async request=>{
  requests.push(request);
  const value=request.response_format?{fixes:[]}:outputs.shift();
  assert(value,'Unexpected model generation');
  return {choices:[{message:{content:JSON.stringify(value)}}]};
 }}}};
 return real.call(this,n,p,...rest);
};
const result=(uk_script,hooks=[])=>({uk_script,narration:uk_script,hooks,notes:[],data_gaps:[],ad_desire:'Family routines',ad_angle:'Ingredient formulation',unique_mechanism:'Saffron',funnel:'TOF'});
const generationCount=()=>requests.filter(r=>!r.response_format).length;
(async()=>{
 const {localize}=require('../lib/localize.ts');
 const source='Here is the formula. Bloomwise. Saffron plus 14 natural ingredients. Read the article below.';
 const expected='Here is the formula. Mellow Mood Munchies. Saffron plus 6 natural ingredients. Read the article below.';
 for(const bad of ['14 natural ingredients','fourteen other natural ingredients','14 other active ingredients']){
  const compact=expected.replace('6 natural ingredients',bad.replace(/14|fourteen/,'6'));
  requests=[];outputs=[result(source.replace('14 natural ingredients',bad)),result(compact)];
  const r=await localize(source.replace('14 natural ingredients',bad),'openai','test',context,false,false,'MELLOW','original',false);
  assert.equal(r.uk_script,compact);assert.equal(r.narration,compact.replace('6','six'));assert.equal(generationCount(),2);
  assert.match(requests[0].messages[0].content,/confirmed 7 nutrients in total/);
  assert.match(requests[1].messages[1].content,/Correct only the advertised-product composition/);
  const originalPayload=JSON.parse(requests[0].messages[1].content);
  assert.deepEqual(JSON.parse(originalPayload.productContext).facts[0].content.ingredients,profile.ingredients);
  assert.match(r.prompt_version,/v26-short-mood-munchies/);
 }
 // A copied count in an alternative hook is checked too.
 requests=[];outputs=[result(expected,['Saffron plus fourteen other ingredients.','Second opening.']),result(expected,['See what is in the formula.','Second opening.'])];
 const hooks=await localize(source,'openai','test',context,false,false,'Kids Gummies');
 assert.equal(generationCount(),2);assert(!hooks.hooks.some(x=>/fourteen|14/.test(x)));
 // A repeated failure must stop before any language-check or saved output.
 requests=[];outputs=[result(source),result(source)];
 await assert.rejects(()=>localize(source,'openai','test',context,false,false,'Kids Gummies','original',false),/No new script was saved/);
 assert.equal(requests.length,2);
 // Already-correct target composition requires no repair call.
 requests=[];outputs=[result(expected)];
 await localize(source,'openai','test',context,false,false,'Kids Gummies','original',false);
 assert.equal(generationCount(),1);
 // The owner's screenshot: keep the compact phrase, reject lists and noun changes.
 const nutrientSource='And after six weeks, all 14 nutrients have refueled their gut. Try Bloomwise.';
 const nutrientExpected='And after six weeks, all 7 nutrients have refuelled their gut. Try Mellow Mood Munchies.';
 for(const bad of [nutrientExpected.replace('all 7 nutrients','all 14 nutrients'),nutrientExpected.replace('all 7 nutrients','all fourteen nutrients'),nutrientExpected.replace('all 7 nutrients','all 8 nutrients'),nutrientExpected.replace('all 7 nutrients','all 7 ingredients'),nutrientExpected.replace('all 7 nutrients','the saffron extract, magnesium glycinate, L-theanine, vitamin D and B vitamins')]){
  requests=[];outputs=[result(bad),result(nutrientExpected)];
  const r=await localize(nutrientSource,'openai','test',context,false,false,'Kids Gummies','original',false);
  assert.equal(r.uk_script,nutrientExpected);assert.equal(r.narration,nutrientExpected.replace('7','seven'));assert.equal(generationCount(),2);
 }
 // Repeated enumeration also fails instead of saving rewritten copy.
 const expanded=nutrientExpected.replace('all 7 nutrients',ingredientText.slice(0,-1));
 requests=[];outputs=[result(expanded),result(expanded)];
 await assert.rejects(()=>localize(nutrientSource,'openai','test',context,false,false,'Kids Gummies','original',false),/No new script was saved/);
 // Correct written counts need no extra generation, including alternative hooks.
 requests=[];outputs=[result(nutrientExpected.replace('7','seven'),['All seven nutrients.','Saffron plus six natural ingredients.'])];
 await localize(nutrientSource,'openai','test',context,false,false,'Kids Gummies');assert.equal(generationCount(),1);
 // MEL-124 ASR names two nutrients before "plus": 7 total leaves five more.
 const pairedSource='she pointed me to bloom wise clinical grade saffron and vitamin D at the right dose plus twelve more supporting nutrients zero sugar';
 const pairedExpected='She pointed me to Mellow Mood Munchies. Clinical-grade saffron and vitamin D at the right dose plus five more supporting nutrients. Zero sugar.';
 for(const count of ['five','5']){
  const correct=pairedExpected.replace('five',count);
  requests=[];outputs=[result(correct)];
  const r=await localize(pairedSource,'openai','test',context,false,false,'Kids Gummies','original',false);
  assert.equal(r.uk_script,correct);assert.equal(generationCount(),1);
 }
 for(const count of ['six','6']){
  const incorrect=pairedExpected.replace('five',count);
  requests=[];outputs=[result(incorrect),result(pairedExpected)];
  const corrected=await localize(pairedSource,'openai','test',context,false,false,'Kids Gummies','original',false);
  assert.equal(corrected.uk_script,pairedExpected);assert.equal(generationCount(),2);
  requests=[];outputs=[result(incorrect),result(incorrect)];
  await assert.rejects(()=>localize(pairedSource,'openai','test',context,false,false,'Kids Gummies','original',false),/No new script was saved/);
 }
 // An explicit source list remains a list; a generic single nutrient is not the total.
 for(const text of ['One nutrient helped. Try Bloomwise.','Saffron, magnesium and vitamin D. Try Bloomwise.']){
  requests=[];outputs=[result(text.replace('Bloomwise','Mellow Mood Munchies'))];
  await localize(text,'openai','test',context,false,false,'Kids Gummies','original',false);assert.equal(generationCount(),1);
 }
 // Source comparison, generic education and other products remain outside this guard.
 for(const [text,product,target,singing] of [[source,undefined,'Kids Gummies',false],['Researchers examined 14 natural ingredients.',context,'Kids Gummies',false],[source,'Magnesium facts','MELLOW Magnesium Bisglycinate Gummies',false],[source,context,'Kids Gummies',true]]){
  requests=[];outputs=[result(text)];
  await localize(text,'openai','test',product,false,singing,target,'original',false);
  assert.equal(generationCount(),1);
 }
 console.log('PASS owner-confirmed 7 total / saffron plus 6 / saffron and vitamin D plus 5; compact wording and nutrients noun retained; stale counts and enumerated rewrites blocked; explicit lists and comparison/generic/magnesium/singing preserved (offline mocks)');
})().catch(e=>{console.error(e);process.exitCode=1});
