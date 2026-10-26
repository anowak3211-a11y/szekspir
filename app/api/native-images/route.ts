import { NextResponse } from 'next/server';
import { accountEnv } from '@/lib/account-context';
import { accountRoute } from '@/lib/account-route';
import {
  buildKieCreateTaskPayload,
  parseDataUrlToBuffer,
  pollKieRipperTask,
  submitKieRipperTask,
  uploadBufferToKie,
  uploadPublicReferenceToKie,
} from '@/lib/image-ripper';
import {
  type NativeBrandKind,
  type NativeMarketKind,
  detectScriptMarket,
  formatRawIphoneKiePrompt,
  planNativeIphoneScenesFromScript,
} from '@/lib/native-iphone-scenes';
import { getProducts } from '@/lib/products';
import { safeDownload } from '@/lib/safe-fetch';

export const maxDuration = 300;

const BUILTIN_BRAND_REF_PATHS: Partial<Record<NativeBrandKind, string>> = {
  'mellow-uk': '/brand-references/mellow-packshot-front-uk.jpg',
  'sardian-strap': '/stryde-pl-images/sardian-ref-main.jpg',
  feliora: '/feliora-pl-images/feliora-ref-duck.jpg',
  'feliora-dog': '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
  orthomax: '/antki-pl-images/orthomax-stepmax-packshot.jpg',
};

export const GET = accountRoute(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'init';

    if (action === 'poll') {
      const taskId = (searchParams.get('taskId') || '').trim();
      if (!taskId) {
        return NextResponse.json({ error: 'Brak parametru taskId' }, { status: 400 });
      }
      const status = await pollKieRipperTask(taskId);
      return NextResponse.json(status);
    }

    if (action === 'download') {
      const targetUrl = (searchParams.get('url') || '').trim();
      const rawName = (searchParams.get('name') || '1.png').replace(/[^a-zA-Z0-9._-]/g, '_');
      if (!targetUrl || !/^https:\/\//i.test(targetUrl)) {
        return NextResponse.json({ error: 'Dozwolone są wyłącznie adresy https://' }, { status: 400 });
      }
      const { buffer, contentType } = await safeDownload(targetUrl, 35 * 1024 * 1024);
      const ext = contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : '.jpg';
      const finalName = /\.(jpg|jpeg|png|webp)$/i.test(rawName) ? rawName : `${rawName}${ext}`;
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': contentType.startsWith('image/') ? contentType : 'image/png',
          'Content-Disposition': `attachment; filename="${finalName}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    let products: { name: string; markdown: string }[] = [];
    try {
      products = await getProducts();
    } catch {
      products = [];
    }

    return NextResponse.json({
      hasKieKey: Boolean(accountEnv('KIE_API_KEY') || process.env.KIE_API_KEY),
      products: products.map(p => ({
        name: p.name,
        markdown: (p.markdown || '').slice(0, 3000),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Błąd serwera Native Images';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});

export const POST = accountRoute(async (req: Request) => {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin) {
      return new Response('Invalid origin', { status: 403 });
    }

    const raw = await req.text();
    if (raw.length > 20_000_000) {
      return NextResponse.json({ error: 'Payload przekracza limit 20 MB' }, { status: 413 });
    }

    const body = JSON.parse(raw) as {
      action?: 'plan_and_submit' | 'submit_single';
      primaryText?: string;
      headline?: string;
      title?: string;
      instructionText?: string;
      market?: NativeMarketKind;
      brand?: NativeBrandKind;
      count?: number;
      aspectRatio?: '3:4' | '1:1' | '4:5';
      productReferenceDataUrl?: string;
      scenePrompt?: string;
      label?: string;
      includeProductRef?: boolean;
    };

    const action = body.action || 'plan_and_submit';
    const brand: NativeBrandKind = body.brand || 'custom';
    const primaryText = (body.primaryText || '').trim();
    const headline = (body.headline || '').trim();
    const title = (body.title || 'Folder skryptu').trim();
    const instructionText = (body.instructionText || '').trim();
    const aspectRatio = body.aspectRatio || '3:4';
    const resolvedMarket = detectScriptMarket(primaryText, body.market || 'auto');

    let refKieUrl = '';
    if (body.productReferenceDataUrl) {
      try {
        const parsedRef = parseDataUrlToBuffer(body.productReferenceDataUrl);
        refKieUrl = await uploadBufferToKie(
          parsedRef.buffer,
          `native-prod-ref-${Date.now()}.${parsedRef.ext}`,
          parsedRef.mimeType,
        );
      } catch {
        refKieUrl = '';
      }
    } else if (BUILTIN_BRAND_REF_PATHS[brand]) {
      try {
        refKieUrl = await uploadPublicReferenceToKie(BUILTIN_BRAND_REF_PATHS[brand]!);
      } catch {
        refKieUrl = '';
      }
    }

    if (action === 'submit_single') {
      const scenePrompt = (body.scenePrompt || '').trim();
      if (!scenePrompt) {
        return NextResponse.json({ error: 'Brak opisu sceny (scenePrompt)' }, { status: 400 });
      }
      const includeRef = Boolean(body.includeProductRef && refKieUrl);
      const fullPrompt = formatRawIphoneKiePrompt(
        scenePrompt,
        brand,
        includeRef,
        resolvedMarket,
        instructionText,
      );
      const payload = buildKieCreateTaskPayload({
        model: 'nano-banana-pro',
        prompt: fullPrompt,
        imageUrls: includeRef ? [refKieUrl] : [],
        aspectRatio,
        resolution: '2K',
      });
      const taskId = await submitKieRipperTask(payload);
      return NextResponse.json({
        ok: true,
        taskId,
        label: body.label || 'Regenerated scene',
        scenePrompt,
        fullPrompt,
        marketResolved: resolvedMarket,
      });
    }

    if (primaryText.length < 30) {
      return NextResponse.json(
        { error: 'Wklej treść skryptu (skrypt.txt - minimum 30 znaków).' },
        { status: 400 },
      );
    }

    const targetCount = body.count && body.count >= 15 ? 15 : 12;
    const scenes = await planNativeIphoneScenesFromScript({
      brand,
      market: resolvedMarket,
      primaryText,
      headline,
      title,
      instructionText,
      count: targetCount,
    });

    const submittedTasks: Array<{
      index: number;
      taskId: string;
      label: string;
      scenePrompt: string;
      includeProductRef: boolean;
    }> = [];
    let firstError = '';

    for (let i = 0; i < scenes.length; i += 4) {
      const chunk = scenes.slice(i, i + 4);
      const chunkRes = await Promise.all(
        chunk.map(async (scene, offset) => {
          const index = i + offset + 1;
          try {
            const useRef = Boolean(scene.includeProductRef && refKieUrl);
            const prompt = formatRawIphoneKiePrompt(
              scene.scenePrompt,
              brand,
              useRef,
              resolvedMarket,
              instructionText,
            );
            const payload = buildKieCreateTaskPayload({
              model: 'nano-banana-pro',
              prompt,
              imageUrls: useRef ? [refKieUrl] : [],
              aspectRatio,
              resolution: '2K',
            });
            const taskId = await submitKieRipperTask(payload);
            return {
              index,
              taskId,
              label: scene.label,
              scenePrompt: scene.scenePrompt,
              includeProductRef: useRef,
            };
          } catch (err) {
            if (!firstError) {
              firstError = err instanceof Error ? err.message : 'Błąd Kie.ai';
            }
            return null;
          }
        }),
      );
      for (const item of chunkRes) {
        if (item) submittedTasks.push(item);
      }
      if (submittedTasks.length === 0 && firstError && /402|insufficient credits/i.test(firstError)) {
        break;
      }
    }

    if (submittedTasks.length === 0) {
      return NextResponse.json(
        { error: firstError || 'Nie udało się wysłać zadań do Kie.ai.' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      marketResolved: resolvedMarket,
      tasks: submittedTasks,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Błąd serwera Native Images';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});
