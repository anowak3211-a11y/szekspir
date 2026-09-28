import {pythonCall} from '@/lib/jobs';
import {scheduleEditorSync} from '@/lib/editor-sync-queue';
import {after} from 'next/server';
import {authorised} from '@/lib/auth';
import {scheduleJob,workQueue,createJob,getJob,jobs,retryJob,editJob} from '@/lib/jobs';
import {getProducts,addFile} from '@/lib/products';
import {listVoices} from '@/lib/elevenlabs';
export const maxDuration=300;
function denied(req:Request){return !authorised(req.headers.get('authorization'),true);}
export async function GET(req:Request){
 if(denied(req))return new Response('Unauthorised',{status:401});
 after(async()=>{await workQueue();await scheduleEditorSync();});return Response.json({queued:true},{status:202});
}
// Authenticated machine interface for the uploader/localisation integrations.
// It never returns provider keys, passwords, raw environment or decrypted credentials.
export async function POST(req:Request){
 if(denied(req))return new Response('Unauthorised',{status:401});
 try{
  const body=await req.json();
  if(body.action==='pipeline-health'){const {readyStages}=await import('@/lib/parallel-pipeline');const sample={sourceUrl:'https://example.test/source.mp4',audioUrl:'https://example.test/audio.mp3',video:true,generateVo:true} as import('@/lib/jobs').Job;return Response.json({engine:2,maxConcurrentJobs:3,afterUpload:readyStages(sample),afterLocalisation:readyStages({...sample,stages:{transcribe:{done:true},localise:{done:true},videoSubmit:{done:true},videoPoll:{done:true}}})});}
  if(body.action==='audio-health'){const {voiceoverHealth}=await import('@/lib/vo-health');return Response.json(await voiceoverHealth());}
  if(body.action==='sync-editors'){await scheduleEditorSync();return Response.json({queued:true},{status:202});}
  if(body.action==='import-profile'){
   if(typeof body.product!=='string'||typeof body.profile!=='object'||!body.profile)throw new Error('Product and profile required');
   const text=JSON.stringify(body.profile);if(text.length>49000)throw new Error('Profile too large');
   if(!(await getProducts()).some(p=>p.name===body.product))throw new Error('Product not found');
   await addFile(body.product,'_product_profile.json',text);return Response.json({imported:true});
  }
  if(body.action==='vmake-info')return Response.json(await pythonCall('/api/vmake_status?task_id=capabilities'));
  if(body.action==='video-status'){const j=await getJob(body.id);if(!j?.taskId)throw Error('No video task');return Response.json(await pythonCall('/api/vmake_status?task_id='+encodeURIComponent(j.taskId)));}
  if(body.action==='inspect')return Response.json({job:await getJob(body.id)});
  if(body.action==='metadata'){
   const products=await getProducts();const voices=await listVoices();
   const r=await fetch('https://api.anthropic.com/v1/models',{headers:{'x-api-key':process.env.ANTHROPIC_API_KEY||'','anthropic-version':'2023-06-01'},signal:AbortSignal.timeout(10000)});
   const m=await r.json();
   return Response.json({products:products.map(p=>({name:p.name,files:p.files.map(f=>f.filename)})),voices:voices.map(v=>({id:v.voice_id,name:v.name,accent:v.labels?.accent})),anthropicStatus:r.status,models:m.data?.map((v:{id:string})=>v.id)||[],jobs:(await jobs()).map(j=>({id:j.id,name:j.name,status:j.status,step:j.step})),version:'2026-09-14-background-v2'});
  }
  const job=body.action==='retry'?await retryJob(body.id,!!body.confirmUncertain):body.action==='edit'?await editJob(body.id,body.script,body.hooks):body.action==='enqueue'?await createJob(body.job):null;
  if(!job)return Response.json({error:'Unknown action'},{status:400});
  await scheduleJob(job.id);return Response.json({job},{status:202});
 }catch(e){return Response.json({error:(e as Error).message},{status:400});}
}
