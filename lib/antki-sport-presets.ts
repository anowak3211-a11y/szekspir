import type { AntkiPlPresetAngle } from './antki-pl';

export const ORTHOMAX_SPORT_PDP_URL = 'https://orthomax.pl/products/orthomax-stepmax-pro';

/**
 * 20 KĄTÓW SPORTOWYCH ORTHOMAX STEPMAX PRO (#82–#101 · 4 grupy × 5 Antków)
 * Docelowy URL (zduplikowany produkt sportowy): https://orthomax.pl/products/orthomax-stepmax-pro
 *
 * Grupa 1 (#82–#86): Góry, Szlaki i Trekking (`sport_gory_szlaki`)
 * Grupa 2 (#87–#91): Tenis, Padel i Sporty Kortowe (`sport_tenis_padel`)
 * Grupa 3 (#92–#96): Piłka Nożna — Orlik, Korki i Turfy (`sport_pilka_orlik`)
 * Grupa 4 (#97–#101): Bieganie po Asfalcie, Szybkie Marsze (15 000 kroków) i Hala (`sport_bieganie_marsze`)
 */
export const ANTKI_SPORT_PRESET_ANGLES: AntkiPlPresetAngle[] = [
  // ==================== GRUPA 1: GÓRY, SZLAKI I TREKKING (#82–#86) ====================
  {
    id: 'sport-82-gory-zejscie-morskie-oko-kolana',
    number: 82,
    code: 'SPORT_82_gory_zejscie_morskie_oko_kolana',
    title: '[SPORT · GÓRY #1] Ostatnie 3 kilometry zejścia z Tatr szedłem tyłem. Ratownik w schronisku kazał mi wyjąć wkładkę z butów za 850 zł',
    segment: 'dorosli',
    funnelStage: 'sport_gory_szlaki',
    funnelLabel: 'Sport · Góry i Trekking (5)',
    awarenessStage: 'Stage 2/3: Ból kolan na zejściu ze szlaku mimo drogich butów trekkingowych',
    sophistication: 'Poziom 4 (Na zejściu w stopę uderza 3-4x masa ciała, a fabryczna wkładka w bucie za 850 zł to 2 mm płaskiej gąbki)',
    narrator: 'Marek (46 lat, Kraków · Karol Mikołajczyk)',
    protagonist: 'Marek (46 lat)',
    hookIdea:
      'Ostatnie 3 kilometry zejścia znad Morskiego Oka do parkingu w Palenicy Białczańskiej schodziłem tyłem, trzymając się drewnianej barierki jak 80-letni starzec po operacji biodra.',
    sceneBeat:
      'Wyjęcie 2-milimetrowej płaskiej gąbki z buta trekkingowego za 850 zł + 10-sekundowy test podniesienia łuku stopy + fizyka zejścia (300 kg nacisku przy każdym kroku w dół).',
    failedSolutionsMath:
      'Buty górskie 850 zł + opaski podrzepkowe 140 zł + maści i żele 120 zł + kolagen 220 zł = 1330 zł',
    discoveryBridge:
      'Kartka z napisem Orthomax StepMax i wieczorne wyszukanie „Orthomax StepMax opinie" przed kolejnym wyjazdem w Tatry.',
    defaultHeadline: 'Ostatnie 3 kilometry zejścia z Tatr szedłem tyłem. Ratownik w schronisku kazał mi wyjąć wkładkę z butów za 850 zł',
    defaultImageUrl: '/antki-pl-images/sport_antek_82.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-83-gory-wyjeta-wkladka-800zl',
    number: 83,
    code: 'SPORT_83_gory_wyjeta_wkladka_800zl',
    title: '[SPORT · GÓRY #2] Zapłaciłem 799 zł za buty górskie z podeszwą Vibram. Kiedy wyjąłem ze środka fabryczną wkładkę, myślałem, że to żart',
    segment: 'dorosli',
    funnelStage: 'sport_gory_szlaki',
    funnelLabel: 'Sport · Góry i Trekking (5)',
    awarenessStage: 'Stage 3: Demaskacja fabrycznych wkładek w markowych butach górskich',
    sophistication: 'Poziom 4 (Twarda podeszwa chroni od kamieni z dołu, ale od środka stopa uderza w deskę bez korytka pięty)',
    narrator: 'Piotr (49 lat, Wrocław · Karol Mikołajczyk)',
    protagonist: 'Piotr (49 lat)',
    hookIdea:
      'Przez 2 sezony wmawiałem sobie, że piekące jak żywy ogień pięty i spuchnięte kolana po 12 kilometrach w Karkonoszach to wina moich 49 lat i 6 dodatkowych kilogramów po zimie.',
    sceneBeat:
      'Zestawienie fabrycznej wkładki z buta za 799 zł ze zwykłą tekturką na biurku fizjoterapeuty + test podniesienia łuku i łańcuch kompensacji.',
    failedSolutionsMath:
      'Buty trekkingowe 799 zł + skarpety merino 160 zł + żelowe wkładki z marketu 49 zł + twarde wkładki na wymiar 400 zł = 1408 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax od fizjoterapeuty i zamówienie Pakietu 1+1 GRATIS z 30-dniową gwarancją zwrotu.',
    defaultHeadline: 'Zapłaciłem 799 zł za buty górskie z podeszwą Vibram. Kiedy wyjąłem ze środka fabryczną wkładkę, myślałem, że to żart',
    defaultImageUrl: '/antki-pl-images/sport_antek_83.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-84-gory-karkonosze-zona-schronisko',
    number: 84,
    code: 'SPORT_84_gory_karkonosze_zona_schronisko',
    title: '[SPORT · GÓRY #3] Znajomi zeszli ze Śnieżki na obiad, a ja siedziałam na kamieniu przy szlaku i łykałam 2. tabletkę Ketonalu',
    segment: 'dorosli',
    funnelStage: 'sport_gory_szlaki',
    funnelLabel: 'Sport · Góry i Trekking (5)',
    awarenessStage: 'Stage 2/3: Kobiety 45-60 lat — ból kolan i pięt na górskich szlakach',
    sophistication: 'Poziom 4 (Zejście po kamiennym bruku ze Śnieżki vs dynamiczna stabilizacja pięty i łuku)',
    narrator: 'Iwona (52 lata, Poznań · Iwona Kożuchowska)',
    protagonist: 'Iwona (52 lata)',
    hookIdea:
      'Kiedy 4 naszych znajomych siedziało już na dole w Karpaczu przy ciepłym obiedzie, ja siedziałam na drewnianej ławie w połowie zejścia ze Śnieżki z rozsznurowanym butem, łykałam 2. tabletkę Ketonalu i modliłam się, żeby mijający nas turyści nie patrzyli na moje mokre od łez oczy.',
    sceneBeat:
      'Upokorzenie na szlaku w Karkonoszach + schodzenie po schodach jak na szczudłach przez tydzień + 10-sekundowy test u fizjoterapeuty.',
    failedSolutionsMath:
      'Opaski na kolana 130 zł + żelowe wkładki 39 zł + sztywne wkładki z punktu medycznego 400 zł + wizyty i leki 380 zł = 949 zł',
    discoveryBridge:
      'Kartka z gabinetu z nazwą Orthomax StepMax i dopisanie w domu „opinie" w wyszukiwarce.',
    defaultHeadline: 'Znajomi zeszli ze Śnieżki na obiad, a ja siedziałam na kamieniu przy szlaku i łykałam 2. tabletkę Ketonalu',
    defaultImageUrl: '/antki-pl-images/sport_antek_84.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-85-gory-fizjo-3x-masa-ciala',
    number: 85,
    code: 'SPORT_85_gory_fizjo_3x_masa_ciala',
    title: '[SPORT · GÓRY #4 · FIZJO] Co poniedziałek w moim gabinecie siadają ludzie, którzy weszli na szczyt bez zadyszki, a na zejściu zniszczyli kolana',
    segment: 'dorosli',
    funnelStage: 'sport_gory_szlaki',
    funnelLabel: 'Sport · Góry i Trekking (5)',
    awarenessStage: 'Stage 3/4: Autorytet fizjoterapeuty — dlaczego kolana wysiadają na zejściu z gór',
    sophistication: 'Poziom 4 (Po 3h podejścia mięśnie stopy puszczają, a na zejściu 3-4x masa ciała wgniata łuk w płaską podeszwę)',
    narrator: 'Fizjoterapeuta Tomasz (41 lat, Katowice · Centrum Dobrego Kroku)',
    protagonist: 'Pacjent Andrzej (47 lat)',
    hookIdea:
      'W każdy poniedziałek od wiosny do późnej jesieni w moim gabinecie fizjoterapii w Katowicach powtarza się dokładnie ten sam widok: otwierają się drzwi i wchodzi pacjent między 35. a 60. rokiem życia, który utyka na sztywnej nodze po weekendzie w Beskidach, Tatrach lub Bieszczadach.',
    sceneBeat:
      'Badanie 47-letniego Andrzeja w gabinecie: test podniesienia łuku przed lustrem + wyjaśnienie różnicy między sztywną deską za 420 zł a dynamiczną sprężyną Orthomax StepMax.',
    failedSolutionsMath:
      'Sztywne wkładki na wymiar 420 zł + zastrzyk i USG kolana 650 zł + opaski i żele 180 zł = 1250 zł',
    discoveryBridge:
      'Zalecenie gabinetowe wkładek Orthomax StepMax w Pakiecie 1+1 GRATIS (buty górskie + buty codzienne).',
    defaultHeadline: 'Co poniedziałek w moim gabinecie siadają ludzie, którzy weszli na szczyt bez zadyszki, a na zejściu zniszczyli kolana',
    defaultImageUrl: '/antki-pl-images/sport_antek_85.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-86-gory-palace-piety-po-20km',
    number: 86,
    code: 'SPORT_86_gory_palace_piety_po_20km',
    title: '[SPORT · GÓRY #5] Po pierwszym dniu w Beskidach rano w pensjonacie nie mogłam postawić bosej pięty na podłodze. Mąż odwrócił moje buty',
    segment: 'dorosli',
    funnelStage: 'sport_gory_szlaki',
    funnelLabel: 'Sport · Góry i Trekking (5)',
    awarenessStage: 'Stage 2/3: Poranny ból pięt i rozcięgna po długiej trasie górskiej',
    sophistication: 'Poziom 4 (25 000 kroków po kamieniach na zapadniętym łuku naciąga rozcięgno jak cięciwę łuku)',
    narrator: 'Katarzyna (48 lat, Łódź · Iwona Kożuchowska)',
    protagonist: 'Katarzyna (48 lat)',
    hookIdea:
      'O 6:00 rano w pensjonacie w Wiśle, po 1. dniu naszego wyjazdu w Beskidy, spuściłam nogi z łóżka na podłogę i syknęłam z bólu tak głośno, że obudziłam męża.',
    sceneBeat:
      'Poranne „szczudła" na wyjeździe w góry + wgnieciona na naleśnik wkładka fabryczna + 10-sekundowy test u fizjoterapeuty po powrocie.',
    failedSolutionsMath:
      'Żelowe podpiętki 75 zł + fala uderzeniowa 600 zł + sztywne wkładki medyczne 380 zł + maści 110 zł = 1165 zł',
    discoveryBridge:
      'Kartka od fizjoterapeuty z nazwą Orthomax StepMax i test Pakietu 1+1 GRATIS z gwarancją 30 dni.',
    defaultHeadline: 'Po pierwszym dniu w Beskidach rano w pensjonacie nie mogłam postawić bosej pięty na podłodze. Mąż odwrócił moje buty',
    defaultImageUrl: '/antki-pl-images/sport_antek_86.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },

  // ==================== GRUPA 2: TENIS, PADEL I SPORTY KORTOWE (#87–#91) ====================
  {
    id: 'sport-87-padel-poranny-gwozdz-w-piete',
    number: 87,
    code: 'SPORT_87_padel_poranny_gwozdz_w_piete',
    title: '[SPORT · PADEL/TENIS #1] W czwartek wieczorem wygrałem mecz w padla, a w piątek o 6:00 rano szedłem do łazienki trzymając się framugi',
    segment: 'dorosli',
    funnelStage: 'sport_tenis_padel',
    funnelLabel: 'Sport · Tenis i Padel (5)',
    awarenessStage: 'Stage 2/3: Poranny „gwóźdź w pięcie" (rozcięgno podeszwowe) dzień po meczu padla lub tenisa',
    sophistication: 'Poziom 4 (Pod sztuczną trawą na korcie do padla leży lity beton — setki zrywów na płaskiej wkładce rwią rozcięgno)',
    narrator: 'Tomasz (39 lat, Warszawa · Karol Mikołajczyk)',
    protagonist: 'Tomasz (39 lat)',
    hookIdea:
      'W czwartek o 21:30 wygrałem z chłopakami mecz w padla, a w piątek o 6:00 rano stałem boso w przedpokoju obok spakowanej torby z rakietą, trzymałem się kurczowo framugi drzwi i nie byłem w stanie postawić prawej pięty na podłodze.',
    sceneBeat:
      'Kontrast między euforią na korcie a porannym kalectwem o 6:00 rano + demaskacja płaskiej wkładki z butów kortowych za 580 zł + łańcuch kompensacji.',
    failedSolutionsMath:
      'Buty do padla 580 zł + fala uderzeniowa 900 zł + żelowe podpiętki 80 zł + wałek i maści 140 zł = 1700 zł',
    discoveryBridge:
      'Fizjoterapeuta sportowy zapisuje na kartce „Orthomax StepMax", a Tomasz wieczorem sprawdza opinie i bierze Pakiet 1+1.',
    defaultHeadline: 'W czwartek wieczorem wygrałem mecz w padla, a w piątek o 6:00 rano szedłem do łazienki trzymając się framugi',
    defaultImageUrl: '/antki-pl-images/sport_antek_87.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-88-padel-hamowanie-bokiem-kostka',
    number: 88,
    code: 'SPORT_88_padel_hamowanie_bokiem_kostka',
    title: '[SPORT · PADEL/TENIS #2] Przy dobiegu do skrótu na korcie moja prawa stopa wyjechała w bucie, a w kolanie strzeliło tak, że usłyszeli to obok',
    segment: 'dorosli',
    funnelStage: 'sport_tenis_padel',
    funnelLabel: 'Sport · Tenis i Padel (5)',
    awarenessStage: 'Stage 2/3: Przeciążenia boczne (split-step), uciekająca kostka i kłucie w kolanie na korcie',
    sophistication: 'Poziom 4 (80% ruchów na korcie to hamowanie bokiem — bez głębokiego korytka pięta wyjeżdża, a siła skrętna idzie w łąkotkę)',
    narrator: 'Michał (42 lata, Gdańsk · Karol Mikołajczyk)',
    protagonist: 'Michał (42 lata)',
    hookIdea:
      'W 2. secie środowego meczu w padla przy stanie 4:4 ruszyłem z głębi kortu do niskiego skrótu przy siatce, zahamowałem bokiem na prawej nodze i w moim kolanie strzeliło tak głośno, że usłyszeli to koledzy na sąsiednim korcie.',
    sceneBeat:
      'Mechanika hamowania bocznego na korcie + test stabilizacji kości piętowej u fizjoterapeuty sportowego.',
    failedSolutionsMath:
      'USG kolana i konsultacja 420 zł + orteza ze stalkami 260 zł + sztywne wkładki 390 zł + tejpy 120 zł = 1190 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax od fizjoterapeuty i powrót na kort z pełną stabilizacją pięty.',
    defaultHeadline: 'Przy dobiegu do skrótu na korcie moja prawa stopa wyjechała w bucie, a w kolanie strzeliło tak, że usłyszeli to obok',
    defaultImageUrl: '/antki-pl-images/sport_antek_88.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-89-tenis-achilles-sztywny-jak-lina',
    number: 89,
    code: 'SPORT_89_tenis_achilles_sztywny_jak_lina',
    title: '[SPORT · PADEL/TENIS #3] Przez 4 miesiące przed każdym meczem tenisa smarowałem Achillesa żelem. Fizjoterapeuta pokazał mi dziurę w mojej wkładce',
    segment: 'dorosli',
    funnelStage: 'sport_tenis_padel',
    funnelLabel: 'Sport · Tenis i Padel (5)',
    awarenessStage: 'Stage 3: Sztywne, bolesne ścięgno Achillesa i strach przed zerwaniem u graczy 35-50 lat',
    sophistication: 'Poziom 4 (Uciekająca do środka pięta wygina ścięgno Achillesa jak cięciwę łuku przy każdym wybiciu do serwisu)',
    narrator: 'Łukasz (44 lata, Poznań · Karol Mikołajczyk)',
    protagonist: 'Łukasz (44 lata)',
    hookIdea:
      'Przez 4 miesiące po każdym 2-godzinnym meczu tenisa siedziałem na drewnianej ławce przy korcie ze zdjętym butem, rozcierałem zesztywniałe jak stalowa lina ścięgno Achillesa i bałem się, że przy kolejnym starcie do skrótu usłyszę za plecami trzask pękającego ścięgna.',
    sceneBeat:
      'Pokazanie asymetrycznego wyginania ścięgna Achillesa przez pronację pięty + 10-sekundowy test wyprostowania osi ścięgna dłońmi.',
    failedSolutionsMath:
      'Buty tenisowe 620 zł + 6 wizyt fali i terapii manualnej 960 zł + żelowe podpiętki 90 zł + żele przeciwzapalne 160 zł = 1830 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax od fizjoterapeuty i zamówienie Pakietu 1+1 GRATIS.',
    defaultHeadline: 'Przez 4 miesiące przed każdym meczem tenisa smarowałem Achillesa żelem. Fizjoterapeuta pokazał mi dziurę w mojej wkładce',
    defaultImageUrl: '/antki-pl-images/sport_antek_89.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-90-padel-ranking-fizjo-kort',
    number: 90,
    code: 'SPORT_90_padel_ranking_fizjo_kort',
    title: '[SPORT · PADEL/TENIS #4 · RANKING FIZJO] Jako fizjoterapeuta sportowy oceniłem 5 metod, którymi gracze tenisa i padla po 30-tce ratują pięty i kolana',
    segment: 'dorosli',
    funnelStage: 'sport_tenis_padel',
    funnelLabel: 'Sport · Tenis i Padel (5)',
    awarenessStage: 'Stage 3/4: Edukacyjny ranking 5 metod dla graczy kortowych (od 1/10 do 9,5/10)',
    sophistication: 'Poziom 5 (Zamrożona butelka 2/10, opaski 2/10, żel z marketu 1/10, plastik 420 zł 3/10 vs dynamiczna sprężyna StepMax 9,5/10)',
    narrator: 'Fizjoterapeuta Tomasz (41 lat, Wrocław · Centrum Dobrego Kroku)',
    protagonist: 'Gracze tenisa i padla 30-55 lat',
    hookIdea:
      'Jako fizjoterapeuta sportowy we Wrocławiu w każdy poniedziałek widzę w gabinecie to samo: 30- i 40-latków, którzy po 8 godzinach siedzenia za biurkiem wychodzą wieczorem na 90 minut padla albo tenisa, a następnego dnia o 6:00 rano nie mogą stanąć na pięcie ani zejść po schodach.',
    sceneBeat:
      'Twarda ocena 5 metod (1/10 do 9,5/10) + wyjaśnienie łańcucha kompensacji przy grze na korcie.',
    failedSolutionsMath:
      'Nietrafione metody pacjentów: żelowe wkładki 39 zł + opaski 150 zł + sztywne wkładki 420 zł + fala 900 zł = 1509 zł',
    discoveryBridge:
      'Rekomendacja nr 5 (9,5/10): dynamiczne wkładki Orthomax StepMax w Pakiecie 1+1 GRATIS z 30-dniową gwarancją.',
    defaultHeadline: 'Jako fizjoterapeuta sportowy oceniłem 5 metod, którymi gracze tenisa i padla po 30-tce próbują ratować pięty i kolana',
    defaultImageUrl: '/antki-pl-images/sport_antek_90.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-91-tenis-kobieta-pieczenie-srodstopia',
    number: 91,
    code: 'SPORT_91_tenis_kobieta_pieczenie_srodstopia',
    title: '[SPORT · PADEL/TENIS #5] Po godzinie gry w tenisa czułam pod śródstopiem żywy ogień, jakbym biegała boso po rozgrzanym betonie',
    segment: 'dorosli',
    funnelStage: 'sport_tenis_padel',
    funnelLabel: 'Sport · Tenis i Padel (5)',
    awarenessStage: 'Stage 2/3: Kobiety na korcie — palący ból przodostopia, spięte łydki i kłucie w kolanie',
    sophistication: 'Poziom 4 (Tysiące lądowań na palcach przy zapadniętym łuku poprzecznym miażdżą nerwy śródstopia)',
    narrator: 'Magdalena (41 lat, Kraków · Porady Mamy Gosi)',
    protagonist: 'Magdalena (41 lat)',
    hookIdea:
      'Po 45 minutach każdego treningu tenisa musiałam schodzić na ławkę przy korcie, ściągać prawy but i rozmasowywać spód stopy dłońmi, bo pod poduszkami palców czułam żywy ogień, jakbym biegała boso po rozgrzanym do czerwoności betonie.',
    sceneBeat:
      'Test podniesienia łuku poprzecznego i podłużnego u fizjoterapeuty + łańcuch od przodostopia i pięty do kolana.',
    failedSolutionsMath:
      '2 pary butów kortowych 980 zł + skarpety kompresyjne 140 zł + żelowe wkładki 59 zł + sztywne wkładki 380 zł = 1559 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax i zamówienie Pakietu 1+1 GRATIS (1 para na kort, 2. para do butów codziennych).',
    defaultHeadline: 'Po godzinie gry w tenisa czułam pod śródstopiem żywy ogień, jakbym biegała boso po rozgrzanym betonie',
    defaultImageUrl: '/antki-pl-images/sport_antek_91.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },

  // ==================== GRUPA 3: PIŁKA NOŻNA — ORLIK, KORKI I TURFY (#92–#96) ====================
  {
    id: 'sport-92-pilka-syn-orlik-bol-piet-severa',
    number: 92,
    code: 'SPORT_92_pilka_syn_orlik_bol_piet_severa',
    title: '[SPORT · PIŁKA/ORLIK #1] Mój 11-letni syn wsiadł po treningu na Orliku do auta, zdjął korki i rozpłakał się z bólu pięt',
    segment: 'dzieci',
    funnelStage: 'sport_pilka_orlik',
    funnelLabel: 'Sport · Piłka Nożna i Orlik (5)',
    awarenessStage: 'Stage 2/3: Młodzi piłkarze (8-14 lat) — ból pięt i kolan po grze na twardym Orliku',
    sophistication: 'Poziom 4 (Cienka jak papier wkładka w korkach za 389 zł + twarda wylewka pod Orlikiem = przeciążenie kości piętowej i kolan)',
    narrator: 'Małgorzata (38 lat, Poznań · Porady Mamy Gosi)',
    protagonist: 'Syn Kuba (11 lat)',
    hookIdea:
      'Kiedy w czwartek o 19:00 skończył się trening na Orliku, mój 11-letni syn Kuba nawet nie doszedł o własnych siłach do samochodu - usiadł na ławce przy boisku, zsunął ze stóp korki i rozpłakał się z bezsilności, bo nie mógł dotknąć piętą ziemi.',
    sceneBeat:
      'Wyrok lekarza w przychodni („pół roku zakazu gry w piłkę") vs fizjoterapeuta sportowy wyjmujący tekturową wkładkę z korków za 389 zł i pokazujący test 10 sekund.',
    failedSolutionsMath:
      'Korki i turfy 640 zł + maści i żele 130 zł + prywatny ortopeda i USG 380 zł + sztywne wkładki 360 zł = 1510 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax od fizjoterapeuty sportowego i Pakiet 1+1 GRATIS (1 para do korków, 2. para do butów szkolnych).',
    defaultHeadline: 'Mój 11-letni syn wsiadł po treningu na Orliku do auta, zdjął korki i rozpłakał się z bólu pięt',
    defaultImageUrl: '/antki-pl-images/sport_antek_92.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-93-pilka-dorosli-orlik-kolana-38lat',
    number: 93,
    code: 'SPORT_93_pilka_dorosli_orlik_kolana_38lat',
    title: '[SPORT · PIŁKA/ORLIK #2] Mam 39 lat i po każdym wtorkowym meczu na Orliku przez 2 dni schodziłem po schodach bokiem, trzymając się poręczy',
    segment: 'dorosli',
    funnelStage: 'sport_pilka_orlik',
    funnelLabel: 'Sport · Piłka Nożna i Orlik (5)',
    awarenessStage: 'Stage 2/3: Dorośli gracze na Orliku (30-45 lat) — ból kolan, Achillesa i pleców przez 2 dni po meczu',
    sophistication: 'Poziom 4 (Wąskie turfy piłkarskie nie podpierają łuku stopy — po 20 min gry kostka wali się do środka i skręca kolano)',
    narrator: 'Kamil (39 lat, Wrocław · Karol Mikołajczyk)',
    protagonist: 'Kamil (39 lat)',
    hookIdea:
      'Mam 39 lat i przez ostatnie pół roku w każdą środę o 6:30 rano, dzień po naszym wtorkowym meczu na Orliku, schodziłem ze schodów we własnym mieszkaniu bokiem, kurczowo trzymając się poręczy jak 80-letni staruszek.',
    sceneBeat:
      'Wizyta u fizjoterapeuty: pokazanie, dlaczego w wąskich butach piłkarskich na ubitej sztucznej murawie łuk stopy opada i miażdży łąkotkę.',
    failedSolutionsMath:
      'Nowe turfy 420 zł + 2 opaski na kolana 160 zł + kolagen i żele 240 zł + wizyta u ortopedy 280 zł = 1100 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax od fizjoterapeuty i zamówienie Pakietu 1+1 GRATIS.',
    defaultHeadline: 'Mam 39 lat i po każdym wtorkowym meczu na Orliku przez 2 dni schodziłem po schodach bokiem, trzymając się poręczy',
    defaultImageUrl: '/antki-pl-images/sport_antek_93.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-94-pilka-korki-tektura-test',
    number: 94,
    code: 'SPORT_94_pilka_korki_tektura_test',
    title: '[SPORT · PIŁKA/ORLIK #3] Zapłaciłem 449 zł za markowe turfy na sztuczną trawę. Wyjąłem ze środka fabryczną wkładkę i zgiąłem ją w 2 palcach',
    segment: 'dorosli',
    funnelStage: 'sport_pilka_orlik',
    funnelLabel: 'Sport · Piłka Nożna i Orlik (5)',
    awarenessStage: 'Stage 3: Demaskacja fabrycznej wkładki w butach piłkarskich (korkach i turfach)',
    sophistication: 'Poziom 4 (2 mm płaskiej pianki w bucie piłkarskim vs smukła dynamiczna sprężyna ze stabilizacją pięty)',
    narrator: 'Rafał (36 lat, Katowice · Karol Mikołajczyk)',
    protagonist: 'Rafał (36 lat)',
    hookIdea:
      'W zeszłym miesiącu zapłaciłem 449 zł za nowe, markowe turfy na sztuczną trawę, a po 45 minutach czwartkowego meczu na Orliku w Katowicach siedziałem na ławce ze zdjętymi butami, bo moje pięty i śródstopie paliły tak, jakbym biegał boso po żwirze.',
    sceneBeat:
      'Dlaczego grube żelowe wkładki z marketu ślizgają się w korkach, a sztywne deski za 380 zł nie wchodzą do wąskiej cholewki vs dopasowanie Orthomax StepMax.',
    failedSolutionsMath:
      'Turfy 449 zł + żelowe wkładki sportowe 49 zł + sztywne wkładki 380 zł + maści 95 zł = 973 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax i test 30 dni gwarancji w wąskich butach piłkarskich.',
    defaultHeadline: 'Zapłaciłem 449 zł za markowe turfy na sztuczną trawę. Wyjąłem ze środka fabryczną wkładkę i zgiąłem ją w 2 palcach',
    defaultImageUrl: '/antki-pl-images/sport_antek_94.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-95-pilka-ojciec-i-syn-pakiet-1plus1',
    number: 95,
    code: 'SPORT_95_pilka_ojciec_i_syn_pakiet_1plus1',
    title: '[SPORT · PIŁKA/ORLIK #4] Myślałem, że mój 12-letni syn przesadza z bólem pięt po treningu, dopóki sam nie zagrałem 90 minut na tym Orliku',
    segment: 'dorosli',
    funnelStage: 'sport_pilka_orlik',
    funnelLabel: 'Sport · Piłka Nożna i Orlik (5)',
    awarenessStage: 'Stage 2/3: Ojciec i syn na Orliku — wspólny genetycznie opadający łuk stopy i Pakiet 1+1',
    sophistication: 'Poziom 4 (Turniej Ojcowie vs Synowie na twardej sztucznej murawie + wspólny test 10 sekund u fizjoterapeuty)',
    narrator: 'Marcin (41 lat, Gdańsk · Karol Mikołajczyk)',
    protagonist: 'Marcin (41 lat) i syn Bartek (12 lat)',
    hookIdea:
      'Przez 2 miesiące powtarzałem mojemu 12-letniemu synowi Bartkowi, żeby się nie mazał, kiedy po każdym treningu na Orliku wracał do domu i narzekał na kłucie w piętach oraz pod rzepką.',
    sceneBeat:
      'Wyrzuty sumienia ojca + wspólna wizyta u fizjoterapeuty pokazująca identyczną pronację pięty u ojca i syna + Pakiet 1+1 GRATIS.',
    failedSolutionsMath:
      'Nowe korki dla syna 360 zł + turfy ojca 390 zł + wizyta u ortopedy 260 zł + żele i opaski 140 zł = 1150 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax z gabinetu i zamówienie Pakietu 1+1 GRATIS (1 para dla syna, 2. para dla ojca).',
    defaultHeadline: 'Myślałem, że mój 12-letni syn przesadza z bólem pięt po treningu, dopóki sam nie zagrałem 90 minut w turnieju ojców na tym Orliku',
    defaultImageUrl: '/antki-pl-images/sport_antek_95.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-96-pilka-zdarte-korki-od-srodka',
    number: 96,
    code: 'SPORT_96_pilka_zdarte_korki_od_srodka',
    title: '[SPORT · PIŁKA/ORLIK #5] Trener ze szkółki piłkarskiej zawołał mnie po sparingu i kazał spojrzeć na tył korków mojego 10-letniego syna',
    segment: 'dzieci',
    funnelStage: 'sport_pilka_orlik',
    funnelLabel: 'Sport · Piłka Nożna i Orlik (5)',
    awarenessStage: 'Stage 1/2: Wykoślawione korki od środka, utrata zwrotności i ból kolan u młodego piłkarza',
    sophistication: 'Poziom 4 (Uciekająca do środka pięta w korkach zabiera ułamek sekundy przy starcie do piłki i wykręca kolano w X)',
    narrator: 'Marta (37 lat, Kraków · Porady Mamy Gosi)',
    protagonist: 'Syn Filip (10 lat)',
    hookIdea:
      'W sobotę po 40 minutach sparingu trener zdjął mojego 10-letniego syna Filipa z boiska, zawołał mnie za linię boczną i kazał spojrzeć na tył jego korków.',
    sceneBeat:
      'Pokazanie przez fizjoterapeutę, jak uciekająca w korkach pięta odbiera dziecku szybkość startu i przeciąża kolano oraz biodro.',
    failedSolutionsMath:
      '2 pary korków w sezonie 620 zł + sztywne wkładki na zamówienie (które nie weszły do korków) 380 zł + wizyta fizjo 220 zł = 1220 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax i zamówienie Pakietu 1+1 GRATIS (korki + buty szkolne).',
    defaultHeadline: 'Trener ze szkółki piłkarskiej zawołał mnie po sparingu i kazał spojrzeć na tył korków mojego 10-letniego syna',
    defaultImageUrl: '/antki-pl-images/sport_antek_96.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },

  // ==================== GRUPA 4: BIEGANIE PO ASFALCIE, SZYBKIE MARSZE (15 000 KROKÓW) I HALA (#97–#101) ====================
  {
    id: 'sport-97-bieganie-asfalt-piszczele-5km',
    number: 97,
    code: 'SPORT_97_bieganie_asfalt_piszczele_5km',
    title: '[SPORT · BIEGANIE/MARSZE #1] Za każdym razem, gdy zegarek pokazywał 5. kilometr po asfalcie, moje kolano i piszczele zaczynały palić żywym ogniem',
    segment: 'dorosli',
    funnelStage: 'sport_bieganie_marsze',
    funnelLabel: 'Sport · Bieganie, Marsze i Hala (5)',
    awarenessStage: 'Stage 2/3: Biegacze asfaltowi — kłucie w kolanie i palące piszczele (shin splints) po 5 km',
    sophistication: 'Poziom 4 (Gruba miękka pianka w bucie biegowym za 700 zł bez korytka pięty działa jak materac wodny i wzmaga pronację)',
    narrator: 'Paweł (37 lat, Warszawa · Karol Mikołajczyk)',
    protagonist: 'Paweł (37 lat)',
    hookIdea:
      'Przez 6 miesięcy każdy mój wieczorny bieg po warszawskim Ursynowie kończył się dokładnie w tym samym miejscu: równo na 5. kilometrze pod prawą rzepką i wzdłuż piszczeli wybuchał taki ogień, że musiałem siadać na ławce w parku i wracać 2,5 kilometra do bloku kuśtykając po chodniku.',
    sceneBeat:
      'Demaskacja mitu „im grubsza pianka w bucie biegowym, tym lepiej" u fizjoterapeuty + test stabilizacji pięty i łuku.',
    failedSolutionsMath:
      '2 pary butów biegowych 1370 zł + opaska podrzepkowa 120 zł + wałek i maści 150 zł + sztywne wkładki 400 zł = 2040 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax od fizjoterapeuty i przebiegnięcie 10 km po asfalcie bez bólu kolana.',
    defaultHeadline: 'Za każdym razem, gdy zegarek pokazywał 5. kilometr po asfalcie, moje kolano i piszczele zaczynały palić żywym ogniem',
    defaultImageUrl: '/antki-pl-images/sport_antek_97.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-98-marsze-nordic-walking-15tys-krokow',
    number: 98,
    code: 'SPORT_98_marsze_nordic_walking_15tys_krokow',
    title: '[SPORT · BIEGANIE/MARSZE #2] Zaczęłam robić 15 000 kroków dziennie i chodzić z kijkami dla zdrowia. Po 3 tygodniach nie mogłam dojść do kuchni',
    segment: 'dorosli',
    funnelStage: 'sport_bieganie_marsze',
    funnelLabel: 'Sport · Bieganie, Marsze i Hala (5)',
    awarenessStage: 'Stage 2/3: Szybkie marsze, Nordic Walking i wyzwanie 10 000–15 000 kroków dziennie',
    sophistication: 'Poziom 4 (Zwiększenie kroków z 4000 do 15 000 po kostce brukowej na płaskiej wkładce mnoży mikrourazy rozcięgna razy 4)',
    narrator: 'Beata (53 lata, Wrocław · Iwona Kożuchowska)',
    protagonist: 'Beata (53 lata)',
    hookIdea:
      'Lekarz kazał mi robić po 15 000 kroków dziennie i chodzić z kijkami dla zdrowego serca oraz zbicia cukru, a po 3 tygodniach ambitnych marszów po wrocławskich parkach nie byłam w stanie dojść o 6:00 rano do własnej kuchni.',
    sceneBeat:
      'Matematyka 15 000 kroków po twardej kostce brukowej + 10-sekundowy test podniesienia łuku u fizjoterapeuty.',
    failedSolutionsMath:
      'Buty do chodzenia i kijki 640 zł + żelowe podpiętki 85 zł + fala uderzeniowa 800 zł + maści 140 zł = 1665 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax i powrót do codziennych 15 000 kroków dzięki Pakietowi 1+1 GRATIS.',
    defaultHeadline: 'Zaczęłam robić 15 000 kroków dziennie i chodzić z kijkami dla zdrowia. Po 3 tygodniach nie mogłam dojść do własnej kuchni',
    defaultImageUrl: '/antki-pl-images/sport_antek_98.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-99-bieganie-slow-mo-pronacja-asfalt',
    number: 99,
    code: 'SPORT_99_bieganie_slow_mo_pronacja_asfalt',
    title: '[SPORT · BIEGANIE/MARSZE #3] Fizjoterapeuta nagrał moje stopy na bieżni w 25. minucie biegu. Kiedy zwolnił film na telefonie, zamarłam',
    segment: 'dorosli',
    funnelStage: 'sport_bieganie_marsze',
    funnelLabel: 'Sport · Bieganie, Marsze i Hala (5)',
    awarenessStage: 'Stage 2/3: Nagranie slow-motion na bieżni — zmęczeniowe zapadanie się łuku stopy po 20 minutach',
    sophistication: 'Poziom 4 (Na świeżo w 1. minucie stopa trzyma oś, ale w 25. minucie zmęczone mięśnie puszczają i pięta wali się o 13 stopni)',
    narrator: 'Aleksandra (38 lat, Gdańsk · Porady Mamy Gosi)',
    protagonist: 'Aleksandra (38 lat)',
    hookIdea:
      'Kiedy poszłam do sklepu dla biegaczy w Gdańsku, sprzedawca kazał mi przebiec 15 sekund po dywaniku, powiedział, że ląduję prosto, i sprzedał mi buty za 680 zł, po których moje prawe kolano, biodro i lędźwie rwały jeszcze gorzej.',
    sceneBeat:
      'Szokujący kontrast na nagraniu slow-motion między 1. a 25. minutą biegu + łańcuch kompensacji do kolana i biodra.',
    failedSolutionsMath:
      'Buty biegowe z doborem 690 zł + twarde wkładki na wymiar 410 zł + 4 wizyty fizjo 720 zł = 1820 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax i drugie nagranie na bieżni pokazujące prostą oś pięty.',
    defaultHeadline: 'Fizjoterapeuta nagrał moje stopy na bieżni w 25. minucie biegu. Kiedy zwolnił film na telefonie, zamarłam',
    defaultImageUrl: '/antki-pl-images/sport_antek_99.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-100-hala-siatkowka-parkiet-ladowanie',
    number: 100,
    code: 'SPORT_100_hala_siatkowka_parkiet_ladowanie',
    title: '[SPORT · BIEGANIE/MARSZE #4] Po 2 godzinach siatkówki na twardym parkiecie wracałem do domu z piętami i kolanami obitymi jak po skokach na beton',
    segment: 'dorosli',
    funnelStage: 'sport_bieganie_marsze',
    funnelLabel: 'Sport · Bieganie, Marsze i Hala (5)',
    awarenessStage: 'Stage 2/3: Sporty halowe (siatkówka, koszykówka, piłka ręczna) — lądowanie z wyskoku i kolano skoczka',
    sophistication: 'Poziom 4 (150 wyskoków w meczu na szkolnym parkiecie na betonie — bez korytka pięty stopa rozlewa się przy lądowaniu)',
    narrator: 'Dawid (35 lat, Poznań · Karol Mikołajczyk)',
    protagonist: 'Dawid (35 lat)',
    hookIdea:
      'W 3. secie naszego czwartkowego meczu siatkówki po kolejnym lądowaniu z bloku pod prawą rzepką zapiekło mnie tak mocno, że musiałem usiąść na ławce pod ścianą, rozsznurować halówki i patrzeć, jak chłopaki kończą grę w 5 osób.',
    sceneBeat:
      'Fizyka lądowania z wyskoku na parkiecie + test podparcia łuku i stabilizacji kości piętowej u fizjoterapeuty.',
    failedSolutionsMath:
      'Buty halowe 550 zł + opaski na kolano skoczka 140 zł + żelowe wkładki 65 zł + fala uderzeniowa 750 zł = 1505 zł',
    discoveryBridge:
      'Kartka z nazwą Orthomax StepMax i test Pakietu 1+1 GRATIS (buty halowe + buty codzienne).',
    defaultHeadline: 'Po 2 godzinach siatkówki na twardym parkiecie wracałem do domu z piętami i kolanami obitymi jak po skokach na beton',
    defaultImageUrl: '/antki-pl-images/sport_antek_100.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
  {
    id: 'sport-101-bieganie-anti-allegro-zel-vs-sprezyna',
    number: 101,
    code: 'SPORT_101_bieganie_anti_allegro_zel_vs_sprezyna',
    title: '[SPORT · BIEGANIE/MARSZE #5 · ANTI-ALLEGRO] Kupiłem w markecie sportowym żelowe wkładki „Sport" za 29,99 zł. Po 10 km wyjąłem rozgniecioną galaretę',
    segment: 'dorosli',
    funnelStage: 'sport_bieganie_marsze',
    funnelLabel: 'Sport · Bieganie, Marsze i Hala (5)',
    awarenessStage: 'Stage 5: Demaskacja tanich wkładek żelowych z marketu/Allegro (29,99 zł) w sporcie vs dynamiczna sprężyna StepMax',
    sophistication: 'Poziom 5 (Ciężki silikon parzy stopę, waży 2x więcej i zapada się pod piętą do 1 mm, zostawiając łuk stopy w pustce)',
    narrator: 'Krzysztof (45 lat, Kraków · Karol Mikołajczyk)',
    protagonist: 'Krzysztof (45 lat)',
    hookIdea:
      'Chciałem zaoszczędzić 70 zł na wkładkach do biegania, więc kupiłem w markecie sportowym niebiesko-żółte wkładki żelowe „Active Sport" za 29,99 zł - a po 10 kilometrach marszobiegu wróciłem do domu z tak spuchniętym ścięgnem Achillesa, że w przedpokoju ledwo zdjąłem buty.',
    sceneBeat:
      'Przecięcie taniej żelowej wkładki u fizjoterapeuty i porównanie jej z dynamiczną konstrukcją Orthomax StepMax.',
    failedSolutionsMath:
      '3 pary żelowych wkładek 90 zł + sztywne wkładki 390 zł + USG Achillesa i fizjo 480 zł + maści 110 zł = 1070 zł',
    discoveryBridge:
      'Zamówienie oryginalnych wkładek Orthomax StepMax w Pakiecie 1+1 GRATIS za 99,99 zł z 30-dniową gwarancją zwrotu.',
    defaultHeadline: 'Kupiłem w markecie sportowym żelowe wkładki „Sport" za 29,99 zł. Po 10 kilometrach wyjąłem z buta rozgniecioną galaretę',
    defaultImageUrl: '/antki-pl-images/sport_antek_101.jpg',
    defaultDestinationUrl: ORTHOMAX_SPORT_PDP_URL,
  },
];
