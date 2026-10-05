const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const states=new Map([['jobs',{ids:['old-one-123','old-two-123','old-one-123']}]]),jobs=new Map(),claims=[];let downloads=0;
class DuplicateFileError extends Error{constructor(duplicate){super('duplicate');this.duplicate=duplicate;}}
const deps={
 '@/lib/jobs':{getJob:async id=>jobs.get(id)},
 '@/lib/store':{readState:async(k,d)=>({value:states.get(k)||d}),mutate:async(k,d,fn)=>{const s=states.get(k)||d;const r=fn(s);states.set(k,s);return r;}},
 '@/lib/hash-remote-file':{hashRemoteFile:async url=>{downloads++;assert.match(url,/\/source\.mp4$/);return {hash:'a'.repeat(64),bytes:123};}},
 '@/lib/file-dedup':{DuplicateFileError,claimFile:async(...args)=>claims.push(args)}
};const moduleOut={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/uploads/backfill/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:moduleOut,exports:moduleOut.exports,require:n=>deps[n],Response,Set});
const {GET,POST}=moduleOut.exports,post=async id=>(await POST({json:async()=>({id})})).json();
(async()=>{
 assert.equal((await (await GET()).json()).jobs.length,2);
 jobs.set('old-one-123',{id:'old-one-123',market:'uk',sourceUrl:'https://storage.example/sources/old-one-123/source.mp4'});
 assert.equal((await post('old-one-123')).status,'indexed');assert.equal(downloads,1);assert.equal(claims[0][3],true);
 assert.equal((await post('old-one-123')).status,'indexed');assert.equal(downloads,1);
 jobs.set('old-two-123',{sourceUrl:'https://storage.example/sources/old-two-123/audio.mp3',resolvedVideoUrl:'https://storage.example/cleaned.mp4'});
 assert.equal((await post('old-two-123')).status,'unavailable');assert.equal(downloads,1);
 jobs.set('cancelled-123',{cancelledAt:123,sourceUrl:'https://storage.example/sources/x/source.mp4'});assert.equal((await post('cancelled-123')).status,'unavailable');assert.equal(downloads,1);
 console.log('PASS old-history index is sequential and unique; retained originals indexed; cached fingerprints reused; extracted/processed/missing/cancelled sources excluded');
})().catch(e=>{console.error(e);process.exitCode=1});
