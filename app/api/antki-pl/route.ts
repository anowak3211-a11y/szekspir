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
  if (nextAd.secondImageUrl) {
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
      const baseAd = byAngle.get(ad.angleId);
      const isUnmodifiedArgonCopy = ad.id.startsWith('antek-pl-argon-');
      const rawPrimaryText = isUnmodifiedArgonCopy && baseAd ? baseAd.primaryText : ad.primaryText;
      const rawHeadline = isUnmodifiedArgonCopy && baseAd ? baseAd.headline : ad.headline;
      const rawDescription = isUnmodifiedArgonCopy && baseAd ? baseAd.description : ad.description;
      const audited = sanitizeAndAuditAntkiPl(rawPrimaryText, rawHeadline, rawDescription);
      byAngle.set(
        ad.angleId,
        ensureAdImage({
          ...(baseAd || ad),
          ...ad,
          imageUrl: ad.imageUrl || baseAd?.imageUrl,
          imageHash: ad.imageHash ?? baseAd?.imageHash,
          secondImageUrl: ad.secondImageUrl,
          secondImageHash: ad.secondImageHash,
          twoImageLayout: ad.twoImageLayout,
          combinedSplitImageUrl: ad.combinedSplitImageUrl,
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
        model: brain?.model ? `Argon (70 gotowych) + ${brain.model}` : 'Argon (70 autorskich winnerów 1200+ słów)',
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
  const antiAiWrapper = [
    'RAW, UGLY, SHIT QUALITY AMATEUR PHONE SNAPSHOT. Taken hastily by a Polish woman with an old low-end smartphone camera (iPhone 8 or cheap Android) in a real Polish apartment or public corridor.',
    'MANDATORY IMPERFECTIONS (LITERAL): shit quality, slight motion blur, slightly out of focus, visible high-ISO digital camera sensor grain and color noise, subtle JPEG compression artifacts, slightly crooked off-center framing, harsh ugly overhead fluorescent tube light or dim yellow 2700K ceiling bulb, flat unretouched colors, muddy shadows, zero staging.',
    'STRICT ANTI-AI BAN: ZERO "AI glow", ZERO studio lighting, ZERO bokeh or shallow depth-of-field background blur, ZERO skin smoothing, ZERO HDR, ZERO color grading, ZERO stock photo symmetry, ZERO text overlays, ZERO watermarks, ZERO logos.',
    includeProductRef
      ? 'PRODUCT DETAIL: Include the bright orange contoured Orthomax StepMax shoe insole (matching the reference image: orange breathable mesh top with raised oval arch/massage domes) lying naturally in the messy home scene — NOT posed like a commercial packshot.'
      : 'NO PRODUCT IN THIS SHOT: Do NOT include any orange insoles, boxes, or commercial products in this photo — show ONLY the raw real-life problem scene from the story.',
  ].join('\n');

  return `${antiAiWrapper}\n\nEXACT SCENE FROM THE STORY:\n${sceneDescription}`;
}

interface KiePlannedScene {
  label: string;
  scenePrompt: string;
  includeProductRef: boolean;
}

function buildFallbackFiveScenesFromCopy(params: {
  primaryText: string;
  headline: string;
  title: string;
  segment?: string;
}): KiePlannedScene[] {
  const text = `${params.headline}\n${params.primaryText}`.toLowerCase();
  const isDorosli = params.segment === 'dorosli' || text.includes('wnucz') || text.includes('emeryt') || text.includes('55 ') || text.includes('60 ') || text.includes('poznańskim sor') || text.includes('koszem mokrego prania');
  const hasSor = text.includes('sor') || text.includes('szpital') || text.includes('izb') || text.includes('gabinet');
  const hasStairs = text.includes('schod') || text.includes('prani');
  const hasWetFoot = text.includes('mokr') || text.includes('łazien') || text.includes('żelazk');
  const hasPeWf = text.includes('wf') || text.includes('szatni') || text.includes('halówk');

  if (isDorosli) {
    return [
      {
        label: hasSor ? '1. Nocny korytarz SOR / plastikowe krzesełko i spuchnięte kolano' : '1. Wieczorny ból kolana i stopy po całym dniu na nogach',
        includeProductRef: false,
        scenePrompt: hasSor
          ? 'First-person POV amateur phone snapshot looking down while sitting on a cheap blue plastic chair in a sterile Polish hospital emergency room (SOR) hallway late at night under harsh cold green-white fluorescent tube lighting. A 56-year-old Polish woman in rolled-up dark trousers holding her swollen right knee with her hand, scuff-marked grey hospital linoleum floor below, closed white clinic door in background. Blurry, shit quality, grainy phone photo.'
          : 'First-person POV amateur phone snapshot taken in a dim Polish apartment living room at night. A 56-year-old woman sitting on an old patterned couch rubbing her swollen bare ankle and knee under a yellow ceiling bulb. Blurry, shit quality, grainy phone camera.',
      },
      {
        label: hasStairs ? '2. Drewniane schody w domu i wiklinowy kosz z praniem' : '2. Szafka w przedpokoju pełna zużytych maści i żeli z apteki',
        includeProductRef: false,
        scenePrompt: hasStairs
          ? 'Candid, slightly blurry amateur phone photo taken from the top of steep wooden indoor stairs in an older Polish house in the evening. At the bottom of the stairs on the floor sits a full wicker laundry basket with damp clothes and a wooden handrail on the side. Dim yellow hallway bulb, harsh shadows, crooked framing, shit quality phone photo.'
          : 'Ugly, cluttered amateur phone photo of a Polish bathroom shelf or hallway cabinet showing 4 half-squeezed tubes of pharmacy pain relief gels and knee ointments next to a crumpled paper receipt. Harsh indoor light, slight blur, grainy sensor noise.',
      },
      {
        label: '3. Surowe zbliżenie z góry na płaską stopę i uciekającą kostkę',
        includeProductRef: false,
        scenePrompt: 'Raw top-down first-person POV smartphone photo of a middle-aged Polish woman standing barefoot on worn beige ceramic floor tiles in a cramped apartment hallway, showing her bare feet flattening inward at the arches with tired, slightly swollen ankles and a reddened heel. Ugly harsh overhead light, slight motion blur, zero beauty filter, shit quality.',
      },
      {
        label: '4. Zdarte od wewnątrz codzienne buty w polskim przedpokoju',
        includeProductRef: false,
        scenePrompt: 'Amateur phone snapshot in a narrow Polish apartment hallway (przedpokój) at night. A woman’s hand holding an everyday worn leather walking shoe upside down close to the camera, showing the inner edge of the rubber heel visibly ground down at an uneven slant from pronation. Cluttered shoe rack in background, harsh flash/bulb glare, slightly out of focus, shit quality.',
      },
      {
        label: '5. Wkładki Orthomax StepMax na kuchennym stole obok butów',
        includeProductRef: true,
        scenePrompt: 'Unstaged amateur phone photo taken at a Polish kitchen table under a dim warm lamp at night. A pair of bright orange contoured Orthomax StepMax insoles (with raised massage domes) lying next to an everyday pair of women’s walking shoes and a half-drunk mug of tea, looking like a quick photo snapped to send to a friend on Messenger. Slight blur, grainy phone camera quality.',
      },
    ];
  }

  return [
    {
      label: hasPeWf
        ? '1. Wykoślawione halówki i worek na WF rzucone w przedpokoju'
        : '1. Zdarte od wewnątrz dziecięce buty trzymane w dłoni w przedpokoju',
      includeProductRef: false,
      scenePrompt: hasPeWf
        ? 'Raw, slightly blurry amateur phone snapshot on a Polish apartment hallway floor (panele podłogowe) in the evening. A 10-year-old child’s navy indoor PE sneakers (halówki z białą podeszwą) lying next to a crumpled drawstring PE bag, with the shoe heels noticeably tilted and worn down on the inside edge. Dim yellow hallway light, grainy, shit quality.'
        : 'Raw first-person POV smartphone photo in a narrow Polish apartment hallway at night. A mother’s hands holding a 10-year-old child’s everyday sneakers upside down, showing the inner heel edge of the rubber sole badly worn down at a slant. Cluttered shoe mat below, harsh indoor bulb light, slight motion blur, shit quality.',
    },
    {
      label: hasWetFoot
        ? '2. Mokre płaskie ślady stóp dziecka na kafelkach w łazience'
        : '2. Koślawe kostki dziecka od tyłu na panelach w domu',
      includeProductRef: false,
      scenePrompt: hasWetFoot
        ? 'Amateur top-down smartphone photo taken in a small Polish apartment bathroom right after a bath under harsh fluorescent mirror light. On dark grey matte floor tiles are two small 8-year-old child wet footprints side by side — both footprints are completely flat and wide like an iron ("stopa żelazka") with zero arch curve, child’s bare heels stepping onto a crumpled towel at top edge. Grainy, slight blur, shit quality.'
        : 'Raw, unretouched amateur phone photo taken from behind at floor level in a Polish living room on wooden laminate panels. A 9-year-old child standing barefoot in cotton shorts, showing both ankles collapsing inward ("odwrócone V" / valgus ankles). Dim evening indoor lighting, crooked framing, grainy sensor noise, shit quality.',
    },
    {
      label: hasSor
        ? '3. Korytarz poradni / SOR i plastikowe krzesełka wieczorem'
        : '3. Nocny ból nóg dziecka — ręka matki masująca łydkę w łóżku',
      includeProductRef: false,
      scenePrompt: hasSor
        ? 'Hastily taken, slightly blurry smartphone photo from a plastic chair in a Polish clinic/hospital hallway at night under harsh cold fluorescent tube lights, showing scuffed linoleum floor, a child’s legs in sweatpants dangling from the chair, and a closed examination room door. Ugly lighting, high ISO grain, shit quality.'
        : 'Dim, grainy late-night smartphone photo in a child’s bedroom in Poland. A 9-year-old child’s lower legs on a rumpled duvet under a weak bedside lamp while a mother’s hand rubs the child’s aching calf and ankle at night. High ISO noise, slight motion blur, zero AI glow, shit quality.',
    },
    {
      label: '4. Rzucone w kąt stare sztywne wkładki / wałek do ćwiczeń stóp',
      includeProductRef: false,
      scenePrompt: 'Cluttered, candid amateur phone photo on a Polish apartment living room floor in the evening. A pair of stiff, uncomfortable old grey medical shoe insoles kicked aside next to a children’s sneaker and an unused rubber foot massage roller under the edge of a sofa. Flat indoor lighting, slightly out of focus, shit quality.',
    },
    {
      label: '5. Pomarańczowe wkładki Orthomax StepMax wsuwane do dziecięcych butów',
      includeProductRef: true,
      scenePrompt: 'Candid first-person POV amateur phone snapshot in a Polish hallway. A mother’s hand sliding a bright orange contoured Orthomax StepMax insole (with raised arch domes) into a child’s everyday sneaker on a wooden hallway bench. Dim warm indoor bulb light, slight camera shake, grainy phone sensor, shit quality.',
    },
  ];
}

async function extractFiveRawScenesFromAntekCopy(params: {
  primaryText: string;
  headline: string;
  title: string;
  segment?: string;
}): Promise<KiePlannedScene[]> {
  const fallback = buildFallbackFiveScenesFromCopy(params);
  try {
    const settings = brainSettings();
    if (!settings) return fallback;
    const client = brainClient(brainOptions(35_000));
    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a creative director for ultra-raw, authentic Polish Facebook native stories (Antki).
Read the provided Polish ad copy and extract EXACTLY 5 distinct visual scenes taken directly from specific moments, props, and locations mentioned in that story.
Rules for the 5 scenes:
- Scene 1: The exact opening hook scene from paragraph 1 (e.g., sitting on a plastic chair in a Poznań hospital SOR hallway at night holding a swollen knee, OR holding worn-out sneakers in a hallway). NO product/insole in Scene 1 (includeProductRef: false).
- Scene 2: A specific domestic trigger or prop mentioned in the story (e.g., wooden home stairs with a wicker laundry basket at the bottom, OR wet flat footprints on bathroom tiles, OR pharmacy gel tubes). NO product/insole in Scene 2 (includeProductRef: false).
- Scene 3: A raw close-up POV shot of the physical foot/ankle/knee/shoe problem described in the copy (e.g., bare flat foot/collapsing ankle on floor tiles, OR unevenly worn inner shoe heel). NO product/insole in Scene 3 (includeProductRef: false).
- Scene 4: Unboxed bright orange contoured Orthomax StepMax insoles lying on a real Polish kitchen table or hallway bench next to everyday shoes from the story (includeProductRef: true).
- Scene 5: A hand sliding the bright orange Orthomax StepMax insole into the protagonist's everyday shoe in a cramped Polish apartment hallway (includeProductRef: true).

CRITICAL STYLE FOR EVERY scenePrompt (in English):
- Describe it as an UGLY, HASTY, SHIT QUALITY amateur smartphone photo (slight motion blur, slightly out of focus, harsh fluorescent tube light or dim yellow indoor bulb, high-ISO sensor grain, crooked framing, zero AI glow, zero bokeh, zero text overlays).
- Never include people's full faces looking at the camera like models — prefer first-person POV looking down at knees/feet/shoes/stairs/hands, or from behind/cropped angles so it looks 100% real.

Return JSON:
{
  "scenes": [
    { "label": "Short Polish title (max 65 chars)", "scenePrompt": "Detailed English scene description with ugly amateur phone camera details", "includeProductRef": false }
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
    return parsed.scenes.slice(0, 5).map((s, idx) => ({
      label: (s.label || fallback[idx]?.label || `Scena #${idx + 1}`).trim(),
      scenePrompt: (s.scenePrompt || fallback[idx]?.scenePrompt || '').trim(),
      includeProductRef: idx >= 3 ? Boolean(s.includeProductRef ?? true) : false,
    }));
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
      action?: 'generate' | 'save' | 'delete' | 'clear' | 'create-meta-campaign' | 'update_cost_cap' | 'set_image' | 'save_all_images' | 'upload_custom_image' | 'delete_image' | 'sync_meta_cc35' | 'generate_5_kie_images' | 'poll_kie_image';
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

    if (action === 'generate_5_kie_images') {
      const {
        buildKieCreateTaskPayload,
        submitKieRipperTask,
        uploadPublicReferenceToKie,
      } = await import('@/lib/image-ripper');

      const angleId = (body.angleId || '').trim();
      const preset = ANTKI_PL_PRESET_ANGLES.find(a => a.id === angleId);
      const primaryText = (body.primaryText || '').trim();
      const headline = (body.headline || preset?.defaultHeadline || '').trim();
      const title = (body.title || preset?.title || angleId || 'Antek PL').trim();
      const segment = body.segment || preset?.segment || 'dzieci';

      if (!primaryText) {
        return NextResponse.json({ error: 'Brak tekstu Antka (primaryText) do wygenerowania 5 zdjęć.' }, { status: 400 });
      }

      const scenes = await extractFiveRawScenesFromAntekCopy({
        primaryText,
        headline,
        title,
        segment,
      });

      let productRefKieUrl: string | undefined;
      try {
        productRefKieUrl = await uploadPublicReferenceToKie('/antki-pl-images/meta-collage-4x5.jpg');
      } catch {
        productRefKieUrl = undefined;
      }

      const tasks = await Promise.all(
        scenes.map(async (scene, idx) => {
          const fullPrompt = buildRawShitQualityKiePrompt(scene.scenePrompt, scene.includeProductRef);
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
        return NextResponse.json({ error: 'Brak taskId do sprawdzenia statusu Kie.ai.' }, { status: 400 });
      }

      const status = await pollKieRipperTask(taskId);
      if (status.state !== 'success' || !status.resultUrl) {
        return NextResponse.json(status);
      }

      const angleId = (body.angleId || '').trim();
      const preset = ANTKI_PL_PRESET_ANGLES.find(a => a.id === angleId);
      const label = (body.label || `Kie.ai Raw #${preset?.number || ''} (${new Date().toLocaleTimeString('pl-PL')})`).trim();
      const assetId = `kie-raw-${taskId}`;

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
        aspectRatio: '1:1',
        note: 'Surowe zdjęcie z telefonu (Kie.ai — Shit Quality / Zero AI Glow)',
      };

      const defaultArgonAds = buildAllArgonPrewrittenAds();
      const updated = await mutate<
        AntkiPlLibraryState,
        { customImages: AntkiPlImageAsset[]; deletedImageIds: string[] }
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
          state.customImages = customList;
          return {
            customImages: state.customImages,
            deletedImageIds: Array.isArray(state.deletedImageIds) ? state.deletedImageIds : [],
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

    return NextResponse.json({ error: 'Nieznana akcja API Antki PL.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd podczas generowania Antka PL.' },
      { status: 500 },
    );
  }
});
