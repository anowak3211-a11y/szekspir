import {readState,mutate} from './store';
export type CancelCleanup={status:'pending'|'complete'|'failed';requestedAt:number;completedAt?:number;adIds:string[];error?:string};
export function canonicalAdId(id:string){
 const m=id.match(/^(MEL|VID|IMG)-(\d+)$/i);
 if(!m)throw Error('Invalid Ad ID');
 return m[1].toUpperCase()+'-'+m[2].replace(/^0+(?=\d)/,'').padStart(5,'0');
}
export function displayAdId(adId?:string,isImage=false){
 if(!adId)return '';
 return adId.replace(/^MEL-(\d+)$/i,`${isImage?'IMG':'VID'}-$1`);
}
export async function adCancelled(adId:string){return !!(await readState<{at?:number}>('cancelled-ad-'+canonicalAdId(adId),{})).value.at;}
export async function assertAdActive(adId:string){if(await adCancelled(adId))throw Error('This ad was cancelled.');}
export async function assertJobActive(id:string){
 const job=(await readState<{abortedAt?:number;cancelledAt?:number}|null>('job-'+id,null)).value;
 if(job?.abortedAt||job?.cancelledAt)throw Error('This job was stopped.');
}
export async function markAdCancelled(adId:string,jobId:string,at:number){
 await mutate<{jobId?:string;at?:number},void>('cancelled-ad-'+canonicalAdId(adId),{},s=>{s.jobId=jobId;s.at=s.at||at;});
}
