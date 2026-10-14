import {handleCallback} from '@vercel/queue';
import {consumeAntki} from '@/lib/antki-work';
export const maxDuration=300;
export const POST=handleCallback<{id:string}>(async message=>{if(!/^facebook_\d{5,30}$/.test(message.id))throw Error('Invalid Antki ID.');await consumeAntki(message.id);},{visibilityTimeoutSeconds:600});
