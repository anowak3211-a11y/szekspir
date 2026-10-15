import {editorInstruction} from '@/lib/editor-instruction';
export const maxDuration=60;
export async function POST(req:Request){
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'Use this action from Szekspir.'},{status:403});
 try{const {note}=await req.json();return Response.json({instruction:await editorInstruction(note)});}catch(e){return Response.json({error:(e as Error).message},{status:400});}
}
