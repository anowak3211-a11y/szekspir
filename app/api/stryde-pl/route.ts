import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { currentWorkspace, inOwnerWorkspace, inWorkspace } from '@/lib/account-context';
import { accountRegistry, type UserWorkspace } from '@/lib/account-repository';
import { accountRoute } from '@/lib/account-route';
import { metaProof, metaToken, META_VERSION } from '@/lib/meta-client';
import { mutate, readState, readStates } from '@/lib/store';
import {
  STRYDE_ADVERTORIAL_URLS,
  STRYDE_FANPAGES,
  STRYDE_IMAGE_LIBRARY,
  STRYDE_PDP_URL,
  STRYDE_PRESET_ANGLES,
  STRYDE_STAGES,
  buildAllStrydePrewrittenAds,
  sanitizeAndAuditStrydePl,
  type StrydeImageAsset,
  type StrydePlGeneratedAd,
} from '@/lib/stryde-pl';

export const maxDuration = 300;

async function resolveMetaAuth(): Promise<{ token: string; proof?: string }> {
  try {
    const token = await metaToken();
    return { token, proof: await metaProof(token) };
  } catch {
    try {
      const token = await inOwnerWorkspace(() => metaToken());
      return { token, proof: await inOwnerWorkspace(() => metaProof(token)) };
    } catch {
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
  graphPath: string,
  params: Record<string, unknown> = {},
  method: 'GET' | 'POST' = 'GET',
): Promise<T> {
  const { token, proof } = await resolveMetaAuth();
  const url = new URL(`https://graph.facebook.com/${META_VERSION}/${graphPath}`);
  const form = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) {
      form.set(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
  }
  if (proof) form.set('appsecret_proof', proof);
  if (method === 'GET') url.search = form.toString();

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: method === 'POST' ? form : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(45000),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok || data.error) {
    const e = data.error as { code?: number; error_subcode?: number; message?: string; error_user_msg?: string } | undefined;
    throw new Error(
      `Meta (${e?.code || res.status}/${e?.error_subcode || 0}): ${e?.error_user_msg || e?.message || 'Request failed'}`,
    );
  }
  return data as T;
}

const LEGACY_STATE_KEYS = [
  'stryde-pl-library-v1-all15-localized',
  'sardian-opaska-pl-v2-25ads',
  'sardian-opaska-pl-v3-25ads',
  'sardian-opaska-pl-v4-25ads',
  'sardian-opaska-pl-v5-25ads',
  'sardian-opaska-pl-v6-25ads',
  'sardian-opaska-pl-v7-25ads',
  'sardian-opaska-pl-v8-25ads',
  'sardian-opaska-pl-v9-25ads',
];
const STATE_KEY = 'sardian-opaska-pl-v10-25ads';
const META_HASH_CACHE_KEY = 'sardian-opaska-pl-meta-hashes-v1';

interface StrydePlLibraryState {
  ads: StrydePlGeneratedAd[];
  customImages?: StrydeImageAsset[];
  deletedImageUrls?: string[];
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
  deletedImageUrls: string[];
}> {
  const defaultAds = buildAllStrydePrewrittenAds();
  const emptyState: StrydePlLibraryState = { ads: [], customImages: [], deletedImageUrls: [] };
  const allKeys = [STATE_KEY, ...LEGACY_STATE_KEYS];

  try {
    const activeWs = currentWorkspace();

    // Read owner states + active workspace states + any registered sub-workspaces in parallel (< 1s total!)
    const [ownerStates, activeWsStates, registry] = await Promise.all([
      inOwnerWorkspace(() => readStates<StrydePlLibraryState>(allKeys, emptyState)).catch(() => []),
      activeWs
        ? readStates<StrydePlLibraryState>(allKeys, emptyState).catch(() => [])
        : Promise.resolve([] as StrydePlLibraryState[]),
      accountRegistry().catch(() => ({ users: {} as Record<string, UserWorkspace> })),
    ]);

    const otherWorkspaces = Object.values(registry.users || {}).filter(
      (u): u is UserWorkspace => Boolean(u && u.id && u.id !== activeWs?.id),
    );
    const otherWsNested = await Promise.all(
      otherWorkspaces.map(u =>
        inWorkspace(u, () => readStates<StrydePlLibraryState>(allKeys, emptyState)).catch(() => []),
      ),
    );

    const ownerCurrent = ownerStates[0] || emptyState;
    const activeCurrent = activeWsStates[0] || emptyState;

    const deletedSet = new Set<string>([
      ...(Array.isArray(ownerCurrent.deletedImageUrls) ? ownerCurrent.deletedImageUrls : []),
      ...(Array.isArray(activeCurrent.deletedImageUrls) ? activeCurrent.deletedImageUrls : []),
    ]);

    const customImages: StrydeImageAsset[] = [];
    const seenIds = new Set<string>();
    const seenUrls = new Set<string>();
    const legacyStoredList: StrydePlGeneratedAd[] = [];

    const collectFromSnapshots = (snapshots: StrydePlLibraryState[], skipFirstAds = false) => {
      snapshots.forEach((snap, idx) => {
        if (!snap) return;
        if (Array.isArray(snap.deletedImageUrls)) {
          for (const u of snap.deletedImageUrls) {
            if (u) deletedSet.add(u);
          }
        }
        if (!(skipFirstAds && idx === 0) && Array.isArray(snap.ads)) {
          legacyStoredList.push(...snap.ads);
        }
        if (Array.isArray(snap.customImages)) {
          for (const img of snap.customImages) {
            if (!img || !img.url || deletedSet.has(img.url) || deletedSet.has(img.id)) continue;
            if (!seenIds.has(img.id) && !seenUrls.has(img.url)) {
              customImages.push(img);
              seenIds.add(img.id);
              seenUrls.add(img.url);
            }
          }
        }
      });
    };

    // Priority order: current STATE_KEY first, then active workspace, then legacy keys, then other workspaces
    collectFromSnapshots(ownerStates, true);
    collectFromSnapshots(activeWsStates, true);
    for (const wsSnaps of otherWsNested) {
      collectFromSnapshots(wsSnaps, false);
    }

    const filteredCustomImages = customImages.filter(
      img => !deletedSet.has(img.url) && !deletedSet.has(img.id),
    );

    const stored = [
      ...(Array.isArray(ownerCurrent.ads) ? ownerCurrent.ads : []),
      ...(Array.isArray(activeCurrent.ads) ? activeCurrent.ads : []),
    ];

    const defaultByAngle = new Map<string, StrydePlGeneratedAd>();
    const byAngle = new Map<string, StrydePlGeneratedAd>();
    for (const ad of defaultAds) {
      defaultByAngle.set(ad.angleId, ad);
      byAngle.set(ad.angleId, ad);
    }

    // Carry over ONLY http image assignments from legacy states (never old copy, headlines, or advertorial URLs!)
    for (const legAd of legacyStoredList) {
      if (!legAd?.angleId) continue;
      const cur = byAngle.get(legAd.angleId);
      if (!cur) continue;
      const validPrimary =
        legAd.imageUrl && legAd.imageUrl.startsWith('http') && !deletedSet.has(legAd.imageUrl);
      const validSecond =
        legAd.secondImageUrl &&
        legAd.secondImageUrl.startsWith('http') &&
        !deletedSet.has(legAd.secondImageUrl);
      byAngle.set(legAd.angleId, {
        ...cur,
        ...(validPrimary
          ? { imageUrl: legAd.imageUrl, imageHash: legAd.imageHash || cur.imageHash }
          : {}),
        ...(validSecond
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
      const cleanImgA = ad.imageUrl && !deletedSet.has(ad.imageUrl) ? ad.imageUrl : baseAd.imageUrl;
      const cleanImgB =
        ad.secondImageUrl && !deletedSet.has(ad.secondImageUrl)
          ? ad.secondImageUrl
          : baseAd.secondImageUrl;

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
        imageUrl: cleanImgA,
        imageHash: ad.imageHash || baseAd.imageHash,
        secondImageUrl: cleanImgB,
        secondImageHash: ad.secondImageHash || baseAd.secondImageHash,
      });
    }

    const finalAds = Array.from(byAngle.values()).map(ad => {
      const angleImgs = filteredCustomImages.filter(
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

    return {
      ads: finalAds,
      customImages: filteredCustomImages,
      deletedImageUrls: Array.from(deletedSet),
    };
  } catch {
    return { ads: defaultAds, customImages: [], deletedImageUrls: [] };
  }
}

export const GET = accountRoute(async () => {
  try {
    const { ads, customImages } = await readStrydeLibraryState();
    return NextResponse.json(
      {
        uiVersion: '2026-10-25-all-images-v10',
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
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
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
      imageId?: string;
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
        adsetOrigin: 'Google AI Raw iPhone 3:4 (Skrypt.txt)',
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
      const updatedState = await inOwnerWorkspace(() =>
        mutate<
          StrydePlLibraryState,
          { customImages: StrydeImageAsset[]; ads: StrydePlGeneratedAd[] }
        >(
          STATE_KEY,
          {
            ads: hydrated.ads,
            customImages: hydrated.customImages,
            deletedImageUrls: hydrated.deletedImageUrls,
          },
          state => {
            const mergedMap = new Map<string, StrydeImageAsset>();
            mergedMap.set(newAsset.url, newAsset);
            for (const item of Array.isArray(state.customImages) ? state.customImages : []) {
              if (item?.url && !mergedMap.has(item.url)) mergedMap.set(item.url, item);
            }
            for (const item of hydrated.customImages) {
              if (item?.url && !mergedMap.has(item.url)) mergedMap.set(item.url, item);
            }
            state.customImages = Array.from(mergedMap.values()).slice(0, 2000);
            state.deletedImageUrls = Array.isArray(state.deletedImageUrls)
              ? state.deletedImageUrls
              : hydrated.deletedImageUrls;

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
          },
        ),
      );

      return NextResponse.json({
        state: 'success',
        resultUrl: status.resultUrl,
        asset: newAsset,
        imageLibrary: [...updatedState.customImages, ...STRYDE_IMAGE_LIBRARY],
        savedAds: updatedState.ads,
      });
    }

    if (action === 'delete_image') {
      const targetUrl = (body.imageUrl || '').trim();
      const targetId = (body.imageId || '').trim();
      if (!targetUrl && !targetId) {
        return NextResponse.json({ error: 'Brak imageUrl / imageId.' }, { status: 400 });
      }
      const hydrated = await readStrydeLibraryState();
      const updated = await inOwnerWorkspace(() =>
        mutate<
          StrydePlLibraryState,
          { customImages: StrydeImageAsset[]; ads: StrydePlGeneratedAd[] }
        >(
          STATE_KEY,
          {
            ads: hydrated.ads,
            customImages: hydrated.customImages,
            deletedImageUrls: hydrated.deletedImageUrls,
          },
          state => {
            const del = new Set<string>([
              ...(Array.isArray(state.deletedImageUrls) ? state.deletedImageUrls : []),
              ...hydrated.deletedImageUrls,
            ]);
            if (targetUrl) del.add(targetUrl);
            if (targetId) del.add(targetId);
            state.deletedImageUrls = Array.from(del);

            const merged = [...(Array.isArray(state.customImages) ? state.customImages : []), ...hydrated.customImages];
            const seen = new Set<string>();
            state.customImages = merged.filter(img => {
              if (!img?.url || del.has(img.url) || del.has(img.id) || seen.has(img.url)) return false;
              seen.add(img.url);
              return true;
            });

            const baseDefaults = buildAllStrydePrewrittenAds();
            const adsList = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...hydrated.ads];
            state.ads = adsList.map(ad => {
              const fallback = baseDefaults.find(d => d.angleId === ad.angleId);
              return {
                ...ad,
                imageUrl:
                  ad.imageUrl && del.has(ad.imageUrl)
                    ? fallback?.imageUrl || STRYDE_IMAGE_LIBRARY[0].url
                    : ad.imageUrl,
                secondImageUrl:
                  ad.secondImageUrl && del.has(ad.secondImageUrl)
                    ? fallback?.secondImageUrl || STRYDE_IMAGE_LIBRARY[1]?.url
                    : ad.secondImageUrl,
              };
            });
            return { customImages: state.customImages, ads: state.ads };
          },
        ),
      );
      return NextResponse.json({
        ok: true,
        imageLibrary: [...updated.customImages, ...STRYDE_IMAGE_LIBRARY],
        savedAds: updated.ads,
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
      const savedAds = await inOwnerWorkspace(() =>
        mutate<StrydePlLibraryState, StrydePlGeneratedAd[]>(
          STATE_KEY,
          {
            ads: hydrated.ads,
            customImages: hydrated.customImages,
            deletedImageUrls: hydrated.deletedImageUrls,
          },
          state => {
            const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
            const idx = list.findIndex(item => item.angleId === updatedAd.angleId || item.id === updatedAd.id);
            if (idx >= 0) {
              list[idx] = updatedAd;
            } else {
              list.push(updatedAd);
            }
            state.ads = list;
            if (!Array.isArray(state.customImages) || state.customImages.length === 0) {
              state.customImages = hydrated.customImages;
            }
            return state.ads;
          },
        ),
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
      const savedAds = await inOwnerWorkspace(() =>
        mutate<StrydePlLibraryState, StrydePlGeneratedAd[]>(
          STATE_KEY,
          {
            ads: hydrated.ads,
            customImages: hydrated.customImages,
            deletedImageUrls: hydrated.deletedImageUrls,
          },
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
            if (!Array.isArray(state.customImages) || state.customImages.length === 0) {
              state.customImages = hydrated.customImages;
            }
            return state.ads;
          },
        ),
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
        aspectRatio: '3:4',
        source: 'ai',
        angleId: angleId || undefined,
      };
      const hydrated = await readStrydeLibraryState();
      const defaultAds = hydrated.ads;
      const updated = await inOwnerWorkspace(() =>
        mutate<
          StrydePlLibraryState,
          { customImages: StrydeImageAsset[]; savedAds: StrydePlGeneratedAd[] }
        >(
          STATE_KEY,
          {
            ads: hydrated.ads,
            customImages: hydrated.customImages,
            deletedImageUrls: hydrated.deletedImageUrls,
          },
          state => {
            const customList = Array.isArray(state.customImages)
              ? [...state.customImages]
              : [...hydrated.customImages];
            customList.unshift(newAsset);
            state.customImages = customList.slice(0, 2000);
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
          },
        ),
      );

      return NextResponse.json({
        ok: true,
        asset: newAsset,
        imageLibrary: [...updated.customImages, ...STRYDE_IMAGE_LIBRARY],
        savedAds: updated.savedAds,
      });
    }

    if (action === 'inspect_meta') {
      const rawBody = body as Record<string, unknown>;
      const filterAccountId = typeof rawBody.accountId === 'string' ? rawBody.accountId.replace(/^act_/, '').trim() : '';

      const [adAccountsRes, meAccountsRes, fxRes] = await Promise.all([
        directGraph<{ data?: Array<Record<string, unknown>> }>('me/adaccounts', {
          fields: 'id,account_id,name,currency,timezone_name,timezone_offset_hours_utc,account_status',
          limit: 100,
        }),
        directGraph<{ data?: Array<Record<string, unknown>> }>('me/accounts', {
          fields: 'id,name,instagram_business_account{id,username},page_backed_instagram_accounts{id,username}',
          limit: 100,
        }).catch(err => ({ error: err instanceof Error ? err.message : 'me/accounts failed', data: [] })),
        fetch('https://api.frankfurter.app/latest?from=PLN&to=USD,EUR,GBP', { signal: AbortSignal.timeout(8000) })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);

      const allAdAccounts = Array.isArray(adAccountsRes.data) ? adAccountsRes.data : [];
      const targetAccounts = filterAccountId
        ? allAdAccounts.filter(a => String(a.account_id || '') === filterAccountId)
        : allAdAccounts.filter(a => /corsanta/i.test(String(a.name || '')));

      const inspectedAccounts = await Promise.all(
        targetAccounts.map(async acc => {
          const accId = String(acc.account_id || '');
          const [campaigns, adsets, pixels, promotePages, sampleAds] = await Promise.all([
            directGraph<{ data?: Array<Record<string, unknown>> }>(`act_${accId}/campaigns`, {
              fields:
                'id,name,status,effective_status,objective,daily_budget,lifetime_budget,bid_strategy,special_ad_categories,buying_type,created_time',
              limit: 60,
            }).catch(e => ({ error: e instanceof Error ? e.message : 'campaigns failed' })),
            directGraph<{ data?: Array<Record<string, unknown>> }>(`act_${accId}/adsets`, {
              fields:
                'id,name,campaign_id,status,effective_status,daily_budget,optimization_goal,billing_event,bid_strategy,bid_amount,promoted_object,attribution_spec,destination_type,targeting,dsa_beneficiary,dsa_payor,regional_regulated_categories,regional_regulation_identities,start_time',
              limit: 40,
            }).catch(async () =>
              directGraph<{ data?: Array<Record<string, unknown>> }>(`act_${accId}/adsets`, {
                fields:
                  'id,name,campaign_id,status,effective_status,daily_budget,optimization_goal,billing_event,bid_strategy,bid_amount,promoted_object,attribution_spec,destination_type,targeting,regional_regulated_categories,regional_regulation_identities,start_time',
                limit: 40,
              }).catch(e2 => ({ error: e2 instanceof Error ? e2.message : 'adsets failed' })),
            ),
            directGraph<{ data?: Array<Record<string, unknown>> }>(`act_${accId}/adspixels`, {
              fields: 'id,name',
              limit: 20,
            }).catch(e => ({ error: e instanceof Error ? e.message : 'pixels failed' })),
            directGraph<{ data?: Array<Record<string, unknown>> }>(`act_${accId}/promote_pages`, {
              fields: 'id,name,instagram_business_account{id,username}',
              limit: 50,
            }).catch(e => ({ error: e instanceof Error ? e.message : 'promote_pages failed' })),
            directGraph<{ data?: Array<Record<string, unknown>> }>(`act_${accId}/ads`, {
              fields: 'id,name,adset_id,campaign_id,status,effective_status,creative{id,name,url_tags,object_story_spec}',
              limit: 40,
            }).catch(e => ({ error: e instanceof Error ? e.message : 'ads failed' })),
          ]);

          // Also enrich top 5 adsets with dsa_beneficiary/dsa_payor if missing
          const adsetsList = 'data' in adsets && Array.isArray(adsets.data) ? adsets.data : [];
          await Promise.all(
            adsetsList.slice(0, 5).map(async s => {
              if (s.dsa_beneficiary === undefined && s.id) {
                try {
                  const dsa = await directGraph<Record<string, unknown>>(String(s.id), {
                    fields: 'dsa_beneficiary,dsa_payor',
                  });
                  if (dsa.dsa_beneficiary) s.dsa_beneficiary = dsa.dsa_beneficiary;
                  if (dsa.dsa_payor) s.dsa_payor = dsa.dsa_payor;
                } catch {
                  // optional
                }
              }
            }),
          );

          return {
            account: acc,
            campaigns: 'data' in campaigns ? campaigns.data : campaigns,
            adsets: 'data' in adsets ? adsets.data : adsets,
            pixels: 'data' in pixels ? pixels.data : pixels,
            promotePages: 'data' in promotePages ? promotePages.data : promotePages,
            sampleAds: 'data' in sampleAds ? sampleAds.data : sampleAds,
          };
        }),
      );

      return NextResponse.json({
        ok: true,
        fxPln: fxRes,
        allAdAccountsSummary: allAdAccounts.map(a => ({
          account_id: a.account_id,
          name: a.name,
          currency: a.currency,
          timezone_name: a.timezone_name,
          timezone_offset_hours_utc: a.timezone_offset_hours_utc,
          account_status: a.account_status,
        })),
        mePages: 'data' in meAccountsRes ? meAccountsRes.data : meAccountsRes,
        inspectedAccounts,
      });
    }

    if (action === 'launch_meta_campaign') {
      const rawBody = body as Record<string, unknown>;
      const step = String(rawBody.step || 'verify_campaign');
      const accountId = String(rawBody.accountId || '').replace(/^act_/, '').trim();

      if (step === 'update_object') {
        const objectId = String(rawBody.objectId || '').trim();
        const params = (rawBody.params && typeof rawBody.params === 'object' ? rawBody.params : {}) as Record<
          string,
          unknown
        >;
        if (!objectId) return NextResponse.json({ error: 'Brak objectId.' }, { status: 400 });
        const updatedObj = await directGraph(objectId, params, 'POST');
        return NextResponse.json({ ok: true, objectId, updatedObj });
      }

      if (step === 'create_campaign_and_adsets') {
        if (!accountId) return NextResponse.json({ error: 'Brak accountId.' }, { status: 400 });
        const campaignName = String(rawBody.campaignName || 'S_BRACE_ANTKI').trim();
        const dailyBudgetMinor = Number(rawBody.dailyBudgetMinor || 25000);
        const bidStrategy = String(rawBody.bidStrategy || 'LOWEST_COST_WITHOUT_CAP').trim();
        const bidAmountMinor = rawBody.bidAmountMinor ? Number(rawBody.bidAmountMinor) : undefined;
        const objective = String(rawBody.objective || 'OUTCOME_SALES').trim();
        const campaignStatus = String(rawBody.campaignStatus || 'ACTIVE').trim();
        const adSetStatus = String(rawBody.adSetStatus || 'ACTIVE').trim();
        const startTime = typeof rawBody.startTime === 'string' && rawBody.startTime.trim() ? rawBody.startTime.trim() : undefined;
        const sourceAdSetId = typeof rawBody.sourceAdSetId === 'string' ? rawBody.sourceAdSetId.trim() : '';
        const forceNewCampaign = Boolean(rawBody.forceNewCampaign);

        const adSetSpecs = Array.isArray(rawBody.adSets)
          ? (rawBody.adSets as Array<{ code?: string; name: string }>)
          : [{ code: 'ALL', name: String(rawBody.adSetName || 'S_BRACE_ANTKI_ALL') }];

        // 1. Check for existing non-deleted campaign by exact name unless forceNewCampaign
        let campaignId = typeof rawBody.campaignId === 'string' ? rawBody.campaignId.trim() : '';
        let campaignCreated = false;
        if (!campaignId && !forceNewCampaign) {
          const existingCamps = await directGraph<{ data?: Array<{ id: string; name: string; status: string }> }>(
            `act_${accountId}/campaigns`,
            { fields: 'id,name,status', limit: 100 },
          );
          const found = (existingCamps.data || []).find(
            c => c.name === campaignName && c.status !== 'DELETED' && c.status !== 'ARCHIVED',
          );
          if (found?.id) {
            campaignId = found.id;
          }
        }

        if (!campaignId) {
          const campPayload: Record<string, unknown> = {
            name: campaignName,
            objective,
            status: campaignStatus,
            special_ad_categories: [],
            daily_budget: dailyBudgetMinor,
            bid_strategy: bidStrategy,
          };
          const createdCamp = await directGraph<{ id: string }>(`act_${accountId}/campaigns`, campPayload, 'POST');
          campaignId = createdCamp.id;
          campaignCreated = true;
        }

        // 2. Load sourceAdSet if provided
        let sourceAdSet: Record<string, unknown> = {};
        if (sourceAdSetId) {
          sourceAdSet = await directGraph<Record<string, unknown>>(sourceAdSetId, {
            fields:
              'id,name,targeting,optimization_goal,billing_event,promoted_object,attribution_spec,destination_type,regional_regulated_categories,regional_regulation_identities',
          });
          try {
            const dsa = await directGraph<Record<string, unknown>>(sourceAdSetId, {
              fields: 'dsa_beneficiary,dsa_payor',
            });
            if (dsa.dsa_beneficiary) sourceAdSet.dsa_beneficiary = dsa.dsa_beneficiary;
            if (dsa.dsa_payor) sourceAdSet.dsa_payor = dsa.dsa_payor;
          } catch {
            // optional
          }
        }

        const rawTargeting = (
          rawBody.targetingOverride && typeof rawBody.targetingOverride === 'object'
            ? JSON.parse(JSON.stringify(rawBody.targetingOverride))
            : sourceAdSet.targeting
            ? JSON.parse(JSON.stringify(sourceAdSet.targeting))
            : { geo_locations: { countries: ['PL'] }, age_min: 35, age_max: 65 }
        ) as Record<string, unknown>;

        if (Array.isArray(rawTargeting.instagram_positions)) {
          const cleanedIg = (rawTargeting.instagram_positions as string[]).filter(
            p => p !== 'explore_home',
          );
          if (cleanedIg.length > 0) rawTargeting.instagram_positions = cleanedIg;
          else delete rawTargeting.instagram_positions;
        }

        const existingSetsRes = await directGraph<{ data?: Array<{ id: string; name: string; status: string }> }>(
          `${campaignId}/adsets`,
          { fields: 'id,name,status', limit: 100 },
        ).catch(() => ({ data: [] as Array<{ id: string; name: string; status: string }> }));
        const existingSets = existingSetsRes.data || [];

        const createdAdSets: Array<{ code: string; name: string; id: string; reused: boolean }> = [];
        for (const spec of adSetSpecs) {
          const setName = String(spec.name || '').trim();
          const setCode = String(spec.code || setName).trim();
          const match = existingSets.find(s => s.name === setName && s.status !== 'DELETED');
          if (match?.id) {
            createdAdSets.push({ code: setCode, name: setName, id: match.id, reused: true });
            continue;
          }

          const adSetPayload: Record<string, unknown> = {
            name: setName,
            campaign_id: campaignId,
            status: adSetStatus,
            optimization_goal: String(rawBody.optimizationGoal || sourceAdSet.optimization_goal || 'OFFSITE_CONVERSIONS'),
            billing_event: String(rawBody.billingEvent || sourceAdSet.billing_event || 'IMPRESSIONS'),
            targeting: rawTargeting,
            destination_type: String(rawBody.destinationType || sourceAdSet.destination_type || 'WEBSITE'),
          };
          if (startTime) adSetPayload.start_time = startTime;
          if (bidAmountMinor) adSetPayload.bid_amount = bidAmountMinor;

          const promotedObject =
            rawBody.promotedObject ||
            (rawBody.pixelId
              ? { pixel_id: String(rawBody.pixelId), custom_event_type: 'PURCHASE' }
              : sourceAdSet.promoted_object);
          if (promotedObject) adSetPayload.promoted_object = promotedObject;
          if (sourceAdSet.attribution_spec) adSetPayload.attribution_spec = sourceAdSet.attribution_spec;
          if (sourceAdSet.regional_regulated_categories) {
            adSetPayload.regional_regulated_categories = sourceAdSet.regional_regulated_categories;
          }
          if (sourceAdSet.regional_regulation_identities) {
            adSetPayload.regional_regulation_identities = sourceAdSet.regional_regulation_identities;
          }

          const dsaBeneficiary = rawBody.dsaBeneficiary || sourceAdSet.dsa_beneficiary;
          const dsaPayor = rawBody.dsaPayor || sourceAdSet.dsa_payor;
          if (dsaBeneficiary) adSetPayload.dsa_beneficiary = dsaBeneficiary;
          if (dsaPayor) adSetPayload.dsa_payor = dsaPayor;

          let newSetId = '';
          try {
            const createdSet = await directGraph<{ id: string }>(`act_${accountId}/adsets`, adSetPayload, 'POST');
            newSetId = createdSet.id;
          } catch (setErr) {
            const msg = setErr instanceof Error ? setErr.message : '';
            if (msg.includes('instagram_positions') || msg.includes('explore')) {
              const fallbackTargeting = { ...rawTargeting };
              if (Array.isArray(fallbackTargeting.instagram_positions)) {
                fallbackTargeting.instagram_positions = (fallbackTargeting.instagram_positions as string[]).filter(
                  p => p !== 'explore' && p !== 'explore_home' && p !== 'profile_feed',
                );
              }
              const retrySet = await directGraph<{ id: string }>(
                `act_${accountId}/adsets`,
                { ...adSetPayload, targeting: fallbackTargeting },
                'POST',
              );
              newSetId = retrySet.id;
            } else {
              throw setErr;
            }
          }
          createdAdSets.push({ code: setCode, name: setName, id: newSetId, reused: false });
        }

        return NextResponse.json({
          ok: true,
          campaignId,
          campaignName,
          campaignCreated,
          dailyBudgetMinor,
          startTime,
          adSets: createdAdSets,
        });
      }

      if (step === 'push_ads') {
        if (!accountId) return NextResponse.json({ error: 'Brak accountId.' }, { status: 400 });
        const campaignId = String(rawBody.campaignId || '').trim();
        const defaultAdSetId = String(rawBody.adSetId || '').trim();
        const adSetMap = (rawBody.adSetMap && typeof rawBody.adSetMap === 'object' ? rawBody.adSetMap : {}) as Record<
          string,
          string
        >;
        const targetAngleIds = Array.isArray(rawBody.angleIds)
          ? (rawBody.angleIds as string[]).map(s => String(s).trim()).filter(Boolean)
          : [];
        const defaultPageId = String(rawBody.defaultPageId || '').trim();
        const defaultInstagramUserId =
          typeof rawBody.defaultInstagramUserId === 'string' ? rawBody.defaultInstagramUserId.trim() : '';
        const defaultThreadsUserId =
          typeof rawBody.defaultThreadsUserId === 'string' ? rawBody.defaultThreadsUserId.trim() : '';
        const pageMap = (rawBody.pageMap && typeof rawBody.pageMap === 'object' ? rawBody.pageMap : {}) as Record<
          string,
          { pageId: string; instagramUserId?: string; threadsUserId?: string; label?: string }
        >;
        const cta = String(rawBody.cta || 'LEARN_MORE').trim();
        const adStatus = rawBody.adStatus === 'PAUSED' ? 'PAUSED' : 'ACTIVE';
        const includeSecondImage = rawBody.includeSecondImage !== false;
        const updateExisting = Boolean(rawBody.updateExisting);
        const urlTags =
          typeof rawBody.urlTags === 'string'
            ? rawBody.urlTags.trim()
            : 'utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}';
        const destinationUrlOverride =
          typeof rawBody.destinationUrlOverride === 'string' && rawBody.destinationUrlOverride.startsWith('https://')
            ? rawBody.destinationUrlOverride.trim()
            : '';

        const { ads } = await readStrydeLibraryState();
        const selectedAds = targetAngleIds.length > 0 ? ads.filter(a => targetAngleIds.includes(a.angleId)) : ads;
        if (selectedAds.length === 0) {
          return NextResponse.json({ error: 'Brak wybranych kątów do wypchnięcia.' }, { status: 400 });
        }

        // Load per-account hash cache
        const hashState = await inOwnerWorkspace(() =>
          readState<{ hashes?: Record<string, string> }>(META_HASH_CACHE_KEY, { hashes: {} }),
        ).catch(() => ({ value: { hashes: {} as Record<string, string> } }));
        const hashCache: Record<string, string> = { ...(hashState.value?.hashes || {}) };
        let newHashesAdded = false;

        const uploadImageForAccount = async (imgUrl: string, fileTag: string): Promise<string> => {
          const cleanUrl = (imgUrl || '').trim();
          if (!cleanUrl) throw new Error(`Brak URL obrazu dla ${fileTag}`);
          const cacheKey = `${accountId}:${cleanUrl}`;
          if (hashCache[cacheKey]) return hashCache[cacheKey];

          let base64Bytes = '';
          if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
            const imgRes = await fetch(cleanUrl, { signal: AbortSignal.timeout(25000) });
            if (!imgRes.ok) {
              throw new Error(`Nie udało się pobrać obrazu (${imgRes.status}): ${cleanUrl}`);
            }
            const buf = Buffer.from(await imgRes.arrayBuffer());
            base64Bytes = buf.toString('base64');
          } else if (cleanUrl.startsWith('data:image/')) {
            const m = cleanUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
            if (!m?.[1]) throw new Error(`Nieprawidłowy data URL dla ${fileTag}`);
            base64Bytes = m[1];
          } else if (cleanUrl.startsWith('/')) {
            const localPath = path.join(process.cwd(), 'public', cleanUrl.replace(/^\//, ''));
            if (fs.existsSync(localPath)) {
              base64Bytes = fs.readFileSync(localPath).toString('base64');
            } else {
              const prodRes = await fetch(`https://szekspir.vercel.app${cleanUrl}`, {
                signal: AbortSignal.timeout(20000),
              });
              if (!prodRes.ok) throw new Error(`Brak lokalnego obrazu: ${cleanUrl}`);
              base64Bytes = Buffer.from(await prodRes.arrayBuffer()).toString('base64');
            }
          } else {
            throw new Error(`Nieobsługiwany format obrazu: ${cleanUrl}`);
          }

          const upRes = await directGraph<{ images?: Record<string, { hash?: string }> }>(
            `act_${accountId}/adimages`,
            { bytes: base64Bytes, name: `${fileTag}-${Date.now()}.jpg` },
            'POST',
          );
          const hash = upRes?.images ? Object.values(upRes.images)[0]?.hash : undefined;
          if (!hash) {
            throw new Error(`Meta nie zwróciła image_hash dla ${fileTag}`);
          }
          hashCache[cacheKey] = hash;
          newHashesAdded = true;
          return hash;
        };

        // Check existing ads in campaign to avoid duplicates on retry
        const existingAdsMap = new Map<string, string>();
        if (campaignId) {
          try {
            const existingAdsRes = await directGraph<{
              data?: Array<{ id: string; name: string; adset_id: string; status: string }>;
            }>(`${campaignId}/ads`, { fields: 'id,name,adset_id,status', limit: 200 });
            for (const item of existingAdsRes.data || []) {
              if (item.id && item.name && item.adset_id && item.status !== 'DELETED') {
                existingAdsMap.set(`${item.adset_id}:${item.name.trim()}`, item.id);
              }
            }
          } catch {
            // non-blocking
          }
        }

        const results: Array<{
          angleId: string;
          code: string;
          variant: 'A' | 'B';
          adName: string;
          adSetId: string;
          pageId: string;
          imageHash?: string;
          adId?: string;
          creativeId?: string;
          skipped?: boolean;
          updated?: boolean;
          ok: boolean;
          error?: string;
        }> = [];

        for (const ad of selectedAds) {
          const preset = STRYDE_PRESET_ANGLES.find(p => p.id === ad.angleId);
          const targetAdSetId = adSetMap[ad.angleId] || adSetMap[ad.stageId] || defaultAdSetId;
          if (!targetAdSetId) {
            results.push({
              angleId: ad.angleId,
              code: ad.code,
              variant: 'A',
              adName: ad.code,
              adSetId: '',
              pageId: '',
              ok: false,
              error: `Brak docelowego adSetId dla ${ad.angleId}`,
            });
            continue;
          }

          const actor = pageMap[ad.angleId] ||
            pageMap[ad.pageId] || {
              pageId: defaultPageId,
              instagramUserId: defaultInstagramUserId || undefined,
              threadsUserId: defaultThreadsUserId || undefined,
            };
          if (!actor.pageId) {
            results.push({
              angleId: ad.angleId,
              code: ad.code,
              variant: 'A',
              adName: ad.code,
              adSetId: targetAdSetId,
              pageId: '',
              ok: false,
              error: `Brak pageId dla ${ad.angleId}`,
            });
            continue;
          }

          const cleanPrimary = ad.primaryText.replace(/\*\*/g, '').replace(/™/g, '').trim();
          const cleanHeadline = ad.headline.replace(/\*\*/g, '').replace(/™/g, '').trim();
          const cleanDesc = (ad.description || '').replace(/\*\*/g, '').replace(/™/g, '').trim();
          const targetLink = destinationUrlOverride || normalizeSardianUrl(ad.destinationUrl, STRYDE_PDP_URL);
          const shortTitle = preset?.shortTitle || ad.title;

          const hasSecond =
            includeSecondImage &&
            Boolean(ad.secondImageUrl && ad.secondImageUrl.trim() && ad.secondImageUrl.trim() !== ad.imageUrl.trim());

          const variants: Array<{ variant: 'A' | 'B'; imgUrl: string; adName: string }> = hasSecond
            ? [
                {
                  variant: 'A',
                  imgUrl: ad.imageUrl,
                  adName: `${ad.code}_A | ${shortTitle}`,
                },
                {
                  variant: 'B',
                  imgUrl: ad.secondImageUrl!,
                  adName: `${ad.code}_B | ${shortTitle}`,
                },
              ]
            : [
                {
                  variant: 'A',
                  imgUrl: ad.imageUrl,
                  adName: `${ad.code} | ${shortTitle}`,
                },
              ];

          for (const v of variants) {
            const existingKey = `${targetAdSetId}:${v.adName.trim()}`;
            const existingAdId = existingAdsMap.get(existingKey);
            if (existingAdId && !updateExisting) {
              results.push({
                angleId: ad.angleId,
                code: ad.code,
                variant: v.variant,
                adName: v.adName,
                adSetId: targetAdSetId,
                pageId: actor.pageId,
                adId: existingAdId,
                skipped: true,
                ok: true,
              });
              continue;
            }

            try {
              const hash = await uploadImageForAccount(v.imgUrl, `sardian-${ad.code}-${v.variant}`);

              const makeSpec = (withIg: boolean, withThreads: boolean) => ({
                name: `${v.adName} - Creative`,
                ...(urlTags ? { url_tags: urlTags } : {}),
                object_story_spec: {
                  page_id: actor.pageId,
                  ...(withIg && actor.instagramUserId ? { instagram_user_id: actor.instagramUserId } : {}),
                  ...(withThreads && actor.threadsUserId ? { threads_user_id: actor.threadsUserId } : {}),
                  link_data: {
                    image_hash: hash,
                    link: targetLink,
                    message: cleanPrimary,
                    name: cleanHeadline,
                    ...(cleanDesc ? { description: cleanDesc } : {}),
                    call_to_action: {
                      type: cta,
                      value: { link: targetLink },
                    },
                  },
                },
              });

              let creativeRes: { id: string };
              try {
                creativeRes = await directGraph<{ id: string }>(
                  `act_${accountId}/adcreatives`,
                  makeSpec(Boolean(actor.instagramUserId), Boolean(actor.threadsUserId)),
                  'POST',
                );
              } catch (crErr) {
                const msg = crErr instanceof Error ? crErr.message : '';
                if (actor.threadsUserId && (msg.toLowerCase().includes('threads') || msg.includes('actor'))) {
                  creativeRes = await directGraph<{ id: string }>(
                    `act_${accountId}/adcreatives`,
                    makeSpec(Boolean(actor.instagramUserId), false),
                    'POST',
                  );
                } else {
                  creativeRes = await directGraph<{ id: string }>(
                    `act_${accountId}/adcreatives`,
                    makeSpec(false, false),
                    'POST',
                  );
                }
              }

              if (existingAdId && updateExisting) {
                await directGraph(existingAdId, { creative: { creative_id: creativeRes.id }, status: adStatus }, 'POST');
                results.push({
                  angleId: ad.angleId,
                  code: ad.code,
                  variant: v.variant,
                  adName: v.adName,
                  adSetId: targetAdSetId,
                  pageId: actor.pageId,
                  imageHash: hash,
                  adId: existingAdId,
                  creativeId: creativeRes.id,
                  updated: true,
                  ok: true,
                });
              } else {
                const createdAd = await directGraph<{ id: string }>(
                  `act_${accountId}/ads`,
                  {
                    name: v.adName,
                    adset_id: targetAdSetId,
                    creative: { creative_id: creativeRes.id },
                    status: adStatus,
                  },
                  'POST',
                );
                results.push({
                  angleId: ad.angleId,
                  code: ad.code,
                  variant: v.variant,
                  adName: v.adName,
                  adSetId: targetAdSetId,
                  pageId: actor.pageId,
                  imageHash: hash,
                  adId: createdAd.id,
                  creativeId: creativeRes.id,
                  ok: true,
                });
              }
            } catch (pushErr) {
              results.push({
                angleId: ad.angleId,
                code: ad.code,
                variant: v.variant,
                adName: v.adName,
                adSetId: targetAdSetId,
                pageId: actor.pageId,
                ok: false,
                error: pushErr instanceof Error ? pushErr.message : 'Błąd wysyłki reklamy',
              });
            }
          }
        }

        if (newHashesAdded) {
          await inOwnerWorkspace(() =>
            mutate<{ hashes?: Record<string, string> }, void>(META_HASH_CACHE_KEY, { hashes: {} }, s => {
              s.hashes = { ...(s.hashes || {}), ...hashCache };
            }),
          ).catch(() => {});
        }

        return NextResponse.json({
          ok: true,
          pushedCount: results.filter(r => r.ok && !r.skipped).length,
          skippedCount: results.filter(r => r.skipped).length,
          errorsCount: results.filter(r => !r.ok).length,
          results,
        });
      }

      if (step === 'verify_campaign') {
        const campaignId = String(rawBody.campaignId || '').trim();
        if (!campaignId) return NextResponse.json({ error: 'Brak campaignId.' }, { status: 400 });

        const [campaign, adsets, ads] = await Promise.all([
          directGraph<Record<string, unknown>>(campaignId, {
            fields: 'id,name,status,effective_status,daily_budget,lifetime_budget,bid_strategy,objective,created_time',
          }),
          directGraph<{ data?: Array<Record<string, unknown>> }>(`${campaignId}/adsets`, {
            fields:
              'id,name,status,effective_status,start_time,daily_budget,optimization_goal,billing_event,bid_strategy,bid_amount,promoted_object,dsa_beneficiary,dsa_payor',
            limit: 50,
          }),
          directGraph<{ data?: Array<Record<string, unknown>> }>(`${campaignId}/ads`, {
            fields: 'id,name,adset_id,status,effective_status,creative{id,name}',
            limit: 200,
          }),
        ]);

        const adsList = Array.isArray(ads.data) ? ads.data : [];
        return NextResponse.json({
          ok: true,
          campaign,
          adSetsCount: Array.isArray(adsets.data) ? adsets.data.length : 0,
          adSets: adsets.data || [],
          adsCount: adsList.length,
          ads: adsList,
        });
      }

      return NextResponse.json({ error: `Nieznany step: ${step}` }, { status: 400 });
    }

    return NextResponse.json({ error: `Nieznana akcja: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd zapisu w Sardian PL.' },
      { status: 500 },
    );
  }
});
