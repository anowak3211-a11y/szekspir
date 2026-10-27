'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {editorNoteReady,type EditorNoteDraft} from '@/lib/file-editor-notes';
const empty:EditorNoteDraft={raw:'',instruction:'',translatedFrom:''};
export default function FileEditorNote({file,value=empty,onChange}:{file:File;value?:EditorNoteDraft;onChange:(value:EditorNoteDraft)=>void}){
 const id=useId(),controller=useRef<AbortController|null>(null),active=useRef(true);const [busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{active.current=true;return()=>{active.current=false;controller.current?.abort();};},[]);
 async function convert(){if(busy||!value.raw.trim())return;const raw=value.raw;setBusy(true);setError('');controller.current=new AbortController();const timer=setTimeout(()=>controller.current?.abort(),40000);
  try{const response=await fetch('/api/editor-instruction',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({note:raw}),signal:controller.current.signal});const result=await response.json();if(!response.ok)throw Error(result.error||'Could not convert the note.');if(active.current)onChange({raw,instruction:result.instruction,translatedFrom:raw});}catch(e){if(active.current)setError((e as Error).name==='AbortError'?'Conversion timed out. Your note is kept; try again when ready.':(e as Error).message);}finally{clearTimeout(timer);if(active.current)setBusy(false);}
 }
 return <section className="editor-note" aria-label={`Editor notes for ${file.name}`} aria-busy={busy}>
  <h3>Notes for this ad’s editor</h3><label htmlFor={id+'-raw'}>Dictate or type your note</label>
  <textarea id={id+'-raw'} rows={3} maxLength={5000} disabled={busy} value={value.raw} placeholder="Dyktuj przez Wispr Flow, np. od 0:26 zmień przebitki, resztę zostaw." onChange={e=>{setError('');onChange(e.target.value?{...value,raw:e.target.value}:empty);}}/>
  <button type="button" disabled={busy||!value.raw.trim()||value.translatedFrom===value.raw&&!!value.instruction.trim()} onClick={convert}>{busy?'Converting…':'Convert to simple English'}</button>
  {(value.raw||value.instruction)&&<><label htmlFor={id+'-english'}>English instruction for the editor</label><textarea id={id+'-english'} rows={5} maxLength={3000} disabled={busy} value={value.instruction} onChange={e=>onChange({...value,instruction:e.target.value,translatedFrom:value.raw})}/><p role="status">{editorNoteReady(value)?'This instruction will go to the editor with this ad. You can edit it before starting.':'Convert your note or enter the English instruction before starting.'}</p></>}
  <p className="help">Wispr Flow types into the first box. Conversion runs only when you click.</p>{error&&<p role="alert">{error}</p>}
  <style jsx>{`.editor-note{width:100%;min-width:0;box-sizing:border-box;border-top:1px solid #deeadf;padding:16px 0 4px;display:grid;gap:10px}.editor-note h3{font-size:16px;margin:0}.editor-note label{font-size:14px;font-weight:600}.editor-note textarea{box-sizing:border-box;width:100%;min-width:0;resize:vertical;padding:12px;border:1px solid #b9c8be;border-radius:10px;font:inherit;font-size:16px;line-height:1.5}.editor-note button{justify-self:start;min-height:44px;max-width:100%;padding:10px 16px;border:1px solid #137440;border-radius:10px;background:#137440;color:white;font:inherit;font-size:14px;cursor:pointer;white-space:normal}.editor-note button:disabled{opacity:.6;cursor:default}.editor-note :is(button,textarea):focus-visible{outline:3px solid #244bd6;outline-offset:3px}.editor-note p{margin:0;font-size:13px;line-height:1.5;color:#526a59}.editor-note [role=alert]{color:#b42318}`}</style>
 </section>;
}
