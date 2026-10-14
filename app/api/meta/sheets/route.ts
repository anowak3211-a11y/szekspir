import {readUploadSheet,uploadSheetTabs} from '@/lib/meta-upload-sheets';
import {requireUploaderAuth,uploaderError} from '@/lib/meta-upload-http';
export const maxDuration=60;
export async function GET(request:Request){try{requireUploaderAuth(request);const tab=new URL(request.url).searchParams.get('tab');return Response.json(tab?await readUploadSheet(tab):{tabs:await uploadSheetTabs()},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:uploaderError(e)},{status:400});}}
