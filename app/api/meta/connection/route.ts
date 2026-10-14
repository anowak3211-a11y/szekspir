import {connectionStatus,saveMetaToken,metaAccounts} from '@/lib/meta-client';
import {requireUploaderAuth,uploaderBody,uploaderError} from '@/lib/meta-upload-http';
export const runtime='nodejs';
export async function GET(request:Request){try{requireUploaderAuth(request);return Response.json(await connectionStatus(),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:uploaderError(e)},{status:401});}}
export async function POST(request:Request){try{const b=await uploaderBody(request);if(b.action!=='connect')throw Error('Unknown action.');await saveMetaToken(b.token);return Response.json({...(await connectionStatus()),accounts:await metaAccounts()},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:uploaderError(e)},{status:400});}}
