import {handleCallback} from '@/lib/account-queue';
import {consumeAntki,consumeAntkiLocalized} from '@/lib/antki-work';
export const maxDuration=300;
const callback=handleCallback<{id:string;version?:string}>(async message=>{if(!/^facebook_\d{5,30}$/.test(message.id))throw Error('Invalid Antki ID.');if(message.version==='localized')await consumeAntkiLocalized(message.id);else await consumeAntki(message.id);},{visibilityTimeoutSeconds:600});
export async function POST(request:Request){return callback(request);}
