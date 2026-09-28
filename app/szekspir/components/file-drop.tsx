'use client';
import {useRef,useState} from 'react';
export default function FileDrop({files,onChange,disabled=false,purpose='localise'}:{files:File[];onChange:(files:File[])=>void;disabled?:boolean;purpose?:'localise'|'check'}){
 const input=useRef<HTMLInputElement>(null),depth=useRef(0);const [over,setOver]=useState(false),[error,setError]=useState('');
 function add(incoming:File[]){const valid=incoming.filter(f=>/^(video|audio)\//.test(f.type)||/\.(mp4|mov|webm|m4v|mp3|wav|m4a|aac|ogg|flac)$/i.test(f.name));setError(valid.length!==incoming.length?'Please choose video or audio files only.':'');if(purpose==='check'){onChange(valid.slice(0,1));return;}onChange([...files,...valid.filter(f=>!files.some(x=>x.name===f.name&&x.size===f.size&&x.lastModified===f.lastModified))]);}
 return <div className="upload-wrap">
 <input ref={input} hidden type="file" accept="video/*,audio/*" multiple={purpose!=='check'} disabled={disabled} onChange={e=>{add(Array.from(e.target.files||[]));e.target.value='';}}/>
 <button type="button" className={`drop ${over?'over':''}`} disabled={disabled} onClick={()=>input.current?.click()} onDragEnter={e=>{e.preventDefault();if(!disabled){depth.current++;setOver(true);}}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect=disabled?'none':'copy';}} onDragLeave={e=>{e.preventDefault();if(--depth.current<=0){depth.current=0;setOver(false);}}} onDrop={e=>{e.preventDefault();depth.current=0;setOver(false);if(!disabled)add(Array.from(e.dataTransfer.files));}}>
 <svg className="bin" viewBox="0 0 180 160" fill="none" aria-hidden="true">
 <ellipse cx="90" cy="149" rx="55" ry="7" fill="#214b3420"/>
 <g className="lid"><path d="M39 48 Q36 40 45 37 L134 37 Q143 39 142 48Z" fill="#b6d2a4" stroke="#3b654b" strokeWidth="3"/><path d="M75 36V30Q90 22 105 30V36" stroke="#3b654b" strokeWidth="4" strokeLinecap="round"/></g>
 <g className="paper"><rect x="67" y="28" width="45" height="58" rx="7" fill="#fff4d8" stroke="#9c8865" strokeWidth="2" transform="rotate(12 89 57)"/><path d="M80 44L97 48M78 53L98 57" stroke="#c0aa82" strokeWidth="3" strokeLinecap="round"/></g>
 <path d="M43 55H137L127 135Q125 144 115 145H64Q54 144 53 135Z" fill="#a8c796" stroke="#3b654b" strokeWidth="3"/>
 <path d="M106 58H135L125 137Q124 142 116 143H106Z" fill="#8fb47f"/>
 <rect x="36" y="49" width="108" height="13" rx="6" fill="#c8ddbb" stroke="#3b654b" strokeWidth="3"/>
 <ellipse cx="69" cy="94" rx="7" ry="9" fill="#304a38"/><ellipse cx="111" cy="94" rx="7" ry="9" fill="#304a38"/><circle cx="67" cy="91" r="2.5" fill="white"/><circle cx="109" cy="91" r="2.5" fill="white"/>
 <ellipse cx="61" cy="106" rx="9" ry="4" fill="#e8aaa2"/><ellipse cx="119" cy="106" rx="9" ry="4" fill="#e8aaa2"/>
 <path d="M83 105Q90 115 97 105" stroke="#304a38" strokeWidth="3" strokeLinecap="round"/>
 <path d="M48 116Q34 128 31 115M131 116Q145 128 149 115" stroke="#3b654b" strokeWidth="5" strokeLinecap="round"/>
 </svg>
 <strong>{over?'Drop them in!':files.length?purpose==='check'?'Got it! Drop another to replace':'Got them! Add a few more?':'Drop your videos here'}</strong>
 <span>or <b>browse files</b> · video & audio</span>
 <small>{purpose==='check'?'Compare a script with history. Your file is never deleted.':'Your files are added for localisation, never deleted.'}</small>
 </button>
 <div aria-live="polite">{error&&<p className="error">{error}</p>}{files.length>0&&<p className="count">✓ {files.length} {files.length===1?'file':'files'} ready to {purpose==='check'?'check':'localise'}</p>}</div>
 {files.length>0&&<ul>{files.map((f,i)=><li key={`${f.name}-${f.size}-${f.lastModified}`}><span title={f.name}>{f.name}</span><small>{(f.size/1024/1024).toFixed(1)} MB</small><button type="button" disabled={disabled} aria-label={`Remove ${f.name} from selection`} onClick={()=>onChange(files.filter((_,n)=>n!==i))}>×</button></li>)}</ul>}
 <style jsx>{`
 .upload-wrap{margin:20px 0}.drop{display:flex;align-items:center;flex-direction:column;gap:9px;width:100%;padding:22px 20px 28px;border:2px dashed #b8cdbd;border-radius:24px;background:linear-gradient(145deg,#fbfdf9,#f0f7ed);color:#284b35;cursor:pointer;transition:background .2s,border-color .2s,box-shadow .2s}.drop:hover,.drop.over{border-color:#16834c;background:#eaf7e7;box-shadow:0 8px 28px #254c3212}.drop:focus-visible{outline:3px solid #244bd6;outline-offset:4px}.drop:disabled{opacity:.6;cursor:wait}.bin{width:150px;height:134px;overflow:visible}.lid{transform-origin:138px 48px;transform:rotate(0deg);transition:transform .3s ease}.paper{opacity:0;transform:translateY(22px);transition:transform .3s,opacity .2s}.drop:hover .lid,.over .lid{transform:rotate(18deg) translateY(-15px)}.drop:hover .paper,.over .paper{opacity:1;transform:translateY(0)}.over .bin{transform:rotate(-3deg)}.drop strong{font-size:23px}.drop span{font-size:15px;color:#526a59}.drop b{color:#137440;text-decoration:underline;text-underline-offset:3px}.drop small{font-size:12px;color:#627967;margin-top:3px}.count{color:#137440;font-size:14px}.error{color:#b42318}ul{list-style:none;padding:0;margin:12px 0;display:grid;gap:8px}li{display:flex;align-items:center;gap:12px;padding:10px 14px;background:white;border:1px solid #deeadf;border-radius:12px}li span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}li small{color:#66766b;white-space:nowrap}li button{border:0;background:#eef4ef;border-radius:8px;width:34px;height:34px;font-size:24px;cursor:pointer;color:#45614d}@media(prefers-reduced-motion:reduce){.drop,.lid,.paper{transition:none}.over .bin{transform:none}}
 `}</style></div>;
}
