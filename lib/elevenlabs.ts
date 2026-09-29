import type {VoiceProcessing} from './voice-processing';
import {directedNarration,voiceSettings} from './voice-direction';
import type {VoiceTiming} from './vo-cleanup';
import {cleanVoiceover} from './vo-cleanup';
const BASE = "https://api.elevenlabs.io/v1";

function key(): string {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) throw new Error("ELEVENLABS_API_KEY not set");
  return k;
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  preview_url?: string | null;
  labels: Record<string, string>;
}

export async function listVoices(): Promise<Voice[]> {
  const voices:Voice[]=[];let token:string|undefined;
  const seen=new Set<string>();
  do{
    const params=new URLSearchParams({page_size:'100',include_total_count:'false'});
    if(token)params.set('next_page_token',token);
    const r=await fetch(`https://api.elevenlabs.io/v2/voices?${params}`,{headers:{'xi-api-key':key()},cache:'no-store',signal:AbortSignal.timeout(20000)});
    if(!r.ok)throw Error(`Could not load ElevenLabs voices (${r.status}).`);
    const j=await r.json();voices.push(...(j.voices||[]));
    token=j.has_more?j.next_page_token:undefined;
    if(j.has_more&&(!token||seen.has(token)))throw Error('Could not load the complete voice list.');
    if(token)seen.add(token);
  }while(token);
  return voices;
}

export async function generateVO(
  text: string,
  voiceId: string,
  preserve?:(raw:ArrayBuffer,timing:VoiceTiming)=>Promise<void>,
  processing?:VoiceProcessing,
  kind:'voiceover'|'hook'='voiceover',
  market:'uk'|'pl'='uk'
): Promise<ArrayBuffer> {
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key(), "Content-Type": "application/json" },
    body: JSON.stringify({
      text:directedNarration(text,processing?.emotion??'subtle',market,processing),
      model_id: "eleven_v3",
      voice_settings: voiceSettings(processing),
    }),
  });
  if (!r.ok) throw new Error(`ElevenLabs TTS: ${r.status} ${await r.text()}`);
  const raw=await r.arrayBuffer();
  try{
   let timing:VoiceTiming|undefined;
   const clean=await cleanVoiceover(raw,t=>{timing=t;},processing,kind);
   // Background is opt-in for the main narration only; hooks stay clean for editing.
   let output=clean;
   if(timing&&preserve&&processing&&processing.mode!=='aggressive'&&processing.ambience&&processing.ambience!=='none'&&kind==='voiceover'){
    const {addStoryAmbience}=await import('./story-ambience');
    output=await addStoryAmbience(clean,processing.ambience,timing,key());
   }
   if(preserve&&timing)await preserve(raw,timing);
   return output;
  }finally{new Uint8Array(raw).fill(0);}
}

// Fixed comparison narration: generated only when the library preview is too short.
export async function generatePauseSample(voiceId:string):Promise<ArrayBuffer>{
 const r=await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,{
  method:'POST',headers:{'xi-api-key':key(),'Content-Type':'application/json'},
  body:JSON.stringify({text:"Take a moment to listen. This is the same voice, reading at a natural pace. Between each thought, there is a little room to breathe. Now compare the pauses, and choose the rhythm that feels right for your story. There is no need to rush.",model_id:'eleven_v3',voice_settings:{stability:1.0}}),signal:AbortSignal.timeout(90000)
 });
 if(!r.ok)throw Error(`Could not generate the comparison sample (HTTP ${r.status}).`);
 return r.arrayBuffer();
}
