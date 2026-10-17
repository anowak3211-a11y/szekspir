import {accountRoute} from '@/lib/account-route';
import {saveHookText,HookTextSaveError} from '@/lib/hook-text';
export const maxDuration=300;
async function accountPOST(request:Request){
 try{return Response.json({job:await saveHookText(await request.json())});}
 catch(error){return error instanceof HookTextSaveError?Response.json({error:error.message,job:error.job},{status:error.status}):Response.json({error:(error as Error).message},{status:400});}
}

export const POST=accountRoute(accountPOST);
