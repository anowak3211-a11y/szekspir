import {finalise} from '@/lib/jobs';
export const maxDuration=300;
export async function POST(req:Request){try{const {url,name}=await req.json();if(!/^[\w-]{8,100}$/.test(name))throw new Error('Valid job name required');return Response.json({url:await finalise(url,name)});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
