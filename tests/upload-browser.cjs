// Local-only manual browser smoke test. No production APIs or paid providers.
const http=require('node:http'),fs=require('node:fs'),ts=require('typescript');
const compile=file=>ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const drafts=compile('lib/upload-drafts.ts'),runner=compile('lib/resume-upload.ts');
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Offline upload recovery check</title><style>body{font:18px system-ui;max-width:800px;margin:60px auto}button{padding:16px;margin:10px}pre{white-space:pre-wrap}</style><h1>Offline upload recovery check</h1><p>Synthetic file only. No production API calls.</p><button id="prepare">Prepare local recovery copy</button><button id="resume">Resume after page reload</button><pre id="output">Loading local drafts…</pre><script>
const modules={};let module={exports:{}};let exports=module.exports;
${drafts}
modules['./upload-drafts']=module.exports;
modules['./media-upload']={uploadMedia:async(path,file,progress)=>{progress(100);return {url:'https://offline.invalid/'+path};}};
modules['./audio']={extractAudioAsMp3:async()=>new File(['synthetic audio'],'audio.mp3',{type:'audio/mpeg'})};
modules['./file-fingerprint']={fingerprintFile:async()=> 'a'.repeat(64)};
const require=name=>{if(!modules[name])throw Error('Unexpected dependency '+name);return modules[name];};
// Restrict all runner requests to an in-memory save. No network request occurs.
const fetch=async(url,options)=>{if(url==='/api/uploads/check')return Response.json({ok:true});if(url!=='/api/jobs')throw Error('Unexpected request');return Response.json({job:JSON.parse(options.body)});};
module={exports:{}};exports=module.exports;
${runner}
const api=module.exports,db=modules['./upload-drafts'];
const output=document.getElementById('output');
async function show(){const list=await db.listUploadDrafts();output.textContent='Saved drafts: '+list.length+'\\n'+list.map(d=>d.name+' · '+d.id).join('\\n');}
document.getElementById('prepare').onclick=async()=>{try{await db.saveUploadDraft({id:'local-browser-recovery',name:'Synthetic recovery test',fileName:'test.mp4',market:'uk',settings:{voiceoverEnabled:false},startedAt:Date.now(),video:true},new File(['synthetic video'],'test.mp4',{type:'video/mp4'}));await show();output.textContent+='\\nReload this page, then Resume.';}catch(e){output.textContent=e.message;}};
document.getElementById('resume').onclick=async()=>{try{await api.resumeUpload('local-browser-recovery',(id,s)=>{output.textContent=s.stage;});await show();output.textContent+='\\nPASS: recovered the synthetic file and removed the completed backup.';}catch(e){output.textContent='FAIL: '+e.message;}};
show().catch(e=>{output.textContent=e.message;});
</script></html>`;
http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);}).listen(3219,'127.0.0.1',()=>console.log('Offline recovery test: http://127.0.0.1:3219'));
