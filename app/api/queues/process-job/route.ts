import {handleCallback} from '@vercel/queue';
import {consumeJob} from '@/lib/jobs';
export const maxDuration=300;
const callback=handleCallback<{id:string}>(async message=>{if(!/^[\w-]{8,100}$/.test(message.id))throw new Error('Invalid job ID');await consumeJob(message.id);});

export async function POST(request:Request){return callback(request);}
