import {saveCopy,CopySaveError} from '@/lib/save-copy';
export const maxDuration=300;
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Foreign origin is not allowed.'},{status:403});
 try{return Response.json(await saveCopy(await request.json()));}
 catch(error){return error instanceof CopySaveError?Response.json({error:error.message,job:error.job},{status:error.status}):Response.json({error:(error as Error).message},{status:400});}
}
