const fs=require('fs'),ts=require('typescript'),Module=require('module'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
global.fetch=async()=>{throw Error('Network prohibited in offline tests');};
const requests=[],state=new Map();const load=Module._load;
let ttsBody;
Module._load=function(n,p,...args){
 if(n==='openai')return class{chat={completions:{create:async request=>{requests.push(request);const system=request.messages[0].content;if(system.startsWith('Find ONLY'))return {choices:[{message:{content:'{"fixes":[]}'}}]};const pl=system.includes('natural, idiomatic Polish');return {choices:[{message:{content:JSON.stringify({uk_script:pl?'Weź 2 kapsułki. Cena 49,99 zł.':'Take 2 capsules.',narration:'narration',hooks:system.includes('MANUAL HOOK CHOICE')?[]:pl?['Pierwszy hook.','Drugi hook.']:['First hook.','Second hook.'],ad_desire:'Daily energy',ad_angle:'Morning routine',unique_mechanism:'',funnel:'TOF',notes:[],data_gaps:[]})}}]};}}};};
 if(p?.filename.endsWith('/lib/jobs.ts')){
  if(n==='./store')return {readState:async(k,d)=>({value:state.get(k)??d}),writeState:async(k,v)=>state.set(k,v),mutate:async(k,d,f)=>{const v=state.get(k)??d;const out=f(v);state.set(k,v);return out;}};
  if(n==='./products')return {getProducts:async()=>[]};
  if(n==='./parallel-pipeline')return {};
 }
 if(p?.filename.endsWith('/lib/elevenlabs.ts')&&n==='./vo-cleanup')return {cleanVoiceover:async raw=>raw};
 return load.call(this,n,p,...args);
};
(async()=>{
 const {parseMarket,matchesMarket}=require('../lib/market.ts');
 assert.equal(parseMarket(undefined),'uk');assert.throws(()=>parseMarket('fr'));assert(matchesMarket({},'uk'));assert(!matchesMarket({},'pl'));
 const {localize,prepareNarration}=require('../lib/localize.ts');
 const pl=await localize('Take 2 capsules. Price $49.99.','openai','test',undefined,false,false,'MELLOW','original',true,'pl');
 assert.match(pl.uk_script,/Weź/);assert.equal(pl.narration,pl.uk_script);assert.match(pl.prompt_version,/^pl-/);assert.equal(pl.language_check,undefined);assert.equal(requests.length,1,'PL never runs the British-only critic');
 assert(!requests[0].messages[0].content.includes('Boots'));assert(!requests[0].messages[0].content.includes('Buy 2, Get 1 Free'));
 assert.equal(await prepareNarration('[scene] Weź 2 kapsułki.','openai','test','pl'),'Weź 2 kapsułki.');
 const noHooks=await localize('Source','openai','test',undefined,false,false,'','learn-more',false,'pl');assert.deepEqual(noHooks.hooks,[]);assert.match(noHooks.prompt_version,/cta-learn-more$/);
 await assert.rejects(()=>localize('Lyrics','openai','test',undefined,false,true,'','original',true,'pl'));
 requests.length=0;const uk=await localize('Take 2 capsules.','openai','test');assert.equal(uk.narration,'Take two capsules.');assert(uk.language_check);assert.equal(requests.length,4);
 const {createJob}=require('../lib/jobs.ts');
 const input={id:'polish-job-12345',transcript:'Take two capsules.',provider:'openai',video:false,voiceoverEnabled:false};
 const job=await createJob({...input,market:'pl'});assert.equal(job.market,'pl');assert.equal(job.productName,'');
 await assert.rejects(()=>createJob({...input,market:'uk'}),/different market/);
 assert.equal((await createJob({...input,id:'legacy-job-12345'})).market,'uk');
 await assert.rejects(()=>createJob({...input,id:'invalid-job-12345',market:'de'}));
 const {selectableVoices}=require('../lib/voice-library.ts');
 const voices=[{voice_id:'polish',name:'PL',labels:{language:'pl'}},{voice_id:'british',name:'UK',labels:{accent:'British'}}];
 assert.deepEqual(selectableVoices(voices,'pl').map(v=>v.voice_id),['polish']);assert.deepEqual(selectableVoices(voices).map(v=>v.voice_id),['british']);
 const {generateVO}=require('../lib/elevenlabs.ts');process.env.ELEVENLABS_API_KEY='offline-placeholder';
 global.fetch=async(url,options)=>{ttsBody=JSON.parse(options.body);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};};
 await generateVO('Weź 2 kapsułki za 49,99 zł.','fake',undefined,{mode:'standard',normalize:false,emotion:'off'},'voiceover','pl');
 assert.equal(ttsBody.text,'Weź 2 kapsułki za 49,99 zł.');
 console.log('PASS Polish generation, UK compatibility, persisted market, voice filtering and Polish TTS numbers (offline)');
})().catch(e=>{console.error(e);process.exitCode=1;});
