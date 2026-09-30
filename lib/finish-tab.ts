export type FinishReceipt = {forced?:boolean; ok?: boolean; checks?: {ok:boolean}[]};
export function canCloseFinishedTab(result: FinishReceipt) {
  return result.forced === true || result.ok === true && !!result.checks?.length && result.checks.every(check => check.ok);
}
export function closeFinishedTab(id: string,basePath='/szekspir') {
  // Ask the upload page, which owns the Window handle, to close its child.
  const channel = new BroadcastChannel('szekspir-finished-tabs');
  channel.postMessage({type:'finished',id});
  window.close();
  setTimeout(() => {
    channel.close();
    // Manually opened/restored tabs may not be script-closable.
    window.location.replace(basePath+'?finished='+encodeURIComponent(id));
  }, 700);
}
