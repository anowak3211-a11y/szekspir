import {readState,readStates} from './store';
import type {AntkiWork} from './antki-model';
/** Read saved failures in batches. Never fetch media, poll providers or replay paid work. */
export async function antkiDiagnostics(){
 const index=(await readState<Record<string,{status:string;phase:string;localizedStatus?:string}>>('antki-work-index',{})).value;
 const ids=Object.keys(index).filter(id=>/^facebook_\d{5,30}$/.test(id)&&(['failed','uncertain'].includes(index[id].status)||['failed','uncertain'].includes(index[id].localizedStatus||'')));
 if(ids.length>300)throw Error('Zbyt wiele błędów do jednorazowego odczytu.');
 const rows=await readStates<{work?:AntkiWork}>(ids.map(id=>'antki-work-'+id+'-record'),{});
 return {localizedCounts:Object.values(index).reduce<Record<string,number>>((out,w)=>{if(w.localizedStatus)out[w.localizedStatus]=(out[w.localizedStatus]||0)+1;return out;},{}),localizedRecords:ids.flatMap((id,i)=>{const w=rows[i]?.work,v=w?.localizedVersion;return v&&['failed','uncertain'].includes(v.status)?[{id,status:v.status,error:v.error||'Localisation requires review.',hasRetainedDraft:!!v.rejectedText,parts:v.chunks.length,total:w?.chunks.length}]:[];}),counts:Object.values(index).reduce<Record<string,number>>((out,w)=>{out[w.status]=(out[w.status]||0)+1;return out;},{}),records:ids.flatMap((id,i)=>{if(!['failed','uncertain'].includes(index[id].status))return [];const w=rows[i]?.work;return [{id,status:w?.status||index[id].status,phase:w?.phase||index[id].phase,error:w?.error||'Brak zapisanej przyczyny. Nie ponowiono zadania.',pending:!!w?.pending,hasText:!!w?.ukText,hasImage:!!w?.imageDriveUrl,hasKnownImageTask:!!w?.imageTaskId}];})};
}
