/** Only Google Sheets throttling is safe to defer here, never an ambiguous paid request. */
export function isSheetsQuotaError(error:unknown){
 const e=error as {message?:string;response?:{config?:{url?:string};status?:number};code?:number};
 const message=String(e?.message||'');
 return /quota exceeded/i.test(message)&&/sheets\.googleapis\.com|Read requests|Write requests/i.test(message)||
  (e?.response?.status===429||e?.code===429)&&/sheets\.googleapis\.com/.test(String(e?.response?.config?.url||''));
}
export function sheetRetryDelay(attempt:number){return Math.min(300000,60000*2**Math.max(0,attempt-1));}
export const SHEET_QUOTA_WAIT='Google Sheets is temporarily busy. Saved files are safe; the sheet update will retry automatically.';
