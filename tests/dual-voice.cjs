const assert=require('assert/strict'),fs=require('fs'),ts=require('typescript'),Module=require('module');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{esModuleInterop:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,n);
const {dualVoice,scriptSentences}=require('../lib/dual-voice.ts');
const script='Hello there. Now another speaker starts. And keeps talking.';const splitAt=scriptSentences(script)[1].start;
const choice={voiceId:'second',splitAt,boundary:script.slice(splitAt,splitAt+120),startSeconds:3};
assert.deepEqual(dualVoice(choice,script,'first'),choice);assert.equal(script.slice(0,splitAt)+script.slice(splitAt),script);
assert.throws(()=>dualVoice({...choice,splitAt:5},script,'first'),/sentence/);assert.throws(()=>dualVoice(choice,'Different. '+script,'first'),/sentence|changed/);assert.throws(()=>dualVoice(choice,script,'second'),/different/);assert.throws(()=>dualVoice({...choice,startSeconds:-1},script,'first'),/time/);assert.equal(dualVoice(null,script,'first'),undefined);
const cp=require('child_process'),os=require('os'),path=require('path');const ffmpeg=require('ffmpeg-static');
const {joinVoices,fitIntroduction}=require('../lib/join-voices.ts');const {audioDuration}=require('../lib/vo-cleanup.ts');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dual-voice-test-'));try{
 const parts=[];for(const [i,d] of [1,2].entries()){const p=path.join(dir,i+'.wav');cp.execFileSync(ffmpeg,['-v','error','-f','lavfi','-i',`sine=frequency=${440*(i+1)}:duration=${d}`,'-ar','44100','-c:a','pcm_f32le',p]);parts.push(new Uint8Array(fs.readFileSync(p)).buffer);}
 const fit=await fitIntroduction(parts[0],1.5);assert.equal(fit.speed,1);assert(Math.abs(fit.paddingSeconds-.5)<.0001);
 const output=path.join(dir,'joined.wav');fs.writeFileSync(output,Buffer.from(await joinVoices([fit.audio,parts[1]],fit.paddingSeconds)));assert(Math.abs(await audioDuration(output)-3.5)<1/44100);
 const fast=await fitIntroduction(parts[1],1.9);assert(fast.speed>1&&fast.speed<=1.15);fs.writeFileSync(output,Buffer.from(await joinVoices([fast.audio,parts[0]],fast.paddingSeconds)));assert(Math.abs(await audioDuration(output)-2.9)<1/44100);
 await assert.rejects(fitIntroduction(parts[1],1),/excessive acceleration/);
 console.log('PASS dual voices: sentence integrity, stale split, pitch-safe fitting, exact timing, no excessive speed');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
