const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const code=ts.transpileModule(fs.readFileSync('lib/media-upload.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
async function scenario(complete,backend='supabase'){
 let now=0,poll,opts,aborted=0,verifications=0;const module={exports:{}};
 vm.runInNewContext(code,{module,exports:module.exports,require:n=>n==='tus-js-client'?{Upload:class{constructor(f,o){opts=o;}findPreviousUploads(){return Promise.resolve([]);}start(){opts.onProgress(74,100);}abort(){aborted++;return Promise.resolve();}}}:{upload:async(p,f,o)=>{opts={onProgress:()=>o.onUploadProgress({percentage:74})};opts.onProgress();return new Promise((resolve,reject)=>o.abortSignal.addEventListener('abort',()=>{aborted++;reject(Error('aborted'));}));}},Date:{now:()=>now},AbortSignal,AbortController,Error,Promise,setInterval:fn=>(poll=fn,1),clearInterval:()=>{},setTimeout:()=>2,clearTimeout:()=>{},fetch:async(u,o)=>{const action=JSON.parse(o.body).action;if(action==='verify')verifications++;return {ok:true,json:async()=>action==='sign'?{backend,url:'https://media.test/file'}:{complete}};}});
 const result=module.exports.uploadMedia('sources/test/source.mp4',{size:100,type:'video/mp4'}).then(value=>({value}),error=>({error}));
 await new Promise(setImmediate);now=119000;opts.onProgress(74,100);poll();await new Promise(setImmediate);assert.equal(aborted,0);
 now=120001;poll();await new Promise(setImmediate);const outcome=await result;
 if(complete&&backend==='supabase')assert.equal(outcome.value.url,'https://media.test/file');else assert.match(outcome.error.message,/no data moved for two minutes/);
 assert.equal(aborted,1);assert.equal(verifications,backend==='supabase'?1:0);
}
(async()=>{await scenario(false);await scenario(true);await scenario(false,'blob');console.log('PASS: 74% stall times out, repeated same progress cannot hide stall, ambiguous completed upload recovers, both backends abort.');})().catch(e=>{console.error(e);process.exitCode=1});
