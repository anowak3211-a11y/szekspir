import { NextResponse } from 'next/server';
import { accountRoute } from '@/lib/account-route';
import { safeDownload } from '@/lib/safe-fetch';
import {
  DEFAULT_MELLOW_REFERENCES,
  type KieRipperModel,
  analyzeCompetitorAdWithVision,
  buildImageRipperPrompt,
  buildKieCreateTaskPayload,
  detectAspectRatio,
  loadRipperInitData,
  parseDataUrlToBuffer,
  pollKieRipperTask,
  submitKieRipperTask,
  uploadBufferToKie,
  uploadPublicReferenceToKie,
} from '@/lib/image-ripper';
import { getProducts } from '@/lib/products';

export const maxDuration = 300;

export const GET = accountRoute(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'init';

    if (action === 'poll') {
      const taskId = searchParams.get('taskId')?.trim();
      if (!taskId) {
        return NextResponse.json({ error: 'Brak parametru taskId' }, { status: 400 });
      }
      const status = await pollKieRipperTask(taskId);
      return NextResponse.json(status);
    }

    if (action === 'download') {
      const targetUrl = searchParams.get('url')?.trim();
      const rawName = (searchParams.get('name') || 'mellow-ripper-2k.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      if (!targetUrl || !/^https:\/\//i.test(targetUrl)) {
        return NextResponse.json({ error: 'Dozwolone są wyłącznie adresy https://' }, { status: 400 });
      }
      const { buffer, contentType } = await safeDownload(targetUrl, 35 * 1024 * 1024);
      const ext = contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : '.jpg';
      const finalName = /\.(jpg|jpeg|png|webp)$/i.test(rawName) ? rawName : `${rawName}${ext}`;
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': contentType.startsWith('image/') ? contentType : 'image/jpeg',
          'Content-Disposition': `attachment; filename="${finalName}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const initData = await loadRipperInitData();
    return NextResponse.json(initData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Błąd serwera Image Ripper';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const POST = accountRoute(async (req: Request) => {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin) {
      return new Response('Invalid origin', { status: 403 });
    }

    const raw = await req.text();
    if (raw.length > 25_000_000) {
      return NextResponse.json({ error: 'Payload przekracza limit 25 MB' }, { status: 413 });
    }

    const body = JSON.parse(raw) as {
      action?: 'submit' | 'upscale';
      sourceDataUrl?: string;
      fileName?: string;
      aspectRatio?: string;
      width?: number;
      height?: number;
      productName?: string;
      customInstructions?: string;
      customPrompt?: string;
      model?: KieRipperModel;
      referenceIds?: string[];
      customReferenceDataUrls?: string[];
      useVision?: boolean;
      imageUrl?: string;
      imageDataUrl?: string;
    };

    const action = body.action || 'submit';

    if (action === 'upscale') {
      let targetUrl = body.imageUrl?.trim();
      if (!targetUrl && body.imageDataUrl) {
        const { buffer, mimeType, ext } = parseDataUrlToBuffer(body.imageDataUrl);
        const safeName = (body.fileName || `upscale-${Date.now()}.${ext}`).replace(/[^a-zA-Z0-9._-]/g, '_');
        targetUrl = await uploadBufferToKie(buffer, safeName, mimeType);
      }
      if (!targetUrl) {
        return NextResponse.json({ error: 'Brak obrazu do upscale (imageUrl lub imageDataUrl)' }, { status: 400 });
      }
      const payload = buildKieCreateTaskPayload({
        model: 'recraft/crisp-upscale',
        imageUrls: [targetUrl],
      });
      const taskId = await submitKieRipperTask(payload);
      return NextResponse.json({ taskId, sourceKieUrl: targetUrl });
    }

    if (!body.sourceDataUrl) {
      return NextResponse.json({ error: 'Brak obrazu źródłowego (sourceDataUrl)' }, { status: 400 });
    }

    const { buffer, mimeType, ext } = parseDataUrlToBuffer(body.sourceDataUrl);
    const cleanFileName = (body.fileName || `competitor-${Date.now()}.${ext}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const sourceKieUrl = await uploadBufferToKie(buffer, cleanFileName, mimeType);

    const selectedModel: KieRipperModel = body.model || 'nano-banana-pro';
    const resolvedAspectRatio =
      body.aspectRatio && body.aspectRatio !== 'auto'
        ? body.aspectRatio
        : detectAspectRatio(body.width, body.height);

    if (selectedModel === 'recraft/crisp-upscale') {
      const payload = buildKieCreateTaskPayload({
        model: 'recraft/crisp-upscale',
        imageUrls: [sourceKieUrl],
      });
      const taskId = await submitKieRipperTask(payload);
      return NextResponse.json({
        taskId,
        prompt: 'Recraft Crisp 2K Upscale',
        sourceKieUrl,
        aspectRatio: resolvedAspectRatio,
      });
    }

    const refKieUrls: string[] = [];
    const requestedRefIds = Array.isArray(body.referenceIds)
      ? body.referenceIds
      : DEFAULT_MELLOW_REFERENCES.map((r) => r.id);

    for (const refId of requestedRefIds) {
      const found = DEFAULT_MELLOW_REFERENCES.find((r) => r.id === refId);
      if (found && refKieUrls.length < 3) {
        try {
          const url = await uploadPublicReferenceToKie(found.path);
          refKieUrls.push(url);
        } catch {
          // continue if a local reference file is missing
        }
      }
    }

    if (Array.isArray(body.customReferenceDataUrls)) {
      for (let i = 0; i < body.customReferenceDataUrls.length && refKieUrls.length < 3; i++) {
        const refDataUrl = body.customReferenceDataUrls[i];
        if (!refDataUrl) continue;
        const parsedRef = parseDataUrlToBuffer(refDataUrl);
        const uploadedCustomUrl = await uploadBufferToKie(
          parsedRef.buffer,
          `custom-ref-${i + 1}-${Date.now()}.${parsedRef.ext}`,
          parsedRef.mimeType
        );
        refKieUrls.push(uploadedCustomUrl);
      }
    }

    const productName = body.productName?.trim() || 'Mellow Mood Munchies';
    let productContext = '';
    try {
      const products = await getProducts();
      const matched = products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
      if (matched?.markdown) {
        productContext = matched.markdown;
      }
    } catch {
      productContext = '';
    }

    let prompt = body.customPrompt?.trim() || '';
    let visionAnalysis;

    if (!prompt) {
      if (body.useVision !== false) {
        const analyzed = await analyzeCompetitorAdWithVision(
          body.sourceDataUrl,
          productName,
          productContext,
          body.customInstructions,
          resolvedAspectRatio
        );
        prompt = analyzed.prompt;
        visionAnalysis = analyzed.visionAnalysis;
      } else {
        prompt = buildImageRipperPrompt({
          productName,
          productContext,
          customInstructions: body.customInstructions,
          aspectRatio: resolvedAspectRatio,
        });
      }
    }

    const payload = buildKieCreateTaskPayload({
      model: selectedModel,
      prompt,
      imageUrls: [sourceKieUrl, ...refKieUrls],
      aspectRatio: resolvedAspectRatio,
      resolution: '2K',
    });

    const taskId = await submitKieRipperTask(payload);

    return NextResponse.json({
      taskId,
      prompt,
      visionAnalysis,
      sourceKieUrl,
      aspectRatio: resolvedAspectRatio,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nie udało się uruchomić zadania Kie.ai';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
