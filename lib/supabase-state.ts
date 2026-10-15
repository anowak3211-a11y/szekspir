// Server-only state transport. No key or payload is returned in error messages.
function config(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw Error('Supabase state storage is not configured');
 const parsed=new URL(url);if(parsed.protocol!=='https:')throw Error('Supabase requires HTTPS');
 return {url:parsed.origin,key};
}
async function transport(path:string,body:unknown,operation:'read'|'write'){
 const {url,key}=config();
 // Writes repeat the identical compare-and-swap request, never the provider call.
 const attempts=3;
 for(let attempt=0;attempt<attempts;attempt++){
  let r:Response;
  try{r=await fetch(`${url}/rest/v1/${path}`,{method:body===undefined?'GET':'POST',headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:`Bearer ${key}`}:{ }),'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(20000)});
   if(r.ok)return await r.json();
  }
  catch(e){
   const code=(e as {cause?:{code?:string}})?.cause?.code;
   const reason=['ECONNRESET','ETIMEDOUT','ENOTFOUND','EAI_AGAIN','UND_ERR_CONNECT_TIMEOUT'].includes(code||'')?code:(e as Error)?.name==='TimeoutError'?'timeout':e instanceof SyntaxError?'invalid_response':'network_or_response';
   console.warn('state_transport_retry',{operation,attempt:attempt+1,reason});
   if(attempt===attempts-1)throw Error('Database connection unavailable. Please try again.');await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));continue;
  }
  console.warn('state_transport_status',{operation,attempt:attempt+1,status:r.status});
  if(attempt<attempts-1&&[408,429,500,502,503,504,520,521,522,523,524].includes(r.status)){await r.body?.cancel();await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));continue;}
  throw Error(`Database state request failed (HTTP ${r.status})`);
 }
 throw Error('Database connection unavailable. Please try again.');
}
function rpc(name:string,body:unknown){return transport('rpc/'+name,body,name==='szekspir_state_write'?'write':'read');}
export async function readDatabaseStates(names:string[]):Promise<Map<string,{payload:string;version:string}>>{
 const unique=[...new Set(names)];
 if(unique.length>20||unique.some(name=>! /^[A-Za-z0-9_-]{1,200}$/.test(name)))throw Error('Invalid database read batch');
 if(!unique.length)return new Map();
 const query=new URLSearchParams({select:'name,payload,version',name:`in.(${unique.join(',')})`});
 const rows=await transport('szekspir_state?'+query,undefined,'read');
 if(!Array.isArray(rows)||rows.length>unique.length)throw Error('Invalid database state batch');
 const result=new Map<string,{payload:string;version:string}>();
 for(const row of rows){const version=String(row.version);if(!unique.includes(row.name)||result.has(row.name)||typeof row.payload!=='string'||!/^\d+$/.test(version))throw Error('Invalid database state record');result.set(row.name,{payload:row.payload,version});}
 return result;
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

export async function databaseStateVersion(name:string):Promise<string|undefined>{
 if(!/^[A-Za-z0-9_-]{1,200}$/.test(name))throw Error('Invalid state name');
 const rows=await transport('szekspir_state?'+new URLSearchParams({select:'version',name:'eq.'+name}),undefined,'read');
 if(!Array.isArray(rows)||rows.length>1)throw Error('Invalid state version response');
 if(!rows.length)return;const version=String(rows[0].version);if(!/^\d+$/.test(version))throw Error('Invalid state version');return version;
}
