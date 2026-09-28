export type FinishReceipt = {ok?: boolean; checks?: {ok:boolean}[]};
export function canCloseFinishedTab(result: FinishReceipt) {
  return result.ok === true && !!result.checks?.length && result.checks.every(check => check.ok);
}
export function closeFinishedTab(id: string) {
  // Ask the upload page, which owns the Window handle, to close its child.
  const channel = new BroadcastChannel('szekspir-finished-tabs');
  channel.postMessage({type:'finished',id});
  window.close();
  setTimeout(() => {
    channel.close();
    // Manually opened/restored tabs may not be script-closable.
    window.location.replace('/szekspir?finished='+encodeURIComponent(id));
  }, 700);
}
