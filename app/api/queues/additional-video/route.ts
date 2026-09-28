import {handleCallback} from '@vercel/queue';
import {advanceAdditionalVideo,additionalVideoPending,scheduleAdditionalVideo} from '@/lib/additional-files';
export const maxDuration=300;
const callback=handleCallback(async({adId,id}:{adId:string;id:string})=>{
 await advanceAdditionalVideo(adId,id);
 if(await additionalVideoPending(adId,id))await scheduleAdditionalVideo(adId,id,20);
});
export async function POST(request:Request){return callback(request);}
