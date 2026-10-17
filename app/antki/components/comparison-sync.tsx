'use client';
import {createContext,useCallback,useContext,useRef,useState,type ReactNode} from 'react';
type Sync={active:number;enabled:boolean;register:(id:string,node:HTMLDivElement|null)=>void;scroll:(id:string)=>void;focus:(anchor:number)=>void};
const Context=createContext<Sync|null>(null);
export function useComparisonSync(){return useContext(Context);}
export default function ComparisonSync({children}:{children:ReactNode}){
 const panes=useRef(new Map<string,HTMLDivElement>()),locked=useRef(false);
 const [active,setActive]=useState(0),[enabled,setEnabled]=useState(true);
 const register=useCallback((id:string,node:HTMLDivElement|null)=>{if(node)panes.current.set(id,node);else panes.current.delete(id);},[]);
 const scroll=useCallback((id:string)=>{
  const source=panes.current.get(id);if(!source||locked.current||!source.clientHeight)return;
  const top=source.getBoundingClientRect().top+24,blocks=Array.from(source.querySelectorAll<HTMLElement>('[data-anchor]'));
  const block=blocks.find(e=>e.getBoundingClientRect().bottom>top)||blocks.at(-1);if(!block)return;
  const anchor=Number(block.dataset.anchor),rect=block.getBoundingClientRect(),fraction=Math.max(0,Math.min(1,(top-rect.top)/Math.max(1,rect.height)));setActive(anchor);
  if(!enabled)return;locked.current=true;
  for(const [otherId,node] of panes.current){if(id===otherId||!node.clientHeight)continue;
   const candidates=Array.from(node.querySelectorAll<HTMLElement>('[data-anchor]'));
   const target=candidates.reduce<HTMLElement|undefined>((best,e)=>!best||Math.abs(Number(e.dataset.anchor)-anchor)<Math.abs(Number(best.dataset.anchor)-anchor)?e:best,undefined);
   if(target){const r=target.getBoundingClientRect();node.scrollTop+=r.top-node.getBoundingClientRect().top+fraction*r.height-24;}
  }
  requestAnimationFrame(()=>{locked.current=false;});
 },[enabled]);
 return <Context.Provider value={{active,enabled,register,scroll,focus:setActive}}><label className="antki-sync-control"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>Synchro przewijanie · 3 wersje</label>{children}</Context.Provider>;
}
