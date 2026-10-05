const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const {indexedDB}=require('fake-indexeddb');
const storage=new Map(),locks=new Set();
const navigator={locks:{request:async(name,options,fn)=>{if(locks.has(name))return fn(null);locks.add(name);try{return await fn({name});}finally{locks.delete(name);}}}};
function load(file,deps={},extras={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module,exports:module.exports,require:n=>{if(n in deps)return deps[n];throw Error('Unmocked dependency '+n);},indexedDB,navigator,localStorage:{getItem:key=>storage.get(key)},setTimeout,clearTimeout,AbortSignal,Error,File,Blob,...extras});return module.exports;}
const drafts=load('lib/upload-drafts.ts');
async function scenario(failAt){
 const id='recovery-'+failAt,file=new File(['test-video'],'test.mp4',{type:'video/mp4'});
 await drafts.saveUploadDraft({id,name:file.name,fileName:file.name,market:'uk',settings:{voiceId:'original-voice',editorId:'original-editor'},video:true,startedAt:123},file);
 let decoded=0,failed=false,mutations=0;const uploads=[],posts=[],jobs=new Map();
 const deps={'./file-fingerprint':{fingerprintFile:async()=> 'a'.repeat(64)},'./upload-drafts':drafts,'./audio':{extractAudioAsMp3:async()=>{decoded++;return new File(['audio'],'audio.mp3',{type:'audio/mpeg'});}},'./media-upload':{uploadMedia:async(path,file,progress)=>{uploads.push(path);progress(74);if(!failed&&failAt==='audio'&&path.endsWith('audio.mp3')){failed=true;throw Error('offline');}return {url:'https://media.test/'+path};}}};
 const fetch=async(url,options)=>{if(url==='/api/uploads/check')return Response.json({ok:true});const input=JSON.parse(options.body);posts.push(input);if(!jobs.has(input.id)){jobs.set(input.id,input);mutations++;}if(!failed&&failAt==='save'){failed=true;throw Error('response lost');}return Response.json({job:jobs.get(input.id)});};
 await assert.rejects(load('lib/resume-upload.ts',deps,{fetch}).resumeUpload(id,()=>{}));
 assert.ok(await drafts.readUploadDraft(id));
 // Recreate runtime closures: only IndexedDB remains from the previous tab.
 await load('lib/resume-upload.ts',deps,{fetch}).resumeUpload(id,()=>{});
 assert.equal(decoded,1);assert.equal(uploads.filter(p=>p.endsWith('source.mp4')).length,1);
 assert.equal(uploads.filter(p=>p.endsWith('audio.mp3')).length,failAt==='audio'?2:1);
 assert.ok(posts.every(p=>p.id===id&&p.voiceId==='original-voice'&&p.editorId==='original-editor'));
 assert.equal(mutations,1);assert.equal(await drafts.readUploadDraft(id),undefined);assert.equal(await drafts.readUploadMedia(id,'file'),undefined);assert.equal(await drafts.readUploadMedia(id,'audio'),undefined);
}
(async()=>{await scenario('audio');await scenario('save');
 const runner=load('lib/resume-upload.ts',{'./upload-drafts':drafts,'./media-upload':{uploadMedia:()=>{throw Error('Must not upload');}}});
 await assert.rejects(runner.resumeUpload('missing',()=>{}),/No local recovery copy/);
 locks.add('szekspir-upload-active');await assert.rejects(runner.resumeUpload('active',()=>{}),/already active/);
 await drafts.saveUploadDraft({id:'cancelled',name:'Cancelled',market:'uk',settings:{},video:false,startedAt:1,sourceUrl:'https://media.test/v'});storage.set('szekspir-cancelled-cancelled','1');await assert.rejects(runner.resumeUpload('cancelled',()=>{}),/Cancelled/);
 console.log('PASS: IndexedDB recovery across runtimes; original file/settings/UUID and completed media reused; lost response creates one job; cleanup and concurrent tab/cancellation guards.');
})().catch(e=>{console.error(e);process.exitCode=1});
