const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const code=ts.transpileModule(fs.readFileSync('lib/resume-upload.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
async function run(responses){const calls=[],waits=[],module={exports:{}};vm.runInNewContext(code,{module,exports:module.exports,require:()=>({}),AbortSignal,Error,TypeError,JSON,Date,setTimeout:(f,ms)=>{waits.push(ms);f();},fetch:async(url,init)=>{calls.push({url,body:init.body});const next=responses.shift();if(next instanceof Error)throw next;return next;}});assert.equal(typeof module.exports.requestUploadStage,'function','Upload timeout must retry the same stage automatically');let value,error;try{value=await module.exports.requestUploadStage('/api/jobs',{id:'same-id'},120000,()=>{},()=>{});}catch(e){error=e;}return{calls,waits,value,error};}
(async()=>{
 let r=await run([Object.assign(Error('signal timed out'),{name:'TimeoutError'}),Response.json({job:{id:'same-id'}})]);assert(!r.error);assert.equal(r.calls.length,2);assert.deepEqual(r.waits,[30000]);assert.equal(r.calls[0].body,r.calls[1].body);
 r=await run([Response.json({error:'signal timed out'},{status:400}),Response.json({job:{id:'same-id'}})]);assert(!r.error);assert.equal(r.calls.length,2);
 r=await run(Array.from({length:3},()=>Response.json({error:'temporarily unavailable'},{status:503})));assert(r.error);assert.equal(r.calls.length,3);assert.deepEqual(r.waits,[30000,60000]);
 for(const status of [401,403,409,422]){r=await run([Response.json({error:'invalid input'},{status})]);assert.equal(r.calls.length,1);assert.equal(r.value.response.status,status);assert.equal(r.waits.length,0);}
 r=await run([Response.json({error:'rate limit'},{status:429,headers:{'Retry-After':'120'}}),Response.json({job:{id:'same-id'}})]);assert(!r.error);assert.deepEqual(r.waits,[120000]);
 console.log('PASS same-ID upload recovery: two delayed retries maximum; server timeout recovery; no retry of permanent errors; Retry-After honoured');
})().catch(e=>{console.error(e);process.exitCode=1});
