import {antkiGeneratedImage} from '@/lib/antki-work';
import {nativeImage} from '@/lib/native-ads';
export const maxDuration=60;
export async function GET(req:Request){try{const query=new URL(req.url).searchParams;const image=await (query.get('variant')==='uk'?antkiGeneratedImage: nativeImage)(query.get('id')||'');return new Response(new Uint8Array(image.buffer),{headers:{'Content-Type':image.mime,'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff',...(query.get('download')==='1'?{'Content-Disposition':`attachment; filename="antki-uk-${query.get('id')?.replace(/[^a-zA-Z0-9_]/g,'')||'image'}.${image.ext}"`}:{})}});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
