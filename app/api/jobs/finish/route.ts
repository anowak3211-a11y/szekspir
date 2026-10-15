import {requestPublication} from '@/lib/publish-job';
export const maxDuration=60;
export async function POST(request:Request){try{
 const {id,script,hooks,force,dualVoice}=await request.json();
 if(typeof id!=='string'||!/^[-\w]{8,100}$/.test(id))throw Error('Invalid job ID');
 return Response.json(await requestPublication(id,script,hooks,force===true,dualVoice),{status:202});
}catch(error){return Response.json({error:(error as Error).message},{status:400});}}
