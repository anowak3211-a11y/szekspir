import {getJob} from './jobs';
import {generateStrongerHook} from './localize';

export type HookRegenerationInput={id:string;index:number;script?:string;currentHook?:string;otherHook?:string};

export function validateHookSelection(id:unknown,index:unknown):asserts id is string{
 if(typeof id!=='string'||!/^[\w-]{8,100}$/.test(id))throw Error('Invalid job ID.');
 if(!Number.isInteger(index)||Number(index)<0||Number(index)>1)throw Error('Invalid hook selection.');
}
function optionalText(value:unknown,name:string,max:number):string|undefined{
 if(value===undefined)return undefined;
 if(typeof value!=='string'||!value.trim()||value.length>max)throw Error(`Invalid ${name}.`);
 return value;
}

/** A text preview only: no job mutation, recording, queue or sheet delivery. */
export async function regenerateHook(input:HookRegenerationInput):Promise<string>{
 validateHookSelection(input.id,input.index);
 const script=optionalText(input.script,'script',100000),currentHook=optionalText(input.currentHook,'hook',5000),otherHook=optionalText(input.otherHook,'other hook',5000);
 const job=await getJob(input.id);
 if(job?.abortedAt||job?.cancelledAt||['Cancelled','Aborted'].includes(job?.status||''))throw Error('This job was stopped.');
 if(!job?.result?.hooks[input.index])throw Error('Wait for the original hooks to finish.');
 if(job.result.no_speech)throw Error('This video has no dialogue.');
 const hook=await generateStrongerHook({script:script||job.result.uk_script,currentHook:currentHook||job.result.hooks[input.index],otherHook:otherHook||job.result.hooks[1-input.index]||'',provider:job.provider,model:job.model,productContext:job.productContext,productName:job.productName,market:job.market,ctaMode:job.ctaMode,singingAd:job.singingAd});
 if(typeof hook!=='string'||!hook.trim()||hook.length>5000)throw Error('The hook preview was invalid. Try again.');
 const latest=await getJob(input.id);
 if(!latest||latest.abortedAt||latest.cancelledAt||['Cancelled','Aborted'].includes(latest.status))throw Error('This job was stopped.');
 return hook;
}
