import {narration} from './speech';
/** One consistent delivery; do not alternate emotional personas between sentences. */
export function directedNarration(script:string,emotion:'off'|'subtle'='off'){
 const text=narration(script);
 return emotion==='subtle'&&text?'[calm] '+text:text;
}
