const fs=require('fs'),os=require('os'),path=require('path'),ts=require('typescript'),assert=require('assert/strict'),{execFileSync}=require('child_process');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
const ffmpeg=require('ffmpeg-static'),{cleanVoiceover}=require('../lib/vo-cleanup.ts');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'breath-test-'));try{
 const process=async(name,signal,mode)=>{const input=path.join(dir,name+'.wav');execFileSync(ffmpeg,['-v','error','-f','lavfi','-i',`aevalsrc='${signal}':s=44100:d=3`,'-c:a','pcm_f32le',input]);let timing;const result=await cleanVoiceover(new Uint8Array(fs.readFileSync(input)).buffer,t=>timing=t,{mode,normalize:false,emotion:'off'});const output=path.join(dir,name+'-out.wav');fs.writeFileSync(output,Buffer.from(result));const pcm=p=>execFileSync(ffmpeg,['-v','error','-i',p,'-f','f32le','-c:a','pcm_f32le','pipe:1']);return {timing,before:pcm(input),after:pcm(output)};};
 // Quiet breath surrogate at -48 dB splits the gap; the old -34 dB detector cuts it.
 const breath="if(between(t,1,2),if(between(t,1.2,1.8),0.004*sin(2*PI*170*t),0),0.3*sin(2*PI*440*t))";
 const gentle=await process('breath',breath,'gentle');assert(gentle.timing.removedSeconds<1/44100);assert.deepEqual(gentle.after,gentle.before,'Every speech and quiet breath sample preserved');
 const standard=await process('control',breath,'standard');assert(standard.timing.removedSeconds>.7,'Control proves this fixture exposed the old detector');
 const silence=await process('silence',"if(between(t,1,2),0,0.3*sin(2*PI*440*t))",'gentle');assert(Math.abs(silence.timing.removedSeconds-.25)<.002,'Storytelling still shortens real silence, keeping extra 100 ms');
 console.log('PASS quiet breath surrogate and speech bit-exact; genuine silence shortened by 250 ms; standard unchanged');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
