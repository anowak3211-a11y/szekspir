export type FinishReceipt = {forced?:boolean; ok?: boolean; checks?: {ok:boolean}[]};
export function canCloseFinishedTab(result: FinishReceipt) {
  return result.forced === true || result.ok === true && !!result.checks?.length && result.checks.every(check => check.ok);
}
export function closeWorkTab(id:string,basePath='/szekspir',queued=false){
 let channel:BroadcastChannel|undefined;
 try{channel=new BroadcastChannel('szekspir-finished-tabs');channel.postMessage({type:'close-work-tab',id});}catch{}
 try{window.open('','_self');window.close();}catch{}
 try{window.close();}catch{}
 setTimeout(()=>{channel?.close();window.location.replace(basePath+(queued?'?publishing=':'?finished=')+encodeURIComponent(id));},300);
}
export function closeFinishedTab(id:string,basePath='/szekspir'){closeWorkTab(id,basePath);}
