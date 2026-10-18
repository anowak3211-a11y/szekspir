/**
 * ANTKI PL — Fabryka Polskich Antków / MSL dla Orthomax StepMax (Porady Mamy Gosi & Dorośli)
 *
 * Zawiera:
 * 1. Pełną bazę wiedzy (Mózg Antków PL, Mechanizm StepMax, Cennik 99,99 zł / 1+1 GRATIS + 30 dni gwarancji,
 *    obsada Porady Mamy Gosi, dr Ryciak, łańcuch kompensacji, 7 Hot Buttonów, Mass Desires Schwartza).
 * 2. Matrycę 30 predefiniowanych kątów w pełnym lejku:
 *    - Etap 1: Koszyki 1–4 (20 kątów dziecięcych: od zdartych butów i kapci po wojnę o dywan)
 *    - Etap 2: Wariacje Ryciak Rip 3 / Fizjo / Efekt Domina (5 kątów)
 *    - Etap 3: Żal po operacji ("Za późno" / nawrót po osteotomii / wózek) (5 kątów)
 *    - Etap 4: Dorośli na Jesień/Zimę (botki, ostroga, praca stojąca, 62-letnia mama) (5 kątów)
 * 3. Twardą walidację polszczyzny i zasad właściciela:
 *    - Zero em-dashów (—) -> automatyczna konwersja + walidacja
 *    - Zero ", i" -> przebudowa
 *    - Zawsze rejestr Pan/Pani do lekarza/fizjoterapeuty/nauczyciela
 *    - Konkretny moment odkrycia przed nazwą Orthomax StepMax
 *    - Nowy cennik: 99,99 zł (pakiet 1+1 GRATIS = 50 zł za parę, lub 2+2 za 154,99 zł) + 30 dni gwarancji
 */

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
  wordCount: number;
  characterCount: number;
  auditPassed: boolean;
  auditWarnings: string[];
  auditFixesApplied: string[];
  createdAt: number;
  updatedAt: number;
}

export const ORTHOMAX_PL_DEFAULT_URL = 'https://orthomax.pl/products/stepmax';
export const PORADY_MAMY_GOSI_HEADLINE = 'Jeśli Twoje dziecko bolą stopy, przeczytaj to ☝️';
export const DOROSLI_DEFAULT_HEADLINE = 'Zanim zapiszesz się na zabieg lub kupisz kolejną maść, przeczytaj to ☝️';

export const ANTKI_PL_STAGE_LABELS: Record<AntkiPlFunnelStage, { label: string; badge: string; description: string }> = {
  stage1_domowe_odkrycie: {
    label: '1. Koszyk 1: Dzieci Stage 1 (Domowe odkrycie jesień/zima)',
    badge: 'STAGE 1 · DOM',
    description: 'Zero gabinetu w otwarciu. Zdarte zimowe buty w przedpokoju, mit bólów wzrostowych, mokry ślad w łazience, potykanie się.',
  },
  stage2_efekt_domina: {
    label: '2. Koszyk 2: Dzieci Stage 2 (Efekt Domina / Leczenie złego objawu)',
    badge: 'STAGE 2 · DOMINO',
    description: 'Matka leczy plecy, kark, biodro lub kolano, a przyczyna siedzi na samym dole w zapadających się kostkach.',
  },
  stage2_szkola_wf: {
    label: '3. Koszyk 3: Dzieci Stage 2/3 (Szkoła, WF, Wstyd w szatni)',
    badge: 'STAGE 2/3 · SZKOŁA & WF',
    description: 'Normalizowanie problemu zwolnieniami z WF-u, telefon od wuefistki, odmowa wyjazdu na zimowy obóz, wstyd przed butami ortopedycznymi.',
  },
  stage3_wypalone_matki: {
    label: '4. Koszyk 4: Dzieci Stage 3 (Wypalone matki / Kapcie / Wojna o dywan)',
    badge: 'STAGE 3 · WOJNA O DYWAN',
    description: 'Matki, które wiedzą o koślawości, ale przegrywają z ćwiczeniami o 19:30 i sztywnymi wkładkami z NFZ.',
  },
  ryciak_rip3_variations: {
    label: '5. Lejek: Ryciak Rip 3 — Nowe Wersje (Gabinet / Fizjo / SOR / RTG 12°)',
    badge: 'WINNER · RYCIAK RIP 3',
    description: 'Bezpośrednie iteracje największego winnera z konta Porady Mamy Gosi: test podniesienia łuku dłońmi, łańcuch ze strzałkami ↓, RTG 12° vs 5-7°, okno do 12 r.ż.',
  },
  zal_po_operacji: {
    label: '6. Lejek: Żal po operacji ("Za późno" / Nawrót haluksa / Wózek)',
    badge: 'WINNER · ŻAL PO OPERACJI',
    description: 'Brutalne historie po operacji (8 200 zł, 6 tygodni o kulach, 70% ruchomości, druga stopa uratowana wkładkami) oraz nawrót po wycięciu skutku zamiast przyczyny.',
  },
  dorosli_jesien_zima: {
    label: '7. Lejek: Dorośli Jesień/Zima (Zimowe botki, Ostroga rano, 62-letnia Mama)',
    badge: 'DOROŚLI · JESIEŃ/ZIMA',
    description: 'Kobiety 40–65+: stopa rozlana po lecie nie mieści się w zimowych botkach, pierwszy krok rano jak gwóźdź w piętę, 8h pracy stojącej, historia o mamie Gosi.',
  },
};

export const ANTKI_PL_PRESET_ANGLES: AntkiPlPresetAngle[] = [
  // ==================== KOSZYK 1: STAGE 1 DOMOWE ODKRYCIE (5) ====================
  {
    id: 'pl-01-zdarte-zimowe-buty',
    number: 1,
    code: '01_zdarte_zimowe_buty',
    title: 'Zdarte zimowe buty za 280 zł po 3 tygodniach + mit bólów wzrostowych',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Koszyk 1 · Stage 1',
    awarenessStage: 'Stage 1 (Unaware -> Problem Aware)',
    sophistication: 'Stage 3 (Domowy dowód zbrodni na podeszwie)',
    narrator: 'Małgorzata (39 lat, Poznań)',
    protagonist: 'Zosia (9 lat)',
    hookIdea: 'Kupiłam córce nowe jesienne trzewiki za 280 złotych. Po trzech tygodniach wzięłam je do ręki w przedpokoju, żeby zetrzeć błoto, odwróciłam podeszwę i zamarłam.',
    sceneBeat: 'Wewnętrzna krawędź obu pięt starta niemal do zera, sztywny zapiętek wygięty do środka jak naleśnik. Gosia idzie do sklepu złożyć reklamację, a doświadczona kierowniczka sklepu (po podologii) każe spojrzeć na nogi Zosi od tyłu i obala kłamstwo pediatry o "bólach wzrostowych".',
    failedSolutionsMath: 'Buty jesienne 280 zł + wcześniejsze adidasy z września 220 zł + syrop z magnezem i żel chłodzący 65 zł = 565 zł',
    discoveryBridge: 'Kierowniczka sklepu obuwniczego rysuje na paragonie korytko pięty i zapisuje nazwę dynamicznych wkładek Orthomax StepMax, które nosi jej własny syn.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-02-mit-bolow-wzrostowych',
    number: 2,
    code: '02_mit_bolow_wzrostowych',
    title: 'Nocny płacz i masowanie łydek ("Taka jego uroda, to bóle wzrostowe")',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Koszyk 1 · Stage 1',
    awarenessStage: 'Stage 1 (Symptom-Dismissing)',
    sophistication: 'Stage 3 (Obalenie gaslightingu pediatry z NFZ)',
    narrator: 'Małgorzata (38 lat, Wrocław)',
    protagonist: 'Kasia (8 lat)',
    hookIdea: 'Przez cztery miesiące wcierałam w łydki mojej ośmioletniej córki magnez w żelu, bo pediatra w przychodni powtarzała: „Rośnie, to zwykłe bóle wzrostowe". Aż pewnego wieczoru do naszej łazienki weszła sąsiadka, która pracuje jako fizjoterapeutka dziecięca.',
    sceneBeat: 'Kasia stoi boso na płytkach przed wanną i płacze, że palą ją piszczele. Sąsiadka kuca za nią, robi zdjęcie telefonem od tyłu i pokazuje odwrócone "V" uciekających pięt. Wyjaśnia, dlaczego na betonie i panelach dzieci NIE wyrastają z koślawości jak 40 lat temu na trawie.',
    failedSolutionsMath: 'Maści i żele z magnezem 140 zł + prywatne badania krwi (witamina D, wapń, morfologia) 195 zł + wizyta prywatna 200 zł = 535 zł',
    discoveryBridge: 'Sąsiadka fizjoterapeutka wyjmuje z bucika swojej córki pomarańczowo-czarną wkładkę Orthomax StepMax i pokazuje, jak sprężynuje pod kciukiem.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-03-test-mokrej-stopy',
    number: 3,
    code: '03_test_mokrej_stopy_w_lazience',
    title: 'Test mokrej stopy na kafelkach po kąpieli (Naleśnik zamiast łuku)',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Koszyk 1 · Stage 1',
    awarenessStage: 'Stage 1 (Unaware)',
    sophistication: 'Stage 3 (Wizualny test 10 sekund w łazience)',
    narrator: 'Małgorzata (40 lat, Kraków)',
    protagonist: 'Zosia (10 lat)',
    hookIdea: 'Wyszłam z łazienki po wieczornej kąpieli córki, spojrzałam na mokre ślady jej stóp na ciemnoszarych kafelkach i poczułam, jak robi mi się zimno.',
    sceneBeat: 'Zamiast wcięcia po wewnętrznej stronie stopy – pełny, rozlany prostokąt jak żelazko, a obok ślad kostki, która niemal dotyka podłogi. Kontrast między tym, co matka widzi od przodu, a tym, co dzieje się pod stopą przy każdym z 7000 kroków dziennie.',
    failedSolutionsMath: 'Wkładki żelowe z drogerii 49 zł + sztywne wkładki ze sklepu medycznego 110 zł + konsultacja 220 zł = 379 zł',
    discoveryBridge: 'Post na zamkniętej grupie mam z Krakowa ze zdjęciem identycznych mokrych śladów na podłodze i 140 komentarzami o wkładkach Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-04-zdjecie-z-wycieczki',
    number: 4,
    code: '04_zdjecie_z_wycieczki_szkolnej',
    title: 'Zdjęcie z jesiennej wycieczki klasowej (Przybliżenie na kolana w X)',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Koszyk 1 · Stage 1',
    awarenessStage: 'Stage 1 (Unaware)',
    sophistication: 'Stage 3 (Szok wizualny na zdjęciu grupowym)',
    narrator: 'Małgorzata (38 lat, Gdańsk)',
    protagonist: 'Kasia (9 lat)',
    hookIdea: 'Wychowawczyni wrzuciła na dziennik elektroniczny zdjęcia z październikowej wycieczki klasowej do lasu. Powiększyłam dwoma palcami zdjęcie mojej Kasi stojącej w pierwszym rzędzie i aż usiadłam na krześle w kuchni.',
    sceneBeat: 'Wszystkie dzieci stoją prosto, a kolana Kasi stykają się ze sobą jak litera X, stopy rozjeżdżają na boki, a prawy bark wisi niżej z ciężkim plecakiem. Matka przegląda zdjęcia z zeszłego roku i widzi, że w rok wada urosła dwukrotnie.',
    failedSolutionsMath: 'Prywatny ortopeda 250 zł + RTG 90 zł + sztywne buty korekcyjne, których córka nie chciała założyć 340 zł = 680 zł',
    discoveryBridge: 'Mama koleżanki z klasy Kasi (której syn na zdjęciu sprzed roku miał identyczne kolana w X, a teraz stoi prosto) wysyła Gosi na Messengerze link do Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-05-potykanie-sie-o-wlasne-nogi',
    number: 5,
    code: '05_potykanie_sie_o_wlasne_nogi',
    title: 'Potykanie się na prostej drodze i podarte spodnie (Rotacja wewnętrzna)',
    segment: 'dzieci',
    funnelStage: 'stage1_domowe_odkrycie',
    funnelLabel: 'Koszyk 1 · Stage 1',
    awarenessStage: 'Stage 1 (Unaware -> Guilt)',
    sophistication: 'Stage 3 (Wina rodzica za krzyczenie "patrz pod nogi")',
    narrator: 'Małgorzata (37 lat, Katowice)',
    protagonist: 'Zosia (8 lat)',
    hookIdea: '„Zosia, czy ty naprawdę nie potrafisz patrzeć pod nogi?!" — krzyknęłam, kiedy trzeci raz w tym miesiącu rozdarła nowe legginsy i rozbiła kolano na równym chodniku przed szkołą. Do dziś ściska mnie w gardle na myśl, że krzyczałam na własne dziecko za coś, czemu nie było winne.',
    sceneBeat: 'Wizyta u fizjoterapeuty: wyjaśnienie, dlaczego dziecko z zapadającym się łukiem podłużnym i koślawością pięty zahacza czubkiem jednego buta o drugi przy zmęczeniu po szkole.',
    failedSolutionsMath: 'Trzy pary zniszczonych spodni i butów 390 zł + wizyta u fizjoterapeuty 180 zł + wkładki z apteki 75 zł = 645 zł',
    discoveryBridge: 'Fizjoterapeuta pokazuje na modelu stopy, jak korytko stabilizujące piętę w Orthomax StepMax ustawia oś skokową i zatrzymuje zahaczanie czubkami butów.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },

  // ==================== KOSZYK 2: STAGE 2 EFEKT DOMINA (5) ====================
  {
    id: 'pl-06-plecy-i-ciezki-plecak',
    number: 6,
    code: '06_plecy_i_ciezki_plecak',
    title: 'Kupiłam ergonomiczny plecak za 420 zł na ból pleców córki. A przyczyna była w butach.',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Koszyk 2 · Stage 2 Domino',
    awarenessStage: 'Stage 2 (Symptom Aware - Ból pleców)',
    sophistication: 'Stage 3 (Efekt Domina od stóp do łopatek)',
    narrator: 'Małgorzata (39 lat, Warszawa)',
    protagonist: 'Kasia (10 lat)',
    hookIdea: 'Postawiłam szkolny plecak mojej dziesięcioletniej córki na wadze kuchennej: sześć i pół kilograma. Byłam pewna, że to dlatego Kasia codziennie po szkole kładzie się na dywanie i płacze, że pieką ją plecy między łopatkami. Wydałam 420 złotych na najdroższy ergonomiczny tornister. Nie pomogło nawet na jeden dzień.',
    sceneBeat: 'W gabinecie fizjoterapeuta nawet nie patrzy na plecak. Każe Kasi zdjąć buty i skarpetki. Pokazuje test podniesienia łuku stopy: gdy stopy leżą płasko, miednica ucieka do przodu (hiperlordoza), a kręgosłup piersiowy wygina się w łuk. Gdy podnosi łuki dłońmi — plecy natychmiast się prostują.',
    failedSolutionsMath: 'Ergonomiczny plecak 420 zł + maść przeciwzapalna 45 zł + 2 wizyty u fizjoterapeuty 360 zł = 825 zł',
    discoveryBridge: 'Fizjoterapeuta tłumaczy, że dopóki stopa zapada się 7000 razy dziennie, żaden plecak nie uratuje kręgosłupa, i poleca dynamiczne wkładki Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-07-bol-glowy-i-karku',
    number: 7,
    code: '07_bol_glowy_i_karku_po_szkole',
    title: 'Badaliśmy wzrok i zatoki, bo córka wracała ze szkoły z bólem karku i głowy',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Koszyk 2 · Stage 2 Domino',
    awarenessStage: 'Stage 2 (Symptom Aware - Kark/Głowa)',
    sophistication: 'Stage 3 (Najbardziej zaskakujący łańcuch kompensacji)',
    narrator: 'Małgorzata (41 lat, Łódź)',
    protagonist: 'Zosia (10 lat)',
    hookIdea: 'Przez dwa miesiące ciągaliśmy naszą dziesięcioletnią Zosię po okulistach i laryngologach, bo trzy razy w tygodniu wracała ze szkoły z napięciowym bólem karku i głowy. Okulista wziął 250 złotych i powiedział: „Wzrok jak u sokoła, proszę szukać dalej".',
    sceneBeat: 'Osteopata/fizjoterapeuta stawia Zosię przed lustrem z kratką postawograficzną. Prawa kostka zapada się o 13 stopni do środka, prawe kolano ucieka w X, prawa strona miednicy opada, a lewy bark i mięsień czworoboczny karku są w permanentnym skurczu, żeby głowa trzymała poziom oczu.',
    failedSolutionsMath: 'Okulista 250 zł + laryngolog 200 zł + poduszka ortopedyczna do spania 189 zł + fizjoterapia 200 zł = 839 zł',
    discoveryBridge: 'Na forum rodziców dzieci z asymetrią postawy Małgorzata trafia na wątek o wyrównaniu fundamentu wkładkami Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-08-biodro-po-pilce',
    number: 8,
    code: '08_biodro_po_treningu_pilki',
    title: 'Utulanie syna po treningu na orliku (Ból biodra i pięty — choroba Severa / koślawość)',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Koszyk 2 · Stage 2 Domino',
    awarenessStage: 'Stage 2 (Symptom Aware - Sport dziecięcy)',
    sophistication: 'Stage 3 (Rotacja biodra od uciekającej pięty)',
    narrator: 'Małgorzata (38 lat, Gdańsk)',
    protagonist: 'Kuba (9 lat)',
    hookIdea: 'Mój dziewięcioletni syn kocha piłkę nożną bardziej niż cokolwiek na świecie. Kiedy w październiku zszedł z orlika w połowie treningu, usiadł na ławce i zobaczyłam, że gryzie rękaw bluzy, żeby koledzy nie widzieli, jak płacze z bólu biodra i pięty, serce pękło mi na pół.',
    sceneBeat: 'Trener mówił „zakwasy albo naciągnięta pachwina". Ortopeda sportowy pokazuje podeszwę korków i halówek Kuby oraz kąt koślawości pięty: przy każdym biegu po twardym boisku i szkolnym korytarzu kość piętowa uderza pod kątem, skręcając kolano i zamek biodrowy.',
    failedSolutionsMath: 'Maści chłodzące i opaski na kolano/biodro 135 zł + prywatne USG biodra 220 zł + wizyta u ortopedy 250 zł + żelowe podpiętniki z apteki 65 zł = 670 zł',
    discoveryBridge: 'Ojciec innego chłopca z drużyny pokazuje po meczu pomarańczowe wkładki Orthomax StepMax, które uratowały jego syna przed rezygnacją z akademii piłkarskiej.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-09-kolano-na-schodach',
    number: 9,
    code: '09_pachwina_i_kolano_na_schodach',
    title: 'Córka zatrzymała się na półpiętrze z bólem pod rzepką (Kąt 12 stopni w kostce)',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Koszyk 2 · Stage 2 Domino',
    awarenessStage: 'Stage 2 (Ból kolan u dziecka)',
    sophistication: 'Stage 3 (Dlaczego opaska na kolano niszczy staw jeszcze bardziej)',
    narrator: 'Małgorzata (39 lat, Szczecin)',
    protagonist: 'Kasia (10 lat)',
    hookIdea: 'Mieszkamy na trzecim piętrze bez windy. W zeszły czwartek wracałyśmy ze szkoły i moja dziesięcioletnia Kasia usiadła na schodach na drugim piętrze, złapała się za kolana i powiedziała cicho: „Mamo, poczekaj chwilę, bo znowu kłuje mnie w środku".',
    sceneBeat: 'Matka kupiła opaski elastyczne na kolana w aptece. Ortopeda każe je natychmiast zdjąć i pokazuje, że rzepka Kasi trze o kłykieć tylko dlatego, że pięta na dole zapada się do środka o 12 stopni i skręca piszczel jak wykręcany ręcznik.',
    failedSolutionsMath: 'Dwie opaski na kolana 110 zł + kolagen dla dzieci i witaminy 95 zł + prywatny ortopeda z USG 320 zł = 525 zł',
    discoveryBridge: 'Wyszukiwanie wieczorem w Google „koślawość pięty kłucie pod rzepką u dziecka" i trafienie na relację innej mamy oraz wkładki Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-10-krzywa-spodniczka-apel',
    number: 10,
    code: '10_krzywa_spodniczka_na_apelu',
    title: 'Galowa spódniczka na szkolnym apelu cały czas przekręcała się na bok (Asymetria miednicy)',
    segment: 'dzieci',
    funnelStage: 'stage2_efekt_domina',
    funnelLabel: 'Koszyk 2 · Stage 2 Domino',
    awarenessStage: 'Stage 2 (Wada postawy / Skolioza funkcjonalna)',
    sophistication: 'Stage 3 (Jedna stopa bardziej płaska niż druga = krzywa miednica)',
    narrator: 'Małgorzata (38 lat, Lublin)',
    protagonist: 'Zosia (9 lat)',
    hookIdea: 'Podczas październikowego apelu w szkole poprawiałam galową spódniczkę mojej córki chyba pięć razy, bo gumka w pasie cały czas zjeżdżała jej na prawe biodro. Myślałam, że krawcowa krzywo wszyła zamek. Trzy dni później na bilansie pielęgniarka szkolna kazała Zosi zrobić skłon do przodu.',
    sceneBeat: 'Jedna łopatka wystaje wyżej, jedno biodro ucieka. U fizjoterapeuty okazuje się, że kręgosłup sam w sobie jest zdrowy, ale prawa stopa zapada się o 6 milimetrów niżej niż lewa, przez co całe ciało stoi jak szafa z jedną krótszą nóżką.',
    failedSolutionsMath: 'Pajączek na plecy (który piszczał i doprowadzał dziecko do płaczu) 129 zł + fizjoterapeuta 180 zł + konsultacja ortopedyczna 240 zł = 549 zł',
    discoveryBridge: 'Fizjoterapeutka tłumaczy, dlaczego "pajączek" na plecach nic nie da, skoro miednica zapada się od stóp, i wskazuje dynamiczne wkładki Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },

  // ==================== KOSZYK 3: SZKOŁA, WF, WSTYD SPOŁECZNY (5) ====================
  {
    id: 'pl-11-telefon-od-wuefistki',
    number: 11,
    code: '11_telefon_od_wuefistki',
    title: 'Telefon od wuefistki ze szkoły: „Pani Gosiu, Zosia nie udaje. Proszę spojrzeć na jej pięty"',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Koszyk 3 · Szkoła & WF',
    awarenessStage: 'Stage 2 (Problem Aware)',
    sophistication: 'Stage 3 (Autorytet nauczyciela WF-u + test w trampkach)',
    narrator: 'Małgorzata (39 lat, Bydgoszcz)',
    protagonist: 'Zosia (9 lat)',
    hookIdea: 'Myślałam, że moja dziewięcioletnia córka kombinuje, żeby nie biegać na WF-ie, bo co wtorek rano bolał ją brzuch albo nogi. Aż w zeszłym tygodniu zadzwoniła do mnie jej nauczycielka wychowania fizycznego i poprosiła, żebym przyszła pod salę gimnastyczną piętnaście minut przed końcem lekcji.',
    sceneBeat: 'Wuefistka (była lekkoatletka) otwiera drzwi sali i pokazuje Zosię biegnącą w cienkich trampkach po parkiecie: przy każdym odbiciu kostki Zosi dosłownie kładą się do środka, a kolana uderzają o siebie. Po dwóch okrążeniach Zosia ma łzy w oczach z piekącego bólu rozcięgna.',
    failedSolutionsMath: 'Dwie pary markowych butów na WF 360 zł + żelowe wkładki z marketu 45 zł + prywatna wizyta u ortopedy 230 zł = 635 zł',
    discoveryBridge: 'Wuefistka mówi wprost, że w jej klasie sportowej połowa dzieci z koślawością biega we wkładkach Orthomax StepMax i daje Gosi link.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-12-wybierany-ostatni-do-druzyny',
    number: 12,
    code: '12_wybierany_ostatni_do_druzyny',
    title: '„Mamo, koledzy mówią, że biegam jak kaczuszka i zawsze wybierają mnie ostatniego"',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Koszyk 3 · Szkoła & WF',
    awarenessStage: 'Stage 2 (Odzyskane dzieciństwo - Mass Desire D4)',
    sophistication: 'Stage 3 (Ból emocjonalny wykluczenia rówieśniczego)',
    narrator: 'Małgorzata (38 lat, Rzeszów)',
    protagonist: 'Tomek (9 lat)',
    hookIdea: 'Kiedy mój dziewięcioletni syn zamknął się po szkole w pokoju i powiedział przez łzy: „Mamo, załatw mi zwolnienie z WF-u do końca roku, bo chłopaki śmieją się, że biegam jak kaczuszka i nikt nie chce mnie w drużynie", poczułam, jakby ktoś uderzył mnie w brzuch.',
    sceneBeat: 'Matka idzie z synem do ortopedy. Lekarz pokazuje, skąd bierze się "kaczy chód" i powolny bieg: gdy łuk podłużny leży na płasko, stopa traci sprężystość (brak wybicia z przodostopia) i dziecko zamiast odbijać się jak ze sprężyny, człapie całą płaską podeszwą po podłodze.',
    failedSolutionsMath: 'Wizyta u ortopedy 250 zł + sztywne wkładki ze sklepu ortopedycznego (w których syn nie mógł biegać) 160 zł + zajęcia korekcyjne 240 zł = 650 zł',
    discoveryBridge: 'Komentarz innej mamy pod artykułem o koślawości u chłopców, opisujący jak dynamiczna sprężyna Orthomax StepMax przywróciła jej synowi normalne wybicie na WF-ie.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-13-odmowa-obozu-zimowego',
    number: 13,
    code: '13_odmowa_zimowego_obozu_narty',
    title: 'Wpłaciłam 900 zł zaliczki na zimowy obóz z klasą. Wieczorem córka powiedziała, że nie pojedzie.',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Koszyk 3 · Szkoła & WF',
    awarenessStage: 'Stage 2/3 (Kryzys w domu)',
    sophistication: 'Stage 3 (Adaptacja winnera "Obóz" na sezon jesień/ferie)',
    narrator: 'Małgorzata (40 lat, Katowice)',
    protagonist: 'Zosia (10 lat)',
    hookIdea: 'Wpłaciłam 900 złotych zaliczki na zimowe białe szkoły z klasą Zosi. Cały wrzesień odliczała dni, bo miały jechać jej dwie najlepsze przyjaciółki. W zeszłą środę weszłam do jej pokoju i zastałam ją zapłakaną nad otwartym zeszytem: „Mamo, wypisz mnie. Ja nie dam rady chodzić z nimi po górach, mnie po godzinie zawsze tak strasznie bolą nogi".',
    sceneBeat: 'Słowo „zawsze" uderza matkę jak obuchem. Okazuje się, że Zosia od pół roku ukrywała ból stóp i kolan na spacerach, bo nie chciała robić problemu. Wizyta u dr. Ryciaka i odkrycie 12-stopniowej koślawości oraz zamykającego się okna wzrostowego.',
    failedSolutionsMath: 'Maści i opaski 90 zł + wkładki z apteki 89 zł + wizyta u ortopedy z RTG 310 zł + buty trekkingowe 320 zł = 809 zł',
    discoveryBridge: 'Wieczorne szukanie ratunku przed przepadnięciem obozu i trafienie na forum rodziców oraz dynamiczne wkładki Orthomax StepMax (pakiet 1+1: jedna para do butów zimowych, druga do kapci).',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-14-wstyd-w-szatni-buty',
    number: 14,
    code: '14_wstyd_w_szatni_ortopedyczne_buty',
    title: 'Kupiłam córce buty ortopedyczne za 450 zł. Chowała je w szafce i chodziła po szkole w skarpetkach.',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Koszyk 3 · Szkoła & WF',
    awarenessStage: 'Stage 3 (Solution Aware - Obiekcja stygmatyzacji D5)',
    sophistication: 'Stage 4 (Niewidzialna korekcja w zwykłych sneakersach vs obciachowe buty z NFZ)',
    narrator: 'Małgorzata (37 lat, Toruń)',
    protagonist: 'Kasia (9 lat)',
    hookIdea: 'Wydałam 450 złotych na wysokie, sztywne kapcie ortopedyczne ze sklepu medycznego, bo ortopeda z przychodni postraszył mnie skoliozą. Po dwóch tygodniach wychowawczyni powiedziała mi na wywiadówce coś, od czego zrobiło mi się gorąco ze wstydu: Kasia po wejściu do szatni chowała te buty na dno worka i cały dzień chodziła po zimnym szkolnym korytarzu w samych skarpetkach.',
    sceneBeat: 'Dziewczynki w szatni śmiały się z "żelaznych butów". Ponadto młody fizjoterapeuta tłumaczy Gosi, że wysoki, sztywny but za kostkę blokuje staw skokowy jak gips w bucie narciarskim, przez co mięśnie łydki i stopy zanikają jeszcze szybciej.',
    failedSolutionsMath: 'Buty ortopedyczne 450 zł + pierwsza wizyta 200 zł + druga konsultacja fizjoterapeutyczna 180 zł = 830 zł',
    discoveryBridge: 'Fizjoterapeuta pokazuje nowoczesne podejście: zwykłe, modne adidasy lub trampki dziecka + ukryta w środku dynamiczna wkładka Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-15-zwolnienie-z-wf-u-jesien',
    number: 15,
    code: '15_zwolnienie_z_wf_u_pediatry',
    title: 'Przyszłam tylko przedłużyć zwolnienie z WF-u na zimę. Lekarz spojrzał na kolana córki i zapytał: „Wie pani, że podpisuje pani zgodę na operację?"',
    segment: 'dzieci',
    funnelStage: 'stage2_szkola_wf',
    funnelLabel: 'Koszyk 3 · Szkoła & WF',
    awarenessStage: 'Stage 2/3 (Ewolucja Winnera #1 na jesień)',
    sophistication: 'Stage 3 (Uderzenie w "Normalizowanie" przez matkę)',
    narrator: 'Małgorzata (39 lat, Gdańsk)',
    protagonist: 'Zosia (9 lat)',
    hookIdea: 'Poszłam do gabinetu tylko po to, żeby przedłużyć dziewięcioletniej Zosi zwolnienie z WF-u na semestr zimowy. Myślałam, że jestem dobrą mamą, która chroni dziecko przed bólem kolan. Zamiast papierka do szkoły wyszłam z wydrukiem rentgena i zdaniem lekarza, które dźwięczało mi w uszach przez całą drogę do samochodu.',
    sceneBeat: 'Lekarz zastępujący naszą pediatrę nie podpisuje świstka w ciemno. Każe Zosi podwinąć nogawki. Pokazuje, że sadzanie 9-latki na ławce, podczas gdy w kościach trwa skok wzrostowy, a stopy robią 7000 krzywych kroków dziennie, to prosta droga na stół operacyjny w wieku 13 lat.',
    failedSolutionsMath: 'Prywatne wizyty i badania 450 zł + maści i opaski 120 zł + wkładki z apteki 89 zł = 659 zł',
    discoveryBridge: 'Wieczorny research po wyjściu z gabinetu, rozmowa z mamą na grupie ortopedycznej i zamówienie pakietu 1+1 Orthomax StepMax za 99,99 zł.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },

  // ==================== KOSZYK 4: STAGE 3 WYPALONE MATKI / KAPCIE / DYWAN (5) ====================
  {
    id: 'pl-16-wojna-o-dywan-19-30',
    number: 16,
    code: '16_wojna_o_dywan_19_30',
    title: '„Nienawidzę tych ćwiczeń!" — woreczek z kaszą wylądował na ścianie o 19:30 (15 minut na dywanie vs 8 godzin w butach)',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Koszyk 4 · Stage 3 Wypalone Matki',
    awarenessStage: 'Stage 3 (Solution Aware & Frustrated - Mass Desire D2)',
    sophistication: 'Stage 4 (Matematyka ekspozycji: 15 minut ćwiczeń nie wygra z 200 000 kroków na betonie)',
    narrator: 'Małgorzata (38 lat, Warszawa)',
    protagonist: 'Kasia (8 lat)',
    hookIdea: 'Była 19:30, za oknem ciemny październikowy wieczór, a ja po ośmiu godzinach pracy i odrabianiu lekcji siedziałam na dywanie w salonie i płakałam razem z moją ośmioletnią córką. Kasia rzuciła woreczkiem z kaszą o ścianę i krzyknęła, że ma dość zwijania ręcznika palcami. Najgorsze przyszło trzy dni później na kontroli: po dwóch miesiącach codziennej męczarni kąt jej pięty nie poprawił się nawet o jeden stopień.',
    sceneBeat: 'Fizjoterapeuta tłumaczy brutalną matematykę: ćwiczycie na dywanie przez 15 minut dziennie (ok. 100 powtórzeń), a potem dziecko wstaje i przez 10 godzin robi 7000 kroków po płaskich panelach i szkolnym betonie, gdzie stopa za każdym razem zapada się do środka. 7000 wygrywa ze 100 każdego dnia.',
    failedSolutionsMath: 'Zestaw do ćwiczeń w domu (mata z kolcami, dysk sensoryczny, woreczki, taśmy) 260 zł + 4 wizyty kontrolne u fizjo 720 zł = 980 zł',
    discoveryBridge: 'Fizjoterapeuta pokazuje, jak zamienić każdy z tych 7000 kroków w pasywny trening dzięki dynamicznym wkładkom Orthomax StepMax ("niewidzialny fizjoterapeuta w bucie").',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-17-worek-ze-szkolnymi-kapciami',
    number: 17,
    code: '17_worek_ze_szkolnymi_kapciami',
    title: 'Wyjęłam z worka szkolne kapcie córki do prania. Zobaczyłam, co 7 godzin dziennie na szkolnym betonie robi z jej stopami.',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Koszyk 4 · Stage 3 Wypalone Matki',
    awarenessStage: 'Stage 2/3 (Szkolny beton + Pakiet 1+1)',
    sophistication: 'Stage 4 (Dlaczego jedno obuwie nie wystarczy — 7h w kapciach na lastryko)',
    narrator: 'Małgorzata (39 lat, Poznań)',
    protagonist: 'Zosia (9 lat)',
    hookIdea: 'W piątek po południu kazałam córce przynieść ze szkoły worek z kapciami na zmianę, żeby wyprać je przez weekend. Kiedy wyjęłam je na pralkę, przez dłuższą chwilę nie mogłam uwierzyć własnym oczom: płótno od wewnętrznej strony kostki było przetarte na wylot, a biała guma podeszwy starta pod skosem, jakby ktoś piłował ją papierem ściernym.',
    sceneBeat: 'Matka kupowała drogie buty zimowe, ale zapomniała, że w butach zimowych dziecko idzie tylko 15 minut do szkoły, a potem przez 7 godzin dziennie biega po twardym jak skała szkolnym lastryko w szmacianych kapciach za 35 złotych z płaską jak deska gumą.',
    failedSolutionsMath: 'Trzy pary kapci od września 115 zł + buty jesienne 290 zł + prywatna konsultacja podologiczna 200 zł = 605 zł',
    discoveryBridge: 'Podolożka pokazuje na przeciętym kapciu, co dzieje się z piętą dziecka na szkolnej posadzce, i poleca pakiet 1+1 Orthomax StepMax (jedna para na stałe w szkolnych kapciach, druga w butach zimowych).',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-18-mit-gipsu-sztywne-wkladki',
    number: 18,
    code: '18_mit_gipsu_sztywne_wkladki_nfz',
    title: 'Wydałam 380 zł na twarde wkładki na zamówienie. Córka miała krwawe pęcherze, a fizjoterapeuta złapał się za głowę: „Założyła pani dziecku gips na mięśnie"',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Koszyk 4 · Stage 3 Wypalone Matki',
    awarenessStage: 'Stage 3 (Solution Aware - Obiekcja D8: "Wkładki rozleniwiają mięśnie")',
    sophistication: 'Stage 4 (Stare sztywne korytka z plastiku vs Dynamiczna sprężyna StepMax)',
    narrator: 'Małgorzata (40 lat, Gdańsk)',
    protagonist: 'Kasia (10 lat)',
    hookIdea: 'Myślałam, że skoro płacę 380 złotych w punkcie ortopedycznym za „indywidualne wkładki z odlewu", to kupuję mojemu dziecku najlepsze możliwe rozwiązanie. Po czterech dniach Kasia wróciła ze szkoły z płaczem i bolesnymi odciskami pod łukiem stopy, a młody fizjoterapeuta wziął tę twardą jak kamień wkładkę do ręki, postukał nią o biurko i powiedział: „Proszę to wyrzucić do kosza".',
    sceneBeat: 'Rozbicie największego mitu: dlaczego lekarze starej daty mówią czasem, że "wkładki rozleniwiają stopę"? Bo mówią o sztywnych, plastikowych korytkach z NFZ, które unieruchamiają stopę jak gips. Stopa dziecka potrzebuje dynamicznej trampoliny (StepMax), która stabilizuje piętę, ale ugina się i zmusza mięśnie do aktywnego skurczu przy każdym kroku.',
    failedSolutionsMath: 'Twarde wkładki na zamówienie 380 zł + badanie komputerowe w punkcie 120 zł + wizyta u fizjoterapeuty 190 zł = 690 zł',
    discoveryBridge: 'Fizjoterapeuta zgina w dłoni elastyczną wkładkę Orthomax StepMax i porównuje ją ze sztywną deską za 380 zł.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-19-gimnastyka-korekcyjna-fikcja',
    number: 19,
    code: '19_gimnastyka_korekcyjna_w_szkole_fikcja',
    title: 'Usypiałam swoje sumienie tym, że zapisałam córkę na szkolną gimnastykę korekcyjną. Na kontroli w październiku przeżyłam lodowaty prysznic.',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Koszyk 4 · Stage 3 Wypalone Matki',
    awarenessStage: 'Stage 3 (Fałszywe poczucie bezpieczeństwa)',
    sophistication: 'Stage 4 (30 minut w grupie 22 dzieci raz w tygodniu vs 200 000 kroków miesięcznie)',
    narrator: 'Małgorzata (38 lat, Wrocław)',
    protagonist: 'Zosia (9 lat)',
    hookIdea: 'Przez cały zeszły rok szkolny miałam czyste sumienie, bo zapisałam Zosię na szkolną gimnastykę korekcyjną w świetlicy. Kiedy w październiku poszłyśmy na kontrolę do ortopedy i zobaczyłam, że kąt koślawości jej kolan powiększył się z 8 do 12 stopni, zapytałam w szoku: „Jak to możliwe, przecież chodzi na korektywę?!".',
    sceneBeat: 'Ortopeda liczy na kartce: 30 minut raz w tygodniu w grupie 20 dzieci, gdzie dziecko realnie ćwiczy przez 6 minut, to 0,1% czasu. Przez pozostałe 99,9% tygodnia Zosia robi 50 000 kroków w płaskich butach po twardej podłodze, miażdżąc łuk stopy.',
    failedSolutionsMath: 'Prywatne zajęcia korekcyjne 480 zł + wizyty u ortopedy z RTG 340 zł + zwykłe wkładki ze sklepu 79 zł = 899 zł',
    discoveryBridge: 'Ortopeda rysuje wykres czasu pracy stopy i tłumaczy, dlaczego bez dynamicznego podparcia w bucie (Orthomax StepMax) żadna korektywa nie zatrzyma uciekającej pięty.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-20-okno-czasowe-12-lat',
    number: 20,
    code: '20_okno_czasowe_12_lat_starsza_siostra',
    title: 'Zobaczyłam 14-letnią córkę mojej szwagierki w sztywnych ortezach. Tego samego wieczoru kazałam mojej 9-letniej Kasi stanąć boso na dywanie.',
    segment: 'dzieci',
    funnelStage: 'stage3_wypalone_matki',
    funnelLabel: 'Koszyk 4 · Stage 3 Wypalone Matki',
    awarenessStage: 'Stage 2/3 (Mass Desire D1+D7: Strach przed zamknięciem okna wzrostowego i "czystym sumieniem")',
    sophistication: 'Stage 3/4 (Przyszły duch / Okno 12–13 lat)',
    narrator: 'Małgorzata (39 lat, Kraków)',
    protagonist: 'Kasia (9 lat)',
    hookIdea: 'W zeszłą niedzielę na rodzinnym obiedzie moja szwagierka rozpłakała się w kuchni. Jej czternastoletnia córka dostała właśnie kwalifikację do zabiegu operacyjnego kolan i zakaz jakiegokolwiek sportu, bo „okno wzrostowe już się zamknęło, a kości stwardniały w złej osi". Cztery lata wcześniej mówili im dokładnie to samo, co mnie: „Proszę obserwować, wyrośnie z tego".',
    sceneBeat: 'Po powrocie do domu Gosia stawia 9-letnią Kasię boso na podłodze i robi test podniesienia łuku stopy, o którym opowiadała szwagierka. Widzi dokładnie ten sam początek uciekających kostek i kolan w X. Wizyta u specjalisty potwierdza: zostały 2–3 lata miękkich chrząstek, kiedy można to odwrócić bez skalpela.',
    failedSolutionsMath: 'Szwagierka wydała ponad 6000 zł na rehabilitację po zamknięciu okna; Gosia wydała wcześniej 490 zł na wizyty i nieskuteczne półśrodki',
    discoveryBridge: 'Fizjoterapeuta prowadzący nastoletnią bratanicę mówi Gosi wprost: „U pani córki mamy jeszcze czas, niech pani natychmiast włoży jej do butów dynamiczne Orthomax StepMax".',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },

  // ==================== LEJEK ETAP 2: RYCIAK RIP 3 — NOWE WERSJE (5) ====================
  {
    id: 'pl-21-ryciak-rip3-ramie-v2',
    number: 21,
    code: '21_ryciak_rip3_ramie_jesien',
    title: '[RYCIAK RIP 3 · V1] Fizjoterapeuta wziął stopę Kasi w dłonie — ramię opadło, kolana się wyprostowały (Wersja Październik + Nowy Cennik 99,99 zł)',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Ryciak Rip 3 · Winner V1',
    awarenessStage: 'Stage 2 (Winner Fizjo / dr Ryciak)',
    sophistication: 'Stage 3 (Pełny szkielet z Menedżera Reklam + cennik 1+1 za 99,99 zł)',
    narrator: 'Małgorzata (38 lat, Gdańsk)',
    protagonist: 'Kasia (10 lat)',
    hookIdea: 'Nie miałam zamiaru tego udostępniać, ponieważ to dość osobiste, ale jeśli pomoże to choćby jednej mamie, która przestanie leczyć objawy zamiast przyczyny, to warto. Byłam u fizjoterapeuty na konsultacji z ramieniem córki. A wyszłam ze skierowaniem do ortopedy.',
    sceneBeat: 'Pełny, wierny szkielet najlepszej kreacji z konta 1 ("Fizjo / dr Ryciak"): 3 miesiące leczenia prawego ramienia, fizjoterapeuta każe Kasi przejść przez gabinet, podnosi łuk stopy dłońmi -> kolana się rozchodzą, ramiona wyrównują. Puszcza -> kostka zapada się, kolana w X, ramię wyżej. Gabinet dr. Ryciaka: łańcuch ze strzałkami ↓, RTG 12° vs norma 5-7°, 7000 kroków dziennie = 200 000 miesięcznie, okno do 12-13 r.ż., spadek z 12° do 8° w 3 miesiące. Zaktualizowany pod pakiet 1+1 za 99,99 zł (50 zł za parę) i 0 em-dashów.',
    failedSolutionsMath: 'Maść 35 zł + lekarz 150 zł + fizjoterapeuta 180 zł (365 zł) + wkładki z apteki 89 zł + specjalne buty 380 zł (469 zł) = 834 zł',
    discoveryBridge: 'Wieczorne googlowanie „ból ramienia dziecko kompensacja stopy", forum rodziców i powtarzająca się nazwa Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-22-ryciak-rip3-sor-kolano',
    number: 22,
    code: '22_ryciak_rip3_sor_kolano',
    title: '[RYCIAK RIP 3 · V2 SOR] Pojechaliśmy wieczorem na izbę przyjęć z opuchniętym kolanem syna. Lekarz dyżurny nawet nie dotknął kolana — kazał mu zdjąć buty.',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Ryciak Rip 3 · Winner V2 (SOR)',
    awarenessStage: 'Stage 2 (Ewolucja kreacji SOR 5 + dr Ryciak)',
    sophistication: 'Stage 3 (Dramatyczny hook z wieczornej izby przyjęć + łańcuch dr. Ryciaka)',
    narrator: 'Małgorzata (39 lat, Gdańsk)',
    protagonist: 'Kasia (10 lat)',
    hookIdea: 'Siedziałam z dziesięcioletnią córką trzy godziny na wieczornej izbie przyjęć, bo po zwykłym dniu w szkole nie mogła wyprostować prawego kolana. Byłam przerażona, że zerwała więzadło. Młody ortopeda dyżurny spojrzał na jej nogi, kazał jej zdjąć oba buty i powiedział zdanie, którego nie zapomnę do końca życia.',
    sceneBeat: 'Ten sam potężny silnik konwersji co w Ryciak Rip 3 (test podniesienia łuku rękami, łańcuch kompensacji ze strzałkami ↓, kontrola u dr. Ryciaka, RTG 12 stopni vs 5–7 stopni, 7 milionów kroków złym wzorcem, okno do 12 r.ż.), ale z nowym, ultra-mocnym otwarciem z wieczornego dyżuru ortopedycznego.',
    failedSolutionsMath: 'Maści i opaski 115 zł + prywatne USG kolana 250 zł + fizjoterapeuta 180 zł + wkładki z apteki 89 zł + buty 350 zł = 984 zł',
    discoveryBridge: 'Wyszukiwanie po powrocie od dr. Ryciaka „koślawość 12 stopni u dziecka jakie wkładki dynamiczne" i trafienie na forum rodziców oraz Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-23-ryciak-rip3-biodro-i-plecy',
    number: 23,
    code: '23_ryciak_rip3_biodro_plecy',
    title: '[RYCIAK RIP 3 · V3 PLECY] Przez pół roku leczyłyśmy „krzywy kręgosłup" córki. Dr Ryciak podniósł jej stopę dwoma palcami i skolioza zniknęła na moich oczach.',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Ryciak Rip 3 · Winner V3 (Plecy)',
    awarenessStage: 'Stage 2 (Rodzice przerażeni skoliozą/garbieniem się)',
    sophistication: 'Stage 3 (Szkielet Ryciak Rip 3 przeniesiony z ramienia na kręgosłup i łopatki)',
    narrator: 'Małgorzata (38 lat, Gdynia)',
    protagonist: 'Kasia (10 lat)',
    hookIdea: 'Przez cztery miesiące krzyczałam na moją dziesięcioletnią córkę: „Nie garb się, wyprostuj plecy!". Kupiłam jej korektor postawy, poduszkę ortopedyczną i zapisałam na masaże, bo bolały ją lędźwie. Dopiero w gabinecie dr. Ryciaka zrozumiałam, że jej kręgosłup wyginał się tylko dlatego, żeby nie przewróciła się przez własne stopy.',
    sceneBeat: 'Test w gabinecie krok po kroku w rytmie Ryciak Rip 3: Kasia stoi tyłem, prawa łopatka wystaje, lędźwie wygięte. Lekarz kuca, podnosi dłońmi łuki stóp -> kolana wychodzą z X, miednica wraca do poziomu, łopatki ustawiają się idealnie równo. Puszcza -> wszystko zapada się w sekundę. Strzałki kompensacji ↓ + RTG 12° -> 8°.',
    failedSolutionsMath: 'Korektor postawy 119 zł + masaże i fizjo 360 zł + wizyta lekarska 200 zł + wkładki z apteki 89 zł = 768 zł',
    discoveryBridge: 'Forum rodziców dzieci z wadami postawy i polecenie dynamicznych wkładek Orthomax StepMax w pakiecie 1+1 za 99,99 zł.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-24-ryciak-rip3-bilans-10-latka',
    number: 24,
    code: '24_ryciak_rip3_bilans_10latka',
    title: '[RYCIAK RIP 3 · V4 BILANS] Na trzech kolejnych bilansach słyszałam: „Taka jej uroda, wyrośnie". U dr. Ryciaka zobaczyłam zdjęcie piętnastolatki w ortezach.',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Ryciak Rip 3 · Winner V4 (Bilans)',
    awarenessStage: 'Stage 2 (Wściekłość na pediatrów z NFZ + Ryciak Rip 3)',
    sophistication: 'Stage 3 (Uderzenie w "z tego się wyrasta" + pełny protokół dr. Ryciaka)',
    narrator: 'Małgorzata (39 lat, Gdańsk)',
    protagonist: 'Zosia (10 lat)',
    hookIdea: 'Gdy miała 6 lat, pediatra w przychodni powiedział: „Z płaskostopia się wyrasta". Gdy miała 8 lat, usłyszałam: „Taka jej uroda, dziewczynki mają elastyczne stawy". W zeszłym miesiącu Zosia skończyła 10 lat, a dr Ryciak powiesił na podświetlanej tablicy rentgen jej kolan i powiedział cicho: „Zostało pani osiemnaście miesięcy, zanim kości stwardnieją na zawsze".',
    sceneBeat: 'Połączenie najsilniejszego hot-buttona z researchu (zdrada zaufania przez lekarza NFZ) ze sceną demonstracji łańcucha kompensacji u dr. Ryciaka (7000 kroków dziennie, 200 000 miesięcznie, kąt 12 stopni vs 5–7 stopni, zdjęcie 15-latki w ortezach, spadek do 8 stopni po 3 miesiącach w StepMax).',
    failedSolutionsMath: 'Wizyty prywatne 400 zł + buty profilaktyczne 340 zł + wkładki apteczne 95 zł = 835 zł',
    discoveryBridge: 'Grupa wsparcia mam po wizytach ortopedycznych i setki zdjęć „przed i po" z wkładkami Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-25-ryciak-rip3-ojciec-wideo',
    number: 25,
    code: '25_ryciak_rip3_wideo_w_zwolnionym_tempie',
    title: '[RYCIAK RIP 3 · V5 WIDEO] Fizjoterapeuta nagrał chód mojej córki w zwolnionym tempie na telefonie. Kiedy przesunął palcem klatka po klatce, zasłoniłam usta dłonią.',
    segment: 'dzieci',
    funnelStage: 'ryciak_rip3_variations',
    funnelLabel: 'Ryciak Rip 3 · Winner V5 (Slow-Mo)',
    awarenessStage: 'Stage 2 (Nowy wizualny hook w gabinecie + szkielet Ryciak Rip 3)',
    sophistication: 'Stage 3 (Nagranie slow-motion z poziomu podłogi + łańcuch ↓)',
    narrator: 'Małgorzata (38 lat, Poznań)',
    protagonist: 'Kasia (10 lat)',
    hookIdea: 'Przyszłyśmy do fizjoterapeuty z nawracającym bólem łydki i prawego barku u mojej dziesięcioletniej Kasi. Zamiast położyć ją na kozetce, fizjoterapeuta położył swój telefon na podłodze, włączył nagrywanie w zwolnionym tempie i kazał jej przejść boso przez gabinet. Kiedy puścił mi to nagranie klatka po klatce, zasłoniłam usta dłonią.',
    sceneBeat: 'W ułamku sekundy po dotknięciu piętą podłogi staw skokowy Kasi łamie się do środka, piszczel rotuje, kolano zapada w X, a bark podskakuje do góry. Następnie pełna ścieżka z dr. Ryciakiem, tablicą ze strzałkami ↓, RTG 12° i kontrolą po 3 miesiącach noszenia Orthomax StepMax.',
    failedSolutionsMath: 'Maści i plastry rozgrzewające 75 zł + dwie wizyty lekarskie 350 zł + fizjoterapia 180 zł + wkładki z apteki 89 zł = 694 zł',
    discoveryBridge: 'Komentarze rodziców pod filmem instruktażowym o kompensacji chodu i zamówienie Orthomax StepMax w promocji 1+1 za 99,99 zł.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },

  // ==================== LEJEK ETAP 3: ŻAL PO OPERACJI (5) ====================
  {
    id: 'pl-26-zal-po-operacji-za-pozno',
    number: 26,
    code: '26_zal_po_operacji_za_pozno',
    title: '[ŻAL PO OPERACJI · V1] „Na moją lewą stopę jest już za późno. Ale prawą uratowałam za 99 złotych, zanim chirurg zdążył wbić w nią śruby"',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Żal po operacji · Winner V1',
    awarenessStage: 'Stage 3/4 (Kobiety rozważające zabieg haluksa / cierpiące z bólu)',
    sophistication: 'Stage 4 (Adaptacja winnera 9.5/10 "Gosia: Za późno" pod nowy cennik 99,99 zł)',
    narrator: 'Małgorzata (44 lata, Warszawa)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea: 'Na moją lewą stopę jest już za późno. Mam na niej siedmiocentymetrową bliznę, dwie tytanowe śruby w kości, wydałam 8200 złotych i straciłam trzydzieści procent ruchomości stawu na resztę życia. Ale moją prawą stopę, na której zaczynał się dokładnie ten sam koszmar, uratowałam bez skalpela.',
    sceneBeat: 'Brutalny, fizyczny opis 6 tygodni po osteotomii zimą: spanie po 2 godziny z nogą na poduszkach, wycie z bólu przy zejściu do toalety, cuchnący potem sztywny but pooperacyjny, 640 zł wydane na Ubera, bo nie da się wcisnąć sprzęgła. 6 tygodni po zabiegu fizjoterapeuta mówi prawdę: chirurg ściął wystającą kość (skutek), ale przyczyną był zapadnięty łuk podłużny. Prawa stopa dostaje dynamiczne wkładki Orthomax StepMax — ból znika, progresja zatrzymana w 100%.',
    failedSolutionsMath: 'Operacja prywatna 6500 zł + but pooperacyjny, leki, zastrzyki przeciwzakrzepowe 460 zł + taksówki 640 zł + rehabilitacja 600 zł = 8200 zł',
    discoveryBridge: 'Fizjoterapeuta rehabilitujący lewą stopę po operacji pokazuje na modelu, dlaczego prawa stopa za 2 lata trafi pod nóż, jeśli nie dostanie dynamicznego podparcia łuku Orthomax StepMax.',
    defaultHeadline: DOROSLI_DEFAULT_HEADLINE,
  },
  {
    id: 'pl-27-zal-haluks-wrocil-po-2-latach',
    number: 27,
    code: '27_zal_haluks_wrocil_po_2_latach',
    title: '[ŻAL PO OPERACJI · V2] Moja siostra zapłaciła 8100 zł za wycięcie haluksa i wyła z bólu przez 6 tygodni. Po dwóch latach kość wyszła z powrotem.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Żal po operacji · Nawrót',
    awarenessStage: 'Stage 3 (Kobiety z haluksami i bólem przodostopia)',
    sophistication: 'Stage 4 (Wycięcie skutku vs naprawa przyczyny biomechanicznej)',
    narrator: 'Małgorzata (46 lat, Poznań)',
    protagonist: 'Siostra Ania (49 lat)',
    hookIdea: 'Kiedy moja starsza siostra Ania pokazała mi w październiku swoją prawą stopę i rozpłakała się w mojej kuchni, obie zaniemówiłyśmy. Dwa lata temu zapłaciła 8100 złotych za operację haluksa. Przeszła przez sześć tygodni piekła o kulach. A dziś kość przy paluchu znów wystaje pod kątem i pali żywym ogniem w zimowych butach.',
    sceneBeat: 'Dlaczego haluks odrasta po operacji? Bo chirurg piłą ścina narośl na I kości śródstopia, ale kiedy pacjentka wstaje i robi 6000 kroków dziennie z zapadniętym łukiem podłużnym i poprzecznym, masa ciała przy każdym kroku znów spycha paluch do środka. Gosia miała skierowanie na ten sam zabieg na listopad — odwołała go po wizycie u biomechanika i włożeniu Orthomax StepMax.',
    failedSolutionsMath: 'Aparaty korekcyjne na noc (które łamały palec i nie działały w bucie) 180 zł + silikonowe kliny 65 zł + prywatne konsultacje 450 zł = 695 zł (plus 8100 zł siostry)',
    discoveryBridge: 'Biomechanik stopy, do którego poszły razem po nawrocie u Ani, tłumaczy mechanizm zapadającego się łuku i poleca dynamiczne wkładki Orthomax StepMax.',
    defaultHeadline: DOROSLI_DEFAULT_HEADLINE,
  },
  {
    id: 'pl-28-zal-operacja-kolan-nastolatki',
    number: 28,
    code: '28_zal_po_operacji_kolan_dziecka',
    title: '[ŻAL PO OPERACJI · DZIECKO] „Mamo, dlaczego inne dzieci biegają, a ja mam śruby w kolanach?" — list matki, która posłuchała słów „z tego się wyrasta"',
    segment: 'dzieci',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Żal po operacji · Dzieci',
    awarenessStage: 'Stage 2/3 (Najwyższa stawka emocjonalna D1+D7 — Czyste sumienie matki)',
    sophistication: 'Stage 4 (Odwrócona perspektywa: matka po zabiegu starszego dziecka ratuje młodsze)',
    narrator: 'Małgorzata (42 lata, Łódź)',
    protagonist: 'Starsza córka Maja (14 lat) i młodsza Zosia (8 lat)',
    hookIdea: 'Piszę ten post, siedząc przy łóżku mojej czternastoletniej córki Mai, która ma założone sztywne ortezy na obu nogach i metalowe płytki blokujące chrząstki wzrostowe w kolanach. Gdybym pięć lat temu nie uwierzyła lekarzowi z przychodni, że „z końskich kolan i płaskich stóp się wyrasta", moje dziecko nie przechodziłoby dziś przez to piekło.',
    sceneBeat: 'Przejmujący kontrast: u 14-letniej Mai okno wzrostowe zamknęło się i jedynym ratunkiem była hemiepifizjodeza (blaszki na śrubach w kolanach, ból, blizny, pół roku bez normalnego chodzenia). Ale Gosia ma też młodszą, 8-letnią Zosię, u której zobaczyła identyczne zapadanie kostek. U Zosi zadziałała natychmiast wkładkami Orthomax StepMax — po 4 miesiącach stopy i kolana młodszej córki są proste.',
    failedSolutionsMath: 'Koszty okołooperacyjne, rehabilitacja i ortezy starszej córki: 5400 zł vs 99,99 zł za dwie pary wkładek dla młodszej córki',
    discoveryBridge: 'Fizjoterapeuta na oddziale rehabilitacji dziecięcej mówi Gosi, jak uchronić młodszą córkę przed losem starszej siostry za pomocą dynamicznych wkładek Orthomax StepMax.',
    defaultHeadline: PORADY_MAMY_GOSI_HEADLINE,
  },
  {
    id: 'pl-29-zal-wozek-inwalidzki-beata',
    number: 29,
    code: '29_zal_wozek_inwalidzki_genetic_ghost',
    title: '[ŻAL / STRACH PRZED KALECTWEM] Moja mama usiadła na wózku w wieku 58 lat przez zniszczone stawy. Ja mam 52 lata, a w zeszłym tygodniu mąż musiał zamontować mi uchwyt pod prysznicem.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Żal po operacji · Genetic Ghost',
    awarenessStage: 'Stage 2/3 (Kobiety 45–65 lat — strach przed utratą samodzielności)',
    sophistication: 'Stage 4 (Adaptacja winnera 9.5/10 "Beata: Wózek" pod nowy cennik 99,99 zł)',
    narrator: 'Beata (52 lata, Kraków)',
    protagonist: 'Beata i mąż Andrzej',
    hookIdea: 'Kiedy w zeszłą sobotę mój mąż Andrzej wiercił w kafelkach pod prysznicem dziury pod metalowy uchwyt dla niepełnosprawnych, zamknęłam się w sypialni i wyłam w poduszkę. Moja mama miała dokładnie 56 lat, kiedy przez zdeformowane stopy i zniszczone kolana przestała wychodzić z mieszkania. Ja mam 52 lata. Zostały mi cztery lata.',
    sceneBeat: 'Andrzej nagrywa na telefonie z ukrycia, jak Beata idzie przez parking pod Kauflandem: kołysze się z boku na bok, kostki wygięte pod kątem 20 stopni do środka. 65 milionów kroków w życiu na twardym betonie z opadniętym łukiem. Wyliczenie 8750 zł wydanych na zastrzyki z kwasu hialuronowego, falę uderzeniową i maści. Przełom po włożeniu dynamicznych wkładek Orthomax StepMax.',
    failedSolutionsMath: 'Zastrzyki w kolana 2400 zł + trzy serie rehabilitacji i fali uderzeniowej 3800 zł + twarde wkładki na zamówienie i buty 1650 zł + leki i maści 900 zł = 8750 zł',
    discoveryBridge: 'Komentarz pod artykułem ortopedycznym od kobiety w tym samym wieku, która uniknęła endoprotezy dzięki podparciu łuku wkładkami Orthomax StepMax.',
    defaultHeadline: DOROSLI_DEFAULT_HEADLINE,
  },
  {
    id: 'pl-30-zal-zastrzyki-sterydowe-pieta',
    number: 30,
    code: '30_zal_zastrzyki_sterydowe_w_piete',
    title: '[ŻAL PO ZABIEGACH] Dałam sobie wbić trzy blokady sterydowe prosto w piętę i wydałam 1400 zł na falę uderzeniową. Nikt mi nie powiedział, że steryd rozpuszcza poduszkę tłuszczową pięty.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Żal po operacji · Blokada w piętę',
    awarenessStage: 'Stage 3/4 (Ostroga piętowa / Zapalenie rozcięgna podeszwowego)',
    sophistication: 'Stage 4 (Dlaczego fala uderzeniowa i blokady zawodzą bez podparcia łuku)',
    narrator: 'Małgorzata (47 lat, Wrocław)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea: 'Kto nigdy nie miał wbitej długiej igły ze sterydem prosto w żywe rozcięgno pod piętą, ten nie wie, czym jest ból, przy którym gryzie się własną torebkę na kozetce. Przeszłam przez trzy takie blokady i dziesięć zabiegów fali uderzeniowej za 1400 złotych. Ból wrócił po sześciu tygodniach dwa razy silniejszy.',
    sceneBeat: 'Młody podolog tłumaczy, dlaczego ból ostrogi i rozcięgna zawsze wraca po fali uderzeniowej: rozcięgno to lina rozpięta między piętą a palcami. Gdy łuk stopy opada przy każdym kroku, ta lina naciąga się jak cięciwa łuku i rwie przyczep przy kości piętowej. Rozbijanie zwapnienia falą bez podparcia łuku od spodu to jak zszywanie rany i rozrywanie jej na nowo przy każdym wyjściu z gabinetu.',
    failedSolutionsMath: '10 zabiegów fali uderzeniowej 800 zł + 3 blokady sterydowe prywatnie 600 zł + silikonowe podpiętniki z dziurką 90 zł = 1490 zł',
    discoveryBridge: 'Podolog pokazuje na rysunku, jak dynamiczne podparcie łuku i strefa amortyzacji pod piętą w Orthomax StepMax zdejmują naciąg z rozcięgna od pierwszego kroku.',
    defaultHeadline: DOROSLI_DEFAULT_HEADLINE,
  },

  // ==================== LEJEK ETAP 4: DOROŚLI JESIEŃ / ZIMA (5) ====================
  {
    id: 'pl-31-dorosli-zimowe-botki',
    number: 31,
    code: '31_dorosli_zimowe_botki_pazdziernik',
    title: '[DOROŚLI ZIMA · V1] W zeszły wtorek było 5 stopni rano. Wyciągnęłam z szafy moje skórzane botki z zeszłej zimy i nie byłam w stanie zasunąć zamka.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Jesień/Zima V1',
    awarenessStage: 'Stage 2 (Sezonowy trigger październik/listopad — zmiana butów na zakryte)',
    sophistication: 'Stage 3 (Płaskostopie poprzeczne: stopa "rozlewa się" po lecie w miękkich klapkach)',
    narrator: 'Małgorzata (45 lat, Warszawa)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea: 'Przez całe lato chodziłam w szerokich, miękkich klapkach i udawałam, że piekąca kość przy paluchu nie robi się coraz większa. W zeszły wtorek rano termometr pokazał 5 stopni, więc wyjęłam z pudła moje ulubione skórzane botki z zeszłej zimy. Włożyłam lewą stopę, pociągnęłam za zamek i poczułam taki strzał żywego ognia w śródstopiu, że usiadłam z powrotem na łóżku.',
    sceneBeat: 'Przez 4 miesiące lata bez podparcia łuk poprzeczny i podłużny opadł jeszcze niżej, kości śródstopia rozjechały się na boki jak wachlarz (stopa poszerzyła się o prawie centymetr), a paluch wykrzywił się mocniej. W twardym jesiennym bucie każdy krok po chodniku to tortura.',
    failedSolutionsMath: 'Rozciąganie butów u szewca 80 zł + nowe szersze botki o rozmiar większe 390 zł + żelowe separatory i plastry 110 zł = 580 zł',
    discoveryBridge: 'Koleżanka z pracy (która stoi 8 godzin dziennie w zimowych butach bez bólu) pokazuje w pokoju socjalnym pomarańczowo-czarne wkładki Orthomax StepMax.',
    defaultHeadline: DOROSLI_DEFAULT_HEADLINE,
  },
  {
    id: 'pl-32-dorosli-pierwszy-krok-rano',
    number: 32,
    code: '32_dorosli_pierwszy_krok_rano_6_00',
    title: '[DOROŚLI ZIMA · V2] Kiedy o 6:00 rano dzwoni budzik, przez pierwsze dziesięć minut idę do łazienki trzymając się ściany, jakby ktoś wbijał mi rozżarzony gwóźdź w piętę.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Jesień/Zima V2',
    awarenessStage: 'Stage 2/3 (Poranny ból pięty i śródstopia)',
    sophistication: 'Stage 3 (Mikronaderwania rozcięgna sklejające się w nocy i rozrywane przy pierwszym kroku)',
    narrator: 'Małgorzata (48 lat, Gdańsk)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea: 'Najgorszy moment mojego dnia nie jest po ośmiu godzinach pracy. Najgorsza jest godzina szósta rano, kiedy spuszczam bose stopy z łóżka na podłogę. Pierwsze dziesięć kroków do łazienki robię na palcach, trzymając się framugi drzwi i szafek, bo pod piętami czuję ból, jakby ktoś nadepnął na tłuczone szkło.',
    sceneBeat: 'Dokładne, obrazowe wyjaśnienie mechanizmu porannego bólu: w ciągu dnia zapadający się łuk stopy rwie włókna rozcięgna podeszwowego. W nocy stopa opada, a organizm próbuje „skleić" mikrouszkodzenia. Rano stajesz całym ciężarem ciała na płaskiej stopie i jednym ruchem zrywasz świeży opatrunek.',
    failedSolutionsMath: 'Maści z diklofenakiem i żywokostem 145 zł + domowe moczenie w soli i occie + wkładki żelowe z apteki 79 zł + wizyta lekarska 220 zł = 444 zł',
    discoveryBridge: 'Artykuł fizjoterapeuty o „porannym teście pierwszego kroku" i zamówienie dynamicznych wkładek Orthomax StepMax (jedna para do domowych kapci przy łóżku, druga do butów wyjściowych w pakiecie 1+1 za 99,99 zł).',
    defaultHeadline: DOROSLI_DEFAULT_HEADLINE,
  },
  {
    id: 'pl-33-dorosli-praca-stojaca-8h',
    number: 33,
    code: '33_dorosli_8_godzin_na_nogach_w_pracy',
    title: '[DOROŚLI ZIMA · V3] Po ośmiu godzinach na nogach w pracy wracam o 17:00 do domu, zdejmuję buty w przedpokoju i do wieczora nie jestem w stanie ustać przy kuchence.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Jesień/Zima V3',
    awarenessStage: 'Stage 2 (Kobiety pracujące na stojąco: sklep, szkoła, szpital, salon, kuchnia)',
    sophistication: 'Stage 3 (Krążenie, palące poduszki pod palcami i łańcuch do lędźwi)',
    narrator: 'Małgorzata (43 lata, Katowice)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea: 'Przez ostatni rok mój rytuał po powrocie z pracy o siedemnastej wyglądał tak samo: zrzucałam buty w przedpokoju, łykałam tabletkę przeciwbólową i kładłam się na kanapie z nogami na oparciu, bo poduszki pod palcami i pięty paliły mnie tak, że nie byłam w stanie ustać dwudziestu minut przy garnkach.',
    sceneBeat: 'Ból po 8 godzinach stania na twardej posadzce nie wynika ze „starości" ani z żylaków, tylko z tego, że bez wsparcia łuku cała masa ciała miażdży główki kości śródstopia i piętę, odcinając amortyzację i wbijając napięcie prosto w odcinek lędźwiowy kręgosłupa.',
    failedSolutionsMath: 'Trzy pary „wygodnych" butów do pracy 680 zł + piankowe wkładki z drogerii (które ubiły się na naleśnik po tygodniu) 60 zł + tabletki i żele chłodzące 180 zł = 920 zł',
    discoveryBridge: 'Pielęgniarka z oddziału zabiegowego, która robi po 12 godzin dyżuru na twardym korytarzu, poleca w komentarzu dynamiczne wkładki z punktami masującymi Orthomax StepMax.',
    defaultHeadline: DOROSLI_DEFAULT_HEADLINE,
  },
  {
    id: 'pl-34-dorosli-moja-62-letnia-mama',
    number: 34,
    code: '34_dorosli_moja_62_letnia_mama',
    title: '[PORADY MAMY GOSI · O MAMIE] Moja 62-letnia mama przestała wychodzić z moimi dziećmi do parku. Powiedziała, że „jest zmęczona", ale prawda wyszła na jaw, gdy spojrzałam na jej stopy.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Jesień/Zima V4 (Mama Gosi)',
    awarenessStage: 'Stage 2 (Podwójny target: kobiety 55+ czytające o sobie ORAZ córki 35-45 kupujące mamie)',
    sophistication: 'Stage 3 (Idealny most z profilu "Porady Mamy Gosi" na segment dorosły + pakiet 2+2)',
    narrator: 'Małgorzata (38 lat, Gdańsk)',
    protagonist: 'Mama Gosi — Teresa (62 lata)',
    hookIdea: 'Moja sześćdziesięciodwuletnia mama zawsze była wulkanem energii, który zabierał moje dzieci na dwugodzinne spacery do lasu. Tej jesieni za każdym razem, gdy dzwoniłam zapytać, czy pójdzie z nami do parku, słyszałam wymówkę: „Gosiu, zostańcie dziś, coś mnie głowa ćmi". Prawda wyszła na jaw w zeszłą niedzielę, kiedy weszłam do jej mieszkania bez zapowiedzi i zobaczyłam, jak moczy stopy w misce z ciepłą wodą i płacze.',
    sceneBeat: 'Mama Gosi przez 35 lat pracy na nogach doprowadziła do całkowitego opadnięcia łuków stóp, poszerzenia przodostopia i ostrogi piętowej. Wstydziła się przyznać córce, że po przejściu 400 metrów w jesiennych półbutach czuje, jakby chodziła po rozżarzonych węglach. Gosia, która wcześniej uratowała stopy swojej córki Kasi wkładkami Orthomax StepMax, zamawia pakiet dla mamy i dla siebie.',
    failedSolutionsMath: 'Mama wydała z emerytury 620 zł na aparaty na haluksy z gazetki, maści końskie i bezużyteczne wkładki z ryneczku',
    discoveryBridge: 'Gosia zna już Orthomax StepMax z historii swojej córki i zamawia rozmiar dorosły dla mamy (oraz dla siebie do jesiennych butów w pakiecie 1+1 za 99,99 zł).',
    defaultHeadline: DOROSLI_DEFAULT_HEADLINE,
  },
  {
    id: 'pl-35-dorosli-buty-o-rozmiar-wieksze',
    number: 35,
    code: '35_dorosli_buty_o_rozmiar_wieksze',
    title: '[DOROŚLI ZIMA · V5] Przez 30 lat nosiłam rozmiar 38. W tym roku w sklepie obuwniczym musiałam poprosić o rozmiar 40, żeby zmieścić piekące śródstopie.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Jesień/Zima V5',
    awarenessStage: 'Stage 2 (Upokorzenie w sklepie obuwniczym jesienią)',
    sophistication: 'Stage 3 (Stopa nie urosła na długość — zapadł się łuk i rozlała się na szerokość)',
    narrator: 'Małgorzata (50 lat, Kraków)',
    protagonist: 'Małgorzata (sama o sobie)',
    hookIdea: 'Całe dorosłe życie nosiłam rozmiar 38. W zeszłą sobotę poszłam do galerii kupić zimowe kozaki i po przymierzeniu szóstej pary wyszłam z przymierzalni z czerwonymi ze wstydu policzkami, bo musiałam poprosić ekspedientkę o rozmiar 40. Długość była za duża o dwa palce, ale w rozmiarze 38 moja stopa na szerokość dusiła się jak w imadle.',
    sceneBeat: 'Dlaczego po czterdziestce „rośnie" stopa? Kości nie rosną. Opada sklepienie podłużne i poprzeczne — stopa zapada się jak namiot, z którego wyjęto maszt, i rozlewa na długość oraz szerokość, wypychając kość przy paluchu. Kupowanie za dużych butów tylko pogarsza sprawę, bo pięta lata luźno i jeszcze bardziej koślawi staw skokowy.',
    failedSolutionsMath: 'Dwie pary nietrafionych butów 740 zł + wkładki skórzane 69 zł + wizyta u podologa 180 zł = 989 zł',
    discoveryBridge: 'Podolożka pokazuje test: po podparciu łuku dynamiczną wkładką Orthomax StepMax stopa „zbiera się" z powrotem w swoją naturalną oś i bez bólu wchodzi w swój prawdziwy rozmiar.',
    defaultHeadline: DOROSLI_DEFAULT_HEADLINE,
  },
];

export const ANTKI_PL_SYSTEM_PROMPT = `Jesteś elitarnym polskim copywriterem direct-response piszącym natywne długie posty sprzedażowe (MSL / Antki) na Facebooka pod markę Orthomax (profilowane wkładki dynamiczne StepMax, sklep: orthomax.pl).
Teksty publikowane są głównie z fanpage'a „Porady Mamy Gosi" (zweryfikowany profil) i muszą brzmieć w 100% jak prawdziwa, osobista, wstrząsająca relacja polskiej matki lub dorosłej kobiety.

=== 1. TWARDE, NIENEGOCJOWALNE ZASADY WŁAŚCICIELA (CHECKLISTA) ===
1. ZAWSZE BEZ HAMULCÓW (OD 1. DRAFTU):
   - Punkt, w którym wydaje Ci się „za mocno", to dopiero punkt wyjścia.
   - Zamiast ogólnikowych myśli pokazuj fizyczny czyn zostawiający ślad (np. starta do zera guma podeszwy, rzucony o ścianę woreczek z kaszą, gryzienie rękawa bluzy na ławce, śmierdzący potem but pooperacyjny, wiercenie uchwytu dla niepełnosprawnych pod prysznicem).
   - Zero medycznego poduszkowania i zero korporacyjnych disclaimerów.
2. ABSOLUTNY ZAKAZ EM-DASHÓW:
   - NIGDY nie używaj długiego myślnika „—" (U+2014) ani półpauzy „–" (U+2013) w tekście reklamy ani w nagłówku!
   - Zamiast tego używaj kropki, przecinka, dwukropka, nawiasu albo zwykłego krótkiego łącznika „-".
3. ZAKAZ KONSTRUKCJI „, i":
   - Nigdy nie pisz przecinka przed spójnikiem „i" (np. po wtrąceniu). Przebuduj zdanie lub rozbij je na dwa osobne zdania.
4. REJESTR PAN / PANI W DIALOGACH:
   - W rozmowach z lekarzem, fizjoterapeutą, ortopedą, nauczycielem czy ekspedientką ZAWSZE używaj naturalnego polskiego rejestru „Pan/Pani" („Widzi pani?", „Proszę spojrzeć na kolana", „Panie doktorze").
   - Na końcu tekstu, zwracając się bezpośrednio do czytelniczki na Facebooku, pisz bezpośrednio per „Ty" („Zrób test. Teraz.", „Sprawdź buty swojego dziecka").
5. MAKSYMALNIE 2-3 NAZWANE POSTACI:
   - Antek to nie telenowela. Narratorka (np. Małgorzata / Gosia lub Beata) + jedno dziecko (np. Kasia lub Zosia) / mąż / siostra + ewentualnie jedno nazwisko lekarza w kącie gabinetowym (dr Ryciak). Reszta to role: „fizjoterapeuta", „lekarz rodzinny", „nauczycielka WF-u".
6. MOMENT ODKRYCIA (BRIDGE RESEARCH -> PRODUKT):
   - Produkt NIGDY nie może spaść z nieba. Zanim padnie nazwa „Orthomax StepMax", musi pojawić się konkretny, namacalny most odkrycia (np. nocne googlowanie konkretnych fraz i trafienie na wątek na forum rodziców, gdzie powtarza się nazwa Orthomax StepMax, albo fizjoterapeuta / inna mama pokazująca pomarańczowo-czarną wkładkę).
7. TWARDA MATEMATYKA I KONKRETNE KWOTY:
   - Kwoty w sekcji nieudanych prób (failed solutions) pisz cyframi i pilnuj, żeby sumowały się CO DO ZŁOTÓWKI do podanej sumy łącznej (np. Maść 35 zł + Lekarz 150 zł + Fizjoterapeuta 180 zł = Razem: 365 zł).
   - Brak fałszywej precyzji godzin sprzed miesięcy (zamiast „o 23:42" pisz „późnym wieczorem" lub „tuż przed północą").

=== 2. FAKTY O PRODUKCIE I NOWY CENNIK (ORTHOMAX STEPMAX — PAŹDZIERNIK/ZIMA) ===
- Nazwa produktu: wkładki dynamiczne Orthomax StepMax (nigdy nie pisz „Orthomax Junior").
- Wygląd i cechy fizyczne: charakterystyczna pomarańczowo-czarna konstrukcja z wytrzymałej, sprężystej pianki o zmiennej gęstości, wyprofilowane wsparcie łuku podłużnego, głębokie korytko stabilizujące piętę (U-cup), punkty masujące pobudzające receptory czucia głębokiego, strefa amortyzacji pod piętą, linie do docięcia nożyczkami w 2 minuty (pasują do zwykłych butów zimowych, sneakersów i szkolnych kapci).
- Unikalny Mechanizm (Przewaga nad rynkiem):
  * Stare, twarde wkładki z NFZ / na zamówienie działają jak sztywny GIPS — unieruchamiają stopę, robią odciski i rozleniwiają mięśnie.
  * Miękkie żelowe wkładki z apteki/marketu za 40-80 zł zgniatają się na płaski naleśnik pod ciężarem ciała w tydzień.
  * Orthomax StepMax działa jak DYNAMICZNA TRAMPOLINA / SPRĘŻYNA: korytko trzyma kość piętową w pionie, a elastyczny łuk ugina się i oddaje energię przy każdym kroku, zmuszając mięśnie stopy do aktywnej pracy (symuluje chodzenie boso po naturalnym podłożu, podczas gdy chodzimy po betonie, lastryko i panelach).
  * Matematyka kroków: 15 minut ćwiczeń na dywanie z płaczem daje ułamek tego, co daje 7000 kroków dziennie (ponad 200 000 kroków miesięcznie) aktywnej korekcji w bucie.
- NOWY CENNIK I GWARANCJA (OBOWIĄZKOWO W KAŻDYM TEKŚCIE):
  * Pojedyncza para na stronie kosztuje 99,99 zł, ale w obecnym pakiecie 1+1 GRATIS dostajesz DWIE PARY za 99,99 zł (czyli wychodzi dokładnie 50 zł za parę!). Dostępny jest też pakiet rodzinny 2+2 GRATIS (4 pary za 154,99 zł, czyli niecałe 39 zł za parę).
  * Dlaczego 2 pary (pakiet 1+1 za 99,99 zł) to absolutny gamechanger jesienią i zimą? Bo dziecko nie musi przekładać wkładek! Jedną parę wkładasz na stałe do butów jesiennych/zimowych, a drugą do kapci szkolnych lub butów na WF (u dorosłych: jedna para do zimowych botków/butów do pracy, druga do butów domowych/codziennych).
  * GWARANCJA: 30 dni na test bez ryzyka. Nawet po docięciu wkładek nożyczkami i noszeniu ich przez miesiąc można je zwrócić i odzyskać 100% pieniędzy.
  * Link docelowy w tekście (jeśli wstawiasz lub na końcu): https://orthomax.pl/products/stepmax

=== 3. STRUKTURA I RYTM TEKSTU (STYL „PORADY MAMY GOSI" / WINNER MSL) ===
- Tekst musi być pełnowymiarowym, wciągającym MSL-em (około 650–950 słów, ok. 4000–6000 znaków).
- Rytm wizualny jak w najlepszych kreacjach na koncie Meta:
  * Krótkie, dynamiczne akapity (1–2 zdania na akapit, przeplatane krótkimi wymianami dialogowymi w osobnych linijkach w polskich cudzysłowach „...").
  * Nagłówki sekcji pisane wielkimi literami (np. TRZY TYGODNIE WCZEŚNIEJ, GABINET FIZJOTERAPEUTY, TYDZIEŃ PÓŹNIEJ - KONTROLA, DLATEGO PISZĘ TO TERAZ).
  * W części wyjaśniającej mechanizm użyj wizualnego łańcucha kompensacji ze strzałkami pionowymi w osobnych liniach:
    Stopy zapadają się do środka
    ↓
    Kolana schodzą w X
    ↓
    Biodra rotują i kompensują
    ↓
    Kręgosłup wygina się w łuk
    ↓
    Barki / kolana / plecy przyjmują całe przeciążenie
  * W części kosztowej rozpisz wydatki linijka po linijce z dokładną sumą przed przejściem do ceny Orthomax StepMax (99,99 zł za 2 pary w pakiecie 1+1, czyli 50 zł za parę).
  * Zakończ mocnym wezwaniem do wykonania prostego domowego testu DZIŚ WIECZOREM (test podniesienia łuku stopy na stojąco lub test odwrócenia podeszwy zimowego buta) i informacją o 30-dniowej gwarancji na orthomax.pl.

Zwróć wyłącznie poprawny obiekt JSON:
{
  "headline": "Nagłówek reklamy pod grafikę/karuzelę (bez em-dashów)",
  "description": "Krótki opis pod nagłówkiem (np. Pakiet 1+1 GRATIS · 30 dni na test bez ryzyka)",
  "primaryText": "Pełny tekst reklamy MSL gotowy do wklejenia w Menedżerze Reklam Meta"
}`;

/**
 * Automatyczny audytor i korektor tekstu Antka PL:
 * - usuwa em-dashe (—) i en-dashe (–)
 * - usuwa ", i "
 * - sprawdza obecność nowego cennika (99,99 zł / 50 zł) i gwarancji (30 dni)
 * - sprawdza brak starej ceny (74,99 zł / 37 zł)
 */
export function sanitizeAndAuditAntkiPl(rawText: string, rawHeadline: string, rawDescription?: string): {
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
  let headline = (rawHeadline || PORADY_MAMY_GOSI_HEADLINE).trim();
  let description = (rawDescription || 'Pakiet 1+1 GRATIS (2 pary za 99,99 zł) · 30 dni gwarancji zwrotu').trim();

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

  // 3. Replace any accidental old price 74,99 / 75 zł / 37 zł for insoles
  if (/\b74[,.]99\b|\b37\s*zł\s*za\s*parę/i.test(text)) {
    text = text
      .replace(/\b74[,.]99\s*zł(?:otych)?/gi, '99,99 zł')
      .replace(/\b75\s*zł\s*za\s*(?:2|dwie)\s*pary/gi, '99,99 zł za 2 pary w pakiecie 1+1')
      .replace(/\b37(?:[,.]50)?\s*zł\s*za\s*parę/gi, '50 zł za parę');
    fixes.push('Zaktualizowano historyczną cenę (74,99/75 zł) na aktualny cennik 99,99 zł (50 zł za parę w 1+1).');
  }

  // 4. Clean excessive blank lines
  text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  const words = (text.match(/\p{L}+(?:['’-]\p{L}+)*/gu) || []).length;
  const chars = Array.from(text).length;

  // Checks
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
  if (words < 380) {
    warnings.push(`Tekst jest dość krótki (${words} słów — celujemy w 600–950 słów).`);
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
