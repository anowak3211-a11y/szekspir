'use client';
import {useState} from 'react';
import type {Job} from '@/lib/jobs';

export default function AdVideoPreview({job}:{job:Job}){
 const [open,setOpen]=useState(true),[failed,setFailed]=useState(false);
 const source=job.resolvedVideoUrl||(/\.(mp4|mov|webm|m4v)(?:[?#]|$)/i.test(job.sourceUrl)?job.sourceUrl:'');
 let driveId=job.driveFileId;
 if(!driveId&&job.driveUrl){try{const u=new URL(job.driveUrl);if(u.hostname==='drive.google.com')driveId=u.pathname.match(/\/file\/d\/([\w-]+)/)?.[1]||u.searchParams.get('id')||undefined;}catch{}}
 const drive=driveId&&/^[\w-]+$/.test(driveId)?`https://drive.google.com/file/d/${driveId}/preview`:'';
 const url=source||drive;
 if(!url)return null;
 return <details open={open} className="ad-video-preview" onToggle={e=>setOpen(e.currentTarget.open)}>
  <summary>Preview this ad{job.adId?` · ${job.adId}`:''}</summary>
  {open&&<div className="ad-video-preview-content">
   <p>Original video · {job.name}</p>
   {source?<video key={source} controls playsInline preload="metadata" aria-label={`Original video ${job.adId||job.name}`} onError={()=>setFailed(true)}><source src={source}/></video>:<iframe src={drive} title={`Original video ${job.adId||job.name}`} allowFullScreen/>}
   {failed&&<p role="status">This video could not be played here. Open the original file below.</p>}
   <a href={source||job.driveUrl||drive} target="_blank" rel="noreferrer">Open original video ↗</a>
  </div>}
 </details>;
}
