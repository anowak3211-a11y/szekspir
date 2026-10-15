/** Owner-authorised provisioning only; never a public registration endpoint. */
import {createClient} from '@supabase/supabase-js';
import {authorised} from '@/lib/auth';
import {allowedEmail,authAttempt,requestBucket} from '@/lib/app-auth';
export const runtime='nodejs';
export async function POST(request:Request){
 const headers={'Cache-Control':'no-store'};
 if(!authorised(request.headers.get('authorization')))return Response.json({error:'Auth required.'},{status:401,headers});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin.'},{status:403,headers});
 try{
  await authAttempt('owner-invite:'+requestBucket(request),3);
  const body=await request.json(),email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
  if(!allowedEmail(email))return Response.json({error:'This email is not on the workspace allowlist.'},{status:403,headers});
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw Error();
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const {error}=await client.auth.admin.inviteUserByEmail(email,{redirectTo:new URL('/login',process.env.APP_ORIGIN||request.url).href});
  if(error)return Response.json({error:'Invitation was not sent. Check the Auth email and redirect settings, or whether this account already exists.'},{status:400,headers});
  return Response.json({invited:true},{headers});
 }catch{return Response.json({error:'Invitation is temporarily unavailable.'},{status:503,headers});}
}
