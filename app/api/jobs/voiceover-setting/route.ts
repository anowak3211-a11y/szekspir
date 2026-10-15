import {setVoiceoverEnabled} from '@/lib/voiceover-setting';
export async function POST(request:Request){try{
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return new Response('Invalid origin',{status:403});
 const {id,enabled}=await request.json();return Response.json({job:await setVoiceoverEnabled(id,enabled)});
}catch(error){return Response.json({error:(error as Error).message},{status:400});}}
