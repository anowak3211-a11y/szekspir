import {readFileSync} from 'node:fs';
import path from 'node:path';
let guide:string|undefined;
export function antkiLocalisationGuide(){
 if(guide)return guide;
 try{guide=readFileSync(path.join(process.cwd(),'docs/antki/kompendium-uk-us-ads.md'),'utf8');}catch{throw Error('Antki localisation handbook is unavailable. No provider request was submitted.');}
 if(!guide.trim()||guide.length>100000)throw Error('Invalid Antki localisation handbook.');
 return guide;
}
