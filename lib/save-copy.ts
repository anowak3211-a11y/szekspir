import {getProducts} from './products';
import {sheetProductForReference} from './product-reference';
import {randomUUID} from 'node:crypto';
import {google} from 'googleapis';
import {getJob,type Job} from './jobs';
import {mutate} from './store';
import {assertAdActive,assertJobActive} from './cancellation';
import {editorAssignment} from './editor-sync';
import {withEditorLocks} from './editor-locks';
import {EDITOR_WORKSPACES} from './editor-workspaces';
import {sheetAuth,shiftAdminRange} from './sheets';
import type {Snapshot} from './editor-sync-plan';
import {hasTokens,opening} from './validation';
import {sendsHook} from './hook-delivery';
import {canonicalUkMedicationName} from './uk-medication';
import {canonicalMellowSaffronName,isMellowSaffronTarget} from './mellow-saffron-brand';
export type CopyInput={id:string;script:string;hooks:string[];expectedScript:string;expectedHooks:string[];productName?:string;expectedProductName?:string;productOnly?:boolean};
type ProductTarget={name:string;context:string;version:string;sheetProduct:NonNullable<Job['sheetProduct']>};
type PendingCopy={token:string;input:CopyInput;target?:ProductTarget;error?:string};
type CopyJob=Job&{copyTextDelivery?:PendingCopy};
export class CopySaveError extends Error{readonly status=503;constructor(message:string,public job:Job|null){super(message);}}
function editable(job:CopyJob|null){
 if(!job?.result||!job.adId||job.cancelledAt||job.abortedAt)throw Error('Wait for an active saved brief.');
 if((job.leaseUntil||0)>Date.now()||job.hookDeliveryPending!==undefined&&job.hookDeliveryPending!==-1||'originalVoiceoverDelivery' in job&&job.originalVoiceoverDelivery||Object.values(job.hookVoPending||{}).some(Boolean)||job.generateVo&&job.step!=='done'&&!job.stages?.vo?.done&&!job.stages?.vo?.error)throw Error('Wait for the current recording or save to finish.');
}
/** Explicit copy save: only changed copy cells, without Finish or paid work. */
export async function saveCopy(input:CopyInput):Promise<{job:Job;editor:string;url:string}>{
 if(!/^[\w-]{8,100}$/.test(input.id)||typeof input.script!=='string'||!input.script.trim()||input.script.length>100000||hasTokens(input.script)||typeof input.expectedScript!=='string'||!Array.isArray(input.hooks)||![0,2,3].includes(input.hooks.length)||input.hooks.some(x=>typeof x!=='string'||!x.trim()||x.length>5000||hasTokens(x))||!Array.isArray(input.expectedHooks))throw Error('Enter complete script and hooks.');
 const before=await getJob(input.id) as CopyJob|null;editable(before);
 let target:ProductTarget|undefined;
 if(input.productName!==undefined){
  if(before!.market==='pl'||typeof input.productName!=='string'||typeof input.expectedProductName!=='string')throw Error('Choose a supported UK product.');
  if(before!.copyTextDelivery?.target&&JSON.stringify(before!.copyTextDelivery.input)===JSON.stringify(input))target=before!.copyTextDelivery.target;
  else {const product=(await getProducts()).find(p=>p.name===input.productName),sheetProduct=product&&sheetProductForReference(product);
   if(!product||!sheetProduct)throw Error('Product not found or unsupported. Refresh the product list.');
   target={name:product.name,context:product.markdown,version:(product as {version?:string}).version||'',sheetProduct};}
 }
 if(input.productOnly&&(!target||input.script!==input.expectedScript||JSON.stringify(input.hooks)!==JSON.stringify(input.expectedHooks)))throw Error('Switch product separately from unsaved copy.');
 if(before!.result!.hooks.length===3&&input.hooks.length===2)input={...input,hooks:[...input.hooks,before!.result!.hooks[2]]};
 if(input.hooks.length!==before!.result!.hooks.length)throw Error('Hook count changed. Refresh before saving.');
 if(before!.market!=='pl'&&!input.productOnly){
  const normalise=(text:string)=>canonicalUkMedicationName(isMellowSaffronTarget(before!.productName,before!.productContext,before!.sheetProduct)?canonicalMellowSaffronName(text):text);
  input={...input,script:normalise(input.script),hooks:input.hooks.map(normalise)};
 }
 const adId=before!.adId!,assignment=await editorAssignment(adId),workspace=EDITOR_WORKSPACES.find(x=>x.id===assignment.current);if(!workspace)throw Error('Assigned editor not found.');
 return withEditorLocks(['ad-'+adId,'sheet-write-'+adId,'workspace-'+workspace.id],async()=>{
  await assertJobActive(input.id);await assertAdActive(adId);
  if((await editorAssignment(adId)).current!==workspace.id)throw Error('Editor changed. Refresh and try again.');
  const token=randomUUID();
  const reserved=await mutate<CopyJob|null,CopyJob>('job-'+input.id,null,job=>{
   editable(job);
   if(target&&job!.productName!==input.expectedProductName)throw Error('Product changed in another tab. Refresh before switching.');
   if(job!.result!.uk_script!==input.expectedScript||JSON.stringify(job!.result!.hooks)!==JSON.stringify(input.expectedHooks))throw Error('Copy changed in another tab. Refresh before saving.');
   if(job!.copyTextDelivery&&JSON.stringify(job!.copyTextDelivery.input)!==JSON.stringify(input))throw Error('Retry the pending copy save first.');
   job!.hookDeliveryPending=-1;job!.copyTextDelivery={token,input,target};job!.updated=Date.now();return structuredClone(job!);
  });
  try{
   const fields:Record<string,string>={};
   if(target&&target.sheetProduct!==reserved.sheetProduct)fields['Product']=target.sheetProduct;
   if(input.script!==reserved.result!.uk_script){fields['Adapted script']=input.script;fields['HOOK OG']=opening(input.script);}
   for(let i=0;i<input.hooks.length;i++)if(input.hooks[i]!==reserved.result!.hooks[i])fields[`Hook ${i+1}`]=sendsHook(reserved,i)?input.hooks[i]:'';
   const api=google.sheets({version:'v4',auth:sheetAuth()});
   const targets=[{id:process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY',title:'Daily Briefs',range:'A1:AD502'},{id:workspace.sheetId,title:'My Tasks',range:'A1:S501'}];
   for(const target of targets){
    const rows=(await api.spreadsheets.values.get({spreadsheetId:target.id,range:`'${target.title}'!${target.range}`,valueRenderOption:'UNFORMATTED_VALUE'})).data.values||[],headers=rows[0]||[],idCol=headers.indexOf('Ad ID');
    const matches=rows.map((row,index)=>({row,index})).filter(x=>x.index>0&&x.row[idCol]===adId);
    if(idCol<0||matches.length!==1)throw Error('Ad is missing or duplicated in the sheet.');
    for(const [field,text] of Object.entries(fields)){
     const col=headers.indexOf(field);if(col<0||headers.lastIndexOf(field)!==col)throw Error('Copy column missing or duplicated.');
     await assertJobActive(input.id);await assertAdActive(adId);
     const range=`'${target.title}'!${shiftAdminRange('A',col)}${matches[0].index+1}`;
     await api.spreadsheets.values.update({spreadsheetId:target.id,range,valueInputOption:'RAW',requestBody:{values:[[text]]}});
     const read=await api.spreadsheets.values.get({spreadsheetId:target.id,range,valueRenderOption:'UNFORMATTED_VALUE'});
     if(String(read.data.values?.[0]?.[0]||'')!==text)throw Error('Copy delivery could not be confirmed.');
    }
   }
   await assertJobActive(input.id);await assertAdActive(adId);
   await mutate<{snapshot:Snapshot},void>('editor-sync-v3-'+workspace.sheetId,{snapshot:{}},state=>{const row=state.snapshot[adId]??={};for(const [field,text] of Object.entries(fields)){row[field]=text;delete row['manual:'+field];}});
   const job=await mutate<CopyJob|null,Job>('job-'+input.id,null,job=>{
    if(!job?.result||job.cancelledAt||job.abortedAt||job.copyTextDelivery?.token!==token)throw Error('This copy save was stopped or changed.');
    const productChanged=!!target&&(target.name!==job.productName||target.context!==job.productContext||target.sheetProduct!==job.sheetProduct);
    if(target){job.productName=target.name;job.productContext=target.context;job.productVersion=target.version;job.sheetProduct=target.sheetProduct;}
    if(productChanged){job.voNeedsRegeneration=!!job.voUrl||!!job.voOriginalUrl;for(let i=0;i<input.hooks.length;i++)if(job.hookVoUrls?.[i]||job.hookVoOriginalUrls?.[i])job.hookVoNeedsRegeneration={...job.hookVoNeedsRegeneration,[i]:true};}
    const changed=input.script!==job.result.uk_script,hooksChanged=JSON.stringify(input.hooks)!==JSON.stringify(job.result.hooks);
    if(changed){job.history=[...(job.history||[]),{at:Date.now(),script:job.result.uk_script,promptVersion:job.result.prompt_version}].slice(-30);job.result.uk_script=input.script;job.result.hook_og=opening(input.script);job.result.narration='';job.voNeedsRegeneration=!!job.voUrl||!!job.voOriginalUrl;}
    for(let i=0;i<input.hooks.length;i++)if(input.hooks[i]!==job.result.hooks[i]&&(job.hookVoUrls?.[i]||job.hookVoOriginalUrls?.[i]))job.hookVoNeedsRegeneration={...job.hookVoNeedsRegeneration,[i]:true};
    job.result.hooks=input.hooks;
    if(changed||hooksChanged||productChanged){job.revision=(job.revision||0)+1;job.voApprovedRevision=undefined;}
    delete job.copyTextDelivery;job.hookDeliveryPending=undefined;job.updated=Date.now();return structuredClone(job);
   });
   return {job,editor:workspace.name,url:`https://docs.google.com/spreadsheets/d/${workspace.sheetId}/edit`};
  }catch(error){
   const message='Copy delivery was not confirmed. Retry this same save. '+(error instanceof Error?error.message:'Please try again.');
   const job=await mutate<CopyJob|null,Job|null>('job-'+input.id,null,job=>{if(job?.copyTextDelivery?.token===token)job.copyTextDelivery.error=message;return job?structuredClone(job):null;});
   throw new CopySaveError(message,job);
  }
 });
}
