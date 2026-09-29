export type VoiceProcessing={mode:'standard'|'gentle'|'aggressive';normalize:boolean;emotion?:'off'|'subtle';breaths?:boolean;ambience?:'none'|'car'|'room'|'outdoors'};
export function voiceProcessing(value?:unknown):VoiceProcessing{
 if(value===undefined)return {mode:'standard',normalize:false,emotion:'subtle'};
 if(!value||typeof value!=='object')throw Error('Invalid voice processing settings');
 const v=value as Record<string,unknown>;
 if(!['standard','gentle','aggressive'].includes(String(v.mode))||typeof v.normalize!=='boolean')throw Error('Invalid voice processing settings');
 if(v.emotion!==undefined&&!['off','subtle'].includes(String(v.emotion)))throw Error('Invalid voice emotion setting');
 if(v.breaths!==undefined&&typeof v.breaths!=='boolean')throw Error('Invalid breathing setting');
 if(v.ambience!==undefined&&!['none','car','room','outdoors'].includes(String(v.ambience)))throw Error('Invalid background sound');
 return {...(v.breaths!==undefined?{breaths:v.breaths as boolean}:{}),...(v.ambience!==undefined?{ambience:v.ambience as VoiceProcessing['ambience']}:{}),emotion:(v.emotion??'subtle') as 'off'|'subtle',mode:v.mode as VoiceProcessing['mode'],normalize:false};
}
export const PAUSE_PROFILES={standard:[[.48,.7,.18],[.18,.2,.18]],gentle:[[.7,.35,.3]],aggressive:[[.35,.9,.06],[.14,.35,.06]]} as const;

export const EXTRA_PAUSE_SECONDS=.1;

export function breathsEnabled(value?:VoiceProcessing){return value?.mode==='gentle'?value.breaths!==false:value?.mode==='standard'&&value.breaths===true;}
