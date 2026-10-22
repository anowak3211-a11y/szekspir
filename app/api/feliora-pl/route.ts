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
    const byAngle = new Map<string, FelioraPlGeneratedAd>();
    for (const ad of defaultAds) {
      byAngle.set(ad.angleId, ad);
    }
    for (const ad of stored) {
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
    return { ads: Array.from(byAngle.values()), customImages };
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
      const { brainClient, brainOptions, brainSettings } = await import('@/lib/account-brain');

      const angleId = (body.angleId || '').trim();
      const preset = FELIORA_PRESET_ANGLES.find(a => a.id === angleId);
      const primaryText = (body.primaryText || '').trim();
      const headline = (body.headline || preset?.title || '').trim();
      const title = (body.title || preset?.shortTitle || angleId || 'Feliora PL').trim();

      let scenes: Array<{ label: string; scenePrompt: string; includeProductRef: boolean }> = [
        {
          label: 'Ujęcie #1 · Problem (Mokra plama / Sikanie)',
          scenePrompt:
            'First-person POV looking down at a fresh dark wet cat urine stain on a crumpled cotton duvet on an unmade bed in a cramped Polish apartment bedroom under dim 2700K yellow bulb light, with a tense domestic tabby cat sitting at the corner of the mattress.',
          includeProductRef: false,
        },
        {
          label: 'Ujęcie #2 · Punkt Załamania (Folia / Ocet / Kuweciarnia)',
          scenePrompt:
            'Ugly hasty phone snapshot in a Polish apartment living room: a grey fabric sofa covered with crinkly translucent painter plastic foil taped with yellow masking tape, a bucket of soapy water and a bottle of spirit vinegar on the floor.',
          includeProductRef: false,
        },
        {
          label: 'Ujęcie #3 · Zbliżenie Emocjonalne (Kot w stresie)',
          scenePrompt:
            'Dark grainy smartphone photo taken at floor level with harsh camera flash peering under a wooden bed frame in a Polish apartment: a scared cat crouched low in the back corner with wide reflective eyes and an untouched food bowl.',
          includeProductRef: false,
        },
        {
          label: 'Ujęcie #4 · Demaskacja (Obróżki / Spraye / Rachunki od weta)',
          scenePrompt:
            'Cluttered top-down smartphone snapshot on a scratched Polish kitchen table under harsh indoor light: a purple calming cat collar cut in half with scissors next to crumpled vet clinic fiscal receipts and unbranded pet spray bottles.',
          includeProductRef: false,
        },
        {
          label: 'Ujęcie #5 · Rozwiązanie (Wtyczka Feliora w gniazdku + śpiący kot)',
          scenePrompt:
            'Unstaged amateur phone photo in a Polish apartment hallway under warm 2700K evening bulb light: a white rounded duck-head Feliora pheromone diffuser with an amber bottle plugged into a wall socket above the baseboard, and a calm tabby cat sleeping on the floor nearby.',
          includeProductRef: true,
        },
      ];

      try {
        const s = brainSettings();
        const opts = brainOptions(45000);
        const client = brainClient(opts);
        const completion = await client.chat.completions.create({
          model: s?.model || 'gpt-5.4',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You extract 5 ultra-raw, ugly, amateur Polish smartphone photo prompts ("shit quality", slight blur, high ISO grain, zero AI glow, zero text overlays) matching a Polish native Facebook post about cat stress/peeing and the Feliora pheromone diffuser. Shots 1-4 MUST have includeProductRef: false (pure problem/home scenes, zero diffusers). Shot 5 MUST have includeProductRef: true (the white duck-head Feliora plug-in diffuser in a Polish wall socket or on a kitchen table). Return JSON: { "scenes": [ { "label": "Ujęcie #1 · ...", "scenePrompt": "...", "includeProductRef": false }, ... ] }',
            },
            {
              role: 'user',
              content: `Tytuł kąta: ${title}\nNagłówek: ${headline}\nTekst reklamy:\n${primaryText.slice(0, 3800)}`,
            },
          ],
        });
        const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
        if (Array.isArray(parsed.scenes) && parsed.scenes.length >= 5) {
          scenes = parsed.scenes.slice(0, 5).map((item: Record<string, unknown>, i: number) => ({
            label: String(item.label || `Ujęcie #${i + 1}`),
            scenePrompt: String(item.scenePrompt || scenes[i].scenePrompt),
            includeProductRef: Boolean(item.includeProductRef ?? i === 4),
          }));
        }
      } catch {
        // Fallback to default 5 Feliora scenes
      }

      let productRefKieUrl: string | undefined;
      try {
        productRefKieUrl = await uploadPublicReferenceToKie('/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg');
      } catch {
        productRefKieUrl = undefined;
      }

      const tasks = await Promise.all(
        scenes.map(async (scene, idx) => {
          const fullPrompt = `${scene.scenePrompt} Raw, ugly, shit quality amateur smartphone snapshot, slight motion blur, slightly out of focus, visible high-ISO digital camera sensor grain and noise, crooked off-center framing, flat harsh Polish apartment lighting, muddy shadows. STRICT BAN: zero AI glow, zero studio lighting, zero bokeh, zero HDR, zero text overlays or watermarks.`;
          const payload = buildKieCreateTaskPayload({
            model: 'nano-banana-pro',
            prompt: fullPrompt,
            imageUrls: scene.includeProductRef && productRefKieUrl ? [productRefKieUrl] : [],
            aspectRatio: '1:1',
            resolution: '1K',
          });
          const taskId = await submitKieRipperTask(payload);
          return {
            index: idx + 1,
            label: scene.label,
            prompt: fullPrompt,
            includeProductRef: scene.includeProductRef,
            taskId,
          };
        }),
      );

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
      const label = (body.label || `Kie.ai Raw #${preset?.number || ''}`).trim();
      const assetId = `kie-fel-raw-${taskId}`;

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
        adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
        adOrigin: preset?.code || 'KIE-RAW',
        aspectRatio: '1:1',
        source: 'ai',
        angleId: angleId || undefined,
        kiePrompt: body.prompt || undefined,
      };

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
        state.customImages = customList.slice(0, 80);
        return { customImages: state.customImages, ads: state.ads || defaultAds };
      });

      return NextResponse.json({
        state: 'success',
        resultUrl: status.resultUrl,
        asset: newAsset,
        imageLibrary: [...updatedState.customImages, ...FELIORA_IMAGE_LIBRARY],
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
      const templateAdSetId = body.templateAdSetId || '120248723615340298';
      const adSetName = (body.adSetName || `22.04 - FELIORA ANTEK BATCH (${selectedAds.length}x)`).trim();
      const urlMode = body.urlMode || 'advertorial';
      const adStatus = body.adStatus || 'PAUSED';

      const source = await directGraph<Record<string, unknown>>(templateAdSetId, {
        fields: 'targeting,optimization_goal,billing_event,promoted_object,attribution_spec,destination_type',
      });

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
          targeting: source.targeting,
          attribution_spec: source.attribution_spec,
          destination_type: source.destination_type || 'WEBSITE',
        },
        'POST',
      );

      const createdAds: Array<{ id: string; name: string; angleId: string; url: string }> = [];
      for (const ad of selectedAds) {
        const pageId = body.pageId || ad.pageId || '1287239777799682';
        const imageHash = ad.imageHash || '44568acba92b73f42dc4860eceeffb26';
        const urlsToPush: Array<{ suffix: string; link: string; hash: string }> =
          urlMode === 'split_ab'
            ? [
                {
                  suffix: 'LISTICLE',
                  link: FELIORA_ADVERTORIAL_URL,
                  hash: imageHash,
                },
                {
                  suffix: 'PDP',
                  link: FELIORA_DEFAULT_URL,
                  hash: ad.secondImageHash || imageHash,
                },
              ]
            : [
                {
                  suffix: urlMode === 'pdp' ? 'PDP' : 'LISTICLE',
                  link: urlMode === 'pdp' ? FELIORA_DEFAULT_URL : FELIORA_ADVERTORIAL_URL,
                  hash: imageHash,
                },
              ];

        for (const variant of urlsToPush) {
          const adName = `${ad.code} | ${variant.suffix} | ${ad.pageName}`;
          const creative = await directGraph<{ id: string }>(
            `act_${FELIORA_META_ACCOUNT_ID}/adcreatives`,
            {
              name: `${adName} - Creative`,
              object_story_spec: {
                page_id: pageId,
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
            },
            'POST',
          );
          const createdAd = await directGraph<{ id: string }>(
            `act_${FELIORA_META_ACCOUNT_ID}/ads`,
            {
              name: adName,
              adset_id: createdAdSet.id,
              creative: { creative_id: creative.id },
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
        adSetId: createdAdSet.id,
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
