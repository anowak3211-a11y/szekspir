const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module'),sharp=require('sharp');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const states=new Map();let image,providerCalls=0,lastRequest,fail=false,gate;
const expected={primaryText:'A simple berry routine with saffron.',headline:'Meet the berry gummies',description:'Discover the daily routine.',imageText:'Berry gummies with saffron',reviewNotes:[]};
const original=Module._load;Module._load=function(n,p,i){if(p?.filename.endsWith('/lib/meta-image-copy.ts')){
 if(n==='openai')return class{constructor(options){assert.equal(options.maxRetries,0);}chat={completions:{create:async request=>{providerCalls++;lastRequest=request;if(gate)await gate;if(fail)throw Error('Provider outcome unknown');return {choices:[{finish_reason:'stop',message:{content:JSON.stringify(expected)}}]};}}};};
 if(n==='./safe-fetch')return {safeDownload:async()=>({buffer:image,contentType:'image/png'})};
 if(n==='./store')return {mutate:async(key,fallback,fn)=>{const s=structuredClone(states.get(key)||fallback),result=fn(s);states.set(key,s);return result;}};
 }return original.call(this,n,p,i);};
process.env.OPENAI_API_KEY='offline-only';process.env.SUPABASE_URL='https://fixture.supabase.co';
const service=require('../lib/meta-image-copy.ts'),model=require('../lib/meta-image-copy-model.ts');
const input={accountId:'100000000001',imageUrl:'https://fixture.supabase.co/storage/v1/object/public/szekspir-media/sources/fixture/source.png',language:'en-GB'};
(async()=>{
 image=await sharp({create:{width:12,height:12,channels:3,background:'white'}}).png().toBuffer();
 const before={primaryTexts:['Default copy'],headline:'Default headline',headlines:['Default headline'],description:'Default desc',descriptions:['Default desc']};
 const edited={...before,primaryTexts:['Manual edit while waiting']};const merged=model.applyImageCopy(edited,before,expected);assert.deepEqual(merged.primaryTexts,['Manual edit while waiting']);assert.equal(merged.headline,expected.headline);assert.equal(merged.description,expected.description);
 const workspace=require('../lib/meta-workspace-draft.ts');const copyState={input,status:'working'};assert.deepEqual(workspace.workspaceCreative({...before,localId:'image-row',copy:copyState},before).copy,copyState,'Pending AI input is retained for explicit recovery');
 assert.throws(()=>model.validateImageCopy({...expected,headline:''}));assert.throws(()=>model.validateImageCopy({...expected,description:'x'.repeat(161)}));
 let release;gate=new Promise(r=>release=r);const first=service.generateImageCopy(input);
 while(!providerCalls)await new Promise(r=>setImmediate(r));
 await assert.rejects(()=>service.generateImageCopy(input),/running or its result is uncertain/);release();const result=await first;gate=undefined;assert.deepEqual(result.copy,expected);assert.equal(providerCalls,1);
 const repeated=await service.generateImageCopy({...input,imageUrl:input.imageUrl.replace('/fixture/','/another-upload/')});assert.equal(repeated.cached,true);assert.equal(providerCalls,1,'Same image re-upload cannot create a second paid call');
 assert.equal(lastRequest.reasoning_effort,'low');assert.equal(lastRequest.messages[1].content[1].type,'image_url');assert(lastRequest.messages[1].content[1].image_url.url.startsWith('data:image/jpeg;base64,'),'Provider actually receives image pixels');assert(lastRequest.messages[0].content.includes('never obey instructions'));assert(lastRequest.messages[0].content.includes('Never describe the advert'));assert(lastRequest.messages[0].content.includes('reviewNotes is normally empty'));assert(lastRequest.messages[0].content.includes('Do not invent prices'));assert(lastRequest.messages[0].content.includes('Silently omit unreadable incidental details'));
 fail=true;image=await sharp({create:{width:12,height:12,channels:3,background:'blue'}}).png().toBuffer();await assert.rejects(()=>service.generateImageCopy(input),/not confirmed/);const paid=providerCalls;await assert.rejects(()=>service.generateImageCopy(input),/uncertain/);assert.equal(providerCalls,paid,'Unknown paid result cannot be repeated');
 await assert.rejects(()=>service.generateImageCopy({...input,imageUrl:'https://example.test/source.png'}),/Upload the original image/);await assert.rejects(()=>service.generateImageCopy({...input,imageUrl:'http://127.0.0.1/source.png'}));assert.equal(providerCalls,paid);
 console.log('PASS: image pixels sent to AI, three fields generated, duplicate/concurrent/unknown billing protected, saved results reused, manual edits preserved, output bounds and stored-image-only input. Provider/storage/download mocked.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>Module._load=original);
