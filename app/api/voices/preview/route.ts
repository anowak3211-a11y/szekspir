import {libraryVoicePreview,LIBRARY_PREVIEW_ERROR} from '@/lib/library-voice-preview';
export const maxDuration=60;

export async function GET(req:Request){
 const voiceId=new URL(req.url).searchParams.get('voiceId');
 if(!voiceId||!/^[a-zA-Z0-9_-]{1,100}$/.test(voiceId))return Response.json({error:'Choose a voice first.'},{status:400});
 try{
  const {buffer,contentType}=await libraryVoicePreview(voiceId);
  return new Response(new Uint8Array(buffer),{headers:{
   'Content-Type':contentType,'Content-Length':String(buffer.length),
   'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'
  }});
 }catch{
  return Response.json({error:LIBRARY_PREVIEW_ERROR},{status:502});
 }
}
