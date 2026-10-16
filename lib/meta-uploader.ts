import {randomUUID,createHash} from 'node:crypto';
import {send} from '@vercel/queue';
import {mutate,readState} from './store';
import {graph,graphList,assertUploadTarget,MetaError,cachedMetaResource} from './meta-client';
import {MetaBudgetWait} from './meta-rate-limit';
import {parseUploadAd,creativePayload,verifyCreative,type UploadBatch,type UploadItem} from './meta-uploader-model';
import {itemKey,fingerprint} from './meta-uploader-identity';
import {startRemoteVideo,uploadImage,transferOriginalChunk,finishOriginalVideo} from './meta-upload-media';
import {uploaderError} from './meta-upload-http';

const key=(id:string)=>{if(!/^[a-f0-9]{64}$/.test(id))throw Error('Invalid uploader item.');return 'meta-upload-item-'+id;};
function batchKey(id:string){if(!/^[a-f0-9-]{36}$/.test(id))throw Error('Invalid batch ID.');return 'meta-upload-batch-'+id;}
export async function saveUploadBatch(id:string,name:string,raw:unknown[]){
 batchKey(id);if(typeof name!=='string'||!name.trim()||name.length>160||!Array.isArray(raw)||!raw.length||raw.length>300)throw Error('Save 1–300 adverts with a batch name.');
 const ads=raw.map((value,index)=>{try{return parseUploadAd(value);}catch(e){const name=(value as {name?:unknown})?.name;throw Error(`${typeof name==='string'?name.slice(0,240):`Advert ${index+1}`}: ${uploaderError(e)}`);}}),ids=ads.map(itemKey);if(new Set(ids).size!==ids.length)throw Error('Each source key/hook must occur once in a batch.');
 if(new Set(ads.map(a=>JSON.stringify([a.accountId,a.adSetId,a.name]))).size!==ads.length)throw Error('Give every hook/VO a distinct ad name in its target set.');
 for(const ad of ads){const item=await readItem(itemKey(ad));if(item&&item.fingerprint!==fingerprint(ad))throw Error(`${ad.name}: this source key already has different saved settings. Use a new explicit revision key.`);}
 await mutate<{batch?:UploadBatch},void>(batchKey(id)+'-record',{},s=>{if(s.batch&&(s.batch.name!==name||JSON.stringify(s.batch.items)!==JSON.stringify(ids)))throw Error('Batch manifest changed.');s.batch||={id,name,created:Date.now(),items:ids,status:'draft'};});
 for(const ad of ads){const itemId=itemKey(ad);await mutate<{item?:UploadItem},void>(key(itemId)+'-record',{},s=>{if(s.item){if(s.item.fingerprint!==fingerprint(ad))throw Error('Source key changed.');return;}s.item={id:itemId,ad,fingerprint:fingerprint(ad),phase:'media',status:'queued',created:Date.now(),updated:Date.now(),attempts:0};});}
 await mutate<string[],void>('meta-upload-batches',[],s=>{if(!s.includes(id))s.push(id);});return readBatch(id);
}
export async function publishUploadBatch(id:string,name:string,raw:unknown[]){await saveUploadBatch(id,name,raw);return startBatch(id);}
/** Read-only support evidence, restricted to an advert already in this batch. */
export async function inspectUploadCreative(batchId:string,adId:string){
 const {items}=await readBatch(batchId),item=items.find(i=>i.metaAdId===adId);if(!item?.creativeId)throw Error('Advert is not in this batch.');
 const raw=await graph<Record<string,unknown>>(item.creativeId,{fields:'id,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,contextual_multi_ads,url_tags'});
 const feed=raw.asset_feed_spec as Record<string,unknown>|undefined,story=raw.object_story_spec as Record<string,unknown>|undefined,data=story?.[item.imageHash?'link_data':'video_data'] as Record<string,unknown>|undefined;
 const features=(raw.degrees_of_freedom_spec as {creative_features_spec?:Record<string,{enroll_status?:string}>})?.creative_features_spec;
 return {adId,expected:{url:item.ad.url,cta:item.ad.cta},feedCtas:feed?.call_to_action_types??null,feedUrls:feed?.link_urls??null,storyLink:data?.link??null,storyCta:data?.call_to_action??null,enabledFeatures:Object.entries(features||{}).filter(([,v])=>v?.enroll_status==='OPT_IN').map(([k])=>k),errors:verifyCreative(item,raw)};
}
// Envelope records support atomic replacement with the project's existing CAS.
export async function readItem(id:string){return (await readState<{item?:UploadItem}>(key(id)+'-record',{})).value.item||null;}
async function readBatchRecord(id:string){const batch=(await readState<{batch?:UploadBatch}>(batchKey(id)+'-record',{})).value.batch;if(!batch)throw Error('Batch not found.');return batch;}
export async function readBatch(id:string){const batch=await readBatchRecord(id),items=await Promise.all(batch.items.map(readItem));if(items.some(i=>!i))throw Error('Batch saving was interrupted. Retry the same save.');return {batch,items:items as UploadItem[]};}
export async function listBatches(){const ids=(await readState<string[]>('meta-upload-batches',[])).value;return Promise.all(ids.slice(-50).reverse().map(async id=>{const {batch,items}=await readBatch(id);return {...batch,total:items.length,complete:items.filter(i=>i.status==='complete').length,attention:items.filter(i=>i.status==='attention').length,accounts:Array.from(new Set(items.map(i=>i.ad.accountId))),mediaTypes:Array.from(new Set(items.map(i=>i.ad.media.kind==='library'?'video':i.ad.media.kind))),completedAt:Math.max(0,...items.map(i=>i.verifiedAt||0))};}));}
async function patchItem(id:string,change:Partial<UploadItem>,lease?:string){return mutate<{item?:UploadItem},UploadItem>(key(id)+'-record',{},s=>{if(!s.item)throw Error('Item not found.');if(lease&&s.item.lease!==lease)throw Error('Uploader lease changed.');Object.assign(s.item,change,{updated:Date.now()});return s.item;});}
async function batchQueue(batchId:string){const batch=await readBatchRecord(batchId);if(batch.queue)return batch;const {items}=await readBatch(batchId);await mutate<{batch?:UploadBatch},void>(batchKey(batchId)+'-record',{},s=>{if(s.batch&&!s.batch.queue)s.batch.queue=Object.fromEntries(items.map(i=>[i.id,{status:i.status,at:Math.max(i.nextAttempt||0,i.leaseUntil||0),updated:i.updated}]));});return readBatchRecord(batchId);}
async function updateQueue(batchId:string,item:UploadItem){await mutate<{batch?:UploadBatch},void>(batchKey(batchId)+'-record',{},s=>{if(s.batch?.queue)s.batch.queue[item.id]={status:item.status,at:Math.max(item.nextAttempt||0,item.leaseUntil||0),updated:item.updated};});}
export async function readBatchProgress(batchId:string,since:number){if(!Number.isSafeInteger(since)||since<0||since>Date.now()+60000)throw Error('Invalid progress timestamp.');const batch=await batchQueue(batchId),ids=Object.entries(batch.queue!).filter(([,i])=>i.updated===undefined||i.updated>=since).map(([id])=>id);const changes=await Promise.all(ids.map(readItem));return {batch,changes:changes.filter((i):i is UploadItem=>!!i)};}
// Bounded parallel stages with durable per-item dispatch tokens. Repeated Resume
// cannot fan out the same item, and stale deliveries cannot replay a remote write.
const PARALLEL_ADS=5;
function activeDispatches(batch:UploadBatch){
 const entries={...batch.dispatches};if(batch.dispatch&&!entries[batch.dispatch.id])entries[batch.dispatch.id]=batch.dispatch;
 return Object.fromEntries(Object.entries(entries).filter(([,d])=>d.until>Date.now()));
}
function setDispatches(batch:UploadBatch,entries:NonNullable<UploadBatch['dispatches']>){batch.dispatches=entries;batch.dispatch=Object.values(entries)[0];}
async function dispatchNext(batchId:string){
 await batchQueue(batchId);
 const jobs=await mutate<{batch?:UploadBatch},{id:string;token:string;delay:number}[]>(batchKey(batchId)+'-record',{},s=>{
  const batch=s.batch;if(!batch||batch.status!=='running')return [];
  const entries=activeDispatches(batch),jobs:{id:string;token:string;delay:number}[]=[];
  const candidates=Object.entries(batch.queue||{}).filter(([id,i])=>!entries[id]&&!['complete','attention','cancelled'].includes(i.status)).sort(([,a],[,b])=>a.at-b.at);
  for(const [id,item] of candidates.slice(0,Math.max(0,PARALLEL_ADS-Object.keys(entries).length))){const token=randomUUID(),delay=Math.max(0,Math.ceil((item.at-Date.now())/1000));entries[id]={id,token,until:Date.now()+(delay+600)*1000};jobs.push({id,token,delay});}
  setDispatches(batch,entries);return jobs;
 });
 const results=await Promise.allSettled(jobs.map(async job=>{
  try{await send('szekspir-meta-upload',{id:job.id,batchId,dispatchToken:job.token},{region:'fra1',delaySeconds:job.delay,retentionSeconds:86400,idempotencyKey:`meta-dispatch-${job.token}`});}
  catch(error){await releaseDispatch(batchId,job.id,job.token);await mutate<{batch?:UploadBatch},void>(batchKey(batchId)+'-record',{},s=>{if(s.batch)s.batch.status='paused';});throw error;}
 }));
 if(results.some(r=>r.status==='rejected'))throw Error('Next step could not be queued. Resume preserves all saved Meta IDs.');
}
async function releaseDispatch(batchId:string,id:string,token?:string){await mutate<{batch?:UploadBatch},void>(batchKey(batchId)+'-record',{},s=>{if(!s.batch)return;const entries=activeDispatches(s.batch);if(entries[id]&&(!token||entries[id].token===token))delete entries[id];setDispatches(s.batch,entries);});}
export async function startBatch(id:string){const {batch,items}=await readBatch(id);if(batch.status==='finished')return readBatch(id);if(items.every(i=>['complete','attention','cancelled'].includes(i.status)))throw Error('Resolve the adverts requiring attention before resuming.');await batchQueue(id);if(batch.status!=='running'){for(const ad of Array.from(new Map(items.filter(i=>!['complete','cancelled'].includes(i.status)).map(i=>[`${i.ad.accountId}:${i.ad.adSetId}:${i.ad.pageId}`,i.ad])).values()))await assertUploadTarget(ad);await mutate<{batch?:UploadBatch},void>(batchKey(id)+'-record',{},s=>{if(!s.batch)throw Error('Batch not found.');if(s.batch.status!=='running'){setDispatches(s.batch,{});s.batch.status='running';}});}await dispatchNext(id);return readBatch(id);}
/** Resume unfinished stages only. Never replay an uncertain remote write. */
function relaunchable(item:UploadItem){return item.status==='attention'||(item.status==='waiting'&&item.error?.startsWith('Upload queue is waiting.'));}
export async function relaunchBatch(id:string){
 const {batch,items}=await readBatch(id);if(batch.status==='finished')return readBatch(id);
 for(const item of items){
  if(!relaunchable(item)||item.pending||(item.leaseUntil||0)>Date.now())continue;
  const queued=await mutate<{item?:UploadItem},UploadItem|null>(key(item.id)+'-record',{},s=>{const current=s.item;if(!current||!relaunchable(current)||current.pending||(current.leaseUntil||0)>Date.now())return null;Object.assign(current,{status:'queued',error:undefined,attempts:0,nextAttempt:undefined,lease:undefined,leaseUntil:undefined,updated:Date.now()});return {...current};});
  if(queued){await batchQueue(id);await updateQueue(id,queued);}
 }
 const current=await readBatch(id);
 if(current.items.every(i=>['complete','attention','cancelled'].includes(i.status)))return current;
 const snapshot=activeDispatches(current.batch);
 await mutate<{batch?:UploadBatch},void>(batchKey(id)+'-record',{},s=>{if(!s.batch)return;const entries=activeDispatches(s.batch);for(const item of current.items)if((item.leaseUntil||0)<=Date.now()&&entries[item.id]?.token===snapshot[item.id]?.token)delete entries[item.id];setDispatches(s.batch,entries);});
 return startBatch(id);
}
export async function pauseBatch(id:string){await mutate<{batch?:UploadBatch},void>(batchKey(id)+'-record',{},s=>{if(!s.batch)throw Error('Batch not found.');s.batch.status='paused';});return readBatch(id);}
async function markFinished(id:string){await batchQueue(id);await mutate<{batch?:UploadBatch},void>(batchKey(id)+'-record',{},s=>{if(s.batch?.queue){const items=Object.values(s.batch.queue);if(items.every(i=>['complete','cancelled','attention'].includes(i.status)))s.batch.status=items.some(i=>i.status==='attention')?'paused':'finished';}});}
async function pending(item:UploadItem,label:string){await patchItem(item.id,{pending:label},item.lease);}
async function verify(item:UploadItem){
 if(!item.metaAdId||!item.creativeId)throw Error('Missing native Meta IDs.');
 await assertUploadTarget(item.ad);
 const ad=await graph<{id:string;adset_id:string;status:string;creative:{id:string;object_story_spec?:unknown;degrees_of_freedom_spec?:unknown}&Record<string,unknown>}>(item.metaAdId,{fields:'id,adset_id,status,creative{id,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,contextual_multi_ads,url_tags}'});
 if(ad.adset_id!==item.ad.adSetId||ad.creative.id!==item.creativeId||ad.status!==(item.ad.publishStatus||'PAUSED'))throw Error(`Meta ad identity, target or ${item.ad.publishStatus?'publication':'paused'} status did not match.`);
 const creative=ad.creative.object_story_spec&&ad.creative.degrees_of_freedom_spec?ad.creative:await graph(item.creativeId,{fields:'id,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,contextual_multi_ads,url_tags'});const issues=verifyCreative(item,creative);if(issues.length)throw Error(issues.join(' '));
}
class UnconfirmedResult extends Error {}
export async function reconcileItem(id:string,batchId?:string){
 if(batchId&&!(await readBatchRecord(batchId)).items.includes(id))throw Error('Advert is not in this batch.');
 let item=await readItem(id);if(!item)throw Error('Item not found.');if(item.leaseUntil&&item.leaseUntil>Date.now())throw Error('This advert is still being processed.');
 const found=(await graphList(`${item.ad.adSetId}/ads`,'id,name,status,creative{id}')).filter(a=>a.name===item!.ad.name);
 if(found.length>1)throw Error('More than one Meta ad has this name. Resolve the ambiguity in Ads Manager.');
 if(found.length){const creative=(found[0].creative as {id?:string})?.id;if(!creative)throw Error('Existing ad has no creative.');item=await patchItem(id,{metaAdId:String(found[0].id),creativeId:creative,reused:true,phase:'verify',pending:undefined,lease:undefined,leaseUntil:undefined});await verify(item);item=await patchItem(id,{status:'complete',phase:'done',verifiedAt:Date.now(),error:undefined});if(batchId){await batchQueue(batchId);await updateQueue(batchId,item);await markFinished(batchId);await dispatchNext(batchId);}return readItem(id);}
 if(item.pending==='creative'){const matches=(await graphList(`act_${item.ad.accountId}/adcreatives`,'id,name')).filter(c=>c.name===`szekspir-upload-${item!.id}`);if(matches.length>1)throw Error('Multiple creatives found. Review in Meta first.');if(matches.length===1)return patchItem(id,{creativeId:String(matches[0].id),phase:'ad',pending:undefined,status:'queued',error:undefined,lease:undefined,leaseUntil:undefined});}
 throw new UnconfirmedResult('Meta has not confirmed this request. No replacement was created. Check Ads Manager before explicitly retrying.');
}
export async function retryItem(batchId:string,id:string,confirmUncertain=false){const {batch}=await readBatch(batchId);if(!batch.items.includes(id))throw Error('Advert is not in this batch.');let item=await readItem(id);if(!item)throw Error('Item not found.');if(item.status==='complete'){await batchQueue(batchId);await updateQueue(batchId,item);await markFinished(batchId);return item;}if(item.leaseUntil&&item.leaseUntil>Date.now())throw Error('Advert is still working.');if(item.pending&&!confirmUncertain)throw Error('Confirm the result in Meta first, or use Check result.');if(item.pending==='ad'||item.pending==='creative'){try{await reconcileItem(id,batchId);item=(await readItem(id))!;if(item.status==='complete')return item;}catch(e){if(!confirmUncertain||!(e instanceof UnconfirmedResult))throw e;}}
 item=await patchItem(id,{status:'queued',pending:undefined,error:undefined,attempts:0,lease:undefined,leaseUntil:undefined,nextAttempt:undefined});await batchQueue(batchId);await updateQueue(batchId,item);await mutate<{batch?:UploadBatch},void>(batchKey(batchId)+'-record',{},s=>{if(s.batch)s.batch.status='running';});await dispatchNext(batchId);return item;}
async function checkDuplicate(item:UploadItem,batchId:string){
 const ad=item.ad,found=(await cachedMetaResource(`batch-index:${batchId}:${ad.adSetId}`,600000,t=>graphList(`${ad.adSetId}/ads`,'id,name',{},t))).value;
 if(found.some(a=>a.name===ad.name))throw Error('An ad with this name already exists. Use Check result; no duplicate was created.');
 const nameKey='meta-ad-name-'+createHash('sha256').update(JSON.stringify([ad.accountId,ad.adSetId,ad.name])).digest('hex');
 await mutate<{owner?:string},void>(nameKey,{},s=>{if(s.owner&&s.owner!==item.id)throw Error('This ad name is reserved by another saved advert. Check its result before using a different source key.');s.owner=item.id;});
}
export async function consumeMetaUpload(id:string,batchId:string,dispatchToken?:string){
 const batch=await batchQueue(batchId);if(batch.status!=='running'||!batch.items.includes(id)||dispatchToken&&activeDispatches(batch)[id]?.token!==dispatchToken)return;
 const lease=randomUUID();const acquired=await mutate<{item?:UploadItem},UploadItem|null>(key(id)+'-record',{},s=>{const i=s.item;if(!i||['complete','attention','cancelled'].includes(i.status))return null;if((i.leaseUntil||0)>Date.now()||(i.nextAttempt||0)>Date.now())return null;if(i.pending&&i.pending!=='transfer'){i.status='attention';i.updated=Date.now();i.error='Previous request was interrupted. Check its result before retrying.';return null;}i.lease=lease;i.leaseUntil=Date.now()+9*60000;i.updated=Date.now();i.status='working';i.pending=undefined;i.nextAttempt=undefined;return {...i};});
 if(!acquired){const current=await readItem(id);if((current?.leaseUntil||0)>Date.now())return;if(current)await updateQueue(batchId,current);await releaseDispatch(batchId,id,dispatchToken);await markFinished(batchId);await dispatchNext(batchId);return;}let item=acquired,delay:number|undefined;await updateQueue(batchId,item);
 try{
  if(item.phase==='media'){
   await assertUploadTarget(item.ad);await checkDuplicate(item,batchId);
   if(item.ad.media.kind==='carousel'){const hashes=item.imageHashes||[],card=item.ad.media.cards[hashes.length];if(card){await pending(item,'image');hashes.push(await uploadImage({...item,ad:{...item.ad,media:card}}));item.imageHashes=hashes;}item.phase=hashes.length===item.ad.media.cards.length?'creative':'media';}
   else if(item.ad.media.kind==='library'){item.videoId=item.ad.media.videoId;item.phase='processing';}
   else if(item.ad.media.kind==='image'){await pending(item,'image');item.imageHash=await uploadImage(item);item.phase='creative';}
   else{await pending(item,'video');Object.assign(item,await startRemoteVideo(item));}
   item.pending=undefined;delay=0;
  }else if(item.phase==='transfer'){await pending(item,'transfer');item.transfer=await transferOriginalChunk(item);item.pending=undefined;item.phase=item.transfer.start===item.transfer.end?'finish':'transfer';delay=0;
  }else if(item.phase==='finish'){await pending(item,'finish');await finishOriginalVideo(item);item.pending=undefined;item.phase='processing';delay=10;
  }else if(item.phase==='processing'){
   if(!item.videoId)throw Error('Missing original video ID.');const media=await graph<{status?:{video_status?:string};picture?:string;thumbnails?:{data:{uri?:string}[]}}>(item.videoId,{fields:'id,status,picture,thumbnails'});const state=media.status?.video_status;
   if(state==='error'||state==='failed')throw Error('Meta could not process the original video.');
   if(state!=='ready'){if(item.attempts++>=30)throw Error('Video processing is taking too long. Retry checks the same video ID.');delay=Math.min(120,20*2**Math.min(3,item.attempts-1));}else{item.thumbnailUrl=media.thumbnails?.data[0]?.uri||media.picture;if(!item.thumbnailUrl)throw Error('Meta did not return the original thumbnail.');item.phase='creative';item.attempts=0;delay=0;}
  }else if(item.phase==='creative'){await assertUploadTarget(item.ad);await pending(item,'creative');const r=await graph<{id:string}>(`act_${item.ad.accountId}/adcreatives`,creativePayload(item),'POST');if(!/^\d+$/.test(r.id))throw Error('Meta did not confirm the creative ID.');item.creativeId=r.id;item.pending=undefined;item.phase='ad';delay=0;
  }else if(item.phase==='ad'){await assertUploadTarget(item.ad);await pending(item,'ad');const r=await graph<{id:string}>(`act_${item.ad.accountId}/ads`,{name:item.ad.name,adset_id:item.ad.adSetId,creative:{creative_id:item.creativeId},status:item.ad.publishStatus||'PAUSED'},'POST');if(!/^\d+$/.test(r.id))throw Error('Meta did not confirm the ad ID.');item.metaAdId=r.id;item.pending=undefined;item.phase='verify';delay=0;
  }else if(item.phase==='verify'){await verify(item);item.status='complete';item.phase='done';item.verifiedAt=Date.now();item.error=undefined;}
  if(item.status!=='complete')item.status=delay?'waiting':'queued';item.nextAttempt=delay?Date.now()+delay*1000:undefined;item.lease=undefined;item.leaseUntil=undefined;item.error=undefined;await patchItem(id,item,lease);
 }catch(error){const saved=(await readItem(id))!;if(error instanceof MetaBudgetWait){delay=error.retryAfterSeconds;await patchItem(id,{status:'waiting',error:error.message,pending:undefined,nextAttempt:Date.now()+delay*1000,lease:undefined,leaseUntil:undefined},lease);}else{const e=error as MetaError;const safeRetry=e instanceof MetaError&&e.transient&&!e.uncertain&&(e.rateLimited||saved.attempts<8);delay=safeRetry?Math.max(e.retryAfterSeconds||0,Math.min(1800,30*2**saved.attempts)):undefined;await patchItem(id,{status:safeRetry?'waiting':'attention',error:uploaderError(e),pending:e instanceof MetaError&&!e.uncertain?undefined:saved.pending,attempts:e.rateLimited?saved.attempts:saved.attempts+1,nextAttempt:delay?Date.now()+delay*1000:undefined,lease:undefined,leaseUntil:undefined},lease);}}
 await updateQueue(batchId,(await readItem(id))!);
 // A Resume during an in-flight stage may have replaced its delayed dispatch.
 // The stage's item lease still owns this progress; wake its next stage now.
 await releaseDispatch(batchId,id);
 await markFinished(batchId);
 await dispatchNext(batchId);
}
