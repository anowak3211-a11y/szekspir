import {editJob} from '@/lib/jobs';
import {after} from 'next/server';
import {advance,workQueue} from '@/lib/jobs';
export const maxDuration=300;
export async function POST(req:Request){try{const b=await req.json();if(!b.jobId)throw new Error('jobId required; use the saved job to prevent duplicate ads');const job=await editJob(b.jobId,b.uk,b.hooks);after(workQueue);return Response.json({ok:true,adId:job.adId});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
