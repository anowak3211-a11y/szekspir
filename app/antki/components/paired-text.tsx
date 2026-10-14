'use client';
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {comparedLines} from '@/lib/antki-lines';
import {characterCount} from '@/lib/native-ad-model';
export default function PairedText({us,uk,mobileSide,onEdit,editable}:{us:string;uk:string;mobileSide:'us'|'uk';onEdit:()=>void;editable:boolean}){
 const lines=useMemo(()=>uk?comparedLines(us,uk):comparedLines(us,us).map(line=>({...line,uk:'',ukParts:[]})),[us,uk]),[hover,setHover]=useState<number|null>(null);
 const left=useRef<HTMLDivElement>(null),right=useRef<HTMLDivElement>(null),scrolling=useRef(false),position=useRef(0);
 useLayoutEffect(()=>{
  const a=left.current,b=right.current;if(!a||!b)return;
  let observer:ResizeObserver;
  function equalise(){
   const l=a!.querySelectorAll<HTMLElement>('[data-line]'),r=b!.querySelectorAll<HTMLElement>('[data-line]');
   l.forEach((el,i)=>{const peer=r[i];if(!peer)return;el.style.minHeight='';peer.style.minHeight='';});
   // Only align when both panes are visible; mobile retains the same logical scroll anchor.
   if(a!.clientWidth&&b!.clientWidth){const heights=Array.from(l,(el,i)=>Math.max(el.getBoundingClientRect().height,r[i]?.getBoundingClientRect().height||0));l.forEach((el,i)=>{const peer=r[i];if(peer){el.style.minHeight=`${heights[i]}px`;peer.style.minHeight=`${heights[i]}px`;}});}
  }
  equalise();observer=new ResizeObserver(equalise);observer.observe(a);observer.observe(b);return()=>observer.disconnect();
 },[lines,mobileSide]);
 useEffect(()=>{const element=mobileSide==='us'?left.current:right.current;if(element)element.scrollTop=position.current;},[mobileSide]);
 function sync(side:'us'|'uk'){
  if(scrolling.current)return;const source=side==='us'?left.current:right.current,target=side==='us'?right.current:left.current;if(!source||!target)return;
  position.current=source.scrollTop;scrolling.current=true;target.scrollTop=source.scrollTop;requestAnimationFrame(()=>{scrolling.current=false;});
 }
 return <div className="antki-paired-text" aria-label="Synchronised USA and UK primary text">{(['us','uk'] as const).map(side=><section key={side} className={`antki-paired-side ${mobileSide!==side?'antki-mobile-hidden':''}`} aria-label={side==='us'?'USA text comparison':'UK text comparison'}><header><h3>{side==='us'?'USA original':'UK version'} · Primary text</h3><span>{characterCount(side==='us'?us:uk).toLocaleString()} znaków</span>{side==='uk'&&<button disabled={!editable} onClick={onEdit}>Edit UK text</button>}</header><div className="antki-paired-scroll" ref={side==='us'?left:right} onScroll={()=>sync(side)} tabIndex={0} aria-label={side==='us'?'Original US text, synchronised scrolling':'UK text with highlighted changes, synchronised scrolling'} onMouseLeave={()=>setHover(null)}>{lines.map((line,i)=><div data-line={i} key={i} className={`antki-paired-line ${hover===i?'is-linked':''}`} onMouseEnter={()=>setHover(i)} onPointerDown={()=>setHover(i)} onFocus={()=>setHover(i)} tabIndex={line.us||line.uk?0:-1} aria-label={line.us||line.uk?`Line ${i+1}`:undefined}>{(side==='us'?line.usParts:line.ukParts).map((part,n)=>part.changed?<mark key={n} className={side==='us'?'antki-removed':'antki-added'}>{part.text}</mark>:<span key={n}>{part.text}</span>)}{!(side==='us'?line.us:line.uk)&&<br/>}</div>)}</div></section>)}</div>;
}
