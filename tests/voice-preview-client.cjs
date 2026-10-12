const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.tsx']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,f);
const slots=[],effects=[];let slot=0,effect=0,instances=[],timers=new Map(),nextTimer=0;
const load=Module._load;
Module._load=function(name,parent,main){
 if(name==='react')return {useRef:value=>{const i=slot++;return slots[i]??=( {current:value} );},useState:value=>{const i=slot++;if(!(i in slots))slots[i]=value;return [slots[i],next=>{slots[i]=next;}];},useEffect:(fn,deps)=>{const i=effect++,prev=effects[i];if(!prev||deps.some((v,j)=>v!==prev.deps[j])){prev?.cleanup?.();effects[i]={deps,cleanup:fn()};}}};
 if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 return load.call(this,name,parent,main);
};
global.Audio=class{constructor(url){this.url=url;this.currentTime=0;this.paused=true;this.loads=0;instances.push(this);}load(){this.loads++;}removeAttribute(name){if(name==='src')this.url='';}async play(){this.paused=false;}pause(){this.paused=true;}};
const originalTimeout=global.setTimeout,originalClear=global.clearTimeout;
global.setTimeout=(fn,ms)=>{const id=++nextTimer;timers.set(id,{fn,ms});return id;};global.clearTimeout=id=>timers.delete(id);
const Preview=require('../app/szekspir/components/voice-preview.tsx').default;
const render=props=>{slot=0;effect=0;return Preview(props);};
const button=tree=>tree.props.children[0];
(async()=>{
 let tree=render({voiceId:'voiceA',url:'https://stale.example/sample.mp3'});assert.equal(button(tree).props.disabled,false);assert.equal(instances.length,1);assert.equal(instances[0].preload,'auto');assert.equal(instances[0].loads,1);
 await button(tree).props.onClick();let a=instances.at(-1);assert.equal(a.url,'/api/voices/preview?voiceId=voiceA');tree=render({voiceId:'voiceA',url:'https://stale.example/sample.mp3'});assert.match(button(tree).props.children,/Loading/);a.onplaying();assert.equal([...timers.values()][0].ms,3000);
 // Switching the voice stops the old take; a late old error cannot stop the new one.
 const oldError=a.onerror,oldEnded=a.onended;tree=render({voiceId:'voiceB'});tree=render({voiceId:'voiceB'});assert.equal(a.paused,true);assert.equal(timers.size,0);await button(tree).props.onClick();let b=instances.at(-1);oldError();assert.equal(b.paused,false);oldEnded();assert.equal(b.paused,false);
 b.onplaying();const timer=[...timers.values()][0];timer.fn();assert.equal(b.paused,true);assert.equal(timers.size,0);
 tree=render({voiceId:'voiceB'});await button(tree).props.onClick();assert.equal(instances.at(-1),b,'replay reuses preloaded audio');tree=render({voiceId:'voiceB'});await button(tree).props.onClick();assert.equal(b.paused,true,'loading can be cancelled');b.onplaying();assert.equal(timers.size,0,'late playback cannot restart cancelled preview');
 tree=render({});assert.equal(button(tree).props.disabled,true);
 for(const e of effects)e?.cleanup?.();
 console.log('PASS free preview client: preload on voice choice, cached replay, truthful loading state and cancellation, 3-second stop, voice-switch and late-event cleanup');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.setTimeout=originalTimeout;global.clearTimeout=originalClear;});
