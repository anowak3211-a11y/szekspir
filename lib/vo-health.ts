import {cleanVoiceover,VO_CLEANUP_VERSION} from './vo-cleanup';
// Authenticated operational check: fixed synthetic audio, no provider calls or saved media.
export async function voiceoverHealth(){
 const rate=16000,samples=rate*3,wav=Buffer.alloc(44+samples*2);
 wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples*2,40);
 for(let i=0;i<samples;i++)wav.writeInt16LE(i>=rate&&i<2*rate?0:Math.round(10000*Math.sin(2*Math.PI*440*i/rate)),44+i*2);
 const clean=await cleanVoiceover(new Uint8Array(wav).buffer);
 return {ok:true,cleanupVersion:VO_CLEANUP_VERSION,outputBytes:clean.byteLength};
}
