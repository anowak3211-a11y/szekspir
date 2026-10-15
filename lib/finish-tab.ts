export type FinishReceipt = {forced?:boolean; ok?: boolean; checks?: {ok:boolean}[]};
export function canCloseFinishedTab(result: FinishReceipt) {
  return result.forced === true || result.ok === true && !!result.checks?.length && result.checks.every(check => check.ok);
}
export function closeWorkTab(id:string,basePath='/szekspir',queued=false){
 // Closing a queued tab must never cancel work or claim delivery succeeded.
 let channel:BroadcastChannel|undefined;
 try{channel=new BroadcastChannel('szekspir-finished-tabs');channel.postMessage({type:'close-work-tab',id});}catch{}
 window.close();
 setTimeout(()=>{channel?.close();window.location.replace(basePath+(queued?'?publishing=':'?finished=')+encodeURIComponent(id));},350);
}
export function closeFinishedTab(id:string,basePath='/szekspir'){closeWorkTab(id,basePath);}
