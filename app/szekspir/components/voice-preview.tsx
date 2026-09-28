'use client';
import {useEffect,useRef,useState} from 'react';
export default function VoicePreview({url}:{url?:string|null}){
 const audio=useRef<HTMLAudioElement|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);const [playing,setPlaying]=useState(false),[error,setError]=useState('');
 function stop(){if(timer.current)clearTimeout(timer.current);timer.current=null;if(audio.current){audio.current.pause();audio.current.currentTime=0;audio.current=null;}setPlaying(false);}
 useEffect(()=>{setError('');setPlaying(false);return()=>{if(timer.current)clearTimeout(timer.current);audio.current?.pause();audio.current=null;};},[url]);
 async function play(){if(playing){stop();return;}if(!url)return;setPlaying(true);setError('');const a=new Audio(url);audio.current=a;a.onended=stop;a.onerror=()=>{stop();setError('Preview unavailable. Please try another voice.');};a.onplaying=()=>{if(audio.current!==a){a.pause();return;}setPlaying(true);timer.current=setTimeout(stop,3000);};try{await a.play();}catch{if(audio.current===a){stop();setError('Could not play this preview. Try again.');}}}
 return <div><button type="button" disabled={!url} onClick={play} className="preview">{playing?'■ Stop preview':'▶ Preview · 3 seconds'}</button>{!url&&<small>Choose a voice with an available sample.</small>}{error&&<small role="alert">{error}</small>}<style jsx>{`.preview{background:#eaf8ef;color:#126338;border:1px solid #a8cfb6;border-radius:12px;padding:12px 18px;font-weight:650;cursor:pointer;min-height:44px;margin-top:12px}.preview:disabled{opacity:.5;cursor:default}.preview:focus-visible{outline:3px solid #244bd6;outline-offset:3px}small{display:block;color:#65766b;margin-top:8px}`}</style></div>;
}
