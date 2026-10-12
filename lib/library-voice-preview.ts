import {getVoice} from './elevenlabs';
import {safeDownload} from './safe-fetch';

export const LIBRARY_PREVIEW_ERROR='Could not load this saved voice sample. Please try again.';
type Sample={buffer:Buffer;contentType:string};
const samples=new Map<string,{until:number;value:Promise<Sample>}>();
const TTL=5*60*1000,MAX_SAMPLES=8;

// Bytes from a saved library sample only. Never fall back to paid text-to-speech.
export function libraryVoicePreview(voiceId:string):Promise<Sample>{
 const prior=samples.get(voiceId);
 if(prior&&prior.until>Date.now())return prior.value;
 for(const [id,item] of samples)if(item.until<=Date.now())samples.delete(id);
 if(samples.size>=MAX_SAMPLES)samples.delete(samples.keys().next().value!);
 const value=downloadLibraryVoicePreview(voiceId);
 samples.set(voiceId,{until:Date.now()+TTL,value});
 void value.catch(()=>{if(samples.get(voiceId)?.value===value)samples.delete(voiceId);});
 return value;
}
async function downloadLibraryVoicePreview(voiceId:string):Promise<Sample>{
 const voice=await getVoice(voiceId);
 if(!voice.preview_url)throw Error('This voice has no saved library sample.');
 const {buffer,contentType}=await safeDownload(voice.preview_url,10*1024*1024,0,Date.now()+30000);
 // Do not serve a provider HTML/XML error page as an audio file.
 const type=contentType.split(';',1)[0].toLowerCase();
 const mp3=buffer.subarray(0,3).toString()==='ID3'||buffer.length>1&&buffer[0]===255&&(buffer[1]&224)===224;
 const wav=buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WAVE';
 const ogg=buffer.subarray(0,4).toString()==='OggS';
 const mp4=buffer.subarray(4,8).toString()==='ftyp';
 if(!buffer.length||!(mp3||wav||ogg||mp4))throw Error(LIBRARY_PREVIEW_ERROR);
 return {buffer,contentType:type.startsWith('audio/')?type:mp3?'audio/mpeg':wav?'audio/wav':ogg?'audio/ogg':'audio/mp4'};
}
