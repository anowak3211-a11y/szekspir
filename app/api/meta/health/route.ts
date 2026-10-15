import {metaBudgetStatus} from '@/lib/meta-rate-limit';
import {requireUploaderAuth,uploaderFailure} from '@/lib/meta-upload-http';
export async function GET(request:Request){try{requireUploaderAuth(request);return Response.json(await metaBudgetStatus(),{headers:{'Cache-Control':'no-store'}});}catch(e){return uploaderFailure(e);}}
