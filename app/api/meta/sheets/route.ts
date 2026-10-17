import {accountRoute} from '@/lib/account-route';
import {readUploadSheet,uploadSheetTabs} from '@/lib/meta-upload-sheets';
import {requireUploaderAuth,uploaderError} from '@/lib/meta-upload-http';
export const maxDuration=60;
async function accountGET(request:Request){try{requireUploaderAuth(request);const tab=new URL(request.url).searchParams.get('tab');return Response.json(tab?await readUploadSheet(tab):{tabs:await uploadSheetTabs()},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:uploaderError(e)},{status:400});}}

export const GET=accountRoute(accountGET);
