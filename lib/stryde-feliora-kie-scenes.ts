export interface KieSceneSpec {
  label: string;
  scenePrompt: string;
  includeProductRef: boolean;
}

/**
 * 4 unikalne sceny z HOOKA (50% z 8 zdjęć) dla każdego z 15 kątów Stryde PL (Opaska Podrzepkowa).
 */
export const STRYDE_HOOK_SCENES_BY_ANGLE: Record<string, [KieSceneSpec, KieSceneSpec, KieSceneSpec, KieSceneSpec]> = {
  'stryde-01-czy-pani-tata-dobrze-sie-czuje': [
    {
      label: '1. [HOOK] Przewrócona donica z drzewkiem laurowym na kostce brukowej parkingu',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone snapshot on a paved garden center parking lot in Poland: an overturned terracotta pot with a laurel tree (drzewko laurowe) lying on its side in spilled dark potting soil next to the open trunk of a car and a white delivery van in the background.',
    },
    {
      label: '2. [HOOK] Siedzenie w aucie na parkingu z wyłączonym silnikiem w ciszy',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo from the driver seat of a parked car in a garden center parking lot: a 64-year-old man’s weathered hands resting on his aching right knee in work trousers, looking through the windshield at an overturned plant pot on the pavement.',
    },
    {
      label: '3. [HOOK] Otwarta szuflada w przedpokoju z 11 bezużytecznymi opaskami i ortezami',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone snapshot of an open wooden hallway drawer in a Polish home overflowing with 11 tangled elastic pharmacy knee sleeves, bulky neoprene braces, and squeezed pain gel tubes.',
    },
    {
      label: '4. [HOOK] Nakolanniki brukarskie wiszące na gwoździu w garażu nad wędkami',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo inside a dim Polish garage: a pair of dusty, worn rubber paver knee pads (nakolanniki brukarskie) hanging untouched on a rusty nail in the wall just above fishing rods.',
    },
  ],

  'stryde-02-131-nocy-w-fotelu-w-salonie': [
    {
      label: '1. [HOOK] Budzik 2:40 w nocy w ciemnej sypialni (nasłuchiwanie trzeciego stopnia)',
      includeProductRef: false,
      scenePrompt:
        'Raw night-time smartphone snapshot in a dark Polish bedroom: a bedside digital alarm clock glowing red with the exact time "2:40" next to a half-empty glass of water, looking toward the dark open bedroom doorway.',
    },
    {
      label: '2. [HOOK] Niebieska taśma malarska przyklejona na krawędzi czwartego stopnia schodów',
      includeProductRef: false,
      scenePrompt:
        'First-person POV close-up amateur smartphone photo looking down at steep old wooden stairs in a Polish house: a strip of blue painter’s masking tape stuck along the edge of the fourth wooden step.',
    },
    {
      label: '3. [HOOK] Fotel w salonie z poduszką z sypialni i kocem po 131 nocach',
      includeProductRef: false,
      scenePrompt:
        'Unstaged morning smartphone photo in a Polish living room: a worn armchair facing the hallway stairs with a white bedroom pillow and a folded plaid blanket left on the seat.',
    },
    {
      label: '4. [HOOK] Maszynka do golenia i pędzel przeniesione na parapet przy zlewie w kuchni',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo in a Polish kitchen: a 72-year-old man’s razor, shaving brush, and small mirror standing on the tiled windowsill right above the kitchen sink.',
    },
  ],

  'stryde-03-zona-zadzwonila-po-78-letniego-brata-do-drabiny': [
    {
      label: '1. [HOOK] Widok przez okno kuchenne na 78-letniego brata na mojej aluminiowej drabinie',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo taken through a Polish kitchen window with lace curtains: an elderly 78-year-old man in a jacket climbing an aluminum ladder leaned against the house gutter outside.',
    },
    {
      label: '2. [HOOK] Zatkana jesiennymi liśćmi rynna nad gankiem i aluminiowa drabina',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone snapshot in a Polish backyard: an aluminum extension ladder leaning against the roof eaves where wet brown leaves are overflowing from a clogged gutter.',
    },
    {
      label: '3. [HOOK] Dłonie 72-latka zaciśnięte na kubku herbaty przy kuchennym stole',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo looking down at a Polish kitchen table: a 72-year-old man’s weathered hands gripping a warm mug of tea next to his painful knee.',
    },
    {
      label: '4. [HOOK] Stopa stojąca u podnóża drabiny bez możliwości wejścia na trzeci szczebel',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone snapshot looking down at the bottom rungs of an aluminum ladder on a concrete driveway: a senior man’s work shoe resting on the first rung while his hand holds his knee.',
    },
  ],

  'stryde-04-4-letni-wnuk-pokazal-przy-obiedzie-jak-chodze': [
    {
      label: '1. [HOOK] Wielkanocny obiad rodzinny i nagła cisza przy stole nad talerzami',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo at a Polish family dinner table covered with a white tablecloth: plates of soup, salad bowls, and family members looking down in awkward silence.',
    },
    {
      label: '2. [HOOK] 4-letni wnuczek na dywanie trzymający się za kolanko („kulawe kolanko babci”)',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone snapshot in a Polish living room: a 4-year-old boy standing on a patterned carpet holding his right knee with a small hand while imitating a limp.',
    },
    {
      label: '3. [HOOK] Klocki rozrzucone na dywanie, do których babcia nie mogła ukucnąć',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo looking down from a standing position at colorful plastic toy blocks scattered across a living room rug next to an armchair.',
    },
    {
      label: '4. [HOOK] Drewniany płot na działce, przy którym sąsiadka Hela pokazała swoje kolano',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo in a Polish garden plot (działka): two older women standing by a wooden garden fence next to a watering can, one rolling up her trousers to point below her kneecap.',
    },
  ],

  'stryde-05-wnuki-przestaly-przychodzic-w-piatki-druga-babcia': [
    {
      label: '1. [HOOK] Puste talerze i zimne naleśniki w piątkowe popołudnie w kuchni babci',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo in a quiet Polish kitchen on Friday afternoon: a plate of untouched rolled pancakes (naleśniki) on a tablecloth next to two empty chairs.',
    },
    {
      label: '2. [HOOK] Pudełko po butach pełne 9 rozciągniętych opasek z apteki',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone snapshot of an open cardboard shoebox on a hallway floor filled with 9 stretched-out beige and black elastic knee sleeves and empty ointment tubes.',
    },
    {
      label: '3. [HOOK] Krzesełka na szkolnym Dniu Babci i Dziadka na sali gimnastycznej',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo inside a Polish primary school gym decorated for Grandparents Day: a row of chairs along the wall where a 64-year-old grandmother rolls up her trouser leg slightly.',
    },
    {
      label: '4. [HOOK] Parkowa alejka i ławka, na której babcia musiała siedzieć z torebkami',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo from a wooden park bench in Poland: a grandmother’s hands holding two handbags on her lap while looking toward a distant playground.',
    },
  ],

  'stryde-06-corka-zarezerwowala-wozek-elektryczny-na-moje-nazwisko': [
    {
      label: '1. [HOOK] Wózek elektryczny przed pensjonatem w Kołobrzegu z kartką z nazwiskiem',
      includeProductRef: false,
      scenePrompt:
        'Raw amateur smartphone photo at the entrance of a Polish seaside guesthouse in Kołobrzeg: a rented mobility scooter parked by the reception with a laminated white name tag hanging on the handlebar.',
    },
    {
      label: '2. [HOOK] Wydruk rezerwacji wózka inwalidzkiego leżący na walizce w pokoju',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo in a holiday room: a printed Polish mobility rental confirmation sheet lying next to an unpacked suitcase.',
    },
    {
      label: '3. [HOOK] Kije nordic walking swatowej Karoliny oparte o ławkę nad morzem',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone snapshot on a seaside promenade in Kołobrzeg: two nordic walking poles leaning against a wooden bench overlooking the Baltic Sea.',
    },
    {
      label: '4. [HOOK] Ekran telefonu na molo w Kołobrzegu pokazujący 11 400 kroków',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo on the wooden pier in Kołobrzeg: a hand holding a phone screen displaying a Polish pedometer app with "11 420 kroków" against wooden pier planks.',
    },
  ],

  'stryde-07-mozesz-przyjsc-do-damskiej-toalety-niska-toaleta': [
    {
      label: '1. [HOOK] Ekran telefonu z SMS-em z kabiny: „Możesz przyjść do damskiej toalety? Nikomu nie mów”',
      includeProductRef: false,
      scenePrompt:
        'Close-up amateur smartphone photo of a phone screen on an office desk showing a Polish text message: "Możesz przyjść do damskiej toalety na parterze? Proszę. Nikomu nie mów."',
    },
    {
      label: '2. [HOOK] Ciasna kabina toalety w biurze z niską muszlą i śliskimi kafelkami bez uchwytów',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone snapshot inside a narrow Polish office restroom stall: a very low ceramic toilet bowl and smooth beige wall tiles with nothing to grab onto except a metal toilet paper holder.',
    },
    {
      label: '3. [HOOK] Dłoń kurczowo trzymająca się krawędzi drzwi kabiny przy próbie wstania',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo inside a restroom stall: a 61-year-old woman’s hand gripping the metal stall door latch tightly while trying to stand up with an aching knee.',
    },
    {
      label: '4. [HOOK] Biurko w pracy z wypisanym podaniem o wcześniejsze odejście',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone snapshot of an office desk with a keyboard, reading glasses, and a folded Polish letter next to a mug of tea.',
    },
  ],

  'stryde-08-corka-wysyla-linki-z-otodom-do-mieszkan-na-parterze': [
    {
      label: '1. [HOOK] Smartfon na kuchennym stole z linkami z Otodom do mieszkań na parterze',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo on a wooden kitchen table: a smartphone screen showing Polish family messages with apartment listings titled "Mieszkanie 2-pokojowe PARTER bez schodów".',
    },
    {
      label: '2. [HOOK] Wypolerowana dłońmi dębowa poręcz przy stromych schodach w 41-letnim domu',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo looking up a wooden staircase in a 40-year-old Polish home: a 71-year-old widow’s hand gripping a smooth oak handrail made by her late husband.',
    },
    {
      label: '3. [HOOK] Teczka agenta nieruchomości z wyceną domu leżąca na stole w salonie',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone photo on a lace-covered living room table: a printed Polish real estate valuation folder ("WYCENA NIERUCHOMOŚCI") lying untouched next to a teacup.',
    },
    {
      label: '4. [HOOK] Dwie ciężkie siatki z zakupami zostawione u dołu schodów w przedpokoju',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo at the bottom of wooden hallway stairs: two full grocery bags resting on the floor because carrying them upstairs hurts the knees.',
    },
  ],

  'stryde-09-w-wieku-67-lat-maz-zostawil-mnie-dla-72-latki-z-dancingow': [
    {
      label: '1. [HOOK] Srebrne buty do tańca schowane w pudełku na dnie szafy od dwóch lat',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo looking into the bottom of a dark wardrobe: an open shoebox holding a pair of silver low-heeled women’s dancing shoes.',
    },
    {
      label: '2. [HOOK] Pusty wieszak w przedpokoju w czwartkowy wieczór po wyjściu męża',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone snapshot in a quiet Polish apartment hallway at night: an empty coat hook by the front door and a single pair of women’s slippers on the floor.',
    },
    {
      label: '3. [HOOK] Lustro nad umywalką w klubie seniora, gdzie 72-latka poprawiała pasek pod rzepką',
      includeProductRef: false,
      scenePrompt:
        'Candid amateur smartphone photo in a community dance hall restroom with a sink and mirror: a 70-year-old woman in an elegant dress adjusting a narrow black strap below her kneecap.',
    },
    {
      label: '4. [HOOK] Drewniany parkiet sali tanecznej widziany z krzesełka pod ścianą',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone photo taken from a chair by the wall of a Polish senior dance club: warm lights reflecting off the wooden dance floor.',
    },
  ],

  'stryde-10-biora-za-to-tysiace-w-klinikach-skalpel-vs-mlot': [
    {
      label: '1. [HOOK] Wielka orteza zegarowa za 650 zł rzucona na stół obok rachunków na 6 000 zł',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden table filling 100% of the frame (NO floating table): a bulky metal-hinged knee brace lying next to a stack of Polish private clinic invoices totaling "6 120 zł".',
    },
    {
      label: '2. [HOOK] Czerwone pręgi i odgniecenia na skórze nogi po ciężkiej ortezie z szynami',
      includeProductRef: false,
      scenePrompt:
        'First-person POV close-up smartphone photo of a 61-year-old woman’s bare knee and thigh showing red pressure indentations left by a tight bulky knee brace.',
    },
    {
      label: '3. [HOOK] Szuflada pełna maści, opasek uciskowych i wypisów z prywatnych gabinetów',
      includeProductRef: false,
      scenePrompt:
        'Top-down amateur smartphone photo of an open drawer filled with squeezed pain gel tubes, rolled-up elastic bandages, and clinic receipts.',
    },
    {
      label: '4. [HOOK] Wskazanie palcem punktu dwa palce pod rzepką (ścięgno rzepki)',
      includeProductRef: false,
      scenePrompt:
        'First-person POV close-up smartphone photo in a Polish living room: two fingers pressing into the exact hollow spot just below the kneecap.',
    },
  ],

  'stryde-11-kolega-mial-orteze-za-1600-zl-ja-mialem-waski-pasek': [
    {
      label: '1. [HOOK] Zakurzona sztywna orteza zegarowa za 1 600 zł leżąca na górnej półce w szafie',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo looking up at a closet shelf in a Polish hallway: a large, stiff black hinged orthopedic knee brace gathering dust in the corner.',
    },
    {
      label: '2. [HOOK] Stolik w klubie seniora z dwiema szklankami herbaty w koszyczkach',
      includeProductRef: false,
      scenePrompt:
        'First-person POV smartphone snapshot at a wooden table in a Polish neighborhood club: two glasses of tea and two older men sitting across from each other.',
    },
    {
      label: '3. [HOOK] Porównanie na stole (90° flat-lay): wielkie rusztowanie za 1 600 zł vs wąski pasek',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden table filling 100% of the frame (NO floating table): a huge metal-hinged knee brace next to a slim matte-black patellar strap.',
    },
    {
      label: '4. [HOOK] Wstawanie z niskiego fotela bez odpychania się rękami od podłokietników',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo in a Polish living room: a 71-year-old man standing up straight from a deep armchair without using his hands to push off the armrests.',
    },
  ],

  'stryde-12-to-nie-chrzastka-dziala-nawet-przy-osc-o-kosc': [
    {
      label: '1. [HOOK] Zdjęcie RTG kolana trzymane w dłoni pod światło okna („kość o kość”)',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo holding a black-and-white knee X-ray film against a bright apartment window, showing a narrowed joint space ("kość o kość").',
    },
    {
      label: '2. [HOOK] Split-screen w stylu Noom: ból na schodach + zbliżenie na RTG kolana',
      includeProductRef: false,
      scenePrompt:
        'Side-by-side split comparison image: on the left a 64-year-old person sitting on wooden stairs holding their aching knee; on the right a close-up of a knee X-ray with yellow arrows pointing to the joint space.',
    },
    {
      label: '3. [HOOK] Dłoń wskazująca ścięgno pod rzepką, które przejmuje 34% obciążenia',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo of a senior’s knee with a finger pointing to the patellar tendon two fingers below the kneecap.',
    },
    {
      label: '4. [HOOK] Puste opakowania po kolagenie do picia i glukozaminie na blacie kuchennym',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo on a kitchen countertop filling 100% of the frame: 3 empty plastic tubs of joint collagen powder and glucosamine blisters that failed to regrow cartilage.',
    },
  ],

  'stryde-13-opaska-ktora-zjezdza-nie-pomaga-wcale-sports-health': [
    {
      label: '1. [HOOK] Zwykły ściągacz z apteki zwinięty w rulon na łydce pod podwiniętą nogawką',
      includeProductRef: false,
      scenePrompt:
        'First-person POV amateur smartphone photo looking down at a leg in rolled-up trousers: a cheap beige elastic pharmacy knee sleeve has slid down and bunched up around the calf.',
    },
    {
      label: '2. [HOOK] Wydruk badania „Sports Health (-34% napięcia)” na drewnianym biurku (90° flat-lay)',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden desk filling 100% of the frame (NO floating table): a printed biomechanics study page with yellow highlighter on "-34% NAPIĘCIA ŚCIĘGNA RZEPKI" next to reading glasses.',
    },
    {
      label: '3. [HOOK] Porównanie na płasko (90°): rozciągnięty rękaw z apteki vs rdzeń silikonowy 8 mm',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo on a wooden tabletop filling 100% of the frame: a saggy stretched fabric knee sleeve next to a firm 8mm silicone-core patellar strap with metal buckles.',
    },
    {
      label: '4. [HOOK] Zbliżenie na wewnętrzny wałek silikonowy 8 mm z poduszką powietrzną',
      includeProductRef: false,
      scenePrompt:
        'Macro close-up amateur smartphone photo held in hand: the inner side of a matte-black patellar knee strap showing its thick 8mm contoured silicone tube core.',
    },
  ],

  'stryde-14-przetrwac-kolejke-do-operacji-zanim-wydasz-800zl': [
    {
      label: '1. [HOOK] Skierowanie na NFZ z terminem za 18 miesięcy leżące na stole (90° flat-lay)',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden kitchen table filling 100% of the frame (NO floating table): a Polish hospital referral sheet ("SKIEROWANIE DO SZPITALA - ODDZIAŁ ORTOPEDII") with a handwritten note "Termin: 18 miesięcy".',
    },
    {
      label: '2. [HOOK] Screen wiadomości WhatsApp ze zdjęciem kolana i tekstem o kolejce NFZ',
      includeProductRef: false,
      scenePrompt:
        'Close-up smartphone photo of a phone screen on a wooden table showing a Polish WhatsApp chat with a knee X-ray photo and message: "Termin na NFZ za półtora roku, a blokada prywatnie 800 zł. Szukam wszystkiego, żeby normalnie chodzić po schodach."',
    },
    {
      label: '3. [HOOK] Kalendarz na ścianie w kuchni z zakreślonymi miesiącami czekania',
      includeProductRef: false,
      scenePrompt:
        'Amateur smartphone photo of a paper wall calendar hanging in a Polish kitchen with red pen crosses marking the months of waiting for knee surgery.',
    },
    {
      label: '4. [HOOK] Rachunek na 800 zł za zastrzyk dostawowy obok pustych blistrów na stole (90°)',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo on a wooden table filling 100% of the frame: a Polish clinic receipt with "SUMA PLN 800,00" next to an empty injection box and popped painkiller blisters.',
    },
  ],

  'stryde-15-sprzedawana-przez-nas-nie-przez-nich-oryginal-vs-podrobki': [
    {
      label: '1. [HOOK] Przecięta nożyczkami pusta podróbka z cienkiej gąbki vs oryginał z rdzeniem 8 mm (90°)',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden table filling 100% of the frame (NO floating table): a cheap thin foam knockoff strap cut in half with scissors showing empty foam inside, next to a thick 8mm silicone-core strap with steel buckles.',
    },
    {
      label: '2. [HOOK] Suwmiarka przyłożona do rdzenia pokazująca dokładnie 8 mm grubości silikonu',
      includeProductRef: false,
      scenePrompt:
        'Close-up first-person POV smartphone photo over a wooden table: a metal caliper measuring the thick 8mm silicone tube pad of a matte-black patellar knee strap.',
    },
    {
      label: '3. [HOOK] Pęknięta plastikowa sprzączka taniej podróbki z internetu obok szarego foliopaku',
      includeProductRef: false,
      scenePrompt:
        'Close-up 90-degree flat-lay smartphone photo on a table filling 100% of the frame: a flimsy knockoff knee strap with a snapped plastic ring next to a torn grey shipping bag.',
    },
    {
      label: '4. [HOOK] Zbliżenie na stalowe przelotki i podwójne rzepy trzymane w dłoni seniora',
      includeProductRef: false,
      scenePrompt:
        'First-person POV close-up smartphone photo in a Polish apartment: a senior’s hand pulling firmly on the heavy-duty metal buckle of a matte-black patellar strap (zero text or logos on the strap).',
    },
  ],
};

/**
 * Buduje komplet 8 scen Kie.ai dla Stryde PL:
 * - 4 sceny z HOOKA (50% wszystkich zdjęć = unikalne pod dany kąt)
 * - 3 sceny 1:1 na wzór NOOM.PL (Wydruk + Żółty Post-it + Paragon SUMA PLN / Podkładka TEST 60 SEKUND [✓] / 4 coraz większe blistry + RTG na stole 90°)
 * - 1 scena produktowa z referencją wąskiego czarnego paska pod rzepką
 */
export function buildStrydeEightKieScenes(params: {
  angleId: string;
  primaryText: string;
  headline: string;
  title: string;
}): KieSceneSpec[] {
  const hookScenes = STRYDE_HOOK_SCENES_BY_ANGLE[params.angleId] || STRYDE_HOOK_SCENES_BY_ANGLE['stryde-01-czy-pani-tata-dobrze-sie-czuje'];
  const id = (params.angleId || '').toLowerCase();

  let printoutTopNote = 'STAW KOLANOWY: KOŚĆ O KOŚĆ — PRZECIĄŻENIE ŚCIĘGNA';
  let postItNote = 'ODCIĄŻYĆ PUNKT 2 PALCE POD RZEPKĄ (-34%) / NIE TABLETKA!';
  let checklistLines =
    'TEST SCHODÓW (60 SEKUND):\\n[✓] schodzisz dostawianym krokiem?\\n[✓] ból 2 palce pod rzepką?\\n[✓] opaski z apteki zjeżdżają na łydkę?\\n[✓] leki działają tylko 2h?';

  if (id.includes('131-nocy') || id.includes('otodom')) {
    printoutTopNote = 'ZWYRODNIENIE KOLANA — BRAK STABILIZACJI NA SCHODACH';
    postItNote = 'PRZENIEŚĆ CIĘŻAR NA ŚCIĘGNO POD RZEPKĄ / NIE FOTEL!';
    checklistLines =
      'TEST 60 SEKUND:\\n[✓] unikasz wchodzenia na piętro?\\n[✓] trzymasz się poręczy obiema rękami?\\n[✓] kłucie pod rzepką na 3. stopniu?\\n[✓] ortezy z apteki lądują w szufladzie?';
  } else if (id.includes('toalety') || id.includes('wnuk') || id.includes('babcia') || id.includes('wozek')) {
    printoutTopNote = 'PRZECIĄŻENIE RZEPKI PRZY KĄCIE 90° — BRAK AMORTYZACJI';
    postItNote = 'PODPARCIE POD RZEPKĄ (8 MM) / NIE ŚCIĄGACZ Z APTEKI!';
    checklistLines =
      'TEST 60 SEKUND:\\n[✓] problem ze wstaniem z niskiego krzesła?\\n[✓] boisz się kucnąć przy wnukach?\\n[✓] szukasz wzrokiem ławki w parku?\\n[✓] maści nie dają ulgi w ruchu?';
  } else if (id.includes('tysiace') || id.includes('1600') || id.includes('kolejke') || id.includes('podrobki')) {
    printoutTopNote = 'SZPARA STAWOWA ZWĘŻONA — NAPIĘCIE ŚCIĘGNA RZEPKI';
    postItNote = 'RDZEŃ SILIKONOWY 8 MM POD RZEPKĄ / NIE ORTEZA ZA 1600 ZŁ!';
    checklistLines =
      'TEST 60 SEKUND:\\n[✓] czekasz w kolejce na NFZ?\\n[✓] blokada działała tylko miesiąc?\\n[✓] sztywna orteza gniecie i leży w szafie?\\n[✓] zwykłe opaski zsuwają się na łydkę?';
  }

  const noom1: KieSceneSpec = {
    label: '5. [WZÓR NOOM #1] Wydruk RTG kolana + żółty Post-it i polski paragon SUMA PLN na stole (90°)',
    includeProductRef: false,
    scenePrompt: `Close-up 90-degree flat-lay amateur smartphone photo pointing straight down at a warm oak wooden tabletop surface filling 100% of the entire image frame (NO table edges visible, NO room background, NO floating table). Lying flat on the wood grain are: (1) a clinical knee X-ray printout with handwritten blue ballpoint pen notes at the top reading "${printoutTopNote}" and yellow highlighter on the diagnosis line, (2) a bright yellow square sticky note (Post-it) stuck to the corner with handwritten Polish blue-pen text reading "${postItNote}", and (3) a crumpled white Polish thermal pharmacy receipt printed with header "PARAGON FISKALNY" and summary line "SUMA PLN 380,00" (strictly Polish "SUMA PLN", NEVER the English word "TOTAL"). Realistic indoor light.`,
  };

  const noom2: KieSceneSpec = {
    label: '6. [WZÓR NOOM #2] Podkładka z odręczną listą „TEST 60 SEKUND [✓]” na drewnianym stole (90°)',
    includeProductRef: false,
    scenePrompt: `Close-up 90-degree flat-lay amateur smartphone photo pointing straight down at a wooden tabletop surface filling 100% of the entire image frame (NO table edges visible, NO room background, NO floating table). Lying flat on the wooden table next to reading glasses and an uncapped blue felt-tip marker is a brown hardboard clipboard holding a white paper sheet with bold, legible handwritten Polish blue-marker text and checked boxes: "${checklistLines}". Warm indoor ceiling light, authentic amateur photo.`,
  };

  const noom3: KieSceneSpec = {
    label: '7. [WZÓR NOOM #3] 4 coraz większe blistry tabletek + RTG kolana („Tabletki coraz mocniejsze. Kolano coraz słabsze.”)',
    includeProductRef: false,
    scenePrompt:
      'Close-up 90-degree flat-lay amateur smartphone photo pointing straight down at a dark wooden tabletop surface filling 100% of the entire image frame (NO table edges visible, NO room background, NO floating table). Arranged in a row from left to right on the wood grain are 4 progressively larger silver foil pill blister packs (from a small 6-pill blister on the left to a large 20-pill blister on the right, with empty popped pockets) next to a black-and-white knee X-ray ("KOŚĆ O KOŚĆ") and a white card with bold Polish text reading: "TABLETKI CORAZ MOCNIEJSZE. KOLANO CORAZ SŁABSZE." Realistic indoor lighting.',
  };

  const productScene: KieSceneSpec = {
    label: '8. [PRODUKT] Senior w polskiej kuchni pokazujący wąski czarny pasek założony 2 palce pod rzepką',
    includeProductRef: true,
    scenePrompt:
      'Authentic amateur smartphone photo taken in a Polish home: a 65-year-old Polish person sitting on a chair with one trouser leg rolled up above the knee, wearing a narrow matte-black patellar knee strap fastened exactly two fingers below the kneecap (strictly zero logos or letters on the strap).',
  };

  return [
    hookScenes[0],
    hookScenes[1],
    hookScenes[2],
    hookScenes[3],
    noom1,
    noom2,
    noom3,
    productScene,
  ];
}

/**
 * Buduje 4 unikalne sceny z HOOKA (50% z 8 zdjęć) + 3 sceny na wzór NOOM.PL + 1 scenę produktową dla każdego z 25 kątów Feliora PL.
 */
export function buildFelioraEightKieScenes(params: {
  angleId: string;
  primaryText: string;
  headline: string;
  title: string;
}): KieSceneSpec[] {
  const id = (params.angleId || '').toLowerCase();
  const text = `${params.title}\n${params.headline}\n${params.primaryText}`.toLowerCase();

  let hookScenes: [KieSceneSpec, KieSceneSpec, KieSceneSpec, KieSceneSpec] = [
    {
      label: '1. [HOOK] Kot siedzący na rogu pościeli w sypialni i plama na prześcieradle',
      includeProductRef: false,
      scenePrompt:
        'Natural everyday smartphone photo in a clean Polish bedroom under warm indoor light: a slightly crumpled white cotton duvet on the bed with a subtle damp spot and a tense domestic tabby cat sitting calmly at the corner of the mattress.',
    },
    {
      label: '2. [HOOK] Kołdra wkładana do pralki w łazience i płyn enzymatyczny',
      includeProductRef: false,
      scenePrompt:
        'Everyday smartphone photo in a clean Polish bathroom: a white duvet being loaded into an open front-loading washing machine drum next to a bottle of laundry cleaner.',
    },
    {
      label: '3. [HOOK] Zbliżenie na czujnego kota z rozszerzonymi źrenicami na łóżku',
      includeProductRef: false,
      scenePrompt:
        'Close-up everyday smartphone photo on a bed: an alert, slightly tense domestic cat with wide dark pupils sitting on a pillow in a tidy bedroom.',
    },
    {
      label: '4. [HOOK] Susząca się na suszarce pościel w polskim mieszkaniu',
      includeProductRef: false,
      scenePrompt:
        'Natural smartphone photo in a tidy Polish apartment: freshly washed white bedsheets and a duvet cover hanging neatly on a folding indoor laundry rack.',
    },
  ];

  if (id.includes('folia-malarska') || id.includes('octem') || id.includes('komoda')) {
    hookScenes = [
      {
        label: '1. [HOOK] Kanapa w salonie zabezpieczona folią ochronną przed kotem',
        includeProductRef: false,
        scenePrompt:
          'Natural everyday smartphone photo in a tidy Polish living room: a grey fabric sofa covered with a clean protective translucent plastic sheet.',
      },
      {
        label: '2. [HOOK] Butelka octu spirytusowego i rolka ręczników papierowych przy kanapie',
        includeProductRef: false,
        scenePrompt:
          'First-person POV smartphone photo in a clean living room: a bottle of Polish spirit vinegar ("OCET SPIRYTUSOWY 10%"), a spray bottle, and a roll of paper towels standing on the floor next to a grey sofa.',
      },
      {
        label: '3. [HOOK] Telefon z wiadomością do mamy: „Przełóżmy kawę na przyszły tydzień”',
        includeProductRef: false,
        scenePrompt:
          'Close-up smartphone photo of a phone screen held in hand showing a Polish SMS message: "Mamo, przełóżmy kawę na przyszły tydzień, u nas dalej bałagan..." with a living room sofa softly visible in the background.',
      },
      {
        label: '4. [HOOK] Kot obwąchujący ostrożnie róg kanapy w salonie',
        includeProductRef: false,
        scenePrompt:
          'Natural smartphone photo in a Polish living room: a domestic cat cautiously sniffing the lower corner of a grey fabric sofa.',
      },
    ];
  } else if (id.includes('duch-pod-lozkiem') || id.includes('3-15') || id.includes('ultimatum')) {
    hookScenes = [
      {
        label: '1. [HOOK] Budzik 3:15 w nocy i kot pod zamkniętymi drzwiami sypialni',
        includeProductRef: false,
        scenePrompt:
          'Night-time smartphone photo in a bedroom: a digital alarm clock showing "3:15" on the nightstand while a cat’s paws are visible under the closed bedroom door.',
      },
      {
        label: '2. [HOOK] Przestraszony kot schowany pod łóżkiem w sypialni',
        includeProductRef: false,
        scenePrompt:
          'Everyday smartphone photo taken at floor level looking under a wooden bed frame: a shy domestic cat tucked into the corner under the bed next to an untouched food bowl.',
      },
      {
        label: '3. [HOOK] Torba na laptopa i plastikowy transporter dla kota w przedpokoju',
        includeProductRef: false,
        scenePrompt:
          'First-person POV smartphone photo in a clean Polish hallway: a black laptop bag standing next to a plastic pet carrier by the front door.',
      },
      {
        label: '4. [HOOK] Podrapana dolna krawędź drzwi sypialni i kot siedzący obok',
        includeProductRef: false,
        scenePrompt:
          'Close-up first-person POV smartphone photo of the bottom corner of a white apartment bedroom door with visible cat scratch marks.',
      },
    ];
  } else if (id.includes('fic') || id.includes('lysy-brzuch') || id.includes('4-kuwet')) {
    hookScenes = [
      {
        label: '1. [HOOK] Kot siedzący w kuwecie w łazience i spoglądający w górę (FIC)',
        includeProductRef: false,
        scenePrompt:
          'Natural everyday smartphone photo in a clean Polish bathroom: a domestic cat sitting tensely inside an open clean plastic litter box filled with light clumping litter.',
      },
      {
        label: '2. [HOOK] Kot wylizujący futerko na brzuchu na kanapie (stres behawioralny)',
        includeProductRef: false,
        scenePrompt:
          'Natural everyday smartphone photo of a domestic cat sitting on a grey couch grooming and over-licking the fur on its lower belly, with a small patch of thinned fur (clean, non-graphic, neutral look).',
      },
      {
        label: '3. [HOOK] Przedpokój w mieszkaniu z ustawionymi obok siebie kuwetami',
        includeProductRef: false,
        scenePrompt:
          'First-person POV smartphone photo of a clean Polish apartment hallway with 3 different plastic cat litter boxes placed neatly along the wall.',
      },
      {
        label: '4. [HOOK] Wypis z lecznicy weterynaryjnej i plastikowa strzykawka doustna na stole',
        includeProductRef: false,
        scenePrompt:
          'Close-up 90-degree flat-lay smartphone photo on a wooden table filling 100% of the frame: a clean veterinary discharge printout and a small oral dosing syringe.',
      },
    ];
  } else if (id.includes('siatka-w-drzwiach') || id.includes('f3-vs-kompleks')) {
    hookScenes = [
      {
        label: '1. [HOOK] Siatka w futrynie drzwi oddzielająca dwa koty w mieszkaniu',
        includeProductRef: false,
        scenePrompt:
          'Natural smartphone photo in a Polish apartment doorway: a mesh screen installed in the doorframe separating two tense domestic cats looking at each other from opposite rooms.',
      },
      {
        label: '2. [HOOK] Dwa koty obserwujące się z dystansu z dwóch końców pokoju',
        includeProductRef: false,
        scenePrompt:
          'Natural everyday smartphone photo in a Polish living room: one cat sitting high on the back of a sofa staring down at a second cat crouching tensely by the doorway.',
      },
      {
        label: '3. [HOOK] Kępki kociej sierści na dywanie w przedpokoju po spięciu kotów',
        includeProductRef: false,
        scenePrompt:
          'First-person POV smartphone photo looking down at a clean hallway rug with a few small tufts of shed cat fur.',
      },
      {
        label: '4. [HOOK] Drugi kot jedzący z miski w zamkniętej łazience obok pralki',
        includeProductRef: false,
        scenePrompt:
          'Everyday smartphone photo inside a clean bathroom: a timid cat eating from a ceramic bowl placed next to the washing machine.',
      },
    ];
  } else if (
    id.includes('obrozki') ||
    id.includes('spray') ||
    id.includes('behawiorystka') ||
    id.includes('20-pudelek') ||
    id.includes('7-dni') ||
    id.includes('62-klientom') ||
    id.includes('1-pokoj') ||
    id.includes('wklady') ||
    id.includes('matematyka') ||
    id.includes('instrukcja') ||
    id.includes('14-dni') ||
    id.includes('bezpieczenstwo') ||
    id.includes('30-dni')
  ) {
    hookScenes = [
      {
        label: '1. [HOOK] Rozcięta nożyczkami fioletowa obróżka z lawendą na stole w lecznicy (90° flat-lay)',
        includeProductRef: false,
        scenePrompt:
          'Close-up 90-degree flat-lay smartphone photo pointing straight down at a veterinary desk filling 100% of the frame (NO floating table): a purple scented calming cat collar cut in half with metal scissors.',
      },
      {
        label: '2. [HOOK] Przegrzany, czarny zwęglony knot zwykłego taniego dyfuzora po 7 dniach (115°C)',
        includeProductRef: false,
        scenePrompt:
          'Macro close-up amateur smartphone photo held in hand: an old generic plug-in diffuser with a blackened, burnt, caramelized core wick from overheating above 115 degrees Celsius.',
      },
      {
        label: '3. [HOOK] Błąd montażu: stary dyfuzor wpięty w gniazdko za grubą zasłoną i komodą',
        includeProductRef: false,
        scenePrompt:
          'Amateur smartphone photo in a Polish living room corner: a generic plug-in diffuser trapped behind a heavy curtain and wooden dresser where the oily vapor condenses on the furniture.',
      },
      {
        label: '4. [HOOK] Rysunek polskiego mieszkania w bloku z korytarzem w kształcie L (1 pokój = 1 strefa)',
        includeProductRef: false,
        scenePrompt:
          'Close-up 90-degree flat-lay smartphone photo pointing straight down at a wooden table filling 100% of the frame: a hand-drawn blue ballpoint floor plan of a Polish apartment ("SALON - KORYTARZ - SYPIALNIA / KUWETA") showing walls blocking airflow.',
      },
    ];
  }

  let printoutTopNote = 'BADANIE MOCZU CZYSTE — PRZYCZYNA: STRES TERYTORIALNY (VNO)';
  let postItNote = 'M.A.P. + F3 STAŁA DYFUZJA 24/7 (NIE OBRÓŻKA / NIE TABLETKA!)';
  let checklistLines =
    'TEST KOCIEGO STRESU (60 SEK):\\n[✓] sika na kołdrę lub kanapę?\\n[✓] badania moczu u weta czyste?\\n[✓] ocet i spraye nie działają?\\n[✓] chowa się lub wyje o 3 w nocy?';

  if (text.includes('fic') || text.includes('pęcherz') || text.includes('łysy')) {
    printoutTopNote = 'OSAD MOCZU CZYSTY (0 BAKTERII) — IDIOPATYCZNE FIC / STRES';
    postItNote = 'WYCISZYĆ OŚ MÓZG-PĘCHERZ PRZEZ VNO (M.A.P. 24/7)!';
    checklistLines =
      'TEST 60 SEKUND:\\n[✓] wchodzi do kuwety 15x na godzinę?\\n[✓] wylizuje brzuch do gołej skóry?\\n[✓] badania moczu bez bakterii?\\n[✓] zastrzyki działają tylko chwilę?';
  } else if (text.includes('dokocen') || text.includes('siatk') || text.includes('walk')) {
    printoutTopNote = 'AGRESJA TERYTORIALNA — BRAK FEROMONU MATCZYNEGO M.A.P.';
    postItNote = '2 STREFY: M.A.P. + F3 (SAMO F3 Z APTEKI NIE WYSTARCZY!)';
    checklistLines =
      'TEST 60 SEKUND:\\n[✓] syczenie i ataki pod drzwiami?\\n[✓] siatka w futrynie od miesięcy?\\n[✓] jeden kot blokuje dostęp do kuwety?\\n[✓] zwykłe F3 nie zatrzymało walk?';
  }

  const noom1: KieSceneSpec = {
    label: '5. [WZÓR NOOM #1] Wydruk badania z lecznicy + żółty Post-it od weta i paragon SUMA PLN (90°)',
    includeProductRef: false,
    scenePrompt: `Close-up 90-degree flat-lay amateur smartphone photo pointing straight down at a warm oak wooden tabletop surface filling 100% of the entire image frame (NO table edges visible, NO room background, NO floating table). Lying flat on the wood grain are: (1) a Polish veterinary urinalysis printout ("BADANIE MOCZU - BAKTERIE: BRAK") with handwritten blue ballpoint pen notes at the top reading "${printoutTopNote}" and yellow highlighter, (2) a bright yellow square sticky note (Post-it) stuck to the corner with handwritten Polish blue-pen text reading "${postItNote}", and (3) a crumpled white Polish thermal vet receipt printed with header "PARAGON FISKALNY" and summary line "SUMA PLN 480,00" (strictly Polish "SUMA PLN", NEVER the English word "TOTAL"). Realistic indoor light.`,
  };

  const noom2: KieSceneSpec = {
    label: '6. [WZÓR NOOM #2] Podkładka z odręczną listą „TEST 60 SEKUND [✓]” na drewnianym stole (90°)',
    includeProductRef: false,
    scenePrompt: `Close-up 90-degree flat-lay amateur smartphone photo pointing straight down at a wooden tabletop surface filling 100% of the entire image frame (NO table edges visible, NO room background, NO floating table). Lying flat on the wooden table next to reading glasses and an uncapped blue felt-tip marker is a brown hardboard clipboard holding a white paper sheet with bold, legible handwritten Polish blue-marker text and checked boxes: "${checklistLines}". Warm indoor ceiling light, authentic amateur photo.`,
  };

  const noom3: KieSceneSpec = {
    label: '7. [WZÓR NOOM #3] Rozcięta obróżka, spray, blistry i rachunek 1 960 zł na drewnianym stole (90°)',
    includeProductRef: false,
    scenePrompt:
      'Close-up 90-degree flat-lay amateur smartphone photo pointing straight down at a dark wooden tabletop surface filling 100% of the entire image frame (NO table edges visible, NO room background, NO floating table). Arranged in a row from left to right on the wood grain are: (1) a purple lavender cat collar cut in half with scissors, (2) a small pump spray bottle, (3) popped silver foil blister packs of sedative tablets, and (4) a handwritten Polish expense sheet ending with "Razem: 1 960 zł" next to a bold Polish note card reading: "OBRÓŻKI I SPRAYE NA CHWILĘ. PRZYCZYNA JEST W MÓZGU KOTA." Realistic indoor lighting.',
  };

  const productScene: KieSceneSpec = {
    label: '8. [PRODUKT] Wtyczka Feliora (kaczuszka) w gniazdku w polskim mieszkaniu + spokojnie śpiący kot',
    includeProductRef: true,
    scenePrompt:
      'Unstaged amateur smartphone photo in a Polish apartment hallway under warm evening bulb light: the exact Feliora plug-in pheromone diffuser from the reference image (compact spherical white duck-shaped head with a tiny yellow beak and tiny pin-dot eyes — NO neck, NO body, screwed directly onto the short round amber glass bottle with the orange "FELIORA" label) plugged into a wall socket above the baseboard, and a calm domestic tabby cat sleeping peacefully on the floor nearby.',
  };

  return [
    hookScenes[0],
    hookScenes[1],
    hookScenes[2],
    hookScenes[3],
    noom1,
    noom2,
    noom3,
    productScene,
  ];
}
