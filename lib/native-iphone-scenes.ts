import { brainClient, brainOptions } from './account-brain';

export type NativeBrandKind = 'sardian-strap' | 'feliora' | 'orthomax' | 'mellow-uk' | 'custom';
export type NativeMarketKind = 'pl' | 'uk' | 'auto';

export interface NativeIphoneSceneSpec {
  label: string;
  scenePrompt: string;
  includeProductRef: boolean;
}

export function detectScriptMarket(
  primaryText: string,
  preferred: NativeMarketKind = 'auto',
): 'pl' | 'uk' {
  if (preferred === 'pl' || preferred === 'uk') return preferred;
  const sample = (primaryText || '').slice(0, 2000);
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|\b(że|się|nie|przez|lekarz|kolan|NFZ|zł)\b/.test(sample)) {
    return 'pl';
  }
  return 'uk';
}

/**
 * Wraps a raw scene description with the exact iPhone camera-roll optical physics
 * from the NHS / Native Ads workflow ("iPhone quality + lekkie rozjaśnienie"):
 * - 3:4 vertical smartphone sensor framing (2K 1792x2400)
 * - Imperfect auto-exposure (blown-out window highlights / harsh 4000K fluorescent / direct flash)
 * - Tiny-sensor deep focus (ZERO DSLR bokeh / ZERO portrait mode blur)
 * - Unretouched ordinary people, awkward boomer framing, lived-in British (NHS) or Polish (NFZ) clutter
 */
export function formatRawIphoneKiePrompt(
  scenePrompt: string,
  brand: NativeBrandKind,
  includeProductRef: boolean,
  market: 'pl' | 'uk' = 'pl',
  customProductInstruction = '',
): string {
  const cleaned = scenePrompt.trim();

  let productDirective = '';
  if (brand === 'sardian-strap') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Show a narrow, slim matte-black patellar knee strap with an 8mm contoured pad fastened 2 fingers below the kneecap (strictly ZERO text, ZERO letters, ZERO logos on the black strap; NEVER a full knee sleeve).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place studio product boxes or brand logos in the shot.';
  } else if (brand === 'feliora') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Feliora diffuser (compact spherical white duck-head top with tiny yellow beak and pin-dot eyes screwed directly onto a short round amber glass vial, plugged into a wall socket).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place studio product boxes in the shot.';
  } else if (brand === 'orthomax') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference bright orange contoured Orthomax StepMax shoe insole (orange breathable mesh top with raised arch support domes) held in hand or inside everyday shoes.'
      : 'NO COMMERCIAL PACKSHOT: Do NOT show commercial product boxes or brand logos.';
  } else if (brand === 'mellow-uk') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Mellow Mood Munchies UK pouch (matte light sky-blue stand-up resealable pouch with dark-navy lowercase "mellow" wordmark and glossy berry-red 5-petal flower-shaped gummies - NEVER gummy bears, NEVER purple pouches).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place commercial studio packaging or floating text overlays in the shot.';
  } else {
    const customTrimmed = customProductInstruction.trim().slice(0, 450);
    productDirective = includeProductRef
      ? customTrimmed
        ? `PRODUCT ACCURACY: Match the supplied product naturally in a real home setting (${customTrimmed}).`
        : 'PRODUCT ACCURACY: Match the supplied reference product naturally held in hand or on a lived-in home table without studio lighting.'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place commercial studio product boxes or graphic text overlays in the shot.';
  }

  const localeLine =
    market === 'uk'
      ? 'Awkward casual boomer composition (slightly crooked horizon, off-center framing, real lived-in British semi-detached house / NHS GP surgery / rainy UK car park background clutter). Any person in frame must look 100% like an ordinary unretouched British person (natural skin redness, pores, glasses reflection, ordinary everyday jumper/coat/NHS scrubs, neutral candid or mid-thought expression - NEVER stock-photo models, NEVER symmetrical studio lighting, NEVER cinematic warm grading, NEVER split-screen Before/After collages, strict British English spelling ONLY if any paper/NHS badge appears).'
      : 'Awkward casual boomer composition (slightly crooked horizon, off-center framing, real lived-in Polish apartment / NFZ Poradnia clinic / rainy Polish parking lot background clutter). Any person in frame must look 100% like an ordinary unretouched Polish person (natural skin redness, pores, glasses reflection, ordinary everyday clothes/scrubs, neutral candid or mid-thought expression - NEVER stock-photo models, NEVER symmetrical studio lighting, NEVER cinematic warm grading, NEVER split-screen Before/After collages, Polish text ONLY if any paper/sign appears, NEVER English words).';

  const opticalSignature = [
    'Raw unedited smartphone photo taken on an iPhone 11/12 default Camera app (26mm wide lens, f/1.8 tiny mobile sensor, EVERYTHING in foreground and background in sharp focus - strictly ZERO DSLR bokeh, ZERO portrait-mode blur).',
    'Imperfect automatic phone exposure with slightly blown-out bright highlights (overexposed window light flare, harsh 4000K ceiling fluorescent glare, or direct on-camera flash), subtle greasy phone-lens halation, mixed uneven indoor color temperature, visible mobile sensor grain.',
    localeLine,
  ].join(' ');

  return `${cleaned} ${productDirective} ${opticalSignature}`.trim();
}

function buildBrandDirectorContext(
  brand: NativeBrandKind,
  market: 'pl' | 'uk',
  segment?: string,
  instructionText?: string,
): string {
  const extra = instructionText?.trim()
    ? `\nADDITIONAL PRODUCT / ANGLE INSTRUCTION (instruction.txt):\n${instructionText.trim().slice(0, 2200)}`
    : '';

  if (brand === 'sardian-strap') {
    return `BRAND & AUDIENCE: SARDIAN Opaska Podrzepkowa (narrow matte-black patellar tendon strap worn 2 fingers below the kneecap, zero text/logos on strap). Target: Polish men and women aged 55-78 with mechanical knee pain on stairs, car clutch, garden, bathtub, dancing, NFZ orthopedic queues.${extra}`;
  }
  if (brand === 'feliora') {
    return `BRAND & AUDIENCE: Dyfuzor feromonowy Feliora (spherical white duck-head plug-in diffuser on amber glass vial, M.A.P. + F3 cat pheromones). Target: Polish cat owners dealing with peeing on duvet/sofa, night yowling, FIC bladder stress, multi-cat fights behind doorway mesh, vet visits.${extra}`;
  }
  if (brand === 'orthomax') {
    return `BRAND & AUDIENCE: Wkładki ortopedyczne Orthomax StepMax (bright orange contoured insoles). Segment: ${
      segment === 'dzieci'
        ? 'Polish mothers of children aged 4-12 (valgus ankles, flat feet, worn inner shoe heels, PE pain)'
        : 'Polish adults/seniors aged 45-70 (bunions, heel spurs, collapsed arches, knee/hip/back compensation, hospital/retail shifts)'
    }.${extra}`;
  }
  if (brand === 'mellow-uk') {
    return `BRAND & AUDIENCE: Mellow Mood Munchies UK (matte light sky-blue stand-up pouch with berry-red 5-petal flower saffron gummies for calm, focus & emotional balance). Target: British parents (school runs, Meltdowns, CAMHS/NHS waiting lists, kitchen routine) or UK adults.${extra}`;
  }
  return `MARKET & AUDIENCE: ${
    market === 'uk'
      ? 'United Kingdom (NHS hospitals/GP surgeries, British homes, Boots chemist blisters, rainy B&Q/Tesco car parks, UK £)'
      : 'Poland (NFZ Poradnia clinics, Polish apartments/stairwells, rainy Biedronka/housing-estate parking, ROD allotments, Polish zł)'
  }. Infer the exact product, target demographic, symptoms, and conflict directly from skrypt.txt and instruction.txt.${extra}`;
}

/**
 * Deterministic, script-aware 12-to-15 scene fallback when AI Brain is unavailable or times out.
 * Covers all 6 Loom native archetypes with ZERO fake Noom Post-it/clipboard graphics and ZERO Meta-bannable Before/After collages.
 */
export function buildFallbackTwelveNativeScenes(params: {
  brand: NativeBrandKind;
  market?: NativeMarketKind;
  angleId?: string;
  primaryText: string;
  headline: string;
  title: string;
  segment?: string;
  instructionText?: string;
  count?: number;
}): NativeIphoneSceneSpec[] {
  const { brand, primaryText, headline, title, segment } = params;
  const resolvedMarket = detectScriptMarket(primaryText, params.market || 'auto');
  const targetCount = params.count && params.count >= 15 ? 15 : 12;
  const full = `${title}\n${headline}\n${primaryText}`;
  const lower = full.toLowerCase();

  let baseTwelve: NativeIphoneSceneSpec[];

  if (brand === 'feliora') {
    const hasMesh = /siatk|dokocen|dwa kot|walcz|izolac/i.test(lower);
    const hasFic = /fic|kuwet|pęcherz|łysy brzuch|wyliz/i.test(lower);
    baseTwelve = [
      {
        label: '1. [HOOK LUDZKI] Zaspana właścicielka w sypialni przy mokrej plamie na kołdrze (flesz iPhone)',
        includeProductRef: false,
        scenePrompt:
          'Harsh night-time iPhone flash snapshot in a messy Polish apartment bedroom: an exhausted 44-year-old Polish woman in an oversized sleep t-shirt standing beside her unmade bed pulling back a white duvet with a damp yellow-ish cat urine patch, while a tense tabby cat sits on the dresser behind her staring at the camera with flash eye-shine.',
      },
      {
        label: hasMesh
          ? '2. [HOOK SYTUACJA] Siatka w futrynie drzwi i dwa spięte koty w polskim przedpokoju'
          : hasFic
          ? '2. [HOOK SYTUACJA] Kot napinający się w kuwecie na kafelkach łazienki'
          : '2. [HOOK SYTUACJA] Kanapa w salonie oklejona szeleszczącą folią malarską',
        includeProductRef: false,
        scenePrompt: hasMesh
          ? 'Slightly crooked handheld iPhone photo in a narrow Polish block-of-flats hallway with blown-out ceiling light: temporary white fiberglass mesh taped across a bedroom doorframe separating an angry arched-back cat inside from a crouching second cat in the corridor.'
          : hasFic
          ? 'Harsh fluorescent bathroom iPhone snapshot: a stressed domestic cat squatting tensely inside an open plastic litter box next to a washing machine and scattered litter grains on beige tiles, ears angled back.'
          : 'Candid iPhone snapshot in an ordinary Polish living room with an overexposed window behind the sofa: a grey fabric couch awkwardly draped in cheap translucent painter plastic foil weighed down with books, a bottle of 10% spirit vinegar and paper towels on the laminate floor.',
      },
      {
        label: '3. [SELFIE EKSPERTA] Polski weterynarz / behawiorystka w fartuchu ze smyczą lecznicy (przednia kamera)',
        includeProductRef: false,
        scenePrompt:
          'Awkward close-up front-camera iPhone selfie of a tired 52-year-old Polish veterinarian in navy medical scrubs with a clinic ID lanyard and slightly crooked glasses, standing in a brightly lit fluorescent Polish vet clinic corridor with a slightly blown-out window behind his shoulder, neutral unposed expression mid-thought.',
      },
      {
        label: '4. [GABINET] Weterynarz w lecznicy wskazujący długopisem narząd VNO na modelu kota',
        includeProductRef: false,
        scenePrompt:
          'Candid handheld iPhone photo inside a modest Polish veterinary consultation room: a vet in a slightly rumpled white coat holding a plastic anatomical cat head model over a stainless-steel exam table, pointing a blue pen near the nasal palate, cluttered shelves and monitor behind.',
      },
      {
        label: '5. [SCROLL-STOPPER KOSZ] Wyrzucanie fioletowej obróżki i taniego dyfuzora do kosza w kuchni',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo with slightly blown-out auto-exposure looking down into an open plastic kitchen pedal trash bin with a white liner: a woman hand dropping a cut-up purple lavender calming cat collar, an empty pheromone spray bottle, and a burnt-wick cheap plug-in diffuser straight into the household garbage.',
      },
      {
        label: '6. [CIEKAWOSTKA WTF] Zwęglony, przypalony knot taniego dyfuzora trzymany w palcach nad zlewem',
        includeProductRef: false,
        scenePrompt:
          'Unflattering close-up iPhone snapshot held in an ordinary hand over a kitchen sink with harsh overhead light: a cheap generic plug-in diffuser pulled apart to show a sticky, blackened, burnt wick caramelized from overheating, slightly out-of-center framing.',
      },
      {
        label: '7. [MONITOR LECZNICY] Zdjęcie ekranu komputera u weta z czystym wynikiem osadu moczu / USG pęcherza',
        includeProductRef: false,
        scenePrompt:
          'Slightly angled handheld iPhone snapshot of a dusty clinic LCD monitor on a Polish vet desk showing a monochrome bladder ultrasound scan next to a Polish lab window reading "OSAD MOCZU - BAKTERIE: BRAK", keyboard and coffee mug ring in foreground.',
      },
      {
        label: '8. [KARTKA W AUCIE] Pomięty wypis z lecznicy i karteczka trzymana w aucie pod blokiem',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo inside a parked car on a grey rainy Polish housing estate parking lot: a woman hand holding a creased veterinary visit sheet and a small torn notepad page with rushed doctor handwriting reading "dyfuzor Feliora (M.A.P. + F3)", steering wheel and wet windshield behind.',
      },
      {
        label: '9. [BAŁAGAN PRÓB] Pralka upchana zasikaną kołdrą, ocet i 4 nieskuteczne preparaty w łazience',
        includeProductRef: false,
        scenePrompt:
          'Eye-level candid iPhone snapshot in a cramped Polish apartment bathroom under harsh fluorescent mirror light: an open front-load washing machine stuffed with a heavy white duvet, surrounded on the floor and machine top by spirit vinegar, enzymatic urine spray, calming paste tubes, and an open plastic pet carrier.',
      },
      {
        label: '10. [EMOCJE W DOMU] Mąż i żona w nocy w kuchni przy stercie prania (bezpośredni flesz)',
        includeProductRef: false,
        scenePrompt:
          'Candid night-time iPhone snapshot with harsh direct camera flash in a small Polish kitchen: a tired 45-year-old husband in sweatpants rubbing his forehead by the kettle while holding a cat-scratched laptop bag, unposed real family tension.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Kot śpiący kołami do góry na czystej kanapie bez folii w słońcu z okna',
        includeProductRef: false,
        scenePrompt:
          'Slightly overexposed sunlit iPhone photo in a lived-in Polish living room with bright blown-out window light: a relaxed domestic cat sleeping belly-up on a grey sofa next to a coffee mug and folded throw blanket, completely calm everyday snapshot.',
      },
      {
        label: '12. [PRODUKT W RUCHU] Wtyczka Feliora (kaczuszka) w gniazdku w przedpokoju obok śpiącego kota',
        includeProductRef: true,
        scenePrompt:
          'Unstaged handheld iPhone photo in a Polish apartment hallway under warm bulb light with slight highlight flare: the Feliora spherical white duck-head diffuser on its short round amber vial plugged into a wall socket above the baseboard, with a calm tabby cat curled up asleep on the laminate floor nearby.',
      },
    ];
  } else if (brand === 'orthomax') {
    const isDzieci = segment === 'dzieci' || /dziec|syn|córk|szkoł|wf|przedszkol/i.test(lower);
    baseTwelve = [
      {
        label: isDzieci
          ? '1. [HOOK LUDZKI] Dziecko siedzące na schodach w szatni trzymające się za piętę i kostkę'
          : '1. [HOOK LUDZKI] Kobieta 58 lat na urodzinach pod stołem ze zdjętymi ciasnymi czółenkami (flesz)',
        includeProductRef: false,
        scenePrompt: isDzieci
          ? 'Candid handheld iPhone photo under harsh school corridor fluorescent tubes: a 9-year-old Polish boy in gym shorts sitting on terrazzo steps holding his aching bare heel after taking off his indoor PE sneakers, mother bag at the edge of frame.'
          : 'Candid indoor iPhone snapshot with harsh direct flash at a Polish family dinner: a 58-year-old Polish woman sitting at a white-tablecloth table secretly resting her swollen, reddened bare feet on the floor beside her kicked-off tight black leather dress shoes.',
      },
      {
        label: isDzieci
          ? '2. [HOOK DOWÓD] Koślawe kostki dziecka uciekające do środka na panelach w pokoju'
          : '2. [HOOK DOWÓD] Spuchnięta stopa i zapadnięty łuk na kafelkach łazienki',
        includeProductRef: false,
        scenePrompt: isDzieci
          ? 'Floor-level unretouched iPhone photo in a lived-in Polish room with blown-out window light at the edge: a 9-year-old child standing barefoot on laminate panels seen from behind, both ankles visibly rolling inward (valgus tilt) next to school backpack clutter.'
          : 'Harsh overhead bathroom iPhone POV photo looking down at beige floor tiles: a 56-year-old Polish woman bare feet flattening inward with a reddened bunion and deep strap indentations after a long shift.',
      },
      {
        label: '3. [SELFIE EKSPERTA] Polski fizjoterapeuta / ortopeda w przychodni ze smyczą (przednia kamera)',
        includeProductRef: false,
        scenePrompt:
          'Awkward chin-down front-camera iPhone selfie of a 56-year-old Polish orthopedic physiotherapist in dark blue medical scrubs with a clinic ID badge lanyard and wire-frame glasses, harsh cold 4000K clinic ceiling light and blown-out Venetian blinds behind him, serious unposed expression.',
      },
      {
        label: '4. [GABINET] Fizjoterapeuta w gabinecie przy modelu stopy i kolana z długopisem',
        includeProductRef: false,
        scenePrompt:
          'Candid handheld iPhone snapshot in a modest Polish rehabilitation office: a male physiotherapist holding a plastic anatomical foot-and-ankle skeleton model next to an examination couch, pointing a pen under the collapsed medial arch.',
      },
      {
        label: '5. [SCROLL-STOPPER KOSZ] Wyrzucanie żelowych podpiętek z apteki i maści do kosza w kuchni',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo with slightly blown-out exposure looking down into an open plastic kitchen trash bin: a hand tossing flattened pharmacy gel heel pads, stiff grey insoles, and squeezed pain-gel tubes straight into the household garbage.',
      },
      {
        label: '6. [CIEKAWOSTKA WTF] Podeszwa codziennego buta zdarta pod skosem od wewnątrz trzymana pod światło',
        includeProductRef: false,
        scenePrompt:
          'Close-up handheld iPhone photo in a dim Polish hallway with harsh bulb glare: an older hand holding a worn everyday shoe upside down close to the lens, showing the inner rubber heel edge badly ground down at a sharp angle.',
      },
      {
        label: '7. [DIAGNOSTYKA] Bose stopy na podświetlanym zielonym podoskopie w gabinecie',
        includeProductRef: false,
        scenePrompt:
          'Slightly tilted handheld iPhone photo in a dim Polish orthopedic room: bare feet standing on a glowing green glass podoscope mirror showing completely flat footprints, clinic desk and computer monitor visible behind.',
      },
      {
        label: '8. [KARTKA W AUCIE] Pomięte skierowanie na NFZ i karteczka od fizjoterapeuty w zaparkowanym aucie',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo from the driver seat of a parked car outside a Polish clinic on an overcast day: a hand holding a folded Polish referral slip ("SKIEROWANIE NA REHABILITACJĘ") and a small torn note reading "wkładki Orthomax StepMax".',
      },
      {
        label: '9. [BAŁAGAN PRÓB] Blistry tabletek, plastry i wyciśnięte tubki żelu na umywalce w łazience',
        includeProductRef: false,
        scenePrompt:
          'Eye-level candid iPhone photo of a cluttered Polish bathroom sink next to a toothbrush mug and soap dispenser: popped silver painkiller blisters, squeezed white diclofenac gel tubes, and peeled warming patches under harsh mirror light.',
      },
      {
        label: '10. [SCENA Z HISTORII] Miska z ciepłą wodą i solą na kafelkach łazienki po całym dniu na nogach',
        includeProductRef: false,
        scenePrompt:
          'Handheld iPhone snapshot in a small Polish apartment bathroom: a 58-year-old person sitting on the edge of the bathtub soaking tired, reddened bare feet in a blue plastic basin of warm water on tiled floor next to a crumpled towel.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Swobodny spacer w codziennych butach na polskim chodniku w słońcu',
        includeProductRef: false,
        scenePrompt:
          'Candid slightly overexposed daytime iPhone photo taken by a family member on a Polish park path: an ordinary smiling 60-year-old Polish woman in a casual jacket walking comfortably without limping, natural harsh sunlight.',
      },
      {
        label: '12. [PRODUKT W RUCHU] Dłoń wsuwająca pomarańczową wkładkę Orthomax StepMax do buta w przedpokoju',
        includeProductRef: true,
        scenePrompt:
          'Unstaged handheld iPhone photo in a cluttered Polish apartment hallway: a hand sliding a bright orange contoured Orthomax StepMax insole into a worn everyday walking shoe on a rubber doormat, second shoe beside it.',
      },
    ];
  } else if (resolvedMarket === 'uk') {
    const hasMarriage = /wife|husband|marriage|car park|sister|bed/i.test(lower);
    const hasBelly = /belly|gut|waist|shirt|belt|statin|gp|stone/i.test(lower);
    baseTwelve = [
      {
        label: hasMarriage
          ? '1. [HOOK HUMAN] Unposed UK couple 55-64 indoors / car park with harsh iPhone flash'
          : '1. [HOOK HUMAN] Ordinary 58yo British man sitting awkwardly on stairs in discomfort',
        includeProductRef: false,
        scenePrompt: hasMarriage
          ? 'Candid private-album iPhone snapshot taken with harsh direct on-camera flash in a lived-in British semi-detached kitchen/hallway: an ordinary 58-year-old British man in a fleece standing slightly tensely beside his 54-year-old wife, unretouched flash skin shine, kettle and coats behind them.'
          : 'Unstaged handheld iPhone photo in a narrow carpeted British staircase with blown-out landing window light: an ordinary 60-year-old British man in an everyday jumper sitting awkwardly halfway down the stairs looking frustrated and uncomfortable.',
      },
      {
        label: hasBelly
          ? '2. [HOOK SYMPTOM] Unflattering bathroom mirror selfie of 58yo British man holding tight shirt/waist'
          : '2. [HOOK SYMPTOM] POV sitting inside a rainy UK B&Q / Tesco car park gripping steering wheel',
        includeProductRef: false,
        scenePrompt: hasBelly
          ? 'Unflattering handheld iPhone mirror selfie in a cramped British bathroom under harsh ceiling bulb glare: a 58-year-old British man with greying hair pulling a tight polo shirt across a firm protruding midsection, towels and radiator in sharp focus behind.'
          : 'First-person POV iPhone snapshot sitting in the driver seat of an older right-hand-drive UK car in a grey rainy British retail car park: a weathered male hand gripping the steering wheel with glowing dashboard call screen and raindrops on glass.',
      },
      {
        label: '3. [NHS DOCTOR SELFIE] Awkward front-camera selfie of 56yo NHS doctor/specialist in scrubs with lanyard',
        includeProductRef: false,
        scenePrompt:
          'Awkward chin-down front-camera iPhone selfie of a 56-year-old British NHS doctor in blue hospital scrubs wearing a blue "NHS" lanyard with ID badge and slightly crooked glasses, harsh 4000K NHS corridor fluorescent tubes and blown-out window blinds behind his head, unposed serious expression.',
      },
      {
        label: '4. [NHS CLINIC] NHS GP / specialist in rumpled white coat holding coffee mug in hospital stairwell',
        includeProductRef: false,
        scenePrompt:
          'Candid handheld iPhone photo in a utilitarian British NHS hospital stairwell/corridor with green signage and fire door: a tired 54-year-old British consultant in scrubs and stethoscope holding a chipped mug during a break, slightly blown-out window flare.',
      },
      {
        label: '5. [BIN SCROLL-STOPPER] Throwing £13 chemist pill blisters and tubs straight into UK kitchen pedal bin',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo with slightly overexposed auto-exposure looking down into an open stainless-steel British kitchen pedal bin: an older hand tossing popped silver chemist pill blisters, generic supplement bottles, and crumpled pharmacy receipts straight into the rubbish.',
      },
      {
        label: '6. [WTF CURIOSITY] Torn handwritten note next to wedding ring and car keys on dark kitchen table',
        includeProductRef: false,
        scenePrompt:
          'Harsh overhead kitchen-light iPhone close-up on a scratched wooden British kitchen table: a gold wedding band resting beside UK car keys, reading glasses, and a small torn notepad page with rushed handwriting, raw dramatic curiosity framing.',
      },
      {
        label: '7. [NHS MONITOR] Angled iPhone photo of GP desk monitor showing scan / NHS blood panel results',
        includeProductRef: false,
        scenePrompt:
          'Slightly tilted handheld iPhone snapshot inside a dim British GP consultation room showing an LCD desktop monitor with medical scan / chart values while a doctor pen points at the screen, NHS mug and keyboard in foreground.',
      },
      {
        label: '8. [NOTE IN CAR] Creased NHS outpatient letter held in right-hand-drive car in rainy UK car park',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo inside a parked right-hand-drive car outside a brick UK GP surgery on a wet day: an older hand holding a creased white NHS appointment letter and a small torn slip with doctor handwriting of a biological mechanism only.',
      },
      {
        label: '9. [FAILED CLUTTER] Cluttered UK bathroom sink with chemist blisters, antacids, and half-empty tubs',
        includeProductRef: false,
        scenePrompt:
          'Eye-level 45-degree candid iPhone snapshot of a small British bathroom sink with separate hot/cold taps: cluttered with half-empty chemist supplement tubs, silver pill blister strips, and a mug with toothbrushes under harsh mirror light.',
      },
      {
        label: '10. [STORY SCENE] Candid British kitchen / pub / garden moment with ordinary 55-68yo people',
        includeProductRef: false,
        scenePrompt:
          'Candid amateur iPhone snapshot with bright blown-out window light in a lived-in British kitchen: two ordinary men in their early 60s talking over mugs of tea by the worktop, completely unposed real-life feel.',
      },
      {
        label: '11. [EVERYDAY PAYOFF] Ordinary 60yo British protagonist smiling naturally outdoors in harsh daylight',
        includeProductRef: false,
        scenePrompt:
          'Slightly overexposed daytime iPhone photo taken by a spouse in a British back garden / footpath: an ordinary 60-year-old British person in a casual zip jacket looking genuinely relieved and comfortable, zero studio look.',
      },
      {
        label: '12. [PRODUCT IN USE] Candid home iPhone photo of the product on a lived-in British kitchen counter',
        includeProductRef: true,
        scenePrompt:
          'Unstaged handheld iPhone snapshot in a lived-in British kitchen next to a kettle and tea mug under uneven morning window light: an ordinary hand holding/using the daily product naturally at home.',
      },
    ];
  } else {
    // Default PL: SARDIAN Opaska Podrzepkowa ('sardian-strap' or Polish custom)
    const isFemaleNarrator = /zrobiłam|poszłam|miałam|męża|córka zarezerwowała|tańczyłam|wannie|toalety|babcia/i.test(lower);
    const hasMarriageOrCouple = /żon|mąż|męża|bratem|dancing|ślub|małżeństw|tato|tata/i.test(lower);
    const hasStairs = /schod|piętro|poręcz|fotel|otodom/i.test(lower);
    const hasCar = /parking|aut|sprzęgł|kierownic/i.test(lower);

    baseTwelve = [
      {
        label: hasMarriageOrCouple
          ? '1. [HOOK LUDZKI] Niepozowane zdjęcie pary 55-68 lat w polskim domu / na parkingu (ostry flesz iPhone)'
          : '1. [HOOK LUDZKI] Senior 66 lat siedzący bezradnie na schodach i trzymający się za bolące kolano',
        includeProductRef: false,
        scenePrompt: hasMarriageOrCouple
          ? 'Candid private-album iPhone snapshot taken with harsh direct on-camera flash in a lived-in Polish home hallway/living room: an ordinary 64-year-old Polish man in an everyday polo shirt standing slightly awkwardly beside his 54-year-old blonde wife, unretouched skin shine from flash, slightly cluttered coat rack and door behind them, real candid family photo.'
          : `Unstaged handheld iPhone photo in a narrow Polish home staircase with slightly blown-out hallway window light: an ordinary ${
              isFemaleNarrator ? '67-year-old Polish woman in house trousers and cardigan' : '66-year-old Polish man in everyday sweater and jeans'
            } sitting awkwardly halfway down carpeted wooden stairs, gripping ${
              isFemaleNarrator ? 'her' : 'his'
            } aching right knee with a pained, tired expression.`,
      },
      {
        label: hasStairs
          ? '2. [HOOK DOWÓD] Odgniecione, spuchnięte kolano na tle stromych schodów w polskim domu'
          : hasCar
          ? '2. [HOOK DOWÓD] Dłoń zaciśnięta na bolącym kolanie na fotelu kierowcy na deszczowym parkingu'
          : '2. [HOOK DOWÓD] Odsłonięte kolano 65-latka z czerwonymi pręgami po ciężkiej ortezie z apteki',
        includeProductRef: false,
        scenePrompt: hasStairs
          ? 'First-person POV iPhone snapshot looking down from the top of steep wooden Polish stairs: one rolled-up trouser leg revealing an older swollen knee with red pressure marks from an elastic sleeve, hand gripping the wooden banister.'
          : hasCar
          ? 'First-person POV iPhone photo from the driver seat of an older car parked in a wet Polish retail parking lot: a 64-year-old man weathered hand pressing just below his aching right kneecap above the clutch/brake pedals, raindrops and parked cars outside the windshield.'
          : 'Harsh overhead bathroom mirror/chair iPhone photo: an ordinary 65-year-old Polish person sitting on a plain chair with trouser leg pulled up, showing an unretouched swollen knee with deep red indentation lines left by a bulky hinged brace lying on the floor.',
      },
      {
        label: '3. [SELFIE EKSPERTA] Polski fizjoterapeuta / ortopeda 58 lat w przychodni ze smyczą NFZ (przednia kamera)',
        includeProductRef: false,
        scenePrompt:
          'Awkward close-up front-camera iPhone selfie of a 58-year-old Polish orthopedic doctor/physiotherapist in navy medical scrubs wearing a clinic badge lanyard ("PORADNIA ORTOPEDYCZNA") and slightly crooked glasses, cold 4000K hospital corridor fluorescent tubes and blown-out window blinds behind his head, unposed serious expression.',
      },
      {
        label: '4. [GABINET] Fizjoterapeuta w białym kitlu z modelem stawu kolanowego w gabinecie',
        includeProductRef: false,
        scenePrompt:
          'Candid high-angle handheld iPhone snapshot in a modest Polish physiotherapy clinic: a 55-year-old male specialist in an open white lab coat over a dark shirt holding a plastic anatomical knee-joint skeleton model and pointing a pen directly at the patellar tendon 2 fingers below the kneecap, desk and examination couch behind.',
      },
      {
        label: '5. [SCROLL-STOPPER KOSZ] Wyrzucanie rozciągniętych opasek z apteki i tubek maści do kosza w kuchni',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone snapshot with slightly overexposed auto-exposure looking straight into an open plastic kitchen pedal bin with a white trash bag: an older weathered hand tossing stretched beige pharmacy knee sleeves, squeezed pain-gel tubes, and empty silver pill blisters into the garbage.',
      },
      {
        label: '6. [CIEKAWOSTKA WTF] Wielka sztywna orteza zegarowa wisząca na gwoździu obok kluczy',
        includeProductRef: false,
        scenePrompt:
          'Candid slightly crooked iPhone snapshot with direct flash in a cluttered Polish garage/hallway: a massive, heavy metal-hinged orthopedic knee brace hanging uselessly on a rusty wall hook next to dusty paver knee pads and garden tools, raw amateur framing.',
      },
      {
        label: '7. [MONITOR PRZYCHODNI] Zdjęcie ekranu monitora u ortopedy z RTG zwężonej szpary kolana',
        includeProductRef: false,
        scenePrompt:
          'Slightly angled handheld iPhone photo inside a dim Polish orthopedic office showing a desktop LCD monitor with a monochrome lateral and AP knee X-ray narrowed joint space while a doctor hand points a pen tip just below the kneecap on screen, keyboard and stamped papers on desk.',
      },
      {
        label: '8. [KARTKA W AUCIE] Pomięte skierowanie na NFZ trzymane w aucie pod przychodnią',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo inside a parked car outside a grey Polish clinic building: an older hand holding a creased white Polish referral printout ("SKIEROWANIE DO PORADNI ORTOPEDYCZNEJ") alongside a small torn slip of paper with rushed doctor handwriting reading "pasek podrzepkowy SARDIAN", wet asphalt visible through windshield.',
      },
      {
        label: '9. [BAŁAGAN PRÓB] Blat kuchenny zawalony puszkami kolagenu, końską maścią i blistrami',
        includeProductRef: false,
        scenePrompt:
          'Eye-level candid iPhone snapshot of a cluttered Polish kitchen counter next to an electric kettle and tea mug stain: opened tubs of joint collagen powder, green horse ointment jar, squeezed diclofenac gel tubes, and popped silver painkiller blisters in harsh uneven kitchen bulb light.',
      },
      {
        label: '10. [SCENA Z HISTORII] Dwaj seniorzy 65-72 lata przy drewnianym stole na działce ROD / w kuchni',
        includeProductRef: false,
        scenePrompt:
          'Candid amateur iPhone photo with bright blown-out window/garden light in a Polish allotment gazebo (altanka ROD) or modest kitchen: a 68-year-old Polish man in a zip fleece rolling up his trouser leg slightly while talking across a wooden table with two glasses of tea in metal holders.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Zadowolony 67-latek stojący o własnych siłach przy schodach w słońcu',
        includeProductRef: false,
        scenePrompt:
          'Slightly overexposed sunlit iPhone photo taken by a spouse in a Polish backyard/stairwell: an ordinary 67-year-old Polish person in casual everyday clothes standing naturally with a relieved, genuine smile next to garden pots or stairs, harsh natural daylight, zero studio look.',
      },
      {
        label: '12. [PRODUKT W RUCHU] Zbliżenie na podwiniętą nogawkę 66-latka w domu z wąskim czarnym paskiem 2 palce pod rzepką',
        includeProductRef: true,
        scenePrompt:
          'Unstaged handheld iPhone snapshot in a lived-in Polish living room with warm ceiling bulb and patterned rug in background: an ordinary 66-year-old Polish person sitting on a chair with one trouser leg rolled up above the knee, wearing a narrow matte-black patellar strap fastened 2 fingers below the kneecap (strictly zero logos or text on strap).',
      },
    ];
  }

  if (targetCount <= 12) return baseTwelve;

  const extraThree: NativeIphoneSceneSpec[] =
    resolvedMarket === 'uk'
      ? [
          {
            label: '13. [NHS SELFIE #2] Female NHS nurse / physio 52yo selfie in bright clinic corridor',
            includeProductRef: false,
            scenePrompt:
              'Awkward arm-length front-camera iPhone selfie of an ordinary 52-year-old British female NHS specialist in dark blue tunic with an NHS lanyard badge, harsh hospital corridor lighting with blown-out window flare behind her head, candid mid-sentence expression.',
          },
          {
            label: '14. [PROTAGONIST SELFIE] 62yo British narrator awkward armchair selfie with blown-out window',
            includeProductRef: false,
            scenePrompt:
              'Unflattering slightly low-angle front-camera iPhone selfie of an ordinary 62-year-old British man in a lived-in armchair with a bright overexposed living-room window behind his head, reading glasses slightly askew, authentic Facebook comment selfie vibe.',
          },
          {
            label: '15. [NIGHT KITCHEN] Late-night mug of tea and phone glowing on dark UK kitchen counter',
            includeProductRef: false,
            scenePrompt:
              'Dim late-night handheld iPhone snapshot in a quiet British kitchen lit only by cooker-hood bulb: a half-drunk mug of tea, reading glasses, and a smartphone glowing on the worktop.',
          },
        ]
      : [
          {
            label: '13. [SELFIE EKSPERTA #2] Lekarka / fizjoterapeutka 52 lata na korytarzu przychodni NFZ',
            includeProductRef: false,
            scenePrompt:
              'Awkward arm-length front-camera iPhone selfie of an ordinary 52-year-old Polish female clinic specialist in medical scrubs with a badge lanyard, harsh 4000K clinic corridor light and blown-out window flare behind her head, candid unposed expression.',
          },
          {
            label: '14. [SELFIE BOHATERA] 64-letni narrator w fotelu w polskim salonie pod światło okna',
            includeProductRef: false,
            scenePrompt:
              'Unflattering slightly low-angle front-camera iPhone selfie of an ordinary 64-year-old Polish person sitting in an armchair at home with a bright overexposed curtained window behind their head, reading glasses on, authentic Facebook profile/post photo.',
          },
          {
            label: '15. [NOC W KUCHNI] Kubek herbaty, okulary i świecący ekran telefonu w ciemnej kuchni',
            includeProductRef: false,
            scenePrompt:
              'Dim late-night handheld iPhone snapshot in a Polish apartment kitchen lit only by range-hood light: a half-drunk mug of tea, reading glasses, and a smartphone screen glowing on the laminate counter.',
          },
        ];

  // Keep product-in-use at the final index so scenes 1..14 are pure text-to-image
  return [...baseTwelve.slice(0, 11), ...extraThree, { ...baseTwelve[11], label: baseTwelve[11].label.replace(/^12\./, '15.') }];
}

/**
 * Main LLM Visual Scene Director modeled 1:1 on the Loom workflow (`instruction.txt` + `skrypt.txt` -> 12 or 15 x 3:4 Google AI raw iPhone photos).
 */
export async function planNativeIphoneScenesFromScript(params: {
  brand: NativeBrandKind;
  market?: NativeMarketKind;
  angleId?: string;
  primaryText: string;
  headline: string;
  title: string;
  pageName?: string;
  segment?: string;
  instructionText?: string;
  count?: number;
}): Promise<NativeIphoneSceneSpec[]> {
  const resolvedMarket = detectScriptMarket(params.primaryText, params.market || 'auto');
  const targetCount = params.count && params.count >= 15 ? 15 : 12;
  const fallback = buildFallbackTwelveNativeScenes({ ...params, market: resolvedMarket, count: targetCount });

  if (!params.primaryText || params.primaryText.trim().length < 60) {
    return fallback;
  }

  const localeRules =
    resolvedMarket === 'uk'
      ? `MARKET SETTING: UNITED KINGDOM (NHS hospitals, NHS lanyards, GP surgeries, right-hand-drive UK cars, rainy B&Q/Tesco car parks, British semi-detached carpeted stairs, Boots chemist blisters, British English spelling ONLY if any text appears).`
      : `MARKET SETTING: POLAND (NFZ Poradnia clinics, Polish hospital corridors, left-hand-drive cars on rainy Polish parking lots, Polish apartments/stairwells/ROD allotments, Polish text ONLY if any paper/sign appears - ZERO English words).`;

  const extraArchetypesText =
    targetCount === 15
      ? `\n13. [SECOND SPECIALIST / NURSE SELFIE] Second variation of an NHS/NFZ specialist or nurse front-camera selfie in a bright hospital corridor or breakroom with blown-out window light.\n14. [BOOMER NARRATOR SELFIE] Unflattering low-angle front-camera iPhone selfie of the 55-75yo protagonist sitting in their armchair or car with a blown-out window behind their head.\n15. [PRODUCT IN USE] (includeProductRef: true - ONLY scene #15 has includeProductRef: true; scenes 1-14 MUST have includeProductRef: false!) Candid home iPhone snapshot of the product actually worn/used in a lived-in home.`
      : `\n12. [PRODUCT IN USE] (includeProductRef: true - ONLY scene #12 has includeProductRef: true; scenes 1-11 MUST have includeProductRef: false!) Candid home iPhone snapshot of the product actually worn/used in a lived-in home.`;

  const scene12Text =
    targetCount === 15
      ? `12. [TURNING POINT / CURIOSITY #2] Second high-curiosity scene from the middle/climax of THIS script (e.g. late-night kitchen table, awkward couple flash photo, or strange physical object mentioned in the story).`
      : '';

  try {
    const client = brainClient(brainOptions(45_000));
    const systemPrompt = `You are an elite Direct-Response Native Ad Visual Director recreating the exact raw "iPhone / NHS camera-roll" image batch style for Meta native long-form ads (Antki).
${buildBrandDirectorContext(params.brand, resolvedMarket, params.segment, params.instructionText)}
${localeRules}

Read the ENTIRE script (skrypt.txt) carefully and generate EXACTLY ${targetCount} diverse, scroll-stopping raw iPhone photo prompts (in English) tailored to the exact characters, conflicts, props, locations, and mechanisms of THIS specific script:

MANDATORY ${targetCount}-SCENE ARCHETYPE MIX:
1. [HOOK HUMAN] Real 50-75yo protagonist(s) / couple / family caught in the exact emotional conflict of the opening lines (candid framing or harsh direct indoor/night flash; ordinary unretouched people in frame - DO NOT shoot an empty room!).
2. [HOOK SYMPTOM] Unflattering physical struggle / body / symptom shot from the hook (e.g. older person sitting awkwardly on stairs grabbing knee, mirror shot holding tight shirt over belly, red indentations on bare leg, sitting in rainy car park).
3. [SPECIALIST SELFIE] Awkward front-camera iPhone selfie (chin-down or arm-length) of the doctor/physiotherapist/vet/NHS-or-NFZ specialist mentioned in the story (in scrubs/white coat with NHS or NFZ clinic ID lanyard, slightly crooked glasses, cold fluorescent corridor or blown-out window blinds behind head, neutral mid-thought look, zero stock smile).
4. [CLINIC AUTHORITY] Candid workplace snapshot of the specialist holding a plastic anatomical model pointing a pen at the exact structure, or holding a coffee mug in a cluttered clinic stairwell/office.
5. [BIN SCROLL-STOPPER] First-person POV looking into an open kitchen pedal bin with slightly blown-out iPhone exposure while a hand throws the specific failed solutions from THIS script (chemist pill blisters, stretched sleeves, ointment tubes, cheap collars) straight into the rubbish.
6. [WTF CURIOSITY] Bizarre, hyper-specific scroll-stopping curiosity close-up pulled from a concrete detail in THIS script ("what am I looking at?" e.g. torn handwritten note next to wedding ring & car keys, massive rusty hinged brace on garage nail, burnt diffuser wick, slanted ground-down shoe sole).
7. [CLINIC MONITOR] Slightly angled handheld iPhone photo of a clinic computer LCD monitor displaying an X-ray / ultrasound / scan / lab panel in a dim office with a pen pointing at the screen.
8. [NOTE IN CAR / KITCHEN] POV inside a parked car (rainy parking lot through windshield) or at a dark kitchen table next to reading glasses and half-drunk tea mug, holding a creased NHS/NFZ referral or small torn slip where the specialist wrote ONLY the biological mechanism or product name (NEVER write words like "opinie", "reviews", "price", or "cena" on a doctor note!).
9. [FAILED CLUTTER] Eye-level / 45-degree messy bathroom sink or kitchen counter cluttered with the exact failed pills, blisters, gels, tubs, or sprays from the story (NEVER a neat 90-degree graphic flat-lay!).
10. [STORY SCENE] Candid snapshot of the key social or environmental scene from the middle of THIS script (real ordinary people in lived-in setting, garden/allotment, hallway, waiting room, or couple with flash).
11. [EVERYDAY PAYOFF] Unstaged everyday payoff photo of the ordinary 55-75yo protagonist comfortably doing the exact activity they could not do in paragraph 1, in harsh natural daylight or blown-out window light (zero stock model look).
${scene12Text}${extraArchetypesText}

STRICT BANS (VIOLATION RUINS NATIVE FEEL):
- ZERO 90-degree graphic flat-lays with yellow Post-it slogans, clipboards, or ascending pill blister infographics.
- ZERO Before/After split-screen collages or side-by-side comparison grids with dates (Meta policy ban risk!).
- ZERO studio bokeh, ZERO cinematic warm lighting, ZERO stock smiles.
- Explicitly describe imperfect iPhone exposure in each prompt ("blown-out window flare behind head", "harsh direct camera flash", "4000K fluorescent glare", "slightly crooked framing").

Return ONLY valid JSON:
{
  "scenes": [
    {
      "label": "1. [TAG] Short descriptive scene label (max 70 chars)",
      "scenePrompt": "Detailed English raw iPhone scene prompt...",
      "includeProductRef": false
    }
  ]
}`;

    const userContent = [
      `MARKET: ${resolvedMarket.toUpperCase()}`,
      `FANPAGE: ${params.pageName || ''}`,
      `TITLE: ${params.title}`,
      `HEADLINE: ${params.headline}`,
      params.instructionText ? `INSTRUCTION (instruction.txt):\n${params.instructionText.slice(0, 2000)}` : '',
      `FULL SCRIPT (skrypt.txt):\n${params.primaryText.slice(0, 8500)}`,
    ]
      .filter(Boolean)
      .join('\n');

    let raw = '';
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.7,
        max_completion_tokens: 4500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      });
      raw = completion.choices?.[0]?.message?.content?.trim() || '';
    } catch {
      const completionFallback = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        max_completion_tokens: 4500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      });
      raw = completionFallback.choices?.[0]?.message?.content?.trim() || '';
    }

    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned) as { scenes?: NativeIphoneSceneSpec[] };
    if (!Array.isArray(parsed.scenes) || parsed.scenes.length < 8) {
      return fallback;
    }

    const lastIdx = targetCount - 1;
    return Array.from({ length: targetCount }, (_, idx) => {
      const candidate = parsed.scenes?.[idx];
      const fb = fallback[idx];
      const rawLabel = (candidate?.label || fb.label || `${idx + 1}. Native scene`).trim();
      const numberedLabel = /^\d+\./.test(rawLabel) ? rawLabel : `${idx + 1}. ${rawLabel}`;
      return {
        label: numberedLabel,
        scenePrompt: (candidate?.scenePrompt || fb.scenePrompt).trim(),
        includeProductRef: idx === lastIdx ? true : false,
      };
    });
  } catch {
    return fallback;
  }
}
