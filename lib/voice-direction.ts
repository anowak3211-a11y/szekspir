import type {SourcePace} from './source-pace';
import {narration} from './speech';
import type {VoiceEmotion,VoiceProcessing} from './voice-processing';
/** Native v4 direction preserves approved words without injected breath cues. */
export function directedNarration(script:string,emotion:VoiceEmotion='off',market:'uk'|'pl'='uk',processing?:VoiceProcessing){
 const text=narration(script,market);
 const tag=emotion==='off'?'':emotion==='subtle'?(processing?.mode==='gentle'?'conversational':'calm'):emotion;
 const reaction=processing?.openingReaction&&processing.openingReaction!=='none'?`[${processing.openingReaction}] `:'';
 return text?`${reaction}${tag?`[${tag}] `:''}${text}`:text;
}
export function voiceSettings(processing?:VoiceProcessing){
 const emotion=processing?.emotion??'off';
 return {stability:emotion==='off'&&processing?.mode!=='gentle'&&(!processing?.openingReaction||processing.openingReaction==='none')?1.0:0.5,similarity_boost:0.75};
}

export function pacedNarration(script:string,emotion:VoiceEmotion='off',market:'uk'|'pl'='uk',processing?:VoiceProcessing,_pace?:SourcePace){
 // Eleven v4 has no Speed control. Do not imply timing can be forced with v3-era cues.
 return directedNarration(script,emotion,market,processing);
}
