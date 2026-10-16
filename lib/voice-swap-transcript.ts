import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import type {VoiceSwap} from './voice-swap-model';
import {downloadSwapMedia} from './voice-swap-audio';
import {transcribeWithDuration} from './localize';
type Update=(fn:(s:VoiceSwap)=>void)=>Promise<void>;
/** Reuse the isolated vocal MP3, not another video transfer or stem separation. */
export async function advanceSwapTranscript(s:VoiceSwap,update:Update,dir:string){
 if(s.transcript!==undefined){await update(x=>{x.status='review';});return;}
 if(s.transcriptionSubmitted){await update(x=>{x.status='review';x.transcriptionError='Wynik poprzedniej transkrypcji nie został potwierdzony. Wklej tekst ręcznie; nie ponawiamy płatnego żądania.';});return;}
 if(!s.vocalsUrl)throw Error('Saved original voice is missing.');
 const path=join(dir,'original-voice.mp3');await downloadSwapMedia(s.vocalsUrl,path,24*1024*1024);
 const bytes=await readFile(path);await update(x=>{x.transcriptionSubmitted=true;});
 try{
  const result=await transcribeWithDuration(new File([new Uint8Array(bytes)],'original-voice.mp3',{type:'audio/mpeg'}));
  await update(x=>{x.transcript=result.text.trim();x.transcriptionError=x.transcript?'':'Nie wykryto mowy. Możesz wpisać skrypt ręcznie.';x.status='review';x.error=undefined;});
 }catch{
  // A transcription failure must not discard the paid stems or prevent manual narration.
  await update(x=>{x.status='review';x.transcriptionError='Nie udało się potwierdzić transkrypcji. Wklej tekst ręcznie; zapisane tło pozostaje gotowe. Nie ponawiamy płatnego żądania.';});
 }
}
