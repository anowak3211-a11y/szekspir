import {accountRoute} from '@/lib/account-route';
import {uploaderBody,uploaderFailure} from '@/lib/meta-upload-http';
import {planPageReplacement,replaceUploadPages} from '@/lib/meta-uploader';
export const maxDuration=300;
export const POST=accountRoute(async(request:Request)=>{try{const b=await uploaderBody(request);if(b.action==='preview'){const plan=await planPageReplacement(b.sourceBatchId,b.assignments);return Response.json({rows:plan.map(p=>({name:p.ad.name,itemId:p.original.id,adId:p.original.metaAdId,adSetId:p.ad.adSetId,fromPage:p.original.ad.pageId,toPage:p.ad.pageId}))});}if(b.action==='apply')return Response.json(await replaceUploadPages(b.sourceBatchId,b.id,b.name,b.assignments));throw Error('Unknown Page correction action.');}catch(e){return uploaderFailure(e);}});
