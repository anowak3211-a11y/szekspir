const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module'),{execFileSync}=require('node:child_process');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const real=Module._load;Module._load=function(n,p,...args){return real.call(this,n.startsWith('@/')?path.resolve(n.slice(2)):n,p,...args);};
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),Controls=require('../app/szekspir/components/voice-adjustments.tsx').default;
const {voiceProcessing,v4RecordingSettings,voiceoverCreationSettings}=require('../lib/voice-processing.ts'),{cleanVoiceover}=require('../lib/vo-cleanup.ts'),ffmpeg=require('ffmpeg-static');
const settings={mode:'gentle',normalize:false,matchSourcePace:false,pauseShorteningMs:150,tempoFactor:1.05,emotion:'curious',ambience:'car'};
assert.deepEqual(v4RecordingSettings(voiceProcessing(JSON.parse(JSON.stringify(settings)))),{...settings,breaths:false,openingReaction:'none'});
for(const bad of [{pauseShorteningMs:-1},{pauseShorteningMs:1001},{pauseShorteningMs:1.5},{pauseShorteningMs:'300'},{tempoFactor:.9},{tempoFactor:1.31},{tempoFactor:NaN},{tempoFactor:'1.05'},{matchSourcePace:true,tempoFactor:1.1}])assert.throws(()=>voiceProcessing({...settings,...bad}));
const source=voiceoverCreationSettings('source',settings);assert.equal(source.tempoFactor,1);assert.equal(source.pauseShorteningMs,150);
const render=value=>renderToStaticMarkup(React.createElement(Controls,{value,onChange:()=>{}}));
assert.equal((render(settings).match(/type="range"/g)||[]).length,2);assert(render(settings).includes('0.15 s'));assert(render(settings).includes('1.05×'));assert(/id="voice-tempo-factor"[^>]*disabled=""/.test(render(source)));assert(render({...settings,pauseShorteningMs:0}).includes('Full pauses'));
let changed;const inputs=[];function visit(n){if(!React.isValidElement(n))return;if(n.type==='input')inputs.push(n);React.Children.forEach(n.props.children,visit);}
visit(Controls({value:settings,onChange:v=>changed=v}));inputs[0].props.onChange({target:{value:'600'}});assert.equal(changed.pauseShorteningMs,600);assert.equal(changed.tempoFactor,1.05);assert.equal(changed.ambience,'car');inputs[1].props.onChange({target:{value:'1.15'}});assert.equal(changed.tempoFactor,1.15);assert.equal(changed.pauseShorteningMs,150);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'adjustable-vo-'));
(async()=>{try{
 const input=path.join(dir,'input.wav'),signal="aevalsrc='if(between(t,1,2)+between(t,3,3.5)+between(t,5,6),0,if(between(t,7,8),0.002*sin(2*PI*150*t),0.3*sin(2*PI*440*t)))':s=16000:d=9";
 execFileSync(ffmpeg,['-v','error','-f','lavfi','-i',signal,'-c:a','pcm_f32le',input]);const raw=new Uint8Array(fs.readFileSync(input)).buffer,original=Buffer.from(raw);
 const decode=b=>execFileSync(ffmpeg,['-v','error','-i','pipe:0','-f','f32le','-c:a','pcm_f32le','pipe:1'],{input:Buffer.from(b)});
 const active=b=>{const values=[];for(let i=0;i<b.length;i+=4)if(Math.abs(b.readFloatLE(i))>.00001)values.push(b.subarray(i,i+4).toString('hex'));return values;};
 const before=active(decode(raw));
 for(const ms of [0,150,300,600,1000]){
  let timing;const audio=await cleanVoiceover(raw,t=>timing=t,{...settings,tempoFactor:1,pauseShorteningMs:ms});
  assert(Math.abs(timing.removedSeconds-2*Math.min(ms/1000,.6))<.01,`Pause setting ${ms}: bounded silence removal`);
  assert.deepEqual(active(decode(audio)),before,'Pause slider preserves every speech and quiet breath sample in order');assert.equal(timing.tempoAdjustment,undefined);
 }
 let timing;await cleanVoiceover(raw,t=>timing=t,{...settings,pauseShorteningMs:0,tempoFactor:1.1});assert.equal(timing.removedSeconds,0);assert(Math.abs(timing.trimmedSeconds-9/1.1)<.1);assert.equal(timing.tempoAdjustment.factor,1.1);
 const fast=await cleanVoiceover(raw,t=>timing=t,{...settings,pauseShorteningMs:300,tempoFactor:1.2},'hook');assert(Math.abs(timing.removedSeconds-.6)<.01);assert(Math.abs(timing.trimmedSeconds-((9-.6)/1.2+.5))<.1);assert.equal(timing.addedTailSeconds,.5);
 const pcm=decode(fast);let silent=0;for(let i=pcm.length-4;i>=0&&Math.abs(pcm.readFloatLE(i))<.000001;i-=4)silent++;assert(silent/16000>=.499,'Hook ending remains a full half-second after tempo change');
 const speech=pcm.subarray(0,Math.floor(.5*16000)*4);let crossings=0;for(let i=4;i<speech.length;i+=4)if(speech.readFloatLE(i-4)<=0&&speech.readFloatLE(i)>0)crossings++;assert(Math.abs(crossings/.5-440)<5,'Tempo preserves speech pitch');assert.deepEqual(Buffer.from(raw),original);
 console.log('PASS independent pause/tempo sliders, parser and saved choices, invalid bounds/source conflict, unchanged speech/breath samples, full-pause opt-out, combined real audio, pitch and hook tail preservation');
}finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
