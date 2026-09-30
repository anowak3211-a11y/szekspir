import {addEditorComment} from '@/lib/editor-comment';
export const maxDuration=300;
export async function POST(request:Request){try{const {id,comment}=await request.json();return Response.json(await addEditorComment(id,comment));}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
