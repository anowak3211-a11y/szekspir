const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const {indexedDB}=require('fake-indexeddb');
const storage=new Map(),locks=new Set();
const navigator={locks:{request:async(name,options,fn)=>{if(locks.has(name))return fn(null);locks.add(name);try{return await fn({name});}finally{locks.delete(name);}}}};
function load(file,deps={},extras={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module,exports:module.exports,require:n=>{if(n in deps)return deps[n];throw Error('Unmocked dependency '+n);},indexedDB,navigator,localStorage:{getItem:key=>storage.get(key)},setTimeout,clearTimeout,AbortSignal,Error,File,Blob,structuredClone,...extras});return module.exports;}
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
 // Storage failure must not block transfer; fallback keeps files/settings and
 // completed URLs for retries in the same tab, then releases them after save.
 const unavailable=load('lib/upload-drafts.ts',{}, {indexedDB:{open(){throw Error('QuotaExceededError');}}});
 const fallbackFile=new File(['fallback-video'],'fallback.mp4',{type:'video/mp4'});
 const fallbackDraft={id:'fallback',name:fallbackFile.name,fileName:fallbackFile.name,market:'uk',settings:{voiceId:'voice'},video:true,startedAt:1};
 await unavailable.saveUploadDraft(fallbackDraft,fallbackFile);
 assert.equal(unavailable.uploadNeedsOpenTab('fallback'),true);
 assert.equal(await unavailable.readUploadMedia('fallback','file'),fallbackFile);
 assert.equal((await unavailable.listUploadDrafts()).length,1);
 const fallbackAudio=new File(['audio'],'audio.mp3');
 await unavailable.saveUploadAudio(fallbackDraft,fallbackAudio);
 await unavailable.saveUploadDraft({...fallbackDraft,sourceUrl:'https://media.test/already-uploaded'});
 assert.equal(await unavailable.readUploadMedia('fallback','file'),fallbackFile);
 assert.equal(await unavailable.readUploadMedia('fallback','audio'),fallbackAudio);
 assert.equal((await unavailable.readUploadDraft('fallback')).sourceUrl,'https://media.test/already-uploaded');
 await unavailable.removeUploadDraft('fallback');
 assert.equal(unavailable.uploadNeedsOpenTab(),false);
 // A working backup can fail later: original media must remain available.
 let blocked=false;
 const later=load('lib/upload-drafts.ts',{}, {indexedDB:{open(...args){if(blocked)throw Error('storage blocked');return indexedDB.open(...args);}}});
 await later.saveUploadDraft({...fallbackDraft,id:'later'},fallbackFile);blocked=true;
 await later.saveUploadDraft({...fallbackDraft,id:'later',sourceHash:'hash'});
 assert.equal(await later.readUploadMedia('later','file'),fallbackFile);
 await later.removeUploadDraft('later');
 console.log('PASS: unavailable browser backup allows same-tab recovery; files, audio and completed URLs preserved; temporary references released.');
 console.log('PASS: IndexedDB recovery across runtimes; original file/settings/UUID and completed media reused; lost response creates one job; cleanup and concurrent tab/cancellation guards.');
})().catch(e=>{console.error(e);process.exitCode=1});
