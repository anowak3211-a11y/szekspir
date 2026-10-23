/**
 * ANTKI PL — Fabryka Polskich Antków / MSL dla Orthomax StepMax (Porady Mamy Gosi & Dorośli)
 *
 * Zawiera:
 * 1. Pełną bazę wiedzy (Mózg Antków PL, Mechanizm StepMax w liczbie mnogiej, Cennik 99,99 zł / 1+1 GRATIS + 30 dni gwarancji,
 *    obsada Porady Mamy Gosi, dr Ryciak, łańcuch kompensacji, 7 Hot Buttonów, Mass Desires Schwartza).
 * 2. Dokładną instrukcję psychologiczną i strukturalną dla bota AI rozróżniającą każdy:
 *    - AWARENESS STAGE (Stage 1 Unaware -> Stage 2 Problem Aware -> Stage 3 Solution Aware -> Stage 4 Product/Mechanism Aware)
 *    - MARKET SOPHISTICATION (Poziom 3: Nowy Mechanizm Przyczyny vs Poziom 4: Rozbicie starych rozwiązań + Mechanizm Sprężyny)
 * 3. Matrycę 35 predefiniowanych kątów ze świeżymi nagłówkami w stylu Mellow (zero zużytego „Jeśli Twoje dziecko bolą stopy..."):
 *    - Stage 1 (Unaware · Sofistykacja 3): Domowy Detektyw (m.in. Nike za 599 zł w promocji zdarte po 3 tyg., nocny płacz, mokry ślad)
 *    - Stage 2 (Problem Aware · Sofistykacja 3): Efekt Domina (plecak 420 zł / plecy, kark/okulista, biodro na orliku, kolano na schodach)
 *    - Stage 2/3 (Problem/Solution Aware · Sofistykacja 3): Szkoła, WF i Wstyd w szatni
 *    - Stage 3 (Solution Aware · Sofistykacja 4): Wypalone Matki, Wojna o kaszę/ćwiczenia i 14h na betonie i panelach
 *    - Stage 2/3 (Winner · Sofistykacja 3/4): Ryciak Rip 3 — Inne Wersje (Gabinet / SOR / Plecy / Bilans / Slow-Mo)
 *    - Stage 4 (High Stakes · Sofistykacja 4): Żal po operacji / Strach przed zabiegiem i wózkiem
 *    - Segment B (Opcjonalny / Zapasowy): Dorośli Jesień/Zima
 * 4. Twardą walidację polszczyzny i zasad właściciela:
 *    - Zero em-dashów (—) i en-dashów (–) -> automatyczna konwersja + walidacja
 *    - Zero ", i" -> przebudowa
 *    - Liczba mnoga dla produktu: "Wkładki Orthomax StepMax są zrobione...", nigdy liczba pojedyncza "Orthomax StepMax jest zrobiony"
 *    - Spójny zapis godzin i liczb cyframi (np. "o 19:30", "po 17:00", "14 godzin", nigdy mieszania "19:30" i "po siedemnastej")
 *    - Realizm emocjonalny: matka NIE płacze razem z dzieckiem na podłodze w trakcie kłótni; trzyma fason, a pęka dopiero sama w kuchni/łazience, gdy dziecko zamknie drzwi
 *    - Realistyczny Most Odkrycia (Reveal): NIGDY "wpisałam z kartki od fizjoterapeuty, który w gabinecie nic nie powiedział"; zawsze organiczne odkrycie z grupy na FB / forum mam / od innej matki
 */

import { ANTKI_DOROSLI_PRESET_ANGLES } from './antki-dorosli-presets';

export type AntkiPlFunnelStage =
  | 'stage1_domowe_odkrycie'
  | 'stage2_efekt_domina'
  | 'stage2_szkola_wf'
  | 'stage3_wypalone_matki'
  | 'ryciak_rip3_variations'
  | 'zal_po_operacji'
  | 'dorosli_jesien_zima';

export type AntkiPlSegment = 'dzieci' | 'dorosli';

export interface AntkiPlPresetAngle {
  id: string;
  number: number;
  code: string;
  title: string;
  segment: AntkiPlSegment;
  funnelStage: AntkiPlFunnelStage;
  funnelLabel: string;
  awarenessStage: string;
  sophistication: string;
  narrator: string;
  protagonist: string;
  hookIdea: string;
  sceneBeat: string;
  failedSolutionsMath: string;
  discoveryBridge: string;
  defaultHeadline: string;
  defaultImageUrl?: string;
  defaultImageHash?: string;
  defaultSecondImageUrl?: string;
  defaultSecondImageHash?: string;
}

export interface AntkiPlGeneratedAd {
  id: string;
  angleId: string;
  code: string;
  title: string;
  segment: AntkiPlSegment;
  funnelStage: AntkiPlFunnelStage;
  pageName: string;
  headline: string;
  description: string;
  primaryText: string;
  destinationUrl: string;
  cta: 'LEARN_MORE' | 'SHOP_NOW';
  imageUrl?: string;
  imageHash?: string;
  secondImageUrl?: string;
  secondImageHash?: string;
  twoImageLayout?: 'side_by_side' | 'top_bottom';
  combinedSplitImageUrl?: string;
  combinedSplitImageHash?: string;
  wordCount: number;
  characterCount: number;
  auditPassed: boolean;
  auditWarnings: string[];
  auditFixesApplied: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AntkiPlImageAsset {
  id: string;
  url: string;
  label: string;
  source: 'ai' | 'meta' | 'custom';
  groupCode?: 'DOM' | 'RUCH' | 'GRUPA' | 'MIT' | 'RYCIAK' | 'ZAL' | 'ZIMA';
  defaultForAngles?: number[];
  angleId?: string;
  kiePrompt?: string;
  imageHash?: string;
  aspectRatio?: string;
  note?: string;
}

export const ANTKI_PL_IMAGE_LIBRARY: AntkiPlImageAsset[] = [
  // ==================== 14 SUROWYCH ZDJĘĆ KIE.AI (SHIT QUALITY / ZERO AI GLOW) DLA BATCHA 2: DOROŚLI (#36–#70) ====================
  {
    id: 'kie-dorosli-d1-sor-krzeselko-kolano',
    url: '/antki-pl-images/kie-dorosli-d1-sor-krzeselko-kolano.jpg',
    label: '📸 KIE RAW (D1 SOR #36) · Nocny SOR: plastikowe krzesełko i spuchnięte kolano pod jarzeniówką',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [36, 39],
    imageHash: '3795f92da5a3f17d3fd9a6e2e79f67b6',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie POV z telefonu na nocnym SOR-ze (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d1-schody-kosz-prania',
    url: '/antki-pl-images/kie-dorosli-d1-schody-kosz-prania.jpg',
    label: '📸 KIE RAW (D1 SOR #36/#38) · Drewniane schody w domu wieczorem i wiklinowy kosz z praniem',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [38],
    imageHash: '10571017552d4cd1737ab72aaf7e6f11',
    aspectRatio: '1:1',
    note: 'Surowe, lekko rozmyte zdjęcie z telefonu ze szczytu domowych schodów (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d1-zdarte-polbuty-obcas',
    url: '/antki-pl-images/kie-dorosli-d1-zdarte-polbuty-obcas.jpg',
    label: '📸 KIE RAW (D1 SOR #37/#40) · Zdarte pod skosem obcasy damskich półbutów w przedpokoju',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [37, 40, 59],
    imageHash: 'd05552e6774415a5f297ad31d20f3b29',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu: ścięta od wewnątrz pięta w bucie dorosłej kobiety (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d2-mama-miska-woda-kuchnia',
    url: '/antki-pl-images/kie-dorosli-d2-mama-miska-woda-kuchnia.jpg',
    label: '📸 KIE RAW (D2 M_Jakuba #41/#45) · 63-letnia mama mocząca spuchnięte stopy w misce w kuchni',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [41, 43, 45],
    imageHash: '368c04cc8927fbde20ec38b2efc1c5c8',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu w kuchni: zmęczone stopy mamy nad miską z wodą (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d2-szafka-masci-blistry',
    url: '/antki-pl-images/kie-dorosli-d2-szafka-masci-blistry.jpg',
    label: '📸 KIE RAW (D2 M_Jakuba #42/#44) · Otwarta szafka w kuchni: 6 wyciśniętych tubek maści i puste blistry',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [42, 44],
    imageHash: '820a86e85a83fd3a69a63ea29f573c55',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu: koszyczek pełen zużytych maści i tabletek przeciwbólowych (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d3-ryciak-stopa-test-dloni',
    url: '/antki-pl-images/kie-dorosli-d3-ryciak-stopa-test-dloni.jpg',
    label: '📸 KIE RAW (D3 Ryciak Dorośli #46/#47/#49) · POV w dół: dłonie fizjoterapeuty podnoszące łuk stopy dorosłej',
    source: 'ai',
    groupCode: 'RYCIAK',
    defaultForAngles: [46, 47, 49],
    imageHash: 'f93c48f3d3347ad58db12773cff53a62',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie POV z telefonu podczas 10-sekundowego testu podniesienia łuku stopy (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d3-kostki-od-tylu-12stopni',
    url: '/antki-pl-images/kie-dorosli-d3-kostki-od-tylu-12stopni.jpg',
    label: '📸 KIE RAW (D3 Ryciak Dorośli #48/#50) · Zbliżenie od tyłu na koślawe pięty dorosłej (12 stopni do środka)',
    source: 'ai',
    groupCode: 'RYCIAK',
    defaultForAngles: [48, 50],
    imageHash: '4778b1876d335e8a0e77a86e15223c86',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu przy podłodze: uciekające do środka pięty i kostki dorosłej (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d4-ostroga-6rano-framuga',
    url: '/antki-pl-images/kie-dorosli-d4-ostroga-6rano-framuga.jpg',
    label: '📸 KIE RAW (D4 Ostroga #51/#55) · 6:00 rano w ciemnym przedpokoju: na palcach i trzymanie się framugi',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [51, 55],
    imageHash: 'dfc30ffec55dd833d6568b3dc0909a4a',
    aspectRatio: '1:1',
    note: 'Surowe nocne/poranne zdjęcie z telefonu z wysokim ISO: pierwsze kroki rano przy ostrodze (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d4-zamrozona-butelka-stopa',
    url: '/antki-pl-images/kie-dorosli-d4-zamrozona-butelka-stopa.jpg',
    label: '📸 KIE RAW (D4 Ostroga #52/#53) · Wieczór na kanapie: turlanie zamrożonej butelki wody pod piekącą piętą',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [52, 53],
    imageHash: 'a425a788f62f8303e89464e5f90b4cb3',
    aspectRatio: '1:1',
    note: 'Surowe wieczorne zdjęcie z telefonu: zamrożona butelka wody pod stopą na dywanie (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d4-przecieta-zelowa-podpietka',
    url: '/antki-pl-images/kie-dorosli-d4-przecieta-zelowa-podpietka.jpg',
    label: '📸 KIE RAW (D4 Ostroga #54) · Przecięta nożyczkami żelowa podpiętka z apteki obok płaskich wkładek',
    source: 'ai',
    groupCode: 'MIT',
    defaultForAngles: [54, 67],
    imageHash: 'fe7c3ff63b8d633210c1838aa3aa0097',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu: przecięta na pół silikonowa podpiętka pokazująca zapadnięty środek (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d5-zimowe-botki-zamek-haluks',
    url: '/antki-pl-images/kie-dorosli-d5-zimowe-botki-zamek-haluks.jpg',
    label: '📸 KIE RAW (D5 Haluks #56/#57) · Zimowy botek z zablokowanym w połowie zamkiem i rozlana stopa z haluksem',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [56, 57],
    imageHash: '4b75aef3e981e2b04a4e64df6b842ed5',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie POV z telefonu w przedpokoju: niedopięty zamek w botku i haluks (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d5-mokra-stopa-dorosli-kafelki',
    url: '/antki-pl-images/kie-dorosli-d5-mokra-stopa-dorosli-kafelki.jpg',
    label: '📸 KIE RAW (D5 Haluks #58/#60) · Dwa płaskie prostokątne mokre ślady dorosłych stóp i separator na kafelkach',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [58, 60],
    imageHash: 'a5a30c8d4c553880912632fee447ab1d',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu po prysznicu: dwa płaskie prostokąty wody dorosłych stóp (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d6-uchwyt-prysznic-blizna-stopa',
    url: '/antki-pl-images/kie-dorosli-d6-uchwyt-prysznic-blizna-stopa.jpg',
    label: '📸 KIE RAW (D6 Żal po operacji #61–#65) · Blizna pooperacyjna na lewej stopie, but Baruka i kula przy fotelu',
    source: 'ai',
    groupCode: 'ZAL',
    defaultForAngles: [61, 62, 63, 64, 65],
    imageHash: 'faa5186b6bdd3f04227e66b310b09eaf',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie POV z telefonu: blizna po operacji na lewej stopie i kula ortopedyczna (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d7-kuchnia-8h-wkladki-stepmax',
    url: '/antki-pl-images/kie-dorosli-d7-kuchnia-8h-wkladki-stepmax.jpg',
    label: '📸 KIE RAW (D7 Praca 8-12h #66–#70) · Kuchenny stół wieczorem: buty do pracy i 2 pary wkładek StepMax (1+1)',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [66, 68, 69, 70],
    imageHash: 'f168f5fad5dd18811b5b0a8b869c27dd',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu na kuchennym stole pod żółtą żarówką po 8h pracy (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d1-sor-korytarz-nocny-buty',
    url: '/antki-pl-images/kie-dorosli-d1-sor-korytarz-nocny-buty.jpg',
    label: '📸 KIE RAW (D1 SOR #37) · Nocna izba przyjęć: krzesełko w korytarzu SOR i zsunięty but',
    source: 'ai',
    groupCode: 'ZIMA',
    imageHash: '0b7a66bfb611e69d52d042e7c2a7368f',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie POV z telefonu w nocnym korytarzu SOR pod jarzeniówką (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d2-paragon-apteka-leki-stol',
    url: '/antki-pl-images/kie-dorosli-d2-paragon-apteka-leki-stol.jpg',
    label: '📸 KIE RAW (D2 M_Jakuba #41/#42/#52) · Pogniecione paragony z apteki/rehabilitacji i maści na stole',
    source: 'ai',
    groupCode: 'ZIMA',
    imageHash: '7ca2dba7dddb63afe99ff07504f91700',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu: paragony fiskalne z apteki obok maści i opaski na stole (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d3-podoskop-dorosla-stopa-plaska',
    url: '/antki-pl-images/kie-dorosli-d3-podoskop-dorosla-stopa-plaska.jpg',
    label: '📸 KIE RAW (D3 Ryciak Dorośli #46/#48/#49) · Dorosła stopa na zielonym podoskopie (koślawość od tyłu)',
    source: 'ai',
    groupCode: 'RYCIAK',
    imageHash: 'a4d8ad41c838ea28b4e58f293cc3bc31',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu z badania dorosłej stopy na podoskopie (Shit Quality / Zero AI Glow)',
  },
  {
    id: 'kie-dorosli-d5-twarde-wkladki-w-kacie-buty',
    url: '/antki-pl-images/kie-dorosli-d5-twarde-wkladki-w-kacie-buty.jpg',
    label: '📸 KIE RAW (D4/D5 Mit Gipsu #54/#56/#59) · Sztywne twarde wkładki na zamówienie wyrzucone obok botków',
    source: 'ai',
    groupCode: 'MIT',
    imageHash: 'd195d5f613d261240f7137608d4b1b28',
    aspectRatio: '1:1',
    note: 'Surowe zdjęcie z telefonu w przedpokoju: wyrzucone sztywne wkładki obok butów (Shit Quality / Zero AI Glow)',
  },

  // ==================== 8 CZYSTYCH ZDJĘĆ NATYWNYCH (100% NATIVE IPHONE — BEZ WCIŚNIĘTEJ WKŁADKI) ====================
  {
    id: 'ai-dom-01',
    url: '/antki-pl-images/ai-dom-01-zdarte-buty.jpg',
    label: 'DOM · Czysty Native: Zdarte od wewnątrz podeszwy w przedpokoju (bez wkładki)',
    source: 'ai',
    groupCode: 'DOM',
    defaultForAngles: [1, 5, 9],
    imageHash: '12429338c7ae40326e42571f072b8b12',
    aspectRatio: '1:1',
    note: '100% surowe zdjęcie problemu z telefonu (zero wkładki w kadrze) — domyślne dla #1, #5 i #9',
  },
  {
    id: 'ai-dom-03',
    url: '/antki-pl-images/ai-dom-03-mokra-stopa.jpg',
    label: 'DOM · Czysty Native: Test mokrej stopy dziecka (6 lat) — oba płaskie ślady „stopa żelazka”',
    source: 'ai',
    groupCode: 'DOM',
    defaultForAngles: [3],
    imageHash: 'defde39b914a26c57835cbbea04d0329',
    aspectRatio: '1:1',
    note: '100% surowe zdjęcie problemu: małe dziecięce stópki w piżamie i dwa płaskie mokre ślady na kafelku — domyślne dla #3',
  },
  {
    id: 'ai-ruch-06',
    url: '/antki-pl-images/ai-ruch-06-plecak-postawa.jpg',
    label: 'RUCH · Czysty Native: Efekt Domina — uciekające kostki i łopatki od tyłu (bez wkładki)',
    source: 'ai',
    groupCode: 'RUCH',
    defaultForAngles: [6],
    imageHash: '59544f10083d13cecde0bf42871f06f9',
    aspectRatio: '1:1',
    note: '100% surowe zdjęcie problemu w korytarzu (bez wkładki) — domyślne dla #6',
  },
  {
    id: 'ai-grupa-11',
    url: '/antki-pl-images/ai-grupa-11-szatnia-wf.jpg',
    label: 'GRUPA · Czysty Native: Wykoślawione halówki i worek na WF w korytarzu (bez wkładki)',
    source: 'ai',
    groupCode: 'GRUPA',
    defaultForAngles: [14],
    imageHash: '8b5f96b3a3b381fea42dab4e6a3fc6c1',
    aspectRatio: '1:1',
    note: '100% surowe zdjęcie problemu (bez wkładki) — domyślne dla #14 (Wstyd w szatni)',
  },
  {
    id: 'ai-mit-16',
    url: '/antki-pl-images/ai-mit-16-wojna-o-cwiczenia.jpg',
    label: 'MIT · Czysty Native: Sztywne wkładki na wymiar wyjęte z butów + beret z kolcami i mata',
    source: 'ai',
    groupCode: 'MIT',
    defaultForAngles: [16],
    imageHash: 'c4abad24b27fa0e2c917603955cd2805',
    aspectRatio: '1:1',
    note: 'Prawdziwe sztywne wkładki ortopedyczne wyjęte z dziecięcych butów obok beretu sensorycznego i maty — domyślne dla #16 (Wojna o dywan)',
  },
  {
    id: 'ai-ryciak-21',
    url: '/antki-pl-images/ai-ryciak-21-gabinet-test-luku.jpg',
    label: 'RYCIAK · Czysty Native z Biblioteki: Podoskop i miarka (goniometr 4FIZJO) na pięcie',
    source: 'ai',
    groupCode: 'RYCIAK',
    defaultForAngles: [23],
    imageHash: 'f39f4f6fe7839d3634d55fea7a121d80',
    aspectRatio: '1:1',
    note: 'Zdjęcie z naszej biblioteki (podoskop + okrągła miarka 4FIZJO na pięcie) — domyślne dla #23 (Ryciak Plecy)',
  },
  {
    id: 'ai-zal-26',
    url: '/antki-pl-images/ai-zal-26-po-operacji-kule.jpg',
    label: 'ŻAL · Czysty Native: Dziecko na kanapie w salonie z nogą w gipsie na poduszce i kulami obok',
    source: 'ai',
    groupCode: 'ZAL',
    defaultForAngles: [28],
    imageHash: '22629f2d8b1f0a4926db2574412fd2a4',
    aspectRatio: '1:1',
    note: 'Naturalne zdjęcie z perspektywy mamy w salonie (dziecko z nogą w gipsie na poduszce i kule oparte o kanapę) — domyślne dla #28 (Operacja kolan 14-latki)',
  },
  {
    id: 'ai-zima-31',
    url: '/antki-pl-images/ai-zima-31-dorosli-zimowe-botki.jpg',
    label: 'ZIMA · Czysty Native: Zimowe botki ze zdartym obcasem i obolała pięta (bez wkładki)',
    source: 'ai',
    groupCode: 'ZIMA',
    defaultForAngles: [31],
    imageHash: 'd9c54511f796aee02e13531f56dcd366',
    aspectRatio: '1:1',
    note: '100% surowe zdjęcie problemu (bez pomarańczowej wkładki) — domyślne dla #31 (Zimowe botki)',
  },

  // ==================== ZATWIERDZONY KOLAŻ 3-KAFELKOWY (DZIECI: ZDARTE PODESZWY + WKŁADKA + SELFIE MAMY) ====================
  {
    id: 'ai-grid3-dzieci-buty',
    url: '/antki-pl-images/ai-grid3-dzieci-buty-mama.jpg',
    label: '🔥 KOLAŻ 3-KAFELKOWY · Dzieci: Zdarte podeszwy + Wsuwanie wkładki + Selfie Mamy z dzieckiem',
    source: 'ai',
    groupCode: 'DOM',
    imageHash: '01b24a09cf2dc73707b8a76ded20ed25',
    aspectRatio: '1:1',
    note: 'Zatwierdzony kolaż 3-kafelkowy: [LG] Zdarte podeszwy + [LD] Wsuwanie wkładki do buta + [P] Selfie mamy z dzieckiem',
  },

  // ==================== STARE ZDJĘCIA Z BIBLIOTEKI ANTKÓW (CZYSTE ORYGINAŁY Z G ORTHOMAX 2 MSL / ORTH 2 OLD MSL / MSL CZECHY) ====================
  {
    id: 'lib-antki-podoskop-jasny',
    url: '/antki-pl-images/lib-antki-podoskop-jasny.jpg',
    label: '📚 STARE ANTKI (Czyste) · Podoskop FOOT + Miarka 4FIZJO Goniometr (jasny oryginał 2048x2048)',
    source: 'meta',
    groupCode: 'RYCIAK',
    defaultForAngles: [7],
    imageHash: '8ec6badff8e90f7f881e1f3b0b6ffd12',
    aspectRatio: '1:1',
    note: 'Oryginalne czyste zdjęcie z kampanii G Orthomax 2 MSL — domyślne dla #7 (Ból głowy i karku)',
  },
  {
    id: 'lib-antki-podoskop-zielony',
    url: '/antki-pl-images/lib-antki-podoskop-zielony.jpg',
    label: '📚 STARE ANTKI (Czyste) · Zielony Podoskop FOOT + Miarka 4FIZJO Goniometr (zmianaformatuwfistka)',
    source: 'meta',
    groupCode: 'RYCIAK',
    defaultForAngles: [2],
    imageHash: '82b1871a7a3dee01f6286c3472c1074a',
    aspectRatio: '1:1',
    note: 'Oryginalne czyste zdjęcie zielonego podoskopu z miarką — domyślne dla #2 (Mit bólów wzrostowych)',
  },
  {
    id: 'lib-antki-zdarte-buty-tnf',
    url: '/antki-pl-images/lib-antki-zdarte-buty-tnf.jpg',
    label: '📚 STARE ANTKI (Czyste) · Zdarte od tyłu podeszwy butów The North Face (bez tekstu)',
    source: 'meta',
    groupCode: 'DOM',
    defaultForAngles: [17],
    imageHash: '408c8703e99f1d803463c30b92362fc8',
    aspectRatio: '1:1',
    note: 'Oryginalne czyste zdjęcie zdartych butów z kampanii G Orthomax 2 MSL — domyślne dla #17 (14h na szkolnym betonie)',
  },
  {
    id: 'lib-antki-koslawe-kostki-dziecko',
    url: '/antki-pl-images/lib-antki-koslawe-kostki-dziecko.jpg',
    label: '📚 STARE ANTKI (Czyste) · Koślawe pięty i kostki dziecka od tyłu na płytkach (bez tekstu)',
    source: 'meta',
    groupCode: 'RUCH',
    defaultForAngles: [19],
    imageHash: '7d5adc16d1f260583c7dd06237949172',
    aspectRatio: '1:1',
    note: 'Oryginalne czyste zdjęcie z kampanii G Orthomax 2 MSL — domyślne dla #19 (Fikcja gimnastyki korekcyjnej)',
  },
  {
    id: 'lib-antki-stare-szare-wkladki',
    url: '/antki-pl-images/lib-antki-stare-szare-wkladki.jpg',
    label: '📚 STARE ANTKI (Czyste) · Stare, zużyte szare wkładki ortopedyczne wyjęte z butów',
    source: 'meta',
    groupCode: 'MIT',
    defaultForAngles: [18],
    imageHash: 'e1fcc551ec20c08475788629588bcd8a',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie z kampanii G Orthomax 2 MSL — domyślne dla #18 (Mit gipsu / sztywne wkładki za 380 zł)',
  },
  {
    id: 'lib-antki-drzwi-sor-pl',
    url: '/antki-pl-images/lib-antki-drzwi-sor-pl.jpg',
    label: '📚 STARE ANTKI (Czyste) · Drzwi SZPITALNY ODDZIAŁ RATUNKOWY (oryginał bez napisów)',
    source: 'meta',
    groupCode: 'ZAL',
    defaultForAngles: [15, 22],
    imageHash: '69a46c3803572f10b92b292bb3991967',
    aspectRatio: '4:5',
    note: 'Oryginalne czyste zdjęcie polskich drzwi SOR — domyślne dla #15 (Zwolnienie z WF-u) oraz #22 (Ryciak SOR Kolano)',
  },
  {
    id: 'lib-antki-korytarz-sor-wozek',
    url: '/antki-pl-images/lib-antki-korytarz-sor-wozek.jpg',
    label: '📚 STARE ANTKI (Czyste) · Korytarz szpitalny / SOR z łóżkiem i wózkiem inwalidzkim',
    source: 'meta',
    groupCode: 'ZAL',
    defaultForAngles: [29],
    imageHash: 'e878449307e17f8bb97770ae78bd1937',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie z kampanii G Orthomax 2 MSL — domyślne dla #29 (Strach przed wózkiem inwalidzkim)',
  },
  {
    id: 'lib-antki-skierowanie-gdansk',
    url: '/antki-pl-images/lib-antki-skierowanie-gdansk.jpg',
    label: '📚 STARE ANTKI (Czyste) · Skierowanie Gdańsk: BADANIE OBRAZOWE 88.721 - PORADA ORTOPEDYCZNA',
    source: 'meta',
    groupCode: 'ZAL',
    defaultForAngles: [21],
    imageHash: '0c6548e5c3e92f2cb80469653819323f',
    aspectRatio: '1:1',
    note: 'Czyste polskie skierowanie ortopedyczne z Gdańska — domyślne dla #21 (Ryciak Rip 3 V1)',
  },
  {
    id: 'lib-antki-paragon-rehabilitacja-226zl',
    url: '/antki-pl-images/lib-antki-paragon-rehabilitacja-226zl.jpg',
    label: '📚 STARE ANTKI (Czyste) · Paragon z Centrum Rehabilitacji INREMED na 226,00 PLN (Ketonal, Maść, Plastry)',
    source: 'meta',
    groupCode: 'MIT',
    defaultForAngles: [34],
    imageHash: 'a9b6357c7660912a00fc09324f4ed1a3',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie paragonu z kampanii G Orthomax 2 MSL — domyślne dla #34 (62-letnia mama Teresa)',
  },
  {
    id: 'lib-antki-przed-po-kostki-stol',
    url: '/antki-pl-images/lib-antki-przed-po-kostki-stol.jpg',
    label: '📚 STARE ANTKI (Czyste) · Przed/Po od tyłu: zapadnięte kostki vs wyprostowane pięty (2 wfistka i adam)',
    source: 'meta',
    groupCode: 'RYCIAK',
    defaultForAngles: [20],
    imageHash: 'b8bd16faef5cd817a28cd78571fcd705',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie Przed/Po z kampanii MSL — domyślne dla #20 (Okno czasowe 12 lat)',
  },
  {
    id: 'lib-antki-przed-po-luk-bok',
    url: '/antki-pl-images/lib-antki-przed-po-luk-bok.jpg',
    label: '📚 STARE ANTKI (Czyste) · Przed/Po z boku: płaska stopa na podłodze vs podparty łuk stopy',
    source: 'meta',
    groupCode: 'DOM',
    defaultForAngles: [35],
    imageHash: '29ba838c47dc168e943859f08f4e3c63',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie Przed/Po z kampanii G Orthomax 2 MSL — domyślne dla #35 (Stopa rozlana o rozmiar większa)',
  },
  {
    id: 'lib-antki-przed-po-wkladka-bok',
    url: '/antki-pl-images/lib-antki-przed-po-wkladka-bok.jpg',
    label: '📚 STARE ANTKI (Czyste) · Przed/Po z boku: płaska stopa vs stopa na wkładce podpierającej łuk',
    source: 'meta',
    groupCode: 'DOM',
    imageHash: 'f220124852a35ed49756dbe109adcbdb',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie porównawcze z boku z biblioteki Antków',
  },
  {
    id: 'lib-antki-fizjo-badanie-fotel',
    url: '/antki-pl-images/lib-antki-fizjo-badanie-fotel.jpg',
    label: '📚 STARE ANTKI (Czyste) · Ortopeda w granatowym kitlu badający nogę chłopca na fotelu (1 wfistka)',
    source: 'meta',
    groupCode: 'RYCIAK',
    imageHash: '7bb02ef32e960bd9a20fb4a65b1a7914',
    aspectRatio: '4:3',
    note: 'Oryginalne zdjęcie z kampanii MSL (1 wfistka / męska wersja)',
  },
  {
    id: 'lib-antki-fizjo-katy-35-podoskop',
    url: '/antki-pl-images/lib-antki-fizjo-katy-35-podoskop.jpg',
    label: '📚 STARE ANTKI (Czyste) · Fizjoterapeutka rysująca kąty 35° na kostkach dziecka na podoskopie',
    source: 'meta',
    groupCode: 'RYCIAK',
    imageHash: 'ac574a77a1db71d4a27de0a17eb3e826',
    aspectRatio: '4:5',
    note: 'Oryginalne zdjęcie z gabinetu z biblioteki Antków',
  },
  {
    id: 'lib-antki-fizjo-laptop-skan',
    url: '/antki-pl-images/lib-antki-fizjo-laptop-skan.jpg',
    label: '📚 STARE ANTKI (Czyste) · Fizjoterapeutka w rękawiczkach badająca stopy + laptop ze skanem nacisku',
    source: 'meta',
    groupCode: 'RYCIAK',
    imageHash: 'c27d30240cd99d872f9ff6f2e8dc2db1',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie z komputerowego badania stóp w gabinecie',
  },
  {
    id: 'lib-antki-fizjo-wkladka-kozetka',
    url: '/antki-pl-images/lib-antki-fizjo-wkladka-kozetka.jpg',
    label: '📚 STARE ANTKI (Czyste) · Fizjoterapeuta pokazujący wyprofilowaną wkładkę przy stopach dziecka',
    source: 'meta',
    groupCode: 'RYCIAK',
    imageHash: '79c4d672ca9c59626eb7eaaea4be918f',
    aspectRatio: '16:9',
    note: 'Oryginalne zdjęcie z gabinetu z biblioteki Antków',
  },
  {
    id: 'lib-antki-bieznia-chod-telefon',
    url: '/antki-pl-images/lib-antki-bieznia-chod-telefon.jpg',
    label: '📚 STARE ANTKI (Czyste) · Badanie chodu dziecka boso na bieżni (nagrywanie telefonem na statywie)',
    source: 'meta',
    groupCode: 'RUCH',
    defaultForAngles: [25],
    imageHash: '8aae4e1c3b5a0e2e2585d289ec07d8b4',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie analizy chodu z biblioteki Antków — domyślne dla #25 (Nagranie chodu telefonem)',
  },
  {
    id: 'lib-antki-ultradzwieki-zel-pieta',
    url: '/antki-pl-images/lib-antki-ultradzwieki-zel-pieta.jpg',
    label: '📚 STARE ANTKI (Czyste) · Zabieg fali uderzeniowej / ultradźwięków z żelem na pięcie (jakuba 3)',
    source: 'meta',
    groupCode: 'MIT',
    defaultForAngles: [30],
    imageHash: '0e39eaf8cec0b6058714ca26f4da8e5f',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie z kampanii orth 2 old msl — domyślne dla #30 (Fala uderzeniowa i blokady w piętę)',
  },
  {
    id: 'lib-antki-zamrozona-butelka-stopa',
    url: '/antki-pl-images/lib-antki-zamrozona-butelka-stopa.jpg',
    label: '📚 STARE ANTKI (Czyste) · Stopa rolowana na zamrożonej butelce wody (domowy sposób na ból pięty)',
    source: 'meta',
    groupCode: 'ZIMA',
    defaultForAngles: [32],
    imageHash: '7c23f360dc0cc433a4cd580e7b9f753a',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie z biblioteki Antków — domyślne dla #32 (Poranny ból pięty o 6:00 rano)',
  },
  {
    id: 'lib-antki-rtg-kolan',
    url: '/antki-pl-images/lib-antki-rtg-kolan.jpg',
    label: '📚 STARE ANTKI (Czyste) · Zdjęcie RTG kolan (3wfistka)',
    source: 'meta',
    groupCode: 'RUCH',
    defaultForAngles: [24],
    imageHash: '798de84bd37c6b1dc43ba1e89354a242',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie RTG kolan z biblioteki Antków — domyślne dla #24 (Bilans 10-latka i RTG)',
  },
  {
    id: 'lib-antki-wykres-podobarograf',
    url: '/antki-pl-images/lib-antki-wykres-podobarograf.jpg',
    label: '📚 STARE ANTKI (Czyste) · Komputerowy wykres badania stóp / podobarograf (izolinie i kąty)',
    source: 'meta',
    groupCode: 'RYCIAK',
    imageHash: 'eca5fdfc5253bab59a39f1fa93b4f39a',
    aspectRatio: '1:1',
    note: 'Oryginalny wykres podobarograficzny z biblioteki Antków',
  },
  {
    id: 'lib-antki-kolaz-ugc-4x5',
    url: '/antki-pl-images/lib-antki-kolaz-ugc-4x5.jpg',
    label: '📚 STARE ANTKI (Czyste) · Kolaż UGC 4x5: Mamy i dzieci z pomarańczową wkładką Orthomax',
    source: 'meta',
    groupCode: 'DOM',
    imageHash: '6f2fd035503c2fd8b68fbdcc9c724328',
    aspectRatio: '4:5',
    note: 'Oryginalny kolaż UGC 4x5 bez napisów z biblioteki Meta',
  },
  {
    id: 'lib-antki-23-koslawe-piety-tyl',
    url: '/antki-pl-images/lib-antki-23-koslawe-piety-tyl.jpg',
    label: '📚 STARE ANTKI (Czyste) · Zbliżenie od tyłu na koślawe pięty i kostki dziecka na płytkach',
    source: 'meta',
    groupCode: 'RUCH',
    imageHash: '4c998917437ac69ffa26e40ef19e6cb2',
    aspectRatio: '1:1',
    note: 'Oryginalne czyste zdjęcie z folderu ORTHOMAX / MSL IMAGES',
  },
  {
    id: 'lib-antki-24-fizjo-bieznia-telefon',
    url: '/antki-pl-images/lib-antki-24-fizjo-bieznia-telefon.jpg',
    label: '📚 STARE ANTKI (Czyste) · Gabinet fizjo: nagrywanie telefonem na statywie chodu dziecka na bieżni (ujęcie 2)',
    source: 'meta',
    groupCode: 'RYCIAK',
    imageHash: 'd29256adcb89b67d1b9311b900f664d8',
    aspectRatio: '1:1',
    note: 'Oryginalne czyste zdjęcie z folderu ORTHOMAX / MSL IMAGES (f7327079eea2c0398ebc72a1713f9f2c)',
  },
  {
    id: 'lib-antki-25-skierowanie-gdansk-czyste',
    url: '/antki-pl-images/lib-antki-25-skierowanie-gdansk-czyste.jpg',
    label: '📚 STARE ANTKI (Czyste) · Oryginał: Skierowanie Gdańsk 88.721 - Porada Ortopedyczna (pełna ostrość)',
    source: 'meta',
    groupCode: 'ZAL',
    imageHash: '98f79771a12fffadfd14cced078cc74a',
    aspectRatio: '1:1',
    note: 'Oryginalny plik źródłowy z folderu ORTHOMAX / MSL IMAGES / PL IMAGES',
  },
  {
    id: 'lib-antki-26-karta-badania-88721',
    url: '/antki-pl-images/lib-antki-26-karta-badania-88721.jpg',
    label: '📚 STARE ANTKI (Czyste) · Karta badania ortopedycznego dziecka 88.721 na stole (IMG_1958)',
    source: 'meta',
    groupCode: 'ZAL',
    defaultForAngles: [26],
    imageHash: '059765c4a79a678c5eeafb0c36834d0d',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie dokumentacji medycznej z biblioteki Meta — domyślne dla #26 (Żal po operacji V1)',
  },
  {
    id: 'lib-antki-27-dokument-biomechanika',
    url: '/antki-pl-images/lib-antki-27-dokument-biomechanika.jpg',
    label: '📚 STARE ANTKI (Czyste) · Dokument badania biomechanicznego i podologicznego stóp (kod 93.09)',
    source: 'meta',
    groupCode: 'RYCIAK',
    imageHash: '5d6583f208429f9e0cd40d22cb6395d7',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie karty badania biomechanicznego z biblioteki Meta',
  },
  {
    id: 'lib-antki-28-paragon-apteka',
    url: '/antki-pl-images/lib-antki-28-paragon-apteka.jpg',
    label: '📚 STARE ANTKI (Czyste) · Paragon z apteki za maści i leki przeciwbólowe trzymany w dłoni',
    source: 'meta',
    groupCode: 'MIT',
    defaultForAngles: [27],
    imageHash: 'd53dee133cac3d52992ac78ed43dc5b2',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie paragonu z apteki z biblioteki Meta — domyślne dla #27 (Haluks wrócił po 2 latach)',
  },
  {
    id: 'lib-antki-29-karetka-szpital-noc',
    url: '/antki-pl-images/lib-antki-29-karetka-szpital-noc.jpg',
    label: '📚 STARE ANTKI (Czyste) · Karetka pod szpitalnym SOR-em w nocy (ostry dyżur / nocny wyjazd)',
    source: 'meta',
    groupCode: 'RYCIAK',
    imageHash: '22003ba04d9bd1726658038839a1983f',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie nocnego SOR-u z biblioteki Meta',
  },
  {
    id: 'lib-antki-31-karetka-wejscie-sor',
    url: '/antki-pl-images/lib-antki-31-karetka-wejscie-sor.jpg',
    label: '📚 STARE ANTKI (Czyste) · Wejście na nocny ostry dyżur / SOR i światła ambulansu',
    source: 'meta',
    groupCode: 'RYCIAK',
    imageHash: '22003ba04d9bd1726658038839a1983f',
    aspectRatio: '1:1',
    note: 'Oryginalne zdjęcie wejścia na SOR z biblioteki Meta',
  },
  {
    id: 'lib-antki-32-review-srebrne-buciki',
    url: '/antki-pl-images/lib-antki-32-review-srebrne-buciki.jpg',
    label: '📚 STARE ANTKI (UGC Review) · Srebrne buciki dziecięce z wkładką Orthomax w środku (zdjęcie mamy)',
    source: 'meta',
    groupCode: 'DOM',
    defaultForAngles: [13],
    imageHash: '033dc30cbef3fc0c86c4571391cb3023',
    aspectRatio: '4:5',
    note: 'Surowe zdjęcie z opinii klientki — domyślne dla #13 (Odmowa obozu zimowego)',
  },
  {
    id: 'lib-antki-33-review-czerwony-but',
    url: '/antki-pl-images/lib-antki-33-review-czerwony-but.jpg',
    label: '📚 STARE ANTKI (UGC Review) · Czerwony bucik dziecięcy z wkładką Orthomax trzymany w dłoni',
    source: 'meta',
    groupCode: 'DOM',
    defaultForAngles: [12],
    imageHash: '05596b8a592924831d20df3ec39ede42',
    aspectRatio: '4:5',
    note: 'Surowe zdjęcie z opinii klientki — domyślne dla #12 (Wybierany ostatni do drużyny)',
  },
  {
    id: 'lib-antki-34-review-wkladka-dywan',
    url: '/antki-pl-images/lib-antki-34-review-wkladka-dywan.jpg',
    label: '📚 STARE ANTKI (UGC Review) · Wkładka dziecięca Orthomax (rozm. 29-30) z opakowaniem na dywanie',
    source: 'meta',
    groupCode: 'DOM',
    imageHash: 'c46929e89e65881b47bae358e0857219',
    aspectRatio: '4:5',
    note: 'Surowe zdjęcie z opinii klientki z folderu ORTHOMAX / REVIEW IMAGES',
  },
  {
    id: 'lib-antki-35-review-czarna-wkladka-stol',
    url: '/antki-pl-images/lib-antki-35-review-czarna-wkladka-stol.jpg',
    label: '📚 STARE ANTKI (UGC Review) · Wkładka Orthomax w opakowaniu na drewnianym stole w domu',
    source: 'meta',
    groupCode: 'ZIMA',
    defaultForAngles: [33],
    imageHash: '99e6f88ef6085f702d2556c2c790afe4',
    aspectRatio: '4:5',
    note: 'Surowe zdjęcie z opinii klientki — domyślne dla #33 (8 godzin na nogach w pracy)',
  },
];

export function getDefaultImageForAngle(angleNumber: number): AntkiPlImageAsset {
  const matched = ANTKI_PL_IMAGE_LIBRARY.find(
    img => img.defaultForAngles?.includes(angleNumber),
  );
  if (matched) return matched;
  return ANTKI_PL_IMAGE_LIBRARY[0];
}

export const ORTHOMAX_PL_DEFAULT_URL = 'https://orthomax.pl/products/orthomax-stepmax';
export const PORADY_MAMY_GOSI_HEADLINE = 'Myślałam, że kupiłam córce wadliwe buty za 599 zł. Prawda okazała się dużo gorsza';
export const DOROSLI_DEFAULT_HEADLINE = 'Na moją lewą stopę było już za późno. Prawą uratowałam bez skalpela';

export const ANTKI_PL_STAGE_LABELS: Record<
  AntkiPlFunnelStage,
  { label: string; shortLabel: string; badge: string; awareness: string; sophistication: string; description: string }
> = {
  stage1_domowe_odkrycie: {
    label: 'Stage 1: Unaware (Sofistykacja 3) · Domowy Detektyw',
    shortLabel: 'Stage 1 · Unaware (Dom)',
    badge: 'STAGE 1 · SOFISTYKACJA 3',
    awareness: 'Stage 1: Unaware (Nieświadoma wady)',
    sophistication: 'Poziom 3 (Domowy dowód zbrodni na bucie/ciele)',
    description:
      'Matka NIE wie, że dziecko ma koślawość i nie chodzi po fizjoterapeutach. Zaczyna się od domowego szoku: buty Nike za 599 zł zdarte po 3 tyg., mit bólów wzrostowych, mokry ślad w łazience.',
  },
  stage2_efekt_domina: {
    label: 'Stage 2: Problem Aware (Sofistykacja 3) · Efekt Domina',
    shortLabel: 'Stage 2 · Domino (Objawy)',
    badge: 'STAGE 2 · SOFISTYKACJA 3',
    awareness: 'Stage 2: Problem Aware (Leczy zły objaw)',
    sophistication: 'Poziom 3 (Mechanizm łańcucha kompensacji od stóp)',
    description:
      'Matka widzi ból pleców (plecak 420 zł), karku, biodra na orliku albo kolana na schodach, ale leczy górę ciała zamiast fundamentu w zapadających się kostkach.',
  },
  stage2_szkola_wf: {
    label: 'Stage 2/3: Problem/Solution Aware (Sofistykacja 3) · Szkoła i WF',
    shortLabel: 'Stage 2/3 · Szkoła i WF',
    badge: 'STAGE 2/3 · SZKOŁA & WF',
    awareness: 'Stage 2/3: Problem Aware (Normalizowanie / Wstyd)',
    sophistication: 'Poziom 3/4 (Koniec ucieczki w zwolnienia z WF-u)',
    description:
      'Telefon od wuefistki, wybieranie ostatnim do drużyny, rezygnacja z zimowego obozu, chowanie obciachowych butów ortopedycznych za 450 zł w szafce.',
  },
  stage3_wypalone_matki: {
    label: 'Stage 3: Solution Aware (Sofistykacja 4) · Wojna o Ćwiczenia i 14h na Betonie',
    shortLabel: 'Stage 3 · Sofistykacja 4 (Wypalone)',
    badge: 'STAGE 3 · SOFISTYKACJA 4',
    awareness: 'Stage 3: Solution Aware (Próbowała ćwiczeń i wkładek)',
    sophistication: 'Poziom 4 (15 min ćwiczeń vs 14h na betonie i panelach)',
    description:
      'Matka wie o koślawości, ale przegrywa z codziennością: rzucona kasza do obiadu, brak wychodzenia na dwór jesienią/zimą (14h na szkolnym betonie i domowych panelach), twarde wkładki jak gips.',
  },
  ryciak_rip3_variations: {
    label: 'Stage 2/3: Ryciak Rip 3 · Nowe Wersje (Sofistykacja 3/4)',
    shortLabel: 'Winner · Ryciak Rip 3 (5 wersji)',
    badge: 'WINNER · RYCIAK RIP 3',
    awareness: 'Stage 2/3: Problem/Solution Aware (Gabinet / SOR)',
    sophistication: 'Poziom 3/4 (Test podniesienia łuku dłońmi + RTG 12°)',
    description:
      'Bezpośrednie iteracje największego winnera z konta Porady Mamy Gosi: test podniesienia łuku dłońmi, łańcuch ze strzałkami ↓, RTG 12° vs 5-7°, okno do 12 r.ż.',
  },
  zal_po_operacji: {
    label: 'Stage 4: High Stakes / Żal po operacji (Sofistykacja 4)',
    shortLabel: 'Stage 4 · Żal po operacji',
    badge: 'STAGE 4 · ŻAL PO OPERACJI',
    awareness: 'Stage 3/4: Solution/Mechanism Aware (Ostateczność)',
    sophistication: 'Poziom 4 (Wycięcie skutku skalpelem vs naprawa przyczyny)',
    description:
      'Brutalne historie po operacji (śruby w kolanach 14-latki, 8 200 zł, 6 tygodni o kulach, druga stopa/młodsze dziecko uratowane wkładkami).',
  },
  dorosli_jesien_zima: {
    label: 'Segment B (Zapasowy): Dorośli Jesień/Zima (Stage 2/3)',
    shortLabel: 'Dorośli (Zapasowy)',
    badge: 'DOROŚLI · ZAPAS',
    awareness: 'Stage 2/3: Dorośli (Haluksy / Ostroga / Botki)',
    sophistication: 'Poziom 3/4 (Rozlana stopa w zimowym bucie)',
    description:
      'Kobiety 40-65+: stopa rozlana po lecie nie mieści się w zimowych botkach, pierwszy krok o 6:00 rano jak gwóźdź w piętę, 8h pracy stojącej, 62-letnia mama Gosi.',
  },
};

export const ANTKI_PL_PRESET_ANGLES: AntkiPlPresetAngle[] = [
  // ==================== STAGE 1: UNAWARE · DOMOWY DETEKTYW (5) ====================
  {
    id: 'pl-01-zdarte-zimowe-buty',
    number: 1,
    code: '01_nike_599_zdarte_w_3_tygodnie',
    title: 'Buty Nike za 599 zł w promocji zdarte po 3 tygodniach („Wiem, co zaraz napiszecie w komentarzach. Że zwariowałam")',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Stage 1 · Unaware (Dom)',
    awarenessStage: 'Stage 1: Unaware (Obwinia „wadliwe buty" lub „bóle wzrostowe")',
    sophistication: 'Poziom 3 (Domowy dowód zbrodni na podeszwie za 599 zł)',
    narrator: 'Małgorzata (39 lat, Poznań)',
    protagonist: 'Zosia (10 lat)',
    hookIdea:
      'Wiem, co zaraz napiszecie w komentarzach. Że zwariowałam, kupując 10-letniej córce buty za 599 złotych (i to w promocji z 749 zł). Ale Zosia marzyła o tych nowych Nike od wiosny, a ja chciałam, żeby na jesień i zimę miała wreszcie porządne, twarde buty. Po 3 tygodniach wzięłam je wieczorem w przedpokoju do ręki, żeby zetrzeć błoto, odwróciłam podeszwę do światła i zamarłam.',
    sceneBeat:
      'Z góry wyglądały jeszcze jak nowe, ale od spodu wewnętrzna krawędź obu pięt w butach za 599 zł była już wyraźnie ścięta pod skosem, a sztywny zapiętek wygiął się do środka tak mocno, jakby Zosia chodziła w nich co najmniej od zeszłej zimy. Gosia jedzie wściekła do salonu złożyć reklamację z paragonem w ręku. Kierowniczka zmiany (spokojna kobieta po 50-tce, która, jak Gosia dowiaduje się chwilę później podczas rozmowy, wcześniej przez lata pracowała w sklepie ortopedycznym - NIE zna imienia Gosi!) bierze buta w dłonie, ściska zapiętek, patrzy na stojącą obok Zosię i mówi spokojnie: „Przyjmę pani ten zwrot, proszę się nie martwić. Ale niech pani spojrzy na kostki córki. Jej wykrzywia się cały wewnętrzny bok stopy do środka, a odległość między kostkami przy złączonych kolanach to już prawie 5 centymetrów. To nie podeszwa w tych butach jest wadliwa - to pięta pani córki ucieka pod kątem 12 stopni i ściera każdego buta od wewnętrznej strony". Obalenie mitu pediatry o „bólach wzrostowych".',
    failedSolutionsMath:
      'Markowe buty kupione w promocji 599 zł + wrześniowe trampki do szkoły (zmasakrowane w miesiąc) 180 zł + żel z arniką i magnezem na nocne bóle łydek 45 zł = 824 zł',
    discoveryBridge:
      'Po powrocie ze sklepu Gosia wrzuca zdjęcie startej podeszwy na grupę „Mamy z Poznania" i forum dla mam z pytaniem, co z tym zrobić, bo przecież nie zostawi nawet butów po starszej dla młodszej, skoro są tak zmasakrowane. W ciągu 2 godzin pod postem pojawia się ponad 60 komentarzy od mam, które przechodziły dokładnie to samo i wrzucają zdjęcia pomarańczowo-czarnych wkładek dynamicznych Orthomax StepMax.',
    defaultHeadline: 'Wydałam 599 zł na wymarzone buty córki. Po 3 tygodniach spojrzałam na podeszwę i zamarłam',
  },
  {
    id: 'pl-02-mit-bolow-wzrostowych',
    number: 2,
    code: '02_mit_bolow_wzrostowych',
    title: 'Nocny płacz, syrop Nurofen i strach przed białaczką („Lekarz mówił: nie leczymy wyników, to bóle wzrostowe")',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Stage 1 · Unaware (Dom)',
    awarenessStage: 'Stage 1: Unaware (Symptom-Dismissing)',
    sophistication: 'Poziom 3 (Obalenie gaslightingu pediatry z NFZ)',
    narrator: 'Małgorzata (38 lat, Wrocław)',
    protagonist: 'Kasia (8 lat)',
    hookIdea:
      'Przez 4 miesiące co parę tygodni przeżywałam w nocy ten sam koszmar: w środku nocy moja 8-letnia Kasia budziła się z płaczem, że rwą ją kolana i piszczele, a rano przed wyjściem do szkoły ból nagle znikał jak ręką odjął. Masowałam jej nóżki maścią z arniką i Amolem, przykładałam ciepły termofor z pestek wiśni, podawałam syrop Nurofen, a ze strachu przed białaczką robiłam prywatnie morfologię z rozmazem ręcznym, myśląc, że osiwieję. Pediatra w przychodni powtarzał tylko: „Nie leczymy wyników, tylko dziecko. To zwykłe bóle wzrostowe, taka jej uroda". W zeszły czwartek wieczorem, kiedy Kasia po całym dniu w szkole znów stała przed wanną i popłakiwała, że palą ją piszczele, nie wytrzymałam i poprosiłam naszą sąsiadkę z piętra - fizjoterapeutkę dziecięcą - żeby zaszła na chwilę i spojrzała na jej nogi.',
    sceneBeat:
      'Sąsiadka przychodzi na prośbę Gosi, wchodzi do łazienki, widzi Kasię stojącą boso na płytkach przed wanną (i jak chwilę wcześniej siedziała na dywaniku w literę W - kolana złączone, stopy wywinięte na zewnątrz jak u żaby). Kuca za Kasią, patrzy na jej pięty od tyłu i mówi naturalnie: „Gosiu, mogę ci coś pokazać?". Robi zdjęcie telefonem z poziomu podłogi i pokazuje odwrócone „V" uciekających pięt oraz spłaszczony wewnętrzny brzeg stopy. Tłumaczy, dlaczego ból pojawia się wieczorem i w nocy, a rano mija: kość nie boli od samego rośnięcia - boli mięsień piszczelowy i więzadła, które przez 14 godzin dziennie na szkolnym betonie i domowych panelach próbują utrzymać walącą się do środka kostkę.',
    failedSolutionsMath:
      'Syropy przeciwbólowe, smarowidła z apteki i termofor z pestek wiśni 140 zł + prywatna morfologia z rozmazem ręcznym, witamina D i CRP 195 zł + wizyta prywatna 200 zł = 535 zł',
    discoveryBridge:
      'Sąsiadka idzie na chwilę do swojego mieszkania i wraca z butem swojego 9-letniego syna, wyjmuje z niego pomarańczowo-czarne wkładki Orthomax StepMax i pokazuje Gosi pod kciukiem, jak pracuje dynamiczna sprężyna.',
    defaultHeadline: 'Przez 4 miesiące wierzyłam pediatrze, że to „bóle wzrostowe". Prawda wyszła na jaw w łazience',
  },
  {
    id: 'pl-03-test-mokrej-stopy',
    number: 3,
    code: '03_test_mokrej_stopy_w_lazience',
    title: 'Test mokrej stopy na ciemnych kafelkach po kąpieli (Pełny prostokąt zamiast łuku)',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Stage 1 · Unaware (Dom)',
    awarenessStage: 'Stage 1: Unaware',
    sophistication: 'Poziom 3 (Wizualny test 10 sekund w domu)',
    narrator: 'Małgorzata (40 lat, Kraków)',
    protagonist: 'Zosia (10 lat)',
    hookIdea:
      'Wyszłam z łazienki wieczorem zaraz po kąpieli mojej 10-letniej córki, spojrzałam na mokre ślady jej stóp na ciemnoszarych kafelkach i poczułam, jak robi mi się zimno.',
    sceneBeat:
      'Zamiast charakterystycznego wcięcia po wewnętrznej stronie stopy na kafelkach odbił się pełny, rozlany prostokąt jak stopa żelazka, a obok mokra kropka od wewnętrznej kostki, która niemal dotykała podłogi. Od przodu stopy wyglądały normalnie - dopiero ślad wody pokazał, że przy każdym z 7000 kroków dziennie Zosia uderza gołą kością śródstopia w twardą podłogę.',
    failedSolutionsMath:
      'Wkładki żelowe z drogerii 49 zł + sztywne wkładki ze sklepu medycznego 110 zł + konsultacja 220 zł = 379 zł',
    discoveryBridge:
      'Gosia robi zdjęcie mokrego śladu na kafelkach i wrzuca je na forum mam z Krakowa. Pod postem odzywa się matka 11-latka z identycznym zdjęciem sprzed pół roku i linkiem do dynamicznych wkładek Orthomax StepMax.',
    defaultHeadline: 'Spojrzałam na mokre ślady stóp córki po kąpieli. Ten 10-sekundowy test powinna zrobić każda mama',
  },
  {
    id: 'pl-04-zdjecie-z-wycieczki',
    number: 4,
    code: '04_zdjecie_z_wycieczki_szkolnej',
    title: 'Zdjęcie z październikowej wycieczki klasowej (Przybliżyłam dwoma palcami kolana córki)',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Stage 1 · Unaware (Dom)',
    awarenessStage: 'Stage 1: Unaware',
    sophistication: 'Poziom 3 (Szok wizualny na zdjęciu grupowym)',
    narrator: 'Małgorzata (38 lat, Gdańsk)',
    protagonist: 'Kasia (9 lat)',
    hookIdea:
      'Wychowawczyni wrzuciła wieczorem na dziennik elektroniczny zdjęcia z październikowej wycieczki klasowej. Powiększyłam dwoma palcami zdjęcie mojej 9-letniej Kasi stojącej w pierwszym rzędzie i aż usiadłam na krześle w kuchni.',
    sceneBeat:
      'Wszystkie dzieci stoją prosto, a kolana Kasi w obcisłych legginsach stykają się ze sobą jak litera X, między kostkami zieje 5-centymetrowa przerwa, stopy rozjeżdżają się na boki, a prawy bark wisi o 3 centymetry niżej pod ciężarem plecaka. Gdy patrzy się na własne dziecko codziennie w domu, mózg przyzwyczaja się do krzywizny - dopiero obiektyw aparatu pokazuje brutalną prawdę.',
    failedSolutionsMath:
      'Prywatny ortopeda 250 zł + RTG 90 zł + sztywne buty korekcyjne, których córka nie chciała założyć 340 zł = 680 zł',
    discoveryBridge:
      'Gosia pisze na Messengerze do mamy koleżanki z klasy Kasi, bo pamiętała, że jej syn w 2 klasie miał identyczne kolana w X, a na nowym zdjęciu stoi prosto. Koleżanka odpisuje po 5 minutach i wysyła zdjęcie wkładek Orthomax StepMax.',
    defaultHeadline: 'Powiększyłam zdjęcie córki z wycieczki klasowej. Dopiero wtedy zobaczyłam, co dzieje się z jej nogami',
  },
  {
    id: 'pl-05-potykanie-sie-o-wlasne-nogi',
    number: 5,
    code: '05_potykanie_sie_o_wlasne_nogi',
    title: 'Krzyczałam na córkę, że rozdarła 3 parę spodni i biega jakby miała buty o 3 numery za duże. W gabinecie spaliłam się ze wstydu.',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Stage 1 · Unaware (Dom)',
    awarenessStage: 'Stage 1: Unaware -> Wyrzuty sumienia',
    sophistication: 'Poziom 3 (Wiotkość stawowa i rotacja wewnętrzna piszczeli przy koślawości)',
    narrator: 'Małgorzata (37 lat, Katowice)',
    protagonist: 'Zosia (8 lat)',
    hookIdea:
      '„Zosia, czy ty naprawdę nie potrafisz patrzeć pod nogi?!" - krzyknęłam po południu przed szkołą, kiedy 3 raz w tym miesiącu przewróciła się na prostej drodze i rozdarła nowe spodnie na kolanie. W domu obijała się o meble, a na podwórku dziwnie biegała, jakby miała buty za duże o 3 numery. Do dziś ściska mnie w gardle na myśl, że darłam się na własne dziecko za coś, czemu nie było winne.',
    sceneBeat:
      'Fizjoterapeuta pokazuje Gosi, dlaczego dzieci z wiotkością stawów i koślawością potykają się o własne czubki butów po 7 godzinach w szkole: kiedy wewnętrzny brzeg stopy opada i nóżka krzywi się w kostce do środka, kość piętowa pociąga za sobą piszczel do rotacji wewnętrznej. Przy zmęczeniu czubki butów uciekają do środka i zahaczają o siebie.',
    failedSolutionsMath:
      '3 pary zniszczonych spodni i zdartych butów 390 zł + wizyta u fizjoterapeuty 180 zł + wkładki z apteki 75 zł = 645 zł',
    discoveryBridge:
      'Wieczorem w domu Gosia szuka na forum mam i grupie rodziców z Katowic opinii o wkładkach dla dziecka, które obija się o meble i krzywi kostki, i trafia na relacje mam stosujących wkładki Orthomax StepMax.',
    defaultHeadline: 'Krzyczałam na córkę, że ciągle potyka się na prostej drodze. U fizjoterapeuty zapadłam się pod ziemię',
  },

  // ==================== STAGE 2: PROBLEM AWARE · EFEKT DOMINA (5) ====================
  {
    id: 'pl-06-plecy-i-ciezki-plecak',
    number: 6,
    code: '06_plecy_i_ciezki_plecak',
    title: 'Kupiłam ergonomiczny plecak za 420 zł na ból pleców córki. A przyczyna siedziała w jej butach.',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Stage 2 · Domino (Objawy)',
    awarenessStage: 'Stage 2: Problem Aware (Ból pleców po szkole)',
    sophistication: 'Poziom 3 (Efekt Domina od stóp do łopatek)',
    narrator: 'Małgorzata (39 lat, Warszawa)',
    protagonist: 'Kasia (10 lat)',
    hookIdea:
      'Postawiłam szkolny plecak mojej 10-letniej córki na wadze kuchennej: 6,5 kilograma. Byłam pewna, że to dlatego Kasia codziennie po 16:00 kładzie się na dywanie w salonie i mówi, że pieką ją plecy między łopatkami. Wydałam 420 złotych na najdroższy ergonomiczny tornister z usztywnieniem. Nie pomogło nawet na 1 dzień.',
    sceneBeat:
      'W gabinecie fizjoterapeuta nawet nie patrzy na plecak. Tłumaczy, że ortopeda na NFZ ogląda zawsze tylko 1 narząd wpisany na skierowaniu, a nikt nie patrzy na postawę całościowo od podłogi. Każe Kasi zdjąć buty i skarpetki. Pokazuje test podniesienia łuku stopy: gdy stopy leżą płasko, miednica ucieka do przodu, a kręgosłup piersiowy wygina się w łuk. Gdy podnosi łuki dłońmi - plecy i łopatki natychmiast się prostują.',
    failedSolutionsMath:
      'Ergonomiczny plecak 420 zł + maść przeciwzapalna 45 zł + 2 wizyty u fizjoterapeuty 360 zł = 825 zł',
    discoveryBridge:
      'Na grupie FB „Wady postawy u dzieci - wsparcie rodziców" Gosia opisuje test z gabinetu. Mamy w komentarzach jednogłośnie polecają wkładki Orthomax StepMax jako jedyne, które trzymają ten łuk przez cały dzień w szkole.',
    defaultHeadline: 'Wydałam 420 zł na ergonomiczny tornister, a plecy córki bolały dalej. Fizjoterapeuta kazał jej zdjąć buty',
  },
  {
    id: 'pl-07-bol-glowy-i-karku',
    number: 7,
    code: '07_bol_glowy_i_karku_po_szkole',
    title: 'Badaliśmy wzrok i zatoki, bo córka wracała ze szkoły z bólem karku. Okulista wziął 250 zł i rozłożył ręce.',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Stage 2 · Domino (Objawy)',
    awarenessStage: 'Stage 2: Problem Aware (Kark i głowa)',
    sophistication: 'Poziom 3 (Łańcuch kompensacji od kostki do karku)',
    narrator: 'Małgorzata (41 lat, Łódź)',
    protagonist: 'Zosia (10 lat)',
    hookIdea:
      'Przez 2 miesiące ciągaliśmy naszą 10-letnią Zosię po okulistach i laryngologach, bo 3 razy w tygodniu wracała po 15:00 ze szkoły z napięciowym bólem karku i czoła. Okulista wziął 250 złotych i powiedział: „Wzrok jak u sokoła, proszę szukać dalej".',
    sceneBeat:
      'Fizjoterapeuta stawia Zosię przed lustrem z kratką. Prawa kostka zapada się o 13 stopni do środka, prawe kolano ucieka w X, prawa strona miednicy opada, a lewy bark i mięsień karku są w permanentnym skurczu przez 8 godzin w szkolnej ławce, żeby głowa trzymała poziom oczu.',
    failedSolutionsMath:
      'Okulista 250 zł + laryngolog 200 zł + poduszka ortopedyczna do spania 189 zł + fizjoterapia 200 zł = 839 zł',
    discoveryBridge:
      'Koleżanka z pracy Gosi, której syn miał identyczną asymetrię barków i napięciowe bóle karku, pokazuje jej na telefonie stronę orthomax.pl i wkładki Orthomax StepMax.',
    defaultHeadline: 'Szukaliśmy przyczyny bólu karku u okulisty i laryngologa. Prawdziwy winowajca był w butach córki',
  },
  {
    id: 'pl-08-biodro-po-pilce',
    number: 8,
    code: '08_biodro_po_treningu_pilki',
    title: 'Syn zszedł z orlika w połowie treningu i gryzł rękaw bluzy z bólu biodra i pięty',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Stage 2 · Domino (Objawy)',
    awarenessStage: 'Stage 2: Problem Aware (Sport dziecięcy)',
    sophistication: 'Poziom 3 (Rotacja biodra od uciekającej pięty)',
    narrator: 'Małgorzata (38 lat, Gdańsk)',
    protagonist: 'Kuba (9 lat)',
    hookIdea:
      'Mój 9-letni syn kocha piłkę nożną bardziej niż cokolwiek na świecie. Kiedy w zeszły wtorek o 18:00 zszedł z orlika w połowie treningu, usiadł na ławce i zobaczyłam, że gryzie rękaw bluzy, żeby koledzy nie widzieli, jak płacze z bólu biodra i pięty, serce pękło mi na pół.',
    sceneBeat:
      'Trener mówił o „zakwasach albo naciągniętej pachwinie". Ortopeda sportowy pokazuje podeszwę butów Kuby oraz kąt koślawości pięty: przy każdym biegu po twardym boisku i szkolnym korytarzu kość piętowa uderza pod kątem, skręcając kolano w X (a jak mówią na forach: u chłopaka nie ma nic gorszego niż nogi w X) i przeciążając zamek biodrowy.',
    failedSolutionsMath:
      'Maści chłodzące i opaski 135 zł + prywatne USG biodra 220 zł + wizyta u ortopedy 250 zł + żelowe podpiętniki z apteki 65 zł = 670 zł',
    discoveryBridge:
      'Na grupie rodziców młodych piłkarzy na Facebooku ojciec innego chłopca z rocznika 2017 wrzuca zdjęcie pomarańczowo-czarnych wkładek Orthomax StepMax, które wkładają do korków, halówek i butów szkolnych.',
    defaultHeadline: 'Mój 9-letni syn chciał rzucić piłkę przez ból biodra i pięty. Ortopeda nawet nie dotknął jego biodra',
  },
  {
    id: 'pl-09-kolano-na-schodach',
    number: 9,
    code: '09_pachwina_i_kolano_na_schodach',
    title: 'Córka usiadła na schodach na 2 piętrze i złapała się za kolana (Dlaczego opaska z apteki tylko pogarsza sprawę)',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Stage 2 · Domino (Objawy)',
    awarenessStage: 'Stage 2: Problem Aware (Ból kolan u dziecka)',
    sophistication: 'Poziom 3 (Skręcanie piszczeli jak wykręcanego ręcznika)',
    narrator: 'Małgorzata (39 lat, Szczecin)',
    protagonist: 'Kasia (10 lat)',
    hookIdea:
      'Mieszkamy na 3 piętrze bez windy. W zeszły czwartek po 16:00 wracałyśmy ze szkoły i moja 10-letnia Kasia usiadła na schodach na 2 piętrze, złapała się za kolana i powiedziała cicho: „Mamo, poczekaj chwilę, bo znowu kłuje mnie pod rzepką".',
    sceneBeat:
      'Matka kupiła opaski elastyczne na kolana w aptece. Ortopeda każe je natychmiast zdjąć i pokazuje, że rzepka Kasi trze o chrząstkę tylko dlatego, że pięta na dole zapada się do środka o 12 stopni i skręca piszczel jak wykręcany ręcznik. Opaska dociska rzepkę jeszcze mocniej do krzywego toru.',
    failedSolutionsMath:
      '2 opaski na kolana 110 zł + kolagen i witaminy 95 zł + prywatny ortopeda z USG 320 zł = 525 zł',
    discoveryBridge:
      'Wieczorem Gosia wpisuje na grupie facebookowej mam ze Szczecina „kłucie pod rzepką koślawość pięty" i dostaje od 3 różnych mam link do wkładek Orthomax StepMax.',
    defaultHeadline: 'Założyłam córce opaskę z apteki na bolące kolano. Ortopeda kazał ją zdjąć w tej samej sekundzie',
  },
  {
    id: 'pl-10-krzywa-spodniczka-apel',
    number: 10,
    code: '10_krzywa_spodniczka_na_apelu',
    title: 'Galowa spódniczka na szkolnym apelu 5 razy przekręcała się na bok (Asymetria miednicy od stóp)',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Stage 2 · Domino (Objawy)',
    awarenessStage: 'Stage 2: Problem Aware (Krzywa postawa)',
    sophistication: 'Poziom 3 (Szafa z jedną krótszą nóżką)',
    narrator: 'Małgorzata (38 lat, Lublin)',
    protagonist: 'Zosia (9 lat)',
    hookIdea:
      'Podczas październikowego apelu w szkole poprawiałam galową spódniczkę mojej 9-letniej córki chyba 5 razy, bo gumka w pasie cały czas zjeżdżała jej na prawe biodro. Myślałam, że krawcowa krzywo wszyła zamek. 3 dni później na bilansie pielęgniarka szkolna kazała Zosi zrobić skłon do przodu.',
    sceneBeat:
      'Jedna łopatka wystaje wyżej, jedno biodro ucieka. U fizjoterapeuty okazuje się, że kręgosłup sam w sobie jest zdrowy, ale prawa stopa zapada się o 6 milimetrów niżej niż lewa, przez co całe ciało stoi jak szafa z jedną krótszą nóżką.',
    failedSolutionsMath:
      'Pajączek na plecy (który piszczał i doprowadzał dziecko do płaczu) 129 zł + fizjoterapeuta 180 zł + konsultacja ortopedyczna 240 zł = 549 zł',
    discoveryBridge:
      'Mama na forum o skoliozie funkcjonalnej u dzieci opisuje, jak wyrównali poziom miednicy bez „pajączka" na plecach dzięki wkładkom Orthomax StepMax.',
    defaultHeadline: 'Myślałam, że krawcowa krzywo uszyła spódniczkę córki. Na bilansie w szkole przeżyłam szok',
  },

  // ==================== STAGE 2/3: SZKOŁA, WF, WSTYD SPOŁECZNY (5) ====================
  {
    id: 'pl-11-telefon-od-wuefistki',
    number: 11,
    code: '11_telefon_od_wuefistki',
    title: 'Telefon od wuefistki ze szkoły: „Pani Gosiu, Zosia nie kombinuje. Proszę przyjść pod salę o 11:30"',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Stage 2/3 · Szkoła i WF',
    awarenessStage: 'Stage 2: Problem Aware',
    sophistication: 'Poziom 3 (Dowód w ruchu na sali gimnastycznej)',
    narrator: 'Małgorzata (39 lat, Bydgoszcz)',
    protagonist: 'Zosia (9 lat)',
    hookIdea:
      'Myślałam, że moja 9-letnia córka kombinuje, żeby nie ćwiczyć na WF-ie, bo co wtorek rano bolał ją brzuch albo nogi. Aż w zeszłym tygodniu zadzwoniła do mnie jej nauczycielka WF-u i poprosiła, żebym przyszła pod salę gimnastyczną o 11:30, 15 minut przed końcem lekcji.',
    sceneBeat:
      'Wuefistka (była lekkoatletka) uchyla drzwi sali i pokazuje Zosię biegnącą po twardym parkiecie: przy każdym odbiciu kostki Zosi dosłownie kładą się do środka, a kolana uderzają o siebie. Po 2 okrążeniach Zosia ma łzy w oczach z piekącego bólu rozcięgna.',
    failedSolutionsMath:
      '2 pary markowych butów na WF 360 zł + żelowe wkładki z marketu 45 zł + prywatna wizyta u ortopedy 230 zł = 635 zł',
    discoveryBridge:
      'Wuefistka pokazuje Gosi grupę rodziców dzieci ze szkolnej sekcji biegowej, gdzie rodzice zamawiają zbiorczo pakiety 1+1 dynamicznych wkładek Orthomax StepMax.',
    defaultHeadline: 'Myślałam, że córka symuluje, żeby nie ćwiczyć na WF-ie. Telefon od wuefistki wbił mnie w ziemię',
  },
  {
    id: 'pl-12-wybierany-ostatni-do-druzyny',
    number: 12,
    code: '12_wybierany_ostatni_do_druzyny',
    title: '„Mamo, chłopaki mówią, że biegam jak kaczuszka i zawsze wybierają mnie ostatniego"',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Stage 2/3 · Szkoła i WF',
    awarenessStage: 'Stage 2: Problem Aware (Odzyskane dzieciństwo)',
    sophistication: 'Poziom 3 (Utrata sprężyny wybicia przy płaskiej stopie)',
    narrator: 'Małgorzata (38 lat, Rzeszów)',
    protagonist: 'Tomek (9 lat)',
    hookIdea:
      'Kiedy mój 9-letni syn zamknął się po 16:00 w pokoju i powiedział przez drzwi: „Mamo, załatw mi zwolnienie z WF-u do końca roku, bo chłopaki śmieją się, że biegam jak kaczuszka i nikt nie chce mnie w drużynie", poczułam, jakby ktoś uderzył mnie w brzuch.',
    sceneBeat:
      'Wizyta u ortopedy: lekarz pokazuje, skąd bierze się „kaczy chód" i dziwny bieg, jakby dziecko miało buty za duże o 3 numery. Gdy łuk podłużny leży na płasko, stopa traci naturalną dźwignię wybicia i dziecko zamiast odbijać się jak ze sprężyny, człapie całą płaską podeszwą po podłodze.',
    failedSolutionsMath:
      'Wizyta u ortopedy 250 zł + sztywne wkładki ze sklepu ortopedycznego (w których syn nie mógł biegać) 160 zł + zajęcia korekcyjne 240 zł = 650 zł',
    discoveryBridge:
      'Komentarz innej mamy na grupie rodziców z Rzeszowa, opisujący jak wkładki Orthomax StepMax działające jak sprężyna przywróciły jej synowi normalne wybicie na WF-ie.',
    defaultHeadline: '„Mamo, załatw mi zwolnienie z WF-u, bo wybierają mnie ostatniego". Te słowa syna złamały mi serce',
  },
  {
    id: 'pl-13-odmowa-obozu-zimowego',
    number: 13,
    code: '13_odmowa_zimowego_obozu_narty',
    title: 'Wpłaciłam 900 zł zaliczki na zimowy wyjazd z klasą. Wieczorem córka poprosiła, żebym ją wypisała.',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Stage 2/3 · Szkoła i WF',
    awarenessStage: 'Stage 2/3: Kryzys w domu',
    sophistication: 'Poziom 3 (Adaptacja winnera „Obóz" na sezon jesień/zima)',
    narrator: 'Małgorzata (40 lat, Katowice)',
    protagonist: 'Zosia (10 lat)',
    hookIdea:
      'Wpłaciłam 900 złotych zaliczki na zimowy wyjazd w góry z klasą mojej 10-letniej Zosi. Cały wrzesień odliczała dni, bo miały jechać jej 2 najlepsze przyjaciółki. W zeszłą środę o 20:00 weszłam do jej pokoju i zobaczyłam, że siedzi nad zeszytem z czerwonymi oczami: „Mamo, wypisz mnie. Ja nie dam rady chodzić z nimi po górach, mnie po 1 godzinie zawsze tak strasznie bolą nogi".',
    sceneBeat:
      'Słowo „zawsze" uderza matkę jak obuchem. Okazuje się, że Zosia od 6 miesięcy ukrywała ból stóp i kolan na spacerach, bo nie chciała robić kłopotu. Wizyta u dr. Ryciaka i odkrycie 12-stopniowej koślawości oraz zamykającego się okna wzrostowego.',
    failedSolutionsMath:
      'Maści i opaski 90 zł + wkładki z apteki 89 zł + wizyta u ortopedy z RTG 310 zł + buty trekkingowe 320 zł = 809 zł',
    discoveryBridge:
      'Nocne szukanie ratunku na forach dla mam przed przepadnięciem zaliczki i trafienie na setki opinii o wkładkach Orthomax StepMax w pakiecie 1+1.',
    defaultHeadline: 'Wpłaciłam 900 zł zaliczki na wyjazd klasowy. Wieczorem córka powiedziała zdanie, po którym zamarłam',
  },
  {
    id: 'pl-14-wstyd-w-szatni-buty',
    number: 14,
    code: '14_wstyd_w_szatni_ortopedyczne_buty',
    title: 'Kupiłam córce sztywne buty ortopedyczne z obcasem Thomasa za 450 zł. Chowała je w szafce i chodziła po szkole w skarpetkach.',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Stage 2/3 · Szkoła i WF',
    awarenessStage: 'Stage 3: Solution Aware (Obiekcja stygmatyzacji D5)',
    sophistication: 'Poziom 4 (Niewidzialna korekcja w zwykłych butach vs obciachowe trzewiki z obcasem Thomasa)',
    narrator: 'Małgorzata (37 lat, Toruń)',
    protagonist: 'Kasia (9 lat)',
    hookIdea:
      'Wydałam 450 złotych na wysokie, sztywne buty ortopedyczne z obcasem Thomasa i podklejanym klinem ze sklepu medycznego, bo ortopeda z przychodni postraszył mnie skoliozą. Po 2 tygodniach wychowawczyni powiedziała mi na zebraniu coś, od czego zrobiło mi się gorąco: Kasia po wejściu do szatni chowała te buty za kurtkami i przez 7 godzin chodziła po zimnym szkolnym korytarzu w samych skarpetkach.',
    sceneBeat:
      'Dziewczynki z klasy śmiały się z ciężkich trzewików (jak to mamy piszą na forach: Aurelka, Memo, Danielki - wysokie sztywne „krajkary", w których dziecko chodzi jak robot). Ponadto młody fizjoterapeuta tłumaczy Gosi, że wysoki, sztywny but za kostkę blokuje staw skokowy jak gips narciarski, a aparat ruchu najlepiej działa będąc w ruchu!',
    failedSolutionsMath:
      'Buty ortopedyczne z obcasem Thomasa 450 zł + pierwsza wizyta 200 zł + druga konsultacja fizjoterapeutyczna 180 zł = 830 zł',
    discoveryBridge:
      'Na grupie facebookowej mam z Torunia inna mama pokazuje, że wyrzuciła sztywne trzewiki i włożyła córce do zwykłych, modnych sneakersów dynamiczne wkładki Orthomax StepMax, których nikt w szatni nie widzi i które mieszczą się w każdym bucie.',
    defaultHeadline: 'Wydałam 450 zł na buty ortopedyczne dla córki. Wychowawczyni powiedziała mi, co Kasia robi z nimi w szatni',
  },
  {
    id: 'pl-15-zwolnienie-z-wf-u-jesien',
    number: 15,
    code: '15_zwolnienie_z_wf_u_pediatry',
    title: 'Poszłam tylko przedłużyć zwolnienie z WF-u na zimę. Lekarz spojrzał na kolana córki i odmówił podpisu.',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Stage 2/3 · Szkoła i WF',
    awarenessStage: 'Stage 2/3: Ewolucja Winnera #1 na jesień/zimę',
    sophistication: 'Poziom 3 (Uderzenie w „Normalizowanie" przez matkę)',
    narrator: 'Małgorzata (39 lat, Gdańsk)',
    protagonist: 'Zosia (9 lat)',
    hookIdea:
      'Poszłam o 17:00 do przychodni tylko po to, żeby przedłużyć 9-letniej Zosi zwolnienie z WF-u na semestr zimowy. Myślałam, że jestem dobrą mamą, która chroni dziecko przed bólem kolan. Zamiast papierka do szkoły wyszłam z wydrukiem rentgena i zdaniem lekarza, które dźwięczało mi w uszach przez całą drogę do auta.',
    sceneBeat:
      'Młody lekarz zastępujący pediatrę nie podpisuje świstka w ciemno. Każe Zosi podwinąć nogawki. Pokazuje, że sadzanie 9-latki na ławce, podczas gdy w kościach trwa skok wzrostowy, a stopy robią 7000 krzywych kroków dziennie, to prosta droga na stół operacyjny w wieku 13 lat.',
    failedSolutionsMath:
      'Prywatne wizyty i badania 450 zł + maści i opaski 120 zł + wkładki z apteki 89 zł = 659 zł',
    discoveryBridge:
      'Tego samego wieczoru Gosia czyta wątek na forum ortopedycznym dla rodziców i widzi powtarzające się dziesiątki razy zdjęcia wkładek Orthomax StepMax.',
    defaultHeadline: 'Poszłam tylko po zwolnienie z WF-u dla córki. Lekarz spojrzał na jej nogi i powiedział zdanie, które mną wstrząsnęło',
  },

  // ==================== STAGE 3: SOLUTION AWARE · SOFISTYKACJA 4 · WYPALONE MATKI (5) ====================
  {
    id: 'pl-16-wojna-o-dywan-19-30',
    number: 16,
    code: '16_wojna_o_kasze_i_dywan_19_30',
    title: '„Nienawidzę Cię, mamo!" - syn miał nałożyć kaszę do obiadu, a rzucił woreczkiem o ścianę (Wojna o ćwiczenia stóp)',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Stage 3 · Sofistykacja 4 (Wypalone)',
    awarenessStage: 'Stage 3: Solution Aware & Frustrated (Wie o koślawości, ma dość ćwiczeń)',
    sophistication: 'Poziom 4 (15 minut ćwiczeń na dywanie przegrywa z 14 godzinami na betonie i panelach)',
    narrator: 'Małgorzata (38 lat, Warszawa)',
    protagonist: 'Kuba (8 lat)',
    hookIdea:
      '„Nienawidzę Cię, mamo!" - krzyknął mój 8-letni syn, rzucił woreczkiem z kaszą o ścianę w kuchni i zatrzasnął drzwi do swojego pokoju. Miał tylko wyjąć kaszę z szafki do obiadu po tym, jak wróciliśmy do domu po 17:00. Ale kiedy zobaczył ten woreczek, przypomniało mu się, że o 19:30 znowu każę mu przez 20 minut turlać go bosą stopą po dywanie, chodzić jak pingwinek na zewnętrznych krawędziach stóp i zbierać palcami chusteczki z podłogi. Kiedy zamknął drzwi, usiadłam sama przy stole w kuchni i po prostu się rozpłakałam.',
    sceneBeat:
      'Współczucie + zimny prysznic: 3 dni później na kontroli fizjoterapeuta mówi Gosi brutalną prawdę. Nawet gdyby Kuba nie był uparty jak osiołek i grzecznie bawił się w pingwinka, turlał woreczek z kaszą oraz zwijał ręcznik palcami przez 15 minut dziennie (100 powtórzeń), to teraz w październiku i zimą dzieci nie biegają już po trawie ani piasku. Kuba wstaje rano i przez 14 godzin dziennie robi 7000 kroków po twardym jak skała szkolnym betonie i domowych panelach. Przy każdym z tych 7000 kroków kostka wali się do środka pod kątem 12 stopni. 14 godzin na betonie zawsze zmiażdży 15 minut na dywanie.',
    failedSolutionsMath:
      'Zestaw do ćwiczeń w domu (mata z kolcami, dysk sensoryczny, woreczki, taśmy) 260 zł + 4 wizyty kontrolne u fizjoterapeuty 720 zł = 980 zł',
    discoveryBridge:
      'Tego samego wieczoru o 22:00 Gosia opisuje swoją bezsilność na forum dla mam i grupie „Mamy dzieci z koślawością i płaskostopiem" na Facebooku. Jedna z mam odpisuje jej: „Dziewczyno, wyrzuć tę kaszę. My przeszliśmy to samo, dopóki koleżanka z grupy nie pokazała mi dynamicznych wkładek Orthomax StepMax".',
    defaultHeadline: 'Mój 8-letni syn miał nałożyć kaszę do obiadu, a rzucił nią o ścianę. Prawda o domowych ćwiczeniach stóp',
  },
  {
    id: 'pl-17-worek-ze-szkolnymi-kapciami',
    number: 17,
    code: '17_14_godzin_na_szkolnym_betonie_i_panelach',
    title: 'Zimą dzieci nie wychodzą już na dwór. Zobaczyłam, co 14 godzin dziennie na szkolnym betonie i domowych panelach robi ze stopami córki.',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Stage 3 · Sofistykacja 4 (Wypalone)',
    awarenessStage: 'Stage 3: Solution Aware (Rozumie problem, ale nie widzi ekspozycji 14h)',
    sophistication: 'Poziom 4 (Dlaczego w październiku i zimą wada przyspiesza 2x szybciej)',
    narrator: 'Małgorzata (39 lat, Poznań)',
    protagonist: 'Zosia (9 lat)',
    hookIdea:
      'W zeszły piątek po 17:00 podczas wywiadówki zeszłam do szkolnej szatni, żeby zabrać do domu buty zmieniane mojej 9-letniej córki. Kiedy wzięłam je z półki do ręki, przez dłuższą chwilę patrzyłam na nie w milczeniu: materiał od wewnętrznej strony kostki był wytarty na wylot, a cienka biała podeszwa ścięta pod skosem jak nożem.',
    sceneBeat:
      'Olśnienie, o którym nie myśli 95% rodziców jesienią i zimą: latem dziecko jeszcze czasem pobiega po trawie czy piasku. Od października do kwietnia dzieci nie wychodzą już prawie na dwór! Spędzają 8 godzin na betonowej posadzce w szkole w płaskich butach na zmianę, a potem wracają o 16:30 do domu i kolejne 6 godzin chodzą po twardych panelach i kafelkach. To pełne 14 godzin dziennie na betonie i desce, które wgniatają dziecięcy łuk stopy w podłogę.',
    failedSolutionsMath:
      '3 pary butów na zmianę od września 240 zł + buty zimowe 320 zł + prywatna konsultacja 200 zł = 760 zł',
    discoveryBridge:
      'Podczas rozmowy pod szatnią mama chłopca z równoległej klasy pokazuje Gosi na telefonie post z grupy rodziców o pakiecie 1+1 dynamicznych wkładek Orthomax StepMax (jedna para do butów szkolnych, druga do zimowych/domowych).',
    defaultHeadline: 'Od października nasze dzieci spędzają 14 godzin dziennie na betonie i panelach. Spojrzałam na buty córki w szatni',
  },
  {
    id: 'pl-18-mit-gipsu-sztywne-wkladki',
    number: 18,
    code: '18_mit_gipsu_sztywne_wkladki_nfz',
    title: 'Wydałam 380 zł na twarde wkładki na zamówienie (które za pół roku trzeba wyrzucić, bo stopa rośnie!). Fizjoterapeuta powiedział: „Założyła pani dziecku gips na mięśnie"',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Stage 3 · Sofistykacja 4 (Wypalone)',
    awarenessStage: 'Stage 3: Solution Aware (Obiekcja D8: „Wkładki za 380 zł na pół roku vs rozleniwianie mięśni")',
    sophistication: 'Poziom 4 (Stare sztywne skorupy za 300-400 zł co pół roku vs Dynamiczna sprężyna StepMax 50 zł/para)',
    narrator: 'Małgorzata (40 lat, Gdańsk)',
    protagonist: 'Kasia (10 lat)',
    hookIdea:
      'Byłam u 2 ortopedów i usłyszałam 2 sprzeczne diagnozy: jeden kazał wyrabiać wkładki na wymiar za 380 złotych, a drugi powiedział, żeby absolutnie nie zakładać wkładek, bo rozleniwią mięśnie. Posłuchałam pierwszego. Po 4 dniach Kasia wróciła ze szkoły o 16:00 z krwawymi pęcherzami, wkładka była tak gruba, że nie wchodziła do żadnych jesiennych butów, a kiedy pomyślałam, że dziecku rośnie stopa i za pół roku będę musiała wyrzucić te 380 złotych do kosza i kupić nowe za 4 stówy, chciało mi się wyć. Wtedy młody fizjoterapeuta wziął tę twardą deskę do ręki, postukał nią o biurko i powiedział: „Proszę nie dać się robić w balona".',
    sceneBeat:
      'Rozbicie największego mitu z polskich forów: dlaczego połowa lekarzy mówi, że „wkładki rozleniwiają stopę"? Bo mają na myśli sztywne, plastikowe skorupy starego typu, które unieruchamiają kostkę jak szyna gipsowa! A aparat ruchu najlepiej działa będąc w ruchu. Stopa dziecka potrzebuje wkładki DYNAMICZNEJ, która pracuje w każdej fazie chodu: wkładki Orthomax StepMax są zrobione ze sprężystej pianki o zmiennej gęstości, mają korytko trzymające piętę w pionie, ale uginają się jak sprężyna i zmuszają mięśnie do pracy. Co więcej, w pakiecie 1+1 wychodzą po 50 zł za parę i mają linie do docięcia nożyczkami, więc rosnąca stopa dziecka nie rujnuje domowego budżetu co pół roku.',
    failedSolutionsMath:
      'Twarde wkładki na zamówienie (na pół roku!) 380 zł + komputerowe badanie stóp w punkcie 120 zł + buty o rozmiar większe, żeby wkładka weszła 290 zł + wizyta u fizjoterapeuty 190 zł = 980 zł',
    discoveryBridge:
      'Na forum Gazeta.pl (emama) i grupie FB rodziców z Trójmiasta Gosia czyta wątek mam zafascynowanych wkładkami dynamicznymi i zamawia pakiet 1+1 wkładek Orthomax StepMax.',
    defaultHeadline: 'Zapłaciłam 380 zł za twarde wkładki na zamówienie. Fizjoterapeuta postukał nimi o biurko i kazał wyrzucić',
  },
  {
    id: 'pl-19-gimnastyka-korekcyjna-fikcja',
    number: 19,
    code: '19_gimnastyka_korekcyjna_w_szkole_fikcja',
    title: 'Uspokajałam sumienie tym, że zapisałam córkę na szkolną korektywę. Na kontroli w październiku przeżyłam lodowaty prysznic.',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Stage 3 · Sofistykacja 4 (Wypalone)',
    awarenessStage: 'Stage 3: Solution Aware (Fałszywe poczucie bezpieczeństwa)',
    sophistication: 'Poziom 4 (30 minut w grupie 20 dzieci raz w tygodniu vs 200 000 kroków miesięcznie)',
    narrator: 'Małgorzata (38 lat, Wrocław)',
    protagonist: 'Zosia (9 lat)',
    hookIdea:
      'Przez cały zeszły rok szkolny miałam czyste sumienie, bo zapisałam moją 9-letnią Zosię na gimnastykę korekcyjną w szkole. Kiedy w październiku poszłyśmy na kontrolę do ortopedy i zobaczyłam, że kąt koślawości jej kolan powiększył się z 8 do 12 stopni, zapytałam w szoku: „Jak to możliwe, przecież chodzi na korektywę?!".',
    sceneBeat:
      'Ortopeda liczy na kartce: 30 minut raz w tygodniu w grupie 20 dzieci, gdzie dziecko realnie ćwiczy przez 6 minut, to 0,1% tygodnia. Przez pozostałe 99,9% czasu Zosia robi 50 000 kroków tygodniowo w płaskich butach po szkolnym betonie i panelach, miażdżąc łuk stopy.',
    failedSolutionsMath:
      'Dodatkowe zajęcia korekcyjne 480 zł + wizyty u ortopedy z RTG 340 zł + zwykłe wkładki ze sklepu 79 zł = 899 zł',
    discoveryBridge:
      'Wieczorem w domu Gosia znajduje na forum dla mam wpis matki z Wrocławia, której córka zeszła z 12 do 8 stopni dzięki włożeniu do butów wkładek Orthomax StepMax.',
    defaultHeadline: 'Myślałam, że szkolna gimnastyka korekcyjna wystarczy. Na październikowej kontroli u ortopedy zaniemówiłam',
  },
  {
    id: 'pl-20-okno-czasowe-12-lat',
    number: 20,
    code: '20_okno_czasowe_12_lat_starsza_siostra',
    title: 'Zobaczyłam 14-letnią córkę szwagierki w sztywnych ortezach. Tego samego wieczoru o 20:00 postawiłam moją 9-letnią Kasię boso na dywanie.',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Stage 3 · Sofistykacja 4 (Wypalone)',
    awarenessStage: 'Stage 3: Solution Aware (Strach przed zamknięciem okna 12 lat)',
    sophistication: 'Poziom 4 (Okno plastyczności chrząstek do 12-13 roku życia)',
    narrator: 'Małgorzata (39 lat, Kraków)',
    protagonist: 'Kasia (9 lat)',
    hookIdea:
      'W zeszłą niedzielę o 15:00 na rodzinnym obiedzie moja szwagierka rozpłakała się w kuchni. Jej 14-letnia córka dostała właśnie kwalifikację do zabiegu operacyjnego kolan i zakaz jakiegokolwiek sportu, bo „okno wzrostowe już się zamknęło, a kości stwardniały w złej osi". 4 lata wcześniej mówili im w przychodni dokładnie to samo, co mnie: „Proszę obserwować, wyrośnie z tego".',
    sceneBeat:
      'Po powrocie do domu o 20:00 Gosia stawia 9-letnią Kasię boso na podłodze i robi test podniesienia łuku stopy. Widzi ten sam początek uciekających kostek i kolan w X. Zostały maksymalnie 2-3 lata miękkich chrząstek, kiedy można odwrócić wadę bez skalpela.',
    failedSolutionsMath:
      'Wcześniejsze wizyty i półśrodki z apteki u Kasi: 250 zł + 160 zł + 80 zł = 490 zł (podczas gdy szwagierkę operacja i rehabilitacja kosztują już ponad 6000 zł)',
    discoveryBridge:
      'Szwagierka wysyła Gosi link do grupy rodziców dzieci po zabiegach ortopedycznych, gdzie matki ostrzegają młodsze roczniki i polecają wkładki Orthomax StepMax, póki okno wzrostowe jest otwarte.',
    defaultHeadline: 'Córka szwagierki ma 14 lat i czeka na operację kolan. Nam zostały 2 lata, zanim okno wzrostowe zamknie się na zawsze',
  },

  // ==================== STAGE 2/3: RYCIAK RIP 3 — NOWE WERSJE (5) ====================
  {
    id: 'pl-21-ryciak-rip3-ramie-v2',
    number: 21,
    code: '21_ryciak_rip3_ramie_jesien',
    title: '[RYCIAK RIP 3 · V1] Poszłam z córką do fizjoterapeuty przez ból prawego ramienia. Kazał jej zdjąć buty i pokazał 10-sekundowy test.',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Winner · Ryciak Rip 3',
    awarenessStage: 'Stage 2/3: Problem/Solution Aware (Winner Fizjo / dr Ryciak)',
    sophistication: 'Poziom 3/4 (Pełny szkielet z Menedżera Reklam + organiczny reveal z grupy mam)',
    narrator: 'Małgorzata (38 lat, Gdańsk)',
    protagonist: 'Kasia (10 lat)',
    hookIdea:
      'Poszłam z moją 10-letnią córką do fizjoterapeuty, bo od 3 miesięcy po powrocie ze szkoły o 16:00 skarżyła się na piekący ból prawego ramienia. Myślałam, że to od noszenia ciężkiego plecaka na jednym barku. Fizjoterapeuta nawet nie dotknął jej ramienia - kazał Kasi zdjąć buty, przejść boso przez gabinet i wypowiedział zdanie, które mną wstrząsnęło.',
    sceneBeat:
      'Pełny szkielet najlepszej kreacji z konta: fizjoterapeuta kuca za Kasią, podnosi łuki stóp dłońmi -> kolana się rozchodzą, prawe ramię opada do poziomu lewego. Puszcza -> kostka zapada się, kolana schodzą w X, ramię ucieka w górę. Następnie wizyta u dr. Ryciaka: łańcuch ze strzałkami ↓, RTG 12 stopni vs norma 5-7 stopni, 7000 kroków dziennie = 200 000 miesięcznie, okno do 12-13 r.ż., spadek z 12 do 8 stopni w 3 miesiące. Zaktualizowany pod pakiet 1+1 za 99,99 zł (50 zł za parę) i liczbę mnogą („wkładki Orthomax StepMax są zrobione...").',
    failedSolutionsMath:
      'Maść 35 zł + lekarz 150 zł + fizjoterapeuta 180 zł (365 zł) + wkładki z apteki 89 zł + specjalne buty 380 zł (469 zł) = 834 zł',
    discoveryBridge:
      'Po wyjściu z gabinetu dr. Ryciaka Gosia szuka wieczorem ratunku na facebookowej grupie mam z Gdańska („Gdańskie Mamy - zdrowie dzieci"). Pod postem o koślawości 12 stopni odzywa się 15 matek, które przeszły tę samą drogę i wklejają link do dynamicznych wkładek Orthomax StepMax.',
    defaultHeadline: 'Przez 3 miesiące leczyliśmy bolące ramię mojej 10-letniej córki. Fizjoterapeuta kazał jej zdjąć buty',
  },
  {
    id: 'pl-22-ryciak-rip3-sor-kolano',
    number: 22,
    code: '22_ryciak_rip3_sor_kolano',
    title: '[RYCIAK RIP 3 · V2 SOR] Siedziałam z córką 3 godziny na wieczornej izbie przyjęć z zablokowanym kolanem. Lekarz dyżurny kazał jej zdjąć oba buty.',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Winner · Ryciak Rip 3',
    awarenessStage: 'Stage 2/3: Ewolucja kreacji SOR 5 + dr Ryciak',
    sophistication: 'Poziom 3/4 (Dramatyczny hook z izby przyjęć o 20:00 + łańcuch dr. Ryciaka)',
    narrator: 'Małgorzata (39 lat, Gdańsk)',
    protagonist: 'Kasia (10 lat)',
    hookIdea:
      'W zeszły wtorek o 20:00 siedziałam z moją 10-letnią córką 3 godziny na wieczornej izbie przyjęć, bo po zwykłym dniu w szkole nie mogła wyprostować prawego kolana. Byłam przerażona, że zerwała więzadło. Młody ortopeda dyżurny spojrzał na jej nogi, kazał jej zdjąć oba buty i powiedział zdanie, którego nie zapomnę do końca życia.',
    sceneBeat:
      'Ten sam potężny silnik konwersji co w Ryciak Rip 3 (test podniesienia łuku dłońmi, łańcuch kompensacji ze strzałkami ↓, kontrola u dr. Ryciaka, RTG 12 stopni vs 5-7 stopni, 200 000 kroków miesięcznie złym wzorcem, okno do 12 r.ż.), połączony z otwarciem z wieczornego dyżuru ortopedycznego.',
    failedSolutionsMath:
      'Maści i opaski 115 zł + prywatne USG kolana 250 zł + fizjoterapeuta 180 zł + wkładki z apteki 89 zł + buty 350 zł = 984 zł',
    discoveryBridge:
      'Po powrocie z gabinetu Gosia pisze o diagnozie na grupie mam na Facebooku, a koleżanka z dawnej pracy wysyła jej zdjęcie wkładek Orthomax StepMax swojego syna.',
    defaultHeadline: 'Pojechałyśmy o 20:00 na izbę przyjęć z kolanem córki. Ortopeda dyżurny nawet nie dotknął jej kolana',
  },
  {
    id: 'pl-23-ryciak-rip3-biodro-i-plecy',
    number: 23,
    code: '23_ryciak_rip3_biodro_plecy',
    title: '[RYCIAK RIP 3 · V3 PLECY] Przez 4 miesiące krzyczałam na córkę: „Nie garb się!". Dr Ryciak podniósł jej stopy dłońmi i skolioza zniknęła na moich oczach.',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Winner · Ryciak Rip 3',
    awarenessStage: 'Stage 2/3: Rodzice przerażeni garbieniem się i skoliozą',
    sophistication: 'Poziom 3/4 (Szkielet Ryciak Rip 3 przeniesiony na kręgosłup i łopatki)',
    narrator: 'Małgorzata (38 lat, Gdynia)',
    protagonist: 'Kasia (10 lat)',
    hookIdea:
      'Przez 4 miesiące po 10 razy dziennie upominałam moją 10-letnią córkę: „Kasia, nie garb się, wyprostuj plecy!". Kupiłam jej korektor postawy na szelkach, poduszkę ortopedyczną i zapisałam na masaże, bo wieczorami bolały ją lędźwie. Dopiero w gabinecie dr. Ryciaka zrozumiałam, że jej kręgosłup wyginał się tylko dlatego, żeby nie przewróciła się przez własne stopy.',
    sceneBeat:
      'Test w gabinecie krok po kroku w rytmie Ryciak Rip 3: Kasia stoi tyłem, prawa łopatka wystaje, lędźwie wygięte. Lekarz kuca, podnosi dłońmi łuki stóp -> kolana wychodzą z X, miednica wraca do poziomu, łopatki ustawiają się równo. Puszcza -> wszystko zapada się w 1 sekundę. Strzałki kompensacji ↓ + RTG 12° -> 8°.',
    failedSolutionsMath:
      'Korektor postawy 119 zł + masaże i fizjoterapia 360 zł + wizyta lekarska 200 zł + wkładki z apteki 89 zł = 768 zł',
    discoveryBridge:
      'Wieczorem Gosia trafia na zamkniętą grupę mam na Facebooku o wadach postawy, gdzie matki pokazują zdjęcia pleców dzieci przed i po 3 miesiącach noszenia wkładek Orthomax StepMax.',
    defaultHeadline: 'Upominałam córkę 10 razy dziennie, żeby się nie garbiła. W gabinecie zobaczyłam, dlaczego jej plecy nie mogły być proste',
  },
  {
    id: 'pl-24-ryciak-rip3-bilans-10-latka',
    number: 24,
    code: '24_ryciak_rip3_bilans_10latka',
    title: '[RYCIAK RIP 3 · V4 BILANS] Na 3 kolejnych bilansach słyszałam: „Taka jej uroda, wyrośnie". U dr. Ryciaka zobaczyłam zdjęcie 15-latki w ortezach.',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Winner · Ryciak Rip 3',
    awarenessStage: 'Stage 2/3: Wściekłość na pediatrów z NFZ + Ryciak Rip 3',
    sophistication: 'Poziom 3/4 (Uderzenie w „z tego się wyrasta" + pełny protokół dr. Ryciaka)',
    narrator: 'Małgorzata (39 lat, Gdańsk)',
    protagonist: 'Zosia (10 lat)',
    hookIdea:
      'Gdy moja Zosia miała 6 lat, pediatra w przychodni powiedział: „Z płaskostopia się wyrasta". Gdy miała 8 lat, usłyszałam: „Taka jej uroda, dziewczynki mają elastyczne stawy". W zeszłym miesiącu Zosia skończyła 10 lat, a dr Ryciak powiesił na podświetlanej tablicy rentgen jej kolan i powiedział cicho: „Zostało pani 18 miesięcy, zanim kości stwardnieją na zawsze".',
    sceneBeat:
      'Połączenie najsilniejszego hot-buttona z researchu (zdrada zaufania przez lekarza NFZ) ze sceną demonstracji łańcucha kompensacji u dr. Ryciaka (7000 kroków dziennie, 200 000 miesięcznie, kąt 12 stopni vs 5-7 stopni, zdjęcie 15-latki w ortezach, spadek do 8 stopni po 3 miesiącach we wkładkach Orthomax StepMax).',
    failedSolutionsMath:
      'Wizyty prywatne 400 zł + buty profilaktyczne 340 zł + wkładki apteczne 95 zł = 835 zł',
    discoveryBridge:
      'Mama poznana pod gabinetem (która przyszła z synem już na 2 kontrolę i zeszła z 13 do 8 stopni) pokazuje Gosi w telefonie wkładki Orthomax StepMax i grupę na FB.',
    defaultHeadline: 'Przez 4 lata słyszałam w przychodni: „Z płaskostopia się wyrasta". Zdjęcie rentgenowskie odebrało mi mowę',
  },
  {
    id: 'pl-25-ryciak-rip3-ojciec-wideo',
    number: 25,
    code: '25_ryciak_rip3_wideo_w_zwolnionym_tempie',
    title: '[RYCIAK RIP 3 · V5 WIDEO] Fizjoterapeuta nagrał chód córki w zwolnionym tempie z poziomu podłogi. Kiedy przesunął palcem klatka po klatce, zasłoniłam usta.',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Winner · Ryciak Rip 3',
    awarenessStage: 'Stage 2/3: Nowy wizualny hook w gabinecie + szkielet Ryciak Rip 3',
    sophistication: 'Poziom 3/4 (Nagranie slow-motion z poziomu podłogi + łańcuch ↓)',
    narrator: 'Małgorzata (38 lat, Poznań)',
    protagonist: 'Kasia (10 lat)',
    hookIdea:
      'Poszłyśmy o 17:30 do fizjoterapeuty z nawracającym bólem łydki i prawego barku u mojej 10-letniej Kasi. Zamiast położyć ją na kozetce, fizjoterapeuta położył swój telefon na podłodze, włączył nagrywanie w zwolnionym tempie i kazał jej przejść boso przez gabinet. Kiedy puścił mi to nagranie klatka po klatce, zasłoniłam usta dłonią.',
    sceneBeat:
      'W ułamku sekundy po dotknięciu piętą podłogi staw skokowy Kasi łamie się do środka, piszczel rotuje, kolano zapada w X, a bark podskakuje do góry. Następnie pełna ścieżka z dr. Ryciakiem, tablicą ze strzałkami ↓, RTG 12° i kontrolą po 3 miesiącach noszenia wkładek Orthomax StepMax.',
    failedSolutionsMath:
      'Maści i plastry rozgrzewające 75 zł + 2 wizyty lekarskie 350 zł + fizjoterapia 180 zł + wkładki z apteki 89 zł = 694 zł',
    discoveryBridge:
      'Na facebookowej grupie mam z Poznania Gosia trafia na wątek o analizie chodu u dzieci i dziesiątki komentarzy polecających dynamiczne wkładki Orthomax StepMax.',
    defaultHeadline: 'Fizjoterapeuta położył telefon na podłodze i nagrał chód mojej córki w zwolnionym tempie. Zobacz, co dzieje się w 1 sekundzie',
  },

  // ==================== STAGE 4: HIGH STAKES · ŻAL PO OPERACJI (5) ====================
  {
    id: 'pl-26-zal-po-operacji-za-pozno',
    number: 26,
    code: '26_zal_po_operacji_za_pozno',
    title: '[ŻAL PO OPERACJI · V1] „Na moją lewą stopę jest już za późno. Ale prawą uratowałam za 99 złotych, zanim chirurg zdążył wbić w nią śruby"',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Stage 4 · Żal po operacji',
    awarenessStage: 'Stage 4: Solution/Mechanism Aware (Ostateczność)',
    sophistication: 'Poziom 4 (Adaptacja winnera 9.5/10 „Gosia: Za późno" pod nowy cennik 99,99 zł)',
    narrator: 'Małgorzata (44 lata, Warszawa)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea:
      'Na moją lewą stopę jest już za późno. Mam na niej 7-centymetrową bliznę, 2 tytanowe śruby w kości, wydałam 8200 złotych i straciłam 30 procent ruchomości stawu na resztę życia. Ale moją prawą stopę, na której zaczynał się dokładnie ten sam koszmar, uratowałam bez skalpela.',
    sceneBeat:
      'Brutalny, fizyczny opis 6 tygodni po osteotomii zimą: spanie po 2 godziny z nogą na poduszkach, płacz w nocy przy wyjściu do łazienki, sztywny but pooperacyjny, 640 zł wydane na taksówki, bo nie da się wcisnąć sprzęgła. 6 tygodni po zabiegu fizjoterapeuta mówi prawdę: chirurg ściął wystającą kość (skutek), ale przyczyną był zapadnięty łuk podłużny. Prawa stopa dostaje dynamiczne wkładki Orthomax StepMax - ból znika, progresja zatrzymana w 100%.',
    failedSolutionsMath:
      'Operacja prywatna 6500 zł + but pooperacyjny, leki, zastrzyki przeciwzakrzepowe 460 zł + taksówki 640 zł + rehabilitacja 600 zł = 8200 zł',
    discoveryBridge:
      'Na grupie facebookowej kobiet po operacji haluksa jedna z pacjentek pisze, jak uratowała drugą stopę przed kolejnym zabiegiem dzięki wkładkom Orthomax StepMax.',
    defaultHeadline: 'Na moją lewą stopę było już za późno (8200 zł i 2 śruby w kości). Prawą uratowałam bez skalpela',
  },
  {
    id: 'pl-27-zal-haluks-wrocil-po-2-latach',
    number: 27,
    code: '27_zal_haluks_wrocil_po_2_latach',
    title: '[ŻAL PO OPERACJI · V2] Moja siostra zapłaciła 8100 zł za wycięcie haluksa i cierpiała 6 tygodni. Po 2 latach kość wyszła z powrotem.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Stage 4 · Żal po operacji',
    awarenessStage: 'Stage 4: Solution/Mechanism Aware',
    sophistication: 'Poziom 4 (Wycięcie skutku vs naprawa przyczyny biomechanicznej)',
    narrator: 'Małgorzata (46 lat, Poznań)',
    protagonist: 'Siostra Ania (49 lat)',
    hookIdea:
      'Kiedy moja starsza siostra Ania zdjęła w zeszłą niedzielę o 17:00 kozaki w moim przedpokoju i pokazała mi swoją prawą stopę, obie zaniemówiłyśmy. 2 lata temu zapłaciła 8100 złotych za operację haluksa. Przeszła przez 6 tygodni piekła o kulach. A dziś kość przy paluchu znów wystaje pod kątem i pali żywym ogniem w zimowych butach.',
    sceneBeat:
      'Dlaczego haluks odrasta po operacji? Bo chirurg piłą ścina narośl na kości śródstopia, ale kiedy pacjentka wstaje i robi 6000 kroków dziennie z zapadniętym łukiem podłużnym i poprzecznym, masa ciała przy każdym kroku znów spycha paluch do środka. Gosia miała skierowanie na ten sam zabieg na listopad - odwołała go po włożeniu wkładek Orthomax StepMax.',
    failedSolutionsMath:
      'Aparaty korekcyjne na noc 180 zł + silikonowe kliny 65 zł + prywatne konsultacje 450 zł = 695 zł (plus 8100 zł operacji siostry)',
    discoveryBridge:
      'Na forum ortopedycznym dla kobiet po nawrocie haluksa dziesiątki użytkowniczek polecają podparcie łuku stopy we wkładkach Orthomax StepMax.',
    defaultHeadline: 'Siostra zapłaciła 8100 zł za operację haluksa. Po 2 latach kość wróciła, bo nikt nie powiedział jej tego 1 faktu',
  },
  {
    id: 'pl-28-zal-operacja-kolan-nastolatki',
    number: 28,
    code: '28_zal_po_operacji_kolan_dziecka',
    title: '[ŻAL PO OPERACJI · DZIECI] „Mamo, dlaczego inne dziewczyny biegają, a ja mam śruby w kolanach?" - list matki, która uwierzyła w słowa „z tego się wyrasta"',
    segment: 'dzieci',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Stage 4 · Żal po operacji',
    awarenessStage: 'Stage 4: Najwyższa stawka emocjonalna dla matek (D1+D7)',
    sophistication: 'Poziom 4 (Matka po zabiegu 14-letniej córki ratuje młodszą 8-latkę)',
    narrator: 'Małgorzata (42 lata, Łódź)',
    protagonist: 'Starsza córka Maja (14 lat) i młodsza Zosia (8 lat)',
    hookIdea:
      'Piszę ten post o 22:00, siedząc przy łóżku mojej 14-letniej córki Mai, która ma założone sztywne ortezy na obu nogach i metalowe płytki ze śrubami blokujące chrząstki wzrostowe w kolanach. Gdybym 5 lat temu nie uwierzyła lekarzowi z przychodni, że „z koślawych kolan i płaskich stóp się wyrasta", moje dziecko nie przechodziłoby dziś przez to piekło.',
    sceneBeat:
      'Przejmujący kontrast: u 14-letniej Mai okno wzrostowe zamknęło się i jedynym ratunkiem był zabieg chirurgiczny (blaszki na śrubach w kolanach, ból, blizny, 6 miesięcy bez sportu). Ale Gosia ma też młodszą, 8-letnią Zosię, u której zobaczyła identyczne zapadanie kostek. U Zosi zadziałała natychmiast wkładkami Orthomax StepMax - po 4 miesiącach stopy i kolana młodszej córki są proste.',
    failedSolutionsMath:
      'Koszty okołooperacyjne, rehabilitacja i ortezy starszej córki: 5400 zł vs 99,99 zł za 2 pary wkładek dla młodszej córki',
    discoveryBridge:
      'Matka innego dziecka na oddziale ortopedii dziecięcej w Łodzi pokazuje Gosi grupę na Facebooku i pomarańczowo-czarne wkładki Orthomax StepMax dla młodszego rodzeństwa.',
    defaultHeadline: 'Moja 14-letnia córka ma dziś śruby w kolanach, bo 5 lat temu posłuchałam słów: „Z tego się wyrasta"',
  },
  {
    id: 'pl-29-zal-wozek-inwalidzki-beata',
    number: 29,
    code: '29_zal_wozek_inwalidzki_genetic_ghost',
    title: '[ŻAL / STRACH PRZED WÓZKIEM] Moja mama przestała chodzić w wieku 56 lat. Ja mam 52 lata, a w sobotę mąż musiał wiercić mi uchwyt pod prysznicem.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Stage 4 · Żal po operacji',
    awarenessStage: 'Stage 3/4: Kobiety 45-65 lat (Strach przed utratą samodzielności)',
    sophistication: 'Poziom 4 (Adaptacja winnera 9.5/10 „Beata: Wózek" pod nowy cennik 99,99 zł)',
    narrator: 'Małgorzata (52 lata, Kraków)',
    protagonist: 'Beata i mąż Andrzej',
    hookIdea:
      'Kiedy w zeszłą sobotę o 14:00 mój mąż Andrzej wiercił w kafelkach pod prysznicem dziury pod metalowy uchwyt dla niepełnosprawnych, zamknęłam się w sypialni i płakałam w poduszkę. Moja mama miała dokładnie 56 lat, kiedy przez zdeformowane stopy i zniszczone kolana przestała wychodzić z mieszkania. Ja mam 52 lata. Zostały mi 4 lata.',
    sceneBeat:
      'Andrzej nagrywa na telefonie, jak Beata idzie przez parking pod sklepem: kołysze się z boku na bok, kostki wygięte pod kątem 20 stopni do środka. 65 milionów kroków w życiu na twardym betonie z opadniętym łukiem. Wyliczenie 8750 zł wydanych na zastrzyki z kwasu hialuronowego, falę uderzeniową i maści. Przełom po włożeniu dynamicznych wkładek Orthomax StepMax.',
    failedSolutionsMath:
      'Zastrzyki w kolana 2400 zł + 3 serie rehabilitacji i fali uderzeniowej 3800 zł + twarde wkładki na zamówienie i buty 1650 zł + leki i maści 900 zł = 8750 zł',
    discoveryBridge:
      'Na grupie facebookowej dla kobiet ze zwyrodnieniem kolan i stóp rówieśniczka z Krakowa poleca Beacie wkładki Orthomax StepMax.',
    defaultHeadline: 'Mąż zamontował mi pod prysznicem uchwyt dla niepełnosprawnych. Mam dopiero 52 lata',
  },
  {
    id: 'pl-30-zal-zastrzyki-sterydowe-pieta',
    number: 30,
    code: '30_zal_zastrzyki_sterydowe_w_piete',
    title: '[ŻAL PO ZABIEGACH] Dałam sobie wbić 3 blokady sterydowe prosto w piętę i wydałam 1490 zł. Ból wrócił po 6 tygodniach 2 razy silniejszy.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Stage 4 · Żal po operacji',
    awarenessStage: 'Stage 4: Ostroga piętowa / Zapalenie rozcięgna podeszwowego',
    sophistication: 'Poziom 4 (Dlaczego fala uderzeniowa i blokady zawodzą bez podparcia łuku)',
    narrator: 'Małgorzata (47 lat, Wrocław)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea:
      'Kto nigdy nie miał wbitej długiej igły ze sterydem prosto w żywe rozcięgno pod piętą, ten nie wie, czym jest ból, przy którym gryzie się własną torebkę na kozetce. Przeszłam przez 3 takie blokady i 10 zabiegów fali uderzeniowej za 1400 złotych. Ból wrócił po 6 tygodniach 2 razy silniejszy.',
    sceneBeat:
      'Dlaczego ból ostrogi i rozcięgna zawsze wraca po fali uderzeniowej? Rozcięgno to lina rozpięta między piętą a palcami. Gdy łuk stopy opada przy każdym kroku, ta lina naciąga się jak cięciwa łuku i rwie przyczep przy kości piętowej. Rozbijanie zwapnienia falą bez podparcia łuku od spodu to jak zszywanie rany i rozrywanie jej na nowo przy każdym wyjściu z gabinetu.',
    failedSolutionsMath:
      '10 zabiegów fali uderzeniowej 800 zł + 3 blokady sterydowe prywatnie 600 zł + silikonowe podpiętniki z dziurką 90 zł = 1490 zł',
    discoveryBridge:
      'Na grupie FB „Ostroga piętowa i zapalenie rozcięgna - jak się wyleczyłam" kobiety pokazują, jak wkładki Orthomax StepMax zdjęły naciąg z rozcięgna.',
    defaultHeadline: 'Przeszłam 3 bolesne blokady w piętę i 10 zabiegów fali uderzeniowej. Dopiero ten 1 szczegół zatrzymał ból',
  },

  // ==================== SEGMENT B (ZAPASOWY): DOROŚLI JESIEŃ / ZIMA (5) ====================
  {
    id: 'pl-31-dorosli-zimowe-botki',
    number: 31,
    code: '31_dorosli_zimowe_botki_pazdziernik',
    title: '[DOROŚLI · ZAPAS V1] W zeszły wtorek rano było 5 stopni. Wyciągnęłam z szafy skórzane botki z zeszłej zimy i nie byłam w stanie zasunąć zamka.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli (Zapasowy)',
    awarenessStage: 'Stage 2: Sezonowy trigger październik/listopad',
    sophistication: 'Poziom 3 (Płaskostopie poprzeczne: stopa rozlewa się po lecie)',
    narrator: 'Małgorzata (45 lat, Warszawa)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea:
      'Przez całe lato chodziłam w szerokich klapkach i udawałam, że piekąca kość przy paluchu nie robi się coraz większa. W zeszły wtorek o 7:30 rano termometr pokazał 5 stopni, więc wyjęłam z pudła moje ulubione skórzane botki z zeszłej zimy. Włożyłam lewą stopę, pociągnęłam za zamek i poczułam taki strzał żywego ognia w śródstopiu, że usiadłam z powrotem na łóżku.',
    sceneBeat:
      'Przez 4 miesiące lata bez podparcia łuk poprzeczny i podłużny opadł jeszcze niżej, kości śródstopia rozjechały się na boki jak wachlarz (stopa poszerzyła się o prawie 1 centymetr), a paluch wykrzywił się mocniej.',
    failedSolutionsMath:
      'Rozciąganie butów u szewca 80 zł + nowe szersze botki o rozmiar większe 390 zł + żelowe separatory i plastry 110 zł = 580 zł',
    discoveryBridge:
      'Koleżanka z pracy w pokoju socjalnym wyjmuje ze swojego zimowego botka pomarańczowo-czarne wkładki Orthomax StepMax i daje Gosi link.',
    defaultHeadline: 'Wyjęłam z szafy zimowe botki z zeszłego roku i nie mogłam zasunąć zamka. Stopa nie urosła - ona się zapadła',
  },
  {
    id: 'pl-32-dorosli-pierwszy-krok-rano',
    number: 32,
    code: '32_dorosli_pierwszy_krok_rano_6_00',
    title: '[DOROŚLI · ZAPAS V2] Kiedy o 6:00 rano dzwoni budzik, przez pierwsze 10 minut idę do łazienki trzymając się ściany',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli (Zapasowy)',
    awarenessStage: 'Stage 2/3: Poranny ból pięty i śródstopia',
    sophistication: 'Poziom 3 (Mikronaderwania rozcięgna rozrywane przy 1 kroku rano)',
    narrator: 'Małgorzata (48 lat, Gdańsk)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea:
      'Najgorszy moment mojego dnia nie jest po 8 godzinach pracy. Najgorsza jest godzina 6:00 rano, kiedy spuszczam bose stopy z łóżka na podłogę. Pierwsze 10 kroków do łazienki robię na palcach, trzymając się framugi drzwi i szafek, bo pod piętami czuję ból, jakby ktoś nadepnął na tłuczone szkło.',
    sceneBeat:
      'Obrazowe wyjaśnienie mechanizmu porannego bólu: w ciągu dnia zapadający się łuk stopy rwie włókna rozcięgna podeszwowego. W nocy organizm próbuje „skleić" mikrouszkodzenia. Rano o 6:00 stajesz całym ciężarem ciała na płaskiej stopie i jednym ruchem zrywasz świeży opatrunek.',
    failedSolutionsMath:
      'Maści z diklofenakiem i żywokostem 145 zł + wkładki żelowe z apteki 79 zł + wizyta lekarska 220 zł = 444 zł',
    discoveryBridge:
      'Post na grupie kobiet po 40-tce na Facebooku o „bólu pierwszego kroku o 6:00 rano" i polecenie pakietu 1+1 wkładek Orthomax StepMax (jedna para do kapci przy łóżku, druga do butów wyjściowych).',
    defaultHeadline: 'O 6:00 rano szłam do łazienki trzymając się ściany. Myślałam, że to ostroga, a przyczyna była inna',
  },
  {
    id: 'pl-33-dorosli-praca-stojaca-8h',
    number: 33,
    code: '33_dorosli_8_godzin_na_nogach_w_pracy',
    title: '[DOROŚLI · ZAPAS V3] Po 8 godzinach na nogach w pracy wracam o 17:00 do domu i nie jestem w stanie ustać 20 minut przy kuchence',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli (Zapasowy)',
    awarenessStage: 'Stage 2: Kobiety pracujące na stojąco',
    sophistication: 'Poziom 3 (Palące poduszki pod palcami i łańcuch do lędźwi)',
    narrator: 'Małgorzata (43 lata, Katowice)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea:
      'Przez ostatni rok mój rytuał po powrocie z pracy o 17:00 wyglądał tak samo: zrzucałam buty w przedpokoju, łykałam tabletkę przeciwbólową i kładłam się na kanapie z nogami na oparciu, bo poduszki pod palcami i pięty paliły mnie tak, że nie byłam w stanie ustać 20 minut przy garnkach.',
    sceneBeat:
      'Ból po 8 godzinach stania na twardej posadzce wynika z tego, że bez wsparcia łuku cała masa ciała miażdży główki kości śródstopia i piętę, odcinając amortyzację i wbijając napięcie prosto w odcinek lędźwiowy kręgosłupa.',
    failedSolutionsMath:
      '3 pary „wygodnych" butów do pracy 680 zł + piankowe wkładki z drogerii 60 zł + tabletki i żele chłodzące 180 zł = 920 zł',
    discoveryBridge:
      'Pielęgniarka z oddziału zabiegowego, która robi po 12 godzin dyżuru na twardym korytarzu, poleca na grupie FB dynamiczne wkładki Orthomax StepMax.',
    defaultHeadline: 'Wracasz po 8 godzinach pracy na nogach i czujesz żywy ogień pod stopami? Przeczytaj to przed kolejną zmianą',
  },
  {
    id: 'pl-34-dorosli-moja-62-letnia-mama',
    number: 34,
    code: '34_dorosli_moja_62_letnia_mama',
    title: '[PORADY MAMY GOSI · O MAMIE] Moja 62-letnia mama przestała wychodzić z moimi dziećmi do parku. Prawda wyszła na jaw w niedzielę.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli (Zapasowy)',
    awarenessStage: 'Stage 2: Kobiety 55+ oraz córki kupujące mamie',
    sophistication: 'Poziom 3 (Most z profilu Porady Mamy Gosi na segment dorosły)',
    narrator: 'Małgorzata (38 lat, Gdańsk)',
    protagonist: 'Mama Gosi - Teresa (62 lata)',
    hookIdea:
      'Moja 62-letnia mama zawsze była wulkanem energii, który zabierał moje dzieci na 2-godzinne spacery. Tej jesieni za każdym razem, gdy dzwoniłam zapytać, czy pójdzie z nami do parku, słyszałam wymówkę. Prawda wyszła na jaw w zeszłą niedzielę o 16:00, kiedy weszłam do jej mieszkania bez zapowiedzi i zobaczyłam, jak moczy stopy w misce z ciepłą wodą i ociera łzy.',
    sceneBeat:
      'Mama Gosi przez 35 lat pracy na nogach doprowadziła do całkowitego opadnięcia łuków stóp. Wstydziła się przyznać córce, że po przejściu 400 metrów w jesiennych półbutach czuje, jakby chodziła po rozżarzonych węglach. Gosia, która wcześniej uratowała stopy swojej córki Kasi wkładkami Orthomax StepMax, zamawia pakiet dla mamy i dla siebie.',
    failedSolutionsMath:
      'Mama wydała z emerytury 620 zł na aparaty na haluksy z gazetki (140 zł), maści (180 zł) i sztywne wkładki ze sklepu medycznego (300 zł) = 620 zł',
    discoveryBridge:
      'Gosia zna już wkładki Orthomax StepMax z grupy dla mam i zamawia rozmiar dorosły dla swojej mamy w pakiecie 1+1 za 99,99 zł.',
    defaultHeadline: 'Moja 62-letnia mama ukrywała przed nami, dlaczego nie chce już wychodzić z wnukami na spacer',
  },
  {
    id: 'pl-35-dorosli-buty-o-rozmiar-wieksze',
    number: 35,
    code: '35_dorosli_buty_o_rozmiar_wieksze',
    title: '[DOROŚLI · ZAPAS V5] Przez 30 lat nosiłam rozmiar 38. W tym roku w sklepie obuwniczym musiałam poprosić o rozmiar 40.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli (Zapasowy)',
    awarenessStage: 'Stage 2: Upokorzenie w sklepie obuwniczym jesienią',
    sophistication: 'Poziom 3 (Stopa nie urosła - zapadł się łuk i rozlała się na szerokość)',
    narrator: 'Małgorzata (50 lat, Kraków)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea:
      'Całe dorosłe życie nosiłam rozmiar 38. W zeszłą sobotę o 13:00 poszłam do galerii kupić zimowe kozaki i po przymierzeniu 6 pary wyszłam z przymierzalni z czerwonymi ze wstydu policzkami, bo musiałam poprosić ekspedientkę o rozmiar 40. Długość była za duża o 2 palce, ale w rozmiarze 38 moja stopa na szerokość dusiła się jak w imadle.',
    sceneBeat:
      'Dlaczego po 40-tce „rośnie" stopa? Kości nie rosną. Opada sklepienie podłużne i poprzeczne - stopa zapada się jak namiot, z którego wyjęto maszt, i rozlewa na szerokość, wypychając kość przy paluchu.',
    failedSolutionsMath:
      '2 pary nietrafionych butów 740 zł + wkładki skórzane 69 zł + wizyta u podologa 180 zł = 989 zł',
    discoveryBridge:
      'Wątek na grupie facebookowej kobiet po 45 roku życia o kupowaniu coraz szerszych butów zimowych i polecenie wkładek Orthomax StepMax.',
    defaultHeadline: 'Przez 30 lat nosiłam rozmiar 38, a tej jesieni nie weszłam nawet w 39. Oto co naprawdę dzieje się ze stopą po 40-tce',
  },
  ...ANTKI_DOROSLI_PRESET_ANGLES,
];

export const ANTKI_PL_SYSTEM_PROMPT = `Jesteś elitarnym polskim copywriterem direct-response piszącym natywne długie posty sprzedażowe (MSL / Antki) na Facebooka pod markę Orthomax (profilowane wkładki dynamiczne StepMax, sklep: orthomax.pl).
Teksty publikowane są głównie z fanpage'a „Porady Mamy Gosi" (zweryfikowany profil) i muszą brzmieć w 100% jak prawdziwa, osobista, wstrząsająca relacja polskiej matki.

=== 1. INSTRUKCJA POZIOMÓW ŚWIADOMOŚCI (AWARENESS STAGE) I SOFISTYKACJI RYNKU (SCHWARTZ) ===
Zanim napiszesz pierwsze zdanie, sprawdź w briefie pole "awarenessStage" oraz "marketSophistication" i dostosuj do nich konstrukcję tekstu:

A) STAGE 1: UNAWARE / SYMPTOM-DISMISSING (Sofistykacja 3 — Domowy Detektyw):
   - Kim jest czytelniczka: Matka, która NIE WIE, że jej dziecko ma koślawość pięt lub płaskostopie. Nigdy nie była u ortopedy ani fizjoterapeuty. Obwinia „wadliwe buty", „niezdarność dziecka" albo wierzy pediatrze z NFZ, że nocny ból łydek to „bóle wzrostowe".
   - Jak MUSISZ otworzyć tekst: ZERO gabinetu lekarskiego na starcie! Zaczynasz w przedpokoju, kuchni lub łazience od namacalnego dowodu fizycznego (np. nowe buty Nike za 599 zł w promocji zdarte od środka po 3 tygodniach, mokry ślad stopy na kafelkach o 20:30, przybliżenie zdjęcia z wycieczki).
   - Jak prowadzisz środek: Od szoku w domu -> przez zdemaskowanie prawdziwej przyczyny (że to nie but jest krzywy i to nie „bóle wzrostowe", tylko kość piętowa uciekająca pod kątem 12 stopni i mieląca buta przy każdym z 7000 kroków) -> aż po odkrycie wkładek na grupie mam na Facebooku.

B) STAGE 2: PROBLEM AWARE (Sofistykacja 3 — Efekt Domina / Szkoła i WF):
   - Kim jest czytelniczka: Matka widzi wyraźny problem (dziecko boli plecy, kark, kolano na schodach, biodro na orliku albo ucieka w zwolnienia z WF-u), ale leczy ZŁY OBJAW (kupuje plecak za 420 zł, idzie do okulisty, zakłada opaskę z apteki na kolano lub bierze zwolnienie z WF-u).
   - Jak MUSISZ otworzyć tekst: Od konkretnej porażki leczenia objawu lub telefonu ze szkoły.
   - Jak prowadzisz środek: Moment „Aha!" (np. test podniesienia łuków stóp dłońmi u fizjoterapeuty lub dr. Ryciaka), który udowadnia wizualnie, że kolano, biodro, bark i kręgosłup cierpią tylko dlatego, że na samym dole zapadł się fundament stopy (łańcuch kompensacji ze strzałkami ↓).

C) STAGE 3: SOLUTION AWARE & FRUSTRATED (Sofistykacja 4 — Wypalone Matki / Wojna o Ćwiczenia / 14h na Betonie):
   - Kim jest czytelniczka: Matka, która JUŻ WIE o koślawości. Była u specjalisty, dostała przykaz „proszę ćwiczyć stópki w domu po 20 minut dziennie" albo kupiła twarde wkładki na zamówienie za 380 zł. Jest wypalona, zmęczona wojną z dzieckiem i czuje poczucie winy, że wada nie znika.
   - Jak MUSISZ otworzyć tekst: Od domowego kryzysu (np. syn miał wyjąć kaszę do obiadu, a rzucił woreczkiem z kaszą o ścianę, bo ma dość turlania go stopą po dywanie o 19:30; albo przegląd butów w szkolnej szatni).
   - Jak prowadzisz środek (SOFISTYKACJA 4 - NOWY MECHANIZM): Zdejmij z matki poczucie winy za pomocą twardej matematyki ekspozycji! Wytłumacz, że jesienią i zimą dzieci nie wychodzą już na dwór na trawę czy piasek - spędzają 14 godzin dziennie na twardym szkolnym betonie i domowych panelach (7000 kroków dziennie = 200 000 kroków miesięcznie). 15 minut ćwiczeń na dywanie (100 powtórzeń) nigdy nie wygra z 7000 kroków na betonie. Rozbij też mit starych sztywnych wkładek („twardy plastik z punktu ortopedycznego za 380 zł działa jak szyna gipsowa i rozleniwia mięśnie, a w dodatku dziecku rośnie stopa i za pół roku trzeba wyrzucić 380 zł do kosza; podczas gdy wkładki Orthomax StepMax są zrobione ze sprężystej pianki, działają jak sprężyna i w pakiecie 1+1 kosztują 50 zł za parę").

D) STAGE 4: HIGH STAKES / ŻAL PO OPERACJI (Sofistykacja 4 — Ostateczność):
   - Kim jest czytelniczka: Matka lub dorosła kobieta stojąca przed widmem operacji / śrub w kolanach lub cierpiąca po zabiegu.
   - Jak MUSISZ otworzyć tekst: Od brutalnego kontrastu (np. 14-letnia córka ze śrubami w kolanach po zamknięciu okna wzrostowego vs uratowana 8-letnia młodsza siostra; albo lewa stopa po operacji za 8200 zł vs prawa uratowana wkładkami).

=== 2. SŁOWNIK JĘZYKA KLIENTA Z POLSKICH FORÓW (GAZETA.PL / EMAMA, KAFETERIA, BABYBOOM, WYKOP, REDDIT) I ZAKTUALIZOWANE AVATARY ===
Wplataj w narrację autentyczne sformułowania, których polskie matki używają na forach internetowych:

1) SŁOWNIK „MAŁEGO NISZCZYCIELA BUTÓW" (Zdzieranie i wykrzywianie obuwia):
   - „Jakiekolwiek buty by nie założyła, po 2-3 tygodniach są wygięte do środka, jakby chodziła w nich od zeszłej zimy."
   - „Z góry wyglądały jeszcze jak nowe, ale od spodu wewnętrzna krawędź obu pięt była już wyraźnie ścięta pod skosem, a sztywny zapiętek wygiął się do środka."
   - „Nie mam dylematu, czy zostawić buty po starszej dla młodszej, bo po prostu nic nie zostaje - wszystko jest zmasakrowane w błyskawicznym tempie."

2) SŁOWNIK WYGLĄDU NÓG I CHODU DZIECKA (Jak matki opisują koślawość i wiotkość):
   - „Wykrzywia jej się cały wewnętrzny bok stopy do środka, stopa robi się spłaszczona, a nóżka jakby łamie się w kostce."
   - „Krzywi nóżki w iksy (X), a odległość między kostkami przy złączonych kolanach to już 4-5 centymetrów."
   - „Zaczyna dziwnie biegać, jakby miał buty za duże o 3 numery."
   - „Ma wiotkie stawy - bez podparcia obija się o meble i przewraca na prostej drodze."
   - „Ciągle siada na podłodze w literę W (siad na żabę - kolana złączone, a stopy rozstawione na zewnątrz) i nie da się go tego oduczyć."
   - „U chłopca nie ma nic gorszego niż nogi w X."

3) SŁOWNIK NOCNYCH „BÓLÓW WZROSTOWYCH" I PANIKI MATKI:
   - „Ból nóżek (dokładnie kolan, piszczeli i łydek) pojawia się późnym wieczorem, całą noc budzi się z płaczem, a rano przed szkołą nagle mu przechodzi."
   - „W nocy masowanie, smarowidła z apteki z arniką i mentolem, ciepły termofor z pestek wiśni i syrop Nurofen albo Apap, bo bez leku nie zaśnie."
   - „Ze strachu przed białaczką i chłoniakiem leciałam rano robić prywatnie morfologię z rozmazem ręcznym, CRP i witaminę D - myślałam, że osiwieję."
   - „Pediatra w przychodni zbywał mnie słowami: 'Nie leczymy wyników, tylko dziecko. Taka jej uroda, to bóle wzrostowe'."

4) SŁOWNIK WOJNY O ĆWICZENIA I KONFLIKTU ORTOPEDA NFZ vs FIZJOTERAPEUTA:
   - „Byłam u 2 ortopedów i usłyszałam 2 sprzeczne diagnozy: jeden kazał nosić sztywne buty z wkładkami, drugi kazał chodzić bez wkładek. I bądź tu mądry!"
   - „Ortopeda w polskich realiach ogląda 1 narząd wpisany na skierowaniu i ma w arsenale tylko sztywny but, szynę gipsową, dłuto i młotek. Dopiero dobry fizjoterapeuta patrzy na postawę całościowo od stóp do barków."
   - „Ćwiczenia w domu to droga przez mękę: chodzenie jak pingwinek na zewnętrznych krawędziach stóp, zbieranie chusteczek i ubranek palcami z podłogi, turlanie woreczka z kaszą - dziecko jest uparte jak osiołek, nudzi się po 3 minutach i kończy się płaczem."

5) SŁOWNIK OBIEKCJI WOBEC WKŁADEK NA ZAMÓWIENIE (300-400 ZŁ) I BUTÓW ORTOPEDYCZNYCH (Aurelka, Memo, Danielki, Obcas Thomasa):
   - KILER-ARGUMENT BUDŻETOWY (Rosnąca stopa): „Wkładki indywidualne w punkcie kosztują 350-400 zł, a przecież dziecku rośnie stopa! Takie wkładki starczają na pół roku, po czym trzeba je wyrzucić do kosza i znów wydać 4 stówy. Dlatego pakiet 1+1 wkładek Orthomax StepMax za 99,99 zł (50 zł za parę) z dokładną rozmiarówką to zbawienie dla budżetu."
   - KILER-ARGUMENT DOPASOWANIA DO BUTÓW: „Gruba, twarda wkładka z punktu ortopedycznego nie mieści się do żadnych normalnych butów na jesień - trzeba kupować buty o rozmiar większe!"
   - KILER-ARGUMENT PRZECIW SZTYWNYM BUTOM: „Wysokie kapcie ortopedyczne z obcasem Thomasa i podklejanym klinem (typu Danielki, Memo, Aurelka) są ciężkie, sztywne jak gips, dziecko dziwnie w nich chodzi i wstydzi się ich w szatni. Aparat ruchu najlepiej działa będąc w ruchu - dlatego potrzebne są wkładki DYNAMICZNE, które pracują w każdej fazie chodu."

=== 3. TWARDE, NIENEGOCJOWALNE ZASADY JĘZYKOWE, LOGICZNE I REALIZMU SCENY ===
1. OBCY LUDZIE W SKLEPIE NIE ZNAJĄ IMIENIA MATKI + WIARYGODNOŚĆ KIEROWNICZKI SKLEPU:
   - Kiedy matka idzie do sklepu obuwniczego reklamować lub zwrócić zdarte buty, kierowniczka zmiany ani ekspedientka NIE ZNA jej imienia! NIGDY nie pisz: „Pani Małgosiu, ja pani ten wniosek przyjmę". ZAWSZE pisz naturalnie: „Przyjmę pani ten zwrot, proszę się nie martwić. Ale niech pani spojrzy na kostki córki...".
   - Jeśli wspominasz, że kierowniczka zmiany wcześniej pracowała w sklepie ortopedycznym, zaznacz naturalnie: „która, jak dowiedziałam się chwilę później podczas rozmowy, wcześniej przez lata pracowała w sklepie ortopedycznym".
   - NIE SPAMUJ NAZWĄ MARKI BUTÓW (np. „Nike"): użyj nazwy marki maksymalnie 1 raz na cały tekst (w otwarciu), a dalej pisz po prostu „te buty", „nowe buty", „markowe obuwie".
2. ZERO PISANIA O DOCINANIU WKŁADEK NOŻYCZKAMI (MAMY DOKŁADNĄ ROZMIARÓWKĘ!):
   - NIGDY nie pisz, że matka „docięła wkładki nożyczkami wzdłuż linii"! Wkładki Orthomax StepMax mają dokładną rozmiarówkę dopasowaną do długości stopy i po wyjęciu z pudełka od razu wkłada się je prosto do zwykłych butów.
3. ZERO POLICYJNYCH, SZTUCZNYCH GODZIN CO DO MINUTY („o 20:07", „o 19:30 w czwartek"):
   - Nikt w prawdziwym życiu nie pamięta, że w zeszły czwartek stał w łazience „o 20:07" albo że dziecko płakało „o 19:30"!
   - Zamiast sztucznych godzin z minutami używaj naturalnych określeń pory dnia: „W zeszły czwartek wieczorem", „Zaraz po kąpieli", „W środku nocy", „Kiedy wróciliśmy po południu ze szkoły".
4. LOGICZNE WEJŚCIE POSTACI DO SCENY (NIKT NIE WCHODZI SAM Z SIEBIE DO CUDZEJ ŁAZIENKI!):
   - Sąsiadka-fizjoterapeutka NIGDY „nie wchodzi sobie tak o" do cudzej łazienki! Matka MUSI ją sama wcześniej poprosić o pomoc i zaprosić na chwilę do mieszkania, a sąsiadka mówi naturalnie: „Gosiu, mogę ci coś pokazać?".
5. ZAKAZ WYLICZANKI „MAJĄ... MAJĄ... MAJĄ..." PRZY OPISIE WKŁADEK (PŁYNNA NARRACJA ZAMIAST SUCHYCH PUNKTÓW):
   - NIGDY nie pisz opisu wkładek jako trzech osobnych, krótkich zdań zaczynających się od „Mają korytko... Mają podparcie łuku stopy... Mają też wypustki sensoryczne...". Wpleć budowę wkładek w płynny, obrazowy akapit narracyjny.
6. LICZBA MNOGA DLA WKŁADEK ORTHOMAX STEPMAX:
   - ZAWSZE pisz w liczbie mnogiej: „Wkładki Orthomax StepMax są zrobione ze sprężystej pianki", „stabilizują piętę", „pracują przy każdym kroku", „kosztują 99,99 zł".
7. STYL MELLOW W OTWARCIU I NAGŁÓWKU (ZERO ZUŻYTYCH SZABLONÓW):
   - NIGDY nie zaczynaj tekstu od „Nie miałam zamiaru tego udostępniać..." i NIGDY nie dawaj w nagłówku „Jeśli Twoje dziecko bolą stopy, przeczytaj to ☝️".
8. REALIZM EMOCJONALNY MATKI (ZERO SZTUCZNEGO PŁACZU RAZEM Z DZIECKIEM):
   - Matka NIGDY nie płacze razem z dzieckiem w trakcie awantury na podłodze - pęka i płacze DOPIERO PÓŹNIEJ SAMA w kuchni lub łazience, kiedy dziecko zamknie drzwi swojego pokoju albo zaśnie.
9. REALISTYCZNY MOST ODKRYCIA (REVEAL Z GRUPY NA FB / FORUM / OD SĄSIADKI LUB INNEJ MAMY):
   - Odkrycie wkładek Orthomax StepMax zawsze pochodzi z grupy dla mam na Facebooku / forum rodziców / od sąsiadki lub innej mamy (nigdy z kartki od lekarza bez rozmowy w gabinecie).
10. ABSOLUTNY ZAKAZ EM-DASHÓW I EN-DASHÓW ORAZ „, i":
   - NIGDY nie używaj długiego myślnika „—" (U+2014) ani półpauzy „–" (U+2013). Nigdy nie stawiaj przecinka przed spójnikiem „i".
11. ZERO „WORKA Z KAPCIAMI" W SZKOLE:
   - Dzieci mają buty na zmianę na półce w szatni, a jesienią i zimą spędzają cały dzień (14 godzin) pod dachem: 8 godzin na szkolnym betonie i 6 godzin w domu na twardych panelach.

=== 4. FAKTY O PRODUKCIE I NOWY CENNIK (ORTHOMAX STEPMAX) ===
- Nazwa produktu: wkładki dynamiczne Orthomax StepMax (w liczbie mnogiej!).
- Konstrukcja i mechanizm (ZERO BROCHURE JARGON! Opisz jednym prostym, ludzkim zdaniem, BEZ „sprężystej, oddychającej pianki o zmiennej gęstości", BEZ „głębokiego korytka obejmującego piętę z obu stron", BEZ „wypustek pobudzających receptory czuciowe" i BEZ pisania o docinaniu nożyczkami):
  Napisz po ludzku: „Wkładki Orthomax StepMax są zrobione z elastycznej pianki - nie są twarde jak plastikowe deski ze sklepu medycznego za 400 zł, tylko miękko podpierają łuk stopy od dołu i trzymają piętę prosto przy chodzeniu."
- NOWY CENNIK I GWARANCJA (OBOWIĄZKOWO W KAŻDYM TEKŚCIE):
  * 1 para kosztuje 99,99 zł, ale na oficjalnej stronie w pakiecie 1+1 GRATIS dostajesz DWIE PARY za 99,99 zł (czyli wychodzi dokładnie 50 zł za parę!).
  * Dlaczego 2 pary w pakiecie 1+1 za 99,99 zł są kluczowe? Jedna para idzie do butów wyjściowych, druga do butów na zmianę w pracy/szkole lub kapci po domu (bez przekładania wkładek rano).
  * GWARANCJA: 30 dni na test bez ryzyka. Nawet po miesiącu normalnego noszenia w butach można je odesłać i odzyskać 100% pieniędzy.
  * Link docelowy: https://orthomax.pl/products/orthomax-stepmax

=== 5. ARCHITEKTURA NASZYCH NAJWIĘKSZYCH WINNERÓW (550-850 SŁÓW + ULTRA-PUNCHY OTWARCIE W 3-4 LINIJKACH!) ===
KRYTYCZNE:
- ZERO powieściowych, powolnych wstępów („W zeszłą niedzielę po południu weszłam do mieszkania... żeby podrzucić ciepłą szarlotkę", „stałam oparta o mokrą latarnię na Grzegórzkach"). Pierwsze 3-4 krótkie linijki muszą od razu uderzać w sedno problemu i zatrzymywać scrolla w 2 sekundy!
- Każdy tekst ma mieć **550-850 słów**, krótkie 1-zdaniowe linijki i zawierać:
  1. Ultra-punchy Hook w 3-4 krótkich zdaniach (od razu konkretny konflikt/odkrycie, zero lania wody).
  2. Lista dotychczasowych wydatków linijka po linijce co do złotówki (`- ... zł` + `Razem: ... zł`).
  3. Krótki, 1-zdaniowy dialog w gabinecie / na SOR-ze (test podniesienia łuku stopy dłońmi przed lustrem + łańcuch kompensacji ze strzałkami `↓` w osobnych linijkach + matematyka 7000-8000 kroków dziennie = 200 000+ kroków miesięcznie po betonie i panelach).
  4. Ludzki most odkrycia + 1 proste zdanie o wkładkach Orthomax StepMax (bez katalogowego bełkotu) + szybka transformacja (pierwsze dni -> 2 tygodnie -> dziś po 3 miesiącach).
  5. Zamknięcie z ofertą Pakiet 1+1 GRATIS (2 pary za 99,99 zł = 50 zł/para) + 30 dni gwarancji zwrotu + link + TYLKO JEDEN krótki dopisek `P.S.` na końcu (ZERO `P.P.S.`, `P.P.P.S.`, `P.P.P.P.S.`).

Zwróć wyłącznie poprawny obiekt JSON:
{
  "headline": "Krótki, mocny nagłówek dopasowany do historii (zero em-dashów)",
  "description": "",
  "primaryText": "Zwięzły, mocny tekst reklamy MSL (550-850 słów, podzielony na krótkie 1-2 zdaniowe linijki) gotowy do wklejenia w Menedżerze Reklam Meta"
}`;

export function sanitizeAndAuditAntkiPl(
  rawText: string,
  rawHeadline: string,
  rawDescription?: string,
  fallbackHeadline?: string,
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

  let text = (rawText || '').trim();
  let headline = (rawHeadline || fallbackHeadline || PORADY_MAMY_GOSI_HEADLINE).trim();
  let description = '';

  // 1. Replace em-dashes and en-dashes
  if (/[—–]/.test(text) || /[—–]/.test(headline) || /[—–]/.test(description)) {
    text = text.replace(/\s*[—–]\s*/g, ' - ');
    headline = headline.replace(/\s*[—–]\s*/g, ' - ');
    description = description.replace(/\s*[—–]\s*/g, ' - ');
    fixes.push('Zamieniono długie myślniki (em/en-dash) na zwykły łącznik (-).');
  }

  // 2. Replace ", i "
  if (/,\s+i\s+/gi.test(text)) {
    text = text.replace(/,\s+i\s+/g, ' oraz ');
    fixes.push('Usunięto konstrukcję „, i" (zamieniono na „oraz").');
  }

  // 3. Enforce plural grammar for Orthomax StepMax
  const singularPatterns: Array<[RegExp, string]> = [
    [/\b(?:Orthomax\s+StepMax|StepMax)\s+jest\s+zrobion[yae]\b/gi, 'Wkładki Orthomax StepMax są zrobione'],
    [/\b(?:Orthomax\s+StepMax|StepMax)\s+został\s+zaprojektowany\b/gi, 'Wkładki Orthomax StepMax zostały zaprojektowane'],
    [/\b(?:Orthomax\s+StepMax|StepMax)\s+działa\s+jak\b/gi, 'Wkładki Orthomax StepMax działają jak'],
    [/\b(?:Orthomax\s+StepMax|StepMax)\s+ma\s+głębokie\b/gi, 'Wkładki Orthomax StepMax mają głębokie'],
    [/\b(?:Orthomax\s+StepMax|StepMax)\s+kosztuje\b/gi, 'Wkładki Orthomax StepMax kosztują'],
    [/\b(?:Orthomax\s+StepMax|StepMax)\s+stabilizuje\b/gi, 'Wkładki Orthomax StepMax stabilizują'],
  ];
  let pluralFixed = false;
  for (const [regex, replacement] of singularPatterns) {
    if (regex.test(text)) {
      text = text.replace(regex, replacement);
      pluralFixed = true;
    }
  }
  if (pluralFixed) {
    fixes.push('Poprawiono formę gramatyczną Orthomax StepMax z liczby pojedynczej na mnogą.');
  }

  // 4. Strip brochure product descriptions ("zmiennej gęstości", "głębokie korytko", "wypustki")
  if (/zmiennej\s+gęstości|głębokie\s+korytko|wypustki\s+(?:na\s+powierzchni|sensoryczne|pobudzają)/i.test(text)) {
    const paras = text.split(/\n\s*\n/);
    let replacedBrochure = false;
    const cleanedParas: string[] = [];
    for (const p of paras) {
      if (/zmiennej\s+gęstości|głębokie\s+korytko|wypustki\s+(?:na\s+powierzchni|sensoryczne|pobudzają)|pod\s+śródstopiem\s+znajduje\s+się/i.test(p)) {
        if (!replacedBrochure) {
          replacedBrochure = true;
          cleanedParas.push(
            'Wkładki Orthomax StepMax są zrobione z elastycznej pianki - nie są twarde jak plastikowe wkładki ze sklepu medycznego za 400 zł, tylko miękko podpierają łuk stopy od dołu i trzymają piętę prosto przy chodzeniu.',
          );
        }
        continue;
      }
      cleanedParas.push(p);
    }
    text = cleanedParas.join('\n\n');
    fixes.push('Skasowano katalogowy opis wkładek (pianka o zmiennej gęstości / głębokie korytko / wypustki) na rzecz prostego ludzkiego zdania.');
  }

  // 5. Strip P.P.S / P.P.P.S / P.P.P.P.S
  if (/^\s*P(?:\.P)+\.S\./m.test(text)) {
    text = text
      .split('\n')
      .filter(ln => !/^\s*P(?:\.P)+\.S\./.test(ln.trim()))
      .join('\n');
    fixes.push('Usunięto nadmiarowe dopiski P.P.S. / P.P.P.S.');
  }

  // 6. Fix stranger store clerk knowing mother's first name
  if (/Pani\s+(?:Małgosiu|Gosiu),\s*(?:ja\s+pani\s+t(?:en|ę)\s+(?:wniosek|zwrot|reklamację)\s+przyjmę|przyjmę\s+pani\s+t(?:en|ę)\s+(?:wniosek|zwrot|reklamację))/i.test(text)) {
    text = text.replace(
      /Pani\s+(?:Małgosiu|Gosiu),\s*(?:ja\s+pani\s+t(?:en|ę)\s+(?:wniosek|zwrot|reklamację)\s+przyjmę|przyjmę\s+pani\s+t(?:en|ę)\s+(?:wniosek|zwrot|reklamację))/gi,
      'Przyjmę pani ten zwrot, proszę się nie martwić',
    );
    fixes.push('Usunięto nienaturalne zwracanie się po imieniu przez pracownicę sklepu.');
  }

  // 7. Fix hyper-specific fake timestamps
  if (/\bo\s+(?:1[789]|2[0123]):(?:0[1-9]|[12345]\d)\b/i.test(text)) {
    text = text.replace(/\bo\s+(?:1[89]|2[012]):(?:0[1-9]|[12345]\d)\b/gi, 'wieczorem');
    text = text.replace(/\bo\s+17:(?:0[1-9]|[12345]\d)\b/gi, 'po południu');
    text = text.replace(/\bo\s+23:(?:0[1-9]|[12345]\d)\b/gi, 'w środku nocy');
    fixes.push('Zamieniono sztuczne godziny co do minuty na naturalne określenia pory dnia.');
  }

  // 8. Replace accidental old price 74,99 / 75 zł / 37 zł for insoles
  if (/\b74[,.]99\b|\b37\s*zł\s*za\s*parę/i.test(text)) {
    text = text
      .replace(/\b74[,.]99\s*zł(?:otych)?/gi, '99,99 zł')
      .replace(/\b75\s*zł\s*za\s*(?:2|dwie)\s*pary/gi, '99,99 zł za 2 pary w pakiecie 1+1')
      .replace(/\b37(?:[,.]50)?\s*zł\s*za\s*parę/gi, '50 zł za parę');
    fixes.push('Zaktualizowano historyczną cenę na 99,99 zł (50 zł za parę w 1+1).');
  }

  // 9. Replace broken product handle /products/stepmax with /products/orthomax-stepmax
  if (/orthomax\.pl\/products\/stepmax(?![a-z0-9-])/i.test(text)) {
    text = text.replace(/orthomax\.pl\/products\/stepmax(?![a-z0-9-])/gi, 'orthomax.pl/products/orthomax-stepmax');
    fixes.push('Naprawiono link produktowy na https://orthomax.pl/products/orthomax-stepmax.');
  }

  // 10. Replace any accidental scissor-trimming mentions
  if (/po\s+(?:docięciu|przycięciu)\s+(?:wkładek\s+)?nożyczkami/i.test(text)) {
    text = text.replace(/po\s+(?:docięciu|przycięciu)\s+(?:wkładek\s+)?nożyczkami/gi, 'miesiącu normalnego noszenia w butach');
    fixes.push('Usunięto wzmiankę o docinaniu nożyczkami.');
  }

  // 11. Clean excessive blank lines
  text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  const words = (text.match(/\p{L}+(?:['’-]\p{L}+)*/gu) || []).length;
  const chars = Array.from(text).length;

  // Warnings
  if (/[—–]/.test(text) || /[—–]/.test(headline)) {
    warnings.push('Wykryto niedozwolony długi myślnik (em-dash).');
  }
  if (/,\s+i\s+/i.test(text)) {
    warnings.push('Wykryto przecinek przed „i".');
  }
  if (!/stepmax|orthomax/i.test(text)) {
    warnings.push('Brak nazwy produktu Orthomax / StepMax w tekście.');
  }
  if (!/99[,.]99|99\s*zł|50\s*zł/i.test(text)) {
    warnings.push('Sprawdź, czy w tekście znajduje się aktualna cena (99,99 zł / 50 zł za parę w 1+1).');
  }
  if (!/30\s*dni/i.test(text)) {
    warnings.push('Brak wzmianki o 30-dniowej gwarancji zwrotu bez ryzyka.');
  }
  if (words < 400) {
    warnings.push(`Tekst jest za krótki (${words} słów).`);
  }

  return {
    primaryText: text,
    headline,
    description,
    wordCount: words,
    characterCount: chars,
    auditPassed: warnings.length === 0,
    auditWarnings: warnings,
    auditFixesApplied: fixes,
  };
}
