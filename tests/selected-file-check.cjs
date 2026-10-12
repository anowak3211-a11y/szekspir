const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict');
function load(file,deps={},extra={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:n=>{if(n in deps)return deps[n];throw Error('Unexpected dependency '+n);},Date,AbortSignal,Response,URL,Error,...extra});return module.exports;}
(async()=>{
 const hash='a'.repeat(64),states=new Map(),reads=[];let writes=0;
 const store={readState:async(k,fallback)=>{reads.push(k);return {value:states.get(k)??fallback};},mutate:()=>{writes++;throw Error('Selection must not mutate storage');}};
 const dedup=load('lib/file-dedup.ts',{'./store':store});
 assert.equal(await dedup.findDuplicateFile(hash),undefined);
 states.set('source-sha256-'+hash,{claim:{id:'saved-ad',market:'pl',committed:true,until:0}});
 states.set('job-saved-ad',{adId:'MEL-00123'});
 let result=await dedup.findDuplicateFile(hash);assert.equal(result.id,'saved-ad');assert.equal(result.adId,'MEL-00123');assert.equal(result.market,'pl');assert.equal(writes,0);
 states.set('job-saved-ad',{cancelledAt:1});assert.equal(await dedup.findDuplicateFile(hash),undefined);
 states.delete('job-saved-ad');states.set('source-sha256-'+hash,{claim:{id:'pending-ad',market:'uk',committed:false,until:0}});assert.equal(await dedup.findDuplicateFile(hash),undefined);
 states.get('source-sha256-'+hash).claim.until=Date.now()+60000;assert.equal((await dedup.findDuplicateFile(hash)).id,'pending-ad');
 await assert.rejects(dedup.findDuplicateFile('invalid'),/Invalid file fingerprint/);
 const route=load('app/api/uploads/check/route.ts',{'@/lib/file-dedup':dedup});
 const reply=await route.POST(new Request('http://test/api/uploads/check',{method:'POST',body:JSON.stringify({action:'lookup',hash})}));assert.equal(reply.status,200);assert.equal(reply.headers.get('cache-control'),'no-store');assert.equal((await reply.json()).duplicate.id,'pending-ad');assert.equal(writes,0);
 const calls=[],progress=[];let response=Response.json({ok:true,duplicate:{id:'saved-ad',adId:'MEL-00123',market:'pl'}});
 const check=load('lib/selected-file-check.ts',{'./file-fingerprint':{fingerprintFile:async(file,report,signal)=>{signal.throwIfAborted();report(100);return hash;}}},{fetch:async(url,options)=>{calls.push({url,...options});return response;}}).checkSelectedFile;
 const controller=new AbortController();result=await check(new Blob(['same bytes']),controller.signal,n=>progress.push(n));assert.equal(result.status,'ready');assert.equal(result.hash,hash);assert.equal(result.duplicate.adId,'MEL-00123');assert.deepEqual(progress,[100]);assert.equal(calls.length,1);assert.equal(calls[0].url,'/api/uploads/check');assert.deepEqual(JSON.parse(calls[0].body),{action:'lookup',hash});assert.equal(calls[0].cache,'no-store');
 response=Response.json({ok:true});result=await check(new Blob(['new bytes']),controller.signal);assert.equal(result.duplicate,undefined);
 response=Response.json({error:'Session expired'},{status:401});await assert.rejects(check(new Blob(),controller.signal),/Session expired/);
 response=Response.json({});await assert.rejects(check(new Blob(),controller.signal),/Could not check/);
 const cancelled=new AbortController();cancelled.abort();const count=calls.length;await assert.rejects(check(new Blob(),cancelled.signal));assert.equal(calls.length,count);
 assert.equal(writes,0);console.log('PASS: selection-time lookup is read-only; known/cross-market/pending/cancelled/expired files, cache bypass, errors and cancellation; only a fingerprint is sent, no upload/job/provider calls.');
})().catch(error=>{console.error(error);process.exitCode=1;});
