import {diffWords} from 'diff';
import {withoutGummyFormatCritique} from './product-format';
const words=(text:string)=>(text.toLowerCase().match(/[a-z0-9]+/g)||[]).length;
export function closeFidelity(source:string,target:string,ctaMode:'original'|'learn-more'='original',adaptGummyFormat=false){
 // An explicitly selected article ending may remove the offer, but never the body.
 if(ctaMode==='learn-more'){
  const endings=/\b(?:click|tap|follow|use)\b[^\n.!?]{0,35}\b(?:link|button)\b|\blinks?(?:'s| is)?\s+(?:below|in(?:\s+the)?\s+bio)\b|\b(?:order|buy|shop)\s+(?:now|today)\b/gi;
  const start=[...source.matchAll(endings)].find(m=>m.index!>=source.length*.5)?.index;
  if(start!==undefined)source=source.slice(0,start);
 }

 const originalTotal=words(source);
 if(adaptGummyFormat)source=withoutGummyFormatCritique(source);
 const total=words(source);if(originalTotal<100||!total)return true;
 const changes=diffWords(source.toLowerCase(),target.toLowerCase(),{timeout:1000});if(!changes)return false;
 const kept=changes.filter(change=>!change.added&&!change.removed).reduce((n,change)=>n+words(change.value),0);
 const threshold=originalTotal<=160?.68:.72;
 return kept/total>=threshold;
}

