import {generateImageCopy} from '@/lib/meta-image-copy';
import {uploaderBody,uploaderFailure} from '@/lib/meta-upload-http';
export const maxDuration=180;
export async function POST(request:Request){try{return Response.json(await generateImageCopy(await uploaderBody(request)),{headers:{'Cache-Control':'no-store'}});}catch(error){return uploaderFailure(error);}}
