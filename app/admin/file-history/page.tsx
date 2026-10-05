'use client';
import {useState} from 'react';
type Item={id:string;adId?:string};
export default function FileHistory(){
 const [running,setRunning]=useState(false),[progress,setProgress]=useState(''),[rows,setRows]=useState<string[]>([]);
 async function run(){setRunning(true);setRows([]);try{
  const r=await fetch('/api/uploads/backfill');const data=await r.json();if(!r.ok)throw Error(data.error);
  let indexed=0,unavailable=0;for(const [i,job] of (data.jobs as Item[]).entries()){
   setProgress(`Checking ${i+1} / ${data.jobs.length} · ${job.adId||job.id}`);
   try{const result=await fetch('/api/uploads/backfill',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:job.id}),signal:AbortSignal.timeout(180000)});const b=await result.json();if(!result.ok)throw Error(b.error);if(b.status==='indexed')indexed++;else unavailable++;setRows(old=>[...old,`${job.adId||job.id}: ${b.status}${b.reason?' — '+b.reason:''}`]);}
   catch(e){unavailable++;setRows(old=>[...old,`${job.adId||job.id}: unavailable — ${(e as Error).message}`]);}
  }setProgress(`Finished. Indexed: ${indexed}. Unavailable: ${unavailable}.`);
 }catch(e){setProgress((e as Error).message);}finally{setRunning(false);}}
 return <main className="wrap"><h1>Original file history</h1><p>Index retained originals for exact-file duplicate detection. No AI generation, no changes to adverts or editor sheets. Completed fingerprints are reused if you run this again.</p><button disabled={running} onClick={run}>{running?'Indexing…':'Index original files'}</button><p role="status">{progress}</p><ul>{rows.map((row,i)=><li key={i}>{row}</li>)}</ul><a href="/szekspir">Back to uploads</a></main>;
}
