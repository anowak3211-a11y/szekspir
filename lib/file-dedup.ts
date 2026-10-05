import {mutate,readState} from './store';
type Claim={id:string;until:number;committed:boolean;market:'uk'|'pl'};
export type DuplicateFile={id:string;adId?:string;market:'uk'|'pl'};
export class DuplicateFileError extends Error{constructor(public duplicate:DuplicateFile){super('This exact file has already been added.');}}
function key(hash:string){if(!/^[a-f0-9]{64}$/.test(hash))throw Error('Invalid file fingerprint');return 'source-sha256-'+hash;}
export async function claimFile(hash:string,id:string,market:'uk'|'pl',commit=false){
 if(!/^[\w-]{8,100}$/.test(id))throw Error('Invalid upload ID');
 const name=key(hash),prior=(await readState<{claim?:Claim}>(name,{})).value.claim;
 const old=prior?(await readState<{cancelledAt?:number;adId?:string}|null>('job-'+prior.id,null)).value:null;
 const claim=await mutate<{claim?:Claim},Claim>(name,{},state=>{
  const c=state.claim;
  const cancelled=c&&c.id===prior?.id&&!!old?.cancelledAt;
  if(c&&c.id!==id&&!cancelled&&(c.committed||c.until>Date.now()))return c;
  state.claim={id,market,until:Date.now()+60*60*1000,committed:commit||(c?.id===id&&c.committed)||false};return state.claim;
 });
 if(claim.id!==id)throw new DuplicateFileError({id:claim.id,market:claim.market,...(claim.id===prior?.id&&old?.adId?{adId:old.adId}:{})});
}
export async function releaseFile(hash:string,id:string){
 // Never release an existing job after an ambiguous save response.
 if((await readState<unknown>('job-'+id,null)).value)return;
 await mutate<{claim?:Claim},void>(key(hash),{},state=>{if(state.claim?.id===id)delete state.claim;});
}
