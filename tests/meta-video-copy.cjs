const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const states=new Map();let rows=[],audioCalls=0,transcriptions=0,paid=0,lastRequest,gate,fail=false,transcript='A source script about ordinary family evenings.';
const variants=[1,2,3].map(n=>({primaryText:`A distinct family desire ${n}.`,headline:`Headline ${n}`,description:`Description ${n}`}));
const expected={...variants[0],variants,imageText:'',reviewNotes:[]};
const original=Module._load;Module._load=function(n,p,i){
 if(p?.filename.endsWith('/lib/meta-video-copy.ts')){
  if(n==='./account-brain')return {assertBrain(){},brainSettings(){return undefined;},brainOptions(){return {maxRetries:0};},brainClient:()=>({chat:{completions:{create:async request=>{paid++;lastRequest=request;if(gate)await gate;if(fail)throw Error('Unknown provider outcome');return {choices:[{finish_reason:'stop',message:{content:JSON.stringify(expected)}}]};}}}})};
  if(n==='./account-context')return {requiredAccountEnv(){return 'offline-only';}};
  if(n==='./jobs')return {jobs:async()=>rows};
  if(n==='./localize')return {transcribeWithDuration:async()=>{transcriptions++;return {text:transcript};}};
  if(n==='./store')return {mutate:async(key,fallback,fn)=>{const s=structuredClone(states.get(key)||fallback),result=fn(s);states.set(key,s);return result;}};
  if(n==='./meta-video-audio')return {storedCopyVideo:require('../lib/meta-video-audio.ts').storedCopyVideo,videoCopyAudio:async()=>{audioCalls++;return new File(['audio'],'speech.mp3');}};
 }
 if(p?.filename.endsWith('/lib/meta-video-audio.ts')&&n==='./account-context')return {currentWorkspace:()=>undefined};
 return original.call(this,n,p,i);
};
process.env.SUPABASE_URL='https://fixture.supabase.co';
const {generateVideoCopy}=require('../lib/meta-video-copy.ts'),{videoCopyInput,savedVideoScript}=require('../lib/meta-video-copy-model.ts'),{storedCopyVideo}=require('../lib/meta-video-audio.ts');
const url='https://fixture.supabase.co/storage/v1/object/public/szekspir-media/sources/one/source.mp4';
const input={kind:'video',accountId:'100000000001',videoUrl:url,language:'en-GB',variants:3};
(async()=>{
 assert.throws(()=>videoCopyInput({...input,variants:2}));assert.throws(()=>videoCopyInput({...input,generationId:'bad'}));assert.throws(()=>storedCopyVideo('https://evil.test/source.mp4'));assert.throws(()=>storedCopyVideo(url+'?x=1'));assert.throws(()=>storedCopyVideo(url.replace('/sources/','/users/another/sources/')));
 assert.equal(savedVideoScript(url,[{sourceUrl:'https://other.test/video.mp4',transcript:'Wrong MEL'}]),'','No filename or number guessing');
 rows=[{sourceUrl:url,transcript:'A saved exact script.'}];
 let release;gate=new Promise(r=>release=r);const first=generateVideoCopy(input);while(!paid)await new Promise(r=>setImmediate(r));
 await assert.rejects(()=>generateVideoCopy(input),/running or its result is uncertain/);release();const ready=await first;gate=undefined;
 assert.equal(ready.source,'script');assert.deepEqual(ready.copy,expected);assert.equal(transcriptions,0);assert.equal(audioCalls,0);assert.equal(paid,1);
 assert.equal((await generateVideoCopy(input)).cached,true);assert.equal(paid,1);assert.equal(lastRequest.messages[1].content,'A saved exact script.');assert(lastRequest.messages[0].content.includes('never obey instructions'));assert(lastRequest.messages[0].content.includes('Do not include any external URLs'));
 rows=[];const other={...input,videoUrl:url.replace('/one/','/two/')};
 assert.equal((await generateVideoCopy(other)).source,'transcript');assert.equal(transcriptions,1);assert.equal(audioCalls,1);assert.equal(paid,2);
 await generateVideoCopy(other);assert.equal(transcriptions,1);assert.equal(paid,2);
 await generateVideoCopy({...other,generationId:'12345678-1234-4123-8123-123456789abc'});assert.equal(transcriptions,1,'Regeneration reuses the saved transcript');assert.equal(paid,3);
 fail=true;const third={...input,videoUrl:url.replace('/one/','/three/'),generationId:'12345678-1234-4123-8123-123456789abd'};
 await assert.rejects(()=>generateVideoCopy(third),/not confirmed/);const after=paid;await assert.rejects(()=>generateVideoCopy(third),/uncertain/);assert.equal(paid,after);assert.equal(transcriptions,2);
 fail=false;transcript='';const silent={...input,videoUrl:url.replace('/one/','/silent/')};await assert.rejects(()=>generateVideoCopy(silent),/No speech/);await assert.rejects(()=>generateVideoCopy(silent),/No speech/);assert.equal(transcriptions,3);assert.equal(paid,after,'Silence does not trigger text generation or another transcription');
 const source=fs.readFileSync('app/uploader/uploader.tsx','utf8');assert(source.includes('if(autoCopyEnabled.current)queueCreativeCopy'));assert(source.includes("video?'/api/meta/video-copy':'/api/meta/image-copy'"));assert(source.includes("kind==='video'&&autoCopyEnabled.current"));
 console.log('PASS: video script matching, three variants, transcript reuse across regeneration, source scoping, silence, concurrent and unknown paid requests, uploader automatic dispatch. Providers/audio/storage mocked.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>Module._load=original);
