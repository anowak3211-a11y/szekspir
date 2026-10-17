import {accountRoute} from '@/lib/account-route';
import {driveUploadTarget} from '@/lib/drive-video';
import {driveStatusError} from '@/lib/drive-status';
async function accountGET(){try{await driveUploadTarget();return Response.json({ready:true},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({ready:false,error:driveStatusError(e)},{status:400,headers:{'Cache-Control':'no-store'}});}}

export const GET=accountRoute(accountGET);
