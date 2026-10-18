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
    narrator: 'Beata (52 lata, Kraków)',
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
- Konstrukcja i mechanizm (opisz płynnie w historii, bez wyliczanki „Mają... Mają..." i BEZ pisania o docinaniu nożyczkami): charakterystyczne pomarańczowo-czarne wkładki zrobione ze sprężystej pianki o zmiennej gęstości, korytko w kształcie litery U (U-cup) chwytające piętę z obu stron i trzymające ją w pionie, podparcie łuku stopy pracujące jak sprężyna/trampolina przy każdym z 7000 kroków dziennie, wypustki sensoryczne pobudzające mięśnie stopy oraz strefa amortyzacji pod piętą. Dzięki dokładnej rozmiarówce po wyjęciu z pudełka od razu mieszczą się w każdym zwykłym bucie (bez kupowania butów o rozmiar większych).
- NOWY CENNIK I GWARANCJA (OBOWIĄZKOWO W KAŻDYM TEKŚCIE):
  * 1 para kosztuje 99,99 zł, ale na oficjalnej stronie w pakiecie 1+1 GRATIS dostajesz DWIE PARY za 99,99 zł (czyli wychodzi dokładnie 50 zł za parę!). Dostępny jest też pakiet rodzinny 2+2 GRATIS (4 pary za 154,99 zł).
  * Dlaczego 2 pary w pakiecie 1+1 za 99,99 zł są kluczowe jesienią i zimą? Bo dziecko nie musi przekładać wkładek rano w szatni (jedna para do butów zimowych, druga do butów szkolnych na zmianę na pełne 14 godzin dnia) ORAZ nie wydajesz 380 zł co pół roku na twarde wkładki na wymiar, z których rosnąca stopa dziecka wyrasta po 5 miesiącach!
  * GWARANCJA: 30 dni na test bez ryzyka. Nawet po miesiącu normalnego noszenia i testowania wkładek w butach można je odesłać i odzyskać 100% pieniędzy.
  * Link docelowy: https://orthomax.pl/products/orthomax-stepmax

=== 5. ARCHITEKTURA NASZYCH NAJWIĘKSZYCH WINNERÓW (DŁUGOŚĆ 1100-1300 SŁÓW + KRÓTKIE AKAPITY Z ENTERAMI!) ===
KRYTYCZNE:
- Formatuj tekst w krótkich, 1-2 zdaniowych akapitach oddzielonych pustą linią (enterem), żeby lekko i przyjemnie czytało się go na telefonie na Facebooku!
- Każdy tekst MUSI mieć **1100-1300 słów** i zawierać wszystkie 7 filarów winnera:
  1. Uderzenie w środku sceny (Hook + konkretny detal, 140-180 słów)
  2. Historia matki i dziecka + „Normalizowanie" + „7 DNI OBSERWACJI" + moment, gdy matka wieczorem siada sama w kuchni i płacze z poczucia winy (250-350 słów)
  3. Kaskada nieudanych prób i dlaczego każda zawiodła + wyliczenie kosztów co do złotówki (180-240 słów)
  4. Wizualny dowód mechanizmu + Łańcuch kompensacji (↓) + 14h na szkolnym betonie i panelach + Okno wzrostowe 12-13 lat (250-300 słów)
  5. Wiarygodny most odkrycia + Płynny opis mechanizmu wkładek i dokładnej rozmiarówki (150-200 słów)
  6. Realistyczna, powolna transformacja zachowania dziecka: Dzień 1-3 -> Tydzień 2 -> Miesiąc 1 -> Miesiąc 3 (180-220 słów)
  7. Osobiste zamknięcie matki + Oferta 1+1 GRATIS (99,99 zł = 50 zł/para) + 30 dni gwarancji zwrotu + P.S. (120-160 słów)

Zwróć wyłącznie poprawny obiekt JSON:
{
  "headline": "Świeży, konkretny nagłówek w stylu Mellow dopasowany do historii (zero em-dashów, zero oklepanego 'Jeśli Twoje dziecko bolą stopy')",
  "description": "Krótki opis pod nagłówkiem (np. Pakiet 1+1 GRATIS (50 zł/para) · 30 dni na test bez ryzyka)",
  "primaryText": "Pełny, głęboki emocjonalnie tekst reklamy MSL (1100-1300 słów, podzielony enterami na krótkie 1-2 zdaniowe akapity) gotowy do wklejenia w Menedżerze Reklam Meta"
}`;

/**
 * Automatyczny audytor i korektor tekstu Antka PL:
 * - usuwa em-dashe (—) i en-dashes (–)
 * - usuwa ", i "
 * - poprawia liczbę pojedynczą "Orthomax StepMax jest zrobiony / działa / ma" na liczbę mnogą ("Wkładki Orthomax StepMax są zrobione...")
 * - usuwa sztuczne "Pani Małgosiu" z ust ekspedientki/kierowniczki sklepu przy reklamacji butów
 * - zamienia sztuczne godziny co do minuty ("o 20:07", "o 19:43") na naturalną porę dnia ("wieczorem")
 * - przepisuje wyliczankę "Mają korytko... Mają dynamiczne podparcie... Mają też wypustki..." na płynną narrację
 * - ujednolica słowny zapis godzin ("po siedemnastej" -> "po 17:00")
 * - podmienia zużyty nagłówek lub spalony opener jeśli model go użyje
 * - sprawdza obecność nowego cennika (99,99 zł / 50 zł), gwarancji (30 dni) i odpowiedniej długości (min. 950 słów, cel 1100-1300)
 */
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

  // 3. Enforce plural grammar for Orthomax StepMax ("są zrobione", "mają", "działają")
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
    fixes.push('Poprawiono formę gramatyczną Orthomax StepMax z liczby pojedynczej na mnogą (wkładki „są zrobione / działają / mają").');
  }

  // 4. Fix stranger store clerk knowing mother's first name ("Pani Małgosiu, ja pani ten wniosek/zwrot/reklamację przyjmę")
  if (/Pani\s+(?:Małgosiu|Gosiu),\s*(?:ja\s+pani\s+t(?:en|ę)\s+(?:wniosek|zwrot|reklamację)\s+przyjmę|przyjmę\s+pani\s+t(?:en|ę)\s+(?:wniosek|zwrot|reklamację))/i.test(text)) {
    text = text.replace(
      /Pani\s+(?:Małgosiu|Gosiu),\s*(?:ja\s+pani\s+t(?:en|ę)\s+(?:wniosek|zwrot|reklamację)\s+przyjmę|przyjmę\s+pani\s+t(?:en|ę)\s+(?:wniosek|zwrot|reklamację))/gi,
      'Przyjmę pani ten zwrot, proszę się nie martwić',
    );
    fixes.push('Usunięto nienaturalne zwracanie się po imieniu („Pani Małgosiu") przez pracownicę sklepu przy reklamacji butów.');
  }

  // 5. Fix hyper-specific fake timestamps (e.g., "o 20:07", "o 19:14", "W zeszły czwartek o 20:00")
  if (/\bo\s+(?:1[789]|2[0123]):(?:0[1-9]|[12345]\d)\b/i.test(text)) {
    text = text.replace(/\bo\s+(?:1[89]|2[012]):(?:0[1-9]|[12345]\d)\b/gi, 'wieczorem');
    text = text.replace(/\bo\s+17:(?:0[1-9]|[12345]\d)\b/gi, 'po południu');
    text = text.replace(/\bo\s+23:(?:0[1-9]|[12345]\d)\b/gi, 'w środku nocy');
    fixes.push('Zamieniono sztuczne, co do minuty godziny (np. „o 20:07") na naturalne określenia pory dnia („wieczorem", „w środku nocy").');
  }
  if (/W\s+zeszły\s+(?:poniedziałek|wtorek|czwartek|piątek)\s+o\s+(?:18|19|20|21):[0-5]\d/i.test(text)) {
    text = text.replace(/W\s+zeszły\s+(poniedziałek|wtorek|czwartek|piątek)\s+o\s+(?:18|19|20|21):[0-5]\d/gi, 'W zeszły $1 wieczorem');
    fixes.push('Zamieniono „W zeszły czwartek o XX:XX" na naturalne „W zeszły czwartek wieczorem".');
  }

  // 6. Fix neighbour randomly walking into bathroom uninvited
  if (/I\s+wtedy\s+do\s+łazienki\s+weszła\s+nasza\s+sąsiadka/i.test(text) || /do\s+naszej\s+łazienki\s+weszła\s+sąsiadka/i.test(text)) {
    text = text
      .replace(
        /I\s+wtedy\s+do\s+łazienki\s+weszła\s+nasza\s+sąsiadka\s+z\s+piętra\.?\s*Fizjoterapeutka\s+dziecięca\.?/gi,
        'Nie wytrzymałam, poszłam zapukać do naszej sąsiadki z piętra, która jest fizjoterapeutką dziecięcą, i poprosiłam ją o poradę. Przyszła po chwili do nas do łazienki.',
      )
      .replace(
        /do\s+naszej\s+łazienki\s+weszła\s+sąsiadka\s+z\s+piętra,\s+która\s+pracuje\s+jako\s+fizjoterapeutka\s+dziecięca/gi,
        'poprosiłam o radę naszą sąsiadkę z piętra, która pracuje jako fizjoterapeutka dziecięca, żeby zaszła na chwilę i spojrzała na jej nogi',
      );
    fixes.push('Poprawiono logikę sceny w łazience: sąsiadka-fizjoterapeutka przychodzi na wyraźną prośbę matki o poradę, a nie wchodzi sama z ulicy.');
  }

  // 7. Fix repetitive "Mają... Mają... Mają..." anaphora on product features
  const majaTripletRegex =
    /Mają\s+głębokie\s+korytko[^.\n]+\.\s*\n+\s*Mają\s+dynamiczne\s+podparcie[^.\n]+\.\s*\n+\s*Mają\s+też\s+wypustki\s+sensoryczne[^.\n]+\./i;
  if (majaTripletRegex.test(text)) {
    text = text.replace(
      majaTripletRegex,
      'korytko w kształcie litery U obejmuje w nich piętę z obu stron i trzyma ją w pionie, a podparcie łuku stopy działa przy każdym kroku jak sprężyna. Do tego delikatne wypustki sensoryczne na powierzchni cały czas pobudzają mięśnie stopy do pracy, podczas gdy miękka strefa pod piętą amortyzuje uderzenia o twardą podłogę.',
    );
    fixes.push('Zamieniono wyliczankę „Mają... Mają... Mają..." na płynny, naturalny opis działania wkładek.');
  }

  // 8. Normalize spoken clock hours ("po siedemnastej", "o dziewiętnastej" -> "po 17:00", "o 19:00")
  const spokenHours: Array<[RegExp, string]> = [
    [/\b(po|przed|około)\s+szesnastej\b/gi, '$1 16:00'],
    [/\b(po|przed|około)\s+siedemnastej\b/gi, '$1 17:00'],
    [/\b(po|przed|około)\s+osiemnastej\b/gi, '$1 18:00'],
    [/\b(po|przed|około)\s+dziewiętnastej\b/gi, '$1 19:00'],
    [/\b(po|przed|około)\s+dwudziestej\b/gi, '$1 20:00'],
    [/\bo\s+godzinie\s+szóstej\s+rano\b/gi, 'o 6:00 rano'],
    [/\bgodzina\s+szósta\s+rano\b/gi, 'godzina 6:00 rano'],
  ];
  let hoursFixed = false;
  for (const [regex, replacement] of spokenHours) {
    if (regex.test(text)) {
      text = text.replace(regex, replacement);
      hoursFixed = true;
    }
  }
  if (hoursFixed) {
    fixes.push('Ujednolicono zapis godzin zegarowych do formatu cyfrowego (np. 17:00, 19:00, 6:00).');
  }

  // 9. Replace accidental old price 74,99 / 75 zł / 37 zł for insoles
  if (/\b74[,.]99\b|\b37\s*zł\s*za\s*parę/i.test(text)) {
    text = text
      .replace(/\b74[,.]99\s*zł(?:otych)?/gi, '99,99 zł')
      .replace(/\b75\s*zł\s*za\s*(?:2|dwie)\s*pary/gi, '99,99 zł za 2 pary w pakiecie 1+1')
      .replace(/\b37(?:[,.]50)?\s*zł\s*za\s*parę/gi, '50 zł za parę');
    fixes.push('Zaktualizowano historyczną cenę (74,99/75 zł) na aktualny cennik 99,99 zł (50 zł za parę w 1+1).');
  }

  // 10. Replace broken product handle /products/stepmax with /products/orthomax-stepmax
  if (/orthomax\.pl\/products\/stepmax(?![a-z0-9-])/i.test(text)) {
    text = text.replace(/orthomax\.pl\/products\/stepmax(?![a-z0-9-])/gi, 'orthomax.pl/products/orthomax-stepmax');
    fixes.push('Naprawiono link produktowy na działający adres: https://orthomax.pl/products/orthomax-stepmax.');
  }

  // 11. Replace any accidental scissor-trimming mentions with exact sizing
  if (/po\s+(?:docięciu|przycięciu)\s+(?:wkładek\s+)?nożyczkami/i.test(text)) {
    text = text.replace(/po\s+(?:docięciu|przycięciu)\s+(?:wkładek\s+)?nożyczkami/gi, 'miesiącu normalnego noszenia w butach');
    fixes.push('Usunięto wzmiankę o docinaniu nożyczkami (wkładki mają dokładną rozmiarówkę).');
  }

  // 12. Replace overused headline if model defaulted to "Jeśli Twoje dziecko bolą stopy, przeczytaj to"
  if (/Jeśli\s+Twoje\s+dziecko\s+bolą\s+stopy/i.test(headline) && fallbackHeadline && !/Jeśli\s+Twoje\s+dziecko/i.test(fallbackHeadline)) {
    headline = fallbackHeadline;
    fixes.push('Zamieniono zużyty nagłówek „Jeśli Twoje dziecko bolą stopy..." na świeży nagłówek Mellow-style.');
  }

  // 13. Clean excessive blank lines
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
  if (/Nie miałam zamiaru tego udostępniać/i.test(text)) {
    warnings.push('Wykryto zużyty opener „Nie miałam zamiaru tego udostępniać..." - zalecane otwarcie od konkretnej sceny (Mellow style).');
  }
  if (/płakałam\s+razem\s+z\s+moim|płakałam\s+razem\s+z\s+moją/i.test(text)) {
    warnings.push('Uwaga na realizm: matka nie powinna płakać „razem z dzieckiem" w trakcie kłótni, tylko dopiero później sama.');
  }
  if ((text.match(/\bMają\s+/g) || []).length >= 3) {
    warnings.push('Wykryto powtarzające się wyliczenie „Mają... Mają... Mają..." - opisz budowę wkładek płynną narracją.');
  }
  if (/worek\s+z\s+kapciami|worka\s+z\s+kapciami/i.test(text)) {
    warnings.push('Wykryto frazę „worek z kapciami" (w szkole dzieci mają buty na zmianę w szatni, nie worek z kapciami).');
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
  if (words < 900) {
    warnings.push(`Tekst jest za krótki (${words} słów - nasze winnery mają 1100-1300 słów z głęboką historią matki i dziecka).`);
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
