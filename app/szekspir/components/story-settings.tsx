'use client';
import type {VoiceProcessing} from '@/lib/voice-processing';
export default function StorySettings({value,onChange,disabled=false}:{value:VoiceProcessing;onChange:(value:VoiceProcessing)=>void;disabled?:boolean}){
 if(value.mode!=='gentle')return null;
 return <fieldset style={{margin:'16px 0',padding:16,border:'1px solid #dce5df',borderRadius:12}} disabled={disabled}>
  <legend>Storytelling · natural delivery</legend>
  <label><input type="checkbox" checked={value.breaths!==false} onChange={e=>onChange({...value,breaths:e.target.checked})}/> Subtle breathing between longer thoughts</label>
  <p className="hint">Full pauses and quiet breaths are preserved. A few breath cues help longer stories feel spoken, without changing the words. Choose a conversational voice and listen before approving.</p>
  <label>Scene background<select value={value.ambience||'none'} onChange={e=>onChange({...value,ambience:e.target.value as VoiceProcessing['ambience']})}>
   <option value="none">Off · clean voice only</option><option value="car">Inside a car · soft engine idle</option><option value="room">Quiet room · subtle room tone</option><option value="outdoors">Outdoors · light breeze</option>
  </select></label>
  <p className="hint">Optional, main voiceover only. Adds a quiet generated background using extra ElevenLabs credits. Clean voice and a separate background track remain available. Hooks stay clean.</p>
 </fieldset>;
}
