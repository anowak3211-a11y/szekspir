import {saveHookDelivery} from '@/lib/save-hook-delivery';
export const maxDuration=300;
export async function POST(request:Request){
 try{const {id,index,enabled}=await request.json();return Response.json({job:await saveHookDelivery(id,index,enabled)});}
 catch(error){return Response.json({error:(error as Error).message},{status:400});}
}
