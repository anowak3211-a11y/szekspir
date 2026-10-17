import {accountRoute} from '@/lib/account-route';
import {connectionStatus,saveMetaToken,saveMetaApp,metaAccounts} from '@/lib/meta-client';
import {requireUploaderAuth,uploaderBody,uploaderFailure} from '@/lib/meta-upload-http';
export const runtime='nodejs';
async function accountGET(request:Request){try{requireUploaderAuth(request);return Response.json(await connectionStatus(),{headers:{'Cache-Control':'no-store'}});}catch(e){return uploaderFailure(e);}}
async function accountPOST(request:Request){try{const b=await uploaderBody(request);if(b.action==='configure'){await saveMetaApp(b.appId,b.appSecret,b.loginConfigId);return Response.json(await connectionStatus(),{headers:{'Cache-Control':'no-store'}});}if(b.action!=='connect')throw Error('Unknown action.');await saveMetaToken(b.token);return Response.json({...(await connectionStatus()),accounts:await metaAccounts()},{headers:{'Cache-Control':'no-store'}});}catch(e){return uploaderFailure(e);}}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
