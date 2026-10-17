import {accountRoute} from '@/lib/account-route';
import {compareSavedPace} from '@/lib/pace-comparison';
export const maxDuration=300;
async function accountPOST(req:Request){
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'Use this action from Szekspir.'},{status:403});
 try{const b=await req.json();return Response.json(await compareSavedPace(b.id));}catch(e){return Response.json({error:(e as Error).message},{status:400});}
}

export const POST=accountRoute(accountPOST);
