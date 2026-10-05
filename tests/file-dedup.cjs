const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
function load(file,deps={},extra={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module,exports:module.exports,require:n=>{if(n in deps)return deps[n];throw Error('Unexpected dependency '+n);},Date,setTimeout,clearTimeout,AbortSignal,Uint8Array,File,Blob,...extra});return module.exports;}
(async()=>{
 const sha=await import('@noble/hashes/sha2.js');const {fingerprintFile}=load('lib/file-fingerprint.ts',{'@noble/hashes/sha2.js':sha});
 const bytes=Buffer.alloc(9*1024*1024,73),f=new File([bytes],'first.mp4');
 const hash=await fingerprintFile(f);assert.equal(hash,createHash('sha256').update(bytes).digest('hex'));
 assert.equal(await fingerprintFile(new File([bytes],'renamed.mov')),hash);
 bytes[bytes.length-1]=74;assert.notEqual(await fingerprintFile(new File([bytes],'first.mp4')),hash);
 const states=new Map();const store={readState:async(k,d)=>({value:structuredClone(states.get(k)??d)}),mutate:async(k,d,fn)=>{const s=structuredClone(states.get(k)??d);const r=fn(s);states.set(k,s);return r;}};
 const api=load('lib/file-dedup.ts',{'./store':store});
 const claims=await Promise.allSettled([api.claimFile(hash,'first-job','uk'),api.claimFile(hash,'second-job','uk')]);assert.equal(claims.filter(c=>c.status==='fulfilled').length,1);
 await api.claimFile(hash,'first-job','uk',true);await api.claimFile(hash,'first-job','uk',true);
 states.set('job-first-job',{adId:'MEL-00111'});
 await assert.rejects(api.claimFile(hash,'third-job','uk'),e=>e.duplicate.adId==='MEL-00111');
 await api.releaseFile(hash,'first-job');await assert.rejects(api.claimFile(hash,'third-job','uk'),api.DuplicateFileError);
 states.set('job-first-job',{cancelledAt:1});await api.claimFile(hash,'third-job','uk');await api.releaseFile(hash,'third-job');await api.claimFile(hash,'fourth-job','uk');
 const pending=states.get('source-sha256-'+hash);pending.claim.until=0;await api.claimFile(hash,'fifth-job','uk',true);await assert.rejects(api.claimFile(hash,'fourth-job','uk',true),api.DuplicateFileError);
 const {indexedDB}=require('fake-indexeddb'),drafts=load('lib/upload-drafts.ts',{}, {indexedDB});const id='duplicate-upload';
 await drafts.saveUploadDraft({id,name:'same.mp4',fileName:'same.mp4',video:true,market:'uk',settings:{},startedAt:1},f);
 let calls=[],reports=[];const runner=load('lib/resume-upload.ts',{'./upload-drafts':drafts,'./file-fingerprint':{fingerprintFile:async()=>hash},'./media-upload':{uploadMedia:()=>{throw Error('Duplicate must not upload');}}},{navigator:{locks:{request:async(n,o,fn)=>fn({})}},localStorage:{getItem:()=>null},fetch:async url=>{calls.push(url);return Response.json({duplicate:{id:'first-job',market:'uk'}},{status:409});}});
 await runner.resumeUpload(id,(_,s)=>reports.push(s));assert.deepEqual(calls,['/api/uploads/check']);assert.equal(reports.at(-1).duplicate.id,'first-job');assert.equal(await drafts.readUploadDraft(id),undefined);assert.equal(await drafts.readUploadMedia(id,'file'),undefined);
 console.log('PASS: whole-file SHA-256, rename invariance, last-byte change; atomic reservation, retry, expiry, cancellation, saved-job protection; duplicate removes only new local draft before audio/upload/job creation.');
})().catch(e=>{console.error(e);process.exitCode=1});
