/**
 * SARDIAN™ PL (Opaska Podrzepkowa · sprobujsardian.pl) · Pełna Matryca 25 Antków (5 Grup × 5 Kreacji = 25)
 * 15 zwycięzców 1:1 zza granicy (Not Done Yet UK, The Knee Diary UK, Inolyo FR) + 10 autorskich polskich kątów VoC.
 * Zero em-dashy, pełna zgodność z zasadami kartki eksperta i perspektywy narratora vs Fanpage.
 */

export type StrydeAwarenessStageId =
  | "stage1_mens_pride"
  | "stage2_family_grandkids"
  | "stage3_independence_fear"
  | "stage4_medical_anger"
  | "stage5_inolyo_stryde_direct";

export type StrydeSophisticationLevel = 3 | 4 | 5;

export type StrydeProblemCluster =
  | "MESKA_DUMA_UPADEK"
  | "SCHODY_FOTEL_131_NOCY"
  | "WNUKI_RODZINA_WSTYD"
  | "UTRATA_SAMODZIELNOSCI"
  | "GNIEW_NA_ORTEZY_I_KLINIKI"
  | "BIOMECHANIKA_34_PROC"
  | "KOLEJKA_NFZ_I_PODROBKI";

export interface StrydeStageMeta {
  id: StrydeAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  shortLabel: string;
  title: string;
  subtitle: string;
  sophisticationLabel: string;
  sophisticationLevel: StrydeSophisticationLevel;
  color: string;
  bgLight: string;
  borderColor: string;
  vocSummary: string;
}

export interface StrydeFanpage {
  id: string;
  name: string;
  initials: string;
  role: string;
  badgeColor: string;
}

export interface StrydeImageAsset {
  id: string;
  url: string;
  imageHash: string;
  label: string;
  adsetOrigin: string;
  adOrigin: string;
  aspectRatio: string;
  source?: "ai" | "meta";
  angleId?: string;
  kiePrompt?: string;
}

export interface StrydeAnglePreset {
  id: string;
  number: number;
  code: string;
  title: string;
  shortTitle: string;
  stageId: StrydeAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  sophisticationLevel: StrydeSophisticationLevel;
  sophisticationBadge: string;
  problemCluster: StrydeProblemCluster;
  problemLabel: string;
  recommendedFanpageId: string;
  recommendedFanpageName: string;
  vocTrigger: string;
  mechanismCore: string;
  defaultDestinationUrl: string;
  defaultImageId: string;
  defaultImageUrl: string;
  defaultImageHash: string;
  defaultSecondImageId?: string;
  defaultSecondImageUrl?: string;
  defaultSecondImageHash?: string;
}

export const STRYDE_ADVERTORIAL_URLS = [
  {
    id: "adv-test-konsumencki",
    label: "Advertorial #1 · Przetestowałam (5 wniosków · sprobujsardian.pl)",
    shortLabel: "Adv 1: Przetestowałam",
    url: "https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial",
  },
  {
    id: "adv-131-nocy",
    label: "Advertorial #2 · 131 Nocy w Fotelu (Story · sprobujsardian.pl)",
    shortLabel: "Adv 2: 131 Nocy w Fotelu",
    url: "https://sprobujsardian.pl/pages/131-nocy-w-fotelu",
  },
  {
    id: "adv-test-schodow",
    label: "Advertorial #3 · Test Schodów (14 opasek · sprobujsardian.pl)",
    shortLabel: "Adv 3: Test Schodów",
    url: "https://sprobujsardian.pl/pages/test-schodow",
  },
  {
    id: "adv-5-powodow",
    label: "Advertorial #4 · Jak Pozbyłam Się Bólu (5 powodów · sprobujsardian.pl)",
    shortLabel: "Adv 4: 5 Powodów (Kość o kość)",
    url: "https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan",
  },
  {
    id: "pdp-direct",
    label: "PDP Direct · Karta Produktu Sardian™ (Pakiet 1+1 / 2+2)",
    shortLabel: "PDP: Sardian™ Opaska",
    url: "https://sprobujsardian.pl/products/sardian-precision-strap",
  },
] as const;

export const STRYDE_LISTICLE_URL = "https://sprobujsardian.pl/pages/test-schodow";
export const STRYDE_PDP_URL = "https://sprobujsardian.pl/products/sardian-precision-strap";

export const STRYDE_FANPAGES: StrydeFanpage[] = [
  {
    id: "fp-jeszcze-nie-koniec",
    name: "Jeszcze Nie Koniec",
    initials: "JN",
    role: "Fanpage Satelicki 1:1 (Odpowiednik UK „Not Done Yet” · Historie 1. os. Klienta #01–#15)",
    badgeColor: "#10b981",
  },
  {
    id: "fp-pamietnik-kolana",
    name: "Pamiętnik Kolana",
    initials: "PK",
    role: "Fanpage Konsumencko-Demaskatorski (Odpowiednik UK „The Knee Diary” · Kliniki, Zastrzyki i Ortezy #16–#19)",
    badgeColor: "#3b82f6",
  },
  {
    id: "fp-fizjo-marek-kowalczyk",
    name: "Mgr Marek Kowalczyk - Fizjoterapia Kolana",
    initials: "MK",
    role: "Profil Ekspercki Fizjoterapeuty (Wyłącznie do narracji 1. os. eksperta · #20 Paradoks Imadła)",
    badgeColor: "#06b6d4",
  },
  {
    id: "fp-stryde-polska",
    name: "Sardian Polska",
    initials: "SP",
    role: "Oficjalny Profil Marki Sardian™ (Krótkie kąty BOF/Direct · Kość o kość, -34%, NFZ, Test 2 Palców #21–#25)",
    badgeColor: "#f59e0b",
  },
];

export const STRYDE_STAGES: Record<StrydeAwarenessStageId, StrydeStageMeta> = {
  stage1_mens_pride: {
    id: "stage1_mens_pride",
    stageNumber: 1,
    shortLabel: "Grupa 1 · Męska Duma, Fachowcy & Kierowcy (#01–#05)",
    title: "GRUPA 1: MĘSKA DUMA, FACHOWCY, KIEROWCY I DZIAŁKA ROD (#01–#05)",
    subtitle: "Parking ogrodniczy, 131 nocy w fotelu, drabina brata, 15 s przy drzwiach auta na Orlenie i taborecik na działce ROD",
    sophisticationLabel: "Not Done Yet #13, #20, #25 · Pełna Polska Lokalizacja 1:1",
    sophisticationLevel: 4,
    color: "#10b981",
    bgLight: "#09090b",
    borderColor: "#27272a",
    vocSummary: "Trzydzieści lat na kolanach na budowie, schodzenie ze schodów dostawianym krokiem, 11 opasek w szufladzie i punkt 2 palce pod rzepką.",
  },
  stage2_family_grandkids: {
    id: "stage2_family_grandkids",
    stageNumber: 2,
    shortLabel: "Grupa 2 · Babcie, Dziadkowie, Wnuki & Kościół (#06–#10)",
    title: "GRUPA 2: BABCIE, DZIADKOWIE, WNUKI, WÓZEK I KOMUNIA W KOŚCIELE (#06–#10)",
    subtitle: "4-letni Oskarek, druga babcia w parku, wózek w Kołobrzegu, klęcznik na Komunii wnuczki i piłka z 6-letnim wnukiem",
    sophisticationLabel: "Not Done Yet #27, #29, #30 · Pełna Polska Lokalizacja 1:1",
    sophisticationLevel: 4,
    color: "#3b82f6",
    bgLight: "#09090b",
    borderColor: "#27272a",
    vocSummary: "„Kulawe kolanko babci”, piątki oddane drugiej babci, która biega w parku, oraz skuter inwalidzki zarezerwowany przez córkę bez pytania.",
  },
  stage3_independence_fear: {
    id: "stage3_independence_fear",
    stageNumber: 3,
    shortLabel: "Grupa 3 · Toaleta, 3. Piętro, Wanna & Dom (#11–#15)",
    title: "GRUPA 3: UTRATA SAMODZIELNOŚCI · TOALETA, OTODOM, BLOK BEZ WINDY I WANNA (#11–#15)",
    subtitle: "Niska toaleta w biurze, linki z Otodom, czwartkowe dancingi, 3. piętro bez windy z Biedronką i próg wanny o 21:40",
    sophisticationLabel: "Not Done Yet #19, #26, #28 · Pełna Polska Lokalizacja 1:1",
    sophisticationLevel: 4,
    color: "#a855f7",
    bgLight: "#09090b",
    borderColor: "#27272a",
    vocSummary: "22 minuty w kabinie toalety, agent nieruchomości mierzący dębową poręcz zmarłego męża i srebrne buty do tańca schowane na dnie szafy.",
  },
  stage4_medical_anger: {
    id: "stage4_medical_anger",
    stageNumber: 4,
    shortLabel: "Grupa 4 · Gniew na Kliniki, Zastrzyki & Fizjo (#16–#20)",
    title: "GRUPA 4: GNIEW NA KLINIKI, ZASTRZYK ZA 1 200 ZŁ, KOLAGEN Z TV I PARADOKS IMADŁA (#16–#20)",
    subtitle: "6 000 zł w klinikach, orteza za 1 600 zł, zastrzyk hialuronowy z emerytury, 12 maści i okiem fizjoterapeuty (17 lat)",
    sophisticationLabel: "The Knee Diary #46, #49 · Skalpel vs Młot Kowalski",
    sophisticationLevel: 5,
    color: "#f59e0b",
    bgLight: "#09090b",
    borderColor: "#27272a",
    vocSummary: "Prywatne wizyty po 350 zł, blokady dostawowe i ciężkie ortezy z zawiasami kontra celowane odciążenie ścięgna rzepki.",
  },
  stage5_inolyo_stryde_direct: {
    id: "stage5_inolyo_stryde_direct",
    stageNumber: 5,
    shortLabel: "Grupa 5 · Kość o Kość, NFZ, Żylaki & BOF (#21–#25)",
    title: "GRUPA 5: KRÓTKIE KĄTY INOLYO FR (820K REACH) & SARDIAN™ DIRECT BOF (#21–#25)",
    subtitle: "„To NIE chrząstka (-34%)”, „Nie zjeżdża na łydkę”, „Kolejka NFZ”, „Anty-podróbki 8 mm” i „Test 2 Palców / Żylaki”",
    sophisticationLabel: "Inolyo #1, #2, #23 + Sardian Direct BOF",
    sophisticationLevel: 5,
    color: "#ef4444",
    bgLight: "#09090b",
    borderColor: "#27272a",
    vocSummary: "Przełamanie obiekcji startej chrząstki, badanie Sports Health 2011 (-34% napięcia), czas oczekiwania na endoprotezę NFZ i przejęcie ruchu Ankole.",
  },
};

export const STRYDE_PROBLEM_CLUSTER_LABELS: Record<
  StrydeProblemCluster,
  { label: string; short: string; color: string }
> = {
  MESKA_DUMA_UPADEK: {
    label: "🔨 Męska Duma / Fachowcy po 60-tce (Parking & Drabina)",
    short: "Męska Duma",
    color: "#10b981",
  },
  SCHODY_FOTEL_131_NOCY: {
    label: "🛋️ 131 Nocy w Fotelu / Strach Przed Schodami",
    short: "131 Nocy w Fotelu",
    color: "#06b6d4",
  },
  WNUKI_RODZINA_WSTYD: {
    label: "👵 Wnuki, Druga Babcia i Wózek Elektryczny",
    short: "Wnuki & Babcia",
    color: "#3b82f6",
  },
  UTRATA_SAMODZIELNOSCI: {
    label: "🚽 Niska Toaleta, Sprzedaż Domu (Otodom) & Dancingi",
    short: "Samodzielność",
    color: "#a855f7",
  },
  GNIEW_NA_ORTEZY_I_KLINIKI: {
    label: "💸 6 000 zł w Klinikach & Orteza za 1 600 zł w Szafie",
    short: "Gniew na Ortezy",
    color: "#f59e0b",
  },
  BIOMECHANIKA_34_PROC: {
    label: "🦴 „To NIE Chrząstka” (-34% Napięcia / Nie Zjeżdża)",
    short: "Kość o Kość (-34%)",
    color: "#ec4899",
  },
  KOLEJKA_NFZ_I_PODROBKI: {
    label: "🏥 Kolejka na NFZ / Oryginał 8 mm vs Miękkie Podróbki",
    short: "Kolejka NFZ / BOF",
    color: "#ef4444",
  },
};

export const STRYDE_IMAGE_LIBRARY: StrydeImageAsset[] = [
  {
    id: "stryde-img-01",
    url: "/stryde-pl-images/stryde-pl-01-schody-kolano.jpg",
    imageHash: "stryde_hash_01",
    label: "UGC Schody w domu — męskie kolano z opaską pod rzepką (#01/#02/#08)",
    adsetOrigin: "Not Done Yet PL",
    adOrigin: "131 Nocy / Test Schodów",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-02",
    url: "/stryde-pl-images/stryde-pl-02-rower-spacer.jpg",
    imageHash: "stryde_hash_02",
    label: "UGC Spacer / Rower w parku — opaska pod rzepką (#06)",
    adsetOrigin: "Not Done Yet PL",
    adOrigin: "Wózek Kołobrzeg",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-03",
    url: "/stryde-pl-images/stryde-pl-03-ogrod-kobieta.jpg",
    imageHash: "stryde_hash_03",
    label: "UGC Ogródek / Działka — kobiece kolano z paskiem (#04/#09)",
    adsetOrigin: "Not Done Yet PL",
    adOrigin: "4-letni Wnuk / Dancingi",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-04",
    url: "/stryde-pl-images/stryde-pl-04-warsztat-garaz.jpg",
    imageHash: "stryde_hash_04",
    label: "UGC Podjazd z kostki brukowej / Garaż (#01/#03)",
    adsetOrigin: "Not Done Yet PL",
    adOrigin: "Brukarz Tadeusz / Drabina",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-05",
    url: "/stryde-pl-images/stryde-pl-05-salon-dom.jpg",
    imageHash: "stryde_hash_05",
    label: "UGC Salon w domu / Wstawanie z fotela (#02/#07)",
    adsetOrigin: "Not Done Yet PL",
    adOrigin: "131 Nocy w Fotelu",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-06",
    url: "/stryde-pl-images/stryde-pl-06-las-spacer.jpg",
    imageHash: "stryde_hash_06",
    label: "UGC Park / Ścieżka leśna — druga babcia (#05/#06)",
    adsetOrigin: "Not Done Yet PL",
    adOrigin: "Druga Babcia w Parku",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-07",
    url: "/stryde-pl-images/stryde-pl-07-barbara-dzialka.jpg",
    imageHash: "stryde_hash_07",
    label: "UGC Pani Barbara (63 l.) na działce (#04/#08)",
    adsetOrigin: "Not Done Yet PL",
    adOrigin: "Barbara Kraków",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-08",
    url: "/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg",
    imageHash: "stryde_hash_08",
    label: "UGC Polski Senior trzymający opaskę w dłoni (#01/#03/#11)",
    adsetOrigin: "The Knee Diary PL",
    adOrigin: "Bronisław i Gienek",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-09",
    url: "/stryde-pl-images/stryde-pl-09-seniorka-trzyma-opaske.jpg",
    imageHash: "stryde_hash_09",
    label: "UGC Polska Seniorka trzymająca opaskę w domu (#05/#07/#10)",
    adsetOrigin: "The Knee Diary PL",
    adOrigin: "Pani Gosia / Pani Janina",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-10",
    url: "/stryde-pl-images/stryde-pl-10-opaska-studio.jpg",
    imageHash: "stryde_hash_10",
    label: "Sardian™ Precision Strap · Zbliżenie na rdzeń silikonowy 8 mm",
    adsetOrigin: "Stryde Direct",
    adOrigin: "Oryginał vs Podróbki",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-11",
    url: "/stryde-pl-images/stryde-pl-11-stryde-uk-kolano-1.jpg",
    imageHash: "stryde_hash_11",
    label: "Stryde UK Original #1 — Punkt podparcia pod rzepką (#10/#15)",
    adsetOrigin: "Stryde UK",
    adOrigin: "Knee Support 98%",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-12",
    url: "/stryde-pl-images/stryde-pl-12-stryde-uk-kolano-2.jpg",
    imageHash: "stryde_hash_12",
    label: "Stryde UK Original #2 — Porównanie na nodze (#11)",
    adsetOrigin: "Stryde UK",
    adOrigin: "Targeted Relief",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-13",
    url: "/stryde-pl-images/stryde-pl-13-stryde-uk-kolano-3.jpg",
    imageHash: "stryde_hash_13",
    label: "Stryde UK Original #3 — Nie zjeżdża na łydkę (#09/#13)",
    adsetOrigin: "Stryde UK",
    adOrigin: "Stays in Place",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-14",
    url: "/stryde-pl-images/stryde-pl-14-stryde-uk-kolano-4.jpg",
    imageHash: "stryde_hash_14",
    label: "Stryde UK Original #4 — Odciążenie ścięgna o 34% (#12)",
    adsetOrigin: "Inolyo FR / Stryde UK",
    adOrigin: "Pas le cartilage",
    aspectRatio: "1:1",
    source: "meta",
  },
  {
    id: "stryde-img-15",
    url: "/stryde-pl-images/stryde-pl-15-stryde-us-kolano-5.jpg",
    imageHash: "stryde_hash_15",
    label: "Stryde US Original #5 — Niewidoczna pod spodniami (#14)",
    adsetOrigin: "Stryde US",
    adOrigin: "Waitlist Relief",
    aspectRatio: "1:1",
    source: "meta",
  },
];

export const STRYDE_PRESET_ANGLES: StrydeAnglePreset[] = [
  {
    "id": "stryde-01-czy-pani-tata-dobrze-sie-czuje",
    "number": 1,
    "code": "NDY-01",
    "title": "„Czy pani tata dobrze się czuje?” · Młody chłopak na parkingu wziął mnie za ojca mojej żony",
    "shortTitle": "Wzięty za ojca własnej żony (Tadeusz i Zosia)",
    "stageId": "stage1_mens_pride",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Not Done Yet #13 · 1:1 UK Rip",
    "problemCluster": "MESKA_DUMA_UPADEK",
    "problemLabel": "Brukarski staż 30 lat · Upadek na parkingu · 11 ortez w szufladzie",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Tadeusz (64 l., brukarz), żona Zosia (52 l.), pomocnik Łukasz, kolega Gienek (70 l.) ze składu budowlanego.",
    "mechanismCore": "Odciążenie punktu dwa palce pod rzepką (ścięgno rzepki) zamiast ściskania całego stawu ściągaczem z apteki.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial",
    "defaultImageId": "stryde-img-01",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-04-warsztat-garaz.jpg",
    "defaultImageHash": "stryde_hash_01",
    "defaultSecondImageId": "stryde-img-02",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg",
    "defaultSecondImageHash": "stryde_hash_02"
  },
  {
    "id": "stryde-02-131-nocy-w-fotelu-w-salonie",
    "number": 2,
    "code": "NDY-02",
    "title": "„131 nocy w fotelu w salonie” · Mąż nie był na piętrze we własnym domu od listopada",
    "shortTitle": "131 nocy w fotelu (Karolina i glazurnik Darek)",
    "stageId": "stage1_mens_pride",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Not Done Yet #20 · 1:1 UK Rip",
    "problemCluster": "SCHODY_FOTEL_131_NOCY",
    "problemLabel": "14 stopni na piętro · 131 nocy w fotelu · 38 lat kładzenia płytek",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Karolina i Darek (63 l., glazurnik), córka Kasia, 5-letnia wnuczka Maja, przyjaciel Marek na działce.",
    "mechanismCore": "Klamra w spodniach roboczych vs gumka z apteki: punktowe podparcie ścięgna rzepki na każdym stopniu schodów.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/131-nocy-w-fotelu",
    "defaultImageId": "stryde-img-02",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-01-schody-kolano.jpg",
    "defaultImageHash": "stryde_hash_02",
    "defaultSecondImageId": "stryde-img-03",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-05-salon-dom.jpg",
    "defaultSecondImageHash": "stryde_hash_03"
  },
  {
    "id": "stryde-03-zona-zadzwonila-po-78-letniego-brata-do-drabiny",
    "number": 3,
    "code": "NDY-03",
    "title": "„Żona zadzwoniła po mojego 78-letniego brata do mojej drabiny” · Staszek i brat Edek",
    "shortTitle": "Starszy brat na mojej drabinie (Staszek i Edek)",
    "stageId": "stage1_mens_pride",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Not Done Yet #25 · 1:1 UK Rip",
    "problemCluster": "MESKA_DUMA_UPADEK",
    "problemLabel": "38 lat na drabinach · Zatkana rynna · 78-letni brat wchodzi na dach",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Staszek (72 l., emerytowany instalator), żona Halinka, 78-letni brat Edek po zawale.",
    "mechanismCore": "Dwa paski na oba kolana pod rzepką zdejmujące nacisk przy wchodzeniu po szczeblach drabiny i schodach.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/test-schodow",
    "defaultImageId": "stryde-img-03",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg",
    "defaultImageHash": "stryde_hash_03",
    "defaultSecondImageId": "stryde-img-04",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-04-warsztat-garaz.jpg",
    "defaultSecondImageHash": "stryde_hash_04"
  },
  {
    "id": "orthevia-04-15-sekund-przy-otwartych-drzwiach-auta-na-orlenie",
    "number": 4,
    "code": "SAR-04",
    "title": "„Przez 15 sekund stałem przy otwartych drzwiach auta na stacji Orlen, udając, że sprawdzam oponę” · Kierowca Marek (61 l.)",
    "shortTitle": "15 sekund przy drzwiach auta i sprzęgło w korku (Marek, 61 l.)",
    "stageId": "stage1_mens_pride",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Polski VoC #1 · Kierowcy & Sprzęgło",
    "problemCluster": "MESKA_DUMA_UPADEK",
    "problemLabel": "34 lata za kółkiem · Ból imadła na sprzęgle · Test Parkingu 15 s przy drzwiach",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Marek (61 l., przedstawiciel w trasie), żona Beata zabierająca kluczyki, mechanik (69 l.) wychodzący z kanału.",
    "mechanismCore": "Łapa docisku pod rzepką: rdzeń 8 mm zdejmuje szarpnięcie ze ścięgna bez wbijania rzepki w kość przy zgiętej nodze w aucie.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial",
    "defaultImageId": "stryde-img-04",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-04-warsztat-garaz.jpg",
    "defaultImageHash": "stryde_hash_04",
    "defaultSecondImageId": "stryde-img-08",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg",
    "defaultSecondImageHash": "stryde_hash_08"
  },
  {
    "id": "orthevia-05-taborecik-na-dzialce-rod-chcialem-oddac-klucze-po-28-latach",
    "number": 5,
    "code": "SAR-05",
    "title": "„Po 28 latach chciałem oddać klucze do naszej działki ROD. Przez zielony plastikowy taborecik pod jabłonką.”",
    "shortTitle": "Plastikowy taborecik na działce ROD i żona ze szpadlem (Stanisław)",
    "stageId": "stage1_mens_pride",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Polski VoC #2 · Działka ROD & Zawias",
    "problemCluster": "MESKA_DUMA_UPADEK",
    "problemLabel": "28 lat na działce ROD · Trzask jak sucha gałąź · Żona (63 l.) sama kopie szpadlem",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Stanisław (66 l., ślusarz), żona Danusia ze szpadlem i konewką, sąsiad (73 l.) tłumaczący zawias furtki.",
    "mechanismCore": "Podkładka dystansowa pod opadający zawias furtki: podparcie osi więzadła 2 palce pod rzepką zamiast duszenia stawu.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/test-schodow",
    "defaultImageId": "stryde-img-07",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-07-barbara-dzialka.jpg",
    "defaultImageHash": "stryde_hash_07",
    "defaultSecondImageId": "stryde-img-08",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg",
    "defaultSecondImageHash": "stryde_hash_08"
  },
  {
    "id": "stryde-04-4-letni-wnuk-pokazal-przy-obiedzie-jak-chodze",
    "number": 6,
    "code": "NDY-06",
    "title": "„Mój 4-letni wnuk pokazał przy obiedzie, jak chodzę. Za drugim razem nikt się nie zaśmiał.”",
    "shortTitle": "Chód, który skopiował 4-letni Oskarek (Zuzanna)",
    "stageId": "stage2_family_grandkids",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Not Done Yet #27 · 1:1 UK Rip",
    "problemCluster": "WNUKI_RODZINA_WSTYD",
    "problemLabel": "Wielkanocny obiad · 4-letni wnuk kopiuje utykanie · „Kulawe kolanko babci”",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Babcia Zuzanna (66 l.), syn Tomek, synowa Agnieszka, 4-letni Oskarek, sąsiadka Hela zza płotu.",
    "mechanismCore": "Przeniesienie siły nacisku z wytartego miejsca pod rzepką na ścięgno, pozwalające kucnąć przed wnukiem bez łez.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial",
    "defaultImageId": "stryde-img-04",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-03-ogrod-kobieta.jpg",
    "defaultImageHash": "stryde_hash_04",
    "defaultSecondImageId": "stryde-img-05",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-07-barbara-dzialka.jpg",
    "defaultSecondImageHash": "stryde_hash_05"
  },
  {
    "id": "stryde-05-wnuki-przestaly-przychodzic-w-piatki-druga-babcia",
    "number": 7,
    "code": "NDY-07",
    "title": "„Wnuki przestały przychodzić w piątki. 8-letnia Iga powiedziała: Babcia Dorota biega z nami w parku.”",
    "shortTitle": "Przegrana z drugą babcią (Krystyna i babcia Dorota)",
    "stageId": "stage2_family_grandkids",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Not Done Yet #29 · 1:1 UK Rip",
    "problemCluster": "WNUKI_RODZINA_WSTYD",
    "problemLabel": "Piątki u babci · Druga babcia (64 l.) biega w parku · Pudełko 9 ortez",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Babcia Krystyna (68 l., 32 lata w szkole), wnuki Iga (8 l.) i Leoś (6 l.), druga babcia Dorota (64 l.).",
    "mechanismCore": "Druga babcia podciąga nogawkę na Dniu Babci i Dziadka w szkole i pokazuje wąski czarny pasek pod rzepką.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan",
    "defaultImageId": "stryde-img-05",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-06-las-spacer.jpg",
    "defaultImageHash": "stryde_hash_05",
    "defaultSecondImageId": "stryde-img-06",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-09-seniorka-trzyma-opaske.jpg",
    "defaultSecondImageHash": "stryde_hash_06"
  },
  {
    "id": "stryde-06-corka-zarezerwowala-wozek-elektryczny-na-moje-nazwisko",
    "number": 8,
    "code": "NDY-08",
    "title": "„Córka zarezerwowała dla mnie wózek elektryczny przed wyjazdem. Na moje nazwisko. Bez pytania.”",
    "shortTitle": "Wózek inwalidzki na moje nazwisko (Barbara w Kołobrzegu)",
    "stageId": "stage2_family_grandkids",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Not Done Yet #30 · 1:1 UK Rip",
    "problemCluster": "WNUKI_RODZINA_WSTYD",
    "problemLabel": "Wakacje w Kołobrzegu · Skuter inwalidzki z wywieszką · Swatowa na klifach",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Barbara (69 l.), córka Magda, 9-letni wnuk Filip, swatowa Karolina (71 l.) z kijkami nordic walking.",
    "mechanismCore": "Swatowa Karolina daje zapasowy pasek z pakietu 1+1 · 11 400 kroków na molo w Kołobrzegu zamiast wózka.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial",
    "defaultImageId": "stryde-img-06",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-02-rower-spacer.jpg",
    "defaultImageHash": "stryde_hash_06",
    "defaultSecondImageId": "stryde-img-07",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-06-las-spacer.jpg",
    "defaultSecondImageHash": "stryde_hash_07"
  },
  {
    "id": "orthevia-09-jedyna-stojaca-w-lawce-w-kosciele-komunia-wnuczki",
    "number": 9,
    "code": "SAR-09",
    "title": "„Cała ławka w kościele uklękła na Przeistoczenie. Zostałam stojąca tylko ja, tuż za moją 9-letnią wnuczką.”",
    "shortTitle": "Jedyna stojąca w ławce na Komunii wnuczki (Halina, 65 l.)",
    "stageId": "stage2_family_grandkids",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Polski VoC #3 · Kościół & Komunia Wnuczki",
    "problemCluster": "WNUKI_RODZINA_WSTYD",
    "problemLabel": "Drewniany klęcznik w kościele · Wstyd przed rodziną · Pierwsza Komunia wnuczki Zuzi",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Halina (65 l.), 9-letnia wnuczka Zuzia, teściowa córki proponująca krzesło pod filarem, 70-letnia florystka parafialna.",
    "mechanismCore": "Odsłonięta rzepka bez dociskania pokrywki do garnka + wsparcie więzadła przy zginaniu kolana do klęku.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan",
    "defaultImageId": "stryde-img-09",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-09-seniorka-trzyma-opaske.jpg",
    "defaultImageHash": "stryde_hash_09",
    "defaultSecondImageId": "stryde-img-03",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-03-ogrod-kobieta.jpg",
    "defaultSecondImageHash": "stryde_hash_03"
  },
  {
    "id": "orthevia-10-dziadek-ty-juz-tylko-siedzisz-na-lawce-pilka-z-wnukiem",
    "number": 10,
    "code": "SAR-10",
    "title": "„‚Nie podawaj dziadkowi, dziadek tylko pilnuje kurtek na ławce’ · mój 6-letni wnuk powiedział to bez cienia złośliwości”",
    "shortTitle": "„Dziadek tylko pilnuje kurtek na ławce” (Krzysztof, 63 l.)",
    "stageId": "stage2_family_grandkids",
    "stageNumber": 2,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Polski VoC #4 · Dziadek & Kolano z Waty",
    "problemCluster": "WNUKI_RODZINA_WSTYD",
    "problemLabel": "6-letni wnuk z piłką · Strach przed uciekaniem kolana na krawężniku · Ławka w parku",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Dziadek Krzysztof (63 l., geodeta), 6-letni wnuk Kuba w parku, 71-letni emerytowany wuefista na Orliku.",
    "mechanismCore": "Wyłączenie hamowania bólowego i prowadzenie rzepki jak tramwaju w szynie dzięki dociskowi 8 mm na ścięgnie.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial",
    "defaultImageId": "stryde-img-02",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-02-rower-spacer.jpg",
    "defaultImageHash": "stryde_hash_02",
    "defaultSecondImageId": "stryde-img-06",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-06-las-spacer.jpg",
    "defaultSecondImageHash": "stryde_hash_06"
  },
  {
    "id": "stryde-07-mozesz-przyjsc-do-damskiej-toalety-niska-toaleta",
    "number": 11,
    "code": "NDY-11",
    "title": "„‚Możesz przyjść do damskiej toalety? Proszę. Nikomu nie mów.’ · Mama utknęła na niskiej toalecie”",
    "shortTitle": "Utknięcie na niskiej toalecie (Julia i mama Gosia)",
    "stageId": "stage3_independence_fear",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Not Done Yet #19 · 1:1 UK Rip",
    "problemCluster": "UTRATA_SAMODZIELNOSCI",
    "problemLabel": "Lęk przed niską toaletą · 22 minuty w kabinie · Rezygnacja z pracy w wieku 61 l.",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Kadrowa Julia (34 l.) i pani Gosia (61 l., 19 lat w firmie) · strach przed niskimi toaletami poza domem.",
    "mechanismCore": "Przy kącie 90 stopni podczas wstawania z niskiej toalety cały ciężar miażdży ścięgno pod rzepką · pasek przejmuje wektor siły.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan",
    "defaultImageId": "stryde-img-07",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-09-seniorka-trzyma-opaske.jpg",
    "defaultImageHash": "stryde_hash_07",
    "defaultSecondImageId": "stryde-img-08",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-05-salon-dom.jpg",
    "defaultSecondImageHash": "stryde_hash_08"
  },
  {
    "id": "stryde-08-corka-wysyla-linki-z-otodom-do-mieszkan-na-parterze",
    "number": 12,
    "code": "NDY-12",
    "title": "„Córka ciągle wysyła mi linki z Otodom do mieszkań na parterze. Mieszkam w tym domu od 41 lat.”",
    "shortTitle": "Linki z Otodom i agent na schodach (Wdowa Janina)",
    "stageId": "stage3_independence_fear",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Not Done Yet #26 · 1:1 UK Rip",
    "problemCluster": "UTRATA_SAMODZIELNOSCI",
    "problemLabel": "41 lat w domu z dębową poręczą męża · Agent nieruchomości · Pani Irena (79 l.)",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Wdowa Janina (71 l.), córka Karolina, zięć Marcin, wnuczka Pola, 79-letnia pani Irena sprzedająca parterowy domek.",
    "mechanismCore": "Analogia ciężkich siatek z zakupami: przeniesienie obciążenia ze zużytego miejsca pod rzepką na twarde ścięgno.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/test-schodow",
    "defaultImageId": "stryde-img-08",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-01-schody-kolano.jpg",
    "defaultImageHash": "stryde_hash_08",
    "defaultSecondImageId": "stryde-img-09",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-07-barbara-dzialka.jpg",
    "defaultSecondImageHash": "stryde_hash_09"
  },
  {
    "id": "stryde-09-w-wieku-67-lat-maz-zostawil-mnie-dla-72-latki-z-dancingow",
    "number": 13,
    "code": "NDY-13",
    "title": "„W wieku 67 lat mąż zostawił mnie dla innej. Ona ma 72 lata. I wciąż potrafi tańczyć.”",
    "shortTitle": "Zostawiona dla 72-latki z dancingów (Laura i Sylwia)",
    "stageId": "stage3_independence_fear",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Not Done Yet #28 · 1:1 UK Rip",
    "problemCluster": "UTRATA_SAMODZIELNOSCI",
    "problemLabel": "27 lat czwartkowych dancingów · „Idź sam, kochanie” · Spotkanie rywalki przy umywalce",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Laura (67 l.), mąż Krzysiek, 72-letnia wdowa Sylwia, fryzjerka Danusia, 81-letni partner do tańca Artur.",
    "mechanismCore": "Stabilizacja ścięgna przy ćwierćobrocie w tańcu i chodzeniu · powrót na parkiet w srebrnych butach.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan",
    "defaultImageId": "stryde-img-09",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-03-ogrod-kobieta.jpg",
    "defaultImageHash": "stryde_hash_09",
    "defaultSecondImageId": "stryde-img-10",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-13-stryde-uk-kolano-3.jpg",
    "defaultSecondImageHash": "stryde_hash_10"
  },
  {
    "id": "orthevia-14-trzecie-pietro-bez-windy-udawalam-ze-szukam-kluczy",
    "number": 14,
    "code": "SAR-14",
    "title": "„Na drugim półpiętrze udawałam przed sąsiadką, że szukam kluczy w torebce. Żeby nie widziała, że boję się zejść stopień niżej.”",
    "shortTitle": "3. piętro bez windy i siatki z Biedronki (Elżbieta, 64 l.)",
    "stageId": "stage3_independence_fear",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Polski VoC #5 · Blok z Wielkiej Płyty bez Windy",
    "problemCluster": "SCHODY_FOTEL_131_NOCY",
    "problemLabel": "48 stopni bez windy · Zakupy w Biedronce na wagę · 280 kg nacisku przy schodzeniu",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Wdowa Elżbieta (64 l., 3. piętro w czteropiętrowym bloku), młoda sąsiadka i listonosz pan Mirek (60 l., 38 klatek dziennie).",
    "mechanismCore": "Przy schodzeniu na ścięgno uderza 4-krotność masy ciała (~280 kg): pasek przejmuje 34% szarpnięcia na każdym stopniu.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/test-schodow",
    "defaultImageId": "stryde-img-01",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-01-schody-kolano.jpg",
    "defaultImageHash": "stryde_hash_01",
    "defaultSecondImageId": "stryde-img-09",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-09-seniorka-trzyma-opaske.jpg",
    "defaultSecondImageHash": "stryde_hash_09"
  },
  {
    "id": "orthevia-15-wysoki-prog-wanny-i-jasiek-miedzy-kolanami-o-3-w-nocy",
    "number": 15,
    "code": "SAR-15",
    "title": "„O 21:40 stałam w ręczniku przed własną wanną i bałam się przełożyć nogę przez próg. Mieszkam sama.”",
    "shortTitle": "Wysoki próg wanny i jaśiek między kolanami o 3:00 w nocy (Teresa)",
    "stageId": "stage3_independence_fear",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Polski VoC #6 · Próg Wanny & Nocny Ból o 3:00",
    "problemCluster": "UTRATA_SAMODZIELNOSCI",
    "problemLabel": "Samotna kąpiel wieczorem · Wycena remontu 16 800 zł · Poduszka między kolanami w nocy",
    "recommendedFanpageId": "fp-jeszcze-nie-koniec",
    "recommendedFanpageName": "Jeszcze Nie Koniec",
    "vocTrigger": "Teresa (68 l., emerytowana bibliotekarka), telefon w przedpokoju, sąsiadka pani Iwonka (62 l., oddziałowa z ortopedii).",
    "mechanismCore": "Odciążenie więzadła w ciągu dnia wycisza mikro-urazy i wieczorny stan zapalny, który rwie o 3:00 nad ranem jak chory ząb.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/131-nocy-w-fotelu",
    "defaultImageId": "stryde-img-05",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-05-salon-dom.jpg",
    "defaultImageHash": "stryde_hash_05",
    "defaultSecondImageId": "stryde-img-09",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-09-seniorka-trzyma-opaske.jpg",
    "defaultSecondImageHash": "stryde_hash_09"
  },
  {
    "id": "stryde-10-biora-za-to-tysiace-w-klinikach-skalpel-vs-mlot",
    "number": 16,
    "code": "TKD-16",
    "title": "„Wydałam ponad 6 000 zł na kolano. Dopiero wąski pasek pod rzepką pozwolił mi wstać z kanapy.”",
    "shortTitle": "6 000 zł w klinikach vs pasek pod rzepką (Janina, 61 l.)",
    "stageId": "stage4_medical_anger",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "The Knee Diary #46 · 1:1 UK Rip",
    "problemCluster": "GNIEW_NA_ORTEZY_I_KLINIKI",
    "problemLabel": "6 000 zł na prywatne wizyty, blokady i ortezę zegarową vs prosta biomechanika",
    "recommendedFanpageId": "fp-pamietnik-kolana",
    "recommendedFanpageName": "Pamiętnik Kolana",
    "vocTrigger": "Janina (61 l.): 350 zł konsultacja, 650 zł wielka orteza zegarowa, 4 serie zastrzyków, fizjoterapia 180 zł/wizyta.",
    "mechanismCore": "Wielka orteza za setki złotych i wąski pasek podrzepkowy wykonują tę samą pracę mechaniczną odciążenia ścięgna rzepki.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/test-schodow",
    "defaultImageId": "stryde-img-10",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-11-stryde-uk-kolano-1.jpg",
    "defaultImageHash": "stryde_hash_10",
    "defaultSecondImageId": "stryde-img-11",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-10-opaska-studio.jpg",
    "defaultSecondImageHash": "stryde_hash_11"
  },
  {
    "id": "stryde-11-kolega-mial-orteze-za-1600-zl-ja-mialem-waski-pasek",
    "number": 17,
    "code": "TKD-17",
    "title": "„Kolega miał ortezę za 1 600 zł. Ja miałem wąski pasek. Zgadnij, które z nich leży dziś w szafie.”",
    "shortTitle": "Orteza za 1 600 zł w szafie vs pasek (Bronisław, 71 l.)",
    "stageId": "stage4_medical_anger",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "The Knee Diary #49 · 1:1 UK Rip",
    "problemCluster": "GNIEW_NA_ORTEZY_I_KLINIKI",
    "problemLabel": "Emerytowany kolejarz Bronisław (71 l.) · Sztywna orteza zegarowa vs pasek Gienka",
    "recommendedFanpageId": "fp-pamietnik-kolana",
    "recommendedFanpageName": "Pamiętnik Kolana",
    "vocTrigger": "Bronisław (71 l., emerytowany kolejarz) i kolega Gienek w klubie · wstawanie z fotela bez podpierania się rękami.",
    "mechanismCore": "Wielka orteza jest dla zerwanych więzadeł; na zużyte kolano potrzebny jest celowany nacisk na ścięgno pod rzepką.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/test-schodow",
    "defaultImageId": "stryde-img-11",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-12-stryde-uk-kolano-2.jpg",
    "defaultImageHash": "stryde_hash_11",
    "defaultSecondImageId": "stryde-img-12",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg",
    "defaultSecondImageHash": "stryde_hash_12"
  },
  {
    "id": "orthevia-18-zastrzyk-kwasu-hialuronowego-za-1200-zl-z-emerytury",
    "number": 18,
    "code": "SAR-18",
    "title": "„Odkładałam z emerytury przez 3 miesiące na zastrzyk za 1 200 zł. Po 6 tygodniach chrupanie wróciło co do jednego stopnia.”",
    "shortTitle": "Zastrzyk hialuronowy za 1 200 zł z emerytury vs pasek (Bożena, 66 l.)",
    "stageId": "stage4_medical_anger",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Polski VoC #7 · Zastrzyk za 1 200 zł na 5 Tygodni",
    "problemCluster": "GNIEW_NA_ORTEZY_I_KLINIKI",
    "problemLabel": "Koperta z emerytury (3×400 zł) · Płynny implant starczył na 38 dni · Krzywy zawias",
    "recommendedFanpageId": "fp-pamietnik-kolana",
    "recommendedFanpageName": "Pamiętnik Kolana",
    "vocTrigger": "Bożena (66 l., 33 lata w stołówce szkolnej), prywatny zastrzyk 300+900 zł, fizjoterapeuta z turnusu.",
    "mechanismCore": "Wlanie smaru za 1 200 zł do krzywo ciągniętego zawiasu nie działa bez zewnętrznego podparcia więzadła rzepki.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan",
    "defaultImageId": "stryde-img-11",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-11-stryde-uk-kolano-1.jpg",
    "defaultImageHash": "stryde_hash_11",
    "defaultSecondImageId": "stryde-img-09",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-09-seniorka-trzyma-opaske.jpg",
    "defaultSecondImageHash": "stryde_hash_09"
  },
  {
    "id": "orthevia-19-4-pudelka-kolagenu-i-12-tubek-masci-smarowanie-maski-auta",
    "number": 19,
    "code": "SAR-19",
    "title": "„4 pudełka kolagenu z telewizji i 12 tubek maści z apteki. Szwagier mechanik spojrzał na moją półkę i podsumował to jednym zdaniem.”",
    "shortTitle": "Kolagen z TV i 12 maści · „smarowanie maski auta” (Andrzej, 59 l.)",
    "stageId": "stage4_medical_anger",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Polski VoC #8 · Kolagen z TV & Efekt Progu Gitarowego",
    "problemCluster": "GNIEW_NA_ORTEZY_I_KLINIKI",
    "problemLabel": "1 320 zł na saszetki kolagenu i maści kamforowe · Zgaga po lekach · Kapodaster na ścięgnie",
    "recommendedFanpageId": "fp-pamietnik-kolana",
    "recommendedFanpageName": "Pamiętnik Kolana",
    "vocTrigger": "Andrzej (59 l., hurtownia elektryczna), 4 pudełka kolagenu i 12 maści, szwagier mechanik Romek z gitarą.",
    "mechanismCore": "Efekt progu gitarowego (kapodastra): docisk 8 mm skraca dźwignię ścięgna rzepki zamiast trawienia kolagenu w żołądku.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial",
    "defaultImageId": "stryde-img-10",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-10-opaska-studio.jpg",
    "defaultImageHash": "stryde_hash_10",
    "defaultSecondImageId": "stryde-img-08",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg",
    "defaultSecondImageHash": "stryde_hash_08"
  },
  {
    "id": "orthevia-20-fizjoterapeuta-paradoks-imadla-dlaczego-zdejmuje-ortezy-w-progu",
    "number": 20,
    "code": "FIZ-20",
    "title": "„Jestem fizjoterapeutą od 17 lat. Pierwsza rzecz, jaką robię u pacjentów po 55. roku życia? Każę im zdjąć grubą ortezę z apteki.”",
    "shortTitle": "Perspektywa Fizjoterapeuty: „Paradoks Imadła” vs pasek 8 mm",
    "stageId": "stage4_medical_anger",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Autorytet Eksperta · Fizjoterapeuta (17 lat praktyki)",
    "problemCluster": "BIOMECHANIKA_34_PROC",
    "problemLabel": "Paradoks Imadła: dlaczego pełny rękaw wbija rzepkę w kość i usypia mięsień uda",
    "recommendedFanpageId": "fp-fizjo-marek-kowalczyk",
    "recommendedFanpageName": "Mgr Marek Kowalczyk - Fizjoterapia Kolana",
    "vocTrigger": "31 na 42 pacjentów 55+ w gabinecie przychodzi w ciasnej ortezie z apteki, która nasila tarcie rzepkowo-udowe.",
    "mechanismCore": "Otwarta rzepka + wolny dół podkolanowy + punktowe odciążenie więzadła 8 mm (-34% napięcia wg Sports Health).",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/test-schodow",
    "defaultImageId": "stryde-img-12",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-12-stryde-uk-kolano-2.jpg",
    "defaultImageHash": "stryde_hash_12",
    "defaultSecondImageId": "stryde-img-14",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-14-stryde-uk-kolano-4.jpg",
    "defaultSecondImageHash": "stryde_hash_14"
  },
  {
    "id": "stryde-12-to-nie-chrzastka-dziala-nawet-przy-osc-o-kosc",
    "number": 21,
    "code": "INO-21",
    "title": "„To NIE chrząstka · dlaczego opaska podrzepkowa przynosi ulgę nawet przy tarciu kość o kość”",
    "shortTitle": "Nawet bez chrząstki („kość o kość”) · Inolyo #1 (820k reach)",
    "stageId": "stage5_inolyo_stryde_direct",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Inolyo #1 & #9 · 820k Reach FR",
    "problemCluster": "BIOMECHANIKA_34_PROC",
    "problemLabel": "Przełamanie obiekcji „mam startą chrząstkę, nic mi nie pomoże” (-34% napięcia)",
    "recommendedFanpageId": "fp-stryde-polska",
    "recommendedFanpageName": "Sardian Polska",
    "vocTrigger": "Dla osób, które usłyszały w gabinecie „kość o kość, zostały tylko zastrzyki albo endoproteza”.",
    "mechanismCore": "Sardian™ nie odbudowuje chrząstki · przejmuje 34% napięcia ze ścięgna rzepki i odciąża staw mechanicznie.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan",
    "defaultImageId": "stryde-img-12",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-14-stryde-uk-kolano-4.jpg",
    "defaultImageHash": "stryde_hash_12",
    "defaultSecondImageId": "stryde-img-13",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-10-opaska-studio.jpg",
    "defaultSecondImageHash": "stryde_hash_13"
  },
  {
    "id": "stryde-13-opaska-ktora-zjezdza-nie-pomaga-wcale-sports-health",
    "number": 22,
    "code": "INO-22",
    "title": "„Opaska, która zjeżdża na łydkę, nie pomaga wcale · Badanie Sports Health (-34% napięcia)”",
    "shortTitle": "Nie zjeżdża na łydkę (-34% Sports Health) · Inolyo #2",
    "stageId": "stage5_inolyo_stryde_direct",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Inolyo #2 · 474k Reach FR",
    "problemCluster": "BIOMECHANIKA_34_PROC",
    "problemLabel": "Zwykłe rękawy z apteki zjeżdżają na łydkę vs Rdzeń silikonowy 8 mm + stalowe przelotki",
    "recommendedFanpageId": "fp-stryde-polska",
    "recommendedFanpageName": "Sardian Polska",
    "vocTrigger": "Frustracja ciągłym podciąganiem zwijającego się rękawa elastycznego pod spodniami.",
    "mechanismCore": "Badanie Sports Health (2011): prawidłowo osadzona opaska podrzepkowa redukuje napięcie na ścięgnie rzepki o 34%.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/test-schodow",
    "defaultImageId": "stryde-img-13",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-13-stryde-uk-kolano-3.jpg",
    "defaultImageHash": "stryde_hash_13",
    "defaultSecondImageId": "stryde-img-14",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-15-stryde-us-kolano-5.jpg",
    "defaultSecondImageHash": "stryde_hash_14"
  },
  {
    "id": "stryde-14-przetrwac-kolejke-do-operacji-zanim-wydasz-800zl",
    "number": 23,
    "code": "INO-23",
    "title": "„Zanim wydasz 800 zł na blokadę. Jak przetrwać kilkanaście miesięcy w kolejce na NFZ.”",
    "shortTitle": "Przetrwać kolejkę na NFZ / Przed blokadą · Inolyo #23",
    "stageId": "stage5_inolyo_stryde_direct",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Inolyo #23 & #24 · 200k Reach FR",
    "problemCluster": "KOLEJKA_NFZ_I_PODROBKI",
    "problemLabel": "18 miesięcy w kolejce na NFZ · Zastrzyk za 800 zł vs 60 dni testu bez ryzyka",
    "recommendedFanpageId": "fp-stryde-polska",
    "recommendedFanpageName": "Sardian Polska",
    "vocTrigger": "Termin operacji za kilkanaście miesięcy, a trzeba codziennie chodzić po schodach i robić zakupy.",
    "mechanismCore": "Uczciwe pozycjonowanie: nie zastępuje chirurgii, ale odciąża ścięgno pod rzepką w okresie oczekiwania na zabieg.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/pages/131-nocy-w-fotelu",
    "defaultImageId": "stryde-img-14",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-15-stryde-us-kolano-5.jpg",
    "defaultImageHash": "stryde_hash_14",
    "defaultSecondImageId": "stryde-img-15",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-01-schody-kolano.jpg",
    "defaultSecondImageHash": "stryde_hash_15"
  },
  {
    "id": "stryde-15-sprzedawana-przez-nas-nie-przez-nich-oryginal-vs-podrobki",
    "number": 24,
    "code": "SAR-24",
    "title": "„Sprzedawana przez nas. Nie przez nich.” · Oryginał z rdzeniem 8 mm vs miękkie podróbki",
    "shortTitle": "Oryginał vs Miękkie Podróbki (Przejęcie ruchu Ankole)",
    "stageId": "stage5_inolyo_stryde_direct",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sardian #1 · BOF Retargeting / Hijack",
    "problemCluster": "KOLEJKA_NFZ_I_PODROBKI",
    "problemLabel": "Przejęcie wygrzanego ruchu konkurencji · Rdzeń 8 mm vs pusta gumka z Chin",
    "recommendedFanpageId": "fp-stryde-polska",
    "recommendedFanpageName": "Sardian Polska",
    "vocTrigger": "Widziałeś reklamy czarnych opasek pod różnymi nazwami? Uważaj na miękkie podróbki bez silikonowego rdzenia.",
    "mechanismCore": "Prawdziwy wyprofilowany rdzeń silikonowy z poduszką powietrzną + stalowe przelotki + 60 dni gwarancji.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/products/sardian-precision-strap",
    "defaultImageId": "stryde-img-15",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-10-opaska-studio.jpg",
    "defaultImageHash": "stryde_hash_15",
    "defaultSecondImageId": "stryde-img-01",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-11-stryde-uk-kolano-1.jpg",
    "defaultSecondImageHash": "stryde_hash_01"
  },
  {
    "id": "orthevia-25-peselu-pan-nie-oszuka-test-dwoch-palcow-zylaki-kregoslup",
    "number": 25,
    "code": "SAR-25",
    "title": "„Usłyszałeś w przychodni ‚PESEL-u się nie oszuka’? Zrób 10-sekundowy Test Dwóch Palców (Bez uciskania żylaków i bez schylania się)”",
    "shortTitle": "„PESEL-u nie oszukasz”? Test 2 Palców + Żylaki & Kręgosłup (BOF)",
    "stageId": "stage5_inolyo_stryde_direct",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Polski BOF · Zbicie 3 Obiekcji (Żylaki / Tęższa Noga / Plecy)",
    "problemCluster": "KOLEJKA_NFZ_I_PODROBKI",
    "problemLabel": "Zbicie obiekcji seniorów 55+: żylaki, obwód 28–48 cm i zapinanie na siedząco w 5 s",
    "recommendedFanpageId": "fp-stryde-polska",
    "recommendedFanpageName": "Sardian Polska",
    "vocTrigger": "Dla osób, które usłyszały „PESEL-u nie oszukasz” i boją się ucisku żylaków lub schylania przy bolącym kręgosłupie.",
    "mechanismCore": "10-sekundowy Test Dwóch Palców pod rzepką + otwarta konstrukcja 28–48 cm zapinana na siedząco bez zdejmowania butów.",
    "defaultDestinationUrl": "https://sprobujsardian.pl/products/sardian-precision-strap",
    "defaultImageId": "stryde-img-14",
    "defaultImageUrl": "/stryde-pl-images/stryde-pl-14-stryde-uk-kolano-4.jpg",
    "defaultImageHash": "stryde_hash_14",
    "defaultSecondImageId": "stryde-img-10",
    "defaultSecondImageUrl": "/stryde-pl-images/stryde-pl-10-opaska-studio.jpg",
    "defaultSecondImageHash": "stryde_hash_10"
  }
];

export const STRYDE_ALL_COPY: Record<string, { headline: string; description: string; primaryText: string }> = {
  "stryde-01-czy-pani-tata-dobrze-sie-czuje": {
    "headline": "Nie poprawiła go.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu, bez zbędnych pytań.",
    "primaryText": "„Czy pani tata dobrze się czuje?”, zapytał młody chłopak moją żonę. Ona ma 52 lata. Ja mam 64. Jestem jej mężem. Nie poprawiła go.\n\nOpowiem wam o tym sklepie ogrodniczym.\n\nTo była Wielka Sobota. Duże centrum ogrodnicze przy wylotówce za miastem. Zosia pakowała zakupy do bagażnika, a ja szedłem za nią przez parking, niosąc w donicy drzewko laurowe, bo wymarzyła sobie takie przy drzwiach wejściowych. Uparłem się, że sam je zaniosę. Pierwsza rzecz, którą dla niej niosłem od roku.\n\nZ sąsiedniego rzędu zaczął cofać biały bus dostawczy. Prosto na nią. Miała głowę w głębi bagażnika. Nie widziała go.\n\nByłem jakieś trzy metry od niej. Krzyknąłem jej imię. Upuściłem donicę. Chciałem podbiec.\n\nMoje kolano nie pobiegło ze mną. Przy pierwszym kroku po prostu się pode mną złożyło i poleciałem na jedną rękę na kostkę brukową.\n\nMłody chłopak w zielonym polarze z obsługi sklepu minął mnie, jakbym stał w miejscu. Złapał Zosię za ramię, odciągnął ją na bok, a bus zatrzymał się może trzydzieści centymetrów od miejsca, w którym przed chwilą stała.\n\n„Wszystko dobrze, nic pani nie jest, trzymam panią”.\n\nPotem spojrzał na mnie, kiedy wciąż zbierałem się z ziemi i zapytał ją:\n\n„Czy pani tata dobrze się czuje? Wyglądał, jakby miał zasłabnąć”.\n\nA Zosia odpowiedziała: „Nic mu nie jest. Dziękuję panu bardzo”.\n\nNie poprawiła go.\n\nJestem jej mężem. I nie byłem w stanie pokonać trzech metrów do własnej żony.\n\nSiedzieliśmy potem w samochodzie przy wyłączonym silniku. Przez dłuższą chwilę żadne z nas się nie odezwało. Drzewko laurowe wciąż leżało na ziemi tam, gdzie je upuściłem, przewrócone na bok, w rozsypanej ziemi.\n\n„Gdyby tego młodego chłopaka tam nie było, Tadziu...”\n\nNie dokończyła.\n\n„Dobiegłbym do ciebie”.\n\n„Nie zrobiłeś nawet jednego kroku”.\n\nA potem powiedziała zdanie, którego do dziś nie potrafię wyrzucić z głowy.\n\n„Mam pięćdziesiąt dwa lata. Nie jestem gotowa, żeby pchać cię na wózku”.\n\nPowiedziałem, że nikt nie będzie mnie nigdzie pchał.\n\nA ona na to: „To dlaczego pomyślał, że jesteś moim ojcem?”.\n\nNa to nie miałem odpowiedzi. Powiedziałem, że coś z tym zrobię. Mówiłem, że coś z tym zrobię, od dwóch lat.\n\nPowinienem wam powiedzieć, kim jestem.\n\nMam sześćdziesiąt cztery lata. Przez trzydzieści lat układałem kostkę brukową, tarasy i podjazdy. Kamień, granit, krawężniki, wszystko. Przeklęczałem połowę podjazdów w tym mieście. Kiedyś to po mnie dzwonili inni chłopacy z budowy, gdy trzeba było w pojedynkę dźwignąć płytę chodnikową.\n\nZosia jest ode mnie o dwanaście lat młodsza. Chodzi szybko. W supermarkecie jest zawsze trzy alejki przede mną. Ostatnio jest trzy alejki przede mną wszędzie.\n\nMoje kolano poszło dziewiątego marca dwa lata temu. Przy zeskakiwaniu z paki busa. Usłyszałem trzask i od tamtego dnia nie chodziłem już normalnie.\n\nTeraz schodzę po schodach dostawianym krokiem: prawa stopa w dół, lewa do niej dołącza. Na każdym jednym stopniu. Kiedy wysiadam z busa, przez dziesięć sekund trzymam się drzwi, zanim noga w ogóle przyjmie ciężar. Całkowicie przestałem klękać. Łukasz, młody chłopak, który ze mną pracuje, robi teraz całą robotę na kolanach. Ja docinam kostkę i wożę taczkę, a klientom mówię, że po prostu tak dzielimy pracę. Moje nakolanniki wiszą na gwoździu w garażu od tamtego marca, zaraz nad wędkami. Kiedyś nosiłem Zosi siatki z zakupami z auta. Teraz siedzę w aucie i czekam, aż sama je zapakuje.\n\nLekarz zrobił mi badania krwi. Morfologia w normie. Ciśnienie w normie. „Jak na sześćdziesiąt cztery lata jest pan w świetnej formie, panie Tadeuszu”.\n\nPowiedziałem: „Mam sześćdziesiąt cztery lata, a chodzę, jakbym miał osiemdziesiąt pięć”.\n\nPowiedziała, że po trzydziestu latach na kolanach to normalne zużycie materiału. Żeby się ruszać. Zrzucić parę kilo. Wziąć tabletkę przeciwbólową, jak mocniej rwie. „Większości pacjentów to wystarcza”.\n\nDla mnie to nie jest normalne.\n\nPrzeszedłem fizjoterapię. Kartka z ćwiczeniami dalej wisi na lodówce, z podwiniętym rogiem. Przykładam mrożonki przy zlewie o szóstej rano. Opaska uciskowa pod spodniami roboczymi codziennie przed jedenastą zwijała mi się na łydce, więc podciągałem ją za busem, żeby Łukasz nie widział.\n\nWieczorem po tamtym incydencie na parkingu wstałem z kanapy i kolano zachrupotało. Głośno. Zosia znad telewizora spojrzała na mnie.\n\n„To coś nowego”.\n\n„Chrupie tak od Bożego Narodzenia”.\n\nWyszła do przedpokoju i otworzyła szufladę. Ortezy, stabilizatory, opaski z apteki. Niektóre jeszcze z metkami.\n\n„Ile ich tu jest, Tadziu?”\n\n„Jedenaście. Liczyłem w styczniu”.\n\nZamknęła szufladę i poszła do sypialni bez jednego słowa. To był najgorszy moment całego tamtego dnia. Gorszy niż tamten chłopak na parkingu.\n\nWe wtorek pojechałem na skład budowlany po piasek. Na placu był Gienek.\n\nGienek ma siedemdziesiąt lat. Pracowaliśmy razem przez lata. Dwa lata temu zamknął firmę, a teraz przychodzi na skład na dwa poranki w tygodniu, żeby wyjść z domu i nie zardzewieć. Ja zawsze biorę towar po południu, dlatego wcześniej na niego nie trafiłem. Właśnie sam zdejmował z palety wielką płytę tarasową, dokładnie tak, jak ja kiedyś i odłożył ją na wózek, jakby to była taca z herbatą.\n\nOstatnie, co słyszałem o Gienku, to że nie może sam wstać z fotela.\n\n„Gienek. Muszę zapytać. Jakim cudem? Jesteś sześć lat starszy ode mnie”.\n\n„Chcesz szczerą odpowiedź?”\n\n„Byłem na rehabilitacji. Biorę proszki. Mam w szufladzie jedenaście opasek. Nic tego nie rusza”.\n\n„I nie ruszy. Dwa lata temu było ze mną gorzej niż z tobą. Ze schodów w domu zjeżdżałem na tyłku. Rzuciłem robotę i wszystkim naokoło wmawiałem, że to kręgosłup”.\n\nPowiedziałem: chyba żartujesz.\n\n„Mówię całkiem poważnie. Gdzie cię boli? Całe kolano dookoła czy w jednym miejscu?”\n\nPowiedziałem, że całe. Sam nie wiedziałem.\n\n„Naciśnij tutaj. Zaraz pod rzepką. Dwa palce niżej”.\n\nNacisnąłem. I tam to siedziało. Cały ten ból, dokładnie pod dwoma palcami.\n\n„No właśnie. O tym nikt nam nie mówi. Każdy chłop w naszym wieku myśli, że kolano jest po prostu stare, więc je oszczędza, ściska ściągaczem, łyka tabletki i zwala na PESEL, kiedy nic się nie zmienia”.\n\nStuknął kłykciem w betonową płytę.\n\n„Przy każdym kroku w dół cały twój ciężar idzie przez ten jeden punkt. Punkt wielkości monety. To tak, jakbyś zaparkował załadowanego busa na pięciozłotówce, Tadziu. Przy każdym kroku”.\n\nZaparkowałem w życiu wystarczająco dużo busów na podjazdach, żeby wiedzieć, co taki nacisk robi z kostką.\n\n„To nie jest twój wiek. To ten punkt. Orteza oplata cały staw. Ściągacz z apteki tylko go dusi. Tabletka zagłusza sygnał. Żadna z tych rzeczy nie zdejmuje ciężaru z tego punktu. Próbowałeś leczyć problem mechanicznego nacisku proszkami przeciwbólowymi”.\n\nPodciągnął nogawkę spodni roboczych. Wąski czarny pasek, tuż pod rzepką. Nic dookoła samego kolana.\n\n„Tylko tyle. To zmieniło wszystko. Siada dokładnie na tym punkcie i przejmuje obciążenie, zanim uderzy w staw. Podobno projektowali to przez trzy lata z chirurgami ortopedami. Wyśmiałem żonę, jak mi to zamówiła. Noszę to od półtora roku. Wiedziałem już pierwszego ranka”.\n\n„Pasek? Daj spokój, Gienek. Miałem ortezy z szynami. Opaski. Wszystko”.\n\n„Wiem. Mówiłem dokładnie to samo. Miałeś rzeczy, które się rozciągają. Wszystko, co jest z gumy, poddaje się pod ciężarem. To się nie rozciąga i nie oplata kolana”.\n\nWyjął zza ucha ołówek stolarski i napisał mi drukowanymi literami na odwrocie faktury: **SARDIAN**.\n\n„Załóż to i zejdź po własnych schodach. Będziesz wiedział w minutę”.\n\nZamówiłem jeszcze tego samego wieczoru, siedząc w busie przed domem. Mieli akurat ofertę dwa w cenie jednego.\n\nPrzyszło w następną środę. Zostawiłem pudełko na blacie w kuchni, kiedy jadłem kolację. Zosia wzięła je do ręki.\n\n„Co to jest?”\n\n„Coś, co polecił mi Gienek”.\n\n„Już to wcześniej słyszałam, Tadziu”.\n\n„To nie patrz”.\n\nWyszło ostrzej, niż chciałem. Nie patrzyła.\n\nNastępnego ranka założyłem go w łazience, na gołą skórę, tuż pod rzepką i naciągnąłem na wierzch spodnie. Mieści się pod nogawką i nikt nawet nie wie, że go masz. Potem stanąłem na szczycie schodów.\n\nZszedłem po nich przodem. Jedna stopa na każdy stopień. Pierwszy raz od dwóch lat.\n\nNie powiedziałem jej. Sam w to jeszcze nie wierzyłem. Na dole zdjąłem go, wszedłem z powrotem na górę i znów było jak dawniej: prawa stopa, lewa dostawiana obok. Założyłem go ponownie i zszedłem na dół. Przodem.\n\nPotem wyszedłem do busa, otworzyłem drzwi, wsiadłem, pojechałem na robotę i wysiadłem na miejscu bez trzymania się drzwi. Nawet nie zauważyłem, że się ich nie złapałem, dopóki nie byłem w połowie podjazdu z taczką.\n\nTo był pierwszy dzień.\n\nDwa dni później Łukasz zatrzymał się z taczką piasku i rzucił: „Szybki dziś jesteś, szefie”. Do dziś nie wie dlaczego. Pasek jest pod spodniami.\n\nW weekend sąsiad zza płotu krzyknął: „Nie poznałem cię od tyłu!”.\n\nW tamtą niedzielę Zosia poszła do garażu po wkrętarkę z dolnej półki, tak jak robiła od dwóch lat, żebym nie musiał się po nią schylać. Już tam kucałem. Podałem jej wkrętarkę do ręki. Tylko na mnie popatrzyła.\n\nKiedy następnym razem pojechaliśmy na zakupy, wróciła do samochodu po drugą partię siatek, a bagażnik był pusty. Wszystkie torby stały już na stole w kuchni.\n\nW piątek wyrzuciłem zawartość całej szuflady. Wszystkie jedenaście sztuk.\n\n„Wszystkie?”, zapytała Zosia.\n\n„Wszystkie. Trzymałem je, bo myślałem, że problemem jest moje kolano”.\n\nW maju zdjąłem nakolanniki z gwoździa.\n\nZosia wróciła do domu w sobotnie popołudnie i zastała mnie na kolanach na końcu naszego ogrodu, jak układałem kamienny taras, o który prosiła od sześciu lat. Stała w drzwiach tarasowych z kluczami w dłoni.\n\n„Tadziu...”\n\nTylko tyle powiedziała. Później przyznała mi się, że stała tam dobrą minutę, zanim wydusiła słowo. Człowiek klęczący w tym ogrodzie był kimś, kogo kiedyś znała.\n\nKilka tygodni później zabrałem nas z powrotem do tamtego centrum ogrodniczego przy wylotówce.\n\n„Po co tu zjeżdżamy?”\n\n„Po ziemię do kwiatów”.\n\nWracaliśmy przez parking i zza rzędu aut znów za szybko wyjechał samochód, prosto w jej stronę. Byłem przy niej w trzech krokach i przyciągnąłem ją za ramię.\n\nTen sam parking. I ten sam młody chłopak w zielonym polarze, zbierający wózki. Widział całą sytuację.\n\nSpojrzał na mnie, potem na Zosię. „Wszystko w porządku, proszę pana? Nic się żonie nie stało?”\n\nOdpowiedziałem: „Wszystko w porządku. Dziękuję, młody”.\n\nPotem podniosłem jedną ręką wielki, osiemdziesięciolitrowy worek ziemi i wrzuciłem go do bagażnika. Tym razem niczego nie upuściłem.\n\nW samochodzie, zanim jeszcze zdążyłem włożyć kluczyk do stacyjki, pocałowała mnie. Tak jak kiedyś.\n\nNie będę udawał, że znów mam trzydzieści lat. W moich kolanach siedzi trzydzieści lat układania podjazdów. Wciąż klękam na podkładce. W chłodny poranek wciąż czuję sztywność, dopóki się nie rozchodzę. A sąsiad zza płotu nosi teraz mój drugi, zapasowy pasek, bo nie mogłem już patrzeć, jak schodzi po własnych schodkach bokiem.\n\nAle nie jestem jej ojcem.\n\nJeśli zacząłeś czekać w samochodzie, aż twoja żona sama zapakuje zakupy.\nJeśli trzymasz się drzwi auta przez kilka sekund, zanim noga pozwoli ci zrobić krok.\nJeśli ktoś wziął cię za starszego, niż jesteś, a najbliższa ci osoba go nie poprawiła.\n\nByć może u ciebie to też nie jest kwestia wieku.\n\nTo, co pokazał mi Gienek, nie jest ortezą ani zwykłym ściągaczem z apteki. Siada na jednym punkcie pod rzepką i przejmuje ciężar, zanim uderzy on w staw. Zdejmuje busa z monety, jak ujął to Gienek. Dają teraz drugi pasek gratis (1+1), po jednym na każde kolano albo drugi dla znajomego, który też ukrywa swój ból. Masz 60 dni gwarancji zwrotu, bez żadnych głupich pytań.\n\nNazywa się **Sardian™**. Dokładnie tak, jak Gienek zapisał mi na odwrocie faktury.\n\n👉 Sprawdź tutaj, jak działa opaska podrzepkowa (60 dni na test w domu): https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial\n\nP.S. Zosia kazała dopisać, że drzewko laurowe przeżyło. Stoi przed drzwiami wejściowymi."
  },
  "stryde-02-131-nocy-w-fotelu-w-salonie": {
    "headline": "Wrócił na górę do łóżka.",
    "description": "Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu, bez zbędnych pytań.",
    "primaryText": "Mój mąż spał w swoim fotelu w salonie przez 131 nocy. Mówił, że to przez kręgosłup. To nie był kręgosłup.\n\nWtorek, 12 maja. Godzina 2:40 w nocy.\n\nPamiętam dokładną godzinę, bo spojrzałam na budzik w sekundzie, w której to usłyszałam. Trzeci stopień.\n\nNasz trzeci stopień skrzypi od dnia, w którym się tu wprowadziliśmy. Czwarty charakterystycznie klika, bo obluzował się w nim gwóźdź. Skrzypnięcie, klik. Przez lata był to dźwięk naszej córki Asi wracającej późno do domu.\n\nTamtej nocy rozległo się skrzypnięcie. A potem cisza.\n\nLeżałam w ciemności i czekałam na kliknięcie czwartego stopnia. Nie nadeszło. Pół minuty, może dłużej. Potem znów skrzypnięcie, w drugą stronę i odgłos sprężyn jego fotela w salonie.\n\nMój mąż miał 72 lata i w środku nocy próbował wejść po schodach do łóżka tylko po to, żebym nie widziała, jak ponosi porażkę.\n\nPiszę to, bo jeśli kiedykolwiek leżałaś bezsennie, słuchając, jak dumny mężczyzna ukrywa, jak bardzo jest źle, to wiesz, co czułam tamtej nocy. A to, co wydarzyło się później, może być najbardziej przydatną rzeczą, jaką przeczytasz w tym roku.\n\nZacznę od początku.\n\nMam na imię Karolina. Mam 69 lat. Przez 22 lata pracowałam w sekretariacie szkoły podstawowej. Darek ma 72 lata. Przez 47 lat był glazurnikiem, odkąd skończył szesnaście lat, aż do przejścia na emeryturę w wieku 63. Na jego busie widniał zielony napis „D. Kowalski, Glazura i Terakota”, który namalował własnoręcznie, bo nie zamierzał płacić za reklamę.\n\nWyłożył płytkami połowę łazienek w naszej dzielnicy. Do dziś nie można postać w kolejce w piekarni, żeby czyjaś mama nie wspomniała, że Darek robił jej prysznic w 1994 roku i ani jedna fuga nie pękła.\n\nW 1979 roku przyjął na przyuczenie młodego chłopaka, Michała. Nauczył go wszystkiego. W 1988 Michał poszedł na swoje i zabrał ze sobą dwóch najlepszych klientów Darka, czego Darek nigdy mu do końca nie wybaczył. Kiwają sobie głową na powitanie, gdy miną się na ulicy. I to by było na tyle.\n\nMieszkamy w tym samym domu od 1983 roku. Czternaście stromych stopni z zakrętem u samej góry. Darek obiecuje naprawić trzeci i czwarty stopień od 43 lat. Nigdy tego nie zrobił. Mówi, że dzięki nim wie, kto idzie.\n\nZaczęło się powoli, jak to zwykle bywa.\n\nOkoło dwóch lat temu przeniósł swoją maszynkę do golenia na parapet w kuchni. Żeby mnie rano nie budzić, tak powiedział. Wstaję o szóstej rano od 1983 roku. Nigdy w życiu mnie nie obudził.\n\nPotem zaczęło się z okularami. Co wieczór zostawiał je na górze i co wieczór słyszałam: „Karolciu, skoczyłabyś na górę po moje okulary?”. Człowiek, który przez 47 lat mierzył wszystko co do milimetra.\n\nPotem zaczął chodzić po jednym stopniu. Obie ręce zaciśnięte na poręczy. Prawa stopa w górę, lewa dostawiana obok. Prawa w górę, lewa obok. Dokładnie tak, jak robił to nasz wnuczek, kiedy miał dwa latka.\n\nPrzestał klękać. Czterdzieści siedem lat pracy na kolanach, a teraz, gdy coś mu upadło na podłogę, patrzył na ten przedmiot, potem patrzył na mnie i czekał.\n\nPrzed Bożym Narodzeniem wejście na te czternaście stopni zajmowało mu prawie cztery minuty. Raz zmierzyłam ten czas zegarkiem, a potem nienawidziłam samej siebie za to, że to zrobiłam.\n\nOczywiście byliśmy u lekarza. Nasza pani doktor w przychodni to przemiła kobieta, ale ma pełen korytarz pacjentów.\n\n„Zużycie materiału, panie Darku. Wiek i zawód robią swoje”.\n\nTabletki. Potem silniejsze tabletki. Wreszcie prześwietlenie. W lewym kolanie starcie chrząstki, „kość o kość”. Prawe, jak powiedziała lekarka, „niewiele lepsze”.\n\nWypisała skierowanie na endoprotezę. Czas oczekiwania w kolejce: osiemnaście miesięcy.\n\n„Poczekam”, powiedział Darek i wsunął skierowanie za zegar na kominku.\n\nDostał blokadę sterydową. Dała mu pięć dobrych tygodni. A potem pewnego popołudnia wrócił z ogródka, trzymając się futryny drzwi i wszystko wróciło.\n\nOsiemnaście miesięcy. Policzyłam to kiedyś na odwrocie koperty, siedząc w samochodzie pod przychodnią. Około 540 nocy.\n\nBył wpisany na listę oczekujących na nowe kolano. Nikt nie wpisał go na listę tych, którzy muszą jakoś wejść po schodach w międzyczasie.\n\nZałożyłam więc szufladę. Na pewno znasz taką szufladę. Druga od góry, obok kuchenki. Elastyczne opaski z apteki, które w godzinę zwijały mu się wokół kostek. Żele śmierdzące szatnią sportową. Wielka orteza z metalowymi szynami po bokach, którą założył raz, przeszedł się do końca ulicy i stwierdził, że czuje się, jakby szedł w rusztowaniu. Tani pasek na rzep z internetu, który przekręcał mu się na bok kolana za każdym razem, gdy usiadł.\n\nPierwszą noc w fotelu spędził w niedzielę, 25 stycznia. W czterdzieste urodziny naszej Asi.\n\nMieliśmy w domu całą rodzinę. Kiedy goście wyszli, Darek usiadł w swoim fotelu i już z niego nie wstał.\n\nO wpół do jedenastej zapytałam: „Idziesz na górę?”.\n\n„Nie dzisiaj, kochanie. Plecy mnie bolą. W fotelu mi lepiej”.\n\nTo nie były plecy.\n\nChwilę później zapytał: „Przyniosłabyś mi poduszkę?”.\n\nPoszłam na górę, wzięłam jego poduszkę z naszego łóżka i zniosłam mu ją do salonu. Myślę, że to było dla niego gorsze niż sam ból. To, że musiał poprosić.\n\nPoduszka została już na dole.\n\nWszyscy wiedzieli i nikt nic nie mówił. Asia wpadała w odwiedziny, patrzyła na poduszkę w fotelu, patrzyła na mnie, a ja tylko kręciłam głową.\n\nMył się przy zlewie w kuchni. 72-letni mężczyzna myjący się co rano przy kuchennym zlewie, jak jego ojciec w 1955 roku, tylko po to, żeby nie musieć mierzyć się ze schodami do łazienki. Wnukowi tłumaczył, że to „stara szkoła”. Mały był zachwycony.\n\nBogu dzięki za toaletę na parterze. Darek sam ją zrobił w 2004 roku, kiedy wprowadziła się do nas moja mama i wyłożył ją błękitnymi kafelkami, które nazywał śródziemnomorskimi. Przez cztery miesiące była to jedyna toaleta, do której był w stanie dotrzeć.\n\nZadzwoniłam do prywatnej kliniki, nie mówiąc mu o tym. Operacja poza kolejką NFZ kosztowała 28 000 zł. Nie mamy 28 000 zł.\n\nW kwietniu przyszedł przedstawiciel od krzesełek schodowych. Darek przesiedział całą wizytę z założonymi rękami. Wycena wyszła na 24 000 zł przez ten zakręt u góry schodów. Folder reklamowy wylądował w koszu na makulaturę, zanim auto przedstawiciela wyjechało z naszej ulicy.\n\nA potem przyszedł maj i to nocne skrzypnięcie bez kliknięcia.\n\nUsłyszałam je kolejnej nocy. I następnej. Zawsze około tej samej godziny. Zawsze skrzypnięcie trzeciego stopnia, długa cisza i brak kliknięcia czwartego. Przestałam sypiać. Leżałam w ciemności, nasłuchując dźwięku, który nie nadchodził.\n\nW czwartek rano, za dziesięć szósta, zeszłam na dół, zanim się obudził. I wtedy to zobaczyłam. Pasek niebieskiej taśmy malarskiej przyklejony przy samej krawędzi czwartego stopnia. Zauważyłbyś go tylko wtedy, gdybyś wiedział, czego szukać.\n\nGlazurnik zaznacza kawałkiem taśmy miejsce, do którego musi dociągnąć poziom. Darek robił to każdego dnia swojej pracy przez całe życie.\n\nZaznaczył sobie czwarty stopień.\n\nPrzy śniadaniu powiedział: „Spałem w tym fotelu jak zabity”.\n\nOdpowiedziałam: „To dobrze, kochanie”. A potem wyszłam do ogrodu, żeby nie widział mojej twarzy.\n\nW tamtym tygodniu przechodziłam obok sklepu medycznego w centrum. Na wystawie stał fotel pionizujący, taki, który sam wypycha człowieka do stania. Za 4 800 zł. Stałam na chodniku, patrząc na tę witrynę i pomyślałam: a więc tak to się kończy. Fotel, który musi cię postawić na nogi, bo nie potrafisz wejść do własnego łóżka.\n\nPani ze sklepu wyszła zapytać, czy dobrze się czuję. Powiedziałam, że tak.\n\n18 maja zmarł Franek. Miał 76 lat. Był tynkarzem i przepracował z Darkiem i Michałem więcej budów, niż którykolwiek z nich potrafił zliczyć.\n\nPogrzeb odbył się w piątek 29 maja, a po nim spotkanie w sali parafialnej.\n\nDarek usiadł w pierwszej minucie po wejściu i nie podniósł się z krzesła przez całe popołudnie.\n\nPo drugiej stronie sali siedział Michał. Ma dziś 68 lat. Czterdzieści lat na kolanach.\n\nOkoło wpół do czwartej jeden z prawnuków Franka strącił ze stołu talerz z kanapkami na dywan. A Michał po prostu przyklęknął na jedno kolano, żeby je pozbierać. Tak po prostu. Zszedł na kolano, pozbierał, oparł dłoń o udo, wstał i wrócił do rozmowy.\n\nSpojrzałam na Darka. Darek też na niego patrzył.\n\nKiedy Michał wychodził do samochodu, poszłam za nim. Sama nie wiem, co mnie podkusiło. Chyba na pogrzebach mówi się rzeczy, których nigdy nie powiedziałoby się w zwykły wtorek. Poza tym był jedynym człowiekiem na tej sali, który wiedział, co czterdzieści lat na zimnej posadzce robi z kolanami.\n\nDogoniłam go na parkingu i zapytałam: „Michał. Jak ty to zrobiłeś?”.\n\nPatrzył na mnie przez dłuższą chwilę.\n\n„Jest z nim źle, prawda?”\n\nOpowiedziałam mu wszystko. O fotelu. O poduszce. O myciu się przy kuchennym zlewie. O niebieskiej taśmie na czwartym stopniu. O tej taśmie nie powiedziałam wcześniej nikomu, nawet naszej Asi.\n\nMichał oparł się o maskę samochodu. „Byłem w tej samej kolejce co on, pani Karolino. W lutym wchodziłem po schodach na własnym tyłku”.\n\nA potem podciągnął nogawkę czarnych garniturowych spodni. Tuż pod rzepką miał założony wąski czarny pasek. Nie wokół kolana. Pod nim.\n\nPowiedziałam: „Michał, my mamy całą szufladę takich opasek”.\n\nA on na to: „Nie, nie macie. To, co macie w szufladzie, oplata całe kolano”. Po czym powiedział coś, co słyszałam z ust Darka tysiąc razy, ale nigdy w odniesieniu do jego własnych nóg: „Pamięta pani, co Darek zawsze mi powtarzał? Nigdy nie kładź płytek na miękkim podłożu. Musisz przenieść ciężar na twarde punkty”.\n\nStuknął palcem w czarny pasek. „To robi dokładnie to samo”.\n\nPowiedział mi, że córka założyła mu go w lutym i już pierwszego ranka wszedł na piętro do łazienki bez zatrzymywania się na półpiętrze. Pierwszy raz od dwóch lat.\n\n„Od pierwszego założenia”, powiedział. „Myślałem, że mi młoda czegoś dosypała do herbaty”.\n\nNadal jest w kolejce na zabieg, tak swoją drogą. Mówi, że jak zadzwonią ze szpitala, to pójdzie, ale wejdzie tam na własnych nogach.\n\nNie miał przy sobie żadnej kartki, więc wyjął z wewnętrznej kieszeni marynarki obrazek pogrzebowy Franka i na odwrocie napisał drukowanymi literami nazwę.\n\n**SARDIAN.**\n\nTrzymałam ten obrazek w torebce przez całą drogę do domu, zaciskając na nim dłoń.\n\nTamtej nocy siedziałam w Internecie prawie do trzeciej nad ranem.\n\nChcę wam to wytłumaczyć tak, jak wytłumaczyłabym własnej siostrze. Byłam sekretarką w szkole, nie jestem lekarzem, więc opiszę to tak, jak sama to zrozumiałam.\n\nTwoja rzepka trzyma się na ścięgnie. To grube pasmo, które biegnie od dołu rzepki do kości piszczelowej. Za każdym razem, gdy wchodzisz lub schodzisz po stopniu, cały ciężar twojego ciała uderza w staw kolanowy.\n\nW młodym kolanie ten ciężar amortyzuje chrząstka. Działa jak poduszka.\n\nDarek nie ma już tej poduszki. To właśnie oznacza „kość o kość”. I będę z wami całkowicie szczera, bo sama chciałabym, żeby ktoś był ze mną szczery: żadna rzecz założona na nogę nie sprawi, że chrząstka odrośnie. Kość o kość to kość o kość. Ktokolwiek twierdzi inaczej, kłamie.\n\nAle wtedy przypomniałam sobie słowa Michała: *Nigdy nie kładź płytek na miękkim podłożu.*\n\nGdy w podłodze jest miękkie, wyrobione miejsce, nie kładziesz na nim płytek bezpośrednio, bo zapadną się i popękają. Nie zrywasz też całego stropu. Przenosisz ciężar na twarde, stabilne elementy wokół, żeby odciążyć wyrobiony punkt.\n\nW kolanie Darka tym wyrobionym miejscem jest sam staw, w którym starła się poduszka. Ale ścięgno pod rzepką jest twarde, podobnie jak kość piszczelowa poniżej. To są te twarde punkty.\n\nI dokładnie to robi ten pasek. Siada w jednym punkcie, na ścięgnie tuż pod rzepką i przejmuje napięcie. Dzięki temu przy każdym kroku większa część siły rozchodzi się przez ścięgno, a znacznie mniej uderza w wytarty staw. Pasek nie zmniejsza wagi człowieka. On po prostu przesuwa obciążenie z miejsca, które nie daje już rady go dźwigać.\n\nI nagle zawartość naszej kuchennej szuflady nabrała sensu.\n\nElastyczne ściągacze oplatają całe kolano. Ściskają chore miejsce, ale nie przenoszą ciężaru nigdzie indziej.\nMaści i zastrzyki na chwilę znieczulają punkt, ale przy każdym kroku cały ciężar nadal w niego uderza.\nWielka orteza z szynami usztywnia całą nogę jak gips, ale w ogóle nie dotyka punktu pod rzepką.\nA tani pasek z internetu miał dobry zamysł, ale brakowało mu wyprofilowanego rdzenia, więc zsuwał się przy każdym ruchu.\n\nPrawie dwa lata naszych pieniędzy i naszych nadziei w jednej szufladzie i ani jedna rzecz w niej nie zdejmowała ciężaru z właściwego punktu.\n\nZamówiłam opaskę dziesięć po trzeciej w nocy, kiedy Darek chrapał na dole w salonie.\n\nNie robiłam sobie wielkich nadziei, powiem wprost. Zbyt wiele razy się sparzyłam. Ale była tam 60-dniowa gwarancja zwrotu bez podawania przyczyny. Pomyślałam: jeśli trafi do szuflady jak reszta, odzyskam pieniądze, a Darek nawet się nie dowie.\n\nMieli promocję „kup 1, druga gratis” (1+1). Pasowało mi to idealnie, bo lekarka już wcześniej uprzedzała, że prawe kolano idzie w ślady lewego.\n\nPaczka przyszła w piątek, 5 czerwca.\n\nNie powiedziałam ani słowa. Położyłam pudełko na podłokietniku jego fotela, na wierzchu położyłam obrazek pogrzebowy Franka z napisem i poszłam zmywać naczynia.\n\nPo chwili usłyszałam z salonu: „Co to jest?”.\n\nStanęłam w progu, wycierając ręce w ścierkę. Odwrócił obrazek na drugą stronę. Patrzył na drukowane litery.\n\n„To pismo Michała”.\n\n„Tak”.\n\n„Po co Michał pisał na klepsydrze Franka?”\n\n„Powiedziałaś Michałowi”.\n\n„Powiedziałam”.\n\n„O taśmie na schodach też?”\n\n„O taśmie też”.\n\nPrzez dłuższą chwilę wpatrywał się w napis.\n\n„Kazał ci coś przekazać”, dodałam cicho. „Kazał ci przypomnieć, że nigdy nie kładzie się płytek na miękkim podłożu”.\n\nDarek nic nie odpowiedział. Popatrzył na pudełko, potem znów na pismo Michała.\n\n„Sam go tego nauczyłem”, mruknął.\n\n„Wiem, że ty, kochanie”.\n\nTamtego wieczoru poszłam na górę wcześniej, jeszcze przed Wiadomościami. Bałam się, że zdradzi mnie wyraz twarzy.\n\nLeżałam w ciemności przy zgaszonym świetle.\n\nZa kwadrans dziesiąta trzeci stopień zaskrzypiał.\n\nWstrzymałam oddech.\n\nA sekundę później, *klik*.\n\nPrzez 131 nocy ani razu nie usłyszałam pod nim tego kliknięcia.\n\nPiąty stopień. Szósty. Słyszałam jego dłoń przesuwającą się po drewnianej poręczy aż na samą górę. Zakręt przy półpiętrze. Myślałam tylko: *nie waż się spaść, Darek, tylko się nie przewróć*. Korytarz. Drzwi naszej sypialni.\n\nWszedł ze swoją poduszką pod pachą, usiadł na swojej połowie łóżka i zdjął kapcie, najpierw jeden, potem drugi.\n\n„Posuń się”, powiedział.\n\nPrzez długą chwilę nie mówił nic więcej. Dopiero potem, w ciemności:\n\n„Karolina”.\n\n„Co?”\n\n„Nie uciekło. Na czwartym”.\n\nZasnął w jakieś cztery minuty i zaczął chrapać. Nigdy w życiu nie byłam tak szczęśliwa, słysząc chrapiącego mężczyznę.\n\nPrzez dwadzieścia cztery noce próbował pokonać te schody po ciemku i ani razu nie przeszedł za niebieską taśmę. Pierwszej nocy z opaską przeszedł prosto nad nią.\n\nW sobotę rano maszynka do golenia wróciła do łazienki na piętrze.\n\nW niedzielę wziął na górze prysznic. Pierwszy raz od stycznia. Siedział tam dwadzieścia minut i fałszował pod nosem stare piosenki, a ja siedziałam na schodach pod łazienką i płakałam jak głupia.\n\nNiebieska taśma zniknęła z czwartego stopnia jeszcze w tym samym tygodniu. Znalazłam ją zwiniętą w małą kulkę w kieszeni jego swetra, kiedy robiłam pranie. Mam ją do dzisiaj. Nie pytajcie dlaczego.\n\nDopiero Asia powiedziała to głośno przy niedzielnym obiedzie, zerkając na fotel w salonie.\n\n„Mamo. A gdzie poduszka taty?”\n\n„Na górze”, odpowiedziałam. „Tam, gdzie jej miejsce”.\n\nW kolejny piątek Darek spotkał Michała. Podali sobie ręce bez słowa. Trzydzieści osiem lat milczenia załatwione jednym uściskiem dłoni, więcej ci dwaj nigdy sobie nie powiedzą.\n\nW sierpniu pojechaliśmy na tydzień nad morze, nasze pierwsze wakacje od trzech lat. Codziennie rano schodził po schodkach na plażę, z jedną ręką na barierce i termosem w drugiej.\n\nNie będę udawać, że wydarzył się cud i wszystko zniknęło.\n\nJego kolana wciąż mają 72 lata. Lewe jest sztywne rano, dopóki nie wypije gorącej herbaty. Zawsze trzyma się poręczy, jak każdy rozsądny człowiek w tym wieku. Nadal jest w kolejce na zabieg i kiedy przyjdzie termin, sam zdecyduje.\n\nAle fotel w salonie znów jest po prostu fotelem. Na oparciu leży złożony koc w kratę. A poduszka leży na naszym łóżku, gdzie jej miejsce od 1983 roku.\n\nTrzeci stopień skrzypi teraz co wieczór około wpół do jedenastej. A zaraz po nim słychać kliknięcie czwartego.\n\nJeśli w twoim domu na fotelu w salonie leży poduszka, napisałam to dla ciebie.\nJeśli mąż wmawia ci, że to kręgosłup.\nJeśli przeniósł maszynkę do golenia na dół.\nJeśli myje się przy zlewie w kuchni.\nJeśli masz w domu szufladę pełną opasek z apteki.\n\nTo nie jest kolejny rękaw ani sztywna orteza. To jeden wąski pasek, który siada w jednym punkcie, na ścięgnie tuż pod rzepką i zmienia rozkład sił, dzięki czemu mniejszy ciężar uderza w wytarty staw. Nic nie odbuduje chrząstki. Ten pasek po prostu przenosi ciężar na twarde punkty.\n\nW pakiecie 1+1 dostajesz drugą opaskę gratis, po jednej na każde kolano. Masz 60 dni gwarancji zwrotu bez żadnych pytań: jeśli opaska wyląduje w szufladzie, odzyskasz pieniądze. Nasza nawet nie zbliżyła się do szuflady.\n\nKażda noc spędzona w tamtym fotelu to noc, której żadne z was już nie odzyska. Darek stracił ich 131. Nie czekaj, aż na twoich schodach pojawi się taśma malarska.\n\n👉 Zobacz pełną historię i sprawdź opaskę z 60-dniową gwarancją zwrotu: https://sprobujsardian.pl/pages/131-nocy-w-fotelu\n\nP.S. Darek do dziś nie przyzna, że chodziło o kolana. Jak go zapytasz, powie ci, że od spania w tamtym fotelu strasznie bolały go plecy.\n\nP.P.S. Krzesełko schodowe wycenili na 24 000 zł. Fotel pionizujący kosztował 4 800 zł. Prywatna operacja poza kolejką, 28 000 zł. Darek nadal czeka w kolejce na NFZ. Ale to ten pasek pozwolił mu wrócić po schodach do sypialni, zanim doczeka terminu."
  },
  "stryde-03-zona-zadzwonila-po-78-letniego-brata-do-drabiny": {
    "headline": "Żona zadzwoniła po mojego brata do mojej drabiny.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu.",
    "primaryText": "Przyłapałem żonę z moim bratem. On ma 78 lat. Ja mam 64. I to najlepsza rzecz, jaka przydarzyła mi się od lat.\n\nPozwólcie, że cofnę się o kilka miesięcy.\n\nBył wtorek w czerwcu. Siedziałem w fotelu w pokoju przed telewizorem, Halina rozmawiała przez telefon w kuchni, a ścianka działowa między naszym pokojem a kuchnią jest cienka.\n\n„Mógłbyś podjechać, Edek? Twój brat nie da już rady wejść na drabinę”.\n\nA potem zaśmiała się cicho. Nie złośliwie. Tak, jak śmiejesz się z rzeczy, o której wszyscy w rodzinie i tak już wiedzą.\n\nEdek to mój starszy brat. O czternaście lat starszy ode mnie.\n\nCzterdzieści minut później był na górze mojej drabiny strychowej. A ja stałem na dole, z pustymi rękami.\n\nPodał mi z góry dziecięce łóżeczko w trzech częściach. Potem zszedł na dół, wytarł dłonie o spodnie i zapytał, czy nastawimy wodę na herbatę.\n\nA to, co pokazał mi przy swoim kuchennym stole w kolejną niedzielę, jest powodem, dla którego dziś znów sam wchodzę po własnej drabinie.\n\nPrzez czterdzieści jeden lat montowałem instalacje grzewcze i piece. Nie uwierzylibyście, ilu ludzi trzyma bojlery i naczynia wzbiorcze na poddaszu. W życiu musiałem wejść po jakichś czterystu drabinach strychowych. Wchodziłem po nich z torbą narzędziową w jednej ręce. Przestałem pracować w wieku sześćdziesięciu dwóch lat, przez kolano. Wszystkim wokół powiedziałem po prostu, że czas na emeryturę.\n\nPo świętach Bożego Narodzenia trzeba było wynieść pudła z bombkami z powrotem na strych. Powiedziałem: zrobię to w sobotę. W niedzielę Halina zadzwoniła po Edka.\n\nW lutym poprosiła mnie o zniesienie dużej walizki ze strychu, bo na Wielkanoc jechaliśmy do jej siostry nad morze. Powiedziałem: w sobotę. Przyszła sobota, stanąłem pod drabiną z dłonią na drugim szczeblu i nie wszedłem. Skłamałem, że odezwały mi się korzonki. Pojechaliśmy z małymi torbami.\n\nNa miejscu okazało się, że Halina zarezerwowała nam pokój na parterze. Nikt nic nie skomentował. Nikomu to nie przeszkadzało.\n\nMnie przeszkadzało.\n\nA w czerwcu przyszła pora na łóżeczko. Nasz syn Kamil z żoną spodziewają się w październiku pierwszego dziecka. To łóżeczko stało na naszym strychu, odkąd sam Kamil z niego wyrósł. Halina chciała je znieść i odświeżyć. Obiecałem, że zniosę je w weekend. Usłyszałem ją z telefonem w kuchni, zanim zdążyłem dopić herbatę.\n\nPowinienem opowiedzieć wam o moim kolanie. Głównie prawym, choć lewe też zaczęło już dołączać. Równia pochyła trwała od trzech lat.\n\nTępy ból jak ból zęba, przez cały dzień. Uczucie luźnego żwiru pod rzepką przy każdym zgięciu. Schodzenie w dół było najgorsze. Schodziłem po schodach po jednym stopniu, z dłonią płasko opartą o ścianę, a na czwartym stopniu zawsze było słychać głuche kliknięcie.\n\nDwie tabletki do porannej herbaty. Dwadzieścia minut siedzenia na brzegu łóżka, zanim w ogóle odważyłem się zaufać schodom. Przerobiłem opaski elastyczne z apteki. Mam ich dziewięć w reklamówce na dnie szafy. Dwa zastrzyki w kolano. Pierwszy dał mi dobry miesiąc. Drugi nie dał absolutnie nic. Lekarz powiedział, że to zużycie, kazał się ruszać i przyjść, jak będzie gorzej.\n\nMój ojciec chodził o lasce w wieku sześćdziesięciu pięciu lat. Pamiętam, jak lekarz powiedział kiedyś, że to rodzinne i pomyślałem sobie wtedy: no cóż, czyli teraz moja kolej.\n\nW niedzielę po akcji z łóżeczkiem pojechaliśmy do Edka na obiad. Mieszka sam w sąsiednim miasteczku, odkąd zmarła jego żona.\n\nKiedy podjechaliśmy pod jego dom, stał na własnej drabinie pod rynną i czyścił ją z liści. Siedemdziesiąt osiem lat. Na drabinie. Sam.\n\nSam przygotował cały obiad. Kiedy ziemniaki były gotowe, przyklęknął na jedno kolano przed dolnym piekarnikiem, wyjął gorącą blachę i wstał bez podpierania się o blat.\n\nPatrzyłem, jak to robi. Nie odezwałem się słowem. Tylko jadłem obiad.\n\nPo obiedzie, kiedy Halina wyszła do ogrodu obejrzeć jego róże, Edek powiedział coś, co ścisnęło mnie za gardło.\n\n„Na pogrzebie mamy w listopadzie schodziłeś po jej schodach z ręką na ścianie. Dokładnie tak, jak kiedyś ojciec. I klika ci w kolanie. Wszyscy to słyszą, Staszek. Tylko nikt ci tego w oczy nie powie”.\n\nPogrzeb mamy był w listopadzie. Myślałem, że dobrze się wtedy trzymałem. Myślałem, że nikt nie zauważył.\n\nSiedziałem nad kubkiem herbaty i nie potrafiłem wydusić słowa. Sam patrzyłem kiedyś, jak nasz ojciec schodził po tamtych schodach z dłonią na tej samej ścianie i przysięgałem sobie, że nigdy nie skończę w ten sposób. A jednak tam byłem. Wszyscy to widzieli.\n\n„Patrzyłem na ciebie na pogrzebie i trzymałem język za zębami”, ciągnął Edek. „Ale kiedy Halina zadzwoniła do mnie w sprawie tego łóżeczka, powiedziałem dość. Nie będę patrzył, jak zamieniasz się w ojca, Staszek”.\n\nZapytał, jak to dokładnie boli. Więc mu powiedziałem. O bólu zęba w kolanie. O żwirze pod rzepką. O kliknięciu na czwartym stopniu.\n\nPowiedział krótko: „Cały ten ból idzie z jednego punktu”.\n\nA potem opowiedział mi coś, o czym nie miałem pojęcia.\n\nSiedem lat temu jego kolana posypały się dokładnie tak samo jak kolana ojca. Oba. Brał tabletki, kupował ściągacze, wszystko. Przez pięć lat nie wszedł na drabinę. Nigdy mi o tym nie wspomniał, bo też nie chciał być kolejnym w rodzinie o lasce.\n\n„Staszek, na litość boską”, spojrzał na mnie. „Czterdzieści lat robiłeś przy kotłach. Jak w układzie zaczyna tłuc ciśnienie, to co robisz?”\n\n„Szukam miejsca, w którym bije ciśnienie i odpuszczam na zaworze”.\n\n„No właśnie. To dlaczego ściskasz opaską całe kolano?”\n\nNachylił się i wcisnął dwa palce w moją nogę, tuż pod rzepką. Mało nie spadłem z krzesła.\n\n„O, tutaj. Tu ląduje cały ciężar. Przy każdym stopniu w dół cała twoja waga idzie przez ten jeden punkt na ścięgnie. To nie są ‚kolana po ojcu’, Staszek. Chodzi o to, gdzie uderza ciężar”.\n\nA potem wyjaśnił mi sprawę ze ściągaczami z apteki.\n\n„Rękaw z apteki jest z gumy. Ma dawać wrażenie, że trzyma. Na drugim szczeblu już się rozciąga, po południu wisi ci na łydce, a ten punkt pod rzepką dalej przyjmuje na siebie każdy jeden krok, podczas gdy ty myślałeś, że masz zabezpieczone kolano”.\n\nMam takich dziewięć w reklamówce w szafie. Opisał co do jednego.\n\nPotem podciągnął nogawkę spodni.\n\nWąski czarny pasek, tuż pod rzepką. Mała, profilowana podkładka leżąca prosto na ścięgnie. Nic więcej.\n\n„Noszę to od dwóch lat”, powiedział. „Siedziałem w tym przy twoim stole. Byłem w tym na pogrzebie mamy. Nawet nie zauważyłeś”.\n\nPowiedział, że nazywa się to **Sardian™**. Nie oplata stawu kolanowego. Siada na tym jednym punkcie pod rzepką i zdejmuje z niego nacisk, dokładnie jak zawór bezpieczeństwa w instalacji.\n\nDodał od razu uczciwie: nic nie sprawi, że chrząstka odrośnie. Ten pasek po prostu zdejmuje obciążenie z tego jednego punktu.\n\nPowiedziałem mu szczerze, że takie paski zawsze się zsuwają i że już raz dałem się nabrać.\n\n„Zsuwają się te, które są płaskie i oplatają kolano”, odparł. „Ten ma silikonowy rdzeń i stalowe przelotki. Zostaje w miejscu”.\n\nPoszedł do przedpokoju, wrócił z drugim paskiem, wciąż zapakowanym w folii i położył mi go na dłoni.\n\n„Sprzedają je dwa w cenie jednego. Trzymałem zapasowy”.\n\n„Dlaczego nic nie powiedziałeś? Przez dwa lata, Edek!”\n\n„Bo odpowiedziałbyś mi, że to geny po ojcu. A ja jestem twoim bratem, nie mam ci nic do sprzedania”.\n\nPo czym dodał: „Idź do łazienki i go załóż. Nie poczujesz, że coś cię ściska. Poczujesz, że ten punkt nagle cichnie. A potem przynieś mi ze strychu pudełko z medalami ojca”.\n\nZałożyłem go w łazience, na gołą skórę tuż pod rzepką i opuściłem nogawkę.\n\nJego drabina na strych ma osiem szczebli. Policzyłem każdy jeden.\n\nPierwszy szczebel. Czekałem na ukłucie.\nDrugi szczebel. Nic.\n\nWszedłem na samą górę, wyjąłem blaszane pudełko z medalami ojca spod włazu i zszedłem na dół z puszką w jednej ręce, a drugą ręką nie trzymając się niczego.\n\nPunkt pod rzepką był cichy. Nie potrafię tego inaczej nazwać. Jakby ktoś zakręcił kran, z którego kapało bez przerwy przez trzy lata.\n\nHalina wciąż była w ogrodzie przy różach. Nawet tego nie widziała. Edek po prostu poszedł wstawić czajnik.\n\nTamtego wieczoru zamówiłem pakiet dla siebie, jeden na lewe kolano, które zaczynało się odzywać i jeden na zapas. Halina skwitowała, że to już trzecia rzecz na kolana, którą kupuję w tym roku. Odpowiedziałem, że ostatnia.\n\nNastępnego ranka nie musiałem siedzieć przez dwadzieścia minut na brzegu łóżka. Zszedłem po schodach normalnie, stopa za stopą, bez dłoni przyklejonej do ściany. Na czwartym stopniu nasłuchiwałem kliknięcia. Nie jestem pewien, czy zniknęło całkowicie, ale nie potrzebowałem już ściany, żeby przez nie przejść.\n\nWe wrześniu zarezerwowaliśmy cztery dni nad morzem. W poniedziałek przed wyjazdem Halina znów zadzwoniła do Edka, żeby wpadł w weekend zdjąć ze strychu duże walizki.\n\nW środę weszła na piętro i zobaczyła obie duże walizki stojące w korytarzu pod zamkniętym włazem strychu.\n\n„Kiedy to zrobiłeś?”\n\n„Dzisiaj rano”.\n\n„Czemu nic nie powiedziałeś? Przecież...”\n\n„Przecież zadzwoniłabyś po Edka”.\n\n„Już zadzwoniłam po Edka”.\n\nZeszła na dół. Usiadłem w swoim fotelu w salonie. I chwilę później znów usłyszałem ją przez cienką ściankę kuchni. Ta sama ściana. Ten sam telefon.\n\n„Nie przyjeżdżaj, Edek. Sam je zniósł. Obie. Wiem, Edek. Wiem”.\n\nWeszła do pokoju i powiedziała, że brat mówi: „dobra robota”.\n\nKazałem mu przekazać, że nie mam jeszcze siedemdziesięciu ośmiu lat.\n\nNie będę udawał, że mam dwadzieścia pięć lat. Moje kolana mają sześćdziesiąt cztery lata. W niektóre poranki są sztywne, dopóki nie wypiję herbaty. Ale sam wchodzę i schodzę po własnej drabinie.\n\nŁóżeczko dla wnuka jest już wyczyszczone i stoi w pokoju gościnnym. Skręciłem je sam, klęcząc na dywanie z małym kluczykiem imbusowym w ręku i wstałem z podłogi bez podciągania się o ramę łóżka.\n\nKiedy w październiku urodzi się mały, usiądę z nim na tym dywanie. Mój ojciec nigdy nie mógł usiąść na podłodze z Kamilem. To właśnie tę rzecz chciałem odzyskać.\n\nMoja żona zadzwoniła po mojego brata do mojej drabiny. A on posadził mnie przy swoim stole i dał mi jedyną rzecz, jaką kiedykolwiek będę nosił na kolanie.\n\nJeśli w twoim domu ktoś zaczął dzwonić po innych do twojej drabiny.\nJeśli schodzisz po schodach z dłonią opartą płasko o ścianę.\nJeśli na dnie twojej szafy leży reklamówka pełna rozciągniętych opasek z apteki.\n\nTo nie jest opaska z apteki. Siada dokładnie na jednym punkcie pod rzepką i zdejmuje z niego ciężar, tak jak pokazał mi Edek. W ofercie 1+1 dostajesz dwie w cenie jednej, zostaw jedną sobie, a drugą daj komuś, kto chodzi tak jak ty. Masz 60 dni na test i zwrot bez żadnych pytań.\n\n👉 Sprawdź wynik Testu Schodów i odbierz pakiet 1+1 z 60-dniową gwarancją: https://sprobujsardian.pl/pages/test-schodow\n\nP.S. Edek życzy sobie, żeby odnotować, że na drabinie nadal jest szybszy ode mnie. Ma siedemdziesiąt osiem lat. Niech mu będzie."
  },
  "orthevia-04-15-sekund-przy-otwartych-drzwiach-auta-na-orlenie": {
    "headline": "Przez 15 sekund udawałem, że sprawdzam oponę.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu bez zbędnych pytań.",
    "primaryText": "Dziewiętnastoletni chłopak w czapeczce z logo stacji zastukał w szybę mojego samochodu i zapytał: „Proszę pana, wszystko dobrze? Wezwać pogotowie?”. Miałem 61 lat. Siedziałem z lewą nogą wystawioną na beton przy dystrybutorze numer cztery i nie byłem w stanie wyprostować własnego kolana.\n\nOpowiem wam o tym piątkowym popołudniu pod Piotrkowem.\n\nPrzez 34 lata zarabiałem na życie za kierownicą. Najpierw małe dostawczaki, potem kombi jako przedstawiciel techniczny hurtowni instalacyjnej. Sześćdziesiąt tysięcy kilometrów rocznie. Znam na pamięć każdą stację benzynową między Łodzią, Kielcami a Częstochową. Nigdy nie spóźniłem się do klienta i nigdy nie dawałem prowadzić mojego auta nikomu innemu, nawet własnej żonie.\n\nW tamten piątek stałem 40 minut w korku przed zjazdem z trasy. Jedynka, półsprzęgło, stop. Jedynka, półsprzęgło, stop. Sto dwadzieścia razy ten sam ruch lewą nogą.\n\nPo dwudziestu minutach pod lewą rzepką zaczęło się znajome pieczenie. Najpierw tępe, jakby ktoś przyłożył rozgrzaną łyżkę od wewnętrznej strony kolana. Potem przyszło imadło. Każdy kierowca po pięćdziesiątce, któremu siadło kolano, wie dokładnie, co mam na myśli: staw zastyga pod jednym kątem i masz wrażenie, że przy próbie wyprostowania nogi coś w środku pęknie z głośnym trzaskiem.\n\nZjechałem na stację paliw tylko po to, żeby na chwilę wyciągnąć nogę z kabiny.\n\nOtworzyłem drzwi, wystawiłem lewego buta na asfalt, złapałem się lewą ręką słupka, a prawą kierownicy. Zostałem w tej pozycji. Próbowałem wstać, ale pod rzepką przeszył mnie taki prąd, że aż pociemniało mi w oczach. Wtedy podszedł ten młody pracownik stacji z wiadrem do mycia szyb.\n\n„Proszę pana, wezwać pogotowie? Wygląda pan, jakby dostał skurczu albo zasłabł”.\n\nSkłamałem w ułamku sekundy. Uśmiechnąłem się krzywo, poklepałem dłonią oponę i rzuciłem:\n\n„Nie, dziękuję panu. Kamień mi chyba wszedł w bieżnik i patrzę, czy nie schodzi powietrze”.\n\nKiedy odszedł do budynku stacji, stałem przy otwartych drzwiach samochodu jeszcze dobre piętnaście sekund, opierając cały ciężar na rękach, zanim kolano wreszcie puściło i pozwoliło mi zrobić pierwszy sztywny krok do kasy.\n\nNazywałem te piętnaście sekund swoim testem parkingu.\n\nOd półtora roku odgrywałem tę samą szopkę wszędzie. Pod Biedronką wysiadałem z auta i udawałem, że odpisuję na ważnego SMS-a, trzymając się relingu dachowego, dopóki w stawie nie rozejdzie się pierwsza fala bólu. Pod hurtownią zaglądałem pod wycieraczkę na przedniej szybie, jakby przykleił się tam liść. Pod własnym domem grzebałem w schowku, czekając, aż sąsiad zamknie za sobą furtkę i nie zobaczy, jak 61-letni chłop wytacza się z fotela kierowcy bokiem jak staruszek.\n\nNajgorsza była jednak niedziela tydzień później.\n\nJechaliśmy z żoną Beatą na urodziny naszej córki pod Warszawę. Dwie godziny drogi. Kiedy wyszedłem z domu z koszulą w pokrowcu, Beata stała już od strony drzwi kierowcy z wyciągniętą dłonią.\n\n„Daj kluczyki, Marek. Ja dzisiaj poprowadzę”.\n\n„Przecież nie lubisz jeździć po ekspresówce”.\n\nSpojrzała na mnie tym cichym, uważnym wzrokiem, przed którym nie da się niczego ukryć po 36 latach małżeństwa.\n\n„Widziałam z okna w kuchni, jak wysiadałeś w piątek wieczorem. Trzymałeś się drzwi przez pół minuty. Daj te kluczyki”.\n\nOddałem. Usiadłem na fotelu pasażera we własnym samochodzie, patrzyłem w boczną szybę przez 130 kilometrów i czułem w gardle gulę wielkości pięści.\n\nPróbowałem wcześniej wszystkiego, co robi normalny człowiek. Ortopeda w przychodni spojrzał na zdjęcie RTG przez może dwadzieścia sekund: „Zwężenie szpary stawowej, przeciążenie rzepki od pozycji siedzącej. Sześćdziesiątka na karku, milion kilometrów w nodze, trzeba zmienić auto na automat albo przejść do biura”. Na odchodne dostałem receptę na proszki przeciwzapalne, po których po tygodniu paliła mnie zgaga, oraz zalecenie opaski uciskowej ze sklepu medycznego.\n\nKupiłem trzy takie opaski. Pierwsza, beżowa z apteki za 45 zł, zwijała mi się pod kolanem w gruby, mokry od potu sznurek już na trzecich światłach i wrzynała pod udem tak, że drętwiała mi łydka. Druga, neoprenowa z dziurką na rzepkę za 140 zł, w fotelu kierowcy działała jak imadło: przy zgiętej nodze jeszcze mocniej wciskała rzepkę do środka stawu. Trzecia, z bocznymi fiszbinami za 260 zł, nie mieściła się pod normalne dżinsy i wylądowała w bagażniku obok gaśnicy.\n\nW środę pojechałem na wymianę oleju i klocków do mojego mechanika.\n\nZnamy się od dwudziestu lat. Ma 69 lat, osiem więcej ode mnie i od czterech dekad robi zawieszenia w tym samym warsztacie z kanałem na obrzeżach miasta. Dwa lata wcześniej widziałem go o lasce. Mówił wtedy, że przepisuje warsztat na zięcia, bo kolana odmówiły posłuszeństwa.\n\nWchodzę pod podnośnik, a on wychodzi z betonowego kanału po stromych metalowych schodkach z kluczem dynamometrycznym w ręku. Bez trzymania się barierki. Potem kuca przy moim lewym przednim kole, świeci latarką w zacisk i wstaje jednym płynnym ruchem, nawet nie opierając dłoni o błotnik.\n\nZamurowało mnie.\n\n„Miałeś przecież pod nóż iść. Coś ty sobie wstawił, tytanowe zawiasy?”\n\nZaśmiał się, wytarł ręce w czyściwo i spojrzał na moje lewe kolano, które odruchowo rozmasowywałem przez nogawkę spodni.\n\n„Sprzęgło cię dobija w korkach, co? Jak wysiadasz z wozu, to stoisz przy drzwiach i udajesz, że sprawdzasz oponę?”\n\nAż cofnąłem się o pół kroku. „Skąd wiesz?”\n\n„Bo robiłem dokładnie to samo przez trzy lata, Marek. Zanim jeden fizjoterapeuta wytłumaczył mi kolano tak, jak tłumaczy się zawieszenie w aucie”.\n\nWskazał kluczem na moją nogę.\n\n„Popatrz. Jak siedzisz za kółkiem z nogą zgiętą pod kątem dziewięćdziesięciu stopni i co chwilę wciskasz pedał, całe napięcie z mięśnia uda idzie przez jedno wąskie ścięgno tuż pod rzepką. Jak linka sprzęgła naciągnięta do granic możliwości. A ty co na to zakładałeś? Elastyczny rękaw z apteki, który ściska rzepkę od przodu i jeszcze mocniej wbija ją w kość, dokładnie jak zapieczony zacisk hamulcowy w tarczę!”\n\nPodciągnął granatową nogawkę spodni roboczych.\n\nNa gołej skórze, dokładnie dwa palce poniżej rzepki, miał zapięty wąski, czarny, matowy pasek. Sama rzepka była całkowicie odsłonięta. Pod kolanem nie było żadnego grubego materiału, który mógłby się zwinąć przy siedzeniu w fotelu.\n\n„Widzisz ten twardy wałek od wewnętrznej strony?” Nacisnął kciukiem profilowany rdzeń pod paskiem. „Ma osiem milimetrów grubości. Siada dokładnie na więzadle pod rzepką jak łapa docisku. Przejmuje jedną trzecią szarpnięcia, zanim siła w ogóle dojdzie do wytartego stawu. A jak zginasz nogę w samochodzie, nic ci nie pcha rzepki w kość i nic nie dusi żył pod kolanem”.\n\n„Daj spokój. Zwykły pasek? Przecież to zjedzie na łydkę po pięciu kilometrach”.\n\n„Zjeżdżają gumki z bazaru bez rdzenia i na plastikowych kółkach”, odparł spokojnie. „Ten ma silikonowy rdzeń, który trzyma się skóry i stalowe przelotki z obu stron. Wchodzę w tym i wychodzę z kanału czterdzieści razy dziennie od zeszłej wiosny”.\n\nPodszedł do blatu przy podnośniku, oderwał kartonik zawieszki od wymiany oleju i napisał mi na odwrocie niebieskim długopisem drukowanymi literami jedno słowo: **SARDIAN**.\n\n„Zamów sobie dzisiaj wieczorem. Jak po tygodniu dalej będziesz stał przy drzwiach na stacji jak słup, to ci za niego sam oddam przy następnych klockach”.\n\nWieczorem w domu wpisałem nazwę z kartonika w wyszukiwarkę i sam przeczytałem kilkadziesiąt komentarzy innych kierowców w moim wieku. Zobaczyłem, że dają 60 dni na przetestowanie na własnych nogach z pełnym zwrotem pieniędzy i że w pakiecie 1+1 dokładają drugą opaskę gratis. Wziąłem od razu ten zestaw: jedną do domu, drugą na stałe do schowka w aucie.\n\nPaczka przyszła do Paczkomatu w piątek rano, akurat przed trasą do Kielc.\n\nZałożyłem opaskę na parkingu pod domem, siedząc w fotelu kierowcy. Zajęło mi to dosłownie pięć sekund: bez zdejmowania butów i bez schylania się do kostek, po prostu podwinąłem nogawkę dżinsów, przyłożyłem miękki rdzeń we wgłębienie dwa palce pod rzepką i dociągnąłem oba rzepy przez stalowe klamry. Opuściłem nogawkę. Pod spodniami nie było widać kompletnie nic.\n\nPod Kielcami znów trafiłem na wahadło i 25 minut korka.\n\nJedynka, półsprzęgło, stop. Czekałem na znajomy ogień pod rzepką. Nie przyszedł. Czułem pod nogawką wyraźne, pewne podparcie dokładnie w tym jednym punkcie poniżej rzepki, jakby ktoś podłożył sprężystą poduszkę pod naciągniętą linkę.\n\nPrawdziwy sprawdzian przyszedł jednak godzinę później pod hurtownią klienta.\n\nZgasiłem silnik, otworzyłem drzwi, postawiłem lewą stopę na kostce brukowej i po prostu wstałem. Zamknąłem drzwi biodrem, kliknąłem pilotem i byłem w połowie chodnika z teczką w ręku, kiedy nagle zatrzymałem się na środku parkingu.\n\nNie złapałem się słupka. Nie udawałem, że patrzę w telefon. Nie stałem piętnastu sekund przy otwartych drzwiach.\n\nW kolejną niedzielę znów jechaliśmy z Beatą za miasto do znajomych. W przedpokoju sam zdjąłem kluczyki z haczyka.\n\nBeata spojrzała na moją rękę. „Na pewno, Marek?”\n\n„Na pewno. Siadaj z prawej”.\n\nKiedy wysiedliśmy pod ich domem po półtorej godziny jazdy, obszedłem maskę samochodu normalnym, równym krokiem i otworzyłem jej drzwi, zanim zdążyła odpiąć torebkę. Patrzyła na mnie przez dobrą chwilę bez słowa, po czym uśmiechnęła się kącikiem ust.\n\nBędę uczciwy: w wieku 61 lat nie wyrosło mi nowe kolano jak u dwudziestolatka, a przy pierwszym zakładaniu trzeba poświęcić minutę, żeby wyczuć właściwą siłę dociągnięcia rzepów (zbyt lekko nie podeprze ścięgna, zbyt mocno niepotrzebnie ściśnie skórę). W deszczowy listopadowy poranek moje stawy po dwóch milionach kilometrów nadal potrzebują chwili na rozruch. Ale nie jestem już pasażerem we własnym samochodzie i żaden nastolatek na stacji paliw nie pyta mnie, czy wezwać karetkę.\n\nJeśli po pół godzinie za kierownicą czujesz pod rzepką palące imadło.\nJeśli wysiadając pod sklepem, trzymasz się drzwi samochodu przez kilkanaście sekund i udajesz, że sprawdzasz oponę albo telefon.\nJeśli w bagażniku lub szufladzie leżą już rozciągnięte ściągacze z apteki, które tylko dusiły ci nogę w zgięciu.\n\nPrzestań ściskać całą rzepkę gumowym rękawem. Odciąż ten jeden punkt dwa palce niżej, który przyjmuje całe szarpnięcie.\n\nOpaska podrzepkowa **Sardian™** ma wyprofilowany rdzeń silikonowy 8 mm i stalowe przelotki, dzięki którym nie przesuwa się podczas prowadzenia auta i chodzenia po schodach. Teraz w ofercie 1+1 drugą sztukę dostajesz GRATIS (jedną możesz trzymać w domu, drugą w schowku samochodu), a na spokojny test masz pełne 60 dni gwarancji zwrotu bez żadnych pytań.\n\n👉 Sprawdź tutaj, jak działa opaska podrzepkowa Sardian™ (60 dni na test bez ryzyka): https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial\n\nP.S. Przy następnej wymianie filtrów zawiozłem do warsztatu dobrą kawę ziarnistą. Mechanik spojrzał tylko, jak wysiadam z kombi bez dotykania drzwi i zawołał z kanału: „Mówiłem, że to łapa docisku”."
  },
  "orthevia-05-taborecik-na-dzialce-rod-chcialem-oddac-klucze-po-28-latach": {
    "headline": "Napisałem już ogłoszenie: „Odstąpię działkę”.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni na test na własnych nogach.",
    "primaryText": "Siedziałem na zielonym plastikowym taboreciku pod jabłonką i patrzyłem, jak moja 63-letnia żona wbija ciężki szpadel w mokrą glinę pod pomidory. Miałem 66 lat. Własnymi rękami postawiłem tę altankę w 1998 roku, a tamtej soboty wieczorem napisałem na kartce w kratkę ogłoszenie na tablicę przy bramie: „Odstąpię działkę ROD”.\n\nKażdy mężczyzna, który całe życie potrafił zrobić wszystko własnymi rękami, zrozumie, co czułem z tą kartką w kieszeni kurtki.\n\nMam na imię Stanisław. Przez 39 lat pracowałem jako ślusarz narzędziowy. Nasza działka, 380 metrów kwadratowych na końcu alejki jaśminowej, była od 28 lat całym naszym światem od kwietnia do października. Sam spawałem pergolę pod winogrona, sam układałem ścieżkę z płytek i sam co wiosnę przekopywałem warzywnik dla mojej żony Danusi.\n\nWszystko skończyło się w jedną kwietniową sobotę przy podwiązywaniu malin.\n\nPrzykucnąłem przy dolnym drucie z motkiem sznurka w dłoni. Kiedy próbowałem wstać, w prawym kolanie rozległ się suchy, głośny trzask, dokładnie taki, jakby ktoś nadepnął w lesie na przemarzniętą gałąź. Poleciałem bokiem prosto w świeżo zgrabioną grządkę. Wieczorem kolano spuchło jak bania, zrobiło się gorące i sztywne jak drewniany kołek.\n\nPrzez kolejne czternaście miesięcy przeszedłem całą ścieżkę, którą zna chyba każdy polski emeryt.\n\nNajpierw przychodnia i trzy miesiące czekania do poradni ortopedycznej. Lekarz spojrzał w monitor, nawet nie dotykając mojej nogi: „Zmiany zwyrodnieniowe rzepkowo-udowe, panie Stanisławie. Sześćdziesiąt sześć lat w metryce, swoje pan już przeklęczał. Proszę nie kucać, nie dźwigać, oszczędzać nogę, smarować żelem i kupić sobie opaskę w sklepie medycznym”.\n\n„Nie kucać i nie dźwigać” na działce oznacza jedno: usiądź na stołku i patrz, jak zarasta chwastami wszystko, o co dbałeś przez pół życia.\n\nW aptece i w internecie zostawiłem przez rok dokładnie 780 zł (3 opaski elastyczne po 40 zł, neoprenowy stabilizator za 190 zł, prywatna wizyta za 320 zł i 5 tubek maści po 30 zł). Szare opaski z apteki po dziesięciu minutach chodzenia po alejce rolowały się pod kolanem w twardy powróz i odcinały krążenie w łydce. W grubym neoprenowym stabilizatorze w maju noga pociła się jak w folii, a przy każdej próbie ugięcia kolana czułem jeszcze gorsze kłucie pod samą rzepką.\n\nPrzyszła kolejna wiosna. Danusia kupiła w markecie ogrodniczym ten nieszczęsny zielony plastikowy taborecik.\n\n„Usiądź sobie w cieniu, Stasiu, ja tylko przekopię ten kawałek pod ogórki”.\n\nPatrzyłem, jak drobna kobieta o siwych włosach stawia stopę na szpadlu, ociera czoło przedramieniem i dźwiga dziesięciolitrową konewkę ze studni, bo mnie przy każdym kroku z ciężarem kolano uciekało do środka jak z waty. Kiedy próbowałem odebrać jej tę konewkę, rozlałem połowę wody na ścieżkę i musiałem złapać się słupka pergoli.\n\nTamtego wieczoru przy kolacji prawie się nie odzywałem. Kiedy Danusia zasnęła, wyrwałem kartkę z zeszytu, napisałem ogłoszenie o odstąpieniu działki z numerem telefonu i włożyłem do kieszeni wiatrówki.\n\nW niedzielę rano pojechałem na ogrody sam, z pineską w palcach, żeby przypiąć tę kartkę na tablicy ogłoszeń przy głównej bramie, zanim zjadą się inni działkowcy.\n\nStałem właśnie przed szybą gabloty, kiedy zza rogu wyszedł z psem nasz sąsiad z alejki numer trzy.\n\nMa 73 lata, siedem więcej ode mnie i jest emerytowanym kolejarzem. Jeszcze dwa sezony wcześniej chodził o lasce z gumową końcówką, a jego syn przyjeżdżał kosić mu trawę. Teraz szedł równym, sprężystym krokiem, niosąc pod pachą dwudziestokilogramowy worek kory sosnowej kupiony po drugiej stronie ulicy.\n\nSpojrzał na kartkę w mojej dłoni. Przeczytał pierwsze trzy słowa i przytrzymał mnie za łokieć.\n\n„Oszalałeś, Staszek? Dwadzieścia osiem lat pod gruszą chcesz oddać obcym ludziom?”\n\n„Nie dam rady”, wydusiłem szczerze, bo przed nim nie umiałem już udawać. „Danusia robi za nas dwoje. Kolano mi chrupie i puchnie po piętnastu minutach na nogach. Mam w altance pełną reklamówkę opasek z apteki i żadna nie trzyma”.\n\nSąsiad postawił worek kory pod płotem, podszedł do metalowej furtki naszej alejki i poruszył nią lekko w górę i w dół.\n\n„Ślusarzem byłeś czterdzieści lat, Staszek, to popatrz na tę furtkę. Jak dolny zawias dostanie luzu, a ciężkie skrzydło opadnie o trzy milimetry i zacznie trzeć spodem o beton, to co robisz? Owijasz całą furtkę bandażem elastycznym i smarujesz siatkę maścią?”\n\n„No nie. Podkładam stalową podkładkę dystansową pod sam czop zawiasu, żeby podnieść oś i zdjąć tarcie”.\n\n„Dokładnie to!” Stuknął palcem w swoje kolano. „Twoja rzepka wisi na jednym grubym ścięgnie przyczepionym poniżej kolana. Z wiekiem staw siada, ścięgno dostaje za duży kąt szarpnięcia i przy każdym kroku albo przykucnięciu cała twoja waga ryje rzepką o kość. A te wszystkie skarpety i rękawy z apteki robią najgorszą rzecz na świecie: przyciskają rzepkę z wierzchu jeszcze mocniej do kości!”\n\nPodwinął nogawkę dresowych spodni do połowy łydki.\n\nPod rzepką, w tym małym wgłębieniu wyczuwalnym pod palcami, miał zapięty wąski czarny pasek ze stalowymi klamerkami po bokach. Sama rzepka była zupełnie wolna. Nic nie ściskało kolana dookoła.\n\n„Synowa mi to przywiozła zeszłego lata. Od środka jest gruby na osiem milimetrów wałek silikonowy. Zapinasz go dwa palce pod rzepką, dokładnie jak podkładkę na zawiasie. Skraca dźwignię ścięgna i zabiera ponad trzydzieści procent nacisku ze stawu, zanim w ogóle postawisz stopę na ziemi”.\n\nSięgnął do kieszeni kamizelki, wyjął papierową torebkę po nasionach ogórków i ołówkiem stolarskim zapisał na jej rogu dużymi literami nazwę: **SARDIAN**.\n\n„Schowaj to ogłoszenie do kieszeni, Staszek. Zamów to dzisiaj, a jak za miesiąc dalej będziesz siedział na tym zielonym stołeczku, to sam ci pomogę tę kartkę powiesić”.\n\nKartka z ogłoszeniem wróciła do kieszeni. Wieczorem w domu wpisałem nazwę z torebki po nasionach w Google i sam poczytałem opinie ludzi z podobnym zwyrodnieniem. Zamówiłem pakiet 1+1 (druga opaska była gratis) z 60-dniową gwarancją zwrotu pieniędzy, więc absolutnie niczym nie ryzykowałem.\n\nPrzesyłka przyszła we wtorek po południu. W środę rano pojechałem na działkę sam, godzinę przed Danusią.\n\nW altance usiadłem na ławce, podwinąłem nogawkę i zapiąłem pasek na gołą skórę dwa palce pod prawą rzepką. Silikonowy rdzeń dokładnie ułożył się w poprzecznym wgłębieniu na ścięgnie, a dwa boczne paski przez stalowe przelotki dociągnęły go równo bez żadnego wrzynania się pod kolanem.\n\nWyszedłem przed altankę. Wziąłem szpadel oparty o ścianę, postawiłem stopę na ostrzu i nacisnąłem. Żadnego ukłucia. Napełniłem dziesięciolitrową konewkę pod kranem i przeszedłem z nią przez całą długość działki aż pod tunel foliowy. Kolano było zwarte i pewne, jakby ktoś dokręcił obluzowaną śrubę w zawiasie.\n\nKiedy o dziesiątej Danusia otworzyła furtkę z siatką sadzonek, cały pas pod ogórki i pomidory był już przekopany i zgrabiony, a zielony plastikowy taborecik stał odwrócony pod ścianą narzędziowni jako podstawka pod doniczkę z pelargonią.\n\nStanęła na środku ścieżki i aż wypuściła siatkę na trawę.\n\n„Stasiu... Kto ci to przekopał? Dzwoniłeś po zięcia?”\n\nPodciągnąłem lekko nogawkę spodni, pokazałem czarny pasek pod rzepką i uśmiechnąłem się pod wąsem: „Podłożyłem podkładkę pod zawias, Danusiu. Nastawiaj wodę na kawę”.\n\nWieczorem pierwszy raz od półtora roku kolano nie spuchło jak bania i nie musiałem przykładać mrożonek z zamrażalnika. Kartkę z napisem „Odstąpię działkę ROD” podarłem tego samego dnia na rozpałkę do grilla.\n\nŻeby była jasność: mam 66 lat, do paska nie ma sensu klękać gołym kolanem bezpośrednio na kamieniach (przy pieleniu nadal podkładam sobie pod kolana zwykłą piankową podkładkę ogrodową za 15 zł), a sam pasek trzeba zapinać na skórę lub cienką bieliznę, nie na grube spodnie robocze. Ale to ja znów noszę konewki na naszej działce, nie moja żona.\n\nJeśli przestałeś jeździć na działkę albo siedzisz bezradnie na krześle, patrząc, jak bliscy robią twoją robotę.\nJeśli przy kucaniu i schodzeniu po stopniach słyszysz pod rzepką suchy trzask, a zwykłe opaski z apteki zwijają ci się pod kolanem w sznurek.\nPamiętaj o zawiasie w furtce: nie owijaj całej rzepki gumą, tylko podeprzyj ścięgno dwa palce niżej.\n\nW aktualnej promocji **Sardian™** przy zakupie 1 sztuki drugą opaskę otrzymujesz GRATIS (na drugie kolano lub dla kogoś bliskiego), a na przetestowanie jej w domu i w ogrodzie masz pełne 60 dni z gwarancją zwrotu co do złotówki.\n\n👉 Zobacz wyniki Testu Schodów i zamów pakiet 1+1 z 60-dniową gwarancją: https://sprobujsardian.pl/pages/test-schodow\n\nP.S. Drugi pasek z pakietu założyłem na lewe kolano, kiedy we wrześniu zrywaliśmy jabłka z drabiny. W tym roku zebraliśmy cztery pełne skrzynki."
  },
  "stryde-04-4-letni-wnuk-pokazal-przy-obiedzie-jak-chodze": {
    "headline": "Chód, który skopiował mój wnuk.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu.",
    "primaryText": "Mój wnuk ma cztery lata. Przy niedzielnym obiedzie pokazał wszystkim, jak chodzę. Za drugim razem nikt się nie zaśmiał.\n\nTo była niedziela w lipcu. Obiad był już skończony, talerze zebrane ze stołu, a mały Oskarek zsunął się z krzesła i przeszedł przez nasz salon.\n\nTylko że to nie był jego chód. To był mój chód.\n\nLekkie przycięcie prawej nogi. Ręka na oparciu krzesła przy stole. Ręka na futrynie drzwi. Ręka na podłokietniku kanapy. A na końcu opadające prawe ramię, dokładnie tak, jak u mnie.\n\nTrzy punkty podparcia. W idealnej kolejności. Ma cztery lata.\n\nZięć zaśmiał się pierwszy. Potem moja córka Emilka. Mój mąż Romek wbił wzrok w talerz.\n\nEmilka powiedziała szybko: „Oskar, wystarczy”.\n\nOdpowiedziałam: „Nie. Pozwól mu. Pokaż jeszcze raz, Oskarku”.\n\nWięc pokazał jeszcze raz. Krzesło. Futryna. Kanapa. Opadające ramię.\n\nZa drugim razem nikt się nie zaśmiał.\n\n„Czy ja naprawdę tak wyglądam?”\n\nEmilka zaczęła tłumaczyć: mamo, on ma cztery lata, wygłupia się. Spojrzałam na zięcia, bo Damian nigdy nie potrafił mnie okłamać.\n\n„...Troszeczkę”.\n\nChwilę później Oskarek wdrapał się na moje kolana i zapytał, czy zaprowadzę go we wrześniu do przedszkola. Przedszkole jest na szczycie ulicy Górnej, dziesięć minut pod górę dla każdego, kto ma dwa sprawne kolana.\n\nEmilka wtrąciła od razu: „Babcia poczeka w samochodzie, skarbie”.\n\nA Oskarek odpowiedział: „Babcia robi auto”.\n\nW pokoju zrobiło się bardzo cicho.\n\n„Kto mówi, że babcia robi auto?”, zapytałam.\n\n„Tata. W lesie”.\n\n„W jakim lesie?”\n\nDamian odchrząknął: „W niedzielne poranki. Zabieramy go na ścieżki do lasu za miastem. Tam jest stromo i są powalone drzewa do przechodzenia, mamo”.\n\n„Od kiedy?”\n\nEmilka spuściła wzrok: „Od Wielkanocy”.\n\n„Przecież jest lipiec”.\n\nEmilka, Damian i Oskarek. A jak się chwilę później okazało, również mój mąż Romek. Romek od Wielkanocy mówił mi w każdą niedzielę rano, że jedzie na ryby.\n\nPowiedziałam głośno, przy nich wszystkich: „Zaprowadzę go. We wrześniu”.\n\nEmilka westchnęła: „Mamo...”. Romek dodał: „Zuzia, przecież to ulica Górna”.\n\nPowiedziałam, że wiem, jak wygląda górka. I wiem też, jak wygląda las.\n\nMam sześćdziesiąt siedem lat. Przez dwadzieścia dwa lata prowadziłam sekretariat w szkole po drugiej stronie miasta. Znałam z imienia każdego rodzica przy bramie. A mój własny wnuk ani razu w swoim życiu nie widział, jak chodzę normalnie. On ma cztery lata. Moje kolano boli od trzech.\n\nTamtego wieczoru w salonie moje okulary zsunęły się ze stolika na dywan.\n\nPopatrzyłam na nie. I zamiast się po nie schylić, pchnęłam je stopą głębiej pod kanapę.\n\nEmilka stała w progu. Widziała, jak to zrobiłam.\n\n„Mamo”.\n\n„Wyjmę je, jak tata wstanie”.\n\nPotem poprosiłam ją, żeby nagrała mnie telefonem. Od wyjścia z kuchni do drzwi wejściowych. Powiedziałam, że nigdy nie widziałam siebie z boku.\n\nNagrała mnie, a potem obejrzałam to nagranie na jej ekranie. Jeden raz. Oparcie krzesła. Futryna. Bok kanapy. Opadające ramię.\n\n„Nie jest tak źle, mamo”.\n\n„Odtworzył to co do jednego ruchu ręki, Emilka”.\n\n„Ale dajesz sobie radę”.\n\n„Właśnie nie daję. Prawda?”\n\nWtedy powiedziała cicho: „Nie chcieliśmy, żebyś siedziała sama w aucie na parkingu pod lasem przez dwie godziny”.\n\n„Więc zamiast tego zostawiliście mnie samą w domu”.\n\nOpowiem wam, jak wyglądały moje poranki, żebyście zrozumieli, do jakiego punktu doszłam.\n\nZa dwadzieścia siódma. Siedziałam na brzegu łóżka ze stopami na podłodze przez dziesięć minut bez ruchu, czekając, aż kolano zdecyduje, czy w ogóle pozwoli mi wstać. Kiedy je prostowałam, strzykało tak głośno, że budziło Romka. Potem schody. Bokiem, obie ręce na poręczy, stopa do stopy.\n\nLekarz mówił, że to zwyrodnienie i wiek. Brałam tabletki. Smarowałam maściami. Dostałam zastrzyk, który zadziałał na pięć tygodni.\n\nPoszłam do apteki w mieście i poprosiłam młodą farmaceutkę o coś, co pozwoli mi wejść dziesięć minut pod górkę z czterolatkiem.\n\nDziewczyna była bardzo miła. Zapytała delikatnie, czy nie myślałam o lasce, tak tylko na tę drogę do przedszkola.\n\nOdpowiedziałam, że wnuk zacząłby naśladować też laskę.\n\nWzięłam z wieszaka beżowy ściągacz na kolano. Taki sam, jakie kupowałam wcześniej.\n\nKiedy wróciłam do domu, Emilka stała w kuchni nad otwartą szufladą.\n\n„Mamo. Co to wszystko jest?”\n\n„Zostaw to”.\n\n„Przecież tu jest ze dwadzieścia opasek”.\n\n„Dwadzieścia cztery. Licząc dzisiejszą”.\n\n„Po co ty je ciągle kupujesz?”\n\n„Bo pani w aptece za każdym razem mówi, że ta będzie dobrze trzymać”.\n\nJedna z nich zwinęła mi się kiedyś do samej kostki przy kasie w Biedronce i musiałam stać w kolejce, udając, że nic się nie stało. Wszystkie oplatają kolano dookoła. I w każdej z nich musiałam zatrzymywać się w połowie ulicy Górnej.\n\nNastępnego ranka, za dwadzieścia dziewiąta, spróbowałam wejść pod ulicę Górną sama. Z opaską numer dwadzieścia cztery pod spodniami.\n\nW połowie podejścia, przy przystanku autobusowym, stoi ławka. Znam tę ławkę aż za dobrze. Usiadłam na niej.\n\nPrzechodziła młoda mama z wózkiem i zatrzymała się przy mnie.\n\n„Wszystko w porządku, proszę pani?”\n\n„Tak, dziękuję. Tylko kolano”.\n\nWstałam, zawróciłam i zeszłam z powrotem na dół.\n\nW ostatnim tygodniu przed wakacjami pojechałam z Emilką odebrać Oskarka z zajęć adaptacyjnych w przedszkolu na Górnej. Emilka podjechała pod samą bramę. Ja oczywiście siedziałam w samochodzie.\n\nKiedy wysiadłam, noga nie chciała mi się wyprostować. Jeśli masz takie kolano jak moje, wiesz, o czym mówię: po jeździe autem staw się blokuje i stoisz przez chwilę z ręką na drzwiach samochodu, czekając, aż puści.\n\nKiedy tak stałam, pod górę szła pieszo kobieta w moim wieku z dwójką wnuków i plecaczkami w obu dłoniach. Nie była drobną kobietą. Szła żwawo. Bez laski, bez podpierania się murku, bez utykania.\n\nPani przeprowadzająca dzieci przez pasy zauważyła, że na nią patrzę.\n\n„To pani Wanda. Codziennie, w deszcz czy słońce, przyprowadza oboje wnuków z samego dołu. Niech pani spojrzy na jej ręce”.\n\n„Co jest z jej rękami?”\n\n„Nie szuka nimi podparcia. Ma siedemdziesiąt cztery lata. Tylko niech jej pani nie mówi, że wygadałam”.\n\nSiedemdziesiąt cztery lata. Siedem lat starsza ode mnie.\n\nNie wiem, co we mnie wstąpiło. Podeszłam prosto do niej.\n\n„Przepraszam najmocniej. Mogę zadać pani głupie pytanie? Jakim cudem wchodzi pani pod tę górę?”\n\n„Pod który kawałek?”\n\n„Pod całość. Ja dochodzę tylko do ławki przy przystanku”.\n\nSpojrzała na mnie uważnie, z góry na dół.\n\n„Co ma pani założone na kolano?”\n\n„Ściągacz z apteki”.\n\n„U mnie w obu kolanach trze kość o kość. Latami chodziłam w tych rękawach z apteki. Ściągacz tylko oplata kolano dookoła, nic więcej. Nie zmienia miejsca, w które uderza ciężar”.\n\n„A gdzie uderza?”\n\n„U mnie to był jeden punkt. Tuż pod rzepką, na ścięgnie. Przy każdym kroku na pochyłości cały mój ciężar przechodził przez ten jeden punkt”.\n\nPo czym dodała coś, czego nie powiedział mi wcześniej żaden lekarz:\n\n„Ten chód, który pani ma, widziałam, jak wysiadała pani z auta. Sama tak chodziłam. To nie kolano się poddaje. To pani ciało próbuje odruchowo uciec z ciężarem od tego jednego punktu pod rzepką. Robi to za panią. Tylko że kosztem całej reszty”.\n\nUniosła rąbek spódnicy o trzy centymetry. Wąski czarny pasek, tuż pod rzepką.\n\n„To przejmuje ciężar z tego punktu, zanim stopa uderzy o ziemię. Dzięki temu moje ciało mogło przestać kombinować z chodem”.\n\n„Taki mały paseczek?”\n\n„Powiedziałam dokładnie to samo, kiedy zięć mi go przyniósł. Powiedziałam też, że mam w domu dziesięć opasek i każda zjeżdża”.\n\n„A ja mam dwadzieścia cztery”.\n\n„Nie, kochana”, uśmiechnęła się. „Masz dwadzieścia cztery rzeczy, które oplatają całe kolano. Jak coś oplata całe kolano, to nic nie przesuwa. Ten ma profilowaną podkładkę od środka i siedzi na jednym punkcie”.\n\nPodała mi nazwę, a ja zapisałam ją w telefonie: **Sardian™**.\n\nW drodze powrotnej rozpłakałam się w samochodzie. Oskarek zapytał z fotelika, czemu babcia płacze, a Emilka powiedziała, że to alergia.\n\nWieczorem siedziałam przy stole w kuchni z telefonem. Romek zszedł na dół po szklankę wody. Bokiem. Stopień po stopniu.\n\n„Co tam oglądasz?”\n\n„Dwie sztuki w cenie jednej”.\n\n„Na co?”\n\n„Na ulicę Górną. Kosztuje mniej niż połowa tej mojej szuflady”.\n\n„Zuzia, przecież mówiliśmy. Emilka podwiezie cię autem pod samą bramę”.\n\n„Jeśli to zadziała, to siedziałam w tym aucie zupełnie niepotrzebnie”.\n\n„A jeśli nie zadziała?”\n\n„Sześćdziesiąt dni gwarancji. Przyjmują zwrot bez żadnych pytań”.\n\nStała ze szklanką wody przez dłuższą chwilę.\n\n„Weź te dwie”.\n\nPrzyszły w kolejny czwartek. Następnego ranka nie siedziałam przez dziesięć minut na brzegu łóżka. Poszłam do łazienki, założyłam pasek na gołą skórę tuż pod rzepką i naciągnęłam spodnie.\n\nStanęłam na szczycie schodów i powiedziałam sobie na głos: „Jeszcze jeden raz, Zuzia”.\n\nPierwszy stopień. Ręka na poręczy, jak zawsze.\nDrugi stopień.\nNa trzecim stopniu moja dłoń sama puściła poręcz.\n\nNie podjęłam decyzji, żeby ją puścić. Po prostu nie miała już czego asekurować.\n\nNa dole usiadłam na ostatnim stopniu, zdjęłam pasek, bo nie wierzyłam własnym oczom i weszłam z powrotem na górę. Sztywność wróciła. Ręka na poręczy wróciła. Założyłam go z powrotem i zeszłam. Z pustymi rękami.\n\nRomek stał w progu kuchni. Nie powiedział ani słowa.\n\nZa dwadzieścia dziewiąta tego samego ranka poszłam na ulicę Górną.\n\nMinęłam ławkę. Nawet na nią nie spojrzałam. Potem minęłam przystanek autobusowy.\n\nPrzez cały sierpień codziennie o za dwadzieścia dziewiąta wchodziłam pod tę górę sama i nikomu w rodzinie nie pisnęłam słowa. Chciałam mieć pewność.\n\nPod koniec sierpnia poprosiłam Emilkę, żeby znów nagrała mnie telefonem w przedpokoju. Od kuchni do drzwi wejściowych. Potem zestawiła oba nagrania obok siebie. Lipiec: ręka na krześle, futrynie i kanapie. Sierpień: nic.\n\n„Kiedy przestałaś się podpierać?”\n\n„Pięć tygodni temu”.\n\n„Nic nie powiedziałaś”.\n\n„Nie pytałaś. Mówiłaś, że daję sobie radę”.\n\n„Myśleliśmy, że tak będzie dla ciebie lepiej, mamo”.\n\n„Milczeliście. To nie to samo”.\n\nWtedy uklękłam na dywanie, sięgnęłam ręką pod kanapę i wyjęłam moje okulary z lipca. Nikt ich stamtąd nie wyjął przez całe lato. I wstałam z podłogi bez podpierania się o nic.\n\nTamtego wieczoru opróżniłam szufladę i wyrzuciłam wszystkie dwadzieścia cztery opaski do kosza. A drugi pasek z zestawu podałam Romkowi.\n\n„A to po co?”, zapytał.\n\n„Schodzisz po naszych schodach bokiem jak krab, Romek. Myślałeś, że nie widzę”.\n\nPierwszego września, za dwadzieścia dziewiąta rano, zaprowadziłam Oskarka pod górę do przedszkola. Za rękę. Jego tempem, nie moim. Minęliśmy ławkę, minęliśmy przystanek, doszliśmy pod samą bramę. Emilka i Damian jechali powoli samochodem za nami.\n\nPrzy bramie powiedziałam: „Oskarku. Pokaż, jak chodzi babcia”.\n\nSpojrzał na mnie. Zrobił kilka zwykłych, prostych kroków. Odwrócił się.\n\n„Jaki chód?”\n\n„Tak teraz wyglądam?”\n\n„Przecież to zwykłe chodzenie, babciu”.\n\nI pobiegł do środka. A w niedzielę pojechaliśmy wszyscy razem do lasu. Przy pierwszym powalonym pniu na ścieżce nikt nie podawał mi ręki. Przeszłam nad nim sama.\n\nOskarek stał po drugiej stronie.\n\n„Babcia robi las”, powiedział.\n\nJeśli twoja rodzina ma już dla ciebie określenie, którego nikt nie mówi przy tobie głośno.\nJeśli po wyjściu z samochodu stoisz z ręką na drzwiach i czekasz, aż kolano puści.\nJeśli masz w domu szufladę pełną rzeczy, które oplatają kolano dookoła.\n\nTen pasek nie oplata kolana. Siada na jednym punkcie pod rzepką i przejmuje ciężar, zanim uderzy on w staw. W pakiecie 1+1 dostajesz dwa w cenie jednego, zostaw jeden dla siebie, a drugi daj temu, kto woził cię samochodem. Masz 60 dni gwarancji zwrotu bez żadnych pytań.\n\n👉 Przeczytaj 5 wniosków z testu i zamów pakiet 1+1 z 60-dniową gwarancją: https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial\n\nP.S. Załóż go, przejdź od kuchni do drzwi wejściowych i poproś wnuka, żeby pokazał, jak chodzisz."
  },
  "stryde-05-wnuki-przestaly-przychodzic-w-piatki-druga-babcia": {
    "headline": "„Wszyscy tutaj to widzą, kochana”.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu.",
    "primaryText": "Moje wnuki przestały przychodzić do mnie na piątki. Ośmioletnia Iga powiedziała mi dlaczego: „Babcia Dorota umie usiąść na podłodze. Ty nie umiesz”.\n\nZaczęło się w lipcu zeszłego roku, w tygodniu, w którym dostałam drugi zastrzyk w kolano.\n\nMoja córka Kasia zadzwoniła z pytaniem, czy Dorota mogłaby wziąć dzieci w ten piątek. Tylko w ten jeden piątek. Wnuki przychodziły do mnie w każdy piątek, odkąd Iga była malutka, ale leżałam wtedy na kanapie z nogą na poduszce, więc oczywiście się zgodziłam.\n\nDorota to druga babcia. Teściowa Kasi. Ma siedemdziesiąt sześć lat, od czterech lat jest wdową, sama czyści sobie rynny i piecze placek cytrynowy, jaki mnie nie udał się ani razu w życiu.\n\nWe wrześniu to był już każdy piątek.\n\nW każdy piątek o piątej po południu dwa małe plecaki lądowały w bagażniku samochodu innej kobiety. Plecak Igi z jednorożcem i plecak Maksa z dinozaurami. Machałam im ze schodków przed domem.\n\nW soboty słuchałam relacji. Babcia Dorota robi pikniki na dywanie. Rozkłada koc na środku pokoju, kroi kanapki w trójkąty, siada z nimi po turecku na podłodze, a potem budują bazę z poduszek z kanapy.\n\nKiedy widzieliśmy się w niedzielę w parku, Kasia wyjmowała koc na trawę i mówiła do mnie: „Ty weź ławkę, mamo”. Życzliwie. Jakby robiła mi przysługę.\n\nWięc brałam ławkę.\n\nMam sześćdziesiąt cztery lata. Przez trzydzieści osiem lat byłam fryzjerką, codziennie na nogach w tym samym salonie od dziewiątej do osiemnastej. Przepracowałam za fotelem dwie ciąże. Nigdy w życiu nie siedziałam w pracy.\n\nA teraz musiałam brać dwie tabletki przeciwbólowe o szesnastej, żeby o siedemnastej usiąść na ławce w parku. Wstanie z niej zajmowało mi trzy podejścia, z obiema dłońmi zapartymi o deskę, a potem musiałam jeszcze stać przez minutę w miejscu, zanim kolana pozwoliły mi ruszyć. Udawałam wtedy, że podziwiam widoki.\n\nMyślałam, że tak po prostu wygląda sześćdziesiąt cztery lata. Lekarz mniej więcej to potwierdził. Zużycie chrząstki, powiedział i kazał wrócić, jak będzie gorzej. W szafie miałam pudełko po butach pełne opasek i stabilizatorów. Czternaście sztuk.\n\nW październiku Iga została u mnie sama na jedno popołudnie.\n\nWyjęłam klocki Lego i wysypałam je na stół w kuchni, żebym mogła normalnie usiąść na krześle. Iga popatrzyła na stół, popatrzyła na mnie i zapytała, czy możemy układać na dywanie.\n\nPowiedziałam, że babci wygodniej przy stole.\n\nZamyśliła się na chwilę. A potem powiedziała to, bez cienia złośliwości, tak jak dzieci mówią o pogodzie:\n\n„To dlatego w piątki jeździmy teraz do babci Doroty. Babcia Dorota umie usiąść na podłodze. Ty nie umiesz”.\n\nWróciła do układania klocków. A ja poszłam postać chwilę w łazience.\n\nTamtego wieczoru, kiedy mój mąż brał kąpiel na górze, spróbowałam. Położyłam poduszkę na dywanie w salonie i opuściłam się na kolana, tylko po to, żeby sprawdzić.\n\nWstanie zajęło mi dziesięć minut. W końcu musiałam doczołgać się do fotela i podciągnąć na rękach. Mąż zszedł w szlafroku i zastał mnie na kolanach, uczepioną podłokietnika. Skłamałam, że upadł mi kolczyk.\n\nNie poprosiłam już o zwrot moich piątków. Jak mogłam prosić? Przecież nie potrafiłam usiąść na podłodze. Przesiedziałam na ławce całą zimę i całą wiosnę.\n\nRok bez piątków.\n\nA potem przyszły siódme urodziny Maksa w parku. Zabawa z wielką kolorową chustą animacyjną na trawie, jedenaścioro dzieci dookoła chusty i dorośli na brzegach.\n\nDorota uklękła na trawie razem z dziećmi, trzymając brzeg chusty. Siedemdziesiąt sześć lat. A kiedy zabawa się skończyła i maluchy pobiegły dalej, po prostu wstała. Bez podpierania się ręką o ziemię. Bez niczyjej pomocy. Wstała szybciej niż moja córka.\n\nJa oczywiście siedziałam na ławce. Kasia przywiozła dla mnie nawet składane krzesełko turystyczne, na wypadek gdyby ławka w parku okazała się za niska.\n\nKiedy Kasia kroiła tort, Dorota podeszła i usiadła obok mnie. Myślałam, że zagada o torcie. Nie zagadała.\n\n„Widziałam to już w zeszłym roku”, powiedziała cicho. „Siadasz tak, jakbyś opuszczała fortepian. Wstajesz na trzy razy. A potem przez minutę udajesz, że podziwiasz drzewa. Wszyscy tutaj to widzą, kochana. Tylko nikt ci tego nie powie”.\n\nNie potrafiłam wydusić słowa. Najbardziej uderzyło mnie to „wszyscy tutaj”. Myślałam, że świetnie to ukrywam.\n\n„Czekałam cały rok, aż sama o to zapytasz”, dodała. „Nie zapytałaś. Więc sama ci mówię”.\n\nNie mówiła tego złośliwie. Dziś to wiem. Powiedziała to, bo wcześniej sama siedziała na tej ławce.\n\nZapytała, jak to czuję. Opisałam jej ten tępy ból jak ból zęba pod rzepką, chrupanie przy zginaniu i blokadę przy wstawaniu z niskiego siedzenia.\n\n„Cały ten ból idzie z jednego punktu”, pokiwała głową. „Widziałam, jak dwa razy podciągałaś pod spodniami swój ściągacz, zanim jeszcze wyjęliśmy kanapki”.\n\nPotem opowiedziała mi o swoim świętej pamięci mężu, Romanie. Przez czterdzieści lat miał firmę przeprowadzkową. Nosił głównie pianina.\n\n„Wiesz, jak się znosi pianino po schodach? Nie próbujesz obejmować rękami całego pudła, bo nie utrzymasz. Zakładasz jeden pas pod spodem, dokładnie w punkcie ciężkości i wtedy ciężar idzie tam, gdzie ty chcesz”.\n\nStuknęła palcem w moje kolano, tuż pod rzepką.\n\n„Próbowałaś trzymać całe kolano. A przy każdym wstawaniu cały twój ciężar dalej wbija się dokładnie tutaj. To nie są twoje lata, Krysia. Chodzi o to, gdzie ląduje ciężar”.\n\nPowiedziałam, że mam czternaście opasek w pudełku po butach.\n\n„Ja miałam dziewięć”, uśmiechnęła się.\n\nPodciągnęła nogawkę spodni. Wąski czarny pasek tuż pod rzepką, z małą wyprofilowaną podkładką leżącą prosto na ścięgnie.\n\n„Jeden pasek we właściwym miejscu. Dokładnie jak z pianinami Romana”.\n\nPowiedziała, że nazywa się **Sardian™** i że nosi po jednym na każdym kolanie od dwóch lat, mimo że w obu ma starcie chrząstki „kość o kość”. Siedziałam z nią przy jednym stole w Boże Narodzenie i nawet nie wiedziałam, że ma je pod spodniami.\n\nWzięła swoją torebkę, wyjęła z niej drugi, fabrycznie zapakowany pasek i włożyła mi go w dłoń.\n\n„Dają dwa w cenie jednego. Zamówiłam nową parę na święta i od tamtej pory noszę ten zapasowy w torebce, czekając, aż wreszcie schowasz dumę do kieszeni”. Spojrzała w stronę dzieci. „Poza tym w piątki one nie są moje. Są nasze”.\n\n„Idź do toalety i go załóż. Nie poczujesz ucisku. Poczujesz, że ten punkt pod rzepką milknie. I chodź na trawę na następną zabawę”.\n\nPoszłam. Założyłam go na gołą skórę tuż pod rzepką i opuściłam spodnie.\n\nWróciłam na polanę i powoli uklękłam na trawie. Przyznaję, zmówiłam w duchu krótką modlitwę. Maks wcisnął mi w dłonie brzeg kolorowej chusty.\n\nKiedy muzyka ucichła, wstałam.\n\nBez podpierania się rękami o ziemię. Bez trzech podejść. Bez minuty udawania, że patrzę na drzewa. Punkt pod rzepką był po prostu cichy, jak wtedy, gdy po całym dniu zdejmiesz za ciasny but.\n\nKasia trzymała w górze telefon, żeby nagrywać dzieci i powoli go opuściła, patrząc na mnie z otwartymi ustami.\n\nTamtego wieczoru zamówiłam własny zestaw 1+1 (na drugie kolano i na zapas do torebki), a pudełko po butach z czternastoma ściągaczami wylądowało w śmietniku.\n\nTrzy tygodnie później, po raz pierwszy od roku, sama zadzwoniłam do Kasi z propozycją, że odbiorę Maksa w czwartek po szkole. Kiedy Kasia weszła po południu do naszego domu, zastała mnie siedzącą z Maksem na dywanie pośród klocków Lego.\n\nMaks podniósł głowę znad budowli i powiedział: „Mamo, babcia już nie robi tego powolnego z krzesłem”.\n\nDziś dzielimy się weekendami po równo. Piątki są u mnie, z piknikiem na dywanie i kanapkami pokrojonymi w trójkąty, dokładnie tak, jak nauczyła mnie Dorota. A kiedy w niedzielę idziemy wszyscy do parku, obie siedzimy z dziećmi na trawie.\n\nNa ławce z telefonem siedzi teraz Kasia.\n\nW zeszłym miesiącu rzuciłam do niej z uśmiechem: „Ty weź ławkę, córuś”. Roześmiała się. Ja też. Ale najgłośniej śmiała się Dorota.\n\nJeśli ktoś inny przejął twoje piątki z wnukami.\nJeśli wstajesz z krzesła na trzy razy, a potem udajesz, że podziwiasz widoki.\nJeśli masz w szafie pudełko po butach pełne ściągaczy z apteki.\n\nTo nie jest kolejny ściągacz. To jeden pasek we właściwym punkcie pod rzepką, który przejmuje ciężar, zanim uderzy on w staw. W pakiecie 1+1 dostajesz drugi gratis, a na przetestowanie masz 60 dni z pełną gwarancją zwrotu.\n\n👉 Sprawdź, dlaczego zwykłe opaski z apteki nie działają i przetestuj Sardian™ przez 60 dni: https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan\n\nP.S. Iga ma osiem lat, a Maks siedem. Nie zamierzałam oddać tamtej ławce kolejnego roku z ich dzieciństwa."
  },
  "stryde-06-corka-zarezerwowala-wozek-elektryczny-na-moje-nazwisko": {
    "headline": "Zarezerwowała dla mnie wózek. Na moje nazwisko.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu.",
    "primaryText": "Moja córka zarezerwowała dla mnie wózek elektryczny jeszcze przed wyjazdem z domu. Na moje nazwisko. Jej 76-letnia teściowa szła pieszo.\n\nZacznę od początku.\n\nW czerwcu zeszłego roku moja córka Asia zabrała nas wszystkich na pięć dni na rodzinny wyjazd i dwa dni w wielkim parku rozrywki. Jej mąż Marek, dzieciaki, mama Marka, pani Karolina i ja.\n\nAsia planowała ten wyjazd od Bożego Narodzenia. Miała tabelkę w telefonie i rozpisany każdy dzień.\n\nW południe pierwszego dnia szłam już dwadzieścia kroków za wszystkimi, niosąc torby. Sześcioletnia Rózia co chwilę podbiegała do tyłu, żeby złapać mnie za rękę. I za każdym razem mówiłam jej to, co mówię zawsze:\n\n„Biegnij przodem, skarbie. Babcia was dogoni”.\n\nAni razu ich nie dogoniłam. Przez cały wyjazd.\n\nPo południu widziałam, jak Rózia puszcza moją dłoń i łapie za rękę panią Karolinę. Od tamtego momentu to Karolina prowadziła za ręce oboje wnuków. Karolina ma siedemdziesiąt sześć lat. Jest o pięć lat starsza ode mnie.\n\nTamtego wieczoru w hotelu zobaczyłam otwartą mapę parku na ekranie telefonu Asi. Miała na niej pozaznaczane małe kółeczka. Nie wokół karuzel. Wokół ławek.\n\nWybrała dla mnie ławki, zanim wybrała chociaż jedną atrakcję.\n\nMam siedemdziesiąt jeden lat. Mam na imię Barbara. Przez dwadzieścia dziewięć lat pracowałam w rejestracji gabinetu stomatologicznego i wychowałam dwójkę dzieci praktycznie w pojedynkę. Moje kolana udźwignęły to wszystko.\n\nJedenaście lat stopniowego pogarszania się. Ostatnie lata, starcie chrząstki, „kość o kość”. Jeszcze trzy lata temu chodziłam codziennie rano na długi spacer z sąsiadką. Potem przestałam. W supermarkecie zaczęłam podtrzymywać się półek w alejkach, tak jak trzyma się poręczy. Po schodach w domu zaczęłam schodzić bokiem, po jednym stopniu. W kościele zaczęłam siadać z samego brzegu ławki, żeby wstawać jako ostatnia, kiedy nikt już nie patrzy.\n\nZastrzyki dostawowe, więcej niż raz i każdy kolejny działał krócej niż poprzedni. Szuflada pełna stabilizatorów na kolano, które policzyłam w marcu: dziewięć sztuk. Każdy jeden zjeżdżał na łydkę przed południem. Żele. Tabletki, po których bolał mnie żołądek. Mrożonki przykładane co wieczór.\n\nDrugiego dnia rano przed wejściem do parku czekał na mnie wózek elektryczny.\n\nAsia zarezerwowała go jeszcze z domu na drugi dzień, „na wypadek gdyby pierwszy dzień okazał się za ciężki”. Pierwszy dzień okazał się za ciężki. Na kierownicy wisiała karteczka z moim imieniem napisanym drukowanymi literami: **BARBARA**.\n\nAsia powiedziała łagodnie: „Wszystko w porządku, mamo. Zaplanowaliśmy to”.\n\nTo właśnie te słowa zabolały mnie najbardziej. Nie sam wózek. „Zaplanowaliśmy to”. Siedziała przy kuchennym stole w domu miesiące wcześniej i planowała trasę pod moje niesprawne kolana.\n\nWsiadłam na ten wózek. Bo co innego miałam zrobić? Jechałam obok karuzeli, a Karolina szła przede mną pieszo z Rózią i Tymkiem za ręce, śmiejąc się w głos.\n\nWieczorem zapytałam Asię, niby od niechcenia, czy za rok latem znów pojedziemy wszyscy razem.\n\nPocałowała mnie w czoło.\n\n„Za rok? Chyba dopiero jak zrobisz porządek z kolanami, mamo”.\n\nNie powiedziała tego złośliwie. Wiem, że nie. Ale długo nie mogłam po tym zasnąć.\n\n„Zrobisz porządek”. Jak z zepsutą pralką.\n\nI powiem wam coś, o czym nie wspomniałam nikomu w rodzinie. Przez cały tamten wyjazd to ja robiłam wszystkie zdjęcia. Trzymałam telefon, a reszta rodziny ustawiała się przed fontanną, karuzelą i diabelskim młynem. Kiedy wróciliśmy do domu, Asia przesłała mi wspólny album.\n\nPoliczyłam wszystkie zdjęcia. Nie ma mnie ani na jednym.\n\nOstatniej nocy wyjazdu ból obudził mnie o drugiej nad ranem. Ten głęboki, rwący ból pod rzepką, dokładnie jak ból zęba, który mści się w nocy za każdy krok zrobiony w ciągu dnia. Nie chciałam nikogo budzić, więc wzięłam plastikowe wiaderko i poszłam w szlafroku korytarzem do automatu z lodem.\n\nStałam przy automacie, sypiąc lód do wiaderka, kiedy usłyszałam kroki za plecami.\n\nKarolina. W piżamie. Przyszła nalać sobie wody.\n\nSpojrzała na wiaderko z lodem. Spojrzała na mnie. Nie powiedziała ani słowa.\n\nPo prostu podciągnęła nogawki spodni od piżamy.\n\nTuż pod każdą rzepką miała założony wąski czarny pasek. Tylko tyle. Nie wielką ortezę. Nie ściągacz z apteki. Cienki pasek siedzący dokładnie pod rzepką.\n\nPrzez cały czas zakładałam w duchu, że miała już wymienione stawy. Wiecie, jak to człowiek sobie dopowiada, siedemdziesiąt sześć lat i cały dzień na nogach z wnukami.\n\n„Myślałaś, że mam wstawione endoprotezy, prawda?”, uśmiechnęła się smutno. „Kochana, moje kolana wyglądają na prześwietleniu gorzej niż twoje. Dwa lata temu to ja jechałam na tym wózku”.\n\nPo czym dodała: „Patrzyłam na ciebie przez cały tydzień. Czekałam, aż sama mnie zapytasz. Nie zapytałaś”.\n\nWróciła na chwilę do swojego pokoju, przyszła z torebką, wyjęła z niej zapasowy pasek i wcisnęła mi go w dłoń.\n\nPowiedziałam: „Karolina, ja mam w domu w szufladzie dziewięć takich opasek”.\n\n„Nie masz”, odparła. „Masz dziewięć rzeczy, które zjeżdżają ci na łydkę. Załóż to jutro rano na drogę powrotną. A potem powiesz mi, że nie miałam racji”.\n\nNastępnego ranka założyłam go w hotelowej łazience na prawe, gorsze kolano. Na gołą skórę, tuż pod rzepką, pod zwykłe spodnie. Pod materiałem nie widać go w ogóle.\n\nWyszłam na długi hotelowy korytarz i przy pierwszym kroku czekałam na to znajome ukłucie pod rzepką.\n\nNie pojawiło się.\n\nNa dworcu Asia poszła załatwić dla mnie wózek u obsługi. Też miała go wcześniej zamówionego. Pomyślałam sobie wtedy: jeśli mam się przekonać, czy to naprawdę działa, to właśnie teraz.\n\nNasz peron był na samym końcu hali. Mijasz wszystkie kawiarnie, wszystkie kioski, idziesz kilkaset metrów.\n\nDoszłam tam pieszo. Niosąc własną torbę.\n\nChwilę później zobaczyłam Asię idącą przez halę z pustym wózkiem i rozglądającą się nerwowo na wszystkie strony. Siedziałam na ławce przy peronie z kawą w ręku i pomachałam do niej.\n\n„Mamo?! Jakim cudem dotarłaś aż tutaj?”\n\n„Przeszłam się, córuś”.\n\nPo powrocie do domu zadzwoniłam do Karoliny. Zapytałam wprost: „Karolina, wytłumacz mi, dlaczego to działa, skoro nic wcześniej nie działało?”.\n\nA ona wytłumaczyła mi to najprościej na świecie:\n\n„Przyłóż palec dwa centymetry pod rzepką i naciśnij. Czujesz to twarde pasmo? To ścięgno. Każdy krok, który robisz, a zwłaszcza przy schodzeniu po schodach, uderza dokładnie w ten punkt. Ściągacz z apteki tylko dusi całe kolano dookoła. Sztywna orteza trzyma staw na boki. A ten pasek siada bezpośrednio na ścięgnie i przejmuje obciążenie, zanim w ogóle dotrze ono do wytartego stawu. Nie przechodzi przez zgięcie kolana, więc nie ma się co rolować ani zsuwać”.\n\nPowiedziała mi też jasno: „To nie odtworzy ci chrząstki, Basia. Nic jej nie odtworzy. Zwyrodnienie dalej tam jest, po prostu ciężar przestaje uderzać w miejsce, które boli”.\n\nPodała mi nazwę: **Sardian™**. Zamówiłam zestaw 1+1 jeszcze tego samego wieczoru (jedną na lewe kolano, a drugą oddałam Karolinie).\n\nW pierwszym tygodniu w domu zaczęłam schodzić po schodach przodem. W trzecim tygodniu zapukałam o siódmej rano do sąsiadki w butach sportowych, w połowie naszego dawnego spaceru poprosiła, żebym trochę zwolniła. W sierpniu po raz pierwszy od trzech lat usiadłam w kościele w środku ławki, a nie z brzegu.\n\nW tym roku w czerwcu pojechaliśmy ponownie. Ten sam park. Ten sam hotel.\n\nW marcu Asia zadzwoniła do mnie ze śmiechem: „Mamo, rezerwować ci znowu wózek?”.\n\nOdpowiedziałam: „Zarezerwuj Karolinie”.\n\nNikt nie zaznaczał dla mnie ławek na mapie. Przeszłam cały park przez dwa dni z rzędu na własnych nogach. A kiedy po powrocie Asia wysłała mi album ze zdjęciami, znów je policzyłam.\n\nJestem na czterdziestu jeden zdjęciach.\n\nAle powiem wam, co naprawdę doprowadziło mnie do łez. Nie karuzele i nie zdjęcia.\n\nRózia. Przez cały wyjazd ani razu nie odwróciła się za siebie, żeby sprawdzić, jak daleko z tyłu została babcia.\n\nNie musiała. Byłam tuż obok niej.\n\nJeśli ciągle powtarzasz bliskim: „Idźcie przodem, ja was dogonię”.\nJeśli ktoś zaczął wybierać dla ciebie ławki, parterowe pokoje albo wózek.\nJeśli masz w domu szufladę pełną opasek, które zjeżdżały ci na łydkę.\n\nTo nie jest orteza ani rękaw z apteki. To wąski pasek z silikonowym rdzeniem, który odciąża ścięgno pod rzepką. W pakiecie 1+1 dostajesz drugi gratis, a na sprawdzenie masz pełne 60 dni gwarancji zwrotu.\n\n👉 Zobacz 5 wniosków z testu opaski Sardian™ i wypróbuj ją przez 60 dni bez ryzyka: https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial"
  },
  "orthevia-09-jedyna-stojaca-w-lawce-w-kosciele-komunia-wnuczki": {
    "headline": "Cała ławka uklękła. Zostałam stojąca tylko ja.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu.",
    "primaryText": "Dzwonki przy ołtarzu zadzwoniły po raz pierwszy. Trzysta osób w kościele osunęło się jednym cichym ruchem na drewniane klęczniki. Zostałam stojąca tylko ja: w drugiej ławce od środka, w jasnym płaszczu, wystająca ponad głowy wszystkich dokładnie za plecami mojej dziewięcioletniej wnuczki.\n\nNigdy nie zapomnę piekącego gorąca na policzkach w tamtej minucie.\n\nMam na imię Halina, mam 65 lat i przez 38 lat pracowałam w księgowości. Nie jestem osobą, która lubi zwracać na siebie uwagę. Tamtej kwietniowej niedzieli poszliśmy całą rodziną na mszę i próbę organizacyjną przed majową Pierwszą Komunią naszej wnuczki Zuzi. Była moja córka, zięć oraz oboje rodzice zięcia, eleganccy państwo z sąsiedniego miasta, którzy widują mnie dwa razy w roku.\n\nKiedy rozległy się dzwonki na Przeistoczenie, odruchowo opuściłam prawe kolano w stronę dębowego klęcznika.\n\nJeszcze zanim dotknęłam drewna, w połowie zgięcia, pod rzepką przeszył mnie taki ogień, jakby ktoś wbił mi prosto w staw rozżarzony gwóźdź. Syknęłam bezgłośnie, złapałam się obiema dłońmi krawędzi ławki przed sobą i wyprostowałam nogę. Wiedziałam z bolesną pewnością jedno: jeśli zejdę na ten klęcznik do końca, to po dzwonkach sama z niego nie wstanę i zięć będzie musiał dźwigać mnie pod pachy na oczach połowy osiedla.\n\nWięc stałam. Sztywno, z opuszczoną głową, w samym środku kościoła, podczas gdy po mojej lewej klęczała siedemdziesięcioletnia matka zięcia, a rząd przede mną klęczała mała Zuzia.\n\nPo wyjściu przed kościół teściowa mojej córki ujęła mnie z troską pod ramię i powiedziała półgłosem:\n\n„Pani Halinko, na samej Komunii w maju proszę koniecznie usiąść z boku na krzesełku pod filarem, tam starsze panie nie muszą wstawać ani klękać”.\n\nUśmiechnęłam się grzecznie i podziękowałam. Kiedy wróciłam do swojego mieszkania i zamknęłam drzwi od środka, usiadłam na stołku w przedpokoju w płaszczu i rozpłakałam się jak małe dziecko.\n\nMam 65 lat, nie dziewięćdziesiąt. Nie chciałam siedzieć na Komunii jedynej wnuczki w kącie za filarem jak niedołężna staruszka!\n\nMoje kolana zaczęły mi odbierać normalne życie dwa lata wcześniej. Najpierw niewinne trzeszczenie jak piasek przy schodzeniu ze schodów do piwnicy. Potem poranna sztywność: przez pierwsze dziesięć minut po wstaniu z łóżka chodziłam po sypialni na prostych nogach, zanim staw puścił. Ostatniej zimy doszło najgorsze, czyli paniczny lęk przed każdym głębszym zgięciem kolana pod obciążeniem. Upuszczona łyżeczka w kuchni, dolna półka w supermarkecie, zapięcie kozaka, klęcznik w kościele: każda z tych zwykłych czynności zamieniła się w kalkulację, o co się oprzeć, żeby wstać.\n\nW szafce w łazience miałam cały arsenał z reklam za ponad 620 zł: trzy tubki żeli przeciwzapalnych (90 zł), cztery pudełka saszetek na chrząstkę stawową pite sumiennie przez zimę (360 zł) oraz dwie cieliste opaski elastyczne z apteki (170 zł). Obie opaski robiły dokładnie to samo: wciskały rzepkę prosto w obolały staw tak mocno, że przy zgięciu nogi bolało jeszcze bardziej, a po dwudziestu minutach marszu rolowały się pod kolanem i uciskały mi żylaki na łydce.\n\nDo Komunii Zuzi zostały dokładnie trzy tygodnie.\n\nW piątek po południu zaszłam do naszego kościoła zamówić intencję mszalną. W bocznej nawie przy ołtarzu nasza parafialna florystka, którą znam z widzenia od dwudziestu lat i która w styczniu skończyła siedemdziesiątkę, układała wielkie kompozycje z białych lilii.\n\nPatrzyłam z ławki, jak klęczy na chłodnej posadzce, przycina łodygi sekatorem, po czym wstaje bez podpierania się o stopień ołtarza, przestawia ciężki wazon z wodą i znów lekko przyklęka, żeby poprawić wstążkę.\n\nKiedy szła do zakrystii z pustym wiadrem, odważyłam się ją zaczepić.\n\n„Proszę mi wybaczyć śmiałość... ale jak pani to robi z kolanami? Ja jestem pięć lat młodsza, a w niedzielę nie byłam w stanie uklęknąć w ławce”.\n\nPostawiła wiadro na posadzce i uśmiechnęła się ciepło.\n\n„Proszę pani, dwa lata temu na Boże Ciało syn musiał wnosić mi wiaderka do kościoła, bo ze schodów na chór schodziłam bokiem, stopień po stopniu. Myślałam, że już po moim układaniu kwiatów”.\n\nSpojrzała w stronę pustej nawy i lekko uniosła rąbek długiej ciemnej spódnicy.\n\nNie miała żadnej wielkiej ortezy ani beżowej skarpety uciskowej z apteki. Tuż pod rzepką, na obu nogach, miała zapięte cieniutkie matowoczarne paski szerokie może na dwa palce.\n\n„Mój bratanek jest fizjoterapeutą w Poznaniu”, powiedziała cicho. „Jak zobaczył moje opuchnięte nogi w tych ciasnych rękawach z apteki, to załamał ręce. Wytłumaczył mi, że jak kolano ma wytartą poduszkę pod rzepką, to ściskanie całej rzepki materiałem działa jak dociskanie pokrywki do wrzącego garnka. Przy zgięciu rzepka nie ma gdzie uciec i trze żywym ogniem”.\n\nDotknęła palcem miejsca tuż pod kolanem.\n\n„Ten pasek zostawia samą rzepkę całkowicie wolną. Ma od środka taki wyprofilowany silikonowy wałek, który podpiera samo więzadło pod rzepką i przejmuje napięcie, kiedy zgina pani nogę do klęku albo schodzi ze stopnia. A z tyłu jest cienki paseczek, więc w ogóle nie gniecie żylaków”.\n\nWyjęła z kieszeni fartucha czystą białą karteczkę i długopisem napisała na niej starannym pismem nazwę: **SARDIAN**.\n\n„Niech pani nie siada pod żadnym filarem na Komunii wnuczki. Zamówi pani dzisiaj, to we wtorek będzie w domu”.\n\nTego samego wieczoru usiadłam przy komputerze, wpisałam nazwę z karteczki i sama przeczytałam dziesiątki opinii kobiet w moim wieku. Przekonały mnie dwie rzeczy: badanie biomechaniczne potwierdzające odciążenie ścięgna rzepki aż o 34% oraz uczciwa 60-dniowa gwarancja zwrotu pieniędzy. Zamówiłam zestaw 1+1 z drugą opaską gratis, bo lewe kolano przy oszczędzaniu prawego też już zaczynało dawać o sobie znać.\n\nKurier zapukał we wtorek przed południem.\n\nZałożyłam obie opaski w sypialni przed lustrem. Jedyna uwaga praktyczna: nie zakłada się ich na grube rajstopy, bo śliski nylon zmniejsza przyczepność silikonu, więc zapięłam je bezpośrednio na gołą skórę pod eleganckie materiałowe spodnie od kostiumu komunijnego. Usiadłam na brzegu łóżka, przyłożyłam miękki 8-milimetrowy rdzeń dokładnie we wgłębienie dwa palce pod rzepką i dociągnęłam boczne paski na stalowych przelotkach. W lustrze pod tkaniną spodni nie było widać absolutnie nic.\n\nZrobiłam próbę w salonie przy fotelu, na wypadek gdybym musiała się asekurować ręką.\n\nUgięłam kolana powoli. Dziesięć stopni. Trzydzieści. Sześćdziesiąt. Czekałam na ten znajomy, paraliżujący gwóźdź pod rzepką. Zamiast niego poczułam sprężyste, pewne trzymanie poniżej rzepki, jakby czyjaś silna dłoń podtrzymała staw od dołu. Dotknęłam kolanem dywanu, po czym wyprostowałam nogi i wstałam prosto, nie dotykając podłokietnika fotela ani jednym palcem.\n\nStałam na środku dywanu w salonie i śmiałam się przez łzy do pustego pokoju.\n\nOsiemnastego maja nadeszła Pierwsza Komunia Zuzi.\n\nKościół był pełen po brzegi i pachniał białymi liliami. Usiadłam w drugiej ławce od ołtarza, zaraz za moją wnuczką w śnieżnobiałej albie. Kiedy zadzwoniły dzwonki na Przeistoczenie, teściowa córki zerknęła na mnie kątem oka, gotowa przesunąć się, żebym mogła zostać stojąca.\n\nA ja spokojnie uklękłam na drewnianym klęczniku obok całej rodziny. Kiedy po modlitwie wszyscy wstawali, wstałam lekko razem z nimi, wyprostowana, bez łapania się ławki.\n\nPo mszy przed kościołem mała Zuzia podbiegła do mnie w białym wianku, a ja mogłam przyklęknąć na kostce przed schodami, żeby przytulić ją dokładnie na wysokości jej oczu do wspólnego zdjęcia.\n\nTeściowa córki zapytała później przy obiedzie: „Pani Halinko, wzięła pani tę drogą blokadę w zastrzyku, o której mówiły sąsiadki?”.\n\nUśmiechnęłam się tylko nad filiżanką rosołu: „Nie, żadnych igieł. Znalazłam mądrzejsze podparcie”.\n\nMoje kolana nadal mają 65 lat. Szanuję je, nie dźwigam ciężkich zgrzewek wody i na dłuższe spacery zawsze zakładam wygodne buty. Ale odzyskałam swoją godność w ławce, na schodach i przy własnej wnuczce.\n\nJeśli boisz się uklęknąć w kościele albo kucnąć przy wnukach, bo nie wiesz, czy zdołasz sama wstać.\nJeśli zwykłe opaski uciskowe z apteki tylko wbijają Ci rzepkę w obolały staw i uciskają żylaki na łydkach.\nNie ściskaj całej rzepki: odciąż więzadło dokładnie dwa palce pod nią.\n\nOpaska podrzepkowa **Sardian™** jest całkowicie niewidoczna pod spodniami i długą spódnicą, zakłada się ją na siedząco w 5 sekund, a w obecnym pakiecie 1+1 otrzymujesz drugą sztukę GRATIS. Masz pełne 60 dni na spokojne przetestowanie jej w domu: jeśli nie poczujesz różnicy, zwracają 100% wpłaty bez zbędnych pytań.\n\n👉 Sprawdź, dlaczego to działa nawet przy zużytej chrząstce i odbierz pakiet 1+1: https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan\n\nP.S. Zdjęcie w ramce, na którym przyklękam przy Zuzi przed kościołem, stoi dziś na honorowym miejscu na komodzie w moim salonie."
  },
  "orthevia-10-dziadek-ty-juz-tylko-siedzisz-na-lawce-pilka-z-wnukiem": {
    "headline": "„Dziadek nie kopnie, dziadek pilnuje kurtek”.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni na test bez ryzyka.",
    "primaryText": "Piłka w biało-czarne łaty poturlała się po trawie prosto pod moje buty. Mój sześcioletni wnuk Kuba biegł już w moją stronę z rozpostartymi rękami, ale w połowie alejki jego tata zawołał: „Podaj dziadkowi!”. Mały zatrzymał się i odkrzyknął na cały park: „Nie, tato, dziadek nie kopnie, dziadek już tylko pilnuje kurtek na ławce!”.\n\nNie powiedział tego ze złością. Powiedział to tak naturalnie, jak mówi się, że niebo jest niebieskie. Dla mojego sześcioletniego wnuka po prostu byłem starszym panem przyspawanym do drewnianej ławki, obłożonym cudzymi bluzami i plecaczkiem z piciem.\n\nMam 63 lata. Nie osiemdziesiąt pięć.\n\nPrzez 35 lat pracowałem w terenie jako geodeta: miedze, wykopy, skarpy kolejowe, po piętnaście kilometrów dziennie w ciężkich butach ze statywem na ramieniu. Zawsze uważałem się za sprawnego faceta. Kiedy rodził się Kuba, obiecywałem zięciowi na szpitalnym korytarzu, że nauczę małego strzelać lewą nogą pod poprzeczkę.\n\nPotem przyszło to przeklęte uczucie kolana z waty.\n\nNie chodziło nawet o sam tępy ból wieczorami. Najgorsza była nagła, zdradziecka utrata kontroli przy zatrzymaniu albo zejściu z najmniejszej nierówności. Dwa miesiące przed tamtym wyjściem do parku wracałem rano z piekarni pod blokiem. Zwykły dwucentymetrowy krawężnik przy przejściu dla pieszych. Postawiłem prawą nogę nieco szybciej i kolano bez żadnego ostrzeżenia uciekło mi do środka, jakby ktoś na ułamek sekundy wyjął z niego kość.\n\nRunąłem na jedno kolano na chodnik, rozrywając nogawkę spodni, a chleb i sześć kajzerek potoczyły się pod koła zaparkowanych aut. Młoda dziewczyna w słuchawkach zbierała mi te bułki do reklamówki, pytając, czy zadzwonić po kogoś z rodziny.\n\nOd tamtego poranka w mojej głowie włączył się hamulec, którego nie potrafiłem wyłączyć.\n\nZacząłem patrzeć wyłącznie pod własne buty. Unikałem trawników, pochyłych zjazdów do garażu, pośpiechu na zielonym świetle i zabawy z Kubą. Za każdym razem, gdy mały ciągnął mnie za rękaw na boisko, wykręcałem się tym, że założyłem wyjściowe półbuty albo że ktoś musi pilnować rzeczy na ławce. Aż w końcu sześcioletnie dziecko uwierzyło, że do niczego więcej już się nie nadaję.\n\nW domu próbowałem ratować się na własną rękę. Kupiłem w aptece grubą opaskę stabilizującą za 129 zł: dawała złudne poczucie ściśnięcia przez pierwsze piętnaście minut, po czym zsuwała się w dół i tak cisnęła pod rzepką, że po powrocie ze spaceru kolano pulsowało do północy. Prywatna wizyta u ortopedy z USG kosztowała kolejne 350 zł. Lekarz poruszał rzepką na boki i stwierdził krótko: „Wiotkość aparatu wyprostnego i starcie powierzchni pod rzepką. W pana wieku już w piłkę grać nie będziemy, panie Krzysztofie. Rower stacjonarny bez obciążenia i leki doraźnie”.\n\nW kolejny czwartek poszedłem odebrać Kubę z treningu piłkarskiego na przyszkolnym Orliku.\n\nZajęcia prowadził emerytowany nauczyciel WF-u z naszego dawnego liceum, dziś siedemdziesięciojednoletni mężczyzna z siwą czupryną. Stałem za siatką i nie wierzyłem własnym oczom: człowiek o osiem lat starszy ode mnie truchtał wzdłuż linii bocznej z gwizdkiem, hamował w miejscu na sztucznej murawie, przykucał przy małym bramkarzu, żeby zawiązać mu sznurówkę i podawał dzieciakom piłki wewnętrzną częścią stopy.\n\nPo treningu, kiedy rodzice zabierali maluchy do szatni, podszedłem do niego przy koszu z piłkami.\n\n„Proszę zdradzić uczciwie: obydwa kolana ma pan już wymienione na metalowe?”\n\nRoześmiał się głośno i poklepał po udach w krótkich spodenkach trenerskich. Dopiero wtedy zauważyłem, że pod prawą rzepką, na gołej nodze, ma zapięty wąski czarny pasek.\n\n„Moje własne od siedemdziesięciu jeden lat! Ale trzy lata temu też mi prawe kolano uciekało na schodach w szkole tak, że bałem się zejść do szatni bez trzymania poręczy”.\n\nPokazał mi palcem, gdzie dokładnie leży ten pasek.\n\n„Wie pan, skąd bierze się to uczucie, że kolano robi się miękkie jak z waty i ucieka na krawężniku? To nie kość się łamie. Kiedy ścięgno pod rzepką jest przeciążone i obolałe, przy nagłym obciążeniu pana własny mózg w ułamku sekundy odruchowo wyłącza mięsień uda, żeby uchronić staw przed bólem. Noga traci napięcie i leci pan w dół. Fizjoterapeuci nazywają to hamowaniem bólowym”.\n\nDotknął twardego silikonowego wałka pod paskiem.\n\n„Jak dociśnie pan więzadło dokładnie tutaj, dwa palce pod rzepką, rdzeniem o grubości ośmiu milimetrów, to po pierwsze zdejmuje pan ponad jedną trzecią szarpnięcia ze stawu, a po drugie daje receptorom w ścięgnie stały sygnał stabilizacji. Rzepka trzyma swój tor jak tramwaj w szynie i kolano przestaje uciekać przy hamowaniu”.\n\nWyjął z kieszeni dresu mały notesik sędziowski, wyrwał karteczkę i napisał mi długopisem nazwę: **SARDIAN**.\n\n„Tylko niech pan nie kupuje tanich gumek z bazaru bez silikonowego rdzenia w środku, bo spadną na kostkę przy pierwszym kroku. Ten trzyma jak zamurowany”.\n\nJeszcze tego samego wieczoru wpisałem w domu nazwę z karteczki w Google, przeczytałem recenzje innych seniorów i zamówiłem pakiet 1+1 (druga opaska była za darmo) z 60-dniową gwarancją zwrotu pieniędzy.\n\nOpaski przyszły w poniedziałek. Przez pierwsze trzy dni nosiłem jedną pod spodniami do sklepu, po schodach i na długi spacer wokół zalewu. Pierwsze, co uderzyło mnie już po kilkunastu minutach marszu, to dziwny spokój w głowie: przestałem wpatrywać się w każdą płytkę chodnikową pod nogami. Przy schodzeniu z krawężnika pod rzepką nie było już tego ułamka zawahania, noga lądowała twardo i pewnie.\n\nW sobotę po obiedzie poszliśmy z córką, zięciem i Kubą do parku. Zięć jak zwykle rzucił mi swoją wiatrówkę w stronę ławki.\n\nPołożyłem kurtki na oparciu, ale nie usiadłem. Wszedłem na trawę między dwa drzewa, które robiły za słupki bramki i klasnąłem w dłonie:\n\n„No dawaj, Kuba. Dziadek dzisiaj stoi na bramce”.\n\nOczy wnuka zrobiły się wielkie jak pięciozłotówki. Przez 25 minut broniliśmy na zmianę, podawałem mu piłkę po ziemi, robiłem krok w bok przy jego strzałach i ani razu nie poczułem pod rzepką tego paraliżującego uciekania. Kiedy wracaliśmy alejką na lody, mały szedł obok mnie za rękę i zapytał całkiem poważnie:\n\n„Dziadku, naprawiłeś sobie nogę na zawsze?”\n\n„Na tyle, żebyś mi łatwo gola nie strzelił, kolego”, odpowiedziałem.\n\nOczywiście trzeba znać umiar: pasek nie zastąpi zerwanych więzadeł krzyżowych i nie zrobi z sześćdziesięciolatka napastnika ekstraklasy, a po całym popołudniu na nogach warto go odpiąć w domu, żeby skóra odpoczęła. Ale z pilnowaniem kurtek na ławce skończyłem definitywnie.\n\nJeśli boisz się przyspieszyć kroku na pasach albo zejść z krawężnika, bo masz wrażenie, że kolano jest z waty i za chwilę pod Tobą ucieknie.\nJeśli zacząłeś odmawiać spacerów i zabawy z wnukami, wykręcając się zmęczeniem.\nZanim pogodzisz się z rolą starszego pana z ławki, sprawdź, co robi punktowe podparcie ścięgna dwa palce pod rzepką.\n\nOpaska podrzepkowa **Sardian™** z rdzeniem silikonowym 8 mm stabilizuje tor rzepki, nie zsuwa się w ruchu i jest zupełnie niewidoczna pod spodniami. W ofercie 1+1 drugą sztukę otrzymujesz GRATIS, a na test w codziennym ruchu masz pełne 60 dni z gwarancją zwrotu pieniędzy bez żadnych pytań.\n\n👉 Sprawdź tutaj i przetestuj Sardian™ przez 60 dni bez ryzyka: https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial\n\nP.S. Drugą opaskę z zestawu nosi teraz mój szwagier na rybach, odkąd zobaczył na grillu, że sam schodzę ze skarpy nad wodę."
  },
  "stryde-07-mozesz-przyjsc-do-damskiej-toalety-niska-toaleta": {
    "headline": "Dlaczego niska toaleta zawsze wygrywa.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu.",
    "primaryText": "„Możesz przyjść do damskiej toalety? Proszę. Nikomu nie mów”. Mam 58 lat. Wysłałam tego SMS-a z kabiny w pracy. Chwilę później weszła dziewczyna z kadr.\n\nBył wtorek. Kwadrans po czternastej.\n\nDamska toaleta na parterze, ta, z której zawsze korzystam, bo muszle są tam zamontowane wyżej, miała na drzwiach kartkę: *Awaria*.\n\nObok recepcji jest toaleta dla niepełnosprawnych. Nigdy w życiu do niej nie weszłam. Nie jestem niepełnosprawna. Z zewnątrz wyglądam zupełnie normalnie.\n\nPoszłam więc na drugie piętro. Ostatnia kabina. Tam toalety są bardzo niskie.\n\nI nie byłam w stanie wstać.\n\nOparłam obie dłonie płasko o ścianki kabiny i spróbowałam się podnieść. Kolana nie przyjęły ciężaru. Spróbowałam trzy razy. Za trzecim razem w prawym kolanie przeszył mnie tak ostry ból, że musiałam zagryźć wargę, żeby nie krzyknąć na cały korytarz.\n\nSiedziałam tam przez piętnaście minut.\n\nW końcu wyjęłam telefon i napisałam do Beaty.\n\n„Możesz przyjść do damskiej toalety? Proszę. Nikomu nie mów”.\n\nBeata ma 61 lat. Siedzi przy biurku naprzeciwko mnie w dziale płac od dziewiętnastu lat. Przyszła od razu. Wsunęła ręce pod moje pachy, policzyła do trzech i dźwignęła mnie w górę, aż usłyszałam, jak w jej własnych kolanach strzyka jak w suchym chruście.\n\nI w tym momencie otworzyły się drzwi.\n\nKornelia z HR. Dwadzieścia sześć lat. Stanęła w progu z kosmetyczką w ręku i popatrzyła na nas. Na mnie i na Beatę podtrzymującą mnie pod pachy jak małe dziecko.\n\nKornelia bez słowa wycofała się za drzwi.\n\nMam na imię Julia. Mam 58 lat. Od dwudziestu trzech lat prowadzę płace w dużej firmie. Znam na pamięć przepisy podatkowe połowy budynku. Ludzie przychodzą do mnie ze swoimi problemami, a ja je rozwiązuję.\n\nA przez ostatnie dwa lata planowałam każdy dzień pracy wokół tego, z której toalety będę w stanie wstać.\n\nZaczęło się od schodów w domu. Potem wysiadanie z samochodu. Potem niska kanapa u siostry. Wreszcie toalety.\n\nLekarka powiedziała: zmiany zwyrodnieniowe, starcie chrząstki w obu kolanach, w prawym mocniejsze. Dała mi ulotkę z nakładkami podwyższającymi na sedes i wpisała do kolejki. Próbowałam ściągaczy z apteki, żeli, tabletek. Niska toaleta zawsze wygrywała.\n\nWięc nauczyłam się tym zarządzać. Tylko parter. I przestałam pić cokolwiek po jedenastej rano, żebym do końca pracy musiała iść tylko raz. Dwa lata codziennego bólu głowy o szesnastej z odwodnienia.\n\nJedna kartka z napisem *Awaria* na drzwiach sprawiła, że te dwa lata ukrywania się runęły w jedno popołudnie.\n\nW środę rano pojawiło się to na grupie na WhatsAppie.\n\nMamy wspólną grupę naszego piętra, dwadzieścia osiem osób. Zwykle pisze się tam o składkach na urodziny i o tym, kto zastawił komu miejsce na parkingu.\n\nO 9:14 ktoś napisał: *„Toaleta na parterze już działa? Pytam dla koleżanki Julii 😂”*.\n\nWiadomość została usunięta o 9:18.\n\nCztery minuty w zupełności wystarczą, żeby przeczytało ją dwadzieścia osiem osób.\n\nNapisała to Kornelia. Wiedzieli wszyscy. Nikt się nie odezwał. W kolejnym tygodniu dostałam z działu HR oficjalnego maila zatytułowanego: *„Dostosowanie stanowiska pracy, przyjazna rozmowa”*. W załączniku był formularz. Pytanie czwarte brzmiało: czy rozważała Pani zmniejszenie wymiaru etatu?\n\nDwadzieścia trzy lata pracy. Pytanie czwarte.\n\nW sobotę wieszałam pranie w ogrodzie, kiedy usłyszałam w domu wiertarkę. Gdy weszłam do środka, na ścianie obok naszej toalety był przykręcony chromowany uchwyt dla seniorów. Mój mąż Filip nic o nim nie wspomniał. Nawet nie musiałam mu opowiadać o pracy, od roku słyszał przez drzwi, jak męczę się w naszej łazience.\n\nZaczęłam zostawać w biurze po godzinach, do osiemnastej trzydzieści albo dziewiętnastej. Piętro było wtedy puste i nikt nie liczył mi czasu w łazience.\n\nI właśnie tak zgadałam się z panią Gosią.\n\nPani Gosia sprząta nasz biurowiec wieczorami. Mówiłam jej „dobry wieczór” tysiąc razy, ale nigdy wcześniej dłużej nie rozmawiałyśmy.\n\nTamtego wieczoru myła listwy przypodłogowe wzdłuż korytarza przed naszym działem. Na kolanach, z wiadrem i ścierką, przez całą długość korytarza.\n\nKiedy dotarła do ciężkich drzwi przeciwpożarowych na końcu, po prostu wstała. Jedna dłoń oparta o własne kolano i w górę.\n\nMa sześćdziesiąt sześć lat. Trzydzieści lat na kolanach na biurowych posadzkach. A wstała z podłogi lżej, niż ja wstaję z fotela.\n\n„Pani Gosiu. Jak pani to robi?”\n\nSpojrzała na mnie przez sekundę, po czym podeszła i przysiadła na rogu sąsiedniego biurka.\n\n„Słyszałam o tamtym wtorku, kochana”.\n\nOczywiście, że słyszała. Panie sprzątające wiedzą w biurze o wszystkim.\n\nPodciągnęła nogawkę roboczych spodni. Tuż pod rzepką miała zapięty wąski czarny pasek. Nie wokół całego kolana jak te moje z apteki. Pod rzepką.\n\n„Trzy lata temu było ze mną gorzej niż z panią. Syn mi to znalazł. Pierwszego wieczoru, jak to założyłam, obrobiłam cały budynek i poszłam normalnie na autobus”.\n\n„Pani Gosiu, próbowałam już opasek na kolano”.\n\n„Próbowała pani rzeczy, które ściskają całe kolano”. Wskazała ręką na ciężkie drzwi przeciwpożarowe na końcu korytarza. „Zna pani te drzwi. Ciężkie jak cholera, zawiasy wyrobione. Jak spróbuje je pani pchnąć przy samym zawiasie, to ani drgną. Ale jak pchnie pani przy klamce, jedną ręką, otwierają się lekko. Pani kolano to właśnie takie wyrobione drzwi. Po prostu przez cały czas pchała je pani w złym miejscu”.\n\nStuknęła palcem w czarny pasek pod rzepką.\n\n„A to podpiera we właściwym miejscu”.\n\nPowiedziała wprost: chrząstka od tego nie odrośnie. Ale pasek siada na jednym punkcie na ścięgnie pod rzepką i sprawia, że przy wstawaniu siła idzie tam, gdzie noga potrafi ją udźwignąć, zamiast wbijać się w wytarty staw.\n\nNapisała mi nazwę na odwrocie harmonogramu sprzątania: **SARDIAN**. I podkreśliła dwa razy.\n\n„Niech pani weźmie od razu dwie sztuki w cenie jednej. Sama pani zobaczy”.\n\nZamówiłam tamtej nocy, bo była 60-dniowa gwarancja zwrotu. Przyszły w poniedziałek.\n\nPo powrocie do domu założyłam pasek pod rzepką, poszłam do kuchni i wyciągnęłam stary, niski fotel po teściu, ten, na którym nikt nigdy nie siada, bo jest tak niski, że kolana podchodzą pod samą brodę.\n\nUsiadłam w nim. Położyłam dłonie na udach. I wstałam.\n\nBez podpierania się rękami. Bez bujania tułowiem. Bez łapania się krawędzi stołu. Poczułam, jak ciężar przechodzi przez nogi i czekałam na to znajome ukłucie pod rzepką. Nie nadeszło. Po prostu stałam.\n\nFilip stał przy zlewie. Odwrócił się.\n\n„Zrób to jeszcze raz”, powiedział.\n\nZrobiłam to jeszcze raz. I kolejny. Pięć razy z rzędu, aż zaczął się śmiać.\n\nNastępnego dnia w pracy o jedenastej trzydzieści wypiłam cały kubek herbaty. O dwunastej poszłam do toalety. Na drugie piętro. Do ostatniej kabiny. Specjalnie.\n\nI wstałam bez problemu.\n\nNie wypełniłam formularza z HR. A trzy tygodnie później mój telefon zawibrował na biurku. SMS od Beaty: *„Możesz przyjść do damskiej toalety? Proszę. Nikomu nie mów”*.\n\nPoszłam po nią na drugie piętro i pomogłam jej wstać dokładnie tak, jak ona wcześniej pomogła mnie. A kiedy wróciłyśmy do biurek, wyjęłam z torebki drugi pasek z zestawu i położyłam go przed nią.\n\nJeśli w pracy najpierw wybierasz toaletę, a dopiero potem drugie śniadanie.\nJeśli przestałaś pić po jedenastej rano, żeby nie musieć wstawać z niskiej muszli.\nJeśli ktoś bliski bez słowa przykręcił w twojej łazience uchwyt na ścianie.\n\nW pakiecie 1+1 dostajesz dwie opaski w cenie jednej, jedną dla siebie, a drugą dla koleżanki, która napisze do ciebie z kabiny. Masz 60 dni na test w domu (na najniższym fotelu, jaki masz w mieszkaniu) i pełną gwarancję zwrotu.\n\n👉 Przeczytaj, dlaczego punkt pod rzepką decyduje o wszystkim i przetestuj Sardian™ przez 60 dni: https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan"
  },
  "stryde-08-corka-wysyla-linki-z-otodom-do-mieszkan-na-parterze": {
    "headline": "Zanim sprzedasz dom ze schodami.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu.",
    "primaryText": "Moja córka ciągle podsyła mi linki do mieszkań na parterze i małych domków bez piętra. Mieszkam w moim domu od czterdziestu jeden lat.\n\nPierwszy link z Otodom przyszedł we wtorek po Wielkanocy.\n\n*„Zobacz mamo! Łazienka bez progu i zero schodów!! 😍”*\n\nMały parterowy domek na obrzeżach. Niski ogródek. Zero stopni.\n\nPatrzyłam na ekran telefonu przy stole w kuchni przez długą chwilę. Potem odpisałam: *„Bardzo ładny, córuś”*.\n\nOd tamtej pory przysłała mi jeszcze 23 takie linki.\n\nMieszkam w tym domu od 1985 roku. Kupiliśmy go z moim mężem Alkiem rok po ślubie. Alek był stolarzem. W 1986 roku własnoręcznie zrobił dębową poręcz do naszych schodów z kawałka dębiny ze stolarni, bo stwierdził, że ta stara to wstyd. Szlifował ją przez trzy weekendy. Do dziś pod palcami czuć miejsce przy samej górze, gdzie strug mocniej zebrał słój drewna.\n\nAlek zmarł cztery lata temu. Trzymałam się tej poręczy codziennie przez czterdzieści lat. A odkąd odszedł, jeszcze mocniej.\n\nTrzynaście stopni. I małe półpiętro pośrodku.\n\nW ostatnie Boże Narodzenie wchodziłam już po nich tak, jak nasza wnuczka Pola, kiedy miała dwa latka. Obie stopy na każdym stopniu. Lewa w górę, prawa dostawiana obok. I długi postój na półpiętrze, żeby złapać oddech i poczekać, aż kolano przestanie rwać.\n\nPola nocowała u mnie co drugą sobotę, w pokoju na górze. Jesienią przestała przyjeżdżać na noc. Moja córka Karolina tłumaczyła, że mała ma rano basen. Wiedziałam jednak, że chodzi o to, że w nocy nie byłabym w stanie szybko wejść do niej po schodach.\n\nW marcu Karolina została na niedzielnym obiedzie i patrzyła, jak wchodzę na górę. Nic wtedy nie powiedziała. Pierwszy link z ogłoszeniem przyszedł trzy tygodnie później.\n\n*„Ten jest blisko przystanku!”*\n*„Mamo, tylko zerknij. Bez presji. Buziaki”*.\n\nMożesz nakrzyczeć na kogoś, kto jest dla ciebie okrutny. Ale nie potrafisz nakrzyczeć na córkę, która na końcu SMS-a stawia całusa.\n\nPrzestałam już wtedy schodzić na dół wieczorami. O dwudziestej trzydzieści zabierałam na górę termos z herbatą i termofor i zostawałam w sypialni do rana. Jeśli zapomniałam tabletek z kuchni, szłam spać bez nich.\n\nLekarka powiedziała: zużycie chrząstki, „kość o kość” w prawym kolanie. Wpisała mnie do kolejki. Ściągacze z apteki rolowały się do kostki, a laska, którą Karolina kupiła mi na urodziny, stoi w szafie z metką, bo czułam się z nią, jakbym miała dziewięćdziesiąt lat.\n\nW lipcu wróciłam z zakupów i na moim półpiętrze stał młody mężczyzna w garniturze z miarką laserową i podkładką do pisania. Karolina dała mu swój zapasowy klucz, żeby „orientacyjnie wycenił dom”.\n\nBył bardzo uprzejmy. Zmierzył pokój na górze, pokój Poli. Kiedy schodził na dół, zatrzymał się na półpiętrze, poklepał dębową poręcz mojego męża i powiedział:\n\n„Piękny dom. Tylko te schody odstraszą starszych kupujących”.\n\n*Starszych kupujących.* Powiedział to, trzymając rękę na poręczy, którą zrobił Alek.\n\nKiedy w środę Karolina znów wysłała link do tamtego parterowego domku z dopiskiem: *„Oglądanie w sobotę o 11:00? Zawiozę Cię”*, zgodziłam się. Pomyślałam, że jak pojadę i obejrzę, to da mi spokój.\n\nDrzwi otworzyła nam sama właścicielka. Pani Irena. Siedemdziesiąt dziewięć lat. Sama oprowadzała nas po domu, bo stwierdziła, że agenci nieruchomości nigdy nie wiedzą, gdzie jest główny zawór wody.\n\nPatrzyłam, jak się porusza.\n\nZeszła po stopniu do ogrodu zimowego, jakby go tam w ogóle nie było. Uklękła, żeby pokazać Karolinie szafkę pod zlewem i wstała, opierając się tylko lekko dłonią o własne udo, nie przerywając zdania.\n\nJestem od niej o osiem lat młodsza. Nie dałabym rady zrobić żadnej z tych rzeczy.\n\nKiedy Karolina wyszła obejrzeć ogródek, pani Irena wstawiła wodę na herbatę.\n\n„Dlaczego właściwie sprzedaje pani ten domek, pani Ireno?”, zapytałam.\n\nRoześmiała się. „Każdy o to pyta! Kupiłam ten parterowy domek sześć lat temu przez moje kolana. A teraz przeprowadzam się do trzypiętrowego szeregowca obok mojej wnuczki, bo w październiku rodzi prawnuka. Będę tam biegać po schodach góra-dół przez cały dzień”.\n\nMusiałam zrobić wielkie oczy, bo zaśmiała się znowu i podciągnęła nogawkę spodni.\n\nTuż pod rzepką miała zapięty wąski czarny pasek. Nie na kolanie. Pod rzepką.\n\n„Wnuczka kupiła mi go w lutym. Pierwszego ranka weszłam po jej schodach na drugie piętro bez zatrzymywania się. Rozpłakałam się na korytarzu tak, że wystraszyłam jej męża”.\n\n„Pani Ireno, ja mam całą szufladę opasek na kolano”.\n\n„Nie, kochana. Ty masz w szufladzie rzeczy, które oplatają całe kolano. A problemem jest to, gdzie uderza ciężar”. Dotknęła mojej torebki z zakupami. „To tak jak z ciężkimi siatkami. Jak niesiesz je w palcach za cienkie uszy, wrzynają się do krwi. Jak zarzucisz je na ramię, waga jest dokładnie taka sama, ale nagle możesz iść. Ten pasek robi to samo pod rzepką, przenosi nacisk ze zużytego miejsca na twarde ścięgno”.\n\nWzięła ze stołu wydrukowaną ulotkę biura nieruchomości, tę ze zdjęciem jej własnego parterowego domku na okładce i na odwrocie napisała dużymi literami: **SARDIAN**.\n\n„Sprzedają je dwa w cenie jednego”, dodała. „Na pewno znajdziesz kogoś, komu przyda się drugi”.\n\nW samochodzie nie powiedziałam Karolinie ani słowa. Przez całą drogę trzymałam na kolanach ulotkę z parterowym domkiem z przodu i nazwą paska z tyłu.\n\nZamówiłam go tamtego wieczoru. Przyszedł w piątek.\n\nZałożyłam go w kuchni, tuż pod rzepką. Dopasowany, ale nie duszący nogi.\n\nPodeszłam do schodów i położyłam dłoń na dębowej poręczy Alka.\n\nPrzy pierwszym stopniu spięłam się w sobie, czekając na to piekące, trące uczucie pod rzepką, które towarzyszyło mi każdego wieczoru od dwóch lat.\n\nNie było go.\n\nNie zniknęło jak za dotknięciem czarodziejskiej różdżki, po prostu przesunęło się w miejsce, które nie bolało.\n\nDrugi stopień wzięłam prawą nogą. Tą gorszą. Nie dostawiając stopy do stopy. Normalnie, stopa za stopą, tak jak wchodziłam po tych schodach przez całe życie.\n\nNie zatrzymałam się na półpiętrze. A o dziesiątej wieczorem zrobiłam coś, czego nie robiłam od Bożego Narodzenia: zeszłam na dół do kuchni tylko po to, żeby zaparzyć sobie świeżą herbatę. Bo mogłam.\n\nW sobotę zadzwoniłam do Karoliny i zapytałam, czy Pola może przyjechać na noc w przyszły weekend.\n\nW niedzielę Karolina przyjechała z tym samym młodym agentem nieruchomości, żeby zrobić zdjęcia do ogłoszenia. Miała w ręku teczkę z wyceną przeprowadzki i listą rzeczy do spakowania. Razem z nią przyszedł mój zięć Marcin, który od roku utyka na lewą nogę i myśli, że nikt nie widzi.\n\nNie było mnie na dole, kiedy weszli. Byłam na piętrze, w pokoju Poli i zakładałam jej świeżą pościel w jednorożce.\n\n„Mamo?”, zawołała Karolina z dołu.\n\n„Jestem na górze. Już schodzę”.\n\nZeszłam ze starą pościelą pod jedną pachą i drugą dłonią lekko opartą o poręcz Alka. Stopa za stopą. Bez postoju na półpiętrze.\n\nCała trójka stała na dole i patrzyła na mnie w całkowitym milczeniu. Agent miał aparat fotograficzny zawieszony na szyi.\n\nKiedy stanęłam na dole, spojrzałam na niego i powiedziałam: „Mówił pan, że te schody odstraszą starszych kupujących. Cóż, ta starsza pani nigdzie się stąd nie wybiera”.\n\nPodciągnęłam nogawkę spodni, dokładnie tak jak zrobiła to pani Irena.\n\nPrzez chwilę nikt się nie odzywał. Pierwszy odezwał się młody agent: „Przepraszam, mogę zapytać, co to jest? Moja babcia ma identyczny problem ze schodami”. Zapisał sobie nazwę w telefonie jeszcze w moim przedpokoju.\n\nA Karolina odłożyła teczkę z dokumentami na komodę i rozpłakała się w moje ramię, mówiąc: „Tak strasznie się o ciebie bałam na tych schodach, mamo”. Przytuliłam ją, a drugi pasek z zestawu wręczyłam zięciowi.\n\nJeśli twoja córka zaczęła podsyłać ci ogłoszenia mieszkań na parterze.\nJeśli chodzisz spać o dwudziestej trzydzieści, żeby nie musieć drugi raz pokonywać schodów.\nJeśli ktoś zaczął już mierzyć twój korytarz.\n\nZanim spakujesz czterdzieści jeden lat życia w kartony, sprawdź to na własnych schodach. W pakiecie 1+1 dostajesz dwie opaski w cenie jednej i 60 dni gwarancji zwrotu bez żadnych pytań.\n\n👉 Sprawdź wynik Testu Schodów i przetestuj opaskę Sardian™ w swoim domu przez 60 dni: https://sprobujsardian.pl/pages/test-schodow\n\nP.S. Czterdzieści jeden lat w tym domu. Zaczynam czterdziesty drugi."
  },
  "stryde-09-w-wieku-67-lat-maz-zostawil-mnie-dla-72-latki-z-dancingow": {
    "headline": "Zapytała mnie w łazience, co mam na kolanie.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu.",
    "primaryText": "W wieku 67 lat mąż zostawił mnie dla innej kobiety. Ona ma 72 lata. I wciąż potrafi tańczyć.\n\nZobaczyłam ich na deptaku w kwietniu, dwa tygodnie po tym, jak się wyprowadził.\n\nSzli od strony przystanku tramwajowego. Szła pół kroku przed nim, lekko jak piórko i odwróciła się, żeby na niego zaczekać.\n\nNie zauważył mnie. Patrzył na jej stopy.\n\nCzterdzieści cztery lata byłam żoną tego człowieka. Stałam przy barierce z siatkami z zakupów i patrzyłam, jak mój mąż wpatruje się w kobietę, która idzie po chodniku tak, jakby płynęła po parkiecie.\n\nCofnę się o kilka lat.\n\nKrzysiek nie umiał tańczyć, kiedy poznałam go w 1980 roku. Jeździł autobusem miejskim, miał dwie lewe nogi i nic sobie z tego nie robił. Ja chodziłam na tańce od czternastego roku życia, więc nauczyłam go kroków w naszym małym pokoju po zwinięciu dywanu.\n\nOd 1996 roku chodziliśmy w każdy czwartek na popołudniowe dancingi. Przez dwadzieścia siedem lat to był nasz święty rytuał.\n\nTrzy lata temu, w połowie obrotu, w moim prawym kolanie coś zapiekło żywym ogniem.\n\nNie potrafię tego inaczej opisać, jakby ktoś wbił rozgrzany nóż prosto pod rzepkę i przekręcił. Dokończyłam taniec z przyklejonym uśmiechem, opierając cały ciężar na lewej nodze. A potem siedziałam w samochodzie na parkingu i płakałam.\n\nLekarz powiedział: zużycie chrząstki, prawie kość o kość. Brałam tabletki. Wzięłam zastrzyk, który pomógł na sześć tygodni. Kupiłam w aptece opaskę elastyczną, która przy każdym kroku zwijała się pod sukienką, więc co chwilę musiałam uciekać do toalety, żeby ją podciągać.\n\nW kolejny czwartek Krzysiek stanął w przedpokoju w płaszczu.\n\n„Idziesz, kochanie?”\n\n„Idź sam, kochanie. Zrobię ci kolację, jak wrócisz”.\n\nPowtarzałam to w każdy czwartek przez trzy lata. *Idź sam, kochanie.* Myślałam, że jestem dobrą żoną, bo nie odbieram mu tego, co oboje kochaliśmy. Ani razu nie pomyślałam o tym, z kim tam tańczy.\n\nMa na imię Sylwia. Ma 72 lata. Jest wdową i tańczy fokstrota tak, jakby unosiła się centymetr nad ziemią.\n\nWyprowadził się w marcu. Spakował walizkę we wtorek rano, posadził mnie przy stole w kuchni i powiedział łagodnie: „Tu nie chodzi o wiek, Laura. Ona jest starsza od ciebie”.\n\nMyślał, że to mnie pocieszy. Gdyby miała czterdzieści lat, mogłabym sobie wytłumaczyć, że staremu odbiło. Ale miała siedemdziesiąt dwa lata. Nie chodziło o to, że była młodsza. Chodziło o to, że wciąż mogła robić tę jedną rzecz, której ja już nie mogłam.\n\nTrzy tygodnie później siedziałam u mojej fryzjerki Danusi pod suszarką hełmową na zapleczu. Do salonu weszły dwie znajome z czwartkowych dancingów. Nie widziały mnie.\n\n„Słyszałaś o Krzyśku?”\n„Że jest z Sylwią? Wszyscy słyszeli”.\n„No cóż. Sylwia przynajmniej dalej tańczy”.\n\nI zaśmiały się. Nie złośliwie, tak jak ludzie śmieją się z cudzego nieszczęścia, które ich nie dotyczy.\n\nW kolejny piątek Danusia zapisała mnie na ostatnią godzinę, kiedy salon był już pusty. Umyła mi głowę, a potem usiadła na fotelu obok mnie i podciągnęła nogawkę spodni.\n\nTuż pod rzepką miała zapięty wąski czarny pasek.\n\n„Słyszałam je w zeszłym tygodniu, Laura. Tak mi przykro, kochana. Córka kupiła mi to na Wielkanoc. Stoję za tym fotelem od czterdziestu lat, a w grudniu myślałam już o zamknięciu salonu. Pierwszego dnia, kiedy to założyłam, przestałam całą sobotę i wróciłam pieszo do domu”.\n\n„Danusiu, ja mam całą szufladę opasek z apteki”.\n\n„Takiej nie masz. Co zawsze krzyczała twoja dawna nauczycielka tańca?”\n\nNie musiałam się nawet zastanawiać: „To nigdy nie jest wina stóp, Laura. Chodzi o to, gdzie trzymasz ciężar ciała”.\n\n„No właśnie. To nigdy nie był twój wiek. Chodzi o to, gdzie uderza ciężar w kolanie”.\n\nZapisała mi nazwę na odwrocie wizytówki salonu: **SARDIAN**. Zamówiłam zestaw 1+1 tamtego wieczoru (z 60-dniową gwarancją zwrotu).\n\nPrzyszło w środę. Założyłam pasek w kuchni, poszłam na górę i wyjęłam z samego dna szafy pudełko ze srebrnymi butami do tańca na niskim obcasie.\n\nZałożyłam je na kuchennym linoleum. *Wolny. Szybki-szybki. Wolny.*\n\nWiedziałam, co zawsze działo się przy ćwierćobrocie. Przez trzy lata czekałam na ten gorący nóż pod rzepką. Wstrzymałam oddech i zrobiłam obrót.\n\nNic.\n\nNie mówię, że bolało trochę mniej. Mówię, że czekałam na ukłucie noża, a jego tam po prostu nie było. Usiadłam na podłodze w kuchni w srebrnych butach i rozpłakałam się jak mała dziewczynka.\n\nNastępnego dnia był czwartek. Wyjęłam z szafy zieloną sukienkę, spakowałam buty do torebki i pojechałam tramwajem na salę.\n\nKiedy weszłam, orkiestra grała fokstrota. Krzysiek i Sylwia byli pod sceną. Moje dwie znajome z salonu fryzjerskiego siedziały przy swoim stoliku, jednej z nich filiżanka zatrzymała się w pół drogi do ust.\n\nPodszedł do mnie Artur (81 lat, przyjaciel z dawnych lat) i wyciągnął rękę. Przetańczyliśmy walca, fokstrota i quickstepa, z obrotem dokładnie przed stolikiem moich znajomych. Kiedy usiadłam w przerwie, usłyszałam z ich stolika głośne: „No proszę. Laura jednak dalej tańczy”.\n\nPod koniec wieczoru poszłam do toalety poprawić makijaż.\n\nPrzy umywalce stała Sylwia.\n\nStała z całym ciężarem ciała opartym na jednej nodze i masowała dłonią bok kolana, myśląc, że jest sama. Twarz miała szarą z bólu.\n\nZobaczyła mnie w lustrze i błyskawicznie się wyprostowała. A potem spojrzała w dół, poprawiałam rajstopy pod sukienką i zobaczyła czarny pasek pod moją rzepką.\n\n„Laura... Co to jest, to co masz na kolanie?”\n\nMa 72 lata. I wciąż potrafi tańczyć. Ale przy tamtej umywalce ukrywała dokładnie to samo kolano, które ja ukrywałam przez trzy lata.\n\n„Nazywa się Sardian™”, odpowiedziałam spokojnie. „Danusia z salonu fryzjerskiego ci powie”.\n\nKiedy zagrali ostatniego walca, Krzysiek przeszedł przez cały parkiet i stanął przede mną z wyciągniętą dłonią, dokładnie tak jak w nasz pierwszy czwartek w 1996 roku.\n\n„Laura. Zatańczysz?”\n\n„Wybacz, Krzysiu”, uśmiechnęłam się. „Ten taniec mam już zajęty”. I przetańczyłam go z Arturem.\n\nA drugi pasek z zestawu, ten darmowy, włożyłam do koperty z imieniem Sylwii i zostawiłam u pani w szatni.\n\nJeśli zbyt wiele razy powiedziałaś w życiu „Idź sam, kochanie”.\nJeśli twoje ulubione buty leżą w pudełku na dnie szafy.\nJeśli ktoś wmówił ci, że to po prostu twój wiek.\n\nWyjmij buty z szafy. Masz 60 dni na test bez żadnego ryzyka.\n\n👉 Zobacz, jak działa celowane odciążenie ścięgna Sardian™ (Pakiet 1+1 z 60-dniową gwarancją): https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan"
  },
  "orthevia-14-trzecie-pietro-bez-windy-udawalam-ze-szukam-kluczy": {
    "headline": "Na półpiętrze udawałam, że szukam kluczy.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni na test na własnych schodach.",
    "primaryText": "Na drugim półpiętrze usłyszałam za plecami szybkie kroki sąsiadki spod dwunastki, więc natychmiast zatrzymałam się pod oknem, otworzyłam torebkę i zaczęłam udawać, że szukam w niej okularów. Wszystko po to, żeby trzydziestoletnia dziewczyna nie widziała, jak schodzę po własnej klatce schodowej bokiem, dostawiając nogę do nogi jak dwuletnie dziecko, z zaciśniętymi zębami przed kolejnym stopniem.\n\nMieszkam na trzecim piętrze w czteropiętrowym bloku z wielkiej płyty. Bez windy.\n\nMam na imię Elżbieta, mam 64 lata i od śmierci męża mieszkam w tym M-3 sama. Przez trzydzieści lat te 48 lastrykowych stopni między moją wycieraczką a skrzynkami pocztowymi na parterze nie stanowiło najmniejszego problemu: wbiegałam po nich z dwiema siatkami ziemniaków i zgrzewką mleka. Nigdy nie przypuszczałam, że własna klatka schodowa stanie się moim więzieniem.\n\nKto nigdy nie miał zwyrodnienia pod rzepką, ten myśli, że najtrudniej jest wejść na górę. Nieprawda. Wejść jeszcze jakoś wejdziesz, podciągając się za poręcz siłą rąk.\n\nPrawdziwym piekłem jest schodzenie w dół.\n\nW chwili, gdy stawiasz jedną nogę na niższym stopniu, a drugie kolano musi zgiąć się z tyłu i utrzymać cały ciężar twojego ciała z siatką zakupów, pod rzepką wybucha żywy ogień. Dokładnie tak, jakby ktoś wbijał pod nią rozżarzony gwóźdź i jednocześnie sypał w staw potłuczone szkło.\n\nJesienią zeszłego roku doszłam do momentu, w którym planowałam całe swoje życie wokół tych 48 stopni.\n\nZaczęłam wychodzić do Biedronki tylko we wtorki i w piątki, żeby ograniczyć schodzenie do dwóch razy w tygodniu. Przy półce z nabiałem liczyłam w głowie wagę każdego produktu: jeśli wzięłam litr mleka i kostkę masła, odkładałam słoik z ogórkami, bo lewa ręka mogła nieść najwyżej trzy kilogramy. Prawa ręka musiała być pusta, żebym mogła przez wszystkie trzy piętra kurczowo zaciskać dłoń na zimnej metalowej barierce. Listy ze skrzynki wyjmowałam raz na tydzień.\n\nW przychodni rejonowej usłyszałam to, co słyszy połowa kobiet w moim wieku w Polsce: „Pani Elżbieto, chrząstka pod rzepką wytarta, kość zaczyna czuć kość. Na windę w czteropiętrowym bloku spółdzielnia nie da, więc trzeba powoli chodzić, łykać przeciwbólowe przed wyjściem i kupić sobie ściągacz w aptece”.\n\nKupiłam nie jeden, ale cztery: dwa w aptece (po 48 zł sztuka) i dwa z reklam w sieci (za 119 zł i 149 zł, razem 364 zł wyrzucone w błoto). Każdy z nich robił na schodach dokładnie tę samą krzywdę: kiedy ściskał całe kolano elastyczną tkaniną, przy zginaniu nogi do zejścia ze stopnia dobijał moją rzepkę jeszcze mocniej do kości. Zamiast ulgi czułam tępe dławienie w całym stawie, a na parterze ściągacz był już zwinięty w harmonijkę na łydce.\n\nW listopadowy wtorek stałam na parterze przy skrzynkach na listy, zbierając siły na wejście na górę z siatką zakupów, kiedy do klatki wszedł nasz listonosz, pan Mirek.\n\nZnamy się z widzenia od piętnastu lat. Ma 60 lat i codziennie z ciężką torbą na ramieniu obchodzi 38 klatek schodowych na naszym osiedlu, w każdej cztery piętra bez windy. Pamiętałam doskonale, że jeszcze wiosną był przez dwa miesiące na zwolnieniu właśnie przez kolana i wszyscy na osiedlu mówili, że przejdzie na rentę.\n\nTymczasem wrzucił polecone do skrzynek i ruszył po naszych stromych stopniach w górę normalnym, równym krokiem, stawiając stopy naprzemiennie bez trzymania się poręczy.\n\nKiedy schodził z powrotem z czwartego piętra, przodem i płynnie, nie wytrzymałam i zapytałam przy samych drzwiach:\n\n„Panie Mirku, niech się pan zlituje i powie, jakich zastrzyków pan użył, że pan tak zbiega z czwartego piętra! Bo ja zaraz zacznę zjeżdżać po tej barierce na siedząco”.\n\nZatrzymał się na wycieraczce, poprawił pasek torby i uśmiechnął się ze zrozumieniem.\n\n„Żadnych zastrzyków, pani Elu. Jeden zastrzyk za 700 zł starczył mi w marcu na trzy tygodnie chodzenia po klatkach. Dopiero rehabilitant z poradni medycyny pracy wytłumaczył mi prostą fizykę schodów”.\n\nPokazał ręką na pierwszy stopień.\n\n„Wie pani, dlaczego na płaskim chodniku da się jeszcze iść, a przy schodzeniu ze schodów wyciska łzy z oczu? Bo na płaskim na kolano działa pani normalna waga. A w ułamku sekundy, kiedy schodzi pani stopień niżej, na ścięgno pod rzepką uderza czterokrotność masy ciała! Waży pani 70 kilo, a to jedno wąskie ścięgno pod rzepką musi przy każdym jednym stopniu wyhamować prawie 280 kilogramów nacisku!”\n\nAż spojrzałam na swoje kolano. Nikt w żadnym gabinecie nigdy mi tego w ten sposób nie wyjaśnił.\n\n„Ściągacz z apteki ściska rzepkę jak opaska uciskowa i jeszcze zwiększa tarcie przy tym obciążeniu”, dodał pan Mirek i podwinął na chwilę granatową nogawkę spodni służbowych. „A ja noszę pod spodem tylko taki wąski pasek z twardym silikonowym wałkiem 8 mm, zapięty dwa palce pod rzepką. Rzepka ma pełen luz, a pasek działa jak amortyzator na samym ścięgnie i zabiera z niego jedną trzecią szarpnięcia na każdym stopniu”.\n\nWyjął z przegródki torby czysty biały kartonik i długopisem zapisał na nim drukowanymi literami: **SARDIAN**.\n\n„Dają dwa miesiące na wypróbowanie na własnych schodach, pani Elu. Jak nie pomoże na trzecie piętro, oddają pieniądze bez gadania”.\n\nJeszcze tego samego popołudnia wpisałam nazwę z kartonika w telefonie, poczytałam opinie innych kobiet z bloków bez windy i zamówiłam zestaw 1+1 (druga opaska była gratis, od razu z myślą o lewym kolanie, które przeciążałam, oszczędzając prawe).\n\nPaczka przyszła w czwartek. W piątek rano usiadłam na krześle w przedpokoju, zapięłam opaskę na gołą skórę we wgłębieniu dwa palce pod rzepką, opuściłam nogawkę czarnych spodni, wzięłam torebkę i otworzyłam drzwi na klatkę.\n\nStanęłam u szczytu trzeciego piętra. Pierwszy stopień w dół, z dłonią nad poręczą w pogotowiu. Brak gwoździa pod rzepką. Drugi stopień: postawiłam lewą stopę niżej, nie dostawiając jej do prawej. Trzeci, czwarty, półpiętro.\n\nNa drugim piętrze otworzyły się drzwi spod dwunastki i wyszła ta sama młoda sąsiadka. Tym razem nie zatrzymałam się pod oknem i nie otworzyłam torebki, żeby udawać, że szukam kluczy. Powiedziałam jej „dzień dobry” i zeszłam normalnie, przodem, aż do samych drzwi klatki.\n\nTamtego dnia kupiłam w Biedronce mleko, masło, ziemniaki i duży słoik kiszonych ogórków, na który miałam ochotę od miesiąca.\n\nUczciwie zaznaczę jedną rzecz: ten pasek nie sprawi, że wbiegniesz na trzecie piętro bez zadyszki jak nastolatka, a przy pierwszym wyjściu na schody trzeba dobrze dopasować miejsce rdzenia (musi leżeć dokładnie w miękkim dołku pod rzepką, nie na samej kości rzepki). Ale moje 48 stopni przestało być murem odcinającym mnie od świata.\n\nJeśli mieszkasz na piętrze bez windy i każde wyjście po schodach urasta w Twojej głowie do rangi wyprawy.\nJeśli przy schodzeniu w dół czujesz pod rzepką kłucie jak rozżarzony gwóźdź i schodzisz bokiem, dostawiając stopę do stopy.\nPrzetestuj na własnej klatce schodowej rozwiązanie stworzone dokładnie pod ten jeden punkt obciążenia.\n\nOpaska podrzepkowa **Sardian™** z wyprofilowanym rdzeniem 8 mm odciąża ścięgno rzepki o 34%, nie zsuwa się na łydkę i jest całkowicie niewidoczna pod spodniami. Teraz w pakiecie 1+1 drugą opaskę dostajesz GRATIS, a na spokojny test na własnych schodach masz aż 60 dni z pełną gwarancją zwrotu pieniędzy.\n\n👉 Sprawdź wyniki Testu Schodów i zamów z 60-dniową gwarancją: https://sprobujsardian.pl/pages/test-schodow\n\nP.S. Przed Świętami zostawiłam panu Mirkowi przy skrzynce paczuszkę domowych pierników. Bez jego kartonika pewnie do dziś liczyłabym w sklepie każdy słoik."
  },
  "orthevia-15-wysoki-prog-wanny-i-jasiek-miedzy-kolanami-o-3-w-nocy": {
    "headline": "Stałam w ręczniku przed wanną i bałam się wyjść.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu bez zbędnych pytań.",
    "primaryText": "Telefon komórkowy został w przedpokoju na komodzie. Moja córka mieszka 40 kilometrów stąd i dzwoni w środy oraz w niedziele. Był czwartek, godzina 21:40, a ja stałam w wannie z wypuszczoną wodą, trzymając się mokrymi dłońmi baterii przy ścianie i bałam się przełożyć prawą nogę przez wysoki żeliwny próg.\n\nKto mieszka sam po sześćdziesiątce, ten zna ten cichy, lodowaty strach, o którym wstydzimy się powiedzieć nawet własnym dzieciom.\n\nMam 68 lat, mam na imię Teresa i przez 36 lat pracowałam w bibliotece miejskiej. Zawsze ceniłam swoją niezależność. Po odejściu męża utrzymywałam nasze mieszkanie w idealnym porządku, sama robiłam opłaty, sama chodziłam na targ i na każde pytanie córki odpowiadałam niezmiennie: „Wszystko świetnie, córeczko, o mnie się nie martw”.\n\nNie mówiłam jej, że od pół roku przegrywam z własnymi kolanami w czterech ścianach własnego domu.\n\nW dzień najgorsza była łazienka ze starą głęboką wanną z lat osiemdziesiątych. Aby z niej wyjść, trzeba stanąć całym ciężarem na jednej nodze na śliskim dnie, a drugą mocno zgiąć w kolanie i przenieść wysoko nad emaliowanym rantem. W tamten czwartek, kiedy uniosłam lewą stopę, w prawym kolanie coś chrupnęło i przeszył mnie taki ból pod rzepką, że noga zadrżała jak galareta. Stałam nad pustą wanną w narzuconym na ramiona ręczniku przez dobre dziesięć minut, zanim odważyłam się usiąść okrakiem na zimnej krawędzi wanny i zsunąć na dywanik prawie na siedząco.\n\nKiedy wreszcie kładłam się do łóżka, zaczynała się druga zmiana.\n\nOkoło 3:00 nad ranem budził mnie tępy, wiercący ból w głębi kolana, kropka w kropkę jak ćmiący w nocy ból zęba, przed którym nie ma jak ułożyć nogi. Gdy kładłam się na boku i jedno kolano dotykało drugiego, czułam żywą tkliwość od przyśrodkowej strony i tuż pod rzepką. Od miesięcy nie przespałam ani jednej nocy bez małej poduszki „jaśka” wciśniętej między kolana. Rano po budziku siedziałam na brzegu wersalki i rozcierałam sztywne jak drewniany kołek stawy, zanim odważyłam się pójść nastawić wodę na herbatę.\n\nW piątek po tamtym wieczorze w łazience zadzwoniłam po fachowca z ogłoszenia, żeby wycenił wyrzucenie wanny i wstawienie niskiego brodzika prysznicowego.\n\nPan pomierzył moją małą łazienkę w bloku, pokiwał głową nad żeliwnymi rurami i podał kwotę na kartce: 16 800 zł z kafelkami i robocizną (4 200 zł materiały z kabiną i odpływem plus 12 600 zł skucie, hydraulika i układanie płytek). Z mojej emerytury mogłabym równie dobrze usłyszeć sto tysięcy.\n\nKiedy zamknęłam za nim drzwi, na klatce schodowej minęła go pani Iwonka spod szóstki, nasza sąsiadka i sześćdziesięciodwuletnia emerytowana pielęgniarka oddziałowa z ortopedii. Zapukała do mnie pięć minut później z talerzykiem świeżego sernika.\n\nJedno spojrzenie doświadczonej pielęgniarki na moje zaczerwienione oczy przy kuchennym stole wystarczyło, żebym opowiedziała jej wszystko: o staniu w wannie bez telefonu, o wycenie na 16 800 zł i o jaśku między kolanami o trzeciej w nocy.\n\nPani Iwonka wysłuchała mnie spokojnie, po czym zajrzała do koszyka przy lodówce, gdzie leżały moje dwie rozciągnięte opaski z apteki i tubki żeli przeciwbólowych.\n\n„Pani Tereniu”, pokręciła głową, „przez 35 lat na oddziale napatrzyłam się na tysiące takich kolan. Dlaczego kolano rwie panią o trzeciej w nocy jak chory ząb? Bo przez cały dzień, przy każdym wstaniu z fotela, każdym kroku w kuchni i przy tej wannie, przeciążone więzadło pod rzepką dostaje tysiące mikro-szarpnięć. Wieczorem rozwija się w nim jałowy stan zapalny i w nocy, kiedy ciało stygnie, zaczyna pulsować”.\n\nWzięła do dwóch palców moją beżową opaskę z apteki i rozciągnęła ją jak starą gumkę od weków.\n\n„Taka skarpeta z apteki tylko przyciska rzepkę do obolałej kości i dusi krążenie pod kolanem, dlatego wieczorem staw puchnie i ćmi jeszcze bardziej. Pani nie musi kuć całej łazienki za prawie siedemnaście tysięcy. Pani musi w ciągu dnia zdjąć ciężar z więzadła rzepki, żeby przestało się drażnić przy każdym zgięciu”.\n\nWyszła na minutę do swojego mieszkania i wróciła ze swoją czarną opaską, którą nosiła na dyżury i na długie spacery z psem. Pokazała mi gruby, miękki silikonowy rdzeń od wewnętrznej strony oraz metalowe sprzączki po bokach, po czym na karteczce z mojego notesu przy telefonie napisała wyraźnie: **opaska podrzepkowa Sardian**.\n\n„Zakłada się ją rano na siedząco pod kolanem na cały dzień chodzenia po domu i na zakupy, a do spania i przed samą kąpielą zdejmuje. Niech pani zobaczy po tygodniu, co stanie się z nocnym rwaniem i z progiem wanny”.\n\nTego samego wieczoru usiadłam z tabletem w fotelu, wpisałam nazwę z karteczki pani Iwonki i sama przeczytałam opinie innych seniorek. Widząc 60-dniową gwarancję zwrotu pieniędzy oraz promocję 1+1 (druga opaska gratis na lewe kolano), złożyłam zamówienie.\n\nOpaski przyszły we wtorek przed południem.\n\nZałożyłam obie od razu w kuchni, siedząc wygodnie na krześle. Miękki 8-milimetrowy wałek ułożył się dokładnie we wgłębieniu pod rzepką, nie dotykając samej rzepki i nie wrzynając się z tyłu kolana. Ważne ograniczenie, o którym uprzedziła mnie pani Iwonka: w opasce nie śpimy w nocy i nie wchodzimy w niej pod wodę, bo jej zadaniem jest praca w pionie i w ruchu w ciągu dnia. Ale już po wstaniu od stołu zniknęło to ciągłe, niepewne trzeszczenie i ciągnięcie pod kolanem przy każdym kroku po przedpokoju.\n\nNajpiękniejsza rzecz wydarzyła się piątej nocy.\n\nObudziłam się i zobaczyłam za oknem jasny poranek. Spojrzałam na zegarek na szafce nocnej: 6:45. Przespałam ciągiem siedem godzin bez budzenia się o trzeciej nad ranem z tępym bólem zęba w kolanie, bo odciążone w ciągu dnia ścięgno wreszcie przestało pulsować stanem zapalnym co wieczór.\n\nPrzy kąpieli, choć zgodnie z rozsądkiem dokupiłam sobie w sklepie medycznym porządną matę antypoślizgową na dno wanny za 45 zł, przekładam nogę nad progiem pewnie, spokojnie i bez drżenia kolana jak galareta.\n\nNie jestem już trzydziestolatką i zawsze trzymam w łazience uchwyt pod ręką. Ale we własnym domu znów czuję się bezpiecznie, a 16 800 zł zostało na moim koncie.\n\nJeśli w nocy budzi Cię tępy, ćmiący ból kolana i śpisz z poduszką między nogami.\nJeśli rano potrzebujesz dziesięciu minut, żeby rozchodzić sztywny staw, a wieczorem z lękiem patrzysz na próg własnej wanny.\nSprawdź, ile zmienia odciążenie tego jednego punktu pod rzepką w ciągu dnia.\n\nOpaska podrzepkowa **Sardian™** nie uciska rzepki ani żył pod kolanem, zakłada się ją na siedząco w kilka sekund, a w zestawie 1+1 drugą opaskę otrzymujesz GRATIS. Masz pełne 60 dni na przetestowanie jej we własnym domu z gwarancją zwrotu pieniędzy bez żadnych pytań.\n\n👉 Poznaj więcej historii i zamów Sardian™ z 60-dniową gwarancją zwrotu: https://sprobujsardian.pl/pages/131-nocy-w-fotelu\n\nP.S. W środę, kiedy zadzwoniła córka i zapytała, jak się czuję, po raz pierwszy od roku mogłam odpowiedzieć „świetnie, córeczko” i nie skłamać ani jednym słowem."
  },
  "stryde-10-biora-za-to-tysiace-w-klinikach-skalpel-vs-mlot": {
    "headline": "Wydałam ponad 6 000 zł na kolano. Dopiero pasek pod rzepką pozwolił mi wstać z kanapy.",
    "description": "Dwa elementy wykonujące tę samą pracę mechaniczną. Jeden kosztuje fortunę, drugi mieści się w kopercie.",
    "primaryText": "Wiceprezes dużej firmy produkującej sprzęt ortopedyczny napisał kiedyś w wewnętrznym mailu jedno zdanie, które ktoś z pracowników sfotografował, zanim wiadomość skasowano:\n\n*„Jeśli pacjenci zorientują się, że prosty pasek podrzepkowy robi dokładnie to samo, za co my liczymy tysiące, stracimy miliony”.*\n\nPrzeczytaj to jeszcze raz.\n\nMam na imię Janina, mam 61 lat. I przez trzy lata byłam idealną klientką tego systemu.\n\nTrzy lata kolana, które wyło z bólu za każdym razem, gdy wstawałam z kanapy. „Przeciążenie ścięgna rzepki i starcie”, powiedział chirurg. „Wiek”, powiedział lekarz rodzinny.\n\nOto ile kosztował mnie mój „wiek”:\n- **350 zł** za prywatną piętnastominutową konsultację, na której usłyszałam, że albo operacja prywatnie za kilkadziesiąt tysięcy, albo półtora roku czekania w kolejce na NFZ.\n- **650 zł** za wielką ortezę zegarową z szynami ze sklepu medycznego, która wyglądała jak rusztowanie budowlane i zjeżdżała mi na piszczel przed południem.\n- **4 serie zastrzyków dostawowych** (po kilkaset złotych każda), każdy kolejny działał krócej niż poprzedni.\n- **Prywatna fizjoterapia po 180 zł za wizytę**, która pomagała dokładnie do momentu wyjścia z gabinetu.\n\nŁącznie ponad sześć tysięcy złotych. Tylko po to, żeby wstawać z własnej kanapy jak kobieta o trzydzieści lat starsza.\n\nPogodziłam się z tym. Albo stół operacyjny, albo zaciśnięte zęby.\n\nA potem córka podesłała mi artykuł o biomechanice ścięgna rzepki i porównanie drogich ortez odciążających z wąską opaską podrzepkową.\n\nWiecie, czym w rzeczywistości jest droga orteza odciążająca? To zawias, plastikowa skorupa, dwie silikonowe peloty i pasek. Koszt wyprodukowania części to kilkadziesiąt złotych. Cała reszta ceny to przedstawiciel medyczny, marża sklepu, dystrybutor i prowizja.\n\nAle najbardziej wściekła byłam, gdy zrozumiałam, że **droga orteza i wąski pasek podrzepkowy wykonują dokładnie tę samą pracę mechaniczną**:\nOba uciskają ścięgno tuż pod rzepką. Oba zdejmują niszczące obciążenie z jednego wytartego punktu i rozkładają siłę tak, żeby nie rwało przy wstawaniu i na schodach. Jedno robi to za pomocą kilograma plastiku i pośredników. Drugie robi to za pomocą wyprofilowanego silikonowego rdzenia, który mieści się w skrzynce na listy.\n\nZamówiłam opaskę **Sardian™** jeszcze tego samego wieczoru w pakiecie 1+1, zakładając w duchu, że pewnie za tydzień ją odeślę.\n\nKiedy przyszła w czwartek i wyjęłam ją z pudełka, zaśmiałam się pod nosem. Po tych wszystkich wielkich stabilizatorach z szynami ten wąski pasek wyglądał jak żart.\n\nZałożyłam go w kuchni, dwa palce pod rzepką, dociągnęłam rzepy w stalowych klamrach i poczułam, jak silikonowa podkładka miękko osiada na ścięgnie.\n\nA potem wstałam z kuchennego krzesła.\n\nI to ostre ukłucie, na które napinałam mięśnie przy każdym wstawaniu od trzech lat, po prostu się nie pojawiło. Usiadłam z powrotem i wstałam drugi raz, żeby sprawdzić, czy sobie tego nie wmówiłam. Za drugim razem też go nie było.\n\nCzwartego dnia zeszłam po schodach i dopiero na dole zorientowałam się, że nie trzymałam się poręczy. Dziewiątego dnia poszłam pieszo do sklepu i z powrotem bez brania samochodu. Po trzech tygodniach mój mąż powiedział przy kolacji: „Przestałaś wydawać ten dźwięk”, to ciche syknięcie powietrza przez zęby, które najwyraźniej robiłam przy każdym wstawaniu z krzesła, nawet o tym nie wiedząc.\n\nZanim wydasz kolejne kilkaset złotych na zastrzyk. Zanim zapłacisz za kolejną prywatną wizytę albo wielki stabilizator, który wyląduje w szufladzie:\nWstań teraz ze swojego krzesła w kuchni i wyczuj palcami punkt dwa centymetry pod rzepką. A potem załóż na ten sam punkt opaskę **Sardian™** (masz na to 60 dni pełnej gwarancji zwrotu) i wstań ponownie.\n\n👉 Zobacz wyniki Testu Schodów (14 opasek) i przetestuj Sardian™ przez 60 dni: https://sprobujsardian.pl/pages/test-schodow"
  },
  "stryde-11-kolega-mial-orteze-za-1600-zl-ja-mialem-waski-pasek": {
    "headline": "Kolega miał ortezę za 1 600 zł. Ja założyłem pasek. Zgadnij, co leży dziś w szafie.",
    "description": "Dwóch facetów, dwa bolące kolana, jeden z nas mylił się przez dwa lata.",
    "primaryText": "Na zdjęciu trzymam obie te rzeczy w dłoniach: wielką ortezę ze sklepu medycznego i mały czarny pasek, do którego przetestowania zmusił mnie mój kolega Gienek. Straciłem dwa lata na noszenie niewłaściwej rzeczy. Pozwólcie, że oszczędzę wam tych dwóch lat.\n\nMam na imię Bronisław. Mam 71 lat, jestem emerytowanym kolejarzem.\n\nMoje kolano dawało mi w kość od lat. Kiedy straciłem cierpliwość do kolejek na NFZ, kupiłem prywatnie pełną ortezę zegarową, tę wielką, z metalowymi zawiasami i pasami. Kosztowała mnie prawie 1 600 zł.\n\nNosiłem ją sumiennie. I powiem wam szczerze: to była udręka. Gorąca. Ciężka. Nie da się na nią naciągnąć normalnych spodni. A najgorsze, że po tym wszystkim kolano dalej rwało przy wstawaniu z fotela. Ale skoro kosztowała tyle pieniędzy, a pan w sklepie medycznym brzmiał bardzo mądrze, uznałem, że widocznie ze mną jest coś nie tak.\n\nAż pewnego dnia siedzimy w klubie z Gienkiem. Kolano Gienka jeszcze dwa lata temu było w gorszym stanie niż moje, brał blokady, chodził o lasce, wszystko.\n\nPatrzę, a Gienek wstaje z krzesła, żeby przynieść nam herbatę i podnosi się jak człowiek o dwadzieścia lat młodszy. Bez skrzywienia twarzy. Bez odpychania się rękami od podłokietników. Po prostu wstaje.\n\n„Gienek”, pytam, „jak ty to robisz?”.\n„Ale co?”\n„No tak wstajesz. Przecież z tobą było gorzej niż ze mną”.\n\nSięgnął do kieszeni kurtki i wyjął z niej mały, czarny zapasowy pasek. „Tym”, mówi. „Córka mi znalazła”.\n\nZaśmiałem się w głos. Naprawdę go wyśmiałem. „Gienek, dałem półtora tysiąca za profesjonalną ortezę z zawiasami. Myślisz, że wąski paseczek zrobi to, czego ona nie daje rady?”.\n\nGienek popatrzył na mnie spokojnie: „Bronek, moja orteza za półtora tysiąca leży na dnie szafy. A ten pasek jest na mojej nodze. Sam sobie odpowiedz, które z nich działa”.\n\nA potem wytłumaczył mi to tak, jak wytłumaczył mu jego fizjoterapeuta. I to było tak proste, że aż wzięła mnie złość, że nikt nie powiedział mi tego przez dziesięć lat:\n\nBól nie idzie z całego kolana. Idzie z jednego punktu, ze ścięgna tuż pod rzepką. Przy każdym kroku i każdym wstawaniu z krzesła całe przeciążenie uderza w ten jeden wytarty fragment. Wielka orteza usztywnia cały staw jak klatka, ale prawie w ogóle nie dotyka punktu pod rzepką. A ten wąski pasek siada bezpośrednio na ścięgnie i przejmuje obciążenie.\n\n„Wielka orteza jest stworzona dla ludzi po zerwaniu więzadeł i operacji”, powiedział Gienek. „Na zużyte kolano takie jak twoje i moje to po prostu złe narzędzie. Nosiłeś gips na całym ramieniu, kiedy potrzebowałeś mocnego opatrunku w jednym, konkretnym miejscu”.\n\nZamówiłem ten pasek jeszcze tego samego wieczoru z czystego uporu, żeby udowodnić mu, że gada głupoty.\n\nPrzyszedł w środę. Założyłem go dwa centymetry pod rzepką i wstałem z fotela.\n\nGienek miał rację. Jak ja nie cierpię, kiedy Gienek ma rację.\n\nTo ostre ukłucie, które czułem przy każdym wstawaniu od lat, zniknęło. Usiadłem i wstałem jeszcze cztery razy z rzędu jak głupek, tylko po to, żeby poczuć, że nic nie kłuje.\n\nOd trzech miesięcy wielka orteza za 1 600 zł leży w szafie. A pasek **Sardian™** mam na nodze codziennie, pod zwykłymi spodniami, gdzie nikt go nawet nie widzi.\n\nJeśli masz w domu wielką ortezę lub ściągacz, które dają więcej potu niż ulgi, nie zakładaj, że potrzebujesz jeszcze większego usztywniacza. W pakiecie 1+1 dostajesz dwie opaski w cenie jednej i masz pełne 60 dni na test w domu (ze zwrotem pieniędzy, jeśli nie poczujesz różnicy).\n\n👉 Sprawdź porównanie „Skalpel vs Młot Kowalski” i przetestuj Sardian™ przez 60 dni: https://sprobujsardian.pl/pages/test-schodow"
  },
  "orthevia-18-zastrzyk-kwasu-hialuronowego-za-1200-zl-z-emerytury": {
    "headline": "1 200 zł z emerytury starczyło na 5 tygodni.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji zwrotu.",
    "primaryText": "Czterysta złotych w październiku. Czterysta złotych w listopadzie. Czterysta złotych w grudniu, odłożone do białej koperty schowanej między obrusami w bieliźniarce, żeby dzieci nie wiedziały, na czym sobie odmawiam. Razem 1 200 zł. Tyle kosztowało mnie dziesięć minut w prywatnym gabinecie ortopedycznym i jedna długa igła wbita pod rzepkę z obietnicą: „Pani Bożenko, to nowoczesny żel hialuronowy, taki płynny implant. Na rok ma pani święty spokój ze schodami”.\n\nStarczyło na pięć i pół tygodnia.\n\nPiszę ten tekst ku przestrodze dla każdego emeryta i każdej kobiety w moim wieku, która właśnie liczy w domu grosz do grosza na kolejną prywatną blokadę albo zastrzyk żelowy, bo na wizytę w ramach NFZ kazali czekać do przyszłego roku.\n\nMam 66 lat, nazywam się Bożena i przez 33 lata przepracowałam na stojąco w szkolnej stołówce. Dźwiganie kotłów z zupą, mokre kafelki, tysiące przysiadów przy szafkach. Kiedy prawe kolano zaczęło przy schodzeniu ze schodów chrupać jak stary zmrożony śnieg pod butem i kłuć pod samą rzepką tak, że stawałam w połowie klatki ze łzami w oczach, uwierzyłam, że jedynym ratunkiem jest wstrzyknięcie smaru do środka.\n\nSama wizyta trwała może osiem minut: 300 zł za konsultację z USG oraz 900 zł za ampułkę gęstego preparatu. Moment wbicia grubej igły pod rzepkę i rozpierania stawu pamiętam do dziś. Przez kolejne dwie doby kolano było spuchnięte jak bania i gorące: leżałam na kanapie z paczką mrożonej marchewki z groszkiem owiniętą w ścierkę kuchenną, bo lekarz uprzedził, że przez chwilę może poboleć.\n\nPotem faktycznie przyszła ulga. Na 38 dni.\n\nChodziłam ostrożnie, cieszyłam się jak dziecko i powtarzałam sąsiadce, że warto było zacisnąć pasa przed Świętami. Aż w szóstym tygodniu, w zwykły lutowy czwartek, schodziłam po sześciu schodkach z osiedlowej apteki. W połowie trzeciego stopnia pod rzepką znów chrupnęło i przeszył mnie dokładnie ten sam ostry jak szydło ból.\n\nKiedy zadzwoniłam do rejestracji prywatnego gabinetu z pytaniem, dlaczego po sześciu tygodniach wszystko wróciło, recepcjonistka odpowiedziała wyuczonym tonem, że każdy organizm wchłania preparat indywidualnie i przy większym zwyrodnieniu często trzeba podać drugą albo trzecią dawkę przypominającą.\n\nKolejne 1 200 zł. Z emerytury wynoszącej 2 940 zł na rękę.\n\nRozpłakałam się ze złości i bezsilności nad kuchennym zlewem. Nie nad samym bólem, lecz nad tym uczuciem, że dla prywatnej medycyny człowiek po sześćdziesiątce jest bankomatem, do którego co dwa miesiące można dolewać drogi płyn.\n\nW marcu doczekałam się wreszcie dziesięciodniowego dziennego turnusu rehabilitacyjnego na skierowanie sprzed niemal roku. Lampka sollux, pole magnetyczne i piętnaście minut ćwiczeń na sali.\n\nTrzeciego dnia ćwiczył ze mną młody, może trzydziestoletni fizjoterapeuta z ogromną cierpliwością. Kiedy opowiedziałam mu o moim zastrzyku za 1 200 zł, który wyparował po miesiącu, pokiwał smutno głową, wziął długopis i na papierowym ręczniku na kozetce narysował mi kółko na lince.\n\n„Pani Bożeno, powiem pani coś uczciwie, czego rzadko mówią w prywatnych klinikach”, zaczął cicho. „Zastrzyk hialuronowy to tylko poślizg. Ale proszę spojrzeć na swoje kolano: rzepka trzyma się na więzadle rzepki, które przy osłabionych z wiekiem mięśniach jest bez przerwy szarpane i ciągnie rzepkę pod złym kątem przy każdym stopniu w dół. Wlali pani smar za 1 200 zł do zawiasu, który nadal wisi krzywo! Dopóki nic nie podeprze tego więzadła od zewnątrz i nie zdejmie z niego napięcia, pani własny ciężar wyciśnie i zetrze każdy żel w kilka tygodni”.\n\nZapytałam, czy mam w takim razie kupić sztywną ortezę z metalowymi zegarami za kilkaset złotych ze sklepu medycznego.\n\n„Broń Boże!” Żachnął się od razu. „Orteza zegarowa jest dla narciarza po zerwaniu więzadeł, a u pani tylko zdusi rzepkę i uśpi mięsień uda do reszty. Pani potrzebuje wyłącznie punktowego podparcia dwa palce pod rzepką: wąskiego paska z twardym rdzeniem silikonowym, który zostawia rzepkę całkowicie odsłoniętą, a odciąża samo więzadło przy zgięciu”.\n\nWziął małą białą karteczkę ze stolika i napisał mi na niej drukowanymi literami samą nazwę: **SARDIAN**.\n\n„Kosztuje ułamek jednej wizyty u ortopedy, a w badaniach biomechanicznych takie podparcie podrzepkowe zdejmuje ze ścięgna ponad trzydzieści procent obciążenia na każdym kroku. Ma pani też dwa miesiące na zwrot, gdyby u pani nie zadziałało”.\n\nPo powrocie do domu wpisałam w wyszukiwarkę nazwę z karteczki od fizjoterapeuty i sama zaczęłam czytać komentarze ludzi, którzy tak jak ja wydali wcześniej tysiące złotych na zastrzyki, osocze i maści. Zamówiłam zestaw 1+1 (druga opaska była całkowicie gratis).\n\nNie musiałam odkładać na nią przez trzy miesiące do koperty w bieliźniarce.\n\nKiedy założyłam opaskę po raz pierwszy, dokładnie we wgłębienie dwa palce pod rzepką, dzięki czemu gruby 8-milimetrowy rdzeń silikonowy oparł się miękko, ale pewnie na samym ścięgnie, zeszłam po tych samych sześciu schodkach przed osiedlową apteką i zatrzymałam się na chodniku z niedowierzaniem.\n\nRzepka nie uciekła w bok. Nie było tego ostrego szydła na trzecim stopniu. Minęły cztery miesiące, nie pięć tygodni, a ja noszę ten sam dyskretny czarny pasek pod spodniami codziennie na zakupy, na cmentarz i na długie spacery z wnukami. Nie zużywa się, nie trzeba go dolewać igłą za 900 zł i w każdej chwili mogę go zdjąć w domu w trzy sekundy.\n\nUczciwie dodam jedno zastrzeżenie: pasek działa wyłącznie wtedy, gdy masz go na nodze w trakcie chodzenia, bo nie jest lekiem ani operacją i nie odbuduje startej chrząstki. Ale dziś już wiem, że zanim wyda się pół emerytury na igłę wbijaną w staw, trzeba najpierw zdjąć mechaniczny ciężar z miejsca, które ten staw codziennie przeciąża.\n\nJeśli zastrzyk w kolano pomógł Ci tylko na kilka tygodni albo właśnie zastanawiasz się, skąd wziąć kilkaset złotych na kolejną serię w prywatnym gabinecie, przetestuj najpierw czystą biomechanikę bez żadnego ryzyka finansowego.\n\nW aktualnej ofercie **Sardian™** kupując 1 opaskę, drugą otrzymujesz GRATIS, a Twoje zamówienie chroni pełna 60-dniowa gwarancja zwrotu pieniędzy: jeśli na Twoich własnych schodach nie poczujesz wyraźnej ulgi, odzyskasz każdą złotówkę.\n\n👉 Przeczytaj więcej o 5 powodach bólu pod rzepką i zamów z 60-dniową gwarancją: https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan\n\nP.S. Drugą opaskę z mojego pakietu 1+1 nosi dziś moja młodsza siostra: miała wyznaczony termin prywatnego zastrzyku na kwiecień i odwołała wizytę po czterech dniach chodzenia w pasku."
  },
  "orthevia-19-4-pudelka-kolagenu-i-12-tubek-masci-smarowanie-maski-auta": {
    "headline": "„Smarujesz maskę auta, gdy posypało się zawieszenie”.",
    "description": "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni na test bez ryzyka.",
    "primaryText": "Policzyłem to w niedzielę rano z paragonami rozłożonymi na kuchennym stole, kiedy po kolejnej tabletce przeciwbólowej piekł mnie żołądek tak, że nie mogłem dopić porannej kawy: 840 zł na cztery błyszczące pudełka kolagenu w saszetkach z reklamy telewizyjnej (po 210 zł za miesięczną kurację) oraz 480 zł na dwanaście tubek maści chłodzących, rozgrzewających i „końskich” z apteki.\n\nRazem 1 320 zł wyrzucone w błoto, a ja dalej schodziłem ze schodów do kotłowni bokiem, trzymając się obiema rękami rury ciepłowniczej.\n\nMam 59 lat, na imię Andrzej i pracuję w hurtowni elektrycznej. Cały dzień na betonie, wchodzenie na stopień busa, noszenie bębnów z przewodem. Kiedy dwa lata temu zaczęło mnie kłuć pod obiema rzepkami przy każdym przysiadzie i na schodach, zrobiłem dokładnie to, co podpowiada polska telewizja między prognozą pogody a serialem.\n\nKupiłem kolagen z witaminą C „na odbudowę chrząstki”. Piłem te pomarańczowe proszki z wodą co rano przez 120 dni jak zegarek. Wieczorem wcierałem w kolana kolejne żele z apteki tak, że moje spodnie od piżamy i pościel wiecznie śmierdziały kamforą i mentolem jak szatnia piłkarska, a żona otwierała okno w sypialni nawet w lutym. Skóra na wierzchu piekła albo ziębiła przez dwadzieścia minut, ale rano przy pierwszym stopniu schodów do piwnicy pod rzepką strzelało i rwało dokładnie tak samo jak we wrześniu.\n\nW tamtą niedzielę wpadł do nas po wiertarkę mój szwagier Romek.\n\nRomek ma 63 lata, prowadzi warsztat mechaniczny pod miastem, a dziesięć lat wcześniej jego syn grał zawodowo w siatkówkę i przeszedł dwie rehabilitacje kolan u lekarzy sportowych. Spojrzał na rząd napoczętych tubek na mojej szafce przy lodówce, potem na czwarte pudełko saszetek i parsknął krótko:\n\n„Andrzej, chłop jesteś z głową na karku, a dajesz się robić jak dziecko. Jak u klienta w samochodzie wybiło sworzeń wahacza i koło tłucze na każdej dziurze, to nacierasz mu maskę kremem Nivea czy naprawiasz podparcie na dole?”\n\nZatkało mnie, bo trafił w sam środek.\n\nUsiadł naprzeciwko mnie przy stole i wyłożył mi w dwie minuty to, czego nie usłyszałem w żadnej reklamie z uśmiechniętymi emerytami na rowerach:\n\n„Po pierwsze: kolagen z saszetki wpada ci do kwasu żołądkowego i twój układ pokarmowy trawi go na zwykłe aminokwasy dokładnie tak samo jak niedzielny rosół albo galaretkę z nóżek. Do wytartego kolana, w którym chrząstka nie ma nawet własnych naczyń krwionośnych, nie płynie żaden cudowny klej prosto pod rzepkę. Po drugie: maść z apteki przenika na parę milimetrów pod skórę i chłodzi ci naskórek mentolem, podczas gdy przy każdym kroku sto kilo twojej wagi szarpie więzadło pod rzepką z siłą kilkuset kilogramów. Ty próbujesz gasić mechaniczne tarcie zapachem mięty!”\n\nWziął z kąta salonu moją starą gitarę akustyczną i przycisnął palcem strunę na gryfie.\n\n„Pamiętasz, jak zakłada się kapodaster na gryf gitary? Jak struna lata za luźno i brzęczy o progi, nie polewasz pudła syropem. Dociskasz ją w jednym precyzyjnym punkcie przed mostkiem: skracasz drgający odcinek i struna od razu cichnie. Dokładnie tak samo lekarze sportowi ratowali kolano mojego młodego”.\n\nPodciągnął nogawkę swoich dżinsów. Sam od roku nosił na prawym kolanie wąski czarny pasek zapięty dokładnie dwa palce poniżej rzepki.\n\n„W fizjoterapii mówią na to efekt progu gitarowego. Ten silikonowy rdzeń od środka ma osiem milimetrów wysokości. Dociska więzadło rzepki w jednym punkcie między rzepką a kością piszczelową. Zmienia kąt ciągu mięśnia uda i zdejmuje z bolesnego przyczepu ponad trzydzieści procent szarpnięcia w tej samej sekundzie, w której zapniesz rzep. Bez psucia żołądka tabletkami i bez smrodu kamfory w łóżku”.\n\nOdwrócił mój długi paragon z apteki na czystą stronę i zapisał na nim długopisem nazwę: **SARDIAN**.\n\nWieczorem wszedłem w telefonie w wyszukiwarkę, wpisałem nazwę z paragonu i przeczytałem opinie innych facetów pracujących fizycznie. Na start zamówiłem pakiet 1+1 (kupiłem jedną, a drugą na lewe kolano dostałem gratis), bo pomyślałem: skoro dają 60 dni na darmowy zwrot, to sprawdzę tego „kapodastra” w poniedziałek w hurtowni przy noszeniu kabli.\n\nNie odesłałem ani jednej.\n\nW pierwszy czwartek w pracy złapałem się na tym, że o czternastej zszedłem z rampy załadunkowej normalnym krokiem z kartonem gniazdek w obu rękach, nie szukając wzrokiem barierki. Wieczorem moje spodnie od piżamy po raz pierwszy od roku nie lepiły się od żelu, a rano wypiłem czarną kawę bez palenia w przełyku po tabletce przeciwbólowej.\n\nUczciwa uwaga: opaska podrzepkowa nie sprawi, że odrośnie ci chrząstka z czasów wojska, a jeśli ktoś ma bardzo gęste owłosienie pod kolanem, przez pierwsze dwa dni silikonowy pasek potrafi lekko ciągnąć włoski przy zdejmowaniu. Ale proszki z telewizji i maści z apteki też chrząstki nie odbudują, za to wydrenują portfel i żołądek, zostawiając przeciążone ścięgno samemu sobie przy każdym stopniu.\n\nJeśli na Twojej półce w kuchni stoi już rząd pudełek na stawy i wyciśniętych do połowy tubek maści, a kolano na schodach kłuje dokładnie tak samo jak pół roku temu, przestań smarować maskę i podeprzyj zawieszenie.\n\nOpaska podrzepkowa **Sardian™** działa mechanicznie od pierwszego założenia (badanie *Sports Health*: -34% napięcia na ścięgnie rzepki), mieści się dyskretnie pod każdymi spodniami roboczymi i garniturowymi, a w promocji 1+1 drugą sztukę otrzymujesz GRATIS. Masz pełne 60 dni na test w pracy, w domu i na schodach: albo czujesz różnicę, albo oddają Ci 100% pieniędzy.\n\n👉 Sprawdź tutaj, jak działa mechanizm Sardian™ i przetestuj ją przez 60 dni bez ryzyka: https://sprobujsardian.pl/pages/przetestowalam-zebys-ty-nie-musial\n\nP.S. Żona wyrzuciła w sobotę wszystkie napoczęte maści kamforowe do kosza i powiedziała, że sypialnia wreszcie pachnie normalnym domem."
  },
  "orthevia-20-fizjoterapeuta-paradoks-imadla-dlaczego-zdejmuje-ortezy-w-progu": {
    "headline": "Dlaczego w gabinecie każę zdjąć grubą ortezę z apteki?",
    "description": "Mgr Marek Kowalczyk o „Paradoksie Imadła”. Sprawdź otwarte odciążenie podrzepkowe Sardian™ (60 dni na test).",
    "primaryText": "Jestem fizjoterapeutą ortopedycznym od siedemnastu lat. W zeszłym miesiącu policzyłem w swoim gabinecie coś, co powinno dać do myślenia każdemu po 55. roku życia: na 42 pacjentów, którzy przyszli do mnie z ostrym bólem kolana przy schodzeniu ze schodów i wstawaniu z krzesła, aż 31 miało na nodze gruby elastyczny rękaw albo sztywną ortezę z apteki.\n\nPierwszą rzeczą, o jaką proszę każdego z nich jeszcze przed badaniem na kozetce, jest zdjęcie tej ortezy i schowanie jej do torby.\n\nDlaczego? Ponieważ u zdecydowanej większości osób po pięćdziesiątce cierpiących na przeciążenie rzepkowo-udowe lub zwyrodnienie pod rzepką pełna, zabudowana opaska z apteki wywołuje zjawisko, które w biomechanice nazywamy **„Paradoksem Imadła”**.\n\nWyjaśnię to najprościej, bez medycznego żargonu.\n\nTwoja rzepka to mała kość zawieszona z przodu kolana na mocnym paśmie, czyli więzadle rzepki. Kiedy schodzisz po schodach, wysiadasz z samochodu albo wstajesz z niskiego fotela, mięsień uda ciągnie rzepkę z ogromną siłą (nawet 3- do 4-krotności masy Twojego ciała!). Jeśli z wiekiem poduszka chrzęstna pod rzepką uległa wytarciu, rzepka jest już zbyt mocno dociskana do kości udowej.\n\nCo robi tradycyjny elastyczny ściągacz lub gruba neoprenowa orteza naciągnięta na całe kolano?\n\n1. **Wbija rzepkę prosto w chory staw (Paradoks Imadła):** Pełny rękaw ściska kolano od przodu jak ciasna opaska, przyciskając rzepkę jeszcze mocniej do wytartej kości udowej. Przy każdym zgięciu nogi na schodach tarcie w stawie rośnie, zamiast maleć!\n2. **Dusi naczynia w dole podkolanowym:** Przy zginaniu nogi gruby materiał roluje się z tyłu kolana w twardy wałek, uciskając żyły powierzchowne, nasilając obrzęki łydek i podrażniając żylaki.\n3. **Rozleniwia mięsień czworogłowy uda:** Kiedy zamykasz staw w wielkim sztywnym rusztowaniu z szynami (zaprojektowanym po zerwaniu więzadeł na nartach, nie na zwyrodnieniowy ból schodów!), Twoje własne mięśnie przestają pracować. Po 3–4 tygodniach udo traci obwód i siłę, przez co po zdjęciu ortezy kolano ucieka jeszcze bardziej niż wcześniej.\n\nW gabinecie pokazuję pacjentom zupełnie inne, celowane podejście biomechaniczne.\n\nZamiast dusić cały staw kolanowy materiałem, zostawiamy samą rzepkę oraz dół podkolanowy **całkowicie odsłonięte**, a podpieramy wyłącznie jeden kluczowy punkt: **więzadło rzepki dokładnie dwa palce poniżej rzepki**.\n\nJak wykazały badania biomechaniczne opublikowane w czasopiśmie *Sports Health*, prawidłowo osadzona opaska podrzepkowa z profilowanym rdzeniem dociskowym zmienia kąt wektora siły i **zmniejsza napięcie na ścięgnie rzepki średnio o 34%**.\n\nW praktyce gabinetowej polecam do tego celu konstrukcję **Sardian™ Precision Strap** z trzech konkretnych powodów technicznych, których brakuje tanim zamiennikom z internetu:\n\n✓ **Wyprofilowany rdzeń silikonowy 8 mm (zamiast płaskiej gąbki):** Miękka pianka spłaszcza się pod ciężarem ciała po dwóch dniach. Gęsty rdzeń 8 mm utrzymuje stałe, sprężyste podparcie w zagłębieniu pod rzepką.\n✓ **Podwójny naciąg na stalowych przelotkach:** Pozwala dociągnąć pasek symetrycznie z obu stron kolana. Dzięki temu opaska trzyma swój tor i nie zjeżdża na łydkę podczas marszu, a mięśnie uda nadal pracują naturalnie.\n✓ **Zakładanie na siedząco w 5 sekund:** Bez konieczności schylania się do stóp, bez zdejmowania obuwia i bez przeciągania ciasnego rękawa przez obolałą kostkę czy żylaki.\n\nUczciwe ograniczenie, o którym zawsze mówię pacjentom w gabinecie: opaska podrzepkowa działa celowanie na aparat wyprostny i ból przedniego przedziału kolana (schody, wstawanie, kucanie), natomiast nie służy do bocznej stabilizacji zerwanych więzadeł po ostrym urazie sportowym ani nie wyhoduje nowej chrząstki. Jeśli jednak czekasz w kolejce na rehabilitację lub zabieg albo po prostu chcesz zejść po własnych schodach bez kłucia pod rzepką, zdejmij z kolana ciasne imadło i przetestuj punktowe odciążenie ścięgna.\n\nProducent daje obecnie pełne **60 dni na domowy test na własnych schodach** (z gwarancją 100% zwrotu pieniędzy bez podawania przyczyny), a w pakiecie 1+1 drugą opaskę dokłada bezpłatnie.\n\n👉 Zobacz porównanie z tradycyjnymi ortezami i sprawdź Sardian™ przez 60 dni bez ryzyka: https://sprobujsardian.pl/pages/test-schodow"
  },
  "stryde-12-to-nie-chrzastka-dziala-nawet-przy-osc-o-kosc": {
    "headline": "Nawet przy starciu chrząstki („kość o kość”)",
    "description": "60 dni na test w domu, zwrot bez podawania przyczyny.",
    "primaryText": "Szkoda wierzyć, że dla Twojego kolana jest już za późno.\n\nStarta chrząstka, zaawansowane zwyrodnienie, a w gabinecie słyszysz już tylko o kolejnych zastrzykach albo kolejce na endoprotezę.\n\nDłuższy spacer, zejście po schodach, wstanie z krzesła: za każdym razem ten sam ból.\n\nOpaska podrzepkowa **Sardian™** NIE odbudowuje chrząstki, ona przejmuje napięcie z Twojego ścięgna rzepki (zmniejszając je aż o 34%). I właśnie dlatego przynosi ulgę nawet w kolanach, które spisano już na straty.\n\nZnów chodzisz normalnie, znów schodzisz po schodach przodem. Operacja przestaje być jedyną rzeczą, na którą czekasz.\n\n✅ 60 dni na test w domu, zwrot pieniędzy bez zbędnych pytań\n🎁 W pakiecie 1+1 i 2+2 dodatkowe opaski GRATIS\n👉 Sprawdź, dlaczego to działa nawet przy zużytej chrząstce: https://sprobujsardian.pl/pages/jak-pozbylam-sie-bolu-kolan"
  },
  "stryde-13-opaska-ktora-zjezdza-nie-pomaga-wcale-sports-health": {
    "headline": "Nie zjeżdża na łydkę",
    "description": "60 dni gwarancji satysfakcji",
    "primaryText": "Opaska, która zsuwa się z kolana, nie pomaga absolutnie w niczym.\n\nTanie kopie sprzedawane w internecie i zwykłe ściągacze z apteki są szyte z rozciągliwej gumy bez wewnętrznego rdzenia, drapią skórę i zjeżdżają na łydkę, zanim zdążysz przejść przez kuchnię.\n\nPrawidłowo osadzona opaska podrzepkowa **Sardian™** zmniejsza napięcie na ścięgnie rzepki aż o **34%** (badanie kliniczne *Sports Health, 2011*).\n\n✅ Wyprofilowany rdzeń silikonowy 8 mm + stalowe przelotki, trzyma punkt tuż pod rzepką\n✅ Mieści się pod każdymi spodniami i nie powoduje pocenia\n✅ 60 dni na przetestowanie na własnych schodach (pełny zwrot, jeśli nie poczujesz ulgi)\n\n👉 Zobacz wyniki Testu Schodów i zamów z 60-dniową gwarancją: https://sprobujsardian.pl/pages/test-schodow"
  },
  "stryde-14-przetrwac-kolejke-do-operacji-zanim-wydasz-800zl": {
    "headline": "Zanim wydasz 800 zł na zastrzyk. Zanim doczekasz terminu operacji.",
    "description": "Nie zastępuje chirurgii. Odciąża kolano w czasie oczekiwania.",
    "primaryText": "Decyzja o zabiegu zapadła. Ale termin w kolejce jest za kilkanaście miesięcy.\n\nA w międzyczasie nikt nie proponuje Ci nic. Musisz dalej stać na nogach, schodzić po schodach i robić codzienne zakupy, z dokładnie tym samym kolanem.\n\nOpaska podrzepkowa **Sardian™** nie zastępuje operacji i nie udaje cudownego leku. Jej jedynym zadaniem jest odciążenie ścięgna pod rzepką na czas oczekiwania, żebyś nie musiał liczyć każdego stopnia.\n\nZanim wydasz 800 zł na kolejny zastrzyk dostawowy, przetestuj najprostsze rozwiązanie mechaniczne. Jeśli w ciągu 60 dni nie poczujesz różnicy na własnych schodach, zwracamy 100% pieniędzy.\n\n✅ Rozmiar uniwersalny (pasuje na prawe i lewe kolano)\n✅ Wysyłka w 24h + 60 dni na darmowy zwrot\n👉 Sprawdź tutaj, 60 dni na test na własnych schodach: https://sprobujsardian.pl/pages/131-nocy-w-fotelu"
  },
  "stryde-15-sprzedawana-przez-nas-nie-przez-nich-oryginal-vs-podrobki": {
    "headline": "Oryginał jest tylko jeden. Uważaj na miękkie podróbki.",
    "description": "Rdzeń silikonowy 8 mm + stalowe klamry + 60 dni gwarancji.",
    "primaryText": "Widziałeś w ostatnim czasie reklamy czarnych opasek podrzepkowych pod różnymi dziwnymi nazwami?\n\nW sieci krążą dziesiątki tanich podróbek. Używają zwykłej rozciągliwej tkaniny, nie mają wewnętrznego rdzenia silikonowego 8 mm ani stalowych przelotek. Na skradzionych zdjęciach wyglądają podobnie, ale na nodze nie działają tak samo i po dwóch dniach rozciągają się jak zwykła guma.\n\nZamawiaj bezpośrednio, aby mieć pewność, że otrzymujesz oryginalną opaskę **Sardian™ Precision Strap**:\n\n✓ Prawdziwy, wyprofilowany rdzeń silikonowy z poduszką powietrzną i stalowymi klamrami\n✓ Błyskawiczna wysyłka w 24h (InPost Paczkomat / Kurier)\n✓ Pełna 60-dniowa gwarancja zwrotu (ważna wyłącznie przy oficjalnym zamówieniu)\n\n👉 Zamów oryginalną opaskę Sardian™ tutaj (60 dni na test bez ryzyka): https://sprobujsardian.pl/products/sardian-precision-strap"
  },
  "orthevia-25-peselu-pan-nie-oszuka-test-dwoch-palcow-zylaki-kregoslup": {
    "headline": "Usłyszałeś: „PESEL-u się nie oszuka”? Zrób Test 2 Palców.",
    "description": "Bez uciskania żylaków i bez schylania się do stóp. Kup 1, drugą odbierz GRATIS + 60 dni na zwrot.",
    "primaryText": "Usłyszałeś w gabinecie zdanie: *„W tym wieku musi boleć, PESEL-u pan/pani nie oszuka”*?\n\nZanim pogodzisz się ze schodzeniem ze schodów bokiem, zrób teraz prosty **10-sekundowy Test Dwóch Palców**:\n\nUsiądź na krześle ze zgiętym kolanem, przyłóż palec wskazujący i środkowy tuż pod dolną krawędzią rzepki i lekko naciśnij miękkie wgłębienie. Jeśli właśnie tam czujesz tkliwość, kłucie przy schodzeniu w dół albo uciekanie nogi, Twoim problemem w codziennym ruchu jest przeciążone ścięgno rzepki, które przy każdym stopniu musi wyhamować nawet 4-krotność masy Twojego ciała.\n\nOpaska podrzepkowa **Sardian™ Precision Strap** została zaprojektowana specjalnie dla osób 55+, które nie mogą nosić zwykłych ciasnych rękawów z apteki:\n\n✅ **Masz żylaki lub puchnące łydki?** Wąska, otwarta konstrukcja pod rzepką nie dusi naczyń w dole podkolanowym i nie zwija się pod kolanem w twardy sznurek.\n✅ **Boli Cię kręgosłup lub biodro przy ubieraniu?** Nie musisz zdejmować butów ani schylać się do kostek: zapinasz ją wygodnie na siedząco w 5 sekund prosto pod kolanem.\n✅ **Masz tęższą nogę lub obrzęk stawu?** Podwójna regulacja na stalowych przelotkach dopasowuje się co do milimetra (obwód pod kolanem od 28 aż do 48 cm) i nie zjeżdża na łydkę.\n✅ **Potwierdzona biomechanika (-34%):** Wyprofilowany rdzeń silikonowy 8 mm z poduszką powietrzną przejmuje 34% napięcia ze ścięgna rzepki (*Sports Health, 2011*), zostawiając samą rzepkę całkowicie swobodną.\n\n🎁 **Oferta specjalna:** W pakietach 1+1 oraz 2+2 dodatkowe opaski otrzymujesz **GRATIS**\n🛡️ **Zero ryzyka:** Pełne **60 dni gwarancji satysfakcji**. Przetestuj na własnych schodach, a jeśli nie poczujesz ulgi, zwrócimy 100% pieniędzy.\n\n👉 Zamów oryginalną opaskę Sardian™ z wysyłką w 24h (BLIK / InPost / Kurier): https://sprobujsardian.pl/products/sardian-precision-strap"
  }
};

export interface StrydePlGeneratedAd {
  id: string;
  angleId: string;
  code: string;
  title: string;
  stageId: StrydeAwarenessStageId;
  sophisticationLevel: StrydeSophisticationLevel;
  problemCluster: StrydeProblemCluster;
  pageId: string;
  pageName: string;
  headline: string;
  description: string;
  primaryText: string;
  destinationUrl: string;
  cta: "LEARN_MORE";
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

export function sanitizeAndAuditStrydePl(
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

  const normalizeSardian = (txt: string) =>
    (txt || "")
      .replace(/\*\*(?:STRYDE|ORTHEVIA)(\.?)\*\*/g, "**SARDIAN$1**")
      .replace(/\b(?:Stryde|Orthevia)™\s*Precision Strap\b/gi, "Sardian™ Precision Strap")
      .replace(/\b(?:Stryde|Orthevia)\s*Precision Strap\b/gi, "Sardian™ Precision Strap")
      .replace(/\bopaska podrzepkowa (?:Stryde|Orthevia)\b/gi, "opaska podrzepkowa Sardian")
      .replace(/\b(?:Stryde|Orthevia)™/g, "Sardian™")
      .replace(/\b(?:STRYDE|ORTHEVIA)\b/g, "SARDIAN")
      .replace(/\b(?:Stryde|Orthevia)\b/g, "Sardian")
      .replace(/https:\/\/r0fgvk-0t\.myshopify\.com\/products\/orthevia-precision-strap/g, "https://sprobujsardian.pl/products/sardian-precision-strap")
      .replace(/https:\/\/r0fgvk-0t\.myshopify\.com/g, "https://sprobujsardian.pl")
      .replace(/\s*—\s*(https?:\/\/)/g, ": $1")
      .replace(/([”"])\s*—\s*([a-ząćęłńóśźż])/g, "$1, $2")
      .replace(/\s+—\s+([^—\n]{3,90}?)\s+—\s+/g, ", $1, ")
      .replace(/\s+—\s+/g, ", ")
      .replace(/—/g, ", ")
      .replace(/,\s*,/g, ",");

  const primaryText = normalizeSardian(rawPrimaryText || "").trim();
  const headline = normalizeSardian(rawHeadline || "").trim();
  const description = normalizeSardian(rawDescription || "").trim();

  if (rawPrimaryText && primaryText !== rawPrimaryText.trim()) {
    fixes.push("Zaktualizowano markę na Sardian™, linki na sprobujsardian.pl i usunięto pauzy (em-dash).");
  }

  if (/(?:napisał|napisała|zapisał|zapisała)[^.\n]{0,90}\b(?:opinie|cena|recenzje)\b/i.test(primaryText)) {
    warnings.push("Uwaga: na kartce od eksperta/znajomego nie mogą pojawiać się frazy wyszukiwarkowe (opinie/cena/recenzje).");
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

export function buildAllStrydePrewrittenAds(): StrydePlGeneratedAd[] {
  const now = 1792622000000;
  return STRYDE_PRESET_ANGLES.map((preset) => {
    const rawCopy = STRYDE_ALL_COPY[preset.id] || {
      headline: preset.shortTitle,
      description: "Opaska podrzepkowa Sardian™. Kup 1, drugą odbierz GRATIS. 60 dni gwarancji.",
      primaryText: "",
    };
    const audited = sanitizeAndAuditStrydePl(rawCopy.primaryText, rawCopy.headline, rawCopy.description);
    return {
      id: `stryde-pl-${preset.code.toLowerCase()}`,
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
      destinationUrl: preset.defaultDestinationUrl || STRYDE_LISTICLE_URL,
      cta: "LEARN_MORE",
      imageUrl: preset.defaultImageUrl,
      imageHash: preset.defaultImageHash,
      secondImageUrl: preset.defaultSecondImageUrl,
      secondImageHash: preset.defaultSecondImageHash,
      wordCount: audited.wordCount,
      characterCount: audited.characterCount,
      auditPassed: audited.auditPassed,
      auditWarnings: audited.auditWarnings,
      auditFixesApplied: audited.auditFixesApplied,
      createdAt: now,
      updatedAt: now,
    };
  });
}
