import {readFileSync} from 'node:fs';
import path from 'node:path';
import {ukLocalisationGuide} from './uk-localisation-guide';
let guide:string|undefined,copyGuide:string|undefined;
function copywritingGuide(){
 if(copyGuide===undefined){
  let source:string;
  try{source=readFileSync(path.join(process.cwd(),'docs/antki/copywriting-uk-2026-10-17.md'),'utf8');}catch{throw Error('Antki copywriting rules are unavailable. No provider request was submitted.');}
  if(!source.trim()||source.length>20000)throw Error('Invalid Antki copywriting rules.');
  copyGuide=source;
 }
 return '\n\nLATEST OWNER COPYWRITING UPDATE:\n'+copyGuide;
}
export function antkiLocalisationGuide(copywriting=false){
 if(guide)return guide+'\n\n'+ukLocalisationGuide('native')+(copywriting?copywritingGuide():'');
 let source:string;
 try{source=readFileSync(path.join(process.cwd(),'docs/antki/kompendium-uk-us-ads.md'),'utf8');}catch{throw Error('Antki localisation handbook is unavailable. No provider request was submitted.');}
 if(!source.trim()||source.length>100000)throw Error('Invalid Antki localisation handbook.');
 guide=source;
 return guide+'\n\n'+ukLocalisationGuide('native')+(copywriting?copywritingGuide():'');
}
