const assert=require('assert/strict'),fs=require('fs'),ts=require('typescript'),Module=require('module');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,n);
const state=new Map(),load=Module._load;Module._load=function(n,p,i){if(n==='./store')return {readState:async(k,initial)=>({value:state.get(k)||initial}),mutate:async(k,initial,fn)=>{const s=state.get(k)||structuredClone(initial);state.set(k,s);return fn(s);}};return load.call(this,n,p,i)};
const {withEditorLocks}=require('../lib/editor-locks.ts');const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let active=0,max=0;await Promise.all(['a','b'].map(id=>withEditorLocks([id],async()=>{max=Math.max(max,++active);await pause(50);active--;})));assert.equal(max,2,'Independent workspaces overlap');
 active=0;max=0;await Promise.all([1,2,3].map(()=>withEditorLocks(['shared'],async()=>{max=Math.max(max,++active);await pause(30);active--;})));assert.equal(max,1,'Same workspace waits without collision');
 let count=0;await Promise.all([['a','b'],['b','a']].map(keys=>withEditorLocks(keys,async()=>{count++;await pause(30)})));assert.equal(count,2,'Opposite transfers cannot deadlock');
 await assert.rejects(()=>withEditorLocks(['release'],async()=>{throw Error('provider error')}),/provider error/);await withEditorLocks(['release'],async()=>{count++});assert.equal(count,3);
 assert([...state.values()].every(s=>!s.token),'Locks released after success/failure');console.log('PASS independent overlap, shared serialization, reversed ordering, failure cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
