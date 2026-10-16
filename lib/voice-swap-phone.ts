import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {swapFfmpeg} from './voice-swap-audio';
/** Mild phone-microphone colour, not a telephone/radio effect. No echo or extra paid ambience. */
export async function phoneRecording(audio:ArrayBuffer){
 const dir=await mkdtemp(join(tmpdir(),'swap-phone-'));try{
  const input=join(dir,'dry.wav'),output=join(dir,'phone.wav');await writeFile(input,Buffer.from(audio),{mode:0o600});
  await swapFfmpeg(['-v','error','-i',input,'-af','highpass=f=90,lowpass=f=9000,equalizer=f=320:t=q:w=0.8:g=-1.5,equalizer=f=3800:t=q:w=0.8:g=-2,acompressor=threshold=0.12:ratio=1.4:attack=15:release=160:makeup=1','-ar','44100','-ac','1','-c:a','pcm_s16le',output]);
  return new Uint8Array(await readFile(output)).buffer;
 }finally{await rm(dir,{recursive:true,force:true});}
}
