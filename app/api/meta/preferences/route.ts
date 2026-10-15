import {readPreferences,savePreferences} from '@/lib/meta-uploader-preferences';
import {requireUploaderAuth,uploaderBody,uploaderError} from '@/lib/meta-upload-http';
export async function GET(request:Request){try{requireUploaderAuth(request);return Response.json(await readPreferences(new URL(request.url).searchParams.get('account')),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:uploaderError(e)},{status:400});}}
export async function POST(request:Request){try{const b=await uploaderBody(request);return Response.json(await savePreferences(b.account,b.settings));}catch(e){return Response.json({error:uploaderError(e)},{status:400});}}
