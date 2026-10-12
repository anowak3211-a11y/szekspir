import {regenerateHook} from '@/lib/hook-regeneration';
export const maxDuration=300;
export async function POST(request:Request){
 try{return Response.json({hook:await regenerateHook(await request.json())});}
 catch(error){return Response.json({error:(error as Error).message},{status:400});}
}
