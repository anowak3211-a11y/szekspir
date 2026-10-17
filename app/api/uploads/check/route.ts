import {accountRoute} from '@/lib/account-route';
import {claimFile,releaseFile,findDuplicateFile,DuplicateFileError} from '@/lib/file-dedup';
export const maxDuration=60;
async function accountPOST(req:Request){
 try{const b=await req.json();if(b.action==='lookup')return Response.json({ok:true,duplicate:await findDuplicateFile(b.hash)},{headers:{'Cache-Control':'no-store'}});if(b.action==='release')await releaseFile(b.hash,b.id);else await claimFile(b.hash,b.id,b.market==='pl'?'pl':'uk');return Response.json({ok:true});}
 catch(e){if(e instanceof DuplicateFileError)return Response.json({duplicate:e.duplicate},{status:409});return Response.json({error:(e as Error).message},{status:400});}
}

export const POST=accountRoute(accountPOST);
