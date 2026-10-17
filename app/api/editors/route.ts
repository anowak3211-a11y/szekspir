import {accountEditors} from '@/lib/account-editors';
import {accountRoute} from '@/lib/account-route';
import {EDITOR_WORKSPACES,activeEditorId} from '@/lib/editor-workspaces';
import {getJob} from '@/lib/jobs';
import {assignEditor,editorAssignment} from '@/lib/editor-sync';
export const maxDuration=300;
async function accountGET(req:Request){try{const id=new URL(req.url).searchParams.get('job');const job=id?await getJob(id):null;const current=job?.adId?(await editorAssignment(job.adId)).current:job?.editorId||'mine';return Response.json({editors:accountEditors(),current:activeEditorId(current),ready:!!job?.adId},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
async function accountPOST(req:Request){try{const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return new Response('Invalid origin',{status:403});const b=await req.json();const job=await getJob(String(b.job||''));if(!job?.adId)throw Error('Wait until the ad has been saved to the master sheet');if(typeof b.editorId!=='string')throw Error('Choose an editor');return Response.json(await assignEditor(job.adId,b.editorId));}catch(e){return Response.json({error:(e as Error).message},{status:400});}}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
