import {authorised} from '@/lib/auth';
import {DRIVE_COOKIE,finishDriveConnection} from '@/lib/drive-oauth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!authorised(request.headers.get('authorization')))return new Response('Auth required',{status:401});
 const url=new URL(request.url),cookie=request.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(DRIVE_COOKIE+'='))?.slice(DRIVE_COOKIE.length+1)||'';
 let success=false;
 try{if(url.searchParams.has('error'))throw Error('Consent cancelled');await finishDriveConnection(url.searchParams.get('state')||'',cookie,url.searchParams.get('code')||'');success=true;}catch{/* Never expose codes, credentials or provider responses. */}
 return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Google Drive connection</title><h1>${success?'Google Drive connected':'Google Drive was not connected'}</h1><p>${success?'Folder access verified. Return to Szekspir and check the Drive connection again.':'The sign-in expired, was cancelled, or the selected account cannot access the upload folder. Your previous connection has not been replaced.'}</p><a href="${success?'/szekspir':'/api/drive/connect'}">${success?'Return to Szekspir':'Try again'}</a></html>`,{status:success?200:400,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'; base-uri 'none'",'Set-Cookie':`${DRIVE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}});
}
