'use client';
export class UploaderWait extends Error{constructor(message:string,public retryAfterSeconds:number,public kind:string){super(message);this.name='UploaderWait';}}
const reads=new Map<string,Promise<any>>();
export async function uploaderRequest(path:string,body?:unknown){
 if(body===undefined&&reads.has(path))return reads.get(path)!;
 const task=(async()=>{
  // Retry only reads. Never replay a publication, OAuth or settings write.
  const until=Date.now()+30000;
  for(let attempt=0;;attempt++){
   const r=await fetch(path,{cache:'no-store',method:body===undefined?'GET':'POST',headers:body===undefined?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)}),d=await r.json();
   if(r.ok)return d;
   if(d.kind==='queue_wait'||d.kind==='provider_limit'){
    const seconds=Math.max(1,Number(d.retryAfterSeconds)||2);
    if(body===undefined&&d.kind==='queue_wait'&&seconds<=5&&attempt<10&&Date.now()+seconds*1000<=until){await new Promise(resolve=>setTimeout(resolve,seconds*1000+100));continue;}
    throw new UploaderWait(d.error||'Waiting for Meta.',seconds,d.kind);
   }
   throw Error(d.error||'Could not confirm the operation.');
  }
 })();if(body===undefined)reads.set(path,task);
 try{return await task;}finally{if(reads.get(path)===task)reads.delete(path);}
}
