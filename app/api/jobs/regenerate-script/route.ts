import {accountRoute} from '@/lib/account-route';
import {getJob} from '@/lib/jobs';
import {getProducts} from '@/lib/products';
import {localize} from '@/lib/localize';
export const maxDuration=300;
// Preview only: never modify the job, its recordings, queue or editor sheet.
async function accountPOST(request:Request){
 try{
  const {id,productName:overrideProduct}=await request.json();if(typeof id!=='string')throw Error('Job ID required');
  const job=await getJob(id);if(job?.abortedAt||job?.cancelledAt)throw Error('This job was stopped.');if(!job?.result)throw Error('Wait for the original script to finish.');
  const transcript=job.transcript||job.result.us_script;if(!transcript?.trim())throw Error('No saved transcript found.');
  const activeProductName=typeof overrideProduct==='string'&&overrideProduct.trim()?overrideProduct.trim():job.productName;
  let productContext=job.productContext;
  if(activeProductName&&(!productContext?.trim()||activeProductName!==job.productName)){
   const found=(await getProducts()).find(p=>p.name.toLowerCase()===activeProductName.toLowerCase());
   if(found?.markdown)productContext=found.markdown;
  }
  const targetBrand=(!activeProductName||/^mellow$/i.test(activeProductName))?"MELLOW":activeProductName;
  const result=await localize(transcript,job.provider,job.model,productContext,false,job.singingAd,targetBrand,job.ctaMode,job.generateHooks!==false,job.market,job.localizationMode);
  return Response.json({script:result.uk_script,promptVersion:result.prompt_version});
 }catch(error){return Response.json({error:(error as Error).message},{status:400});}
}

export const POST=accountRoute(accountPOST);
