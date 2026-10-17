import {ACCOUNT_HEADER,verifyAccount,type AccountIdentity} from './account-identity';
import {inWorkspace} from './account-context';
import {memberWorkspace,workspaceById} from './account-repository';
export function accountRoute<R extends Request,A extends unknown[]>(handler:(request:R,...args:A)=>Promise<Response>){return async(request:R,...args:A)=>{
 const identity=verifyAccount<AccountIdentity>(request.headers.get(ACCOUNT_HEADER));
 if(!identity){const secret=process.env.CRON_SECRET;if(secret&&request.headers.get('authorization')==='Bearer '+secret&&['/api/jobs/worker','/api/editors/sync','/api/editors/quality'].includes(new URL(request.url).pathname))return handler(request,...args);if(process.env.APP_AUTH_MODE==='supabase-mfa')return Response.json({error:'Zaloguj się ponownie.'},{status:401});return handler(request,...args);}
 const user=identity.owner?(identity.workspace?await workspaceById(identity.workspace):undefined):await memberWorkspace(identity.email);
 if((!identity.owner||identity.workspace)&&!user||user&&user.state!=='ready')return Response.json({error:'Zestaw użytkownika nie jest jeszcze gotowy. Skontaktuj się z administratorem.'},{status:403});
 // Infrastructure configuration remains shared; provider credentials and all durable state use this workspace.
 const path=new URL(request.url).pathname;
 if(user&&['/api/drive/connect','/api/drive/callback','/api/drive'].includes(path))return Response.json({error:'Drive jest zarządzany przez administratora.'},{status:403});
 return inWorkspace(user,()=>handler(request,...args));
};}
