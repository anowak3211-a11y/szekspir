const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {v4RecordingSettings,voiceoverCreation,voiceoverCreationSettings,voiceProcessing}=require('../lib/voice-processing.ts'),{sourcePace}=require('../lib/source-pace.ts'),{fitVoiceoverPace}=require('../lib/vo-pace.ts');
const saved={mode:'standard',normalize:false,matchSourcePace:false,breaths:true,emotion:'curious',openingReaction:'sighs',ambience:'car'},before=JSON.stringify(saved);
assert.equal(v4RecordingSettings().matchSourcePace,false);assert.equal(voiceoverCreation(),'storytelling');
const story=voiceoverCreationSettings('storytelling',saved),source=voiceoverCreationSettings('source',story);
for(const settings of [story,source]){assert.equal(settings.mode,'gentle');assert.equal(settings.breaths,false);assert.equal(settings.normalize,false);for(const key of ['emotion','openingReaction','ambience'])assert.equal(settings[key],saved[key]);}
assert.equal(story.matchSourcePace,false);assert.equal(source.matchSourcePace,true);assert.equal(voiceoverCreation(source),'source');assert.equal(JSON.stringify(saved),before);
assert.equal(v4RecordingSettings(voiceProcessing(JSON.parse(JSON.stringify(story)))).matchSourcePace,false,'Saved false survives parser/reload');assert.equal(v4RecordingSettings(source).matchSourcePace,true,'Previous explicit matching choice is retained');
assert.throws(()=>voiceoverCreationSettings('invalid'),/creation style/);
const script='A complete approved source sentence with unchanged wording. '.repeat(20),job={duration:84.1,transcript:script,result:{uk_script:script},voiceId:'voice'};
assert.equal(sourcePace(job,script,'voice',story),undefined);const pace=sourcePace(job,script,'voice',source);assert.equal(pace.targetSeconds,84.1);
const ffmpeg=require('ffmpeg-static'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'voice-creation-'));
(async()=>{try{
 const file=path.join(dir,'native.wav');execFileSync(ffmpeg,['-v','error','-nostdin','-f','lavfi','-i','sine=frequency=440:sample_rate=16000:duration=105.4','-c:a','pcm_f32le',file]);
 const audio=new Uint8Array(fs.readFileSync(file)).buffer,original=Buffer.from(audio),timing=processing=>({originalSeconds:105.4,trimmedSeconds:105.4,removedSeconds:0,cleanupVersion:'test',processing});
 const natural=timing(story);assert.strictEqual(await fitVoiceoverPace(audio,natural,pace),audio,'Story opt-out protects the native take even if stale pace metadata was passed');assert.equal(natural.trimmedSeconds,105.4);assert.equal(natural.paceAdjustment,undefined);assert.equal(natural.pace,undefined);
 const matched=timing(source),output=await fitVoiceoverPace(audio,matched,pace);assert.notStrictEqual(output,audio);assert(Math.abs(matched.trimmedSeconds-84.1)<.1);assert(Math.abs(matched.paceAdjustment.factor-105.4/84.1)<1e-10);assert.equal(matched.originalSeconds,105.4);assert.equal(matched.removedSeconds,0);assert.deepEqual(Buffer.from(audio),original);
 console.log('PASS Storytelling default/reload/no-breaths and retained tone; explicit source option; real 105.4s native take preserved vs 84.1s pitch-preserving source fitting; no provider calls');
}finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(error=>{console.error(error);process.exitCode=1;});
