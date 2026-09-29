const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
const memory=new Map(),processing={mode:'gentle',normalize:false};let calls=0,fail=false,lastPace,lastProcessing,lastText;
const script='This is one complete sentence with enough words to speak naturally. '.repeat(8);
const job={duration:30,transcript:script,result:{uk_script:script},voiceId:'jodi',voTiming:{trimmedSeconds:36,processing}};
const real=Module._load;Module._load=function(n,p,i){
 if(n==='@/lib/jobs')return {getJob:async()=>job};
 if(n==='@/lib/store')return {readState:async(k,d)=>({value:memory.get(k)||d}),mutate:async(k,d,fn)=>{const s=memory.get(k)||d;memory.set(k,s);return fn(s);}};
 if(n==='@/lib/elevenlabs')return {generateVO:async(t,v,save,p,k,m,pace)=>{calls++;lastPace=pace;lastProcessing=p;lastText=t;assert.equal(pace.speed,1.2);assert.equal(p.ambience,'none');if(fail)throw Error('Lost response');await save(new ArrayBuffer(3),{trimmedSeconds:14});return new ArrayBuffer(4);}};
 if(n==='@/lib/media')return {putMedia:async p=>'https://sample.test/'+p};
 if(n.startsWith('@/lib/'))return real.call(this,require('path').resolve(__dirname,'../lib',n.slice(6)+'.ts'),p,i);
 return real.call(this,n,p,i);
};
const {POST}=require('../app/api/vo/source-preview/route.ts');
const request=(script,variant)=>new Request('https://test/preview',{method:'POST',body:JSON.stringify({id:'saved-job-1',script,variant,voiceId:'jodi',processing:{...processing,ambience:'car'}})});
(async()=>{
 const [a,b]=await Promise.all([POST(request(script)),POST(request(script))]);assert.equal(calls,1);assert([a.status,b.status].includes(200));
 const cached=await POST(request(script));assert.equal(cached.status,200);assert.equal(calls,1);
 const fast=await POST(request(script,'faster'));assert.equal(fast.status,200);assert.equal(calls,2);assert.equal(lastPace.previewDelivery,'faster');
 await POST(request(script,'faster'));assert.equal(calls,2);await POST(request(script));assert.equal(calls,2,'Original cached take remains available');
 const breath=await POST(request(script,'breaths30'));assert.equal(breath.status,200);assert.equal(calls,3);assert.equal(lastProcessing.breaths,true);assert.equal(lastProcessing.mode,'gentle');assert(lastText.split(/\s+/).length>=75);await POST(request(script,'breaths30'));assert.equal(calls,3);
 fail=true;await POST(request(script+' One more sentence.'));await POST(request(script+' One more sentence.'));assert.equal(calls,4,'Ambiguous generation never repeats');
 console.log('PASS preview concurrency, replay cache, separate no-ambience output, interrupted paid request not repeated');
})().catch(e=>{console.error(e);process.exitCode=1});
