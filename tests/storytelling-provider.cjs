const fs=require('fs'),ts=require('typescript'),assert=require('assert/strict');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
let ambienceCalls=0,requests=[],preserved=0;
require.cache[require.resolve('../lib/vo-cleanup.ts')]={exports:{cleanVoiceover:async(raw,cb,p)=>{cb({trimmedSeconds:3,processing:p});return raw.slice(0);}}};
require.cache[require.resolve('../lib/story-ambience.ts')]={exports:{addStoryAmbience:async(clean)=>{ambienceCalls++;return clean;}}};
process.env.ELEVENLABS_API_KEY='offline-test';
global.fetch=async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer};};
const {generateVO}=require('../lib/elevenlabs.ts');
const save=async raw=>{preserved++;assert.equal(new Uint8Array(raw)[0],1);};
(async()=>{
 await generateVO('My story.', 'test',save,{mode:'gentle',normalize:false});assert.equal(ambienceCalls,0);assert.equal(requests[0].voice_settings.stability,.5);assert(requests[0].text.startsWith('[conversational]'));
 await generateVO('My story.','test',save,{mode:'gentle',normalize:false,ambience:'car'});assert.equal(ambienceCalls,1);
 await generateVO('My hook.','test',save,{mode:'gentle',normalize:false,ambience:'car'},'hook');assert.equal(ambienceCalls,1,'Hooks never generate ambience');
 await generateVO('My story.','test',save,{mode:'standard',normalize:false,ambience:'car'});assert.equal(ambienceCalls,1);assert.equal(requests[3].voice_settings.stability,1);
 assert.equal(preserved,4);assert.equal(requests.length,4);
 console.log('PASS provider requests: Natural storytelling, unchanged other modes, opt-in main VO ambience, originals preserved');
})().catch(e=>{console.error(e);process.exitCode=1});
