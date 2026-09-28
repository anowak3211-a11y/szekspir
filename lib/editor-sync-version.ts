import {mutate} from './store';
import type {Snapshot} from './editor-sync-plan';
export const LEGACY_SYNC_FENCE='retired-review-sync-v1';
export const LEGACY_SYNC_FENCE_UNTIL=Date.UTC(2100,0,1);
type LegacyState={snapshot:Snapshot;lease?:string;leaseUntil?:number};
// Old Vercel deployments keep consuming their pinned, self-scheduled messages.
// They already respect this lease, so fence their writes before migrating state.
export async function retireLegacySync(sheetId:string){
 return mutate<LegacyState,Snapshot>('editor-sync-'+sheetId,{snapshot:{}},s=>{
  if(s.lease!==LEGACY_SYNC_FENCE&&(s.leaseUntil||0)>Date.now())throw Error('Previous sync is finishing. Retry shortly.');
  s.lease=LEGACY_SYNC_FENCE;s.leaseUntil=LEGACY_SYNC_FENCE_UNTIL;
  return structuredClone(s.snapshot);
 });
}

// V2 deployments may still own queued callbacks; preserve their baseline but fence writes.
export async function retireV2Sync(sheetId:string,fallback:Snapshot){
 return mutate<LegacyState,Snapshot>('editor-sync-v2-'+sheetId,{snapshot:fallback},s=>{
  if(s.lease!==LEGACY_SYNC_FENCE&&(s.leaseUntil||0)>Date.now())throw Error('Previous sync is finishing. Retry shortly.');
  s.lease=LEGACY_SYNC_FENCE;s.leaseUntil=LEGACY_SYNC_FENCE_UNTIL;
  return structuredClone(s.snapshot);
 });
}
