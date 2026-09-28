'use client';
import {useEffect,useRef,useState} from 'react';
import type {VoiceProcessing} from '@/lib/voice-processing';
export default function PausePreview({voiceId,processing}:{voiceId?:string;processing:VoiceProcessing}){
 const [sample,setSample]=useState<{original:string;processed:string}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const request=useRef(0);
 const identity=`${voiceId}-${processing.mode}`;
 useEffect(()=>{request.current++;setSample(null);setError('');setBusy(false);},[identity]);
 async function prepare(){
  const current=++request.current;setBusy(true);setError('');
  try{
   const response=await fetch('/api/vo/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({voiceId,processing})});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Preview unavailable.');
   if(current===request.current)setSample(data);
  }catch(e){if(current===request.current)setError((e as Error).message);}
  finally{if(current===request.current)setBusy(false);}
 }
 return <div style={{marginTop:16}}><button type="button" disabled={!voiceId||busy} onClick={prepare}>{busy?'Preparing comparison…':'▶ Compare pauses · 10-second sample'}</button><p className="hint">Compare a saved 10-second clip before and after pause shortening. If this voice has no full-length sample, the first preparation uses ElevenLabs credits. Replays are free.</p>{error&&<p role="alert">{error}</p>}{sample&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}><div><p>Original · 10 seconds</p><audio key={sample.original} controls onError={()=>setError('Could not play the sample. Click Compare pauses to try again.')} preload="metadata" src={sample.original} aria-label="Original preview" style={{width:'100%'}}/></div><div><p>Selected settings · {{gentle:'Storytelling',standard:'Normal',aggressive:'VSL'}[processing.mode]}</p><audio key={sample.processed} controls onError={()=>setError('Could not play the sample. Click Compare pauses to try again.')} preload="metadata" src={sample.processed} aria-label="Processed preview" style={{width:'100%'}}/></div></div>}</div>;
}
