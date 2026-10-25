import { NextResponse } from 'next/server';
import { accountRoute } from '@/lib/account-route';
import { inOwnerWorkspace } from '@/lib/account-context';
import { metaToken, metaProof, META_VERSION } from '@/lib/meta-client';
import { mutate, readState } from '@/lib/store';
import {
  FELIORA_ADVERTORIAL_URL,
  FELIORA_DEFAULT_URL,
  FELIORA_FANPAGES,
  FELIORA_IMAGE_LIBRARY,
  FELIORA_META_ACCOUNT_ID,
  FELIORA_META_MAIN_CAMPAIGN_ID,
  FELIORA_META_NATIVE_CAMPAIGN_ID,
  FELIORA_META_PIXEL_ID,
  FELIORA_PRESET_ANGLES,
  FELIORA_STAGES,
  buildAllFelioraPrewrittenAds,
  sanitizeAndAuditFelioraPl,
  type FelioraImageAsset,
  type FelioraPlGeneratedAd,
} from '@/lib/feliora-pl';

export const maxDuration = 300;

const STATE_KEY = 'feliora-pl-library-v5-all25-rewritten';

interface FelioraPlLibraryState {
  ads: FelioraPlGeneratedAd[];
  customImages?: FelioraImageAsset[];
}

async function resolveMetaAuth(): Promise<{ token: string; proof?: string }> {
  try {
    const token = await metaToken();
    return { token, proof: await metaProof(token) };
  } catch {
    try {
      const token = await inOwnerWorkspace(() => metaToken());
      return { token, proof: await inOwnerWorkspace(() => metaProof(token)) };
    } catch {
      const { accountRegistry } = await import('@/lib/account-repository');
      const { inWorkspace } = await import('@/lib/account-context');
      const reg = await accountRegistry();
      for (const u of Object.values(reg.users || {})) {
        try {
          const token = await inWorkspace(u, () => metaToken());
          const proof = await inWorkspace(u, () => metaProof(token));
          return { token, proof };
        } catch {
          // continue
        }
      }
      throw new Error('Brak połączonego tokenu Meta w ustawieniach Szekspira.');
    }
  }
}

async function directGraph<T = Record<string, unknown>>(
  path: string,
  params: Record<string, unknown> = {},
  method: 'GET' | 'POST' = 'GET',
): Promise<T> {
  const { token, proof } = await resolveMetaAuth();
  const url = new URL(`https://graph.facebook.com/${META_VERSION}/${path}`);
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) body.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  }
  if (proof) body.set('appsecret_proof', proof);
  if (method === 'GET') url.search = body.toString();
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: method === 'POST' ? body : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(45000),
  });
  const data = (await r.json()) as Record<string, unknown>;
  if (!r.ok || data.error) {
    const e = data.error as { code?: number; error_subcode?: number; message?: string; error_user_msg?: string } | undefined;
    throw new Error(`Meta (${e?.code || r.status}/${e?.error_subcode || 0}): ${e?.error_user_msg || e?.message || 'Request failed'}`);
  }
  return data as T;
}

async function readFelioraLibraryState(): Promise<{
  ads: FelioraPlGeneratedAd[];
  customImages: FelioraImageAsset[];
}> {
  const defaultAds = buildAllFelioraPrewrittenAds();
  try {
    const { value } = await readState<FelioraPlLibraryState>(STATE_KEY, {
      ads: defaultAds,
      customImages: [],
    });
    const stored = Array.isArray(value?.ads) ? value.ads : [];
    const customImages = Array.isArray(value?.customImages) ? value.customImages : [];
    if (stored.length === 0) {
      return { ads: defaultAds, customImages };
    }
    const defaultByAngle = new Map<string, FelioraPlGeneratedAd>();
    const byAngle = new Map<string, FelioraPlGeneratedAd>();
    for (const ad of defaultAds) {
      defaultByAngle.set(ad.angleId, ad);
      byAngle.set(ad.angleId, ad);
    }
    const storedByAngle = new Map<string, FelioraPlGeneratedAd>();
    for (const ad of stored) {
      if (ad?.angleId) storedByAngle.set(ad.angleId, ad);
      const baseAd = byAngle.get(ad.angleId);
      if (!baseAd) continue;
      const audited = sanitizeAndAuditFelioraPl(
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
        imageUrl:
          ad.imageUrl && !ad.imageUrl.includes('/fel-img-') ? ad.imageUrl : baseAd.imageUrl,
        imageHash:
          ad.imageUrl && !ad.imageUrl.includes('/fel-img-') ? ad.imageHash || baseAd.imageHash : baseAd.imageHash,
        secondImageUrl:
          ad.secondImageUrl && !ad.secondImageUrl.includes('/fel-img-')
            ? ad.secondImageUrl
            : baseAd.secondImageUrl,
        secondImageHash:
          ad.secondImageUrl && !ad.secondImageUrl.includes('/fel-img-')
            ? ad.secondImageHash || baseAd.secondImageHash
            : baseAd.secondImageHash,
      });
    }
    const DEFAULT_CREATED_AT = 1792616400000;
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
    const { ads, customImages } = await readFelioraLibraryState();
    return NextResponse.json({
      presets: FELIORA_PRESET_ANGLES,
      awarenessStages: FELIORA_STAGES,
      fanpages: FELIORA_FANPAGES,
      savedAds: ads,
      imageLibrary: [...customImages, ...FELIORA_IMAGE_LIBRARY],
      metaConfig: {
        accountId: FELIORA_META_ACCOUNT_ID,
        nativeCampaignId: FELIORA_META_NATIVE_CAMPAIGN_ID,
        mainCampaignId: FELIORA_META_MAIN_CAMPAIGN_ID,
        pixelId: FELIORA_META_PIXEL_ID,
        advertorialUrl: FELIORA_ADVERTORIAL_URL,
        pdpUrl: FELIORA_DEFAULT_URL,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd ładowania biblioteki Feliora PL.' },
      { status: 500 },
    );
  }
});

export const POST = accountRoute(async (req: Request) => {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      ad?: FelioraPlGeneratedAd;
      angleId?: string;
      angleIds?: string[];
      imageUrl?: string;
      imageHash?: string;
      secondImageUrl?: string | null;
      secondImageHash?: string | null;
      dataUrl?: string;
      fileName?: string;
      label?: string;
      adSetName?: string;
      campaignId?: string;
      templateAdSetId?: string;
      urlMode?: 'advertorial' | 'pdp' | 'split_ab';
      pageId?: string;
      adStatus?: 'PAUSED' | 'ACTIVE';
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
      const preset = FELIORA_PRESET_ANGLES.find(a => a.id === angleId);
      const primaryText = (body.primaryText || '').trim();
      const headline = (body.headline || preset?.title || '').trim();
      const title = (body.title || preset?.shortTitle || angleId || 'Feliora PL').trim();
      const isManual = Boolean((body as Record<string, unknown>).isManual);

      // 12 raw iPhone / NHS camera-roll scenes dynamically extracted from full skrypt.txt (3:4 2K Google AI)
      const allScenes = await planNativeIphoneScenesFromScript({
        brand: 'feliora',
        angleId,
        primaryText,
        headline,
        title,
      });

      const { customImages: existingCustomImages } = await readFelioraLibraryState();
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

      const isCompact = Boolean((body as Record<string, unknown>).compact);
      const candidateScenes = isCompact ? filteredScenes.slice(0, 4) : filteredScenes;
      const scenes = candidateScenes.length > 0 ? candidateScenes : allScenes.slice(0, isCompact ? 4 : 12);

      let productRefKieUrl: string | undefined;
      try {
        productRefKieUrl = await uploadPublicReferenceToKie('/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg');
      } catch {
        productRefKieUrl = undefined;
      }

      const taskResults = await Promise.all(
        scenes.map(async (scene, idx) => {
          const fullPrompt = formatRawIphoneKiePrompt(
            scene.scenePrompt,
            'feliora',
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
      const { safeDownload } = await import('@/lib/safe-fetch');

      const taskId = (body.taskId || '').trim();
      if (!taskId) {
        return NextResponse.json({ error: 'Brak taskId.' }, { status: 400 });
      }
      const status = await pollKieRipperTask(taskId);
      if (status.state !== 'success' || !status.resultUrl) {
        return NextResponse.json(status);
      }

      const angleId = (body.angleId || '').trim();
      const preset = FELIORA_PRESET_ANGLES.find(a => a.id === angleId);
      const label = (body.label || `iPhone Raw #${preset?.number || ''}`).trim();
      const assetId = `kie-fel-iphone-${taskId}`;

      let uploadedHash = '';
      try {
        const { buffer } = await safeDownload(status.resultUrl, 15 * 1024 * 1024);
        const base64Bytes = Buffer.from(buffer).toString('base64');
        const { uploadCustomAntkiImageToMeta } = await import('@/lib/meta-adsets');
        const metaRes = await uploadCustomAntkiImageToMeta({
          bytes: base64Bytes,
          fileName: `${assetId}.jpg`,
          accountId: FELIORA_META_ACCOUNT_ID,
        });
        uploadedHash = metaRes.hash || '';
      } catch {
        // Non-blocking
      }

      const newAsset: FelioraImageAsset = {
        id: assetId,
        url: status.resultUrl,
        imageHash: uploadedHash,
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
      const defaultAds = buildAllFelioraPrewrittenAds();
      const updatedState = await mutate<
        FelioraPlLibraryState,
        { customImages: FelioraImageAsset[]; ads: FelioraPlGeneratedAd[] }
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
            const updatedAd: FelioraPlGeneratedAd = {
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
        imageLibrary: [...updatedState.customImages, ...FELIORA_IMAGE_LIBRARY],
        savedAds: updatedState.ads,
      });
    }

    if (action === 'save' && body.ad) {
      const defaultAds = buildAllFelioraPrewrittenAds();
      const audited = sanitizeAndAuditFelioraPl(body.ad.primaryText, body.ad.headline, body.ad.description);
      const updatedAd: FelioraPlGeneratedAd = {
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
      const savedAds = await mutate<FelioraPlLibraryState, FelioraPlGeneratedAd[]>(
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
      const defaultAds = buildAllFelioraPrewrittenAds();
      const now = Date.now();
      const savedAds = await mutate<FelioraPlLibraryState, FelioraPlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultAds, customImages: [] },
        state => {
          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
          for (const targetAngleId of targetAngleIds) {
            const idx = list.findIndex(item => item.angleId === targetAngleId);
            const baseItem = idx >= 0 ? list[idx] : defaultAds.find((a: FelioraPlGeneratedAd) => a.angleId === targetAngleId);
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
            const updatedEntry: FelioraPlGeneratedAd = {
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
      const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl.trim() : '';
      const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: 'Nieprawidłowy format obrazu (wymagany data:image/...;base64).' }, { status: 400 });
      }
      const base64Bytes = match[1];
      const cleanFileName = (body.fileName || `feliora-custom-${Date.now()}.jpg`).trim();
      let uploadedHash: string | undefined;
      try {
        const { uploadCustomAntkiImageToMeta } = await import('@/lib/meta-adsets');
        const metaRes = await uploadCustomAntkiImageToMeta({
          bytes: base64Bytes,
          fileName: cleanFileName,
          accountId: FELIORA_META_ACCOUNT_ID,
        });
        uploadedHash = metaRes.hash;
      } catch {
        // Non-blocking
      }
      const now = Date.now();
      const newAsset: FelioraImageAsset = {
        id: `fel-custom-${now}-${Math.random().toString(36).slice(2, 6)}`,
        url: dataUrl,
        label: (body.label || `Własne: ${cleanFileName}`).trim(),
        imageHash: uploadedHash || '',
        adsetOrigin: 'Własna grafika',
        adOrigin: cleanFileName,
        aspectRatio: '1:1',
      };
      const defaultAds = buildAllFelioraPrewrittenAds();
      const updatedState = await mutate<
        FelioraPlLibraryState,
        { customImages: FelioraImageAsset[]; ads: FelioraPlGeneratedAd[] }
      >(STATE_KEY, { ads: defaultAds, customImages: [] }, state => {
        const customList = Array.isArray(state.customImages) ? [...state.customImages] : [];
        customList.unshift(newAsset);
        state.customImages = customList.slice(0, 60);
        const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
        if (body.angleId) {
          const idx = list.findIndex(item => item.angleId === body.angleId);
          if (idx >= 0) {
            list[idx] = {
              ...list[idx],
              imageUrl: newAsset.url,
              imageHash: newAsset.imageHash || list[idx].imageHash,
              updatedAt: now,
            };
          }
        }
        state.ads = list;
        return { customImages: state.customImages, ads: state.ads };
      });
      return NextResponse.json({
        ok: true,
        asset: newAsset,
        imageLibrary: [...updatedState.customImages, ...FELIORA_IMAGE_LIBRARY],
        savedAds: updatedState.ads,
      });
    }

    if (action === 'push_to_meta') {
      const targetAngleIds =
        Array.isArray(body.angleIds) && body.angleIds.length > 0
          ? body.angleIds
          : body.angleId
          ? [body.angleId]
          : [];
      if (!targetAngleIds.length) {
        return NextResponse.json({ error: 'Wybierz przynajmniej 1 kąt do wysyłki do Meta Ads.' }, { status: 400 });
      }
      const { ads } = await readFelioraLibraryState();
      const selectedAds = ads.filter(a => targetAngleIds.includes(a.angleId));
      if (!selectedAds.length) {
        return NextResponse.json({ error: 'Nie znaleziono wybranych reklam.' }, { status: 400 });
      }

      const campaignId = body.campaignId || FELIORA_META_NATIVE_CAMPAIGN_ID;
      const templateAdSetId = body.templateAdSetId || '120250036346090298';
      const adSetName = (body.adSetName || `24.10 - FELIORA ANTEK BATCH (${selectedAds.length}x)`).trim();
      const urlMode = body.urlMode || 'advertorial';
      const adStatus = body.adStatus || 'PAUSED';

      const source = await directGraph<Record<string, unknown>>(templateAdSetId, {
        fields: 'targeting,optimization_goal,billing_event,promoted_object,attribution_spec,destination_type',
      });

      const rawTargeting = (source.targeting ? JSON.parse(JSON.stringify(source.targeting)) : {}) as Record<
        string,
        unknown
      >;
      if (Array.isArray(rawTargeting.instagram_positions)) {
        const cleanedIgPos = (rawTargeting.instagram_positions as string[]).filter(
          pos => pos !== 'explore' && pos !== 'explore_home',
        );
        if (cleanedIgPos.length > 0) {
          rawTargeting.instagram_positions = cleanedIgPos;
        } else {
          delete rawTargeting.instagram_positions;
        }
      }

      // Check if an Ad Set with this exact name was already created in the campaign (to avoid empty duplicates)
      let targetAdSetId = '';
      try {
        const existingAdSets = await directGraph<{ data?: Array<{ id: string; name: string }> }>(
          `${campaignId}/adsets`,
          { fields: 'id,name', limit: 50 },
        );
        const match = (existingAdSets.data || []).find(s => s.name === adSetName);
        if (match?.id) {
          targetAdSetId = match.id;
        }
      } catch {
        // Fallback to creating new Ad Set
      }

      if (!targetAdSetId) {
        const createdAdSet = await directGraph<{ id: string }>(
          `act_${FELIORA_META_ACCOUNT_ID}/adsets`,
          {
            name: adSetName,
            campaign_id: campaignId,
            status: adStatus,
            optimization_goal: source.optimization_goal || 'OFFSITE_CONVERSIONS',
            billing_event: source.billing_event || 'IMPRESSIONS',
            promoted_object: source.promoted_object || {
              pixel_id: FELIORA_META_PIXEL_ID,
              custom_event_type: 'PURCHASE',
            },
            targeting: rawTargeting,
            attribution_spec: source.attribution_spec,
            destination_type: source.destination_type || 'WEBSITE',
          },
          'POST',
        );
        targetAdSetId = createdAdSet.id;
      }

      const FELIORA_PAGE_ACTORS: Record<string, { instagram_user_id: string; threads_user_id: string }> = {
        '1231925240008683': { instagram_user_id: '17841437522153551', threads_user_id: '17841479143358057' }, // Kociary: Wasze Historie
        '1287239777799682': { instagram_user_id: '17841441008488573', threads_user_id: '17841419447824408' }, // Dr. wet. Edmund Newelski
        '1304624172730017': { instagram_user_id: '17841438210859048', threads_user_id: '17841432419890017' }, // Koty Bez Ściemy
        '1338513126001175': { instagram_user_id: '17841437606417391', threads_user_id: '17841467398928017' }, // Feliora
      };

      const createdAds: Array<{ id: string; name: string; angleId: string; url: string }> = [];
      for (const ad of selectedAds) {
        const pageId = body.pageId || ad.pageId || '1287239777799682';
        const actors = FELIORA_PAGE_ACTORS[pageId] || FELIORA_PAGE_ACTORS['1338513126001175'];
        const imageHash = ad.imageHash || '7603e2a6afce7782f07c57dc0174cd2b';
        const secondHash =
          ad.secondImageHash && ad.secondImageUrl && ad.secondImageUrl !== ad.imageUrl
            ? ad.secondImageHash
            : '';
        const targetLink = urlMode === 'pdp' ? FELIORA_DEFAULT_URL : FELIORA_ADVERTORIAL_URL;
        const baseSuffix = urlMode === 'pdp' ? 'PDP' : 'LISTICLE';
        const urlsToPush: Array<{ suffix: string; link: string; hash: string }> =
          urlMode === 'split_ab'
            ? [
                {
                  suffix: 'LISTICLE (Kreacja A)',
                  link: FELIORA_ADVERTORIAL_URL,
                  hash: imageHash,
                },
                {
                  suffix: 'LISTICLE (Kreacja B)',
                  link: FELIORA_ADVERTORIAL_URL,
                  hash: secondHash || imageHash,
                },
              ]
            : secondHash
            ? [
                {
                  suffix: `${baseSuffix} · Kreacja A`,
                  link: targetLink,
                  hash: imageHash,
                },
                {
                  suffix: `${baseSuffix} · Kreacja B`,
                  link: targetLink,
                  hash: secondHash,
                },
              ]
            : [
                {
                  suffix: baseSuffix,
                  link: targetLink,
                  hash: imageHash,
                },
              ];

        for (const variant of urlsToPush) {
          const adName = `${ad.code} | ${variant.suffix} | ${ad.pageName}`;
          const creativeSpec = {
            name: `${adName} - Creative`,
            url_tags:
              'utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}',
            object_story_spec: {
              page_id: pageId,
              instagram_user_id: actors.instagram_user_id,
              threads_user_id: actors.threads_user_id,
              link_data: {
                image_hash: variant.hash,
                link: variant.link,
                message: ad.primaryText,
                name: ad.headline,
                description: ad.description,
                call_to_action: {
                  type: 'LEARN_MORE',
                  value: { link: variant.link },
                },
              },
            },
          };

          const createdAd = await directGraph<{ id: string }>(
            `act_${FELIORA_META_ACCOUNT_ID}/ads`,
            {
              name: adName,
              adset_id: targetAdSetId,
              creative: creativeSpec,
              status: adStatus,
            },
            'POST',
          );

          createdAds.push({
            id: createdAd.id,
            name: adName,
            angleId: ad.angleId,
            url: variant.link,
          });
        }
      }

      return NextResponse.json({
        ok: true,
        adSetId: targetAdSetId,
        adSetName,
        createdAdsCount: createdAds.length,
        createdAds,
      });
    }

    return NextResponse.json({ error: 'Nieznana akcja API Feliora PL.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd w API Feliora PL.' },
      { status: 500 },
    );
  }
});
