import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import type {VoiceSwap,WordTime} from './voice-swap-model';
import type {WordSpan} from './word-sync';
import {phraseSyncPlan,type QuietGap} from './phrase-sync';
import {downloadSwapMedia,swapFfmpeg} from './voice-swap-audio';
import {transcribeWithDuration} from './localize';
import {existingMedia,putMedia} from './media';
type Update=(fn:(s:VoiceSwap)=>void)=>Promise<void>;
function tempos(value:number){const filters:string[]=[];while(value>2){filters.push('atempo=2');value/=2;}while(value<.5){filters.push('atempo=0.5');value*=2;}return [...filters,`atempo=${value}`].join(',');}
export async function quietVoiceGaps(input:string){const {stderr}=await swapFfmpeg(['-i',input,'-af','silencedetect=noise=-45dB:d=0.12','-f','null','-']);const gaps:QuietGap[]=[];let start:number|undefined;for(const line of stderr.split('\n')){const a=/silence_start: ([\d.]+)/.exec(line),b=/silence_end: ([\d.]+)/.exec(line);if(a)start=Number(a[1]);if(b&&start!==undefined){gaps.push({start,end:Number(b[1])});start=undefined;}}return gaps;}
/** Each interval is a complete utterance, with cuts in measured quiet gaps only. */
export async function renderWordSync(input:string,spans:WordSpan[],seconds:number,dir:string){
 const pcm=Buffer.alloc(Math.round(seconds*44100)*2);
 for(let i=0;i<spans.length;i++){
  const p=spans[i],length=p.sourceEnd-p.sourceStart,out=join(dir,`word-${i}.pcm`);
  await swapFfmpeg(['-v','error','-ss',String(p.voiceStart),'-t',String(p.voiceEnd-p.voiceStart),'-i',input,'-vn','-af',`${tempos((p.voiceEnd-p.voiceStart)/length)},apad,atrim=duration=${length},afade=t=in:d=0.004,afade=t=out:st=${Math.max(0,length-.004)}:d=0.004`,'-ac','1','-ar','44100','-c:a','pcm_s16le','-f','s16le',out]);
  const part=await readFile(out);if(!part.some(b=>b!==0))throw Error('A tracked speech interval rendered empty. Saved take retained; no regeneration was made.');const at=Math.round(p.sourceStart*44100)*2;part.copy(pcm,at,0,Math.min(part.length,Math.round(length*44100)*2,pcm.length-at));
 }
 const raw=join(dir,'aligned.pcm'),wav=join(dir,'aligned.wav');await writeFile(raw,pcm);await swapFfmpeg(['-v','error','-f','s16le','-ar','44100','-ac','1','-i',raw,'-c:a','pcm_s16le',wav]);return wav;
}
export async function advanceSwapAlignment(s:VoiceSwap,update:Update,dir:string){
 const t=s.takes?.find(t=>t.id===s.alignmentTake);if(!t?.url||!s.vocalsUrl||!s.duration)throw Error('Saved recordings are missing.');
 const change=(fn:(t:NonNullable<VoiceSwap['takes']>[number])=>void)=>update(x=>{const take=x.takes?.find(v=>v.id===t.id);if(!take)throw Error('Take disappeared.');fn(take);});
 const alignedPath=`vo/swap-${s.id}-${t.id}-phrases.wav`,cached=(t.alignedMethod==='phrases-v1'?t.alignedUrl:undefined)||await existingMedia(alignedPath);
 if(cached){await change(t=>{t.alignedPath=alignedPath;t.alignedUrl=cached;t.alignedMethod='phrases-v1';});await update(x=>{x.status='review';x.error=undefined;});return;}
 async function tracking(url:string,name:string,before:()=>Promise<void>):Promise<WordTime[]>{
  const input=join(dir,name+'.audio'),mp3=join(dir,name+'.mp3');await downloadSwapMedia(url,input,60*1024*1024);
  await swapFfmpeg(['-v','error','-i',input,'-vn','-ac','1','-ar','16000','-b:a','64k',mp3]);const bytes=await readFile(mp3);if(bytes.length>24*1024*1024)throw Error('Audio is too large for word tracking.');await before();
  const result=await transcribeWithDuration(new File([new Uint8Array(bytes)],name+'.mp3',{type:'audio/mpeg'}),true);if(!result.words?.length)throw Error('No word times returned. The paid request will not repeat automatically.');return result.words;
 }
 if(!s.sourceWords?.length){if(s.sourceTimingSubmitted)throw Error('Original word tracking outcome is unknown. No automatic paid retry.');const words=await tracking(s.vocalsUrl,'original',()=>update(x=>{x.sourceTimingSubmitted=true;}));await update(x=>{x.sourceWords=words;x.status='queued';});return;}
 if(!t.words?.length){if(t.timingSubmitted)throw Error('New voice word tracking outcome is unknown. No automatic paid retry.');const words=await tracking(t.url,'new-voice',()=>change(t=>{t.timingSubmitted=true;}));await change(t=>{t.words=words;});await update(x=>{x.status='queued';});return;}
 const voice=join(dir,'voice.wav');await downloadSwapMedia(t.url,voice,60*1024*1024);
 const {audioDuration}=await import('./vo-cleanup');const seconds=await audioDuration(voice),gaps=await quietVoiceGaps(voice),plan=phraseSyncPlan(s.sourceWords,t.words,s.duration,seconds,gaps);
 const out=await renderWordSync(voice,plan.spans,s.duration,dir),url=await putMedia(alignedPath,await readFile(out),'audio/wav');await change(t=>{t.alignedUrl=url;t.alignedPath=alignedPath;t.alignedMethod='phrases-v1';t.syncReport=plan.report;});await update(x=>{x.status='review';x.error=undefined;});
}
