'use client';
import {useEffect,useRef,useState} from 'react';
import type {AdditionalFile} from '@/lib/additional-files-model';
import type {VoiceProcessing} from '@/lib/voice-processing';
import {uploadMedia} from '@/lib/media-upload';
import VoicePicker from '@/app/szekspir/components/voice-picker';
import VoicePreview from '@/app/szekspir/components/voice-preview';
import PausePreview from '@/app/szekspir/components/pause-preview';
type Editor={id:string;name:string;sheetId:string};
type Ad={adId:string;name:string;script:string;hooks?:string[]};
type Voice={group?:string;voice_id:string;name:string;preview_url?:string|null};
async function request(url:string,body?:unknown){const r=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed. Please try again.');return d;}
const defaults:VoiceProcessing={mode:'standard',normalize:false,emotion:'subtle'};
export default function AdditionalFiles(){
 const [editors,setEditors]=useState<Editor[]>([]),[voices,setVoices]=useState<Voice[]>([]),[editor,setEditor]=useState(''),[ads,setAds]=useState<Ad[]>([]),[adId,setAdId]=useState('');
 const [recordings,setRecordings]=useState<string[]>(['voiceover']);
 const [extraDrafts,setExtraDrafts]=useState<Record<string,{text:string;label:string}>>({});
 const [hookIndex,setHookIndex]=useState<0|1|undefined>(undefined);
 const [text,setText]=useState(''),[label,setLabel]=useState('Corrected voiceover'),[voice,setVoice]=useState(''),[processing,setProcessing]=useState<VoiceProcessing>(defaults);
 const [files,setFiles]=useState<AdditionalFile[]>([]),[links,setLinks]=useState(''),[loading,setLoading]=useState(false),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[historyError,setHistoryError]=useState(''),[ready,setReady]=useState(false),[listLoading,setListLoading]=useState(false);
 const [historyRetry,setHistoryRetry]=useState(0);
 const [provider,setProvider]=useState<'elevenlabs'|'vmake'|'both'|'none'>('elevenlabs'),[vmakeMode,setVmakeMode]=useState<'enhance'|'remove'|'both'>('both'),[upload,setUpload]=useState<File|null>(null),[progress,setProgress]=useState(0);
 const withVoice=provider==='elevenlabs'||provider==='both',withVideo=provider==='vmake'||provider==='both';
 function toggleProvider(value:'elevenlabs'|'vmake'|'none'){if(value==='none'){setProvider('none');return;}const voice=value==='elevenlabs'?!withVoice:withVoice,video=value==='vmake'?!withVideo:withVideo;setProvider(voice&&video?'both':voice?'elevenlabs':video?'vmake':'none');}
 const uploaded=useRef<{file:File;path:string}|null>(null);
 const requestId=useRef<string|null>(null),savedPayload=useRef('');
 const selected=ads.find(a=>a.adId===adId),workspace=editors.find(e=>e.id===editor);
 const active=files.some(f=>(!f.provider||f.provider==='elevenlabs')&&f.status==='generating'&&Date.now()-f.createdAt<360000);
 useEffect(()=>{let live=true;Promise.all([request('/api/editors'),request('/api/voices').catch(()=>({voices:[]}))]).then(([a,v])=>{if(live){setEditors(a.editors);setVoices(v.voices);setReady(true);}}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[]);
 useEffect(()=>{setAdId('');setAds([]);setFiles([]);setLinks('');setError('');setNotice('');if(!editor)return;let live=true;setListLoading(true);request(`/api/additional-files?editor=${encodeURIComponent(editor)}`).then(d=>{if(live)setAds(d.ads);}).catch(e=>{if(live)setError(e.message);}).finally(()=>{if(live)setListLoading(false);});return()=>{live=false;};},[editor]);
 useEffect(()=>{if(!adId)return;let live=true;let timer:ReturnType<typeof setTimeout>;setLoading(true);setFiles([]);setLinks('');setHistoryError('');
  async function poll(){try{const d=await request(`/api/additional-files?editor=${encodeURIComponent(editor)}&ad=${encodeURIComponent(adId)}`);if(live){setFiles(d.files);setLinks(d.links);setHistoryError('');}}catch(e){if(live)setHistoryError((e as Error).message);}finally{if(live){setLoading(false);timer=setTimeout(poll,5000);}}}
  poll();return()=>{live=false;clearTimeout(timer);};
 },[editor,adId,historyRetry]);
 useEffect(()=>{if(!adId)return;setRecordings(['voiceover']);setExtraDrafts({});setHookIndex(undefined);setUpload(null);uploaded.current=null;setText(selected?.script||'');setLabel('Corrected voiceover');setNotice('');setError('');requestId.current=null;savedPayload.current='';
  try{const saved=JSON.parse(localStorage.getItem('additional-draft-'+adId)||'null');if(saved){setRecordings([saved.hookIndex===0||saved.hookIndex===1?String(saved.hookIndex):'voiceover']);setHookIndex(saved.hookIndex===0||saved.hookIndex===1?saved.hookIndex:undefined);setText(saved.text||'');setLabel(saved.label||'Corrected voiceover');if(voices.some(v=>v.voice_id===saved.voice))setVoice(saved.voice);if(saved.processing)setProcessing(saved.processing);}}catch{/* local drafts are optional */}
 },[adId]);
 function saveDraft(next:{text?:string;label?:string;voice?:string;processing?:VoiceProcessing;hookIndex?:0|1}){try{if(adId)localStorage.setItem('additional-draft-'+adId,JSON.stringify({text,label,voice,processing,hookIndex,...next}));}catch{}}
 function chooseRecording(index:0|1|undefined){
  try{localStorage.setItem(`additional-mode-${adId}-${hookIndex??'voiceover'}`,JSON.stringify({text,label}));}catch{}
  let nextText=index===undefined?selected?.script||'':selected?.hooks?.[index]||'';
  let nextLabel=index===undefined?'Corrected voiceover':`Hook ${index+1} — corrected take`;
  try{const draft=JSON.parse(localStorage.getItem(`additional-mode-${adId}-${index??'voiceover'}`)||'null');if(draft){nextText=draft.text;nextLabel=draft.label;}}catch{}
  setHookIndex(index);setText(nextText);setLabel(nextLabel);saveDraft({hookIndex:index,text:nextText,label:nextLabel});
 }
 function toggleRecording(index:0|1|undefined){
  const key=String(index??'voiceover'),current=String(hookIndex??'voiceover');
  if(recordings.includes(key)){
   const remaining=recordings.filter(k=>k!==key);setRecordings(remaining);
   setExtraDrafts(d=>({...d,[current]:{text,label}}));
   if(key===current&&remaining.length){const next=remaining[0],draft=extraDrafts[next];chooseRecording(next==='voiceover'?undefined:Number(next) as 0|1);if(draft){setText(draft.text);setLabel(draft.label);}}
  }else{
   setRecordings([...recordings,key]);
   if(!recordings.length){chooseRecording(index);return;}
   setExtraDrafts(d=>({...d,[key]:d[key]||{text:index===undefined?selected?.script||'':selected?.hooks?.[index]||'',label:index===undefined?'Corrected voiceover':`Hook ${index+1} — corrected take`}}));
  }
 }
 async function refresh(){const d=await request(`/api/additional-files?editor=${encodeURIComponent(editor)}&ad=${encodeURIComponent(adId)}`);setFiles(d.files);setLinks(d.links);}
 async function generate(draft:{text:string;label:string;hookIndex?:0|1}={text,label,hookIndex}){setBusy('generate');setError('');setNotice('');const payload={editorId:editor,adId,text:draft.text,voiceId:voice,label:draft.label,processing,hookIndex:draft.hookIndex};const serial=JSON.stringify(payload);if(serial!==savedPayload.current||!requestId.current){requestId.current=crypto.randomUUID();savedPayload.current=serial;}
  try{const d=await request('/api/additional-files',{action:'generate',...payload,requestId:requestId.current});setFiles(f=>[d.file,...f.filter(x=>x.id!==d.file.id)]);requestId.current=null;setNotice('Recording started. The new take will appear below for review.');}catch(e){setError((e as Error).message);}finally{setBusy('');}
 }
 async function uploadFile(){
  if(!upload)return;setBusy('upload');setError('');setNotice('');setProgress(0);
  try{
   const ext=upload.name.split('.').pop()?.toLowerCase();if(!ext||!['mp4','mov','webm','mp3','m4a','wav'].includes(ext))throw Error('Choose MP4, MOV, WebM, MP3, M4A or WAV.');
   if(withVideo&&!['mp4','mov','webm'].includes(ext))throw Error('VMake needs a video file.');
   if(uploaded.current?.file!==upload){const path=`sources/${crypto.randomUUID()}/source.${ext}`;await uploadMedia(path,upload,setProgress);uploaded.current={file:upload,path};}
   const payload={editorId:editor,adId,provider:withVideo?'vmake':'none',vmakeMode:withVideo?vmakeMode:undefined,sourcePath:uploaded.current!.path,label};
   const serial=JSON.stringify(payload);if(serial!==savedPayload.current||!requestId.current){requestId.current=crypto.randomUUID();savedPayload.current=serial;}
   const d=await request('/api/additional-files',{action:'upload',...payload,requestId:requestId.current});
   setFiles(f=>[d.file,...f.filter(x=>x.id!==d.file.id)]);requestId.current=null;setUpload(null);uploaded.current=null;
   setNotice(withVideo?'Video processing started. You can return later to review the result.':'File uploaded. Review it, then approve to send it to the editor.');
  }catch(e){setError((e as Error).message);}finally{setBusy('');}
 }
 async function action(f:AdditionalFile,action:'approve'|'recover'){setBusy(f.id);setError('');setNotice('');try{await request('/api/additional-files',{action,editorId:editor,adId,id:f.id});await refresh();setNotice(action==='approve'?`${f.label} added to ${adId} in ${workspace?.name}’s Additional files column.`:'Saved recording recovered. Listen before approving.');}catch(e){setError((e as Error).message);}finally{setBusy('');}}
 const approved=files.filter(f=>f.status==='approved'),drafts=files.filter(f=>f.status!=='approved');
 const extraLinks=(links.match(/https:\/\/[^\s]+/g)||[]).filter(url=>!approved.some(f=>f.url===url));
 return <main className="wrap additional-page">
  <p className="crumb"><a href="/">← Main Hub</a></p>
  <header><p className="additional-eyebrow">EXTRA FILES FOR EXISTING ADS</p><h1>Additional Files</h1><p className="sub">Record a voiceover, process a video or upload a ready file. Review it before sending.</p></header>
  <ol className="additional-steps" aria-label="Workflow"><li>1. Choose a task</li><li>2. Create & review</li><li>3. Approve & send</li></ol>
  {error&&<p className="err" role="alert">{error}{!ready&&<button onClick={()=>location.reload()}>Reload</button>}</p>}
  {notice&&<p className="additional-notice" role="status">{notice}</p>}
  <section className="additional-card"><h2>Choose a task</h2><div className="additional-selects">
   <label>Editor<select value={editor} disabled={!ready||!!busy} onChange={e=>setEditor(e.target.value)}><option value="">{ready?'Choose an editor…':'Loading editors and voices…'}</option>{editors.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
   <label>Ad ID<select value={adId} disabled={!editor||listLoading||!!busy} onChange={e=>setAdId(e.target.value)}><option value="">{listLoading?'Loading tasks…':'Choose an ad…'}</option>{ads.map(a=><option key={a.adId} value={a.adId}>{a.adId} — {a.name}</option>)}</select></label>
  </div>{editor&&!listLoading&&!ads.length&&<p className="hint">No ads assigned to this editor.</p>}{selected&&<p className="hint"><strong>{selected.adId}</strong> · {workspace?.name} · <a target="_blank" rel="noopener noreferrer" href={`https://docs.google.com/spreadsheets/d/${workspace?.sheetId}/edit#gid=801`}>Open editor workspace ↗</a></p>}</section>
  {selected&&<div className="additional-layout"><section className="additional-card"><h2>Add a file</h2><fieldset className="additional-options"><legend>How do you want to prepare it?</legend><div className="additional-option-grid">{([['elevenlabs','ElevenLabs','Record a voiceover'],['vmake','VMake','Process a video'],['none','No processing','Upload a ready file']] as const).map(([value,title,description])=><label className={(value==='elevenlabs'?withVoice:value==='vmake'?withVideo:provider==='none')?'selected':''} key={value}><input type="checkbox" checked={value==='elevenlabs'?withVoice:value==='vmake'?withVideo:provider==='none'} disabled={!!busy} onChange={()=>toggleProvider(value)}/><span><strong>{title}</strong><small>{description}</small></span></label>)}</div><p className="hint">Select ElevenLabs and VMake together to prepare both files. Start and approve each one separately.</p></fieldset>
   {withVoice&&<fieldset className="additional-options"><legend>What do you want to record?</legend><div className="additional-option-grid">{([undefined,0,1] as const).map(index=><label key={index??'voiceover'} className={recordings.includes(String(index??'voiceover'))?'selected':''}><input type="checkbox" checked={recordings.includes(String(index??'voiceover'))} disabled={!!busy} onChange={()=>toggleRecording(index)}/><span><strong>{index===undefined?'Voiceover':`Regenerate Hook ${index+1}`}</strong><small>{index===undefined?'Record the main script.':'Edit and record this opening separately.'}</small></span></label>)}</div><p className="hint">Select any combination. Edit, record and approve each file separately using the voice settings below.</p>{hookIndex!==undefined&&<p className="hint">{!selected.hooks?.[hookIndex]?.trim()?'No saved text for this hook. Paste the opening below. ':''}The recording keeps the full ending and adds 0.5 seconds. Approve it to add it to Additional files.</p>}</fieldset>}
   {(!withVoice||recordings.length>0)&&<label>File name<input maxLength={100} value={label} disabled={!!busy} onChange={e=>{setLabel(e.target.value);saveDraft({label:e.target.value});}} placeholder="e.g. Hook 1 — corrected pronunciation"/></label>}
   {withVoice&&<>{recordings.length>0&&<><label>{hookIndex===undefined?'Voiceover script':`Hook ${hookIndex+1} script`}<textarea rows={13} maxLength={15000} value={text} disabled={!!busy} onChange={e=>{setText(e.target.value);saveDraft({text:e.target.value});}}/></label><p className="hint">{text.length.toLocaleString()} / 15,000 characters</p></>}
   {recordings.filter(k=>k!==String(hookIndex??'voiceover')).map(k=>{const d=extraDrafts[k]||{text:'',label:''};return <section key={k}><h3>{k==='voiceover'?'Voiceover':`Hook ${Number(k)+1}`}</h3><label>File name<input value={d.label} maxLength={100} disabled={!!busy} onChange={e=>setExtraDrafts(prev=>({...prev,[k]:{...d,label:e.target.value}}))}/></label><label>Script<textarea rows={k==='voiceover'?13:4} value={d.text} maxLength={15000} disabled={!!busy} onChange={e=>setExtraDrafts(prev=>({...prev,[k]:{...d,text:e.target.value}}))}/></label></section>;})}
   <VoicePicker voices={voices} value={voice} disabled={!!busy} onChange={id=>{setVoice(id);saveDraft({voice:id});}}/>
   <VoicePreview url={voices.find(v=>v.voice_id===voice)?.preview_url}/>
   <fieldset className="additional-options"><legend>Voiceover pace</legend><div className="additional-option-grid">{([['gentle','Storytelling','Protect quiet breaths. Gently shorten only near-silent pauses.'],['standard','Normal','Natural pauses. Recommended for most ads.'],['aggressive','VSL','Short pauses for fast-paced ads.']] as const).map(([mode,title,description])=><label key={mode} className={processing.mode===mode?'selected':''}><input type="radio" name="additional-pace" checked={processing.mode===mode} disabled={!!busy} onChange={()=>{const p={...processing,mode};setProcessing(p);saveDraft({processing:p});}}/><span><strong>{title}</strong><small>{description}</small></span></label>)}</div>
    <p className="hint">Only pauses change; speech stays at its original speed. Saved as uncompressed WAV. The original ElevenLabs file is kept unchanged.</p>
    <PausePreview voiceId={voice} processing={processing}/>
   </fieldset>
   
   <label className="additional-check"><input type="checkbox" disabled={!!busy} checked={processing.emotion==='subtle'} onChange={e=>{const p:VoiceProcessing={...processing,emotion:e.target.checked?'subtle':'off'};setProcessing(p);saveDraft({processing:p});}}/>Subtle emotion at the start</label>
   {recordings.length>0&&<button className="primary-action" disabled={!!busy||active||loading||!!historyError||!text.trim()||!label.trim()||!voice} onClick={()=>generate()}>{busy==='generate'?'Starting…':active?'Recording in progress…':loading?'Checking saved files…':historyError?'Waiting for connection…':hookIndex!==undefined?`Regenerate Hook ${hookIndex+1}`:files.length?'Generate another take':'Generate voiceover'}</button>}
   {recordings.filter(k=>k!==String(hookIndex??'voiceover')).map(k=>{const d=extraDrafts[k];return <button key={k} className="primary-action" style={{marginTop:12}} disabled={!!busy||active||loading||!!historyError||!d?.text.trim()||!d?.label.trim()||!voice} onClick={()=>generate({...d,hookIndex:k==='voiceover'?undefined:Number(k) as 0|1})}>{active?'Recording in progress…':k==='voiceover'?'Generate voiceover':`Regenerate Hook ${Number(k)+1}`}</button>;})}{historyError&&<p className="err" role="status">Cannot check saved recordings right now. Generation will unlock when the connection returns. <button disabled={loading} onClick={()=>setHistoryRetry(n=>n+1)}>Retry connection</button></p>}<p className="hint">Uses ElevenLabs credits. Nothing is sent to the editor until you approve a take.</p></>}
   {(withVideo||provider==='none')&&<>
   {withVideo&&<label>Video processing<select value={vmakeMode} disabled={!!busy} onChange={e=>setVmakeMode(e.target.value as typeof vmakeMode)}><option value="enhance">Enhance only</option><option value="remove">Remove subtitles only</option><option value="both">Enhance + remove subtitles</option></select></label>}
   <label>{withVideo?'Video':'Video or audio'}<input key={`${adId}`} type="file" disabled={!!busy} accept={withVideo?'.mp4,.mov,.webm':'.mp4,.mov,.webm,.mp3,.m4a,.wav'} onChange={e=>{setUpload(e.target.files?.[0]||null);uploaded.current=null;}}/></label>
   <button className="primary-action" disabled={!!busy||loading||!!historyError||!upload||!label.trim()} onClick={uploadFile}>{busy==='upload'?`Uploading / preparing · ${Math.round(progress)}%`:withVideo?'Upload & process video':'Upload for review'}</button>
   <p className="hint">{withVideo?'Uses VMake credits.':'Saves the original file without processing.'} The editor receives the link only after approval.</p>
   </>}
  </section><aside className="additional-card additional-review"><h2>Review & approve</h2><p className="hint">Every file is saved here. Approve only the one you want your editor to use.</p>{historyError&&<p className="err" role="alert">Could not load saved files. Retrying automatically; your draft is kept. <button disabled={loading} onClick={()=>setHistoryRetry(n=>n+1)}>Retry connection</button></p>}{loading?<p role="status">Loading files…</p>:!drafts.length&&!historyError?<p className="additional-empty">Your new files will appear here.</p>:drafts.map(f=><article className="additional-take" key={f.id}><div className="additional-take-head"><h3>{f.label}</h3><span className="additional-status">{f.status==='generating'?'Processing':f.status==='error'?'Needs attention':'Draft'}</span></div><p className="hint">{f.voiceName} · {new Date(f.createdAt).toLocaleString()}</p>
    {f.url&&<><FilePreview file={f}/><button className="primary-action" disabled={!!busy} onClick={()=>action(f,'approve')}>{busy===f.id?'Saving & checking…':'Approve & send to editor'}</button></>}
    {f.status==='generating'&&(f.provider==='vmake'||Date.now()-f.createdAt<360000)&&<p role="status">Preparing your file… You can leave this page and return later.</p>}
    {(f.status==='error'||f.status==='generating'&&Date.now()-f.createdAt>=360000)&&<><p>{f.error||'This is taking longer than expected. Check for a saved result before generating another take.'}</p><button disabled={!!busy} onClick={()=>action(f,'recover')}>Check saved result</button></>}
    {f.originalUrl&&<details><summary>Original file</summary><FilePreview file={f} original/></details>}
    {(!f.provider||f.provider==='elevenlabs')&&<><details><summary>Recorded script & settings</summary><p className="hint">{f.processing.mode} pauses · Volume {f.processing.normalize?'normalised':'unchanged'} · Emotion {f.processing.emotion||'off'}</p><p className="additional-script">{f.text}</p></details>
    <button disabled={!!busy||active} onClick={()=>{setProvider('elevenlabs');setRecordings([String(f.hookIndex??'voiceover')]);setHookIndex(f.hookIndex);setText(f.text);setLabel(f.label);setVoice(voices.some(v=>v.voice_id===f.voiceId)?f.voiceId:'');setProcessing(f.processing);saveDraft({hookIndex:f.hookIndex,text:f.text,label:f.label,voice:f.voiceId,processing:f.processing});setNotice('Take loaded into the form. Adjust it, then generate another take.');}}>Use this take’s script</button></>}
   </article>)}</aside></div>}
  {selected&&<section className="additional-card"><h2>Previously added files <span className="additional-status">{approved.length+extraLinks.length}</span></h2><p className="hint">Approved files for {adId}, linked in the editor’s Additional files column.</p>{!loading&&!approved.length&&!extraLinks.length&&<p className="additional-empty">No files approved yet.</p>}{approved.map(f=><article key={f.id} className="additional-history"><div><h3>{f.label}</h3><p className="hint">{f.voiceName} · Approved {new Date(f.approvedAt!).toLocaleString()}</p></div><FilePreview file={f}/><a target="_blank" rel="noopener noreferrer" href={f.url}>Open file ↗</a></article>)}{extraLinks.map(url=><p key={url}><a href={url} target="_blank" rel="noopener noreferrer">Saved file ↗</a></p>)}</section>}
 </main>;
}

function FilePreview({file,original=false}:{file:AdditionalFile;original?:boolean}){const src=original?file.originalUrl:file.url;return file.mediaType==='video'?<video controls preload="metadata" src={src} aria-label={file.label} style={{width:'100%',maxHeight:340,background:'#111',borderRadius:12}}/>:<audio controls preload="none" src={src} aria-label={file.label}/>;}
