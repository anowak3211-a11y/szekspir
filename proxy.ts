import {ACCOUNT_HEADER,WORKSPACE_COOKIE,signAccount,verifyAccount,ownerEmail} from './lib/account-identity';
import { NextRequest, NextResponse } from "next/server";
import {checkedSession,mfaRequired,sessionCookie,tokens,AuthFailure} from "./lib/app-auth";

export async function proxy(req: NextRequest) {
  const path=req.nextUrl.pathname;
  if(path==="/login"||path==="/api/auth"||path==="/join"||path==="/api/join")return NextResponse.next();
  if (req.nextUrl.pathname === "/privacy") return NextResponse.next();
  // Scheduled workers retain a separate, narrowly scoped machine credential.
  const header = req.headers.get("authorization") || "";
  if (["/api/jobs/worker", "/api/editors/sync"].includes(req.nextUrl.pathname)) {
    const secret = process.env.CRON_SECRET;
    if (secret && header === `Bearer ${secret}`) return NextResponse.next();
    return new NextResponse("Auth required", { status: 401 });
  }
  if (req.nextUrl.pathname === "/api/editors/quality" && process.env.CRON_SECRET && header === `Bearer ${process.env.CRON_SECRET}`) return NextResponse.next();
  const pass = process.env.APP_PASSWORD;
  if (!pass) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("Application access is not configured", { status: 503 });
  }
  if(mfaRequired()){
    // The machine credential is separate and scoped to the legacy Python endpoints.
    if(["/api/vmake_submit","/api/vmake_status"].includes(path)&&process.env.CRON_SECRET&&header===`Bearer ${process.env.CRON_SECRET}`)return NextResponse.next();
    try{
      const state=await checkedSession(req.headers.get('cookie'));
      if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.get('origin')!==req.nextUrl.origin)return new NextResponse('Invalid origin',{status:403});
      const headers=new Headers(req.headers);const owner=ownerEmail(state.user.email||'');const selection=verifyAccount<{actor:string;workspace:string}>(req.cookies.get(WORKSPACE_COOKIE)?.value||null,31*24*60*60*1000);headers.set(ACCOUNT_HEADER,signAccount({id:state.user.id,email:state.user.email,owner,workspace:owner&&selection?.actor===state.user.id?selection.workspace:undefined}));
      // Existing handlers receive their server-only credential only after MFA validation.
      if(['/api/vmake_submit','/api/vmake_status'].includes(path)){if(!owner)return new NextResponse('Use the application processing workflow.',{status:403});if(!process.env.CRON_SECRET)throw new AuthFailure('Machine authentication is not configured.',503);headers.set('authorization',`Bearer ${process.env.CRON_SECRET}`);}
      else headers.set('authorization',`Basic ${Buffer.from(':'+pass).toString('base64')}`);
      const response=NextResponse.next({request:{headers}});
      response.headers.set('Cache-Control','no-store, private');
      if(state.changed)response.headers.append('Set-Cookie',sessionCookie(tokens(state.session),state.until,state.needsPassword));
      return response;
    }catch(error){
      const status=error instanceof AuthFailure?error.status:503;
      if(path.startsWith('/api/'))return NextResponse.json({error:status===503?'Sign-in is temporarily unavailable.':'Two-factor sign-in required.'},{status,headers:{'Cache-Control':'no-store'}});
      return NextResponse.redirect(new URL('/login',req.url));
    }
  }
  if(process.env.APP_AUTH_MODE&&process.env.APP_AUTH_MODE!=='legacy')return new NextResponse('Invalid authentication mode',{status:503});
  if (header.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(header.slice(6), "base64").toString();
      const idx = decoded.indexOf(":");
      if (idx >= 0 && decoded.slice(idx + 1) === pass) return NextResponse.next();
    } catch { /* malformed credentials are rejected */ }
  }
  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="SZEKSPIR"' },
  });
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
