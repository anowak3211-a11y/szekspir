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

const LEGACY_STATE_KEYS = [
  'stryde-pl-library-v1-all15-localized',
  'sardian-opaska-pl-v2-25ads',
  'sardian-opaska-pl-v3-25ads',
  'sardian-opaska-pl-v4-25ads',
  'sardian-opaska-pl-v5-25ads',
  'sardian-opaska-pl-v6-25ads',
];
const STATE_KEY = 'sardian-opaska-pl-v7-25ads';

interface StrydePlLibraryState {
  ads: StrydePlGeneratedAd[];
  customImages?: StrydeImageAsset[];
}

function normalizeSardianUrl(url?: string, fallbackUrl?: string): string {
  const raw = (url || fallbackUrl || STRYDE_PDP_URL).trim();
  return raw
    .replace(/https?:\/\/r0fgvk-0t\.myshopify\.com/gi, 'https://sprobujsardian.pl')
    .replace(/https?:\/\/(?:www\.)?stryde\.pl/gi, 'https://sprobujsardian.pl')
    .replace(/\/products\/orthevia-precision-strap/gi, '/products/sardian-precision-strap');
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
    const customImages = Array.isArray(value?.customImages) ? [...value.customImages] : [];

    // Pull previously generated Kie.ai customImages & http image assignments from v1/v2 so zero generated visuals are lost
    const legacyStoredList: StrydePlGeneratedAd[] = [];
    const seenIds = new Set(customImages.map(img => img.id));
    const seenUrls = new Set(customImages.map(img => img.url));
    for (const legacyKey of LEGACY_STATE_KEYS) {
      try {
        const { value: legacyVal } = await readState<StrydePlLibraryState>(legacyKey, {
          ads: [],
          customImages: [],
        });
        if (Array.isArray(legacyVal?.ads)) {
          legacyStoredList.push(...legacyVal.ads);
        }
        if (Array.isArray(legacyVal?.customImages) && legacyVal.customImages.length > 0) {
          for (const img of legacyVal.customImages) {
            if (img && !seenIds.has(img.id) && !seenUrls.has(img.url)) {
              customImages.push(img);
              seenIds.add(img.id);
              seenUrls.add(img.url);
            }
          }
        }
      } catch {
        // Ignore legacy read error
      }
    }

    const defaultByAngle = new Map<string, StrydePlGeneratedAd>();
    const byAngle = new Map<string, StrydePlGeneratedAd>();
    for (const ad of defaultAds) {
      defaultByAngle.set(ad.angleId, ad);
      byAngle.set(ad.angleId, ad);
    }

    // Carry over ONLY http image assignments from legacy v1/v2 (never old copy, headlines, or advertorial URLs!)
    for (const legAd of legacyStoredList) {
      if (!legAd?.angleId) continue;
      const cur = byAngle.get(legAd.angleId);
      if (!cur) continue;
      byAngle.set(legAd.angleId, {
        ...cur,
        ...(legAd.imageUrl && legAd.imageUrl.startsWith('http')
          ? { imageUrl: legAd.imageUrl, imageHash: legAd.imageHash || cur.imageHash }
          : {}),
        ...(legAd.secondImageUrl && legAd.secondImageUrl.startsWith('http')
          ? { secondImageUrl: legAd.secondImageUrl, secondImageHash: legAd.secondImageHash || cur.secondImageHash }
          : {}),
      });
    }

    const DEFAULT_CREATED_AT = 1792622000000;
    const storedByAngle = new Map<string, StrydePlGeneratedAd>();
    for (const ad of stored) {
      if (ad?.angleId) storedByAngle.set(ad.angleId, ad);
      const baseAd = byAngle.get(ad.angleId);
      if (!baseAd) continue;
      const userEditedCopy = Boolean(ad.updatedAt && ad.updatedAt > DEFAULT_CREATED_AT);
      const rawPrimary = userEditedCopy && ad.primaryText ? ad.primaryText : baseAd.primaryText;
      const rawHeadline = userEditedCopy && ad.headline ? ad.headline : baseAd.headline;
      const rawDesc = userEditedCopy && ad.description ? ad.description : baseAd.description;
      const audited = sanitizeAndAuditStrydePl(rawPrimary, rawHeadline, rawDesc);
      const normalizedPageName =
        !ad.pageName || /stryde|orthevia/i.test(ad.pageName) ? baseAd.pageName : ad.pageName;
      byAngle.set(ad.angleId, {
        ...baseAd,
        ...ad,
        code: baseAd.code,
        title: baseAd.title,
        stageId: baseAd.stageId,
        pageId: ad.pageId || baseAd.pageId,
        pageName: normalizedPageName,
        destinationUrl: normalizeSardianUrl(ad.destinationUrl, baseAd.destinationUrl),
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
      const sorted = [...angleImgs].sort((a, b) => {
        const mA = (a.label || '').match(/(?:^|·\s*)(\d+)\./);
        const mB = (b.label || '').match(/(?:^|·\s*)(\d+)\./);
        return (mA ? Number(mA[1]) : 99) - (mB ? Number(mB[1]) : 99);
      });
      const scene1 = sorted.find(img => /(?:^|·\s*)1\./.test(img.label || '')) || sorted[0];
      const scene2 =
        sorted.find(img => /(?:^|·\s*)2\./.test(img.label || '')) ||
        sorted.find(img => img.url !== scene1?.url);
      const baseAd = defaultByAngle.get(ad.angleId);
      const storedAd = storedByAngle.get(ad.angleId);
      const userModified = Boolean(storedAd?.updatedAt && storedAd.updatedAt > DEFAULT_CREATED_AT);
      const needsScene1 = !ad.imageUrl || (!userModified && ad.imageUrl === baseAd?.imageUrl);
      const needsScene2 = !ad.secondImageUrl || (!userModified && ad.secondImageUrl === baseAd?.secondImageUrl);
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
        advertorialUrl: STRYDE_PDP_URL,
        pdpUrl: STRYDE_PDP_URL,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd ładowania biblioteki Sardian PL.' },
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
      const {
        buildKieCreateTaskPayload,
        submitKieRipperTask,
        uploadPublicReferenceToKie,
      } = await import('@/lib/image-ripper');
      const {
        planNativeIphoneScenesFromScript,
        formatRawIphoneKiePrompt,
      } = await import('@/lib/native-iphone-scenes');

      const angleId = (body.angleId || '').trim();
      const preset = STRYDE_PRESET_ANGLES.find(a => a.id === angleId);
      const primaryText = (body.primaryText || '').trim();
      const headline = (body.headline || preset?.title || '').trim();
      const title = (body.title || preset?.shortTitle || angleId || 'Sardian PL').trim();
      const isManual = Boolean((body as Record<string, unknown>).isManual);

      // 12 raw iPhone / NHS camera-roll scenes dynamically extracted from full skrypt.txt (3:4 2K Google AI)
      const allScenes = await planNativeIphoneScenesFromScript({
        brand: 'sardian-strap',
        angleId,
        primaryText,
        headline,
        title,
        pageName: preset?.recommendedFanpageId,
      });

      const { customImages: existingCustomImages } = await readStrydeLibraryState();
      const normalizeSceneKey = (label = '') =>
        label
          .replace(/^#\d+\s*·\s*/, '')
          .replace(/\(\s*\d[\d\s,]*zł\s*\)/gi, '')
          .trim()
          .toLowerCase();

      const filteredScenes = isManual
        ? allScenes
        : allScenes.filter(scene => {
            const key = normalizeSceneKey(scene.label);
            const existingMatches = existingCustomImages.filter(
              img => img.angleId === angleId && normalizeSceneKey(img.label) === key && img.url?.startsWith('http'),
            );
            return existingMatches.length < 2;
          });

      const scenes = filteredScenes.length > 0 ? filteredScenes : allScenes;

      let productRefKieUrl: string | undefined;
      try {
        productRefKieUrl = await uploadPublicReferenceToKie('/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg');
      } catch {
        productRefKieUrl = undefined;
      }

      const taskResults = await Promise.all(
        scenes.map(async (scene, idx) => {
          const fullPrompt = formatRawIphoneKiePrompt(
            scene.scenePrompt,
            'sardian-strap',
            scene.includeProductRef,
          );
          const payload = buildKieCreateTaskPayload({
            model: 'nano-banana-pro',
            prompt: fullPrompt,
            imageUrls: scene.includeProductRef && productRefKieUrl ? [productRefKieUrl] : [],
            aspectRatio: '3:4',
            resolution: '2K',
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
      const label = (body.label || `iPhone Raw #${preset?.number || ''}`).trim();
      const assetId = `kie-sardian-iphone-${taskId}`;

      const newAsset: StrydeImageAsset = {
        id: assetId,
        url: status.resultUrl,
        imageHash: '',
        label: preset ? `#${preset.number} · ${label}` : label,
        adsetOrigin: 'Google AI Raw iPhone 3:4 (NHS / Skrypt.txt)',
        adOrigin: preset?.code || 'IPHONE-RAW',
        aspectRatio: '3:4',
        source: 'ai',
        angleId: angleId || undefined,
        kiePrompt: body.prompt || undefined,
      };

      const isScene1 = /^1\./.test(label);
      const isScene2 = /^2\./.test(label);
      const now = Date.now();
      const hydrated = await readStrydeLibraryState();
      const defaultAds = hydrated.ads;
      const updatedState = await mutate<
        StrydePlLibraryState,
        { customImages: StrydeImageAsset[]; ads: StrydePlGeneratedAd[] }
      >(STATE_KEY, { ads: hydrated.ads, customImages: hydrated.customImages }, state => {
        const customList = Array.isArray(state.customImages) ? [...state.customImages] : [...hydrated.customImages];
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
      const hydrated = await readStrydeLibraryState();
      const defaultAds = hydrated.ads;
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
        { ads: hydrated.ads, customImages: hydrated.customImages },
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
      const hydrated = await readStrydeLibraryState();
      const defaultAds = hydrated.ads;
      const now = Date.now();
      const savedAds = await mutate<StrydePlLibraryState, StrydePlGeneratedAd[]>(
        STATE_KEY,
        { ads: hydrated.ads, customImages: hydrated.customImages },
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
      const fileName = (body.fileName || `sardian-custom-${Date.now()}.jpg`).trim();
      const label = (body.label || fileName).trim();
      const angleId = (body.angleId || '').trim();
      if (!dataUrl.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Nieprawidłowy plik obrazu.' }, { status: 400 });
      }
      const newAsset: StrydeImageAsset = {
        id: `custom-sardian-${Date.now()}`,
        url: dataUrl,
        imageHash: '',
        label,
        adsetOrigin: 'Custom Upload',
        adOrigin: fileName,
        aspectRatio: '1:1',
        source: 'ai',
        angleId: angleId || undefined,
      };
      const hydrated = await readStrydeLibraryState();
      const defaultAds = hydrated.ads;
      const updated = await mutate<
        StrydePlLibraryState,
        { customImages: StrydeImageAsset[]; savedAds: StrydePlGeneratedAd[] }
      >(STATE_KEY, { ads: hydrated.ads, customImages: hydrated.customImages }, state => {
        const customList = Array.isArray(state.customImages) ? [...state.customImages] : [...hydrated.customImages];
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
      { error: err instanceof Error ? err.message : 'Błąd zapisu w Sardian PL.' },
      { status: 500 },
    );
  }
});
