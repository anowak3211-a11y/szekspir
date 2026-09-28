const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {isNonSpeechTranscript}=require('../lib/no-speech.ts');
for(const t of ['', '   ', '🎶 Music Outro 🎶', '[Music]', '[music] (applause)', 'Instrumental music'])assert(isNonSpeechTranscript(t),t);
for(const t of [undefined,null,'[inaudible]','Music makes me happy.','🎶 I love you 🎶','[Music] Hello there.','Thank you for watching.'])assert(!isNonSpeechTranscript(t),String(t));
let paid=0;const load=Module._load;
Module._load=function(n,p,i){if(n==='openai')return class{constructor(){paid++;throw Error('No provider call expected')}};return load.call(this,n,p,i)};
(async()=>{
 const {localize}=require('../lib/localize.ts');
 const r=await localize('🎶 Music Outro 🎶','openai','test');assert(r.no_speech);assert.equal(r.uk_script,'');assert.equal(r.narration,'');assert.deepEqual(r.hooks,[]);assert.equal(paid,0);
 let job={id:'test-no-speech',engine:2,status:'Queued',step:'localise',transcript:'🎶 Music Outro 🎶',sourceUrl:'https://example.com/video.mp4',video:true,enhanceVideo:true,vmakeMode:'enhance',generateVo:true,voiceoverEnabled:true,generateHooks:true,provider:'openai',cleanUrl:'https://example.com/enhanced.mp4',stages:{transcribe:{done:true},enhanceSubmit:{done:true},enhancePoll:{done:true},videoPoll:{done:true}}};
 const state={'job-test-no-speech':job};let exported=0,refs=0;
 Module._load=function(n,p,i){if(p?.filename.endsWith('parallel-pipeline.ts')){
 if(n==='./jobs')return {getJob:async()=>structuredClone(job),pythonCall:()=>{throw Error('Must not resubmit VMake')},finalise:()=>{throw Error('Must not repeat video saving')}};
 if(n==='./store')return {mutate:async(key,fallback,fn)=>fn(state[key]??=fallback)};
 if(n==='./sheets')return {appendToAdminBriefs:async row=>{assert(row.noSpeech);assert.equal(row.uk,'');assert.deepEqual(row.hooks,[]);exported++;return {adId:'MEL-TEST'}},updateReference:async()=>{refs++}};
 if(n==='./editor-sync')return {syncAssignedEditor:async()=>{}};
 if(n==='./elevenlabs')return {generateVO:()=>{throw Error('Must not generate speech')}};
 }return load.call(this,n,p,i)};
 const {advanceParallel}=require('../lib/parallel-pipeline.ts');
 await advanceParallel(job.id);assert(job.result.no_speech);assert.equal(job.generateVo,false);assert.equal(job.voiceoverEnabled,false);
 await advanceParallel(job.id);await advanceParallel(job.id);
 assert.equal(job.status,'Complete');assert.equal(exported,1);assert.equal(refs,1);assert.equal(job.cleanUrl,'https://example.com/enhanced.mp4');assert.equal(paid,0);
 console.log('PASS non-speech detection, real speech retained, no LLM/VO calls, completed video retained, brief exported and pipeline completed');
})().catch(e=>{console.error(e);process.exitCode=1});
