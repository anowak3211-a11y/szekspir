import {driveUploadTarget} from '@/lib/drive-video';
export async function GET(){try{await driveUploadTarget();return Response.json({ready:true},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
