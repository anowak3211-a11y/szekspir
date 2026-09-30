'use client';
import VoicePreview from './voice-preview';
import {scriptSentences,type DualVoice} from '@/lib/dual-voice';
type Voice={voice_id:string;name:string;preview_url?:string|null};
export default function DualVoiceSettings({script,voices,firstVoice,value,onChange,disabled}:{script:string;voices:Voice[];firstVoice:string;value:DualVoice|null;onChange:(v:DualVoice|null)=>void;disabled:boolean}){
 const sentences=scriptSentences(script).slice(1);
 const valid=value&&value.boundary===script.slice(value.splitAt,value.splitAt+120)&&sentences.some(s=>s.start===value.splitAt);
 return <section className="vopanel" aria-label="Two speakers"><h3>Two voices in one script</h3><label><input type="checkbox" checked={!!value} disabled={disabled} onChange={e=>onChange(e.target.checked?{voiceId:'',splitAt:sentences[0]?.start??0,boundary:script.slice(sentences[0]?.start??0,(sentences[0]?.start??0)+120)}:null)}/> Use two speakers</label>{value&&<>
 <p>Speaker 1 reads the introduction using the main voice selected below. Speaker 2 reads from your chosen sentence to the end. Hooks use speaker 1.</p>
 <label>Speaker 2 voice<select value={value.voiceId} disabled={disabled} onChange={e=>onChange({...value,voiceId:e.target.value})}><option value="">Choose the second voice</option>{voices.filter(v=>v.voice_id!==firstVoice).map(v=><option key={v.voice_id} value={v.voice_id}>{v.name}</option>)}</select></label>
 <VoicePreview url={voices.find(v=>v.voice_id===value.voiceId)?.preview_url}/><label>Speaker 2 starts with this sentence<select value={valid?String(value.splitAt):''} disabled={disabled} onChange={e=>{const splitAt=Number(e.target.value);onChange({...value,splitAt,boundary:script.slice(splitAt,splitAt+120)});}}><option value="" disabled>Choose the starting sentence</option>{sentences.map((s,i)=><option key={s.start} value={s.start}>{i+2}. {s.text}</option>)}</select></label>
 {!valid&&<p role="alert">The script changed. Select the starting sentence again.</p>}
 <label>Exact start time for speaker 2 (seconds, optional)<input type="number" min="0" max="3600" step="0.1" value={value.startSeconds??''} disabled={disabled} onChange={e=>onChange({...value,startSeconds:e.target.value===''?undefined:Number(e.target.value)})}/></label>
 <p>Leave time empty to switch naturally after the introduction. A later target adds silence. A slightly longer introduction is sped up by at most 15%, preserving pitch. If it cannot fit naturally, recording stops with a message to shorten the introduction or choose a later time. No words are cut.</p>
 {valid&&<details><summary>Review who says what</summary><h4>Speaker 1</h4><p style={{whiteSpace:'pre-wrap'}}>{script.slice(0,value.splitAt)}</p><h4>Speaker 2</h4><p style={{whiteSpace:'pre-wrap'}}>{script.slice(value.splitAt)}</p></details>}
 <p>Records two separate takes and joins them into one WAV. Both original takes are kept. Source-pace previews apply to one voice only.</p>
 </>}</section>;
}
