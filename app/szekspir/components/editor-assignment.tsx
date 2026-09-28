'use client';
import {useEffect,useState} from 'react';
type Editor={id:string;name:string;sheetId:string};
export default function EditorAssignment({jobId,adId}:{jobId:string;adId?:string}){
 const [slow,setSlow]=useState(false);
 const [editors,setEditors]=useState<Editor[]>([]),[selected,setSelected]=useState('mine'),[saved,setSaved]=useState('mine'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{setSlow(false);if(!busy)return;const timer=setTimeout(()=>setSlow(true),15000);return()=>clearTimeout(timer);},[busy]);
 useEffect(()=>{let active=true;fetch(`/api/editors?job=${encodeURIComponent(jobId)}`,{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);if(active){setEditors(d.editors);setSelected(d.current);setSaved(d.current);}}).catch(e=>{if(active)setMessage(e.message);});return()=>{active=false;};},[jobId,adId]);
 async function assign(){setBusy(true);setMessage('Assigning and syncing…');try{const r=await fetch('/api/editors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({job:jobId,editorId:selected})});const d=await r.json();if(!r.ok)throw Error(d.error);setSaved(selected);setMessage(selected?'✓ Assigned and synced to the editor workspace.':'✓ Unassigned. The ad stays in Mellow Admin.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 const current=editors.find(e=>e.id===saved);
 return <section className="vopanel"><h2>Assign editor</h2><label>Editor <select value={selected} disabled={busy} onChange={e=>setSelected(e.target.value)}>{editors.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label><button className="primary-action" disabled={busy||!adId} onClick={assign}>{busy?'Assigning…':'Assign to workspace'}</button>{!adId&&<p>Available after saving to Mellow Admin.</p>}{current&&<p><a href={`https://docs.google.com/spreadsheets/d/${current.sheetId}/edit`} target="_blank" rel="noopener noreferrer">Open {current.name} ↗</a></p>}{message&&<p role="status">{slow&&busy?"Still syncing. Requests for this workspace are processed in order; other editors can continue in parallel.":message}</p>}</section>;
}
