import {accountRoute} from '@/lib/account-route';
import {regenerateHook} from '@/lib/hook-regeneration';
export const maxDuration=300;
async function accountPOST(request:Request){
 try{return Response.json({hook:await regenerateHook(await request.json())});}
 catch(error){return Response.json({error:(error as Error).message},{status:400});}
}

export const POST=accountRoute(accountPOST);
