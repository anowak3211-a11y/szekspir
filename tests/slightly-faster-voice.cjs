const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript'),{execFileSync}=require('node:child_process');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const ffmpeg=require('ffmpeg-static'),{slightlyFasterVoice}=require('../lib/slightly-faster-voice.ts'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'small-tempo-test-'));
const timing=()=>({originalSeconds:110,trimmedSeconds:110,removedSeconds:0,cleanupVersion:'native',processing:{mode:'gentle',normalize:false,matchSourcePace:false}});
function frequency(buffer,start,seconds){let crossings=0;const a=Math.floor(start*44100),b=Math.min(buffer.length/2,Math.floor((start+seconds)*44100));for(let i=a+1;i<b;i++)if(buffer.readInt16LE((i-1)*2)<=0&&buffer.readInt16LE(i*2)>0)crossings++;return crossings/((b-a)/44100);}
(async()=>{try{
 const file=path.join(dir,'original.wav'),output=path.join(dir,'faster.wav');
 execFileSync(ffmpeg,['-v','error','-nostdin','-f','lavfi','-i',"aevalsrc='if(lt(t,55),0.3*sin(2*PI*440*t),0.3*sin(2*PI*880*t))':s=44100:d=110",'-c:a','pcm_f32le',file]);
 const original=fs.readFileSync(file),audio=new Uint8Array(original).buffer,before=Buffer.from(audio),t=timing();
 const adjusted=await slightlyFasterVoice(audio,t,1.05);assert.deepEqual(Buffer.from(audio),before,'Original samples remain immutable');assert(Math.abs(t.trimmedSeconds-110/1.05)<.12);assert.equal(t.originalSeconds,110);assert.equal(t.removedSeconds,0);assert.equal(t.tempoAdjustment.factor,1.05);assert.equal(t.paceAdjustment,undefined);
 fs.writeFileSync(output,Buffer.from(adjusted));const pcm=execFileSync(ffmpeg,['-v','error','-nostdin','-i',output,'-f','s16le','-ac','1','-ar','44100','-'],{maxBuffer:24*1024*1024});
 assert(Math.abs(frequency(pcm,.2,1)-440)<4,'Opening pitch preserved');assert(Math.abs(frequency(pcm,t.trimmedSeconds-1.4,1)-880)<4,'Full ending and pitch preserved');
 assert.strictEqual(await slightlyFasterVoice(audio,timing(),1),audio);
 await assert.rejects(()=>slightlyFasterVoice(audio,timing(),1.2),/original pace or 5%/);
 const beforeTemps=fs.readdirSync(os.tmpdir()).filter(n=>n.startsWith('szekspir-small-tempo-')).sort();await assert.rejects(()=>slightlyFasterVoice(new Uint8Array([1,2,3]).buffer,timing(),1.05));assert.deepEqual(fs.readdirSync(os.tmpdir()).filter(n=>n.startsWith('szekspir-small-tempo-')).sort(),beforeTemps);
 console.log(`PASS explicit 1.05×: 110s → ${t.trimmedSeconds.toFixed(3)}s; opening/ending pitch retained, original untouched, no source fit/pause removal, exact-factor validation and temporary cleanup.`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(error=>{console.error(error);process.exitCode=1});
