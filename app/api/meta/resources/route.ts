import {metaAccounts,metaResources} from '@/lib/meta-client';
import {requireUploaderAuth,uploaderError} from '@/lib/meta-upload-http';
export const maxDuration=60;
export async function GET(request:Request){try{requireUploaderAuth(request);const p=new URL(request.url).searchParams,kind=p.get('kind')||'accounts';return Response.json({items:kind==='accounts'?await metaAccounts():await metaResources(kind,p.get('account')||'',p.get('campaign')||'')},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:uploaderError(e)},{status:400});}}
