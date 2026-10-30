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
import { HOOK_SCENES_FROM_ANTEK_45, buildNoomThreeScenesForAngle } from '@/lib/antki-pl-hook-scenes';

export const maxDuration = 300;

const STATE_KEY = 'antki-pl-library-v12-suma-pln';

interface AntkiPlLibraryState {
  ads: AntkiPlGeneratedAd[];
  customImages?: AntkiPlImageAsset[];
  deletedImageIds?: string[];
}

const LEGACY_GROUP_PLACEHOLDER_URLS = new Set([
  '/antki-pl-images/ai-mit-16-wojna-o-cwiczenia.jpg',
  '/antki-pl-images/ai-ryciak-21-gabinet-test-luku.jpg',
  '/antki-pl-images/ai-zal-26-po-operacji-kule.jpg',
  '/antki-pl-images/ai-zima-31-dorosli-zimowe-botki.jpg',
]);
const LEARNED_DIVERSIFIED_ANGLES = new Set([18, 20, 22, 25, 26, 27, 29, 30, 32, 33, 34, 35]);

function ensureAdImage(ad: AntkiPlGeneratedAd): AntkiPlGeneratedAd {
  const preset = ANTKI_PL_PRESET_ANGLES.find(a => a.id === ad.angleId);
  const angleNum = preset?.number || 1;
  let nextAd = { ...ad };
  if (
    nextAd.imageUrl === '/antki-pl-images/lib-antki-30-drzwi-oddzial-ratunkowy.jpg' ||
    nextAd.imageHash === '028fa0e2022ce9974e28e33d1fbfba17'
  ) {
    nextAd = {
      ...nextAd,
      imageUrl: '/antki-pl-images/lib-antki-drzwi-sor-pl.jpg',
      imageHash: '69a46c3803572f10b92b292bb3991967',
    };
  }
  if (nextAd.imageUrl && nextAd.imageUrl.includes('/lib-antki-napis-')) {
    const defaultImg = getDefaultImageForAngle(angleNum);
    nextAd = {
      ...nextAd,
      imageUrl: preset?.defaultImageUrl || defaultImg.url,
      imageHash: preset?.defaultImageHash || defaultImg.imageHash,
    };
  }
  const isUserModified = Boolean(nextAd.updatedAt && nextAd.updatedAt > 1792616400000);
  if (
    !isUserModified &&
    angleNum >= 36 &&
    preset?.defaultImageUrl?.includes('/kie-dorosli-') &&
    nextAd.imageUrl &&
    !nextAd.imageUrl.includes('/kie-dorosli-') &&
    !nextAd.imageUrl.startsWith('data:image/') &&
    !nextAd.imageUrl.startsWith('http')
  ) {
    nextAd = {
      ...nextAd,
      imageUrl: preset.defaultImageUrl,
      imageHash: preset.defaultImageHash,
    };
  }
  if (!nextAd.imageUrl) {
    const defaultImg = getDefaultImageForAngle(angleNum);
    nextAd = {
      ...nextAd,
      imageUrl: preset?.defaultImageUrl || defaultImg.url,
      imageHash: nextAd.imageHash || preset?.defaultImageHash || defaultImg.imageHash,
    };
  } else {
    const matchedLib = ANTKI_PL_IMAGE_LIBRARY.find(i => i.url === nextAd.imageUrl);
    if (matchedLib?.imageHash && matchedLib.imageHash !== nextAd.imageHash) {
      nextAd = { ...nextAd, imageHash: matchedLib.imageHash };
    }
  }
  if (
    !isUserModified &&
    angleNum >= 36 &&
    preset?.defaultSecondImageUrl?.includes('/kie-dorosli-') &&
    nextAd.secondImageUrl &&
    !nextAd.secondImageUrl.includes('/kie-dorosli-') &&
    !nextAd.secondImageUrl.startsWith('data:image/') &&
    !nextAd.secondImageUrl.startsWith('http')
  ) {
    nextAd = {
      ...nextAd,
      secondImageUrl: preset.defaultSecondImageUrl,
      secondImageHash: preset.defaultSecondImageHash,
    };
  }
  if (!nextAd.secondImageUrl && preset?.defaultSecondImageUrl) {
    nextAd = {
      ...nextAd,
      secondImageUrl: preset.defaultSecondImageUrl,
      secondImageHash: preset.defaultSecondImageHash,
    };
  } else if (nextAd.secondImageUrl) {
    const matchedSecondLib = ANTKI_PL_IMAGE_LIBRARY.find(i => i.url === nextAd.secondImageUrl);
    if (matchedSecondLib?.imageHash && matchedSecondLib.imageHash !== nextAd.secondImageHash) {
      nextAd = { ...nextAd, secondImageHash: matchedSecondLib.imageHash };
    }
  }
  return nextAd;
}

async function readLibraryState(): Promise<{
  ads: AntkiPlGeneratedAd[];
  customImages: AntkiPlImageAsset[];
  deletedImageIds: string[];
}> {
  const defaultArgonAds = buildAllArgonPrewrittenAds();
  try {
    let { value } = await readState<AntkiPlLibraryState>(STATE_KEY, {
      ads: defaultArgonAds,
      customImages: [],
      deletedImageIds: [],
    });
    if (!value?.ads?.length && !value?.customImages?.length) {
      try {
        const { inOwnerWorkspace } = await import('@/lib/account-context');
        const ownerRes = await inOwnerWorkspace(() =>
          readState<AntkiPlLibraryState>(STATE_KEY, {
            ads: defaultArgonAds,
            customImages: [],
            deletedImageIds: [],
          }),
        );
        if (ownerRes?.value?.ads?.length || ownerRes?.value?.customImages?.length) {
          value = ownerRes.value;
        }
      } catch {
        // Ignore owner workspace fallback error
      }
    }
    const stored = Array.isArray(value?.ads) ? value.ads : [];
    const rawCustomImages = Array.isArray(value?.customImages) ? value.customImages : [];
    // Prevent Vercel 4.5MB response payload crash if multiple huge base64 data URLs were stored
    const customImages = rawCustomImages
      .filter(img => img?.url && (!img.url.startsWith('data:') || img.url.length < 180_000))
      .map(img => ({
        ...img,
        kiePrompt: img.kiePrompt ? img.kiePrompt.slice(0, 300) : undefined,
      }));
    const deletedImageIds = Array.isArray(value?.deletedImageIds) ? value.deletedImageIds : [];
    if (stored.length === 0) {
      return { ads: defaultArgonAds.map(ensureAdImage), customImages, deletedImageIds };
    }
    // Merge stored overrides with the full 70 Argon-authored ads so code updates always apply
    const byAngle = new Map<string, AntkiPlGeneratedAd>();
    const defaultByAngle = new Map<string, AntkiPlGeneratedAd>();
    for (const ad of defaultArgonAds) {
      const ensured = ensureAdImage(ad);
      defaultByAngle.set(ad.angleId, ensured);
      byAngle.set(ad.angleId, ensured);
    }
    const storedByAngle = new Map<string, AntkiPlGeneratedAd>();
    for (const ad of stored) {
      if (ad?.angleId) storedByAngle.set(ad.angleId, ad);
      const baseAd = byAngle.get(ad.angleId);
      const isUnmodifiedArgonCopy =
        ad.id.startsWith('antek-pl-argon-') || !ad.wordCount || ad.wordCount < 1050;
      const audited =
        isUnmodifiedArgonCopy && baseAd
          ? {
              primaryText: baseAd.primaryText,
              headline: baseAd.headline,
              description: baseAd.description,
              wordCount: baseAd.wordCount,
              characterCount: baseAd.characterCount,
              auditPassed: baseAd.auditPassed,
              auditWarnings: baseAd.auditWarnings,
              auditFixesApplied: baseAd.auditFixesApplied,
            }
          : sanitizeAndAuditAntkiPl(ad.primaryText, ad.headline, ad.description);
      const rawImgUrl = ad.imageUrl && (!ad.imageUrl.startsWith('data:') || ad.imageUrl.length < 180_000) ? ad.imageUrl : undefined;
      const resolvedPrimaryUrl = rawImgUrl || baseAd?.imageUrl;
      const resolvedPrimaryHash =
        rawImgUrl && rawImgUrl !== baseAd?.imageUrl
          ? ad.imageHash || customImages.find(c => c.url === rawImgUrl)?.imageHash
          : ad.imageHash ?? baseAd?.imageHash;
      const rawSecUrl =
        ad.secondImageUrl && (!ad.secondImageUrl.startsWith('data:') || ad.secondImageUrl.length < 180_000)
          ? ad.secondImageUrl
          : undefined;
      byAngle.set(
        ad.angleId,
        ensureAdImage({
          ...(baseAd || ad),
          ...ad,
          imageUrl: resolvedPrimaryUrl,
          imageHash: resolvedPrimaryHash,
          secondImageUrl: rawSecUrl,
          secondImageHash:
            rawSecUrl && rawSecUrl !== baseAd?.secondImageUrl
              ? ad.secondImageHash || customImages.find(c => c.url === rawSecUrl)?.imageHash
              : ad.secondImageHash,
          twoImageLayout: ad.twoImageLayout,
          combinedSplitImageUrl: undefined,
          combinedSplitImageHash: ad.combinedSplitImageHash,
          primaryText: audited.primaryText,
          headline: audited.headline,
          description: audited.description,
          wordCount: audited.wordCount,
          characterCount: audited.characterCount,
          auditPassed: audited.auditPassed,
          auditWarnings: audited.auditWarnings,
          auditFixesApplied: audited.auditFixesApplied,
          destinationUrl:
            ad.destinationUrl === 'https://orthomax.pl/products/stepmax'
              ? ORTHOMAX_PL_DEFAULT_URL
              : ad.destinationUrl || ORTHOMAX_PL_DEFAULT_URL,
        }),
      );
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
      const needsScene2 = !ad.secondImageUrl || (!userModified && !storedAd?.secondImageUrl && ad.secondImageUrl === baseAd?.secondImageUrl);
      return {
        ...ad,
        ...(needsScene1 && scene1 ? { imageUrl: scene1.url, imageHash: scene1.imageHash } : {}),
        ...(needsScene2 && scene2
          ? { secondImageUrl: scene2.url, secondImageHash: scene2.imageHash }
          : {}),
      };
    });
    return { ads: finalAds, customImages, deletedImageIds };
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
        'ULTRA-PUNCHY OTWARCIE W 3-4 KRÓTKICH LINIJKACH + ZWIĘZŁOŚĆ (550-850 SŁÓW): Pierwsze 3-4 zdania muszą od razu wchodzić w konkretny konflikt/odkrycie bez lania wody (zero powolnych wstępów o pogodzie, latarni czy szarlotce). Cały tekst ma mieć 550-850 słów i być podzielony enterami na krótkie 1-2 zdaniowe linijki.',
        'ZERO KATALOGOWEGO OPISU WKŁADEK: Absolutny zakaz pisania o „sprężystej, oddychającej piance o zmiennej gęstości", „głębokim korytku obejmującym piętę z obu stron" i „wypustkach pobudzających receptory". Opisz wkładki jednym prostym, ludzkim zdaniem.',
        'TYLKO JEDEN KRÓTKI P.S. NA KOŃCU: Zero P.P.S., P.P.P.S., P.P.P.P.S.',
        'OBCY W SKLEPIE NIE ZNAJĄ IMIENIA: Sprzedawczyni ani kierowniczka zmiany w sklepie obuwniczym NIE zna imienia matki.',
        'ZERO DOCINANIA NOŻYCZKAMI: Nigdy nie pisz o docinaniu wkładek nożyczkami.',
        'ZERO SZTUCZNYCH GODZIN CO DO MINUTY: Nigdy nie pisz policyjnych godzin typu „o 20:07".',
        'LICZBA MNOGA DLA WKŁADEK: Zawsze pisz w liczbie mnogiej: „Wkładki Orthomax StepMax są zrobione...".',
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
    const { ANTKI_PL_ADSET_BLUEPRINTS, ANTKI_DOROSLI_ADSET_BLUEPRINTS, readAntkiCostCapCampaign } = await import('@/lib/meta-adsets');
    const [{ ads: savedAds, customImages, deletedImageIds }, campaignStructure, dorosliCampaignStructure] = await Promise.all([
      readLibraryState(),
      readAntkiCostCapCampaign('dzieci'),
      readAntkiCostCapCampaign('dorosli'),
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
      dorosliAdSetBlueprints: ANTKI_DOROSLI_ADSET_BLUEPRINTS,
      campaignStructure,
      dorosliCampaignStructure,
      brain: {
        provider: 'argon',
        model: brain?.model ? `Argon (70 gotowych) + ${brain.model}` : 'Argon (70 autorskich punchy winnerów)',
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

function buildRawShitQualityKiePrompt(sceneDescription: string, includeProductRef: boolean): string {
  const isFlatLay = /90-degree|flat-lay|tabletop/i.test(sceneDescription);
  const styleSuffix = isFlatLay
    ? 'Raw, unpolished amateur smartphone photo, visible high-ISO sensor grain, natural Polish indoor lighting. STRICT RULES: 90-degree flat-lay tabletop filling 100% of the frame (NO floating table edges), all visible text must be in Polish only (SUMA PLN, never TOTAL), zero AI glow, zero studio bokeh.'
    : 'Raw, unpolished amateur smartphone snapshot, visible high-ISO sensor grain, candid framing, natural Polish home lighting. STRICT BAN: zero AI glow, zero studio lighting, zero fake bokeh, zero English text.';
  const productRule = includeProductRef
    ? 'Include the bright orange contoured Orthomax StepMax shoe insole (matching the reference image: orange breathable mesh top with raised oval arch/massage domes) lying naturally on the surface.'
    : 'Do NOT include any orange insoles or commercial product boxes in this shot.';

  return `${sceneDescription} ${productRule} ${styleSuffix}`;
}

interface KiePlannedScene {
  label: string;
  scenePrompt: string;
  includeProductRef: boolean;
}

function detectShoppingListAndBuildReceiptScene(primaryText: string): {
  hasShoppingList: boolean;
  totalPln: string | null;
  receiptScene: KiePlannedScene;
} {
  const lines = primaryText.split('\n').map(l => l.trim());
  const bulletExpenses = lines.filter(l => /^[-•*]\s+.+\b\d+\s*zł/i.test(l));
  const totalMatch = primaryText.match(/Razem:\s*(\d[\d\s]*)\s*zł/i) || primaryText.match(/wydałam\s*(?:łącznie\s*)?(\d[\d\s]*)\s*zł/i);
  const totalPln = totalMatch?.[1]?.replace(/\s+/g, '') || null;
  const hasShoppingList =
    bulletExpenses.length >= 2 ||
    Boolean(totalPln) ||
    /paragon|aptek|wydałam|rachunek|podsumowałam|podliczyłam/i.test(primaryText);

  const hasPharmacy = /maść|maści|żel|ketonal|diklofenak|nurofen|aptek|plastr|opask|podpiętk|klin/i.test(primaryText);
  const totalLabel = totalPln ? ` (${totalPln} zł)` : '';

  const receiptScene: KiePlannedScene = {
    label: `2. Polski paragon fiskalny (SUMA PLN) i lista wydatków${totalLabel}`,
    includeProductRef: false,
    scenePrompt: hasPharmacy
      ? `Close-up photo pointing straight down (90-degree flat-lay) at a wooden tabletop surface that fills 100% of the entire image frame (NO table edges visible, NO room background, NO floating table). Lying flat on the wood grain is a crumpled white Polish thermal receipt printed in Polish with header "PARAGON FISKALNY" and the summary line reading "SUMA PLN 186,00" (strictly Polish "SUMA PLN", NEVER the English word "TOTAL"), next to a plain white pharmacy ointment tube and a squared paper notepad page with handwritten Polish expenses${totalPln ? ` ending with "Razem: ${totalPln} zł"` : ''}. Warm indoor ceiling bulb light, natural phone shadow, realistic phone camera grain.`
      : `Close-up photo pointing straight down (90-degree flat-lay) at a wooden tabletop surface that fills 100% of the entire image frame (NO table edges visible, NO room background, NO floating table). Lying flat on the table are two crumpled white Polish thermal receipts printed in Polish with header "PARAGON FISKALNY" and summary line "SUMA PLN" (strictly Polish "SUMA PLN", NEVER the English word "TOTAL"), next to a blue ballpoint pen and a squared notebook page with handwritten Polish expenses in zł${totalPln ? ` and "Razem: ${totalPln} zł" at the bottom` : ''}. Indoor lighting, realistic amateur phone camera quality.`,
  };

  return { hasShoppingList, totalPln, receiptScene };
}

function buildFallbackTenScenesFromCopy(params: {
  angleId?: string;
  primaryText: string;
  headline: string;
  title: string;
  segment?: string;
}): KiePlannedScene[] {
  const text = `${params.headline}\n${params.primaryText}`.toLowerCase();
  const isDorosli = params.segment === 'dorosli' || text.includes('wnucz') || text.includes('emeryt') || text.includes('55 ') || text.includes('60 ') || text.includes('sor') || text.includes('koszem');
  const hasSor = text.includes('sor') || text.includes('szpital') || text.includes('izb') || text.includes('gabinet');
  const hasWetFoot = text.includes('mokr') || text.includes('łazien') || text.includes('żelazk');
  const hasPeWf = text.includes('wf') || text.includes('szatni') || text.includes('halówk');
  const { totalPln } = detectShoppingListAndBuildReceiptScene(params.primaryText);
  const [noomScene1, noomScene2, noomScene3] = buildNoomThreeScenesForAngle({
    ...params,
    totalPln,
  });
  const customHookScenes = params.angleId ? HOOK_SCENES_FROM_ANTEK_45[params.angleId] : undefined;

  if (customHookScenes && customHookScenes.length >= 5) {
    return [
      customHookScenes[0], // Scena #1 (Hook 1/5 — główna scena otwarcia 1:1 z pierwszych zdań copy)
      noomScene1,          // Scena #2 (WZÓR NOOM #1 — wydruk badania + żółty Post-it + polski paragon SUMA PLN w rzucie 90°)
      customHookScenes[1], // Scena #3 (Hook 2/5 — mikro-detal / rekwizyt z hooka)
      customHookScenes[2], // Scena #4 (Hook 3/5 — dowód fizyczny z hooka)
      customHookScenes[3], // Scena #5 (Hook 4/5 — moment emocjonalny / miejsce z hooka)
      customHookScenes[4], // Scena #6 (Hook 5/5 — połowa z 10 zdjęć nawiązuje bezpośrednio do hooka!)
      noomScene2,          // Scena #7 (WZÓR NOOM #2 — podkładka z odręczną listą „TEST 10 SEKUND [✓]” na drewnianym stole 90°)
      noomScene3,          // Scena #8 (WZÓR NOOM #3 — 4 coraz większe blistry tabletek + RTG na drewnianym stole 90°)
      {
        label: '9. Dłoń wsuwająca pomarańczową wkładkę Orthomax do codziennego buta',
        includeProductRef: true,
        scenePrompt: 'Candid first-person POV amateur phone snapshot in a Polish apartment hallway. A woman’s hand sliding a bright orange contoured Orthomax StepMax insole into her everyday leather walking shoe resting flat on the hallway floor. Warm indoor bulb light.',
      },
      {
        label: '10. Dwie pary butów w przedpokoju z widocznymi wkładkami Orthomax (Pakiet 1+1)',
        includeProductRef: true,
        scenePrompt: 'Top-down 90-degree flat-lay amateur smartphone snapshot looking straight down at a rubber shoe mat on a hallway floor filling 100% of the frame, showing two pairs of everyday shoes (outdoor walking shoes and indoor slippers/work shoes) with the bright orange contoured Orthomax StepMax insoles visible inside both pairs.',
      },
    ];
  }

  if (isDorosli) {
    return [
      {
        label: hasSor ? '1. Nocny korytarz SOR / plastikowe krzesełko i spuchnięte kolano' : '1. Wieczorny ból kolana i stopy po całym dniu na nogach',
        includeProductRef: false,
        scenePrompt: hasSor
          ? 'First-person POV amateur phone snapshot looking down while sitting on a blue plastic chair in a Polish hospital emergency room (SOR) hallway at night under cold fluorescent tube lighting. A 54-year-old Polish woman in rolled-up dark trousers holding her swollen right knee with her hand, grey hospital linoleum floor below. Natural level perspective, grainy phone photo.'
          : 'First-person POV amateur phone snapshot taken in a dim Polish apartment living room at night. A 56-year-old woman sitting on a couch rubbing her swollen bare ankle and knee under a warm ceiling bulb. Natural perspective, grainy phone camera.',
      },
      noomScene1,
      {
        label: '3. Surowe zbliżenie z góry na płaską stopę i uciekającą kostkę',
        includeProductRef: false,
        scenePrompt: 'First-person POV smartphone photo looking straight down at the floor: a middle-aged Polish woman standing barefoot on beige ceramic floor tiles filling the frame, showing her bare feet flattening inward at the arches with tired, slightly swollen ankles. Overhead indoor light, natural perspective.',
      },
      {
        label: '4. Zdarte od wewnątrz codzienne buty w polskim przedpokoju',
        includeProductRef: false,
        scenePrompt: 'Amateur phone snapshot in a Polish apartment hallway (przedpokój) at night. A woman’s hand holding an everyday worn leather walking shoe upside down, showing the inner edge of the rubber heel visibly ground down at an uneven slant from pronation. Hallway floor below, realistic indoor lighting.',
      },
      {
        label: '5. Miska z ciepłą wodą i solą na kafelkach w łazience wieczorem',
        includeProductRef: false,
        scenePrompt: 'First-person POV amateur smartphone photo looking down at the bathroom floor: a middle-aged woman soaking her tired, reddened bare feet in a blue plastic basin of warm water resting flat on ceramic floor tiles next to a towel. Fluorescent bathroom light, realistic phone photo.',
      },
      {
        label: '6. Ciasny przedpokój - siedzenie na stołku przy zdejmowaniu butów',
        includeProductRef: false,
        scenePrompt: 'First-person POV amateur phone snapshot taken while sitting in a narrow Polish apartment hallway (przedpokój) after coming home from work. Kicked-off everyday shoes resting flat on a rubber doormat, bare tired feet with red pressure marks on the heels, dim hallway light.',
      },
      noomScene2,
      noomScene3,
      {
        label: '9. Dłoń wsuwająca pomarańczową wkładkę Orthomax do codziennego buta',
        includeProductRef: true,
        scenePrompt: 'Candid first-person POV amateur phone snapshot in a Polish apartment hallway. A middle-aged woman’s hand sliding a bright orange contoured Orthomax StepMax insole into her everyday leather walking shoe resting on a hallway bench. Warm indoor bulb light.',
      },
      {
        label: '10. Dwie pary butów w przedpokoju z widocznymi wkładkami Orthomax (Pakiet 1+1)',
        includeProductRef: true,
        scenePrompt: 'Top-down amateur smartphone snapshot looking straight down at a rubber shoe mat on a hallway floor filling the frame, showing two pairs of everyday shoes (outdoor walking shoes and house slippers) with the bright orange contoured Orthomax StepMax insoles visible inside both pairs.',
      },
    ];
  }

  return [
    {
      label: hasPeWf
        ? '1. Wykoślawione halówki i buty na zmianę w przedpokoju'
        : '1. Zdarte od wewnątrz dziecięce buty trzymane w dłoni w przedpokoju',
      includeProductRef: false,
      scenePrompt: hasPeWf
        ? 'Amateur phone snapshot on a Polish apartment hallway floor (panele podłogowe) in the evening. A 10-year-old child’s navy indoor PE sneakers (halówki z białą podeszwą) resting flat on the floor with the shoe heels noticeably tilted and worn down on the inside edge. Dim yellow hallway light.'
        : 'First-person POV smartphone photo in a narrow Polish apartment hallway at night. A mother’s hands holding a 10-year-old child’s everyday sneakers upside down, showing the inner heel edge of the rubber sole badly worn down at a slant. Shoe mat below, indoor bulb light.',
    },
    noomScene1,
    {
      label: hasWetFoot
        ? '3. Mokre płaskie ślady stóp dziecka na kafelkach w łazience'
        : '3. Koślawe kostki dziecka od tyłu na panelach w domu',
      includeProductRef: false,
      scenePrompt: hasWetFoot
        ? 'Top-down smartphone photo pointing straight down at dark grey matte bathroom floor tiles filling 100% of the frame right after a bath: two small 8-year-old child wet footprints side by side — both footprints are completely flat and wide like an iron ("stopa żelazka") with zero arch curve.'
        : 'Raw, unretouched amateur phone photo taken from behind at floor level in a Polish living room on wooden laminate panels. A 9-year-old child standing barefoot in cotton shorts, showing both ankles collapsing inward ("odwrócone V" / valgus ankles). Level horizon, indoor evening light.',
    },
    {
      label: '4. Rzucone w kąt stare sztywne wkładki / wałek do ćwiczeń stóp',
      includeProductRef: false,
      scenePrompt: 'Candid amateur phone photo looking down at a Polish apartment living room floor in the evening. A pair of stiff, uncomfortable old grey medical shoe insoles lying flat on the floor next to a children’s sneaker and an unused rubber foot massage roller.',
    },
    {
      label: '5. Trzy pary dziecięcych butów w przedpokoju starte po wewnętrznej stronie',
      includeProductRef: false,
      scenePrompt: 'Eye-level floor smartphone photo in a Polish flat hallway: three pairs of a 9-year-old child’s shoes (winter boots, school indoor sneakers, everyday trainers) lined up from behind on the floor, all showing the exact same inward tilt and worn-down inner heel edge.',
    },
    {
      label: '6. Dziecko siedzące na schodach i trzymające się za piętę / kolano',
      includeProductRef: false,
      scenePrompt: 'Candid first-person POV smartphone snapshot taken by a mother looking down at her 9-year-old child sitting on steps in tracksuits holding his aching heel and ankle after school PE class.',
    },
    noomScene2,
    noomScene3,
    {
      label: '9. Pomarańczowe wkładki Orthomax StepMax wsuwane do dziecięcych butów',
      includeProductRef: true,
      scenePrompt: 'Candid first-person POV amateur phone snapshot in a Polish hallway. A mother’s hand sliding a bright orange contoured Orthomax StepMax insole (with raised arch domes) into a child’s everyday sneaker resting on a hallway bench.',
    },
    {
      label: '10. Buty zimowe i szkolne z wkładkami Orthomax w środku (Pakiet 1+1)',
      includeProductRef: true,
      scenePrompt: 'Top-down smartphone snapshot pointing straight down at a hallway doormat filling the frame, showing a child’s outdoor boots and school indoor sneakers side by side, both with bright orange contoured Orthomax StepMax insoles visible inside.',
    },
  ];
}

async function extractTenRawScenesFromAntekCopy(params: {
  angleId?: string;
  primaryText: string;
  headline: string;
  title: string;
  segment?: string;
}): Promise<KiePlannedScene[]> {
  const fallback = buildFallbackTenScenesFromCopy(params);
  const { totalPln } = detectShoppingListAndBuildReceiptScene(params.primaryText);
  const [noomScene1, noomScene2, noomScene3] = buildNoomThreeScenesForAngle({
    ...params,
    totalPln,
  });
  const customHookScenes = params.angleId ? HOOK_SCENES_FROM_ANTEK_45[params.angleId] : undefined;

  // For Antek #45–#70, we have 5 hand-crafted hook scenes (50%) + 3 Noom.pl winner templates (30%) + 2 product shots (20%).
  if (customHookScenes && customHookScenes.length >= 5) {
    return fallback;
  }

  try {
    const client = brainClient(brainOptions(40_000));
    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a creative director for ultra-raw, authentic Polish Facebook native stories (Antki), modeled on top Polish direct-response winners (noom.pl / Zdrowotne SOS / Orthomax).
Read the provided Polish ad copy and extract EXACTLY 10 distinct visual scenes:
- Scenes 1, 3, 4, 5, 6 (5 HOOK SCENES WITHOUT product, includeProductRef: false):
  * Must be 5 different camera angles / close-up details of the EXACT opening hook of THIS copy. Pull literal details from paragraph 1-3!
- Scenes 2, 7, 8 (3 NOOM.PL WINNER TEMPLATES WITHOUT product, includeProductRef: false):
  * Scene 2: 90-degree wooden tabletop flat-lay filling 100% of frame showing clinic printout + yellow Post-it note + Polish receipt ("PARAGON FISKALNY", "SUMA PLN").
  * Scene 7: 90-degree wooden tabletop flat-lay filling 100% of frame showing a brown clipboard with handwritten blue-marker checklist "TEST 10 SEKUND: [✓]...".
  * Scene 8: 90-degree wooden tabletop flat-lay filling 100% of frame showing 4 escalating silver pill blisters from small to large next to an X-ray printout ("TABLETKI CORAZ MOCNIEJSZE...").
- Scenes 9 and 10 (2 scenes WITH product, includeProductRef: true):
  * Scene 9: A hand sliding the bright orange Orthomax StepMax insole into the specific shoe mentioned in the hook.
  * Scene 10: Top-down 90-degree flat-lay shot of two pairs of shoes from the story (1+1 bundle) on a hallway mat with the bright orange Orthomax StepMax insoles visible inside both pairs.

CRITICAL RULES FOR EVERY scenePrompt (in English):
1. NO FLOATING TABLES / NO WEIRD PERSPECTIVES: Whenever an object is on a table or counter, specify: "90-degree flat-lay close-up pointing straight down at the wooden tabletop surface filling 100% of the frame (NO table edges, NO background room visible, NO floating table)".
2. POLISH TEXT ONLY ("SUMA PLN", NEVER "TOTAL").
3. Describe it as a realistic, unpolished amateur smartphone photo (harsh indoor bulb or fluorescent light, sensor grain, zero AI glow, zero bokeh).
4. Never include people's full faces looking at the camera — prefer first-person POV looking down at knees/feet/shoes/receipts/hands.

Return JSON:
{
  "scenes": [
    { "label": "Short Polish title (max 65 chars)", "scenePrompt": "Detailed English scene description following all rules above", "includeProductRef": false }
  ]
}`,
        },
        {
          role: 'user',
          content: `TYTUŁ KĄTA: ${params.title}\nSEGMENT: ${params.segment || 'dzieci'}\nNAGŁÓWEK: ${params.headline}\nTEKST REKLAMY:\n${params.primaryText.slice(0, 5500)}`,
        },
      ],
    });
    const rawContent = completion.choices?.[0]?.message?.content;
    if (!rawContent) return fallback;
    const parsed = JSON.parse(rawContent) as { scenes?: KiePlannedScene[] };
    if (!Array.isArray(parsed.scenes) || parsed.scenes.length < 5) return fallback;
    const scenes = Array.from({ length: 10 }, (_, idx) => {
      const s = parsed.scenes?.[idx];
      return {
        label: (s?.label || fallback[idx]?.label || `Scena #${idx + 1}`).trim(),
        scenePrompt: (s?.scenePrompt || fallback[idx]?.scenePrompt || '').trim(),
        includeProductRef: idx >= 8 ? Boolean(s?.includeProductRef ?? true) : false,
      };
    });

    // HARD GUARANTEE: Always enforce the 3 exact Noom.pl winner templates in slots #2, #7, #8!
    scenes[1] = noomScene1;
    scenes[6] = noomScene2;
    scenes[7] = noomScene3;

    return scenes;
  } catch {
    return fallback;
  }
}

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
      action?: 'generate' | 'save' | 'delete' | 'clear' | 'create-meta-campaign' | 'update_cost_cap' | 'set_image' | 'save_all_images' | 'upload_custom_image' | 'delete_image' | 'sync_meta_cc35' | 'generate_5_kie_images' | 'generate_10_kie_images' | 'poll_kie_image';
      batch?: 'dzieci' | 'dorosli';
      campaignId?: string;
      angleId?: string;
      angleIds?: string[];
      primaryText?: string;
      headline?: string;
      title?: string;
      segment?: string;
      taskId?: string;
      prompt?: string;
      imagesByAngle?: Record<
        string,
        {
          imageUrl?: string;
          imageHash?: string;
          secondImageUrl?: string | null;
          secondImageHash?: string | null;
        }
      >;
      imageId?: string;
      imageUrl?: string;
      imageHash?: string;
      secondImageUrl?: string | null;
      secondImageHash?: string | null;
      twoImageLayout?: 'side_by_side' | 'top_bottom';
      combinedSplitImageUrl?: string | null;
      combinedSplitImageHash?: string | null;
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

    if (action === 'generate_5_kie_images' || action === 'generate_10_kie_images') {
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
      const preset = ANTKI_PL_PRESET_ANGLES.find(a => a.id === angleId);
      const primaryText = (body.primaryText || '').trim();
      const headline = (body.headline || preset?.defaultHeadline || '').trim();
      const title = (body.title || preset?.title || angleId || 'Antek PL').trim();
      const segment = body.segment || preset?.segment || 'dzieci';
      const isManual = Boolean((body as Record<string, unknown>).isManual);

      if (!primaryText) {
        return NextResponse.json({ error: 'Brak tekstu Antka (primaryText) do wygenerowania 12 zdjęć.' }, { status: 400 });
      }

      const scenes = await planNativeIphoneScenesFromScript({
        brand: 'orthomax',
        angleId,
        primaryText,
        headline,
        title,
        segment,
      });

      let productRefKieUrl: string | undefined;
      try {
        productRefKieUrl = await uploadPublicReferenceToKie('/antki-pl-images/lib-antki-kolaz-ugc-4x5.jpg');
      } catch {
        productRefKieUrl = undefined;
      }

      const { customImages: existingCustomImages } = await readLibraryState();
      const normalizeSceneKey = (label = '') =>
        label
          .replace(/^#\d+\s*·\s*/, '')
          .replace(/\(\s*\d[\d\s,]*zł\s*\)/gi, '')
          .trim()
          .toLowerCase();

      const filteredScenes = isManual
        ? scenes
        : scenes.filter(scene => {
            const key = normalizeSceneKey(scene.label);
            const existingMatches = existingCustomImages.filter(
              img => img.angleId === angleId && normalizeSceneKey(img.label) === key && img.url?.startsWith('http'),
            );
            return existingMatches.length < 2;
          });

      const scenesToGenerate = filteredScenes.length > 0 ? filteredScenes : scenes;

      const taskResults = await Promise.all(
        scenesToGenerate.map(async (scene, idx) => {
          const fullPrompt = formatRawIphoneKiePrompt(scene.scenePrompt, 'orthomax', scene.includeProductRef);
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
        return NextResponse.json({ error: 'Brak taskId do sprawdzenia statusu Kie.ai.' }, { status: 400 });
      }

      const status = await pollKieRipperTask(taskId);
      if (status.state !== 'success' || !status.resultUrl) {
        return NextResponse.json(status);
      }

      const angleId = (body.angleId || '').trim();
      const preset = ANTKI_PL_PRESET_ANGLES.find(a => a.id === angleId);
      const label = (body.label || `iPhone Raw #${preset?.number || ''} (${new Date().toLocaleTimeString('pl-PL')})`).trim();
      const assetId = `kie-orthomax-iphone-${taskId}`;

      let uploadedHash: string | undefined;
      try {
        const { buffer } = await safeDownload(status.resultUrl, 15 * 1024 * 1024);
        const base64Bytes = Buffer.from(buffer).toString('base64');
        const { uploadCustomAntkiImageToMeta } = await import('@/lib/meta-adsets');
        const metaRes = await uploadCustomAntkiImageToMeta({
          bytes: base64Bytes,
          fileName: `${assetId}.jpg`,
          accountId: body.accountId || '1109284831182252',
        });
        uploadedHash = metaRes.hash;
      } catch {
        // Non-blocking if Meta token is temporarily unavailable; still saves Kie CDN URL in library
      }

      const newAsset: AntkiPlImageAsset = {
        id: assetId,
        url: status.resultUrl,
        label: preset ? `#${preset.number} · ${label}` : label,
        source: 'ai',
        angleId: angleId || undefined,
        kiePrompt: body.prompt || undefined,
        imageHash: uploadedHash,
        aspectRatio: '3:4',
        note: 'Google AI Raw iPhone 3:4 2K (NHS / Skrypt.txt)',
      };

      const isScene1 = /^1\./.test(label);
      const isScene2 = /^2\./.test(label);
      const now = Date.now();
      const defaultArgonAds = buildAllArgonPrewrittenAds();
      const updated = await mutate<
        AntkiPlLibraryState,
        { customImages: AntkiPlImageAsset[]; deletedImageIds: string[]; ads: AntkiPlGeneratedAd[] }
      >(
        STATE_KEY,
        { ads: defaultArgonAds, customImages: [], deletedImageIds: [] },
        state => {
          const customList = Array.isArray(state.customImages) ? state.customImages : [];
          const existingIdx = customList.findIndex(item => item.id === assetId);
          if (existingIdx >= 0) {
            customList[existingIdx] = {
              ...customList[existingIdx],
              ...newAsset,
              imageHash: newAsset.imageHash || customList[existingIdx].imageHash,
            };
          } else {
            customList.unshift(newAsset);
          }
          state.customImages = customList.slice(0, 2000);

          const adsList = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultArgonAds];
          if (angleId && (isScene1 || isScene2)) {
            const adIdx = adsList.findIndex(item => item.angleId === angleId);
            const baseAd = adIdx >= 0 ? adsList[adIdx] : defaultArgonAds.find(a => a.angleId === angleId);
            if (baseAd) {
              const updatedAd: AntkiPlGeneratedAd = {
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
                adsList.unshift(updatedAd);
              }
            }
          }
          state.ads = adsList.map(ensureAdImage);

          return {
            customImages: state.customImages,
            deletedImageIds: Array.isArray(state.deletedImageIds) ? state.deletedImageIds : [],
            ads: state.ads,
          };
        },
      );

      const delSet = new Set(updated.deletedImageIds);
      const activeLibrary = [...updated.customImages, ...ANTKI_PL_IMAGE_LIBRARY].filter(
        img => !delSet.has(img.id) && !delSet.has(img.url),
      );

      return NextResponse.json({
        state: 'success',
        resultUrl: status.resultUrl,
        asset: newAsset,
        imageLibrary: activeLibrary,
        savedAds: updated.ads,
      });
    }

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
          state.customImages = customList.slice(0, 2000);

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

      return NextResponse.json({
        ok: true,
        asset: newAsset,
        imageLibrary: [...updatedState.customImages, ...ANTKI_PL_IMAGE_LIBRARY],
        metaSynced: 0,
      });
    }

    if (action === 'set_image') {
      const targetAngleIds = Array.isArray(body.angleIds) && body.angleIds.length > 0
        ? body.angleIds
        : body.angleId
        ? [body.angleId]
        : [];
      if (!targetAngleIds.length) {
        return NextResponse.json({ error: 'Brak angleId/angleIds.' }, { status: 400 });
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
            const baseItem = idx >= 0 ? list[idx] : defaultArgonAds.find(a => a.angleId === targetAngleId);
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

            const updatedEntry: AntkiPlGeneratedAd = {
              ...baseItem,
              ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
              ...(body.imageUrl ? { imageHash: body.imageHash || undefined } : {}),
              secondImageUrl: nextSecondUrl,
              secondImageHash: nextSecondHash,
              combinedSplitImageUrl: undefined,
              combinedSplitImageHash: undefined,
              updatedAt: now,
            };

            if (idx >= 0) {
              list[idx] = updatedEntry;
            } else {
              list.unshift(updatedEntry);
            }
          }
          state.ads = list.map(ensureAdImage);
          return state.ads;
        },
      );
      return NextResponse.json({
        ok: true,
        count: savedAds.length,
        ads: savedAds,
        metaSynced: 0,
      });
    }

    if (action === 'save_all_images') {
      const imagesByAngle = body.imagesByAngle || {};
      const entries = Object.entries(imagesByAngle);
      if (!entries.length) {
        return NextResponse.json({ error: 'Brak danych obrazków do zapisu.' }, { status: 400 });
      }
      const defaultArgonAds = buildAllArgonPrewrittenAds();
      const now = Date.now();
      const savedAds = await mutate<AntkiPlLibraryState, AntkiPlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultArgonAds },
        state => {
          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultArgonAds];
          for (const [targetAngleId, cfg] of entries) {
            if (!cfg) continue;
            const idx = list.findIndex(item => item.angleId === targetAngleId);
            const baseItem = idx >= 0 ? list[idx] : defaultArgonAds.find(a => a.angleId === targetAngleId);
            if (!baseItem) continue;

            const nextSecondUrl =
              cfg.secondImageUrl === null || cfg.secondImageUrl === ''
                ? undefined
                : cfg.secondImageUrl !== undefined
                ? cfg.secondImageUrl
                : baseItem.secondImageUrl;
            const nextSecondHash =
              cfg.secondImageUrl === null || cfg.secondImageUrl === ''
                ? undefined
                : cfg.secondImageHash !== undefined
                ? cfg.secondImageHash || undefined
                : baseItem.secondImageHash;

            const updatedEntry: AntkiPlGeneratedAd = {
              ...baseItem,
              ...(cfg.imageUrl ? { imageUrl: cfg.imageUrl } : {}),
              ...(cfg.imageUrl ? { imageHash: cfg.imageHash || undefined } : {}),
              secondImageUrl: nextSecondUrl,
              secondImageHash: nextSecondHash,
              combinedSplitImageUrl: undefined,
              combinedSplitImageHash: undefined,
              updatedAt: now,
            };

            if (idx >= 0) {
              list[idx] = updatedEntry;
            } else {
              list.unshift(updatedEntry);
            }
          }
          state.ads = list.map(ensureAdImage);
          return state.ads;
        },
      );
      return NextResponse.json({
        ok: true,
        count: entries.length,
        ads: savedAds,
      });
    }

    if (action === 'update_cost_cap') {
      const { updateAntkiCampaignCostCap } = await import('@/lib/meta-adsets');
      const res = await updateAntkiCampaignCostCap({
        costCapPln: body.costCapPln ?? 30,
      });
      return NextResponse.json(res);
    }

    if (action === 'create-meta-campaign') {
      const { createAntkiCostCapCampaign } = await import('@/lib/meta-adsets');
      const campaignStructure = await createAntkiCostCapCampaign({
        batch: body.batch === 'dorosli' ? 'dorosli' : 'dzieci',
        accountId: body.accountId || '1109284831182252',
        campaignName: body.campaignName,
        costCapPln: body.costCapPln ?? 30,
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
      const isDorosli = body.batch === 'dorosli';
      const defaultPageId = isDorosli ? '866702399857726' : '798916893308685';
      const resolvedPageId = typeof body.pageId === 'string' && body.pageId.trim() ? body.pageId.trim() : defaultPageId;
      const result = await populateAntkiAdsInCampaign({
        batch: isDorosli ? 'dorosli' : 'dzieci',
        campaignId: typeof body.campaignId === 'string' && body.campaignId.trim() ? body.campaignId.trim() : undefined,
        campaignName: typeof body.campaignName === 'string' && body.campaignName.trim() ? body.campaignName.trim() : undefined,
        costCapPln: body.costCapPln ?? 30,
        dailyBudgetPln: body.dailyBudgetPln ?? 1500,
        group: typeof body.group === 'string' ? body.group : undefined,
        pageId: resolvedPageId,
        instagramUserId: typeof body.instagramUserId === 'string' && body.instagramUserId.trim() ? body.instagramUserId.trim() : undefined,
        imageHash: typeof body.imageHash === 'string' && body.imageHash.trim() ? body.imageHash.trim() : undefined,
        url: typeof body.destinationUrl === 'string' && body.destinationUrl.trim() ? body.destinationUrl.trim() : undefined,
        status: 'PAUSED',
        updateExisting: body.updateExisting !== false,
      });
      return NextResponse.json(result);
    }

    const rawBody = body as Record<string, unknown>;
    if (rawBody.action === 'fit_video_pace') {
      const { inOwnerWorkspace, inWorkspace } = await import('@/lib/account-context');
      const { accountRegistry } = await import('@/lib/account-repository');
      const { jobs, getJob, stripPlaceholderTokens } = await import('@/lib/jobs');
      const { v4RecordingSettings } = await import('@/lib/voice-processing');
      const { sourcePace } = await import('@/lib/source-pace');
      const { safeDownload } = await import('@/lib/safe-fetch');
      const { cleanVoiceover, audioDuration } = await import('@/lib/vo-cleanup');
      const { fitVoiceoverPace } = await import('@/lib/vo-pace');
      const { generateVO } = await import('@/lib/elevenlabs');
      const { prepareNarration } = await import('@/lib/localize');
      const { putMedia } = await import('@/lib/media');
      const { updateVoiceover } = await import('@/lib/sheets');
      const { voiceLinks } = await import('@/lib/voice-links');
      const { syncAssignedEditor } = await import('@/lib/editor-sync');
      const { mkdtemp, writeFile, rm } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const { join } = await import('node:path');

      const targets: string[] = Array.isArray(rawBody.adIds) && rawBody.adIds.length ? rawBody.adIds.map(String) : ['193', '195'];
      const reg = await accountRegistry().catch(() => ({ users: {} }));
      const scopes = [undefined, ...Object.values(reg.users)];
      const results: Record<string, unknown>[] = [];

      for (const ws of scopes) {
        const runInScope = <T>(fn: () => Promise<T>): Promise<T> => (ws ? inWorkspace(ws, fn) : inOwnerWorkspace(fn));
        await runInScope(async () => {
          const allJobs = await jobs();
          const matched = allJobs.filter(j =>
            !j.cancelledAt &&
            !j.abortedAt &&
            targets.some(t => (j.adId || '').includes(t) || j.id === t)
          );
          for (const item of matched) {
            const current = (await getJob(item.id)) || item;
            if (!current.result) continue;
            let duration = current.duration;
            if (!Number.isFinite(duration) || !duration || duration < 3) {
              const mediaUrl = current.audioUrl || current.resolvedVideoUrl || current.sourceUrl;
              if (mediaUrl) {
                const dir = await mkdtemp(join(tmpdir(), 'szekspir-dur-'));
                try {
                  const dl = await safeDownload(mediaUrl, 150 * 1024 * 1024);
                  const tmpFile = join(dir, 'src.media');
                  await writeFile(tmpFile, dl.buffer);
                  duration = await audioDuration(tmpFile);
                } catch {} finally {
                  await rm(dir, { recursive: true, force: true });
                }
              }
            }
            if (!Number.isFinite(duration) || !duration || duration < 3) {
              results.push({ id: current.id, adId: current.adId, error: 'Missing video duration' });
              continue;
            }
            const is105 = rawBody.mode === '1.05' || rawBody.factor === 1.05;
            const cleanScript = stripPlaceholderTokens(current.result.uk_script);
            const processing = is105
              ? { ...v4RecordingSettings(current.voiceProcessing), matchSourcePace: false, pauseShorteningMs: 0, tempoFactor: 1 }
              : { ...v4RecordingSettings(current.voiceProcessing), matchSourcePace: true, tempoFactor: 1 };
            const jobWithDuration = { ...current, duration };
            const pace = is105
              ? undefined
              : sourcePace(jobWithDuration, cleanScript, current.voiceId, processing) || {
                  sourceSeconds: duration,
                  targetSeconds: duration,
                  sourceWords: 100,
                  scriptWords: 100,
                  speed: 1,
                  calibrated: false,
                };
            const nextRev = (current.revision || 0) + 1;
            const origUrl = !rawBody.forceFresh ? (current.voOriginalUrl || current.previousVo?.originalUrl) : undefined;
            let finalAudio: ArrayBuffer;
            let finalTiming: import('@/lib/vo-cleanup').VoiceTiming | undefined;
            let savedOriginalUrl = origUrl;

            if (origUrl) {
              const rawBuf = (await safeDownload(origUrl, 150 * 1024 * 1024)).buffer;
              const rawAb = new Uint8Array(rawBuf).buffer;
              let cleaned = await cleanVoiceover(rawAb, t => { finalTiming = t; }, processing, 'voiceover');
              if (!finalTiming) throw new Error('Timing failed');
              if (is105) {
                const { slightlyFasterVoice } = await import('@/lib/slightly-faster-voice');
                cleaned = await slightlyFasterVoice(cleaned, finalTiming, 1.05);
              } else if (pace) {
                cleaned = await fitVoiceoverPace(cleaned, finalTiming, pace);
              }
              finalAudio = cleaned;
            } else {
              const narration = await prepareNarration(cleanScript, current.provider, current.model, current.market);
              finalAudio = await generateVO(
                narration,
                current.voiceId,
                async (raw, t) => {
                  savedOriginalUrl = await putMedia(`vo/${current.id}-r${nextRev}-original.mp3`, Buffer.from(raw), 'audio/mpeg');
                  finalTiming = t;
                },
                processing,
                'voiceover',
                current.market,
                pace
              );
            }

            const wavUrl = await putMedia(`vo/${current.id}-r${nextRev}.wav`, Buffer.from(finalAudio), 'audio/wav');
            await mutate<import('@/lib/jobs').Job | null, void>(`job-${current.id}`, null, s => {
              if (!s) return;
              s.duration = duration;
              s.voiceProcessing = processing;
              s.voPace = pace;
              s.revision = nextRev;
              s.voApprovedRevision = nextRev;
              s.voOriginalUrl = savedOriginalUrl;
              s.voTiming = finalTiming;
              s.voUrl = wavUrl;
              s.voNeedsRegeneration = false;
              s.lease = undefined;
              s.leaseUntil = undefined;
              s.hookVoPending = undefined;
              s.hookDeliveryPending = undefined;
              delete (s as Record<string, unknown>).originalVoiceoverDelivery;
              s.stages ??= {};
              s.stages.vo = { ...(s.stages.vo || {}), done: true, pending: false, uncertain: false, error: undefined, finished: Date.now() };
              s.updated = Date.now();
            });
            const updated = await getJob(current.id);
            if (updated?.adId) {
              await updateVoiceover(updated.adId, voiceLinks(updated)).catch(() => {});
              await syncAssignedEditor(updated.adId).catch(() => {});
            }
            results.push({
              workspace: ws?.email || 'owner',
              id: current.id,
              adId: current.adId,
              name: current.name,
              mode: is105 ? '1.05x' : 'source_pace',
              videoDuration: duration,
              originalVoSeconds: finalTiming?.originalSeconds,
              inputTrimmedSeconds: finalTiming?.paceAdjustment?.inputSeconds ?? finalTiming?.tempoAdjustment?.inputSeconds ?? finalTiming?.originalSeconds,
              outputVoSeconds: finalTiming?.trimmedSeconds,
              tempoFactor: finalTiming?.paceAdjustment?.factor ?? finalTiming?.tempoAdjustment?.factor ?? 1,
              voUrl: wavUrl,
              reusedOriginalTake: !!origUrl,
            });
          }
        });
      }
      return NextResponse.json({ ok: true, results });
    }

    if (rawBody.action === 'heal_vmake_timeout') {
      const { inOwnerWorkspace, inWorkspace } = await import('@/lib/account-context');
      const { accountRegistry } = await import('@/lib/account-repository');
      const { jobs, getJob, finalise, scheduleJob } = await import('@/lib/jobs');
      const { advanceParallel } = await import('@/lib/parallel-pipeline');
      const { joinParts } = await import('@/lib/long-video');
      const { updateReference } = await import('@/lib/sheets');
      const { videoLinks } = await import('@/lib/video-links');
      const { voiceLinks } = await import('@/lib/voice-links');
      const { syncAssignedEditor } = await import('@/lib/editor-sync');

      const targets: string[] = Array.isArray(rawBody.adIds) && rawBody.adIds.length ? rawBody.adIds.map(String) : ['198', 'e09eff0d'];
      const reg = await accountRegistry().catch(() => ({ users: {} }));
      const scopes = [undefined, ...Object.values(reg.users)];
      const healed: Record<string, unknown>[] = [];

      for (const ws of scopes) {
        const runInScope = <T>(fn: () => Promise<T>): Promise<T> => (ws ? inWorkspace(ws, fn) : inOwnerWorkspace(fn));
        await runInScope(async () => {
          const allJobs = await jobs();
          const matched = allJobs.filter(j =>
            !j.cancelledAt &&
            !j.abortedAt &&
            (targets.some(t => (j.adId || '').includes(t) || j.id.startsWith(t)) || !!j.stages?.enhancePoll?.error)
          );
          for (const item of matched) {
            const current = (await getJob(item.id)) || item;
            let cleanUrl = current.cleanUrl;
            let enhancedUrl = current.enhancedUrl;
            let enhancedSavedUrl = current.enhancedSavedUrl;

            if (current.videoParts?.length) {
              for (const p of current.videoParts) {
                if (!p.enhancedUrl && p.sourceUrl) p.enhancedUrl = p.sourceUrl;
              }
              if (current.vmakeMode === 'combo' && !enhancedSavedUrl) {
                enhancedSavedUrl = await joinParts(current.videoParts.map(p => p.enhancedUrl!), current.id, '-enhanced', current.duration);
              }
              if (current.vmakeMode === 'enhance' && !cleanUrl) {
                cleanUrl = await joinParts(current.videoParts.map(p => p.enhancedUrl!), current.id, '', current.duration);
              }
            } else {
              enhancedUrl = enhancedUrl || current.resolvedVideoUrl || current.sourceUrl;
              if (current.vmakeMode === 'combo' && !enhancedSavedUrl && enhancedUrl) {
                enhancedSavedUrl = await finalise(enhancedUrl, current.id + '-enhanced');
              }
              if (current.vmakeMode === 'enhance' && !cleanUrl && enhancedUrl) {
                cleanUrl = await finalise(enhancedUrl, current.id);
              }
            }

            await mutate<import('@/lib/jobs').Job | null, void>(`job-${current.id}`, null, s => {
              if (!s) return;
              if (s.videoParts?.length) {
                for (const p of s.videoParts) if (!p.enhancedUrl && p.sourceUrl) p.enhancedUrl = p.sourceUrl;
              }
              if (enhancedUrl) s.enhancedUrl = enhancedUrl;
              if (enhancedSavedUrl) s.enhancedSavedUrl = enhancedSavedUrl;
              if (cleanUrl) s.cleanUrl = cleanUrl;
              s.stages ??= {};
              s.stages.enhancePoll = { ...(s.stages.enhancePoll || {}), done: true, pending: false, uncertain: false, error: undefined, finished: Date.now() };
              if (s.vmakeMode === 'enhance' && cleanUrl) {
                s.stages.videoPoll = { ...(s.stages.videoPoll || {}), done: true, pending: false, uncertain: false, error: undefined, finished: Date.now() };
              }
              s.error = undefined;
              s.uncertain = false;
              s.lease = undefined;
              s.leaseUntil = undefined;
              if (s.status === 'Failed') s.status = 'Running';
              s.updated = Date.now();
            });

            for (let step = 0; step < 5; step++) {
              await advanceParallel(current.id).catch(() => {});
              const check = await getJob(current.id);
              if (check?.step === 'done' || check?.status === 'Complete') break;
            }

            const afterJob = (await getJob(current.id))!;
            if (afterJob.adId && afterJob.cleanUrl && !afterJob.stages?.references?.done) {
              await updateReference(afterJob.adId, videoLinks(afterJob), voiceLinks(afterJob)).catch(() => {});
              await syncAssignedEditor(afterJob.adId).catch(() => {});
              await mutate<import('@/lib/jobs').Job | null, void>(`job-${current.id}`, null, s => {
                if (!s) return;
                s.stages ??= {};
                s.stages.references = { done: true, finished: Date.now() };
                if (!s.generateVo || s.stages.vo?.done) {
                  s.step = 'done';
                  s.status = 'Complete';
                  s.completedAt = Date.now();
                }
                s.updated = Date.now();
              });
            }
            await scheduleJob(current.id).catch(() => {});
            const finalJob = await getJob(current.id);
            healed.push({
              id: current.id,
              adId: finalJob?.adId,
              name: finalJob?.name,
              status: finalJob?.status,
              step: finalJob?.step,
              vmakeMode: finalJob?.vmakeMode,
              cleanUrl: finalJob?.cleanUrl,
              enhancedSavedUrl: finalJob?.enhancedSavedUrl,
              stages: finalJob?.stages,
            });
          }
        });
      }
      return NextResponse.json({ ok: true, healed });
    }

    return NextResponse.json({ error: 'Nieznana akcja API Antki PL.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd podczas generowania Antka PL.' },
      { status: 500 },
    );
  }
});
