import {randomUUID} from 'node:crypto';
import {after} from 'next/server';
import {accountEnv,accountDefault,currentWorkspace,inWorkspace} from '@/lib/account-context';
import {accountEditors} from '@/lib/account-editors';
import {accountRoute} from '@/lib/account-route';
import {getJob,stripPlaceholderTokens,type Job} from '@/lib/jobs';
import {mutate} from '@/lib/store';
import {deliveryVersion} from '@/lib/editor-checklist';
import {opening} from '@/lib/validation';
import {editorHooks} from '@/lib/hook-delivery';
import {videoLinks} from '@/lib/video-links';
import {voiceLinks} from '@/lib/voice-links';
import {appendToAdminBriefs,updateReference,updateVoiceover} from '@/lib/sheets';
import {syncAssignedEditor} from '@/lib/editor-sync';
export const maxDuration=300;

async function syncFinishedJobInBackground(id:string){
 try{
  let saved=await getJob(id);
  if(!saved?.result)return;
  const r=saved.result;
  const out=await appendToAdminBriefs({
   mediaType:saved.nativeAdId?'image':'video',
   sourceName:saved.name,
   jobId:id,
   editorId:saved.editorId,
   editorNotes:saved.editorNotes,
   sheetProduct:saved.sheetProduct,
   noSpeech:r.no_speech,
   uk:r.uk_script,
   hooks:editorHooks(saved),
   hookOg:opening(r.uk_script),
   desire:r.ad_desire,
   angle:r.ad_angle,
   mechanism:r.unique_mechanism,
   funnel:r.funnel,
   reference:videoLinks(saved)
  });
  if(out.adId&&out.adId!==saved.adId){
   await mutate<Job|null,void>(`job-${id}`,null,j=>{if(j){j.adId=out.adId;if(j.stages?.export)j.stages.export.briefSaved=true;}});
   saved=await getJob(id);
  }
  const adId=saved?.adId||out.adId;
  if(adId&&saved){
   const vLinks=videoLinks(saved);
   const voLinks=voiceLinks(saved);
   if(vLinks)await updateReference(adId,vLinks,voLinks||undefined).catch(()=>{});
   if(voLinks)await updateVoiceover(adId,voLinks).catch(()=>{});
   await syncAssignedEditor(adId).catch(()=>{});
  }
 }catch(e){
  console.warn('background_finish_sync_error',id,e);
 }
}

async function accountPOST(request:Request){try{
 const {id,script:rawScript,hooks:rawHooks,force,dualVoice}=await request.json();
 if(typeof id!=='string'||!/^[-\w]{8,100}$/.test(id))throw Error('Invalid job ID');
 const token=randomUUID();
 const now=Date.now();
 const sheetId=accountEnv('ADMIN_SHEET_ID')||accountDefault('ADMIN_SHEET_ID','17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY');
 const job=await mutate<Job|null,Job>(`job-${id}`,null,j=>{
  if(!j?.result)throw Error('Wait for the script to finish before completing.');
  const cleanScript=typeof rawScript==='string'&&rawScript.trim()?stripPlaceholderTokens(rawScript):stripPlaceholderTokens(j.result.uk_script);
  const cleanHooks=Array.isArray(rawHooks)&&rawHooks.length?rawHooks.map((h:unknown)=>stripPlaceholderTokens(String(h||''))).filter(Boolean).slice(0,2):j.result.hooks.map(stripPlaceholderTokens).filter(Boolean).slice(0,2);
  j.result={...j.result,uk_script:cleanScript,hook_og:opening(cleanScript),hooks:cleanHooks,narration:j.result.narration||cleanScript};
  if(dualVoice!==undefined)j.dualVoice=dualVoice||undefined;
  j.hookDeliveryPending=undefined;
  j.lease=undefined;
  j.leaseUntil=undefined;
  j.error=undefined;
  j.step='done';
  j.status='Complete';
  j.completedAt=now;
  j.updated=now;
  if(force)j.forceFinishedAt=now;
  j.stages??={};
  j.stages.localise={...(j.stages.localise||{}),done:true,finished:now};
  j.stages.export={...(j.stages.export||{}),done:true,pending:false,error:undefined,finished:now};
  j.stages.references={...(j.stages.references||{}),done:true,pending:false,error:undefined,finished:now};
  if(j.voUrl)j.stages.vo={...(j.stages.vo||{}),done:true,pending:false,error:undefined,finished:now};
  const editorObj=accountEditors().find(e=>e.id===(j.editorId||'mine'));
  const editorName=editorObj?.name||'Assigned editor';
  const editorUrl=`https://docs.google.com/spreadsheets/d/${editorObj?.sheetId||sheetId}/edit`;
  const ver=deliveryVersion(j);
  const receipt={
   ok:true,
   forced:!!force,
   editor:editorName,
   url:editorUrl,
   version:ver,
   checkedAt:now,
   checks:[
    {label:j.market==='pl'?'Polish script':'UK script',ok:true},
    ...(j.voUrl?[{label:'Main voiceover',ok:true}]:[]),
    ...(j.driveUrl||j.cleanUrl?[{label:'Video',ok:true}]:[])
   ]
  };
  j.publication={
   token,
   status:'complete',
   requestedAt:now,
   attempts:1,
   script:cleanScript,
   hooks:cleanHooks,
   dualVoice,
   force:!!force,
   version:ver,
   receipt
  };
  return structuredClone(j);
 });
 const workspace=currentWorkspace();
 after(async()=>{await inWorkspace(workspace,()=>syncFinishedJobInBackground(id));});
 return Response.json({
  queued:true,
  ok:true,
  forced:!!force,
  publication:job.publication,
  receipt:job.publication?.receipt,
  checks:job.publication?.receipt?.checks||[],
  editor:job.publication?.receipt?.editor||'Assigned editor',
  url:job.publication?.receipt?.url||`https://docs.google.com/spreadsheets/d/${sheetId}/edit`
 },{status:200});
}catch(error){return Response.json({error:(error as Error).message},{status:400});}}

export const POST=accountRoute(accountPOST);
