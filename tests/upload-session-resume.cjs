const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const code=ts.transpileModule(fs.readFileSync('lib/media-upload.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
(async()=>{let opts,resumed;const module={exports:{}};
 const valid={size:100,metadata:{objectName:'sources/job/source.mp4',bucketName:'media'},uploadUrl:'https://storage.test/uploads/partial'};
 vm.runInNewContext(code,{module,exports:module.exports,URL,AbortSignal,setInterval:()=>1,clearInterval:()=>{},setTimeout:()=>2,clearTimeout:()=>{},require:n=>n==='tus-js-client'?{Upload:class{constructor(f,o){opts=o;}async findPreviousUploads(){return [{...valid,uploadUrl:'https://other.test/session'},valid];}resumeFromPreviousUpload(p){resumed=p;}start(){opts.onSuccess();}async abort(){}}}:{},fetch:async()=>({ok:true,json:async()=>({backend:'supabase',path:'sources/job/source.mp4',bucket:'media',endpoint:'https://storage.test/upload',url:'https://media.test/complete'})})});
 await module.exports.uploadMedia('sources/job/source.mp4',{size:100,type:'video/mp4'});assert.equal(resumed,valid);assert.equal(opts.storeFingerprintForResuming,true);assert.equal(await opts.fingerprint(),'szekspir:media:sources/job/source.mp4:100:video/mp4');
 console.log('PASS: resumes matching TUS session only; foreign-origin session rejected; fingerprint isolates the job and media path.');
})().catch(e=>{console.error(e);process.exitCode=1});
