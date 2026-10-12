const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
let requests=[],fittings=[],preserved=[],fail=false,ambienceDuration;
require.cache[require.resolve('../lib/vo-cleanup.ts')]={exports:{cleanVoiceover:async(raw,save,processing)=>{save({originalSeconds:180,trimmedSeconds:180,removedSeconds:0,processing});return raw.slice(0);}}};
require.cache[require.resolve('../lib/vo-pace.ts')]={exports:{fitVoiceoverPace:async(audio,timing,pace)=>{fittings.push(pace);if(!pace)return audio;if(fail)throw Error('Offline fitting failure');timing.pace={...pace,speed:1,calibrated:false};timing.trimmedSeconds=pace.targetSeconds;timing.paceAdjustment={inputSeconds:180,outputSeconds:pace.targetSeconds,factor:180/pace.targetSeconds};return audio;}}};
require.cache[require.resolve('../lib/story-ambience.ts')]={exports:{addStoryAmbience:async(audio,scene,timing)=>{ambienceDuration=timing.trimmedSeconds;return audio;}}};
process.env.ELEVENLABS_API_KEY='offline-only';
global.fetch=async(_url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer};};
const {generateVO}=require('../lib/elevenlabs.ts'),pace={sourceSeconds:144,targetSeconds:145,sourceWords:472,scriptWords:475,speed:1,calibrated:false};
const save=async(raw,timing)=>{assert.deepEqual(Array.from(new Uint8Array(raw)),[1,2,3]);preserved.push(structuredClone(timing));};
(async()=>{
 const words='These are the approved words.';
 await generateVO(words,'voice',save,{mode:'gentle',normalize:false,matchSourcePace:true,ambience:'room'},'voiceover','uk',pace);
 assert.equal(requests[0].text,words);assert.equal(requests[0].model_id,'eleven_v4');assert(!('speed' in requests[0].voice_settings));assert.equal(fittings.length,1);assert.equal(fittings[0].targetSeconds,145);assert.equal(preserved[0].trimmedSeconds,145);assert.equal(preserved[0].originalSeconds,180);assert.equal(ambienceDuration,145,'Background mixed after tempo matching');
 await generateVO(words,'voice',save,{mode:'gentle',normalize:false},'hook','uk',pace);assert.equal(fittings.length,1,'Independent hooks are never fitted to full-ad duration');
 await generateVO(words,'voice',save,{mode:'gentle',normalize:false});assert.equal(fittings.at(-1),undefined,'Missing source reference remains unmodified');
 fail=true;await generateVO(words,'voice',save,{mode:'gentle',normalize:false},'voiceover','uk',pace);assert.equal(requests.length,4,'Fitting failure cannot repeat a paid generation');assert.equal(preserved.length,4,'Provider originals preserved on every path');assert.equal(preserved[3].trimmedSeconds,180);assert.match(preserved[3].paceWarning,/Original timing retained/);
 console.log('PASS measured main-VO fitting before ambience; unchanged words/native v4 request; hooks/no-reference separation; fitting failure retains original with no provider retry');
})().catch(e=>{console.error(e);process.exitCode=1});
