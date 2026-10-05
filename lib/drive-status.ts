// Only return fixed messages; Google errors may contain request credentials.
export function driveStatusError(error:unknown){
 const e=error as {message?:string;code?:string|number;response?:{status?:number;data?:{error?:unknown}}};
 const detail=String(e?.message||'')+' '+JSON.stringify(e?.response?.data?.error||'');
 const status=Number(e?.response?.status||e?.code);
 if(/invalid_grant|invalid_rapt|expired or revoked/i.test(detail))return 'Google Drive access has expired or was revoked. Reconnect the Google account, then check again.';
 if(/invalid_client|unauthorized_client/i.test(detail))return 'Google Drive OAuth configuration is invalid. Ask the administrator to reconnect Google Drive.';
 if(/Configure the video folder/i.test(detail))return 'Google Drive video folder is not configured. Ask the administrator to set the upload folder.';
 if(/Shared Drive/i.test(detail))return 'My Drive requires a connected Google account. A service account can only upload to a Shared Drive.';
 if(status===404)return 'The configured Drive folder cannot be found or is not accessible to the connected account.';
 if(status===403||/cannot upload/i.test(detail))return 'The connected account cannot upload to the Drive folder. Check folder permissions and Google Drive access.';
 if(status===429||status>=500||/timeout|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(detail))return 'Google Drive is temporarily unavailable. Please check the connection again.';
 if(status===401)return 'Google Drive authentication failed. Reconnect the Google account, then check again.';
 return 'Google Drive connection could not be verified. Check again; if it persists, ask the administrator to check the Google connection.';
}
