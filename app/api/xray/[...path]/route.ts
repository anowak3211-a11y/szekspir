import {checkedSession,authAttempt} from '@/lib/app-auth';
import {historyRequest,userId} from '@/lib/xray/history';
import {getJob} from '@/lib/jobs';
import {analyze,align} from '@/lib/xray/ai';
export const maxDuration=300;
export const dynamic='force-dynamic';
async function handle(request:Request,context:{params:Promise<{path:string[]}>}){
 const headers={'Cache-Control':'no-store, private'};
 try{
  const state=await checkedSession(request.headers.get('cookie'));
  if(request.method!=='GET'&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({ok:false,error:'Invalid origin.'},{status:403,headers});
  const {path}=await context.params;let body:Record<string,unknown>={};
  if(request.method==='POST'){if(!request.headers.get('content-type')?.startsWith('application/json'))throw Error('Wymagany JSON.');if(Number(request.headers.get('content-length'))>2_500_000)throw Error('Za duże żądanie.');const text=await request.text();if(Buffer.byteLength(text)>2_500_000)throw Error('Za duże żądanie.');body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw Error('Nieprawidłowe dane.');await authAttempt('xray-write:'+state.user.id,60);}
  if(request.method==='GET'&&path[0]==='job'){const job=await getJob(new URL(request.url).searchParams.get('id')||'');if(!job?.result)throw Error('Zadanie nie ma gotowego skryptu.');return Response.json({ok:true,name:job.name,orig:job.transcript||job.result.us_script,en:job.market==='pl'?job.result.us_script:job.result.uk_script,pl:job.market==='pl'?job.result.uk_script:'',back:job.market==='pl'?'/szekspir-pl':'/szekspir'},{headers});}
  if(request.method==='POST'&&['ai-diff','align'].includes(path[0])){await authAttempt('xray-ai:'+state.user.id,10);return Response.json(await (path[0]==='align'?align(body):analyze(body)),{headers});}
  return Response.json(await historyRequest(request.method,path,new URL(request.url).searchParams,body,{id:userId(state.user.id),username:'Właściciel'}),{headers});
 }catch(e){const error=e as Error&{status?:number;istnieje?:unknown};return Response.json({ok:false,error:error.message.startsWith('Sign')?'Zaloguj się ponownie.':/api[_ -]?key|Bearer|sk-ant-|EAA[A-Za-z0-9]/i.test(error.message)?'Nie udało się wykonać operacji. Sprawdź konfigurację.':error.message.slice(0,300),detail:'Nie udało się wykonać operacji.',...(error.istnieje?{istnieje:error.istnieje}:{})},{status:error.status||400,headers});}
}
export const GET=handle,POST=handle,DELETE=handle;
