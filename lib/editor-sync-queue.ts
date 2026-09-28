import {send} from '@vercel/queue';
// One-off work only. Recurrence lives in Vercel Cron and follows production.
export async function scheduleEditorSync(){
 const slot=Math.floor(Date.now()/1000);
 await send('szekspir-editor-sync',{kind:'sync'},{region:'iad1',retentionSeconds:600,idempotencyKey:`editor-sync-now-${slot}`});
}
