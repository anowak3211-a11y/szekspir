const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const load=(file,deps={})=>{const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:n=>n==='./mellow-saffron-brand'?load('lib/mellow-saffron-brand.ts'):deps[n],Date,process:{env:{}}});return module.exports;};
const brand=load('lib/brand-disclosure.ts');
for(const name of ['Bloomwise','bloom wise','BLOOM-WISE'])assert(brand.mayIntroduceMellow(name));
assert(!brand.hasUnwantedBrandReveal('I found Bloom Wise',['I found Mellow Mood Munchies']));
assert(brand.hasUnwantedBrandReveal('I found saffron',['I found Mellow Mood Munchies']));
let calls=[],output='We use Bloom Wise. Children’s Hospital of Philadelphia published an article.',hooks=[];
class OpenAI{constructor(){this.chat={completions:{create:async b=>{calls.push(b);return {choices:[{message:{content:JSON.stringify(b.response_format?{fixes:[]}:{uk_script:output,hooks,notes:[]})}}]};}}};}}
const api=load('lib/localize.ts',{
 './product-format':load('lib/product-format.ts'),'./uk-medication':load('lib/uk-medication.ts'),'./localization-fidelity':load('lib/localization-fidelity.ts',{'diff':require('diff'),'./product-format':load('lib/product-format.ts')}),'./localization-mode':load('lib/localization-mode.ts'),'./polish-localization':{},'./market':{parseMarket:()=> 'uk'},'./no-speech':{isNonSpeechTranscript:()=>false},'./cta-mode':{parseCtaMode:x=>x,ctaInstruction:()=>''},'./brand-disclosure':brand,'./speech':{narration:x=>x},'@anthropic-ai/sdk':{},'openai':{default:OpenAI},'./localization-rules':{SYSTEM_PROMPT:'',CRITIC_PROMPT:'',PROMPT_VERSION:'test',MELLOW_SAFFRON_NUTRIENTS:7,MELLOW_WEBSITE:'try-mellow.co'},'./validation':{objectJson:JSON.parse,validateResult:x=>x,applyCritic:x=>({script:x,fixes:[]}),timing:()=>({}),opening:x=>x}
});
(async()=>{
 const result=await api.localize('We use bloom wise. Children’s Hospital of Philadelphia published an article.','openai','gpt-6-sol','Mellow kids product facts',false,false,'Kids Gummies','original',false);
 assert(result.uk_script.includes('Mellow Mood Munchies'));assert(!/bloom/i.test(result.uk_script));assert(result.narration.includes('Mellow Mood Munchies'));assert(result.uk_script.includes('Children’s Hospital of Philadelphia'));
 const faithful=await api.localize('We use bloom wise.','openai','gpt-6-sol',undefined,false,false,'Kids Gummies','original',false);assert(faithful.uk_script.includes('Bloom Wise'));
 output='Kids gummies can be convenient. I found Mellow Kids Gummies. Mellow helped. Mellow Mood Munchies. Mellow Magnesium Bisglycinate Gummies is separate.';
 hooks=['Try Mellow Saffon Gummies.','I found Mellow Gummies.'];calls=[];
 const named=await api.localize('I found Mellow.','openai','test','Older guarantee: 100 days',false,false,'Kids Gummies','original',true);
 assert.equal(named.uk_script,'Kids gummies can be convenient. I found Mellow Mood Munchies. Mellow Mood Munchies helped. Mellow Mood Munchies. Mellow Magnesium Bisglycinate Gummies is separate.');
 assert(named.hooks.every(x=>x.includes('Mellow Mood Munchies')));assert.equal(named.narration,named.uk_script);
 const instructions=calls[0].messages[0].content;assert.match(instructions,/current guarantee is 90 days/);assert.match(instructions,/Do not add a guarantee/);
 output='He felt more mellow. I found Mellow Kids Gummies. Mellow helped.';hooks=[];const adjective=await api.localize('He felt more mellow. I found Bloomwise.','openai','test','Saffron facts',false,false,'Mellow Mood Munchies','original',false);assert(adjective.uk_script.startsWith('He felt more mellow.'));assert(adjective.uk_script.includes('Mellow Mood Munchies helped.'));
 output='Try Mellow at https://try-mellow.co/start. Email help@try-mellow.co. Visit try-mellow.co. www.try-mellow.co';hooks=[];const urlSafe=await api.localize('I found Bloomwise.','openai','test','Saffron facts',false,false,'Mellow Mood Munchies','original',false);assert(urlSafe.uk_script.includes('https://try-mellow.co/start'));assert(urlSafe.uk_script.includes('help@try-mellow.co'));assert(urlSafe.uk_script.includes('www.try-mellow.co'));assert(!urlSafe.uk_script.includes('try-MELLOW'));output='Get it from HelloBloomKids.com. Visit https://HelloBloomKids.com. Read https://example.org/study. Email help@try-mellow.co.';
 const targetSite=await api.localize('Try Bloomwise. Get it from HelloBloomKids.com.','openai','test','Saffron facts',false,false,'Mellow Mood Munchies','original',false);
 assert.equal(targetSite.uk_script,'Get it from try-mellow.co. Visit https://try-mellow.co. Read https://example.org/study. Email help@try-mellow.co.');assert.equal(targetSite.narration,targetSite.uk_script);
 output='Get it from try-mello.co. Email help@try-mello.co.';hooks=['Visit try-mello.co.','Go to HelloBloomKids.com.']; const correctedSpelling=await api.localize('Try Bloomwise.','openai','test','Saffron facts',false,false,'Mellow Mood Munchies','original',true);assert.equal(correctedSpelling.uk_script,'Get it from try-mellow.co. Email help@try-mello.co.');assert.deepEqual(Array.from(correctedSpelling.hooks),['Visit try-mellow.co.','Go to try-mellow.co.']);hooks=[];output='Get it from HelloBloomKids.com.';
 const sourceSite=await api.localize('Try Bloomwise. Get it from HelloBloomKids.com.','openai','test',undefined,false,false,'Mellow Mood Munchies','original',false);assert(sourceSite.uk_script.includes('HelloBloomKids.com'));
 output='Mellow Kids Gummies';
 const alreadyNamed=await api.localize('I found Mellow.','openai','test',undefined,false,false,'Kids Gummies','original',false);assert(alreadyNamed.uk_script.includes('Mellow Kids Gummies'),'Faithful-source mode must not change names without target context');
 const magnesium=await api.localize('I found Mellow.','openai','test','Magnesium facts',false,false,'MELLOW Magnesium Bisglycinate Gummies','original',false);assert(magnesium.uk_script.includes('Mellow Kids Gummies'),'Saffron normalisation must not run for magnesium');
 console.log('PASS Bloomwise replacement; canonical saffron names in script/hooks/narration; 90-day instruction; faithful mode, magnesium and source institution preserved');
})().catch(e=>{console.error(e);process.exitCode=1});
