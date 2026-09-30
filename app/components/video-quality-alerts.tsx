'use client';
import {useEffect,useState} from 'react';
import type {QualityResult} from '@/lib/editor-quality';
type Summary={results:QualityResult[];checks:{editor:string;checkedAt:number|null;error:string|null}[];checkedAt:number|null};
export default function VideoQualityAlerts(){
 const [data,setData]=useState<Summary|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;const load=async()=>{try{const r=await fetch('/api/editors/quality',{cache:'no-store'});if(!r.ok)throw Error();const next=await r.json();if(active){setData(next);setError('');}}catch{if(active)setError('Could not refresh video quality checks.');}};void load();const timer=setInterval(load,60000);return()=>{active=false;clearInterval(timer);};},[]);
 // A revised submission supersedes the first export in the notification summary.
 const current=new Map<string,QualityResult>();for(const r of data?.results||[]){const key=r.editorId+':'+r.adId;const prev=current.get(key);if(!prev||r.field.toLowerCase()==='your revised work')current.set(key,r);}
 const low=[...current.values()].filter(r=>r.status==='low'),unknown=[...current.values()].filter(r=>r.status==='unknown');
 const stale=!!data&&(!data.checkedAt||Date.now()-data.checkedAt>15*60000||data.checks.some(c=>c.error));
 async function refresh(){setBusy(true);try{const r=await fetch('/api/editors/quality',{method:'POST'});if(!r.ok)throw Error();setData(await r.json());setError('');}catch{setError('The quality check could not be completed. Please try again.');}finally{setBusy(false);}}
 return <aside className={`video-quality-alerts ${low.length?'video-quality-low':''}`} aria-label="Video quality checks">
  <details>
  <summary><strong>{low.length?`Improve export quality — ${low.length} ${low.length===1?'task':'tasks'}`:'Submitted video resolution checks'}</strong></summary>
  <div className="video-quality-top"><p>{low.length?'At least 30% fewer pixels than the reference video.':'Warning threshold: at least 30% fewer pixels than the reference.'}</p><button onClick={refresh} disabled={busy}>{busy?'Checking…':'Check now'}</button></div>
  {low.length>0&&<ul>{low.map(r=><li key={r.editorId+r.adId}><a href={r.sheetUrl} target="_blank" rel="noreferrer">{r.adId} · {r.editor} · {r.field}</a><p>{r.files.filter(f=>r.reference&&f.width*f.height*100<=r.reference.width*r.reference.height*70).map(f=>`${f.name}: ${r.reference!.width}×${r.reference!.height} → ${f.width}×${f.height} (${Math.round((1-f.width*f.height/(r.reference!.width*r.reference!.height))*100)}% fewer pixels)`).join('; ')}. Re-export from the supplied reference at its original resolution.</p></li>)}</ul>}
  {unknown.length>0&&<details><summary>Could not verify: {unknown.length}</summary><ul>{unknown.map(r=><li key={r.editorId+r.adId}><a href={r.sheetUrl} target="_blank" rel="noreferrer">{r.adId} · {r.editor}</a><p>{r.message}</p></li>)}</ul></details>}
  <small>Checked automatically every 5 minutes{data?.checkedAt?` · Last full check: ${new Date(data.checkedAt).toLocaleString('en-GB')}`:''}. This checks resolution, not sharpness or compression.</small>
  {(error||stale)&&<p role="status">{error||'Some checks are out of date or not yet available. This does not confirm export quality.'}</p>}
 </details>
 </aside>;
}
