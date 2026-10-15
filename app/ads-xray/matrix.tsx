'use client';
import {useState} from 'react';
import {compare,type Doc} from '@/lib/xray/ui-model';
import s from './workspace.module.css';
export default function Matrix({doc,onPair}:{doc:Doc;onPair:(a:number,b:number)=>void}){
 const [open,setOpen]=useState(false);
 return <details className={s.matrix} onToggle={e=>setOpen(e.currentTarget.open)}><summary>Wszystkie pary wariantów</summary>{open&&<div className={s.tableScroll}><table><caption>Podobieństwo tekstów. Wybierz parę, aby zobaczyć różnice.</caption><thead><tr><th>Tekst</th>{doc.texts.map((t,i)=><th key={i}>{t.name||String.fromCharCode(65+i)}</th>)}</tr></thead><tbody>{doc.texts.map((t,a)=><tr key={a}><th>{t.name||String.fromCharCode(65+a)}</th>{doc.texts.map((other,b)=><td key={b}>{a===b?'—':<button onClick={()=>onPair(a,b)} aria-label={'Porównaj '+(t.name||a+1)+' i '+(other.name||b+1)}>{Math.round(compare(t.body,other.body,doc.opts).stats.similarity*100)}%</button>}</td>)}</tr>)}</tbody></table></div>}</details>;
}
