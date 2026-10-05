const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file,dependencies){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:n=>dependencies[n]||require(n)});return module.exports;}
const progress=load('lib/progress-view.ts',{});
const Component=load('app/szekspir/components/production-progress.tsx',{'@/lib/progress-view':progress,'./ad-video-preview':()=>null}).default;
const now=Date.now(),upload={name:'test.mp4',stage:'Uploading video · 74%',startedAt:now-600000,updated:now-540000};
const html=renderToStaticMarkup(React.createElement(Component,{upload,lastChecked:now}));
assert.match(html,/Needs attention/);assert.match(html,/Until last upload update/);assert.match(html,/Retry upload/);assert.doesNotMatch(html,/In progress/);assert.match(html,/>1m 0s</);
const fresh=renderToStaticMarkup(React.createElement(Component,{upload:{...upload,updated:now},lastChecked:now}));assert.match(fresh,/In progress/);assert.doesNotMatch(fresh,/Needs attention/);
const job={id:'test-job',name:'Saved',status:'Running',step:'localise',created:now,updated:now,stages:{transcribe:{done:true},localise:{started:now}}};
const saved=renderToStaticMarkup(React.createElement(Component,{job,upload:{...upload,error:'Old upload failed'},lastChecked:now}));assert.doesNotMatch(saved,/Old upload failed|Needs attention|Until last upload update/);
console.log('PASS: stale upload is not shown as running, timer freezes, recovery instructions present, durable job overrides stale browser error.');
