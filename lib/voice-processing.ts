export const EMOTIONS=['off','subtle','calm','conversational','curious','happy','excited','sad','angry','whispers'] as const;
export type VoiceEmotion=typeof EMOTIONS[number];
export const OPENING_REACTIONS=['none','yawns','sighs','laughs','clears throat','gasps'] as const;
export type OpeningReaction=typeof OPENING_REACTIONS[number];
export type VoiceAudioAdjustments={pauseShorteningMs:number;tempoFactor:number};
export type VoiceProcessing={pauseShorteningMs?:number;tempoFactor?:number;matchSourcePace?:boolean;mode:'standard'|'gentle'|'aggressive';normalize:boolean;emotion?:VoiceEmotion;openingReaction?:OpeningReaction;breaths?:boolean;ambience?:'none'|'car'|'room'|'outdoors'};
export function pauseShorteningMs(value?:VoiceProcessing){return value?.pauseShorteningMs??(value?.matchSourcePace===true?0:300);}
export function voiceTempoFactor(value?:VoiceProcessing){return value?.tempoFactor??1;}
export function voiceProcessing(value?:unknown):VoiceProcessing{
 if(value===undefined)return {mode:'standard',normalize:false,emotion:'off',openingReaction:'none'};
 if(!value||typeof value!=='object')throw Error('Invalid voice processing settings');
 const v=value as Record<string,unknown>;
 if(!['standard','gentle','aggressive'].includes(String(v.mode))||typeof v.normalize!=='boolean')throw Error('Invalid voice processing settings');
 if(v.matchSourcePace!==undefined&&typeof v.matchSourcePace!=='boolean')throw Error('Invalid source pace setting');
 if(v.pauseShorteningMs!==undefined&&(typeof v.pauseShorteningMs!=='number'||!Number.isInteger(v.pauseShorteningMs)||v.pauseShorteningMs<0||v.pauseShorteningMs>1000))throw Error('Choose pause shortening between 0 and 1000 ms.');
 if(v.tempoFactor!==undefined&&(typeof v.tempoFactor!=='number'||!Number.isFinite(v.tempoFactor)||v.tempoFactor<1||v.tempoFactor>1.3))throw Error('Choose speech speed between 1.00 and 1.30.');
 if(v.matchSourcePace===true&&typeof v.tempoFactor==='number'&&v.tempoFactor!==1)throw Error('Choose Storytelling to set speech speed manually.');
 if(v.emotion!==undefined&&!EMOTIONS.includes(v.emotion as VoiceEmotion))throw Error('Invalid voice emotion setting');
 if(v.openingReaction!==undefined&&!OPENING_REACTIONS.includes(v.openingReaction as OpeningReaction))throw Error('Invalid opening reaction');
 if(v.breaths!==undefined&&typeof v.breaths!=='boolean')throw Error('Invalid breathing setting');
 if(v.ambience!==undefined&&!['none','car','room','outdoors'].includes(String(v.ambience)))throw Error('Invalid background sound');
 return {...(v.pauseShorteningMs!==undefined?{pauseShorteningMs:v.pauseShorteningMs as number}:{}),...(v.tempoFactor!==undefined?{tempoFactor:v.tempoFactor as number}:{}),...(v.matchSourcePace!==undefined?{matchSourcePace:v.matchSourcePace as boolean}:{}),...(v.breaths!==undefined?{breaths:v.breaths as boolean}:{}),...(v.ambience!==undefined?{ambience:v.ambience as VoiceProcessing['ambience']}:{}),emotion:(v.emotion??'off') as VoiceEmotion,openingReaction:(v.openingReaction??'none') as OpeningReaction,mode:v.mode as VoiceProcessing['mode'],normalize:false};
}
export const PAUSE_PROFILES={standard:[[.48,.7,.18],[.18,.2,.18]],gentle:[[.7,.35,.3]],aggressive:[[.35,.9,.06],[.14,.35,.06]]} as const;

export const EXTRA_PAUSE_SECONDS=.1;

export function breathsEnabled(value?:VoiceProcessing){return value?.mode==='gentle'?value.breaths!==false:value?.mode==='standard'&&value.breaths===true;}

/** Current recording UI uses native v4 delivery; legacy saved takes remain readable. */
export function v4RecordingSettings(saved?:VoiceProcessing):VoiceProcessing{
 return {...saved,mode:'gentle',normalize:false,breaths:false,matchSourcePace:saved?.matchSourcePace??false,emotion:saved?.emotion??'off',openingReaction:saved?.openingReaction??'none'};
}
export type VoiceoverCreation='storytelling'|'source';
export function voiceoverCreation(saved?:VoiceProcessing):VoiceoverCreation{return saved?.matchSourcePace===true?'source':'storytelling';}
/** Change only the creation style, retaining the selected tone and background. */
export function voiceoverCreationSettings(mode:VoiceoverCreation,saved?:VoiceProcessing):VoiceProcessing{
 if(mode!=='storytelling'&&mode!=='source')throw Error('Choose a voiceover creation style.');
 return {...v4RecordingSettings(saved),matchSourcePace:mode==='source',...(mode==='source'&&saved?.tempoFactor!==undefined?{tempoFactor:1}:{})};
}
