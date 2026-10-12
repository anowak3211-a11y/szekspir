const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript'),{execFileSync}=require('node:child_process');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const ffmpeg=require('ffmpeg-static'),{fitVoiceoverPace,VO_PACE_VERSION}=require('../lib/vo-pace.ts');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pace-test-'));
const timing=()=>({originalSeconds:8,trimmedSeconds:8,removedSeconds:0,cleanupVersion:'test',processing:{mode:'gentle',normalize:false,matchSourcePace:true}});
const pace={sourceSeconds:6.4,targetSeconds:6.4,sourceWords:100,scriptWords:100,speed:1,calibrated:false};
const decode=file=>execFileSync(ffmpeg,['-v','error','-nostdin','-i',file,'-f','s16le','-ac','1','-ar','44100','-'],{maxBuffer:4*1024*1024});
function frequency(buffer,start,seconds){let crossings=0;const a=Math.floor(start*44100),b=Math.min(buffer.length/2,Math.floor((start+seconds)*44100));for(let i=a+1;i<b;i++)if(buffer.readInt16LE((i-1)*2)<=0&&buffer.readInt16LE(i*2)>0)crossings++;return crossings/((b-a)/44100);}
(async()=>{try{
 const file=path.join(dir,'take.wav'),output=path.join(dir,'fitted.wav');
 execFileSync(ffmpeg,['-v','error','-nostdin','-f','lavfi','-i',"aevalsrc='if(lt(t,4),0.3*sin(2*PI*440*t),0.3*sin(2*PI*880*t))':s=44100:d=8",'-c:a','pcm_f32le',file]);
 const original=fs.readFileSync(file),audio=new Uint8Array(original).buffer,before=Buffer.from(audio),t=timing();
 const fitted=await fitVoiceoverPace(audio,t,pace);assert.deepEqual(Buffer.from(audio),before,'Original take remains untouched');
 assert(Math.abs(t.trimmedSeconds-6.4)<.08);assert.equal(t.originalSeconds,8);assert.equal(t.removedSeconds,0,'Tempo adjustment is not reported as pause deletion');assert.equal(t.paceAdjustment.version,VO_PACE_VERSION);assert.equal(t.paceAdjustment.factor,1.25);
 fs.writeFileSync(output,Buffer.from(fitted));const decoded=decode(output);
 assert(Math.abs(frequency(decoded,.1,.5)-440)<4,'Opening pitch retained');assert(Math.abs(frequency(decoded,5.7,.5)-880)<4,'Ending retained at the same pitch');
 assert.strictEqual(await fitVoiceoverPace(audio,timing()),audio);
 const disabled=timing();disabled.processing.matchSourcePace=false;assert.strictEqual(await fitVoiceoverPace(audio,disabled,pace),audio);
 assert.strictEqual(await fitVoiceoverPace(audio,timing(),{...pace,targetSeconds:8.1}),audio,'Within-target take is not processed');
 assert.strictEqual(await fitVoiceoverPace(audio,timing(),{...pace,targetSeconds:10}),audio,'Shorter take is never slowed down');
 const capped=timing();assert.strictEqual(await fitVoiceoverPace(audio,capped,{...pace,targetSeconds:4}),audio);assert.match(capped.paceWarning,/above the 1.35/);assert(!capped.paceAdjustment);
 await assert.rejects(()=>fitVoiceoverPace(audio,timing(),{...pace,targetSeconds:NaN}),/Invalid/);
 const temporary=()=>fs.readdirSync(os.tmpdir()).filter(p=>p.startsWith('szekspir-pace-')).sort(),prior=temporary();
 await assert.rejects(()=>fitVoiceoverPace(new Uint8Array([1,2,3]).buffer,timing(),pace));assert.deepEqual(temporary(),prior,'Failed processing cleans private temporary audio');
 const ui=fs.readFileSync('app/szekspir/workspace.tsx','utf8');assert(ui.includes("paceAdjustment?'Matched to source pace'"));assert(ui.includes('paceWarning&&<p role="alert">'));
 console.log('PASS source tempo fit within tolerance; both pitch markers/end preserved; original immutable; opt-out/no-reference/no-slowdown/limit/failure cleanup and honest UI');
}finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
