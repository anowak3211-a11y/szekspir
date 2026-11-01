import {accountRoute} from '@/lib/account-route';
import {assertJobActive} from '@/lib/cancellation';
import {sendsHook} from '@/lib/hook-delivery';
import {voiceProcessing} from '@/lib/voice-processing';
import {withEditorLocks} from '@/lib/editor-locks';
import {syncAssignedEditor} from '@/lib/editor-sync';
import {getJob,stripPlaceholderTokens,Job} from '@/lib/jobs';
import {mutate} from '@/lib/store';
import {updateVoiceover} from '@/lib/sheets';
import {voiceLinks} from '@/lib/voice-links';
import { NextRequest, NextResponse } from "next/server";
import {narration} from "@/lib/speech";
import { generateVO } from "@/lib/elevenlabs";

export const maxDuration = 300;

async function accountPOST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'set-podcast-url') {
      const { jobId, voUrl, voOriginalUrl } = body as { jobId: string; voUrl: string; voOriginalUrl?: string };
      if (!jobId || !voUrl) return NextResponse.json({ error: 'jobId and voUrl required' }, { status: 400 });
      const updated = await mutate<Job | null, Job>(`job-${jobId}`, null, j => {
        if (!j?.result) throw Error('Job missing');
        const rev = j.revision || 0;
        j.voApprovedRevision = rev;
        j.generateVo = true;
        j.voUrl = voUrl;
        j.voOriginalUrl = voOriginalUrl || voUrl;
        j.voNeedsRegeneration = false;
        j.uncertain = false;
        j.error = undefined;
        j.step = 'done';
        j.status = 'Complete';
        j.stages = { ...j.stages, vo: { done: true, pending: false, uncertain: false, error: undefined, finished: Date.now() }, references: { done: true, finished: Date.now() } };
        j.updated = Date.now();
        return structuredClone(j);
      });
      if (updated.adId) {
        const { updateReference } = await import('@/lib/sheets');
        const { videoLinks } = await import('@/lib/video-links');
        await withEditorLocks(['ad-' + updated.adId], async () => {
          await updateVoiceover(updated.adId!, voiceLinks(updated));
          await updateReference(updated.adId!, videoLinks(updated), voiceLinks(updated));
        });
        await syncAssignedEditor(updated.adId).catch(() => {});
      }
      return NextResponse.json({ ok: true, job: updated });
    }
    if (body.action === 'save-podcast-vo') {
      const { jobId, turnUrls, tempoFactor = 1.06, script: newScript } = body as { jobId: string; turnUrls: { url: string; gap?: number }[]; tempoFactor?: number; script?: string };
      if (!jobId || !Array.isArray(turnUrls) || !turnUrls.length) return NextResponse.json({ error: 'jobId and turnUrls required' }, { status: 400 });
      const ffmpeg = (await import('ffmpeg-static')).default;
      if (!ffmpeg) throw Error('ffmpeg unavailable');
      const { execFile } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const { mkdtemp, writeFile, readFile, rm } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const { join } = await import('node:path');
      const run = promisify(execFile);
      const dir = await mkdtemp(join(tmpdir(), 'szekspir-podcast-'));
      try {
        const cleanedPaths: string[] = [];
        for (let i = 0; i < turnUrls.length; i++) {
          const item = turnUrls[i];
          const res = await fetch(item.url);
          if (!res.ok) throw Error(`Failed to fetch turn ${i}`);
          const inWav = join(dir, `in_${i}.wav`);
          const outWav = join(dir, `out_${i}.wav`);
          await writeFile(inWav, Buffer.from(await res.arrayBuffer()));
          const gap = typeof item.gap === 'number' && item.gap > 0 ? item.gap : 0;
          const af = [
            'silenceremove=start_periods=1:start_duration=0.005:start_threshold=-40dB',
            'areverse',
            'silenceremove=start_periods=1:start_duration=0.005:start_threshold=-40dB',
            'areverse',
            'aresample=44100',
            'aformat=sample_fmts=s16:channel_layouts=mono',
            ...(gap > 0 ? [`apad=pad_dur=${gap}`] : [])
          ].join(',');
          await run(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', inWav, '-af', af, outWav], { timeout: 60000 });
          cleanedPaths.push(outWav);
        }
        const concatFile = join(dir, 'concat.txt');
        await writeFile(concatFile, cleanedPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));
        const joinedWav = join(dir, 'joined.wav');
        await run(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', concatFile, '-c', 'copy', joinedWav], { timeout: 90000 });
        const finalWav = join(dir, 'final.wav');
        const origMp3 = join(dir, 'original.mp3');
        const tempo = Number.isFinite(tempoFactor) && tempoFactor >= 0.8 && tempoFactor <= 1.25 ? tempoFactor : 1.06;
        await run(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', joinedWav, '-af', `atempo=${tempo}`, finalWav], { timeout: 90000 });
        await run(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', joinedWav, '-b:a', '192k', origMp3], { timeout: 90000 });
        const { putMedia } = await import('@/lib/media');
        const { audioDuration } = await import('@/lib/vo-cleanup');
        const origDur = await audioDuration(joinedWav);
        const finalDur = await audioDuration(finalWav);
        const before = await getJob(jobId);
        if (!before) throw Error('Job not found');
        const rev = (before.revision || 0) + 1;
        const wavUrl = await putMedia(`vo/${jobId}-r${rev}.wav`, await readFile(finalWav), 'audio/wav');
        const mp3Url = await putMedia(`vo/${jobId}-r${rev}-original.mp3`, await readFile(origMp3), 'audio/mpeg');
        const updated = await mutate<Job | null, Job>(`job-${jobId}`, null, j => {
          if (!j?.result) throw Error('Job missing');
          if (typeof newScript === 'string' && newScript.trim()) j.result.uk_script = newScript.trim();
          j.revision = rev;
          j.voApprovedRevision = rev;
          j.generateVo = true;
          j.voUrl = wavUrl;
          j.voOriginalUrl = mp3Url;
          j.voNeedsRegeneration = false;
          j.voTiming = { originalSeconds: origDur, trimmedSeconds: finalDur, removedSeconds: Math.max(0, origDur - finalDur), cleanupVersion: 'podcast-dual-v1' };
          j.stages = { ...j.stages, vo: { done: true, pending: false, finished: Date.now() } };
          j.updated = Date.now();
          return structuredClone(j);
        });
        if (updated.adId) {
          const { updateReference } = await import('@/lib/sheets');
          const { videoLinks } = await import('@/lib/video-links');
          await withEditorLocks(['ad-' + updated.adId], async () => {
            await updateVoiceover(updated.adId!, voiceLinks(updated));
            await updateReference(updated.adId!, videoLinks(updated), voiceLinks(updated));
          });
          await syncAssignedEditor(updated.adId).catch(() => {});
        }
        return NextResponse.json({ ok: true, voUrl: wavUrl, voOriginalUrl: mp3Url, duration: finalDur, originalDuration: origDur, job: updated });
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    }
    const { text: rawText, voiceId, save, jobId, hookIndex, voiceProcessing: processingInput } = body;
    const text = typeof rawText === 'string' ? stripPlaceholderTokens(rawText) : '';
    const processing=voiceProcessing(processingInput);
    if (!text?.trim() || !voiceId) {
      return NextResponse.json(
        { error: "text and voiceId required" },
        { status: 400 }
      );
    }
    if(jobId){
      if(!Number.isInteger(hookIndex)||hookIndex<0||hookIndex>1)throw Error('Invalid hook');
      await mutate<Job|null,void>(`job-${jobId}`,null,j=>{if(j?.abortedAt)throw Error('This job was stopped');if(!j?.result)throw Error('Wait for the script to finish');if(j.voiceoverEnabled===false)throw Error('Enable voiceover before recording a hook.');j.hookDeliveryPending=undefined;if(!sendsHook(j,hookIndex))throw Error('Select Send to editor before recording this hook.');j.hookVoPending={...j.hookVoPending,[hookIndex]:true};j.hookVoInputs={...j.hookVoInputs,[hookIndex]:{text,voiceId}};});
    }
    const market=jobId?(await getJob(jobId))?.market:undefined;
    if(jobId)await assertJobActive(jobId);
    const audio = await generateVO(narration(text,market), voiceId,jobId?async(raw,timing)=>{await assertJobActive(jobId);const {putMedia}=await import('@/lib/media');const original=await putMedia(`vo/${crypto.randomUUID()}-original.mp3`,Buffer.from(raw),'audio/mpeg');await mutate<Job|null,void>(`job-${jobId}`,null,j=>{if(!j||j.abortedAt||j.cancelledAt)throw Error('This job was stopped.');j.hookVoOriginalUrls={...j.hookVoOriginalUrls,[hookIndex]:original};j.hookVoTimings={...j.hookVoTimings,[hookIndex]:timing};});}:undefined,processing,jobId?'hook':'voiceover',market);
    if (save || jobId) {
      if(jobId)await assertJobActive(jobId);
      const { putMedia } = await import("@/lib/media");
      const url = await putMedia(`vo/${crypto.randomUUID()}_vo_uk.wav`, Buffer.from(audio), "audio/wav");
      if(jobId){
        await mutate<Job|null,void>(`job-${jobId}`,null,j=>{if(!j||j.abortedAt||j.cancelledAt)throw Error('This job was stopped.');j.hookVoUrls={...j.hookVoUrls,[hookIndex]:url};j.hookVoPending={...j.hookVoPending,[hookIndex]:false};j.result!.hooks[hookIndex]=text;j.hookVoNeedsRegeneration={...j.hookVoNeedsRegeneration,[hookIndex]:false};});
        const job=await getJob(jobId);if(job?.adId){await withEditorLocks(['ad-'+job.adId],async()=>{const latest=await getJob(jobId);if(latest?.adId)await updateVoiceover(latest.adId,voiceLinks(latest));}).catch(()=>{});await syncAssignedEditor(job.adId).catch(()=>{});}
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
    return NextResponse.json({ error: msg }, { status: /^This job was stopped\.?$/.test(msg) ? 409 : 500 });
  }
}

export const POST=accountRoute(accountPOST);
