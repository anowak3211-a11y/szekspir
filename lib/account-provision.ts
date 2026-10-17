import {createHash} from 'node:crypto';
import {google} from 'googleapis';
import {driveClient} from './drive-video';
import {sheetAuth} from './sheets';
import {inOwnerWorkspace} from './account-context';
import {workspaceById,reserveWorkspace,updateWorkspace,type UserWorkspace} from './account-repository';
import {withEditorLocks} from './editor-locks';
import {EDITOR_WORKSPACES} from './editor-workspaces';
/** Structural templates only: copy sheet names and header rows, never existing adverts or employee records. */
async function createSheet(user:UserWorkspace,part:string,title:string,templateId:string){
 const {drive}=await driveClient(),tag=user.id+':'+part;
 const existing=(await drive.files.list({q:`trashed = false and appProperties has { key='szekspirWorkspacePart' and value='${tag}' }`,fields:'files(id)',supportsAllDrives:true,includeItemsFromAllDrives:true,pageSize:2})).data.files||[];
 if(existing.length>1)throw Error('Znaleziono podwójny arkusz. Administrator musi sprawdzić zestaw.');
 let id=existing[0]?.id||undefined;
 if(!id){const file=await drive.files.create({supportsAllDrives:true,requestBody:{name:title,mimeType:'application/vnd.google-apps.spreadsheet',parents:[user.folderId!],appProperties:{szekspirWorkspacePart:tag}},fields:'id'},{timeout:30000,retry:false});id=file.data.id!;if(!id)throw Error('Drive nie potwierdził utworzenia arkusza. Wznów konfigurację, żeby sprawdzić zapis.');}
 if(user.files[part]===id)return id;
 const sheets=google.sheets({version:'v4',auth:sheetAuth()});
 let source:import('googleapis').sheets_v4.Schema$Sheet[];
 let headerData:import('googleapis').sheets_v4.Schema$ValueRange[];
 if(part==='products'){
  source=[{properties:{sheetId:0,title:'Products'}}];
  headerData=[{range:"'Products'!A1:D1",values:[['Product','Filename','Markdown','Updated']]}];
 }else{
  try{source=(await sheets.spreadsheets.get({spreadsheetId:templateId,fields:'sheets(properties)'})).data.sheets||[];}catch(e){throw Error('Nie można odczytać szablonu arkusza '+part+' (Google '+String((e as {code?:number}).code||'error')+').');}
  headerData=(await sheets.spreadsheets.values.batchGet({spreadsheetId:templateId,ranges:source.map(s=>"'"+s.properties!.title!.replace(/'/g,"''")+"'!A1:AZ1")})).data.valueRanges||[];
 }
 let current:import('googleapis').sheets_v4.Schema$Sheet[]=[];for(let attempt=0;;attempt++){try{current=(await sheets.spreadsheets.get({spreadsheetId:id,fields:'sheets(properties)'})).data.sheets||[];break;}catch(e){if(Number((e as {code?:number}).code)===404&&attempt<2){await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));continue;}throw Error('Nowy arkusz '+part+' nie jest dostępny dla konta obsługującego Sheets (Google '+String((e as {code?:number}).code||'error')+'). Wznów konfigurację tym samym e-mailem.');}}
 const requests:import('googleapis').sheets_v4.Schema$Request[]=[];
 for(const sheet of source){const props=sheet.properties!;const match=current.find(s=>s.properties?.sheetId===props.sheetId);if(match){if(match.properties?.title!==props.title)requests.push({updateSheetProperties:{properties:{sheetId:props.sheetId,title:props.title},fields:'title'}});}else requests.push({addSheet:{properties:{title:props.title,sheetId:props.sheetId,gridProperties:{rowCount:Math.max(1000,props.gridProperties?.rowCount||1000),columnCount:Math.max(52,props.gridProperties?.columnCount||52),frozenRowCount:1}}}});}
 for(const sheet of current)if(!source.some(s=>s.properties?.sheetId===sheet.properties?.sheetId))requests.push({deleteSheet:{sheetId:sheet.properties!.sheetId!}});
 if(requests.length)await sheets.spreadsheets.batchUpdate({spreadsheetId:id,requestBody:{requests}});
 if(user.files[part]!==id){const data=headerData.filter(r=>r.values?.length).map(r=>({range:r.range!,values:r.values!}));if(data.length)await sheets.spreadsheets.values.batchUpdate({spreadsheetId:id,requestBody:{valueInputOption:'RAW',data}});}
 await updateWorkspace(user.id,u=>{u.files[part]=id!;});return id;
}
export async function provisionWorkspace(email:string,name:string,employeeNames:string[]){return inOwnerWorkspace(async()=>{
 let user=await reserveWorkspace(email.trim().toLowerCase(),name,employeeNames.filter(n=>n.trim()).map(name=>({name:name.trim()})));
 return withEditorLocks(['provision-'+user.id],async()=>{
  user=(await workspaceById(user.id))!;if(!user)throw Error('Nie znaleziono zestawu użytkownika.');if(user.state==='ready')return user;
  const {drive}=await driveClient();
  if(!user.folderId){const parent=process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID;if(!parent)throw Error('Najpierw podłącz folder Drive administratora.');const q=`trashed = false and appProperties has { key='szekspirWorkspace' and value='${user.id}' }`;const found=(await drive.files.list({q,fields:'files(id)',supportsAllDrives:true,includeItemsFromAllDrives:true,pageSize:2})).data.files||[];if(found.length>1)throw Error('Podwójny folder użytkownika wymaga sprawdzenia.');const folder=found[0]|| (await drive.files.create({supportsAllDrives:true,requestBody:{name:'Szekspir · '+user.name,mimeType:'application/vnd.google-apps.folder',parents:[parent],appProperties:{szekspirWorkspace:user.id}},fields:'id'},{timeout:30000,retry:false})).data;if(!folder.id)throw Error('Drive nie potwierdził folderu.');user=await updateWorkspace(user.id,u=>{u.folderId=folder.id!;});}
  const serviceEmail=(await sheetAuth().getCredentials()).client_email;
  if(serviceEmail){const permissions=(await drive.permissions.list({fileId:user.folderId!,supportsAllDrives:true,fields:'permissions(emailAddress,role)'})).data.permissions||[];if(!permissions.some(p=>p.emailAddress===serviceEmail))await drive.permissions.create({fileId:user.folderId!,supportsAllDrives:true,sendNotificationEmail:false,requestBody:{type:'user',role:'writer',emailAddress:serviceEmail}});}
  const admin=await createSheet(user,'admin',user.name+' · Admin Sheet',process.env.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY');
  const products=await createSheet(user,'products',user.name+' · Produkty',process.env.SPREADSHEET_ID!);
  const editors:import('./account-context').EmployeeWorkspace[]=[];for(const [index,employee] of [{name:'Ja (admin)'},...user.employees].entries()){const id=index?'employee-'+index:'mine',sheetId=await createSheet(user,id,user.name+' · '+employee.name,EDITOR_WORKSPACES[0].sheetId);editors.push({id,name:employee.name,sheetId});}
  // Only the user's folder is shared; the parent folder and other users' files stay private.
  const permissions=(await drive.permissions.list({fileId:user.folderId!,supportsAllDrives:true,fields:'permissions(emailAddress,role)'})).data.permissions||[];
  if(!permissions.some(p=>p.emailAddress?.toLowerCase()===user.email))await drive.permissions.create({fileId:user.folderId!,supportsAllDrives:true,sendNotificationEmail:false,requestBody:{type:'user',role:'writer',emailAddress:user.email}});
  user=await updateWorkspace(user.id,u=>{u.values.ADMIN_SHEET_ID=admin;u.values.SPREADSHEET_ID=products;u.values.GOOGLE_DRIVE_VIDEO_FOLDER_ID=u.folderId!;u.editors=editors;u.state='ready';});return user;
 });
});}

export async function addWorkspaceEmployee(id:string,name:unknown){return inOwnerWorkspace(async()=>{if(typeof name!=='string'||!name.trim()||name.length>100)throw Error('Podaj nazwę pracownika.');return withEditorLocks(['provision-'+id],async()=>{const user=await workspaceById(id);if(!user||user.state!=='ready'||user.editors.length>=21)throw Error('Zestaw nie jest gotowy lub osiągnął limit 20 pracowników.');const old=user.editors.find(e=>e.name===name.trim());if(old)return user;const part='employee-'+createHash('sha256').update(name.trim()).digest('hex').slice(0,16);const sheetId=await createSheet(user,part,user.name+' · '+name,user.editors[0].sheetId);return updateWorkspace(id,u=>{u.editors.push({id:part,name:name.trim(),sheetId});});});});}
