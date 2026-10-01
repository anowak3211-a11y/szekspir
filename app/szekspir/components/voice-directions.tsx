'use client';
import type {VoiceEmotion,OpeningReaction,VoiceProcessing} from '@/lib/voice-processing';

const tones:ReadonlyArray<readonly [VoiceEmotion,string]>=[
 ['off','None · no emotion tag'],['subtle','Subtle · calm / conversational'],
 ['calm','Calm'],['conversational','Conversational'],['curious','Curious'],
 ['happy','Happy'],['excited','Excited'],['sad','Sad'],['angry','Angry'],['whispers','Whispering']
];
const reactions:ReadonlyArray<readonly [OpeningReaction,string]>=[
 ['none','None'],['yawns','Yawn · experimental'],['sighs','Sigh'],
 ['laughs','Laugh'],['clears throat','Clear throat'],['gasps','Gasp']
];

export default function VoiceDirections({value,onChange,disabled=false}:{value:VoiceProcessing;onChange:(v:VoiceProcessing)=>void;disabled?:boolean}){
 return <fieldset style={{border:'1px solid #dce5df',borderRadius:12,padding:16,margin:'20px 0'}}>
  <legend style={{fontWeight:700}}>Eleven v4 · voice direction</legend>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>
   <label>Emotion / tone<select value={value.emotion??'off'} disabled={disabled} onChange={e=>onChange({...value,emotion:e.target.value as VoiceEmotion})}>{tones.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
   <label>Opening reaction<select value={value.openingReaction??'none'} disabled={disabled} onChange={e=>onChange({...value,openingReaction:e.target.value as OpeningReaction})}>{reactions.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
  </div>
  <p className="hint">Both are optional. “None” sends no delivery tag; a reaction is added once at the beginning. Tags guide the voice but are not guaranteed, so listen before approving. Yawning is experimental.</p>
 </fieldset>;
}
