import {accountRoute} from '@/lib/account-route';
import {authorised} from '@/lib/auth';
import {configureDriveClient,driveConnection,startDriveConnection,DRIVE_ORIGIN,DRIVE_CALLBACK,DRIVE_COOKIE} from '@/lib/drive-oauth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function page(body:string,status=200){return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connect Google Drive · SZEKSPIR</title><style>body{font:18px/1.6 system-ui;background:#f7f8f5;color:#193c2c;margin:40px auto;padding:24px;max-width:680px}button,input{font:inherit;padding:12px;max-width:100%;box-sizing:border-box}button{background:#146c43;color:white;border:0;border-radius:8px;cursor:pointer}a{color:#146c43}code{overflow-wrap:anywhere}label{display:block;margin-top:20px}</style><h1>Connect Google Drive</h1>${body}<p><a href="/szekspir">Back to Szekspir</a></p></html>`,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self' https://accounts.google.com; frame-ancestors 'none'; base-uri 'none'"}});}
async function accountGET(request:Request){
 if(!authorised(request.headers.get('authorization')))return new Response('Auth required',{status:401});
 try{const c=await driveConnection();return page(c.pending||c.active?'<p>Use the Google account that has access to the existing Szekspir upload folder. Only files used by this app are requested, not your entire Drive.</p><form method="post"><button type="submit">Connect Google Drive</button></form>':`<p>One-time setup: upload the web OAuth client JSON downloaded from the Google Cloud project used by Szekspir. It is stored encrypted, never displayed or added to Git.</p><p>Required authorised redirect URI:<br><code>${DRIVE_CALLBACK}</code></p><form method="post" enctype="multipart/form-data"><label for="credentials">Google web client JSON</label><input id="credentials" name="credentials" type="file" accept=".json,application/json" required><p><button type="submit">Save configuration</button></p></form>`);}catch{return page('<p role="alert">Private storage is unavailable. Please try again.</p>',503);}
}
async function accountPOST(request:Request){
 if(!authorised(request.headers.get('authorization')))return new Response('Auth required',{status:401});
 if(request.headers.get('origin')!==DRIVE_ORIGIN)return new Response('Invalid origin',{status:403});
 if(Number(request.headers.get('content-length')||0)>20000)return new Response('File too large',{status:413});
 try{
  if(request.headers.get('content-type')?.startsWith('multipart/form-data')){const data=await request.formData(),file=data.get('credentials');if(!(file instanceof File)||file.size>16384)throw Error('Invalid file');await configureDriveClient(await file.text());return new Response(null,{status:303,headers:{Location:'/api/drive/connect','Cache-Control':'no-store'}});}
  const {state,url}=await startDriveConnection();return new Response(null,{status:303,headers:{Location:url,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','Set-Cookie':`${DRIVE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`}});
 }catch{return page('<p role="alert">Could not start the connection. For setup, use the web client JSON with the exact callback above. Existing Drive credentials have not been replaced.</p><p><a href="/api/drive/connect">Try again</a></p>',400);}
}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
