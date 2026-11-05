/**
 * TITANO ČESKO (titanoshop.cz) — Kompletny Pakiet 40 Kreacji:
 *   - #01–#08: 8 Unikalnych Czeskich Antków (Rady babičky Danuše · 161 247 znaków · każdy ze swoim #1 zdjęciem Top Reach)
 *   - #09–#30: Pozostałe 22 kreacje z Top 30 Native Spenderów (1:1 czeskie zdjęcia + przypisane Antki #1–#8)
 *   - #31–#40: Top 10 Brand Statics na Titano Česko (przerobione 1:1 na czeski)
 */

import {
  TITANO_CZ_STORIES,
  TITANO_CZ_BRAND_COPY_1,
  TITANO_CZ_BRAND_COPY_2,
} from './titano-cz-stories';

export type TitanoCzAwarenessStageId =
  | 'stage1_unaware'
  | 'stage2_problem_aware'
  | 'stage3_solution_aware'
  | 'stage4_product_aware'
  | 'stage5_most_aware';

export type TitanoCzSophisticationLevel = 3 | 4 | 5;

export type TitanoCzProblemCluster =
  | 'ANGLE_1_LUKAS_RIZEK'
  | 'ANGLE_2_JIRKA_VAJICKA'
  | 'ANGLE_3_KUBIK_KRK'
  | 'ANGLE_4_SYNLAB_8MIN'
  | 'ANGLE_5_MAGDA_ONKOLOGIE'
  | 'ANGLE_6_KOCKA_MISA'
  | 'ANGLE_7_TONIK_DZEM'
  | 'ANGLE_8_TONDA_SESIT'
  | 'BRAND_STATIC_TOP10';

export interface TitanoCzStageMeta {
  id: TitanoCzAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  shortLabel: string;
  title: string;
  subtitle: string;
  sophisticationLabel: string;
  sophisticationLevel: TitanoCzSophisticationLevel;
  color: string;
  bgLight: string;
  borderColor: string;
  vocSummary: string;
}

export interface TitanoCzFanpage {
  id: string;
  name: string;
  initials: string;
  role: string;
  badgeColor: string;
  avatarUrl?: string;
}

export interface TitanoCzImageAsset {
  id: string;
  url: string;
  imageHash: string;
  label: string;
  adsetOrigin: string;
  adOrigin: string;
  aspectRatio: string;
  source?: 'ai' | 'meta';
  angleId?: string;
  kiePrompt?: string;
}

export interface TitanoCzAnglePreset {
  id: string;
  number: number;
  code: string;
  title: string;
  shortTitle: string;
  stageId: TitanoCzAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  sophisticationLevel: TitanoCzSophisticationLevel;
  sophisticationBadge: string;
  problemCluster: TitanoCzProblemCluster;
  problemLabel: string;
  recommendedFanpageId: string;
  recommendedFanpageName: string;
  vocTrigger: string;
  mechanismCore: string;
  destinationUrl: string;
  defaultImageId: string;
  defaultImageUrl: string;
  defaultImageHash: string;
  createdDate?: string;
  updatedDate?: string;
  storyNumber?: number;
  top30Rank?: number;
  euReach?: number;
}

export const TITANO_CZ_PDP_URL = 'https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro';
export const TITANO_CZ_DEFAULT_URL = TITANO_CZ_PDP_URL;
export const TITANO_CZ_META_ACCOUNT_ID = '1101104970041845';
export const TITANO_CZ_META_PIXEL_ID = '';

export const TITANO_CZ_FANPAGES: TitanoCzFanpage[] = [
  {
    id: '1338686329339342',
    name: 'Rady babičky Danuše',
    initials: 'BD',
    role: '1. os. czeska babcia Danuše — 8 zwycięskich Antków + 30 Top Spender kreacji Native (89,9% zasięgu EU)',
    badgeColor: '#d97706',
    avatarUrl: '/titano-cz-images/Avatar_Rady_Babicky_Danuse.jpg',
  },
  {
    id: '1401918076339017',
    name: 'Titano Česko',
    initials: 'TČ',
    role: 'Oficjalny Fanpage sklepu Titano Česko — 10 Top Brand Statics & Promocje 1 749 Kč (10,1% zasięgu EU)',
    badgeColor: '#0284c7',
    avatarUrl: '/titano-cz-images/Avatar_Titano_Cesko.jpg',
  },
];

export const TITANO_CZ_STAGES: Record<TitanoCzAwarenessStageId, TitanoCzStageMeta> = {
  stage1_unaware: {
    id: 'stage1_unaware',
    stageNumber: 1,
    shortLabel: '🔥 8 Głównych Antków (#01–#08)',
    title: 'BATCH 1: 8 UNIKALNYCH CZESKICH HISTORII BABCI DANUŠE (ANTEK #1–#8 · 4,21M REACH)',
    subtitle: 'Pełne czeskie adaptacje 1:1 wszystkich 8 zwycięskich historii z przypisanym #1 zdjęciem dla każdego kąta',
    sophisticationLabel: 'Stage 1 · Native Story Camouflage (Rady babičky Danuše)',
    sophisticationLevel: 4,
    color: '#ea580c',
    bgLight: '#fff7ed',
    borderColor: '#fed7aa',
    vocSummary: '8 unikalnych historii w 1. osobie (Danuše): Lukáš & řízek, Kubík & krk, Toník & džem, Magda z onkologie, Tonda & sešit „titanová”, Synlab 8 minut, Jirka & vajíčka, Kočka Míša.',
  },
  stage2_problem_aware: {
    id: 'stage2_problem_aware',
    stageNumber: 2,
    shortLabel: '📸 Top 30 Native Cz. 1 (#09–#19)',
    title: 'BATCH 2: TOP SPENDER NATIVE IMAGE VARIANTS (POZYCJE #03–#17 WG EU REACH)',
    subtitle: 'Największe warianty zdjęciowe z Top 30 (płatki teflonu na talerzu, jajecznica, chusteczka, porysowane patelnie)',
    sophisticationLabel: 'Stage 2 · Top Reach Visuals (Rady babičky Danuše)',
    sophisticationLevel: 4,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    vocSummary: 'Kombinacje 1:1 najmocniejszych zdjęć z kuchni z odpowiadającymi im historiami Babci Danuše.',
  },
  stage3_solution_aware: {
    id: 'stage3_solution_aware',
    stageNumber: 3,
    shortLabel: '📸 Top 30 Native Cz. 2 (#20–#30)',
    title: 'BATCH 3: TOP SPENDER NATIVE IMAGE VARIANTS (POZYCJE #18–#30 WG EU REACH)',
    subtitle: 'Kolejne sprawdzone zdjęcia z Top 30 (masło na patelni, wytłaczanka jajek, kotlet na świątecznym obrusie)',
    sophisticationLabel: 'Stage 3 · Visual Scaling Pool (Rady babičky Danuše)',
    sophisticationLevel: 4,
    color: '#16a34a',
    bgLight: '#f0fdf4',
    borderColor: '#bbf7d0',
    vocSummary: 'Dodatkowe warianty wizualne z Top 30 pozwalające skalować te same zwycięskie teksty bez zmęczenia kreacji.',
  },
  stage4_product_aware: {
    id: 'stage4_product_aware',
    stageNumber: 4,
    shortLabel: '🔬 Dodatkowe Warianty (#73 & #78)',
    title: 'BATCH 4: DODATKOWE WARIANTY ZESZYTU „TITANOVÁ” (#73 PIÓRO & #78 OŁÓWEK)',
    subtitle: 'Dodatkowe zlokalizowane zdjęcia zeszytu szkolnego z puli 79 reklam Native',
    sophisticationLabel: 'Stage 4 · Extra Notebook Variants',
    sophisticationLevel: 4,
    color: '#047857',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
    vocSummary: 'Dostępne w bibliotece zdjęć do podmiany 1 kliknięciem.',
  },
  stage5_most_aware: {
    id: 'stage5_most_aware',
    stageNumber: 5,
    shortLabel: '🏷️ Top 10 Brand Statics (#31–#40)',
    title: 'BATCH 5: 10 NAJWIĘKSZYCH STATYKÓW BRANDOWYCH (TITANO ČESKO)',
    subtitle: 'Zlokalizowane 1:1 na czeski grafiki promocyjne i packshoty z oficjalnego fanpage’a Titano Česko',
    sophisticationLabel: 'Stage 5 · Direct Offer & Retargeting (Titano Česko)',
    sophisticationLevel: 5,
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#bae6fd',
    vocSummary: 'POSLEDNÍ ŠANCE 2+1 ZDARMA, Cena 1 749 Kč, VÝPRODEJ MĚSÍCE POVĚDOMÍ O PFAS, KRABICE POMAČKANÉ PŘI PŘEPRAVĚ, 9999 RYZÍ ZLATO.',
  },
};

export const TITANO_CZ_IMAGE_LIBRARY: TitanoCzImageAsset[] = [
  {
    "id": "native-top-01",
    "url": "/titano-cz-images/native_top01.png",
    "imageHash": "",
    "label": "Native Top #01 (662 258 Reach) · Nadgryziony kawałek kotleta i czarna drobinka teflonu na białym talerzu",
    "adsetOrigin": "Rady babičky Danuše · Antek #1",
    "adOrigin": "Top #01 (28 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-02",
    "url": "/titano-cz-images/native_top02.png",
    "imageHash": "",
    "label": "Native Top #02 (387 140 Reach) · Jajecznica na białym talerzu z dużym czarnym płatkiem teflonu pośrodku",
    "adsetOrigin": "Rady babičky Danuše · Antek #3",
    "adOrigin": "Top #02 (12 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-03",
    "url": "/titano-cz-images/native_top03.png",
    "imageHash": "",
    "label": "Native Top #03 (304 358 Reach) · Zbliżenie na czarny płatek teflonu na białym ręczniku papierowym",
    "adsetOrigin": "Rady babičky Danuše · Antek #3",
    "adOrigin": "Top #03 (19 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-04",
    "url": "/titano-cz-images/native_top04.png",
    "imageHash": "",
    "label": "Native Top #04 (284 485 Reach) · Jajecznica na białym talerzu z czarną drobinką teflonu z prawej strony",
    "adsetOrigin": "Rady babičky Danuše · Antek #3",
    "adOrigin": "Top #04 (14 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-05",
    "url": "/titano-cz-images/native_top05.png",
    "imageHash": "",
    "label": "Native Top #05 (213 934 Reach) · Zgnieciona chusteczka papierowa z czerwonym śladem na drewnianym blacie",
    "adsetOrigin": "Rady babičky Danuše · Antek #1",
    "adOrigin": "Top #05 (16 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-06",
    "url": "/titano-cz-images/native_top06.png",
    "imageHash": "",
    "label": "Native Top #06 (192 451 Reach) · Czarne okulary leżące na pudełku od patelni teflonowej na stole",
    "adsetOrigin": "Rady babičky Danuše · Antek #1",
    "adOrigin": "Top #06 (15 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-07",
    "url": "/titano-cz-images/native_top07.png",
    "imageHash": "",
    "label": "Native Top #07 (190 625 Reach) · Kotlet schabowy z ziemniakami i surówką z kapusty na talerzu w kwiatki",
    "adsetOrigin": "Rady babičky Danuše · Antek #7",
    "adOrigin": "Top #07 (6 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-08",
    "url": "/titano-cz-images/native_top08.png",
    "imageHash": "",
    "label": "Native Top #08 (148 144 Reach) · Pusta  porysowana czarna patelnia teflonowa na palniku gazowym",
    "adsetOrigin": "Rady babičky Danuše · Antek #5",
    "adOrigin": "Top #08 (16 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-09",
    "url": "/titano-cz-images/native_top09.png",
    "imageHash": "",
    "label": "Native Top #09 (138 167 Reach) · Przypalony stalowy rondel i czarna patelnia teflonowa obok siebie na kuchence",
    "adsetOrigin": "Rady babičky Danuše · Antek #8",
    "adOrigin": "Top #09 (13 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-10",
    "url": "/titano-cz-images/native_top10.png",
    "imageHash": "",
    "label": "Native Top #10 (124 060 Reach) · Jajecznica na białym talerzu z czarnym płatkiem teflonu pośrodku",
    "adsetOrigin": "Rady babičky Danuše · Antek #5",
    "adOrigin": "Top #10 (8 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-11",
    "url": "/titano-cz-images/native_top11.png",
    "imageHash": "",
    "label": "Native Top #11 (113 221 Reach) · Czarny płatek teflonu na opuszku palca nad czarną patelnią",
    "adsetOrigin": "Rady babičky Danuše · Antek #4",
    "adOrigin": "Top #11 (6 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-12",
    "url": "/titano-cz-images/native_top12.png",
    "imageHash": "",
    "label": "Native Top #12 (83 395 Reach) · Jajecznica z kromką chleba razowego na białym talerzu",
    "adsetOrigin": "Rady babičky Danuše · Antek #3",
    "adOrigin": "Top #12 (8 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-13",
    "url": "/titano-cz-images/native_top13.png",
    "imageHash": "",
    "label": "Native Top #13 (75 937 Reach) · Jajecznica na patelni z dużą zdartą łatą powłoki teflonowej na dnie",
    "adsetOrigin": "Rady babičky Danuše · Antek #4",
    "adOrigin": "Top #13 (9 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-14",
    "url": "/titano-cz-images/native_top14.png",
    "imageHash": "",
    "label": "Native Top #14 (75 498 Reach) · Rozlana żółta masa jajeczna z pianą na kafelkach obok metalowej miski",
    "adsetOrigin": "Rady babičky Danuše · Antek #2",
    "adOrigin": "Top #14 (7 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-15",
    "url": "/titano-cz-images/native_top15.png",
    "imageHash": "",
    "label": "Native Top #15 (67 620 Reach) · Jajecznica na białym talerzu z widelcem po prawej stronie",
    "adsetOrigin": "Rady babičky Danuše · Antek #5",
    "adOrigin": "Top #15 (10 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-16",
    "url": "/titano-cz-images/native_top16.png",
    "imageHash": "",
    "label": "Native Top #16 (60 992 Reach) · Czarna patelnia na kuchence gazowej widziana przez białe okienko kuchenne",
    "adsetOrigin": "Rady babičky Danuše · Antek #2",
    "adOrigin": "Top #16 (5 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-17",
    "url": "/titano-cz-images/native_top17.png",
    "imageHash": "",
    "label": "Native Top #17 (57 805 Reach) · Przezroczysty plastikowy widelec z czerwonym dżemem na białej serwetce",
    "adsetOrigin": "Rady babičky Danuše · Antek #7",
    "adOrigin": "Top #17 (4 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-18",
    "url": "/titano-cz-images/native_top18.png",
    "imageHash": "",
    "label": "Native Top #18 (49 731 Reach) · Duży czarny kawałek złuszczonej powłoki na pustym talerzu obok widelca",
    "adsetOrigin": "Rady babičky Danuše · Antek #8",
    "adOrigin": "Top #18 (12 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-19",
    "url": "/titano-cz-images/native_top19.png",
    "imageHash": "",
    "label": "Native Top #19 (46 247 Reach) · Kostka masła topiąca się na patelni  a na blacie pusty talerz i kajzerka",
    "adsetOrigin": "Rady babičky Danuše · Antek #5",
    "adOrigin": "Top #19 (4 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-20",
    "url": "/titano-cz-images/native_top20.png",
    "imageHash": "",
    "label": "Native Top #20 (44 218 Reach) · Kostka masła pieniąca się na starej patelni na kuchence gazowej",
    "adsetOrigin": "Rady babičky Danuše · Antek #2",
    "adOrigin": "Top #20 (4 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-21",
    "url": "/titano-cz-images/native_top21.png",
    "imageHash": "",
    "label": "Native Top #21 (43 030 Reach) · Roztopione masło z pianą na patelni  wytłaczanka z jajkami i bloki za oknem",
    "adsetOrigin": "Rady babičky Danuše · Antek #6",
    "adOrigin": "Top #21 (8 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-22",
    "url": "/titano-cz-images/native_top22.png",
    "imageHash": "",
    "label": "Native Top #22 (42 403 Reach) · Kotlet z ziemniakami i mizerią na drewnianym stole widziany z kuchni",
    "adsetOrigin": "Rady babičky Danuše · Antek #2",
    "adOrigin": "Top #22 (2 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-23",
    "url": "/titano-cz-images/native_top23.png",
    "imageHash": "",
    "label": "Native Top #23 (41 372 Reach) · Otwarta tekturowa wytłaczanka z brązowymi jajkami na blacie przy oknie",
    "adsetOrigin": "Rady babičky Danuše · Antek #4",
    "adOrigin": "Top #23 (3 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-24",
    "url": "/titano-cz-images/native_top24.png",
    "imageHash": "",
    "label": "Native Top #24 (40 700 Reach) · Kotlet schabowy z ziemniakami z koperkiem i mizerią na świątecznym obrusie",
    "adsetOrigin": "Rady babičky Danuše · Antek #1",
    "adOrigin": "Top #24 (8 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-25",
    "url": "/titano-cz-images/native_top25.png",
    "imageHash": "",
    "label": "Native Top #25 (40 047 Reach) · Czarny płatek i drobinki teflonu na dnie białej miseczki",
    "adsetOrigin": "Rady babičky Danuše · Antek #7",
    "adOrigin": "Top #25 (4 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-26",
    "url": "/titano-cz-images/native_top26.png",
    "imageHash": "",
    "label": "Native Top #26 (39 076 Reach) · Żółte wymiociny kota na białych kafelkach obok białej miseczki przy ścianie",
    "adsetOrigin": "Rady babičky Danuše · Antek #7",
    "adOrigin": "Top #26 (3 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-27",
    "url": "/titano-cz-images/native_top27.png",
    "imageHash": "",
    "label": "Native Top #27 (38 988 Reach) · Szkolny zeszyt w linie z ołówkiem i czeskim napisem „titanová” (1:1 z „tytanowa”)",
    "adsetOrigin": "Rady babičky Danuše · Antek #8",
    "adOrigin": "Top #27 (8 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-28",
    "url": "/titano-cz-images/native_top28.png",
    "imageHash": "",
    "label": "Native Top #28 (29 944 Reach) · Zrumienione masło na patelni na płycie indukcyjnej obok noża",
    "adsetOrigin": "Rady babičky Danuše · Antek #2",
    "adOrigin": "Top #28 (4 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-29",
    "url": "/titano-cz-images/native_top29.png",
    "imageHash": "",
    "label": "Native Top #29 (27 160 Reach) · Mocno porysowana czarna patelnia teflonowa na ruszcie kuchenki gazowej",
    "adsetOrigin": "Rady babičky Danuše · Antek #4",
    "adOrigin": "Top #29 (4 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-30",
    "url": "/titano-cz-images/native_top30.png",
    "imageHash": "",
    "label": "Native Top #30 (26 995 Reach) · Parujący kotlet schabowy z młodymi ziemniakami i surówką na stole",
    "adsetOrigin": "Rady babičky Danuše · Antek #3",
    "adOrigin": "Top #30 (4 ads)",
    "aspectRatio": "1:1",
    "source": "meta"
  },
  {
    "id": "native-top-73-cs",
    "url": "/titano-cz-images/native_top73.png",
    "imageHash": "",
    "label": "Native #73 (CZ 1:1) · Zeszyt z napisem piórem „titanová” (Wariant B do Antka #8)",
    "adsetOrigin": "Rady babičky Danuše · Antek #8",
    "adOrigin": "Native #73 (titanová)",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "native-top-78-cs",
    "url": "/titano-cz-images/native_top78.png",
    "imageHash": "",
    "label": "Native #78 (CZ 1:1) · Zeszyt z napisem ołówkiem „titanová” (Wariant C do Antka #8)",
    "adsetOrigin": "Rady babičky Danuše · Antek #8",
    "adOrigin": "Native #78 (titanová)",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-01",
    "url": "/titano-cz-images/titano_static_top01_cs.jpg",
    "imageHash": "",
    "label": "Brand Static T#01 (66 767 Reach) · POSLEDNÍ ŠANCE! / 2+1 ZDARMA AKCE / NABÍDKA KONČÍ DNES!",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#01",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-02",
    "url": "/titano-cz-images/titano_static_top02_cs.jpg",
    "imageHash": "",
    "label": "Brand Static T#02 (47 937 Reach) · Bez chemie / Doživotní záruka / 30 dní na vyzkoušení / Cena 1 749 Kč. Pouze dnes.",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#02",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-03",
    "url": "/titano-cz-images/titano_static_top03_cs.png",
    "imageHash": "",
    "label": "Brand Static T#03 (47 007 Reach) · Czysty packshot patelni na szarym tle studyjnym (0 tekstu)",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#03",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-04",
    "url": "/titano-cz-images/titano_static_top04_cs.png",
    "imageHash": "",
    "label": "Brand Static T#04 (46 184 Reach) · Czysty packshot patelni na marmurowym blacie przy zlewie (0 tekstu)",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#04",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-05",
    "url": "/titano-cz-images/titano_static_top05_cs.jpg",
    "imageHash": "",
    "label": "Brand Static T#05 (37 983 Reach) · poslední hodiny / VÝPRODEJ MĚSÍCE POVĚDOMÍ O PFAS / Zbývá jen 6 kusů",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#05",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-06",
    "url": "/titano-cz-images/titano_static_top06_cs.jpg",
    "imageHash": "",
    "label": "Brand Static T#06 (37 958 Reach) · NAŠE AKCE MĚSÍCE NA VAŘENÍ ZAČÍNÁ PRÁVĚ TEĎ! / SLEVA 70 % POUZE DNES",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#06",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-07",
    "url": "/titano-cz-images/titano_static_top07_cs.jpg",
    "imageHash": "",
    "label": "Brand Static T#07 (34 121 Reach) · KRABICE POMAČKANÉ PŘI PŘEPRAVĚ. / PÁNVE – BEZ JEDINÉ VADY. / SLEVA AŽ 60 %",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#07",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-08",
    "url": "/titano-cz-images/titano_static_top08_cs.jpg",
    "imageHash": "",
    "label": "Brand Static T#08 (32 830 Reach) · Poslední pánev  kterou si koupíte. / DŮVĚŘUJE NÁM PŘES 47 000 SPOKOJENÝCH ZÁKAZNÍKŮ",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#08",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-09",
    "url": "/titano-cz-images/titano_static_top09_cs.jpg",
    "imageHash": "",
    "label": "Brand Static T#09 (31 264 Reach) · 9999 / RYZÍ / ZLATO / 1 KILO (sztabka złota na patelni)",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#09",
    "aspectRatio": "1:1",
    "source": "ai"
  },
  {
    "id": "brand-static-10",
    "url": "/titano-cz-images/titano_static_top10_cs.png",
    "imageHash": "",
    "label": "Brand Static T#10 (20 572 Reach) · Zbliżenie na strukturę kutego tytanu SlipScale (0 tekstu)",
    "adsetOrigin": "Titano Česko · Brand Static",
    "adOrigin": "Static T#10",
    "aspectRatio": "1:1",
    "source": "ai"
  }
];

export const TITANO_CZ_PRESET_ANGLES: TitanoCzAnglePreset[] = [
  {
    "id": "titano-cz-story-01-top01",
    "number": 1,
    "code": "ANTEK-01",
    "title": "[ANTEK #1 · Antek #1 · Lukáš & Řízek (Chłopak córki odłożył widelec)] Přítel mojí dcery přestal v sobotu jíst hned po prvním soustu řízku a tiše položil vidličku vedle talíře.",
    "shortTitle": "🔥 Antek #1 · Lukáš & Řízek (Chłopak córki odłożył widelec) (Top #01 · 662 258 Reach)",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Główna Historia #1/8 · Top #01 (662 258 EU Reach)",
    "problemCluster": "ANGLE_1_LUKAS_RIZEK",
    "problemLabel": "Antek #1 · Lukáš & Řízek (Chłopak córki odłożył widelec)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Přítel mojí dcery přestal v sobotu jíst hned po prvním soustu řízku a tiše položil vidličku vedle talíře.",
    "mechanismCore": "Danuše (55 l., Praha – Vinohrady, vedoucí lékárny Dr.Max), mąż Marek, córka Eliška, Lukáš (programátor Alza.cz) | Foto Top #01: Nadgryziony kawałek kotleta i czarna drobinka teflonu na białym talerzu",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-01",
    "defaultImageUrl": "/titano-cz-images/native_top01.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 1,
    "top30Rank": 1,
    "euReach": 662258
  },
  {
    "id": "titano-cz-story-02-top14",
    "number": 2,
    "code": "ANTEK-02",
    "title": "[ANTEK #2 · Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)] Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "shortTitle": "🔥 Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy) (Top #14 · 75 498 Reach)",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Główna Historia #2/8 · Top #14 (75 498 EU Reach)",
    "problemCluster": "ANGLE_2_JIRKA_VAJICKA",
    "problemLabel": "Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "mechanismCore": "Danuše (61 l., Brno – Žabovřesky), mąż Jirka (strojvůdce ČD), córka Agáta (zubařka – implantáty), MUDr. Pospíšil | Foto Top #14: Rozlana żółta masa jajeczna z pianą na kafelkach obok metalowej miski",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-14",
    "defaultImageUrl": "/titano-cz-images/native_top14.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 2,
    "top30Rank": 14,
    "euReach": 75498
  },
  {
    "id": "titano-cz-story-03-top02",
    "number": 3,
    "code": "ANTEK-03",
    "title": "[ANTEK #3 · Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)] Kubík u mě v září přestal jíst řízky. Řekl, že ho z nich škrábe v krku.",
    "shortTitle": "🔥 Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety) (Top #02 · 387 140 Reach)",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Główna Historia #3/8 · Top #02 (387 140 EU Reach)",
    "problemCluster": "ANGLE_3_KUBIK_KRK",
    "problemLabel": "Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Kubík u mě v září přestal jíst řízky. Řekl, že ho z nich škrábe v krku.",
    "mechanismCore": "Danuše (66 l., Praha – Dejvice), mąż Vláďa, córka Marta & Petr (řidič DPP), wnuk Kubík (5 l., FN Motol) | Foto Top #02: Jajecznica na białym talerzu z dużym czarnym płatkiem teflonu pośrodku",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-02",
    "defaultImageUrl": "/titano-cz-images/native_top02.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 3,
    "top30Rank": 2,
    "euReach": 387140
  },
  {
    "id": "titano-cz-story-04-top11",
    "number": 4,
    "code": "ANTEK-04",
    "title": "[ANTEK #4 · Antek #4 · 8 minut nad pánví & Synlab (Badanie krwi PFAS 2 850 Kč)] V neděli ráno jsem nedokázala usmažit míchaná vajíčka, i když jsem nad pánví stála 8 minut.",
    "shortTitle": "🔥 Antek #4 · 8 minut nad pánví & Synlab (Badanie krwi PFAS 2 850 Kč) (Top #11 · 113 221 Reach)",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Główna Historia #4/8 · Top #11 (113 221 EU Reach)",
    "problemCluster": "ANGLE_4_SYNLAB_8MIN",
    "problemLabel": "Antek #4 · 8 minut nad pánví & Synlab (Badanie krwi PFAS 2 850 Kč)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "V neděli ráno jsem nedokázala usmažit míchaná vajíčka, i když jsem nad pánví stála 8 minut.",
    "mechanismCore": "Danuše (62 l., Hradec Králové), MUDr. Anna Malá, laboratorium Synlab (PFOS/PFOA), Zásilkovna Z-BOX | Foto Top #11: Czarny płatek teflonu na opuszku palca nad czarną patelnią",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-11",
    "defaultImageUrl": "/titano-cz-images/native_top11.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 4,
    "top30Rank": 11,
    "euReach": 113221
  },
  {
    "id": "titano-cz-story-05-top08",
    "number": 5,
    "code": "ANTEK-05",
    "title": "[ANTEK #5 · Antek #5 · Magda z onkologie & Pára (Córka z onkologii w Brnie)] Nemohla jsem udělat ani krok od sporáku, i když mi pára z řízku šla do tváře. Magda řekla tiše: mami, promiň, já tohle nesním.",
    "shortTitle": "🔥 Antek #5 · Magda z onkologie & Pára (Córka z onkologii w Brnie) (Top #08 · 148 144 Reach)",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Główna Historia #5/8 · Top #08 (148 144 EU Reach)",
    "problemCluster": "ANGLE_5_MAGDA_ONKOLOGIE",
    "problemLabel": "Antek #5 · Magda z onkologie & Pára (Córka z onkologii w Brnie)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Nemohla jsem udělat ani krok od sporáku, i když mi pára z řízku šla do tváře. Magda řekla tiše: mami, promiň, já tohle nesním.",
    "mechanismCore": "Danuše (64 l., Ostrava – Poruba), mąż Zdeněk, córka Magda (nutriční terapeutka, Masarykův onkologický ústav) | Foto Top #08: Pusta, porysowana czarna patelnia teflonowa na palniku gazowym",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-08",
    "defaultImageUrl": "/titano-cz-images/native_top08.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 5,
    "top30Rank": 8,
    "euReach": 148144
  },
  {
    "id": "titano-cz-story-06-top21",
    "number": 6,
    "code": "ANTEK-06",
    "title": "[ANTEK #6 · Antek #6 · Kočka Míša 11 let (Kotka przestała mruczeć)] Míša mi po večeři přestala vrnět na klíně, i když tam takhle sedávala každý den 11 let.",
    "shortTitle": "🔥 Antek #6 · Kočka Míša 11 let (Kotka przestała mruczeć) (Top #21 · 43 030 Reach)",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Główna Historia #6/8 · Top #21 (43 030 EU Reach)",
    "problemCluster": "ANGLE_6_KOCKA_MISA",
    "problemLabel": "Antek #6 · Kočka Míša 11 let (Kotka przestała mruczeć)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Míša mi po večeři přestala vrnět na klíně, i když tam takhle sedávala každý den 11 let.",
    "mechanismCore": "Danuše (64 l., Plzeň – Lochotín, nauczycielka czeskiego), kotka rosyjska niebieska Míša, MVDr. Svoboda & MVDr. Kovařík | Foto Top #21: Roztopione masło z pianą na patelni, wytłaczanka z jajkami i bloki za oknem",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-21",
    "defaultImageUrl": "/titano-cz-images/native_top21.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 6,
    "top30Rank": 21,
    "euReach": 43030
  },
  {
    "id": "titano-cz-story-07-top07",
    "number": 7,
    "code": "ANTEK-07",
    "title": "[ANTEK #7 · Antek #7 · Toník & Džem z prstíku (Ukraińska studentka pediatrii Iryna)] Toník si po snídani přestal olizovat džem z prstíku. Dřív si olizoval každý prst zvlášť.",
    "shortTitle": "🔥 Antek #7 · Toník & Džem z prstíku (Ukraińska studentka pediatrii Iryna) (Top #07 · 190 625 Reach)",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Główna Historia #7/8 · Top #07 (190 625 EU Reach)",
    "problemCluster": "ANGLE_7_TONIK_DZEM",
    "problemLabel": "Antek #7 · Toník & Džem z prstíku (Ukraińska studentka pediatrii Iryna)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Toník si po snídani přestal olizovat džem z prstíku. Dřív si olizoval každý prst zvlášť.",
    "mechanismCore": "Danuše (66 l., České Budějovice, 40 lat oddziałowa), wnuk Toník (3 l.), niania Iryna ze Lwowa | Foto Top #07: Kotlet schabowy z ziemniakami i surówką z kapusty na talerzu w kwiatki",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-07",
    "defaultImageUrl": "/titano-cz-images/native_top07.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 7,
    "top30Rank": 7,
    "euReach": 190625
  },
  {
    "id": "titano-cz-story-08-top27",
    "number": 8,
    "code": "ANTEK-08",
    "title": "[ANTEK #8 · Antek #8 · Tonda & Sešit 13 otázek („titanová” w zeszycie wnuka)] Tonda, můj vnuk, v sobotu uprostřed věty v mém obýváku přestal psát.",
    "shortTitle": "🔥 Antek #8 · Tonda & Sešit 13 otázek („titanová” w zeszycie wnuka) (Top #27 · 38 988 Reach)",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Główna Historia #8/8 · Top #27 (38 988 EU Reach)",
    "problemCluster": "ANGLE_8_TONDA_SESIT",
    "problemLabel": "Antek #8 · Tonda & Sešit 13 otázek („titanová” w zeszycie wnuka)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Tonda, můj vnuk, v sobotu uprostřed věty v mém obýváku přestal psát.",
    "mechanismCore": "Danuše (68 l., Hradec Králové, bibliotekarka szkolna), wnuk Tonda (10 l., 4.A), paní učitelka Boženka | Foto Top #27: Szkolny zeszyt w linie z ołówkiem i czeskim napisem „titanová” (1:1 z „tytanowa”)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-27",
    "defaultImageUrl": "/titano-cz-images/native_top27.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 8,
    "top30Rank": 27,
    "euReach": 38988
  },
  {
    "id": "titano-cz-top03-story3",
    "number": 9,
    "code": "TOP-03",
    "title": "[Top #03 Reach: 304 358 · Antek #3] Zbliżenie na czarny płatek teflonu na białym ręczniku papierowym — Kubík u mě v září přestal jíst řízky. Řekl  že ho z nich škrábe v krku.",
    "shortTitle": "📸 Top #03 (304 358 Reach) · Antek #3: Zbliżenie na czarny płatek teflonu na biał...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #03/30 · 304 358 EU Reach (19 reklam)",
    "problemCluster": "ANGLE_3_KUBIK_KRK",
    "problemLabel": "Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Kubík u mě v září přestal jíst řízky. Řekl, že ho z nich škrábe v krku.",
    "mechanismCore": "Foto Top #03: Zbliżenie na czarny płatek teflonu na białym ręczniku papierowym | Przypisany: Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-03",
    "defaultImageUrl": "/titano-cz-images/native_top03.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 3,
    "top30Rank": 3,
    "euReach": 304358
  },
  {
    "id": "titano-cz-top04-story3",
    "number": 10,
    "code": "TOP-04",
    "title": "[Top #04 Reach: 284 485 · Antek #3] Jajecznica na białym talerzu z czarną drobinką teflonu z prawej strony — Kubík u mě v září přestal jíst řízky. Řekl  že ho z nich škrábe v krku.",
    "shortTitle": "📸 Top #04 (284 485 Reach) · Antek #3: Jajecznica na białym talerzu z czarną drob...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #04/30 · 284 485 EU Reach (14 reklam)",
    "problemCluster": "ANGLE_3_KUBIK_KRK",
    "problemLabel": "Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Kubík u mě v září přestal jíst řízky. Řekl, že ho z nich škrábe v krku.",
    "mechanismCore": "Foto Top #04: Jajecznica na białym talerzu z czarną drobinką teflonu z prawej strony | Przypisany: Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-04",
    "defaultImageUrl": "/titano-cz-images/native_top04.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 3,
    "top30Rank": 4,
    "euReach": 284485
  },
  {
    "id": "titano-cz-top05-story1",
    "number": 11,
    "code": "TOP-05",
    "title": "[Top #05 Reach: 213 934 · Antek #1] Zgnieciona chusteczka papierowa z czerwonym śladem na drewnianym blacie — Přítel mojí dcery přestal v sobotu jíst hned po prvním soustu řízku a tiše položil vidličku vedle talíře.",
    "shortTitle": "📸 Top #05 (213 934 Reach) · Antek #1: Zgnieciona chusteczka papierowa z czerwony...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #05/30 · 213 934 EU Reach (16 reklam)",
    "problemCluster": "ANGLE_1_LUKAS_RIZEK",
    "problemLabel": "Antek #1 · Lukáš & Řízek (Chłopak córki odłożył widelec)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Přítel mojí dcery přestal v sobotu jíst hned po prvním soustu řízku a tiše položil vidličku vedle talíře.",
    "mechanismCore": "Foto Top #05: Zgnieciona chusteczka papierowa z czerwonym śladem na drewnianym blacie | Przypisany: Antek #1 · Lukáš & Řízek (Chłopak córki odłożył widelec)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-05",
    "defaultImageUrl": "/titano-cz-images/native_top05.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 1,
    "top30Rank": 5,
    "euReach": 213934
  },
  {
    "id": "titano-cz-top06-story1",
    "number": 12,
    "code": "TOP-06",
    "title": "[Top #06 Reach: 192 451 · Antek #1] Czarne okulary leżące na pudełku od patelni teflonowej na stole — Přítel mojí dcery přestal v sobotu jíst hned po prvním soustu řízku a tiše položil vidličku vedle talíře.",
    "shortTitle": "📸 Top #06 (192 451 Reach) · Antek #1: Czarne okulary leżące na pudełku od pateln...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #06/30 · 192 451 EU Reach (15 reklam)",
    "problemCluster": "ANGLE_1_LUKAS_RIZEK",
    "problemLabel": "Antek #1 · Lukáš & Řízek (Chłopak córki odłożył widelec)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Přítel mojí dcery přestal v sobotu jíst hned po prvním soustu řízku a tiše položil vidličku vedle talíře.",
    "mechanismCore": "Foto Top #06: Czarne okulary leżące na pudełku od patelni teflonowej na stole | Przypisany: Antek #1 · Lukáš & Řízek (Chłopak córki odłożył widelec)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-06",
    "defaultImageUrl": "/titano-cz-images/native_top06.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 1,
    "top30Rank": 6,
    "euReach": 192451
  },
  {
    "id": "titano-cz-top09-story8",
    "number": 13,
    "code": "TOP-09",
    "title": "[Top #09 Reach: 138 167 · Antek #8] Przypalony stalowy rondel i czarna patelnia teflonowa obok siebie na kuchence — Tonda  můj vnuk  v sobotu uprostřed věty v mém obýváku přestal psát.",
    "shortTitle": "📸 Top #09 (138 167 Reach) · Antek #8: Przypalony stalowy rondel i czarna patelni...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #09/30 · 138 167 EU Reach (13 reklam)",
    "problemCluster": "ANGLE_8_TONDA_SESIT",
    "problemLabel": "Antek #8 · Tonda & Sešit 13 otázek („titanová” w zeszycie wnuka)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Tonda, můj vnuk, v sobotu uprostřed věty v mém obýváku přestal psát.",
    "mechanismCore": "Foto Top #09: Przypalony stalowy rondel i czarna patelnia teflonowa obok siebie na kuchence | Przypisany: Antek #8 · Tonda & Sešit 13 otázek („titanová” w zeszycie wnuka)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-09",
    "defaultImageUrl": "/titano-cz-images/native_top09.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 8,
    "top30Rank": 9,
    "euReach": 138167
  },
  {
    "id": "titano-cz-top10-story5",
    "number": 14,
    "code": "TOP-10",
    "title": "[Top #10 Reach: 124 060 · Antek #5] Jajecznica na białym talerzu z czarnym płatkiem teflonu pośrodku — Nemohla jsem udělat ani krok od sporáku  i když mi pára z řízku šla do tváře. Magda řekla tiše: mami  promiň  já tohle nesním.",
    "shortTitle": "📸 Top #10 (124 060 Reach) · Antek #5: Jajecznica na białym talerzu z czarnym pła...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #10/30 · 124 060 EU Reach (8 reklam)",
    "problemCluster": "ANGLE_5_MAGDA_ONKOLOGIE",
    "problemLabel": "Antek #5 · Magda z onkologie & Pára (Córka z onkologii w Brnie)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Nemohla jsem udělat ani krok od sporáku, i když mi pára z řízku šla do tváře. Magda řekla tiše: mami, promiň, já tohle nesním.",
    "mechanismCore": "Foto Top #10: Jajecznica na białym talerzu z czarnym płatkiem teflonu pośrodku | Przypisany: Antek #5 · Magda z onkologie & Pára (Córka z onkologii w Brnie)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-10",
    "defaultImageUrl": "/titano-cz-images/native_top10.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 5,
    "top30Rank": 10,
    "euReach": 124060
  },
  {
    "id": "titano-cz-top12-story3",
    "number": 15,
    "code": "TOP-12",
    "title": "[Top #12 Reach: 83 395 · Antek #3] Jajecznica z kromką chleba razowego na białym talerzu — Kubík u mě v září přestal jíst řízky. Řekl  že ho z nich škrábe v krku.",
    "shortTitle": "📸 Top #12 (83 395 Reach) · Antek #3: Jajecznica z kromką chleba razowego na bia...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #12/30 · 83 395 EU Reach (8 reklam)",
    "problemCluster": "ANGLE_3_KUBIK_KRK",
    "problemLabel": "Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Kubík u mě v září přestal jíst řízky. Řekl, že ho z nich škrábe v krku.",
    "mechanismCore": "Foto Top #12: Jajecznica z kromką chleba razowego na białym talerzu | Przypisany: Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-12",
    "defaultImageUrl": "/titano-cz-images/native_top12.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 3,
    "top30Rank": 12,
    "euReach": 83395
  },
  {
    "id": "titano-cz-top13-story4",
    "number": 16,
    "code": "TOP-13",
    "title": "[Top #13 Reach: 75 937 · Antek #4] Jajecznica na patelni z dużą zdartą łatą powłoki teflonowej na dnie — V neděli ráno jsem nedokázala usmažit míchaná vajíčka  i když jsem nad pánví stála 8 minut.",
    "shortTitle": "📸 Top #13 (75 937 Reach) · Antek #4: Jajecznica na patelni z dużą zdartą łatą p...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #13/30 · 75 937 EU Reach (9 reklam)",
    "problemCluster": "ANGLE_4_SYNLAB_8MIN",
    "problemLabel": "Antek #4 · 8 minut nad pánví & Synlab (Badanie krwi PFAS 2 850 Kč)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "V neděli ráno jsem nedokázala usmažit míchaná vajíčka, i když jsem nad pánví stála 8 minut.",
    "mechanismCore": "Foto Top #13: Jajecznica na patelni z dużą zdartą łatą powłoki teflonowej na dnie | Przypisany: Antek #4 · 8 minut nad pánví & Synlab (Badanie krwi PFAS 2 850 Kč)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-13",
    "defaultImageUrl": "/titano-cz-images/native_top13.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 4,
    "top30Rank": 13,
    "euReach": 75937
  },
  {
    "id": "titano-cz-top15-story5",
    "number": 17,
    "code": "TOP-15",
    "title": "[Top #15 Reach: 67 620 · Antek #5] Jajecznica na białym talerzu z widelcem po prawej stronie — Nemohla jsem udělat ani krok od sporáku  i když mi pára z řízku šla do tváře. Magda řekla tiše: mami  promiň  já tohle nesním.",
    "shortTitle": "📸 Top #15 (67 620 Reach) · Antek #5: Jajecznica na białym talerzu z widelcem po...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #15/30 · 67 620 EU Reach (10 reklam)",
    "problemCluster": "ANGLE_5_MAGDA_ONKOLOGIE",
    "problemLabel": "Antek #5 · Magda z onkologie & Pára (Córka z onkologii w Brnie)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Nemohla jsem udělat ani krok od sporáku, i když mi pára z řízku šla do tváře. Magda řekla tiše: mami, promiň, já tohle nesním.",
    "mechanismCore": "Foto Top #15: Jajecznica na białym talerzu z widelcem po prawej stronie | Przypisany: Antek #5 · Magda z onkologie & Pára (Córka z onkologii w Brnie)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-15",
    "defaultImageUrl": "/titano-cz-images/native_top15.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 5,
    "top30Rank": 15,
    "euReach": 67620
  },
  {
    "id": "titano-cz-top16-story2",
    "number": 18,
    "code": "TOP-16",
    "title": "[Top #16 Reach: 60 992 · Antek #2] Czarna patelnia na kuchence gazowej widziana przez białe okienko kuchenne — Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "shortTitle": "📸 Top #16 (60 992 Reach) · Antek #2: Czarna patelnia na kuchence gazowej widzia...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #16/30 · 60 992 EU Reach (5 reklam)",
    "problemCluster": "ANGLE_2_JIRKA_VAJICKA",
    "problemLabel": "Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "mechanismCore": "Foto Top #16: Czarna patelnia na kuchence gazowej widziana przez białe okienko kuchenne | Przypisany: Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-16",
    "defaultImageUrl": "/titano-cz-images/native_top16.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 2,
    "top30Rank": 16,
    "euReach": 60992
  },
  {
    "id": "titano-cz-top17-story7",
    "number": 19,
    "code": "TOP-17",
    "title": "[Top #17 Reach: 57 805 · Antek #7] Przezroczysty plastikowy widelec z czerwonym dżemem na białej serwetce — Toník si po snídani přestal olizovat džem z prstíku. Dřív si olizoval každý prst zvlášť.",
    "shortTitle": "📸 Top #17 (57 805 Reach) · Antek #7: Przezroczysty plastikowy widelec z czerwon...",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #17/30 · 57 805 EU Reach (4 reklam)",
    "problemCluster": "ANGLE_7_TONIK_DZEM",
    "problemLabel": "Antek #7 · Toník & Džem z prstíku (Ukraińska studentka pediatrii Iryna)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Toník si po snídani přestal olizovat džem z prstíku. Dřív si olizoval každý prst zvlášť.",
    "mechanismCore": "Foto Top #17: Przezroczysty plastikowy widelec z czerwonym dżemem na białej serwetce | Przypisany: Antek #7 · Toník & Džem z prstíku (Ukraińska studentka pediatrii Iryna)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-17",
    "defaultImageUrl": "/titano-cz-images/native_top17.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 7,
    "top30Rank": 17,
    "euReach": 57805
  },
  {
    "id": "titano-cz-top18-story8",
    "number": 20,
    "code": "TOP-18",
    "title": "[Top #18 Reach: 49 731 · Antek #8] Duży czarny kawałek złuszczonej powłoki na pustym talerzu obok widelca — Tonda  můj vnuk  v sobotu uprostřed věty v mém obýváku přestal psát.",
    "shortTitle": "📸 Top #18 (49 731 Reach) · Antek #8: Duży czarny kawałek złuszczonej powłoki na...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #18/30 · 49 731 EU Reach (12 reklam)",
    "problemCluster": "ANGLE_8_TONDA_SESIT",
    "problemLabel": "Antek #8 · Tonda & Sešit 13 otázek („titanová” w zeszycie wnuka)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Tonda, můj vnuk, v sobotu uprostřed věty v mém obýváku přestal psát.",
    "mechanismCore": "Foto Top #18: Duży czarny kawałek złuszczonej powłoki na pustym talerzu obok widelca | Przypisany: Antek #8 · Tonda & Sešit 13 otázek („titanová” w zeszycie wnuka)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-18",
    "defaultImageUrl": "/titano-cz-images/native_top18.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 8,
    "top30Rank": 18,
    "euReach": 49731
  },
  {
    "id": "titano-cz-top19-story5",
    "number": 21,
    "code": "TOP-19",
    "title": "[Top #19 Reach: 46 247 · Antek #5] Kostka masła topiąca się na patelni  a na blacie pusty talerz i kajzerka — Nemohla jsem udělat ani krok od sporáku  i když mi pára z řízku šla do tváře. Magda řekla tiše: mami  promiň  já tohle nesním.",
    "shortTitle": "📸 Top #19 (46 247 Reach) · Antek #5: Kostka masła topiąca się na patelni  a na ...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #19/30 · 46 247 EU Reach (4 reklam)",
    "problemCluster": "ANGLE_5_MAGDA_ONKOLOGIE",
    "problemLabel": "Antek #5 · Magda z onkologie & Pára (Córka z onkologii w Brnie)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Nemohla jsem udělat ani krok od sporáku, i když mi pára z řízku šla do tváře. Magda řekla tiše: mami, promiň, já tohle nesním.",
    "mechanismCore": "Foto Top #19: Kostka masła topiąca się na patelni, a na blacie pusty talerz i kajzerka | Przypisany: Antek #5 · Magda z onkologie & Pára (Córka z onkologii w Brnie)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-19",
    "defaultImageUrl": "/titano-cz-images/native_top19.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 5,
    "top30Rank": 19,
    "euReach": 46247
  },
  {
    "id": "titano-cz-top20-story2",
    "number": 22,
    "code": "TOP-20",
    "title": "[Top #20 Reach: 44 218 · Antek #2] Kostka masła pieniąca się na starej patelni na kuchence gazowej — Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "shortTitle": "📸 Top #20 (44 218 Reach) · Antek #2: Kostka masła pieniąca się na starej pateln...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #20/30 · 44 218 EU Reach (4 reklam)",
    "problemCluster": "ANGLE_2_JIRKA_VAJICKA",
    "problemLabel": "Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "mechanismCore": "Foto Top #20: Kostka masła pieniąca się na starej patelni na kuchence gazowej | Przypisany: Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-20",
    "defaultImageUrl": "/titano-cz-images/native_top20.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 2,
    "top30Rank": 20,
    "euReach": 44218
  },
  {
    "id": "titano-cz-top22-story2",
    "number": 23,
    "code": "TOP-22",
    "title": "[Top #22 Reach: 42 403 · Antek #2] Kotlet z ziemniakami i mizerią na drewnianym stole widziany z kuchni — Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "shortTitle": "📸 Top #22 (42 403 Reach) · Antek #2: Kotlet z ziemniakami i mizerią na drewnian...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #22/30 · 42 403 EU Reach (2 reklam)",
    "problemCluster": "ANGLE_2_JIRKA_VAJICKA",
    "problemLabel": "Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "mechanismCore": "Foto Top #22: Kotlet z ziemniakami i mizerią na drewnianym stole widziany z kuchni | Przypisany: Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-22",
    "defaultImageUrl": "/titano-cz-images/native_top22.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 2,
    "top30Rank": 22,
    "euReach": 42403
  },
  {
    "id": "titano-cz-top23-story4",
    "number": 24,
    "code": "TOP-23",
    "title": "[Top #23 Reach: 41 372 · Antek #4] Otwarta tekturowa wytłaczanka z brązowymi jajkami na blacie przy oknie — V neděli ráno jsem nedokázala usmažit míchaná vajíčka  i když jsem nad pánví stála 8 minut.",
    "shortTitle": "📸 Top #23 (41 372 Reach) · Antek #4: Otwarta tekturowa wytłaczanka z brązowymi ...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #23/30 · 41 372 EU Reach (3 reklam)",
    "problemCluster": "ANGLE_4_SYNLAB_8MIN",
    "problemLabel": "Antek #4 · 8 minut nad pánví & Synlab (Badanie krwi PFAS 2 850 Kč)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "V neděli ráno jsem nedokázala usmažit míchaná vajíčka, i když jsem nad pánví stála 8 minut.",
    "mechanismCore": "Foto Top #23: Otwarta tekturowa wytłaczanka z brązowymi jajkami na blacie przy oknie | Przypisany: Antek #4 · 8 minut nad pánví & Synlab (Badanie krwi PFAS 2 850 Kč)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-23",
    "defaultImageUrl": "/titano-cz-images/native_top23.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 4,
    "top30Rank": 23,
    "euReach": 41372
  },
  {
    "id": "titano-cz-top24-story1",
    "number": 25,
    "code": "TOP-24",
    "title": "[Top #24 Reach: 40 700 · Antek #1] Kotlet schabowy z ziemniakami z koperkiem i mizerią na świątecznym obrusie — Přítel mojí dcery přestal v sobotu jíst hned po prvním soustu řízku a tiše položil vidličku vedle talíře.",
    "shortTitle": "📸 Top #24 (40 700 Reach) · Antek #1: Kotlet schabowy z ziemniakami z koperkiem ...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #24/30 · 40 700 EU Reach (8 reklam)",
    "problemCluster": "ANGLE_1_LUKAS_RIZEK",
    "problemLabel": "Antek #1 · Lukáš & Řízek (Chłopak córki odłożył widelec)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Přítel mojí dcery přestal v sobotu jíst hned po prvním soustu řízku a tiše položil vidličku vedle talíře.",
    "mechanismCore": "Foto Top #24: Kotlet schabowy z ziemniakami z koperkiem i mizerią na świątecznym obrusie | Przypisany: Antek #1 · Lukáš & Řízek (Chłopak córki odłożył widelec)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-24",
    "defaultImageUrl": "/titano-cz-images/native_top24.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 1,
    "top30Rank": 24,
    "euReach": 40700
  },
  {
    "id": "titano-cz-top25-story7",
    "number": 26,
    "code": "TOP-25",
    "title": "[Top #25 Reach: 40 047 · Antek #7] Czarny płatek i drobinki teflonu na dnie białej miseczki — Toník si po snídani přestal olizovat džem z prstíku. Dřív si olizoval každý prst zvlášť.",
    "shortTitle": "📸 Top #25 (40 047 Reach) · Antek #7: Czarny płatek i drobinki teflonu na dnie b...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #25/30 · 40 047 EU Reach (4 reklam)",
    "problemCluster": "ANGLE_7_TONIK_DZEM",
    "problemLabel": "Antek #7 · Toník & Džem z prstíku (Ukraińska studentka pediatrii Iryna)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Toník si po snídani přestal olizovat džem z prstíku. Dřív si olizoval každý prst zvlášť.",
    "mechanismCore": "Foto Top #25: Czarny płatek i drobinki teflonu na dnie białej miseczki | Przypisany: Antek #7 · Toník & Džem z prstíku (Ukraińska studentka pediatrii Iryna)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-25",
    "defaultImageUrl": "/titano-cz-images/native_top25.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 7,
    "top30Rank": 25,
    "euReach": 40047
  },
  {
    "id": "titano-cz-top26-story7",
    "number": 27,
    "code": "TOP-26",
    "title": "[Top #26 Reach: 39 076 · Antek #7] Żółte wymiociny kota na białych kafelkach obok białej miseczki przy ścianie — Toník si po snídani přestal olizovat džem z prstíku. Dřív si olizoval každý prst zvlášť.",
    "shortTitle": "📸 Top #26 (39 076 Reach) · Antek #7: Żółte wymiociny kota na białych kafelkach ...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #26/30 · 39 076 EU Reach (3 reklam)",
    "problemCluster": "ANGLE_7_TONIK_DZEM",
    "problemLabel": "Antek #7 · Toník & Džem z prstíku (Ukraińska studentka pediatrii Iryna)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Toník si po snídani přestal olizovat džem z prstíku. Dřív si olizoval každý prst zvlášť.",
    "mechanismCore": "Foto Top #26: Żółte wymiociny kota na białych kafelkach obok białej miseczki przy ścianie | Przypisany: Antek #7 · Toník & Džem z prstíku (Ukraińska studentka pediatrii Iryna)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-26",
    "defaultImageUrl": "/titano-cz-images/native_top26.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 7,
    "top30Rank": 26,
    "euReach": 39076
  },
  {
    "id": "titano-cz-top28-story2",
    "number": 28,
    "code": "TOP-28",
    "title": "[Top #28 Reach: 29 944 · Antek #2] Zrumienione masło na patelni na płycie indukcyjnej obok noża — Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "shortTitle": "📸 Top #28 (29 944 Reach) · Antek #2: Zrumienione masło na patelni na płycie ind...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #28/30 · 29 944 EU Reach (4 reklam)",
    "problemCluster": "ANGLE_2_JIRKA_VAJICKA",
    "problemLabel": "Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Jirka v neděli ráno odsunul míchaná vajíčka vidličkou a řekl tiše: tady něco je.",
    "mechanismCore": "Foto Top #28: Zrumienione masło na patelni na płycie indukcyjnej obok noża | Przypisany: Antek #2 · Jirka & Míchaná vajíčka (Czarny płatek w jajecznicy)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-28",
    "defaultImageUrl": "/titano-cz-images/native_top28.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 2,
    "top30Rank": 28,
    "euReach": 29944
  },
  {
    "id": "titano-cz-top29-story4",
    "number": 29,
    "code": "TOP-29",
    "title": "[Top #29 Reach: 27 160 · Antek #4] Mocno porysowana czarna patelnia teflonowa na ruszcie kuchenki gazowej — V neděli ráno jsem nedokázala usmažit míchaná vajíčka  i když jsem nad pánví stála 8 minut.",
    "shortTitle": "📸 Top #29 (27 160 Reach) · Antek #4: Mocno porysowana czarna patelnia teflonowa...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #29/30 · 27 160 EU Reach (4 reklam)",
    "problemCluster": "ANGLE_4_SYNLAB_8MIN",
    "problemLabel": "Antek #4 · 8 minut nad pánví & Synlab (Badanie krwi PFAS 2 850 Kč)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "V neděli ráno jsem nedokázala usmažit míchaná vajíčka, i když jsem nad pánví stála 8 minut.",
    "mechanismCore": "Foto Top #29: Mocno porysowana czarna patelnia teflonowa na ruszcie kuchenki gazowej | Przypisany: Antek #4 · 8 minut nad pánví & Synlab (Badanie krwi PFAS 2 850 Kč)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-29",
    "defaultImageUrl": "/titano-cz-images/native_top29.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 4,
    "top30Rank": 29,
    "euReach": 27160
  },
  {
    "id": "titano-cz-top30-story3",
    "number": 30,
    "code": "TOP-30",
    "title": "[Top #30 Reach: 26 995 · Antek #3] Parujący kotlet schabowy z młodymi ziemniakami i surówką na stole — Kubík u mě v září přestal jíst řízky. Řekl  že ho z nich škrábe v krku.",
    "shortTitle": "📸 Top #30 (26 995 Reach) · Antek #3: Parujący kotlet schabowy z młodymi ziemnia...",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Top Spender #30/30 · 26 995 EU Reach (4 reklam)",
    "problemCluster": "ANGLE_3_KUBIK_KRK",
    "problemLabel": "Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)",
    "recommendedFanpageId": "1338686329339342",
    "recommendedFanpageName": "Rady babičky Danuše",
    "vocTrigger": "Kubík u mě v září přestal jíst řízky. Řekl, že ho z nich škrábe v krku.",
    "mechanismCore": "Foto Top #30: Parujący kotlet schabowy z młodymi ziemniakami i surówką na stole | Przypisany: Antek #3 · Kubík & Škrábání v krku (5-letni wnuczek i kotlety)",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "native-top-30",
    "defaultImageUrl": "/titano-cz-images/native_top30.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 3,
    "top30Rank": 30,
    "euReach": 26995
  },
  {
    "id": "titano-cz-brand-static-01",
    "number": 31,
    "code": "STATIC-01",
    "title": "[Brand Static T#01 · 66 767 Reach] POSLEDNÍ ŠANCE! / 2+1 ZDARMA AKCE / NABÍDKA KONČÍ DNES!",
    "shortTitle": "🏷️ T#01 (66 767 Reach) · POSLEDNÍ ŠANCE! / 2+1 ZDARMA AKCE / NABÍDKA ",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#01 · 66 767 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "POSLEDNÍ ŠANCE! / 2+1 ZDARMA AKCE / NABÍDKA KONČÍ DNES!",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-01",
    "defaultImageUrl": "/titano-cz-images/titano_static_top01_cs.jpg",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 101,
    "top30Rank": 1,
    "euReach": 66767
  },
  {
    "id": "titano-cz-brand-static-02",
    "number": 32,
    "code": "STATIC-02",
    "title": "[Brand Static T#02 · 47 937 Reach] Bez chemie / Doživotní záruka / 30 dní na vyzkoušení / Cena 1 749 Kč. Pouze dnes.",
    "shortTitle": "🏷️ T#02 (47 937 Reach) · Bez chemie / Doživotní záruka / 30 dní na vy",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#02 · 47 937 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "Bez chemie / Doživotní záruka / 30 dní na vyzkoušení / Cena 1 749 Kč. Pouze dnes.",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-02",
    "defaultImageUrl": "/titano-cz-images/titano_static_top02_cs.jpg",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 101,
    "top30Rank": 2,
    "euReach": 47937
  },
  {
    "id": "titano-cz-brand-static-03",
    "number": 33,
    "code": "STATIC-03",
    "title": "[Brand Static T#03 · 47 007 Reach] Czysty packshot patelni na szarym tle studyjnym (0 tekstu)",
    "shortTitle": "🏷️ T#03 (47 007 Reach) · Czysty packshot patelni na szarym tle studyj",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#03 · 47 007 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "Czysty packshot patelni na szarym tle studyjnym (0 tekstu)",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-03",
    "defaultImageUrl": "/titano-cz-images/titano_static_top03_cs.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 102,
    "top30Rank": 3,
    "euReach": 47007
  },
  {
    "id": "titano-cz-brand-static-04",
    "number": 34,
    "code": "STATIC-04",
    "title": "[Brand Static T#04 · 46 184 Reach] Czysty packshot patelni na marmurowym blacie przy zlewie (0 tekstu)",
    "shortTitle": "🏷️ T#04 (46 184 Reach) · Czysty packshot patelni na marmurowym blacie",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#04 · 46 184 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "Czysty packshot patelni na marmurowym blacie przy zlewie (0 tekstu)",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-04",
    "defaultImageUrl": "/titano-cz-images/titano_static_top04_cs.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 102,
    "top30Rank": 4,
    "euReach": 46184
  },
  {
    "id": "titano-cz-brand-static-05",
    "number": 35,
    "code": "STATIC-05",
    "title": "[Brand Static T#05 · 37 983 Reach] poslední hodiny / VÝPRODEJ MĚSÍCE POVĚDOMÍ O PFAS / Zbývá jen 6 kusů",
    "shortTitle": "🏷️ T#05 (37 983 Reach) · poslední hodiny / VÝPRODEJ MĚSÍCE POVĚDOMÍ O",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#05 · 37 983 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "poslední hodiny / VÝPRODEJ MĚSÍCE POVĚDOMÍ O PFAS / Zbývá jen 6 kusů",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-05",
    "defaultImageUrl": "/titano-cz-images/titano_static_top05_cs.jpg",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 101,
    "top30Rank": 5,
    "euReach": 37983
  },
  {
    "id": "titano-cz-brand-static-06",
    "number": 36,
    "code": "STATIC-06",
    "title": "[Brand Static T#06 · 37 958 Reach] NAŠE AKCE MĚSÍCE NA VAŘENÍ ZAČÍNÁ PRÁVĚ TEĎ! / SLEVA 70 % POUZE DNES",
    "shortTitle": "🏷️ T#06 (37 958 Reach) · NAŠE AKCE MĚSÍCE NA VAŘENÍ ZAČÍNÁ PRÁVĚ TEĎ!",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#06 · 37 958 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "NAŠE AKCE MĚSÍCE NA VAŘENÍ ZAČÍNÁ PRÁVĚ TEĎ! / SLEVA 70 % POUZE DNES",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-06",
    "defaultImageUrl": "/titano-cz-images/titano_static_top06_cs.jpg",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 101,
    "top30Rank": 6,
    "euReach": 37958
  },
  {
    "id": "titano-cz-brand-static-07",
    "number": 37,
    "code": "STATIC-07",
    "title": "[Brand Static T#07 · 34 121 Reach] KRABICE POMAČKANÉ PŘI PŘEPRAVĚ. / PÁNVE – BEZ JEDINÉ VADY. / SLEVA AŽ 60 %",
    "shortTitle": "🏷️ T#07 (34 121 Reach) · KRABICE POMAČKANÉ PŘI PŘEPRAVĚ. / PÁNVE – BE",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#07 · 34 121 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "KRABICE POMAČKANÉ PŘI PŘEPRAVĚ. / PÁNVE – BEZ JEDINÉ VADY. / SLEVA AŽ 60 %",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-07",
    "defaultImageUrl": "/titano-cz-images/titano_static_top07_cs.jpg",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 102,
    "top30Rank": 7,
    "euReach": 34121
  },
  {
    "id": "titano-cz-brand-static-08",
    "number": 38,
    "code": "STATIC-08",
    "title": "[Brand Static T#08 · 32 830 Reach] Poslední pánev  kterou si koupíte. / DŮVĚŘUJE NÁM PŘES 47 000 SPOKOJENÝCH ZÁKAZNÍKŮ",
    "shortTitle": "🏷️ T#08 (32 830 Reach) · Poslední pánev  kterou si koupíte. / DŮVĚŘUJ",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#08 · 32 830 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "Poslední pánev, kterou si koupíte. / DŮVĚŘUJE NÁM PŘES 47 000 SPOKOJENÝCH ZÁKAZNÍKŮ",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-08",
    "defaultImageUrl": "/titano-cz-images/titano_static_top08_cs.jpg",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 101,
    "top30Rank": 8,
    "euReach": 32830
  },
  {
    "id": "titano-cz-brand-static-09",
    "number": 39,
    "code": "STATIC-09",
    "title": "[Brand Static T#09 · 31 264 Reach] 9999 / RYZÍ / ZLATO / 1 KILO (sztabka złota na patelni)",
    "shortTitle": "🏷️ T#09 (31 264 Reach) · 9999 / RYZÍ / ZLATO / 1 KILO (sztabka złota ",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#09 · 31 264 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "9999 / RYZÍ / ZLATO / 1 KILO (sztabka złota na patelni)",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-09",
    "defaultImageUrl": "/titano-cz-images/titano_static_top09_cs.jpg",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 102,
    "top30Rank": 9,
    "euReach": 31264
  },
  {
    "id": "titano-cz-brand-static-10",
    "number": 40,
    "code": "STATIC-10",
    "title": "[Brand Static T#10 · 20 572 Reach] Zbliżenie na strukturę kutego tytanu SlipScale (0 tekstu)",
    "shortTitle": "🏷️ T#10 (20 572 Reach) · Zbliżenie na strukturę kutego tytanu SlipSca",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Titano Česko Static T#10 · 20 572 EU Reach",
    "problemCluster": "BRAND_STATIC_TOP10",
    "problemLabel": "Titano Česko · Statyki Brandowe & Promocje",
    "recommendedFanpageId": "1401918076339017",
    "recommendedFanpageName": "Titano Česko",
    "vocTrigger": "Zbliżenie na strukturę kutego tytanu SlipScale (0 tekstu)",
    "mechanismCore": "100% čistý lékařský titan (Grade 1) SlipScale + 30 dní na vyzkoušení + poklice ZDARMA",
    "destinationUrl": "https://titanoshop.cz/products/titano-titanova-panev-medi-pan-pro",
    "defaultImageId": "brand-static-10",
    "defaultImageUrl": "/titano-cz-images/titano_static_top10_cs.png",
    "defaultImageHash": "",
    "createdDate": "2026-11-05",
    "updatedDate": "2026-11-05",
    "storyNumber": 102,
    "top30Rank": 10,
    "euReach": 20572
  }
];

export interface TitanoCzGeneratedAd {
  id: string;
  angleId: string;
  code: string;
  title: string;
  stageId: TitanoCzAwarenessStageId;
  sophisticationLevel: TitanoCzSophisticationLevel;
  problemCluster: TitanoCzProblemCluster;
  pageId: string;
  pageName: string;
  headline: string;
  description: string;
  primaryText: string;
  destinationUrl: string;
  cta: 'LEARN_MORE';
  imageUrl: string;
  imageHash: string;
  secondImageUrl?: string;
  secondImageHash?: string;
  wordCount: number;
  characterCount: number;
  auditPassed: boolean;
  auditWarnings: string[];
  auditFixesApplied: string[];
  createdAt: number;
  updatedAt: number;
}

export function sanitizeAndAuditTitanoCz(
  rawPrimaryText: string,
  rawHeadline: string,
  rawDescription: string,
): {
  primaryText: string;
  headline: string;
  description: string;
  wordCount: number;
  characterCount: number;
  auditPassed: boolean;
  auditWarnings: string[];
  auditFixesApplied: string[];
} {
  const fixes: string[] = [];
  const warnings: string[] = [];

  let primaryText = (rawPrimaryText || '').trim();
  let headline = (rawHeadline || '').trim();
  let description = (rawDescription || '').trim();

  if (/[*™]/.test(primaryText) || /[*™]/.test(headline) || /[*™]/.test(description)) {
    primaryText = primaryText.replace(/[*™]/g, '');
    headline = headline.replace(/[*™]/g, '');
    description = description.replace(/[*™]/g, '');
    fixes.push('Usunięto gwiazdki Markdown i symbole ™.');
  }

  if (/titanosklep\.pl/i.test(primaryText)) {
    primaryText = primaryText.replace(/titanosklep\.pl/gi, 'titanoshop.cz');
    fixes.push('Zamieniono titanosklep.pl na titanoshop.cz.');
  }

  const wordCount = primaryText.split(/\s+/).filter(Boolean).length;
  const characterCount = primaryText.length;

  return {
    primaryText,
    headline,
    description,
    wordCount,
    characterCount,
    auditPassed: warnings.length === 0,
    auditWarnings: warnings,
    auditFixesApplied: fixes,
  };
}

export function buildAllTitanoCzPrewrittenAds(): TitanoCzGeneratedAd[] {
  const baseCreated = Date.parse('2026-11-05T15:00:00+01:00');
  const baseUpdated = Date.parse('2026-11-05T18:20:00+01:00');

  return TITANO_CZ_PRESET_ANGLES.map((preset, idx) => {
    let rawHeadline = 'Tohle mi ostatní o teflonové pánvi neřekli 👇';
    let rawDescription = '100% čistý titan | 30 dní na vyzkoušení | Doprava zdarma po celé ČR';
    let rawPrimaryText = '';

    if (preset.storyNumber && preset.storyNumber >= 1 && preset.storyNumber <= 8) {
      const st = TITANO_CZ_STORIES[preset.storyNumber];
      if (st) {
        rawHeadline = st.headline;
        rawDescription = st.description;
        rawPrimaryText = st.primaryText;
      }
    } else if (preset.storyNumber === 101) {
      rawHeadline = 'Poslední pánev, kterou si v životě koupíte 👇';
      rawDescription = 'Doprava zdarma po celé ČR | 30 dní na vyzkoušení';
      rawPrimaryText = TITANO_CZ_BRAND_COPY_1;
    } else if (preset.storyNumber === 102) {
      rawHeadline = 'Žádný teflon. Žádná chemie. 100% čistý titan 👇';
      rawDescription = 'Nyní v podzimním výprodeji za 1 749 Kč + poklice ZDARMA';
      rawPrimaryText = TITANO_CZ_BRAND_COPY_2;
    }

    const audited = sanitizeAndAuditTitanoCz(rawPrimaryText, rawHeadline, rawDescription);
    const timestampOffset = (40 - idx) * 60_000;

    return {
      id: `titano-cz-${preset.code.toLowerCase()}`,
      angleId: preset.id,
      code: preset.code,
      title: preset.title,
      stageId: preset.stageId,
      sophisticationLevel: preset.sophisticationLevel,
      problemCluster: preset.problemCluster,
      pageId: preset.recommendedFanpageId,
      pageName: preset.recommendedFanpageName,
      headline: audited.headline,
      description: audited.description,
      primaryText: audited.primaryText,
      destinationUrl: preset.destinationUrl || TITANO_CZ_PDP_URL,
      cta: 'LEARN_MORE',
      imageUrl: preset.defaultImageUrl,
      imageHash: preset.defaultImageHash,
      secondImageUrl: undefined,
      secondImageHash: undefined,
      wordCount: audited.wordCount,
      characterCount: audited.characterCount,
      auditPassed: audited.auditPassed,
      auditWarnings: audited.auditWarnings,
      auditFixesApplied: audited.auditFixesApplied,
      createdAt: baseCreated + timestampOffset,
      updatedAt: baseUpdated + timestampOffset,
    };
  });
}
