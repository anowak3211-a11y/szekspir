import {narration} from './speech';
/** One consistent delivery; do not alternate emotional personas between sentences. */
export function directedNarration(script:string,emotion:'off'|'subtle'='off',market:'uk'|'pl'='uk'){
 const text=narration(script,market);
 return emotion==='subtle'&&text?'[calm] '+text:text;
}
