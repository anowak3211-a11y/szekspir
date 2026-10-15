import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {audioDuration,type VoiceTiming} from './vo-cleanup';
export type PhraseAnchor={voiceSeconds:number;sourceSeconds:number};
export function validatePhraseAnchor(anchor:PhraseAnchor){
 if(!anchor||![anchor.voiceSeconds,anchor.sourceSeconds].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0&&n<=1800)||anchor.voiceSeconds/anchor.sourceSeconds<.75||anchor.voiceSeconds/anchor.sourceSeconds>1.35)throw Error('Choose valid phrase anchors; tempo must stay between 0.75× and 1.35×.');
}
/** Stretch only the lead-in to one verified phrase; retain the remainder and pitch. */
export async function fitPhraseAnchor(audio:ArrayBuffer,timing:VoiceTiming,anchor:PhraseAnchor){
 validatePhraseAnchor(anchor);
 if(anchor.voiceSeconds>=timing.trimmedSeconds-.1)throw Error('Voice anchor must be inside the recording.');
 if(!ffmpeg)throw Error('Phrase timing is unavailable.');
 const dir=await mkdtemp(join(tmpdir(),'szekspir-phrase-'));
 try{
  const input=join(dir,'input.wav'),output=join(dir,'output.wav');await writeFile(input,Buffer.from(audio),{mode:0o600});
  const v=anchor.voiceSeconds,s=anchor.sourceSeconds;
  const filter=`[0:a]asplit=2[a][b];[a]atrim=end=${v},asetpts=PTS-STARTPTS,atempo=${v/s},apad,atrim=duration=${s}[lead];[b]atrim=start=${v},asetpts=PTS-STARTPTS[rest];[lead][rest]concat=n=2:v=0:a=1[out]`;
  await promisify(execFile)(ffmpeg,['-v','error','-nostdin','-n','-i',input,'-filter_complex',filter,'-map','[out]','-c:a','pcm_f32le',output],{timeout:90000,maxBuffer:1024*1024});
  const duration=await audioDuration(output),expected=timing.trimmedSeconds+s-v;
  if(Math.abs(duration-expected)>.1)throw Error('Phrase timing could not be confirmed.');
  timing.phraseAlignment={...anchor,inputSeconds:timing.trimmedSeconds,outputSeconds:duration};timing.trimmedSeconds=duration;
  timing.processing={...timing.processing!,matchSourcePace:true,mode:'gentle',normalize:false};
  return new Uint8Array(await readFile(output)).buffer;
 }finally{await rm(dir,{recursive:true,force:true});}
}
