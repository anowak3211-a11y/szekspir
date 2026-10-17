'use client';
import {useMemo} from 'react';
import {highlightedTarget} from '@/lib/antki-lines';
import {characterCount} from '@/lib/native-ad-model';

/** Display only the exact target text; removed source words never enter copy or editing. */
export default function HighlightedText({source,text,label}:{source:string;text:string;label:string}){
 const parts=useMemo(()=>highlightedTarget(source,text),[source,text]);
 return <div className="antki-highlighted-field"><p>{label} <span className="antki-word-count">{characterCount(text).toLocaleString()} znaków</span></p><div className="antki-diff-text" role="region" aria-label={label+' · różnice względem USA'} tabIndex={0}>{parts.map((part,i)=>part.changed?<mark className="antki-added" key={i}>{part.text}</mark>:part.text)}</div></div>;
}
