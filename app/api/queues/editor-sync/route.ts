import {handleCallback} from '@vercel/queue';
import {syncEditorWorkspace} from '@/lib/editor-sync';
export const maxDuration=300;
const callback=handleCallback(async()=>{await syncEditorWorkspace();});

export async function POST(request:Request){return callback(request);}
