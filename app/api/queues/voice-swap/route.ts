import {handleCallback} from '@/lib/account-queue';
import {getVoiceSwap,advanceVoiceSwap,scheduleVoiceSwap} from '@/lib/voice-swap';
export const maxDuration=300;
const callback=handleCallback<{id:string}>(async({id})=>{if(await advanceVoiceSwap(id)){const job=await getVoiceSwap(id);await scheduleVoiceSwap(id,job.stage==='enhance'&&job.delivery?.taskId?60:0);}});
export async function POST(req:Request){return callback(req);}
