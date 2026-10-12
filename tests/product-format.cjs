const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
global.fetch=async()=>{throw Error('No live network in format tests');};
const {hasGummyFormatAttack,withoutGummyFormatCritique}=require('../lib/product-format.ts'),{closeFidelity}=require('../lib/localization-fidelity.ts');
const old="Most saffron for kids comes as a gummy. A gummy is a sweet pretending to be medicine. Sugar that spikes a brain that's already struggling. And gummies have to survive the stomach. Most of what you paid for never reaches the brain. Pills they can't swallow. Powders they refuse. The bottle ends up in the cupboard with all the other half-used ones.";
const positive="Most saffron for kids comes as a gummy. And a sugar-free gummy makes sense. Something they can chew, without another sugary sweet. Compare that with pills they can't swallow. Powders they refuse. A daily battle before they've even taken anything. Because even the right ingredients won't help if the bottle ends up in the cupboard with all the other half-used ones.";
assert(hasGummyFormatAttack(old));assert(!hasGummyFormatAttack(positive));assert(!hasGummyFormatAttack('A gummy is not a sweet pretending to be medicine.'));
const prefix='Keep this exact original sentence and every word in its original position. '.repeat(7),ending='This is Bloomwise. Keep the original ending and the same offer. You can read more below.';
const source=prefix+old+' '+ending,adapted=prefix+positive+' '+ending;
const reference=withoutGummyFormatCritique(source);assert(reference.includes(prefix.trim()));assert(reference.includes(ending));assert(!reference.includes('sweet pretending'));assert(!reference.includes('Pills they'));
assert(closeFidelity(source,adapted,'original',true),'Owner-authorised format passage can change');
assert(!closeFidelity(source,'Completely different story. '.repeat(30)+positive+' '+ending,'original',true),'Other copy retains its full fidelity guard');
assert.equal(withoutGummyFormatCritique('Gummies can be easy to chew. Keep everything.'),'Gummies can be easy to chew. Keep everything.');
let output=[],requests=[];
const real=Module._load;Module._load=function(n,p,...rest){
 if(n==='openai')return class{chat={completions:{create:async request=>{
  requests.push(request);const value=request.response_format?{fixes:[]}:output.shift();assert(value,'Unexpected model repair');return {choices:[{message:{content:JSON.stringify(value)}}]};
 }}}};
 return real.call(this,n,p,...rest);
};
const result=uk_script=>({uk_script,narration:uk_script,hooks:[],notes:[],data_gaps:[],ad_desire:'An easier routine',ad_angle:'Gummy format',unique_mechanism:'',funnel:'TOF'});
(async()=>{
 const {localize}=require('../lib/localize.ts');
 for(const target of ['Mellow Mood Munchies','MELLOW Magnesium Bisglycinate Gummies']){
  requests=[];output=[result(source),result(adapted)];const r=await localize(source,'openai','test','Target sugar-free gummy facts',false,false,target,'original',false);
  const expected=adapted.replace('Bloomwise',target);assert.equal(r.uk_script,expected);assert.equal(r.narration,expected);assert.equal(requests.filter(r=>!r.response_format).length,2);assert.match(requests[0].messages[0].content,/Rewrite only the existing format-criticism passage/);
 }
 requests=[];output=[result(source),result(source)];await assert.rejects(()=>localize(source,'openai','test','Gummy facts',false,false,'Mellow Mood Munchies','original',false),/still attacks/);assert.equal(requests.length,2,'Repeated self-attack stops before any critic/save');
 for(const [context,target,singing] of [[undefined,'Mellow Mood Munchies',false],['Capsule facts','Other capsule',false],['Gummy facts','Mellow Mood Munchies',true]]){
  requests=[];output=[result(source)];await localize(source,'openai','test',context,false,singing,target,'original',false);assert.equal(requests.filter(r=>!r.response_format).length,1,'No format rewrite outside authorised gummy adaptation');
 }
 console.log('PASS gummy self-attack correction and refusal after repeated failure; targeted format rewrite preserves surrounding body/reveal, source comparison, other formats and lyrics');
})().catch(e=>{console.error(e);process.exitCode=1});
