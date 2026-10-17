import {accountRoute} from '@/lib/account-route';
import {finalise} from '@/lib/jobs';
export const maxDuration=300;
async function accountPOST(req:Request){try{const {url,name}=await req.json();if(!/^[\w-]{8,100}$/.test(name))throw new Error('Valid job name required');return Response.json({url:await finalise(url,name)});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}

export const POST=accountRoute(accountPOST);
