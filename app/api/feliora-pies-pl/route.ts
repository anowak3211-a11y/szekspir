import path from 'path';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { accountRoute } from '@/lib/account-route';
import { inOwnerWorkspace } from '@/lib/account-context';
import { metaToken, metaProof, META_VERSION } from '@/lib/meta-client';
import { mutate, readState } from '@/lib/store';
import {
  FELIORA_PIES_ADVERTORIAL_URL,
  FELIORA_PIES_DEFAULT_URL,
  FELIORA_PIES_FANPAGES,
  FELIORA_PIES_IMAGE_LIBRARY,
  FELIORA_PIES_META_ACCOUNT_ID,
  FELIORA_PIES_META_MAIN_CAMPAIGN_ID,
  FELIORA_PIES_META_NATIVE_CAMPAIGN_ID,
  FELIORA_PIES_META_PIXEL_ID,
  FELIORA_PIES_PDP_URL,
  FELIORA_PIES_PRESET_ANGLES,
  FELIORA_PIES_STAGES,
  buildAllFelioraPiesPrewrittenAds,
  sanitizeAndAuditFelioraPiesPl,
  type FelioraPiesImageAsset,
  type FelioraPiesPlGeneratedAd,
} from '@/lib/feliora-pies-pl';

export const maxDuration = 300;

const STATE_KEY = 'feliora-pies-pl-v11-random-discovery';
const DEFAULT_CREATED_AT = Date.parse('2026-11-04T12:50:00+01:00');

interface FelioraPiesPlLibraryState {
  ads: FelioraPiesPlGeneratedAd[];
  customImages?: FelioraPiesImageAsset[];
}

async function resolveAllMetaAuthCandidates(): Promise<Array<{ token: string; proof?: string }>> {
  const candidates: Array<{ token: string; proof?: string }> = [];
  const seen = new Set<string>();
  const addCandidate = (t?: string, proof?: string) => {
    if (!t || seen.has(t)) return;
    seen.add(t);
    candidates.push({ token: t, proof });
  };

  try {
    const t = await metaToken();
    addCandidate(t, await metaProof(t).catch(() => undefined));
  } catch {
    // ignore
  }
  try {
    const t = await inOwnerWorkspace(() => metaToken());
    addCandidate(t, await inOwnerWorkspace(() => metaProof(t)).catch(() => undefined));
  } catch {
    // ignore
  }
  try {
    const { accountRegistry } = await import('@/lib/account-repository');
    const { inWorkspace } = await import('@/lib/account-context');
    const reg = await accountRegistry();
    for (const u of Object.values(reg.users || {})) {
      try {
        const t = await inWorkspace(u, () => metaToken());
        const p = await inWorkspace(u, () => metaProof(t)).catch(() => undefined);
        addCandidate(t, p);
      } catch {
        // continue
      }
    }
  } catch {
    // ignore
  }
  if (process.env.META_ACCESS_TOKEN) {
    addCandidate(process.env.META_ACCESS_TOKEN, undefined);
  }
  if (!candidates.length) {
    throw new Error('Brak połączonego tokenu Meta w ustawieniach Szekspira.');
  }
  return candidates;
}

let cachedWorkingAuth: { token: string; proof?: string } | null = null;

async function directGraph<T = Record<string, unknown>>(
  graphPath: string,
  params: Record<string, unknown> = {},
  method: 'GET' | 'POST' = 'GET',
): Promise<T> {
  const allCandidates = await resolveAllMetaAuthCandidates();
  const candidates = cachedWorkingAuth
    ? [cachedWorkingAuth, ...allCandidates.filter(c => c.token !== cachedWorkingAuth!.token)]
    : allCandidates;
  let lastError: Error | undefined;

  for (const { token, proof } of candidates) {
    const url = new URL(`https://graph.facebook.com/${META_VERSION}/${graphPath}`);
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
      const code = e?.code || r.status;
      const subcode = e?.error_subcode || 0;
      lastError = new Error(`Meta (${code}/${subcode}): ${e?.error_user_msg || e?.message || 'Request failed'}`);
      if (code === 190 || (code === 100 && subcode === 33) || subcode === 1815199) {
        continue;
      }
      throw lastError;
    }
    cachedWorkingAuth = { token, proof };
    return data as T;
  }

  throw lastError || new Error('Meta Graph request failed across all workspace tokens.');
}

async function uploadBytesToFelioraPiesMeta(bytesBase64: string, fileName: string): Promise<string | undefined> {
  const cleanName = (fileName || `feliora-pies-${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
  const upRes = await directGraph<{ images?: Record<string, { hash?: string; url?: string }> }>(
    `act_${FELIORA_PIES_META_ACCOUNT_ID}/adimages`,
    { bytes: bytesBase64, name: cleanName },
    'POST',
  );
  const first = upRes?.images ? Object.values(upRes.images)[0] : undefined;
  return first?.hash;
}

async function ensureMetaImageHash(imageUrl: string, existingHash?: string): Promise<string> {
  if (existingHash && existingHash.trim()) return existingHash.trim();
  const cleanUrl = (imageUrl || '').trim();
  if (!cleanUrl) throw new Error('Brak przypisanego zdjęcia dla reklamy.');

  if (cleanUrl.startsWith('data:image/')) {
    const m = cleanUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
    if (!m) throw new Error('Nieprawidłowy format dataUrl zdjęcia.');
    const hash = await uploadBytesToFelioraPiesMeta(m[1], `feliora-pies-${Date.now()}.jpg`);
    if (hash) return hash;
  } else if (cleanUrl.startsWith('/')) {
    const relPath = cleanUrl.split('?')[0].replace(/^\/+/, '');
    const absPath = path.join(process.cwd(), 'public', relPath);
    const buf = await fs.readFile(absPath);
    const hash = await uploadBytesToFelioraPiesMeta(buf.toString('base64'), path.basename(absPath));
    if (hash) return hash;
  } else if (cleanUrl.startsWith('http')) {
    const { safeDownload } = await import('@/lib/safe-fetch');
    const { buffer } = await safeDownload(cleanUrl, 15 * 1024 * 1024);
    const hash = await uploadBytesToFelioraPiesMeta(
      Buffer.from(buffer).toString('base64'),
      `feliora-pies-kie-${Date.now()}.jpg`,
    );
    if (hash) return hash;
  }

  throw new Error(`Nie udało się wgrać grafiki (${cleanUrl}) na konto Meta Feliora.`);
}

async function readFelioraPiesLibraryState(): Promise<{
  ads: FelioraPiesPlGeneratedAd[];
  customImages: FelioraPiesImageAsset[];
}> {
  const defaultAds = buildAllFelioraPiesPrewrittenAds();
  try {
    const { value } = await readState<FelioraPiesPlLibraryState>(STATE_KEY, {
      ads: defaultAds,
      customImages: [],
    });
    const stored = Array.isArray(value?.ads) ? value.ads : [];
    const customImages = Array.isArray(value?.customImages) ? value.customImages : [];
    if (stored.length === 0 && customImages.length === 0) {
      return { ads: defaultAds, customImages };
    }
    const defaultByAngle = new Map<string, FelioraPiesPlGeneratedAd>();
    const byAngle = new Map<string, FelioraPiesPlGeneratedAd>();
    for (const ad of defaultAds) {
      defaultByAngle.set(ad.angleId, ad);
      byAngle.set(ad.angleId, ad);
    }
    const storedByAngle = new Map<string, FelioraPiesPlGeneratedAd>();
    for (const ad of stored) {
      if (ad?.angleId) storedByAngle.set(ad.angleId, ad);
      const baseAd = byAngle.get(ad.angleId);
      if (!baseAd) continue;
      const audited = sanitizeAndAuditFelioraPiesPl(
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
        secondImageUrl: undefined,
        secondImageHash: undefined,
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
      const baseAd = defaultByAngle.get(ad.angleId);
      const storedAd = storedByAngle.get(ad.angleId);
      const userModified = Boolean(storedAd?.updatedAt && storedAd.updatedAt > DEFAULT_CREATED_AT);
      const needsScene1 = !ad.imageUrl || (!userModified && ad.imageUrl === baseAd?.imageUrl);
      return {
        ...ad,
        ...(needsScene1 && scene1 ? { imageUrl: scene1.url, imageHash: scene1.imageHash || ad.imageHash } : {}),
        secondImageUrl: undefined,
        secondImageHash: undefined,
      };
    });

    return { ads: finalAds, customImages };
  } catch {
    return { ads: defaultAds, customImages: [] };
  }
}

export const GET = accountRoute(async () => {
  try {
    const { ads, customImages } = await readFelioraPiesLibraryState();
    return NextResponse.json({
      presets: FELIORA_PIES_PRESET_ANGLES,
      awarenessStages: FELIORA_PIES_STAGES,
      fanpages: FELIORA_PIES_FANPAGES,
      savedAds: ads,
      imageLibrary: [...customImages, ...FELIORA_PIES_IMAGE_LIBRARY],
      metaConfig: {
        accountId: FELIORA_PIES_META_ACCOUNT_ID,
        nativeCampaignId: FELIORA_PIES_META_NATIVE_CAMPAIGN_ID,
        mainCampaignId: FELIORA_PIES_META_MAIN_CAMPAIGN_ID,
        pixelId: FELIORA_PIES_META_PIXEL_ID,
        advertorialUrl: FELIORA_PIES_ADVERTORIAL_URL,
        pdpUrl: FELIORA_PIES_PDP_URL,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd ładowania biblioteki Feliora PL (Psy).' },
      { status: 500 },
    );
  }
});

export const POST = accountRoute(async (req: Request) => {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      ad?: FelioraPiesPlGeneratedAd;
      angleId?: string;
      angleIds?: string[];
      imageUrl?: string;
      imageHash?: string;
      secondImageUrl?: string | null;
      secondImageHash?: string | null;
      assetId?: string;
      dataUrl?: string;
      fileName?: string;
      label?: string;
      adSetName?: string;
      campaignId?: string;
      templateAdSetId?: string;
      urlMode?: 'pdp' | 'split_ab';
      pageId?: string;
      adStatus?: 'PAUSED' | 'ACTIVE';
      taskId?: string;
      prompt?: string;
      primaryText?: string;
      headline?: string;
      title?: string;
      isManual?: boolean;
      compact?: boolean;
    };

    const action = body.action || 'save';

    if (action === 'generate_5_kie_images') {
      const isManual = Boolean(body.isManual);
      if (!isManual) {
        return NextResponse.json(
          { error: 'Generowanie Kie.ai wymaga ręcznego uruchomienia (ochrona kredytów).' },
          { status: 400 },
        );
      }

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
      const preset = FELIORA_PIES_PRESET_ANGLES.find(a => a.id === angleId);
      const primaryText = (body.primaryText || '').trim();
      const headline = (body.headline || preset?.title || '').trim();
      const title = (body.title || preset?.shortTitle || angleId || 'Feliora PL Psy').trim();

      const allScenes = await planNativeIphoneScenesFromScript({
        brand: 'feliora-dog',
        angleId,
        primaryText,
        headline,
        title,
      });

      const isCompact = Boolean(body.compact);
      const customPrompt = String((body as Record<string, unknown>).customPrompt || '').trim();
      const includeRef = Boolean((body as Record<string, unknown>).includeProductRef);

      let productRefKieUrl: string | undefined;
      if (includeRef) {
        try {
          productRefKieUrl = await uploadPublicReferenceToKie('/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg');
        } catch {
          productRefKieUrl = undefined;
        }
      }

      if (customPrompt) {
        const count = Math.min(Math.max(Number((body as Record<string, unknown>).count) || 4, 1), 12);
        const customScenes = Array.from({ length: count }, (_, i) => ({
          label: `${i + 1}. [WŁASNY PROMPT #${i + 1}] ${customPrompt.slice(0, 52)}`,
          scenePrompt: `${customPrompt} (Variation #${i + 1}: candid everyday iPhone 15 angle #${i + 1} in natural Polish daylight).`,
          includeProductRef: includeRef,
        }));
        const customResults = await Promise.all(
          customScenes.map(async (scene, idx) => {
            const fullPrompt = formatRawIphoneKiePrompt(scene.scenePrompt, 'feliora-dog', scene.includeProductRef);
            const payload = buildKieCreateTaskPayload({
              model: 'nano-banana-pro',
              prompt: fullPrompt,
              imageUrls: scene.includeProductRef && productRefKieUrl ? [productRefKieUrl] : [],
              aspectRatio: '1:1',
              resolution: '2K',
            });
            try {
              const taskId = await submitKieRipperTask(payload);
              return { index: idx + 1, label: scene.label, prompt: fullPrompt, includeProductRef: scene.includeProductRef, taskId };
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
        const tasks = customResults.filter(t => Boolean(t.taskId));
        if (tasks.length === 0) {
          const firstErr = customResults.find(t => 'error' in t && t.error)?.error || 'Kie.ai nie utworzyło żadnego zadania.';
          return NextResponse.json({ error: firstErr }, { status: 500 });
        }
        return NextResponse.json({ ok: true, angleId, tasks });
      }

      const isSingle = Boolean((body as Record<string, unknown>).single) || Number((body as Record<string, unknown>).count) === 1;
      const scenes = isSingle ? allScenes.slice(0, 1) : isCompact ? allScenes.slice(0, 4) : allScenes.slice(0, 12);

      const taskResults = await Promise.all(
        scenes.map(async (scene, idx) => {
          const useProductRef = Boolean(includeRef && scene.includeProductRef);
          const fullPrompt = formatRawIphoneKiePrompt(
            scene.scenePrompt,
            'feliora-dog',
            useProductRef,
          );
          const payload = buildKieCreateTaskPayload({
            model: 'nano-banana-pro',
            prompt: fullPrompt,
            imageUrls: useProductRef && productRefKieUrl ? [productRefKieUrl] : [],
            aspectRatio: '1:1',
            resolution: '2K',
          });
          try {
            const taskId = await submitKieRipperTask(payload);
            return {
              index: idx + 1,
              label: scene.label,
              prompt: fullPrompt,
              includeProductRef: useProductRef,
              taskId,
            };
          } catch (err) {
            return {
              index: idx + 1,
              label: scene.label,
              prompt: fullPrompt,
              includeProductRef: useProductRef,
              taskId: '',
              error: err instanceof Error ? err.message : 'Kie.ai createTask error',
            };
          }
        }),
      );

      const tasks = taskResults.filter(t => Boolean(t.taskId));
      if (tasks.length === 0) {
        const firstErr =
          taskResults.find(t => 'error' in t && t.error)?.error || 'Kie.ai nie utworzyło żadnego zadania.';
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
      const preset = FELIORA_PIES_PRESET_ANGLES.find(a => a.id === angleId);
      const label = (body.label || `iPhone Clean #${preset?.number || ''}`).trim();
      const assetId = `kie-feliora-pies-iphone-${taskId}`;

      let uploadedHash = '';
      try {
        const { buffer } = await safeDownload(status.resultUrl, 15 * 1024 * 1024);
        const base64Bytes = Buffer.from(buffer).toString('base64');
        const { uploadCustomAntkiImageToMeta } = await import('@/lib/meta-adsets');
        const metaRes = await uploadCustomAntkiImageToMeta({
          bytes: base64Bytes,
          fileName: `${assetId}.jpg`,
          accountId: FELIORA_PIES_META_ACCOUNT_ID,
        });
        uploadedHash = metaRes.hash || '';
      } catch {
        // Non-blocking
      }

      const newAsset: FelioraPiesImageAsset = {
        id: assetId,
        url: status.resultUrl,
        imageHash: uploadedHash,
        label: preset ? `#${preset.number} · ${label}` : label,
        adsetOrigin: 'Google AI Clean iPhone 1:1 (Styl Sardian)',
        adOrigin: preset?.code || 'DOG-CLEAN',
        aspectRatio: '1:1',
        source: 'ai',
        angleId: angleId || undefined,
        kiePrompt: body.prompt || undefined,
      };

      const isScene1 = /^1\./.test(label);
      const now = Date.now();
      const defaultAds = buildAllFelioraPiesPrewrittenAds();
      const updatedState = await mutate<
        FelioraPiesPlLibraryState,
        { customImages: FelioraPiesImageAsset[]; ads: FelioraPiesPlGeneratedAd[] }
      >(STATE_KEY, { ads: defaultAds, customImages: [] }, state => {
        const customList = Array.isArray(state.customImages) ? [...state.customImages] : [];
        const existingIdx = customList.findIndex(item => item.id === assetId);
        if (existingIdx >= 0) {
          customList[existingIdx] = newAsset;
        } else {
          customList.unshift(newAsset);
        }
        state.customImages = customList.slice(0, 1500);

        const adsList = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
        if (angleId && isScene1) {
          const adIdx = adsList.findIndex(item => item.angleId === angleId);
          const baseAd = adIdx >= 0 ? adsList[adIdx] : defaultAds.find(a => a.angleId === angleId);
          if (baseAd) {
            const updatedAd: FelioraPiesPlGeneratedAd = {
              ...baseAd,
              imageUrl: newAsset.url,
              imageHash: newAsset.imageHash || baseAd.imageHash,
              secondImageUrl: undefined,
              secondImageHash: undefined,
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
        imageLibrary: [...updatedState.customImages, ...FELIORA_PIES_IMAGE_LIBRARY],
        savedAds: updatedState.ads,
      });
    }

    if (action === 'save' && body.ad) {
      const defaultAds = buildAllFelioraPiesPrewrittenAds();
      const audited = sanitizeAndAuditFelioraPiesPl(body.ad.primaryText, body.ad.headline, body.ad.description);
      const updatedAd: FelioraPiesPlGeneratedAd = {
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
      const savedAds = await mutate<FelioraPiesPlLibraryState, FelioraPiesPlGeneratedAd[]>(
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

    if (action === 'set_image' || action === 'assign_image') {
      const targetAngleIds =
        Array.isArray(body.angleIds) && body.angleIds.length > 0
          ? body.angleIds
          : body.angleId
          ? [body.angleId]
          : [];
      if (!targetAngleIds.length) {
        return NextResponse.json({ error: 'Brak angleId.' }, { status: 400 });
      }
      const defaultAds = buildAllFelioraPiesPrewrittenAds();
      const now = Date.now();
      const savedAds = await mutate<FelioraPiesPlLibraryState, FelioraPiesPlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultAds, customImages: [] },
        state => {
          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
          for (const targetAngleId of targetAngleIds) {
            const idx = list.findIndex(item => item.angleId === targetAngleId);
            const baseItem =
              idx >= 0
                ? list[idx]
                : defaultAds.find((a: FelioraPiesPlGeneratedAd) => a.angleId === targetAngleId);
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
            const updatedEntry: FelioraPiesPlGeneratedAd = {
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

    if (action === 'delete_image') {
      const targetId = (body.assetId || '').trim();
      const targetUrl = (body.imageUrl || '').trim();
      const defaultAds = buildAllFelioraPiesPrewrittenAds();
      const updatedState = await mutate<
        FelioraPiesPlLibraryState,
        { customImages: FelioraPiesImageAsset[]; ads: FelioraPiesPlGeneratedAd[] }
      >(STATE_KEY, { ads: defaultAds, customImages: [] }, state => {
        const customList = Array.isArray(state.customImages) ? state.customImages : [];
        state.customImages = customList.filter(
          img => (targetId ? img.id !== targetId : true) && (targetUrl ? img.url !== targetUrl : true),
        );
        return { customImages: state.customImages, ads: state.ads || defaultAds };
      });
      return NextResponse.json({
        ok: true,
        imageLibrary: [...updatedState.customImages, ...FELIORA_PIES_IMAGE_LIBRARY],
      });
    }

    if (action === 'upload_custom_image') {
      const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl.trim() : '';
      const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
      if (!match) {
        return NextResponse.json(
          { error: 'Nieprawidłowy format obrazu (wymagany data:image/...;base64).' },
          { status: 400 },
        );
      }
      const base64Bytes = match[1];
      const cleanFileName = (body.fileName || `feliora-pies-custom-${Date.now()}.jpg`).trim();
      let uploadedHash: string | undefined;
      try {
        const { uploadCustomAntkiImageToMeta } = await import('@/lib/meta-adsets');
        const metaRes = await uploadCustomAntkiImageToMeta({
          bytes: base64Bytes,
          fileName: cleanFileName,
          accountId: FELIORA_PIES_META_ACCOUNT_ID,
        });
        uploadedHash = metaRes.hash;
      } catch {
        // Non-blocking
      }
      const now = Date.now();
      const newAsset: FelioraPiesImageAsset = {
        id: `fel-pies-custom-${now}-${Math.random().toString(36).slice(2, 6)}`,
        url: dataUrl,
        label: (body.label || `Własne: ${cleanFileName}`).trim(),
        imageHash: uploadedHash || '',
        adsetOrigin: 'Własna grafika',
        adOrigin: cleanFileName,
        aspectRatio: '1:1',
      };
      const defaultAds = buildAllFelioraPiesPrewrittenAds();
      const updatedState = await mutate<
        FelioraPiesPlLibraryState,
        { customImages: FelioraPiesImageAsset[]; ads: FelioraPiesPlGeneratedAd[] }
      >(STATE_KEY, { ads: defaultAds, customImages: [] }, state => {
        const customList = Array.isArray(state.customImages) ? [...state.customImages] : [];
        customList.unshift(newAsset);
        state.customImages = customList.slice(0, 1500);
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
        imageLibrary: [...updatedState.customImages, ...FELIORA_PIES_IMAGE_LIBRARY],
        savedAds: updatedState.ads,
      });
    }

    if (action === 'reset_defaults') {
      const defaultAds = buildAllFelioraPiesPrewrittenAds();
      await mutate<FelioraPiesPlLibraryState, FelioraPiesPlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultAds, customImages: [] },
        state => {
          state.ads = [...defaultAds];
          return state.ads;
        },
      );
      return NextResponse.json({ ok: true, savedAds: defaultAds });
    }

    if (action === 'sync_fanpages') {
      const discoveredPages: Record<string, { id: string; name: string }> = {};
      const allCandidatePages: Array<{ id: string; name: string }> = [];
      const tokenCandidates = await resolveAllMetaAuthCandidates();

      for (const { token, proof } of tokenCandidates) {
        for (const endpointPath of ['me/accounts', '1229288098677658/owned_pages', `act_${FELIORA_PIES_META_ACCOUNT_ID}/promote_pages`]) {
          try {
            const url = new URL(`https://graph.facebook.com/${META_VERSION}/${endpointPath}`);
            url.searchParams.set('fields', 'id,name,instagram_business_account{id,username}');
            url.searchParams.set('limit', '100');
            if (proof) url.searchParams.set('appsecret_proof', proof);
            const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
            const res = (await r.json()) as { data?: Array<{ id: string; name: string }> };
            for (const p of res.data || []) {
              if (!allCandidatePages.some(existing => existing.id === p.id)) {
                allCandidatePages.push(p);
              }
            }
          } catch {
            // Continue
          }
        }
      }

      for (const p of allCandidatePages) {
        const n = (p.name || '').toLowerCase();
        if (n.includes('psy bez ściemy') || n.includes('psy bez sciemy') || n.includes('psiarze')) {
          discoveredPages['fp-psy-bez-sciemy'] = { id: p.id, name: p.name };
        }
      }

      return NextResponse.json({
        ok: true,
        discoveredPages,
        pages: allCandidatePages,
        totalMetaPagesChecked: allCandidatePages.length,
      });
    }

    if (action === 'list_campaign_state') {
      const campaignId = body.campaignId || FELIORA_PIES_META_NATIVE_CAMPAIGN_ID;
      const [campaign, adsets] = await Promise.all([
        directGraph<Record<string, unknown>>(campaignId, {
          fields: 'id,name,status,effective_status,daily_budget,lifetime_budget,bid_strategy',
        }),
        directGraph<{ data?: Array<Record<string, unknown>> }>(`${campaignId}/adsets`, {
          fields:
            'id,name,status,effective_status,daily_budget,bid_amount,bid_strategy,targeting,ads.limit(50){id,name,status,effective_status,creative{object_story_spec{page_id,instagram_user_id,link_data{link,name}},image_hash}}',
          limit: 20,
        }),
      ]);
      return NextResponse.json({ ok: true, campaign, adsets: adsets.data || [] });
    }

    if (action === 'audit_meta') {
      const pageIds = [
        '1287239777799682',
        '798916893308685',
        '1194345203770949',
        '1363490303507686',
        '1338513126001175',
      ];
      const [accountInfo, pagesInfo, pixelInfo, pixelStats, campaignsInsights7d, campaignsInsightsToday, issueAds] =
        await Promise.all([
          directGraph<Record<string, unknown>>(`act_${FELIORA_PIES_META_ACCOUNT_ID}`, {
            fields:
              'id,name,account_status,disable_reason,currency,amount_spent,spend_cap,balance,funding_source_details,timezone_name',
          }).catch(e => ({ error: e instanceof Error ? e.message : 'account error' })),
          Promise.all(
            pageIds.map(pid =>
              directGraph<Record<string, unknown>>(pid, {
                fields:
                  'id,name,is_published,verification_status,fan_count,followers_count,has_transitioned_to_new_page_experience,instagram_business_account{id,username},promotion_eligible',
              }).catch(e => ({ id: pid, error: e instanceof Error ? e.message : 'page lookup failed' })),
            ),
          ),
          directGraph<Record<string, unknown>>(FELIORA_PIES_META_PIXEL_ID, {
            fields: 'id,name,last_fired_time,is_unavailable,data_use_setting',
          }).catch(e => ({ error: e instanceof Error ? e.message : 'pixel error' })),
          directGraph<Record<string, unknown>>(`${FELIORA_PIES_META_PIXEL_ID}/stats`, {
            aggregation: 'event',
          }).catch(e => ({ error: e instanceof Error ? e.message : 'pixel stats error' })),
          directGraph<Record<string, unknown>>(`act_${FELIORA_PIES_META_ACCOUNT_ID}/insights`, {
            level: 'campaign',
            date_preset: 'last_7d',
            fields: 'campaign_id,campaign_name,spend,impressions,inline_link_clicks,cpc,ctr,actions,action_values,purchase_roas',
            limit: 30,
          }).catch(e => ({ error: e instanceof Error ? e.message : 'insights 7d error' })),
          directGraph<Record<string, unknown>>(`act_${FELIORA_PIES_META_ACCOUNT_ID}/insights`, {
            level: 'campaign',
            date_preset: 'today',
            fields: 'campaign_id,campaign_name,spend,impressions,inline_link_clicks,cpc,ctr,actions,action_values,purchase_roas',
            limit: 30,
          }).catch(e => ({ error: e instanceof Error ? e.message : 'insights today error' })),
          directGraph<Record<string, unknown>>(`act_${FELIORA_PIES_META_ACCOUNT_ID}/ads`, {
            filtering: JSON.stringify([
              {
                field: 'effective_status',
                operator: 'IN',
                value: ['DISAPPROVED', 'WITH_ISSUES', 'PENDING_REVIEW'],
              },
            ]),
            fields: 'id,name,campaign_id,adset_id,status,effective_status,issues_info,ad_review_feedback',
            limit: 50,
          }).catch(e => ({ error: e instanceof Error ? e.message : 'issue ads error' })),
        ]);

      return NextResponse.json({
        ok: true,
        accountInfo,
        pagesInfo,
        pixelInfo,
        pixelStats,
        campaignsInsights7d,
        campaignsInsightsToday,
        issueAds,
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
      const { ads } = await readFelioraPiesLibraryState();
      const selectedAds = ads.filter(a => targetAngleIds.includes(a.angleId));
      if (!selectedAds.length) {
        return NextResponse.json({ error: 'Nie znaleziono wybranych reklam.' }, { status: 400 });
      }

      let campaignId = body.campaignId || FELIORA_PIES_META_NATIVE_CAMPAIGN_ID;
      if (campaignId === 'CREATE_NEW_DOG_CBO') {
        const existingCamps = await directGraph<{ data?: Array<{ id: string; name: string }> }>(
          `act_${FELIORA_PIES_META_ACCOUNT_ID}/campaigns`,
          { fields: 'id,name', limit: 50 },
        ).catch(() => ({ data: [] }));
        const foundDogNative = (existingCamps.data || []).find(c => c.name === 'FEL PSY NATIVE');
        if (foundDogNative?.id) {
          campaignId = foundDogNative.id;
        } else {
          const newCamp = await directGraph<{ id: string }>(
            `act_${FELIORA_PIES_META_ACCOUNT_ID}/campaigns`,
            {
              name: 'FEL PSY NATIVE',
              objective: 'OUTCOME_SALES',
              status: 'PAUSED',
              special_ad_categories: [],
              daily_budget: 15000,
              bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
            },
            'POST',
          );
          campaignId = newCamp.id;
        }
      }

      const templateAdSetId = body.templateAdSetId || '120250116221480298';
      const adSetName = (body.adSetName || `04.11 - FELIORA PSY ANTEK BATCH (${selectedAds.length}x)`).trim();
      const adStatus = body.adStatus || 'PAUSED';
      const explicitTargetAdSetId = String((body as Record<string, unknown>).targetAdSetId || '').trim();

      const source = await directGraph<Record<string, unknown>>(templateAdSetId, {
        fields:
          'targeting,optimization_goal,billing_event,promoted_object,attribution_spec,destination_type,dsa_beneficiary,dsa_payor',
      }).catch(() =>
        directGraph<Record<string, unknown>>('120250036346090298', {
          fields: 'targeting,optimization_goal,billing_event,promoted_object,attribution_spec,destination_type',
        }),
      );

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

      let targetAdSetId = explicitTargetAdSetId;
      if (!targetAdSetId) {
        try {
          const existingAdSets = await directGraph<{ data?: Array<{ id: string; name: string; status?: string }> }>(
            `${campaignId}/adsets`,
            { fields: 'id,name,status', limit: 50 },
          );
          const match = (existingAdSets.data || []).find(s => s.name === adSetName && s.status !== 'DELETED');
          if (match?.id) {
            targetAdSetId = match.id;
          }
        } catch {
          // Fallback to creating new Ad Set
        }
      }

      if (!targetAdSetId) {
        const dsaEntity =
          (typeof source.dsa_beneficiary === 'string' && source.dsa_beneficiary.trim()) ||
          'CABANOWSKI HSTL SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ';
        const dsaPayer =
          (typeof source.dsa_payor === 'string' && source.dsa_payor.trim()) || dsaEntity;
        const createdAdSet = await directGraph<{ id: string }>(
          `act_${FELIORA_PIES_META_ACCOUNT_ID}/adsets`,
          {
            name: adSetName,
            campaign_id: campaignId,
            status: adStatus,
            optimization_goal: source.optimization_goal || 'OFFSITE_CONVERSIONS',
            billing_event: source.billing_event || 'IMPRESSIONS',
            promoted_object: source.promoted_object || {
              pixel_id: FELIORA_PIES_META_PIXEL_ID,
              custom_event_type: 'PURCHASE',
            },
            targeting: rawTargeting,
            attribution_spec: source.attribution_spec,
            destination_type: source.destination_type || 'WEBSITE',
            dsa_beneficiary: dsaEntity,
            dsa_payor: dsaPayer,
          },
          'POST',
        );
        targetAdSetId = createdAdSet.id;
      }

      let switchedAdSetToFbOnly = false;
      const ensureFacebookOnlyPlacementsOnAdSet = async () => {
        if (switchedAdSetToFbOnly) return;
        const currentAdSet = await directGraph<{ targeting?: Record<string, unknown> }>(targetAdSetId, {
          fields: 'targeting',
        }).catch(() => ({ targeting: rawTargeting }));
        const existingPlatforms = Array.isArray(currentAdSet.targeting?.publisher_platforms)
          ? (currentAdSet.targeting?.publisher_platforms as string[])
          : [];
        if (existingPlatforms.length === 1 && existingPlatforms[0] === 'facebook') {
          switchedAdSetToFbOnly = true;
          return;
        }
        const fbTargeting: Record<string, unknown> = JSON.parse(
          JSON.stringify(currentAdSet.targeting || rawTargeting || {}),
        );
        delete fbTargeting.instagram_positions;
        delete fbTargeting.threads_positions;
        delete fbTargeting.messenger_positions;
        delete fbTargeting.audience_network_positions;
        delete fbTargeting.facebook_positions;
        fbTargeting.publisher_platforms = ['facebook'];
        fbTargeting.facebook_positions = ['feed', 'facebook_reels', 'story'];
        await directGraph(targetAdSetId, { targeting: fbTargeting }, 'POST').catch(() =>
          directGraph(
            targetAdSetId,
            {
              targeting: {
                geo_locations: fbTargeting.geo_locations || { countries: ['PL'] },
                age_min: fbTargeting.age_min || 18,
                age_max: fbTargeting.age_max || 65,
                publisher_platforms: ['facebook'],
                ...(fbTargeting.targeting_automation ? { targeting_automation: fbTargeting.targeting_automation } : {}),
              },
            },
            'POST',
          ),
        );
        switchedAdSetToFbOnly = true;
      };

      const accountAuthorizedIgIds = new Set<string>(['17841437606417391', '17841473314157729']);
      for (const igEndpoint of [
        `act_${FELIORA_PIES_META_ACCOUNT_ID}/instagram_accounts`,
        `act_${FELIORA_PIES_META_ACCOUNT_ID}/page_backed_instagram_accounts`,
      ]) {
        try {
          const accIgs = await directGraph<{ data?: Array<{ id?: string }> }>(igEndpoint, { fields: 'id', limit: 50 });
          for (const item of accIgs.data || []) {
            if (item.id) accountAuthorizedIgIds.add(item.id);
          }
        } catch {
          // Ignore
        }
      }

      const pageBackedIgCache = new Map<string, string[]>();
      const resolvePageBackedIgIds = async (pId: string): Promise<string[]> => {
        if (pageBackedIgCache.has(pId)) return pageBackedIgCache.get(pId)!;
        const found: string[] = [];
        try {
          const res = await directGraph<{ data?: Array<{ id?: string }> }>(
            `${pId}/page_backed_instagram_accounts`,
            { fields: 'id' },
          );
          for (const row of res.data || []) {
            if (row.id && !found.includes(row.id)) found.push(row.id);
          }
        } catch {
          // Ignore
        }
        if (!found.length) {
          try {
            const createdPb = await directGraph<{ id?: string }>(
              `${pId}/page_backed_instagram_accounts`,
              {},
              'POST',
            );
            if (createdPb.id) found.push(createdPb.id);
          } catch {
            // Ignore
          }
        }
        pageBackedIgCache.set(pId, found);
        return found;
      };

      const existingAdsByName = new Map<string, string>();
      try {
        const existingAdsRes = await directGraph<{ data?: Array<{ id: string; name: string; status?: string }> }>(
          `${targetAdSetId}/ads`,
          { fields: 'id,name,status', limit: 100 },
        );
        for (const ea of existingAdsRes.data || []) {
          if (ea.name && ea.id && ea.status !== 'DELETED') {
            existingAdsByName.set(ea.name, ea.id);
          }
        }
      } catch {
        // Ignore
      }

      const imageHashCache = new Map<string, string>();
      try {
        const imgsRes = await directGraph<{ data?: Array<{ hash?: string; name?: string }> }>(
          `act_${FELIORA_PIES_META_ACCOUNT_ID}/adimages`,
          { fields: 'hash,name', limit: 150 },
        );
        for (const im of imgsRes.data || []) {
          if (im.name && im.hash) {
            imageHashCache.set(`/feliora-pies-pl-images/${im.name}`, im.hash);
          }
        }
      } catch {
        // Ignore
      }

      const discoveredPages: Record<string, string> = {};
      for (const endpoint of ['me/accounts', '1229288098677658/owned_pages', `act_${FELIORA_PIES_META_ACCOUNT_ID}/promote_pages`]) {
        try {
          const accs = await directGraph<{ data?: Array<{ id: string; name: string }> }>(endpoint, {
            fields: 'id,name',
            limit: 100,
          });
          for (const p of accs.data || []) {
            const n = (p.name || '').toLowerCase();
            if (n.includes('psy bez ściemy') || n.includes('psy bez sciemy') || n.includes('psiarze')) {
              discoveredPages['fp-psy-bez-sciemy'] = p.id;
            }
          }
        } catch {
          // Ignore inaccessible endpoint
        }
      }

      const FELIORA_PIES_PAGE_ACTORS: Record<string, { instagram_user_id?: string; threads_user_id?: string }> = {
        '1338513126001175': { instagram_user_id: '17841437606417391', threads_user_id: '17841467398928017' }, // Feliora
        '1287239777799682': { instagram_user_id: '17841441008488573', threads_user_id: '17841419447824408' }, // Dr. wet. Edmund Newelski
        '798916893308685': { instagram_user_id: '17841473314157729' }, // Porady Mamy Gosi
        '1194345203770949': { instagram_user_id: '17841412233487287' }, // Iwona Kożuchowska
        '1363490303507686': {}, // Karol Mikołajczyk (FB Page only — never attach mismatched IG ID)
      };

      const createdAds: Array<{
        id: string;
        name: string;
        angleId: string;
        url: string;
        imageHash?: string;
        pageId?: string;
        skippedExisting?: boolean;
      }> = [];

      for (const ad of selectedAds) {
        const rawPageId = (body.pageId || ad.pageId || '798916893308685').trim();
        const resolvedPageId = /^\d+$/.test(rawPageId)
          ? rawPageId
          : discoveredPages[rawPageId] || '798916893308685';
        const fpMeta = FELIORA_PIES_FANPAGES.find(f => f.id === rawPageId || f.id === resolvedPageId);
        const resolvedPageName = fpMeta?.name || ad.pageName || 'Porady Mamy Gosi';
        const actors = FELIORA_PIES_PAGE_ACTORS[resolvedPageId] || {};
        const targetLink = ad.destinationUrl || FELIORA_PIES_DEFAULT_URL || FELIORA_PIES_PDP_URL;
        const adName = `${ad.code} | PDP PIES | ${resolvedPageName}`;

        const existingAdId =
          existingAdsByName.get(adName) ||
          Array.from(existingAdsByName.entries()).find(([n]) => n.startsWith(`${ad.code} |`))?.[1];
        if (existingAdId) {
          createdAds.push({
            id: existingAdId,
            name: adName,
            angleId: ad.angleId,
            url: targetLink,
            pageId: resolvedPageId,
            skippedExisting: true,
          });
          continue;
        }

        const cleanImgKey = (ad.imageUrl || '').split('?')[0];
        let primaryHash = cleanImgKey ? imageHashCache.get(cleanImgKey) : undefined;
        if (!primaryHash) {
          primaryHash = await ensureMetaImageHash(ad.imageUrl, ad.imageHash);
          if (cleanImgKey && primaryHash) imageHashCache.set(cleanImgKey, primaryHash);
        }

        type ActorAttempt = {
          pId: string;
          igId?: string;
          thId?: string;
          requireFbOnly: boolean;
        };
        const rawAttempts: ActorAttempt[] = [];
        if (!switchedAdSetToFbOnly && actors.instagram_user_id && actors.threads_user_id) {
          rawAttempts.push({
            pId: resolvedPageId,
            igId: actors.instagram_user_id,
            thId: actors.threads_user_id,
            requireFbOnly: false,
          });
        }
        if (actors.instagram_user_id) {
          rawAttempts.push({ pId: resolvedPageId, igId: actors.instagram_user_id, requireFbOnly: false });
        }
        rawAttempts.push({ pId: resolvedPageId, requireFbOnly: false });
        rawAttempts.push({ pId: resolvedPageId, requireFbOnly: true });
        const pbIds = await resolvePageBackedIgIds(resolvedPageId);
        for (const pbId of pbIds) {
          rawAttempts.push({ pId: resolvedPageId, igId: pbId, requireFbOnly: true });
        }
        for (const validatorIg of accountAuthorizedIgIds) {
          rawAttempts.push({ pId: resolvedPageId, igId: validatorIg, requireFbOnly: true });
        }

        const seenAttemptKeys = new Set<string>();
        const attempts = rawAttempts.filter(c => {
          const k = `${c.pId}|${c.igId || ''}|${c.thId || ''}|${c.requireFbOnly ? 'fb' : 'all'}`;
          if (seenAttemptKeys.has(k)) return false;
          seenAttemptKeys.add(k);
          return true;
        });

        let createdAd: { id: string } | undefined;
        let lastErr: Error | undefined;
        const attemptDiag: string[] = [];

        for (const cand of attempts) {
          if (cand.requireFbOnly) {
            await ensureFacebookOnlyPlacementsOnAdSet();
          }
          const creativeSpec = {
            name: `${adName} - Creative`,
            url_tags:
              'utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}',
            object_story_spec: {
              page_id: cand.pId,
              ...(cand.igId ? { instagram_user_id: cand.igId } : {}),
              ...(!switchedAdSetToFbOnly && cand.thId ? { threads_user_id: cand.thId } : {}),
              link_data: {
                image_hash: primaryHash,
                link: targetLink,
                message: ad.primaryText,
                name: ad.headline,
                description: ad.description,
                call_to_action: {
                  type: 'LEARN_MORE',
                  value: { link: targetLink },
                },
              },
            },
          };

          try {
            createdAd = await directGraph<{ id: string }>(
              `act_${FELIORA_PIES_META_ACCOUNT_ID}/ads`,
              {
                name: adName,
                adset_id: targetAdSetId,
                creative: creativeSpec,
                status: adStatus,
              },
              'POST',
            );
            break;
          } catch (err) {
            lastErr = err instanceof Error ? err : new Error(String(err));
            attemptDiag.push(
              `${cand.pId}/${cand.igId || 'no-ig'}/${cand.requireFbOnly ? 'fb' : 'all'}: ${lastErr.message.slice(0, 90)}`,
            );
          }
        }

        if (!createdAd) {
          throw new Error(
            `Nie udało się utworzyć reklamy ${ad.code} (${resolvedPageName}): ${lastErr?.message || 'Unknown'} | attempts=${attemptDiag.slice(0, 8).join(' ; ')}`,
          );
        }

        createdAds.push({
          id: createdAd.id,
          name: adName,
          angleId: ad.angleId,
          url: targetLink,
          imageHash: primaryHash,
          pageId: resolvedPageId,
        });
      }

      return NextResponse.json({
        ok: true,
        campaignId,
        adSetId: targetAdSetId,
        adSetName,
        switchedAdSetToFbOnly,
        createdAdsCount: createdAds.length,
        createdAds,
      });
    }

    return NextResponse.json({ error: 'Nieznana akcja API Feliora PL (Psy).' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd w API Feliora PL (Psy).' },
      { status: 500 },
    );
  }
});
