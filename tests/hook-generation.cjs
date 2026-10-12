const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
let outputs=[],requests=[];const real=Module._load;
Module._load=function(n,p,...rest){
 if(n==='openai')return class{chat={completions:{create:async request=>{
  requests.push(request);const result=request.response_format?{fixes:[]}:{hook:outputs.shift()};return {choices:[{message:{content:JSON.stringify(result)}}]};
 }}}};
 return real.call(this,n,p,...rest);
};
global.fetch=async()=>{throw Error('No live network in hook generation tests');};
const script="Remember the last time your child had a meltdown for an hour? I'm ADHD, standing between your voice and his brain. Later in this advert: MELLOW SAFFRON GUMMIES.";
const current="What if those hour-long tantrums aren't about your child refusing to listen? Let me show you what I mean.",other='You can repeat yourself ten times, and he still melts down.';
const stronger="Your child isn't ignoring you. I'm ADHD, and I'm standing between your voice and his brain. Keep blaming him. That's exactly what I want.";
(async()=>{
 const {generateStrongerHook}=require('../lib/localize.ts');const input={script,currentHook:current,otherHook:other,provider:'openai',model:'gpt-6-sol',productName:'MELLOW SAFFRON GUMMIES',market:'uk'},before=JSON.stringify(input);
 outputs=[stronger];requests=[];assert.equal(await generateStrongerHook(input),stronger);assert.equal(JSON.stringify(input),before);assert.equal(requests.filter(r=>!r.response_format).length,1);assert.equal(requests[0].reasoning_effort,'low');assert.match(requests[0].messages[0].content,/ONE stronger/);assert.equal(JSON.parse(requests[0].messages[1].content).approvedScript,script);
 for(const rejected of [current,other,'What if this is an even better opening?', 'MELLOW SAFFRON GUMMIES are the product to reveal straight away.']){outputs=[rejected,stronger];requests=[];assert.equal(await generateStrongerHook(input),stronger);assert.equal(requests.filter(r=>!r.response_format).length,2);}
 outputs=[current,current];await assert.rejects(()=>generateStrongerHook(input),/saved hook was not changed/);
 outputs=['Ritalin is the name already mentioned in this original opening.'];const renamed=await generateStrongerHook({...input,script:'Ritalin was mentioned in the original opening. More context follows.'});assert(renamed.includes('Concerta XL'));assert(!renamed.includes('Ritalin'));
 const ui=fs.readFileSync('app/szekspir/workspace.tsx','utf8');assert(ui.includes('/api/jobs/regenerate-hook'));assert(ui.includes('/api/jobs/hook-text'));assert(ui.includes('Re-record audio'));assert(ui.includes('Your main script and other hook stay unchanged.'));assert(ui.includes('hookGenerationLocks.current[i]===sequence'));assert(ui.includes('hookSavingLocks.current.has(key)'));assert(ui.includes('VoicePreview voiceId={voiceId||job.voiceId}'));
 console.log('PASS stronger one-hook draft, source-grounded context, low effort, bounded duplicate/filler/reveal retries, medicine naming, immutable input and independent text/audio UI');
})().catch(e=>{console.error(e);process.exitCode=1});
