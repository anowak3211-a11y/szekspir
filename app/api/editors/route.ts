import {EDITOR_WORKSPACES} from '@/lib/editor-workspaces';
import {getJob} from '@/lib/jobs';
import {assignEditor,editorAssignment} from '@/lib/editor-sync';
export const maxDuration=300;
export async function GET(req:Request){try{const id=new URL(req.url).searchParams.get('job');const job=id?await getJob(id):null;const current=job?.adId?(await editorAssignment(job.adId)).current:job?.editorId||'mine';return Response.json({editors:EDITOR_WORKSPACES,current,ready:!!job?.adId},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
export async function POST(req:Request){try{const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return new Response('Invalid origin',{status:403});const b=await req.json();const job=await getJob(String(b.job||''));if(!job?.adId)throw Error('Wait until the ad has been saved to the master sheet');if(typeof b.editorId!=='string')throw Error('Choose an editor');return Response.json(await assignEditor(job.adId,b.editorId));}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
