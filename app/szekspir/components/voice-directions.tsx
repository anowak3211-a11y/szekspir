'use client';
import type {VoiceEmotion,OpeningReaction,VoiceProcessing} from '@/lib/voice-processing';

const tones:ReadonlyArray<readonly [VoiceEmotion,string]>=[
 ['off','Natural'],['subtle','Subtle · calm / conversational'],
 ['calm','Calm'],['conversational','Conversational'],['curious','Curious'],
 ['happy','Happy'],['excited','Excited'],['sad','Sad'],['angry','Angry'],['whispers','Whispering']
];
const reactions:ReadonlyArray<readonly [OpeningReaction,string]>=[
 ['none','None'],['yawns','Yawn'],['sighs','Sigh'],
 ['laughs','Laugh'],['clears throat','Clear throat'],['gasps','Gasp']
];

export default function VoiceDirections({value,onChange,disabled=false}:{value:VoiceProcessing;onChange:(v:VoiceProcessing)=>void;disabled?:boolean}){
 return <fieldset className="voice-setting-group" disabled={disabled}>
  <legend>Voice direction</legend>
  <div className="voice-setting-grid">
   <label className="voice-field">Tone<select value={value.emotion??'off'} disabled={disabled} onChange={e=>onChange({...value,emotion:e.target.value as VoiceEmotion})}>{tones.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
   <label className="voice-field">Opening reaction<select value={value.openingReaction??'none'} disabled={disabled} onChange={e=>onChange({...value,openingReaction:e.target.value as OpeningReaction})}>{reactions.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
  </div>
  <p className="voice-help">Optional. The reaction plays once at the start. Preview your choices before recording.</p>
 </fieldset>;
}
