import {accountRoute} from '@/lib/account-route';
import {connectTrendtrack,fetchTrendtrackTop,trendtrackConnected} from '@/lib/trendtrack-import';
export const runtime='nodejs';
export const maxDuration=180;
const headers={'Cache-Control':'no-store, private'};
async function accountGET(){try{return Response.json({connected:await trendtrackConnected()},{headers});}catch{return Response.json({error:'Nie można sprawdzić połączenia.'},{status:503,headers});}}
async function accountPOST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403,headers});
 try{const raw=await req.text();if(raw.length>4000)throw Error('Zbyt duże żądanie.');let body;try{body=JSON.parse(raw);}catch{throw Error('Nieprawidłowe żądanie JSON.');}
 if(body.action==='connect')return Response.json(await connectTrendtrack(body.apiKey),{headers});
 if(body.action!=='fetch')throw Error('Nieznana operacja.');
 return Response.json(await fetchTrendtrackTop(body.url),{headers});
 }catch(e){return Response.json({error:(e as Error).message},{status:400,headers});}
}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
