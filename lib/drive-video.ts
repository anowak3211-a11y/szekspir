import {google} from 'googleapis';
import {Readable} from 'node:stream';
import {sheetAuth} from './sheets';
import {openVideoStream} from './stream-media';
import {MEDIA_LIMIT} from './media';
import type {Job} from './jobs';
function driveClient(){
 const {GOOGLE_DRIVE_CLIENT_ID:clientId,GOOGLE_DRIVE_CLIENT_SECRET:clientSecret,GOOGLE_DRIVE_REFRESH_TOKEN:refreshToken}=process.env;
 if(clientId&&clientSecret&&refreshToken){const auth=new google.auth.OAuth2(clientId,clientSecret);auth.setCredentials({refresh_token:refreshToken});return google.drive({version:'v3',auth});}
 return google.drive({version:'v3',auth:sheetAuth()});
}
export async function driveUploadTarget(){
 const folderId=process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID;
 if(!folderId||!/^[-\w]+$/.test(folderId))throw Error('Google Drive is not connected yet. Configure the video folder before choosing Send to Drive.');
 const drive=driveClient();const {data:folder}=await drive.files.get({fileId:folderId,supportsAllDrives:true,fields:'id,mimeType,driveId,capabilities(canAddChildren)'});
 if(folder.mimeType!=='application/vnd.google-apps.folder'||!folder.capabilities?.canAddChildren)throw Error('The app cannot upload to the selected Google Drive folder.');
 if(!folder.driveId&&!process.env.GOOGLE_DRIVE_REFRESH_TOKEN)throw Error('Connect your Google account to upload to My Drive. The Sheets service account requires a Shared Drive.');
 return {drive,folderId};
}
export async function saveOriginalToDrive(job:Job,rememberId:(id:string)=>Promise<void>){
 const {drive,folderId}=await driveUploadTarget();
 let id=job.driveFileId;
 if(!id){id=(await drive.files.generateIds({count:1,space:'drive'})).data.ids?.[0];if(!id)throw Error('Drive did not allocate a file ID');await rememberId(id);}
 let exists=false;
 try{const f=await drive.files.get({fileId:id,supportsAllDrives:true,fields:'id,size,trashed'});exists=!f.data.trashed&&Number(f.data.size)>0;if(!exists)throw Error('The saved Drive video was deleted or is empty.');}catch(e){if(Number((e as {code?:number}).code)!==404)throw e;}
 if(!exists){
  const source=await openVideoStream(job.resolvedVideoUrl||job.sourceUrl);let total=0,first=true;
  const mime=String(source.headers['content-type']||'video/mp4').split(';')[0];
  const body=Readable.from((async function*(){for await(const piece of source){const b=Buffer.from(piece);if(first){first=false;if(!mime.startsWith('video/')&&!b.subarray(4,12).includes(Buffer.from('ftyp')))throw Error('The source is not a video file');}total+=b.length;if(total>MEDIA_LIMIT)throw Error('Video exceeds the 2 GB limit');yield b;}if(!total)throw Error('Empty video file');})());
  const ext=mime.includes('webm')?'webm':mime.includes('quicktime')?'mov':'mp4';
  try{await drive.files.create({supportsAllDrives:true,requestBody:{id,name:`${job.id}-${job.name.replace(/[^\p{L}\p{N} ._-]/gu,'').slice(0,100)}.${ext}`,parents:[folderId],appProperties:{szekspirJobId:job.id}},media:{mimeType:mime.startsWith('video/')?mime:'video/mp4',body},fields:'id'},{timeout:230000,retry:false});}finally{body.destroy();source.destroy();}
 }
 const permissions=(await drive.permissions.list({fileId:id,supportsAllDrives:true,fields:'permissions(type,role)'})).data.permissions||[];
 if(!permissions.some(p=>p.type==='anyone'))await drive.permissions.create({fileId:id,supportsAllDrives:true,requestBody:{type:'anyone',role:'reader',allowFileDiscovery:false}});
 return `https://drive.google.com/file/d/${id}/view`;
}
