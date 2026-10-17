import {accountRoute} from '@/lib/account-route';
import {authorised} from '@/lib/auth';
import {qualitySummary,scanVideoQuality} from '@/lib/editor-quality';
export const maxDuration=300;
export const runtime='nodejs';
async function accountGET(request:Request){
 const header=request.headers.get('authorization');
 const cron=authorised(header,true);
 if(!cron&&!authorised(header))return new Response('Unauthorised',{status:401});
 try{return Response.json(cron?await scanVideoQuality():await qualitySummary(),{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Video quality checks are temporarily unavailable. Please retry.'},{status:503});}
}
async function accountPOST(request:Request){
 if(!authorised(request.headers.get('authorization')))return new Response('Unauthorised',{status:401});
 try{return Response.json(await scanVideoQuality(),{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Video quality checks could not finish. Please retry.'},{status:503});}
}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
