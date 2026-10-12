'use client';
import {useEffect,useRef,useState} from 'react';
import {checkSelectedFile,type SelectedFileCheck} from '@/lib/selected-file-check';
export default function FileCheck({file,onChange}:{file:File;onChange:(file:File,result:SelectedFileCheck)=>void}){
 const [result,setResult]=useState<SelectedFileCheck>({status:'checking',percent:0}),[retry,setRetry]=useState(0);
 const report=useRef(onChange);report.current=onChange;
 useEffect(()=>{const controller=new AbortController();
  const update=(value:SelectedFileCheck)=>{if(!controller.signal.aborted){setResult(value);report.current(file,value);}};
  update({status:'checking',percent:0});
  checkSelectedFile(file,controller.signal,percent=>update({status:'checking',percent})).then(update).catch(error=>{if(!controller.signal.aborted)update({status:'error',message:error.message||'Could not check this file.'});});
  return()=>controller.abort();
 },[file,retry]);
 return <div className={result.status==='ready'&&result.duplicate?'file-check duplicate':'file-check'} role="status" aria-live="polite">
  {result.status==='checking'?<p>Checking previous uploads · {result.percent}%</p>:result.status==='error'?<><p>{result.message}</p><button type="button" onClick={()=>setRetry(n=>n+1)}>Check this file again</button></>:result.duplicate?<><p><strong>Already added: {result.duplicate.adId||'existing process'}.</strong> Remove this file from the selection before starting.</p><a href={`${result.duplicate.market==='pl'?'/szekspir-pl':'/szekspir'}?job=${encodeURIComponent(result.duplicate.id)}`} target="_blank" rel="noopener noreferrer">Open earlier advert ↗</a></>:<p>No identical file found. The script is checked after transcription.</p>}
  <style jsx>{`.file-check{padding:10px 12px;border-radius:10px;background:#edf6ee;color:#284b35;font-size:14px;line-height:1.5}.file-check p{margin:0}.duplicate{background:#fff1f0;color:#a32121;border:1px solid #e6b3ae}.file-check a,.file-check button{display:inline-flex;align-items:center;min-height:44px;margin-top:4px}.file-check button{font:inherit;padding:8px 12px;cursor:pointer}.file-check a{font-weight:600;text-decoration:underline}`}</style>
 </div>;
}
