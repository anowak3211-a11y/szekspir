/**
 * FELIORA PL — Fabryka Polskich Antków / MSL dla Dyfuzora Feromonów Feliora (Koty)
 *
 * Architektura: 5 Awareness Stages (Schwartz) × Poziomy Sofistykacji Rynkowej (Stage 3–5)
 * Oparta w 100% na Voice of Customer z polskich forów (Miau.pl, Wykop #koty, Dogomania, Allegro, Ceneo)
 * oraz analizie X-Ray 274 historycznych zakupów + testu A/B Listicle vs PDP na koncie act_1168927131917359.
 */

import { FELIORA_PL_COPY_STAGE1 } from './feliora-pl-copy-stage1';
import { FELIORA_PL_COPY_STAGE2 } from './feliora-pl-copy-stage2';
import { FELIORA_PL_COPY_STAGE3 } from './feliora-pl-copy-stage3';
import { FELIORA_PL_COPY_STAGE4 } from './feliora-pl-copy-stage4';
import { FELIORA_PL_COPY_STAGE5 } from './feliora-pl-copy-stage5';

export type FelioraAwarenessStageId =
  | 'stage1_unaware'
  | 'stage2_problem_aware'
  | 'stage3_solution_aware'
  | 'stage4_product_aware'
  | 'stage5_most_aware';

export type FelioraSophisticationLevel = 3 | 4 | 5;

export type FelioraProblemCluster =
  | 'SIKANIE_KOLDRA'
  | 'WSTYD_DOM'
  | 'ODDANIE_SCHRONISko'
  | 'FIC_PECHERZ'
  | 'DOKOCENIE_WALKI'
  | 'ZDEMASKOWANIE_ZOO'
  | 'F3_VS_MAP_FIZYKA'
  | 'MATEMATYKA_GWARANCJA';

export interface FelioraStageMeta {
  id: FelioraAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  shortLabel: string;
  title: string;
  subtitle: string;
  sophisticationLabel: string;
  sophisticationLevel: FelioraSophisticationLevel;
  color: string;
  bgLight: string;
  borderColor: string;
  vocSummary: string;
}

export interface FelioraFanpage {
  id: string;
  name: string;
  initials: string;
  role: string;
  badgeColor: string;
}

export interface FelioraImageAsset {
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

export interface FelioraAnglePreset {
  id: string;
  number: number;
  code: string;
  title: string;
  shortTitle: string;
  stageId: FelioraAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  sophisticationLevel: FelioraSophisticationLevel;
  sophisticationBadge: string;
  problemCluster: FelioraProblemCluster;
  problemLabel: string;
  recommendedFanpageId: string;
  recommendedFanpageName: string;
  vocTrigger: string;
  mechanismCore: string;
  defaultImageId: string;
  defaultImageUrl: string;
  defaultImageHash: string;
  defaultSecondImageId?: string;
  defaultSecondImageUrl?: string;
  defaultSecondImageHash?: string;
}

export const FELIORA_AD_ACCOUNT_ID = '1168927131917359';
export const FELIORA_LISTICLE_URL = 'https://feliora.pl/pages/dlaczego-dyfuzor-feliora-dziala';
export const FELIORA_PDP_URL = 'https://feliora.pl/products/dyfuzor-feromonow-feliora';

export const FELIORA_FANPAGES: FelioraFanpage[] = [
  {
    id: '1287239777799682',
    name: 'Dr. wet. Edmund Newelski',
    initials: 'EN',
    role: 'Autorytet Weterynaryjny (25 lat w lecznicy · Najwyższy ROAS na Listicle)',
    badgeColor: '#1d4ed8',
  },
  {
    id: '1304624172730017',
    name: 'Koty Bez Ściemy',
    initials: 'KB',
    role: 'Społeczność / Szczere Historie Opiekunek (Desire / Antki Rip)',
    badgeColor: '#7c3aed',
  },
  {
    id: '1231925240008683',
    name: 'Kociary: Wasze Historie',
    initials: 'KW',
    role: 'Wyznania i Tabu Właścicielek (D4 / Trudne Emocje)',
    badgeColor: '#be185d',
  },
  {
    id: '1338513126001175',
    name: 'Feliora',
    initials: 'FL',
    role: 'Oficjalny Profil Marki (Stage 4/5 · Porównania, Matematyka i Gwarancja)',
    badgeColor: '#047857',
  },
];

export const FELIORA_STAGES: Record<FelioraAwarenessStageId, FelioraStageMeta> = {
  stage1_unaware: {
    id: 'stage1_unaware',
    stageNumber: 1,
    shortLabel: 'Stage 1 · Unaware',
    title: 'STAGE 1: UNAWARE (Nieświadomy rozwiązania)',
    subtitle: 'Myśli, że „kot robi to na złość”, żyje w ukrytym wstydzie albo po cichu rozważa oddanie kota',
    sophisticationLabel: 'Sofistykacja 3/4 · Nowy Paradygmat Emocjonalno-Biologiczny',
    sophisticationLevel: 3,
    color: '#6d28d9',
    bgLight: '#f5f3ff',
    borderColor: '#ddd6fe',
    vocSummary: 'Kołdra pachnąca właścicielem, folia malarska z Castoramy na kanapie, kot-duch pod łóżkiem, ultimatum męża i wycie o 3:15 nad ranem.',
  },
  stage2_problem_aware: {
    id: 'stage2_problem_aware',
    stageNumber: 2,
    shortLabel: 'Stage 2 · Problem Aware',
    title: 'STAGE 2: PROBLEM AWARE (Świadomy problemu)',
    subtitle: 'Wie, że kot cierpi na stres, FIC lub lęk terytorialny, ale leczy skutki u weterynarza zamiast przyczyny',
    sophisticationLabel: 'Sofistykacja 3 · Mechanizm Przyczyny (Oś Mózg-Pęcherz & VNO)',
    sophisticationLevel: 3,
    color: '#1d4ed8',
    bgLight: '#eff6ff',
    borderColor: '#bfdbfe',
    vocSummary: 'Piąte czyste badanie moczu i 2 850 zł za cewnikowanie (FIC), wylizany do krwi brzuch, 4 kuwety w bloku, siatka w drzwiach przy dokoceniu i skasowana mapa F3.',
  },
  stage3_solution_aware: {
    id: 'stage3_solution_aware',
    stageNumber: 3,
    shortLabel: 'Stage 3 · Solution Aware',
    title: 'STAGE 3: SOLUTION AWARE (Świadomy rozwiązań)',
    subtitle: 'Sparzył się na obróżkach z lawendą, sprayach, behawiorystach i psychotropach - uważa że „nic nie działa”',
    sophisticationLabel: 'Sofistykacja 4 · Zdemaskowanie 8/10 Środków z Zoologicznego',
    sophisticationLevel: 4,
    color: '#b45309',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    vocSummary: 'Obróżki z olejkami torturujące 14x czulszy nos kota, spraye brzmiące jak syczenie rywala, psychotropy robiące z kota zombie, eksperyment 20 pudełek w lecznicy i błąd z octem.',
  },
  stage4_product_aware: {
    id: 'stage4_product_aware',
    stageNumber: 4,
    shortLabel: 'Stage 4 · Product Aware',
    title: 'STAGE 4: PRODUCT AWARE (Świadomy dyfuzorów)',
    subtitle: 'Miał już w gniazdku zwykły dyfuzor (Feliway / Beaphar) i mówi: „działało tydzień albo wcale”',
    sophisticationLabel: 'Sofistykacja 5 · Kompleks Matczyny M.A.P. + F3 & Fizyka Dyfuzji',
    sophisticationLevel: 5,
    color: '#c2410c',
    bgLight: '#fff7ed',
    borderColor: '#fed7aa',
    vocSummary: 'Dlaczego u 17 z 62 pacjentów zwykła wtyczka nie zadziałała, przegrzana grzałka 115°C paląca wkład w 7 dni, pojedyncze F3 vs M.A.P. oraz zasada 1 Pokój = 1 Strefa.',
  },
  stage5_most_aware: {
    id: 'stage5_most_aware',
    stageNumber: 5,
    shortLabel: 'Stage 5 · Most Aware',
    title: 'STAGE 5: MOST AWARE (Gotowy do zakupu)',
    subtitle: 'Porównuje koszty, sprawdza gdzie wpiąć wtyczki w polskim mieszkaniu i pyta o bezpieczeństwo 24/7 oraz gwarancję',
    sophisticationLabel: 'Sofistykacja 5 · Matematyka 3,16 zł/dzień + Risk Reversal 30 Dni',
    sophisticationLevel: 5,
    color: '#047857',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
    vocSummary: 'Rachunek 1 960 zł za „oszczędzanie” vs 94,99 zł/szt., przewodnik rozmieszczenia w bloku (Pakiet 2/3 Pokoje), oś czasu 14 dni, bezpieczeństwo 5W i 30 dni gwarancji.',
  },
};

export const FELIORA_IMAGE_LIBRARY: FelioraImageAsset[] = [
  // ==================== 15 SUROWYCH ZDJĘĆ Z TELEFONU (KIE.AI — SHIT QUALITY / ZERO AI GLOW / ZERO TEKSTU) ====================
  {
    id: 'kie-feliora-s1-mokry-plama-koldra-kot',
    url: '/feliora-pl-images/kie-feliora-s1-mokry-plama-koldra-kot.jpg',
    imageHash: '7603e2a6afce7782f07c57dc0174cd2b',
    label: '📸 KIE RAW (#1 Sikanie na łóżko) · Mokra plama kociego moczu na świeżej pościeli i spięty kot na rogu łóżka',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S1-01 Kołdra',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s1-folia-malarska-kanapa',
    url: '/feliora-pl-images/kie-feliora-s1-folia-malarska-kanapa.jpg',
    imageHash: 'c7c8ab52308f71610462662e02311d9d',
    label: '📸 KIE RAW (#2 Folia z Castoramy) · Kanapa w salonie oklejona folią malarską i taśmą papierową + kot w tle',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S1-02 Folia Malarska',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s1-kot-duch-pod-lozkiem',
    url: '/feliora-pl-images/kie-feliora-s1-kot-duch-pod-lozkiem.jpg',
    imageHash: 'f426fda5232cc5fb58d8101eff950f6a',
    label: '📸 KIE RAW (#3 Kot-Duch pod łóżkiem) · Zdjęcie z fleszem pod łóżko: przerażony kot wciśnięty w kąt i pełna miska',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S1-03 Kot pod łóżkiem',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s1-zasikana-torba-transporter',
    url: '/feliora-pl-images/kie-feliora-s1-zasikana-torba-transporter.jpg',
    imageHash: '40aaa614f46ab314e3b164885f90cc30',
    label: '📸 KIE RAW (#4 Ultimatum męża) · Zasikana torba od laptopa w kałuży w przedpokoju obok transportera',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S1-04 Torba i Transporter',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s1-nocne-wycie-drzwi-315',
    url: '/feliora-pl-images/kie-feliora-s1-nocne-wycie-drzwi-315.jpg',
    imageHash: '91c7d68fe9a7014b65822f521723c7f1',
    label: '📸 KIE RAW (#5 Wycie o 3:15 nad ranem) · Nocne rozmazane zdjęcie kota drapiącego zamknięte drzwi sypialni',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S1-05 Nocne Wycie 3:15',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s2-fic-kuweta-krople-mocz',
    url: '/feliora-pl-images/kie-feliora-s2-fic-kuweta-krople-mocz.jpg',
    imageHash: '26de9eae6331672bd7b11376b2d33fde',
    label: '📸 KIE RAW (#6 FIC i pęcherz) · Kot napinający się z bólem w kuwecie w łazience + paragony od weta i strzykawka',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S2-06 FIC Pęcherz',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s2-lysy-wylizany-brzuch',
    url: '/feliora-pl-images/kie-feliora-s2-lysy-wylizany-brzuch.jpg',
    imageHash: '1f1a771433d1fe08b02a601232a64212',
    label: '📸 KIE RAW (#7 Łysienie psychogenne) · Zbliżenie z telefonu na wylizany do gołej różowej skóry brzuch kota',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S2-07 Łysy Brzuch',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s2-cmentarzysko-4-kuwet-przedpokoj',
    url: '/feliora-pl-images/kie-feliora-s2-cmentarzysko-4-kuwet-przedpokoj.jpg',
    imageHash: 'da68639e2ce5ae0d01cbf7547e638e37',
    label: '📸 KIE RAW (#8 4 kuwety w bloku) · Wąski przedpokój zastawiony 4 kuwetami i workami z różnym żwirkiem',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S2-08 4 Kuwety',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s2-siatka-w-drzwiach-dokocenie',
    url: '/feliora-pl-images/kie-feliora-s2-siatka-w-drzwiach-dokocenie.jpg',
    imageHash: 'e45bd8ea91ecd638b103d7c416b15144',
    label: '📸 KIE RAW (#9 Siatka w drzwiach) · Prowizoryczna siatka w futrynie oddzielająca dwa najeżone, wrogie koty',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S2-09 Dokocenie Siatka',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s3-rozcieta-obrozka-i-20-pudelek',
    url: '/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg',
    imageHash: 'a721e1b2e9fef557dc6f45633d7212a8',
    label: '📸 KIE RAW (#11/#14 Obróżka i 20 pudełek) · Rozcięta nożyczkami fioletowa obróżka i sterta sprayów/kropli na stole',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S3-11/14 Rozcięta Obróżka',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s3-szorowanie-kanapy-ocet-wiadro',
    url: '/feliora-pl-images/kie-feliora-s3-szorowanie-kanapy-ocet-wiadro.jpg',
    imageHash: '42ec77d99d3e0077c34121af606bad59',
    label: '📸 KIE RAW (#10/#15 Szorowanie octem) · Mokra plama na kanapie, wiadro z wodą, butelka octu i papierowe ręczniki',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S3-15 Ocet i Kanapa',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s4-spalony-knot-zwykly-dyfuzor',
    url: '/feliora-pl-images/kie-feliora-s4-spalony-knot-zwykly-dyfuzor.jpg',
    imageHash: 'c1cd0eebef48e24b1b6a84b912294bda',
    label: '📸 KIE RAW (#17/#20 Spalony knot 115°C) · Zbliżenie na przegrzany, czarny zwęglony knot zwykłego dyfuzora',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S4-17 Spalony Knot',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot',
    url: '/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg',
    imageHash: 'e828b0b777bf998b35f34018a306eda3',
    label: '📸 KIE RAW (#16/#18/#19 Wtyczka Feliora w gniazdku) · Dyfuzor Feliora (kaczuszka) w gniazdku i śpiący kot na parkiecie',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S4-16/19 Feliora w Gniazdku',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s5-kartka-rachunek-1960zl-i-feliora',
    url: '/feliora-pl-images/kie-feliora-s5-kartka-rachunek-1960zl-i-feliora.jpg',
    imageHash: 'b3de33f667c7a55c00a8b31663670ba8',
    label: '📸 KIE RAW (#21/#23 Rachunek 1960 zł) · Kartka z ręcznym podliczeniem kosztów (1960 zł) obok 2 dyfuzorów Feliora',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S5-21 Kartka 1960 zł',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko',
    url: '/feliora-pl-images/kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko.jpg',
    imageHash: '80d0cf729d575057c4eda44f65df59c9',
    label: '📸 KIE RAW (#22/#24/#25 Spokój w domu) · Dwa koty śpiące przytulone na kanapie bez folii + Feliora w gniazdku w tle',
    adsetOrigin: 'Kie.ai Raw Native (Shit Quality)',
    adOrigin: 'S5-25 Dwa Koty Razem',
    aspectRatio: '1:1',
    source: 'ai',
  },
];

export const FELIORA_PRESET_ANGLES: FelioraAnglePreset[] = [
  {
    "id": "fel-01-koldra-pachnaca-toba",
    "number": 1,
    "code": "S1-01",
    "title": "Kołdra pachnąca Tobą (Mit Złośliwości)",
    "shortTitle": "Kołdra i Mit Złośliwości",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 3,
    "sophisticationBadge": "Sofistykacja 3 · Odwrócenie Winy",
    "problemCluster": "SIKANIE_KOLDRA",
    "problemLabel": "Sikanie na łóżko / kołdrę",
    "recommendedFanpageId": "1304624172730017",
    "recommendedFanpageName": "Koty Bez Ściemy",
    "vocTrigger": "„Nasikał mi na świeżo przebraną kołdrę, patrząc mi prosto w oczy. Myślałam, że robi mi to na złość.”",
    "mechanismCore": "Kot nie ma kory przedczołowej zdolnej do zemsty - w panice szuka miejsca najsilniej pachnącego opiekunem (łóżka), by wymieszać swój zapach z bezpiecznym zapachem.",
    "defaultImageId": "kie-feliora-s1-mokry-plama-koldra-kot",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s1-mokry-plama-koldra-kot.jpg",
    "defaultImageHash": "7603e2a6afce7782f07c57dc0174cd2b",
    "defaultSecondImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultSecondImageHash": "e828b0b777bf998b35f34018a306eda3"
  },
  {
    "id": "fel-02-folia-malarska-na-kanapie",
    "number": 2,
    "code": "S1-02",
    "title": "Folia malarska na kanapie i kłamstwa dla gości",
    "shortTitle": "Folia Malarska i Wstyd",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 3,
    "sophisticationBadge": "Sofistykacja 3 · Ukryty Wstyd",
    "problemCluster": "WSTYD_DOM",
    "problemLabel": "Wstyd przed gośćmi / Pranie kanapy",
    "recommendedFanpageId": "1231925240008683",
    "recommendedFanpageName": "Kociary: Wasze Historie",
    "vocTrigger": "„Przez 9 miesięcy okłamywałam mamę, że mam remont. Kanapa za 4 500 zł była przykryta folią malarską z Castoramy.”",
    "mechanismCore": "Pranie kanapy 14 razy usuwa skutek, ale nie wyłącza alarmu w ciele migdałowatym kota, który zmusza go do ciągłego oznaczania salonu.",
    "defaultImageId": "kie-feliora-s1-folia-malarska-kanapa",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s1-folia-malarska-kanapa.jpg",
    "defaultImageHash": "c7c8ab52308f71610462662e02311d9d",
    "defaultSecondImageId": "kie-feliora-s3-szorowanie-kanapy-ocet-wiadro",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s3-szorowanie-kanapy-ocet-wiadro.jpg",
    "defaultSecondImageHash": "42ec77d99d3e0077c34121af606bad59"
  },
  {
    "id": "fel-03-duch-pod-lozkiem",
    "number": 3,
    "code": "S1-03",
    "title": "Cichy kot pod łóżkiem (Duch we własnym mieszkaniu)",
    "shortTitle": "Kot-Duch pod Łóżkiem",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 3,
    "sophisticationBadge": "Sofistykacja 3 · Cichy Paraliż",
    "problemCluster": "ODDANIE_SCHRONISko",
    "problemLabel": "Lęk / Chowanie się pod łóżkiem",
    "recommendedFanpageId": "1231925240008683",
    "recommendedFanpageName": "Kociary: Wasze Historie",
    "vocTrigger": "„Od 7 miesięcy nie dotknęłam własnego kota. Miska jest pełna wieczorem i pusta rano. Wychodzi tylko, gdy zgaszę światło.”",
    "mechanismCore": "Paraliż behawioralny (freeze response) po hałasie/remoncie - ciągła dyfuzja matczynego M.A.P. wyłącza stan oblężenia.",
    "defaultImageId": "kie-feliora-s1-kot-duch-pod-lozkiem",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s1-kot-duch-pod-lozkiem.jpg",
    "defaultImageHash": "f426fda5232cc5fb58d8101eff950f6a",
    "defaultSecondImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultSecondImageHash": "e828b0b777bf998b35f34018a306eda3"
  },
  {
    "id": "fel-04-ultimatum-meza-transporter",
    "number": 4,
    "code": "S1-04",
    "title": "Ultimatum męża i transporter w bagażniku",
    "shortTitle": "Ultimatum Męża i Schronisko",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Sofistykacja 4 · Złamanie Tabu",
    "problemCluster": "ODDANIE_SCHRONISko",
    "problemLabel": "Groźba oddania kota / Kryzys w domu",
    "recommendedFanpageId": "1231925240008683",
    "recommendedFanpageName": "Kociary: Wasze Historie",
    "vocTrigger": "„Mąż podniósł zasikaną torbę od laptopa i powiedział spokojnie: Albo on znika do niedzieli, albo wyprowadzam się ja.”",
    "mechanismCore": "Pokrycie obu stref mieszkania (przedpokój + salon/sypialnia) kompleksem M.A.P. + F3 odcina odruch terytorialnego znaczenia rzeczy domowników.",
    "defaultImageId": "kie-feliora-s1-zasikana-torba-transporter",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s1-zasikana-torba-transporter.jpg",
    "defaultImageHash": "40aaa614f46ab314e3b164885f90cc30",
    "defaultSecondImageId": "kie-feliora-s1-mokry-plama-koldra-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s1-mokry-plama-koldra-kot.jpg",
    "defaultSecondImageHash": "7603e2a6afce7782f07c57dc0174cd2b"
  },
  {
    "id": "fel-05-nocne-wycie-3-15",
    "number": 5,
    "code": "S1-05",
    "title": "3:15 nad ranem pod zamkniętymi drzwiami sypialni",
    "shortTitle": "Wycie o 3:15 nad Ranem",
    "stageId": "stage1_unaware",
    "stageNumber": 1,
    "sophisticationLevel": 3,
    "sophisticationBadge": "Sofistykacja 3 · Nocny Kortyzol",
    "problemCluster": "WSTYD_DOM",
    "problemLabel": "Nocne wycie / Drapanie drzwi",
    "recommendedFanpageId": "1304624172730017",
    "recommendedFanpageName": "Koty Bez Ściemy",
    "vocTrigger": "„Od 8 miesięcy mój budzik nie musiał dzwonić. Punktualnie o 3:15 zaczyna się gardłowe zawodzenie i drapanie drzwi sypialni.”",
    "mechanismCore": "Gdy nocą w mieszkaniu gasną bodźce, u zestresowanego kota wybucha lęk separacyjno-terytorialny; stała emisja 24/7 przywraca fazę głębokiego snu REM.",
    "defaultImageId": "kie-feliora-s1-nocne-wycie-drzwi-315",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s1-nocne-wycie-drzwi-315.jpg",
    "defaultImageHash": "91c7d68fe9a7014b65822f521723c7f1",
    "defaultSecondImageId": "kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko.jpg",
    "defaultSecondImageHash": "80d0cf729d575057c4eda44f65df59c9"
  },
  {
    "id": "fel-06-piate-czyste-badanie-moczu-fic",
    "number": 6,
    "code": "S2-06",
    "title": "Piąte czyste badanie moczu i 2 850 zł za cewnikowanie (FIC)",
    "shortTitle": "Czysty Mocz i FIC (2 850 zł)",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 3,
    "sophisticationBadge": "Sofistykacja 3 · Oś Mózg-Pęcherz",
    "problemCluster": "FIC_PECHERZ",
    "problemLabel": "Idiopatyczne Zapalenie Pęcherza (FIC)",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„4 badania moczu, 2 USG. Zero bakterii, a kot wchodzi do kuwety 20 razy na godzinę i płacze krwią.”",
    "mechanismCore": "Wyrzut kortyzolu i noradrenaliny niszczy ochronną warstwę GAG w pęcherzu - własny mocz parzy kota jak kwas. Trzeba wyłączyć stres w mózgu przez VNO.",
    "defaultImageId": "kie-feliora-s2-fic-kuweta-krople-mocz",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s2-fic-kuweta-krople-mocz.jpg",
    "defaultImageHash": "26de9eae6331672bd7b11376b2d33fde",
    "defaultSecondImageId": "kie-feliora-s5-kartka-rachunek-1960zl-i-feliora",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s5-kartka-rachunek-1960zl-i-feliora.jpg",
    "defaultSecondImageHash": "b3de33f667c7a55c00a8b31663670ba8"
  },
  {
    "id": "fel-07-lysy-brzuch-alergia-ktorej-nie-ma",
    "number": 7,
    "code": "S2-07",
    "title": "Łysy brzuch i wylizane uda (Alergia, której nie ma)",
    "shortTitle": "Łysy Brzuch (Łysienie Psychogenne)",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 3,
    "sophisticationBadge": "Sofistykacja 3 · Endorfiny z Lizania",
    "problemCluster": "FIC_PECHERZ",
    "problemLabel": "Kompulsywne wylizywanie sierści",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Przez 10 miesięcy leczyliśmy kotkę na alergię pokarmową. 6 karm, sterydy, a brzuch nadal wylizany do gołej skóry.”",
    "mechanismCore": "Łysienie psychogenne: szorstki język wywołuje wyrzut endorfin tłumiących lęk. Wyciszenie VNO kompleksem M.A.P. zatrzymuje przymus wylizywania.",
    "defaultImageId": "kie-feliora-s2-lysy-wylizany-brzuch",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s2-lysy-wylizany-brzuch.jpg",
    "defaultImageHash": "1f1a771433d1fe08b02a601232a64212",
    "defaultSecondImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultSecondImageHash": "e828b0b777bf998b35f34018a306eda3"
  },
  {
    "id": "fel-08-cmentarzysko-4-kuwet-w-bloku",
    "number": 8,
    "code": "S2-08",
    "title": "Cmentarzysko 4 kuwet i 8 rodzajów żwirku w 48-metrowym mieszkaniu",
    "shortTitle": "4 Kuwety i 8 Żwirków w Bloku",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 3,
    "sophisticationBadge": "Sofistykacja 3 · Strefa Zagrożenia",
    "problemCluster": "SIKANIE_KOLDRA",
    "problemLabel": "Omijanie czystej kuwety",
    "recommendedFanpageId": "1304624172730017",
    "recommendedFanpageName": "Koty Bez Ściemy",
    "vocTrigger": "„W 48-metrowym mieszkaniu stały 4 kuwety z bentonitem, kukurydzą, drewnem i silikonem. A kot dalej sikał pod prysznicem.”",
    "mechanismCore": "Problemem nie jest granulat żwirku, tylko poczucie zagrożenia terytorialnego w strefie kuwety.",
    "defaultImageId": "kie-feliora-s2-cmentarzysko-4-kuwet-przedpokoj",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s2-cmentarzysko-4-kuwet-przedpokoj.jpg",
    "defaultImageHash": "da68639e2ce5ae0d01cbf7547e638e37",
    "defaultSecondImageId": "kie-feliora-s1-mokry-plama-koldra-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s1-mokry-plama-koldra-kot.jpg",
    "defaultSecondImageHash": "7603e2a6afce7782f07c57dc0174cd2b"
  },
  {
    "id": "fel-09-izolacja-siatka-w-drzwiach-dokocenie",
    "number": 9,
    "code": "S2-09",
    "title": "Izolacja z siatką w drzwiach (Dokocenie, które zamieniło dom w więzienie)",
    "shortTitle": "Siatka w Drzwiach i Dokocenie",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 3,
    "sophisticationBadge": "Sofistykacja 3 · Feromon Harmonii M.A.P.",
    "problemCluster": "DOKOCENIE_WALKI",
    "problemLabel": "Krwawa wojna kotów przy dokoceniu",
    "recommendedFanpageId": "1304624172730017",
    "recommendedFanpageName": "Koty Bez Ściemy",
    "vocTrigger": "„Drugi kot miał być towarzyszem dla pierwszego. Zamiast tego od 7 miesięcy żyjemy z siatką w futrynie i blizną na ręce.”",
    "mechanismCore": "Matczyny feromon kojący M.A.P. (wydzielany przez kotkę karmiącą miot) wyłącza instynkt traktowania drugiego kota jak śmiertelnego intruza.",
    "defaultImageId": "kie-feliora-s2-siatka-w-drzwiach-dokocenie",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s2-siatka-w-drzwiach-dokocenie.jpg",
    "defaultImageHash": "e45bd8ea91ecd638b103d7c416b15144",
    "defaultSecondImageId": "kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko.jpg",
    "defaultSecondImageHash": "80d0cf729d575057c4eda44f65df59c9"
  },
  {
    "id": "fel-10-nowa-komoda-skasowana-mapa-wechowa",
    "number": 10,
    "code": "S2-10",
    "title": "Dla Ciebie to nowa komoda z IKEI. Dla kota to skasowanie 5 lat bezpieczeństwa",
    "shortTitle": "Nowa Komoda i Skasowana Mapa F3",
    "stageId": "stage2_problem_aware",
    "stageNumber": 2,
    "sophisticationLevel": 3,
    "sophisticationBadge": "Sofistykacja 3 · Mapa Węchowa VNO",
    "problemCluster": "SIKANIE_KOLDRA",
    "problemLabel": "Sikanie i drapanie po remoncie/zmianie",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Przez 5 lat był idealnym kotem. Po jednym weekendowym przemeblowaniu zaczął sikać na zasłony i drapać kanapę.”",
    "mechanismCore": "Kot widzi dom przez narząd Jacobsona jako 3D mapę znaczników F3. Remont kasuje tę mapę w sekundę - Feliora odbudowuje ją w 48h.",
    "defaultImageId": "kie-feliora-s1-folia-malarska-kanapa",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s1-folia-malarska-kanapa.jpg",
    "defaultImageHash": "c7c8ab52308f71610462662e02311d9d",
    "defaultSecondImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultSecondImageHash": "e828b0b777bf998b35f34018a306eda3"
  },
  {
    "id": "fel-11-pulapka-obrozki-z-lawenda",
    "number": 11,
    "code": "S3-11",
    "title": "Kiedy widzę w gabinecie kota w obróżce z zoologicznego, biorę nożyczki i ją rozcinam",
    "shortTitle": "Pułapka Obróżki z Lawendą",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Sofistykacja 4 · Tortura 200M Receptorów",
    "problemCluster": "ZDEMASKOWANIE_ZOO",
    "problemLabel": "Obróżki i krople z olejkami (0% feromonów)",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Założyłam kotu obróżkę uspokajającą z zoologicznego za 45 zł. Zaczął sikać dwa razy częściej i wydrapał sobie kark.”",
    "mechanismCore": "Kot ma 200 mln receptorów węchowych (14x czulszy nos). Obróżki z lawendą/walerianą mają 0% feromonów i duszą kota stężonym olejkiem 3 cm pod nosem.",
    "defaultImageId": "kie-feliora-s3-rozcieta-obrozka-i-20-pudelek",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg",
    "defaultImageHash": "a721e1b2e9fef557dc6f45633d7212a8",
    "defaultSecondImageId": "kie-feliora-s2-lysy-wylizany-brzuch",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s2-lysy-wylizany-brzuch.jpg",
    "defaultSecondImageHash": "1f1a771433d1fe08b02a601232a64212"
  },
  {
    "id": "fel-12-dlaczego-spray-brzmi-jak-syczenie",
    "number": 12,
    "code": "S3-12",
    "title": "Dlaczego „uspokajający” spray z zoologicznego brzmi dla kota jak syczenie wroga",
    "shortTitle": "Spray = Syczenie Wroga + Alkohol",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Sofistykacja 4 · Akustyka Syczenia",
    "problemCluster": "ZDEMASKOWANIE_ZOO",
    "problemLabel": "Spraye na bazie alkoholu",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Psikałam kanapę sprayem z feromonami, a kot uciekał z nastroszonym ogonem i pół godziny później znów na nią sikał.”",
    "mechanismCore": "Dźwięk aerozolu („psst!”) ma identyczną częstotliwość jak syczenie obcego kocura, a nośnik alkoholowy paruje po 20 minutach.",
    "defaultImageId": "kie-feliora-s3-rozcieta-obrozka-i-20-pudelek",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg",
    "defaultImageHash": "a721e1b2e9fef557dc6f45633d7212a8",
    "defaultSecondImageId": "kie-feliora-s1-folia-malarska-kanapa",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s1-folia-malarska-kanapa.jpg",
    "defaultSecondImageHash": "c7c8ab52308f71610462662e02311d9d"
  },
  {
    "id": "fel-13-behawiorystka-350zl-i-psychotropy",
    "number": 13,
    "code": "S3-13",
    "title": "Behawiorystka wzięła 700 zł, a potem kazali mi wciskać kotu psychotropy do gardła",
    "shortTitle": "Behawiorystka 700 zł i Psychotropy",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Sofistykacja 4 · Strachu Nie Wytresujesz",
    "problemCluster": "ZDEMASKOWANIE_ZOO",
    "problemLabel": "Nieskuteczny trening i sedacja lekami",
    "recommendedFanpageId": "1304624172730017",
    "recommendedFanpageName": "Koty Bez Ściemy",
    "vocTrigger": "„Przez tydzień po tabletkach miałam w domu przymulone zombie patrzące w ścianę, a przy podawaniu leku drapał mnie do krwi.”",
    "mechanismCore": "Zabawa wędką nie naprawi biochemii ciała migdałowatego, a psychotropy otumaniają korę mózgową. Feliora działa bez sedacji i bez chemii we krwi.",
    "defaultImageId": "kie-feliora-s1-kot-duch-pod-lozkiem",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s1-kot-duch-pod-lozkiem.jpg",
    "defaultImageHash": "f426fda5232cc5fb58d8101eff950f6a",
    "defaultSecondImageId": "kie-feliora-s5-kartka-rachunek-1960zl-i-feliora",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s5-kartka-rachunek-1960zl-i-feliora.jpg",
    "defaultSecondImageHash": "b3de33f667c7a55c00a8b31663670ba8"
  },
  {
    "id": "fel-14-eksperyment-20-pudelek-w-lecznicy",
    "number": 14,
    "code": "S3-14",
    "title": "Poprosiłem 20 pacjentów mówiących „feromony nie działają”, by przynieśli pudełka do lecznicy",
    "shortTitle": "Eksperyment 20 Pudełek w Lecznicy",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Sofistykacja 4 · Audyt 27 Opakowań",
    "problemCluster": "ZDEMASKOWANIE_ZOO",
    "problemLabel": "8 na 10 środków z zoologicznego to ściema",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Panie Doktorze, kupiłam już feromony i nic to nie dało! Rozłożyłem 27 pudełek pacjentów na stole zabiegowym...”",
    "mechanismCore": "16/27 pudełek miało 0% feromonów, 6 to alkoholowe spraye na 20 minut, a 5 to jednoskładnikowe F3. Po zmianie na M.A.P. + F3 u 18/20 kotów problem zniknął.",
    "defaultImageId": "kie-feliora-s3-rozcieta-obrozka-i-20-pudelek",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg",
    "defaultImageHash": "a721e1b2e9fef557dc6f45633d7212a8",
    "defaultSecondImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultSecondImageHash": "e828b0b777bf998b35f34018a306eda3"
  },
  {
    "id": "fel-15-blad-z-octem-i-chlorem",
    "number": 15,
    "code": "S3-15",
    "title": "Im dokładniej szorujesz kanapę octem albo chlorem, tym mocniej każesz kotu nasikać tam drugi raz",
    "shortTitle": "Błąd z Octem i Chlorem",
    "stageId": "stage3_solution_aware",
    "stageNumber": 3,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Sofistykacja 4 · Pułapka Kwasu Moczowego",
    "problemCluster": "SIKANIE_KOLDRA",
    "problemLabel": "Nawracające sikanie w to samo miejsce",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Szorowałam podłogę wodą z octem, sodą i Domestosem, a kot wracał jak bumerang i sikał dokładnie na tę samą plamę.”",
    "mechanismCore": "Chlor i ocet przypominają dla kociego VNO profil chemiczny obcego kocura, zmuszając kota do nadpisania terytorium, jeśli w pokoju brakuje M.A.P. + F3.",
    "defaultImageId": "kie-feliora-s3-szorowanie-kanapy-ocet-wiadro",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s3-szorowanie-kanapy-ocet-wiadro.jpg",
    "defaultImageHash": "42ec77d99d3e0077c34121af606bad59",
    "defaultSecondImageId": "kie-feliora-s1-folia-malarska-kanapa",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s1-folia-malarska-kanapa.jpg",
    "defaultSecondImageHash": "c7c8ab52308f71610462662e02311d9d"
  },
  {
    "id": "fel-16-polecilem-62-klientom-u-17-nie-zadzialal",
    "number": 16,
    "code": "S4-16",
    "title": "Poleciłem dyfuzor 62 klientom. U 17 nie zadziałał - pojechałem sprawdzić ich mieszkania",
    "shortTitle": "62 Klientów (Dlaczego u 17 nie zadziałał)",
    "stageId": "stage4_product_aware",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Audyt Mieszkań Dr. Newelskiego",
    "problemCluster": "F3_VS_MAP_FIZYKA",
    "problemLabel": "Dlaczego wcześniejszy dyfuzor nie zadziałał",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Ta sama rekomendacja, te same zalecenia. U 45 osób spokój w tydzień, u 17 zero efektu. Pojechałem zobaczyć ich gniazdka.”",
    "mechanismCore": "3 błędy: (1) wtyczka za zasłoną/pod komodą, (2) 1 dyfuzor na całe mieszkanie z korytarzem w kształcie L, (3) stara generacja z samym F3 bez M.A.P.",
    "defaultImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultImageHash": "e828b0b777bf998b35f34018a306eda3",
    "defaultSecondImageId": "kie-feliora-s4-spalony-knot-zwykly-dyfuzor",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s4-spalony-knot-zwykly-dyfuzor.jpg",
    "defaultSecondImageHash": "c1cd0eebef48e24b1b6a84b912294bda"
  },
  {
    "id": "fel-17-dlaczego-zwykly-dyfuzor-dziala-tylko-7-dni",
    "number": 17,
    "code": "S4-17",
    "title": "Dlaczego zwykły dyfuzor z apteki działa tylko przez pierwsze 7 dni, a potem wszystko wraca?",
    "shortTitle": "Efekt 7 Dni i Przegrzana Grzałka 115°C",
    "stageId": "stage4_product_aware",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Rdzeń Ceramiczny 5W vs 115°C",
    "problemCluster": "F3_VS_MAP_FIZYKA",
    "problemLabel": "Nawrót sikania po 1. tygodniu działania",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Pierwszy tydzień po wpięciu wtyczki kot był jak anioł, a w drugim tygodniu wszystko wróciło, choć w butelce była połowa płynu!”",
    "mechanismCore": "Tanie grzałki rozgrzewają knot powyżej 115°C, wypalając lekkie frakcje w 7 dni i utleniając resztę. Rdzeń ceramiczny 5W w Feliorze trzyma stałą temperaturę przez 30 dni.",
    "defaultImageId": "kie-feliora-s4-spalony-knot-zwykly-dyfuzor",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s4-spalony-knot-zwykly-dyfuzor.jpg",
    "defaultImageHash": "c1cd0eebef48e24b1b6a84b912294bda",
    "defaultSecondImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultSecondImageHash": "e828b0b777bf998b35f34018a306eda3"
  },
  {
    "id": "fel-18-pojedynczy-f3-vs-kompleks-matczyny-map",
    "number": 18,
    "code": "S4-18",
    "title": "Pojedyncza cząsteczka F3 vs Pełny Kompleks Matczyny M.A.P. (Przełom II generacji)",
    "shortTitle": "Pojedyncze F3 vs Kompleks M.A.P.",
    "stageId": "stage4_product_aware",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Synergia M.A.P. + F3 (5%)",
    "problemCluster": "F3_VS_MAP_FIZYKA",
    "problemLabel": "Różnica między I a II generacją feromonów",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Miałam najdroższy klasyczny dyfuzor z apteki i moje koty dalej tłukły się do krwi pod drzwiami.”",
    "mechanismCore": "Klasyczne wtyczki mają tylko frakcję policzkową F3 (na drapanie). Na walki kotów, FIC i sikanie na łóżko konieczny jest matczyny feromon kojący M.A.P. połączony z F3.",
    "defaultImageId": "kie-feliora-s2-siatka-w-drzwiach-dokocenie",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s2-siatka-w-drzwiach-dokocenie.jpg",
    "defaultImageHash": "e45bd8ea91ecd638b103d7c416b15144",
    "defaultSecondImageId": "kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko.jpg",
    "defaultSecondImageHash": "80d0cf729d575057c4eda44f65df59c9"
  },
  {
    "id": "fel-19-zasada-1-pokoj-1-strefa-miau-pl",
    "number": 19,
    "code": "S4-19",
    "title": "Wpięłam dyfuzor w salonie, a kot dalej sikał w sypialni. Jeden rysunek wyjaśnił mi dlaczego",
    "shortTitle": "Zasada 1 Pokój = 1 Strefa (Fizyka Ścian)",
    "stageId": "stage4_product_aware",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Fizyka Ciężkich Lipidów",
    "problemCluster": "F3_VS_MAP_FIZYKA",
    "problemLabel": "Rozchodzenie się feromonów w polskim bloku",
    "recommendedFanpageId": "1304624172730017",
    "recommendedFanpageName": "Koty Bez Ściemy",
    "vocTrigger": "„Na pudełku pisało do 70 m², a moje mieszkanie ma 54 m². Dlaczego w sypialni za korytarzem stężenie wynosiło zero?”",
    "mechanismCore": "Cząsteczki feromonów w nośniku lipidowym nie skręcają o 90 stopni w polskim przedpokoju i nie przechodzą przez ściany - stąd Pakiet 2/3 Pokoje.",
    "defaultImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultImageHash": "e828b0b777bf998b35f34018a306eda3",
    "defaultSecondImageId": "kie-feliora-s1-mokry-plama-koldra-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s1-mokry-plama-koldra-kot.jpg",
    "defaultSecondImageHash": "7603e2a6afce7782f07c57dc0174cd2b"
  },
  {
    "id": "fel-20-oddalem-wklady-z-internetu-do-badania",
    "number": 20,
    "code": "S4-20",
    "title": "Kupiłem 4 najpopularniejsze wkłady z internetu dla własnego kota. Potem oddałem je do analizy",
    "shortTitle": "Analiza Laboratoryjna 4 Wkładów z Sieci",
    "stageId": "stage4_product_aware",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Chromatografia 5% vs 0,4%",
    "problemCluster": "F3_VS_MAP_FIZYKA",
    "problemLabel": "Stężenie 5% bio-identycznych feromonów",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Jestem weterynarzem od 25 lat, a mój własny 6-letni kocur zaczął znaczyć po remoncie klatki schodowej.”",
    "mechanismCore": "Analiza wykazała w tanich zamiennikach rozwodnioną izoparafinę (<0,4% F3). Feliora ma pełne 5% stężenie M.A.P. + F3 w 48 ml wkładzie.",
    "defaultImageId": "kie-feliora-s4-spalony-knot-zwykly-dyfuzor",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s4-spalony-knot-zwykly-dyfuzor.jpg",
    "defaultImageHash": "c1cd0eebef48e24b1b6a84b912294bda",
    "defaultSecondImageId": "kie-feliora-s3-rozcieta-obrozka-i-20-pudelek",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg",
    "defaultSecondImageHash": "a721e1b2e9fef557dc6f45633d7212a8"
  },
  {
    "id": "fel-21-matematyka-3-16zl-vs-4500zl",
    "number": 21,
    "code": "S5-21",
    "title": "Myślałam, że 94,99 zł za dyfuzor to dużo. Potem podliczyłam na kartce koszt „oszczędzania”",
    "shortTitle": "Matematyka: 3,16 zł/dzień vs 1 960 zł Strat",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Rachunek Ekonomiczny",
    "problemCluster": "MATEMATYKA_GWARANCJA",
    "problemLabel": "Porównanie kosztów: Weterynarz i Kanapa vs Feliora",
    "recommendedFanpageId": "1304624172730017",
    "recommendedFanpageName": "Koty Bez Ściemy",
    "vocTrigger": "„3 wizyty u weta (740 zł), 5 butelek enzymatyku (245 zł), pranie Karcherem (220 zł), wyrzucona kołdra (480 zł)...”",
    "mechanismCore": "Pakiet 2 Pokoje za 189,99 zł (94,99 zł/szt.) to dokładnie 3,16 zł dziennie na pokój + darmowy e-book i 30 dni gwarancji.",
    "defaultImageId": "kie-feliora-s5-kartka-rachunek-1960zl-i-feliora",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s5-kartka-rachunek-1960zl-i-feliora.jpg",
    "defaultImageHash": "b3de33f667c7a55c00a8b31663670ba8",
    "defaultSecondImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultSecondImageHash": "e828b0b777bf998b35f34018a306eda3"
  },
  {
    "id": "fel-22-instrukcja-rozmieszczenia-polskie-mieszkanie",
    "number": 22,
    "code": "S5-22",
    "title": "Dlaczego 78% polskich opiekunów wybiera od razu Pakiet 2 lub 3 Pokoje? Przewodnik rozmieszczenia",
    "shortTitle": "Przewodnik Rozmieszczenia w Bloku (2/3 Pokoje)",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Protokół 2 Stref",
    "problemCluster": "MATEMATYKA_GWARANCJA",
    "problemLabel": "Dobór pakietu i prawidłowy montaż",
    "recommendedFanpageId": "1338513126001175",
    "recommendedFanpageName": "Feliora",
    "vocTrigger": "„Gdzie dokładnie wpiąć dyfuzor w polskim mieszkaniu w bloku, żeby zadziałał od pierwszego tygodnia?”",
    "mechanismCore": "5 zasad dr. Newelskiego: Strefa Przebywania (salon/sypialnia) + Strefa Kuwety/Konfliktu, min. 1,2 m wolnej przestrzeni nad gniazdkiem, praca 24/7.",
    "defaultImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultImageHash": "e828b0b777bf998b35f34018a306eda3",
    "defaultSecondImageId": "kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko.jpg",
    "defaultSecondImageHash": "80d0cf729d575057c4eda44f65df59c9"
  },
  {
    "id": "fel-23-os-czasu-14-dni-uklad-nerwowy",
    "number": 23,
    "code": "S5-23",
    "title": "Co dokładnie dzieje się z mózgiem Twojego kota między 1. a 14. dniem pracy Feliory?",
    "shortTitle": "Oś Czasu: Dzień 1 do Dnia 14",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Kalendarz Neurobiologiczny",
    "problemCluster": "MATEMATYKA_GWARANCJA",
    "problemLabel": "Kiedy widać pierwsze efekty (Dzień 1–14)",
    "recommendedFanpageId": "1287239777799682",
    "recommendedFanpageName": "Dr. wet. Edmund Newelski",
    "vocTrigger": "„Kiedy zobaczę różnicę? Dzień 1-3: nasycenie pokoju, Dzień 4-7: spadek kortyzolu, Dzień 8-14: sucha kołdra i głęboki sen.”",
    "mechanismCore": "Krok po kroku jak układ limbiczny kota schodzi ze stanu alarmowego do pełnej równowagi terytorialnej.",
    "defaultImageId": "kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko.jpg",
    "defaultImageHash": "80d0cf729d575057c4eda44f65df59c9",
    "defaultSecondImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultSecondImageHash": "e828b0b777bf998b35f34018a306eda3"
  },
  {
    "id": "fel-24-bezpieczenstwo-24-7-zero-sedacji",
    "number": 24,
    "code": "S5-24",
    "title": "Czy dyfuzor nie otumani mojego kota i czy mogę zostawić go w gniazdku na 9h w pracy?",
    "shortTitle": "Bezpieczeństwo 24/7 i Zero Otumanienia",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Bezpieczeństwo CE & VNO",
    "problemCluster": "MATEMATYKA_GWARANCJA",
    "problemLabel": "Bezpieczeństwo wtyczki 5W i brak sedacji",
    "recommendedFanpageId": "1338513126001175",
    "recommendedFanpageName": "Feliora",
    "vocTrigger": "„Boję się zostawić ciepłą wtyczkę w kontakcie, jak wychodzę na 9h do pracy, i nie chcę, żeby kot był po tym senny.”",
    "mechanismCore": "Obudowa samogasnąca V-0 z rdzeniem 5W (mniej niż ładowarka do telefonu) + 100% bezwonny dla ludzi i psów, zero przenikania do krwiobiegu.",
    "defaultImageId": "kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s4-wtyczka-feliora-w-gniazdku-kot.jpg",
    "defaultImageHash": "e828b0b777bf998b35f34018a306eda3",
    "defaultSecondImageId": "kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko.jpg",
    "defaultSecondImageHash": "80d0cf729d575057c4eda44f65df59c9"
  },
  {
    "id": "fel-25-test-30-dni-sucha-koldra-albo-zwrot",
    "number": 25,
    "code": "S5-25",
    "title": "Weź Feliorę na 30 dni próby. Sucha kanapa i cisza w nocy albo zwracamy 100% pieniędzy",
    "shortTitle": "30-Dniowa Gwarancja (Nawet po Zużyciu)",
    "stageId": "stage5_most_aware",
    "stageNumber": 5,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Sofistykacja 5 · Pełne Odwrócenie Ryzyka",
    "problemCluster": "MATEMATYKA_GWARANCJA",
    "problemLabel": "30-dniowa gwarancja zwrotu pieniędzy",
    "recommendedFanpageId": "1338513126001175",
    "recommendedFanpageName": "Feliora",
    "vocTrigger": "„Sparzyłam się już tyle razy, że bałam się zaryzykować kolejne 189,99 zł. Zamówiłam tylko dlatego, że mogłam oddać puste butelki.”",
    "mechanismCore": "Pełna 30-dniowa gwarancja zwrotu 100% wpłaty nawet po zużyciu wkładów - całe ryzyko leży po stronie Feliory.",
    "defaultImageId": "kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko",
    "defaultImageUrl": "/feliora-pl-images/kie-feliora-s5-dwa-koty-razem-kanapa-gniazdko.jpg",
    "defaultImageHash": "80d0cf729d575057c4eda44f65df59c9",
    "defaultSecondImageId": "kie-feliora-s5-kartka-rachunek-1960zl-i-feliora",
    "defaultSecondImageUrl": "/feliora-pl-images/kie-feliora-s5-kartka-rachunek-1960zl-i-feliora.jpg",
    "defaultSecondImageHash": "b3de33f667c7a55c00a8b31663670ba8"
  }
];

export const FELIORA_ALL_COPY: Record<
  string,
  {
    headline: string;
    description: string;
    primaryText: string;
  }
> = {
  ...FELIORA_PL_COPY_STAGE1,
  ...FELIORA_PL_COPY_STAGE2,
  ...FELIORA_PL_COPY_STAGE3,
  ...FELIORA_PL_COPY_STAGE4,
  ...FELIORA_PL_COPY_STAGE5,
};

export const FELIORA_META_ACCOUNT_ID = FELIORA_AD_ACCOUNT_ID;
export const FELIORA_META_NATIVE_CAMPAIGN_ID = '120248696945370298';
export const FELIORA_META_MAIN_CAMPAIGN_ID = '120248699197940298';
export const FELIORA_META_PIXEL_ID = '1441502454116004';
export const FELIORA_ADVERTORIAL_URL = FELIORA_LISTICLE_URL;
export const FELIORA_DEFAULT_URL = FELIORA_PDP_URL;

export interface FelioraPlGeneratedAd {
  id: string;
  angleId: string;
  code: string;
  title: string;
  stageId: FelioraAwarenessStageId;
  sophisticationLevel: FelioraSophisticationLevel;
  problemCluster: FelioraProblemCluster;
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

export function sanitizeAndAuditFelioraPl(
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

  if (/[—–]/.test(primaryText) || /[—–]/.test(headline) || /[—–]/.test(description)) {
    primaryText = primaryText.replace(/\s*[—–]\s*/g, ' - ');
    headline = headline.replace(/\s*[—–]\s*/g, ' - ');
    description = description.replace(/\s*[—–]\s*/g, ' - ');
    fixes.push('Zamieniono długie pauzy (—/–) na zwykły łącznik (-).');
  }

  if (/,\s+i\b/i.test(primaryText) || /,\s+i\b/i.test(headline)) {
    primaryText = primaryText.replace(/,(\s+i\b)/gi, '$1');
    headline = headline.replace(/,(\s+i\b)/gi, '$1');
    fixes.push('Usunięto przecinek przed spójnikiem „i”.');
  }

  const wordCount = primaryText.split(/\s+/).filter(Boolean).length;
  const characterCount = primaryText.length;

  if (wordCount < 900) {
    warnings.push(`Krótki tekst (${wordCount} słów - rekomendowane 1100+ słów).`);
  }

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

export function buildAllFelioraPrewrittenAds(): FelioraPlGeneratedAd[] {
  const now = 1792616400000;
  return FELIORA_PRESET_ANGLES.map((preset, idx) => {
    const rawCopy = FELIORA_ALL_COPY[preset.id] || {
      headline: preset.title,
      description: '30-dniowa gwarancja zwrotu · Darmowy poradnik e-book w pakietach',
      primaryText: '',
    };
    const audited = sanitizeAndAuditFelioraPl(rawCopy.primaryText, rawCopy.headline, rawCopy.description);
    const secondImg = FELIORA_IMAGE_LIBRARY[(idx + 5) % FELIORA_IMAGE_LIBRARY.length];
    return {
      id: `feliora-pl-${preset.code.toLowerCase()}`,
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
      destinationUrl: FELIORA_LISTICLE_URL,
      cta: 'LEARN_MORE',
      imageUrl: preset.defaultImageUrl,
      imageHash: preset.defaultImageHash,
      secondImageUrl: preset.defaultSecondImageUrl || secondImg?.url,
      secondImageHash: preset.defaultSecondImageHash || secondImg?.imageHash,
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

