import {AsyncLocalStorage} from 'node:async_hooks';
import {createHash} from 'node:crypto';
export type EmployeeWorkspace={id:string;name:string;sheetId:string};
export type WorkspaceContext={id:string;email:string;name:string;values:Record<string,string>;editors:EmployeeWorkspace[]};
const scope=new AsyncLocalStorage<WorkspaceContext|undefined>();
export const currentWorkspace=()=>scope.getStore();
export const inWorkspace=<T>(workspace:WorkspaceContext|undefined,fn:()=>T)=>scope.run(workspace,fn);
export const inOwnerWorkspace=<T>(fn:()=>T)=>scope.run(undefined,fn);
const privateSettings=new Set(['AI_PROVIDER','AI_MODEL','GEMINI_API_KEY','OPENAI_API_KEY','ANTHROPIC_API_KEY','ELEVENLABS_API_KEY','KIE_API_KEY','TRENDTRACK_API_KEY','CUSTOM_API_KEY','CUSTOM_BASE_URL','MT_AK','MT_SK','META_ACCESS_TOKEN','META_APP_ID','META_APP_SECRET','META_LOGIN_CONFIG_ID','ADMIN_SHEET_ID','SPREADSHEET_ID','GOOGLE_DRIVE_VIDEO_FOLDER_ID']);
export function accountEnv(name:string){const workspace=currentWorkspace();return workspace&&privateSettings.has(name)?workspace.values[name]:process.env[name];}
export function requiredAccountEnv(name:string){const value=accountEnv(name);if(!value)throw Error(`Podłącz ${name.replace(/_API_KEY$/,'').replace(/_/g,' ')} w Profil → Moje klucze.`);return value;}
export function accountDefault(name:string,fallback:string){return currentWorkspace()?requiredAccountEnv(name):fallback;}
export function accountStateName(name:string){const workspace=currentWorkspace();return workspace?'user-'+workspace.id+'-'+createHash('sha256').update(name).digest('hex'):name;}
export function accountCacheKey(name:string){return (currentWorkspace()?.id||'owner')+':'+name;}

export function accountMediaPath(path:string){const id=currentWorkspace()?.id;if(!id)return path;if(path.startsWith('users/')){if(!path.startsWith('users/'+id+'/'))throw Error('Media belong to another workspace.');return path;}return 'users/'+id+'/'+path;}
export function logicalMediaPath(path:string){if(!path.startsWith('users/'))return path;const id=currentWorkspace()?.id;if(!id||!path.startsWith('users/'+id+'/'))throw Error('Media belong to another workspace.');return path.slice(('users/'+id+'/').length);}
