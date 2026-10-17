import {accountRoute} from '@/lib/account-route';
import {addEditorComment} from '@/lib/editor-comment';
export const maxDuration=300;
async function accountPOST(request:Request){try{const {id,comment}=await request.json();return Response.json(await addEditorComment(id,comment));}catch(e){return Response.json({error:(e as Error).message},{status:400});}}

export const POST=accountRoute(accountPOST);
