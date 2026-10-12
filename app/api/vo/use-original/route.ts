import {useOriginalVoiceover,OriginalVoiceoverSaveError} from '@/lib/use-original-voiceover';
export const maxDuration=300;
export async function POST(req:Request){
 const origin=req.headers.get('origin');
 if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'Use this action from the Szekspir page.'},{status:403});
 try{
  const input=await req.json();
  const job=await useOriginalVoiceover({id:input.id,revision:input.revision,factor:input.factor,adjustments:input.adjustments});
  return Response.json({job});
 }catch(error){
  if(error instanceof OriginalVoiceoverSaveError)return Response.json({error:error.message,job:error.job},{status:error.status});
  return Response.json({error:error instanceof Error?error.message:'Could not use the saved original recording.'},{status:409});
 }
}
