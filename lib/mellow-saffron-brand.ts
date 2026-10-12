/** Literal owner-requested target naming. Original transcripts/research stay untouched. */
export function isMellowSaffronTarget(name:string,context='',sheetProduct?:string){
 if(sheetProduct==='Kids Gummies'||/^kids gummies$/i.test(name)||/^mellow\b.*(?:kids|saff[ro]*n|mood\s+munchies)/i.test(name))return true;
 try{const data=JSON.parse(context);const profiles=Array.isArray(data.facts)?data.facts.map((x:{content?:unknown})=>x.content):[data];return profiles.some((x:{product_name?:unknown}|null)=>x&&typeof x.product_name==='string'&&/^mellow\b.*(?:kids|saff[ro]*n|mood\s+munchies)/i.test(x.product_name));}catch{return false;}
}
export function canonicalMellowSaffronName(text:string){
 return text.replace(/(?:https?:\/\/|www\.)[^\s]+|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:[A-Z0-9-]+\.)+[A-Z]{2,}(?:\/[^\s]*)?|\bsapp?hire\s+happy\s+chews\b|\bhappy\s+chews\b|\bmellow\b(?!\s+magnesium\b)(?:\s+(?:mood\s+munchies|happy\s+chews|kids(?:\s+gummies)?|saff(?:ro|o|r)?n(?:\s+gummies)?|gummies))?/gi,(match,offset:number)=>{
  if(/[.@]/.test(match))return match;
  if(/^mellow$/i.test(match)&&/\b(?:more|feel|feels|feeling|felt|very|so|quite|stay|become|became)\s+$/i.test(text.slice(Math.max(0,offset-35),offset)))return match;
  return /^happy\s+chews$/i.test(match)?'Mood Munchies':'Mellow Mood Munchies';
 });
}
