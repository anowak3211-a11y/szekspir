const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app/szekspir/workspace.tsx','utf8');
const start=source.indexOf(' useEffect(()=>{const p=job?.publication;');
const end=source.indexOf('\n\n const [sheetDelivery',start);
assert(start>=0&&end>start);
const effect=source.slice(start,end).replace(/document\.querySelector<HTMLTextAreaElement>/g,'document.querySelector');
function scenario({status='complete',dirty=false,note='',editing=false,receipt={ok:true,checks:[{ok:true}]}}={}){
 const timers=[],closed=[],messages=[];let cleanup;
 const context={job:{id:'job',result:{uk_script:'saved',hooks:[]},publication:{token:'token',status,receipt}},loaded:{current:'job'},script:dirty?'unsaved':'saved',hooks:[],editingScript:editing,closingPublication:{current:''},basePath:'/szekspir',document:{querySelector:()=>({value:note})},JSON,setFinishResult(){},setMessage:x=>messages.push(x),setError(){},canCloseFinishedTab:r=>r.ok&&r.checks.length&&r.checks.every(c=>c.ok),closeFinishedTab:(...x)=>closed.push(x),setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){},useEffect:f=>{cleanup=f();}};
 vm.createContext(context);vm.runInContext(effect,context);
 return {context,timers,closed,messages,cleanup};
}
const restored=scenario();assert.equal(restored.timers.length,1,'Already-completed publication closes after reload without observing queued');restored.timers[0]();assert.equal(restored.closed.length,1);
vm.runInContext(effect,restored.context);assert.equal(restored.timers.length,1,'Same receipt closes only once');
for(const options of [{status:'queued'},{status:'processing'},{status:'blocked'},{dirty:true},{note:'unsaved note'},{editing:true},{receipt:{ok:true,checks:[{ok:false}]}}])assert.equal(scenario(options).timers.length,0,JSON.stringify(options));
const typing=scenario();typing.context.document.querySelector=()=>({value:'new note'});typing.timers[0]();assert.equal(typing.closed.length,0,'Typing during close delay preserves note');
console.log('PASS completed publication auto-closes after reload; pending, failed and unsaved work stay open; no network calls');
