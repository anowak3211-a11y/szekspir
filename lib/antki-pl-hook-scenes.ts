export interface KiePlannedScene {
  label: string;
  scenePrompt: string;
  includeProductRef: boolean;
}

/**
 * Dla każdego Antka od #45 do #70 zwraca 5 unikalnych scen bezpośrednio z HOOKA tego konkretnego copy
 * (czyli 50% z 10 generowanych zdjęć to wariacje i ujęcia samej sceny otwierającej / hooka!).
 */
export const HOOK_SCENES_FROM_ANTEK_45: Record<string, KiePlannedScene[]> = {
  // #45: Rok temu na moich urodzinach mama przesiedziała 5 godzin przy stole, bo nie mogła wcisnąć stóp w buty
  'dorosli-10-m-jakuba-wesele-buty-w-reku': [
    {
      label: '1. [HOOK] Pod obrusem na urodzinach: spuchnięte bose stopy mamy obok czółenek',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo peeking under a white lace tablecloth at a Polish family birthday dinner: a 62-year-old woman’s swollen, reddened bare feet resting on the floor because she secretly slipped off her tight black leather dress shoes (czółenka) lying on their side next to her feet. Dim warm room lighting, realistic phone camera grain.',
    },
    {
      label: '3. [HOOK] Mama siedząca sama przy stole z ciastem, gdy reszta rodziny stoi do zdjęcia',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone snapshot in a Polish apartment living room during a family birthday party: a 62-year-old woman in an elegant blouse sitting alone at the dinner table with cake plates and teacups, smiling weakly while holding her phone to take a photo because her feet hurt too much to stand up. Warm indoor ceiling light, natural perspective.',
    },
    {
      label: '4. [HOOK] Próba wciśnięcia opuchniętej stopy z powrotem w elegancki but pod stołem',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV amateur phone photo at a family party: a 62-year-old woman’s hand trying to slide her swollen forefoot and reddened bunion back into a narrow black leather low-heel shoe under the table, visibly too tight across the instep. Indoor lighting, realistic phone photo.',
    },
    {
      label: '5. [HOOK] Powrót z urodzin: czółenka niesione w ręku na klatce schodowej',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo on a Polish apartment building staircase at night: a 62-year-old woman in a coat walking slowly holding the handrail with one hand and carrying her black dress shoes in the other hand because her swollen feet could not fit inside them anymore.',
    },
    {
      label: '6. [HOOK] Trzy pary rozepchanych damskich czółenek w przedpokoju',
      includeProductRef: false,
      scenePrompt:
        'Eye-level floor smartphone photo in a Polish hallway: three pairs of women’s wide dress shoes and loafers lined up on a doormat, all stretched out sideways at the forefoot with worn inner heels.',
    },
  ],

  // #46: Przez pół roku leczyłam ból prawego barku i karku za 1420 zł. Fizjoterapeuta kazał mi zdjąć buty
  'dorosli-11-ryciak-dorosli-bark-i-kark': [
    {
      label: '1. [HOOK] Trzymanie się za bolący prawy bark i sztywny kark przed lustrem',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a Polish apartment hallway mirror: a 47-year-old woman holding her aching right shoulder and stiff neck with her left hand, a warming pain relief patch visible on the side of her neck/shoulder, tired expression under warm indoor light.',
    },
    {
      label: '3. [HOOK] Gabinet fizjoterapeuty: bose stopy i wyraźnie uniesiony prawy bark od tyłu',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo taken from behind in a Polish physiotherapy room: a 47-year-old woman standing barefoot in rolled-up trousers and a fitted t-shirt in front of a posture grid mirror, clearly showing her right ankle collapsing inward and her right shoulder tilted higher than the left.',
    },
    {
      label: '4. [HOOK] 10-sekundowy test: dłonie fizjoterapeuty unoszą łuk stopy, a bark opada',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur phone snapshot at floor level in a Polish physiotherapy clinic: a physiotherapist’s hands lifting the inner arch of a 47-year-old woman’s bare foot from underneath, immediately straightening her ankle and shin alignment.',
    },
    {
      label: '5. [HOOK] Plastry rozgrzewające na kark i maści za 1420 zł na blacie',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden tabletop filling 100% of the frame (NO floating table edges): opened packets of warming neck/shoulder patches, two squeezed white ointment tubes, and a Polish clinic referral slip for cervical spine massage.',
    },
    {
      label: '6. [HOOK] Zdjęte na prośbę fizjoterapeuty półbuty stojące obok kozetki',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur phone snapshot in a Polish physiotherapy office: a woman’s everyday leather shoes taken off on the linoleum floor next to a medical examination couch, with the inner heel edges noticeably worn down at an angle.',
    },
  ],

  // #47: Przez 2 lata leczono mnie na dyskopatię lędźwiową za 2150 zł. Dr Ryciak podniósł moje stopy dłońmi
  'dorosli-12-ryciak-dorosli-ledzwie-dyskopatia': [
    {
      label: '1. [HOOK] Ostry ból w krzyżu i lędźwiach L4-L5 przy wstawaniu z krzesła',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a Polish apartment living room: a 50-year-old woman standing up from a chair and pressing both hands against her lower back (lumbar spine L4-L5) in pain, unable to straighten her posture completely.',
    },
    {
      label: '3. [HOOK] Płyta z rezonansu kręgosłupa lędźwiowego i karta zabiegów na stole',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden tabletop filling 100% of the frame (NO table edges, NO room background): a medical CD envelope labeled in Polish "BADANIE MR KRĘGOSŁUPA L-S" next to a stamped Polish rehabilitation card and painkiller blisters.',
    },
    {
      label: '4. [HOOK] Bose stopy na podświetlanym zielonym podoskopie u dr. Ryciaka',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo in a Polish orthopedic office: a 50-year-old woman standing barefoot on a glowing green glass podoscope platform, showing completely flat plantar footprints and ankles rolling inward.',
    },
    {
      label: '5. [HOOK] Pomiar kąta koślawości pięty (12 stopni) przezroczystym goniometrem',
      includeProductRef: false,
      scenePrompt:
        'Close-up floor-level amateur phone photo from behind in a clinic: a doctor’s hands holding a clear plastic orthopedic goniometer against the back of a woman’s bare heel and Achilles tendon, measuring a 12-degree inward valgus tilt.',
    },
    {
      label: '6. [HOOK] Dłonie lekarza podnoszące oba łuki stóp i prostujące miednicę',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo looking down in a doctor’s office: a doctor kneeling and supporting both inner arches of a woman’s bare feet with his hands on the clinic floor, leveling her knees and pelvis.',
    },
  ],

  // #48: Ortopeda w przychodni chciał mi wbijać kwas hialuronowy w kolano za 900 zł. Dr Ryciak kazał mi zdjąć buty
  'dorosli-13-ryciak-dorosli-kolano-zwyrodnienie': [
    {
      label: '1. [HOOK] Podwinięta nogawka i spuchnięte od wewnątrz kolano w przychodni',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in a Polish clinic waiting room: a 53-year-old woman sitting with her right trouser leg rolled up above the knee, holding the swollen inner side of her right knee joint with her hand.',
    },
    {
      label: '3. [HOOK] Opakowanie zastrzyku kwasu hialuronowego w kolano (900 zł) na blacie',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a tabletop surface filling 100% of the frame (NO floating table): a white medical box for a hyaluronic acid knee injection in a pre-filled syringe lying next to a Polish ultrasound knee report and a pharmacy receipt reading "SUMA PLN".',
    },
    {
      label: '4. [HOOK] Bose stopy i uciekające do środka kolano na podoskopie',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo in a Polish physiotherapy room: a 53-year-old woman standing barefoot on a podoscope with trousers rolled up to her knees, showing how her collapsed foot arch twists her shin and knee inward.',
    },
    {
      label: '5. [HOOK] Kłucie przyśrodkowej części kolana przy schodzeniu po schodach',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur phone snapshot looking down on a Polish apartment building staircase: a 53-year-old woman pausing mid-step, gripping the metal handrail with one hand and pressing the inner side of her right knee with the other.',
    },
    {
      label: '6. [HOOK] Test podniesienia łuku stopy dłońmi otwierający szparę w kolanie',
      includeProductRef: false,
      scenePrompt:
        'Close-up floor-level smartphone photo in a clinic: a physiotherapist’s hands lifting the collapsed medial arch of a woman’s right bare foot, visibly straightening the tibia and knee joint above.',
    },
  ],

  // #49: Myślałam, że mam jedną nogę krótszą i dlatego kuleję na lewe biodro. W gabinecie wystarczył 10-sekundowy test
  'dorosli-14-ryciak-dorosli-biodro-asymetria': [
    {
      label: '1. [HOOK] Przekrzywiona spódnica i opadające lewe biodro przed lustrem',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a Polish hallway mirror: a 55-year-old woman pointing at the waistband of her skirt, which is noticeably tilted downward on her left hip due to pelvic asymmetry.',
    },
    {
      label: '3. [HOOK] Lewa nogawka spodni przydeptana i brudna od chodnika przez opadniętą stopę',
      includeProductRef: false,
      scenePrompt:
        'Close-up floor-level amateur phone photo in a Polish hallway: the bottom hems of a woman’s trousers from behind — the left trouser cuff hangs lower and is frayed and mud-stained at the heel compared to the right leg.',
    },
    {
      label: '4. [HOOK] Widok od tyłu na bose stopy: lewa kostka zapadnięta mocniej niż prawa',
      includeProductRef: false,
      scenePrompt:
        'Raw floor-level amateur smartphone photo from behind on laminate floor panels: a 55-year-old woman’s bare feet and ankles showing strong asymmetry — her left ankle and arch collapse deeply inward while the right is higher.',
    },
    {
      label: '5. [HOOK] Utykanie i trzymanie się za piekące lewe biodro na spacerze',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur phone snapshot on a Polish autumn sidewalk: a 55-year-old woman in an autumn coat stopping by a fence and pressing her left hand firmly against her aching left hip and glute.',
    },
    {
      label: '6. [HOOK] Podpiętki wyrównujące z apteki, które wysadzały piętę z buta',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden floor surface filling 100% of the frame: two thick cork/leather heel lifts (podpiętki wyrównujące) next to a woman’s everyday shoe.',
    },
  ],

  // #50: Fizjoterapeuta położył telefon przy bieżni i nagrał moje stopy w zwolnionym tempie. Zamarłam, gdy zobaczyłam ten film
  'dorosli-15-ryciak-dorosli-slow-mo-bieznia': [
    {
      label: '1. [HOOK] Smartfon ustawiony przy samej podłodze obok bieżni nagrywający bose stopy',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a Polish physiotherapy room: a smartphone propped low on the floor right behind the belt of a medical treadmill, recording the bare feet and ankles of a 45-year-old woman walking on the treadmill in slow motion.',
    },
    {
      label: '3. [HOOK] Ekran telefonu z zatrzymaną klatką slow-mo: kostka łamiąca się do środka',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo of a physiotherapist holding his phone screen: the paused slow-motion video frame clearly shows a woman’s bare heel and ankle collapsing sharply inward upon hitting the treadmill belt.',
    },
    {
      label: '4. [HOOK] Ujęcie z poziomu taśmy bieżni: wykręcenie pięty i piszczeli w ułamku sekundy',
      includeProductRef: false,
      scenePrompt:
        'Low-angle floor-level smartphone snapshot from directly behind on a black treadmill belt: a 45-year-old woman’s bare right foot mid-step with the arch flattened completely and the ankle joint buckled inward.',
    },
    {
      label: '5. [HOOK] Czerwona linia na ścięgnie Achillesa pokazująca załamanie osi pięty',
      includeProductRef: false,
      scenePrompt:
        'Close-up floor-level smartphone photo from behind in a clinic: a woman’s bare heels and calves with a marker line drawn down the back of the lower leg and heel, visibly bending inward at a 12-degree angle under body weight.',
    },
    {
      label: '6. [HOOK] Wspólne oglądanie nagrania slow-motion na telefonie w gabinecie',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur phone photo in a Polish physiotherapy office: a woman sitting barefoot on the edge of an examination table covering her mouth in surprise as the physiotherapist shows her the slow-motion foot video on his smartphone.',
    },
  ],

  // #51: Kiedy o 6:00 rano dzwoni budzik, przez pierwsze 10 minut idę do łazienki trzymając się ściany i framug
  'dorosli-16-ostroga-pierwszy-krok-6-rano': [
    {
      label: '1. [HOOK] 6:00 rano: strach przed postawieniem bosych stóp z łóżka na podłogę',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo at 6:00 AM in a dim Polish bedroom: a 52-year-old woman sitting on the edge of her unmade bed with her bare feet hovering just above the cold laminate floor panels before taking the painful first morning step.',
    },
    {
      label: '3. [HOOK] Poranne wyjście do łazienki na palcach, trzymając się ściany i framugi',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a narrow dim Polish apartment hallway early in the morning: a 52-year-old woman in a bathrobe walking on tiptoes toward the bathroom while gripping the door frame and wall with both hands to avoid putting weight on her heels.',
    },
    {
      label: '4. [HOOK] Rozciąganie sztywnej stopy i palców w łóżku przed pierwszym krokiem',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in bed in the morning: a woman sitting on the bedsheets pulling her bare toes back toward her shin with her hand to stretch her tight plantar fascia before standing up.',
    },
    {
      label: '5. [HOOK] Zbliżenie na zaczerwienioną, piekącą piętę rano na brzegu łóżka',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur phone photo on the edge of a bed in morning light: a 52-year-old woman resting her bare foot across her other knee and pressing her thumb into the tender, reddened center of her heel.',
    },
    {
      label: '6. [HOOK] Płaskie, cienkie kapcie przy łóżku, które nie dawały żadnego podparcia rano',
      includeProductRef: false,
      scenePrompt:
        'Top-down smartphone photo pointing straight down at bedroom floor panels next to a bed: a pair of worn-out, paper-thin flat house slippers lying next to a bedside rug in dim morning light.',
    },
  ],

  // #52: Wydałam 1490 zł na 10 zabiegów fali uderzeniowej i 3 blokady w piętę. Ból wrócił po 6 tygodniach
  'dorosli-17-ostroga-fala-uderzeniowa-1500zl': [
    {
      label: '1. [HOOK] Głowica fali uderzeniowej z żelem przyłożona do bolesnej pięty',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur smartphone photo in a Polish physiotherapy clinic: a therapist’s gloved hand pressing a handheld shockwave therapy applicator (fala uderzeniowa) with clear ultrasound gel directly against the bottom of a 57-year-old woman’s bare heel on an examination table.',
    },
    {
      label: '3. [HOOK] Plasterek na pięcie po bolesnej blokadzie sterydowej z igły',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV amateur phone photo at home: the bottom and side of a woman’s bare heel with a small white sterile injection bandage applied right over the heel spur spot, skin slightly reddened around it.',
    },
    {
      label: '4. [HOOK] Karta 10 zabiegów fali uderzeniowej i polski paragon na 1490 zł (SUMA PLN)',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden tabletop filling 100% of the frame (NO floating table edges): a Polish rehabilitation treatment card listing 10 shockwave sessions ("Fala uderzeniowa - 10 zabiegów") next to a crumpled Polish thermal receipt reading "PARAGON FISKALNY" and "SUMA PLN".',
    },
    {
      label: '5. [HOOK] Zaciśnięte na prześcieradle dłonie na kozetce podczas zabiegu na piętę',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone snapshot in a clinic room: a woman lying face down on a medical couch gripping the paper sheet tightly with her hands while having her heel treated.',
    },
    {
      label: '6. [HOOK] Nawrót piekącego bólu pięty i śródstopia po 6 tygodniach od zabiegów',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur phone snapshot on a living room sofa at night: a 57-year-old woman holding her bare foot in both hands, rubbing both the heel and the arch after the pain returned.',
    },
  ],

  // #53: Przez 8 miesięcy co wieczór turlałam pod stopą zamrożoną butelkę wody ze łzami w oczach. Ulga trwała tylko 20 minut
  'dorosli-18-ostroga-zamrozona-butelka': [
    {
      label: '1. [HOOK] Bosa stopa turlająca po dywanie zamrożoną butelkę wody z lodem wieczorem',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in a Polish living room at night: a 49-year-old woman sitting on a sofa rolling a frosted plastic water bottle filled with solid white ice under the arch and heel of her bare foot on a small towel on the rug.',
    },
    {
      label: '3. [HOOK] Plastikowa butelka z zamarzniętą wodą w szufladzie zamrażarki między mrożonkami',
      includeProductRef: false,
      scenePrompt:
        'Candid first-person POV smartphone photo of an opened kitchen freezer drawer in a Polish apartment: a frosted plastic bottle of frozen solid water lying between bags of frozen dumplings (pierogi) and vegetables.',
    },
    {
      label: '4. [HOOK] Zbliżenie na zaczerwienioną piętę opartą na oszronionej butelce z lodem',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur smartphone photo at floor level: a bare female foot with a reddened heel pressing down onto a condensation-covered frozen plastic water bottle resting on a damp towel.',
    },
    {
      label: '5. [HOOK] Domowy zestaw z forów: zamrożona butelka, kolczasta piłeczka i maści',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a floor rug filling 100% of the frame: a frozen plastic water bottle, a spiky rubber massage ball, a tennis ball, and two squeezed Polish ointment tubes.',
    },
    {
      label: '6. [HOOK] Wieczorny masaż obolałego rozcięgna na kanapie po zdjęciu butów',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur phone snapshot on a couch under a warm lamp: a woman’s hands massaging the tight bottom arch of her bare foot next to a frosted bottle of ice on the floor.',
    },
  ],

  // #54: Kupiłam w aptece 5 par żelowych podpiętek na ostrogę. Fizjoterapeuta przeciął jedną nożyczkami i pokazał mi mój błąd
  'dorosli-19-ostroga-zelowe-podpietki-mit': [
    {
      label: '1. [HOOK] Żelowa podpiętka z niebieskim kółkiem przecięta nożyczkami na pół na biurku',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden desk surface filling 100% of the frame (NO table edges, NO room background): a clear silicone heel cup with a blue gel center disk cut cleanly in half with a pair of metal scissors lying right next to it.',
    },
    {
      label: '3. [HOOK] Dłoń fizjoterapeuty ściskająca miękką żelową podpiętkę, która zapada się jak budyń',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo in a physiotherapy office: a therapist’s fingers pinching a squishy clear-and-blue gel heel pad, showing how the soft silicone collapses completely flat under pressure while providing zero arch support.',
    },
    {
      label: '4. [HOOK] Kolekcja 5 par spłaszczonych silikonowych podpiętek z apteki',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden surface filling 100% of the frame: five pairs of worn, yellowed, squashed silicone and gel heel pads of various shapes collected from pharmacies.',
    },
    {
      label: '5. [HOOK] Obtarta pięta od przesuwającej się w bucie silikonowej podpiętki',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo at home: a 53-year-old woman holding her bare heel showing a red blister/chafing mark on the back edge of the heel caused by a slipping silicone heel pad.',
    },
    {
      label: '6. [HOOK] Przesunięta i odklejona żelowa podpiętka wewnątrz damskiego półbuta',
      includeProductRef: false,
      scenePrompt:
        'Top-down close-up smartphone photo looking inside a woman’s leather walking shoe: a sticky clear silicone heel pad with a blue dot has slid crookedly to the side inside the heel of the shoe, leaving the midfoot completely flat.',
    },
  ],

  // #55: W pracy najbardziej bałam się momentu, w którym po godzinie przy biurku musiałam wstać przy ludziach i zrobić pierwsze 5 kroków
  'dorosli-20-ostroga-strach-po-postoju': [
    {
      label: '1. [HOOK] Wstawanie od biurka w biurze i opieranie się dłonią o blat przez „ból startowy”',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in a Polish office: a 46-year-old woman standing up from her swivel office chair, gripping the edge of the desk next to her keyboard with one hand while hesitating to put weight on her stiff right heel.',
    },
    {
      label: '3. [HOOK] Pod biurkiem w pracy: stopy wysunięte z butów po godzinie siedzenia',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone snapshot looking down under an office desk: a woman’s feet half-slipped out of her black office flats on the grey office carpet while flexing her stiff ankles before standing up.',
    },
    {
      label: '4. [HOOK] Otwarta szuflada biurka w pracy z maścią i tabletkami przeciwbólowymi',
      includeProductRef: false,
      scenePrompt:
        'Top-down first-person POV smartphone photo of an opened office desk drawer: tucked beside sticky notes and pens are a squeezed white tube of pain gel and a half-empty blister pack of painkiller tablets.',
    },
    {
      label: '5. [HOOK] Komputerowa mapa nacisku stóp (80% ciężaru wbite w sam środek pięty)',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur smartphone photo of a computer monitor in a Polish podiatry clinic showing a digital baropodometric foot pressure scan with bright red hotspot circles concentrated heavily on the heels and inner arches.',
    },
    {
      label: '6. [HOOK] Stanie przy drukarce biurowej z odciążoną, uniesioną lekko prawą piętą',
      includeProductRef: false,
      scenePrompt:
        'Low-angle smartphone photo in an office hallway next to a copy machine: a woman’s legs in dark trousers and flats, shifting all her body weight onto her left leg while keeping her painful right heel slightly lifted off the floor.',
    },
  ],

  // #56: Wyciągnęłam z szafy skórzane botki z zeszłej zimy za 480 zł i nie byłam w stanie zasunąć zamka. Stopa rozlała się po lecie
  'dorosli-21-haluks-zimowe-botki-zamek': [
    {
      label: '1. [HOOK] Zablokowany w połowie kostki zamek skórzanego botka z zeszłej zimy',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in a Polish hallway: a 48-year-old woman sitting on a pouffe trying with both hands to pull up the side zipper of her black leather ankle boot (botek), which is stuck halfway because her broadened forefoot and bunion will not fit.',
    },
    {
      label: '3. [HOOK] Rozlana na szerokość stopa z zaczerwienionym haluksem obok zimowego botka',
      includeProductRef: false,
      scenePrompt:
        'Top-down first-person POV smartphone photo on a hallway floor: a woman’s bare foot placed right next to her narrow black leather winter ankle boot, clearly showing how her forefoot has splayed wider than the boot sole with a red protruding bunion joint.',
    },
    {
      label: '4. [HOOK] Botki za 480 zł z rozpiętymi zamkami i spray do rozciągania skóry od szewca',
      includeProductRef: false,
      scenePrompt:
        'Candid floor-level smartphone photo in a Polish hallway: a pair of black leather women’s ankle boots with open zippers next to a shoe box and a can of leather stretching spray.',
    },
    {
      label: '5. [HOOK] Test „namiotu bez masztu” u podologa: uniesienie łuku zwęża przodostopie',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur smartphone photo in a podiatry clinic: a specialist’s hand pressing up under the longitudinal and transverse arch of a woman’s bare foot, visibly narrowing the splayed forefoot and pulling the big toe joint back into alignment.',
    },
    {
      label: '6. [HOOK] Czerwony, odciśnięty ślad od zamka i ciasnej skóry na boku stopy',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo at home: a woman’s bare foot right after taking off a tight ankle boot, showing a deep red pressure indentation along the bunion and instep.',
    },
  ],

  // #57: Przez 30 lat nosiłam rozmiar 38. Tej jesieni wyszłam ze sklepu z czerwonymi ze wstydu policzkami, bo musiałam poprosić o 40
  'dorosli-22-haluks-wstyd-rozmiar-40': [
    {
      label: '1. [HOOK] Pufa w sklepie obuwniczym otoczona pudełkami z rozmiarami 38, 39 i 40',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo taken while sitting on a bench in a Polish shoe store: a 54-year-old woman’s feet surrounded by opened cardboard shoe boxes on the floor with printed size labels "38", "39", and "40" clearly visible.',
    },
    {
      label: '3. [HOOK] Stopa w za długim bucie rozmiaru 40 z pustym luzem za piętą',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo looking down at a woman’s foot inside a size 40 leather shoe: her forefoot fills the width, but behind her heel there is a visible 1.5 cm empty gap because the shoe is two sizes too long.',
    },
    {
      label: '4. [HOOK] Porównanie podeszwy starego buta 38 i nowego za długiego buta 40',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a hallway floor filling 100% of the frame: two women’s shoes placed sole-to-sole showing the size "38" stamp on one and size "40" on the longer shoe.',
    },
    {
      label: '5. [HOOK] Pomiar stopy na miarce w gabinecie: długość to nadal 38, ale łuk opadł',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone photo in a podiatry office: a woman’s bare foot standing on a foot measuring gauge showing her length is still size 38 while her collapsed arch causes the forefoot to spread wide.',
    },
    {
      label: '6. [HOOK] Dwie pary za dużych, człapiących butów z wklejonymi zapiętkami w przedpokoju',
      includeProductRef: false,
      scenePrompt:
        'Candid top-down smartphone photo in a Polish hallway: two pairs of oversized women’s autumn shoes with thick foam heel grips stuck inside the back of the heels to stop them from slipping off.',
    },
  ],

  // #58: Wydałam 640 zł na silikonowe kliny między palce i szyny na noc. Podolog w 30 sekund pokazał mi, dlaczego haluks nie robi się na palcu
  'dorosli-23-haluks-separatory-i-szyny-mit': [
    {
      label: '1. [HOOK] Cmentarzysko gadżetów za 640 zł: silikonowe kliny między palce i szyny na noc',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden tabletop filling 100% of the frame (NO table edges, NO room background): a pile of ineffective bunion gadgets — white silicone toe spacers, 5-toe gel sleeves, and two plastic hinged night splints with velcro straps ("opaski z patykiem").',
    },
    {
      label: '3. [HOOK] Plastikowa szyna korekcyjna na noc założona na stopę w pościeli',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in bed at night: a 51-year-old woman’s bare foot strapped into a rigid white-and-blue plastic bunion night splint that pulls the big toe sideways, leaving red pressure marks on the skin.',
    },
    {
      label: '4. [HOOK] Silikonowy klin wciśnięty między 1. a 2. palec stopy na podłodze',
      includeProductRef: false,
      scenePrompt:
        'Top-down close-up amateur smartphone photo of a woman’s bare foot standing on laminate flooring with a white gel spacer wedged between the big toe and second toe, while her ankle and arch still collapse inward.',
    },
    {
      label: '5. [HOOK] Podolog pokazujący dłonią na zapadniętą kostkę zamiast na sam paluch',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur smartphone photo in a podiatry clinic: a specialist’s hand pointing at the collapsed inner ankle and longitudinal arch of a woman’s bare foot, demonstrating how pronation pushes the big toe joint outward.',
    },
    {
      label: '6. [HOOK] Otwarta szuflada szafki nocnej pełna żelowych osłonek i klinów na haluksy',
      includeProductRef: false,
      scenePrompt:
        'First-person POV top-down smartphone photo of an open bedside table drawer filled with tangled velcro bunion straps, silicone toe separators, and a tube of comfrey ointment.',
    },
  ],

  // #59: Myślałam, że dzisiaj produkują po prostu tandetne buty, bo trzecia para w tym roku miała starte do zera obcasy od wewnętrznej strony
  'dorosli-24-haluks-zdarte-buty-od-srodka': [
    {
      label: '1. [HOOK] 4 pary moich butów w rzędzie: każda para wykrzywiona i starta od środka',
      includeProductRef: false,
      scenePrompt:
        'Floor-level amateur smartphone photo from behind in a Polish apartment hallway: four pairs of women’s shoes (leather ankle boots, sneakers, work loafers, winter boots) lined up in a row, all leaning inward with the inner edges of their heels ground down at the exact same slant.',
    },
    {
      label: '3. [HOOK] Zbliżenie na obcas skórzanego sztybletu ścięty od wewnątrz jak pilnikiem',
      includeProductRef: false,
      scenePrompt:
        'First-person POV close-up smartphone photo in a hallway: a 44-year-old woman’s hand holding a black leather ankle boot upside down, clearly showing the inner corner of the rubber heel worn down diagonally almost to the sole.',
    },
    {
      label: '4. [HOOK] Wykoślawione, położone do środka zapiętki w codziennych mokasynach',
      includeProductRef: false,
      scenePrompt:
        'Close-up eye-level smartphone photo on a hallway bench: a pair of women’s leather loafers viewed from the back, with the heel counters visibly collapsed and warped toward the inside.',
    },
    {
      label: '5. [HOOK] Bose kostki właścicielki stojące dokładnie nad zdartymi butami',
      includeProductRef: false,
      scenePrompt:
        'Low-angle floor smartphone photo from behind in a hallway: a woman standing barefoot right next to her worn-down shoes, showing her bare heels tilting inward at the exact same 12-degree angle as the shoe heels.',
    },
    {
      label: '6. [HOOK] Paragon od szewca za wymianę fleków (SUMA PLN) i stare starte fleki na stole',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden tabletop filling 100% of the frame (NO floating table edges): two worn-out rubber heel tips removed by a cobbler next to a Polish thermal receipt reading "PARAGON FISKALNY" and "SUMA PLN 120,00".',
    },
  ],

  // #60: Wyszłam spod prysznica i spojrzałam na ciemne kafelki w łazience. Zamiast łuku stopy zobaczyłam dwa płaskie prostokąty
  'dorosli-25-haluks-mokry-slad-w-lazience': [
    {
      label: '1. [HOOK] Dwa płaskie mokre prostokąty („stopa żelazka”) na ciemnych kafelkach po prysznicu',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree top-down amateur smartphone photo pointing straight down at dark grey matte bathroom floor tiles right after a shower (filling 100% of the frame): two wet adult footprints side by side that are completely flat and rectangular like an iron with zero inner arch curve.',
    },
    {
      label: '3. [HOOK] Wilgotne stopy na ręczniku łazienkowym obok mokrego płaskiego śladu na gresie',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo looking down in a Polish bathroom at night: a 47-year-old woman’s wet bare feet stepping onto a white bath mat while two completely flat wet footprints glisten on the dark grey tiles right behind her heels.',
    },
    {
      label: '4. [HOOK] Wieczorne wcieranie żelu z heparyną w spuchnięte, piekące łydki i kostki',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo on the edge of a bed at night: a 47-year-old woman rubbing clear cooling gel into her swollen lower leg and ankle, with a white pharmacy gel tube lying on the bedsheet.',
    },
    {
      label: '5. [HOOK] Żele na ciężkie nogi, magnez na nocne skurcze i podkolanówki uciskowe',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a bathroom counter filling 100% of the frame (NO floating table edges): two white tubes of heparin leg gel, a bottle of magnesium tablets, and rolled-up beige compression stockings.',
    },
    {
      label: '6. [HOOK] Zbliżenie z boku na mokrą stopę na kafelkach — łuk leży płasko na ziemi',
      includeProductRef: false,
      scenePrompt:
        'Low-angle floor-level smartphone photo in a bathroom: side view of the inner arch of a woman’s wet bare foot standing on dark tiles, showing the entire arch collapsed flat against the floor.',
    },
  ],

  // #61: Na moją lewą stopę było już za późno (8200 zł i 2 tytanowe śruby w kości). Ale prawą uratowałam bez skalpela
  'dorosli-26-zal-lewa-stopa-sruby-8200zl': [
    {
      label: '1. [HOOK] Obie stopy z góry: 7-cm blizna pooperacyjna na lewej stopie vs uratowana prawa',
      includeProductRef: false,
      scenePrompt:
        'First-person POV top-down amateur smartphone photo of a 58-year-old woman’s two bare feet resting side by side on a beige rug: the left foot has a distinct 7-cm healed surgical scar along the side of the big toe joint, while the right foot has no scar.',
    },
    {
      label: '3. [HOOK] Czarny but pooperacyjny Baruka i dwie kule łokciowe w kącie pokoju',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a Polish apartment bedroom: a bulky black post-op offloading wedge shoe (but ortopedyczny Baruka) on the floor next to a pair of grey aluminum forearm crutches leaning against the wall.',
    },
    {
      label: '4. [HOOK] Rachunek z kliniki na 8200 zł (SUMA PLN) i RTG stopy z 2 śrubami',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden tabletop filling 100% of the frame (NO floating table edges): an X-ray printout of a foot showing two titanium screws in the first metatarsal bone next to a Polish clinic receipt reading "PARAGON FISKALNY" and "SUMA PLN 8200,00".',
    },
    {
      label: '5. [HOOK] Lewa stopa po operacji ułożona na dwóch poduszkach z zimnym kompresem',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo on a couch: a woman’s post-surgical left foot elevated on two pillows with a blue cold gel pack wrapped around the swollen forefoot.',
    },
    {
      label: '6. [HOOK] Test podniesienia łuku na prawej stopie u fizjoterapeuty, który uchronił ją przed skalpelem',
      includeProductRef: false,
      scenePrompt:
        'Close-up floor-level smartphone photo in a rehabilitation room: a physiotherapist supporting the arch of a woman’s unoperated right foot with his hands to stop the ankle from rolling inward.',
    },
  ],

  // #62: Moja siostra zapłaciła 8100 zł za operację haluksa i cierpiała 6 tygodni. Po 2 latach kość wyszła z powrotem
  'dorosli-27-zal-haluks-siostry-wrocil': [
    {
      label: '1. [HOOK] Przedpokój: stopa siostry 2 lata po operacji za 8100 zł, na której haluks odrósł',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in a Polish apartment hallway: a 56-year-old woman sitting on a hallway bench right after taking off her shoes, pointing at her right bare foot where a faded surgical scar is visible on the side, yet the big toe and reddened bunion bone have pushed outward again.',
    },
    {
      label: '3. [HOOK] Bose stopy obu sióstr obok siebie: zapadnięte do środka kostki i łuki',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone photo on a living room rug: two middle-aged sisters standing barefoot side by side, both showing flattened longitudinal arches and ankles rolling inward.',
    },
    {
      label: '4. [HOOK] Wypis ze szpitala sprzed 2 lat i rachunek na 8100 zł (SUMA PLN) na stole',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden tabletop filling 100% of the frame (NO floating table edges): a Polish hospital discharge summary folder ("KARTA INFORMACYJNA LECZENIA SZPITALNEGO") next to a receipt reading "SUMA PLN 8100,00" and a cup of tea.',
    },
    {
      label: '5. [HOOK] Półbuty siostry z ponownie wypchniętą skórą w miejscu nawrotu haluksa',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur smartphone photo on a hallway floor: a pair of women’s soft leather shoes with a pronounced bulge stretched out on the inner forefoot where the recurrent bunion presses against the leather.',
    },
    {
      label: '6. [HOOK] Podolog pokazujący na podoskopie, że chirurg wyciął skutek, a zostawił koślawą piętę',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo from behind in a podiatry office: a woman standing barefoot on a podoscope showing her heel tilting inward at 12 degrees, which caused the bunion to return after surgery.',
    },
  ],

  // #63: Moja mama przestała chodzić w wieku 56 lat. Ja mam 52 lata, a w sobotę mąż musiał wiercić mi uchwyt pod prysznicem
  'dorosli-28-zal-uchwyt-pod-prysznicem-52-lata': [
    {
      label: '1. [HOOK] Mąż wiercący wiertarką w kafelkach biały uchwyt dla niepełnosprawnych pod prysznicem',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a small Polish apartment bathroom: a 55-year-old husband in a flannel shirt holding an electric drill against beige ceramic shower wall tiles to mount a white metal handicap grab bar.',
    },
    {
      label: '3. [HOOK] Zamontowany biały uchwyt i plastikowy stołek dla niepełnosprawnych w brodziku',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo looking into a Polish shower stall: a newly mounted white handicap grab bar on the tiled wall and a white plastic medical shower stool standing inside the shower tray.',
    },
    {
      label: '4. [HOOK] Skrzynka z wiertarką, kołki rozporowe i pył z wiercenia na kafelkach w łazience',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone photo on bathroom floor tiles: a red toolbox, an electric drill, wall plugs, and tile dust on the floor right outside the shower stall.',
    },
    {
      label: '5. [HOOK] Obrzęknięte, wykrzywione do środka kostki 52-letniej kobiety na kafelkach łazienki',
      includeProductRef: false,
      scenePrompt:
        'Low-angle floor-level smartphone photo from behind in a bathroom: a 52-year-old woman standing barefoot on ceramic tiles next to the shower, showing both ankles collapsing inward at a sharp angle.',
    },
    {
      label: '6. [HOOK] Powolne wchodzenie po schodach z trzymaniem się poręczy obiema rękami',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo on a Polish apartment building staircase: a 52-year-old woman holding onto the metal banister with both hands to pull herself up the steps.',
    },
  ],

  // #64: „Jeśli nie zatrzymamy zapadania stopy dzisiaj, za 5 lat spotkamy się na wymianie stawu kolanowego"
  'dorosli-29-zal-za-5-lat-endoproteza': [
    {
      label: '1. [HOOK] Lekarz wskazujący długopisem zwężoną szparę stawową na RTG kolana w gabinecie',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a Polish orthopedic office: a doctor’s hand pointing with a pen at a backlit X-ray of a knee joint on a wall viewer, showing a severely narrowed medial joint space on the inner side of the knee.',
    },
    {
      label: '3. [HOOK] Bose stopy pacjentki w gabinecie przed podświetlonym zdjęciem RTG kolan',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo in an orthopedic examination room: a 55-year-old woman standing barefoot on the clinic floor looking down at her collapsed arches, with a glowing knee X-ray viewer visible on the wall.',
    },
    {
      label: '4. [HOOK] Tabletki przeciwbólowe brane przez 3 lata przed pracą i wydruk RTG na stole',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden tabletop filling 100% of the frame (NO floating table edges): three half-empty blister packs of painkillers, stomach protection pills, a tub of collagen powder, and a Polish knee X-ray report.',
    },
    {
      label: '5. [HOOK] Odwrócony but pacjentki na biurku lekarza ze startym od wewnątrz obcasem',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo in a doctor’s office: a woman’s everyday leather walking shoe placed upside down next to a plastic anatomical knee joint model, showing the inner heel edge ground down at a slant.',
    },
    {
      label: '6. [HOOK] 10-sekundowy test podniesienia łuku stopy odciążający przyśrodkową część kolana',
      includeProductRef: false,
      scenePrompt:
        'Close-up floor-level smartphone photo in a clinic: a doctor’s hands lifting the inner arch of a 55-year-old woman’s bare foot, immediately straightening the varus/valgus torque on her knee.',
    },
  ],

  // #65: Przeszłam artroskopię kolana i 3 miesiące rehabilitacji. Pół roku później drugie kolano zaczęło boleć dokładnie w tym samym miejscu
  'dorosli-30-zal-artroskopia-kolana-powrot-bolu': [
    {
      label: '1. [HOOK] Oba kolana z góry: blizny po artroskopii na prawym i dłoń na bolącym lewym kolanie',
      includeProductRef: false,
      scenePrompt:
        'First-person POV top-down amateur smartphone photo of a 56-year-old woman sitting on a sofa with shorts/rolled trousers: her right knee has two small healed arthroscopy portal scars, while she presses her hand against the aching inner side of her left knee.',
    },
    {
      label: '3. [HOOK] Sztywna orteza kolanowa z zegarem i wypis po artroskopii łąkotki na kanapie',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a Polish living room: a black hinged post-arthroscopy knee brace (orteza zegarowa) lying on a sofa next to a Polish hospital discharge sheet ("ARTROSKOPIA STAWU KOLANOWEGO").',
    },
    {
      label: '4. [HOOK] Zatrzymanie się w połowie schodów przez nagły trzask w drugim, lewym kolanie',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone snapshot looking down on a staircase: a woman stopping mid-descent on the steps, holding her left knee with her hand while gripping the railing.',
    },
    {
      label: '5. [HOOK] Obie bose stopy od tyłu: brak „zbieżności” i uciekanie obu pięt do środka',
      includeProductRef: false,
      scenePrompt:
        'Floor-level amateur smartphone photo from behind in a physiotherapy room: a 56-year-old woman standing barefoot showing both heels and ankles collapsing inward symmetrically, overloading both knees.',
    },
    {
      label: '6. [HOOK] Prawy i lewy but odwrócone podeszwami: identycznie zdarte obcasy od wewnątrz',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a hallway floor filling 100% of the frame: a pair of women’s walking shoes turned upside down showing both left and right heels worn down on the inside edge.',
    },
  ],

  // #66: Po 8 godzinach na nogach w pracy wracam do domu i nie jestem w stanie ustać 20 minut przy kuchence bez opierania się o blat
  'dorosli-31-praca-8h-na-nogach-kuchnia': [
    {
      label: '1. [HOOK] Stanie przy kuchence po 8h pracy i opieranie się łokciami oraz biodrem o blat',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a Polish kitchen in the late afternoon: a 48-year-old woman standing by a stove with a pot of soup, leaning her hip and forearms heavily against the kitchen counter while lifting one aching bare foot off the tiled floor.',
    },
    {
      label: '3. [HOOK] Bose, piekące stopy na kafelkach kuchennych przestępujące z nogi na nogę przy gotowaniu',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo looking straight down at kitchen floor tiles in front of a stove: a woman’s tired, reddened bare feet shifting weight from one foot to the other while cooking dinner after an 8-hour shift.',
    },
    {
      label: '4. [HOOK] Zrzucone w przedpokoju o 17:00 buty z pracy i nogi ułożone wysoko na oparciu kanapy',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in a Polish living room after work: a woman lying on the sofa with both bare, swollen feet propped high up on the sofa cushions to relieve the burning pain.',
    },
    {
      label: '5. [HOOK] Trzy pary „wygodnych” butów do pracy stojącej ze spłaszczonymi wkładkami z drogerii',
      includeProductRef: false,
      scenePrompt:
        'Candid floor-level smartphone photo in a hallway: three pairs of women’s flat work shoes lined up on a mat with squashed, paper-thin foam drugstore insoles pulled halfway out of them.',
    },
    {
      label: '6. [HOOK] Wieczorne smarowanie piekących pięt i śródstopia żelem chłodzącym w kuchni',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur phone snapshot at a kitchen chair: a 48-year-old woman rubbing cooling gel into the reddened ball and heel of her foot after standing 8 hours on hard floor tiles.',
    },
  ],

  // #67: Wydałam 420 zł na twarde wkładki na zamówienie. Po 3 dniach wyjęłam je w pracy w toalecie ze łzami w oczach
  'dorosli-32-praca-mit-twardych-wkladek-400zl': [
    {
      label: '1. [HOOK] Kabina toalety w pracy: wyjęte z butów twarde jak deska wkładki za 420 zł',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo inside a workplace restroom stall: a 50-year-old woman sitting with her leather work shoes taken off on the tiled floor, holding two rigid, thick grey thermoplastic custom orthotic insoles that she just pulled out of her shoes in pain.',
    },
    {
      label: '3. [HOOK] Czerwony, krwawy odcisk na łuku stopy od twardej plastikowej wkładki na wymiar',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo: the bottom arch of a woman’s bare foot showing a raw red pressure blister and indentation right where the hard plastic edge of a 420 PLN custom insole dug into her skin.',
    },
    {
      label: '4. [HOOK] Fizjoterapeuta stukający sztywną plastikową wkładką o kant biurka („Mit Gipsu”)',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a physiotherapy office: a therapist holding a rigid custom plastic insole and tapping its hard, unbending shell against the edge of his wooden desk.',
    },
    {
      label: '5. [HOOK] Gruba, sztywna wkładka za 420 zł, która wysadza piętę i nie mieści się do półbuta',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur smartphone photo on a hallway bench: a thick, bulky rigid orthotic insole shoved halfway into a woman’s autumn leather shoe, taking up so much vertical space that the foot cannot fit inside.',
    },
    {
      label: '6. [HOOK] Polski paragon na 600 zł (420 zł wkładki + 180 zł badanie, SUMA PLN) obok twardych desek',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden tabletop filling 100% of the frame (NO floating table edges): two rigid plastic custom insoles lying next to a Polish thermal receipt reading "PARAGON FISKALNY" and "SUMA PLN 600,00".',
    },
  ],

  // #68: Robię 12 000 kroków dziennie na 12-godzinnych zmianach na twardych płytkach. Buty za 650 zł nie pomogły, bo problem był w środku
  'dorosli-33-praca-12h-dyzur-szpitalny-beton': [
    {
      label: '1. [HOOK] Dyżurka po 12h zmiany: zegarek pokazujący 12 480 kroków i zdjęte buty za 650 zł',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in a hospital staff breakroom after a 12-hour shift: a 51-year-old nurse in medical scrubs holding her wrist showing a smartwatch step counter reading "12480 kroków", with her expensive thick-soled running shoes kicked off on the floor below.',
    },
    {
      label: '3. [HOOK] Wyjęta z buta za 650 zł fabryczna wkładka cienka i płaska jak tekturka',
      includeProductRef: false,
      scenePrompt:
        'First-person POV close-up smartphone photo in a staff locker room: a woman’s hand holding up a flimsy, paper-thin flat factory foam liner pulled out of an expensive 650 PLN running shoe, showing zero arch or heel cup support.',
    },
    {
      label: '4. [HOOK] Miękka podeszwa buta za 650 zł zapadająca się do środka na szpitalnym betonie',
      includeProductRef: false,
      scenePrompt:
        'Low-angle floor-level smartphone photo from behind in a hospital corridor with terrazzo tiles: a woman standing in thick-foam running shoes where the overly soft foam heel compresses unevenly inward, letting her ankles roll into pronation.',
    },
    {
      label: '5. [HOOK] Szafka pracownicza pielęgniarki z butami zmiennymi, żelami chłodzącymi i tabletkami',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo of an open metal staff locker in a Polish hospital: a pair of work sneakers on the bottom shelf next to two tubes of cooling leg gel and painkiller blisters.',
    },
    {
      label: '6. [HOOK] Obrzęknięte kostki ze śladami od skarpetek po 12 godzinach stania na płytkach',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo on a bench after a 12-hour shift: a 51-year-old woman’s bare ankles showing deep red sock elastic indentations and swelling.',
    },
  ],

  // #69: Dlaczego 9 na 10 wkładek z apteki ląduje w koszu po tygodniu? Fizjoterapeuta narysował mi 4 kroki, które muszą zadziałać naraz
  'dorosli-34-praca-mechanizm-4-kroki': [
    {
      label: '1. [HOOK] Pudełko po butach pełne 6 par nieudanych wkładek z apteki i drogerii',
      includeProductRef: false,
      scenePrompt:
        'Top-down first-person POV amateur smartphone photo in a Polish hallway: an open cardboard shoebox filled with 6 pairs of failed, crumpled insoles from pharmacies and drugstores (thin leather liners, squashed blue gel pads, flat felt inserts, hard cork heel lifts).',
    },
    {
      label: '3. [HOOK] Kartka na biurku fizjoterapeuty z narysowanymi długopisem 4 krokami podparcia stopy',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden desk surface filling 100% of the frame (NO floating table edges): a white notepad sheet where a physiotherapist drew a ballpoint pen diagram of a foot arch with 4 numbered arrows ("1. Pięta", "2. Łuk", "3. Śródstopie", "4. Amortyzacja").',
    },
    {
      label: '4. [HOOK] Żelowa wkładka z apteki zgnieciona jak naleśnik po zaledwie tygodniu chodzenia',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo: a woman’s hand holding a flimsy pharmacy gel insole that is completely squashed, torn, and flattened at the heel after one week of use.',
    },
    {
      label: '5. [HOOK] Kosz na śmieci z wyrzuconymi starymi, rozklejonymi wkładkami z drogerii',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone snapshot looking into a small household wastebasket containing two pairs of discarded, curled-up cheap drugstore shoe insoles.',
    },
    {
      label: '6. [HOOK] Porównanie na płasko: wiotka wkładka z apteki vs profilowane korytko 3D',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden table filling 100% of the frame (NO floating table): a paper-thin flat pharmacy liner lying next to a 4-zone biomechanical foot diagram.',
    },
  ],

  // #70: Przez 3 lata popełniałam ten sam błąd: ratowałam stopy tylko przez 2 godziny na spacerze, a przez 12 godzin niszczyłam je w pracy i w domu
  'dorosli-35-powrot-dorosli-14h-w-domu-i-pracy': [
    {
      label: '1. [HOOK] Kartka od fizjoterapeuty z wyliczeniem doby: 1,5h spaceru vs 12,5h w pracy i na panelach',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden desk surface filling 100% of the frame (NO floating table edges): a white paper sheet with a handwritten ballpoint pen breakdown in Polish: "Spacer: 1,5 godz. / Praca + Dom (panele): 12,5 godz. = 8000 kroków".',
    },
    {
      label: '3. [HOOK] Przedpokój: buty na spacer z psem vs płaskie półbuty do biura i cienkie kapcie po domu',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone photo in a Polish hallway: one pair of outdoor walking sneakers next to a dog leash, contrasted with a pair of flat black office shoes and thin flat house slippers that have zero arch support inside.',
    },
    {
      label: '4. [HOOK] Chodzenie przez 4 godziny wieczorem w samych skarpetkach po twardych panelach i kafelkach',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo looking down in a Polish apartment: a 52-year-old woman’s feet in cotton socks standing on hard wooden laminate floor panels at the threshold of kitchen ceramic tiles, with both ankles rolling inward.',
    },
    {
      label: '5. [HOOK] 8 godzin w biurze w płaskich półbutach bez żadnego podparcia pod łukiem',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo under an office desk: a woman’s feet in flat leather office loafers on hard office flooring, rubbing one aching ankle against the other.',
    },
    {
      label: '6. [HOOK] Test podniesienia łuku w gabinecie pokazujący, co dzieje się przez 85% dnia bez wkładek',
      includeProductRef: false,
      scenePrompt:
        'Close-up floor-level smartphone photo in a physiotherapy clinic: a therapist lifting the collapsed arch of a 52-year-old woman’s bare foot on the floor.',
    },
  ],
};
