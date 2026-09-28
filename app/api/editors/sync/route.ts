import {authorised} from '@/lib/auth';
import {syncEditorWorkspace} from '@/lib/editor-sync';
export const maxDuration=300;
export async function GET(request:Request){
 if(!authorised(request.headers.get('authorization'),true))return new Response('Unauthorised',{status:401});
 return Response.json({results:await syncEditorWorkspace()});
}
