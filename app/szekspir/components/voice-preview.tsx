'use client';
import {useEffect,useRef,useState} from 'react';
export default function VoicePreview({url,voiceId}:{url?:string|null;voiceId?:string}){
 const audio=useRef<HTMLAudioElement|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);const [status,setStatus]=useState<'idle'|'loading'|'playing'>('idle'),[error,setError]=useState('');
 const attempt=useRef(0);
 const sample=voiceId?`/api/voices/preview?voiceId=${encodeURIComponent(voiceId)}`:url;
 function stop(){attempt.current++;if(timer.current)clearTimeout(timer.current);timer.current=null;if(audio.current){audio.current.pause();audio.current.currentTime=0;}setStatus('idle');}
 useEffect(()=>{setError('');setStatus('idle');
  const a=sample?new Audio(sample):null;audio.current=a;
  if(a){a.preload='auto';a.load();}
  return()=>{attempt.current++;if(timer.current)clearTimeout(timer.current);timer.current=null;if(a){a.onplaying=null;a.onended=null;a.onerror=null;a.pause();a.removeAttribute('src');a.load();}if(audio.current===a)audio.current=null;};
 },[sample]);
 async function play(){if(status!=='idle'){stop();return;}if(!sample)return;setStatus('loading');setError('');const ticket=++attempt.current;const a=audio.current||new Audio(sample);audio.current=a;a.onended=()=>{if(audio.current===a&&attempt.current===ticket)stop();};a.onerror=()=>{if(audio.current!==a||attempt.current!==ticket)return;stop();audio.current=null;setError('Could not load this saved voice sample. Please try again.');};a.onplaying=()=>{if(audio.current!==a){a.pause();return;}if(attempt.current!==ticket||a.paused)return;setStatus('playing');if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{if(audio.current===a&&attempt.current===ticket)stop();},3000);};try{await a.play();}catch{if(audio.current===a&&attempt.current===ticket){stop();setError('Could not play this preview. Try again.');}}}
 return <div><button type="button" disabled={!sample} onClick={play} className="preview">{status==='loading'?'■ Loading preview…':status==='playing'?'■ Stop preview':'▶ Preview · 3 seconds'}</button>{!sample&&<small>Choose a voice with an available sample.</small>}{error&&<small role="alert">{error}</small>}<style jsx>{`.preview{background:#eaf8ef;color:#126338;border:1px solid #a8cfb6;border-radius:12px;padding:12px 18px;font-weight:650;cursor:pointer;min-height:44px;margin-top:12px}.preview:disabled{opacity:.5;cursor:default}.preview:focus-visible{outline:3px solid #244bd6;outline-offset:3px}small{display:block;color:#65766b;margin-top:8px}`}</style></div>;
}
