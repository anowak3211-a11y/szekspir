import {after} from 'next/server';
import {additionalAds,additionalHistory,requestAdditional,generateAdditional,approveAdditional,recoverAdditional,requestAdditionalUpload,scheduleAdditionalVideo} from '@/lib/additional-files';
export const maxDuration=300;
export async function GET(req:Request){try{const p=new URL(req.url).searchParams,editorId=p.get('editor')||'',adId=p.get('ad');return Response.json(adId?await additionalHistory(editorId,adId):{ads:await additionalAds(editorId)},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return new Response('Invalid origin',{status:403});
 const b=await req.json();
 if(b.action==='upload'){const file=await requestAdditionalUpload(b);if(file.status==='generating')await scheduleAdditionalVideo(file.adId,file.id);return Response.json({file},{status:202});}
 if(b.action==='generate'){const file=await requestAdditional(b);if(file.status==='generating'&&!file.startedAt)after(()=>generateAdditional(file.adId,file.id));return Response.json({file},{status:202});}
 if(typeof b.adId!=='string'||!/^MEL-\d+$/.test(b.adId)||typeof b.id!=='string'||!/^[-a-f0-9]{36}$/i.test(b.id)||typeof b.editorId!=='string')throw Error('Invalid selection.');
 if(b.action==='approve')return Response.json(await approveAdditional(b.editorId,b.adId,b.id));
 if(b.action==='recover'){await recoverAdditional(b.editorId,b.adId,b.id);return Response.json({ok:true});}
 throw Error('Unknown action.');
}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
