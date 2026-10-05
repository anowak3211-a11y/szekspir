const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const load=(file,deps={})=>{const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:n=>deps[n],Date,process:{env:{}}});return module.exports;};
const brand=load('lib/brand-disclosure.ts');
for(const name of ['Bloomwise','bloom wise','BLOOM-WISE'])assert(brand.mayIntroduceMellow(name));
assert(!brand.hasUnwantedBrandReveal('I found Bloom Wise',['I found MELLOW SAFFRON GUMMIES']));
assert(brand.hasUnwantedBrandReveal('I found saffron',['I found MELLOW SAFFRON GUMMIES']));
let calls=[],output='We use Bloom Wise. Children’s Hospital of Philadelphia published an article.',hooks=[];
class OpenAI{constructor(){this.chat={completions:{create:async b=>{calls.push(b);return {choices:[{message:{content:JSON.stringify(b.response_format?{fixes:[]}:{uk_script:output,hooks,notes:[]})}}]};}}};}}
const api=load('lib/localize.ts',{
 './localization-mode':load('lib/localization-mode.ts'),'./polish-localization':{},'./market':{parseMarket:()=> 'uk'},'./no-speech':{isNonSpeechTranscript:()=>false},'./cta-mode':{parseCtaMode:x=>x,ctaInstruction:()=>''},'./brand-disclosure':brand,'./speech':{narration:x=>x},'@anthropic-ai/sdk':{},'openai':{default:OpenAI},'./localization-rules':{SYSTEM_PROMPT:'',CRITIC_PROMPT:'',PROMPT_VERSION:'test'},'./validation':{objectJson:JSON.parse,validateResult:x=>x,applyCritic:x=>({script:x,fixes:[]}),timing:()=>({}),opening:x=>x}
});
(async()=>{
 const result=await api.localize('We use bloom wise. Children’s Hospital of Philadelphia published an article.','openai','gpt-6-sol','Mellow kids product facts',false,false,'Kids Gummies','original',false);
 assert(result.uk_script.includes('MELLOW SAFFRON GUMMIES'));assert(!/bloom/i.test(result.uk_script));assert(result.narration.includes('MELLOW SAFFRON GUMMIES'));assert(result.uk_script.includes('Children’s Hospital of Philadelphia'));
 const faithful=await api.localize('We use bloom wise.','openai','gpt-6-sol',undefined,false,false,'Kids Gummies','original',false);assert(faithful.uk_script.includes('Bloom Wise'));
 output='Kids gummies can be convenient. I found Mellow Kids Gummies. Mellow helped. MELLOW SAFFRON GUMMIES. Mellow Magnesium Bisglycinate Gummies is separate.';
 hooks=['Try Mellow Saffon Gummies.','I found Mellow Gummies.'];calls=[];
 const named=await api.localize('I found Mellow.','openai','test','Older guarantee: 100 days',false,false,'Kids Gummies','original',true);
 assert.equal(named.uk_script,'Kids gummies can be convenient. I found MELLOW SAFFRON GUMMIES. MELLOW SAFFRON GUMMIES helped. MELLOW SAFFRON GUMMIES. Mellow Magnesium Bisglycinate Gummies is separate.');
 assert(named.hooks.every(x=>x.includes('MELLOW SAFFRON GUMMIES')));assert.equal(named.narration,named.uk_script);
 const instructions=calls[0].messages[0].content;assert.match(instructions,/current guarantee is 90 days/);assert.match(instructions,/Do not add a guarantee/);
 const alreadyNamed=await api.localize('I found Mellow.','openai','test',undefined,false,false,'Kids Gummies','original',false);assert(alreadyNamed.uk_script.includes('Mellow Kids Gummies'),'Faithful-source mode must not change names without target context');
 const magnesium=await api.localize('I found Mellow.','openai','test','Magnesium facts',false,false,'MELLOW Magnesium Bisglycinate Gummies','original',false);assert(magnesium.uk_script.includes('Mellow Kids Gummies'),'Saffron normalisation must not run for magnesium');
 console.log('PASS Bloomwise replacement; canonical saffron names in script/hooks/narration; 90-day instruction; faithful mode, magnesium and source institution preserved');
})().catch(e=>{console.error(e);process.exitCode=1});
