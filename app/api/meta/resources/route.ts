import {accountRoute} from '@/lib/account-route';
import {metaAccounts,metaResources} from '@/lib/meta-client';
import {requireUploaderAuth,uploaderFailure} from '@/lib/meta-upload-http';
export const maxDuration=60;
async function accountGET(request:Request){try{requireUploaderAuth(request);const p=new URL(request.url).searchParams,kind=p.get('kind')||'accounts';return Response.json({items:kind==='accounts'?await metaAccounts():await metaResources(kind,p.get('account')||'',p.get('campaign')||'')},{headers:{'Cache-Control':'no-store'}});}catch(e){return uploaderFailure(e);}}

export const GET=accountRoute(accountGET);
