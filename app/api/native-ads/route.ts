import {getNativeAd,importNativeAds,listNativeAds} from '@/lib/native-ads';
export const maxDuration=300;
export async function GET(req:Request){try{const id=new URL(req.url).searchParams.get('id');return Response.json(id?{ad:await getNativeAd(id)}:await listNativeAds(),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
export async function POST(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return new Response('Invalid origin',{status:403});try{const text=await req.text();if(text.length>2000000)throw Error('Import exceeds 2 MB.');return Response.json(await importNativeAds(JSON.parse(text)));}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
