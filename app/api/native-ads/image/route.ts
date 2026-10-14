import {nativeImage} from '@/lib/native-ads';
export const maxDuration=60;
export async function GET(req:Request){try{const image=await nativeImage(new URL(req.url).searchParams.get('id')||'');return new Response(new Uint8Array(image.buffer),{headers:{'Content-Type':image.mime,'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
