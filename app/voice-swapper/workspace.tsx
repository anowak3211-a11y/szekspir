'use client';
import {useEffect,useRef,useState} from 'react';
import {uploadMedia} from '@/lib/media-upload';
import {SWAP_MAX_BYTES,SWAP_MAX_SECONDS,type VoiceSwap} from '@/lib/voice-swap-model';
import './voice-swapper.css';
const labels:Record<VoiceSwap['status'],string>={queued:'W kolejce',preparing:'Przygotowuję oryginalne audio',separating:'Oddzielam mowę od tła',review:'Tło gotowe do odsłuchu',mixing:'Łączę tło z nowym głosem',done:'Film gotowy',error:'Wymaga uwagi',uncertain:'Wynik separacji wymaga sprawdzenia'};
const active=(j:VoiceSwap|null)=>!!j&&['queued','preparing','separating','mixing'].includes(j.status);
const storageKey='szekspir-voice-swap-current-v1';
async function api(body?:unknown,id?:string){const r=await fetch('/api/voice-swap'+(id?'?id='+encodeURIComponent(id):''),{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000),cache:'no-store'});const result=await r.json();if(!r.ok)throw Object.assign(Error(result.error||'Nie udało się zapisać.'),{job:result.job});return result;}
function useLocalPreview(file:File|null){const [url,setUrl]=useState('');useEffect(()=>{if(!file){setUrl('');return;}const u=URL.createObjectURL(file);setUrl(u);return()=>URL.revokeObjectURL(u);},[file]);return url;}
export default function VoiceSwapper(){
 const [source,setSource]=useState<File|null>(null),[voice,setVoice]=useState<File|null>(null),[job,setJob]=useState<VoiceSwap|null>(null),[configured,setConfigured]=useState<boolean|null>(null),[busy,setBusy]=useState(''),[error,setError]=useState(''),[pollError,setPollError]=useState(''),[cost,setCost]=useState(false),[approved,setApproved]=useState(false),[voiceGain,setVoiceGain]=useState(1),[backgroundGain,setBackgroundGain]=useState(1),[offset,setOffset]=useState(0);
 const lock=useRef(false),startId=useRef(''),sourceUpload=useRef<{file:File;path:string}|null>(null),voiceUpload=useRef<{file:File;path:string}|null>(null),mounted=useRef(true);const sourcePreview=useLocalPreview(source),voicePreview=useLocalPreview(voice);
 function remember(j:VoiceSwap){setJob(j);startId.current=j.id;try{localStorage.setItem(storageKey,j.id);}catch{}}
 useEffect(()=>{mounted.current=true;void api().then(r=>setConfigured(r.configured)).catch(()=>setError('Nie można sprawdzić konfiguracji. Odśwież stronę przed startem.'));try{const id=localStorage.getItem(storageKey);if(id)void api(undefined,id).then(r=>remember(r.job)).catch(()=>setError('Nie można odczytać ostatniego procesu. Spróbuj odświeżyć stronę.'));}catch{}return()=>{mounted.current=false;};},[]);
 useEffect(()=>{
  if(!active(job))return;let stopped=false,timer:ReturnType<typeof setTimeout>|undefined,failures=0;const id=job!.id;
  const poll=async()=>{if(stopped)return;if(document.hidden){timer=setTimeout(poll,30000);return;}try{const r=await api(undefined,id);if(stopped)return;setJob(r.job);setPollError('');failures=0;if(active(r.job))timer=setTimeout(poll,30000);}catch{if(stopped)return;failures++;setPollError('Status chwilowo niedostępny. To nie oznacza zatrzymania procesu.');timer=setTimeout(poll,Math.min(120000,30000*2**failures));}};
  timer=setTimeout(poll,30000);return()=>{stopped=true;clearTimeout(timer);};
 },[job?.id,job?.status]);
 async function act(task:()=>Promise<void>){if(lock.current)return;lock.current=true;setError('');try{await task();}catch(e){const failure=e as Error&{job?:VoiceSwap};if(failure.job)remember(failure.job);setError(failure.message);}finally{lock.current=false;if(mounted.current)setBusy('');}}
 async function start(){await act(async()=>{
  if(!source||!cost||configured!==true)throw Error('Wybierz film i potwierdź koszt separacji.');
  if(!/\.(mp4|mov)$/i.test(source.name)||source.size>SWAP_MAX_BYTES)throw Error('Wybierz MP4 lub MOV do 150 MB.');
  const id=startId.current||crypto.randomUUID();startId.current=id;const path=`sources/${id}/source.${/\.mov$/i.test(source.name)?'mov':'mp4'}`;
  if(sourceUpload.current?.file!==source){setBusy('Wgrywam film…');await uploadMedia(path,source,p=>setBusy(`Wgrywam film · ${Math.round(p)}%`));sourceUpload.current={file:source,path};}try{localStorage.setItem(storageKey,id);}catch{}
  setBusy('Zapisuję proces…');const r=await api({action:'start',id,sourcePath:path,name:source.name,confirmCost:true});remember(r.job);
 });}
 async function render(){await act(async()=>{
  if(!job||!voice||!approved)throw Error('Wybierz nowy głos i zatwierdź odsłuchane tło.');
  if(voice.size>30*1024*1024||!/\.(mp3|wav|m4a)$/i.test(voice.name))throw Error('Wybierz MP3, WAV lub M4A do 30 MB.');
  let path=voiceUpload.current?.file===voice?voiceUpload.current.path:'';
  if(!path){path=`sources/${crypto.randomUUID()}/audio.${voice.name.split('.').pop()!.toLowerCase()}`;setBusy('Wgrywam nowy voiceover…');await uploadMedia(path,voice,p=>setBusy(`Wgrywam głos · ${Math.round(p)}%`));voiceUpload.current={file:voice,path};}
  setBusy('Zapisuję miks…');const r=await api({action:'mix',id:job.id,voicePath:path,voiceGain,backgroundGain,offset,approved:true});remember(r.job);
 });}
 async function resume(){await act(async()=>{if(!job)return;setBusy('Wznawiam zapisany proces…');remember((await api({action:'resume',id:job.id})).job);});}
 const disabled=!!busy||active(job),bedReady=!!job?.backgroundUrl;
 return <main className="vs"><a className="vs-back" href="/">← Ad Ops</a><header><span className="vs-eyebrow">AUDIO / VIDEO</span><h1>Voice Swapper</h1><p>Podmień lektora. Zachowaj muzykę i dźwięki oryginalnej reklamy.</p></header>
 <ol className="vs-steps" aria-label="Etapy"><li aria-current={!job?'step':undefined}>1. Oryginał</li><li aria-current={job&&!bedReady?'step':undefined}>2. Separacja</li><li aria-current={bedReady&&job?.status!=='done'?'step':undefined}>3. Nowy głos</li><li aria-current={job?.status==='done'?'step':undefined}>4. Gotowy film</li></ol>
 {configured===false&&<p className="vs-error" role="alert">ElevenLabs nie jest skonfigurowany na serwerze. Dodaj ELEVENLABS_API_KEY przed uruchomieniem separacji.</p>}
 {error&&<p className="vs-error" role="alert">{error}</p>}
 {!job&&<section className="vs-card"><h2>Oryginalny film</h2><label className="vs-file">Wybierz wideo<input type="file" accept="video/mp4,video/quicktime,.mp4,.mov" disabled={disabled} onChange={e=>{setSource(e.target.files?.[0]||null);startId.current='';}}/></label><p className="vs-help">MP4 lub MOV · do 150 MB i 5 minut. Obraz zostanie skopiowany bez ponownego kodowania.</p>{source&&<p>{source.name}</p>}{sourcePreview&&<video controls preload="metadata" src={sourcePreview} onLoadedMetadata={e=>{if(e.currentTarget.duration>SWAP_MAX_SECONDS)setError('Film może mieć maksymalnie 5 minut.');}}/>}
 <aside><strong>Jedna płatna separacja w ElevenLabs</strong><p>Używamy Twojego konta ElevenLabs i modelu two_stems_v1. Koszt zależy od planu i długości nagrania; nie mamy potwierdzonej stałej stawki. Oryginalne audio zostanie wysłane do ElevenLabs. Zmiana głośności i ponowny eksport korzystają z zapisanego tła.</p></aside>
 <label className="vs-check"><input type="checkbox" checked={cost} disabled={disabled} onChange={e=>setCost(e.target.checked)}/>Zgadzam się na jedną płatną separację audio w ElevenLabs.</label>
 <button className="vs-primary" disabled={disabled||!source||!cost||configured!==true} onClick={()=>void start()}>{busy||'Usuń oryginalną mowę'}</button></section>}
 {job&&<section className="vs-card"><div className="vs-status"><div><h2>{labels[job.status]}</h2><p>{job.name}{job.duration?` · ${Math.round(job.duration)} s`:''}</p></div>{active(job)&&<span className="vs-progress" aria-label="Przetwarzanie w tle"/>}</div><p role="status">{active(job)?'Proces działa w tle. Możesz zamknąć tę kartę i wrócić później. Status sprawdzamy co 30 sekund, tylko w widocznej karcie.':bedReady?'Tło jest zapisane. Kolejne miksy nie powtarzają płatnej separacji.':''}</p>{pollError&&<p role="status">{pollError}</p>}{job.error&&<p role="alert" className="vs-error">{job.error}</p>}
 {job.status==='uncertain'&&<p>Nie uruchamiaj kolejnej separacji, dopóki nie sprawdzisz wyniku i naliczenia w ElevenLabs.</p>}
 {((job.status==='error'&&!(job.paidIntent&&!job.archiveUrl))||(active(job)&&Date.now()>(job.leaseUntil||job.updated+330000)))&&<button disabled={!!busy} onClick={()=>void resume()}>Wznów zapisany proces</button>}
 </section>}
 {bedReady&&<><section className="vs-card"><h2>Posłuchaj tła bez lektora</h2><p>Separacja może pozostawić ślady mowy albo naruszyć efekty dźwiękowe. Sprawdź nagranie przed eksportem.</p><audio controls preload="none" src={job!.backgroundUrl}/><a href={job!.backgroundUrl} target="_blank" rel="noreferrer">Pobierz samo tło ↗</a>{job?.vocalsUrl&&<details><summary>Oryginalny głos po separacji</summary><audio controls preload="none" src={job.vocalsUrl}/></details>}<label className="vs-check"><input type="checkbox" checked={approved} disabled={disabled} onChange={e=>setApproved(e.target.checked)}/>Odsłuchałem tło i akceptuję wynik separacji.</label></section>
 <section className="vs-card"><h2>Nowy voiceover</h2><label className="vs-file">Plik z ElevenLabs<input type="file" accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,.mp3,.wav,.m4a" disabled={disabled} onChange={e=>{setVoice(e.target.files?.[0]||null);voiceUpload.current=null;}}/></label><p className="vs-help">Wgraj gotowy MP3, WAV lub M4A. Voice Swapper nie generuje ani nie klonuje głosu.</p>{voicePreview&&<audio controls preload="metadata" src={voicePreview}/>}
 <div className="vs-controls"><label>Głośność nowego głosu · {Math.round(voiceGain*100)}%<input type="range" min="0" max="2" step="0.05" value={voiceGain} disabled={disabled} onChange={e=>setVoiceGain(Number(e.target.value))}/></label><label>Głośność tła · {Math.round(backgroundGain*100)}%<input type="range" min="0" max="2" step="0.05" value={backgroundGain} disabled={disabled} onChange={e=>setBackgroundGain(Number(e.target.value))}/></label><label>Początek nowego głosu (sekundy)<input type="number" min="0" max={job!.duration} step="0.1" value={offset} disabled={disabled} onChange={e=>setOffset(Number(e.target.value))}/></label></div>
 <p className="vs-help">Zachowujemy długość i obraz filmu. Za długi voiceover zostanie odrzucony, zamiast ucięcia słów.</p><button className="vs-primary" disabled={disabled||!voice||!approved} onClick={()=>void render()}>{busy||'Połącz i przygotuj film'}</button></section></>}
 {job?.outputUrl&&job.status==='done'&&<section className="vs-card"><h2>Gotowy film</h2><video controls preload="metadata" src={job.outputUrl}/><a className="vs-download" href={job.outputUrl} target="_blank" rel="noreferrer">Otwórz / pobierz film ↗</a><p className="vs-help">Oryginalny obraz + zapisane tło + nowy głos. Bez generowania wideo.</p></section>}
 {job&&!active(job)&&<button disabled={!!busy} onClick={()=>{setJob(null);setSource(null);setVoice(null);setApproved(false);setCost(false);setError('');startId.current='';voiceUpload.current=null;try{localStorage.removeItem(storageKey);}catch{}}}>Nowy film</button>}
 </main>;
}
