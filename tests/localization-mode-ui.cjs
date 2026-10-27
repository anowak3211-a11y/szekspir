const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const Choice=require('../app/szekspir/components/localization-mode.tsx').default;
const css=fs.readFileSync('app/globals.css','utf8');
for(const polish of [true,false])for(const disabled of [true,false]){
 const html=renderToStaticMarkup(React.createElement(Choice,{value:'close',onChange:()=>{},polish,disabled}));
 assert.equal((html.match(/type="radio"/g)||[]).length,3);assert.match(html,/<legend>/);assert.match(html,/checked="" value="close"/);
 assert.equal((html.match(/class="localization-mode-option"/g)||[]).length,3);
 assert.match(html,/Gemini rip/);
 assert(!html.includes('class="cta-choices"'),'Child layout must not depend on parent-scoped styled-jsx rules');
 if(disabled)assert.match(html,/<fieldset[^>]+disabled=""/);
}
console.log('PASS standalone UK/PL mode cards, checked native radio and disabled fieldset; no parent scoped-style dependency');
if(process.argv.includes('--preview')){
 const markup=renderToStaticMarkup(React.createElement('main',{className:'wrap'},React.createElement('section',{className:'vopanel'},React.createElement('h2',null,'Call to action'),React.createElement('p',null,'Choose how the script ends. Applies to every file in this upload.'),React.createElement(Choice,{value:'close',onChange:()=>{}}))));
 require('node:http').createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Desktop localisation mode check</title><style>'+css+'</style>'+markup+'</html>');}).listen(3222,'127.0.0.1',()=>console.log('Desktop preview: http://127.0.0.1:3222'));
}
