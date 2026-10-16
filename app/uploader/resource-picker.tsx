'use client';
import {useId,useRef,useState} from 'react';
import {Icon} from './icons';
import s from './uploader.module.css';

type Option={id:string;name:string;status?:string};
export function ResourcePicker({label,options,value,disabled,emptyMessage,onChange}:{label:string;options:Option[];value:string;disabled?:boolean;emptyMessage:string;onChange:(value:string)=>void}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const id=useId(),trigger=useRef<HTMLButtonElement>(null),selected=options.find(o=>o.id===value);
 const filtered=options.filter(o=>o.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 const status=(o:Option)=>o.status==='PAUSED'?'OFF':o.status;
 return <div className={s.picker} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}}}>
  <span id={`${id}-label`} className={s.fieldLabel}>{label}</span>
  <button ref={trigger} type="button" className={s.pickerTrigger} aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open&&!disabled} aria-controls={`${id}-options`} disabled={disabled} onClick={()=>setOpen(v=>!v)}>
   <span id={`${id}-value`}>{selected?.name||`Select ${label.toLowerCase()}`}</span><span className={s.pickerTrailing}>{selected?.status&&<small className={selected.status==='ACTIVE'?s.statusActive:s.statusOff}>{status(selected)}</small>}<Icon name="chevron" size={16}/></span>
  </button>
  {open&&!disabled&&<div id={`${id}-options`} className={s.pickerPanel} role="group" aria-labelledby={`${id}-label`}>
   {options.length>6&&<input aria-label={`Filter ${label.toLowerCase()}`} placeholder={`Filter ${label.toLowerCase()}…`} value={query} onChange={e=>setQuery(e.target.value)}/>}
   <div className={s.choiceGrid}>{filtered.map(o=><button type="button" key={o.id} className={`${s.choicePill} ${value===o.id?s.choiceSelected:''}`} aria-pressed={value===o.id} onClick={()=>{onChange(o.id);setOpen(false);setQuery('');trigger.current?.focus();}}><span>{o.name}</span>{o.status&&<small className={o.status==='ACTIVE'?s.statusActive:s.statusOff}>{status(o)}</small>}{value===o.id&&<Icon name="check" size={15}/>}</button>)}</div>
   {!filtered.length&&<p className={s.pickerEmpty}>{options.length?'No matching options.':emptyMessage}</p>}
  </div>}
  {disabled&&<small className={s.pickerHint}>{emptyMessage}</small>}
 </div>;
}

const mellowDestinations=[
 ['Mood Munchies','PDP','/products/mellow-happy-chews-saffron-gummies'],
 ['Magnesium · Cortisol','PDP','/products/mellow-magnesium-gummies'],
 ['Magnesium · Tired / Sleep','PDP','/products/magnesium-bisglycinate-gummies'],
 ['Magnesium · Overstimulated','PDP','/products/mellow-magnesium-bisglycinate-gummies-overstimulated-brain'],
 ['Magnesium · Tired / Sleep','Advertorial','/pages/magnesium-bisglycinate-guide'],
 ['Magnesium · Cortisol','Advertorial','/pages/magnesium-cortisol-guide'],
];
export function DestinationPicker({account,value,onChange}:{account:string;value:string;onChange:(url:string)=>void}){
 const [open,setOpen]=useState(false),id=useId();
 return <div className={s.destinationPicker}><label htmlFor={id}>Website URL</label><input id={id} type="url" placeholder="https://example.com" value={value} onFocus={()=>setOpen(true)} onChange={e=>onChange(e.target.value)}/>
  {account==='1416007652848561'&&<><button type="button" className={s.destinationToggle} aria-expanded={open} aria-controls={`${id}-destinations`} onClick={()=>setOpen(v=>!v)}><Icon name="link" size={15}/>Choose a saved destination<Icon name="chevron" size={14}/></button>
   {open&&<div id={`${id}-destinations`} className={s.pickerPanel}><div className={s.choiceGrid}>{mellowDestinations.map(([label,kind,path])=><button type="button" key={path} aria-pressed={value===`https://try-mellow.co${path}`} className={`${s.choicePill} ${value===`https://try-mellow.co${path}`?s.choiceSelected:''}`} onClick={()=>{onChange(`https://try-mellow.co${path}`);setOpen(false);}}><small>{kind}</small><span>{label}</span></button>)}</div></div>}
  </>}
 </div>;
}
