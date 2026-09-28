'use client';
type Voice={voice_id:string;name:string;group?:string};
const groups=[['British','British'],['Created by you','Created by me'],['Favourites','Favourites']] as const;
export function VoiceOptions({voices}:{voices:Voice[]}){return <>{groups.map(([group,label])=>{const items=voices.filter(v=>v.group===group);return items.length?<optgroup key={group} label={label}>{items.map(v=><option key={v.voice_id} value={v.voice_id}>{v.name}</option>)}</optgroup>:null;})}</>;}
export default function VoicePicker({voices,value,onChange,disabled=false}:{voices:Voice[];value:string;onChange:(id:string)=>void;disabled?:boolean}){
 return <label>Voice<select value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}><option value="">Choose a voice…</option><VoiceOptions voices={voices}/></select></label>;
}
