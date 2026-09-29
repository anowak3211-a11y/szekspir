import {narration} from './speech';
import type {VoiceProcessing} from './voice-processing';
/** Sparse breaths at complete thoughts; never rewrite approved spoken words. */
export function directedNarration(script:string,emotion:'off'|'subtle'='off',market:'uk'|'pl'='uk',processing?:VoiceProcessing){
 let text=narration(script,market);
 if(processing?.mode==='gentle'){
  if(processing.breaths!==false){
   let words=0,breaths=0;
   text=text.replace(/[^.!?]+[.!?]+(?:["”’])?(?=\s+\S)/g,sentence=>{
    words+=sentence.trim().split(/\s+/).length;
    if(words<55||breaths>=3)return sentence;
    words=0;breaths++;return sentence+' [exhales]';
   });
  }
  return emotion==='subtle'&&text?'[conversational] '+text:text;
 }
 return emotion==='subtle'&&text?'[calm] '+text:text;
}
export function voiceSettings(processing?:VoiceProcessing){
 return {stability:processing?.mode==='gentle'?0.5:1.0};
}
