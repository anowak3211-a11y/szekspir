import { brainClient, brainOptions } from './account-brain';

export type NativeBrandKind = 'sardian-strap' | 'feliora' | 'feliora-dog' | 'orthomax' | 'mellow-uk' | 'custom';
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
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|\b(że|się|nie|przez|lekarz|kolan|zł)\b/.test(sample)) {
    return 'pl';
  }
  return 'uk';
}

/**
 * Strips accidental "NFZ" / "Poradnia NFZ" tokens from scene descriptions so the image generator
 * never hallucinates clinic plaques, taped wall papers, or sticky notes onto homes, windows, or salons.
 */
function stripClinicSignTokens(rawScenePrompt: string, market: 'pl' | 'uk'): string {
  let out = rawScenePrompt.trim();
  if (market === 'pl') {
    out = out
      .replace(/\bPoradni[a-ząćęłńóśźż]*\s+NFZ\b/gi, 'gabinet')
      .replace(/\bNFZ\s+Poradni[a-ząćęłńóśźż]*\b/gi, 'gabinet')
      .replace(/\bskierowani[eua]\s+(?:na\s+|do\s+)?NFZ\b/gi, 'mała karteczka z zeszytu')
      .replace(/\bNFZ\s+referral(?:\s+note|\s+slip)?\b/gi, 'small torn notebook slip')
      .replace(/\bwith\s+(?:an?\s+)?NFZ(?:\s+or\s+NHS)?\s+(?:clinic\s+)?(?:ID\s+)?lanyard\b/gi, 'with a plain blank badge clip')
      .replace(/\bNFZ\b/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  return out;
}

/**
 * Wraps a raw scene description with pure iPhone camera-roll optical physics ONLY:
 * - 3:4 vertical smartphone sensor framing (2K 1792x2400)
 * - Imperfect auto-exposure (blown-out window highlights / harsh 4000K indoor light / direct flash)
 * - Tiny-sensor deep focus (ZERO DSLR bokeh / ZERO portrait mode blur)
 * - ZERO location/clinic/sign/scrubs/weather words in the wrapper so nothing bleeds across scenes!
 */
export function formatRawIphoneKiePrompt(
  scenePrompt: string,
  brand: NativeBrandKind,
  includeProductRef: boolean,
  market: 'pl' | 'uk' = 'pl',
  customProductInstruction = '',
): string {
  const cleaned = stripClinicSignTokens(scenePrompt, market);

  let productDirective = '';
  if (brand === 'sardian-strap') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Show a narrow, slim matte-black patellar knee strap with an 8mm contoured pad fastened 2 fingers below the kneecap (strictly ZERO text, ZERO letters, ZERO logos on the black strap; NEVER a full knee sleeve).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place studio product boxes or brand logos in the shot.';
  } else if (brand === 'feliora') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Feliora diffuser (compact spherical white duck-head top with tiny yellow beak and pin-dot eyes screwed directly onto a short round amber glass vial, plugged into a wall socket).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place studio product boxes in the shot.';
  } else if (brand === 'feliora-dog') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Feliora Dog diffuser (compact spherical matte-white duck-head top with a small orange-yellow beak screwed upright onto a short round clear-greenish 48 mL glass vial with a sage-green label, plugged vertically into a Polish Type-E wall socket - strictly ZERO cats anywhere in frame).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place commercial studio product boxes in the shot, and strictly ZERO cats anywhere in frame.';
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
      ? 'Awkward casual amateur composition (slightly crooked horizon, off-center framing, authentic everyday British surroundings matching ONLY the described scene, plain unadorned walls, doors, and windows free of random notes or flyers). Any person in frame must look 100% like an ordinary unretouched British person (natural skin texture, pores, slight redness, glasses reflection, ordinary everyday clothing matching that exact scene, candid unposed expression - NEVER stock-photo models, NEVER symmetrical studio lighting, NEVER cinematic warm grading, NEVER split-screen Before/After collages).'
      : 'Awkward casual amateur composition (slightly crooked horizon, off-center framing, authentic everyday Polish surroundings matching ONLY the described scene, plain unadorned walls, doors, mirrors, and windows completely free of random notes, flyers, or plaques). Any person in frame must look 100% like an ordinary unretouched Polish person (natural skin texture, pores, slight redness, glasses reflection, ordinary everyday clothing matching that exact scene, candid unposed expression - NEVER stock-photo models, NEVER symmetrical studio lighting, NEVER cinematic warm grading, NEVER split-screen Before/After collages).';

  const opticalSignature = [
    'Raw unedited smartphone photo taken on an iPhone 11/12 default Camera app (26mm wide lens, f/1.8 tiny mobile sensor, EVERYTHING in foreground and background in sharp focus - strictly ZERO DSLR bokeh, ZERO portrait-mode blur).',
    'Imperfect automatic phone exposure with slightly blown-out bright highlights (overexposed window light flare, uneven indoor bulb glare, or direct on-camera flash), subtle greasy phone-lens halation, mixed natural color temperature, visible mobile sensor grain.',
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
    return `BRAND & AUDIENCE: SARDIAN Opaska Podrzepkowa (narrow matte-black patellar tendon strap worn 2 fingers below the kneecap, zero text/logos on strap). Target: Polish men and women aged 55-78 with mechanical knee pain in everyday life (stairs, car pedals, garden/ROD allotment, bathtub, dancing, shopping, walking).${extra}`;
  }
  if (brand === 'feliora') {
    return `BRAND & AUDIENCE: Dyfuzor feromonowy Feliora dla Kotów (spherical white duck-head plug-in diffuser on amber glass vial, M.A.P. + F3 cat pheromones). Target: Polish cat owners dealing with peeing on duvet/sofa, night yowling, FIC bladder stress, multi-cat tension at home.${extra}`;
  }
  if (brand === 'feliora-dog') {
    return `BRAND & AUDIENCE: Dyfuzor feromonowy Feliora dla Psów (spherical matte-white duck-head plug-in diffuser with small orange-yellow beak screwed upright onto a clear-greenish 48 mL glass vial with sage-green label, canine D.A.P. appeasing pheromones - strictly ZERO cats!). Target: Polish dog owners aged 28-58 in Polish block-of-flats apartments and homes dealing with dog separation anxiety, howling for 8 hours by the front door, scratched MDF doors and torn rubber doorframe seals, chewed sofas, live home-camera panic, rescue dog trauma, and fireworks/thunderstorm phobia.${extra}`;
  }
  if (brand === 'orthomax') {
    return `BRAND & AUDIENCE: Wkładki ortopedyczne Orthomax StepMax (bright orange contoured insoles). Segment: ${
      segment === 'dzieci'
        ? 'Polish mothers of children aged 4-12 (valgus ankles, flat feet, worn inner shoe heels, PE pain)'
        : 'Polish adults/seniors aged 45-70 (bunions, heel spurs, collapsed arches, knee/hip/back compensation, long shifts on feet)'
    }.${extra}`;
  }
  if (brand === 'mellow-uk') {
    return `BRAND & AUDIENCE: Mellow Mood Munchies UK (matte light sky-blue stand-up pouch with berry-red 5-petal flower saffron gummies for calm, focus & emotional balance). Target: British parents (school runs, meltdowns, kitchen routine) or UK adults.${extra}`;
  }
  return `MARKET & AUDIENCE: ${
    market === 'uk'
      ? 'United Kingdom (ordinary British homes, kitchens, stairs, gardens, workplaces, right-hand-drive UK cars)'
      : 'Poland (ordinary Polish apartments, houses, stairwells, kitchens, gardens/ROD allotments, workplaces, left-hand-drive cars)'
  }. Infer the exact product, target demographic, symptoms, and real locations directly from skrypt.txt and instruction.txt.${extra}`;
}

/**
 * Deterministic, script-aware 12-to-15 scene fallback when AI Brain is unavailable or times out.
 * Zero wall/window sign pollution and zero Meta-bannable Before/After collages.
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
        label: '3. [SELFIE EKSPERTA] Polski weterynarz w granatowym fartuchu (przednia kamera)',
        includeProductRef: false,
        scenePrompt:
          'Awkward close-up front-camera iPhone selfie of a tired 52-year-old Polish veterinarian in plain navy medical scrubs with a blank badge clip and slightly crooked glasses, standing in a brightly lit corridor with a slightly blown-out window behind his shoulder, neutral unposed expression mid-thought, plain wall without signs.',
      },
      {
        label: '4. [MECHANIZM] Weterynarz wskazujący długopisem narząd VNO na modelu głowy kota',
        includeProductRef: false,
        scenePrompt:
          'Candid handheld iPhone photo inside a modest veterinary consultation room: a vet in a slightly rumpled white coat holding a plastic anatomical cat head model over a stainless-steel exam table, pointing a blue pen near the nasal palate, plain shelves behind.',
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
        label: '7. [EKRAN USG] Zdjęcie ekranu u weterynarza z obrazem USG pęcherza',
        includeProductRef: false,
        scenePrompt:
          'Slightly angled handheld iPhone snapshot of a dusty LCD monitor on a vet desk showing a monochrome cat bladder ultrasound scan, keyboard and coffee mug ring in foreground.',
      },
      {
        label: '8. [KARTKA NA STOLE] Mała karteczka od weterynarza obok okularów i kubka herbaty',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo at a scratched Polish kitchen table under warm evening light: reading glasses, car keys, and a small torn notebook slip with rushed handwriting reading "dyfuzor Feliora (M.A.P. + F3)".',
      },
      {
        label: '9. [BAŁAGAN PRÓB] Pralka upchana zasikaną kołdrą, ocet i 4 nieskuteczne preparaty w łazience',
        includeProductRef: false,
        scenePrompt:
          'Eye-level candid iPhone snapshot in a cramped Polish apartment bathroom under harsh mirror light: an open front-load washing machine stuffed with a heavy white duvet, surrounded on the floor and machine top by spirit vinegar, enzymatic urine spray, calming paste tubes, and an open plastic pet carrier.',
      },
      {
        label: '10. [EMOCJE W DOMU] Zmęczony mąż w nocy w kuchni przy czajniku (bezpośredni flesz)',
        includeProductRef: false,
        scenePrompt:
          'Candid night-time iPhone snapshot with harsh direct camera flash in a small Polish kitchen: a tired 45-year-old husband in sweatpants rubbing his forehead by the kettle while holding a cat-scratched laptop bag, unposed real family tension.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Kot śpiący brzuchem do góry na czystej kanapie bez folii w słońcu z okna',
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
  } else if (brand === 'feliora-dog') {
    const hasFireworks = /petard|burz|fajerwerk|pralk|sylwestr/i.test(lower);
    const hasKennel = /klatk|kennel|pręt/i.test(lower);
    baseTwelve = [
      {
        label: hasFireworks
          ? '1. [HOOK LUDZKI] Przerażony pies wciśnięty za pralkę w łazience i zmartwiony opiekun (flesz)'
          : '1. [HOOK LUDZKI] Opiekunka w płaszczu pod drzwiami mieszkania z wydrapaną futryną i psem',
        includeProductRef: false,
        scenePrompt: hasFireworks
          ? 'Harsh night-time iPhone flash snapshot in a cramped Polish apartment bathroom: a trembling medium-large mixed-breed dog wedged tightly into the narrow gap between a washing machine and tiled wall panting with wide eyes, while a worried 42-year-old Polish owner kneels beside it in sweatpants.'
          : 'Candid handheld iPhone photo in a narrow Polish block-of-flats hallway under harsh ceiling bulb glare: a stressed 36-year-old Polish woman in her work coat standing in the open doorway looking down at deep claw gouges in the MDF door and torn rubber doorframe weatherstripping, while a panting dog sits anxiously on the doormat.',
      },
      {
        label: hasKennel
          ? '2. [HOOK SYTUACJA] Pogięte pręty klatki kennelowej i wciągnięty do środka poszarpany koc'
          : '2. [HOOK SYTUACJA] Wypatroszona gąbka z rogu kanapy na panelach i nietknięty Kong z jedzeniem',
        includeProductRef: false,
        scenePrompt: hasKennel
          ? 'Slightly crooked handheld iPhone snapshot in a Polish living room with blown-out window light: a wire dog crate with bent front metal bars, a shredded fleece blanket pulled inside through the mesh, and a cracked plastic bottom tray.'
          : 'Candid iPhone snapshot in an ordinary Polish apartment living room with overexposed window light behind the couch: torn yellow upholstery foam scattered across laminate flooring next to a chewed sofa corner and a completely untouched red rubber Kong toy stuffed with paste.',
      },
      {
        label: '3. [SELFIE EKSPERTA] Polski lekarz weterynarii 54 lata w granatowym fartuchu (przednia kamera)',
        includeProductRef: false,
        scenePrompt:
          'Awkward close-up front-camera iPhone selfie of a tired 54-year-old Polish male veterinarian in plain navy medical scrubs with a blank badge clip and slightly crooked glasses, standing in a brightly lit corridor with blown-out window blinds behind his shoulder, candid unposed expression, plain wall without signs.',
      },
      {
        label: '4. [MECHANIZM] Weterynarz wskazujący długopisem narząd VNO na modelu anatomicznym głowy psa',
        includeProductRef: false,
        scenePrompt:
          'Candid handheld iPhone photo inside a modest veterinary consultation room: a male vet in a rumpled white coat holding a plastic anatomical canine skull-and-nasal-cavity model over a stainless-steel exam table, pointing a blue pen at the vomeronasal organ above the palate, plain shelves behind.',
      },
      {
        label: '5. [SCROLL-STOPPER KOSZ] Wyrzucanie fioletowej obróżki lawendowej i spalonej wtyczki do kosza',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo with slightly blown-out auto-exposure looking down into an open plastic kitchen pedal bin: a hand dropping a cut-up purple lavender dog collar, an empty herbal calming spray bottle, and a cheap burnt-wick plug-in diffuser straight into household trash.',
      },
      {
        label: '6. [CIEKAWOSTKA WTF] Ekran telefonu w dłoni w aucie z podglądem kamerki na wyjącego pod drzwiami psa',
        includeProductRef: false,
        scenePrompt:
          'Close-up handheld iPhone photo inside a left-hand-drive car stuck in rainy Polish city traffic: a driver hand holding a second smartphone showing a grainy wide-angle home security camera live feed of a medium dog sitting right against the apartment front door with head tilted back howling.',
      },
      {
        label: '7. [DETAL Z HISTORII] Zwęglony, przypalony knot taniego dyfuzora trzymany w palcach nad zlewem',
        includeProductRef: false,
        scenePrompt:
          'Unflattering close-up iPhone snapshot held in an ordinary hand over a kitchen sink under harsh bulb light: a cheap generic plug-in diffuser opened to reveal a sticky blackened burnt wick from overheating.',
      },
      {
        label: '8. [KARTKA NA STOLE] Mała karteczka z zeszytu od weterynarza obok kluczy i kubka herbaty',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo at a scratched Polish kitchen table under warm evening bulb light: house keys, a dog leash, a half-drunk mug of tea, and a small torn notebook slip with natural handwriting reading "feromon kojący D.A.P. - dyfuzor Feliora".',
      },
      {
        label: '9. [BAŁAGAN PRÓB] Kamizelka uciskowa, kapsułki ziołowe, spraye i gryzaki rzucone na komodę',
        includeProductRef: false,
        scenePrompt:
          'Eye-level candid iPhone snapshot of a cluttered Polish hallway dresser next to a dog leash: a crumpled grey Velcro thunder-vest, opened blisters of herbal tryptophan capsules, two calming spray bottles, and untouched chew toys.',
      },
      {
        label: '10. [SCENA Z HISTORII] Wieczorna rozmowa małżeństwa w kuchni nad rozgrzebanym legowiskiem psa',
        includeProductRef: false,
        scenePrompt:
          'Candid night-time iPhone snapshot with harsh direct flash in a small Polish apartment kitchen: a tired 38-year-old Polish man in a t-shirt sitting at the table rubbing his eyes beside a cup of tea while his dog rests its chin nervously on his knee.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Pies śpiący głębokim snem kołami do góry na kanapie bez folii i koców',
        includeProductRef: false,
        scenePrompt:
          'Slightly overexposed daytime iPhone photo in a lived-in Polish living room with bright blown-out window sunlight: a relaxed medium-large mixed-breed dog sleeping deeply on its back belly-up on an uncovered fabric sofa next to a throw pillow, completely peaceful.',
      },
      {
        label: '12. [PRODUKT W RUCHU] Pionowa wtyczka Feliora dla Psów w gniazdku obok spokojnie śpiącego psa',
        includeProductRef: true,
        scenePrompt:
          'Unstaged handheld iPhone photo in a Polish apartment hallway-to-living-room passage under warm bulb light: the Feliora spherical matte-white duck-head diffuser with orange-yellow beak screwed upright onto its clear-greenish 48 mL glass vial plugged vertically into a wall socket above the baseboard, with a calm dog sleeping peacefully on its bed nearby (strictly ZERO cats).',
      },
    ];
  } else if (brand === 'orthomax') {
    const isDzieci = segment === 'dzieci' || /dziec|syn|córk|szkoł|wf|przedszkol/i.test(lower);
    baseTwelve = [
      {
        label: isDzieci
          ? '1. [HOOK LUDZKI] Dziecko siedzące na schodach w szatni trzymające się za piętę i kostkę'
          : '1. [HOOK LUDZKI] Kobieta 58 lat przy rodzinnym stole ze zdjętymi ciasnymi butami (flesz)',
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
        label: '3. [SELFIE EKSPERTA] Polski fizjoterapeuta 56 lat w granatowym stroju (przednia kamera)',
        includeProductRef: false,
        scenePrompt:
          'Awkward chin-down front-camera iPhone selfie of a 56-year-old Polish orthopedic physiotherapist in plain dark blue medical scrubs with a blank badge clip and wire-frame glasses, bright blown-out window blinds behind him, serious unposed expression, plain wall without any signs.',
      },
      {
        label: '4. [MECHANIZM] Fizjoterapeuta z modelem szkieletu stopy i długopisem',
        includeProductRef: false,
        scenePrompt:
          'Candid handheld iPhone snapshot in a modest rehabilitation room: a male physiotherapist holding a plastic anatomical foot-and-ankle skeleton model next to a treatment table, pointing a pen under the collapsed medial arch, plain unadorned background.',
      },
      {
        label: '5. [SCROLL-STOPPER KOSZ] Wyrzucanie żelowych podpiętek z apteki i maści do kosza w kuchni',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo with slightly blown-out exposure looking down into an open plastic kitchen trash bin: a hand tossing flattened pharmacy gel heel pads, stiff grey insoles, and squeezed pain-gel tubes straight into the household garbage.',
      },
      {
        label: '6. [CIEKAWOSTKA WTF] Podeszwa codziennego buta zdarta pod skosem od wewnątrz trzymana w dłoni',
        includeProductRef: false,
        scenePrompt:
          'Close-up handheld iPhone photo in a dim Polish hallway with harsh bulb glare: an older hand holding a worn everyday shoe upside down close to the lens, showing the inner rubber heel edge badly ground down at a sharp angle.',
      },
      {
        label: '7. [PODOSKOP] Bose stopy na podświetlanym zielonym podoskopie',
        includeProductRef: false,
        scenePrompt:
          'Slightly tilted handheld iPhone photo in a dim room: bare feet standing on a glowing green glass podoscope mirror showing completely flat footprints.',
      },
      {
        label: '8. [KARTKA NA STOLE] Mała karteczka od fizjoterapeuty na stole kuchennym obok okularów',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo at a wooden Polish kitchen table: reading glasses, a half-drunk mug of tea, and a small torn notebook slip reading "wkładki Orthomax StepMax".',
      },
      {
        label: '9. [BAŁAGAN PRÓB] Blistry tabletek, plastry i wyciśnięte tubki żelu na umywalce w łazience',
        includeProductRef: false,
        scenePrompt:
          'Eye-level candid iPhone photo of a cluttered Polish bathroom sink next to a toothbrush mug and soap dispenser: popped silver painkiller blisters, squeezed white gel tubes, and peeled warming patches under harsh mirror light.',
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
          ? '1. [HOOK HUMAN] Unposed UK couple 55-64 indoors with harsh iPhone flash'
          : '1. [HOOK HUMAN] Ordinary 58yo British man sitting awkwardly on stairs in discomfort',
        includeProductRef: false,
        scenePrompt: hasMarriage
          ? 'Candid private-album iPhone snapshot taken with harsh direct on-camera flash in a lived-in British semi-detached kitchen/hallway: an ordinary 58-year-old British man in a fleece standing slightly tensely beside his 54-year-old wife, unretouched flash skin shine, kettle and coats behind them.'
          : 'Unstaged handheld iPhone photo in a narrow carpeted British staircase with blown-out landing window light: an ordinary 60-year-old British man in an everyday jumper sitting awkwardly halfway down the stairs looking frustrated and uncomfortable.',
      },
      {
        label: hasBelly
          ? '2. [HOOK SYMPTOM] Unflattering bathroom mirror selfie of 58yo British man holding tight shirt/waist'
          : '2. [HOOK SYMPTOM] POV sitting inside a right-hand-drive UK car gripping steering wheel',
        includeProductRef: false,
        scenePrompt: hasBelly
          ? 'Unflattering handheld iPhone mirror selfie in a cramped British bathroom under harsh ceiling bulb glare: a 58-year-old British man with greying hair pulling a tight polo shirt across a firm protruding midsection, towels and radiator in sharp focus behind.'
          : 'First-person POV iPhone snapshot sitting in the driver seat of an older right-hand-drive UK car in a grey British retail car park: a weathered male hand gripping the steering wheel with raindrops on glass.',
      },
      {
        label: '3. [DOCTOR SELFIE] Awkward front-camera selfie of 56yo British doctor in scrubs',
        includeProductRef: false,
        scenePrompt:
          'Awkward chin-down front-camera iPhone selfie of a 56-year-old British doctor in blue hospital scrubs wearing a lanyard with ID badge and slightly crooked glasses, harsh 4000K corridor fluorescent tubes and blown-out window blinds behind his head, unposed serious expression.',
      },
      {
        label: '4. [AUTHORITY] British specialist in rumpled white coat holding coffee mug on break',
        includeProductRef: false,
        scenePrompt:
          'Candid handheld iPhone photo in a utilitarian British stairwell with fire door: a tired 54-year-old British consultant in scrubs and stethoscope holding a chipped mug during a break, slightly blown-out window flare.',
      },
      {
        label: '5. [BIN SCROLL-STOPPER] Throwing chemist pill blisters and tubs straight into UK kitchen pedal bin',
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
        label: '7. [MONITOR] Angled iPhone photo of desk monitor showing scan / chart values',
        includeProductRef: false,
        scenePrompt:
          'Slightly tilted handheld iPhone snapshot inside a dim consultation room showing an LCD desktop monitor with medical scan / chart values while a pen points at the screen, mug and keyboard in foreground.',
      },
      {
        label: '8. [NOTE ON TABLE] Small torn doctor note next to reading glasses and mug of tea',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo at a lived-in British kitchen worktop: reading glasses, a half-drunk mug of tea, and a small torn slip with rushed handwriting of a biological mechanism only.',
      },
      {
        label: '9. [FAILED CLUTTER] Cluttered UK bathroom sink with chemist blisters and half-empty tubs',
        includeProductRef: false,
        scenePrompt:
          'Eye-level 45-degree candid iPhone snapshot of a small British bathroom sink with separate hot/cold taps: cluttered with half-empty chemist supplement tubs, silver pill blister strips, and a mug with toothbrushes under harsh mirror light.',
      },
      {
        label: '10. [STORY SCENE] Candid British kitchen / garden moment with ordinary 55-68yo people',
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
    // Default PL: SARDIAN Opaska Podrzepkowa ('sardian-strap' or Polish custom) - ZERO NFZ signs anywhere!
    const isFemaleNarrator = /zrobiłam|poszłam|miałam|męża|córka zarezerwowała|tańczyłam|wannie|toalety|babcia/i.test(lower);
    const hasMarriageOrCouple = /żon|mąż|męża|bratem|dancing|ślub|małżeństw|tato|tata/i.test(lower);
    const hasStairs = /schod|piętro|poręcz|fotel|otodom/i.test(lower);
    const hasCar = /parking|aut|sprzęgł|kierownic/i.test(lower);

    baseTwelve = [
      {
        label: hasMarriageOrCouple
          ? '1. [HOOK LUDZKI] Niepozowane zdjęcie pary 55-68 lat w polskim domu (ostry flesz iPhone)'
          : '1. [HOOK LUDZKI] Senior 66 lat siedzący bezradnie na schodach i trzymający się za bolące kolano',
        includeProductRef: false,
        scenePrompt: hasMarriageOrCouple
          ? 'Candid private-album iPhone snapshot taken with harsh direct on-camera flash in a lived-in Polish home hallway/living room: an ordinary 64-year-old Polish man in an everyday polo shirt standing slightly awkwardly beside his 54-year-old blonde wife, unretouched skin shine from flash, coat rack and plain wooden door behind them, real candid family photo.'
          : `Unstaged handheld iPhone photo in a narrow Polish home staircase with slightly blown-out hallway window light: an ordinary ${
              isFemaleNarrator ? '67-year-old Polish woman in house trousers and cardigan' : '66-year-old Polish man in everyday sweater and jeans'
            } sitting awkwardly halfway down wooden stairs, gripping ${
              isFemaleNarrator ? 'her' : 'his'
            } aching right knee with a pained, tired expression, plain unadorned stairwell walls.`,
      },
      {
        label: hasStairs
          ? '2. [HOOK DOWÓD] Odgniecione, spuchnięte kolano na tle stromych schodów w domu'
          : hasCar
          ? '2. [HOOK DOWÓD] Dłoń zaciśnięta na bolącym kolanie na fotelu kierowcy'
          : '2. [HOOK DOWÓD] Odsłonięte kolano 65-latka z czerwonymi pręgami po ciężkiej ortezie z apteki',
        includeProductRef: false,
        scenePrompt: hasStairs
          ? 'First-person POV iPhone snapshot looking down from the top of steep wooden Polish home stairs: one rolled-up trouser leg revealing an older swollen knee with red pressure marks from an elastic sleeve, hand gripping the wooden banister.'
          : hasCar
          ? 'First-person POV iPhone photo from the driver seat of an older car parked outdoors: a 64-year-old man weathered hand pressing just below his aching right kneecap above the clutch/brake pedals.'
          : 'Harsh overhead indoor iPhone photo: an ordinary 65-year-old Polish person sitting on a plain home chair with trouser leg pulled up, showing an unretouched swollen knee with deep red indentation lines left by a bulky hinged brace lying on the floor.',
      },
      {
        label: '3. [SELFIE EKSPERTA] Polski fizjoterapeuta 58 lat w granatowym stroju (przednia kamera)',
        includeProductRef: false,
        scenePrompt:
          'Awkward close-up front-camera iPhone selfie of a 58-year-old Polish orthopedic physiotherapist in plain navy medical scrubs with a blank badge clip and slightly crooked glasses, cold 4000K ceiling light and blown-out window blinds behind his head, unposed serious expression, plain wall with zero signs.',
      },
      {
        label: '4. [MECHANIZM] Fizjoterapeuta z plastikowym modelem stawu kolanowego i długopisem',
        includeProductRef: false,
        scenePrompt:
          'Candid high-angle handheld iPhone snapshot in a modest physiotherapy room: a 55-year-old male specialist in an open white coat over a dark shirt holding a plastic anatomical knee-joint skeleton model and pointing a pen directly at the patellar tendon 2 fingers below the kneecap, plain background.',
      },
      {
        label: '5. [SCROLL-STOPPER KOSZ] Wyrzucanie rozciągniętych opasek z apteki i tubek maści do kosza w kuchni',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone snapshot with slightly overexposed auto-exposure looking straight into an open plastic kitchen pedal bin with a white trash bag: an older weathered hand tossing stretched beige pharmacy knee sleeves, squeezed pain-gel tubes, and empty silver pill blisters into the garbage.',
      },
      {
        label: '6. [CIEKAWOSTKA WTF] Wielka sztywna orteza zegarowa wisząca na gwoździu w garażu / przedpokoju',
        includeProductRef: false,
        scenePrompt:
          'Candid slightly crooked iPhone snapshot with direct flash in a cluttered Polish garage/hallway: a massive, heavy metal-hinged orthopedic knee brace hanging uselessly on a wall hook next to garden tools and everyday shoes, raw amateur framing.',
      },
      {
        label: '7. [TEST 2 PALCÓW] Zbliżenie na dłoń wskazującą punkt 2 palce poniżej rzepki w domowym świetle',
        includeProductRef: false,
        scenePrompt:
          'Candid handheld iPhone close-up in a lived-in Polish living room: an older person sitting on a sofa with one trouser leg rolled up, pressing two fingers horizontally right below the kneecap on the patellar tendon, natural window light.',
      },
      {
        label: '8. [KARTKA NA STOLE] Mała wyrwana karteczka z nazwą paska na stole kuchennym obok okularów',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo at a scratched Polish kitchen table under warm evening bulb light: reading glasses, a half-drunk glass of tea, and a small torn notebook slip with rushed handwriting reading "pasek podrzepkowy SARDIAN".',
      },
      {
        label: '9. [BAŁAGAN PRÓB] Blat kuchenny zawalony puszkami kolagenu, końską maścią i blistrami',
        includeProductRef: false,
        scenePrompt:
          'Eye-level candid iPhone snapshot of a cluttered Polish kitchen counter next to an electric kettle and tea mug stain: opened tubs of joint collagen powder, green horse ointment jar, squeezed gel tubes, and popped silver painkiller blisters in uneven kitchen bulb light.',
      },
      {
        label: '10. [SCENA Z HISTORII] Dwaj seniorzy 65-72 lata przy drewnianym stole na działce ROD / w kuchni',
        includeProductRef: false,
        scenePrompt:
          'Candid amateur iPhone photo with bright blown-out window/garden light in a Polish allotment gazebo (altanka ROD) or modest kitchen: a 68-year-old Polish man in a zip fleece rolling up his trouser leg slightly while talking across a wooden table with two glasses of tea.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Zadowolony 67-latek schodzący swobodnie ze schodów w dziennym świetle',
        includeProductRef: false,
        scenePrompt:
          'Slightly overexposed sunlit iPhone photo taken by a spouse in a Polish home/backyard: an ordinary 67-year-old Polish person in casual everyday clothes walking comfortably down outdoor steps with a relieved, genuine smile, harsh natural daylight, zero studio look.',
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
            label: '13. [SPECIALIST SELFIE #2] Female British physio 52yo selfie in bright corridor',
            includeProductRef: false,
            scenePrompt:
              'Awkward arm-length front-camera iPhone selfie of an ordinary 52-year-old British female physiotherapist in dark blue tunic, bright corridor lighting with blown-out window flare behind her head, candid mid-sentence expression.',
          },
          {
            label: '14. [PROTAGONIST SELFIE] 62yo British narrator awkward armchair selfie with blown-out window',
            includeProductRef: false,
            scenePrompt:
              'Unflattering slightly low-angle front-camera iPhone selfie of an ordinary 62-year-old British man in a lived-in armchair with a bright overexposed living-room window behind his head, reading glasses slightly askew, authentic Facebook selfie vibe.',
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
            label: '13. [SELFIE EKSPERTA #2] Fizjoterapeutka 52 lata w jasnym gabinecie pod światło okna',
            includeProductRef: false,
            scenePrompt:
              'Awkward arm-length front-camera iPhone selfie of an ordinary 52-year-old Polish female physiotherapist in plain medical scrubs with a blank badge clip, bright blown-out window flare behind her head, candid unposed expression, plain wall without signs.',
          },
          {
            label: '14. [SELFIE BOHATERA] 64-letni narrator w fotelu w polskim salonie pod światło okna',
            includeProductRef: false,
            scenePrompt:
              'Unflattering slightly low-angle front-camera iPhone selfie of an ordinary 64-year-old Polish person sitting in an armchair at home with a bright overexposed curtained window behind their head, reading glasses on, authentic Facebook profile photo.',
          },
          {
            label: '15. [NOC W KUCHNI] Kubek herbaty, okulary i świecący ekran telefonu w ciemnej kuchni',
            includeProductRef: false,
            scenePrompt:
              'Dim late-night handheld iPhone snapshot in a Polish apartment kitchen lit only by range-hood light: a half-drunk mug of tea, reading glasses, and a smartphone screen glowing on the laminate counter.',
          },
        ];

  return [...baseTwelve.slice(0, 11), ...extraThree, { ...baseTwelve[11], label: baseTwelve[11].label.replace(/^12\./, '15.') }];
}

/**
 * Main LLM Visual Scene Director modeled on the raw iPhone camera-roll native workflow (`instruction.txt` + `skrypt.txt` -> 12 or 15 x 3:4 Google AI raw iPhone photos).
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
      ? `MARKET SETTING: UNITED KINGDOM (authentic everyday British locations taken strictly from THIS script - e.g. semi-detached houses, carpeted stairs, kitchens, gardens, workplaces, high streets, right-hand-drive UK cars).`
      : `MARKET SETTING: POLAND (authentic everyday Polish locations taken strictly from THIS script - e.g. ordinary Polish apartments, block-of-flats stairwells, houses, kitchens, bathrooms, hair salons, dancing halls, churches, ROD allotments, shops, streets, left-hand-drive cars).`;

  const extraArchetypesText =
    targetCount === 15
      ? `\n13. [SECOND AUTHORITY / FAMILY SELFIE] Second candid front-camera iPhone selfie of a physiotherapist/vet/specialist (plain scrubs, zero wall signs) OR a secondary family character from the story with blown-out window light.\n14. [PROTAGONIST SELFIE] Unflattering low-angle front-camera iPhone selfie of the 55-75yo protagonist sitting in their armchair or car with a blown-out window behind their head.\n15. [PRODUCT IN USE] (includeProductRef: true - ONLY scene #15 has includeProductRef: true; scenes 1-14 MUST have includeProductRef: false!) Candid home iPhone snapshot of the product actually worn/used in a lived-in home.`
      : `\n12. [PRODUCT IN USE] (includeProductRef: true - ONLY scene #12 has includeProductRef: true; scenes 1-11 MUST have includeProductRef: false!) Candid home iPhone snapshot of the product actually worn/used in a lived-in home.`;

  const scene12Text =
    targetCount === 15
      ? `12. [TURNING POINT / CURIOSITY #2] Second high-curiosity scene from the middle/climax of THIS script (e.g. late-night kitchen table, awkward couple flash photo, or concrete object mentioned in the story).`
      : '';

  try {
    const client = brainClient(brainOptions(45_000));
    const isPetBrand = params.brand === 'feliora' || params.brand === 'feliora-dog';
    const hook1Rule =
      params.brand === 'feliora-dog'
        ? '1. [HOOK HUMAN + DOG] Real 28-55yo Polish dog owner(s) AND their dog caught in the exact emotional conflict and EXACT apartment/home location of paragraph 1-3 (e.g. stressed owner in hallway by scratched MDF door, owner in car looking at live pet-cam phone feed, kneeling beside trembling dog behind washing machine; strictly ZERO cats!).'
        : isPetBrand
        ? '1. [HOOK HUMAN + CAT] Real 30-55yo Polish cat owner(s) AND their cat caught in the exact emotional conflict and EXACT home location of paragraph 1-3 (harsh indoor/night flash, ordinary unretouched people).'
        : '1. [HOOK HUMAN] Real 50-75yo protagonist(s) / couple / family caught in the exact emotional conflict and EXACT location of paragraph 1-3 (candid framing or harsh direct indoor/night flash; ordinary unretouched people in frame - DO NOT shoot an empty room!).';
    const hook2Rule =
      params.brand === 'feliora-dog'
        ? '2. [HOOK SYMPTOM / DAMAGE] Unflattering raw iPhone shot of the exact canine anxiety symptom or home damage from the opening of THIS script (e.g. chewed sofa foam & untouched Kong, deep claw gouges on apartment door & torn rubber seal, bent wire crate bars, dog howling by front door, puddle on rug; strictly ZERO cats!).'
        : isPetBrand
        ? '2. [HOOK SYMPTOM] Unflattering raw iPhone shot of the exact cat stress symptom from the opening of THIS script (wet duvet patch, painter foil on sofa, mesh in doorway, litter box strain).'
        : '2. [HOOK SYMPTOM] Unflattering physical struggle / body / symptom shot from the opening of THIS script (e.g. older person sitting awkwardly on stairs grabbing knee, standing in church pew, struggling at bathtub edge, gripping knee in car, mirror shot).';
    const payoff11Rule =
      params.brand === 'feliora-dog'
        ? '11. [EVERYDAY PAYOFF] Unstaged everyday payoff photo of the relaxed dog sleeping deeply belly-up on an uncovered sofa or greeting the smiling Polish owner calmly in harsh natural daylight or indoor bulb light (strictly ZERO cats!).'
        : isPetBrand
        ? '11. [EVERYDAY PAYOFF] Unstaged everyday payoff photo of the relaxed cat sleeping belly-up on a clean uncovered duvet/sofa or calmly sitting on the owner lap.'
        : '11. [EVERYDAY PAYOFF] Unstaged everyday payoff photo of the ordinary 55-75yo protagonist comfortably doing the exact activity they could not do at the start of THIS script (descending stairs, carrying Biedronka groceries, gardening, dancing, walking with grandchild) in harsh natural daylight or indoor bulb light.';

    const systemPrompt = `You are an elite Direct-Response Native Ad Visual Director creating raw, unstaged iPhone camera-roll photo prompts for Meta native long-form ads (Antki).
${buildBrandDirectorContext(params.brand, resolvedMarket, params.segment, params.instructionText)}
${localeRules}

Read the ENTIRE script (skrypt.txt) carefully and generate EXACTLY ${targetCount} diverse, scroll-stopping raw iPhone photo prompts (in English) tailored 100% to the ACTUAL characters, conflicts, props, and locations of THIS specific script:

MANDATORY ${targetCount}-SCENE ARCHETYPE MIX:
${hook1Rule}
${hook2Rule}
3. [EXPERT SELFIE] Awkward front-camera iPhone selfie (chin-down or arm-length) of a 50-62yo physiotherapist, orthopedist, or vet in plain unmarked medical scrubs or white coat with a blank badge clip, slightly crooked glasses, harsh ceiling light or blown-out window blinds behind head, neutral mid-thought expression, plain wall with ZERO signs.
4. [MECHANISM MODEL] Candid snapshot of a specialist in a plain coat pointing a pen at the exact anatomical structure on a plastic skeleton/organ model (e.g. canine/feline VNO above nasal palate, patellar tendon 2 fingers below kneecap, medial foot arch), plain room with ZERO wall signs.
5. [BIN SCROLL-STOPPER] First-person POV looking into an open kitchen pedal bin with slightly blown-out iPhone exposure while a hand throws the specific failed solutions from THIS script (cut lavender collars, herbal sprays, burnt-wick cheap diffusers, stretched pharmacy sleeves, ointment tubes, pill blisters) straight into the rubbish.
6. [WTF CURIOSITY] Bizarre, hyper-specific scroll-stopping curiosity close-up pulled from a concrete object or detail in THIS script ("what am I looking at?" e.g. burnt blackened diffuser wick, phone showing live pet-cam feed in traffic, chewed doorframe weatherstripping, heavy hinged brace hanging on garage nail, ground-down shoe heel).
7. [STORY SCENE A] Candid iPhone snapshot of a key real-life moment or diagnostic detail explicitly described in THIS script (vet consultation room, hallway doorstep, car interior, bathroom, living room).
8. [HANDWRITTEN PRODUCT SLIP] POV at a lived-in home kitchen table next to reading glasses and a half-drunk mug of tea (or on a car seat), showing a small torn notebook slip where ONLY the product name or biological mechanism is scribbled in natural Polish/English (NEVER add clinic headers, referrals, stamps, or words like "opinie"/"cena"/"reviews"/"price"!).
9. [FAILED CLUTTER] Eye-level / 45-degree messy home bathroom sink, hallway dresser, or kitchen counter cluttered with the exact failed items from the story (thunder-vest, herbal tryptophan blisters, sprays, untouched chew toys, gels - NEVER a neat 90-degree graphic flat-lay!).
10. [STORY SCENE B] Candid snapshot of the central social or family scene from the middle of THIS script in its true setting with ordinary everyday clothes.
${payoff11Rule}
${scene12Text}${extraArchetypesText}

STRICT BANS (VIOLATION RUINS THE ENTIRE BATCH):
- ZERO "NFZ" / "PORADNIA" / CLINIC SIGN SPAM: NEVER output the words "NFZ", "Poradnia", "Przychodnia", "Skierowanie", or clinic plaques/signs in ANY scenePrompt! NEVER put sticky notes on windows, NEVER tape paper signs onto apartment walls, doors, stairwells, mirrors, or hair salons! Keep all walls, windows, and doors 100% clean of random signs or text!
- DO NOT force clinics or medical scrubs into scenes 1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15 - keep characters in normal everyday clothes in the real locations of the story!
- ZERO 90-degree graphic flat-lays with yellow Post-it slogans, clipboards, or ascending pill blister infographics.
- ZERO Before/After split-screen collages or side-by-side comparison grids with dates.
- ZERO studio bokeh, ZERO cinematic warm lighting, ZERO stock smiles.
- Explicitly describe imperfect iPhone exposure in each prompt ("blown-out window flare behind head", "harsh direct camera flash", "uneven ceiling bulb glare", "slightly crooked framing").

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
      const rawLabel = stripClinicSignTokens(candidate?.label || fb.label || `${idx + 1}. Native scene`, resolvedMarket);
      const numberedLabel = /^\d+\./.test(rawLabel) ? rawLabel : `${idx + 1}. ${rawLabel}`;
      return {
        label: numberedLabel,
        scenePrompt: stripClinicSignTokens(candidate?.scenePrompt || fb.scenePrompt, resolvedMarket),
        includeProductRef: idx === lastIdx ? true : false,
      };
    });
  } catch {
    return fallback;
  }
}
