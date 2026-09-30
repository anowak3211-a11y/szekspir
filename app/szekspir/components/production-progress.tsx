'use client';
import {useEffect,useRef,useState} from 'react';
import AdVideoPreview from './ad-video-preview';
import type {Job} from '@/lib/jobs';
import {progressRows,type UploadStatus} from '@/lib/progress-view';
function elapsed(ms:number){const s=Math.max(0,Math.floor(ms/1000));return s<60?`${s}s`:`${Math.floor(s/60)}m ${s%60}s`;}
export default function ProductionProgress({job,upload,lastChecked}:{job?:Job;upload?:UploadStatus|null;lastChecked:number}){
 const [now,setNow]=useState(Date.now()),[sound,setSound]=useState(true),[soundError,setSoundError]=useState('');
 const audio=useRef<AudioContext|null>(null),previous=useRef<string|null>(null);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{try{setSound(localStorage.getItem('szekspir-completion-sound')!=='off');}catch{}return()=>{void audio.current?.close();};},[]);
 async function enableAudio(){try{audio.current??=new AudioContext();await audio.current.resume();if(audio.current.state==='running')setSoundError('');}catch{setSoundError('Click the sound button to enable audio in this browser.');}}
 useEffect(()=>{if(!sound)return;void enableAudio();const unlock=()=>{void enableAudio();};window.addEventListener('pointerdown',unlock);window.addEventListener('keydown',unlock);return()=>{window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);};},[sound]);
 function chime(){const ctx=audio.current;if(!ctx||ctx.state!=='running'){setSoundError('Sound was blocked by the browser. Click the sound button to enable audio.');return;}[659,880].forEach((hz,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.2;o.frequency.value=hz;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.36);});}
 async function toggle(){if(soundError){await enableAudio();return;}const next=!sound;setSound(next);try{localStorage.setItem('szekspir-completion-sound',next?'on':'off');}catch{}if(next)await enableAudio();}
 const completion=job?.step==='done'&&job.status!=='Aborted'?`${job.id}:${job.completedAt||job.revision||0}`:'';
 useEffect(()=>{if(previous.current!==null&&completion&&completion!==previous.current&&sound){chime();}previous.current=completion;},[completion,sound]);
 const totalStart=job?.startedAt||upload?.startedAt||job?.created;
 const totalEnd=job?.completedAt||(job?.step==='done'?job.updated:now);
 const rows=progressRows(job,upload),done=rows.filter(r=>r.state==='done').length;
 const progressError=job?job.error:upload?.error;
 const complete=job?.step==='done',failed=job?.status==='Failed'||(!job&&!!upload?.error);
 const stale=job?!complete&&now-job.updated>180000:!!upload&&!upload.error&&now-upload.updated>120000;
 const disconnected=lastChecked>0&&now-lastChecked>90000;
 const slow=rows.filter(r=>r.state==='active'&&r.started&&now-r.started>120000);
 const stageErrors=rows.filter(r=>r.state==='error');
 const active=rows.filter(r=>r.state==='active').map(r=>r.label);
 return <section className="production-card" aria-label="Production progress">
  <div className="production-heading"><div><p className="production-file">{job?.name||upload?.name||'New localisation'}</p><p className="production-eyebrow">{job?.adId||'LOCALISATION'}</p><h2>{job?.status==='Aborted'?'Stopped by you':complete?(job?.status==='Complete'?'Your localisation is ready':'Draft ready for review'):failed?'Needs attention':active.length?active.join(' + '):job?'Queued for processing':'Preparing your upload'}</h2></div><button type="button" className="sound-button" onClick={toggle} aria-pressed={sound}>{sound?'Completion sound: on':'Enable completion sound'}</button></div>
  {job&&<AdVideoPreview key={job.id} job={job}/>}
  {soundError&&<p role="alert">{soundError}</p>}
  {stageErrors.length>0&&<div className="production-warning" role="alert">{stageErrors.map(r=><p key={r.key}><strong>{r.label}: </strong>{r.detail||"This stage failed. Retry is required."}</p>)}</div>}
  {slow.length>0&&<div className="production-warning" role="status">{slow.map(r=><p key={r.key}><strong>{r.label} · {elapsed(now-r.started!)}.</strong> Taking longer than expected. {r.detail} No completed result confirmed yet.</p>)}</div>}
  <div className="production-total"><span>Total time</span><strong>{totalStart?elapsed(totalEnd-totalStart):'—'}</strong><small>{job?.step==='done'?'Finished': 'Since starting'}{!job?.startedAt&&!upload?.startedAt?' · upload time unavailable for this older job':''}</small></div>
  <div className="production-summary"><span aria-live="polite">{done} of {rows.length} stages complete</span><span>{job?elapsed((job.completedAt||now)-job.created)+' elapsed':'Upload progress'}</span></div>
  <progress className="production-bar" value={done} max={rows.length} aria-label="Completed stages"/>
  <ol className="production-stages">{rows.map((row,i)=><li key={row.key} className={`production-stage ${row.state}`}><span className="stage-icon" aria-hidden="true">{row.state==='done'?'✓':row.state==='error'?'!':i+1}</span><div className="stage-content"><div className="stage-top"><strong>{row.label}</strong><span>{row.state==='done'?'Done':row.state==='error'?'Error':row.state==='active'?'In progress':'Waiting'}{row.started?' · '+elapsed((row.finished||(job?.status==='Failed'?job.updated:now))-row.started):''}</span></div><p>{row.detail}</p>{row.state==='active'&&(row.percent!==undefined?<progress value={row.percent} max={100} aria-label={`${row.label}: ${row.percent}%`}/>:<progress aria-label={`${row.label} in progress; percentage unavailable`}/>)}</div></li>)}</ol>
  {progressError&&<p className="production-warning" role="alert">{progressError}</p>}
  {(stale||disconnected)&&<p className="production-warning" role="status">{disconnected?'Cannot confirm the latest status. Check your connection.':job?'This stage is taking longer. No new result has been saved yet; the service may still be processing.':'No upload update for over two minutes. Check the original upload tab; the file may not have been saved as a job yet.'}</p>}
  <p className="production-footnote">{lastChecked?`Last checked ${elapsed(now-lastChecked)} ago. `:'Checking saved status… '}{complete?'Editor workspace synchronises separately.':job?'Progress updates automatically. Some stages run at the same time.':'Keep the original upload tab open until saving finishes.'}</p>
 </section>;
}
