'use client';
import type {VoiceProcessing} from '@/lib/voice-processing';
export default function BackgroundSound({value,onChange,disabled=false}:{value:VoiceProcessing;onChange:(value:VoiceProcessing)=>void;disabled?:boolean}){
 return <details className="voice-extras">
  <summary>Background sound{value.ambience&&value.ambience!=='none'?' · enabled':' · optional'}</summary>
  <label className="voice-field">Background<select disabled={disabled} value={value.ambience||'none'} onChange={e=>onChange({...value,ambience:e.target.value as VoiceProcessing['ambience']})}>
   <option value="none">None · clean voice</option><option value="car">Inside a car</option><option value="room">Quiet room</option><option value="outdoors">Outdoors</option>
  </select></label>
  <p className="voice-help">Uses extra credits for the main voiceover. Hooks stay clean.</p>
 </details>;
}
