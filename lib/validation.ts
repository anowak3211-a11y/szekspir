import {permittedRetailFix} from './retail-context';
export type Note = { original: string; replacement: string; reason: string };
export type Gap = { original: string; needed: string };
export interface LocalizeResult {
 no_speech?:boolean;
 uk_script: string; narration: string; hooks: string[]; hook_og: string;
 ad_desire: string; ad_angle: string; unique_mechanism: string;
 funnel: 'TOF'|'MOF'|'BOF'; notes: Note[]; data_gaps: Gap[];
 timing?: { sourceWords:number; targetWords:number; ratio:number; sentenceDelta:number; withinTarget:boolean };
 prompt_version?: string;
 language_check?: {model:string;checkedAt:string};
}
export function objectJson(text:string): Record<string,unknown> {
 const clean=text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
 const parsed=JSON.parse(clean);
 if (!parsed || typeof parsed!=='object' || Array.isArray(parsed)) throw new Error('Expected a JSON object');
 return parsed;
}
function str(o:Record<string,unknown>,key:string,allowEmpty=false) {
 if(typeof o[key]!=='string'||(!allowEmpty&&!o[key].trim())) throw new Error(`Invalid ${key}`);
 return o[key] as string;
}
export function opening(script:string) {
 return (script.replace(/\[[^\]]*\]/g,'').trim().match(/[\s\S]*?[.!?](?=\s|$)/)?.[0] || script.split('\n')[0]).trim();
}
export function validateResult(o:Record<string,unknown>,expectedHooks?:number):LocalizeResult {
 const uk_script=str(o,'uk_script'); const narration=str(o,'narration');
 if(!Array.isArray(o.hooks)||(expectedHooks!==undefined?o.hooks.length!==expectedHooks:![0,2,3].includes(o.hooks.length))||o.hooks.some(x=>typeof x!=='string'||!x.trim())) throw new Error('Expected zero or two non-empty alternative hooks (legacy three-hook ads are supported)');
 if(!['TOF','MOF','BOF'].includes(String(o.funnel))) throw new Error('Invalid funnel');
 if(!Array.isArray(o.notes)||!Array.isArray(o.data_gaps))throw new Error('notes and data_gaps must be arrays');
 const notes=o.notes.map(n=>{if(!n||typeof n!=='object')throw new Error('Invalid note');return {original:str(n,'original',true),replacement:str(n,'replacement',true),reason:str(n,'reason')};});
 const data_gaps=o.data_gaps.map(g=>{if(!g||typeof g!=='object')throw new Error('Invalid gap');return {original:str(g,'original'),needed:str(g,'needed')};});
 return {uk_script,narration,hooks:o.hooks as string[],hook_og:opening(uk_script),ad_desire:str(o,'ad_desire'),ad_angle:str(o,'ad_angle'),unique_mechanism:str(o,'unique_mechanism',true),funnel:o.funnel as LocalizeResult['funnel'],notes,data_gaps};
}
export function words(s:string){return (s.replace(/\[[^\]]*\]/g,'').match(/\S+/g)||[]).length;}
export function sentences(s:string){return s.replace(/\[[^\]]*\]/g,'').split(/[.!?]+(?=\s|$)/).filter(x=>x.trim()).length;}
export function timing(source:string,target:string){
 const sourceWords=words(source),targetWords=words(target),ratio=sourceWords?targetWords/sourceWords:0;
 const sentenceDelta=sentences(target)-sentences(source);
 return {sourceWords,targetWords,ratio,sentenceDelta,withinTarget:ratio>=.9&&ratio<=1.1&&Math.abs(sentenceDelta)<=1};
}
export function hasTokens(s:string){return /\[\[(?:CONFIRM|REVIEW)[\s\S]*?\]\]|\[REVIEW REQUIRED:/i.test(s);}
// An allowlist makes the critic a bounded spelling/idiom pass, not an unchecked rewrite.
const PAIRS:Record<string,string>={color:'colour',colors:'colours',flavor:'flavour',flavors:'flavours',behavior:'behaviour',center:'centre',organize:'organise',organized:'organised',realize:'realise',realized:'realised',mom:'mum',diapers:'nappies',sneakers:'trainers',sidewalk:'pavement',vacation:'holiday',trash:'rubbish',drugstore:'pharmacy'};
export function applyCritic(script:string,fixes:unknown,sourceTranscript?:string):{script:string;fixes:Note[]}{
 if(!Array.isArray(fixes))return {script,fixes:[]}; const accepted:Note[]=[];
 for(const f of fixes){
  if(!f||typeof f.original!=='string'||typeof f.replacement!=='string')continue;
  const a=f.original,b=f.replacement;
  if((PAIRS[a.toLowerCase()]!==b.toLowerCase() && !permittedRetailFix(sourceTranscript||"",a,b)) || a.length>30)continue;
  const escaped=a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const matches=[...script.matchAll(new RegExp(`\\b${escaped}\\b`,'g'))];
  if(matches.length!==1)continue;
  const at=matches[0].index!;
  const before=script.slice(0,at);
  // Never change a phrase inside an audio tag or product placeholder.
  if(before.lastIndexOf('[')>before.lastIndexOf(']'))continue;
  script=script.slice(0,at)+b+script.slice(at+a.length);
  accepted.push({original:a,replacement:b,reason:String(f.reason||'British spelling')});
 }
 return {script,fixes:accepted};
}
