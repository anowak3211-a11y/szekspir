import type {Job} from './jobs';
import type {VoiceProcessing} from './voice-processing';
export type SourcePace={sourceSeconds:number;targetSeconds:number;sourceWords:number;scriptWords:number;speed:number;calibrated:boolean;previewDelivery?:'faster'};
export const spokenWords=(text:string)=>text.replace(/\[[^\]]*\]/g,'').trim().split(/\s+/).filter(Boolean).length;
/** Compare source and script word rates. Audio fitting uses measured output duration separately. */
export function sourcePace(job:Pick<Job,'duration'|'transcript'|'result'|'voiceId'|'voTiming'|'singingAd'>,script:string,_voiceId:string,processing?:VoiceProcessing):SourcePace|undefined{
 if(processing?.matchSourcePace===false||(job.singingAd&&processing?.matchSourcePace!==true)||job.result?.no_speech||!Number.isFinite(job.duration)||!job.duration||job.duration<5)return;
 const rawSourceWords=spokenWords(job.transcript||job.result?.us_script||''),scriptWords=spokenWords(script);
 const sourceWords=rawSourceWords>=10?rawSourceWords:(processing?.matchSourcePace===true?scriptWords:rawSourceWords);
 if(sourceWords<10||scriptWords<10)return;
 const targetSeconds=processing?.matchSourcePace===true?job.duration:job.duration*scriptWords/sourceWords;
 // V4 has no synthesis-speed setting. Keep legacy fields honest and fit the measured take.
 return {sourceSeconds:job.duration,targetSeconds,sourceWords,scriptWords,speed:1,calibrated:false};
}
export function paceCheck(actual:number,target:number){const differencePercent=(actual/target-1)*100;return {differencePercent,withinTarget:Math.abs(differencePercent)<=5};}
export function paceSample(script:string,targetWords=45){
 const sentences=script.match(/[^.!?]+[.!?]+(?:["”’])?|[^.!?]+$/g)||[script];let text='';
 for(const sentence of sentences){if(spokenWords(text+sentence)>Math.max(80,targetWords+25))break;text+=sentence;if(spokenWords(text)>=targetWords)break;}
 return text.trim()||script.trim().split(/\s+/).slice(0,60).join(' ');
}
