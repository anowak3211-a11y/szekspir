// Run ONLY after maintenance deployment and draining old executions. Never deletes Blob.
const fs=require('fs'),path=require('path'),ts=require('typescript');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
const {list,get}=require('@vercel/blob');
const {readDatabaseState,writeDatabaseState}=require('../lib/supabase-state.ts');
async function main(){
 if(process.env.STATE_MAINTENANCE!=='1'||!process.argv.includes('--writers-drained'))throw Error('Maintenance and drained writers must be confirmed');
 const backup=process.env.STATE_BACKUP_DIR;if(!backup||!path.isAbsolute(backup))throw Error('Set an absolute STATE_BACKUP_DIR outside the deployed project');
 fs.mkdirSync(backup,{recursive:true,mode:0o700});
 let cursor,count=0;const names=[];
 do{
  const page=await list({prefix:'state-v2/',cursor,token:process.env.STATE_READ_WRITE_TOKEN});
  for(const item of page.blobs){
   if(!/^state-v2\/[\w-]+\.bin$/.test(item.pathname))throw Error('Unexpected state filename');
   const blob=await get(item.pathname,{access:'private',token:process.env.STATE_READ_WRITE_TOKEN,useCache:false});if(!blob||blob.statusCode!==200)throw Error('Missing source record');
   const bytes=Buffer.from(await new Response(blob.stream).arrayBuffer());
   const name=item.pathname.slice(9,-4);fs.writeFileSync(path.join(backup,name+'.bin'),bytes,{mode:0o600});
   const payload=bytes.toString('base64'),old=await readDatabaseState(name);
   if(old&&old.payload!==payload)throw Error('Destination differs; refusing overwrite: '+name);
   if(!old)await writeDatabaseState(name,payload);
   const check=await readDatabaseState(name);if(check?.payload!==payload)throw Error('Verification failed: '+name);
   names.push(name);count++;
  }
  cursor=page.hasMore?page.cursor:undefined;
 }while(cursor);
 if(!names.includes('jobs')||!names.includes('sheet-allocations'))throw Error('Essential source records missing');
 fs.writeFileSync(path.join(backup,'manifest.json'),JSON.stringify({at:new Date().toISOString(),count,names},null,2),{mode:0o600});
 console.log(`Verified ${count} encrypted state records. Blob originals retained. Backend has NOT been switched.`);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
