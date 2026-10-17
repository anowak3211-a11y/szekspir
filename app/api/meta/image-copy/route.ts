import {accountRoute} from '@/lib/account-route';
import {generateImageCopy} from '@/lib/meta-image-copy';
import {uploaderBody,uploaderFailure} from '@/lib/meta-upload-http';
export const maxDuration=180;
async function accountPOST(request:Request){try{return Response.json(await generateImageCopy(await uploaderBody(request)),{headers:{'Cache-Control':'no-store'}});}catch(error){return uploaderFailure(error);}}

export const POST=accountRoute(accountPOST);
