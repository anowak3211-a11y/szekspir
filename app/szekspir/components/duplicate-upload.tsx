'use client';
import {useEffect} from 'react';
import {closeFinishedTab} from '@/lib/finish-tab';
import {displayAdId} from '@/lib/ad-id';
export function DuplicateUpload({id,duplicate,basePath}:{id:string;duplicate:{id:string;adId?:string;market:'uk'|'pl'};basePath:string}){
 useEffect(()=>{const timer=setTimeout(()=>closeFinishedTab(id,basePath),3500);return()=>clearTimeout(timer);},[id,basePath]);
 return <main className="wrap duplicate-upload" role="alert"><svg aria-hidden="true" viewBox="0 0 100 100"><path d="M20 20L80 80M80 20L20 80"/></svg><h1>Duplicate file</h1><p>This exact file has already been added. This new upload was removed without starting paid processing.</p><p>The original advert is unchanged. Closing this tab…</p><a href={`${duplicate.market==='pl'?'/szekspir-pl':'/szekspir'}?job=${encodeURIComponent(duplicate.id)}`} target="_blank" rel="noopener noreferrer">Open {displayAdId(duplicate.adId)||'existing process'} ↗</a><p><a href={basePath}>Back to uploads</a></p></main>;
}
