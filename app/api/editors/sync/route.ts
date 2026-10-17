import {accountRoute} from '@/lib/account-route';
import {authorised} from '@/lib/auth';
import {syncEditorWorkspace} from '@/lib/editor-sync';
export const maxDuration=300;
async function accountGET(request:Request){
 if(!authorised(request.headers.get('authorization'),true))return new Response('Unauthorised',{status:401});
 return Response.json({results:await syncEditorWorkspace()});
}

export const GET=accountRoute(accountGET);
