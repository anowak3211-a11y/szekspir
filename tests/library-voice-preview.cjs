const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
let voice={voice_id:'savedVoice',preview_url:'https://provider.example/fresh-sample.mp3'},getCalls=0,downloadCalls=[],downloadError;
let sample={buffer:Buffer.from('ID3existing saved sample'),contentType:'application/octet-stream'};
const load=Module._load;
Module._load=function(name,parent,main){
 if(name==='./elevenlabs'&&parent?.filename.endsWith('library-voice-preview.ts'))return {getVoice:async id=>{assert.equal(id,'savedVoice');getCalls++;return voice;},generateVO:()=>{throw Error('A free preview must never generate audio');}};
 if(name==='./safe-fetch'&&parent?.filename.endsWith('library-voice-preview.ts'))return {safeDownload:async(...args)=>{downloadCalls.push(args);if(downloadError)throw downloadError;return sample;}};
 if(name.startsWith('@/'))name=path.join(root,name.slice(2));
 return load.call(this,name,parent,main);
};
const {GET}=require('../app/api/voices/preview/route.ts');
const originalNow=Date.now;let now=originalNow();Date.now=()=>now;const expire=()=>{now+=300001;};
(async()=>{
 let r=await GET(new Request('https://app.example/api/voices/preview?voiceId=savedVoice'));
 assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'audio/mpeg');assert.equal(r.headers.get('cache-control'),'private, max-age=300');assert.equal(Buffer.from(await r.arrayBuffer()).toString(),sample.buffer.toString());
 assert.equal(getCalls,1);assert.equal(downloadCalls[0][0],voice.preview_url);assert.equal(downloadCalls[0][1],10*1024*1024);assert.ok(downloadCalls[0][3]<=Date.now()+30000);
 // A warm sample avoids both metadata and file downloads; expiry refreshes it.
 voice={...voice,preview_url:'https://provider.example/refreshed.mp3'};
 r=await GET(new Request('https://app.example/api/voices/preview?voiceId=savedVoice'));assert.equal(r.status,200);assert.equal(getCalls,1);assert.equal(downloadCalls.length,1);
 expire();r=await GET(new Request('https://app.example/api/voices/preview?voiceId=savedVoice'));assert.equal(r.status,200);assert.equal(getCalls,2);assert.equal(downloadCalls[1][0],voice.preview_url);
 r=await GET(new Request('https://app.example/api/voices/preview?voiceId=../secret'));assert.equal(r.status,400);assert.equal(getCalls,2);
 expire();sample={buffer:Buffer.from('<Error>secret provider response</Error>'),contentType:'audio/mpeg'};
 r=await GET(new Request('https://app.example/api/voices/preview?voiceId=savedVoice'));assert.equal(r.status,502);assert.doesNotMatch(await r.text(),/secret provider/);
 voice={...voice,preview_url:null};const before=downloadCalls.length;
 r=await GET(new Request('https://app.example/api/voices/preview?voiceId=savedVoice'));assert.equal(r.status,502);assert.equal(downloadCalls.length,before);
 voice={...voice,preview_url:'https://provider.example/refreshed.mp3'};downloadError=Error('Private signed URL or credential in a download error');
 r=await GET(new Request('https://app.example/api/voices/preview?voiceId=savedVoice'));assert.equal(r.status,502);assert.doesNotMatch(await r.text(),/Private|credential/);
 // Only a selected-voice metadata GET is added; paid generation remains separate.
 const source=fs.readFileSync(path.join(root,'lib/elevenlabs.ts'),'utf8');
 const method=source.slice(source.indexOf('export async function getVoice'),source.indexOf('export async function listVoices'));
 assert.match(method,/\/voices\/\$\{encodeURIComponent\(voiceId\)\}/);assert.doesNotMatch(method,/text-to-speech|method:\s*['"]POST/);
 console.log('PASS free library preview: warm-cache reuse and expiry, same-origin audio, bounded public download, invalid/error/no-sample guards; no paid generation');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{Date.now=originalNow;});
