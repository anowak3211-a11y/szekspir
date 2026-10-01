import {listVoices,generatePauseSample,ELEVEN_MODEL_ID} from '@/lib/elevenlabs';
import {voiceProcessing,breathsEnabled} from '@/lib/voice-processing';
import {cleanVoiceover,VO_CLEANUP_VERSION} from '@/lib/vo-cleanup';
import {existingMedia,putMedia} from '@/lib/media';
import {withEditorLocks} from '@/lib/editor-locks';
import {createHash} from 'node:crypto';
import ffmpeg from 'ffmpeg-static';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
export const maxDuration=300;
export async function POST(req:Request){
 try{
  const body=await req.json(),processing=voiceProcessing(body.processing);
  if(typeof body.voiceId!=='string'||!body.voiceId.match(/^[a-zA-Z0-9_-]{1,100}$/))return Response.json({error:'Choose a voice first.'},{status:400});
  const key=createHash('sha256').update(body.voiceId).digest('hex').slice(0,24);
  const originalPath=`vo/preview-${key}-10s-${ELEVEN_MODEL_ID}.wav`;
  let original=await existingMedia(originalPath);
  if(!original){
   original=await withEditorLocks(['pause-sample-'+key],async()=>{
    const cached=await existingMedia(originalPath);if(cached)return cached;
    const voice=(await listVoices()).find(v=>v.voice_id===body.voiceId);
    if(!voice)throw Error('Choose a voice from the current list.');
    const dir=await mkdtemp(join(tmpdir(),'voice-preview-'));
    try{
     const input=join(dir,'input.audio'),output=join(dir,'sample.wav');
     const run=promisify(execFile);
     async function duration(){const r=await run(ffmpeg!,['-v','error','-i',input,'-f','null','-','-progress','pipe:1']);return Math.max(...[...r.stdout.matchAll(/out_time_us=(\d+)/g)].map(m=>Number(m[1])))/1e6;}
     let seconds=0;
     if(voice.preview_url){const r=await fetch(voice.preview_url,{signal:AbortSignal.timeout(30000)});if(r.ok){await writeFile(input,Buffer.from(await r.arrayBuffer()));seconds=await duration();}}
     if(seconds<10){
      const rawPath=`vo/preview-${key}-generated-${ELEVEN_MODEL_ID}.mp3`;
      let saved=await existingMedia(rawPath);
      if(!saved)saved=await putMedia(rawPath,Buffer.from(await generatePauseSample(body.voiceId)),'audio/mpeg');
      const r=await fetch(saved,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Could not load the saved comparison sample.');
      await writeFile(input,Buffer.from(await r.arrayBuffer()));seconds=await duration();
     }
     if(seconds<10)throw Error('The saved sample is too short. Please choose another voice.');
     await run(ffmpeg!,['-nostdin','-hide_banner','-loglevel','error','-i',input,'-t','10','-vn','-c:a','pcm_f32le',output],{timeout:30000});
     return putMedia(originalPath,await readFile(output),'audio/wav');
    }finally{await rm(dir,{recursive:true,force:true});}
   });
  }

  const processedPath=`vo/preview-${key}-${ELEVEN_MODEL_ID}-${VO_CLEANUP_VERSION}-${processing.mode}-${breathsEnabled(processing)?'breaths':'plain'}-${processing.normalize?'norm':'plain'}.wav`;
  let processed=await existingMedia(processedPath);
  if(!processed){
   const response=await fetch(original,{signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error('Could not load the saved sample.');
   processed=await putMedia(processedPath,Buffer.from(await cleanVoiceover(await response.arrayBuffer(),undefined,processing)),'audio/wav');
  }
  return Response.json({original,processed});
 }catch(e){return Response.json({error:(e as Error).message},{status:400});}
}
