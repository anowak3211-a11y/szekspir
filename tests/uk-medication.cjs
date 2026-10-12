const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
global.fetch=async()=>{throw Error('No live network in medication-name tests');};
const {canonicalUkMedicationName:replace}=require('../lib/uk-medication.ts'),{narration}=require('../lib/speech.ts');
const source="Ritalin, ritalin and RITALIN.\nRitalin's name stays in this sentence; keep 10 mg and methylphenidate unchanged.";
const expected=source.replace(/Ritalin/gi,'Concerta XL');
assert.equal(replace(source),expected);assert.equal(replace(expected),expected);
assert.equal(replace('Ritaline and preRitalin are different words.'),'Ritaline and preRitalin are different words.');
const references='Ritalin. https://example.org/Ritalin https://Ritalin.com/study ritalin.com ritalin@example.org';
assert.equal(replace(references),'Concerta XL. https://example.org/Ritalin https://Ritalin.com/study ritalin.com ritalin@example.org');
assert.equal(narration('Ritalin.','uk'),'Concerta XL.');assert.equal(narration('Ritalin.','pl'),'Ritalin.');
let requests=[],output;
const real=Module._load;
Module._load=function(n,p,...rest){
 if(n==='openai')return class{chat={completions:{create:async r=>{
  requests.push(r);return {choices:[{message:{content:JSON.stringify(r.response_format?{fixes:[]}:output)}}]};
 }}}};
 return real.call(this,n,p,...rest);
};
const result=(text)=>({uk_script:text,narration:text,hooks:['Ritalin is the name.','Another RITALIN mention.'],notes:[],data_gaps:[],ad_desire:'Read the original',ad_angle:'Same wording',unique_mechanism:'',funnel:'TOF'});
(async()=>{
 const {localize}=require('../lib/localize.ts');
 for(const context of [undefined,'Selected product facts']){
  output=result(source);requests=[];const r=await localize(source,'openai','test',context,false,false,'MELLOW');
  assert.equal(r.uk_script,expected);assert.deepEqual(r.hooks,['Concerta XL is the name.','Another Concerta XL mention.']);assert(!/\bRitalin\b/i.test(r.narration));assert.equal(JSON.parse(requests[0].messages[1].content).sourceTranscript,source,'Original source is retained for comparison');assert.match(requests[0].messages[0].content,/always replace.*Ritalin with Concerta XL/);assert.equal(requests.filter(r=>!r.response_format).length,1,'Literal correction needs no paid repair call');
 }
 output=result('Ritalin! Same lyrics.');const sung=await localize('Ritalin! Same lyrics.','openai','test',undefined,false,true,'MELLOW');assert.equal(sung.uk_script,'Concerta XL! Same lyrics.');assert.equal(sung.narration,sung.uk_script);
 output=result(source);const pl=await localize(source,'openai','test',undefined,false,false,'','original',true,'pl');assert.equal(pl.uk_script,source);assert(pl.narration.includes('Ritalin'));
 console.log('PASS literal Ritalin→Concerta XL in UK script/hooks/narration/lyrics, exact surrounding copy, source/reference/PL preservation, idempotence and no extra model call');
})().catch(e=>{console.error(e);process.exitCode=1});
