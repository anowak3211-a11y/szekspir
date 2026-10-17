import {accountRoute} from '@/lib/account-route';
import {uploaderBody,uploaderFailure} from '@/lib/meta-upload-http';
import {createUploaderAdSet} from '@/lib/meta-adsets';
export const maxDuration=60;
async function accountPOST(request:Request){try{return Response.json({adSet:await createUploaderAdSet(await uploaderBody(request))},{headers:{'Cache-Control':'no-store'}});}catch(e){return uploaderFailure(e);}}
export const POST=accountRoute(accountPOST);
