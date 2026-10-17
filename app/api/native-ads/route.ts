import {accountRoute} from '@/lib/account-route';
import {antkiNumbers} from '@/lib/antki-numbers';
import {antkiStageLabel} from '@/lib/antki-view';
import {getNativeAd,importNativeAds,listNativeAds} from '@/lib/native-ads';
import {startAntkiWork,antkiWorkIndex} from '@/lib/antki-work';
export const maxDuration=300;
async function accountGET(req:Request){try{const id=new URL(req.url).searchParams.get('id');if(id){const ad=await getNativeAd(id),numbers=await antkiNumbers([id]);return Response.json({ad:{...ad,number:numbers[id]}},{headers:{'Cache-Control':'no-store'}});}const library=await listNativeAds(),index=await antkiWorkIndex();return Response.json({...library,ads:library.ads.map(ad=>({...ad,primaryText:ad.primaryText.slice(0,180),workStatus:index[ad.id]?antkiStageLabel(index[ad.id].status,index[ad.id].phase):ad.workStatus}))},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
async function accountPOST(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return new Response('Invalid origin',{status:403});try{const text=await req.text();if(text.length>4200000)throw Error('Request exceeds 4.2 MB.');const body=JSON.parse(text);const imported=await importNativeAds(body);const preparationErrors:string[]=[];if(body.prepare!==false){for(const result of imported.results){if(result.status==='failed')continue;try{await startAntkiWork(result.id);}catch(e){preparationErrors.push(`${result.id}: ${(e as Error).message}`);}}}return Response.json({...imported,preparationErrors});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);
