import path from 'path';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { accountRoute } from '@/lib/account-route';
import { inOwnerWorkspace } from '@/lib/account-context';
import { metaToken, metaProof, META_VERSION } from '@/lib/meta-client';
import { mutate, readState } from '@/lib/store';
import {
  SARDIAN_DEFAULT_URL,
  SARDIAN_FANPAGES,
  SARDIAN_IMAGE_LIBRARY,
  SARDIAN_META_ACCOUNT_ID,
  SARDIAN_META_NATIVE_CAMPAIGN_ID,
  SARDIAN_META_PIXEL_ID,
  SARDIAN_PDP_URL,
  SARDIAN_PRESET_ANGLES,
  SARDIAN_STAGES,
  buildAllSardianPrewrittenAds,
  sanitizeAndAuditSardianPl,
  type SardianImageAsset,
  type SardianPlGeneratedAd,
} from '@/lib/sardian-pl';

export const maxDuration = 300;

const STATE_KEY = 'sardian-pl-v11-raw-testpack';

interface SardianPlLibraryState {
  ads: SardianPlGeneratedAd[];
  customImages?: SardianImageAsset[];
}

function resolveRealSardianPageId(rawId?: string): string {
  const id = (rawId || '').trim();
  if (id === 'fp-pokonac-lysienie') return '1470476022807427';
  if (id === 'fp-barbershop-perfekcja') return '1352085037995209';
  return id;
}

async function resolveAllMetaAuthCandidates(): Promise<Array<{ token: string; proof?: string }>> {
  const candidates: Array<{ token: string; proof?: string }> = [];
  const seen = new Set<string>();
  const addCandidate = (token?: string, proof?: string) => {
    const t = (token || '').trim();
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
  const candidates = cachedWorkingAuth ? [cachedWorkingAuth] : await resolveAllMetaAuthCandidates();
  let lastError: Error | undefined;

  for (const { token, proof } of candidates) {
    const proofVariants = proof ? [proof] : [undefined];
    for (const activeProof of proofVariants) {
      try {
        const url = new URL(`https://graph.facebook.com/${META_VERSION}/${graphPath}`);
        const body = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
          if (v !== undefined) body.set(k, typeof v === 'string' ? v : JSON.stringify(v));
        }
        if (activeProof) body.set('appsecret_proof', activeProof);
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
          const code = Number(e?.code || r.status);
          const subcode = Number(e?.error_subcode || 0);
          lastError = new Error(
            `Meta (${code}/${subcode}): ${e?.error_user_msg || e?.message || 'Request failed'}`,
          );
          // Only try another token candidate if this token itself is invalid/unauthorized (190 or 100/33)
          if (code !== 190 && !(code === 100 && subcode === 33)) {
            cachedWorkingAuth = { token, proof: activeProof };
            throw lastError;
          }
          continue;
        }
        cachedWorkingAuth = { token, proof: activeProof };
        return data as T;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        lastError = e;
        if (!e.message.includes('Meta (190/') && !e.message.includes('Meta (100/33)')) {
          throw e;
        }
      }
    }
  }
  throw lastError || new Error('Meta request failed');
}

async function uploadBytesToSardianMeta(bytesBase64: string, fileName: string): Promise<string | undefined> {
  const cleanName = (fileName || `sardian-${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
  const upRes = await directGraph<{ images?: Record<string, { hash?: string; url?: string }> }>(
    `act_${SARDIAN_META_ACCOUNT_ID}/adimages`,
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
    const hash = await uploadBytesToSardianMeta(m[1], `sardian-${Date.now()}.jpg`);
    if (hash) return hash;
  } else if (cleanUrl.startsWith('/')) {
    const relPath = cleanUrl.split('?')[0].replace(/^\/+/, '');
    const absPath = path.join(process.cwd(), 'public', relPath);
    const buf = await fs.readFile(absPath);
    const uploadName = cleanUrl.includes('?v=raw2')
      ? `raw2-${path.basename(absPath)}`
      : path.basename(absPath);
    const hash = await uploadBytesToSardianMeta(buf.toString('base64'), uploadName);
    if (hash) return hash;
  } else if (cleanUrl.startsWith('http')) {
    const { safeDownload } = await import('@/lib/safe-fetch');
    const { buffer } = await safeDownload(cleanUrl, 15 * 1024 * 1024);
    const hash = await uploadBytesToSardianMeta(Buffer.from(buffer).toString('base64'), `sardian-ext-${Date.now()}.jpg`);
    if (hash) return hash;
  }

  throw new Error(`Nie udało się wgrać grafiki (${cleanUrl}) na konto Meta SARDIAN.`);
}

async function readSardianLibraryState(): Promise<{
  ads: SardianPlGeneratedAd[];
  customImages: SardianImageAsset[];
}> {
  const defaultAds = buildAllSardianPrewrittenAds();
  try {
    const { value } = await readState<SardianPlLibraryState>(STATE_KEY, {
      ads: defaultAds,
      customImages: [],
    });
    const stored = Array.isArray(value?.ads) ? value.ads : [];
    const customImages = Array.isArray(value?.customImages) ? value.customImages : [];
    if (stored.length === 0 && customImages.length === 0) {
      return { ads: defaultAds, customImages };
    }
    const byAngle = new Map<string, SardianPlGeneratedAd>();
    for (const ad of defaultAds) {
      byAngle.set(ad.angleId, ad);
    }
    for (const ad of stored) {
      const baseAd = byAngle.get(ad.angleId);
      if (!baseAd) continue;
      const audited = sanitizeAndAuditSardianPl(
        ad.primaryText || baseAd.primaryText,
        ad.headline || baseAd.headline,
        ad.description || baseAd.description,
      );
      const isLegacyStaticTs = !ad.createdAt || ad.createdAt === 1793000000000;
      const isLegacyUpdatedTs = !ad.updatedAt || ad.updatedAt === 1793000000000;
      const resolvedPageId = resolveRealSardianPageId(ad.pageId || baseAd.pageId);
      byAngle.set(ad.angleId, {
        ...baseAd,
        ...ad,
        pageId: resolvedPageId,
        createdAt: isLegacyStaticTs ? baseAd.createdAt : ad.createdAt,
        updatedAt: isLegacyUpdatedTs ? baseAd.updatedAt : ad.updatedAt,
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
      });
    }
    return { ads: Array.from(byAngle.values()), customImages };
  } catch {
    return { ads: defaultAds, customImages: [] };
  }
}

export const GET = accountRoute(async () => {
  try {
    const { ads, customImages } = await readSardianLibraryState();
    return NextResponse.json({
      presets: SARDIAN_PRESET_ANGLES,
      awarenessStages: SARDIAN_STAGES,
      fanpages: SARDIAN_FANPAGES,
      savedAds: ads,
      imageLibrary: [...customImages, ...SARDIAN_IMAGE_LIBRARY],
      metaConfig: {
        accountId: SARDIAN_META_ACCOUNT_ID,
        nativeCampaignId: SARDIAN_META_NATIVE_CAMPAIGN_ID,
        pixelId: SARDIAN_META_PIXEL_ID,
        pdpUrl: SARDIAN_PDP_URL,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd ładowania biblioteki SARDIAN PL.' },
      { status: 500 },
    );
  }
});

export const POST = accountRoute(async (req: Request) => {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      ad?: SardianPlGeneratedAd;
      angleId?: string;
      angleIds?: string[];
      imageUrl?: string;
      imageHash?: string;
      assetId?: string;
      dataUrl?: string;
      fileName?: string;
      label?: string;
      adSetName?: string;
      campaignId?: string;
      templateAdSetId?: string;
      pageId?: string;
      adStatus?: 'PAUSED' | 'ACTIVE';
      taskId?: string;
      prompt?: string;
      customPrompt?: string;
      primaryText?: string;
      headline?: string;
      title?: string;
      isManual?: boolean;
      count?: number;
      includeProductRef?: boolean;
      autoAssign?: boolean;
      aspectRatio?: '1:1' | '4:5' | '3:4';
      mode?: 'script_batch' | 'custom_prompt' | 'multi_angle_batch';
    };

    const action = body.action || 'save';

    if (action === 'generate_kie_images') {
      if (!body.isManual) {
        return NextResponse.json(
          { error: 'Generowanie zdjęć AI wymaga ręcznego uruchomienia.' },
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

      let productRefKieUrl: string | undefined;
      try {
        productRefKieUrl = await uploadPublicReferenceToKie('/sardian-pl-images/sardian-bottle-ref.png');
      } catch {
        productRefKieUrl = undefined;
      }

      const aspectRatio = body.aspectRatio || '1:1';
      const mode = body.mode || 'script_batch';

      if (mode === 'multi_angle_batch') {
        const targetAngleIds = Array.isArray(body.angleIds) && body.angleIds.length > 0 ? body.angleIds.slice(0, 16) : [];
        if (!targetAngleIds.length) {
          return NextResponse.json({ error: 'Zaznacz kreacje, dla których chcesz wygenerować nowy batch zdjęć.' }, { status: 400 });
        }
        const { ads } = await readSardianLibraryState();
        const taskResults = await Promise.all(
          targetAngleIds.map(async (targetAngleId, idx) => {
            const preset = SARDIAN_PRESET_ANGLES.find(a => a.id === targetAngleId);
            const ad = ads.find(a => a.angleId === targetAngleId);
            const scenes = await planNativeIphoneScenesFromScript({
              brand: 'sardian-shampoo',
              angleId: targetAngleId,
              primaryText: ad?.primaryText || '',
              headline: ad?.headline || preset?.title || '',
              title: preset?.shortTitle || preset?.code || targetAngleId,
              count: 12,
            });
            const chosenScene = scenes[idx % Math.min(4, scenes.length)] || scenes[0];
            const includeRef = Boolean(body.includeProductRef);
            const fullPrompt = formatRawIphoneKiePrompt(
              chosenScene.scenePrompt,
              'sardian-shampoo',
              includeRef,
            );
            const payload = buildKieCreateTaskPayload({
              model: 'nano-banana-pro',
              prompt: fullPrompt,
              imageUrls: includeRef && productRefKieUrl ? [productRefKieUrl] : [],
              aspectRatio,
              resolution: '2K',
            });
            try {
              const taskId = await submitKieRipperTask(payload);
              return {
                index: idx + 1,
                angleId: targetAngleId,
                label: `${preset?.code || targetAngleId} · ${chosenScene.label.replace(/^\d+\.\s*/, '')}`,
                prompt: fullPrompt,
                includeProductRef: includeRef,
                autoAssign: true,
                taskId,
              };
            } catch (err) {
              return {
                index: idx + 1,
                angleId: targetAngleId,
                label: `${preset?.code || targetAngleId}`,
                prompt: fullPrompt,
                includeProductRef: includeRef,
                autoAssign: true,
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
        return NextResponse.json({ ok: true, mode, tasks });
      }

      if (mode === 'custom_prompt') {
        const rawCustom = (body.customPrompt || '').trim();
        if (!rawCustom) {
          return NextResponse.json({ error: 'Wpisz opis własnego zdjęcia do wygenerowania.' }, { status: 400 });
        }
        const count = Math.min(12, Math.max(1, Number(body.count) || 4));
        const includeRef = Boolean(body.includeProductRef);
        const angleId = (body.angleId || '').trim();
        const preset = SARDIAN_PRESET_ANGLES.find(a => a.id === angleId);

        const cameraAngles = [
          'First-person POV eye-level shot in natural daylight.',
          'Close-up 45-degree angle with crisp focus on the subject.',
          'Candid handheld iPhone 15 shot from doorway/table angle.',
          'Overhead flat-lay / table POV shot in warm indoor lighting.',
          'Side-angle close-up with authentic lived-in Polish home background.',
          'Sharp macro-detail iPhone 15 shot showing natural texture.',
          'Morning window-light shot in a clean Polish interior.',
          'Evening warm-light indoor shot.',
        ];

        const taskResults = await Promise.all(
          Array.from({ length: count }, async (_, idx) => {
            const variationHint = count > 1 ? ` (${cameraAngles[idx % cameraAngles.length]})` : '';
            const fullPrompt = formatRawIphoneKiePrompt(
              `${rawCustom}${variationHint}`,
              'sardian-shampoo',
              includeRef,
            );
            const payload = buildKieCreateTaskPayload({
              model: 'nano-banana-pro',
              prompt: fullPrompt,
              imageUrls: includeRef && productRefKieUrl ? [productRefKieUrl] : [],
              aspectRatio,
              resolution: '2K',
            });
            const label = `${preset?.code || 'CUSTOM'} · Własne AI #${idx + 1}: ${rawCustom.slice(0, 48)}`;
            try {
              const taskId = await submitKieRipperTask(payload);
              return {
                index: idx + 1,
                angleId,
                label,
                prompt: fullPrompt,
                includeProductRef: includeRef,
                autoAssign: idx === 0 && Boolean(body.autoAssign),
                taskId,
              };
            } catch (err) {
              return {
                index: idx + 1,
                angleId,
                label,
                prompt: fullPrompt,
                includeProductRef: includeRef,
                autoAssign: false,
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
        return NextResponse.json({ ok: true, mode, angleId, tasks });
      }

      // Default: mode === 'script_batch'
      const angleId = (body.angleId || '').trim();
      const preset = SARDIAN_PRESET_ANGLES.find(a => a.id === angleId);
      const primaryText = (body.primaryText || '').trim();
      const headline = (body.headline || preset?.title || '').trim();
      const title = (body.title || preset?.shortTitle || preset?.code || 'SARDIAN PL').trim();
      const requestedCount = Math.min(12, Math.max(1, Number(body.count) || 8));

      const allScenes = await planNativeIphoneScenesFromScript({
        brand: 'sardian-shampoo',
        angleId,
        primaryText,
        headline,
        title,
        count: 12,
      });

      const scenes = allScenes.slice(0, requestedCount);

      const taskResults = await Promise.all(
        scenes.map(async (scene, idx) => {
          const includeRef = Boolean(body.includeProductRef);
          const fullPrompt = formatRawIphoneKiePrompt(
            scene.scenePrompt,
            'sardian-shampoo',
            includeRef,
          );
          const payload = buildKieCreateTaskPayload({
            model: 'nano-banana-pro',
            prompt: fullPrompt,
            imageUrls: includeRef && productRefKieUrl ? [productRefKieUrl] : [],
            aspectRatio,
            resolution: '2K',
          });
          try {
            const taskId = await submitKieRipperTask(payload);
            return {
              index: idx + 1,
              angleId,
              label: scene.label,
              prompt: fullPrompt,
              includeProductRef: includeRef,
              autoAssign: idx === 0 && Boolean(body.autoAssign),
              taskId,
            };
          } catch (err) {
            return {
              index: idx + 1,
              angleId,
              label: scene.label,
              prompt: fullPrompt,
              includeProductRef: includeRef,
              autoAssign: false,
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
        mode,
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
      const preset = SARDIAN_PRESET_ANGLES.find(a => a.id === angleId);
      const label = (body.label || `SARDIAN AI · ${preset?.code || 'Custom'}`).trim();
      const assetId = `kie-sardian-iphone-${taskId}`;

      let uploadedHash = '';
      try {
        const { buffer } = await safeDownload(status.resultUrl, 15 * 1024 * 1024);
        const base64Bytes = Buffer.from(buffer).toString('base64');
        const { uploadCustomAntkiImageToMeta } = await import('@/lib/meta-adsets');
        const metaRes = await uploadCustomAntkiImageToMeta({
          bytes: base64Bytes,
          fileName: `${assetId}.jpg`,
          accountId: SARDIAN_META_ACCOUNT_ID,
        });
        uploadedHash = metaRes.hash || '';
      } catch {
        // Non-blocking
      }

      const newAsset: SardianImageAsset = {
        id: assetId,
        url: status.resultUrl,
        imageHash: uploadedHash,
        label: preset && !label.startsWith(preset.code) ? `${preset.code} · ${label}` : label,
        adsetOrigin: 'Google AI Raw iPhone (SARDIAN)',
        adOrigin: preset?.code || 'SARDIAN-AI',
        aspectRatio: body.aspectRatio || '1:1',
        source: 'ai',
        angleId: angleId || undefined,
      };

      const shouldAssign = Boolean(body.autoAssign) || /^1\./.test(label);
      const now = Date.now();
      const defaultAds = buildAllSardianPrewrittenAds();
      const updatedState = await mutate<
        SardianPlLibraryState,
        { customImages: SardianImageAsset[]; ads: SardianPlGeneratedAd[] }
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
        if (angleId && shouldAssign) {
          const adIdx = adsList.findIndex(item => item.angleId === angleId);
          const baseAd = adIdx >= 0 ? adsList[adIdx] : defaultAds.find(a => a.angleId === angleId);
          if (baseAd) {
            const updatedAd: SardianPlGeneratedAd = {
              ...baseAd,
              imageUrl: newAsset.url,
              imageHash: newAsset.imageHash || baseAd.imageHash,
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
        imageLibrary: [...updatedState.customImages, ...SARDIAN_IMAGE_LIBRARY],
        savedAds: updatedState.ads,
      });
    }

    if (action === 'delete_image') {
      const targetId = (body.assetId || '').trim();
      const targetUrl = (body.imageUrl || '').trim();
      const defaultAds = buildAllSardianPrewrittenAds();
      const updatedState = await mutate<
        SardianPlLibraryState,
        { customImages: SardianImageAsset[]; ads: SardianPlGeneratedAd[] }
      >(STATE_KEY, { ads: defaultAds, customImages: [] }, state => {
        const customList = Array.isArray(state.customImages) ? state.customImages : [];
        state.customImages = customList.filter(
          img => (targetId ? img.id !== targetId : true) && (targetUrl ? img.url !== targetUrl : true),
        );
        return { customImages: state.customImages, ads: state.ads || defaultAds };
      });
      return NextResponse.json({
        ok: true,
        imageLibrary: [...updatedState.customImages, ...SARDIAN_IMAGE_LIBRARY],
      });
    }

    if (action === 'save' && body.ad) {
      const defaultAds = buildAllSardianPrewrittenAds();
      const audited = sanitizeAndAuditSardianPl(body.ad.primaryText, body.ad.headline, body.ad.description);
      const updatedAd: SardianPlGeneratedAd = {
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
      const savedAds = await mutate<SardianPlLibraryState, SardianPlGeneratedAd[]>(
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
      const defaultAds = buildAllSardianPrewrittenAds();
      const now = Date.now();
      const savedAds = await mutate<SardianPlLibraryState, SardianPlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultAds, customImages: [] },
        state => {
          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
          for (const targetAngleId of targetAngleIds) {
            const idx = list.findIndex(item => item.angleId === targetAngleId);
            const baseItem = idx >= 0 ? list[idx] : defaultAds.find(a => a.angleId === targetAngleId);
            if (!baseItem) continue;
            const updatedEntry: SardianPlGeneratedAd = {
              ...baseItem,
              ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
              ...(body.imageUrl ? { imageHash: body.imageHash || '' } : {}),
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
        return NextResponse.json(
          { error: 'Nieprawidłowy format obrazu (wymagany data:image/...;base64).' },
          { status: 400 },
        );
      }
      const base64Bytes = match[1];
      const cleanFileName = (body.fileName || `sardian-custom-${Date.now()}.jpg`).trim();
      let uploadedHash: string | undefined;
      try {
        const { uploadCustomAntkiImageToMeta } = await import('@/lib/meta-adsets');
        const metaRes = await uploadCustomAntkiImageToMeta({
          bytes: base64Bytes,
          fileName: cleanFileName,
          accountId: SARDIAN_META_ACCOUNT_ID,
        });
        uploadedHash = metaRes.hash;
      } catch {
        // Non-blocking
      }
      const now = Date.now();
      const newAsset: SardianImageAsset = {
        id: `sardian-custom-${now}-${Math.random().toString(36).slice(2, 6)}`,
        url: dataUrl,
        label: (body.label || `Własne: ${cleanFileName}`).trim(),
        imageHash: uploadedHash || '',
        adsetOrigin: 'Własna grafika',
        adOrigin: cleanFileName,
        aspectRatio: '1:1',
      };
      const defaultAds = buildAllSardianPrewrittenAds();
      const updatedState = await mutate<
        SardianPlLibraryState,
        { customImages: SardianImageAsset[]; ads: SardianPlGeneratedAd[] }
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
        imageLibrary: [...updatedState.customImages, ...SARDIAN_IMAGE_LIBRARY],
        savedAds: updatedState.ads,
      });
    }

    if (action === 'reset_defaults') {
      const defaultAds = buildAllSardianPrewrittenAds();
      await mutate<SardianPlLibraryState, SardianPlGeneratedAd[]>(
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
      const discoveredPages: Record<string, { id: string; name: string; pictureUploaded?: boolean }> = {};
      const allCandidatePages: Array<{ id: string; name: string; access_token?: string }> = [];

      for (const endpoint of [
        { path: 'me/accounts', fields: 'id,name,access_token' },
        { path: '1229288098677658/owned_pages', fields: 'id,name,access_token' },
        { path: `act_${SARDIAN_META_ACCOUNT_ID}/promote_pages`, fields: 'id,name' },
      ]) {
        try {
          const res = await directGraph<{ data?: Array<{ id: string; name: string; access_token?: string }> }>(
            endpoint.path,
            { fields: endpoint.fields, limit: 100 },
          );
          for (const p of res.data || []) {
            if (!allCandidatePages.some(existing => existing.id === p.id)) {
              allCandidatePages.push(p);
            } else if (p.access_token) {
              const idx = allCandidatePages.findIndex(existing => existing.id === p.id);
              if (idx >= 0) allCandidatePages[idx].access_token = p.access_token;
            }
          }
        } catch {
          // Continue checking other endpoints
        }
      }

      const origin = process.env.APP_ORIGIN || 'https://szekspir-two.vercel.app';
      for (const p of allCandidatePages) {
        const n = (p.name || '').toLowerCase();
        if (n.includes('pokonać łysienie') || n.includes('pokonac lysienie') || n.includes('historie i testy')) {
          let pictureUploaded = false;
          if (p.access_token) {
            try {
              const picUrl = `${origin.replace(/\/$/, '')}/sardian-pl-images/AVATAR_POKONAC_LYSIENIE.jpg`;
              const r = await fetch(`https://graph.facebook.com/${META_VERSION}/${p.id}/picture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ url: picUrl, access_token: p.access_token }),
              });
              pictureUploaded = r.ok;
            } catch {
              // Ignore picture upload failure
            }
          }
          discoveredPages['fp-pokonac-lysienie'] = { id: p.id, name: p.name, pictureUploaded };
        }
        if (n.includes('barbershop perfekcja') || n.includes('perfekcja')) {
          let pictureUploaded = false;
          if (p.access_token) {
            try {
              const picUrl = `${origin.replace(/\/$/, '')}/sardian-pl-images/AVATAR_BARBERSHOP_PERFEKCJA.jpg`;
              const r = await fetch(`https://graph.facebook.com/${META_VERSION}/${p.id}/picture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ url: picUrl, access_token: p.access_token }),
              });
              pictureUploaded = r.ok;
            } catch {
              // Ignore picture upload failure
            }
          }
          discoveredPages['fp-barbershop-perfekcja'] = { id: p.id, name: p.name, pictureUploaded };
        }
      }

      return NextResponse.json({
        ok: true,
        discoveredPages,
        totalMetaPagesChecked: allCandidatePages.length,
      });
    }

    if (action === 'delete_adsets') {
      const ids = Array.isArray((body as { adSetIds?: string[] }).adSetIds)
        ? (body as { adSetIds?: string[] }).adSetIds!
        : [];
      const deleted: string[] = [];
      for (const id of ids) {
        await directGraph(id, { status: 'DELETED' }, 'POST');
        deleted.push(id);
      }
      return NextResponse.json({ ok: true, deleted });
    }

    if (action === 'list_campaign_state') {
      const campaignId = body.campaignId || SARDIAN_META_NATIVE_CAMPAIGN_ID;
      const [campaign, adsets] = await Promise.all([
        directGraph<Record<string, unknown>>(campaignId, {
          fields: 'id,name,status,daily_budget,lifetime_budget',
        }),
        directGraph<{ data?: Array<Record<string, unknown>> }>(`${campaignId}/adsets`, {
          fields:
            'id,name,status,daily_budget,bid_amount,bid_strategy,ads.limit(60){id,name,status,creative{object_story_spec{page_id,instagram_user_id},image_hash}}',
          limit: 50,
        }),
      ]);
      return NextResponse.json({ ok: true, campaign, adsets: adsets.data || [] });
    }

    if (action === 'push_to_meta') {
      const targetAngleIds =
        Array.isArray(body.angleIds) && body.angleIds.length > 0
          ? body.angleIds
          : body.angleId
          ? [body.angleId]
          : [];
      if (!targetAngleIds.length) {
        return NextResponse.json({ error: 'Wybierz przynajmniej 1 kreację do wysyłki do Meta Ads.' }, { status: 400 });
      }
      const { ads } = await readSardianLibraryState();
      const selectedAds = ads.filter(a => targetAngleIds.includes(a.angleId));
      if (!selectedAds.length) {
        return NextResponse.json({ error: 'Nie znaleziono wybranych reklam.' }, { status: 400 });
      }

      const campaignId = body.campaignId || SARDIAN_META_NATIVE_CAMPAIGN_ID;
      const templateAdSetId = body.templateAdSetId || '120250060540450298'; // old winer in CBO 5 nativ
      const adSetName = (body.adSetName || `01.11 - SARDIAN ANTEK BATCH (${selectedAds.length}x)`).trim();
      const adStatus = body.adStatus || 'PAUSED';

      const campaign = await directGraph<{
        id: string;
        name?: string;
        status?: string;
        daily_budget?: string;
        lifetime_budget?: string;
      }>(campaignId, { fields: 'id,name,status,daily_budget,lifetime_budget' });

      const effectiveAdSetStatus =
        (body as { adSetStatus?: string }).adSetStatus ||
        (campaign.status === 'ACTIVE' ? 'PAUSED' : adStatus);

      let targetAdSetId = ((body as { targetAdSetId?: string }).targetAdSetId || '').trim();
      if (!targetAdSetId) {
        const existingAdSets = await directGraph<{ data?: Array<{ id: string; name: string; status?: string }> }>(
          `${campaignId}/adsets`,
          { fields: 'id,name,status', limit: 50 },
        );
        const match = (existingAdSets.data || []).find(s => s.name === adSetName && s.status !== 'DELETED');
        if (match?.id) {
          targetAdSetId = match.id;
        }
      }

      if (!targetAdSetId) {
        const source = await directGraph<Record<string, unknown>>(templateAdSetId, {
          fields:
            'targeting,optimization_goal,billing_event,promoted_object,attribution_spec,destination_type,dsa_beneficiary,dsa_payor,daily_budget,bid_amount,bid_strategy',
        }).catch(() =>
          directGraph<Record<string, unknown>>('120250060540410298', {
            fields: 'targeting,optimization_goal,billing_event,promoted_object,attribution_spec,destination_type,daily_budget,bid_amount,bid_strategy',
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

        const dsaEntity =
          (typeof source.dsa_beneficiary === 'string' && source.dsa_beneficiary.trim()) ||
          '14530 ARROW HIGHWAY, LLC';
        const dsaPayer =
          (typeof source.dsa_payor === 'string' && source.dsa_payor.trim()) || dsaEntity;
        const isCbo = Boolean(campaign.daily_budget || campaign.lifetime_budget);
        const adSetPayload: Record<string, unknown> = {
          name: adSetName,
          campaign_id: campaignId,
          status: effectiveAdSetStatus,
          optimization_goal: source.optimization_goal || 'OFFSITE_CONVERSIONS',
          billing_event: source.billing_event || 'IMPRESSIONS',
          promoted_object: source.promoted_object || {
            pixel_id: SARDIAN_META_PIXEL_ID,
            custom_event_type: 'PURCHASE',
          },
          targeting: rawTargeting,
          attribution_spec: source.attribution_spec,
          destination_type: source.destination_type || 'WEBSITE',
          dsa_beneficiary: dsaEntity,
          dsa_payor: dsaPayer,
        };
        if (!isCbo && source.daily_budget) {
          adSetPayload.daily_budget = source.daily_budget;
          if (source.bid_strategy) adSetPayload.bid_strategy = source.bid_strategy;
          if (source.bid_amount) adSetPayload.bid_amount = source.bid_amount;
        }
        const createdAdSet = await directGraph<{ id: string }>(
          `act_${SARDIAN_META_ACCOUNT_ID}/adsets`,
          adSetPayload,
          'POST',
        );
        targetAdSetId = createdAdSet.id;
      }

      const existingAdsByName = new Map<string, string>();
      try {
        const existingAdsRes = await directGraph<{ data?: Array<{ id: string; name: string; status?: string }> }>(
          `${targetAdSetId}/ads`,
          { fields: 'id,name,status', limit: 100 },
        );
        for (const ea of existingAdsRes.data || []) {
          if (ea.name && ea.id && ea.status !== 'DELETED') existingAdsByName.set(ea.name, ea.id);
        }
      } catch {
        // Ignore
      }

      const imageHashCache = new Map<string, string>();
      try {
        const imgsRes = await directGraph<{ data?: Array<{ hash?: string; name?: string }> }>(
          `act_${SARDIAN_META_ACCOUNT_ID}/adimages`,
          { fields: 'hash,name', limit: 150 },
        );
        for (const im of imgsRes.data || []) {
          if (im.name && im.hash) {
            if (im.name.startsWith('raw2-')) {
              imageHashCache.set(`/sardian-pl-images/${im.name.slice(5)}?v=raw2`, im.hash);
            } else {
              imageHashCache.set(`/sardian-pl-images/${im.name}`, im.hash);
            }
          }
        }
      } catch {
        // Ignore
      }

      const createdAds: Array<{
        id: string;
        name: string;
        angleId: string;
        url: string;
        imageHash?: string;
        pageId?: string;
      }> = [];
      for (const ad of selectedAds) {
        const rawPageId = resolveRealSardianPageId(body.pageId || ad.pageId || '1363490303507686');
        const pageId = /^\d+$/.test(rawPageId) ? rawPageId : '1363490303507686';
        const fpMeta = SARDIAN_FANPAGES.find(f => f.id === rawPageId || f.id === pageId);
        const pageName = fpMeta?.name || ad.pageName || 'Karol Mikołajczyk';
        const targetLink = ad.destinationUrl || SARDIAN_DEFAULT_URL || SARDIAN_PDP_URL;
        const adName = `${ad.code} | PDP SARDIAN | ${pageName}`;

        const existingAdId =
          existingAdsByName.get(adName) ||
          Array.from(existingAdsByName.entries()).find(([n]) => n.startsWith(`${ad.code} |`))?.[1];
        if (existingAdId) {
          createdAds.push({
            id: existingAdId,
            name: adName,
            angleId: ad.angleId,
            url: targetLink,
            pageId,
          });
          continue;
        }

        let primaryHash = imageHashCache.get(ad.imageUrl);
        if (!primaryHash) {
          primaryHash = await ensureMetaImageHash(ad.imageUrl, ad.imageHash);
          if (ad.imageUrl && primaryHash) imageHashCache.set(ad.imageUrl, primaryHash);
        }

        const buildCreativeSpec = (pId: string, igUserId?: string) => ({
          name: `${adName} - Creative`,
          url_tags:
            'utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}',
          object_story_spec: {
            page_id: pId,
            ...(igUserId ? { instagram_user_id: igUserId } : {}),
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
        });

        // 1:1 Persona Actor Mapping (Global Rule #2 — omit instagram_user_id for Karol Mikołajczyk 1363490303507686)
        const actorCandidates: Array<{ pId: string; igId?: string }> =
          pageId === '1470476022807427' || pageId === '1352085037995209' || pageId === '1363490303507686'
            ? [
                { pId: pageId, igId: undefined },
                ...(pageId !== '1470476022807427' ? [{ pId: '1470476022807427', igId: undefined }] : []),
              ]
            : pageId === '798916893308685'
            ? [
                { pId: pageId, igId: '17841473314157729' },
                { pId: pageId, igId: undefined },
              ]
            : [
                // 1339041252618036 (Dr n. med. Janusz Skrzypiński)
                { pId: pageId, igId: '17841437463666297' },
                { pId: pageId, igId: undefined },
                { pId: '1470476022807427', igId: undefined },
              ];

        let createdAd: { id: string } | undefined;
        let usedPageId = pageId;
        let lastAdErr: Error | undefined;
        for (const cand of actorCandidates) {
          try {
            createdAd = await directGraph<{ id: string }>(
              `act_${SARDIAN_META_ACCOUNT_ID}/ads`,
              {
                name: adName,
                adset_id: targetAdSetId,
                creative: buildCreativeSpec(cand.pId, cand.igId),
                status: adStatus,
              },
              'POST',
            );
            usedPageId = cand.pId;
            break;
          } catch (adErr) {
            lastAdErr = adErr instanceof Error ? adErr : new Error(String(adErr));
          }
        }
        if (!createdAd) {
          throw lastAdErr || new Error(`Nie udało się utworzyć reklamy ${adName}`);
        }

        createdAds.push({
          id: createdAd.id,
          name: adName,
          angleId: ad.angleId,
          url: targetLink,
          imageHash: primaryHash,
          pageId: usedPageId,
        });
      }

      return NextResponse.json({
        ok: true,
        campaignId,
        campaignStatus: campaign.status,
        adSetId: targetAdSetId,
        adSetName,
        adSetStatus: effectiveAdSetStatus,
        createdAdsCount: createdAds.length,
        createdAds,
      });
    }

    return NextResponse.json({ error: 'Nieznana akcja API SARDIAN PL.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd w API SARDIAN PL.' },
      { status: 500 },
    );
  }
});
