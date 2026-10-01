import type {SourcePace} from './source-pace';
import {narration} from './speech';
import {breathsEnabled,type VoiceEmotion,type VoiceProcessing} from './voice-processing';
/** Sparse breaths at complete thoughts; never rewrite approved spoken words. */
export function directedNarration(script:string,emotion:VoiceEmotion='off',market:'uk'|'pl'='uk',processing?:VoiceProcessing){
 let text=narration(script,market);
 if(breathsEnabled(processing)){
   let words=0,breaths=0;
   text=text.replace(/[^.!?]+[.!?]+(?:["”’])?(?=\s+\S)/g,sentence=>{
    words+=sentence.trim().split(/\s+/).length;
    if(words<55||breaths>=3)return sentence;
    words=0;breaths++;return sentence+' [exhales]';
   });
 }
 const tag=emotion==='off'?'':emotion==='subtle'?(processing?.mode==='gentle'?'conversational':'calm'):emotion;
 const reaction=processing?.openingReaction&&processing.openingReaction!=='none'?`[${processing.openingReaction}] `:'';
 return text?`${reaction}${tag?`[${tag}] `:''}${text}`:text;
}
export function voiceSettings(processing?:VoiceProcessing){
 const emotion=processing?.emotion??'off';
 return {stability:emotion==='off'&&processing?.mode!=='gentle'&&!breathsEnabled(processing)&&(!processing?.openingReaction||processing.openingReaction==='none')?1.0:0.5,similarity_boost:0.75};
}

export function pacedNarration(script:string,emotion:VoiceEmotion='off',market:'uk'|'pl'='uk',processing?:VoiceProcessing,_pace?:SourcePace){
 // Eleven v4 has no Speed control. Do not imply timing can be forced with v3-era cues.
 return directedNarration(script,emotion,market,processing);
}
