const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),ts=require('typescript'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const ffmpeg=require('ffmpeg-static'),{cleanVoiceover}=require('../lib/vo-cleanup.ts');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'story-pause-'));
(async()=>{try{
 const input=path.join(dir,'source.wav');
 // Two long silent gaps, a short gap, and a quiet breath-like tone above -60 dB.
 const signal="aevalsrc='if(between(t,1,2)+between(t,3,3.5)+between(t,5,6),0,if(between(t,7,8),0.002*sin(2*PI*150*t),0.3*sin(2*PI*440*t)))':s=16000:d=9";
 execFileSync(ffmpeg,['-v','error','-f','lavfi','-i',signal,'-c:a','pcm_f32le',input]);
 const raw=new Uint8Array(fs.readFileSync(input)).buffer;let timing;
 const settings={mode:'gentle',normalize:false,matchSourcePace:false};
 const cleaned=await cleanVoiceover(raw,t=>timing=t,settings);
 assert(Math.abs(timing.removedSeconds-.6)<.01,'Each of two long gaps loses 300 ms; short gap and breath stay');
 const output=path.join(dir,'clean.wav');fs.writeFileSync(output,Buffer.from(cleaned));
 const decode=f=>execFileSync(ffmpeg,['-v','error','-i',f,'-f','f32le','-c:a','pcm_f32le','pipe:1']);
 const before=decode(input),after=decode(output),samples=before.length/4;
 const active=[];for(let i=0;i<samples;i++)if(Math.abs(before.readFloatLE(i*4))>0.00001)active.push(before.subarray(i*4,i*4+4).toString('hex'));
 const retained=[];for(let i=0;i<after.length/4;i++)if(Math.abs(after.readFloatLE(i*4))>0.00001)retained.push(after.subarray(i*4,i*4+4).toString('hex'));
 assert.deepEqual(retained,active,'Every non-silent speech/breath sample remains identical and in order');
 await cleanVoiceover(raw,t=>timing=t,{...settings,matchSourcePace:true});assert(timing.removedSeconds<.001,'Source mode retains full pauses before source fitting');
 await cleanVoiceover(raw,t=>timing=t,settings,'hook');assert(Math.abs(timing.removedSeconds-.6)<.01);assert.equal(timing.addedTailSeconds,.5);assert(Math.abs(timing.trimmedSeconds-8.9)<.01,'Hooks keep ending padding');
 console.log('PASS Storytelling: 300 ms per long silent pause, unchanged speech/breath samples, short gaps retained, source mode unchanged, hook tail retained');
}finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
