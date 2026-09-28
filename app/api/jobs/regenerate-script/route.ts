import {getJob} from '@/lib/jobs';
import {localize} from '@/lib/localize';
export const maxDuration=300;
// Preview only: never modify the job, its recordings, queue or editor sheet.
export async function POST(request:Request){
 try{
  const {id}=await request.json();if(typeof id!=='string')throw Error('Job ID required');
  const job=await getJob(id);if(!job?.result)throw Error('Wait for the original script to finish.');
  const transcript=job.transcript||job.result.us_script;if(!transcript?.trim())throw Error('No saved transcript found.');
  const result=await localize(transcript,job.provider,job.model,job.productContext,false,job.singingAd,(job.productName||"MELLOW").toUpperCase(),job.ctaMode,job.generateHooks!==false,job.market);
  return Response.json({script:result.uk_script,promptVersion:result.prompt_version});
 }catch(error){return Response.json({error:(error as Error).message},{status:400});}
}
