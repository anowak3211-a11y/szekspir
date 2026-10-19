import { NextResponse } from 'next/server';
import { accountRoute } from '@/lib/account-route';
import { assertBrain, brainClient, brainOptions, brainSettings } from '@/lib/account-brain';
import { mutate, readState } from '@/lib/store';
import {
  ANTKI_PL_IMAGE_LIBRARY,
  ANTKI_PL_PRESET_ANGLES,
  ANTKI_PL_STAGE_LABELS,
  ANTKI_PL_SYSTEM_PROMPT,
  DOROSLI_DEFAULT_HEADLINE,
  ORTHOMAX_PL_DEFAULT_URL,
  PORADY_MAMY_GOSI_HEADLINE,
  getDefaultImageForAngle,
  sanitizeAndAuditAntkiPl,
  type AntkiPlFunnelStage,
  type AntkiPlGeneratedAd,
  type AntkiPlImageAsset,
  type AntkiPlPresetAngle,
  type AntkiPlSegment,
} from '@/lib/antki-pl';
import { ANTKI_PL_ARGON_AUTHORED_COPY, buildAllArgonPrewrittenAds } from '@/lib/antki-pl-argon-library';

export const maxDuration = 300;

const STATE_KEY = 'antki-pl-library-v9-argon';

interface AntkiPlLibraryState {
  ads: AntkiPlGeneratedAd[];
  customImages?: AntkiPlImageAsset[];
  deletedImageIds?: string[];
}

function ensureAdImage(ad: AntkiPlGeneratedAd): AntkiPlGeneratedAd {
  // If an ad previously pointed to one of the removed text-overlay images, reset to clean default
  if (ad.imageUrl && ad.imageUrl.includes('/lib-antki-napis-')) {
    const preset = ANTKI_PL_PRESET_ANGLES.find(a => a.id === ad.angleId);
    const defaultImg = getDefaultImageForAngle(preset?.number || 1);
    return {
      ...ad,
      imageUrl: preset?.defaultImageUrl || defaultImg.url,
      imageHash: preset?.defaultImageHash || defaultImg.imageHash,
    };
  }
  if (ad.imageUrl) {
    const matchedLib = ANTKI_PL_IMAGE_LIBRARY.find(i => i.url === ad.imageUrl);
    if (matchedLib?.imageHash && matchedLib.imageHash !== ad.imageHash) {
      return { ...ad, imageHash: matchedLib.imageHash };
    }
    return ad;
  }
  const preset = ANTKI_PL_PRESET_ANGLES.find(a => a.id === ad.angleId);
  const defaultImg = getDefaultImageForAngle(preset?.number || 1);
  return {
    ...ad,
    imageUrl: preset?.defaultImageUrl || defaultImg.url,
    imageHash: ad.imageHash || preset?.defaultImageHash || defaultImg.imageHash,
  };
}

async function readLibraryState(): Promise<{
  ads: AntkiPlGeneratedAd[];
  customImages: AntkiPlImageAsset[];
  deletedImageIds: string[];
}> {
  const defaultArgonAds = buildAllArgonPrewrittenAds();
  try {
    const { value } = await readState<AntkiPlLibraryState>(STATE_KEY, {
      ads: defaultArgonAds,
      customImages: [],
      deletedImageIds: [],
    });
    const stored = Array.isArray(value?.ads) ? value.ads : [];
    const customImages = Array.isArray(value?.customImages) ? value.customImages : [];
    const deletedImageIds = Array.isArray(value?.deletedImageIds) ? value.deletedImageIds : [];
    if (stored.length === 0) {
      return { ads: defaultArgonAds.map(ensureAdImage), customImages, deletedImageIds };
    }
    // Merge stored overrides with the full 35 Argon-authored ads so code updates always apply
    const byAngle = new Map<string, AntkiPlGeneratedAd>();
    for (const ad of defaultArgonAds) {
      byAngle.set(ad.angleId, ensureAdImage(ad));
    }
    for (const ad of stored) {
      // Only override code defaults if the user explicitly edited, regenerated, or changed the image
      if (ad.id.startsWith('antek-pl-argon-') && ad.updatedAt === ad.createdAt && !ad.imageUrl) {
        continue;
      }
      const audited = sanitizeAndAuditAntkiPl(ad.primaryText, ad.headline, ad.description);
      const baseAd = byAngle.get(ad.angleId);
      byAngle.set(
        ad.angleId,
        ensureAdImage({
          ...ad,
          imageUrl: ad.imageUrl || baseAd?.imageUrl,
          imageHash: ad.imageHash ?? baseAd?.imageHash,
          primaryText: audited.primaryText,
          headline: audited.headline,
          description: audited.description,
          destinationUrl:
            ad.destinationUrl === 'https://orthomax.pl/products/stepmax'
              ? ORTHOMAX_PL_DEFAULT_URL
              : ad.destinationUrl || ORTHOMAX_PL_DEFAULT_URL,
        }),
      );
    }
    return { ads: Array.from(byAngle.values()), customImages, deletedImageIds };
  } catch {
    return { ads: defaultArgonAds.map(ensureAdImage), customImages: [], deletedImageIds: [] };
  }
}

async function upsertAdInLibrary(ad: AntkiPlGeneratedAd): Promise<AntkiPlGeneratedAd[]> {
  const defaultArgonAds = buildAllArgonPrewrittenAds();
  const normalizedAd = ensureAdImage(ad);
  try {
    return await mutate<AntkiPlLibraryState, AntkiPlGeneratedAd[]>(STATE_KEY, { ads: defaultArgonAds, customImages: [] }, state => {
      const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultArgonAds];
      const idx = list.findIndex(item => item.id === normalizedAd.id || item.angleId === normalizedAd.angleId);
      if (idx >= 0) {
        list[idx] = normalizedAd;
      } else {
        list.unshift(normalizedAd);
      }
      state.ads = list.slice(0, 200).map(ensureAdImage);
      return state.ads;
    });
  } catch {
    return [normalizedAd];
  }
}

export function buildAntkiPlUserPrompt(params: {
  angle: AntkiPlPresetAngle;
  customInstructions?: string;
  destinationUrl?: string;
  pageName?: string;
}): string {
  const { angle, customInstructions, destinationUrl, pageName } = params;
  return JSON.stringify(
    {
      task: 'Napisz kompletny, bezkompromisowy polski natywny post sprzedażowy (MSL / Antek) na Facebooka gotowy do publikacji.',
      fanpage: pageName || 'Porady Mamy Gosi',
      segment: angle.segment === 'dzieci' ? 'Dziecięcy (matki dzieci 4-12 lat: koślawość, płaskostopie, kolana w X, kompensacja)' : 'Dorosły (kobiety 40-65+ lat: haluksy, ostroga piętowa, opadnięty łuk, ból w zimowych butach / po operacji)',
      funnelStage: angle.funnelLabel,
      awarenessStage: angle.awarenessStage,
      marketSophistication: angle.sophistication,
      code: angle.code,
      title: angle.title,
      narrator: angle.narrator,
      protagonist: angle.protagonist,
      openingHookDirection: angle.hookIdea,
      coreSceneAndMechanism: angle.sceneBeat,
      failedSolutionsExactMath: angle.failedSolutionsMath,
      discoveryBridge: angle.discoveryBridge,
      offerToInclude: {
        productName: 'Orthomax StepMax',
        bundle1plus1: 'Pakiet 1+1 GRATIS: dwie pary za 99,99 zł (wychodzi 50 zł za parę - np. jedna para do butów zimowych, druga do kapci szkolnych lub domowych)',
        bundle2plus2: 'Opcjonalnie pakiet rodzinny 2+2 GRATIS: 4 pary za 154,99 zł (38,75 zł za parę)',
        guarantee: '30 dni na test bez ryzyka (pełny zwrot pieniędzy nawet po miesiącu normalnego noszenia wkładek w butach)',
        destinationUrl: destinationUrl || ORTHOMAX_PL_DEFAULT_URL,
      },
      strictChecklist: [
        'DŁUGOŚĆ I GŁĘBIA WINNERA (1100-1300 SŁÓW) + KRÓTKIE AKAPITY Z ENTERAMI: Tekst MUSI mieć 1100-1300 słów, być podzielony enterami na krótkie 1-2 zdaniowe akapity i zawierać pełną historię matki oraz dziecka (wyrzuty sumienia matki, 7 dni cichej obserwacji dziecka w domu, kaskadę nieudanych prób, scenę demonstracji mechanizmu, powolną transformację zachowania oraz osobiste zamknięcie z P.S.).',
        'OBCY W SKLEPIE NIE ZNAJĄ IMIENIA + WIARYGODNOŚĆ KIEROWNICZKI: Sprzedawczyni ani kierowniczka zmiany w sklepie obuwniczym NIE zna imienia matki! Pisz „Przyjmę pani ten zwrot, proszę się nie martwić...", a o jej doświadczeniu wspomnij: „która, jak dowiedziałam się chwilę później podczas rozmowy, wcześniej pracowała w sklepie ortopedycznym". Nie spamuj nazwą marki butów (użyj maksymalnie 1 raz).',
        'ZERO DOCINANIA NOŻYCZKAMI: Nigdy nie pisz o docinaniu wkładek nożyczkami! Wkładki Orthomax StepMax mają dokładną rozmiarówkę dopasowaną do buta i od razu po wyjęciu z pudełka wkłada się je do obuwia.',
        'ZERO SZTUCZNYCH GODZIN CO DO MINUTY: Nigdy nie pisz policyjnych godzin typu „W zeszły czwartek o 20:07". Pisz naturalnie: „W zeszły czwartek wieczorem", „Zaraz po kąpieli", „W środku nocy".',
        'LOGICZNE WEJŚCIE POSTACI DO SCENY: Sąsiadka-fizjoterapeutka nigdy nie wchodzi sama z siebie do cudzej łazienki! Matka musi ją sama poprosić o poradę.',
        'ZAKAZ WYLICZANKI „MAJĄ... MAJĄ... MAJĄ...": Opisz działanie wkładek płynnym, obrazowym akapitem narracyjnym.',
        'LICZBA MNOGA DLA WKŁADEK: Zawsze pisz w liczbie mnogiej: „Wkładki Orthomax StepMax są zrobione...", „stabilizują piętę", „działają jak sprężyna".',
        'STYL MELLOW W OTWARCIU I NAGŁÓWKU: Nigdy nie zaczynaj od „Nie miałam zamiaru tego udostępniać..." i nie używaj nagłówka „Jeśli Twoje dziecko bolą stopy...".',
        'REALIZM EMOCJONALNY: Matka nigdy nie płacze razem z dzieckiem na podłodze w trakcie awantury - pęka dopiero później sama w kuchni lub łazience.',
        'ORGANICZNY MOST ODKRYCIA (REVEAL): Odkrycie wkładek zawsze pochodzi z grupy dla mam na Facebooku / forum rodziców / od sąsiadki lub innej mamy.',
        'ZERO długich myślników (em-dash — ani en-dash –) oraz ZERO przecinka przed „i" (konstrukcji „, i").',
      ],
      ...(customInstructions?.trim() ? { additionalOwnerInstructions: customInstructions.trim() } : {}),
    },
    null,
    2,
  );
}

export const GET = accountRoute(async () => {
  try {
    const { ANTKI_PL_ADSET_BLUEPRINTS, readAntkiCostCapCampaign } = await import('@/lib/meta-adsets');
    const [{ ads: savedAds, customImages, deletedImageIds }, campaignStructure] = await Promise.all([
      readLibraryState(),
      readAntkiCostCapCampaign(),
    ]);
    const deletedSet = new Set(deletedImageIds);
    const activeLibrary = [...customImages, ...ANTKI_PL_IMAGE_LIBRARY].filter(
      img => !deletedSet.has(img.id) && !deletedSet.has(img.url),
    );
    const brain = brainSettings();
    const enrichedPresets = ANTKI_PL_PRESET_ANGLES.map(angle => {
      const defaultImg = getDefaultImageForAngle(angle.number);
      return {
        ...angle,
        defaultImageUrl: angle.defaultImageUrl || defaultImg.url,
        defaultImageHash: angle.defaultImageHash || defaultImg.imageHash,
      };
    });
    return NextResponse.json({
      presets: enrichedPresets,
      stages: ANTKI_PL_STAGE_LABELS,
      imageLibrary: activeLibrary,
      savedAds,
      adSetBlueprints: ANTKI_PL_ADSET_BLUEPRINTS,
      campaignStructure,
      brain: {
        provider: 'argon',
        model: brain?.model ? `Argon (35 gotowych) + ${brain.model}` : 'Argon (35 autorskich winnerów 1200+ słów)',
      },
      defaultUrl: ORTHOMAX_PL_DEFAULT_URL,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Nie udało się wczytać modułu Antki PL.' },
      { status: 500 },
    );
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
      return NextResponse.json({ error: 'Payload przekracza limit 20 MB.' }, { status: 413 });
    }

    const body = JSON.parse(raw) as {
      action?: 'generate' | 'save' | 'delete' | 'clear' | 'create-meta-campaign' | 'set_image' | 'upload_custom_image' | 'delete_image' | 'sync_meta_cc35';
      angleId?: string;
      angleIds?: string[];
      imageId?: string;
      imageUrl?: string;
      imageHash?: string;
      dataUrl?: string;
      fileName?: string;
      label?: string;
      group?: string;
      pageId?: string;
      instagramUserId?: string;
      updateExisting?: boolean;
      customAngle?: Partial<AntkiPlPresetAngle>;
      customInstructions?: string;
      destinationUrl?: string;
      pageName?: string;
      ad?: AntkiPlGeneratedAd;
      id?: string;
      forceExternalAi?: boolean;
      accountId?: string;
      campaignName?: string;
      costCapPln?: number;
      dailyBudgetPln?: number;
      forceNew?: boolean;
    };

    const action = body.action || 'generate';

    if (action === 'delete_image') {
      const targetId = (body.imageId || body.id || '').trim();
      const targetUrl = (body.imageUrl || '').trim();
      if (!targetId && !targetUrl) {
        return NextResponse.json({ error: 'Brak imageId lub imageUrl do usunięcia.' }, { status: 400 });
      }
      const defaultArgonAds = buildAllArgonPrewrittenAds();
      const updated = await mutate<
        AntkiPlLibraryState,
        { customImages: AntkiPlImageAsset[]; deletedImageIds: string[] }
      >(
        STATE_KEY,
        { ads: defaultArgonAds, customImages: [], deletedImageIds: [] },
        state => {
          const customList = Array.isArray(state.customImages) ? state.customImages : [];
          state.customImages = customList.filter(
            img => img.id !== targetId && (!targetUrl || img.url !== targetUrl),
          );
          const delSet = new Set(Array.isArray(state.deletedImageIds) ? state.deletedImageIds : []);
          if (targetId) delSet.add(targetId);
          if (targetUrl) delSet.add(targetUrl);
          state.deletedImageIds = Array.from(delSet);
          return {
            customImages: state.customImages,
            deletedImageIds: state.deletedImageIds,
          };
        },
      );
      const delSet = new Set(updated.deletedImageIds);
      const activeLibrary = [...updated.customImages, ...ANTKI_PL_IMAGE_LIBRARY].filter(
        img => !delSet.has(img.id) && !delSet.has(img.url),
      );
      return NextResponse.json({
        ok: true,
        imageLibrary: activeLibrary,
      });
    }

    if (action === 'upload_custom_image') {
      const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl.trim() : '';
      const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
      if (!match?.[1]) {
        return NextResponse.json({ error: 'Nieprawidłowy format zdjęcia (wymagany obraz JPG/PNG/WEBP).' }, { status: 400 });
      }
      const base64Bytes = match[1];
      const cleanFileName = (body.fileName || `wlasne-zdjecie-${Date.now()}.jpg`).trim();
      let uploadedHash: string | undefined;
      try {
        const { uploadCustomAntkiImageToMeta } = await import('@/lib/meta-adsets');
        const metaRes = await uploadCustomAntkiImageToMeta({
          bytes: base64Bytes,
          fileName: cleanFileName,
          accountId: body.accountId || '1109284831182252',
        });
        uploadedHash = metaRes.hash;
      } catch {
        // Non-blocking if Meta token is temporarily unavailable; still saves in Szekspir library
      }

      const now = Date.now();
      const newAsset: AntkiPlImageAsset = {
        id: `custom-img-${now}-${Math.random().toString(36).slice(2, 6)}`,
        url: dataUrl,
        label: (body.label || `Twoje zdjęcie: ${cleanFileName}`).trim(),
        source: 'custom',
        imageHash: uploadedHash,
        aspectRatio: '1:1',
        note: 'Własne zdjęcie wgrane przez użytkownika',
      };

      const targetAngleIds = Array.isArray(body.angleIds) && body.angleIds.length > 0
        ? body.angleIds
        : body.angleId
        ? [body.angleId]
        : [];

      const defaultArgonAds = buildAllArgonPrewrittenAds();
      const updatedState = await mutate<AntkiPlLibraryState, { customImages: AntkiPlImageAsset[]; ads: AntkiPlGeneratedAd[] }>(
        STATE_KEY,
        { ads: defaultArgonAds, customImages: [] },
        state => {
          const customList = Array.isArray(state.customImages) ? [...state.customImages] : [];
          customList.unshift(newAsset);
          state.customImages = customList.slice(0, 80);

          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultArgonAds];
          for (const targetAngleId of targetAngleIds) {
            const idx = list.findIndex(item => item.angleId === targetAngleId);
            if (idx >= 0) {
              list[idx] = {
                ...list[idx],
                imageUrl: newAsset.url,
                imageHash: newAsset.imageHash || list[idx].imageHash,
                updatedAt: now,
              };
            } else {
              const fallback = defaultArgonAds.find(a => a.angleId === targetAngleId);
              if (fallback) {
                list.unshift({
                  ...fallback,
                  imageUrl: newAsset.url,
                  imageHash: newAsset.imageHash,
                  updatedAt: now,
                });
              }
            }
          }
          state.ads = list.map(ensureAdImage);
          return { customImages: state.customImages, ads: state.ads };
        },
      );

      let metaSynced = 0;
      if (targetAngleIds.length > 0) {
        try {
          const { populateAntkiAdsInCampaign } = await import('@/lib/meta-adsets');
          const syncRes = await populateAntkiAdsInCampaign({
            angleIds: targetAngleIds,
            pageId: '798916893308685',
            instagramUserId: '17841473314157729',
            status: 'PAUSED',
            updateExisting: true,
          });
          metaSynced = syncRes.createdCount || 0;
        } catch {
          // Non-blocking
        }
      }

      return NextResponse.json({
        ok: true,
        asset: newAsset,
        imageLibrary: [...updatedState.customImages, ...ANTKI_PL_IMAGE_LIBRARY],
        metaSynced,
      });
    }

    if (action === 'set_image') {
      const targetAngleIds = Array.isArray(body.angleIds) && body.angleIds.length > 0
        ? body.angleIds
        : body.angleId
        ? [body.angleId]
        : [];
      if (!targetAngleIds.length || !body.imageUrl) {
        return NextResponse.json({ error: 'Brak angleId/angleIds lub imageUrl.' }, { status: 400 });
      }
      const defaultArgonAds = buildAllArgonPrewrittenAds();
      const now = Date.now();
      const savedAds = await mutate<AntkiPlLibraryState, AntkiPlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultArgonAds },
        state => {
          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultArgonAds];
          for (const targetAngleId of targetAngleIds) {
            const idx = list.findIndex(item => item.angleId === targetAngleId);
            if (idx >= 0) {
              list[idx] = {
                ...list[idx],
                imageUrl: body.imageUrl,
                imageHash: body.imageHash || undefined,
                updatedAt: now,
              };
            } else {
              const fallback = defaultArgonAds.find(a => a.angleId === targetAngleId);
              if (fallback) {
                list.unshift({
                  ...fallback,
                  imageUrl: body.imageUrl,
                  imageHash: body.imageHash || undefined,
                  updatedAt: now,
                });
              }
            }
          }
          state.ads = list.map(ensureAdImage);
          return state.ads;
        },
      );
      let metaSynced = 0;
      try {
        const { populateAntkiAdsInCampaign } = await import('@/lib/meta-adsets');
        const syncRes = await populateAntkiAdsInCampaign({
          angleIds: targetAngleIds,
          pageId: '798916893308685',
          instagramUserId: '17841473314157729',
          status: 'PAUSED',
          updateExisting: true,
        });
        metaSynced = syncRes.createdCount || 0;
      } catch {
        // Non-blocking: Szekspir DB state is already saved
      }
      return NextResponse.json({ ok: true, count: savedAds.length, metaSynced });
    }

    if (action === 'create-meta-campaign') {
      const { createAntkiCostCapCampaign } = await import('@/lib/meta-adsets');
      const campaignStructure = await createAntkiCostCapCampaign({
        accountId: body.accountId || '1109284831182252',
        campaignName: body.campaignName,
        costCapPln: body.costCapPln ?? 35,
        dailyBudgetPln: body.dailyBudgetPln ?? 1500,
        forceNew: body.forceNew ?? true,
      });
      return NextResponse.json({ campaignStructure });
    }

    if (action === 'save' && body.ad) {
      const audited = sanitizeAndAuditAntkiPl(body.ad.primaryText, body.ad.headline, body.ad.description);
      const updatedAd: AntkiPlGeneratedAd = ensureAdImage({
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
      });
      const savedAds = await upsertAdInLibrary(updatedAd);
      return NextResponse.json({ ad: updatedAd, savedAds });
    }

    if (action === 'delete' && body.id) {
      const savedAds = await mutate<AntkiPlLibraryState, AntkiPlGeneratedAd[]>(STATE_KEY, { ads: buildAllArgonPrewrittenAds() }, state => {
        state.ads = (state.ads || []).filter(item => item.id !== body.id);
        return state.ads;
      });
      return NextResponse.json({ savedAds });
    }

    if (action === 'generate') {
      const preset = ANTKI_PL_PRESET_ANGLES.find(a => a.id === body.angleId);

      // If this preset has an Argon-authored master copy and no custom instructions forcing external AI, serve Argon's copy!
      if (preset && ANTKI_PL_ARGON_AUTHORED_COPY[preset.id] && !body.customInstructions?.trim() && !body.forceExternalAi) {
        const rawArgon = ANTKI_PL_ARGON_AUTHORED_COPY[preset.id];
        const audited = sanitizeAndAuditAntkiPl(
          rawArgon.primaryText,
          rawArgon.headline || preset.defaultHeadline,
          rawArgon.description,
          preset.defaultHeadline,
        );
        const defaultImg = getDefaultImageForAngle(preset.number);
        const now = Date.now();
        const argonAd: AntkiPlGeneratedAd = {
          id: `antek-pl-argon-${preset.code}`,
          angleId: preset.id,
          code: preset.code,
          title: preset.title,
          segment: preset.segment,
          funnelStage: preset.funnelStage,
          pageName: body.pageName || 'Porady Mamy Gosi',
          headline: audited.headline,
          description: audited.description,
          primaryText: audited.primaryText,
          destinationUrl: body.destinationUrl || ORTHOMAX_PL_DEFAULT_URL,
          cta: 'LEARN_MORE',
          imageUrl: body.imageUrl || preset.defaultImageUrl || defaultImg.url,
          imageHash: body.imageHash || preset.defaultImageHash || defaultImg.imageHash,
          wordCount: audited.wordCount,
          characterCount: audited.characterCount,
          auditPassed: audited.auditPassed,
          auditWarnings: audited.auditWarnings,
          auditFixesApplied: audited.auditFixesApplied,
          createdAt: now,
          updatedAt: now,
        };
        const savedAds = await upsertAdInLibrary(argonAd);
        return NextResponse.json({ ad: argonAd, savedAds });
      }

      assertBrain();
      const angle: AntkiPlPresetAngle = preset || {
        id: body.customAngle?.id || `custom-${Date.now()}`,
        number: body.customAngle?.number || 99,
        code: (body.customAngle?.code || 'custom_antek_pl').replace(/[^a-zA-Z0-9_-]/g, '_'),
        title: body.customAngle?.title || 'Własny kąt Antka PL',
        segment: (body.customAngle?.segment as AntkiPlSegment) || 'dzieci',
        funnelStage: (body.customAngle?.funnelStage as AntkiPlFunnelStage) || 'ryciak_rip3_variations',
        funnelLabel: body.customAngle?.funnelLabel || 'Własny kąt',
        awarenessStage: body.customAngle?.awarenessStage || 'Stage 2 (Problem Aware)',
        sophistication: body.customAngle?.sophistication || 'Stage 3/4',
        narrator: body.customAngle?.narrator || 'Małgorzata (38 lat, Gdańsk)',
        protagonist: body.customAngle?.protagonist || 'Kasia (10 lat)',
        hookIdea: body.customAngle?.hookIdea || '',
        sceneBeat: body.customAngle?.sceneBeat || '',
        failedSolutionsMath: body.customAngle?.failedSolutionsMath || 'Maść 35 zł + lekarz 150 zł + fizjoterapeuta 180 zł = 365 zł',
        discoveryBridge: body.customAngle?.discoveryBridge || 'Wieczorne szukanie na forum rodziców i trafienie na Orthomax StepMax.',
        defaultHeadline:
          body.customAngle?.defaultHeadline ||
          (body.customAngle?.segment === 'dorosli' ? DOROSLI_DEFAULT_HEADLINE : PORADY_MAMY_GOSI_HEADLINE),
      };

      const userPrompt = buildAntkiPlUserPrompt({
        angle,
        customInstructions: body.customInstructions,
        destinationUrl: body.destinationUrl,
        pageName: body.pageName,
      });

      const client = brainClient(brainOptions(180_000));
      const completion = await client.chat.completions.create({
        model: process.env.ANTKI_TEXT_MODEL || 'gpt-5.4',
        reasoning_effort: 'low',
        max_completion_tokens: 16000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: ANTKI_PL_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      });

      const content = completion.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Model AI nie zwrócił treści. Sprawdź klucz API lub wybrany model w Profil -> Mózg AI.');
      }

      let parsed: { headline?: string; description?: string; primaryText?: string };
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error('Model zwrócił nieprawidłowy format JSON. Spróbuj ponownie.');
      }

      if (!parsed.primaryText || typeof parsed.primaryText !== 'string') {
        throw new Error('Brak pola primaryText w odpowiedzi modelu.');
      }

      const audited = sanitizeAndAuditAntkiPl(
        parsed.primaryText,
        parsed.headline || angle.defaultHeadline,
        parsed.description,
        angle.defaultHeadline,
      );

      const now = Date.now();
      const generatedAd: AntkiPlGeneratedAd = {
        id: `antek-pl-${angle.code}-${now}`,
        angleId: angle.id,
        code: angle.code,
        title: angle.title,
        segment: angle.segment,
        funnelStage: angle.funnelStage,
        pageName: body.pageName || 'Porady Mamy Gosi',
        headline: audited.headline,
        description: audited.description,
        primaryText: audited.primaryText,
        destinationUrl: body.destinationUrl || ORTHOMAX_PL_DEFAULT_URL,
        cta: 'LEARN_MORE',
        wordCount: audited.wordCount,
        characterCount: audited.characterCount,
        auditPassed: audited.auditPassed,
        auditWarnings: audited.auditWarnings,
        auditFixesApplied: audited.auditFixesApplied,
        createdAt: now,
        updatedAt: now,
      };

      const savedAds = await upsertAdInLibrary(generatedAd);
      return NextResponse.json({ ad: generatedAd, savedAds });
    }

    if (body.action === 'sync_meta_cc35') {
      const { populateAntkiAdsInCampaign } = await import('@/lib/meta-adsets');
      const result = await populateAntkiAdsInCampaign({
        group: typeof body.group === 'string' ? body.group : undefined,
        pageId: typeof body.pageId === 'string' && body.pageId.trim() ? body.pageId.trim() : '798916893308685',
        instagramUserId: typeof body.instagramUserId === 'string' && body.instagramUserId.trim() ? body.instagramUserId.trim() : '17841473314157729',
        imageHash: typeof body.imageHash === 'string' && body.imageHash.trim() ? body.imageHash.trim() : undefined,
        url: typeof body.destinationUrl === 'string' && body.destinationUrl.trim() ? body.destinationUrl.trim() : undefined,
        status: 'PAUSED',
        updateExisting: body.updateExisting !== false,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Nieznana akcja API Antki PL.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd podczas generowania Antka PL.' },
      { status: 500 },
    );
  }
});
