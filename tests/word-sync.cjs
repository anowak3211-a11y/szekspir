const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),ts=require('typescript'),{execFileSync}=require('node:child_process');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
const {wordSyncPlan}=require('../lib/word-sync.ts'),ffmpeg=require('ffmpeg-static');
const source=[{word:'Please',start:.1,end:.5},{word:'cut',start:.6,end:1},{word:'now.',start:2,end:2.5}],voice=[{word:'Please',start:.1,end:.5},{word:'cut',start:.5,end:.9},{word:'now',start:1,end:1.4}];
(async()=>{
 const p=wordSyncPlan(source,voice,3);assert.equal(p.report.matched,3);assert.equal(p.report.pauses,1);assert.equal(p.spans[1].sourceEnd,1);assert.equal(p.spans[2].sourceStart,2);assert.throws(()=>wordSyncPlan(source,[{word:'Different',start:0,end:1}],3),/differ/);assert.throws(()=>wordSyncPlan([{word:'a',start:1,end:0}],voice,3),/invalid/);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'word-sync-test-'));try{
  const input=path.join(dir,'input.wav');execFileSync(ffmpeg,['-v','error','-f','lavfi','-i','sine=frequency=880:duration=1.5:sample_rate=44100',input]);
  require.cache[require.resolve('../lib/localize.ts')]={exports:{}};require.cache[require.resolve('../lib/media.ts')]={exports:{}};
  const {renderWordSync}=require('../lib/voice-swap-alignment.ts');const output=await renderWordSync(input,p.spans,3,dir);
  const bytes=execFileSync(ffmpeg,['-v','error','-i',output,'-f','s16le','-ac','1','-ar','44100','-']);assert.equal(bytes.length,3*44100*2);const energy=(a,b)=>{let n=0;for(let i=Math.round(a*44100);i<Math.round(b*44100);i++)n+=Math.abs(bytes.readInt16LE(i*2));return n;};assert.equal(energy(1.01,1.99),0,'Original action pause stays completely silent in the voice stem');assert(energy(.12,.45)>0);assert(energy(2.05,2.45)>0,'Final word starts at its tracked original position');assert.equal(energy(2.51,2.99),0,'No looping or padding speech into action time');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
 console.log('PASS word sync: monotonic word matches, source pauses, per-word placement, exact duration and no repeated speech');
})().catch(e=>{console.error(e);process.exitCode=1;});
