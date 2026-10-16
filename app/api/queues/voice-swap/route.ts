import {handleCallback} from '@vercel/queue';
import {advanceVoiceSwap,scheduleVoiceSwap} from '@/lib/voice-swap';
export const maxDuration=300;
const callback=handleCallback<{id:string}>(async({id})=>{if(await advanceVoiceSwap(id))await scheduleVoiceSwap(id);});
export async function POST(req:Request){return callback(req);}
