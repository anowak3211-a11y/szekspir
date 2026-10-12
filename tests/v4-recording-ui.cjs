const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module'),path=require('node:path');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const real=Module._load;Module._load=function(n,p,...args){return real.call(this,n.startsWith('@/')?path.resolve(n.slice(2)):n,p,...args);};
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),h=React.createElement;
const {v4RecordingSettings,voiceoverCreationSettings}=require('../lib/voice-processing.ts'),{directedNarration}=require('../lib/voice-direction.ts');
const Directions=require('../app/szekspir/components/voice-directions.tsx').default,Background=require('../app/szekspir/components/background-sound.tsx').default,Sample=require('../app/szekspir/components/source-pace.tsx').default,Creation=require('../app/szekspir/components/voice-creation.tsx').default;
const old={mode:'standard',normalize:false,breaths:true,matchSourcePace:false,emotion:'curious',openingReaction:'sighs',ambience:'car'};
const unchanged=JSON.stringify(old),settings=v4RecordingSettings(old);
assert.equal(JSON.stringify(old),unchanged,'Loading the UI must not modify historical recording settings');
assert.equal(settings.mode,'gentle');assert.equal(settings.breaths,false);assert.equal(settings.matchSourcePace,false);assert.equal(settings.emotion,'curious');assert.equal(settings.openingReaction,'sighs');assert.equal(settings.ambience,'car');
assert(!directedNarration('A complete thought with enough words. '.repeat(30),'off','uk',v4RecordingSettings()).includes('[exhales]'),'New native recordings have no synthetic breath cues');
const script='Here is a short sample of the approved script. Choose a voice and listen before recording the full advert.';
const job={id:'offline-ui',duration:93.3,transcript:script+' A final word.',result:{uk_script:script},voiceId:'offline-voice'};
function panel(){return h('main',{className:'wrap'},h('div',{className:'vopanel voice-recording'},
 h('header',{className:'voice-recording-heading'},h('h2',null,'Record voiceover'),h('span',null,'Eleven v4')),
 h('p',{className:'voice-help'},'Natural delivery with full pauses. Records your script and hooks marked “Send to editor”.'),
 h('label',{className:'voice-field'},'Voice',h('select',{defaultValue:'voice'},h('option',{value:'voice'},'Charlotte · British English'))),
 h(Creation,{value:v4RecordingSettings(),onChange:()=>{},sourceAvailable:true}),
 h(Directions,{value:v4RecordingSettings(),onChange:()=>{}}),
 h(Sample,{job,script,voiceId:'offline-voice',processing:v4RecordingSettings()}),
 h(Background,{value:v4RecordingSettings(),onChange:()=>{}}),
 h('details',{className:'voice-recording-text'},h('summary',null,'Recording text'),h('p',null,script)),
 h('div',{className:'voice-recording-actions'},h('button',{className:'primary-action',disabled:true},'Send to ElevenLabs'))
 ));}
const markup=renderToStaticMarkup(panel());
assert.equal((markup.match(/Preview this script/g)||[]).length,1);
const renderCreation=props=>renderToStaticMarkup(h(Creation,{value:settings,onChange:()=>{},...props}));
const radio=(markup,value)=>(markup.match(/<input\b[^>]*>/g)||[]).find(tag=>tag.includes(`value="${value}"`));
const naturalCreation=renderCreation({});assert(radio(naturalCreation,'storytelling').includes('checked=""'));assert(!radio(naturalCreation,'source').includes('checked=""'));
assert(naturalCreation.includes('Storytelling · natural rhythm'));assert(naturalCreation.includes('Adjust pauses and speech speed separately'));assert(naturalCreation.includes('Pause shortening'));assert(naturalCreation.includes('Speech speed'));assert.equal((naturalCreation.match(/type="range"/g)||[]).length,2);assert(naturalCreation.includes('May sound faster'));assert(naturalCreation.includes('Applies to the next recording.'));
const sourceSettings=voiceoverCreationSettings('source',settings),savedSourceCreation=renderCreation({value:v4RecordingSettings(JSON.parse(JSON.stringify(sourceSettings)))});
assert(radio(savedSourceCreation,'source').includes('checked=""'));assert(!radio(savedSourceCreation,'storytelling').includes('checked=""'),'Reload retains the saved Source selection');
const unavailableCreation=renderCreation({sourceAvailable:false});assert(radio(unavailableCreation,'source').includes('disabled=""'));assert(!radio(unavailableCreation,'storytelling').includes('disabled=""'));assert(unavailableCreation.includes('Requires a source recording with a speech timing reference'));
const disabledCreation=renderCreation({disabled:true});assert(/<fieldset[^>]*class="voice-creation"[^>]*disabled=""/.test(disabledCreation));
const polishCreation=renderCreation({polish:true});assert(polishCreation.includes('Opowiadanka · naturalne tempo'));assert(polishCreation.includes('Dopasuj do oryginału'));
const inputs=[];function visit(node){if(!React.isValidElement(node))return;if(node.type==='input')inputs.push(node);React.Children.forEach(node.props.children,visit);}
let changed;visit(Creation({value:settings,onChange:value=>changed=value,sourceAvailable:true}));inputs.find(input=>input.props.value==='source').props.onChange();assert.equal(changed.matchSourcePace,true);assert.equal(changed.emotion,settings.emotion);assert.equal(changed.ambience,settings.ambience);
inputs.length=0;visit(Creation({value:sourceSettings,onChange:value=>changed=value,sourceAvailable:true}));inputs.find(input=>input.props.value==='storytelling').props.onChange();assert.equal(changed.matchSourcePace,false);assert.equal(changed.openingReaction,settings.openingReaction);assert.equal(changed.breaths,false);
const preview=(processing,overrides={})=>renderToStaticMarkup(h(Sample,{job,script,voiceId:'offline-voice',processing,...overrides}));
const naturalPreview=preview(settings),sourcePreview=preview(sourceSettings);
assert(naturalPreview.includes('Storytelling uses the selected pause and speech speed settings'));assert(!naturalPreview.includes('Longer takes are matched to the source pace'));
assert(sourcePreview.includes('Longer takes are matched to the source pace'));assert(sourcePreview.includes('Script timing reference'));
const noSourceJob={...job,duration:undefined},withoutSourcePreview=preview(settings,{job:noSourceJob});assert(withoutSourcePreview.includes('Preview this script'));assert(withoutSourcePreview.includes('Storytelling uses'));assert(!withoutSourcePreview.includes('Script timing reference'));
assert(/<button\b[^>]*disabled=""/.test(preview(sourceSettings,{job:noSourceJob})),'Source preview is unavailable when the matching reference is missing');
assert(/<button\b[^>]*disabled=""/.test(preview(settings,{voiceId:''})),'Choose a voice before generating a preview');
for(const props of [{script:''},{job:{...job,result:{...job.result,no_speech:true}}},{job:{...job,singingAd:true}}])assert.equal(preview(settings,props),'');
for(const retired of ['Compare pauses','Preview subtle breaths','Compare recording length','Standard · breaths','no native speed slider'])assert(!markup.includes(retired));
const workspace=fs.readFileSync('app/szekspir/workspace.tsx','utf8');assert(!workspace.includes('PausePreview'));assert(!workspace.includes('name="pause-mode"'));assert(workspace.includes('v4RecordingSettings(job.voiceProcessing)'));
assert((workspace.match(/<VoiceCreation\b/g)||[]).length>=2,'Actual upload and recording panels both expose the creation choice');
const disabled=renderToStaticMarkup(h(Directions,{value:settings,onChange:()=>{},disabled:true}));assert(disabled.includes('<fieldset class="voice-setting-group" disabled=""'));
const css=fs.readFileSync('app/globals.css','utf8');
function luminance(hex){const rgb=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for(const [text,surface] of [['374151','ffffff'],['374151','f4f7f5'],['cbd5e1','1e1e1e'],['cbd5e1','17221b']])assert(contrast(text,surface)>=4.5);
console.log('PASS actual creation UI, checked natural/saved-source choices and toggling, missing-source/disabled guards, native/source/no-source previews, retained tone/background, one preview and light/dark contrast (offline)');
if(process.argv.includes('--preview')){
 const light=':root{--bg:#f7f7f5;--card:#fff;--text:#1a1a1a;--muted:#6b6b6b;--border:#e2e2de}.voice-recording{--voice-support:#374151;--voice-border:#87938c;--voice-inset:#f4f7f5;--voice-focus:#244bd6}';
 const dark=':root{--bg:#121212;--card:#1e1e1e;--text:#eaeaea;--muted:#9a9a9a;--border:#333}.voice-recording{--voice-support:#cbd5e1;--voice-border:#78877f;--voice-inset:#17221b;--voice-focus:#93b4ff}';
 require('node:http').createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1:3221');res.setHeader('Content-Type','text/html; charset=utf-8');
  if(url.pathname==='/mobile'){res.end('<!doctype html><title>Mobile v4 recording check</title><iframe title="375px voice panel" style="width:375px;height:1250px;border:0" src="/panel?theme='+url.searchParams.get('theme')+'"></iframe>');return;}
  res.end('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline v4 recording panel</title><style>'+css+'\n'+(url.searchParams.get('theme')==='dark'?dark:light)+'</style>'+markup+'</html>');
 }).listen(3221,'127.0.0.1',()=>console.log('Offline UI preview: http://127.0.0.1:3221/panel?theme=light'));
}
