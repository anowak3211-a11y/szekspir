'use client';
import {useEffect,useState} from 'react';

export default function SelectedFilePreview({file}:{file:File}){
 const [open,setOpen]=useState(true),[url,setUrl]=useState(''),[failed,setFailed]=useState(false);
 const video=file.type.startsWith('video/')||/\.(mp4|mov|webm|m4v)$/i.test(file.name);
 useEffect(()=>{
  setFailed(false);
  if(!open){setUrl('');return;}
  const source=URL.createObjectURL(file);
  setUrl(source);
  return ()=>URL.revokeObjectURL(source);
 },[file,open]);
 return <details open={open} onToggle={e=>setOpen(e.currentTarget.open)} className="selected-file-preview">
  <summary>{video?'Preview this ad':'Preview audio'}</summary>
  {open&&url&&<div className="preview-content">
   {video?<video key={url} src={url} controls playsInline preload="metadata" aria-label={`Preview ${file.name}`} onError={()=>setFailed(true)}/>:<audio key={url} src={url} controls preload="metadata" aria-label={`Preview ${file.name}`} onError={()=>setFailed(true)}/>}
   {failed&&<p role="status">Your browser cannot play this file. You can still submit it for processing.</p>}
  </div>}
  <style jsx>{`
   .selected-file-preview{width:100%;min-width:0;border-top:1px solid #deeadf;padding-top:8px}
   summary{cursor:pointer;min-height:44px;align-content:center;color:#137440;font-weight:600;font-size:14px}
   summary:focus-visible{outline:3px solid #244bd6;outline-offset:3px;border-radius:4px}
   .preview-content{padding:4px 0 6px}
   video{display:block;width:100%;max-width:560px;max-height:360px;object-fit:contain;background:#101910;border-radius:10px;margin:0 auto}
   audio{display:block;width:100%;max-width:560px;margin:0 auto}
   p{font-size:14px;color:#66766b;margin:10px 0 0}
   @media(min-width:640px){video{max-height:420px}}
  `}</style>
 </details>;
}
