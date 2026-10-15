'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import styles from './sign-in.module.css';
type Status={signedIn:boolean;enforced?:boolean;canInvite?:boolean;email?:string;needsPassword?:boolean;complete?:boolean;factorId?:string};
async function action(body:Record<string,unknown>){const response=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error||'Sign-in failed. Try again.');return data;}
export default function SignIn(){
 const [status,setStatus]=useState<Status>({signedIn:false}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState(''),[factor,setFactor]=useState(''),[qr,setQr]=useState(''),[recover,setRecover]=useState(false);
 const [inviteNotice,setInviteNotice]=useState('');
 const [backup,setBackup]=useState<string[]|null>(null),[backupNotice,setBackupNotice]=useState('');
 const errorRef=useRef<HTMLParagraphElement>(null),booted=useRef(false);
 async function refresh(){const response=await fetch('/api/auth',{cache:'no-store'});if(!response.ok)throw Error('Sign-in is not configured yet.');const next=await response.json() as Status;setStatus(next);setFactor(next.factorId||'');}
 useEffect(()=>{if(booted.current)return;booted.current=true;(async()=>{
  try{const fragment=new URLSearchParams(window.location.hash.slice(1));const access_token=fragment.get('access_token'),refresh_token=fragment.get('refresh_token');
   // Remove invitation credentials before loading any further app resources.
   if(window.location.hash)window.history.replaceState(null,'','/login');
   if(access_token&&refresh_token)await action({action:'invite',access_token,refresh_token});
   else if(fragment.get('error'))throw Error('Invitation expired. Request a new invitation from the owner.');
   await refresh();
  }catch(e){setError((e as Error).message);}finally{setLoading(false);}
 })();},[]);
 useEffect(()=>{if(error)errorRef.current?.focus();},[error]);
 async function run(fn:()=>Promise<void>){if(busy)return;setBusy(true);setError('');try{await fn();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function submit(event:FormEvent){event.preventDefault();await run(async()=>{
  if(!status.signedIn){await action({action:'login',email,password});setPassword('');await refresh();}
  else if(status.needsPassword){await action({action:'password',password});setPassword('');await refresh();}
  else{await action({action:recover?'recover':'verify',factorId:factor,code:code.trim()});setCode('');setQr('');await refresh();}
 });}
 return <main className={styles.page}><section className={styles.card} aria-labelledby="sign-in-title">
  <a className={styles.brand} href="/login">SZEKSPIR<span>PRIVATE WORKSPACE</span></a>
  <div className={styles.lock} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg></div>
  <h1 id="sign-in-title">{status.complete?'You’re signed in':status.needsPassword?'Set your password':status.signedIn?'Two-factor authentication':'Welcome back'}</h1>
  <p className={styles.intro}>{status.complete?(status.enforced?'Your account is protected with two-factor authentication.':'Your authenticator is verified. Workspace enforcement is pending activation.'):status.needsPassword?'Create a unique password for your personal account.':status.signedIn?'Use your authenticator app to finish signing in.':'Sign in with your personal account to open the workspace.'}</p>
  {error&&<p role="alert" tabIndex={-1} ref={errorRef} className={styles.error}>{error}</p>}
  {loading?<p role="status">Checking your session…</p>:status.complete?<div className={styles.stack}>
   <p className={styles.identity}>{status.email}</p>
   <a className={styles.primary} href="/">Open workspace</a>
   <button type="button" disabled={busy} onClick={()=>run(async()=>{const data=await action({action:'backup'});if(data.codes)setBackup(data.codes);else setBackupNotice(data.available?'Recovery codes have already been created. Keep your saved copy.':'Recovery codes are unavailable on this Auth server. Keep a secure backup of your authenticator. If you lose it, contact the workspace owner for identity-verified recovery.');})}>Save recovery codes</button>
   {backup&&<div className={styles.backup}><p>Shown once. Store these codes privately. Each code works once.</p><pre>{backup.join('\n')}</pre><button type="button" onClick={()=>{const blob=new Blob([backup.join('\n')],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='szekspir-recovery-codes.txt';a.click();URL.revokeObjectURL(url);}}>Download codes</button><button type="button" onClick={()=>setBackup(null)}>I saved them — hide codes</button></div>}
   {backupNotice&&<p role="status" className={styles.notice}>{backupNotice}</p>}
  </div>:<form onSubmit={submit} className={styles.stack}>
   {!status.signedIn?<><label htmlFor="email">Email<input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></label><label htmlFor="password">Password<input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/></label></>:status.needsPassword?<label htmlFor="new-password">New password<input id="new-password" type="password" minLength={14} maxLength={128} autoComplete="new-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/><span className={styles.hint}>At least 14 characters. Password managers and paste are supported.</span></label>:<>
    <p className={styles.identity}>{status.email}</p>
    {!factor&&!qr?<button type="button" disabled={busy} onClick={()=>run(async()=>{const data=await action({action:'enrol'});setFactor(data.factorId);setQr(data.qr);})}>Set up authenticator</button>:null}
    {qr&&<div className={styles.qr}><img src={qr.startsWith('data:')?qr:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(qr)} alt="Private authenticator setup QR code" width={224} height={224}/><p>Scan with your authenticator app, then enter its six-digit code. Keep this QR code private.</p></div>}
    {(factor||recover)&&<label htmlFor="code">{recover?'Recovery code':'Authenticator code'}<input id="code" type="text" inputMode={recover?'text':'numeric'} autoComplete="one-time-code" pattern={recover?undefined:'[0-9]{6}'} maxLength={recover?128:6} required value={code} onChange={e=>setCode(e.target.value)} disabled={busy}/></label>}
    {status.factorId&&<button type="button" className={styles.link} onClick={()=>{setRecover(!recover);setCode('');}}>{recover?'Use authenticator instead':'Use a recovery code'}</button>}
   </>}
   {(!status.signedIn||status.needsPassword||factor||recover)&&<button className={styles.primary} disabled={busy} type="submit">{busy?'Checking…':!status.signedIn?'Sign in':status.needsPassword?'Save password':'Verify and sign in'}</button>}
  </form>}
  {!status.signedIn&&!loading&&<button type="button" className={styles.link} disabled={busy||!email} onClick={()=>run(async()=>{await action({action:'reset',email});setInviteNotice('If this account is authorised, a recovery email has been sent. Open it on this device.');})}>Forgot password? Send recovery email</button>}
  {status.canInvite&&!status.signedIn&&<button type="button" className={styles.link} disabled={busy||!email} onClick={()=>run(async()=>{const response=await fetch('/api/auth/invite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email}),cache:'no-store'}),data=await response.json();if(!response.ok)throw Error(data.error||'Invitation failed.');setInviteNotice('Invitation sent. Open the email on this device to set your password and authenticator.');})}>First visit? Send your invitation</button>}
  {inviteNotice&&<p role="status" className={styles.notice}>{inviteNotice}</p>}
  {status.signedIn&&<button type="button" className={styles.link} disabled={busy} onClick={()=>run(async()=>{await action({action:'logout'});setStatus({signedIn:false});setQr('');setFactor('');setBackup(null);setCode('');setRecover(false);})}>Sign out</button>}
  <p className={styles.footer}>Invite-only access. Sessions expire after 8 hours.</p>
 </section></main>;
}
