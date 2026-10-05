const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=fs.readFileSync('lib/localize.ts','utf8');
const start=source.indexOf('async function complete('),end=source.indexOf('function criticModel',start);
assert.ok(start>=0&&end>start);
let request;
class OpenAI{constructor(){this.chat={completions:{create:async body=>{request=body;return {choices:[{message:{content:'OK'}}]};}}};}}
const context={OpenAI,process:{env:{}},Error};vm.createContext(context);
vm.runInContext(ts.transpileModule(source.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,context);
(async()=>{
 for(const model of ['', 'gpt-6-sol','gpt-6-sol-2026-09-01']){await context.complete('openai',model,'system','user');assert.equal(request.model,model||'gpt-6-sol');assert.equal(request.reasoning_effort,'low');}
 await context.complete('openai','gpt-5.6-sol','system','user');assert.equal(request.reasoning_effort,'none');
 await context.complete('openai','gpt-4o-mini','system','user');assert.equal(request.reasoning_effort,undefined);
 await context.complete('custom','gpt-6-sol','system','user');assert.equal(request.reasoning_effort,undefined);
 const ui=fs.readFileSync('app/szekspir/workspace.tsx','utf8');assert.ok(ui.includes("useState('gpt-6-sol')"));assert.ok(ui.includes('GPT-6 Sol · Low effort'));
 console.log('PASS GPT-6 Sol defaults to low; legacy/custom request settings preserved');
})().catch(e=>{console.error(e);process.exitCode=1;});
