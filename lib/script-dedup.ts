import type {Job} from './jobs';
import {isNonSpeechTranscript} from './no-speech';
import type {Market} from './market';

export type ScriptDuplicateMatch={id:string;adId?:string;name:string;market:Market;score:number};
export type ScriptDuplicate={checkedAt:number;matches:ScriptDuplicateMatch[]};
export const SCRIPT_DUPLICATE_THRESHOLD=.85;

/** Compare source copy, never an edited/localised script or its hooks. */
export function sourceScript(job:Pick<Job,'transcript'|'result'>):string{
 return job.transcript?.trim()||job.result?.us_script?.trim()||'';
}
export function normalizedSourceWords(text:string):string[]{
 return text.normalize('NFKC').toLocaleLowerCase('en-GB').replace(/[’‘]/g,"'").match(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu)||[];
}
function shingles(words:string[],size=5){
 const result=new Set<string>();for(let i=0;i<=words.length-size;i++)result.add(words.slice(i,i+size).join(' '));return result;
}
/** Five-word order prevents a common CTA or shared vocabulary matching an ad. */
export function scriptSimilarity(a:string,b:string):number{
 if(isNonSpeechTranscript(a)||isNonSpeechTranscript(b))return 0;
 const aw=normalizedSourceWords(a),bw=normalizedSourceWords(b);
 if(Math.min(aw.length,bw.length)<10)return 0;
 if(aw.length===bw.length&&aw.every((word,i)=>word===bw[i]))return 1;
 if(Math.min(aw.length,bw.length)<30)return 0;
 const sa=shingles(aw),sb=shingles(bw);let common=0;for(const key of sa)if(sb.has(key))common++;
 // Penalise truncation/large extensions even when both sets have repeated lines.
 return Math.min(2*common/(sa.size+sb.size),Math.min(aw.length,bw.length)/Math.max(aw.length,bw.length));
}
function earlier(a:Pick<Job,'created'|'id'>,b:Pick<Job,'created'|'id'>){
 return (a.created||0)<(b.created||0)||a.created===b.created&&a.id.localeCompare(b.id)<0;
}
export function findScriptDuplicates(current:Pick<Job,'id'|'created'|'transcript'|'result'>,candidates:Job[]):ScriptDuplicateMatch[]{
 const source=sourceScript(current);if(!source)return [];
 return candidates.filter(job=>job.id!==current.id&&!job.cancelledAt&&!job.abortedAt&&!job.scriptDuplicate&&!['Cancelled','Aborted'].includes(job.status))
  // Two new simultaneous uploads choose one stable keeper; neither depends on
  // which worker happens to finish transcription/checking first.
  .filter(job=>!job.duplicateCheckRequired||job.stages?.duplicateCheck?.done||!!job.result||!!job.adId||earlier(job,current))
  .map(job=>({job,score:scriptSimilarity(source,sourceScript(job))}))
  .filter(match=>match.score>=SCRIPT_DUPLICATE_THRESHOLD)
  .sort((a,b)=>b.score-a.score||(a.job.created||0)-(b.job.created||0)||a.job.id.localeCompare(b.job.id))
  .slice(0,5).map(({job,score})=>({id:job.id,...(job.adId?{adId:job.adId}:{}),name:job.name,market:job.market||'uk',score:Math.round(score*10000)/10000}));
}
export function duplicateScriptMessage(matches:ScriptDuplicateMatch[]){
 const first=matches[0];return `This advert's script has already been added${first?` (${first.adId||first.name||first.id})`:''}. Open the existing advert, or explicitly choose Continue anyway. No further production has started.`;
}
