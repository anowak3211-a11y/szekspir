import {accountRoute} from '@/lib/account-route';
import {startMetaOauth,META_COOKIE} from '@/lib/meta-oauth';
import {requireUploaderAuth} from '@/lib/meta-upload-http';
async function accountPOST(request:Request){try{requireUploaderAuth(request);const {state,url}=await startMetaOauth();return new Response(null,{status:303,headers:{Location:url,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','Set-Cookie':`${META_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`}});}catch{return new Response('Configure the Meta app in server settings before connecting.',{status:400});}}

export const POST=accountRoute(accountPOST);
