import {readFileSync} from 'node:fs';
import path from 'node:path';
import {ukLocalisationGuide} from './uk-localisation-guide';
let guide:string|undefined;
export function antkiLocalisationGuide(){
 if(guide)return guide+'\n\n'+ukLocalisationGuide('native');
 let source:string;
 try{source=readFileSync(path.join(process.cwd(),'docs/antki/kompendium-uk-us-ads.md'),'utf8');}catch{throw Error('Antki localisation handbook is unavailable. No provider request was submitted.');}
 if(!source.trim()||source.length>100000)throw Error('Invalid Antki localisation handbook.');
 guide=source;
 return guide+'\n\n'+ukLocalisationGuide('native');
}
