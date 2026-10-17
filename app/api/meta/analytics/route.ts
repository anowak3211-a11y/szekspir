import {accountRoute} from '@/lib/account-route';
import {readAnalytics} from '@/lib/meta-uploader-analytics';
import {requireUploaderAuth,uploaderFailure} from '@/lib/meta-upload-http';
export const maxDuration=120;
async function accountGET(request:Request){try{requireUploaderAuth(request);const p=new URL(request.url).searchParams;return Response.json(await readAnalytics(p.get('account'),p.get('days')||7),{headers:{'Cache-Control':'no-store'}});}catch(e){return uploaderFailure(e);}}

export const GET=accountRoute(accountGET);
