import {consumePublication} from '@/lib/publish-job';
import {handleCallback} from '@/lib/account-queue';
import {syncEditorWorkspace} from '@/lib/editor-sync';
export const maxDuration=300;
const callback=handleCallback<{kind?:string;id?:string;token?:string}>(async message=>{if(message.kind==='publish'){if(!message.id||!/^[-\w]{8,100}$/.test(message.id)||!message.token)throw Error('Invalid publication');await consumePublication(message.id,message.token);}else await syncEditorWorkspace();},{visibilityTimeoutSeconds:600});

export async function POST(request:Request){return callback(request);}
