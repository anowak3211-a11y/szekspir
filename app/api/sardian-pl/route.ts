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

const STATE_KEY = 'sardian-pl-v2-38ads-1300w';

interface SardianPlLibraryState {
  ads: SardianPlGeneratedAd[];
  customImages?: SardianImageAsset[];
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
  graphPath: string,
  params: Record<string, unknown> = {},
  method: 'GET' | 'POST' = 'GET',
): Promise<T> {
  const { token, proof } = await resolveMetaAuth();
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
    throw new Error(`Meta (${e?.code || r.status}/${e?.error_subcode || 0}): ${e?.error_user_msg || e?.message || 'Request failed'}`);
  }
  return data as T;
}

async function ensureMetaImageHash(imageUrl: string, existingHash?: string): Promise<string> {
  if (existingHash && existingHash.trim()) return existingHash.trim();
  const cleanUrl = (imageUrl || '').trim();
  if (!cleanUrl) throw new Error('Brak przypisanego zdjęcia dla reklamy.');

  const { uploadCustomAntkiImageToMeta } = await import('@/lib/meta-adsets');

  if (cleanUrl.startsWith('data:image/')) {
    const m = cleanUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
    if (!m) throw new Error('Nieprawidłowy format dataUrl zdjęcia.');
    const res = await uploadCustomAntkiImageToMeta({
      bytes: m[1],
      fileName: `sardian-${Date.now()}.jpg`,
      accountId: SARDIAN_META_ACCOUNT_ID,
    });
    if (res.hash) return res.hash;
  } else if (cleanUrl.startsWith('/')) {
    const relPath = cleanUrl.replace(/^\/+/, '');
    const absPath = path.join(process.cwd(), 'public', relPath);
    const buf = await fs.readFile(absPath);
    const res = await uploadCustomAntkiImageToMeta({
      bytes: buf.toString('base64'),
      fileName: path.basename(absPath),
      accountId: SARDIAN_META_ACCOUNT_ID,
    });
    if (res.hash) return res.hash;
  } else if (cleanUrl.startsWith('http')) {
    const { safeDownload } = await import('@/lib/safe-fetch');
    const { buffer } = await safeDownload(cleanUrl, 15 * 1024 * 1024);
    const res = await uploadCustomAntkiImageToMeta({
      bytes: Buffer.from(buffer).toString('base64'),
      fileName: `sardian-ext-${Date.now()}.jpg`,
      accountId: SARDIAN_META_ACCOUNT_ID,
    });
    if (res.hash) return res.hash;
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
    };

    const action = body.action || 'save';

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
      const adSetName = (body.adSetName || `29.10 - SARDIAN ANTEK BATCH (${selectedAds.length}x)`).trim();
      const adStatus = body.adStatus || 'PAUSED';

      const source = await directGraph<Record<string, unknown>>(templateAdSetId, {
        fields:
          'targeting,optimization_goal,billing_event,promoted_object,attribution_spec,destination_type,dsa_beneficiary,dsa_payor',
      }).catch(() =>
        directGraph<Record<string, unknown>>('120250060540410298', {
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
        const dsaEntity =
          (typeof source.dsa_beneficiary === 'string' && source.dsa_beneficiary.trim()) ||
          'CABANOWSKI HSTL SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ';
        const dsaPayer =
          (typeof source.dsa_payor === 'string' && source.dsa_payor.trim()) || dsaEntity;
        const createdAdSet = await directGraph<{ id: string }>(
          `act_${SARDIAN_META_ACCOUNT_ID}/adsets`,
          {
            name: adSetName,
            campaign_id: campaignId,
            status: adStatus,
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
          },
          'POST',
        );
        targetAdSetId = createdAdSet.id;
      }

      const createdAds: Array<{ id: string; name: string; angleId: string; url: string }> = [];
      for (const ad of selectedAds) {
        const isFemaleAngle = ad.code.startsWith('K7') || ad.code === 'ND_B5' || ad.code === 'ND_C5';
        const pageId = isFemaleAngle ? '1276931235504931' : body.pageId || ad.pageId || '1363490303507686';
        const pageName = pageId === '1276931235504931' ? 'Sardian' : 'Karol Mikołajczyk';
        const primaryHash = await ensureMetaImageHash(ad.imageUrl, ad.imageHash);
        const targetLink = ad.destinationUrl || SARDIAN_DEFAULT_URL || SARDIAN_PDP_URL;

        const adName = `${ad.code} | PDP SARDIAN | ${pageName}`;
        const creativeSpec = {
          name: `${adName} - Creative`,
          url_tags:
            'utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}',
          object_story_spec: {
            page_id: pageId,
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

        const createdAd = await directGraph<{ id: string }>(
          `act_${SARDIAN_META_ACCOUNT_ID}/ads`,
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
          url: targetLink,
        });
      }

      return NextResponse.json({
        ok: true,
        adSetId: targetAdSetId,
        adSetName,
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
