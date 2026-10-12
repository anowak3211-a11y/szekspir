'use client';
import {useEffect,useRef,useState} from 'react';
import type {Job} from '@/lib/jobs';
import type {VoiceProcessing} from '@/lib/voice-processing';
import {sourcePace} from '@/lib/source-pace';
export default function SourcePacePreview({job,script,voiceId,processing,disabled=false}:{job:Job;script:string;voiceId:string;processing:VoiceProcessing;disabled?:boolean}){
 const [sample,setSample]=useState<{url:string;text:string;seconds:number;targetSeconds?:number}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const sequence=useRef(0),identity=JSON.stringify([job.id,script,voiceId,processing]);
 useEffect(()=>{sequence.current++;setSample(null);setError('');setBusy(false);},[identity]);
 const pace=sourcePace(job,script,voiceId,{...processing,matchSourcePace:true});if(!script.trim()||job.result?.no_speech||job.singingAd)return null;
 async function preview(){const n=++sequence.current;setBusy(true);setError('');try{
  const r=await fetch('/api/vo/source-preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:job.id,script,voiceId,processing,variant:'source'})});const data=await r.json();if(!r.ok)throw Error(data.error||'Sample unavailable.');if(n===sequence.current)setSample(data);
 }catch(e){if(n===sequence.current)setError((e as Error).message);}finally{if(n===sequence.current)setBusy(false);}}
 return <section aria-label="Voiceover preview" className="voice-sample">
  {pace&&<dl className="voice-timing"><div><dt>Source video</dt><dd>{pace.sourceSeconds.toFixed(1)}s</dd></div><div><dt>Script timing reference</dt><dd>~{pace.targetSeconds.toFixed(1)}s</dd></div></dl>}
  <button type="button" disabled={disabled||busy||!voiceId||(processing.matchSourcePace===true&&!pace)} onClick={preview}>{busy?'Preparing sample…':'Preview this script'}</button>
  <p className="voice-help">{processing.matchSourcePace===true?(pace?'Longer takes are matched to the source pace.':'No source timing is available. Choose Storytelling to preview this script.'):'Storytelling uses the selected pause and speech speed settings.'} Creates a short sample using ElevenLabs credits. Saved replays are free.</p>
  {busy&&<p role="status">Preparing your sample.</p>}{error&&<p className="err" role="alert">{error}</p>}
  {sample&&<div className="voice-sample-result"><audio controls preload="metadata" src={sample.url} aria-label="Script preview"/><p>Sample length: {sample.seconds.toFixed(1)}s</p><details><summary>Sample text</summary><p>{sample.text}</p></details><a href={sample.url} target="_blank" rel="noreferrer">Download sample</a></div>}
 </section>;
}
