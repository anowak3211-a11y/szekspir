'use client';
import {useEffect,useRef,useState} from 'react';
import type {Job} from '@/lib/jobs';
import type {VoiceProcessing} from '@/lib/voice-processing';
import {sourcePace,paceCheck} from '@/lib/source-pace';
export default function SourcePacePreview({job,script,voiceId,processing,onChange}:{job:Job;script:string;voiceId:string;processing:VoiceProcessing;onChange:(v:VoiceProcessing)=>void}){
 const [sample,setSample]=useState<{url:string;text:string;seconds:number;targetSeconds:number;speed:number;variant?:string}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const sequence=useRef(0),identity=JSON.stringify([job.id,script,voiceId,processing]);
 useEffect(()=>{sequence.current++;setSample(null);setError('');setBusy(false);},[identity]);
 const pace=sourcePace(job,script,voiceId,{...processing,matchSourcePace:true});if(!pace)return null;
 async function preview(variant='source'){const n=++sequence.current;setBusy(true);setError('');try{
  const r=await fetch('/api/vo/source-preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:job.id,script,voiceId,processing,variant})});const data=await r.json();if(!r.ok)throw Error(data.error||'Sample unavailable.');if(n===sequence.current)setSample(data);
 }catch(e){if(n===sequence.current)setError((e as Error).message);}finally{if(n===sequence.current)setBusy(false);}}
 return <section aria-label="Source speaking pace" style={{margin:'20px 0'}}>
  <label><input type="checkbox" checked={processing.matchSourcePace!==false} onChange={e=>onChange({...processing,matchSourcePace:e.target.checked})}/> Compare recording length with source</label>
  <p>Source: {pace.sourceSeconds.toFixed(1)}s. Timing reference for this script: about {pace.targetSeconds.toFixed(1)}s. Eleven v4 records at its natural pace; it has no native speed slider. The app measures the result but does not stretch or force the voice to this target.</p>
  <button type="button" disabled={busy||!voiceId||processing.matchSourcePace===false} onClick={()=>preview()}>{busy?'Recording sample…':'Preview natural v4 delivery'}</button>
  <button type="button" disabled={busy||!voiceId||processing.matchSourcePace===false} onClick={()=>preview('breaths30')} style={{marginLeft:8}}>Preview subtle breaths · about 30s</button>
  <p className="hint">Records a short opening using ElevenLabs credits. Saved replays are free. Clean voice only; does not replace your voiceover or send anything to the editor.</p>
  {busy&&<p role="status">Preparing your sample. Keep this page open.</p>}{error&&<p role="alert">{error}</p>}
  {sample&&<div><audio controls preload="metadata" src={sample.url} aria-label="Source pace sample" style={{width:'100%',maxWidth:600}}/><p>Sample: {sample.seconds.toFixed(1)}s · estimated target: {sample.targetSeconds.toFixed(1)}s. {paceCheck(sample.seconds,sample.targetSeconds).withinTarget?'Within 5% of the target.':'Listen and review: the sample is outside the 5% timing target.'}</p><p>{sample.text}</p><a href={sample.url} target="_blank" rel="noreferrer">Download pace sample</a></div>}
 </section>;
}
