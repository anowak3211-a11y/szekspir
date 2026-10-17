import {accountEnv,accountDefault} from '@/lib/account-context';
import {accountRoute} from '@/lib/account-route';
import {requestPublication} from '@/lib/publish-job';
export const maxDuration=60;
async function accountPOST(request:Request){try{
 const {id,script,hooks,force,dualVoice}=await request.json();
 if(typeof id!=='string'||!/^[-\w]{8,100}$/.test(id))throw Error('Invalid job ID');
 const result=await requestPublication(id,script,hooks,force===true,dualVoice);
 // Cached tabs still render the former synchronous checklist contract.
 return Response.json({...result,ok:false,forced:false,checks:[{label:'Delivery queued',ok:false,detail:'Publication continues in the background.'}],editor:'Publication queued',url:'https://docs.google.com/spreadsheets/d/'+(accountEnv('ADMIN_SHEET_ID')||accountDefault('ADMIN_SHEET_ID','17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY'))},{status:202});
}catch(error){return Response.json({error:(error as Error).message},{status:400});}}

export const POST=accountRoute(accountPOST);
