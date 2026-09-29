import {videoLinks} from './video-links';
import {sendsHook} from './hook-delivery';
import type {Job} from './jobs';
export type DeliveryCheck={label:string;ok:boolean;detail?:string};
export function editorChecklist(job:Job,headers:string[],row:unknown[]){
 const cell=(name:string)=>String(row[headers.indexOf(name)]||'').trim();
 const same=(name:string,expected:string|undefined)=>!!expected?.trim()&&cell(name)===expected.trim();
 const links=cell('Voice Over');
 const recorded=(label:string,url:string|undefined)=>!!url&&links.split('\n').some(line=>line===`${label}: ${url}`);
 const checks:DeliveryCheck[]=[{label:job.market==='pl'?'Polish script':'UK script',ok:same('Adapted script',job.result?.uk_script)},...(job.result?.hooks||[]).slice(0,2).flatMap((_,i)=>sendsHook(job,i)?[{label:`Hook ${i+1}`,ok:same(`Hook ${i+1}`,job.result?.hooks[i])}]:[])];
 if(job.voiceoverEnabled!==false){checks.push({label:'Main voiceover',ok:!job.voNeedsRegeneration&&recorded('Main VO',job.voUrl),detail:job.voNeedsRegeneration?'Script changed — regenerate the main voiceover.':undefined});for(const i of (job.result?.hooks||[]).slice(0,2).map((_,i)=>i).filter(i=>sendsHook(job,i)))checks.push({label:`Hook ${i+1} voiceover`,ok:!job.hookVoPending?.[i]&&!job.hookVoNeedsRegeneration?.[i]&&recorded(`Hook ${i+1}`,job.hookVoUrls?.[i]),detail:job.hookVoPending?.[i]?'Recording is still in progress.':job.hookVoNeedsRegeneration?.[i]?'Hook changed — record this hook again.':undefined});}
 if(job.videoDestination==='drive'||job.video)checks.push({label:'Video',ok:(job.videoDestination==='drive'||job.vmakeMode!=='combo'||!!(job.enhancedSavedUrl&&job.cleanUrl))&&same('Video',videoLinks(job))});
 if(job.generateVo&&!job.stages?.vo?.done)checks.push({label:'Recording completed',ok:false,detail:job.stages?.vo?.error||'Recording is still in progress.'});
 if(job.hookDeliveryPending!==undefined)checks.push({label:'Hook delivery selection saved',ok:false,detail:'Retry saving the hook selection.'});
 return checks;
}

export function deliveryVersion(job:Job){return JSON.stringify([job.id,job.revision,job.result?.uk_script,job.result?.hooks,job.voUrl,job.hookVoUrls,job.voNeedsRegeneration,job.hookVoNeedsRegeneration,job.hookVoPending,job.driveUrl,job.cleanUrl,job.enhancedSavedUrl,job.vmakeMode,job.hooksToEditor,job.hookDeliveryPending]);}
