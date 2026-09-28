import {sendsHook} from '@/lib/hook-delivery';
import {voiceProcessing} from '@/lib/voice-processing';
import {withEditorLocks} from '@/lib/editor-locks';
import {syncAssignedEditor} from '@/lib/editor-sync';
import {getJob,Job} from '@/lib/jobs';
import {mutate} from '@/lib/store';
import {updateVoiceover} from '@/lib/sheets';
import {voiceLinks} from '@/lib/voice-links';
import { NextRequest, NextResponse } from "next/server";
import {narration} from "@/lib/speech";
import {hasTokens} from "@/lib/validation";
import { generateVO } from "@/lib/elevenlabs";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, save, jobId, hookIndex, voiceProcessing: processingInput } = await req.json();
    const processing=voiceProcessing(processingInput);
    if (!text?.trim() || !voiceId) {
      return NextResponse.json(
        { error: "text and voiceId required" },
        { status: 400 }
      );
    }
    if(hasTokens(text)) return NextResponse.json({error:"Fill in missing product details before generating narration"},{status:400});
    if(jobId){
      if(!Number.isInteger(hookIndex)||hookIndex<0||hookIndex>1)throw Error('Invalid hook');
      await mutate<Job|null,void>(`job-${jobId}`,null,j=>{if(j?.abortedAt)throw Error('This job was stopped');if(!j?.result||!j.adId)throw Error('Save the brief before recording hooks');if(j.hookDeliveryPending!==undefined)throw Error('Finish saving the hook delivery selection first.');if(!sendsHook(j,hookIndex))throw Error('Select Send to editor before recording this hook.');if(j.hookVoPending?.[hookIndex])throw Error('This hook is already recording or needs checking');j.hookVoPending={...j.hookVoPending,[hookIndex]:true};j.hookVoInputs={...j.hookVoInputs,[hookIndex]:{text,voiceId}};});
    }
    const audio = await generateVO(narration(text), voiceId,jobId?async(raw,timing)=>{const {putMedia}=await import('@/lib/media');const original=await putMedia(`vo/${crypto.randomUUID()}-original.mp3`,Buffer.from(raw),'audio/mpeg');await mutate<Job|null,void>(`job-${jobId}`,null,j=>{if(!j)throw Error('Job missing');j.hookVoOriginalUrls={...j.hookVoOriginalUrls,[hookIndex]:original};j.hookVoTimings={...j.hookVoTimings,[hookIndex]:timing};});}:undefined,processing,jobId?'hook':'voiceover');
    if (save || jobId) {
      const { putMedia } = await import("@/lib/media");
      const url = await putMedia(`vo/${crypto.randomUUID()}_vo_uk.wav`, Buffer.from(audio), "audio/wav");
      if(jobId){
        await mutate<Job|null,void>(`job-${jobId}`,null,j=>{if(!j)throw Error('Job missing');j.hookVoUrls={...j.hookVoUrls,[hookIndex]:url};j.hookVoPending={...j.hookVoPending,[hookIndex]:false};j.result!.hooks[hookIndex]=text;j.hookVoNeedsRegeneration={...j.hookVoNeedsRegeneration,[hookIndex]:false};});
        const job=await getJob(jobId);if(job?.adId){await withEditorLocks(['ad-'+job.adId],async()=>{const latest=await getJob(jobId);if(latest?.adId)await updateVoiceover(latest.adId,voiceLinks(latest));});await syncAssignedEditor(job.adId);}
      }
      return NextResponse.json({ url });
    }
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": 'attachment; filename="vo_uk.wav"',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
