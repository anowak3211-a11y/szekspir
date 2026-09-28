export type LibraryVoice={voice_id:string;name:string;category?:string;labels?:Record<string,string>;is_owner?:boolean;favorited_at_unix?:number|null;is_bookmarked?:boolean;preview_url?:string|null};
export function voiceGroup(v:LibraryVoice,market:'uk'|'pl'='uk'):'Favourites'|'Created by you'|'British'|'Polish'|undefined{
 if(v.favorited_at_unix||v.is_bookmarked)return 'Favourites';
 if(v.is_owner||v.category==='generated'||v.category==='cloned')return 'Created by you';
 if(market==='pl')return /\b(pl|polish|polski|poland)\b/i.test([v.labels?.language,v.labels?.accent].join(' '))?'Polish':undefined;
 if(/\b(british|uk|united kingdom|england|london|scottish|welsh|northern irish|received pronunciation)\b/i.test(v.labels?.accent||''))return 'British';
}
export function selectableVoices(voices:LibraryVoice[],market:'uk'|'pl'='uk'){return [...new Map(voices.map(v=>[v.voice_id,v])).values()].flatMap(v=>{const group=voiceGroup(v,market);return group?[{voice_id:v.voice_id,name:v.name,category:v.category,labels:v.labels||{},preview_url:v.preview_url||null,group}]:[];}).sort((a,b)=>['Favourites','Created by you','British','Polish'].indexOf(a.group)-['Favourites','Created by you','British','Polish'].indexOf(b.group)||a.name.localeCompare(b.name));}
