import {accountRoute} from '@/lib/account-route';
import {metaBudgetStatus} from '@/lib/meta-rate-limit';
import {requireUploaderAuth,uploaderFailure} from '@/lib/meta-upload-http';
async function accountGET(request:Request){try{requireUploaderAuth(request);return Response.json(await metaBudgetStatus(),{headers:{'Cache-Control':'no-store'}});}catch(e){return uploaderFailure(e);}}

export const GET=accountRoute(accountGET);
