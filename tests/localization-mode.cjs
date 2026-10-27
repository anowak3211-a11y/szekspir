const fs=require('fs'),ts=require('typescript'),Module=require('module'),assert=require('node:assert/strict');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
global.fetch=async()=>{throw Error('No live network in localisation-mode tests');};
const calls=[],state=new Map(),real=Module._load;
Module._load=function(n,p,...rest){
 if(n==='openai')return class{chat={completions:{create:async request=>{calls.push(request);return {choices:[{message:{content:JSON.stringify(request.response_format?{fixes:[]}:{uk_script:'A natural opening. Read the article below.',narration:'A natural opening. Read the article below.',hooks:[],notes:[],data_gaps:[],ad_desire:'Understand the idea',ad_angle:'Education',unique_mechanism:'',funnel:'TOF'})}}]};}}};};
 if(p?.filename.endsWith('/lib/jobs.ts')){
  if(n==='./store')return {readState:async(k,d)=>({value:state.get(k)??d}),writeState:async(k,v)=>state.set(k,v),mutate:async(k,d,f)=>{const v=state.get(k)??d;const result=f(v);state.set(k,v);return result;}};
  if(n==='./products')return {getProducts:async()=>[]};
  if(n==='./parallel-pipeline')return {};
 }
 return real.call(this,n,p,...rest);
};
(async()=>{
 const modes=require('../lib/localization-mode.ts');
 for(const absent of [undefined,null,''])assert.equal(modes.parseLocalizationMode(absent),'close');
 for(const valid of ['close','full','gemini'])assert.equal(modes.parseLocalizationMode(valid),valid);
 for(const invalid of ['creative',{},true,1])assert.throws(()=>modes.parseLocalizationMode(invalid));
 const {localize,resolveCanonicalTargetBrand,buildGeminiRipResult}=require('../lib/localize.ts');
 assert.equal(resolveCanonicalTargetBrand('pumpkin'),'Bennett & Seed');
 assert.equal(resolveCanonicalTargetBrand('custom_slug',JSON.stringify({facts:[{filename:'_product_profile.json',content:JSON.stringify({product_name:'Bennett & Seed'})}]})),'Bennett & Seed');
 const manual=buildGeminiRipResult('Source US text','Ready UK script from Gemini. Buy 2, Get 1 Free.',['Hook 1 UK','Hook 2 UK'],'uk');
 assert.equal(manual.uk_script,'Ready UK script from Gemini. Buy 2, Get 1 Free.');
 assert.deepEqual(manual.hooks,['Hook 1 UK','Hook 2 UK']);
 assert.match(manual.prompt_version,/-depth-v2-gemini$/);
 for(const market of ['uk','pl'])for(const mode of ['close','full','gemini']){
  calls.length=0;
  const result=await localize('A source opening. Read the article below.','openai','test',undefined,false,false,'','original',false,market,mode);
  const prompt=calls[0].messages[0].content;
  assert(prompt.includes(mode==='close'?'CLOSE LOCALISATION — VMAKE RIP':mode==='full'?'FULL LOCALISATION — NEW VIDEO FROM SCRATCH':'GEMINI RIP — DIRECT-RESPONSE ADAPTATION'));
  assert(prompt.includes('must not become an action by MHRA without supplied supporting evidence'));
  assert.match(result.prompt_version,new RegExp('-depth-v2-'+mode+'$'));
  if(mode==='close'){
   assert(prompt.includes('Edit the supplied script; do not write a replacement advert'));
   assert(prompt.includes('undo stylistic changes that were not necessary'));
   assert(prompt.includes('Alternative hooks, when requested, belong only in the separate hooks array'));
  }else assert(!prompt.includes('Edit the supplied script; do not write a replacement advert'));
  if(market==='uk'){assert(prompt.includes('TARGET PRODUCT QUANTITIES'));assert(prompt.includes('RULE_TYP_01'));assert(prompt.includes(mode==='close'?'VARIANT A':'VARIANT B'));}else assert(!prompt.includes('owner-localisation-document'));
  assert.deepEqual(result.hooks,[]);
 }
 calls.length=0;
 await assert.rejects(()=>localize('Lyrics','openai','test',undefined,false,true,'','original',false,'uk','full'),/singing ads/);
 await assert.rejects(()=>localize('Lyrics','openai','test',undefined,false,true,'','original',false,'uk','gemini'),/singing ads/);
 assert.equal(calls.length,0);
 const {createJob}=require('../lib/jobs.ts');
 const input={id:'mode-close-12345',transcript:'Source',provider:'openai',voiceoverEnabled:false,editorNotes:'Keep my note'};
 const close=await createJob(input);assert.equal(close.localizationMode,'close');assert.equal(close.editorNotes,'Keep my note');
 const full=await createJob({...input,id:'mode-full-12345',localizationMode:'full'});assert.equal(full.localizationMode,'full');assert.match(full.editorNotes,/create the video from scratch/);assert.match(full.editorNotes,/Keep my note/);
 const gemini=await createJob({...input,id:'mode-gemini-12345',localizationMode:'gemini',geminiScript:'Custom Gemini script',geminiHooks:['Hook A','Hook B']});assert.equal(gemini.localizationMode,'gemini');assert.equal(gemini.geminiScript,'Custom Gemini script');assert.deepEqual(gemini.geminiHooks,['Hook A','Hook B']);assert.match(gemini.editorNotes,/Gemini rip/);
 assert.equal((await createJob({...input,id:full.id,localizationMode:'close'})).localizationMode,'full','Idempotent create must not overwrite saved mode');
 await assert.rejects(()=>createJob({...input,id:'mode-bad-12345',localizationMode:'oops'}));
 await assert.rejects(()=>createJob({...input,id:'mode-song-12345',localizationMode:'full',singingAd:true}),/singing ads/);
 await assert.rejects(()=>createJob({...input,id:'mode-song-gem-12345',localizationMode:'gemini',singingAd:true}),/singing ads/);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const Choice=require('../app/szekspir/components/localization-mode.tsx').default;
 for(const polish of [true,false]){
  const html=renderToStaticMarkup(React.createElement(Choice,{value:'gemini',onChange:()=>{},polish}));
  assert.equal((html.match(/type="radio"/g)||[]).length,3);assert.match(html,/checked="" value="gemini"/);assert.match(html,/<legend/);assert.match(html,/VMake/);assert.match(html,/Gemini rip/);
 }
 for(const file of ['lib/jobs.ts','lib/parallel-pipeline.ts','app/api/jobs/regenerate-script/route.ts'])assert.match(fs.readFileSync(file,'utf8'),/job\.market,job\.localizationMode\)/);
 const ui=fs.readFileSync('app/szekspir/workspace.tsx','utf8');assert.equal((ui.match(/localizationMode:singingAd\?'close':localizationMode/g)||[]).length,2,'Both text and media/link upload drafts retain mode');
 console.log('PASS localisation depth: UK/PL prompts, validation, saved job/idempotency, editor handoff, accessible controls and all generation paths');
})().catch(error=>{console.error(error);process.exitCode=1;});
