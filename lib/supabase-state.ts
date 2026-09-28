// Server-only state transport. No key or payload is returned in error messages.
function config(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw Error('Supabase state storage is not configured');
 const parsed=new URL(url);if(parsed.protocol!=='https:')throw Error('Supabase requires HTTPS');
 return {url:parsed.origin,key};
}
async function rpc(name:string,body:unknown){
 const {url,key}=config();
 // Writes repeat the identical compare-and-swap request, never the provider call.
 const attempts=3;
 for(let attempt=0;attempt<attempts;attempt++){
  let r:Response;
  try{r=await fetch(`${url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:`Bearer ${key}`}:{ }),'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(20000)});}
  catch(e){if(attempt===attempts-1)throw Error('Database connection unavailable. Please try again.');await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));continue;}
  if(r.ok)return r.json();
  if(attempt<attempts-1&&[408,429,500,502,503,504,520,521,522,523,524].includes(r.status)){await r.body?.cancel();await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));continue;}
  throw Error(`Database state request failed (HTTP ${r.status})`);
 }
 throw Error('Database connection unavailable. Please try again.');
}
export async function readDatabaseState(name:string):Promise<{payload:string;version:string}|null>{
 const rows=await rpc('szekspir_state_read',{p_name:name});
 if(!Array.isArray(rows)||rows.length>1)throw Error('Invalid database state response');
 if(!rows.length)return null;
 const row=rows[0];if(typeof row.payload!=='string'||!/^\d+$/.test(row.version))throw Error('Invalid database state record');
 return row;
}
export async function writeDatabaseState(name:string,payload:string,expected?:string){
 if(expected!==undefined&&!/^\d+$/.test(expected))throw Error('Invalid database state version');
 const version=await rpc('szekspir_state_write',{p_name:name,p_payload:payload,p_expected:expected??null});
 if(version===null){
  // A lost response may hide a successful first attempt. Exact encrypted payload
  // equality proves this write committed; a different value is a real conflict.
  const current=await readDatabaseState(name);
  if(current?.payload===payload)return {etag:current.version};
  const error=Error('Concurrent state update');error.name='BlobPreconditionFailedError';throw error;
 }
 if(typeof version!=='string'||!/^\d+$/.test(version))throw Error('Invalid database state version');
 return {etag:version};
}
