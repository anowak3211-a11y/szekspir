'use client';
import {useCallback,useMemo} from 'react';
import {comparisonBlocks} from '@/lib/antki-lines';
import {characterCount} from '@/lib/native-ad-model';
import {useComparisonSync} from './comparison-sync';

/** Display only the exact target text; removed source words never enter copy or editing. */
export default function HighlightedText({source,text,label}:{source:string;text:string;label:string}){
 const blocks=useMemo(()=>comparisonBlocks(source,text),[source,text]),sync=useComparisonSync();
 const register=sync?.register;
 const ref=useCallback((node:HTMLDivElement|null)=>register?.(label,node),[register,label]);
 return <div className="antki-highlighted-field"><p>{label} <span className="antki-word-count">{characterCount(text).toLocaleString()} znaków</span></p><div ref={ref} onScroll={()=>sync?.scroll(label)} className="antki-diff-text" role="region" aria-label={label+' · różnice względem USA'} tabIndex={0}>{blocks.map((block,i)=>block.separator?block.text:<span key={i} data-anchor={block.anchor} onMouseEnter={()=>sync?.focus(block.anchor)} onClick={()=>sync?.focus(block.anchor)} className={sync?.active===block.anchor?'antki-reading-current':''}>{block.parts.map((part,j)=>part.changed?<mark className="antki-added" key={j}>{part.text}</mark>:part.text)}</span>)}</div></div>;
}
