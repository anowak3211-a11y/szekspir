'use client';
import {NATURAL_VO_PRESET_1,applyNaturalVoPreset1,pauseShorteningMs,voiceTempoFactor,v4RecordingSettings,type VoiceProcessing} from '@/lib/voice-processing';

export default function VoiceAdjustments({value,onChange,disabled=false,polish=false}:{value:VoiceProcessing;onChange:(value:VoiceProcessing)=>void;disabled?:boolean;polish?:boolean}){
 const pause=pauseShorteningMs(value),speed=voiceTempoFactor(value),automatic=value.matchSourcePace===true;
 const isPreset1=!automatic&&pause===NATURAL_VO_PRESET_1.pauseShorteningMs&&Math.abs(speed-NATURAL_VO_PRESET_1.tempoFactor)<0.001&&(value.emotion??'off')==='off';
 const isRaw=!automatic&&pause===0&&Math.abs(speed-1)<0.001;
 return <fieldset className="voice-adjustments" disabled={disabled}>
  <legend>{polish?'Pauzy i tempo':'Pauses and speech speed'}</legend>
  <div className="voice-presets" role="group" aria-label={polish?'Presety VO':'VO presets'}>
   <button type="button" className={`voice-preset-btn ${isPreset1?'active':''}`} aria-pressed={isPreset1} disabled={disabled} onClick={()=>onChange(applyNaturalVoPreset1(value))}>
    {polish?'Preset 1 · VO Natural (0,65 s · 1,16×)':'Preset 1 · VO Natural (0.65 s · 1.16×)'}
   </button>
   <button type="button" className={`voice-preset-btn ${isRaw?'active':''}`} aria-pressed={isRaw} disabled={disabled} onClick={()=>onChange({...v4RecordingSettings(value),matchSourcePace:false,pauseShorteningMs:0,tempoFactor:1})}>
    {polish?'Oryginał · 1,00× (bez skracania)':'Original · 1.00× (no shortening)'}
   </button>
  </div>
  <div className="voice-adjustment-grid">
   <div className="voice-adjustment">
    <label htmlFor="voice-pause-shortening"><span>{polish?'Skracanie pauz':'Pause shortening'}</span><strong>{pause===0?(polish?'Pełne pauzy':'Full pauses'):`${(pause/1000).toFixed(2)} s`}</strong></label>
    <input id="voice-pause-shortening" type="range" min="0" max="1000" step="50" value={pause} aria-valuetext={pause===0?(polish?'Pełne pauzy':'Full pauses'):`${(pause/1000).toFixed(2)} ${polish?'sekundy mniej na dłuższą pauzę':'seconds shorter per long pause'}`} aria-describedby="voice-pause-help" onChange={e=>onChange({...v4RecordingSettings(value),pauseShorteningMs:Number(e.target.value)})}/>
    <div className="voice-range-ends" aria-hidden="true"><span>{polish?'Bez skracania':'No shortening'}</span><span>−1.00 s</span></div>
    <p id="voice-pause-help">{polish?'Skraca tylko dłuższą ciszę między wypowiedziami. Zachowuje co najmniej 0,4 s pauzy, ciche oddechy i tempo mowy.':'Shortens only longer silent gaps between phrases. Keeps at least 0.4 seconds of each pause, quiet breaths and speech pace.'}</p>
   </div>
   <div className="voice-adjustment">
    <label htmlFor="voice-tempo-factor"><span>{polish?'Przyspieszenie mowy':'Speech speed'}</span><strong>{automatic?(polish?'Automatyczne':'Automatic'):`${speed.toFixed(2)}×`}</strong></label>
    <input id="voice-tempo-factor" type="range" min="1" max="1.3" step="0.01" value={speed} disabled={automatic} aria-valuetext={speed===1?(polish?'Naturalne tempo':'Natural speed'):`${Math.round((speed-1)*100)}% ${polish?'szybciej':'faster'}`} aria-describedby="voice-tempo-help" onChange={e=>onChange({...v4RecordingSettings(value),tempoFactor:Number(e.target.value)})}/>
    <div className="voice-range-ends" aria-hidden="true"><span>1.00×</span><span>1.30× · +30%</span></div>
    <p id="voice-tempo-help">{automatic?(polish?'Wybierz Opowiadanka, żeby ustawić tempo ręcznie. Dopasowanie do oryginału reguluje je automatycznie.':'Choose Storytelling to set speed manually. Match source pace adjusts it automatically.'):(polish?'Przyspiesza mowę bez zmiany wysokości głosu. Skracanie pauz ustawiasz osobno.':'Speeds up speech without changing pitch. Pause shortening is controlled separately.')}</p>
   </div>
  </div>
  <p className="voice-help">{polish?'Ustawienia stosuje nagranie lub zapis zmian. Samo przesunięcie suwaka nie zmienia pliku.':'Settings apply when recording or saving adjustments. Moving a slider alone does not change the audio.'}</p>
 </fieldset>;
}
