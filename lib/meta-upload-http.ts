import {authorised} from './auth';
import {MetaBudgetWait} from './meta-rate-limit';
import {MetaError} from './meta-client';
export function requireUploaderAuth(request:Request){if(!authorised(request.headers.get('authorization')))throw Error('Auth required.');if(request.method!=='GET'){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw Error('Invalid origin.');}}
export function uploaderError(error:unknown){if(error instanceof MetaError&&error.code===100&&error.subcode===1885183)return 'Meta app is in Development mode (100/1885183). Publish the Meta app as Live, then resume with saved media IDs. No replacement upload is needed.';const message=error instanceof Error?error.message:'Request could not be completed.';if(/private_key|client_secret|authorization|bearer|EAA[A-Za-z0-9]{15}/i.test(message))return 'Connection failed. Check the uploader settings.';return message.replace(/https?:\/\/\S+/g,'[link]').slice(0,500);}
export function uploaderFailure(error:unknown){
 const wait=error instanceof MetaBudgetWait,meta=error instanceof MetaError,retry=wait?error.retryAfterSeconds:meta?error.retryAfterSeconds:undefined;
 const status=wait?503:meta&&error.rateLimited?429:meta&&error.transient?502:error instanceof Error&&error.message==='Auth required.'?401:400;
 return Response.json({error:uploaderError(error),kind:wait?'queue_wait':meta&&error.rateLimited?'provider_limit':meta?'provider_error':'validation',reason:wait?error.reason:undefined,retryAfterSeconds:retry,retryAt:retry?Date.now()+retry*1000:undefined,code:meta?error.code:undefined,subcode:meta?error.subcode:undefined},{status,headers:{'Cache-Control':'no-store',...(retry?{'Retry-After':String(retry)}:{})}});
}
export async function uploaderBody(request:Request){requireUploaderAuth(request);if(!request.headers.get('content-type')?.startsWith('application/json'))throw Error('Use a JSON request.');if(Number(request.headers.get('content-length'))>3_000_000)throw Error('Request too large.');const raw=await request.text();if(raw.length>3_000_000)throw Error('Request too large.');return JSON.parse(raw);}
