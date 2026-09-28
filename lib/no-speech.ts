import type {LocalizeResult} from './validation';
// Only empty transcripts and explicit non-speech cues qualify. Never strip words
// from ordinary speech, lyrics, or an unclear/inaudible recording.
export function isNonSpeechTranscript(text:unknown):boolean {
 if(typeof text!=='string')return false;
 if(!text.trim())return true;
 const cue='(?:music(?: intro| outro)?|instrumental(?: music)?|background music|silence|no speech|no dialogue|applause|laughter)';
 const withoutCues=text.replace(new RegExp('\\[\\s*'+cue+'\\s*\\]|\\(\\s*'+cue+'\\s*\\)','gi'),'').replace(/[🎶🎵♪♫]/gu,'').trim();
 return !withoutCues || new RegExp('^'+cue+'[.!]?$','i').test(withoutCues);
}
export function noSpeechResult():LocalizeResult {
 return {no_speech:true,uk_script:'',narration:'',hooks:[],hook_og:'',ad_desire:'Video only',ad_angle:'No dialogue',unique_mechanism:'',funnel:'TOF',notes:[],data_gaps:[],prompt_version:'no-speech-v1'};
}
