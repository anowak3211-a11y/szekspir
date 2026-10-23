import { NextResponse } from 'next/server';
import { accountRoute } from '@/lib/account-route';
import { mutate, readState } from '@/lib/store';
import {
  STRYDE_ADVERTORIAL_URLS,
  STRYDE_FANPAGES,
  STRYDE_IMAGE_LIBRARY,
  STRYDE_LISTICLE_URL,
  STRYDE_PDP_URL,
  STRYDE_PRESET_ANGLES,
  STRYDE_STAGES,
  buildAllStrydePrewrittenAds,
  sanitizeAndAuditStrydePl,
  type StrydeImageAsset,
  type StrydePlGeneratedAd,
} from '@/lib/stryde-pl';

export const maxDuration = 300;

const STATE_KEY = 'stryde-pl-library-v1-all15-localized';

interface StrydePlLibraryState {
  ads: StrydePlGeneratedAd[];
  customImages?: StrydeImageAsset[];
}

async function readStrydeLibraryState(): Promise<{
  ads: StrydePlGeneratedAd[];
  customImages: StrydeImageAsset[];
}> {
  const defaultAds = buildAllStrydePrewrittenAds();
  try {
    const { value } = await readState<StrydePlLibraryState>(STATE_KEY, {
      ads: defaultAds,
      customImages: [],
    });
    const stored = Array.isArray(value?.ads) ? value.ads : [];
    const customImages = Array.isArray(value?.customImages) ? value.customImages : [];
    if (stored.length === 0) {
      return { ads: defaultAds, customImages };
    }
    const byAngle = new Map<string, StrydePlGeneratedAd>();
    for (const ad of defaultAds) {
      byAngle.set(ad.angleId, ad);
    }
    for (const ad of stored) {
      const baseAd = byAngle.get(ad.angleId);
      if (!baseAd) continue;
      const audited = sanitizeAndAuditStrydePl(
        ad.primaryText || baseAd.primaryText,
        ad.headline || baseAd.headline,
        ad.description || baseAd.description,
      );
      byAngle.set(ad.angleId, {
        ...baseAd,
        ...ad,
        primaryText: audited.primaryText,
        headline: audited.headline,
        description: audited.description,
        wordCount: audited.wordCount,
        characterCount: audited.characterCount,
        auditPassed: audited.auditPassed,
        auditWarnings: audited.auditWarnings,
        auditFixesApplied: audited.auditFixesApplied,
        imageUrl: ad.imageUrl || baseAd.imageUrl,
        imageHash: ad.imageHash || baseAd.imageHash,
        secondImageUrl: ad.secondImageUrl || baseAd.secondImageUrl,
        secondImageHash: ad.secondImageHash || baseAd.secondImageHash,
      });
    }
    const finalAds = Array.from(byAngle.values()).map(ad => {
      const angleImgs = customImages.filter(
        img => img?.angleId === ad.angleId && typeof img?.url === 'string' && img.url.startsWith('http'),
      );
      if (angleImgs.length === 0) return ad;
      const scene1 = angleImgs.find(img => /(?:^|·\s*)1\./.test(img.label || '')) || angleImgs[angleImgs.length - 1];
      const scene2 =
        angleImgs.find(img => /(?:^|·\s*)2\./.test(img.label || '')) ||
        angleImgs.find(img => img.url !== scene1?.url);
      const needsScene1 = !ad.imageUrl || !ad.imageUrl.startsWith('http');
      const needsScene2 = !ad.secondImageUrl || !ad.secondImageUrl.startsWith('http');
      return {
        ...ad,
        ...(needsScene1 && scene1 ? { imageUrl: scene1.url, imageHash: scene1.imageHash || ad.imageHash } : {}),
        ...(needsScene2 && scene2
          ? { secondImageUrl: scene2.url, secondImageHash: scene2.imageHash || ad.secondImageHash }
          : {}),
      };
    });
    return { ads: finalAds, customImages };
  } catch {
    return { ads: defaultAds, customImages: [] };
  }
}

export const GET = accountRoute(async () => {
  try {
    const { ads, customImages } = await readStrydeLibraryState();
    return NextResponse.json({
      presets: STRYDE_PRESET_ANGLES,
      awarenessStages: STRYDE_STAGES,
      fanpages: STRYDE_FANPAGES,
      advertorialUrls: STRYDE_ADVERTORIAL_URLS,
      savedAds: ads,
      imageLibrary: [...customImages, ...STRYDE_IMAGE_LIBRARY],
      metaConfig: {
        advertorialUrl: STRYDE_LISTICLE_URL,
        pdpUrl: STRYDE_PDP_URL,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd ładowania biblioteki Stryde PL.' },
      { status: 500 },
    );
  }
});

export const POST = accountRoute(async (req: Request) => {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      ad?: StrydePlGeneratedAd;
      angleId?: string;
      angleIds?: string[];
      imageUrl?: string;
      imageHash?: string;
      secondImageUrl?: string | null;
      secondImageHash?: string | null;
      dataUrl?: string;
      fileName?: string;
      label?: string;
      taskId?: string;
      prompt?: string;
      primaryText?: string;
      headline?: string;
      title?: string;
    };

    const action = body.action || 'save';

    if (action === 'generate_5_kie_images') {
      if (!(body as Record<string, unknown>).isManual) {
        return NextResponse.json({ ok: true, angleId: body.angleId || '', tasks: [] });
      }
      const {
        buildKieCreateTaskPayload,
        submitKieRipperTask,
        uploadPublicReferenceToKie,
      } = await import('@/lib/image-ripper');
      const { buildStrydeEightKieScenes } = await import('@/lib/stryde-feliora-kie-scenes');

      const angleId = (body.angleId || '').trim();
      const preset = STRYDE_PRESET_ANGLES.find(a => a.id === angleId);
      const primaryText = (body.primaryText || '').trim();
      const headline = (body.headline || preset?.title || '').trim();
      const title = (body.title || preset?.shortTitle || angleId || 'Stryde PL').trim();

      // 8 scenes: 4 Hook-specific scenes (50%) + 3 Noom.pl winner templates + 1 Stryde strap product shot
      const scenes = buildStrydeEightKieScenes({
        angleId,
        primaryText,
        headline,
        title,
      });

      let productRefKieUrl: string | undefined;
      try {
        productRefKieUrl = await uploadPublicReferenceToKie('/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg');
      } catch {
        productRefKieUrl = undefined;
      }

      const taskResults = await Promise.all(
        scenes.map(async (scene, idx) => {
          const isNoomTemplate = scene.label.includes('[WZÓR NOOM');
          const fullPrompt = isNoomTemplate
            ? `${scene.scenePrompt} Raw, unpolished amateur smartphone photo, visible high-ISO sensor grain, natural Polish indoor lighting. STRICT RULES: 90-degree flat-lay tabletop filling 100% of the frame (NO floating table edges), all visible text must be in Polish only (SUMA PLN, never TOTAL), zero AI glow, zero studio bokeh.`
            : `${scene.scenePrompt} Raw, ugly, amateur smartphone snapshot, slight motion blur, visible high-ISO sensor grain, crooked framing, natural Polish home lighting. STRICT BAN: zero AI glow, zero studio lighting, zero letters or logos on the black knee strap.`;
          const payload = buildKieCreateTaskPayload({
            model: 'flux-2/pro-text-to-image',
            prompt: fullPrompt,
            imageUrls: scene.includeProductRef && productRefKieUrl ? [productRefKieUrl] : [],
            aspectRatio: '1:1',
            resolution: '1K',
          });
          try {
            const taskId = await submitKieRipperTask(payload);
            return {
              index: idx + 1,
              label: scene.label,
              prompt: fullPrompt,
              includeProductRef: scene.includeProductRef,
              taskId,
            };
          } catch (err) {
            return {
              index: idx + 1,
              label: scene.label,
              prompt: fullPrompt,
              includeProductRef: scene.includeProductRef,
              taskId: '',
              error: err instanceof Error ? err.message : 'Kie.ai createTask error',
            };
          }
        }),
      );

      const tasks = taskResults.filter(t => Boolean(t.taskId));
      if (tasks.length === 0) {
        const firstErr = taskResults.find(t => 'error' in t && t.error)?.error || 'Kie.ai nie utworzyło żadnego zadania.';
        return NextResponse.json({ error: firstErr }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        angleId,
        tasks,
      });
    }

    if (action === 'poll_kie_image') {
      const { pollKieRipperTask } = await import('@/lib/image-ripper');
      const taskId = (body.taskId || '').trim();
      if (!taskId) {
        return NextResponse.json({ error: 'Brak taskId.' }, { status: 400 });
      }
      const status = await pollKieRipperTask(taskId);
      if (status.state !== 'success' || !status.resultUrl) {
        return NextResponse.json(status);
      }

      const angleId = (body.angleId || '').trim();
      const preset = STRYDE_PRESET_ANGLES.find(a => a.id === angleId);
      const label = (body.label || `Kie.ai Raw #${preset?.number || ''}`).trim();
      const assetId = `kie-stryde-noom-${taskId}`;

      const newAsset: StrydeImageAsset = {
        id: assetId,
        url: status.resultUrl,
        imageHash: '',
        label: preset ? `#${preset.number} · ${label}` : label,
        adsetOrigin: 'Kie.ai Raw Native (50% Hook + 3x Wzór Noom)',
        adOrigin: preset?.code || 'KIE-RAW',
        aspectRatio: '1:1',
        source: 'ai',
        angleId: angleId || undefined,
        kiePrompt: body.prompt || undefined,
      };

      const isScene1 = /^1\./.test(label);
      const isScene2 = /^2\./.test(label);
      const now = Date.now();
      const defaultAds = buildAllStrydePrewrittenAds();
      const updatedState = await mutate<
        StrydePlLibraryState,
        { customImages: StrydeImageAsset[]; ads: StrydePlGeneratedAd[] }
      >(STATE_KEY, { ads: defaultAds, customImages: [] }, state => {
        const customList = Array.isArray(state.customImages) ? [...state.customImages] : [];
        const existingIdx = customList.findIndex(item => item.id === assetId);
        if (existingIdx >= 0) {
          customList[existingIdx] = newAsset;
        } else {
          customList.unshift(newAsset);
        }
        state.customImages = customList.slice(0, 400);

        const adsList = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
        if (angleId && (isScene1 || isScene2)) {
          const adIdx = adsList.findIndex(item => item.angleId === angleId);
          const baseAd = adIdx >= 0 ? adsList[adIdx] : defaultAds.find(a => a.angleId === angleId);
          if (baseAd) {
            const updatedAd: StrydePlGeneratedAd = {
              ...baseAd,
              ...(isScene1
                ? {
                    imageUrl: newAsset.url,
                    imageHash: newAsset.imageHash || baseAd.imageHash,
                  }
                : {}),
              ...(isScene2
                ? {
                    secondImageUrl: newAsset.url,
                    secondImageHash: newAsset.imageHash || baseAd.secondImageHash,
                  }
                : {}),
              updatedAt: now,
            };
            if (adIdx >= 0) {
              adsList[adIdx] = updatedAd;
            } else {
              adsList.push(updatedAd);
            }
          }
        }
        state.ads = adsList;
        return { customImages: state.customImages, ads: state.ads };
      });

      return NextResponse.json({
        state: 'success',
        resultUrl: status.resultUrl,
        asset: newAsset,
        imageLibrary: [...updatedState.customImages, ...STRYDE_IMAGE_LIBRARY],
        savedAds: updatedState.ads,
      });
    }

    if (action === 'save' && body.ad) {
      const defaultAds = buildAllStrydePrewrittenAds();
      const audited = sanitizeAndAuditStrydePl(body.ad.primaryText, body.ad.headline, body.ad.description);
      const updatedAd: StrydePlGeneratedAd = {
        ...body.ad,
        primaryText: audited.primaryText,
        headline: audited.headline,
        description: audited.description,
        wordCount: audited.wordCount,
        characterCount: audited.characterCount,
        auditPassed: audited.auditPassed,
        auditWarnings: audited.auditWarnings,
        auditFixesApplied: audited.auditFixesApplied,
        updatedAt: Date.now(),
      };
      const savedAds = await mutate<StrydePlLibraryState, StrydePlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultAds, customImages: [] },
        state => {
          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
          const idx = list.findIndex(item => item.angleId === updatedAd.angleId || item.id === updatedAd.id);
          if (idx >= 0) {
            list[idx] = updatedAd;
          } else {
            list.push(updatedAd);
          }
          state.ads = list;
          return state.ads;
        },
      );
      return NextResponse.json({ ok: true, ad: updatedAd, savedAds });
    }

    if (action === 'set_image') {
      const targetAngleIds =
        Array.isArray(body.angleIds) && body.angleIds.length > 0
          ? body.angleIds
          : body.angleId
          ? [body.angleId]
          : [];
      if (!targetAngleIds.length) {
        return NextResponse.json({ error: 'Brak angleId.' }, { status: 400 });
      }
      const defaultAds = buildAllStrydePrewrittenAds();
      const now = Date.now();
      const savedAds = await mutate<StrydePlLibraryState, StrydePlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultAds, customImages: [] },
        state => {
          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
          for (const targetAngleId of targetAngleIds) {
            const idx = list.findIndex(item => item.angleId === targetAngleId);
            const baseItem = idx >= 0 ? list[idx] : defaultAds.find(a => a.angleId === targetAngleId);
            if (!baseItem) continue;
            const nextSecondUrl =
              body.secondImageUrl === null || body.secondImageUrl === ''
                ? undefined
                : body.secondImageUrl !== undefined
                ? body.secondImageUrl
                : baseItem.secondImageUrl;
            const nextSecondHash =
              body.secondImageUrl === null || body.secondImageUrl === ''
                ? undefined
                : body.secondImageHash !== undefined
                ? body.secondImageHash || undefined
                : baseItem.secondImageHash;
            const updatedEntry: StrydePlGeneratedAd = {
              ...baseItem,
              ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
              ...(body.imageUrl ? { imageHash: body.imageHash || '' } : {}),
              secondImageUrl: nextSecondUrl,
              secondImageHash: nextSecondHash,
              updatedAt: now,
            };
            if (idx >= 0) {
              list[idx] = updatedEntry;
            } else {
              list.push(updatedEntry);
            }
          }
          state.ads = list;
          return state.ads;
        },
      );
      return NextResponse.json({ ok: true, savedAds });
    }

    if (action === 'upload_custom_image') {
      const dataUrl = (body.dataUrl || '').trim();
      const fileName = (body.fileName || `stryde-custom-${Date.now()}.jpg`).trim();
      const label = (body.label || fileName).trim();
      const angleId = (body.angleId || '').trim();
      if (!dataUrl.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Nieprawidłowy plik obrazu.' }, { status: 400 });
      }
      const newAsset: StrydeImageAsset = {
        id: `custom-stryde-${Date.now()}`,
        url: dataUrl,
        imageHash: '',
        label,
        adsetOrigin: 'Custom Upload',
        adOrigin: fileName,
        aspectRatio: '1:1',
        source: 'ai',
        angleId: angleId || undefined,
      };
      const defaultAds = buildAllStrydePrewrittenAds();
      const updated = await mutate<
        StrydePlLibraryState,
        { customImages: StrydeImageAsset[]; savedAds: StrydePlGeneratedAd[] }
      >(STATE_KEY, { ads: defaultAds, customImages: [] }, state => {
        const customList = Array.isArray(state.customImages) ? [...state.customImages] : [];
        customList.unshift(newAsset);
        state.customImages = customList.slice(0, 80);
        const adsList = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
        if (angleId) {
          const idx = adsList.findIndex(item => item.angleId === angleId);
          if (idx >= 0) {
            adsList[idx] = {
              ...adsList[idx],
              imageUrl: newAsset.url,
              imageHash: newAsset.imageHash,
              updatedAt: Date.now(),
            };
          }
        }
        state.ads = adsList;
        return { customImages: state.customImages, savedAds: state.ads };
      });

      return NextResponse.json({
        ok: true,
        asset: newAsset,
        imageLibrary: [...updated.customImages, ...STRYDE_IMAGE_LIBRARY],
        savedAds: updated.savedAds,
      });
    }

    return NextResponse.json({ error: `Nieznana akcja: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd zapisu w Stryde PL.' },
      { status: 500 },
    );
  }
});
