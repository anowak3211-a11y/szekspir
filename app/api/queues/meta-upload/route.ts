import {handleCallback} from '@vercel/queue';
import {consumeMetaUpload} from '@/lib/meta-uploader';
export const maxDuration=300;
const callback=handleCallback<{id:string;batchId:string;dispatchToken?:string}>(async message=>{await consumeMetaUpload(message.id,message.batchId,message.dispatchToken);},{visibilityTimeoutSeconds:600});
export async function POST(request:Request){return callback(request);}
