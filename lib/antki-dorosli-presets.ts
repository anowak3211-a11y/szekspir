import type { AntkiPlPresetAngle } from './antki-pl';

/**
 * 35 KĄTÓW DLA DOROSŁYCH (D01–D35 · numery #36–#70)
 * Zbudowane na podstawie analizy historycznych winnerów z konta 1 (act_991993289421136):
 * - ANTKI CBO (DOROSLI AVATAR · ROAS 3.16, CPA 40,96 zł)
 * - MSL PL (14.03 SOR SOL A, M_Jakuba 3 images, 21.12 image test ryciak rip 3, 26.12 szpital, 11.03 POWRUT DOROSLI, Kubson copy za 5 lat...)
 * - CBO 5 (adset2 4kroki)
 */
export const ANTKI_DOROSLI_PRESET_ANGLES: AntkiPlPresetAngle[] = [
  // ==================== GRUPA D1 (SOR_SOL · #36–#40 / D1–D5): Re-inżynieria 14.03 SOR SOL A & 26.12 szpital ====================
  {
    id: 'dorosli-01-sor-zablokowane-kolano',
    number: 36,
    code: 'D01_sor_zablokowane_kolano',
    title: '[DOROŚLI · SOR V1] Siedziałam 4 godziny na nocnym SOR-ze z zablokowanym kolanem. Lekarz dyżurny kazał mi zdjąć prawy but.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D1 (SOR)',
    awarenessStage: 'Stage 2: Ostry kryzys / SOR (Re-inżynieria 14.03 SOR SOL A)',
    sophistication: 'Poziom 3/4 (10-sekundowy test łuku stopy na SOR-ze + łańcuch kompensacji)',
    narrator: 'Anna (51 lat, Poznań)',
    protagonist: 'Anna (51 lat)',
    hookIdea:
      'Siedziałam 4 godziny na nocnym SOR-ze z kolanem spuchniętym jak grejpfrut po zwykłym zejściu ze schodów z koszem prania. Młody ortopeda dyżurny po obejrzeniu RTG nie dotknął nawet kolana - kazał mi zdjąć oba buty i pokazał, co robi moja prawa pięta.',
    sceneBeat:
      'Na zimnej podłodze gabinetu na SOR-ze lekarz podnosi dłońmi zapadnięty łuk stopy Małgorzaty. Kolano natychmiast wraca do osi, a kłujący ból pod rzepką odpuszcza. Kiedy puszcza - kostka ucieka o 12 stopni do środka.',
    failedSolutionsMath:
      'Opaski uciskowe z apteki 140 zł + maści i żele 190 zł + kolagen 260 zł + twarde wkładki na zamówienie 400 zł = 990 zł',
    discoveryBridge:
      'Rozmowa z kobietą pod gabinetem rehabilitacji i wątek na grupie FB o dynamicznych wkładkach Orthomax StepMax.',
    defaultHeadline: 'Siedziałam 4 godziny na nocnym SOR-ze z zablokowanym kolanem. Lekarz dyżurny kazał mi zdjąć prawy but',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d1-sor-krzeselko-kolano.jpg',
    defaultImageHash: '3795f92da5a3f17d3fd9a6e2e79f67b6',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d1-schody-kosz-prania.jpg',
    defaultSecondImageHash: '10571017552d4cd1737ab72aaf7e6f11',
  },
  {
    id: 'dorosli-02-sor-rwa-kulszowa-kregoslup',
    number: 37,
    code: 'D02_sor_rwa_kulszowa_kregoslup',
    title: '[DOROŚLI · SOR V2] Mąż wnosił mnie na izbę przyjęć, bo ścięło mnie z bólu lędźwi. Przyczyna siedziała w moich butach.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D1 (SOR)',
    awarenessStage: 'Stage 2: Ostry ból kręgosłupa lędźwiowego / Rwa kulszowa (SOR)',
    sophistication: 'Poziom 3/4 (Zdarte obcasy od wewnątrz -> rotacja miednicy -> zacisk L4-L5)',
    narrator: 'Katarzyna (48 lat, Wrocław)',
    protagonist: 'Katarzyna (48 lat)',
    hookIdea:
      'W niedzielę przed południem schyliłam się po kubek z herbatą i zostałam na podłodze. Mąż musiał wnosić mnie pod rękę na izbę przyjęć. Po zastrzyku rozkurczowym fizjoterapeuta w szpitalu wziął do ręki moje półbuty i odwrócił je podeszwą do góry.',
    sceneBeat:
      'Obcasy były ścięte od wewnętrznej strony jak nożem. Test podniesienia łuku stopy przed lustrem pokazuje, jak zapadające się kostki wypychają miednicę do przodu i miażdżą kręgi lędźwiowe przy każdym kroku.',
    failedSolutionsMath:
      'Zastrzyki i leki 240 zł + 6 wizyt u masażysty 900 zł + poduszka lędźwiowa 150 zł + twarde wkładki 380 zł = 1670 zł',
    discoveryBridge:
      'Polecenie na grupie dla osób z dyskopatią i bólem kręgosłupa na Facebooku - wkładki Orthomax StepMax.',
    defaultHeadline: 'Mąż wnosił mnie na izbę przyjęć, bo ścięło mnie z bólu lędźwi. Przyczyna siedziała w moich butach',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d1-zdarte-polbuty-obcas.jpg',
    defaultImageHash: 'd05552e6774415a5f297ad31d20f3b29',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-korytarz-sor-wozek.jpg',
    defaultSecondImageHash: 'e878449307e17f8bb97770ae78bd1937',
  },
  {
    id: 'dorosli-03-sor-biodro-blokada-schody',
    number: 38,
    code: 'D03_sor_biodro_blokada_schody',
    title: '[DOROŚLI · SOR V3] Myślałam, że w wieku 54 lat czeka mnie endoproteza biodra. Na ostrym dyżurze lekarz pokazał mi 10-sekundowy test.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D1 (SOR)',
    awarenessStage: 'Stage 2: Strach przed zwyrodnieniem biodra i operacją',
    sophistication: 'Poziom 3/4 (Rotacja wewnętrzna uda przez zapadnięty łuk stopy)',
    narrator: 'Bożena (54 lata, Kraków)',
    protagonist: 'Bożena (54 lata)',
    hookIdea:
      'Na wieczornym spacerze z psem nagle poczułam takie ukłucie w prawej pachwinie i biodrze, że musiałam oprzeć się o ogrodzenie i zadzwonić po syna. Jechaliśmy na ostry dyżur ortopedyczny z myślą, że to już koniec i czeka mnie wymiana stawu.',
    sceneBeat:
      'Lekarz dyżurny po prześwietleniu biodra każe Małgorzacie stanąć boso. Pokazuje jej, że głowa kości udowej jest zdrowa, ale zapadająca się prawa stopa wykręca całą nogę do wewnątrz 8000 razy dziennie.',
    failedSolutionsMath:
      'Prywatne wizyty i RTG 420 zł + prądy i pole magnetyczne 550 zł + sztywne wkładki ze sklepu medycznego 390 zł = 1360 zł',
    discoveryBridge:
      'Sąsiadka z bloku, która miała identyczny ból biodra przy wchodzeniu po schodach, pokazuje jej swoje wkładki Orthomax StepMax.',
    defaultHeadline: 'Myślałam, że w wieku 54 lat czeka mnie endoproteza biodra. Na ostrym dyżurze lekarz pokazał mi 10-sekundowy test',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d1-schody-kosz-prania.jpg',
    defaultImageHash: '10571017552d4cd1737ab72aaf7e6f11',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d3-ryciak-stopa-test-dloni.jpg',
    defaultSecondImageHash: 'f93c48f3d3347ad58db12773cff53a62',
  },
  {
    id: 'dorosli-04-sor-piekacy-nerwiak-przodostopie',
    number: 39,
    code: 'D04_sor_piekacy_nerwiak_przodostopie',
    title: '[DOROŚLI · SOR V4] Wyszłam z wesela chrześniaka po godzinie ze stopą spuchniętą jak bochen chleba i piekącym bólem pod palcami.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D1 (SOR)',
    awarenessStage: 'Stage 2: Pieczenie przodostopia / Płaskostopie poprzeczne / Obrzęk',
    sophistication: 'Poziom 3/4 (Opadnięty łuk poprzeczny miażdżący nerwy między kośćmi śródstopia)',
    narrator: 'Dorota (49 lat, Łódź)',
    protagonist: 'Dorota (49 lat)',
    hookIdea:
      'Na weselu mojego chrześniaka wytrzymałam w butach dokładnie godzinę. Potem pod stołem poczułam między trzecim a czwartym palcem taki ogień, jakby ktoś przypalał mi podeszwę stopy zapalniczką. Kiedy zdjęłam but, stopa spuchła tak, że mąż musiał wieźć mnie w samych rajstopach na nocną pomoc.',
    sceneBeat:
      'Badanie biomechaniczne pokazuje, że opadnięty łuk podłużny i poprzeczny sprawia, iż główki kości śródstopia opadają na twardą podeszwę i przy każdym kroku miażdżą nerw jak w imadle.',
    failedSolutionsMath:
      'Żelowe poduszeczki pod przodostopie 95 zł + maści przeciwobrzękowe 140 zł + 2 pary szerokich butów 680 zł + twarde wkładki 380 zł = 1295 zł',
    discoveryBridge:
      'Wątek na forum kobiet 45+ o palącym bólu pod palcami i polecenie wkładek Orthomax StepMax w pakiecie 1+1.',
    defaultHeadline: 'Wyszłam z wesela chrześniaka po godzinie ze stopą spuchniętą jak bochen chleba i piekącym bólem pod palcami',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d1-sor-krzeselko-kolano.jpg',
    defaultImageHash: '3795f92da5a3f17d3fd9a6e2e79f67b6',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d5-zimowe-botki-zamek-haluks.jpg',
    defaultSecondImageHash: '4b75aef3e981e2b04a4e64df6b842ed5',
  },
  {
    id: 'dorosli-05-sor-skrecona-kostka-niestabilnosc',
    number: 40,
    code: 'D05_sor_skrecona_kostka_niestabilnosc',
    title: '[DOROŚLI · SOR V5] Trzeci raz w ciągu roku wylądowałam na SOR-ze z podkręconą kostką na równym chodniku. Ortopeda wziął mój but do ręki.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D1 (SOR)',
    awarenessStage: 'Stage 2: Nawracające skręcenia kostki i ból ścięgna Achillesa',
    sophistication: 'Poziom 3/4 (Koślawość kości piętowej 11° i brak stabilnego korytka pod piętą)',
    narrator: 'Joanna (46 lat, Gdańsk)',
    protagonist: 'Joanna (46 lat)',
    hookIdea:
      'Trzeci raz w ciągu dwunastu miesięcy siedziałam na korytarzu SOR-u z nogą owiniętą lodem. Nawet nie biegłam - szłam zwykłym, równym chodnikiem z zakupami i nagle kostka znów uciekła mi do boku, a w ścięgnie Achillesa strzeliło jak z bicza.',
    sceneBeat:
      'Ortopeda pokazuje jej RTG i stawia jej but na biurku: pięta Małgorzaty ucieka do wewnątrz o 11 stopni (przy normie 5-7), przez co ścięgno Achillesa jest wygięte w łuk, a staw skokowy nie ma żadnego bocznego trzymania.',
    failedSolutionsMath:
      'Ortezy i stabilizatory kostki 320 zł + rehabilitacja Achillesa 720 zł + twarde wkładki na wymiar 400 zł = 1440 zł',
    discoveryBridge:
      'Fizjoterapeutka z przychodni i grupa biegowo-spacerowa na FB, gdzie chwalono głębokie korytko piętowe we wkładkach Orthomax StepMax.',
    defaultHeadline: 'Trzeci raz w ciągu roku wylądowałam na SOR-ze z podkręconą kostką na równym chodniku. Ortopeda wziął mój but do ręki',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d1-zdarte-polbuty-obcas.jpg',
    defaultImageHash: 'd05552e6774415a5f297ad31d20f3b29',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d3-kostki-od-tylu-12stopni.jpg',
    defaultSecondImageHash: '4778b1876d335e8a0e77a86e15223c86',
  },

  // ==================== GRUPA D2 (M_JAKUBA · #41–#45 / D6–D10): Re-inżynieria M_Jakuba 3 images ====================
  {
    id: 'dorosli-06-m-jakuba-miska-z-woda',
    number: 41,
    code: 'D06_m_jakuba_miska_z_woda',
    title: '[M_JAKUBA · V1 MISKA Z WODĄ] Moja 63-letnia mama przestała wychodzić z wnukami do parku. Prawda wyszła na jaw w niedzielę w kuchni.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D2 (M_Jakuba)',
    awarenessStage: 'Stage 2: Dorosłe dzieci kupujące mamie + Kobiety 60+ (Winner M_Jakuba)',
    sophistication: 'Poziom 3/4 (Emocjonalny most rodzinny + test łuku stopy u fizjoterapeuty)',
    narrator: 'Małgorzata (37 lat, Warszawa) o mamie Halinie (63 lata)',
    protagonist: 'Mama Halina (63 lata)',
    hookIdea:
      'Moja 63-letnia mama zawsze pierwsza zakładała płaszcz, kiedy mówiłam, że idziemy z dziećmi do parku. Tej jesieni za każdym razem słyszałam, że „woli posiedzieć w domu". W zeszłą niedzielę weszłam do jej kuchni bez pukania i zobaczyłam ją siedzącą na stołku nad miską z ciepłą wodą i solą, a obok leżał paragon z rehabilitacji na 226 zł.',
    sceneBeat:
      'Mama Halina ukrywała przed dziećmi, że po przejściu 300 metrów do sklepu jej stopy i kolana palą żywym ogniem. Małgorzata zabiera mamę do fizjoterapeuty, który w 10 sekund pokazuje na stopie mamy, dlaczego maści i prądy nie działały.',
    failedSolutionsMath:
      'Paragon z rehabilitacji i apteki 226 zł + wcześniejsze zabiegi i maści 480 zł + twarde wkładki ze sklepu medycznego 360 zł = 1066 zł',
    discoveryBridge:
      'Małgorzata znajduje na grupie na Facebooku historie córek, które kupiły swoim mamom dynamiczne wkładki Orthomax StepMax w pakiecie 1+1.',
    defaultHeadline: 'Moja 63-letnia mama przestała wychodzić z wnukami do parku. Prawda wyszła na jaw, gdy zobaczyłam ją w kuchni z miską wody',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d2-mama-miska-woda-kuchnia.jpg',
    defaultImageHash: '368c04cc8927fbde20ec38b2efc1c5c8',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-paragon-rehabilitacja-226zl.jpg',
    defaultSecondImageHash: 'a9b6357c7660912a00fc09324f4ed1a3',
  },
  {
    id: 'dorosli-07-m-jakuba-szuflada-lekow',
    number: 42,
    code: 'D07_m_jakuba_szuflada_lekow',
    title: '[M_JAKUBA · V2 SZUFLADA LEKÓW] Otworzyłam szafkę w kuchni mojej 65-letniej mamy i znalazłam 6 tubek maści oraz 3 puste blistry Ketonalu.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D2 (M_Jakuba)',
    awarenessStage: 'Stage 2: Perspektywa córki (Małgorzaty) odkrywającej ból mamy',
    sophistication: 'Poziom 3/4 (Zamiast truć żołądek tabletkami - podparcie fundamentu stopy)',
    narrator: 'Małgorzata (36 lat, Poznań) o mamie Krystynie (65 lat)',
    protagonist: 'Mama Krystyna (65 lat)',
    hookIdea:
      'Przyjechałam do mojej 65-letniej mamy z ciężkimi zakupami i chciałam zaparzyć nam herbaty. Otworzyłam nie tę szafkę co trzeba i zamarłam: w koszyku leżało 6 wyciśniętych do połowy tubek maści przeciwbólowych, plastry rozgrzewające i 3 puste blistry po silnych tabletkach.',
    sceneBeat:
      'Mama Krystyna rozpłakała się przy kuchennym stole i przyznała, że od półtora roku bierze tabletkę przed każdym wyjściem z bloku, bo nie chciała „być dla mnie ciężarem". Wizyta u fizjoterapeuty otwiera im obojgu oczy.',
    failedSolutionsMath:
      'Maści i leki przeciwbólowe 540 zł + prywatny ortopeda 250 zł + sztywne wkładki na zamówienie 400 zł = 1190 zł',
    discoveryBridge:
      'Znajomy fizjoterapeuta i opinie na forum polecające sprężyste wkładki Orthomax StepMax (1 para do półbutów, 2 para do kapci domowych).',
    defaultHeadline: 'Otworzyłam szafkę w kuchni mojej 65-letniej mamy i znalazłam 6 tubek maści oraz 3 puste blistry Ketonalu',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d2-szafka-masci-blistry.jpg',
    defaultImageHash: '820a86e85a83fd3a69a63ea29f573c55',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-28-paragon-apteka.jpg',
    defaultSecondImageHash: 'd53dee133cac3d52992ac78ed43dc5b2',
  },
  {
    id: 'dorosli-08-m-jakuba-spacer-lawka',
    number: 43,
    code: 'D08_m_jakuba_spacer_lawka',
    title: '[M_JAKUBA · V3 ŁAWKA CO 200M] Na jesiennym spacerze moja 61-letnia mama co 200 metrów szukała wzrokiem ławki i udawała, że podziwia drzewa.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D2 (M_Jakuba)',
    awarenessStage: 'Stage 2: Ukrywany ból stóp i bioder podczas spaceru',
    sophistication: 'Poziom 3/4 (Koślawe pięty od tyłu -> przeciążenie kolan i bioder)',
    narrator: 'Małgorzata (35 lat, Wrocław) o mamie Danucie (61 lat)',
    protagonist: 'Mama Danuta (61 lat)',
    hookIdea:
      'Zabrałam moją 61-letnią mamę na niedzielny spacer po parku. Po przejściu ledwie jednej alejki zauważyłam, że mama co 200 metrów rozgląda się za ławką i z wymuszonym uśmiechem mówi: „Usiądźmy na chwilę, tak ładnie świeci słońce". Kiedy spojrzałam na jej dłonie, zobaczyłam, jak mocno zaciska palce na torebce z bólu.',
    sceneBeat:
      'Po powrocie do mieszkania Małgorzata każe mamie stanąć boso na przedpokoju. Obie kostki mamy uciekają ostro do środka, a wewnętrzne krawędzie jej jesiennych butów są zupełnie zapadnięte.',
    failedSolutionsMath:
      'Buty rzekomo zdrowotne z katalogu 390 zł + żelowe wkładki z apteki 85 zł + twarde wkładki ortopedyczne 380 zł = 855 zł',
    discoveryBridge:
      'Post na grupie wsparcia dla kobiet 50+ ze zdjęciem przed/po ułożenia pięt we wkładkach Orthomax StepMax.',
    defaultHeadline: 'Na jesiennym spacerze moja 61-letnia mama co 200 metrów szukała wzrokiem ławki i udawała, że podziwia drzewa',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d3-kostki-od-tylu-12stopni.jpg',
    defaultImageHash: '4778b1876d335e8a0e77a86e15223c86',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d1-zdarte-polbuty-obcas.jpg',
    defaultSecondImageHash: 'd05552e6774415a5f297ad31d20f3b29',
  },
  {
    id: 'dorosli-09-m-jakuba-ojciec-dzialka',
    number: 44,
    code: 'D09_m_jakuba_ojciec_dzialka',
    title: '[M_JAKUBA · V4 OJCIEC I DZIAŁKA] Mój 66-letni tata przez 30 lat kochał swoją działkę. Tej jesieni powiedział, że ją sprzedaje przez ból nóg.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D2 (M_Jakuba)',
    awarenessStage: 'Stage 2: Mężczyźni 55+ / Ojcowie i mężowie z bólem kolan i pięt',
    sophistication: 'Poziom 3/4 (Zdarte podeszwy męskich butów + odciążenie stawów)',
    narrator: 'Małgorzata (39 lat, Katowice) o tacie Stanisławie (66 lat)',
    protagonist: 'Tata Stanisław (66 lat)',
    hookIdea:
      'Mój 66-letni tata to człowiek ze starej gliny, który nigdy w życiu nie poskarżył się na zdrowie. Dlatego kiedy w zeszłą sobotę usiadł w altance na swojej ukochanej działce i cicho powiedział: „Małgosiu, wystaw ogłoszenie, sprzedajemy działkę, ja już nie daję rady ustać godziny na nogach" - ścisnęło mnie w gardle.',
    sceneBeat:
      'Małgorzata bierze z ganku buty robocze i adidasy ojca - obie pary mają zjedzone od wewnątrz obcasy. W gabinecie fizjoterapeuta pokazuje tacie test podniesienia łuku stopy i wyjaśnia, dlaczego bolały go kolana przy każdym kroku.',
    failedSolutionsMath:
      'Opaski na kolana 160 zł + maści końskie i przeciwzapalne 180 zł + twarde wkładki skórzano-plastikowe 370 zł = 710 zł',
    discoveryBridge:
      'Polecenie od sąsiada z sąsiedniej działki po 60-tce, który używa wkładek Orthomax StepMax w butach roboczych i codziennych.',
    defaultHeadline: 'Mój 66-letni tata przez 30 lat kochał swoją działkę. Tej jesieni powiedział, że ją sprzedaje, bo nie może ustać godziny na nogach',
    defaultImageUrl: '/antki-pl-images/lib-antki-zdarte-buty-tnf.jpg',
    defaultImageHash: '408c8703e99f1d803463c30b92362fc8',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d2-szafka-masci-blistry.jpg',
    defaultSecondImageHash: '820a86e85a83fd3a69a63ea29f573c55',
  },
  {
    id: 'dorosli-10-m-jakuba-wesele-buty-w-reku',
    number: 45,
    code: 'D10_m_jakuba_wesele_buty_w_reku',
    title: '[M_JAKUBA · V5 POWRÓT DO ŻYCIA] Rok temu na moich urodzinach mama przesiedziała 5 godzin przy stole, bo nie mogła wcisnąć stóp w buty.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D2 (M_Jakuba)',
    awarenessStage: 'Stage 2/3: Kontrast Przed/Po (Wycofanie z życia vs powrót do sprawności)',
    sophistication: 'Poziom 4 (Stabilizacja łuku stopy + 2 pary na cały dzień)',
    narrator: 'Małgorzata (38 lat, Gdańsk) o mamie Irenie (62 lata)',
    protagonist: 'Mama Irena (62 lata)',
    hookIdea:
      'Rok temu na moich urodzinach mama przesiedziała 5 godzin w jednym miejscu przy stole. Kiedy wszyscy wyszli na środek do rodzinnego zdjęcia, mama machnęła ręką, że „zrobi nam zdjęcie z boku". Dopiero gdy sprzątałam obrus, zobaczyłam, że pod stołem trzyma bose, spuchnięte stopy, których nie była w stanie wcisnąć z powrotem w buty.',
    sceneBeat:
      'Wspólna droga od wstydu i sztywnych wkładek z punktu ortopedycznego, przez zrozumienie biomechaniki stopy u podologa, aż do tegorocznej uroczystości, na której mama przetańczyła pół wieczoru.',
    failedSolutionsMath:
      '3 pary szerokich czółenek 750 zł + żelowe półwkładki 90 zł + sztywne wkładki ortopedyczne 390 zł = 1230 zł',
    discoveryBridge:
      'Grupa facebookowa dla kobiet dojrzałych i zdjęcie czarnych oraz pomarańczowych wkładek Orthomax StepMax na stole.',
    defaultHeadline: 'Rok temu na moich urodzinach mama przesiedziała 5 godzin przy stole, bo nie mogła wcisnąć spuchniętych stóp w buty',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d2-mama-miska-woda-kuchnia.jpg',
    defaultImageHash: '368c04cc8927fbde20ec38b2efc1c5c8',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d7-kuchnia-8h-wkladki-stepmax.jpg',
    defaultSecondImageHash: 'f168f5fad5dd18811b5b0a8b869c27dd',
  },

  // ==================== GRUPA D3 (RYCIAK_DOROSLI · #46–#50 / D11–D15): Re-inżynieria Ryciak Rip 3 dla Dorosłych ====================
  {
    id: 'dorosli-11-ryciak-dorosli-bark-i-kark',
    number: 46,
    code: 'D11_ryciak_dorosli_bark_i_kark',
    title: '[RYCIAK DOROŚLI · V1 BARK I KARK] Przez pół roku leczyłam ból prawego barku i karku za 1420 zł. Fizjoterapeuta kazał mi zdjąć buty.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D3 (Ryciak Dorośli)',
    awarenessStage: 'Stage 2: Leczenie objawu (bark/kark) zamiast przyczyny (stopy)',
    sophistication: 'Poziom 3/4 (Szkielet 1:1 Ryciak Rip 3 dla dorosłej kobiety)',
    narrator: 'Małgorzata (47 lat, Gdańsk)',
    protagonist: 'Małgorzata (47 lat)',
    hookIdea:
      'Poszłam do fizjoterapeuty na konsultację z przewlekłym bólem prawego barku i karku, który męczył mnie od pół roku. A wyszłam ze skierowaniem na badanie stóp i kolan - bo to, co pokazał mi przed lustrem w pięć minut, zmieniło wszystko.',
    sceneBeat:
      'Dokładne odwzorowanie dialogu z winnera Ryciak Rip 3 dla dorosłych: fizjoterapeuta podnosi dłońmi łuk stopy Małgorzaty -> kolana się rozchodzą -> miednica wraca do poziomu -> prawe ramię natychmiast opada i napięcie w karku puszcza.',
    failedSolutionsMath:
      'Maści i plastry 140 zł + lekarz i prześwietlenie barku 280 zł + 6 sesji masażu karku 600 zł + twarde wkładki 400 zł = 1420 zł',
    discoveryBridge:
      'Forum ortopedyczno-rehabilitacyjne i setki wpisów dorosłych pacjentów o wkładkach Orthomax StepMax.',
    defaultHeadline: 'Przez pół roku leczyłam ból prawego barku i karku za 1420 zł. Fizjoterapeuta kazał mi zdjąć buty i pokazał 10-sekundowy test',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d3-ryciak-stopa-test-dloni.jpg',
    defaultImageHash: 'f93c48f3d3347ad58db12773cff53a62',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-podoskop-jasny.jpg',
    defaultSecondImageHash: '8ec6badff8e90f7f881e1f3b0b6ffd12',
  },
  {
    id: 'dorosli-12-ryciak-dorosli-ledzwie-dyskopatia',
    number: 47,
    code: 'D12_ryciak_dorosli_ledzwie_dyskopatia',
    title: '[RYCIAK DOROŚLI · V2 LĘDŹWIE] Przez 2 lata leczono mnie na dyskopatię lędźwiową za 2150 zł. Dr Ryciak podniósł moje stopy dłońmi.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D3 (Ryciak Dorośli)',
    awarenessStage: 'Stage 2/3: Przewlekły ból krzyża i lędźwi wracający po rehabilitacji',
    sophistication: 'Poziom 4 (Łańcuch kompensacji od stóp do odcinka L4-L5)',
    narrator: 'Monika (50 lat, Warszawa)',
    protagonist: 'Monika (50 lat)',
    hookIdea:
      'Przez dwa lata wierzyłam, że mój ból w dole pleców to „po prostu wiek i dyskopatia siedzącej pracy". Wydałam 2150 zł na prądy, masaże i osteopatów, a ból wracał w tydzień po zakończeniu serii. Dopiero dr Ryciak kazał mi zdjąć buty i stanąć na podoskopie.',
    sceneBeat:
      'Goniometr na pięcie pokazuje 12 stopni koślawości. Kiedy lekarz podnosi dłońmi oba łuki stóp Moniki, jej miednica cofa się na swoje miejsce, a ciągłe kłucie w lędźwiach znika w kilka sekund.',
    failedSolutionsMath:
      'Rezonans i wizyty 650 zł + seria 10 rehabilitacji lędźwi 1100 zł + twarde wkładki na wymiar 400 zł = 2150 zł',
    discoveryBridge:
      'Wątek na grupie „Kręgosłup i Stawy po 40-tce" na Facebooku i rekomendacja wkładek Orthomax StepMax.',
    defaultHeadline: 'Przez 2 lata leczono mnie na dyskopatię lędźwiową za 2150 zł. Dr Ryciak podniósł moje stopy dłońmi i ból w krzyżu odpuścił w 10 sekund',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d3-ryciak-stopa-test-dloni.jpg',
    defaultImageHash: 'f93c48f3d3347ad58db12773cff53a62',
    defaultSecondImageUrl: '/antki-pl-images/ai-ryciak-21-gabinet-test-luku.jpg',
    defaultSecondImageHash: 'f39f4f6fe7839d3634d55fea7a121d80',
  },
  {
    id: 'dorosli-13-ryciak-dorosli-kolano-zwyrodnienie',
    number: 48,
    code: 'D13_ryciak_dorosli_kolano_zwyrodnienie',
    title: '[RYCIAK DOROŚLI · V3 KOLANO] Ortopeda w przychodni chciał mi wbijać kwas hialuronowy w kolano za 900 zł. Dr Ryciak kazał mi zdjąć buty.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D3 (Ryciak Dorośli)',
    awarenessStage: 'Stage 3: Kobiety przed zastrzykami w kolano (kwas hialuronowy / osocze)',
    sophistication: 'Poziom 4 (Dlaczego zastrzyk w kolano nie zadziała, gdy pięta ucieka do środka)',
    narrator: 'Ewa (53 lata, Bydgoszcz)',
    protagonist: 'Ewa (53 lata)',
    hookIdea:
      'Miałam już wypisaną receptę na zastrzyk z kwasu hialuronowego prosto w kolano za 900 zł. Lekarz w przychodni powiedział: „Chrząstka się ściera, wstrzykniemy smarowanie na pół roku". Zanim wydałam te pieniądze, poszłam po drugą opinię - i tam usłyszałam pytanie, którego wcześniej nikt mi nie zadał: „Proszę zdjąć buty, zobaczymy dlaczego ta chrząstka się ściera".',
    sceneBeat:
      'Na zielonym podoskopie widać jak na dłoni: zapadnięty łuk stopy sprawia, że kolano ucieka do środka pod kątem 12 stopni. Smarowanie krzywo ustawionego zawiasu nic nie da, dopóki nie wyprostuje się osi od dołu.',
    failedSolutionsMath:
      'Konsultacje i USG kolana 450 zł + suplementy z chondroityną 320 zł + sztywne wkładki z apteki 380 zł = 1150 zł',
    discoveryBridge:
      'Rozmowa z pacjentką w poczekalni, która uniknęła zastrzyków dzięki wkładkom Orthomax StepMax.',
    defaultHeadline: 'Ortopeda w przychodni chciał mi wbijać kwas hialuronowy w kolano za 900 zł. Dr Ryciak kazał mi zdjąć buty',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d3-kostki-od-tylu-12stopni.jpg',
    defaultImageHash: '4778b1876d335e8a0e77a86e15223c86',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-podoskop-zielony.jpg',
    defaultSecondImageHash: '82b1871a7a3dee01f6286c3472c1074a',
  },
  {
    id: 'dorosli-14-ryciak-dorosli-biodro-asymetria',
    number: 49,
    code: 'D14_ryciak_dorosli_biodro_asymetria',
    title: '[RYCIAK DOROŚLI · V4 BIODRO] Myślałam, że mam jedną nogę krótszą i dlatego kuleję na lewe biodro. W gabinecie wystarczył 10-sekundowy test.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D3 (Ryciak Dorośli)',
    awarenessStage: 'Stage 2: Asymetria miednicy, utykanie i ból biodra z jednej strony',
    sophistication: 'Poziom 3/4 (Pozorny skrót kończyny przez zapadnięcie jednego łuku stopy)',
    narrator: 'Urszula (55 lat, Szczecin)',
    protagonist: 'Urszula (55 lat)',
    hookIdea:
      'Przez ponad rok każda moja spódnica przekręcała się w pasie na prawą stronę, lewa nogawka spodni brudziła się o chodnik, a po 30 minutach spaceru zaczynałam utykać na lewe biodro. Byłam przekonana, że na starość jedna noga zrobiła mi się krótsza.',
    sceneBeat:
      'Komputerowy skan nacisku stóp i test w gabinecie pokazują prawdę: obie kości nóg mają identyczną długość co do milimetra, ale lewy łuk stopy zapadł się niemal całkowicie do podłogi, obniżając lewe biodro o półtora centymetra.',
    failedSolutionsMath:
      'Podpiętki wyrównujące 90 zł + terapia manualna biodra 750 zł + twarde wkładki na wymiar 410 zł = 1250 zł',
    discoveryBridge:
      'Grupa rehabilitacyjna na FB i zdjęcia porównawcze ułożenia stóp na wkładkach Orthomax StepMax.',
    defaultHeadline: 'Myślałam, że mam jedną nogę krótszą i dlatego kuleję na lewe biodro. W gabinecie wystarczył 10-sekundowy test',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d3-ryciak-stopa-test-dloni.jpg',
    defaultImageHash: 'f93c48f3d3347ad58db12773cff53a62',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-fizjo-laptop-skan.jpg',
    defaultSecondImageHash: 'c27d30240cd99d872f9ff6f2e8dc2db1',
  },
  {
    id: 'dorosli-15-ryciak-dorosli-slow-mo-bieznia',
    number: 50,
    code: 'D15_ryciak_dorosli_slow_mo_bieznia',
    title: '[RYCIAK DOROŚLI · V5 SLOW-MO] Fizjoterapeuta położył telefon przy bieżni i nagrał moje stopy w zwolnionym tempie. Zamarłam, gdy zobaczyłam ten film.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D3 (Ryciak Dorośli)',
    awarenessStage: 'Stage 2/3: Wizualny szok z analizy chodu w zwolnionym tempie',
    sophistication: 'Poziom 4 (Co dzieje się ze stopą w 0,2 sekundy po uderzeniu o podłogę)',
    narrator: 'Magdalena (45 lat, Katowice)',
    protagonist: 'Magdalena (45 lat)',
    hookIdea:
      'Kiedy człowiek patrzy na swoje stopy z góry, stojąc w miejscu, wszystko wygląda w miarę normalnie. Dopiero kiedy fizjoterapeuta postawił telefon na małym statywie przy samej podłodze i kazał mi przejść boso po bieżni w zwolnionym tempie, zobaczyłam na ekranie coś, od czego przeszły mnie ciarki.',
    sceneBeat:
      'W ułamku sekundy po dotknięciu podłoża pięta Magdaleny wyginała się do środka jak z gumy, łuk uderzał płasko o taśmę, a piszczel wykręcała kolano do wewnątrz przy każdym pojedynczym kroku.',
    failedSolutionsMath:
      'Buty z poduszką powietrzną 599 zł + wkładki żelowe 79 zł + 5 wizyt u fizjoterapeuty 750 zł + twarde wkładki 380 zł = 1808 zł',
    discoveryBridge:
      'Dyskusja pod filmem o biomechanice chodu i polecenie dynamicznych wkładek Orthomax StepMax.',
    defaultHeadline: 'Fizjoterapeuta położył telefon przy bieżni i nagrał moje stopy w zwolnionym tempie. Zamarłam, gdy zobaczyłam ten film',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d3-kostki-od-tylu-12stopni.jpg',
    defaultImageHash: '4778b1876d335e8a0e77a86e15223c86',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-bieznia-chod-telefon.jpg',
    defaultSecondImageHash: '8aae4e1c3b5a0e2e2585d289ec07d8b4',
  },

  // ==================== GRUPA D4 (OSTROGA_RANO · #51–#55 / D16–D20): Ostroga Piętowa, Rozcięgno i 6:00 Rano ====================
  {
    id: 'dorosli-16-ostroga-pierwszy-krok-6-rano',
    number: 51,
    code: 'D16_ostroga_pierwszy_krok_6_rano',
    title: '[OSTROGA · V1 6:00 RANO] Kiedy o 6:00 rano dzwoni budzik, przez pierwsze 10 minut idę do łazienki trzymając się ściany i framug.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D4 (Ostroga)',
    awarenessStage: 'Stage 2: Ostroga piętowa i zapalenie rozcięgna podeszwowego rano',
    sophistication: 'Poziom 4 (Mechanizm nocnego zrostu rozcięgna zrywanego przy pierwszym kroku)',
    narrator: 'Grażyna (52 lata, Lublin)',
    protagonist: 'Grażyna (52 lata)',
    hookIdea:
      'Każdy mój poranek od pół roku zaczynał się od strachu przed opuszczeniem nóg z łóżka na podłogę. Kiedy o 6:00 rano dzwonił budzik, pierwsze dziesięć kroków do łazienki robiłam na czubkach palców, trzymając się oburącz ściany i framug drzwi, bo stanięcie na pięcie smakowało jak wbicie rozżarzonego gwoździa prosto w kość.',
    sceneBeat:
      'Podolog wyjaśnia jej, dlaczego ból jest najgorszy rano: w nocy rozcięgno próbuje się zagoić, ale pierwszy krok na płasko bez podparcia łuku zrywa te mikrowłókna na nowo.',
    failedSolutionsMath:
      'Maści i okłady 160 zł + żelowe podpiętki z apteki 110 zł + ultradźwięki 450 zł + twarde wkładki 390 zł = 1110 zł',
    discoveryBridge:
      'Grupa FB „Ostroga piętowa i zapalenie rozcięgna - jak się wyleczyć" i polecenie wkładek Orthomax StepMax (1 para do kapci przy łóżku, 2 para do butów).',
    defaultHeadline: 'Kiedy o 6:00 rano dzwoni budzik, przez pierwsze 10 minut idę do łazienki trzymając się ściany i framug',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d4-ostroga-6rano-framuga.jpg',
    defaultImageHash: 'dfc30ffec55dd833d6568b3dc0909a4a',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d4-zamrozona-butelka-stopa.jpg',
    defaultSecondImageHash: 'a425a788f62f8303e89464e5f90b4cb3',
  },
  {
    id: 'dorosli-17-ostroga-fala-uderzeniowa-1500zl',
    number: 52,
    code: 'D17_ostroga_fala_uderzeniowa_1500zl',
    title: '[OSTROGA · V2 FALA UDERZENIOWA] Wydałam 1490 zł na 10 zabiegów fali uderzeniowej i 3 blokady w piętę. Ból wrócił po 6 tygodniach.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D4 (Ostroga)',
    awarenessStage: 'Stage 3/4: Rozczarowanie falą uderzeniową i blokadami sterydowymi',
    sophistication: 'Poziom 4 (Rozbijanie zwapnienia głowicą bez podparcia łuku to syzyfowa praca)',
    narrator: 'Barbara (57 lat, Toruń)',
    protagonist: 'Barbara (57 lat)',
    hookIdea:
      'Zaciskałam zęby na kozetce przez dziesięć zabiegów fali uderzeniowej z zimnym żelem na pięcie, a potem dałam sobie wbić trzy blokady sterydowe prosto w żywe ciało. Zostawiłam w gabinetach 1490 zł. Przez sześć tygodni myślałam, że wygrałam - a potem pewnego ranka ból wrócił dwa razy silniejszy.',
    sceneBeat:
      'Fizjoterapeuta tłumaczy Barbarze brutalną prawdę: fala uderzeniowa i steryd gaszą pożar w pięcie, ale jeśli po wyjściu z gabinetu znowu robisz 8000 kroków dziennie z zapadającym się łukiem podłużnym, to przy każdym kroku szarpiesz przyczep rozcięgna od nowa.',
    failedSolutionsMath:
      '10x fala uderzeniowa 900 zł + 3 blokady i wizyty 590 zł + sztywne wkładki ze sklepu medycznego 380 zł = 1870 zł',
    discoveryBridge:
      'Kobieta poznana pod gabinetem fizjoterapii pokazuje jej w swoim bucie pomarańczowe wkładki Orthomax StepMax.',
    defaultHeadline: 'Wydałam 1490 zł na 10 zabiegów fali uderzeniowej i 3 blokady w piętę. Ból wrócił po 6 tygodniach dwa razy silniejszy',
    defaultImageUrl: '/antki-pl-images/lib-antki-ultradzwieki-zel-pieta.jpg',
    defaultImageHash: '0e39eaf8cec0b6058714ca26f4da8e5f',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d4-ostroga-6rano-framuga.jpg',
    defaultSecondImageHash: 'dfc30ffec55dd833d6568b3dc0909a4a',
  },
  {
    id: 'dorosli-18-ostroga-zamrozona-butelka',
    number: 53,
    code: 'D18_ostroga_zamrozona_butelka',
    title: '[OSTROGA · V3 ZAMROŻONA BUTELKA] Przez 8 miesięcy co wieczór turlałam pod stopą zamrożoną butelkę wody. Ulga trwała tylko 20 minut.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D4 (Ostroga)',
    awarenessStage: 'Stage 3: Zmęczenie domowymi sposobami (zamrożona butelka, piłeczka, maści)',
    sophistication: 'Poziom 4 (15 minut rolowania wieczorem vs 10 godzin stania na betonie w dzień)',
    narrator: 'Renata (49 lat, Rzeszów)',
    protagonist: 'Renata (49 lat)',
    hookIdea:
      'Przez osiem miesięcy na środkowej półce mojej zamrażarki między pierogami a koperkiem leżała plastikowa butelka z zamarzniętą wodą. Co wieczór siadałam na kanapie i przez dwadzieścia minut ze łzami w oczach turlałam ten lód pod piekącą piętą i podbiciem.',
    sceneBeat:
      'Matematyka ekspozycji: 20 minut chłodzenia i rozciągania wieczorem przegrywa z 8000 kroków następnego dnia w płaskim bucie na betonie. Dopiero sprężyste podparcie łuku przez cały dzień daje tkankom czas na prawdziwą regenerację.',
    failedSolutionsMath:
      'Wałeczki i piłeczki do masażu 120 zł + maści i plastry 210 zł + wkładki z drogerii 90 zł + twarde wkładki 380 zł = 800 zł',
    discoveryBridge:
      'Komentarze pod artykułem fizjoterapeuty o zapaleniu rozcięgna i polecenie wkładek Orthomax StepMax.',
    defaultHeadline: 'Przez 8 miesięcy co wieczór turlałam pod stopą zamrożoną butelkę wody ze łzami w oczach. Ulga trwała tylko 20 minut',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d4-zamrozona-butelka-stopa.jpg',
    defaultImageHash: 'a425a788f62f8303e89464e5f90b4cb3',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d7-kuchnia-8h-wkladki-stepmax.jpg',
    defaultSecondImageHash: 'f168f5fad5dd18811b5b0a8b869c27dd',
  },
  {
    id: 'dorosli-19-ostroga-zelowe-podpietki-mit',
    number: 54,
    code: 'D19_ostroga_zelowe_podpietki_mit',
    title: '[OSTROGA · V4 MIT PODPIĘTEK] Kupiłam w aptece 5 par żelowych podpiętek na ostrogę. Fizjoterapeuta przeciął jedną nożyczkami.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D4 (Ostroga)',
    awarenessStage: 'Stage 3: Obalenie mitu miękkich żelowych podpiętek z apteki',
    sophistication: 'Poziom 4 (Dlaczego sama podpiętka pod piętą bez podparcia łuku nasila szarpanie ostrogi)',
    narrator: 'Jolanta (53 lata, Kielce)',
    protagonist: 'Jolanta (53 lata)',
    hookIdea:
      'Miałam w szafce na buty całą kolekcję silikonowych i żelowych podpiętek z niebieskim kółkiem na środku. Wydawało mi się to logiczne: skoro boli pięta, to trzeba podłożyć pod nią coś miękkiego. Dopiero fizjoterapeuta wziął moje podpiętki do ręki i pokazał mi, dlaczego z każdym tygodniem robiłam sobie coraz większą krzywdę.',
    sceneBeat:
      'Kiedy pięta zapada się w miękki żel jak w budyń, a śródstopie i łuk stopy wiszą w powietrzu bez podparcia, rozcięgno podeszwowe napina się jak cięciwa łuku i z podwójną siłą wyrywa okostną z kości piętowej.',
    failedSolutionsMath:
      '5 par żelowych podpiętek 245 zł + zabiegi laserem i krioterapią 480 zł + twarde wkładki na zamówienie 400 zł = 1125 zł',
    discoveryBridge:
      'Wątek na forum podologicznym porównujący zwykłe podpiętki z pełnymi wkładkami dynamicznymi Orthomax StepMax.',
    defaultHeadline: 'Kupiłam w aptece 5 par żelowych podpiętek na ostrogę. Fizjoterapeuta przeciął jedną nożyczkami i pokazał mi mój błąd',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d4-przecieta-zelowa-podpietka.jpg',
    defaultImageHash: 'fe7c3ff63b8d633210c1838aa3aa0097',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-stare-szare-wkladki.jpg',
    defaultSecondImageHash: 'e1fcc551ec20c08475788629588bcd8a',
  },
  {
    id: 'dorosli-20-ostroga-strach-po-postoju',
    number: 55,
    code: 'D20_ostroga_strach_po_postoju',
    title: '[OSTROGA · V5 WSTYD W PRACY] W pracy najbardziej bałam się momentu, w którym po godzinie przy biurku musiałam wstać przy ludziach.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D4 (Ostroga)',
    awarenessStage: 'Stage 2: Ból startowy po siedzeniu w pracy / w samochodzie',
    sophistication: 'Poziom 3/4 (Wykres podobarograficzny nacisku + odciążenie pięty i łuku)',
    narrator: 'Sylwia (46 lat, Gdynia)',
    protagonist: 'Sylwia (46 lat)',
    hookIdea:
      'W wieku 46 lat czułam się w pracy jak staruszka. Najgorszy był moment, kiedy po godzinie siedzenia przy komputerze ktoś wołał mnie do drukarki albo do pokoju obok. Wstawałam z krzesła i przez pierwsze pięć sekund udawałam, że szukam długopisu na biurku, bo przy pierwszym kroku moja prawa pięta i kostka były sztywne jak z betonu.',
    sceneBeat:
      'Wykres z komputerowego badania stóp (podobarograf) pokazuje czerwone plamy przeciążenia na pięcie i brak pracy śródstopia przez zapadnięty łuk.',
    failedSolutionsMath:
      'Wkładki z Rossmanna i apteki 110 zł + prywatne wizyty 400 zł + twarde wkładki indywidualne 420 zł = 930 zł',
    discoveryBridge:
      'Koleżanka z sąsiedniego działu w biurze, która miała ten sam „ból startowy" po wstaniu z krzesła, poleca jej wkładki Orthomax StepMax.',
    defaultHeadline: 'W pracy najbardziej bałam się momentu, w którym po godzinie przy biurku musiałam wstać przy ludziach i zrobić pierwsze 5 kroków',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d4-ostroga-6rano-framuga.jpg',
    defaultImageHash: 'dfc30ffec55dd833d6568b3dc0909a4a',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-wykres-podobarograf.jpg',
    defaultSecondImageHash: 'eca5fdfc5253bab59a39f1fa93b4f39a',
  },

  // ==================== GRUPA D5 (HALUKS_ROZMIAR · #56–#60 / D21–D25): Haluksy, Rozlana Stopa i Zimowe Botki ====================
  {
    id: 'dorosli-21-haluks-zimowe-botki-zamek',
    number: 56,
    code: 'D21_haluks_zimowe_botki_zamek',
    title: '[HALUKS I BOTKI · V1 ZAMEK] Wyciągnęłam z szafy skórzane botki z zeszłej zimy za 480 zł i nie byłam w stanie zasunąć zamka.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D5 (Haluks i Rozmiar)',
    awarenessStage: 'Stage 1/2: Szok przy zakładaniu jesiennych/zimowych butów',
    sophistication: 'Poziom 3/4 (Stopa zapada się jak namiot bez masztu i rozlewa na szerokość)',
    narrator: 'Iwona (48 lat, Wrocław)',
    protagonist: 'Iwona (48 lat)',
    hookIdea:
      'W zeszły wtorek rano na termometrze było 5 stopni. Wyciągnęłam z szafy moje ulubione skórzane botki z zeszłej zimy za 480 zł, usiadłam na pufie w przedpokoju i zamarłam: zamek zatrzymał się w połowie podbicia, a kość przy dużym palcu piekła od samego dotknięcia skóry.',
    sceneBeat:
      'Podolog pokazuje Iwonie na jej stopie test: kiedy podnosi palcami jej zapadnięty łuk podłużny, rozlane przodostopie natychmiast zwęża się o prawie centymetr, a wypchnięta kość przy paluchu chowa się do linii stopy.',
    failedSolutionsMath:
      'Rozciąganie butów u szewca 80 zł + pianki rozbijające skórę 55 zł + żelowe wkładki 75 zł + twarde wkładki 390 zł = 600 zł',
    discoveryBridge:
      'Grupa dla kobiet na Facebooku i polecenie wkładek Orthomax StepMax, które podnoszą sklepienie stopy bez zabierania miejsca w bucie.',
    defaultHeadline: 'Wyciągnęłam z szafy skórzane botki z zeszłej zimy za 480 zł i nie byłam w stanie zasunąć zamka. Stopa rozlała się po lecie',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d5-zimowe-botki-zamek-haluks.jpg',
    defaultImageHash: '4b75aef3e981e2b04a4e64df6b842ed5',
    defaultSecondImageUrl: '/antki-pl-images/ai-zima-31-dorosli-zimowe-botki.jpg',
    defaultSecondImageHash: 'd9c54511f796aee02e13531f56dcd366',
  },
  {
    id: 'dorosli-22-haluks-wstyd-rozmiar-40',
    number: 57,
    code: 'D22_haluks_wstyd_rozmiar_40',
    title: '[HALUKS I BOTKI · V2 ROZMIAR 40] Przez 30 lat nosiłam rozmiar 38. Tej jesieni musiałam ze wstydu poprosić w sklepie o rozmiar 40.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D5 (Haluks i Rozmiar)',
    awarenessStage: 'Stage 2: Upokorzenie w sklepie obuwniczym (kupowanie coraz większych butów)',
    sophistication: 'Poziom 3/4 (Kości dorosłego nie rosną - opada łuk stopy)',
    narrator: 'Danuta (54 lata, Poznań)',
    protagonist: 'Danuta (54 lata)',
    hookIdea:
      'Przez trzydzieści lat nosiłam klasyczne 38. Tej jesieni w galerii handlowej siedziałam na pufie otoczona sześcioma pudełkami po butach i z piekącymi ze wstydu policzkami musiałam poprosić młodą ekspedientkę o przyniesienie rozmiaru 40. Na długość palce pływały w pustym czubku, ale w 38 moja stopa na szerokość dusiła się jak w imadle.',
    sceneBeat:
      'Wyjaśnienie u fizjoterapeuty, dlaczego kupowanie za długich butów o rozmiar większych niszczy kolana i dlaczego podniesienie łuku stopy przywraca jej naturalny kształt i szerokość.',
    failedSolutionsMath:
      '2 pary za dużych butów 720 zł + zapiętki i półwkładki 85 zł + sztywne wkładki ze sklepu medycznego 380 zł = 1185 zł',
    discoveryBridge:
      'Dyskusja na forum dla kobiet 50+ o „rosnącej stopie po czterdziestce" i odkrycie wkładek Orthomax StepMax.',
    defaultHeadline: 'Przez 30 lat nosiłam rozmiar 38. Tej jesieni wyszłam ze sklepu z czerwonymi ze wstydu policzkami, bo musiałam poprosić o 40',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d5-zimowe-botki-zamek-haluks.jpg',
    defaultImageHash: '4b75aef3e981e2b04a4e64df6b842ed5',
    defaultSecondImageUrl: '/antki-pl-images/lib-antki-przed-po-luk-bok.jpg',
    defaultSecondImageHash: '29ba838c47dc168e943859f08f4e3c63',
  },
  {
    id: 'dorosli-23-haluks-separatory-i-szyny-mit',
    number: 58,
    code: 'D23_haluks_separatory_i_szyny_mit',
    title: '[HALUKS · V3 MIT SEPARATORÓW] Wydałam 640 zł na silikonowe kliny między palce i szyny na noc. Podolog w 30 sekund pokazał mi mój błąd.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D5 (Haluks i Rozmiar)',
    awarenessStage: 'Stage 3: Kobiety zmęczone nieskutecznymi separatorami, klinami i aparatami nocnymi na haluksy',
    sophistication: 'Poziom 4 (Haluks nie zaczyna się na palcu - zaczyna się w zapadniętej kostce i łuku)',
    narrator: 'Elżbieta (51 lat, Kraków)',
    protagonist: 'Elżbieta (51 lat)',
    hookIdea:
      'W mojej szafce nocnej leżało całe cmentarzysko obietnic z internetu: silikonowe kliny między palce, żelowe osłonki, które zsuwały się w skarpetce po pięciu minutach, i plastikowe szyny korekcyjne na noc, z których budziłam się z bólu nad ranem. Wydałam na to 640 zł, a kość przy dużym palcu z miesiąca na miesiąc wystawała coraz bardziej.',
    sceneBeat:
      'Podolog bierze stopę Elżbiety w dłonie i pokazuje jej mechanizm: kiedy w dzień robisz 8000 kroków na zapadniętej do środka kostce, cały ciężar ciała spycha paluch do boku przy każdym odbiciu. Żadna szyna w łóżku bez obciążenia nie cofnie tego, co 70 kilogramów masy ciała miażdży przez 12 godzin na betonie.',
    failedSolutionsMath:
      'Aparaty nocne i separatory 260 zł + maści z żywokostu i plastry 180 zł + twarde wkładki ortopedyczne 400 zł = 840 zł',
    discoveryBridge:
      'Grupa FB „Haluksy bez operacji" i zdjęcia kobiet używających dynamicznych wkładek Orthomax StepMax.',
    defaultHeadline: 'Wydałam 640 zł na silikonowe kliny między palce i szyny na noc. Podolog w 30 sekund pokazał mi, dlaczego haluks nie robi się na palcu',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d5-mokra-stopa-dorosli-kafelki.jpg',
    defaultImageHash: 'a5a30c8d4c553880912632fee447ab1d',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d3-kostki-od-tylu-12stopni.jpg',
    defaultSecondImageHash: '4778b1876d335e8a0e77a86e15223c86',
  },
  {
    id: 'dorosli-24-haluks-zdarte-buty-od-srodka',
    number: 59,
    code: 'D24_haluks_zdarte_buty_od_srodka',
    title: '[DOMOWY DETEKTYW · V4 ZDARTE BUTY] Myślałam, że dzisiaj produkują po prostu tandetne buty, bo 3 para miała starte obcasy od wewnątrz.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D5 (Haluks i Rozmiar)',
    awarenessStage: 'Stage 1 (Unaware): Odkrycie problemu przez zdarte podeszwy i wykrzywione zapiętki własnych butów',
    sophistication: 'Poziom 3 (To nie wina szewca ani fabryki - to kość piętowa uciekająca o 12 stopni)',
    narrator: 'Agnieszka (44 lata, Łódź)',
    protagonist: 'Agnieszka (44 lata)',
    hookIdea:
      'Podczas jesiennego porządkowania szafki w przedpokoju ustawiłam w rzędzie cztery pary moich butów: skórzane sztyblety, adidasy, mokasyny do pracy i zeszłoroczne kozaki. Spojrzałam na nie z poziomu podłogi i zamarłam - każdy lewy i prawy but był przechylony do środka, a wewnętrzne krawędzie obcasów były zjedzone pod skosem jak ścięte tarnikiem.',
    sceneBeat:
      'Wizyta u fizjoterapeuty i 10-sekundowy test łuku stopy wyjaśniają, dlaczego Agnieszka niszczyła każdą parę butów w trzy miesiące i skąd brał się jej wieczorny ból kolan oraz lędźwi.',
    failedSolutionsMath:
      'Wymiana fleków u szewca 120 zł + 2 pary nowych butów 890 zł + twarde wkładki ze sklepu medycznego 380 zł = 1390 zł',
    discoveryBridge:
      'Wątek na grupie kobiecej na FB ze zdjęciem identycznie startych obcasów i poleceniem wkładek Orthomax StepMax.',
    defaultHeadline: 'Myślałam, że dzisiaj produkują po prostu tandetne buty, bo trzecia para w tym roku miała starte do zera obcasy od wewnętrznej strony',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d1-zdarte-polbuty-obcas.jpg',
    defaultImageHash: 'd05552e6774415a5f297ad31d20f3b29',
    defaultSecondImageUrl: '/antki-pl-images/ai-dom-01-zdarte-buty.jpg',
    defaultSecondImageHash: '12429338c7ae40326e42571f072b8b12',
  },
  {
    id: 'dorosli-25-haluks-mokry-slad-w-lazience',
    number: 60,
    code: 'D25_haluks_mokry_slad_w_lazience',
    title: '[TEST MOKREJ STOPY · V5 ŁAZIENKA] Wyszłam spod prysznica i spojrzałam na ciemne kafelki. Zamiast łuku stopy zobaczyłam dwa płaskie prostokąty.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D5 (Haluks i Rozmiar)',
    awarenessStage: 'Stage 1 (Unaware): Domowy test mokrej stopy na kafelkach + ciężkie, spuchnięte łydki wieczorem',
    sophistication: 'Poziom 3/4 (Zapadnięte sklepienie stopy blokuje pompę mięśniową łydki)',
    narrator: 'Marzena (47 lat, Warszawa)',
    protagonist: 'Marzena (47 lat)',
    hookIdea:
      'W zeszły czwartek wieczorem wyszłam spod prysznica i stanęłam mokrymi stopami na ciemnoszarych kafelkach w łazience. Kiedy zrobiłam krok po ręcznik i odwróciłam się, zobaczyłam na podłodze dwa pełne, szerokie prostokąty wody - bez najmniejszego wcięcia po wewnętrznej stronie.',
    sceneBeat:
      'Przez dwa lata Marzena smarowała łydki żelami z heparyną i łykała magnez na nocne skurcze. Fizjoterapeuta pokazuje jej w 10-sekundowym teście, że gdy łuk stopy leży płasko na ziemi, ścięgno i mięsień brzuchaty łydki są w ciągłym przykurczu.',
    failedSolutionsMath:
      'Żele z heparyną i tabletki na krążenie 340 zł + podkolanówki uciskowe 190 zł + sztywne wkładki 380 zł = 910 zł',
    discoveryBridge:
      'Polecenie na grupie FB od fizjoterapeutki uroginekologicznej i naczyniowej - dynamiczne wkładki Orthomax StepMax.',
    defaultHeadline: 'Wyszłam spod prysznica i spojrzałam na ciemne kafelki w łazience. Zamiast łuku stopy zobaczyłam dwa płaskie prostokąty',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d5-mokra-stopa-dorosli-kafelki.jpg',
    defaultImageHash: 'a5a30c8d4c553880912632fee447ab1d',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d3-ryciak-stopa-test-dloni.jpg',
    defaultSecondImageHash: 'f93c48f3d3347ad58db12773cff53a62',
  },

  // ==================== GRUPA D6 (ZAL_SKALPEL · #61–#65 / D26–D30): Żal po Operacji, Śruby i Strach przed Wózkiem ====================
  {
    id: 'dorosli-26-zal-lewa-stopa-sruby-8200zl',
    number: 61,
    code: 'D26_zal_lewa_stopa_sruby_8200zl',
    title: '[ŻAL PO OPERACJI · V1 8200 ZŁ] Na moją lewą stopę było już za późno (8200 zł i 2 tytanowe śruby w kości). Ale prawą uratowałam bez skalpela.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Dorośli · Grupa D6 (Żal po operacji)',
    awarenessStage: 'Stage 4: High Stakes - Kobiety rozważające operację stopy / haluksa',
    sophistication: 'Poziom 4 (Brutalna prawda o 6 tygodniach w bucie Baruka vs ratunek drugiej stopy)',
    narrator: 'Teresa (58 lat, Wrocław)',
    protagonist: 'Teresa (58 lat)',
    hookIdea:
      'Patrzę teraz na moje dwie stopy oparte na dywanie. Na lewej mam 7-centymetrową bliznę, dwie tytanowe śruby wkręcone w kość śródstopia i rachunek z prywatnej kliniki na 8200 zł. Na mojej lewej stopie chirurdzy zrobili już swoje. Ale moją prawą stopę - która rok po zabiegu zaczęła boleć dokładnie tak samo - uratowałam bez skalpela.',
    sceneBeat:
      'Kontrast między 6 tygodniami wycia z bólu o kulach w bucie Baruka a wizytą u fizjoterapeuty rehabilitującego po zabiegu, który pokazał Teresie 10-sekundowy test łuku na prawej stopie.',
    failedSolutionsMath:
      'Operacja lewej stopy 8200 zł + but Baruka i kule 320 zł + taksówki na opatrunki 640 zł + rehabilitacja 1200 zł = 10 360 zł',
    discoveryBridge:
      'Pacjentka z sali rehabilitacyjnej i forum pooperacyjne na FB, gdzie kobiety ratowały drugą stopę wkładkami Orthomax StepMax.',
    defaultHeadline: 'Na moją lewą stopę było już za późno (8200 zł i 2 tytanowe śruby w kości). Ale prawą uratowałam bez skalpela',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d6-uchwyt-prysznic-blizna-stopa.jpg',
    defaultImageHash: 'faa5186b6bdd3f04227e66b310b09eaf',
    defaultSecondImageUrl: '/antki-pl-images/ai-zal-26-po-operacji-kule.jpg',
    defaultSecondImageHash: '22629f2d8b1f0a4926db2574412fd2a4',
  },
  {
    id: 'dorosli-27-zal-haluks-siostry-wrocil',
    number: 62,
    code: 'D27_zal_haluks_siostry_wrocil',
    title: '[ŻAL PO OPERACJI · V2 NAWRÓT] Moja siostra zapłaciła 8100 zł za operację haluksa i cierpiała 6 tygodni. Po 2 latach kość wyszła z powrotem.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Dorośli · Grupa D6 (Żal po operacji)',
    awarenessStage: 'Stage 4: Dlaczego haluksy wracają po operacji (wycięcie skutku zamiast przyczyny)',
    sophistication: 'Poziom 4 (Chirurg spiłował kość, ale zostawił koślawą piętę i zapadnięty łuk)',
    narrator: 'Hanna (53 lata, Kraków)',
    protagonist: 'Hanna (53 lata) i siostra Ania (56 lat)',
    hookIdea:
      'Dwa lata temu moja starsza siostra Ania wzięła pożyczkę i zapłaciła 8100 zł za operację haluksa. Pamiętam, jak zmieniałam jej zakrwawione opatrunki i nosiłam jej talerz z zupą do łóżka, bo nie była w stanie stanąć na nodze. W zeszłą sobotę Ania przyjechała do mnie, zdjęła półbuty w przedpokoju i rozpłakała się - kość przy paluchu wyszła z powrotem.',
    sceneBeat:
      'Wspólna wizyta u podologa wyjaśnia dramat: operacja wyprostowała sam palec, ale po wyjęciu szwów Ania wróciła do chodzenia na zapadniętym łuku stopy (kąt koślawości pięty na podoskopie), który w 24 miesiące znów wypchnął staw.',
    failedSolutionsMath:
      'Operacja siostry 8100 zł + leki i wizyty kontrolne 650 zł + twarde wkładki pooperacyjne 420 zł = 9170 zł',
    discoveryBridge:
      'Wątek na grupie FB „Haluksy - operować czy nie?" i polecenie dynamicznych wkładek Orthomax StepMax.',
    defaultHeadline: 'Moja siostra zapłaciła 8100 zł za operację haluksa i cierpiała 6 tygodni. Po 2 latach kość wyszła z powrotem',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d6-uchwyt-prysznic-blizna-stopa.jpg',
    defaultImageHash: 'faa5186b6bdd3f04227e66b310b09eaf',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d5-zimowe-botki-zamek-haluks.jpg',
    defaultSecondImageHash: '4b75aef3e981e2b04a4e64df6b842ed5',
  },
  {
    id: 'dorosli-28-zal-uchwyt-pod-prysznicem-52-lata',
    number: 63,
    code: 'D28_zal_uchwyt_pod_prysznicem_52_lata',
    title: '[STRACH PRZED WÓZKIEM · V3 UCHWYT] Moja mama przestała chodzić w wieku 56 lat. Ja mam 52 lata, a w sobotę mąż wiercił mi uchwyt pod prysznicem.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Dorośli · Grupa D6 (Żal po operacji)',
    awarenessStage: 'Stage 4: Egzystencjalny strach przed utratą samodzielności i powtórzeniem losu matki',
    sophistication: 'Poziom 4 (Zatrzymanie kaskady zwyrodnieniowej od stóp przez kolana do bioder)',
    narrator: 'Beata (52 lata, Łódź)',
    protagonist: 'Beata (52 lata)',
    hookIdea:
      'Moja mama przestała wychodzić z mieszkania w wieku 56 lat, bo jej kolana i stopy były już tak wykrzywione, że każde wyjście na schody kończyło się płaczem. Ja mam dziś 52 lata. W zeszłą sobotę siedziałam w kuchni i słuchałam, jak mąż wiertarką udarową wierci dziury w kafelkach pod prysznicem, żeby zamontować mi biały uchwyt dla niepełnosprawnych.',
    sceneBeat:
      'Moment przełomu w gabinecie fizjoterapeuty, który pokazuje Beacie zbliżenie na jej koślawe pięty od tyłu i robi 10-sekundowy test podniesienia łuków stóp dłońmi.',
    failedSolutionsMath:
      'Zastrzyki i blokady 900 zł + prywatna rehabilitacja 1100 zł + sztywne wkładki na zamówienie 390 zł = 2390 zł',
    discoveryBridge:
      'Kobieta na grupie wsparcia dla osób ze zwyrodnieniem stawów kolanowych i skokowych poleca wkładki Orthomax StepMax.',
    defaultHeadline: 'Moja mama przestała chodzić w wieku 56 lat. Ja mam 52 lata, a w sobotę mąż musiał wiercić mi uchwyt pod prysznicem',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d3-kostki-od-tylu-12stopni.jpg',
    defaultImageHash: '4778b1876d335e8a0e77a86e15223c86',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d6-uchwyt-prysznic-blizna-stopa.jpg',
    defaultSecondImageHash: 'faa5186b6bdd3f04227e66b310b09eaf',
  },
  {
    id: 'dorosli-29-zal-za-5-lat-endoproteza',
    number: 64,
    code: 'D29_zal_za_5_lat_endoproteza',
    title: '[KUBSON COPY · V4 ZA 5 LAT STÓŁ] „Jeśli nie zatrzymamy zapadania stopy dzisiaj, za 5 lat spotkamy się na wymianie stawu kolanowego".',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Dorośli · Grupa D6 (Żal po operacji)',
    awarenessStage: 'Stage 3/4: Re-inżynieria kąta „Kubson copy za 5 lat..." - ostrzeżenie lekarza przed endoprotezą',
    sophistication: 'Poziom 4 (Każdy miesiąc zwłoki to 240 000 kroków ścierających chrząstkę kolana)',
    narrator: 'Alicja (55 lat, Poznań)',
    protagonist: 'Alicja (55 lat)',
    hookIdea:
      'Przez trzy lata powtarzałam sobie to samo zdanie, które mówią miliony Polek po pięćdziesiątce: „W tym wieku to już każdego coś boli, wezmę tabletkę i rozchodzę". Przestałam tak mówić w zeszły czwartek, kiedy ortopeda powiesił moje zdjęcie RTG na podświetlanej tablicy, spojrzał na moje bose stopy i powiedział: „Pani Alicjo, jeśli nie zatrzymamy zapadania pięty dzisiaj, za 5 lat spotkamy się na stole operacyjnym na wymianie stawu kolanowego".',
    sceneBeat:
      'Krótki, uderzający dialog w stylu Ryciak Rip 3 + Kubson copy: 240 000 kroków miesięcznie pod kątem 12 stopni działa na przyśrodkową część kolana jak papier ścierny.',
    failedSolutionsMath:
      'Tabletki przeciwbólowe i osłonowe przez 2 lata 780 zł + kolagen i glukozamina 420 zł + twarde wkładki 380 zł = 1580 zł',
    discoveryBridge:
      'Forum pacjentów ortopedycznych i setki zdjęć wkładek Orthomax StepMax, które ustawiają piętę i kolano w osi.',
    defaultHeadline: '„Jeśli nie zatrzymamy zapadania stopy dzisiaj, za 5 lat spotkamy się na wymianie stawu kolanowego" - te słowa lekarza zmieniły wszystko',
    defaultImageUrl: '/antki-pl-images/lib-antki-rtg-kolan.jpg',
    defaultImageHash: '798de84bd37c6b1dc43ba1e89354a242',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d1-sor-krzeselko-kolano.jpg',
    defaultSecondImageHash: '3795f92da5a3f17d3fd9a6e2e79f67b6',
  },
  {
    id: 'dorosli-30-zal-artroskopia-kolana-powrot-bolu',
    number: 65,
    code: 'D30_zal_artroskopia_kolana_powrot_bolu',
    title: '[ŻAL PO ARTROSKOPII · V5 KOLANO] Przeszłam artroskopię kolana i 3 miesiące rehabilitacji. Pół roku później drugie kolano zaczęło boleć tak samo.',
    segment: 'dorosli',
    funnelStage: 'zal_po_operacji',
    funnelLabel: 'Dorośli · Grupa D6 (Żal po operacji)',
    awarenessStage: 'Stage 4: Pacjentki po artroskopii / czyszczeniu łąkotki, którym wraca ból',
    sophistication: 'Poziom 4 (Czyszczenie łąkotki bez korekty stopy to naprawa opony bez ustawienia zbieżności kół)',
    narrator: 'Krystyna (56 lat, Gdańsk)',
    protagonist: 'Krystyna (56 lat)',
    hookIdea:
      'Kiedy rok temu szłam na artroskopię prawego kolana, lekarz zapewniał mnie, że wyczyszczą postrzępioną łąkotkę i zapomnę o bólu. Przeszłam zabieg, trzy miesiące chodziłam na bolesną rehabilitację, a pół roku później przy schodzeniu ze schodów usłyszałam ten sam trzask w lewym kolanie - i w prawym ból też zaczął wracać.',
    sceneBeat:
      'Fizjoterapeuta na prywatnej wizycie używa porównania, które Krystyna zapamiętała do końca życia: „Wykonała pani zabieg na kolanie, ale nikt w szpitalu nie ustawił zbieżności w stopach. Jeśli w samochodzie nie ustawi pani zbieżności, nowa opona zedrze się od środka dokładnie tak samo jak stara".',
    failedSolutionsMath:
      'Prywatna rehabilitacja po artroskopii 1800 zł + orteza zegarowa 450 zł + twarde wkładki na zamówienie 400 zł = 2650 zł',
    discoveryBridge:
      'Rozmowa z innym pacjentem w przychodni rehabilitacyjnej i odkrycie sprężystych wkładek Orthomax StepMax.',
    defaultHeadline: 'Przeszłam artroskopię kolana i 3 miesiące rehabilitacji. Pół roku później drugie kolano zaczęło boleć dokładnie w tym samym miejscu',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d1-sor-krzeselko-kolano.jpg',
    defaultImageHash: '3795f92da5a3f17d3fd9a6e2e79f67b6',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d1-zdarte-polbuty-obcas.jpg',
    defaultSecondImageHash: 'd05552e6774415a5f297ad31d20f3b29',
  },

  // ==================== GRUPA D7 (PRACA_4KROKI · #66–#70 / D31–D35): Praca Stojąca 8–12h, Mit Gipsu i Mechanizm 4 Kroków ====================
  {
    id: 'dorosli-31-praca-8h-na-nogach-kuchnia',
    number: 66,
    code: 'D31_praca_8h_na_nogach_kuchnia',
    title: '[PRACA STOJĄCA · V1 8H NA NOGACH] Po 8 godzinach na nogach w pracy wracam do domu i nie jestem w stanie ustać 20 minut przy kuchence.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D7 (Praca i 4 Kroki)',
    awarenessStage: 'Stage 2: Kobiety pracujące na stojąco (sklep, szkoła, usługi, produkcja)',
    sophistication: 'Poziom 3/4 (Odciążenie łuku i pięty podczas 8 godzin na betonie i gresie)',
    narrator: 'Edyta (48 lat, Katowice)',
    protagonist: 'Edyta (48 lat)',
    hookIdea:
      'Przez ostatni rok moje popołudnia wyglądały identycznie: wracałam po 8 godzinach stania w pracy, zrzucałam buty w przedpokoju, a kiedy podchodziłam do kuchenki, żeby ugotować obiad dla rodziny, musiałam opierać się łokciami i biodrem o blat, bo stopy i dół pleców paliły mnie żywym ogniem.',
    sceneBeat:
      'Analiza chodu i stania w gabinecie pokazuje, że po 2 godzinach stania bez dynamicznego wsparcia mięśnie krótkie stopy męczą się i puszczają, a przez kolejne 6 godzin cała masa ciała wisi na samych więzadłach i kościach.',
    failedSolutionsMath:
      '3 pary butów „do pracy stojącej" 690 zł + wkładki żelowe z drogerii 80 zł + żele chłodzące i tabletki 210 zł + twarde wkładki 380 zł = 1360 zł',
    discoveryBridge:
      'Polecenie na grupie zawodowej na Facebooku - wkładki Orthomax StepMax w pakiecie 1+1 (jedna para do butów do pracy, druga do butów wyjściowych).',
    defaultHeadline: 'Po 8 godzinach na nogach w pracy wracam do domu i nie jestem w stanie ustać 20 minut przy kuchence bez opierania się o blat',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d7-kuchnia-8h-wkladki-stepmax.jpg',
    defaultImageHash: 'f168f5fad5dd18811b5b0a8b869c27dd',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d2-mama-miska-woda-kuchnia.jpg',
    defaultSecondImageHash: '368c04cc8927fbde20ec38b2efc1c5c8',
  },
  {
    id: 'dorosli-32-praca-mit-twardych-wkladek-400zl',
    number: 67,
    code: 'D32_praca_mit_twardych_wkladek_400zl',
    title: '[MIT GIPSU · V2 TWARDE WKŁADKI 420 ZŁ] Wydałam 420 zł na twarde wkładki na zamówienie. Po 3 dniach wyjęłam je w pracy w toalecie ze łzami w oczach.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D7 (Praca i 4 Kroki)',
    awarenessStage: 'Stage 3/4: Rozczarowanie drogimi, sztywnymi wkładkami termoplastycznymi na wymiar',
    sophistication: 'Poziom 4 (Mit Gipsu: dlaczego twardy plastik za 420 zł odparza stopę i osłabia mięśnie)',
    narrator: 'Izabela (50 lat, Warszawa)',
    protagonist: 'Izabela (50 lat)',
    hookIdea:
      'Zapłaciłam 180 zł za komputerowe badanie i 420 zł za indywidualne wkładki ortopedyczne robione na zamówienie. Miały być moim wybawieniem. Trzeciego dnia w pracy w południe zamknęłam się w kabinie w toalecie, zdjęłam buty i ze łzami w oczach wyjęłam te dwa kawałki twardego jak kamień plastiku, bo na podbiciu miałam już krwawy odcisk.',
    sceneBeat:
      'Fizjoterapeuta stuka jej sztywną wkładką o kant biurka i tłumaczy: „Założyła pani stopie gips. Stopa to sprężyna złożona z 26 kości i 33 stawów - na twardym betonie potrzebuje sprężystego podparcia, które pracuje razem z nią, a nie sztywnej deski".',
    failedSolutionsMath:
      'Badanie komputerowe 180 zł + twarde wkładki na wymiar 420 zł + wkładki skórzane z apteki 95 zł = 695 zł',
    discoveryBridge:
      'Wątek na polskim forum o tym, dlaczego ludzie wyrzucają twarde wkładki za 400 zł i przechodzą na sprężyste wkładki Orthomax StepMax.',
    defaultHeadline: 'Wydałam 420 zł na twarde wkładki na zamówienie. Po 3 dniach wyjęłam je w pracy w toalecie ze łzami w oczach',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d4-przecieta-zelowa-podpietka.jpg',
    defaultImageHash: 'fe7c3ff63b8d633210c1838aa3aa0097',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d7-kuchnia-8h-wkladki-stepmax.jpg',
    defaultSecondImageHash: 'f168f5fad5dd18811b5b0a8b869c27dd',
  },
  {
    id: 'dorosli-33-praca-12h-dyzur-szpitalny-beton',
    number: 68,
    code: 'D33_praca_12h_dyzur_szpitalny_beton',
    title: '[12H NA PŁYTKACH · V3 12 000 KROKÓW] Robię 12 000 kroków dziennie na 12-godzinnych zmianach. Buty za 650 zł nie pomogły, bo problem był w środku.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D7 (Praca i 4 Kroki)',
    awarenessStage: 'Stage 3: Dlaczego najdroższe buty z grubą pianką nie wystarczają na 12h pracy',
    sophistication: 'Poziom 4 (Miękka podeszwa buta bez profilowanego korytka pięty pogłębia uciekanie kostki)',
    narrator: 'Dorota (51 lat, Łódź)',
    protagonist: 'Dorota (51 lat, pielęgniarka)',
    hookIdea:
      'Pracuję na 12-godzinnych zmianach na twardym szpitalnym korytarzu i mój zegarek pokazuje każdego dnia ponad 12 000 kroków. Kupiłam sobie markowe buty biegowe z najgrubszą pianką za 650 zł, myśląc, że im bardziej miękki but, tym mniej będą boleć nogi. Po miesiącu moje kolana i pięty bolały jeszcze gorzej niż w zwykłych butach.',
    sceneBeat:
      'Fizjoterapeuta z oddziału rehabilitacji bierze jej drogi but za 650 zł, wyjmuje fabryczną płaską wkładkę cienką jak tekturka i pokazuje: „Gruba, miękka podeszwa bez wyprofilowanego korytka pod piętę działa jak materac wodny - pięta zapada się do środka jeszcze głębiej".',
    failedSolutionsMath:
      'Buty z grubą pianką 650 zł + drugie obuwie medyczne 280 zł + maści chłodzące i kompresy 160 zł = 1090 zł',
    discoveryBridge:
      'Koleżanka z dyżuru pokazuje jej swoje pomarańczowo-czarne wkładki Orthomax StepMax włożone do butów zmiennych.',
    defaultHeadline: 'Robię 12 000 kroków dziennie na 12-godzinnych zmianach na twardych płytkach. Buty za 650 zł nie pomogły, bo problem był w środku',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d7-kuchnia-8h-wkladki-stepmax.jpg',
    defaultImageHash: 'f168f5fad5dd18811b5b0a8b869c27dd',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d1-sor-krzeselko-kolano.jpg',
    defaultSecondImageHash: '3795f92da5a3f17d3fd9a6e2e79f67b6',
  },
  {
    id: 'dorosli-34-praca-mechanizm-4-kroki',
    number: 69,
    code: 'D34_praca_mechanizm_4_kroki',
    title: '[CBO 5 · V4 MECHANIZM 4 KROKÓW] Dlaczego 9 na 10 wkładek z apteki ląduje w koszu po tygodniu? Fizjoterapeuta narysował mi 4 kroki.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D7 (Praca i 4 Kroki)',
    awarenessStage: 'Stage 3/4: Re-inżynieria adset2 4kroki z kampanii CBO 5',
    sophistication: 'Poziom 4 (4 jednoczesne punkty podparcia i amortyzacji dorosłej stopy)',
    narrator: 'Paulina (46 lat, Wrocław)',
    protagonist: 'Paulina (46 lat)',
    hookIdea:
      'Zanim trafiłam na właściwego fizjoterapeutę, miałam w szafie pudełko po butach pełne rozczarowań: cienkie wkładki skórzane z apteki, żelowe wkładki z drogerii, które spłaszczyły się po pięciu dniach, i twarde korkowe podpiętki. Myślałam, że „wkładki po prostu na mnie nie działają" - dopóki specjalista nie narysował mi na kartce 4 rzeczy, które muszą zadziałać jednocześnie w ułamku sekundy.',
    sceneBeat:
      'Rozbicie mechanizmu 4 kroków: (1) stabilizacja pięty w głębokim korytku U, (2) sprężysty mostek pod łukiem podłużnym, (3) odciążenie przodostopia i łuku poprzecznego, (4) absorpcja uderzenia o beton zanim fala wstrząsowa dojdzie do kolan i kręgosłupa.',
    failedSolutionsMath:
      '6 par różnych wkładek z apteki i drogerii 310 zł + twarde wkładki 380 zł + wizyty i zabiegi 540 zł = 1230 zł',
    discoveryBridge:
      'Porównanie na grupie rehabilitacyjnej na FB i zamówienie wkładek Orthomax StepMax z 30-dniową gwarancją testu.',
    defaultHeadline: 'Dlaczego 9 na 10 wkładek z apteki ląduje w koszu po tygodniu? Fizjoterapeuta narysował mi 4 kroki, które muszą zadziałać naraz',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d4-przecieta-zelowa-podpietka.jpg',
    defaultImageHash: 'fe7c3ff63b8d633210c1838aa3aa0097',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d7-kuchnia-8h-wkladki-stepmax.jpg',
    defaultSecondImageHash: 'f168f5fad5dd18811b5b0a8b869c27dd',
  },
  {
    id: 'dorosli-35-powrot-dorosli-14h-w-domu-i-pracy',
    number: 70,
    code: 'D35_powrot_dorosli_14h_w_domu_i_pracy',
    title: '[POWRÓT DOROŚLI · V5 14H OCHRONY] Przez 3 lata popełniałam ten sam błąd: ratowałam stopy przez 2h na spacerze, a przez 12h niszczyłam je w pracy i w domu.',
    segment: 'dorosli',
    funnelStage: 'dorosli_jesien_zima',
    funnelLabel: 'Dorośli · Grupa D7 (Praca i 4 Kroki)',
    awarenessStage: 'Stage 3/4: Re-inżynieria 11.03 POWRUT DOROSLI (Matematyka 14 godzin na twardym podłożu)',
    sophistication: 'Poziom 4 (Dlaczego 1 para wkładek w butach wyjściowych to za mało i po co jest pakiet 1+1)',
    narrator: 'Małgorzata (52 lata, Gdańsk)',
    protagonist: 'Małgorzata (52 lata)',
    hookIdea:
      'Przez trzy lata zachodziłam w głowę, dlaczego ból pięt, kolan i krzyża ciągle do mnie wraca, skoro w moich jesiennych półbutach na wyjścia mam dobre wkładki. Odpowiedź padła w gabinecie fizjoterapeuty w 30 sekund, kiedy zapytał mnie: „A ile godzin dziennie chodzi pani w tych butach wyjściowych? Dwie? A co robią pani stopy przez pozostałe dwanaście godzin w pracy i na twardych panelach w domu?".',
    sceneBeat:
      'Brutalna matematyka dorosłego dnia jesienią i zimą: 8-9 godzin w obuwiu w pracy + 4-5 godzin w domu na twardych kafelkach i panelach = 14 godzin dziennie i ponad 240 000 kroków miesięcznie. Dopiero zabezpieczenie obu głównych par obuwia (dzięki pakietowi 1+1 GRATIS) przerywa błędne koło kompensacji.',
    failedSolutionsMath:
      'Pojedyncza para drogich wkładek 380 zł + rehabilitacja nawracającego bólu 960 zł + maści i leki 220 zł = 1560 zł',
    discoveryBridge:
      'Wątek na grupie FB o ciągłości podparcia stopy przez cały dzień i pakiet 1+1 GRATIS wkładek Orthomax StepMax (2 pary za 99,99 zł = 50 zł za parę).',
    defaultHeadline: 'Przez 3 lata popełniałam ten sam błąd: ratowałam stopy tylko przez 2 godziny na spacerze, a przez 12 godzin niszczyłam je w pracy i w domu',
    defaultImageUrl: '/antki-pl-images/kie-dorosli-d7-kuchnia-8h-wkladki-stepmax.jpg',
    defaultImageHash: 'f168f5fad5dd18811b5b0a8b869c27dd',
    defaultSecondImageUrl: '/antki-pl-images/kie-dorosli-d1-zdarte-polbuty-obcas.jpg',
    defaultSecondImageHash: 'd05552e6774415a5f297ad31d20f3b29',
  },
];
