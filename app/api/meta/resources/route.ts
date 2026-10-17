import {accountRoute} from '@/lib/account-route';
import {metaAccounts,metaResourceSnapshot} from '@/lib/meta-client';
import {requireUploaderAuth,uploaderFailure} from '@/lib/meta-upload-http';
export const maxDuration=60;
async function accountGET(request:Request){try{requireUploaderAuth(request);const p=new URL(request.url).searchParams,kind=p.get('kind')||'accounts';const result=kind==='accounts'?{value:await metaAccounts(),stale:false}:await metaResourceSnapshot(kind,p.get('account')||'',p.get('campaign')||'');return Response.json({items:result.value,stale:!!result.stale},{headers:{'Cache-Control':'no-store'}});}catch(e){return uploaderFailure(e);}}

export const GET=accountRoute(accountGET);
