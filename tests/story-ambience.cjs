const fs=require('fs'),ts=require('typescript'),assert=require('assert/strict'),os=require('os'),path=require('path'),{execFileSync}=require('child_process');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
let uploads=[];
require.cache[require.resolve('../lib/media.ts')]={exports:{putMedia:async(p,b)=>{uploads.push(p);return 'https://example.com/'+p;}}};
const {mixStoryAmbience,addStoryAmbience}=require('../lib/story-ambience.ts'),ffmpeg=require('ffmpeg-static');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'story-mix-'));try{
 const make=(name,d,amp,freq)=>{const p=path.join(dir,name+'.wav');execFileSync(ffmpeg,['-v','error','-f','lavfi','-i',`aevalsrc=${amp}*sin(2*PI*${freq}*t):s=44100:d=${d}`,'-c:a','pcm_f32le',p]);return new Uint8Array(fs.readFileSync(p)).buffer;};
 const voice=make('voice',3,.3,440),bed=make('bed',1,.5,100);
 const mixed=await mixStoryAmbience(voice,bed,3),p=path.join(dir,'mixed.wav');fs.writeFileSync(p,Buffer.from(mixed));
 const pcm=buf=>execFileSync(ffmpeg,['-v','error','-i','pipe:0','-f','f32le','pipe:1'],{input:Buffer.from(buf)});
 const dry=pcm(voice),wet=pcm(mixed);assert.equal(wet.length,dry.length,'No length drift from looping');
 let delta=0;for(let i=0;i<wet.length;i+=4)delta=Math.max(delta,Math.abs(wet.readFloatLE(i)-dry.readFloatLE(i)));
 assert(delta>.005&&delta<.013,'Only a quiet bed added; voice gain unchanged');
 let calls=0;global.fetch=async()=>{calls++;throw Error('timeout');};let timing={trimmedSeconds:3};
 assert.equal(await addStoryAmbience(voice,'car',timing,'test'),voice);assert.equal(calls,1);assert(timing.ambienceWarning);assert(timing.dryUrl);assert.equal(uploads.length,1);
 global.fetch=async(url,options)=>{calls++;const b=JSON.parse(options.body);assert.equal(b.loop,true);assert.equal(b.model_id,'eleven_text_to_sound_v2');return {ok:true,arrayBuffer:async()=>bed.slice(0)};};timing={trimmedSeconds:3};
 assert((await addStoryAmbience(voice,'room',timing,'test')).byteLength>128);assert(timing.ambienceUrl);assert(!timing.ambienceWarning);assert.equal(calls,2);
 console.log('PASS ambience: quiet mix, exact duration, dry/stem saved, failed paid request not retried');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
