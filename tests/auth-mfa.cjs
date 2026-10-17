// Offline security boundaries using actual proxy, route, cookie codec and Supabase SDK.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module'),path=require('path');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
Object.assign(process.env,{NODE_ENV:'production',APP_PASSWORD:'offline-password',APP_AUTH_MODE:'supabase-mfa',JOB_ENCRYPTION_KEY:'offline-encryption-key',SUPABASE_URL:'https://offline-auth.test',SUPABASE_PUBLISHABLE_KEY:'offline-publishable-key',AUTH_ALLOWED_EMAILS:'owner@example.test',CRON_SECRET:'offline-machine-secret'});
const records=new Map(),load=Module._load;
Module._load=function(n,p,i){if(n==='./store'&&p?.filename.endsWith('/lib/app-auth.ts'))return {mutate:async(k,f,fn)=>{const value=structuredClone(records.get(k)??f),out=fn(value);records.set(k,value);return out;}};if(n.startsWith('@/'))n=path.resolve(n.slice(2))+'.ts';return load.call(this,n,p,i);};
const {NextRequest}=require('next/server'),guard=require('../proxy.ts'),auth=require('../lib/app-auth.ts'),route=require('../app/api/auth/route.ts');
const exp=Math.floor(Date.now()/1000)+3600;
function jwt(aal='aal1',sub='fixture-owner'){return [Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub,aal,exp,iss:'https://offline-auth.test/auth/v1'})).toString('base64url'),Buffer.from('offline-signature').toString('base64url')].join('.');}
const factor={id:'fixture-factor',factor_type:'totp',status:'verified',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
let user={id:'fixture-owner',email:'owner@example.test',email_confirmed_at:new Date().toISOString(),factors:[factor]},unavailable=false,verified=false;
const session=(aal)=>({access_token:jwt(aal),refresh_token:'fixture-refresh',token_type:'bearer',expires_in:3600,expires_at:exp,user});
const previousFetch=global.fetch;global.fetch=async(url,options={})=>{
 const u=new URL(url);assert.equal(u.origin,'https://offline-auth.test','No external network request is allowed');if(unavailable)throw Error('offline');
 if(u.pathname.endsWith('/user'))return Response.json(user);
 if(u.pathname.endsWith('/token'))return Response.json(session('aal1'));
 if(u.pathname.endsWith('/challenge'))return Response.json({id:'fixture-challenge',expires_at:exp});
 if(u.pathname.endsWith('/verify'))return verified?Response.json(session('aal2')):Response.json({msg:'Invalid TOTP',code:'mfa_verification_failed'},{status:422});
 throw Error('Unexpected Auth fixture path '+u.pathname);
};
function req(url='/api/meta/batches',headers={},method='GET'){return new NextRequest('https://app.test'+url,{headers,method});}
const basic='Basic '+Buffer.from(':'+process.env.APP_PASSWORD).toString('base64');
function cookie(aal='aal1',until=Date.now()+600000,needsPassword=false){return auth.sessionCookie({access_token:jwt(aal),refresh_token:'fixture-refresh'},until,needsPassword);}
function post(body,cookieValue,origin='https://app.test'){return new Request('https://app.test/api/auth',{method:'POST',headers:{'Content-Type':'application/json',...(origin===null?{}:{Origin:origin}),...(cookieValue?{cookie:cookieValue}:{})},body:JSON.stringify(body)});}
(async()=>{
 let r=await guard.proxy(req(undefined,{authorization:basic}));assert.equal(r.status,401,'Correct old shared password cannot bypass MFA');
 r=await guard.proxy(req('/uploader',{authorization:basic}));assert.equal(r.status,307);assert.equal(r.headers.get('location'),'https://app.test/login');
 r=await guard.proxy(req(undefined,{cookie:cookie('aal1'),authorization:basic}));assert.equal(r.status,403,'Password-only provider session cannot access data');
 r=await guard.proxy(req(undefined,{cookie:cookie('aal2')}));assert.equal(r.status,200);assert.equal(r.headers.get('x-middleware-request-authorization'),basic,'Only verified MFA receives the existing internal handler credential');
 const day=24*60*60*1000;
 assert(Math.abs(auth.completeUntil()-Date.now()-30*day)<1000,'Completed sign-in lasts 30 days');
 const oldSession=cookie('aal2',Date.now()+7*60*60*1000),renewed=await auth.checkedSession(oldSession);
 assert(renewed.changed&&renewed.complete);assert(Math.abs(renewed.until-Date.now()-30*day)<1000,'Old eight-hour sessions upgrade on an existing validated request');
 const fresh=cookie('aal2',auth.completeUntil());assert.equal((await auth.checkedSession(fresh)).changed,false,'No cookie churn on every request');
 const pendingUntil=Date.now()+600000,pendingCheck=await auth.checkedSession(cookie('aal1',pendingUntil),false);
 assert.equal(pendingCheck.until,pendingUntil);assert.equal(pendingCheck.changed,false,'Incomplete MFA never rolls forward');
 const setup=await auth.checkedSession(cookie('aal2',pendingUntil,true),false);assert.equal(setup.until,pendingUntil);assert.equal(setup.complete,false,'Password setup never becomes a complete remembered session');
 r=await guard.proxy(req(undefined,{cookie:oldSession}));const ttl=Number(/Max-Age=(\d+)/.exec(r.headers.get('set-cookie'))?.[1]);assert(ttl>=2591990&&ttl<=2592000,'Proxy persists the 30-day renewal');
 process.env.AUTH_PASSWORD_ONLY_EMAILS=' OWNER@EXAMPLE.TEST ';
 assert.equal(auth.secondFactorRequired(user),false);
 const exempt=await auth.checkedSession(cookie('aal1'));assert(exempt.complete&&exempt.changed,'Explicit owner exception accepts a provider-validated password session');
 r=await route.GET(new Request('https://app.test/api/auth',{headers:{cookie:cookie('aal1')}}));const ownerStatus=await r.json();assert(ownerStatus.complete);assert.equal(ownerStatus.twoFactor,false);
 r=await route.POST(post({action:'login',email:user.email,password:'secret'}));assert.equal(r.status,200);assert(auth.readSession(r.headers.get('set-cookie')).until>Date.now()+29*day,'Password sign-in receives the remembered cookie');
 await assert.rejects(()=>auth.checkedSession(cookie('aal1',pendingUntil,true)),/two-factor/,'Recovery/invitation still needs a password');
 user.email='outsider@example.test';await assert.rejects(()=>auth.checkedSession(cookie('aal1')),/Sign in/,'Exception never bypasses account allowlist');user.email='owner@example.test';
 process.env.AUTH_PASSWORD_ONLY_EMAILS='different@example.test';await assert.rejects(()=>auth.checkedSession(cookie('aal1')),/two-factor/,'Exception cannot change other users');
 delete process.env.AUTH_PASSWORD_ONLY_EMAILS;
 r=await guard.proxy(req('/api/vmake_submit',{cookie:cookie('aal2'),origin:'https://app.test'},'POST'));assert.equal(r.headers.get('x-middleware-request-authorization'),'Bearer offline-machine-secret');
 r=await guard.proxy(req(undefined,{cookie:cookie('aal2')},'POST'));assert.equal(r.status,403,'Missing Origin is rejected for cookie-authenticated mutations');
 r=await guard.proxy(req(undefined,{cookie:cookie('aal2'),origin:'https://attacker.test'},'POST'));assert.equal(r.status,403);
 const good=cookie('aal2');assert(auth.readSession(good));assert.equal(auth.readSession(cookie('aal2',Date.now()-1000)),null);const raw=good.split(';')[0],bytes=Buffer.from(raw.split('=')[1],'base64url');bytes[20]^=1;assert.equal(auth.readSession(raw.split('=')[0]+'='+bytes.toString('base64url')),null,'Cookie ciphertext cannot be modified');assert(!good.includes('fixture-refresh'));assert(good.includes('HttpOnly')&&good.includes('Secure')&&good.includes('SameSite=Lax'));
 r=await guard.proxy(req(undefined,{cookie:cookie('aal2',Date.now()+600000,true)}));assert.equal(r.status,403,'Invitation awaiting a password cannot access the workspace');
 user.email='outsider@example.test';r=await guard.proxy(req(undefined,{cookie:cookie('aal2')}));assert.equal(r.status,401,'Provider registration does not bypass exact owner allowlist');user.email='owner@example.test';
 user.factors=[];r=await guard.proxy(req(undefined,{cookie:cookie('aal2')}));assert.equal(r.status,403,'Removed factors invalidate stale AAL2 access');user.factors=[factor];
 unavailable=true;r=await guard.proxy(req(undefined,{cookie:cookie('aal2')}));assert.notEqual(r.status,200);unavailable=false;
 r=await guard.proxy(req('/api/jobs/worker',{authorization:'Bearer offline-machine-secret'}));assert.equal(r.status,200);
 r=await guard.proxy(req('/api/meta/batches',{authorization:'Bearer offline-machine-secret'}));assert.equal(r.status,401,'Cron token cannot be used on general application APIs');
 for(const origin of [null,'https://attacker.test']){r=await route.POST(post({action:'login',email:user.email,password:'secret'},null,origin));assert.equal(r.status,403);}
 r=await route.POST(post({action:'login',email:user.email,password:'secret'}));assert.equal(r.status,200);const pending=r.headers.get('set-cookie');assert(pending);await assert.rejects(()=>auth.checkedSession(pending,true),/two-factor/);
 r=await route.POST(post({action:'enrol'},pending));assert.equal(r.status,403,'Existing verified MFA cannot be replaced by somebody with only a password');
 verified=true;r=await route.POST(post({action:'verify',factorId:factor.id,code:'123456'},pending));assert.equal(r.status,200);const full=r.headers.get('set-cookie');assert((await auth.checkedSession(full)).aal==='aal2');assert.equal((await r.json()).ok,true);
 records.clear();r=await route.POST(post({action:'invite',access_token:jwt('aal1'),refresh_token:'fixture-refresh'}));assert.equal(r.status,200);const recovery=r.headers.get('set-cookie');
 r=await route.POST(post({action:'password',password:'fixture-new-password'},recovery));assert.equal(r.status,403,'Email recovery alone cannot replace a password protected by an existing MFA factor');
 r=await route.POST(post({action:'verify',factorId:factor.id,code:'123456'},recovery));assert.equal(r.status,200);const recoveryMfa=r.headers.get('set-cookie');await assert.rejects(()=>auth.checkedSession(recoveryMfa,true),/two-factor/,'Recovery still requires owner password completion');
 r=await route.GET(new Request('https://app.test/api/auth',{headers:{cookie:recoveryMfa}}));assert.equal((await r.json()).needsPassword,true);
 r=await route.POST(post({action:'password',password:'fixture-new-password'},recoveryMfa));assert.equal(r.status,200);assert.equal((await auth.checkedSession(r.headers.get('set-cookie'))).aal,'aal2');
 r=await route.POST(post({action:'logout'},full));assert.equal(r.status,200);assert(r.headers.get('set-cookie').includes('Max-Age=0'));
 records.clear();verified=false;for(let i=0;i<6;i++){r=await route.POST(post({action:'verify',factorId:factor.id,code:'000000'},pending));assert.equal(r.status,400);}r=await route.POST(post({action:'verify',factorId:factor.id,code:'000000'},pending));assert.equal(r.status,429,'Distributed MFA attempt limit blocks guessing');
 delete process.env.APP_AUTH_MODE;r=await guard.proxy(req(undefined,{authorization:basic}));assert.equal(r.status,200,'Staged rollout preserves old login until activation');
 process.env.APP_AUTH_MODE='typo';r=await guard.proxy(req(undefined,{authorization:basic}));assert.equal(r.status,503,'Unknown auth mode fails closed');
 console.log('PASS MFA gateway: old-password/API bypass, first-factor/invite denial, encrypted expiring cookies, allowlist, revoked factors, provider outage, Origin, machine scope, MFA upgrade, guessing limits, logout and staged activation. Only fixture Auth HTTP.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=previousFetch;Module._load=load});
