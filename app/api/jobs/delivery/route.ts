import {getJob} from '@/lib/jobs';
import {verifyEditorDelivery} from '@/lib/editor-sync';
export const maxDuration=300;
export async function GET(request:Request){try{const job=await getJob(new URL(request.url).searchParams.get('id')||'');if(!job?.adId)return Response.json({error:'Brief not saved yet'},{status:404});return Response.json(await verifyEditorDelivery(job,false),{headers:{'Cache-Control':'no-store'}});}catch(error){return Response.json({error:(error as Error).message},{status:400});}}
