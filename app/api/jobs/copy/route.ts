import {after} from 'next/server';
import {google} from 'googleapis';
import {accountRoute} from '@/lib/account-route';
import {accountEditors} from '@/lib/account-editors';
import {accountEnv,accountDefault} from '@/lib/account-context';
import {saveCopy,CopySaveError,type CopyInput} from '@/lib/save-copy';
import {getProducts} from '@/lib/products';
import {sheetProductForReference} from '@/lib/product-reference';
import {getJob,type Job} from '@/lib/jobs';
import {mutate} from '@/lib/store';
import {editorAssignment} from '@/lib/editor-sync';
import {sheetAuth,shiftAdminRange} from '@/lib/sheets';
import {opening} from '@/lib/validation';
import {sendsHook} from '@/lib/hook-delivery';
import {canonicalUkMedicationName} from '@/lib/uk-medication';
import {canonicalMellowSaffronName,isMellowSaffronTarget} from '@/lib/mellow-saffron-brand';
import type {Snapshot} from '@/lib/editor-sync-plan';
export const maxDuration=300;

async function syncFieldsToSheetsInBackground(adId:string|undefined,fields:Record<string,string>){
 if(!adId||!Object.keys(fields).length)return;
 try{
  const assignment=await editorAssignment(adId);
  const workspace=accountEditors().find(x=>x.id===assignment.current);
  const api=google.sheets({version:'v4',auth:sheetAuth()});
  const targets=[
   {id:accountEnv('ADMIN_SHEET_ID')||accountDefault('ADMIN_SHEET_ID','17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY'),title:'Daily Briefs',range:'A1:AE502'},
   ...(workspace?[{id:workspace.sheetId,title:'My Tasks',range:'A1:S501'}]:[])
  ];
  for(const target of targets){
   try{
    const rows=(await api.spreadsheets.values.get({spreadsheetId:target.id,range:`'${target.title}'!${target.range}`,valueRenderOption:'UNFORMATTED_VALUE'})).data.values||[];
    const headers=rows[0]||[],idCol=headers.indexOf('Ad ID');
    const match=rows.map((row,index)=>({row,index})).find(x=>x.index>0&&x.row[idCol]===adId);
    if(idCol<0||!match)continue;
    for(const [field,text] of Object.entries(fields)){
     const col=headers.indexOf(field);
     if(col<0)continue;
     const range=`'${target.title}'!${shiftAdminRange('A',col)}${match.index+1}`;
     await api.spreadsheets.values.update({spreadsheetId:target.id,range,valueInputOption:'RAW',requestBody:{values:[[text]]}}).catch(()=>{});
    }
   }catch{}
  }
  if(workspace){
   await mutate<{snapshot:Snapshot},void>('editor-sync-v3-'+workspace.sheetId,{snapshot:{}},state=>{
    const row=state.snapshot[adId]??={};
    for(const [field,text] of Object.entries(fields)){row[field]=text;delete row['manual:'+field];}
   }).catch(()=>{});
  }
 }catch{}
}

async function accountPOST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Foreign origin is not allowed.'},{status:403});
 try{
  const body=await request.json() as CopyInput&{fastSwitch?:boolean;fastCopy?:boolean};
  if(body.fastSwitch&&body.id&&body.productName){
   const products=await getProducts();
   const needle=body.productName.trim().toLowerCase();
   const product=products.find(p=>p.name===body.productName||p.name.toLowerCase()===needle||(sheetProductForReference(p)||'').toLowerCase()===needle);
   if(!product)throw Error('Product not found. Refresh the page and try again.');
   const sheetProduct=sheetProductForReference(product)||product.name;
   const version=(product as {version?:string}).version||'';
   const job=await mutate<(Job&{copyTextDelivery?:unknown})|null,Job>('job-'+body.id,null,j=>{
    if(!j?.result)throw Error('Job not found.');
    const changed=product.name!==j.productName||product.markdown!==j.productContext||sheetProduct!==j.sheetProduct;
    j.productName=product.name;
    j.productContext=product.markdown;
    j.productVersion=version;
    j.sheetProduct=sheetProduct;
    if(changed){
     j.voNeedsRegeneration=!!j.voUrl||!!j.voOriginalUrl;
     const hookCount=j.result.hooks?.length||0;
     for(let i=0;i<hookCount;i++)if(j.hookVoUrls?.[i]||j.hookVoOriginalUrls?.[i])j.hookVoNeedsRegeneration={...j.hookVoNeedsRegeneration,[i]:true};
     j.revision=(j.revision||0)+1;
     j.voApprovedRevision=undefined;
    }
    delete j.copyTextDelivery;
    j.hookDeliveryPending=undefined;
    j.updated=Date.now();
    return structuredClone(j);
   });
   const editorName=accountEditors().find(e=>e.id===(job.editorId||'mine'))?.name||'assigned editor';
   after(async()=>{await syncFieldsToSheetsInBackground(job.adId,{Product:sheetProduct});});
   return Response.json({job,editor:editorName,url:''});
  }
  if(body.fastCopy&&body.id&&typeof body.script==='string'&&body.script.trim()){
   const before=await getJob(body.id);
   if(!before?.result)throw Error('Job not found.');
   let script=body.script;
   let hooks=Array.isArray(body.hooks)?body.hooks:before.result.hooks;
   if(before.result.hooks.length===3&&hooks.length===2)hooks=[...hooks,before.result.hooks[2]];
   if(before.market!=='pl'){
    const normalise=(text:string)=>canonicalUkMedicationName(isMellowSaffronTarget(before.productName,before.productContext,before.sheetProduct)?canonicalMellowSaffronName(text):text);
    script=normalise(script);
    hooks=hooks.map(normalise);
   }
   const fields:Record<string,string>={};
   if(script!==before.result.uk_script){fields['Adapted script']=script;fields['HOOK OG']=opening(script);}
   for(let i=0;i<hooks.length;i++)if(hooks[i]!==before.result.hooks[i])fields[`Hook ${i+1}`]=sendsHook(before,i)?hooks[i]:'';
   const job=await mutate<(Job&{copyTextDelivery?:unknown})|null,Job>('job-'+body.id,null,j=>{
    if(!j?.result)throw Error('Job not found.');
    const changed=script!==j.result.uk_script,hooksChanged=JSON.stringify(hooks)!==JSON.stringify(j.result.hooks);
    if(changed){
     j.history=[...(j.history||[]),{at:Date.now(),script:j.result.uk_script,promptVersion:j.result.prompt_version}].slice(-30);
     j.result.uk_script=script;
     j.result.hook_og=opening(script);
     j.result.narration='';
     j.voNeedsRegeneration=!!j.voUrl||!!j.voOriginalUrl;
    }
    for(let i=0;i<hooks.length;i++)if(hooks[i]!==j.result.hooks[i]&&(j.hookVoUrls?.[i]||j.hookVoOriginalUrls?.[i]))j.hookVoNeedsRegeneration={...j.hookVoNeedsRegeneration,[i]:true};
    j.result.hooks=hooks;
    if(changed||hooksChanged){j.revision=(j.revision||0)+1;j.voApprovedRevision=undefined;}
    delete j.copyTextDelivery;
    j.hookDeliveryPending=undefined;
    j.updated=Date.now();
    return structuredClone(j);
   });
   const editorName=accountEditors().find(e=>e.id===(job.editorId||'mine'))?.name||'assigned editor';
   after(async()=>{await syncFieldsToSheetsInBackground(job.adId,fields);});
   return Response.json({job,editor:editorName,url:''});
  }
  return Response.json(await saveCopy(body));
 }catch(error){return error instanceof CopySaveError?Response.json({error:error.message,job:error.job},{status:error.status}):Response.json({error:(error as Error).message},{status:400});}
}

export const POST=accountRoute(accountPOST);
