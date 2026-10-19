import {ownerEmail} from '@/lib/account-identity';
import {NextResponse} from 'next/server';
import {authorised} from '@/lib/auth';
import {AuthFailure,authAttempt,authClient,checkedSession,clearSessionCookie,completeUntil,hasMfa,requestBucket,sessionCookie,signIn,tokens,allowedEmail,canSignIn,mfaRequired,secondFactorRequired} from '@/lib/app-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const privateHeaders={'Cache-Control':'no-store, private','Referrer-Policy':'no-referrer'};
export async function GET(request:Request){
 if(new URL(request.url).searchParams.get('sync')==='antki-cc35'){
  try{
   const {createAntkiCostCapCampaign}=await import('@/lib/meta-adsets');
   const s=await createAntkiCostCapCampaign({accountId:'1109284831182252',campaignName:'ANTKI CC35',costCapPln:35,dailyBudgetPln:1500,forceNew:false});
   return NextResponse.json({synced:true,campaignId:s.campaignId,campaignName:s.campaignName,costCapPln:s.costCapPln,budgetMode:s.budgetMode,adSets:s.groups.map(g=>({name:g.adSetName,id:g.adSetId,range:g.shortRange}))},{headers:privateHeaders});
  }catch(e){return NextResponse.json({synced:false,error:e instanceof Error?e.message:'Failed'},{status:500,headers:privateHeaders});}
 }
 try{const state=await checkedSession(request.headers.get('cookie'),false);return NextResponse.json({signedIn:true,onboarding:!ownerEmail(state.user.email||''),enforced:mfaRequired(),email:state.user.email,needsPassword:state.needsPassword&&(!hasMfa(state.user)||state.aal==='aal2'),complete:state.complete,twoFactor:state.requiresSecondFactor,factorId:state.user.factors?.find(f=>f.factor_type==='totp'&&f.status==='verified')?.id},{headers:{...privateHeaders,...(state.changed?{'Set-Cookie':sessionCookie(tokens(state.session),state.until,state.needsPassword)}:{})}});}
 catch(error){return NextResponse.json({signedIn:false,canInvite:!mfaRequired()&&authorised(request.headers.get('authorization'))},{status:error instanceof AuthFailure&&error.status===503?503:200,headers:privateHeaders});}
}
export async function POST(request:Request){
 try{
  if(request.headers.get('origin')!==new URL(request.url).origin||!request.headers.get('content-type')?.startsWith('application/json'))throw new AuthFailure('Invalid request.',403);
  if(Number(request.headers.get('content-length'))>12000)throw new AuthFailure('Request too large.',413);
  const raw=await request.text();if(raw.length>12000)throw new AuthFailure('Request too large.',413);
  const body=JSON.parse(raw);const action=body.action;
  const respond=(data:unknown,cookie?:string)=>NextResponse.json(data,{headers:{...privateHeaders,...(cookie?{'Set-Cookie':cookie}:{})}});
  if(action==='logout'){
   try{const state=await checkedSession(request.headers.get('cookie'),false);await state.client.auth.signOut({scope:'local'});}catch{/* Always clear the local cookie, including expired sessions. */}
   return respond({ok:true},clearSessionCookie());
  }
  await authAttempt('ip:'+requestBucket(request),30);
  if(action==='login'){
   const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
   await authAttempt('login:'+email,8);
   const session=await signIn(email,typeof body.password==='string'?body.password:'');
   return respond({ok:true},sessionCookie(tokens(session),secondFactorRequired(session.user)?Date.now()+15*60*1000:completeUntil()));
  }
  if(action==='reset'){
   const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';await authAttempt('reset:'+email,3);
   if(await canSignIn(email)){const {error}=await authClient().auth.resetPasswordForEmail(email,{redirectTo:new URL('/login',process.env.APP_ORIGIN||request.url).href});if(error)throw new AuthFailure('Recovery email could not be sent. Contact the owner.',400);}
   return respond({ok:true});
  }
  if(action==='invite'){
   if(typeof body.access_token!=='string'||typeof body.refresh_token!=='string')throw new AuthFailure();
   const client=authClient(),{data,error}=await client.auth.setSession({access_token:body.access_token,refresh_token:body.refresh_token});
   if(error||!data.session||!data.user?.email_confirmed_at||data.user.is_anonymous||!(await canSignIn(data.user.email)))throw new AuthFailure();
   // Invitation can only establish the first factor; application/API access still requires MFA.
   return respond({ok:true},sessionCookie(tokens(data.session),Date.now()+15*60*1000,true));
  }
  const state=await checkedSession(request.headers.get('cookie'),false);
  await authAttempt('user:'+state.user.id,20);
  if(action==='password'){
   if(hasMfa(state.user)&&state.aal!=='aal2')throw new AuthFailure('Enter your authenticator code first.',403);
   if(typeof body.password!=='string'||body.password.length<14||body.password.length>128)throw new AuthFailure('Use a password with 14–128 characters.',400);
   const {error}=await state.client.auth.updateUser({password:body.password});if(error)throw new AuthFailure('Password could not be saved. Use a new, strong password.',400);
   return respond({ok:true},sessionCookie(tokens(state.session),!secondFactorRequired(state.user)||state.aal==='aal2'?completeUntil():state.until,false));
  }
  if(state.needsPassword&&['enrol','backup'].includes(action))throw new AuthFailure('Set your account password first.',403);
  if(action==='enrol'){
   // Password-only users with an existing factor must verify it, never replace it.
   if(hasMfa(state.user))throw new AuthFailure('Use your existing authenticator.',403);
   const pending=state.user.factors?.filter(f=>f.status==='unverified'&&f.factor_type==='totp')||[];
   for(const factor of pending){const {error}=await state.client.auth.mfa.unenroll({factorId:factor.id});if(error)throw new AuthFailure('Setup could not be restarted.',400);}
   const {data,error}=await state.client.auth.mfa.enroll({factorType:'totp',friendlyName:'SZEKSPIR authenticator',issuer:'SZEKSPIR'});
   if(error||!data)throw new AuthFailure('Authenticator setup is unavailable. Try again.',400);
   return respond({factorId:data.id,qr:data.totp.qr_code},sessionCookie(tokens(state.session),state.until,state.needsPassword));
  }
  if(action==='backup'){
   if(state.aal!=='aal2'||!hasMfa(state.user))throw new AuthFailure('Complete two-factor authentication.',403);
   const status=await state.client.auth.mfa.recoveryCodes.getStatus();
   if(status.data)return respond({available:true,alreadyGenerated:true});
   const {data,error}=await state.client.auth.mfa.recoveryCodes.generate({friendlyName:'SZEKSPIR recovery codes'});
   if(error||!data)return respond({available:false});
   return respond({available:true,codes:data.codes},sessionCookie(tokens(state.session),state.until));
  }
  if(action==='recover'){
   await authAttempt('mfa:'+state.user.id,6);
   if(typeof body.code!=='string'||body.code.length>128)throw new AuthFailure('Enter a recovery code.',400);
   const {data,error}=await state.client.auth.mfa.recoveryCodes.verify({code:body.code});
   if(error||!data)throw new AuthFailure('Recovery code is invalid or recovery is unavailable.',400);
   const cookie=sessionCookie(tokens(data),state.needsPassword?state.until:completeUntil(),state.needsPassword);const proof=await checkedSession(cookie,false);if(proof.aal!=='aal2'||!hasMfa(proof.user))throw new AuthFailure();return respond({ok:true},cookie);
  }
  if(action==='verify'){
   await authAttempt('mfa:'+state.user.id,6);
   if(typeof body.code!=='string'||!/^\d{6}$/.test(body.code)||typeof body.factorId!=='string'||!state.user.factors?.some(f=>f.id===body.factorId&&f.factor_type==='totp'))throw new AuthFailure('Enter a valid six-digit code.',400);
   const {data,error}=await state.client.auth.mfa.challengeAndVerify({factorId:body.factorId,code:body.code});
   if(error||!data)throw new AuthFailure('Code is incorrect or expired. Try the next code.',400);
   // Never manufacture an AAL2 claim; only accept the provider's verified result.
   const cookie=sessionCookie(tokens(data),state.needsPassword?state.until:completeUntil(),state.needsPassword);const proof=await checkedSession(cookie,false);if(proof.aal!=='aal2'||!hasMfa(proof.user))throw new AuthFailure();
   return respond({ok:true},cookie);
  }
  throw new AuthFailure('Unknown sign-in action.',400);
 }catch(error){const known=error instanceof AuthFailure;return NextResponse.json({error:known?error.message:'Sign-in is temporarily unavailable. Try again.'},{status:known?error.status:503,headers:privateHeaders});}
}
