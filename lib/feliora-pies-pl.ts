/**
 * FELIORA PL (PSY) — Fabryka Polskich Antków / MSL dla Dyfuzora Feromonów Feliora dla Psów (D.A.P.)
 *
 * Architektura: 5 Awareness Stages (Schwartz) × 5 Kątów = 25 Antków (Sofistykacja 3–5)
 * Oparta w 100% na Voice of Customer z polskich forów psiarzy (Dogomania, Wykop #psy, Reddit r/Polska,
 * Forum Gazeta.pl emama / Psy rasowe, Allegro, Ceneo) oraz karcie produktu Feliora dla Psów.
 */

import { FELIORA_PIES_PL_COPY_STAGE1 } from './feliora-pies-pl-copy-stage1';
import { FELIORA_PIES_PL_COPY_STAGE2 } from './feliora-pies-pl-copy-stage2';
import { FELIORA_PIES_PL_COPY_STAGE3 } from './feliora-pies-pl-copy-stage3';
import { FELIORA_PIES_PL_COPY_STAGE4 } from './feliora-pies-pl-copy-stage4';
import { FELIORA_PIES_PL_COPY_STAGE5 } from './feliora-pies-pl-copy-stage5';

export type FelioraPiesAwarenessStageId =
  | 'stage1_unaware'
  | 'stage2_problem_aware'
  | 'stage3_solution_aware'
  | 'stage4_product_aware'
  | 'stage5_most_aware';

export type FelioraPiesSophisticationLevel = 3 | 4 | 5;

export type FelioraPiesProblemCluster =
  | 'KARTKA_SASIEDZI_WYCIE'
  | 'DEMOLKA_DRZWI_KANAPA'
  | 'SCHRONISKO_KLATKA_KALUZE'
  | 'BURZE_PETARDY_SYLWESTER'
  | 'ZDEMASKOWANIE_TRENINGU_SEDACJI'
  | 'DAP_PRZEDPOKOJ_DUZE_PSY'
  | 'MATEMATYKA_GWARANCJA_30DNI';

export interface FelioraPiesStageMeta {
  id: FelioraPiesAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  shortLabel: string;
  title: string;
  subtitle: string;
  sophisticationLabel: string;
  sophisticationLevel: FelioraPiesSophisticationLevel;
  color: string;
  bgLight: string;
  borderColor: string;
  vocSummary: string;
}

export interface FelioraPiesFanpage {
  id: string;
  name: string;
  initials: string;
  role: string;
  badgeColor: string;
}

export interface FelioraPiesImageAsset {
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

export interface FelioraPiesAnglePreset {
  id: string;
  number: number;
  code: string;
  title: string;
  shortTitle: string;
  stageId: FelioraPiesAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  sophisticationLevel: FelioraPiesSophisticationLevel;
  sophisticationBadge: string;
  problemCluster: FelioraPiesProblemCluster;
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

export const FELIORA_PIES_AD_ACCOUNT_ID = '1168927131917359';
export const FELIORA_PIES_PDP_URL = 'https://feliora.pl/products/weterynaryjny-dyfuzor-feromonow-dla-psow-feliora';
export const FELIORA_PIES_LISTICLE_URL = FELIORA_PIES_PDP_URL;
export const FELIORA_PIES_META_ACCOUNT_ID = FELIORA_PIES_AD_ACCOUNT_ID;
export const FELIORA_PIES_META_NATIVE_CAMPAIGN_ID = '120248696945370298';
export const FELIORA_PIES_META_MAIN_CAMPAIGN_ID = '120248699197940298';
export const FELIORA_PIES_META_PIXEL_ID = '1441502454116004';
export const FELIORA_PIES_ADVERTORIAL_URL = FELIORA_PIES_LISTICLE_URL;
export const FELIORA_PIES_DEFAULT_URL = FELIORA_PIES_PDP_URL;

export const FELIORA_PIES_FANPAGES: FelioraPiesFanpage[] = [
  {
    id: '1338513126001175',
    name: 'Feliora',
    initials: 'FL',
    role: 'Oficjalny Profil Marki & Historie Opiekunów Psów (100% spójny z 1. os. opiekuna i ofertą)',
    badgeColor: '#047857',
  },
  {
    id: '1287239777799682',
    name: 'Dr. wet. Edmund Newelski',
    initials: 'EN',
    role: 'Autorytet Weterynaryjny (25 lat w lecznicy · Wyłącznie kąty pisane w 1. os. r. męski lekarza)',
    badgeColor: '#1d4ed8',
  },
];

export const FELIORA_PIES_STAGES: Record<FelioraPiesAwarenessStageId, FelioraPiesStageMeta> = {
  stage1_unaware: {
    id: 'stage1_unaware',
    stageNumber: 1,
    shortLabel: 'Stage 1 · Unaware',
    title: 'STAGE 1: UNAWARE (Szok sąsiedzki, demolka i ukryty lęk)',
    subtitle: 'Myśli, że „pies robi na złość albo ma za mało ruchu”, boi się kartek na drzwiach i straży miejskiej z art. 51 KW',
    sophisticationLabel: 'Sofistykacja 3/4 · Panika Separacyjna vs Mit Niewychowania',
    sophisticationLevel: 3,
    color: '#ea580c',
    bgLight: '#fff7ed',
    borderColor: '#fed7aa',
    vocSummary:
      'Anonimowa kartka na drzwiach i groźba art. 51 KW, wydrapane drzwi do MDF-u i wypatroszona kanapa za 5 500 zł, lękliwy pies z fundacji, kałuża 20 minut po spacerze oraz panika za pralką w burzę i petardy.',
  },
  stage2_problem_aware: {
    id: 'stage2_problem_aware',
    stageNumber: 2,
    shortLabel: 'Stage 2 · Problem Aware',
    title: 'STAGE 2: PROBLEM AWARE (Świadomy lęku separacyjnego)',
    subtitle: 'Widzi na kamerce „istny armagedon”, próbuje Konga i klatki kennelowej, ale nie wyłącza wyrzutu adrenaliny',
    sophisticationLabel: 'Sofistykacja 3 · Blokada Trawienia, Mapa Stada & Dług Kortyzolowy 72h',
    sophisticationLevel: 3,
    color: '#1d4ed8',
    bgLight: '#eff6ff',
    borderColor: '#bfdbfe',
    vocSummary:
      'Płacz w korku przed kamerką Live i nietknięty Kong, przeprowadzka 8-letniego psa, pogięte pręty klatki kennelowej, spięcia 2 psów lub żałoba po suczce oraz 72-godzinny dług kortyzolowy na spacerach.',
  },
  stage3_solution_aware: {
    id: 'stage3_solution_aware',
    stageNumber: 3,
    shortLabel: 'Stage 3 · Solution Aware',
    title: 'STAGE 3: SOLUTION AWARE (Sparzony na treningach i środkach)',
    subtitle: 'Wydała 600 zł na behawiorystkę („wychodź na 30 sekund”), boi się Sedalinu, obroży z impulsem i pyta o wagę 38 kg',
    sophisticationLabel: 'Sofistykacja 4 · Zdemaskowanie Treningu 30 Sekund, Sedalinu i Mitu Wagi',
    sophisticationLevel: 4,
    color: '#b45309',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    vocSummary:
      'Behawiorystka 300 zł/h kontra 8h etatu o 7:00 rano, trauma chemicznego paraliżu po żelach sedacyjnych, obroże z impulsem i lawendą torturującą 300 mln receptorów, kamizelka uciskowa oraz mit 38-kg owczarka.',
  },
  stage4_product_aware: {
    id: 'stage4_product_aware',
    stageNumber: 4,
    shortLabel: 'Stage 4 · Product Aware',
    title: 'STAGE 4: PRODUCT AWARE (Świadomy dyfuzorów)',
    subtitle: 'Mówi: „Miałam wtyczkę z zoologicznego i działała tydzień” albo „Pies leży w przedpokoju pod drzwiami”',
    sophisticationLabel: 'Sofistykacja 5 · Rdzeń Ceramiczny 5W, Polski Przedpokój & Czyste D.A.P.',
    sophisticationLevel: 5,
    color: '#c2410c',
    bgLight: '#fff7ed',
    borderColor: '#fed7aa',
    vocSummary:
      'Przegrzana grzałka 115°C paląca zwykły wkład w 7 dni, błąd wpinania za zasłoną w salonie zamiast przy strefie przedpokoju, 18 pudełek z internetu z 0% D.A.P., 20-minutowy spray alkoholowy oraz pies + kot pod jednym dachem.',
  },
  stage5_most_aware: {
    id: 'stage5_most_aware',
    stageNumber: 5,
    shortLabel: 'Stage 5 · Most Aware',
    title: 'STAGE 5: MOST AWARE (Gotowy do zakupu)',
    subtitle: 'Liczy koszty zniszczeń, sprawdza gdzie wpiąć wtyczki, czy 5W jest bezpieczne przez 9h w pracy i jak działa 30 dni gwarancji',
    sophisticationLabel: 'Sofistykacja 5 · Matematyka 2 524 zł vs 94,99 zł/szt. & 30 Dni Próby',
    sophisticationLevel: 5,
    color: '#047857',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
    vocSummary:
      'Rachunek 2 524 zł za drzwi i kanapę vs Pakiet 2 Pokoje (189,99 zł), 5 zasad montażu w polskim mieszkaniu, oś czasu 6 tygodni (ankieta 416 opiekunów: 97% i 96%), bezpieczeństwo 5W na 9h w pracy oraz 30-dniowa gwarancja zwrotu.',
  },
};

export const FELIORA_PIES_IMAGE_LIBRARY: FelioraPiesImageAsset[] = [
  {
    id: 'feliora-pies-owczarek-gniazdko',
    url: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    imageHash: '',
    label: '🐶 Duży pies odpoczywający spokojnie obok wtyczki Feliora dla Psów w gniazdku',
    adsetOrigin: 'Feliora Dog Native',
    adOrigin: 'Pies + Dyfuzor w Gniazdku',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'feliora-pies-diffuser-ref',
    url: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    imageHash: '',
    label: '🔌 Dyfuzor Uspokajający dla Psów FELIORA (1 Dyfuzor + 2 Wkłady 48 mL · Polska szata)',
    adsetOrigin: 'Feliora Dog Packshot',
    adOrigin: 'Zestaw Feliora Pies',
    aspectRatio: '1:1',
    source: 'meta',
  },
  {
    id: 'feliora-pies-offer-hero',
    url: '/feliora-pies-pl-images/feliora-pies-offer-hero.jpg',
    imageHash: '',
    label: '🛡️ Karta Oferty FELIORA Pies · Wycisza Lęk i Szczekanie + 30 Dni Gwarancji',
    adsetOrigin: 'Feliora Dog Offer',
    adOrigin: 'Hero 30 Dni Gwarancji',
    aspectRatio: '1:1',
    source: 'meta',
  },
  {
    id: 'feliora-pies-ebook-poradnik',
    url: '/feliora-pies-pl-images/feliora-pies-ebook-poradnik.jpg',
    imageHash: '',
    label: '📘 Poradnik Lekarza Weterynarii „Co Twój Pies Próbuje Ci Powiedzieć?” (Gratis w pakietach)',
    adsetOrigin: 'Feliora Dog Bonus',
    adOrigin: 'E-book Gratis',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s4-spalony-knot-zwykly-dyfuzor',
    url: '/feliora-pl-images/kie-feliora-s4-spalony-knot-zwykly-dyfuzor.jpg',
    imageHash: 'c1cd0eebef48e24b1b6a84b912294bda',
    label: '📸 KIE RAW · Zbliżenie na przegrzany, czarny zwęglony knot zwykłego dyfuzora 115°C',
    adsetOrigin: 'Kie.ai Raw Native',
    adOrigin: 'Spalony Knot 115°C',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s3-rozcieta-obrozka-i-20-pudelek',
    url: '/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg',
    imageHash: 'a721e1b2e9fef557dc6f45633d7212a8',
    label: '📸 KIE RAW · Rozcięta nożyczkami fioletowa obróżka lawendowa i sterta nieskutecznych sprayów',
    adsetOrigin: 'Kie.ai Raw Native',
    adOrigin: 'Rozcięta Obróżka i Spraye',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'kie-feliora-s5-kartka-rachunek-1960zl-i-feliora',
    url: '/feliora-pl-images/kie-feliora-s5-kartka-rachunek-1960zl-i-feliora.jpg',
    imageHash: 'b3de33f667c7a55c00a8b31663670ba8',
    label: '📸 KIE RAW · Ręczne podliczenie kosztów zniszczeń i prób na kartce obok dyfuzorów Feliora',
    adsetOrigin: 'Kie.ai Raw Native',
    adOrigin: 'Rachunek Strat na Kartce',
    aspectRatio: '1:1',
    source: 'ai',
  },
];

export const FELIORA_PIES_PRESET_ANGLES: FelioraPiesAnglePreset[] = [
  // ==================== STAGE 1: UNAWARE (#1 - #5) ====================
  {
    id: 'dog-01-anonimowa-kartka-na-drzwiach-art51',
    number: 1,
    code: 'P1-01',
    title: 'Anonimowa kartka na drzwiach i groźba straży miejskiej z art. 51 KW (Wycie przez 8h)',
    shortTitle: 'Kartka na Drzwiach i Art. 51 KW',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Szok Sąsiedzki w Bloku',
    problemCluster: 'KARTKA_SASIEDZI_WYCIE',
    problemLabel: 'Wycie pod drzwiami / Skargi sąsiadów',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Znalazłam na drzwiach kartkę przyklejoną szarą taśmą: wyje od 8:00 do 16:00, dzwonimy na straż miejską z art. 51 KW i do TOZ.”',
    mechanismCore: 'Pies śpiący przy właścicielu jak anioł nie wyje ze złośliwości - zamknięcie zamka odcina zapach przewodnika i odpala panikę separacyjną.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-diffuser-ref',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-02-wydrapane-drzwi-kaucja-wynajem',
    number: 2,
    code: 'P1-02',
    title: 'Wydrapane drzwi do żywego MDF-u, zerwane uszczelki i wypatroszona kanapa za 5 500 zł',
    shortTitle: 'Wydrapane Drzwi i Kanapa 5 500 zł',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Mit „Za Mało Ruchu”',
    problemCluster: 'DEMOLKA_DRZWI_KANAPA',
    problemLabel: 'Drapanie drzwi i niszczenie mebli',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Biegałem z nim 1,5 godziny o 5:00 rano, a po pracy i tak zastałem zerwane uszczelki z futryny, gąbkę na salonie i zdarte pazury.”',
    mechanismCore: 'Zmęczone mięśnie nie wyłączają ciała migdałowatego - drapanie szpary drzwi to próba wydostania się za zapachem opiekuna, a nie nadmiar energii.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-offer-hero',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-offer-hero.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-03-pies-ze-schroniska-cien-w-domu',
    number: 3,
    code: 'P1-03',
    title: 'Adoptowaliśmy psa po przejściach. Minęło 8 miesięcy, a on wciąż kuli się przy każdym stuknięciu windy',
    shortTitle: 'Pies po Przejściach ze Schroniska',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Ciche Czuwanie Bez Snu REM',
    problemCluster: 'SCHRONISKO_KLATKA_KALUZE',
    problemLabel: 'Lęk poschroniskowy / Brak głębokiego snu',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Wzięliśmy psiaka z fundacji - boi się własnego cienia, każdego stuknięcia windy na klatce, a w nocy kręci się i nie potrafi zasnąć.”',
    mechanismCore: 'Trauma schroniskowa utrzymuje układ nerwowy w ciągłym czuwaniu; matczyny sygnał D.A.P. przez narząd VNO daje pierwszy głęboki sen na boku.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-ebook-poradnik',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-ebook-poradnik.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-04-kaluza-po-godzinnym-spacerze-kortyzol',
    number: 4,
    code: 'P1-04',
    title: 'W nocy wytrzymuje 9 godzin, a w dzień zostawia kałużę na dywanie 20 minut po godzinnym spacerze',
    shortTitle: 'Kałuża 20 Minut po Spacerze',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Oś Mózg-Pęcherz u Psa',
    problemCluster: 'SCHRONISKO_KLATKA_KALUZE',
    problemLabel: 'Sikanie w domu ze stresu separacyjnego',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Wychodzę z nim przed pracą na godzinny spacer, załatwia wszystko, a wracam po 4 godzinach i na dywanie jest nasikane. Pęcherz zdrowy.”',
    mechanismCore: 'Nagły skok adrenaliny i kortyzolu po zatrzaśnięciu drzwi fizjologicznie zaciska pęcherz i rozluźnia zwieracze - krzyk tylko podwaja panikę.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-diffuser-ref',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-05-petardy-burza-za-pralka-galareta',
    number: 5,
    code: 'P1-05',
    title: 'W każdą burzę i od grudnia mój 28-kilogramowy pies wciska się za pralkę i trzęsie się jak galareta',
    shortTitle: 'Burze, Petardy i Panika za Pralką',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Fobia Dźwiękowa',
    problemCluster: 'BURZE_PETARDY_SYLWESTER',
    problemLabel: 'Strach przed burzą, fajerwerkami i hałasem',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Na wieczornym spacerze w grudniu zapiera się 4 łapami i ciągnie do klatki, a w domu wciska się za pralkę i zieje jak przed zawałem.”',
    mechanismCore: 'Stałe nasycenie mieszkania feromonem kojącym D.A.P. tworzy bezpieczny azyl węchowy i obniża próg paniki akustycznej bez żeli sedacyjnych.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-offer-hero',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-offer-hero.jpg',
    defaultSecondImageHash: '',
  },

  // ==================== STAGE 2: PROBLEM AWARE (#6 - #10) ====================
  {
    id: 'dog-06-kamera-live-w-korku-istny-armagedon',
    number: 6,
    code: 'P2-06',
    title: 'Utknęłam w korku, odpaliłam kamerkę Live z salonu i rozpłakałam się za kierownicą (Nietknięty Kong)',
    shortTitle: 'Kamera Live w Korku: Istny Armagedon',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Blokada Układu Trawiennego',
    problemCluster: 'KARTKA_SASIEDZI_WYCIE',
    problemLabel: 'Panika na kamerce Live / Nietknięte gryzaki',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Obserwowałam go Live z kamery stojąc w korku - istny armagedon. Nawet nie tknął Konga z pasztetem, tylko wył i dyszał pod drzwiami.”',
    mechanismCore: 'W wyrzucie adrenaliny układ współczulny odcina żołądek i ślinianki pokarmowe - spanikowany pies biologicznie nie jest w stanie jeść smaczków.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-diffuser-ref',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-07-starszy-pies-przeprowadzka-cos-sie-przestawilo',
    number: 7,
    code: 'P2-07',
    title: 'Przez 7 lat zostawał sam bez pisku, a po przeprowadzce nagle oszalał - dr Edmund Newelski wyjaśnia',
    shortTitle: 'Po Przeprowadzce „Coś Się Przestawiło”',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Skasowana Mapa Stada',
    problemCluster: 'KARTKA_SASIEDZI_WYCIE',
    problemLabel: 'Nagły lęk po przeprowadzce lub u starszego psa',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Panie doktorze, jemu coś się przestawiło w głowie - w starym mieszkaniu spał 8 godzin, a na nowym osiedlu wyje i drapie ściany.”',
    mechanismCore: 'Nowe ściany i obce echa klatki schodowej kasują wieloletnią mapę zapachową stada; 2 dyfuzory D.A.P. odtwarzają sygnał bezpiecznego gniazda.',
    defaultImageId: 'feliora-pies-diffuser-ref',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-owczarek-gniazdko',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-08-szczenie-klatka-kennelowa-krew-na-pretach',
    number: 8,
    code: 'P2-08',
    title: 'Pułapka „treningu klatkowego” z grup FB: zamknęłam psa z lękiem w klatce i zastałam pogięte pręty',
    shortTitle: 'Pułapka Klatki Kennelowej i Pogięte Pręty',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Klaustrofobia + Kortyzol',
    problemCluster: 'SCHRONISKO_KLATKA_KALUZE',
    problemLabel: 'Szał w klatce kennelowej pod nieobecność',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Kazali kupić klatkę kennelową i przykryć kocem. Koc wciągnięty do środka w strzępach, taca połamana, pręty odgięte zębami.”',
    mechanismCore: 'Zamknięcie psa w aktywnym ataku paniki separacyjnej w metalowej klatce dokłada atak klaustrofobii; najpierw trzeba wyciszyć mózg sygnałem D.A.P.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-ebook-poradnik',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-ebook-poradnik.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-09-drugi-pies-zaloba-walki-w-domu',
    number: 9,
    code: 'P2-09',
    title: 'Spięcia 2 psów o kanapę i miskę albo rozpacz psa po stracie przyjaciela - dr Newelski z gabinetu',
    shortTitle: '2 Psy w Domu lub Żałoba po Drugim Psie',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Harmonia Gniazda D.A.P.',
    problemCluster: 'SCHRONISKO_KLATKA_KALUZE',
    problemLabel: 'Konflikty 2 psów w domu / Żałoba psa',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Młody pies atakuje starszego rezydenta o kanapę, a u sąsiadki pies po śmierci suczki zaczął z rozpaczy demolować mieszkanie.”',
    mechanismCore: 'Matczyny feromon kojący D.A.P. to ten sam sygnał z listwy mlecznej suki, który wygasza rywalizację w miocie i koi ból nagłej samotności.',
    defaultImageId: 'feliora-pies-diffuser-ref',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-owczarek-gniazdko',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-10-dlug-kortyzolowy-72h-reaktywnosc-na-spacerze',
    number: 10,
    code: 'P2-10',
    title: 'Dlaczego Twój pies rzuca się na inne psy na osiedlu? Bo nie odpoczywa w domu (Dług Kortyzolowy 72h)',
    shortTitle: 'Dług Kortyzolowy 72h i Reaktywność',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 3,
    sophisticationBadge: 'Sofistykacja 3 · Przepełnione Wiadro Stresu',
    problemCluster: 'BURZE_PETARDY_SYLWESTER',
    problemLabel: 'Szczekanie i reaktywność na spacerach',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Wydaliśmy krocie na szkolenia na placu, a pies na każdym wyjściu z klatki ciągnie jak parowóz i ujada na każdego mijanego psa.”',
    mechanismCore: 'Kortyzol wypłukuje się z psiej krwi przez 72 godziny - pies czuwający cały dzień przy windzie wychodzi na dwór z przepełnionym wiadrem stresu.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-diffuser-ref',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultSecondImageHash: '',
  },

  // ==================== STAGE 3: SOLUTION AWARE (#11 - #15) ====================
  {
    id: 'dog-11-behawiorystka-300zl-wychodz-na-30-sekund',
    number: 11,
    code: 'P3-11',
    title: 'Behawiorystka wzięła 300 zł i kazała mi wychodzić z domu na 30 sekund. A ja o 7:00 szłam na 8h do pracy',
    shortTitle: 'Behawiorystka 300 zł vs 8h Etatu',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Sofistykacja 4 · Zderzenie z Polskim Etatem',
    problemCluster: 'ZDEMASKOWANIE_TRENINGU_SEDACJI',
    problemLabel: 'Nierealne rady behawiorystów vs praca 8h',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Wzięła 300 zł i kazała przez 3 miesiące nie zostawiać psa nawet na wyjście do Żabki, tylko ćwiczyć klamkę po 30 sekund.”',
    mechanismCore: 'Trening behawioralny nie przyswaja się w mózgu zalanym adrenaliną; stała dyfuzja D.A.P. 24/7 daje osłonę od razu podczas normalnej pracy.',
    defaultImageId: 'kie-feliora-s5-kartka-rachunek-1960zl-i-feliora',
    defaultImageUrl: '/feliora-pl-images/kie-feliora-s5-kartka-rachunek-1960zl-i-feliora.jpg',
    defaultImageHash: 'b3de33f667c7a55c00a8b31663670ba8',
    defaultSecondImageId: 'feliora-pies-owczarek-gniazdko',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-12-trauma-sedalinu-i-psychotropow-zombie',
    number: 12,
    code: 'P3-12',
    title: 'Gdy słyszę, że ktoś chce dać przerażonemu psu żel zwiotczający mięśnie albo psychotropy, cierpnie mi skóra',
    shortTitle: 'Przestroga przed Żelami Sedacyjnymi i Zombie',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Sofistykacja 4 · Zero Chemicznego Kaftana',
    problemCluster: 'ZDEMASKOWANIE_TRENINGU_SEDACJI',
    problemLabel: 'Lęk przed przymuleniem i lekami uspokajającymi',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Boję się dać mu tabletki albo żel na Sylwestra, żeby nie był przymulony jak zombie ze zwiotczałymi mięśniami i pełną świadomością.”',
    mechanismCore: 'Stare żele sedacyjne paraliżują ciało bez wyłączenia słuchu i strachu; Feliora działa przez narząd VNO z 0% chemii we krwi i 0% otumanienia.',
    defaultImageId: 'feliora-pies-diffuser-ref',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'kie-feliora-s3-rozcieta-obrozka-i-20-pudelek',
    defaultSecondImageUrl: '/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg',
    defaultSecondImageHash: 'a721e1b2e9fef557dc6f45633d7212a8',
  },
  {
    id: 'dog-13-obroza-elektryczna-i-obrozki-z-lawenda',
    number: 13,
    code: 'P3-13',
    title: '2 najgorsze rzeczy na szyi lękliwego psa w moim gabinecie: obroża z impulsem i pasek z olejkiem lawendowym',
    shortTitle: 'Obroża Antyszczekowa i Tortura Lawendą',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Sofistykacja 4 · 300 Milionów Receptorów Węchu',
    problemCluster: 'ZDEMASKOWANIE_TRENINGU_SEDACJI',
    problemLabel: 'Demaskacja obroży elektrycznych i ziołowych',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Ktoś na forum doradził obrożę antyszczekową, a po fioletowej obróżce z zoologicznego pies drapał szyję i wył jeszcze głośniej.”',
    mechanismCore: 'Pies ma 300 mln receptorów węchowych (40x więcej niż człowiek) - pasek z lawendą pod nosem drażni śluzówkę, a impuls zamienia lęk w samookaleczanie.',
    defaultImageId: 'kie-feliora-s3-rozcieta-obrozka-i-20-pudelek',
    defaultImageUrl: '/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg',
    defaultImageHash: 'a721e1b2e9fef557dc6f45633d7212a8',
    defaultSecondImageId: 'feliora-pies-diffuser-ref',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-14-kamizelka-uciskowa-tabletki-ziolowe-radio',
    number: 14,
    code: 'P3-14',
    title: 'Przetestowałem kamizelkę uciskową za 219 zł, kapsułki z tryptofanem, koszulkę i radio. Dlaczego po 3h zawiodły?',
    shortTitle: 'Kamizelka 219 zł, Zioła i Radio vs 8h',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Sofistykacja 4 · Cmentarzysko z Przedpokoju',
    problemCluster: 'ZDEMASKOWANIE_TRENINGU_SEDACJI',
    problemLabel: 'Nieskuteczność kamizelek uciskowych i ziół',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Ubrałam go w ThunderShirt, dałam tabletki ziołowe i zostawiłam radio - w kamizelce ział z gorąca, a po 2 godzinach znów wył.”',
    mechanismCore: 'Domowe półśrodki wietrzeją lub przegrzewają psa; tylko stałe stężenie D.A.P. z gniazdka utrzymuje równe wyciszenie przez pełne 8-9 godzin.',
    defaultImageId: 'kie-feliora-s3-rozcieta-obrozka-i-20-pudelek',
    defaultImageUrl: '/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg',
    defaultImageHash: 'a721e1b2e9fef557dc6f45633d7212a8',
    defaultSecondImageId: 'feliora-pies-owczarek-gniazdko',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-15-mit-35kg-owczarka-waga-vs-nos',
    number: 15,
    code: 'P3-15',
    title: '„Mam 38-kilogramowego owczarka, taka mała wtyczka to może zadziała na maltańczyka!” - obalam największy mit',
    shortTitle: 'Mit 38-kg Owczarka (Waga vs Nos VNO)',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Sofistykacja 4 · Neurobiologia vs Tabletka na Kg',
    problemCluster: 'DAP_PRZEDPOKOJ_DUZE_PSY',
    problemLabel: 'Czy dyfuzor działa na duże rasy (35 kg+)',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Mam 38-kg owczarka niemieckiego - przy odrobaczaniu bierze 4 wielkie tabletki, czy mała wtyczka w ścianie w ogóle na niego zadziała?”',
    mechanismCore: 'Feromony nie rozpuszczają się we krwi na kilogram masy ciała - działają na nabłonek VNO w nosie, który u dużego owczarka jest jeszcze większy i czulszy.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-diffuser-ref',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultSecondImageHash: '',
  },

  // ==================== STAGE 4: PRODUCT AWARE (#16 - #20) ====================
  {
    id: 'dog-16-zwykly-dyfuzor-dzialal-tydzien-grzalka-115c',
    number: 16,
    code: 'P4-16',
    title: 'Kupiłam znany dyfuzor za 145 zł. Przez 7 dni pies spał spokojnie, a w 2. tygodniu znów wył mimo połowy płynu',
    shortTitle: 'Dlaczego Zwykły Dyfuzor Gaśnie po 7 Dniach',
    stageId: 'stage4_product_aware',
    stageNumber: 4,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Grzałka 115°C vs Rdzeń 5W (60 Dni)',
    problemCluster: 'DAP_PRZEDPOKOJ_DUZE_PSY',
    problemLabel: 'Przegrzany knot starych dyfuzorów vs Feliora',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Kupiłam wcześniej dyfuzor znanej marki - po krótkim czasie Luna znów zaczęła wyć przy wyjściu do pracy, choć w butelce został płyn.”',
    mechanismCore: 'Niezregulowane oporniki 115-120°C wypalają i utleniają D.A.P. w tydzień; stabilizowany rdzeń ceramiczny 5W w Feliorze uwalnia równą dawkę przez 60 dni.',
    defaultImageId: 'kie-feliora-s4-spalony-knot-zwykly-dyfuzor',
    defaultImageUrl: '/feliora-pl-images/kie-feliora-s4-spalony-knot-zwykly-dyfuzor.jpg',
    defaultImageHash: 'c1cd0eebef48e24b1b6a84b912294bda',
    defaultSecondImageId: 'feliora-pies-diffuser-ref',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-17-blad-przedpokoju-gdzie-wpiac-w-bloku',
    number: 17,
    code: 'P4-17',
    title: '„Wpiąłem dyfuzor w salonie za zasłoną, a pies dalej wył pod drzwiami!” - 1 rysunek rzutu mieszkania wyjaśnia',
    shortTitle: 'Błąd Polskiego Przedpokoju (Gdzie Wpiąć)',
    stageId: 'stage4_product_aware',
    stageNumber: 4,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Protokół 2 Stref w Bloku',
    problemCluster: 'DAP_PRZEDPOKOJ_DUZE_PSY',
    problemLabel: 'Gdzie wpiąć dyfuzor, gdy pies leży pod drzwiami',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Pies leży cały dzień w ciasnym przedpokoju pod drzwiami wejściowymi - wtyczka w salonie za zasłoną nic nie dała.”',
    mechanismCore: 'Feromony nie skręcają za szafę wnękową przez korytarz w kształcie litery L - potrzebne jest pokrycie strefy wejścia oraz salonu (Pakiet 2 Pokoje).',
    defaultImageId: 'feliora-pies-diffuser-ref',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-owczarek-gniazdko',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-18-analiza-zamiennikow-z-internetu-0-procent-dap',
    number: 18,
    code: 'P4-18',
    title: 'Poprosiłem 18 właścicieli psów mówiących „feromony z internetu nie działają”, żeby przynieśli pudełka do gabinetu',
    shortTitle: '18 Pudełek w Lecznicy: 0% D.A.P.',
    stageId: 'stage4_product_aware',
    stageNumber: 4,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Audyt Składów na Stole',
    problemCluster: 'DAP_PRZEDPOKOJ_DUZE_PSY',
    problemLabel: 'Tanie zamienniki z 0% D.A.P. vs Feliora',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Kupiłem wtyczkę uspokajającą za 39 zł na aukcji i pies dalej gryzł listwy - feromony to ściema!”',
    mechanismCore: '15 z 23 sprawdzonych opakowań miało 0% psich feromonów D.A.P. (sama waleriana i olejki); po przejściu na bio-identyczne D.A.P. Feliora u 16 z 18 psów nastał spokój.',
    defaultImageId: 'kie-feliora-s3-rozcieta-obrozka-i-20-pudelek',
    defaultImageUrl: '/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg',
    defaultImageHash: 'a721e1b2e9fef557dc6f45633d7212a8',
    defaultSecondImageId: 'feliora-pies-diffuser-ref',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-19-spray-vs-dyfuzor-8-godzin-etatu',
    number: 19,
    code: 'P4-19',
    title: 'Dlaczego spryskanie legowiska sprayem przed wyjściem o 7:00 rano zostawia psa bez żadnej osłony już przed 8:00',
    shortTitle: '20 Minut Sprayu vs 8 Godzin Etatu',
    stageId: 'stage4_product_aware',
    stageNumber: 4,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Parowanie Etanolu vs Stała Emisja',
    problemCluster: 'DAP_PRZEDPOKOJ_DUZE_PSY',
    problemLabel: 'Dlaczego spraye zawodzą podczas 8h pracy',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Psikałam posłanie przed pracą o 7:00, pies kichał od alkoholu, a o 10:00 gdy szedł listonosz i tak zaczynał wyć na cały blok.”',
    mechanismCore: 'Nośnik alkoholowy w sprayach odparowuje w 20-30 minut; przy 8-godzinnej nieobecności działa wyłącznie nieprzerwana emisja 24/7 z głowicy Feliora.',
    defaultImageId: 'kie-feliora-s3-rozcieta-obrozka-i-20-pudelek',
    defaultImageUrl: '/feliora-pl-images/kie-feliora-s3-rozcieta-obrozka-i-20-pudelek.jpg',
    defaultImageHash: 'a721e1b2e9fef557dc6f45633d7212a8',
    defaultSecondImageId: 'feliora-pies-owczarek-gniazdko',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-20-feromony-kota-nie-dzialaja-na-psa-gatunkowosc',
    number: 20,
    code: 'P4-20',
    title: '„Mam w domu psa i kota - czy wystarczy 1 wtyczka?” Lekarz weterynarii tłumaczy zamek i klucz receptorów VNO',
    shortTitle: 'Pies i Kot w Domu (Zamek i Klucz VNO)',
    stageId: 'stage4_product_aware',
    stageNumber: 4,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Specyficzność Gatunkowa D.A.P.',
    problemCluster: 'DAP_PRZEDPOKOJ_DUZE_PSY',
    problemLabel: 'Czy dyfuzor psa działa na kota i czy jest bezpieczny',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Mamy w mieszkaniu kota i lękliwego psa - czy psi dyfuzor nie zaszkodzi kotu albo rocznemu dziecku i dlaczego kocia wtyczka nie wycisza psa?”',
    mechanismCore: 'Psie D.A.P. i kocie F3 to osobne szyfry gatunkowe: całkowicie niewyczuwalne i w 100% obojętne dla ludzi, dzieci i drugiego gatunku.',
    defaultImageId: 'feliora-pies-diffuser-ref',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-offer-hero',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-offer-hero.jpg',
    defaultSecondImageHash: '',
  },

  // ==================== STAGE 5: MOST AWARE (#21 - #25) ====================
  {
    id: 'dog-21-matematyka-zniszczone-drzwi-kanapa-vs-feliora',
    number: 21,
    code: 'P5-21',
    title: 'Szkoda mi było 189,99 zł na 2 dyfuzory. Potem podliczyłem na kartce 2 524 zł wydane na „oszczędzanie”',
    shortTitle: 'Matematyka: 2 524 zł Strat vs 94,99 zł/szt.',
    stageId: 'stage5_most_aware',
    stageNumber: 5,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Twardy Rachunek z Konta',
    problemCluster: 'MATEMATYKA_GWARANCJA_30DNI',
    problemLabel: 'Koszt zniszczonych drzwi i kanapy vs Feliora',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Kanapa za 5 500 zł obgryzana po rogach, okleina drzwi 650 zł, tapicer 800 zł, behawiorysta 600 zł - razem 2 524 zł w pół roku.”',
    mechanismCore: 'Pakiet 2 Pokoje za 189,99 zł (94,99 zł/szt. przy wkładzie na 60 dni = ok. 1,58 zł dziennie na pokój) z darmowym e-bookiem i 30-dniową gwarancją.',
    defaultImageId: 'kie-feliora-s5-kartka-rachunek-1960zl-i-feliora',
    defaultImageUrl: '/feliora-pl-images/kie-feliora-s5-kartka-rachunek-1960zl-i-feliora.jpg',
    defaultImageHash: 'b3de33f667c7a55c00a8b31663670ba8',
    defaultSecondImageId: 'feliora-pies-offer-hero',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-offer-hero.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-22-instrukcja-5-zasad-rozmieszczenia-pies-w-bloku',
    number: 22,
    code: 'P5-22',
    title: 'Dlaczego większość opiekunów wybiera Pakiet 2 lub 3 Pokoje? 5 zasad wpinania dyfuzora Feliora w mieszkaniu',
    shortTitle: '5 Zasad Rozmieszczenia (Pakiety 1-4 Pokoje)',
    stageId: 'stage5_most_aware',
    stageNumber: 5,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Instrukcja Gabinetowa',
    problemCluster: 'MATEMATYKA_GWARANCJA_30DNI',
    problemLabel: ' Dobór pakietu i prawidłowy montaż w pionie',
    recommendedFanpageId: '1287239777799682',
    recommendedFanpageName: 'Dr. wet. Edmund Newelski',
    vocTrigger: '„Ile dyfuzorów wziąć do 52-metrowego mieszkania w bloku i gdzie dokładnie je podłączyć, żeby zadziałało od 1. tygodnia?”',
    mechanismCore: 'Pokrycie Strefy Drzwi + Strefy Legowiska, zawsze w pionie, min. 1,2 m nad wtyczką, ciągła praca 24/7 + poradnik e-book gratis w pakietach 2/3/4 Pokoje.',
    defaultImageId: 'feliora-pies-diffuser-ref',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-ebook-poradnik',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-ebook-poradnik.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-23-os-czasu-tydzien-po-tygodniu-uklad-nerwowy-psa',
    number: 23,
    code: 'P5-23',
    title: 'Co dokładnie dzieje się w układzie nerwowym Twojego psa od 1. dnia do 6. tygodnia pracy Feliory D.A.P.?',
    shortTitle: 'Oś Czasu: Dzień 1 do 6. Tygodnia (97% / 96%)',
    stageId: 'stage5_most_aware',
    stageNumber: 5,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Kalendarz Wyciszenia & Dane 416 Psów',
    problemCluster: 'MATEMATYKA_GWARANCJA_30DNI',
    problemLabel: 'Kiedy widać pierwsze efekty u psa',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Kiedy zobaczę zmianę? 97% opiekunów widzi poprawę samopoczucia po 2 tygodniach, a 96% spokojniejsze zostawanie samemu.”',
    mechanismCore: 'Realistyczna neurobiologia: nasycenie pokoju w 24-72h, spadek napięcia w 1-3 tygodniu, pełne poczucie bezpieczeństwa w 3-6 tygodniu i wkład na 60 dni.',
    defaultImageId: 'feliora-pies-owczarek-gniazdko',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-offer-hero',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-offer-hero.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-24-bezpieczenstwo-wtyczki-9h-w-pracy-i-zero-przymulenia',
    number: 24,
    code: 'P5-24',
    title: 'Czy mogę zostawić ciepłą wtyczkę w gniazdku na 9 godzin w pracy i czy pies nie będzie po niej senny?',
    shortTitle: 'Bezpieczeństwo 5W na 9h w Pracy i 0% Sedacji',
    stageId: 'stage5_most_aware',
    stageNumber: 5,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Certyfikat CE 5W & 100% Bezwonny',
    problemCluster: 'MATEMATYKA_GWARANCJA_30DNI',
    problemLabel: 'Bezpieczeństwo przeciwpożarowe i brak zapachu',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Wtyczka jest lekko ciepła - czy nie spali mieszkania, gdy jestem 9h w biurze, i czy domownicy albo alergicy nic nie poczują?”',
    mechanismCore: 'Samoregulujący rdzeń ceramiczny 5W (mniej niż ładowarka do telefonu) do pracy 24/7 z CE + 100% bezwonny dla ludzi i 0% wpływu na energię psa na spacerze.',
    defaultImageId: 'feliora-pies-diffuser-ref',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-diffuser-ref.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-owczarek-gniazdko',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultSecondImageHash: '',
  },
  {
    id: 'dog-25-test-30-dni-ciche-drzwi-albo-zwrot-100-proc',
    number: 25,
    code: 'P5-25',
    title: 'Weź dyfuzor Feliora dla Psów na 30 dni próby. Spokój na kamerce i cisza pod drzwiami albo 100% zwrotu',
    shortTitle: '30-Dniowa Gwarancja (<1% Zwrotów · 2 Mln Sztuk)',
    stageId: 'stage5_most_aware',
    stageNumber: 5,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Pełne Odwrócenie Ryzyka',
    problemCluster: 'MATEMATYKA_GWARANCJA_30DNI',
    problemLabel: '30-dniowa gwarancja zwrotu pieniędzy',
    recommendedFanpageId: '1338513126001175',
    recommendedFanpageName: 'Feliora',
    vocTrigger: '„Przepaliłam już tyle pieniędzy na gryzaki i szkolenia, że zamówiłam wyłącznie dzięki 30-dniowej gwarancji zwrotu.”',
    mechanismCore: 'Ponad 2 000 000 sprzedanych dyfuzorów marki (TheraPetMD / Feliora) przy zwrotach poniżej 1% pozwala wziąć 100% ryzyka testu w domu na siebie.',
    defaultImageId: 'feliora-pies-offer-hero',
    defaultImageUrl: '/feliora-pies-pl-images/feliora-pies-offer-hero.jpg',
    defaultImageHash: '',
    defaultSecondImageId: 'feliora-pies-owczarek-gniazdko',
    defaultSecondImageUrl: '/feliora-pies-pl-images/feliora-pies-owczarek-gniazdko.jpg',
    defaultSecondImageHash: '',
  },
];

export const FELIORA_PIES_ALL_COPY: Record<
  string,
  {
    headline: string;
    description: string;
    primaryText: string;
  }
> = {
  ...FELIORA_PIES_PL_COPY_STAGE1,
  ...FELIORA_PIES_PL_COPY_STAGE2,
  ...FELIORA_PIES_PL_COPY_STAGE3,
  ...FELIORA_PIES_PL_COPY_STAGE4,
  ...FELIORA_PIES_PL_COPY_STAGE5,
};

export interface FelioraPiesPlGeneratedAd {
  id: string;
  angleId: string;
  code: string;
  title: string;
  stageId: FelioraPiesAwarenessStageId;
  sophisticationLevel: FelioraPiesSophisticationLevel;
  problemCluster: FelioraPiesProblemCluster;
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

export function sanitizeAndAuditFelioraPiesPl(
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

  if (/[*™]/.test(primaryText) || /[*™]/.test(headline) || /[*™]/.test(description)) {
    primaryText = primaryText.replace(/[*™]/g, '');
    headline = headline.replace(/[*™]/g, '');
    description = description.replace(/[*™]/g, '');
    fixes.push('Usunięto gwiazdki Markdown i symbole ™.');
  }

  if (/,\s+i\b/i.test(primaryText) || /,\s+i\b/i.test(headline)) {
    primaryText = primaryText.replace(/,(\s+i\b)/gi, '$1');
    headline = headline.replace(/,(\s+i\b)/gi, '$1');
    fixes.push('Usunięto przecinek przed spójnikiem „i”.');
  }

  const wordCount = primaryText.split(/\s+/).filter(Boolean).length;
  const characterCount = primaryText.length;

  if (wordCount < 950) {
    warnings.push(`Krótki tekst (${wordCount} słów - rekomendowane 1050+ słów).`);
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

export function buildAllFelioraPiesPrewrittenAds(): FelioraPiesPlGeneratedAd[] {
  const now = 1793000000000;
  return FELIORA_PIES_PRESET_ANGLES.map((preset, idx) => {
    const rawCopy = FELIORA_PIES_ALL_COPY[preset.id] || {
      headline: preset.title,
      description: '30-dniowa gwarancja zwrotu · Darmowy poradnik e-book w pakietach',
      primaryText: '',
    };
    const audited = sanitizeAndAuditFelioraPiesPl(rawCopy.primaryText, rawCopy.headline, rawCopy.description);
    const secondImg = FELIORA_PIES_IMAGE_LIBRARY[(idx + 1) % FELIORA_PIES_IMAGE_LIBRARY.length];
    return {
      id: `feliora-pies-pl-${preset.code.toLowerCase()}`,
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
      destinationUrl: FELIORA_PIES_PDP_URL,
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
