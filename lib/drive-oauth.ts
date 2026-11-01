import {inOwnerWorkspace,accountEnv} from './account-context';
import {google} from 'googleapis';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import {readState,mutate} from './store';

export const DRIVE_ORIGIN='https://szekspir.vercel.app';
export const DRIVE_CALLBACK=DRIVE_ORIGIN+'/api/drive/callback';
export const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.file';
export const DRIVE_COOKIE='__Host-szekspir-drive-state';
type Client={clientId:string;clientSecret:string};
export type ActiveDriveClient=Client&{refreshToken:string;folderId?:string;email?:string};
type Connection={pending?:Client;active?:ActiveDriveClient};
type Attempt={expires:number;verifier:string;clientId:string;used?:boolean};
const KEY='drive-oauth-connection';
export async function driveConnection(){return inOwnerWorkspace(async()=>(await readState<Connection>(KEY,{})).value);}
export function parseDriveClient(raw:string):Client{
 if(raw.length>16384)throw Error('Invalid client file');
 const c=JSON.parse(raw)?.web;
 if(!c||!/^\d+-[\w-]+\.apps\.googleusercontent\.com$/.test(c.client_id)||typeof c.client_secret!=='string'||c.client_secret.length<10||c.client_secret.length>512||!Array.isArray(c.redirect_uris)||!c.redirect_uris.includes(DRIVE_CALLBACK))throw Error('Invalid web client or callback');
 return {clientId:c.client_id,clientSecret:c.client_secret};
}
export async function configureDriveClient(raw:string){const client=parseDriveClient(raw);await mutate<Connection,void>(KEY,{},c=>{c.pending=client;});}
export function oauthClient(client:Client){return new google.auth.OAuth2(client.clientId,client.clientSecret,DRIVE_CALLBACK);}
export function validDriveState(state:string,cookie:string){return /^[A-Za-z0-9_-]{43}$/.test(state)&&state.length===cookie.length&&timingSafeEqual(Buffer.from(state),Buffer.from(cookie));}
export async function startDriveConnection(){
 const c=await driveConnection();
 const envClient=process.env.GOOGLE_DRIVE_CLIENT_ID&&process.env.GOOGLE_DRIVE_CLIENT_SECRET?{clientId:process.env.GOOGLE_DRIVE_CLIENT_ID,clientSecret:process.env.GOOGLE_DRIVE_CLIENT_SECRET}:undefined;
 const client=c.pending||c.active||envClient;if(!client)throw Error('Configure web client first');
 const state=randomBytes(32).toString('base64url'),verifier=randomBytes(32).toString('base64url');
 await mutate<Attempt,void>('drive-oauth-'+state,{expires:Date.now()+600000,verifier,clientId:client.clientId},()=>{});
 const url=oauthClient(client).generateAuthUrl({access_type:'offline',scope:[DRIVE_SCOPE],prompt:'consent select_account',login_hint:'jcabanowskii@gmail.com',state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256' as never});
 return {state,url};
}
export async function finishDriveConnection(state:string,cookie:string,code:string){
 if(!validDriveState(state,cookie)||!code||code.length>4096)throw Error('Invalid OAuth response');
 const attempt=await mutate<Attempt,Attempt>('drive-oauth-'+state,{expires:0,verifier:'',clientId:''},a=>{if(a.used||a.expires<Date.now())throw Error('Expired OAuth response');const copy={...a};a.used=true;a.verifier='';return copy;});
 const c=await driveConnection();
 const envClient=process.env.GOOGLE_DRIVE_CLIENT_ID&&process.env.GOOGLE_DRIVE_CLIENT_SECRET?{clientId:process.env.GOOGLE_DRIVE_CLIENT_ID,clientSecret:process.env.GOOGLE_DRIVE_CLIENT_SECRET}:undefined;
 const client=c.pending||c.active||envClient;
 if(!client||client.clientId!==attempt.clientId)throw Error('OAuth configuration changed');
 const auth=oauthClient(client);
 const {tokens}=await auth.getToken({code,codeVerifier:attempt.verifier,redirect_uri:DRIVE_CALLBACK});
 if(!tokens.refresh_token)throw Error('No offline access granted');
 auth.setCredentials(tokens);
 const drive=google.drive({version:'v3',auth});
 let targetFolderId=accountEnv('GOOGLE_DRIVE_VIDEO_FOLDER_ID')||'';
 let folderOwnedAndWritable=false;
 if(targetFolderId){
  try{
   const {data}=await drive.files.get({fileId:targetFolderId,supportsAllDrives:true,fields:'id,mimeType,ownedByMe,capabilities(canAddChildren)'},{timeout:15000,retry:false});
   if(data.mimeType==='application/vnd.google-apps.folder'&&data.capabilities?.canAddChildren&&data.ownedByMe)folderOwnedAndWritable=true;
  }catch{}
 }
 if(!folderOwnedAndWritable){
  const found=(await drive.files.list({q:"trashed = false and mimeType = 'application/vnd.google-apps.folder' and appProperties has { key='szekspirRootFolder' and value='1' }",fields:'files(id)',pageSize:2})).data.files||[];
  let newId=found[0]?.id||undefined;
  if(!newId){
   const created=(await drive.files.create({requestBody:{name:'SZEKSPIR',mimeType:'application/vnd.google-apps.folder',appProperties:{szekspirRootFolder:'1'}},fields:'id'},{timeout:20000,retry:false})).data;
   newId=created.id||undefined;
  }
  if(!newId)throw Error('Cannot create upload folder');
  try{
   const saEmail=process.env.GOOGLE_CREDENTIALS_JSON?JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON).client_email:undefined;
   if(saEmail){
    const perms=(await drive.permissions.list({fileId:newId,fields:'permissions(emailAddress)'})).data.permissions||[];
    if(!perms.some(p=>p.emailAddress===saEmail))await drive.permissions.create({fileId:newId,sendNotificationEmail:false,requestBody:{type:'user',role:'writer',emailAddress:saEmail}});
   }
  }catch{}
  targetFolderId=newId;
 }
 await mutate<Connection,void>(KEY,{},current=>{const selected=current.pending||current.active||envClient;if(selected?.clientId!==client.clientId)throw Error('OAuth configuration changed');current.active={...client,refreshToken:tokens.refresh_token!,folderId:targetFolderId};delete current.pending;});
}
