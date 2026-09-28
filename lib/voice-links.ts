import {sendsHook} from './hook-delivery';
import type {Job} from './jobs';
export function voiceLinks(j:Pick<Job,'voUrl'|'hookVoUrls'|'voNeedsRegeneration'|'hooksToEditor'>){return [j.voUrl?`Main VO${j.voNeedsRegeneration?' (previous script — regenerate)':''}: ${j.voUrl}`:'',...[0,1].map(i=>sendsHook(j,i)&&j.hookVoUrls?.[i]?`Hook ${i+1}: ${j.hookVoUrls[i]}`:'')].filter(Boolean).join('\n');}

export function voiceLinkRuns(text:string){let offset=0;const runs:{startIndex:number;format:{link?:{uri:string}}}[]=[];for(const line of text.split('\n')){const match=line.match(/^(?:Main VO(?: \(previous script — regenerate\))?|Hook [123]): (https:\/\/\S+)$/);if(match){runs.push({startIndex:offset,format:{link:{uri:match[1]}}});if(offset+line.length<text.length)runs.push({startIndex:offset+line.length,format:{}});}offset+=line.length+1;}return runs;}

// Partial updates must not erase other completed recordings.
export function mergeVoiceLinks(previous:string,incoming:string){
 const lines=new Map<string,string>();
 for(const line of [...previous.split('\n'),...incoming.split('\n')]){const key=line.match(/^(Main VO|Hook [123])(?: \(previous script — regenerate\))?: https:\/\//)?.[1];if(key)lines.set(key,line);}
 return ['Main VO','Hook 1','Hook 2','Hook 3'].map(key=>lines.get(key)).filter(Boolean).join('\n');
}
