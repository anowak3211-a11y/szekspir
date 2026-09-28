import type {Job} from './jobs';
export function sendsHook(job:Pick<Job,'hooksToEditor'>,index:number){return job.hooksToEditor?.[index]!==false;}
// Keep indexes stable: Hook 2 must never become Hook 1 when the first is excluded.
export function editorHooks(job:Pick<Job,'hooksToEditor'|'result'>){return (job.result?.hooks||[]).map((text,i)=>sendsHook(job,i)?text:'');}
export function replaceHookLink(links:string,index:number,url?:string){
 const lines=links.split('\n').filter(line=>line.trim()&&!new RegExp(`^Hook ${index+1}:`).test(line));
 if(url)lines.push(`Hook ${index+1}: ${url}`);
 return lines.join('\n');
}
