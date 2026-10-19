import {accountRoute} from '@/lib/account-route';
import {uploaderBody,uploaderFailure} from '@/lib/meta-upload-http';
import {createUploaderAdSet,updateUploaderAdsStatus,replaceAdsPageInBatch,createAntkiCostCapCampaign,readAntkiCostCapCampaign} from '@/lib/meta-adsets';
export const maxDuration=300;
async function accountPOST(request:Request){try{const b=await uploaderBody(request);if(b.action==='set-ads-status')return Response.json(await updateUploaderAdsStatus(b),{headers:{'Cache-Control':'no-store'}});if(b.action==='replace-batch-page')return Response.json(await replaceAdsPageInBatch(b),{headers:{'Cache-Control':'no-store'}});if(b.action==='create-antki-campaign')return Response.json({structure:await createAntkiCostCapCampaign(b)},{headers:{'Cache-Control':'no-store'}});if(b.action==='read-antki-campaign')return Response.json({structure:await readAntkiCostCapCampaign()},{headers:{'Cache-Control':'no-store'}});return Response.json({adSet:await createUploaderAdSet(b)},{headers:{'Cache-Control':'no-store'}});}catch(e){return uploaderFailure(e);}}
export const POST=accountRoute(accountPOST);



