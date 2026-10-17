import {accountRoute} from '@/lib/account-route';
import {saveHookDelivery} from '@/lib/save-hook-delivery';
export const maxDuration=300;
async function accountPOST(request:Request){
 try{const {id,index,enabled}=await request.json();return Response.json({job:await saveHookDelivery(id,index,enabled)});}
 catch(error){return Response.json({error:(error as Error).message},{status:400});}
}

export const POST=accountRoute(accountPOST);
