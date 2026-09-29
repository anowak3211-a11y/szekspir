import type {Job} from './jobs';
import type {VoiceProcessing} from './voice-processing';
export type SourcePace={sourceSeconds:number;targetSeconds:number;sourceWords:number;scriptWords:number;speed:number;calibrated:boolean;previewDelivery?:'faster'};
export const spokenWords=(text:string)=>text.replace(/\[[^\]]*\]/g,'').trim().split(/\s+/).filter(Boolean).length;
/** A measured prior take calibrates native synthesis. Never time-stretch or slow down audio. */
export function sourcePace(job:Pick<Job,'duration'|'transcript'|'result'|'voiceId'|'voTiming'|'singingAd'>,script:string,voiceId:string,processing?:VoiceProcessing):SourcePace|undefined{
 if(processing?.matchSourcePace===false||job.singingAd||job.result?.no_speech||!Number.isFinite(job.duration)||!job.duration||job.duration<5)return;
 const sourceWords=spokenWords(job.transcript||job.result?.us_script||''),scriptWords=spokenWords(script);
 if(sourceWords<10||scriptWords<10)return;
 const targetSeconds=job.duration*scriptWords/sourceWords;
 const t=job.voTiming,previousWords=t?.pace?.scriptWords||spokenWords(job.result?.uk_script||'');
 const calibrated=!!(t&&job.voiceId===voiceId&&previousWords&&t.trimmedSeconds>0&&t.processing?.mode===(processing?.mode||'standard'));
 const predicted=calibrated?t!.trimmedSeconds*scriptWords/previousWords:targetSeconds;
 const speed=calibrated?Math.min(1.2,Math.max(1,(t?.pace?.speed||1)*predicted/targetSeconds)):1;
 return {sourceSeconds:job.duration,targetSeconds,sourceWords,scriptWords,speed:Math.round(speed*1000)/1000,calibrated};
}
export function paceCheck(actual:number,target:number){const differencePercent=(actual/target-1)*100;return {differencePercent,withinTarget:Math.abs(differencePercent)<=5};}
export function paceSample(script:string,targetWords=45){
 const sentences=script.match(/[^.!?]+[.!?]+(?:["”’])?|[^.!?]+$/g)||[script];let text='';
 for(const sentence of sentences){if(spokenWords(text+sentence)>Math.max(80,targetWords+25))break;text+=sentence;if(spokenWords(text)>=targetWords)break;}
 return text.trim()||script.trim().split(/\s+/).slice(0,60).join(' ');
}
