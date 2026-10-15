import OpenAI from 'openai';
import {createHash} from 'node:crypto';
import {diffArrays} from 'diff';
import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readState,mutate} from './store';
import {safeDownload} from './safe-fetch';
import {audioDuration,type VoiceTiming} from './vo-cleanup';
export type SentenceSource={audioUrl:string;script:string;sourceScript:string;duration:number};
type Word={word:string;start:number;end:number};
const tokens=(text:string)=>Array.from(text.toLowerCase().matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu),m=>m[0].replace(/['’]/g,''));
const sentenceTokens=(text:string)=>Array.from(new Intl.Segmenter('en',{granularity:'sentence'}).segment(text),s=>tokens(s.segment)).filter(s=>s.length);
export function sentenceStarts(text:string,words:Word[],allowMissing=false){
 const sentences=sentenceTokens(text);
 const expected=sentences.flat(),heard=words.flatMap(w=>tokens(w.word).map(word=>({...w,word}))),positions=new Map<number,number>();let e=0,h=0;
 for(const part of diffArrays(expected,heard.map(w=>w.word))){if(part.added)h+=part.value.length;else if(part.removed)e+=part.value.length;else for(let i=0;i<part.value.length;i++)positions.set(e++,h++);}
 let offset=0;return sentences.map((sentence,index)=>{const prefix=sentence.findIndex((_,i)=>positions.has(offset+i)),first=positions.get(offset+prefix),matched=sentence.filter((_,i)=>positions.has(offset+i)).length;offset+=sentence.length;if(first===undefined||prefix>2||matched/sentence.length<.6){if(allowMissing)return undefined;throw Error(`Cannot confidently time sentence ${index+1}: ${sentence.join(' ').slice(0,100)}. Review its transcript.`);}return heard[Math.max(0,first-prefix)].start;});
}
async function cachedWords(key:string,load:()=>Promise<Buffer>){
 const name='speech-words-v1-'+key,typeState={} as {started?:boolean;words?:Word[]};
 const prior=(await readState(name,typeState)).value;if(prior.words)return prior.words;
 const existing=await mutate(name,typeState,state=>{if(state.words)return state.words;if(state.started)throw Error('Speech timing is already being analysed or needs review; no paid analysis repeated.');state.started=true;return undefined;});if(existing)return existing;
 const bytes=await load();let upload=bytes,temporary:string|undefined;try{
  if(bytes.length>20*1024*1024){if(!ffmpeg)throw Error('Speech analysis compression unavailable.');temporary=await mkdtemp(join(tmpdir(),'szekspir-speech-'));const original=join(temporary,'input.wav'),compressed=join(temporary,'speech.mp3');await writeFile(original,bytes,{mode:0o600});await promisify(execFile)(ffmpeg,['-v','error','-nostdin','-n','-i',original,'-ac','1','-ar','16000','-b:a','48k',compressed],{timeout:60000,maxBuffer:1024*1024});upload=await readFile(compressed);}
  const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:60000,maxRetries:0});
  const result=await client.audio.transcriptions.create({file:new File([new Uint8Array(upload)],upload.subarray(0,4).toString()==='RIFF'?'speech.wav':'speech.mp3'),model:'whisper-1',response_format:'verbose_json',timestamp_granularities:['word'],language:'en'});
  const words=(result as {words?:Word[]}).words;if(!words?.length||words.some(w=>!Number.isFinite(w.start)||!Number.isFinite(w.end)))throw Error('Speech timing analysis returned no usable word timestamps.');
  await mutate(name,typeState,state=>{state.words=words;});return words;
 }finally{bytes.fill(0);if(upload!==bytes)upload.fill(0);if(temporary)await rm(temporary,{recursive:true,force:true});}
}
/** One cached analysis per source/take; no status polling or speech regeneration. */
export async function fitVoiceoverSentences(audio:ArrayBuffer,timing:VoiceTiming,source:SentenceSource){
 const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
 const sourceWords=await cachedWords(hash(source.audioUrl),async()=>(await safeDownload(source.audioUrl,24*1024*1024)).buffer);
 const voiceWords=await cachedWords(hash(Buffer.from(audio)),async()=>Buffer.from(new Uint8Array(audio)));
 const sourceTimes=sentenceStarts(source.sourceScript,sourceWords,true),voiceTimes=sentenceStarts(source.script,voiceWords,true),us=sentenceTokens(source.sourceScript),uk=sentenceTokens(source.script);
 const similarity=(a:string[],b:string[])=>{const pool=[...b];let common=0;for(const w of a){const at=pool.indexOf(w);if(at>=0){common++;pool.splice(at,1);}}return 2*common/(a.length+b.length);};
 const scores=Array.from({length:us.length+1},()=>Array(uk.length+1).fill(0)),moves=Array.from({length:us.length+1},()=>Array(uk.length+1).fill(''));
 for(let i=1;i<=us.length;i++)for(let j=1;j<=uk.length;j++){const match=similarity(us[i-1],uk[j-1]),paired=sourceTimes[i-1]!==undefined&&voiceTimes[j-1]!==undefined&&match>=.4?scores[i-1][j-1]+match:-1;if(paired>=scores[i-1][j]&&paired>=scores[i][j-1]){scores[i][j]=paired;moves[i][j]='pair';}else if(scores[i-1][j]>=scores[i][j-1]){scores[i][j]=scores[i-1][j];moves[i][j]='source';}else{scores[i][j]=scores[i][j-1];moves[i][j]='voice';}}
 const pairs:{s:number;v:number}[]=[];let i=us.length,j=uk.length;while(i&&j){if(moves[i][j]==='pair'){pairs.push({s:--i,v:--j});}else if(moves[i][j]==='source')i--;else j--;}pairs.reverse();
 if(pairs.length<Math.max(2,uk.length*.8))throw Error(`Only ${pairs.length}/${uk.length} sentence pairs can be timed confidently. Review the transcripts.`);
 const starts=pairs.map(p=>sourceTimes[p.s]!),voice=pairs.map(p=>voiceTimes[p.v]!);
 const points=[{v:0,s:0}];for(let i=0;i<starts.length;i++){const previous=points.at(-1)!;if(i===0&&(starts[i]<.15||voice[i]<.15))continue;if(starts[i]-previous.s<.05||voice[i]-previous.v<.05)throw Error('Sentence timing is not monotonic.');points.push({v:voice[i],s:starts[i]});}
 points.push({v:timing.trimmedSeconds,s:source.duration});
 if(points.length>151)throw Error('Too many sentence boundaries for one recording.');
 for(let i=1;i<points.length;i++){const p=points[i],last=points[i-1],factor=(p.v-last.v)/(p.s-last.s);if(!Number.isFinite(factor)||factor<.5||factor>2)throw Error(`Sentence ${i} requires unsafe tempo; review its timing instead of truncating speech.`);}
 if(!ffmpeg)throw Error('Sentence matching is unavailable.');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-sentences-'));try{
  const input=join(dir,'input.wav'),output=join(dir,'output.wav');await writeFile(input,Buffer.from(audio),{mode:0o600});
  const n=points.length-1;let filter=`[0:a]asplit=${n}${Array.from({length:n},(_,i)=>`[a${i}]`).join('')};`;
  for(let i=0;i<n;i++){const a=points[i],b=points[i+1],duration=b.s-a.s;filter+=`[a${i}]atrim=start=${a.v}:end=${b.v},asetpts=PTS-STARTPTS,atempo=${(b.v-a.v)/duration},apad,atrim=duration=${duration}[s${i}];`;}
  filter+=Array.from({length:n},(_,i)=>`[s${i}]`).join('')+`concat=n=${n}:v=0:a=1[out]`;
  await promisify(execFile)(ffmpeg,['-v','error','-nostdin','-n','-i',input,'-filter_complex',filter,'-map','[out]','-c:a','pcm_f32le',output],{timeout:90000,maxBuffer:1024*1024});
  const duration=await audioDuration(output);if(Math.abs(duration-source.duration)>.15)throw Error('Sentence-matched duration could not be confirmed.');
  const tempos=points.slice(1).map((p,i)=>(p.v-points[i].v)/(p.s-points[i].s));timing.sentenceAlignment={sentences:starts.length,totalSentences:uk.length,sourceSeconds:source.duration,anchors:starts.map((source,i)=>({source,voice:voice[i]})),tempoMin:Math.min(...tempos),tempoMax:Math.max(...tempos)};timing.trimmedSeconds=duration;timing.processing={...timing.processing!,mode:'gentle',normalize:false,matchSourcePace:true};return new Uint8Array(await readFile(output)).buffer;
 }finally{await rm(dir,{recursive:true,force:true});}
}
