import type {SourcePace} from './source-pace';
import {narration} from './speech';
import {breathsEnabled,type VoiceProcessing} from './voice-processing';
/** Sparse breaths at complete thoughts; never rewrite approved spoken words. */
export function directedNarration(script:string,emotion:'off'|'subtle'='off',market:'uk'|'pl'='uk',processing?:VoiceProcessing){
 let text=narration(script,market);
 if(breathsEnabled(processing)){
   let words=0,breaths=0;
   text=text.replace(/[^.!?]+[.!?]+(?:["”’])?(?=\s+\S)/g,sentence=>{
    words+=sentence.trim().split(/\s+/).length;
    if(words<55||breaths>=3)return sentence;
    words=0;breaths++;return sentence+' [exhales]';
   });
 }
 if(processing?.mode==='gentle')return emotion==='subtle'&&text?'[conversational] '+text:text;
 return emotion==='subtle'&&text?'[calm] '+text:text;
}
export function voiceSettings(processing?:VoiceProcessing){
 return {stability:processing?.mode==='gentle'||breathsEnabled(processing)?0.5:1.0};
}

export function pacedNarration(script:string,emotion:'off'|'subtle'='subtle',market:'uk'|'pl'='uk',processing?:VoiceProcessing,pace?:SourcePace){
 return (pace?.previewDelivery==='faster'?'[rapid-fire] ':pace?.calibrated&&pace.speed>1.1?'[rushed] ':'')+directedNarration(script,emotion,market,processing);
}
