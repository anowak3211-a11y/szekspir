'use client';
import {useState,useEffect} from 'react';
import VoicePreview from './voice-preview';
import {
 scriptSentences,
 estimateSentenceTimings,
 findSentencesForTimeRange,
 parseTimecode,
 formatTimecode,
 resolveSpeakerSegments,
 type DualVoice,
 type ThirdSpeaker,
} from '@/lib/dual-voice';

type Voice={voice_id:string;name:string;preview_url?:string|null};

export default function DualVoiceSettings({
 script,
 voices,
 firstVoice,
 value,
 onChange,
 disabled,
 videoDuration,
}:{
 script:string;
 voices:Voice[];
 firstVoice:string;
 value:DualVoice|null;
 onChange:(v:DualVoice|null)=>void;
 disabled:boolean;
 videoDuration?:number;
}){
 const timedSentences=estimateSentenceTimings(script,videoDuration);
 const sentences=timedSentences.slice(1);

 const [s2StartInput,setS2StartInput]=useState('');
 const [s2EndInput,setS2EndInput]=useState('');
 const [s3StartInput,setS3StartInput]=useState('');
 const [s3EndInput,setS3EndInput]=useState('');

 useEffect(()=>{
  setS2StartInput(value?.startSeconds!==undefined?formatTimecode(value.startSeconds):'');
  setS2EndInput(value?.endSeconds!==undefined?formatTimecode(value.endSeconds):'');
  setS3StartInput(value?.speaker3?.startSeconds!==undefined?formatTimecode(value.speaker3.startSeconds):'');
  setS3EndInput(value?.speaker3?.endSeconds!==undefined?formatTimecode(value.speaker3.endSeconds):'');
 },[value?.startSeconds,value?.endSeconds,value?.speaker3?.startSeconds,value?.speaker3?.endSeconds]);

 const validS2Start=!!value&&value.boundary===script.slice(value.splitAt,value.splitAt+120)&&sentences.some(s=>s.start===value.splitAt);
 const validS2End=!value?.endAt||(value.endBoundary===script.slice(value.endAt,value.endAt+120)&&sentences.some(s=>s.start===value.endAt&&s.start>value.splitAt));
 const s3=value?.speaker3;
 const minS3Offset=value?(value.endAt??value.splitAt):0;
 const validS3=!s3||(s3.boundary===script.slice(s3.splitAt,s3.splitAt+120)&&sentences.some(s=>s.start===s3.splitAt&&s.start>value!.splitAt&&s.start>=minS3Offset)&&(!s3.endAt||(s3.endBoundary===script.slice(s3.endAt,s3.endAt+120)&&sentences.some(s=>s.start===s3.endAt&&s.start>s3.splitAt))));
 const valid=validS2Start&&validS2End&&validS3;

 function applyTimeRangeS2(rawFrom:string,rawTo:string,autoSelectSentences=false){
  if(!value)return;
  const fromSec=parseTimecode(rawFrom);
  const toSec=parseTimecode(rawTo);
  const next:DualVoice={...value,startSeconds:fromSec,endSeconds:toSec};
  if(autoSelectSentences&&(fromSec!==undefined||toSec!==undefined)){
   const matched=findSentencesForTimeRange(script,fromSec,toSec,videoDuration);
   if(matched){
    next.splitAt=matched.splitAt;
    next.boundary=matched.boundary;
    next.endAt=matched.endAt;
    next.endBoundary=matched.endBoundary;
    if(next.speaker3&&next.endAt&&next.speaker3.splitAt<next.endAt){
     next.speaker3={
      ...next.speaker3,
      splitAt:next.endAt,
      boundary:script.slice(next.endAt,next.endAt+120),
      startSeconds:next.speaker3.startSeconds??toSec,
     };
    }
   }
  }
  onChange(next);
 }

 function applyTimeRangeS3(rawFrom:string,rawTo:string,autoSelectSentences=false){
  if(!value?.speaker3)return;
  const fromSec=parseTimecode(rawFrom);
  const toSec=parseTimecode(rawTo);
  const nextS3:ThirdSpeaker={...value.speaker3,startSeconds:fromSec,endSeconds:toSec};
  if(autoSelectSentences&&(fromSec!==undefined||toSec!==undefined)){
   const matched=findSentencesForTimeRange(script,fromSec,toSec,videoDuration);
   if(matched&&matched.splitAt>value.splitAt){
    nextS3.splitAt=matched.splitAt;
    nextS3.boundary=matched.boundary;
    nextS3.endAt=matched.endAt;
    nextS3.endBoundary=matched.endBoundary;
   }
  }
  onChange({...value,speaker3:nextS3});
 }

 function toggleSpeaker3(enabled:boolean){
  if(!value)return;
  if(!enabled){
   const next={...value};
   delete next.speaker3;
   onChange(next);
   return;
  }
  const afterS2=sentences.filter(s=>s.start>(value.endAt?value.endAt-1:value.splitAt));
  const defaultStart=value.endAt??afterS2[0]?.start??sentences[sentences.length-1]?.start??value.splitAt;
  onChange({
   ...value,
   speaker3:{
    voiceId:'',
    splitAt:defaultStart,
    boundary:script.slice(defaultStart,defaultStart+120),
    startSeconds:value.endSeconds,
   },
  });
 }

 const previewSegments=value&&valid?resolveSpeakerSegments(script,firstVoice||'speaker-1',value):[];

 return (
  <section className="vopanel" aria-label="Two speakers">
   <h3>Two or three voices in one script (przedziały Od – Do)</h3>
   <label>
    <input
     type="checkbox"
     checked={!!value}
     disabled={disabled}
     onChange={e=>
      onChange(
       e.target.checked
        ?{
          voiceId:'',
          splitAt:sentences[0]?.start??0,
          boundary:script.slice(sentences[0]?.start??0,(sentences[0]?.start??0)+120),
         }
        :null
      )
     }
    />{' '}
    Use multiple speakers (Speaker 2 / Speaker 3 in selected ranges)
   </label>

   {value&&(
    <>
     <p style={{fontSize:14,margin:'8px 0 12px'}}>
      <strong>Lektor 1 (Główny głos)</strong> czyta początek (i wraca automatycznie po zakończeniu kwestii Lektora 2, jeśli ustawisz koniec przedziału np. na <code>1:20</code>). Możesz też dodać <strong>Lektora 3</strong>. Czas możesz wpisać jako <code>0:50</code> – <code>1:20</code> lub w sekundach (<code>50</code> – <code>80</code>).
     </p>

     {/* SPEAKER 2 */}
     <div style={{padding:12,border:'1px solid #d0d7de',borderRadius:8,background:'#f8fafc',marginBottom:12}}>
      <h4 style={{margin:'0 0 8px',color:'#4f46e5'}}>🎙️ Lektor 2 (Speaker 2)</h4>
      <label>
       Speaker 2 voice
       <select
        value={value.voiceId}
        disabled={disabled}
        onChange={e=>onChange({...value,voiceId:e.target.value})}
       >
        <option value="">Choose the second voice</option>
        {voices
         .filter(v=>v.voice_id!==firstVoice)
         .map(v=>(
          <option key={v.voice_id} value={v.voice_id}>
           {v.name}
          </option>
         ))}
       </select>
      </label>
      <VoicePreview voiceId={value.voiceId} url={voices.find(v=>v.voice_id===value.voiceId)?.preview_url}/>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:10}}>
       <label>
        Od (czas startu Lektora 2, np. <code>0:50</code> lub <code>50</code>)
        <input
         type="text"
         placeholder="np. 0:50 lub 50"
         value={s2StartInput}
         disabled={disabled}
         onChange={e=>{
          setS2StartInput(e.target.value);
          const sec=parseTimecode(e.target.value);
          onChange({...value,startSeconds:sec});
         }}
        />
       </label>
       <label>
        Do (czas końca Lektora 2, np. <code>1:20</code> lub <code>80</code>)
        <input
         type="text"
         placeholder="np. 1:20 (puste = do końca)"
         value={s2EndInput}
         disabled={disabled}
         onChange={e=>{
          setS2EndInput(e.target.value);
          const sec=parseTimecode(e.target.value);
          onChange({...value,endSeconds:sec});
         }}
        />
       </label>
       <div style={{display:'flex',alignItems:'flex-end'}}>
        <button
         type="button"
         disabled={disabled||(parseTimecode(s2StartInput)===undefined&&parseTimecode(s2EndInput)===undefined)}
         onClick={()=>applyTimeRangeS2(s2StartInput,s2EndInput,true)}
         style={{minHeight:38,padding:'6px 12px'}}
        >
         🎯 Zaznacz zdania z czasu ({s2StartInput||'0:00'} – {s2EndInput||'koniec'})
        </button>
       </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10,marginTop:10}}>
       <label>
        Speaker 2 starts with this sentence (Od zdania)
        <select
         value={validS2Start?String(value.splitAt):''}
         disabled={disabled}
         onChange={e=>{
          const splitAt=Number(e.target.value);
          const clearEnd=value.endAt!==undefined&&value.endAt<=splitAt;
          onChange({
           ...value,
           splitAt,
           boundary:script.slice(splitAt,splitAt+120),
           ...(clearEnd?{endAt:undefined,endBoundary:undefined}:{}),
          });
         }}
        >
         <option value="" disabled>
          Choose the starting sentence
         </option>
         {sentences.map((s,i)=>(
          <option key={s.start} value={s.start}>
           [{formatTimecode(s.estStartSec)}] {i+2}. {s.text}
          </option>
         ))}
        </select>
       </label>

       <label>
        Speaker 2 ends at (Do którego momentu mówi Lektor 2)
        <select
         value={value.endAt&&validS2End?String(value.endAt):'END'}
         disabled={disabled}
         onChange={e=>{
          if(e.target.value==='END'){
           const next={...value};
           delete next.endAt;
           delete next.endBoundary;
           onChange(next);
          }else{
           const endAt=Number(e.target.value);
           onChange({
            ...value,
            endAt,
            endBoundary:script.slice(endAt,endAt+120),
           });
          }
         }}
        >
         <option value="END">
          {s3?'Do wejścia Lektora 3 (bez powrotu do Lektora 1)':'Do samego końca skryptu'}
         </option>
         {sentences
          .filter(s=>s.start>value.splitAt)
          .map(s=>(
           <option key={s.start} value={s.start}>
            Kończy przed [{formatTimecode(s.estStartSec)}] zd. {s.index+1} (od niego wraca Lektor {s3&&s3.splitAt===s.start?'3':'1'}): „{s.text.slice(0,48)}…”
           </option>
          ))}
        </select>
       </label>
      </div>
     </div>

     {/* SPEAKER 3 */}
     <div style={{padding:12,border:'1px solid #d0d7de',borderRadius:8,background:'#fffbeb',marginBottom:12}}>
      <label style={{fontWeight:600,color:'#b45309'}}>
       <input
        type="checkbox"
        checked={!!s3}
        disabled={disabled}
        onChange={e=>toggleSpeaker3(e.target.checked)}
       />{' '}
       🎙️ Dodaj 3. lektora (Speaker 3 w kolejnym przedziale)
      </label>

      {s3&&(
       <div style={{marginTop:10}}>
        <label>
         Speaker 3 voice
         <select
          value={s3.voiceId}
          disabled={disabled}
          onChange={e=>onChange({...value,speaker3:{...s3,voiceId:e.target.value}})}
         >
          <option value="">Choose the third voice</option>
          {voices
           .filter(v=>v.voice_id!==firstVoice)
           .map(v=>(
            <option key={v.voice_id} value={v.voice_id}>
             {v.name}
            </option>
           ))}
         </select>
        </label>
        <VoicePreview voiceId={s3.voiceId} url={voices.find(v=>v.voice_id===s3.voiceId)?.preview_url}/>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:10}}>
         <label>
          Od (czas startu Lektora 3, np. <code>1:20</code>)
          <input
           type="text"
           placeholder="np. 1:20 lub 80"
           value={s3StartInput}
           disabled={disabled}
           onChange={e=>{
            setS3StartInput(e.target.value);
            const sec=parseTimecode(e.target.value);
            onChange({...value,speaker3:{...s3,startSeconds:sec}});
           }}
          />
         </label>
         <label>
          Do (czas końca Lektora 3, opcjonalnie)
          <input
           type="text"
           placeholder="puste = do końca skryptu"
           value={s3EndInput}
           disabled={disabled}
           onChange={e=>{
            setS3EndInput(e.target.value);
            const sec=parseTimecode(e.target.value);
            onChange({...value,speaker3:{...s3,endSeconds:sec}});
           }}
          />
         </label>
         <div style={{display:'flex',alignItems:'flex-end'}}>
          <button
           type="button"
           disabled={disabled||(parseTimecode(s3StartInput)===undefined&&parseTimecode(s3EndInput)===undefined)}
           onClick={()=>applyTimeRangeS3(s3StartInput,s3EndInput,true)}
           style={{minHeight:38,padding:'6px 12px'}}
          >
           🎯 Zaznacz zdania dla Lektora 3
          </button>
         </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10,marginTop:10}}>
         <label>
          Speaker 3 starts with this sentence (Od zdania)
          <select
           value={validS3?String(s3.splitAt):''}
           disabled={disabled}
           onChange={e=>{
            const splitAt=Number(e.target.value);
            const clearEnd=s3.endAt!==undefined&&s3.endAt<=splitAt;
            onChange({
             ...value,
             speaker3:{
              ...s3,
              splitAt,
              boundary:script.slice(splitAt,splitAt+120),
              ...(clearEnd?{endAt:undefined,endBoundary:undefined}:{}),
             },
            });
           }}
          >
           <option value="" disabled>
            Choose Speaker 3 starting sentence
           </option>
           {sentences
            .filter(s=>s.start>value.splitAt&&s.start>=minS3Offset)
            .map(s=>(
             <option key={s.start} value={s.start}>
              [{formatTimecode(s.estStartSec)}] {s.index+1}. {s.text}
             </option>
            ))}
          </select>
         </label>

         <label>
          Speaker 3 ends at (Do którego momentu mówi Lektor 3)
          <select
           value={s3.endAt?String(s3.endAt):'END'}
           disabled={disabled}
           onChange={e=>{
            if(e.target.value==='END'){
             const nextS3={...s3};
             delete nextS3.endAt;
             delete nextS3.endBoundary;
             onChange({...value,speaker3:nextS3});
            }else{
             const endAt=Number(e.target.value);
             onChange({
              ...value,
              speaker3:{
               ...s3,
               endAt,
               endBoundary:script.slice(endAt,endAt+120),
              },
             });
            }
           }}
          >
           <option value="END">Do samego końca skryptu</option>
           {sentences
            .filter(s=>s.start>s3.splitAt)
            .map(s=>(
             <option key={s.start} value={s.start}>
              Kończy przed [{formatTimecode(s.estStartSec)}] zd. {s.index+1} (wraca Lektor 1): „{s.text.slice(0,45)}…”
             </option>
            ))}
          </select>
         </label>
        </div>
       </div>
      )}
     </div>

     {!valid&&(
      <p role="alert">
       The script changed. Select the starting/ending sentence again.
      </p>
     )}

     {/* INTERACTIVE SENTENCE PICKER & TIMELINE */}
     {valid&&(
      <details open style={{marginTop:10}}>
       <summary style={{cursor:'pointer',fontWeight:600}}>
        Review who says what ({previewSegments.length} segments) & kliknij zdanie, aby zaznaczyć przedział
       </summary>
       <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8,maxHeight:280,overflowY:'auto',padding:8,border:'1px solid #e2e8f0',borderRadius:6,background:'#fff'}}>
        {timedSentences.map(s=>{
         const s2EndOffset=value.endAt??s3?.splitAt??script.length;
         const s3EndOffset=s3?.endAt??script.length;
         const who:1|2|3=
          s.start>=value.splitAt&&s.start<s2EndOffset
           ?2
           :s3&&s.start>=s3.splitAt&&s.start<s3EndOffset
           ?3
           :1;
         const bg=who===2?'#eef2ff':who===3?'#fef3c7':'#f0fdf4';
         const badgeColor=who===2?'#4f46e5':who===3?'#b45309':'#15803d';
         return (
          <div
           key={s.start}
           style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'space-between',
            gap:8,
            padding:'6px 8px',
            borderRadius:6,
            background:bg,
            fontSize:13,
           }}
          >
           <div>
            <strong style={{color:badgeColor,marginRight:6}}>
             Lektor {who}
            </strong>
            <span style={{color:'#64748b',fontFamily:'monospace',marginRight:6}}>
             [{formatTimecode(s.estStartSec)}–{formatTimecode(s.estEndSec)}]
            </span>
            <span>
             {s.index+1}. {s.text}
            </span>
           </div>
           {s.index>0&&(
            <div style={{display:'flex',gap:4,flexShrink:0}}>
             <button
              type="button"
              disabled={disabled}
              title="Ustaw tutaj początek Lektora 2"
              onClick={()=>{
               const clearEnd=value.endAt!==undefined&&value.endAt<=s.start;
               onChange({
                ...value,
                splitAt:s.start,
                boundary:script.slice(s.start,s.start+120),
                ...(clearEnd?{endAt:undefined,endBoundary:undefined}:{}),
               });
              }}
              style={{fontSize:11,padding:'2px 6px',minHeight:26}}
             >
              Start L2
             </button>
             {s.start>value.splitAt&&(
              <button
               type="button"
               disabled={disabled}
               title="Zakończ Lektora 2 przed tym zdaniem (od tego zdania wraca Lektor 1)"
               onClick={()=>
                onChange({
                 ...value,
                 endAt:s.start,
                 endBoundary:script.slice(s.start,s.start+120),
                })
               }
               style={{fontSize:11,padding:'2px 6px',minHeight:26}}
              >
               Koniec L2 (wraca L1)
              </button>
             )}
             {s.start>value.splitAt&&(
              <button
               type="button"
               disabled={disabled}
               title="Ustaw tutaj początek Lektora 3"
               onClick={()=>{
                const nextEndAt=value.endAt&&value.endAt>s.start?s.start:value.endAt;
                onChange({
                 ...value,
                 ...(nextEndAt?{endAt:nextEndAt,endBoundary:script.slice(nextEndAt,nextEndAt+120)}:{}),
                 speaker3:{
                  voiceId:s3?.voiceId||'',
                  splitAt:s.start,
                  boundary:script.slice(s.start,s.start+120),
                  startSeconds:s3?.startSeconds??value.endSeconds,
                  endSeconds:s3?.endSeconds,
                 },
                });
               }}
               style={{fontSize:11,padding:'2px 6px',minHeight:26}}
              >
               Start L3
              </button>
             )}
            </div>
           )}
          </div>
         );
        })}
       </div>

       <div style={{marginTop:10}}>
        {previewSegments.map((seg,idx)=>(
         <div key={idx} style={{marginBottom:8}}>
          <h4 style={{margin:'4px 0'}}>
           Segment {idx+1}: Speaker {seg.speakerNumber}
           {seg.startSeconds!==undefined||seg.endSeconds!==undefined
            ?` (${seg.startSeconds!==undefined?formatTimecode(seg.startSeconds):'start'} – ${seg.endSeconds!==undefined?formatTimecode(seg.endSeconds):'end'})`
            :''}
          </h4>
          <p style={{whiteSpace:'pre-wrap',margin:0,fontSize:13}}>{seg.text}</p>
         </div>
        ))}
       </div>
      </details>
     )}
     <p style={{fontSize:13,marginTop:8}}>
      Records separate takes for each speaker segment, fits any specified time windows (e.g. 0:50–1:20), and joins them into one WAV. All individual takes are kept.
     </p>
    </>
   )}
  </section>
 );
}
