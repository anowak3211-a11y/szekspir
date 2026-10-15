import {createHash} from 'node:crypto';
import {getJob} from './jobs';
import {readState,mutate} from './store';
import {safeDownload} from './safe-fetch';
import {cleanVoiceover,type VoiceTiming} from './vo-cleanup';
import {sourcePace} from './source-pace';
import {fitVoiceoverPace} from './vo-pace';
import {fitVoiceoverSentences} from './sentence-pace';
import {putMedia} from './media';
export type PaceComparison={adId:string;sourceSeconds:number;whole:{url:string;seconds:number;maxSentenceDriftSeconds:number};sentences:{url:string;seconds:number;count:number;total:number;tempoMin:number;tempoMax:number}};
export async function compareSavedPace(id:string){
 if(!/^[\w-]{8,100}$/.test(id))throw Error('Invalid job ID.');
 const job=await getJob(id);if(!job?.result||!job.voOriginalUrl||!job.audioUrl||!job.duration||job.abortedAt||job.cancelledAt)throw Error('Saved original voiceover and source audio are required.');
 const processing={...job.voiceProcessing,mode:'gentle' as const,normalize:false,matchSourcePace:true,pauseShorteningMs:0,tempoFactor:1};
 const reference=sourcePace(job,job.result.uk_script,job.voiceId,processing);if(!reference)throw Error('Source speech timing is unavailable.');
 const hash=createHash('sha256').update(JSON.stringify(['sentence-comparison-v2',id,job.voOriginalUrl,job.audioUrl,job.result.us_script,job.result.uk_script])).digest('hex'),key='vo-comparison-'+hash;
 type State={started?:boolean;result?:PaceComparison;error?:string};const cached=(await readState<State>(key,{})).value;if(cached.result)return cached.result;
 const prior=await mutate<State,PaceComparison|undefined>(key,{},s=>{if(s.result)return s.result;if(s.started)throw Error(s.error||'Comparison is already being prepared. No analysis repeated.');s.started=true;return undefined;});if(prior)return prior;
 let raw:Buffer|undefined,clean:ArrayBuffer|undefined,whole:ArrayBuffer|undefined,aligned:ArrayBuffer|undefined;
 try{
  raw=(await safeDownload(job.voOriginalUrl,150*1024*1024)).buffer;let timing:VoiceTiming|undefined;
  clean=await cleanVoiceover(new Uint8Array(raw).buffer,t=>{timing=t;},processing,'voiceover');if(!timing)throw Error('Saved voice duration unavailable.');
  const wholeTiming=structuredClone(timing),sentenceTiming=structuredClone(timing);
  whole=await fitVoiceoverPace(clean,wholeTiming,reference);
  aligned=await fitVoiceoverSentences(clean,sentenceTiming,{audioUrl:job.audioUrl,sourceScript:job.result.us_script||'',script:job.result.uk_script,duration:job.duration});
  const wholeUrl=await putMedia(`vo/compare-${hash}-whole.wav`,Buffer.from(whole),'audio/wav'),sentenceUrl=await putMedia(`vo/compare-${hash}-sentences.wav`,Buffer.from(aligned),'audio/wav');
  const result:PaceComparison={adId:job.adId||id,sourceSeconds:job.duration,whole:{url:wholeUrl,seconds:wholeTiming.trimmedSeconds,maxSentenceDriftSeconds:Math.max(...sentenceTiming.sentenceAlignment!.anchors!.map(a=>Math.abs(a.voice/(wholeTiming.paceAdjustment?.factor||1)-a.source)))},sentences:{url:sentenceUrl,seconds:sentenceTiming.trimmedSeconds,count:sentenceTiming.sentenceAlignment!.sentences,total:sentenceTiming.sentenceAlignment!.totalSentences!,tempoMin:sentenceTiming.sentenceAlignment!.tempoMin!,tempoMax:sentenceTiming.sentenceAlignment!.tempoMax!}};
  await mutate<State,void>(key,{},s=>{s.result=result;});return result;
 }catch(e){await mutate<State,void>(key,{},s=>{s.error=(e as Error).message;});throw e;}
 finally{raw?.fill(0);if(clean)new Uint8Array(clean).fill(0);if(whole&&whole!==clean)new Uint8Array(whole).fill(0);if(aligned)new Uint8Array(aligned).fill(0);}
}
