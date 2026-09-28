import {authorised} from '@/lib/auth';
import {qualitySummary,scanVideoQuality} from '@/lib/editor-quality';
export const maxDuration=300;
export const runtime='nodejs';
export async function GET(request:Request){
 const header=request.headers.get('authorization');
 const cron=authorised(header,true);
 if(!cron&&!authorised(header))return new Response('Unauthorised',{status:401});
 try{return Response.json(cron?await scanVideoQuality():await qualitySummary(),{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Video quality checks are temporarily unavailable. Please retry.'},{status:503});}
}
export async function POST(request:Request){
 if(!authorised(request.headers.get('authorization')))return new Response('Unauthorised',{status:401});
 try{return Response.json(await scanVideoQuality(),{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Video quality checks could not finish. Please retry.'},{status:503});}
}
