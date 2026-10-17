import {accountRoute} from '@/lib/account-route';
import {continueDuplicateJob,scheduleJob} from '@/lib/jobs';
export const maxDuration=60;
async function accountPOST(request:Request){
 try{
  const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return new Response('Invalid origin',{status:403});
  const body=await request.json();if(typeof body.id!=='string'||body.continue!==true)throw Error('Explicit duplicate confirmation required.');
  const job=await continueDuplicateJob(body.id,true);await scheduleJob(job.id);return Response.json({job});
 }catch(error){return Response.json({error:(error as Error).message},{status:400});}
}

export const POST=accountRoute(accountPOST);
