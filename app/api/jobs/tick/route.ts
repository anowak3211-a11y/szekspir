import {accountRoute} from '@/lib/account-route';
import {after} from 'next/server';
import {advance,workQueue,scheduleJob} from '@/lib/jobs';
export const maxDuration=300;
async function accountPOST(req:Request){const {id}=await req.json();if(typeof id!=='string'||!/^[-\w]{8,100}$/.test(id))return new Response('Invalid ID',{status:400});await scheduleJob(id);return Response.json({queued:true});}

export const POST=accountRoute(accountPOST);
