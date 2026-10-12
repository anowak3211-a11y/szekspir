'use client';
import {voiceoverCreation,voiceoverCreationSettings,type VoiceProcessing} from '@/lib/voice-processing';
import VoiceAdjustments from './voice-adjustments';

export default function VoiceCreation({value,onChange,disabled=false,sourceAvailable=true,polish=false}:{value:VoiceProcessing;onChange:(value:VoiceProcessing)=>void;disabled?:boolean;sourceAvailable?:boolean;polish?:boolean}){
 const selected=voiceoverCreation(value);
 return <><fieldset id="voiceover-pace" className="voice-creation" disabled={disabled}>
  <legend>{polish?'Tempo voiceoveru':'Voiceover pace'}</legend>
  <div className="voice-creation-grid">
   <label className="voice-creation-option">
    <input type="radio" name="voiceover-creation" value="storytelling" checked={selected==='storytelling'} onChange={()=>onChange(voiceoverCreationSettings('storytelling',value))}/>
    <span><strong>{polish?'Opowiadanka · naturalne tempo':'Storytelling · natural rhythm'}</strong><small>{polish?'Zachowuje naturalny rytm głosu. Pauzy i przyspieszenie ustawisz osobno poniżej.':'Keeps the voice’s natural rhythm. Adjust pauses and speech speed separately below.'}</small></span>
   </label>
   <label className="voice-creation-option">
    <input type="radio" name="voiceover-creation" value="source" checked={selected==='source'} disabled={!sourceAvailable} onChange={()=>onChange(voiceoverCreationSettings('source',value))}/>
    <span><strong>{polish?'Dopasuj do oryginału':'Match source pace'}</strong><small>{sourceAvailable?(polish?'Przyspiesza dłuższe nagranie do tempa oryginału. Może brzmieć szybciej.':'Speeds up longer takes to fit the source pace. May sound faster.'):(polish?'Wymaga nagrania z czytelnym tempem mowy.':'Requires a source recording with a speech timing reference.')}</small></span>
   </label>
  </div>
  <p className="voice-help">{polish?'Wybór dotyczy następnego nagrania.':'Applies to the next recording.'}</p>
 </fieldset><VoiceAdjustments value={value} onChange={onChange} disabled={disabled} polish={polish}/></>;
}
