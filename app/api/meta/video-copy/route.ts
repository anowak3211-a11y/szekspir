import {accountRoute} from '@/lib/account-route';
import {generateVideoCopy} from '@/lib/meta-video-copy';
import {uploaderBody,uploaderFailure} from '@/lib/meta-upload-http';
export const maxDuration=300;
async function accountPOST(request:Request){try{return Response.json(await generateVideoCopy(await uploaderBody(request)),{headers:{'Cache-Control':'no-store'}});}catch(error){return uploaderFailure(error);}}
export const POST=accountRoute(accountPOST);
