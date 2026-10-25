import { brainClient, brainOptions } from './account-brain';

export type NativeBrandKind = 'sardian-strap' | 'feliora' | 'orthomax';

export interface NativeIphoneSceneSpec {
  label: string;
  scenePrompt: string;
  includeProductRef: boolean;
}

/**
 * Wraps a raw scene description with the exact iPhone camera-roll optical physics
 * from the NHS / Native Ads workflow ("iPhone quality + lekkie rozjaśnienie"):
 * - 3:4 vertical smartphone sensor framing
 * - Imperfect auto-exposure (blown-out window highlights / harsh 4000K fluorescent / direct flash)
 * - Tiny-sensor deep focus (ZERO DSLR bokeh / ZERO portrait mode blur)
 * - Unretouched ordinary people, awkward boomer framing, lived-in Polish clutter
 */
export function formatRawIphoneKiePrompt(
  scenePrompt: string,
  brand: NativeBrandKind,
  includeProductRef: boolean,
): string {
  const cleaned = scenePrompt.trim();

  let productDirective = '';
  if (brand === 'sardian-strap') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Show a narrow, slim matte-black patellar knee strap with an 8mm contoured pad fastened 2 fingers below the kneecap (strictly ZERO text, ZERO letters, ZERO logos on the black strap; NEVER a full knee sleeve).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place studio product boxes or brand logos in the shot.';
  } else if (brand === 'feliora') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Feliora diffuser (compact spherical white duck-head top with tiny yellow beak and pin-dot eyes screwed directly onto a short round amber glass vial, plugged into a Polish wall socket).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place studio product boxes in the shot.';
  } else {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference bright orange contoured Orthomax StepMax shoe insole (orange breathable mesh top with raised arch support domes) held in hand or inside everyday shoes.'
      : 'NO COMMERCIAL PACKSHOT: Do NOT show commercial product boxes or brand logos.';
  }

  const opticalSignature = [
    'Raw unedited smartphone photo taken on an iPhone 11/12 default Camera app (26mm wide lens, f/1.8 tiny mobile sensor, EVERYTHING in foreground and background in sharp focus - strictly ZERO DSLR bokeh, ZERO portrait-mode blur).',
    'Imperfect automatic phone exposure with slightly blown-out bright highlights (overexposed window light, harsh 4000K ceiling fluorescent glare, or direct on-camera flash), subtle greasy phone-lens halation, mixed uneven indoor color temperature, visible mobile sensor grain.',
    'Awkward casual boomer composition (slightly crooked horizon, off-center framing, real lived-in Polish apartment/clinic/parking background clutter).',
    'Any person in frame must look 100% like an ordinary unretouched Polish person (natural skin redness, pores, glasses reflection, ordinary everyday clothes, neutral candid or mid-thought expression - NEVER stock-photo models, NEVER symmetrical studio lighting, NEVER cinematic warm grading, NEVER split-screen Before/After collages, Polish text ONLY if any paper/sign appears, NEVER English words).',
  ].join(' ');

  return `${cleaned} ${productDirective} ${opticalSignature}`.trim();
}

function buildBrandDirectorContext(brand: NativeBrandKind, segment?: string): string {
  if (brand === 'sardian-strap') {
    return `BRAND & AUDIENCE: SARDIAN Opaska Podrzepkowa (narrow matte-black patellar tendon strap worn 2 fingers below the kneecap, zero text/logos on strap). Target: Polish men and women aged 55-78 with mechanical knee pain on stairs, clutch, garden, bathtub, dancing, NFZ orthopedic queues.`;
  }
  if (brand === 'feliora') {
    return `BRAND & AUDIENCE: Dyfuzor feromonowy Feliora (spherical white duck-head plug-in diffuser on amber glass vial, M.A.P. + F3 cat pheromones). Target: Polish cat owners dealing with peeing on duvet/sofa, 3 AM yowling, FIC bladder stress, multi-cat fights behind doorway mesh, vet visits.`;
  }
  return `BRAND & AUDIENCE: Wkładki ortopedyczne Orthomax StepMax (bright orange contoured insoles). Segment: ${
    segment === 'dzieci'
      ? 'Polish mothers of children aged 4-12 (valgus ankles, flat feet, worn inner shoe heels, PE pain)'
      : 'Polish adults/seniors aged 45-70 (bunions, heel spurs, collapsed arches, knee/hip/back compensation, hospital/retail shifts)'
  }.`;
}

/**
 * Deterministic, script-aware 12-scene fallback when AI Brain is unavailable or times out.
 * Parses actual details from `skrypt.txt` (`primaryText`) and covers all 6 Loom native archetypes
 * with ZERO fake Noom Post-it/clipboard graphics and ZERO Meta-bannable Before/After collages.
 */
export function buildFallbackTwelveNativeScenes(params: {
  brand: NativeBrandKind;
  angleId?: string;
  primaryText: string;
  headline: string;
  title: string;
  segment?: string;
}): NativeIphoneSceneSpec[] {
  const { brand, primaryText, headline, title, segment } = params;
  const full = `${title}\n${headline}\n${primaryText}`;
  const lower = full.toLowerCase();

  if (brand === 'feliora') {
    const hasMesh = /siatk|dokocen|dwa kot|walcz|izolac/i.test(lower);
    const hasFic = /fic|kuwet|pęcherz|łysy brzuch|wyliz/i.test(lower);
    return [
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
          : 'Candid iPhone snapshot in an ordinary Polish living room with an overexposed window behind the sofa: a grey fabric couch awkwardly draped in cheap translucent painter’s plastic foil weighed down with books, a bottle of 10% spirit vinegar and paper towels on the laminate floor.',
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
          'First-person POV iPhone photo with slightly blown-out auto-exposure looking down into an open plastic kitchen pedal trash bin with a white liner: a woman’s hand dropping a cut-up purple lavender calming cat collar, an empty pheromone spray bottle, and a burnt-wick cheap plug-in diffuser straight into the household garbage.',
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
          'Slightly angled handheld iPhone snapshot of a dusty clinic LCD monitor on a Polish vet’s desk showing a monochrome bladder ultrasound scan next to a Polish lab window reading "OSAD MOCZU - BAKTERIE: BRAK", keyboard and coffee mug ring in foreground.',
      },
      {
        label: '8. [KARTKA W AUCIE] Pomięty wypis z lecznicy i karteczka trzymana w aucie pod blokiem',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo inside a parked car on a grey rainy Polish housing estate parking lot: a woman’s hand holding a creased veterinary visit sheet and a small torn notepad page with rushed doctor handwriting reading "dyfuzor Feliora (M.A.P. + F3)", steering wheel and wet windshield behind.',
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
  }

  if (brand === 'orthomax') {
    const isDzieci = segment === 'dzieci' || /dziec|syn|córk|szkoł|wf|przedszkol/i.test(lower);
    return [
      {
        label: isDzieci
          ? '1. [HOOK LUDZKI] Dziecko siedzące na schodach w szatni trzymające się za piętę i kostkę'
          : '1. [HOOK LUDZKI] Kobieta 58 lat na urodzinach pod stołem ze zdjętymi ciasnymi czółenkami (flesz)',
        includeProductRef: false,
        scenePrompt: isDzieci
          ? 'Candid handheld iPhone photo under harsh school corridor fluorescent tubes: a 9-year-old Polish boy in gym shorts sitting on terrazzo steps holding his aching bare heel after taking off his indoor PE sneakers, mother’s bag at the edge of frame.'
          : 'Candid indoor iPhone snapshot with harsh direct flash at a Polish family dinner: a 58-year-old Polish woman sitting at a white-tablecloth table secretly resting her swollen, reddened bare feet on the floor beside her kicked-off tight black leather dress shoes.',
      },
      {
        label: isDzieci
          ? '2. [HOOK DOWÓD] Koślawe kostki dziecka uciekające do środka na panelach w pokoju'
          : '2. [HOOK DOWÓD] Spuchnięta stopa i zapadnięty łuk w lustrze / na kafelkach łazienki',
        includeProductRef: false,
        scenePrompt: isDzieci
          ? 'Floor-level unretouched iPhone photo in a lived-in Polish room with blown-out window light at the edge: a 9-year-old child standing barefoot on laminate panels seen from behind, both ankles visibly rolling inward (valgus tilt) next to school backpack clutter.'
          : 'Harsh overhead bathroom iPhone POV photo looking down at beige floor tiles: a 56-year-old Polish woman’s bare feet flattening inward with a reddened bunion and deep strap indentations after a long shift.',
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
        label: '7. [DIAGNOSTYKA] Bose stopy na podświetlanym zielonym podoskopie / monitorze w gabinecie',
        includeProductRef: false,
        scenePrompt:
          'Slightly tilted handheld iPhone photo in a dim Polish orthopedic room: bare feet standing on a glowing green glass podoscope mirror showing completely flat footprints, clinic desk and computer monitor visible behind.',
      },
      {
        label: '8. [KARTKA W AUCIE] Pomięte skierowanie na NFZ i karteczka od fizjoterapeuty w zaparkowanym aucie',
        includeProductRef: false,
        scenePrompt:
          'First-person POV iPhone photo from the driver’s seat of a parked car outside a Polish clinic on an overcast day: a hand holding a folded Polish referral slip ("SKIEROWANIE NA REHABILITACJĘ") and a small torn note reading "wkładki Orthomax StepMax".',
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
        label: '11. [EFEKT CODZIENNY] Swobodny spacer w codziennych butach na polskim chodniku / działce w słońcu',
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
  }

  // Default: SARDIAN Opaska Podrzepkowa ('sardian-strap')
  const isFemaleNarrator = /zrobiłam|poszłam|miałam|męża|córka zarezerwowała|tańczyłam|wannie|toalety|babcia/i.test(lower);
  const hasMarriageOrCouple = /żon|mąż|męża|bratem|dancing|ślub|małżeństw|tato|tata/i.test(lower);
  const hasStairs = /schod|piętro|poręcz|fotel|otodom/i.test(lower);
  const hasCar = /parking|aut|sprzęgł|kierownic/i.test(lower);

  return [
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
        ? 'First-person POV iPhone photo from the driver’s seat of an older car parked in a wet Polish retail parking lot: a 64-year-old man’s weathered hand pressing just below his aching right kneecap above the clutch/brake pedals, raindrops and parked cars outside the windshield.'
        : 'Harsh overhead bathroom mirror/chair iPhone photo: an ordinary 65-year-old Polish person sitting on a plain chair with trouser leg pulled up, showing an unretouched swollen knee with deep red indentation lines left by a bulky hinged brace lying on the floor.',
    },
    {
      label: '3. [SELFIE EKSPERTA] Polski fizjoterapeuta / ortopeda 58 lat w przychodni ze smyczą NFZ (przednia kamera)',
      includeProductRef: false,
      scenePrompt:
        'Awkward close-up front-camera iPhone selfie of a 58-year-old Polish orthopedic doctor/physiotherapist in navy medical scrubs wearing a clinic badge lanyard ("PORADNIA ORTOPEDYCZNA") and slightly crooked glasses, cold 4000K hospital corridor fluorescent tubes and blown-out window blinds behind his head, unposed serious expression.',
    },
    {
      label: '4. [GABINET] Fizjoterapeuta w białym kitlu z kubkiem kawy / modelem stawu kolanowego w gabinecie',
      includeProductRef: false,
      scenePrompt:
        'Candid high-angle handheld iPhone snapshot in a modest Polish physiotherapy clinic: a 55-year-old male specialist in an open white lab coat over a dark shirt holding a plastic anatomical knee-joint skeleton model and pointing a pen directly at the patellar tendon 2 fingers below the kneecap, desk and examination couch behind.',
    },
    {
      label: '5. [SCROLL-STOPPER KOSZ] Wyrzucanie rozciągniętych opasek z apteki i tubek maści do kosza w kuchni',
      includeProductRef: false,
      scenePrompt:
        'First-person POV iPhone snapshot with slightly overexposed auto-exposure ("rozjaśnienie") looking straight into an open plastic kitchen pedal bin with a white trash bag: an older weathered hand tossing stretched beige pharmacy knee sleeves, squeezed pain-gel tubes, and empty silver pill blisters into the garbage.',
    },
    {
      label: '6. [CIEKAWOSTKA WTF] Wielka sztywna orteza zegarowa za 1600 zł wisząca na gwoździu / rzucona obok kluczy',
      includeProductRef: false,
      scenePrompt:
        'Candid slightly crooked iPhone snapshot with direct flash in a cluttered Polish garage/hallway: a massive, heavy metal-hinged orthopedic knee brace hanging uselessly on a rusty wall hook next to dusty paver knee pads and garden tools, raw amateur framing.',
    },
    {
      label: '7. [MONITOR PRZYCHODNI] Zdjęcie ekranu monitora u ortopedy z RTG zwężonej szpary kolana',
      includeProductRef: false,
      scenePrompt:
        'Slightly angled handheld iPhone photo inside a dim Polish orthopedic office showing a desktop LCD monitor with a monochrome lateral and AP knee X-ray ("koń o kość" narrowed joint space) while a doctor’s hand points a pen tip just below the kneecap on screen, keyboard and stamped papers on desk.',
    },
    {
      label: '8. [KARTKA W AUCIE] Pomięte skierowanie na NFZ (kolejka za 14 mies.) trzymane w aucie pod przychodnią',
      includeProductRef: false,
      scenePrompt:
        'First-person POV iPhone photo inside a parked car outside a grey Polish clinic building: an older hand holding a creased white Polish referral printout ("SKIEROWANIE DO PORADNI ORTOPEDYCZNEJ") alongside a small torn slip of paper with rushed doctor handwriting reading "pasek podrzepkowy SARDIAN", wet asphalt visible through windshield.',
    },
    {
      label: '9. [BAŁAGAN PRÓB] Umywalka / blat kuchenny zawalony puszkami kolagenu, końską maścią i blistrami',
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
      label: '11. [EFEKT CODZIENNY] Zadowolony 67-latek stojący o własnych siłach przy schodach / w ogrodzie w słońcu',
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

/**
 * Main LLM Visual Scene Director modeled 1:1 on the Loom workflow (`instruction.txt` + `skrypt.txt` -> 12x 3:4 Google AI raw iPhone photos).
 */
export async function planNativeIphoneScenesFromScript(params: {
  brand: NativeBrandKind;
  angleId?: string;
  primaryText: string;
  headline: string;
  title: string;
  pageName?: string;
  segment?: string;
}): Promise<NativeIphoneSceneSpec[]> {
  const fallback = buildFallbackTwelveNativeScenes(params);
  if (!params.primaryText || params.primaryText.trim().length < 80) {
    return fallback;
  }

  try {
    const client = brainClient(brainOptions(45_000));
    const systemPrompt = `You are an elite Direct-Response Native Ad Visual Director recreating the exact raw "iPhone / NHS camera-roll" image batch style for Meta native long-form ads (Antki).
${buildBrandDirectorContext(params.brand, params.segment)}

Read the ENTIRE Polish script (skrypt.txt) carefully and generate EXACTLY 12 diverse, scroll-stopping raw iPhone photo prompts (in English) tailored to the exact characters, conflicts, props, locations, and mechanisms of THIS specific script:

MANDATORY 12-SCENE ARCHETYPE MIX:
1. [HOOK LUDZKI] Real 50-75yo Polish protagonist(s) / couple / family caught in the exact emotional conflict of the opening lines (candid framing or harsh direct indoor/night flash; ordinary unretouched people in Frame - DO NOT shoot an empty room!).
2. [HOOK DOWÓD] Unflattering physical struggle / body / symptom shot from the hook (e.g. older person sitting awkwardly on stairs grabbing knee, red indentations on bare leg, standing on scale/tiles, gripping stall latch or car door).
3. [SELFIE EKSPERTA / NARRATORA] Awkward front-camera iPhone selfie (chin-down or arm's-length) of either the Polish doctor/physiotherapist/vet mentioned in the story (in scrubs/white coat with clinic ID lanyard, slightly crooked glasses, cold fluorescent corridor or blown-out window blinds behind head, neutral mid-thought look) OR the 58-75yo narrator in ordinary home clothes with blown-out window behind head.
4. [GABINET / AUTORYTET] Candid workplace snapshot of the specialist holding a plastic anatomical model (knee/foot/cat) pointing a pen at the exact structure, or holding a coffee mug in a cluttered Polish clinic stairwell/office.
5. [SCROLL-STOPPER KOSZ] First-person POV looking into an open kitchen pedal trash bin with slightly blown-out iPhone exposure while a hand throws the specific failed solutions from THIS script (stretched pharmacy sleeves, ointment tubes, pill blisters, lavender collar) straight into the garbage.
6. [CIEKAWOSTKA WTF] Bizarre, hyper-specific scroll-stopping curiosity close-up pulled from a concrete detail in THIS script ("what am I looking at?" e.g. torn handwritten note next to wedding ring & car keys, massive rusty hinged brace on garage nail, burnt diffuser wick, slanted ground-down shoe sole).
7. [MONITOR / DIAGNOSTYKA] Slightly angled handheld iPhone photo of a Polish clinic computer monitor displaying an X-ray / ultrasound / podoscope scan in a dim office with a pen pointing at the screen.
8. [KARTKA W AUCIE / KUCHNI] POV inside a parked car (rainy Polish parking lot through windshield) or at a dark kitchen table next to reading glasses and half-drunk tea mug, holding a creased Polish NFZ referral or small torn slip where the specialist wrote ONLY the mechanism or product name (NEVER write words like "opinie", "cena", or "recenzje" on a doctor's note!).
9. [BAŁAGAN PRÓB] Eye-level / 45-degree messy bathroom sink or kitchen counter cluttered with the exact failed pills, blisters, gels, tubs, or sprays from the story (NEVER a neat 90-degree graphic flat-lay!).
10. [SCENA Z HISTORII] Candid snapshot of the key turning-point social or environmental scene from the middle of THIS script (real people in lived-in Polish setting, ROD allotment, hallway, waiting room, or couple with flash).
11. [EFEKT CODZIENNY] Unstaged everyday payoff photo of the ordinary 55-75yo Polish protagonist comfortably doing the exact activity they couldn't do in paragraph 1, in harsh natural daylight or blown-out window light (zero stock model look).
12. [PRODUKT W RUCHU] (includeProductRef: true - ONLY scene #12 has includeProductRef: true; scenes 1-11 MUST have includeProductRef: false!) Candid home iPhone snapshot of the product actually worn/used in a lived-in Polish room.

STRICT BANS (VIOLATION RUINS NATIVE FEEL):
- ZERO 90-degree graphic flat-lays with yellow Post-it slogans, clipboards ("TEST 60 SEKUND"), or ascending pill blister infographics.
- ZERO Before/After split-screen collages or side-by-side comparison grids (Meta policy ban risk!).
- ZERO studio bokeh, ZERO cinematic warm lighting, ZERO stock smiles, ZERO English text on any paper/screen (strictly Polish only).
- Describe imperfect iPhone exposure ("blown-out window behind head", "harsh direct camera flash", "4000K fluorescent glare", "slightly crooked framing").

Return ONLY valid JSON:
{
  "scenes": [
    {
      "label": "1. [TAG] Krótki polski opis sceny (max 70 znaków)",
      "scenePrompt": "Detailed English raw iPhone scene prompt...",
      "includeProductRef": false
    }
  ]
}`;

    const userContent = [
      `FANPAGE: ${params.pageName || ''}`,
      `TYTUŁ KĄTA: ${params.title}`,
      `NAGŁÓWEK: ${params.headline}`,
      `PEŁNY SKRYPT (skrypt.txt):\n${params.primaryText.slice(0, 7500)}`,
    ].join('\n');

    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.7,
      max_completion_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned) as { scenes?: NativeIphoneSceneSpec[] };
    if (!Array.isArray(parsed.scenes) || parsed.scenes.length < 8) {
      return fallback;
    }

    return Array.from({ length: 12 }, (_, idx) => {
      const candidate = parsed.scenes?.[idx];
      const fb = fallback[idx];
      const rawLabel = (candidate?.label || fb.label || `${idx + 1}. Scena natywna`).trim();
      const numberedLabel = /^\d+\./.test(rawLabel) ? rawLabel : `${idx + 1}. ${rawLabel}`;
      return {
        label: numberedLabel,
        scenePrompt: (candidate?.scenePrompt || fb.scenePrompt).trim(),
        includeProductRef: idx === 11 ? true : Boolean(candidate?.includeProductRef && idx >= 10),
      };
    });
  } catch {
    return fallback;
  }
}
