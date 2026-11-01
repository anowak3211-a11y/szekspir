import { brainClient, brainOptions } from './account-brain';

export type NativeBrandKind = 'sardian-strap' | 'sardian-shampoo' | 'feliora' | 'feliora-dog' | 'orthomax' | 'mellow-uk' | 'custom';
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
 * Strips accidental "NFZ" / "Poradnia NFZ" clinic-plaque tokens while preserving
 * intentional story notes (such as an angry neighbor's note on an apartment door).
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
 * Wraps a scene description with CLEAN, CRISP, MODERN iPhone 15 everyday photo realism:
 * - Clean, sharp, well-lit natural daylight or balanced warm home lighting (ZERO greasy lens, ZERO ugly flash glare, ZERO grainy blur)
 * - Authentic everyday Polish/UK environment (like a real viral photo on Reddit / Wykop / Facebook groups)
 * - ZERO studio CGI look, ZERO 3D render plastic sheen, ZERO stock-photo fakery
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
      : 'NO COMMERCIAL PACKSHOT: Do NOT place commercial studio product boxes or brand logos in the shot.';
  } else if (brand === 'sardian-shampoo') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference SARDIAN shampoo bottle (tall rectangular matte-black bottle with smooth chamfered edges, matte-black pump dispenser, bold white "SARDIAN" at top, warm copper-gold "SZAMPON" and bold white "AKTYWUJĄCY KORZENIE", and warm-gold bar reading "DLA GĘSTYCH I MOCNYCH WŁOSÓW"). Avoid close-up AI human faces; focus on crisp first-person POV bathroom, shower, barbershop, or trichologist desk scenes.'
      : 'NO COMMERCIAL PACKSHOT: Avoid close-up AI human faces; focus on authentic first-person POV Polish bathroom, shower drain, barbershop station, or trichologist desk scenes.';
  } else if (brand === 'feliora') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Feliora diffuser (compact spherical white duck-head top with tiny yellow beak and pin-dot eyes screwed directly onto a short round amber glass vial, plugged neatly into a wall socket).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place commercial studio product boxes in the shot.';
  } else if (brand === 'feliora-dog') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Feliora Dog diffuser (compact spherical matte-white duck-head top with a small orange-yellow beak screwed upright onto a short round clear-greenish 48 mL glass vial with a sage-green label, plugged vertically into a Polish Type-E wall socket - strictly ZERO cats anywhere in frame).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place commercial studio product boxes in the shot, and strictly ZERO cats anywhere in frame.';
  } else if (brand === 'orthomax') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference bright orange contoured Orthomax StepMax shoe insole (orange breathable mesh top with raised arch support domes) held cleanly in hand or inside everyday shoes.'
      : 'NO COMMERCIAL PACKSHOT: Do NOT show commercial studio product boxes or brand logos.';
  } else if (brand === 'mellow-uk') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Mellow Mood Munchies UK pouch (matte light sky-blue stand-up resealable pouch with dark-navy lowercase "mellow" wordmark and glossy berry-red 5-petal flower-shaped gummies - NEVER gummy bears, NEVER purple pouches).'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place commercial studio packaging or graphic ad banners in the shot.';
  } else {
    const customTrimmed = customProductInstruction.trim().slice(0, 450);
    productDirective = includeProductRef
      ? customTrimmed
        ? `PRODUCT ACCURACY: Match the supplied product naturally in a real home setting (${customTrimmed}).`
        : 'PRODUCT ACCURACY: Match the supplied reference product naturally held in hand or on a clean home table without studio lighting.'
      : 'NO COMMERCIAL PACKSHOT: Do NOT place commercial studio product boxes or graphic ad overlays in the shot.';
  }

  const localeLine =
    market === 'uk'
      ? 'Authentic everyday British home/building surroundings matching the exact scene from the story. Any person or pet in frame must look 100% real and natural (ordinary British person in everyday clothes, natural skin and fur texture - NEVER stock-agency models, NEVER glossy CGI, NEVER split-screen Before/After collages).'
      : 'Authentic everyday Polish apartment/home surroundings matching the exact scene from the story. Any person or pet in frame must look 100% real and natural (ordinary Polish person in everyday clothes, natural skin and fur texture - NEVER stock-agency models, NEVER glossy CGI, NEVER split-screen Before/After collages).';

  const opticalSignature = [
    'Clean, sharp, high-clarity everyday photograph taken on a modern iPhone 15 in natural, well-balanced daylight or clean indoor lighting.',
    'Crisp focus, clear main subject, true-to-life natural colors, level framing like a real top-upvoted photo on Reddit or a Polish Facebook group - strictly NO blur, NO greasy lens glare, NO ugly harsh flash, NO dark muddiness, NO heavy grain.',
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
  if (brand === 'sardian-shampoo') {
    return `BRAND & AUDIENCE: Szampon SARDIAN Aktywujący Korzenie (tall rectangular matte-black shampoo bottle with pump dispenser, Polish label "SARDIAN / SZAMPON AKTYWUJĄCY KORZENIE / DLA GĘSTYCH I MOCNYCH WŁOSÓW", herbal complex: Korean ginseng, Polygonum multiflorum, Biota Orientalis, menthol, licorice). Target: Polish men aged 32-60 dealing with hair loss, clogged shower drains, receding temples/crown, sebum-DHT plugs, short 3-week anagen hairs in the sink, or SLS rebound oiliness. IMPORTANT: Prefer first-person POV shots of hands, shower drains, bathroom shelves, trichoscope screens, handwritten trichologist slips, barbershop counters, and the matte-black SARDIAN bottle rather than close-up AI human faces.${extra}`;
  }
  if (brand === 'feliora') {
    return `BRAND & AUDIENCE: Dyfuzor feromonowy Feliora dla Kotów (spherical white duck-head plug-in diffuser on amber glass vial, M.A.P. + F3 cat pheromones). Target: Polish cat owners dealing with peeing outside the litter box (duvet/sofa covered in painter foil), 2 fighting cats separated by a door crack or mesh, psychogenic belly fur licking, hiding behind the washing machine, or sterile stress cystitis (FIC).${extra}`;
  }
  if (brand === 'feliora-dog') {
    return `BRAND & AUDIENCE: Dyfuzor feromonowy Feliora dla Psów (spherical matte-white duck-head plug-in diffuser with small orange-yellow beak screwed upright onto a clear-greenish 48 mL glass vial with sage-green label, canine D.A.P. appeasing pheromones - strictly ZERO cats!). Target: Polish dog owners aged 28-58 in Polish apartments and homes dealing with dog separation anxiety, angry neighbor notes taped on the front door ("ZRÓBCIE COŚ Z TYM PSEM! WYJE TU OD 8:00 DO 16:00"), howling for 8 hours on live Wi-Fi pet camera while ignoring a stuffed Kong, scratched MDF doors and torn rubber doorframe seals, chewed sofas, bent wire crates, rescue dog fear, and thunderstorm/fireworks panic in the bathroom.${extra}`;
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
 * Clean, crisp, viral Reddit/Wykop style native scenes matched directly to the copy.
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

  if (brand === 'sardian-shampoo') {
    baseTwelve = [
      {
        label: '1. [PRYSZNIC POV] Czyste stalowe sitko odpływu pod prysznicem i czarna butelka SARDIAN na półce',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 photo in a modern Polish walk-in shower: a clean stainless-steel shower drain grate on wet gray tiles in the foreground and the matte-black SARDIAN shampoo bottle with water droplets on the metal corner shelf above.',
      },
      {
        label: '2. [TRICHOSCOPE 200X] Monitor z mikrokamerą 200x (czop łojowy vs czysta cebulka) + butelka SARDIAN',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo on a Polish trichologist desk: a computer monitor showing 200x magnified scalp hair follicles (clogged yellowish sebum plug on left vs clean open hair root on right) next to the matte-black SARDIAN shampoo bottle.',
      },
      {
        label: '3. [BARBERSHOP MYJKA] Czarna ceramiczna myjka fryzjerska z gęstą pianą i butelką SARDIAN',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo at a black ceramic barbershop washbasin: rich herbal micro-foam and water droplets on the basin edge with the matte-black SARDIAN shampoo bottle standing beside a dark barber towel.',
      },
      {
        label: '4. [KARTKA OD TRYCHOLOGA] Notatka „Szampon SARDIAN” na biurku obok okularów i butelki',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a wooden consultation desk: a small white notepad slip with clear blue ballpoint Polish handwriting reading "Szampon SARDIAN" next to reading glasses and the matte-black SARDIAN shampoo bottle.',
      },
      {
        label: '5. [PAKIET 3 BUTELEK] 3 czarne butelki SARDIAN (90-dniowa kuracja) na półce w łazience',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a Polish home bathroom: 3 matte-black SARDIAN shampoo bottles standing neatly in a row on a bathroom shelf next to a glass shower door.',
      },
      {
        label: '6. [SZCZOTKA + SZAMPON] Czarna butelka SARDIAN i silikonowa szczotka do masażu przy umywalce',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a white ceramic bathroom sink counter: the matte-black SARDIAN shampoo bottle covered in water droplets next to a round black-and-gold silicone scalp massage brush.',
      },
      {
        label: '7. [DROGERIA W KĄCIE] Zwykłe plastikowe szampony odsunięte w kąt vs matowa butelka SARDIAN',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo on a bathroom ledge: 3 generic unbranded colourful plastic supermarket shampoo bottles pushed into the back corner while the matte-black SARDIAN shampoo bottle stands front and center.',
      },
      {
        label: '8. [CZYSTY GRZEBIEŃ] Czysty męski grzebień bez ani jednego włosa obok mokrej butelki SARDIAN',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a bathroom counter right after a shower: a dark men’s hair comb (completely clean with zero fallen hairs) lying on a folded dark towel next to the wet matte-black SARDIAN shampoo bottle.',
      },
      {
        label: '9. [BARBERSHOP KONSOLA] Nożyczki fryzjerskie, maszynka i butelka SARDIAN przed lustrem',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo on a classic wooden Polish barbershop counter: professional steel barber scissors, a comb, and a hair clipper lying next to the matte-black SARDIAN shampoo bottle.',
      },
      {
        label: '10. [WCIERKI VS SARDIAN] Małe buteleczki z pipetą odsunięte przy zlewie vs Szampon SARDIAN',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo at a home bathroom sink: 2 small amber glass dropper bottles pushed aside near the drain while the tall matte-black SARDIAN shampoo bottle stands prominently with white micro-foam.',
      },
      {
        label: '11. [DWIE BUTELKI POD PRYSZNICEM] Zużyta i nowa butelka SARDIAN pod prysznicem',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo inside a glass shower stall: 2 matte-black SARDIAN shampoo bottles standing side by side on a matte-black metal shower shelf under warm morning bathroom light.',
      },
      {
        label: '12. [W DŁONI POD PRYSZNICEM] Męska dłoń sięgająca po mokrą butelkę SARDIAN w kabinie prysznicowej',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 POV photo inside a modern shower: a man’s wet hand holding the matte-black SARDIAN shampoo bottle with water droplets and herbal foam.',
      },
    ];
  } else if (brand === 'feliora') {
    const hasMesh = /siatk|dokocen|dwa kot|2 kot|walcz|izolac|szpar/i.test(lower);
    const hasAlopecia = /łysy brzuch|wyliz|różowej skóry|alergi/i.test(lower);
    baseTwelve = [
      {
        label: hasAlopecia
          ? '1. [HOOK COPY] Kot trzymany na rękach z czystym różowym wylizanym brzuchem ze stresu'
          : hasMesh
          ? '1. [HOOK COPY] 2 spięte koty mierzące się wzrokiem przez szparę w drzwiach'
          : '1. [HOOK COPY] Kanapa w polskim salonie owinięta folią malarską i kot siedzący na środku',
        includeProductRef: false,
        scenePrompt: hasAlopecia
          ? 'Clean, sharp daytime iPhone 15 photo in a bright Polish apartment living room: owner hands gently holding a grey-and-white European tabby cat upright on their lap, clearly showing a clean, smooth pale-pink hairless belly patch from stress over-grooming (healthy smooth pink skin, strictly no blood or sores), wide expressive cat eyes.'
          : hasMesh
          ? 'Clean, sharp iPhone 15 photo in a tidy Polish apartment hallway with oak laminate flooring: a white bedroom door cracked open 10 cm with a ginger cat peering out with dilated pupils and airplane ears while a dark tabby cat stands arched with a puffed tail in the hallway facing the crack.'
          : 'Clean, bright natural-daylight iPhone 15 photo in a tidy Polish living room: a grey fabric sofa covered across the cushions with clear crinkly painter plastic foil taped at the corners, with a domestic tabby cat sitting calmly right in the middle on top of the plastic foil staring at the camera.',
      },
      {
        label: '2. [HOOK COPY #2] Przerażony kot wciśnięty w wąską szparę za pralką w łazience',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo looking into the narrow 20 cm space between a white front-loading washing machine and clean beige bathroom wall tiles in a Polish apartment: a frightened black-and-white tuxedo cat huddled tightly beneath the grey drain hose staring up with huge round black pupils and flattened ears.',
      },
      {
        label: '3. [HOOK COPY #3] Kot spłaszczony ze stresu na stole w gabinecie weterynaryjnym obok próbki moczu',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright veterinary exam room: a frightened calico-tabby cat crouched flat in a pancake posture with airplane ears and dilated pupils on a light-blue pad on a stainless-steel exam table, with a small unlabelled clear specimen cup of clean amber urine on the corner of the table.',
      },
      {
        label: '4. [HOOK COPY #4] Mokra plama na białej kołdrze i winowajca siedzący na oparciu łóżka',
        includeProductRef: false,
        scenePrompt:
          'Clean morning daylight iPhone 15 photo in a tidy Polish bedroom: a pulled-back white duvet with a visible damp patch in the middle of the bed while an anxious domestic cat sits alertly on the headboard behind it.',
      },
      {
        label: '5. [GABINET WET] Polski lekarz weterynarii badający spokojnie kota na stole zabiegowym',
        includeProductRef: false,
        scenePrompt:
          'Clean, natural iPhone 15 photo inside a bright Polish veterinary consultation room: a trustworthy 52-year-old male Polish veterinarian in navy medical scrubs with a stethoscope gently examining a tense tabby cat on a stainless-steel exam table, zero text signs on walls.',
      },
      {
        label: '6. [NIEDZIAŁAJĄCE WTYCZKI] 5 zwykłych wtyczek z 1/3 płynu ustawionych w rzędzie na stole u weta',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a stainless-steel veterinary table: 5 generic unbranded white plastic plug-in pet diffusers with small clear glass vials containing 1/3 pale liquid left, next to a black stethoscope and a cat peeking from a plastic carrier in the background (zero brand logos or text).',
      },
      {
        label: '7. [KUWETY W BLOKU] 3 czyste kuwety z różnym żwirkiem ustawione w polskim przedpokoju',
        includeProductRef: false,
        scenePrompt:
          'Clean daytime iPhone 15 photo in a compact Polish apartment hallway: three different clean plastic cat litter boxes filled with different litters lined up along the wall while a sceptical cat sits beside them on the floor panels looking away.',
      },
      {
        label: '8. [KARTKA OD WETA] Czytelna notatka „dyfuzor Feliora” na kuchennym stole obok okularów',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a wooden Polish kitchen table in warm light: reading glasses, a mug of tea, and a neat small torn notebook slip with clear Polish handwriting reading "dyfuzor Feliora".',
      },
      {
        label: '9. [SIATKA W DRZWIACH] Tymczasowa ramka z siatką w futrynie sypialni między 2 kotami',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish apartment corridor: a temporary wooden frame with white mesh fitted into an open bedroom doorway separating two curious domestic cats sitting on opposite sides of the mesh.',
      },
      {
        label: '10. [SPOKÓJ W DOMU] 2 koty śpiące spokojnie obok siebie na czystej kanapie bez folii',
        includeProductRef: false,
        scenePrompt:
          'Clean, bright natural-sunlight iPhone 15 photo in a cozy Polish living room: two domestic cats (a ginger tabby and a dark tabby) curled up sleeping peacefully 20 cm apart on an uncovered grey fabric sofa.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Zrelaksowany kot śpiący kołami do góry w słońcu na łóżku',
        includeProductRef: false,
        scenePrompt:
          'Clean, sunny daytime iPhone 15 photo in a tidy Polish bedroom: a happy domestic cat sleeping deeply on its back belly-up on a crisp white duvet in warm afternoon window light.',
      },
      {
        label: '12. [PRODUKT W DOMU] Wtyczka Feliora w gniazdku ściennym obok spokojnie odpoczywającego kota',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish living room: the Feliora spherical white duck-head diffuser on its short round amber vial plugged vertically into a clean wall socket above the baseboard, with a relaxed tabby cat resting peacefully nearby.',
      },
    ];
  } else if (brand === 'feliora-dog') {
    const hasDoorNote = /kartk|sąsiad|art\.?\s*51|straż miejsk|toz/i.test(lower);
    const hasFireworks = /petard|burz|fajerwerk|pralk|wann|sylwestr/i.test(lower);
    const hasKennel = /klatk|kennel|pręt/i.test(lower);
    baseTwelve = [
      {
        label: hasDoorNote
          ? '1. [HOOK KARTKA NA DRZWIACH] Anonimowa kartka od sąsiadów na drzwiach: „ZRÓBCIE COŚ Z TYM PSEM!”'
          : hasFireworks
          ? '1. [HOOK BURZA/PETARDY] Przerażony duży pies skulony w suchej wannie w łazience'
          : '1. [HOOK DEMOLKA DRZWI] Podrapana futryna drzwi w przedpokoju i skruszony pies obok',
        includeProductRef: false,
        scenePrompt: hasDoorNote
          ? 'Clean, sharp straight-on iPhone 15 photo in a well-lit Polish apartment building hallway: close-up of a dark-walnut wood-grain apartment front door with a metal peephole, where a torn sheet of squared Polish notebook paper is taped at eye level with grey packing tape, written clearly in bold angry black marker capital letters: "ZRÓBCIE COŚ Z TYM PSEM! WYJE TU OD 8:00 DO 16:00. DZWONIMY NA STRAŻ MIEJSKĄ!"'
          : hasFireworks
          ? 'Clean, sharp iPhone 15 photo in a tidy Polish apartment bathroom with beige tiles: a large 28 kg German Shepherd mix dog curled tightly inside a clean dry white bathtub, trembling with wide frightened dark eyes and pinned-back ears.'
          : 'Clean, bright daytime iPhone 15 photo inside a tidy Polish apartment hallway with oak laminate floor: lower doorframe showing dog claw gouges and a pulled-loose black rubber door seal, with a sweet medium brown mixed-breed dog sitting right beside the door looking up with big guilty anxious eyes.',
      },
      {
        label: hasDoorNote
          ? '2. [HOOK POD DRZWIAMI] Dłoń z kluczami przed drzwiami mieszkania z przyklejoną groźbą sąsiadów'
          : hasKennel
          ? '2. [HOOK KLATKA] Odgięte pręty klatki kennelowej z poszarpanym kocem i przestraszonym psem obok'
          : '2. [HOOK KANAPA + KONG] Rozdarta gąbka z rogu kanapy i zupełnie nietknięty Kong z masłem orzechowym',
        includeProductRef: false,
        scenePrompt: hasDoorNote
          ? 'Clean, sharp first-person POV iPhone 15 photo in a tidy Polish block stairwell: a woman hand holding house keys frozen in front of her apartment door where a squared notebook sheet taped with packing tape reads in bold black marker: "ZRÓBCIE COŚ Z TYM PSEM! WYJE OD 8:00 DO 16:00".'
          : hasKennel
          ? 'Clean, sharp daytime iPhone 15 photo in a bright Polish living room: a wire dog kennel crate with two bent front bars near the latch and a torn grey fleece blanket pulled inside, while an anxious medium dog sits safely outside on the rug looking worried.'
          : 'Clean, bright natural-daylight iPhone 15 photo in a Polish apartment living room: torn yellow upholstery sponge on oak floor panels beside a chewed grey sofa corner, a red rubber Kong stuffed with peanut butter lying completely untouched in the foreground, and an anxious dog sitting behind it.',
      },
      {
        label: '3. [HOOK KAMERKA LIVE] Telefon w aucie z podglądem kamerki Wi-Fi na wyjącego pod drzwiami psa',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp daytime iPhone 15 photo from the driver seat of a parked left-hand-drive car: a woman hand holding her smartphone showing a crisp live home Wi-Fi security camera feed ("LIVE") of a Polish hallway where a medium dog sits right against the closed front door with head tilted upward howling and an untouched red Kong on the rug.',
      },
      {
        label: '4. [KONTRAST W DOMU] Ten sam pies witający właścicielkę w progu jak niewinny aniołek',
        includeProductRef: false,
        scenePrompt:
          'Clean, warm indoor iPhone 15 photo in a tidy Polish apartment hallway: a cute medium brown mixed-breed dog stretching happily on all 4 paws on the oak floor, wagging its tail calmly and looking lovingly up at the returning owner.',
      },
      {
        label: '5. [PRZERAŻONY ZA PRALKĄ] Duży pies wciśnięty w kąt obok pralki w czystej łazience',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish apartment bathroom: a scared medium-large dog squeezed tightly into the corner beside a white front-loading washing machine on clean tiles, ears pinned flat and wide anxious eyes.',
      },
      {
        label: '6. [WIZYTA U WETA] Polski lekarz weterynarii spokojnie badający psa w gabinecie',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright, modern Polish veterinary office: a kind 54-year-old male Polish veterinarian in navy scrubs with a stethoscope gently petting and examining a nervous medium dog sitting on the exam table, clean plain wall behind.',
      },
      {
        label: '7. [NIETKNIĘTE ZABAWKI] Nietknięta mata węchowa, Kong z pasztetem i gryzak obok psa pod drzwiami',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp daytime iPhone 15 photo in a Polish apartment hallway: a medium dog lying tensely with its nose pressed right against the bottom crack of the closed front door, completely ignoring a colorful snuffle mat and a stuffed red Kong toy right behind it.',
      },
      {
        label: '8. [KARTKA OD WETA] Czytelna karteczka „feromon kojący D.A.P. - dyfuzor Feliora” obok smyczy',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a wooden Polish kitchen table in warm light: a dog leash, house keys, a mug of tea, and a neat torn notebook slip with clear Polish handwriting reading "feromon kojący D.A.P. - dyfuzor Feliora".',
      },
      {
        label: '9. [SZUFLADA PRÓB] Kamizelka uciskowa, ziołowe tabletki i spraye odłożone na komodzie',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo of a tidy Polish hallway wooden dresser: a folded grey Velcro thunder-vest, two herbal calming spray bottles, opened supplement blisters, and a lavender collar laid aside next to a dog leash.',
      },
      {
        label: '10. [PRZEŁOM NA KAMERCE] Pies spokojnie wylizujący Konga i śpiący na dywanie na ekranie telefonu',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo at an office desk next to a laptop and coffee cup: a hand holding a smartphone displaying a crisp home Wi-Fi camera view where the dog is lying relaxed on the living room rug happily licking a red Kong toy.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Pies śpiący głębokim snem kołami do góry na czystej kanapie w słońcu',
        includeProductRef: false,
        scenePrompt:
          'Clean, bright sunlit iPhone 15 photo in a cozy Polish living room: a relaxed medium-large mixed-breed dog sleeping deeply on its back belly-up on a clean uncovered grey fabric sofa in warm afternoon window light.',
      },
      {
        label: '12. [PRODUKT W DOMU] Pionowa wtyczka Feliora dla Psów w gniazdku obok spokojnie śpiącego psa',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish apartment hallway-to-living-room passage: the Feliora spherical matte-white duck-head diffuser with orange-yellow beak screwed upright onto its clear-greenish 48 mL glass vial plugged vertically into a clean wall socket above the baseboard, with a calm dog sleeping peacefully on its bed nearby (strictly ZERO cats).',
      },
    ];
  } else if (brand === 'orthomax') {
    const isDzieci = segment === 'dzieci' || /dziec|syn|córk|szkoł|wf|przedszkol/i.test(lower);
    baseTwelve = [
      {
        label: isDzieci
          ? '1. [HOOK DZIECKO] Dziecko siedzące na ławce w szatni i trzymające się za bolącą piętę'
          : '1. [HOOK STOPY] Kobieta 58 lat masująca zmęczoną stopę obok zdjętych butów w domu',
        includeProductRef: false,
        scenePrompt: isDzieci
          ? 'Clean, sharp iPhone 15 photo in a bright school changing room: a 9-year-old Polish boy in gym clothes sitting on a wooden bench holding his aching bare heel beside his indoor sneakers.'
          : 'Clean, sharp indoor iPhone 15 photo in a tidy Polish living room: a 58-year-old Polish woman sitting on a sofa massaging her tired, slightly reddened bare foot beside her everyday leather shoes.',
      },
      {
        label: isDzieci
          ? '2. [HOOK KOŚLAWOŚĆ] Kostki dziecka uciekające do środka na jasnych panelach'
          : '2. [HOOK PŁASKOSTOPIE] Bose stopy z zapadniętym łukiem na płytkach w łazience',
        includeProductRef: false,
        scenePrompt: isDzieci
          ? 'Clean floor-level iPhone 15 photo in a bright Polish room: a 9-year-old child standing barefoot on oak laminate panels seen from behind, ankles visibly rolling inward (valgus tilt).'
          : 'Clean, sharp iPhone 15 POV photo in a bright Polish bathroom: bare feet of a 56-year-old woman standing on beige tiles showing a flattened medial arch and mild bunion redness.',
      },
      {
        label: '3. [EKSPERT] Polski fizjoterapeuta w granatowym stroju w jasnym gabinecie',
        includeProductRef: false,
        scenePrompt:
          'Clean, natural iPhone 15 portrait in a bright physiotherapy room: a trustworthy 55-year-old Polish male physiotherapist in plain navy scrubs with glasses looking warmly at the camera, plain clean wall.',
      },
      {
        label: '4. [BADANIE STOPY] Fizjoterapeuta pokazujący dłonią zapadający się łuk stopy pacjenta',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a physiotherapy room: physiotherapist hands gently supporting a patient bare foot above a treatment couch to demonstrate the medial arch alignment.',
      },
      {
        label: '5. [ZUŻYTE WKŁADKI] Spłaszczone cienkie wkładki z apteki obok zwykłych butów',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a Polish hallway: worn-out flat foam insoles pulled out of everyday shoes resting on a bench, clearly compressed paper-thin under the heel.',
      },
      {
        label: '6. [ZDARTA PODESZWA] Podeszwa codziennego buta zdarta pod skosem od wewnętrznej strony',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp close-up iPhone 15 photo in natural hallway light: a hand holding a worn everyday walking shoe upside down showing the inner heel rubber edge unevenly worn at an angle.',
      },
      {
        label: '7. [PODOSKOP] Bose stopy na podświetlanym podoskopie diagnostycznym',
        includeProductRef: false,
        scenePrompt:
          'Clean iPhone 15 photo in a rehabilitation room: bare feet standing on a glowing green glass podoscope mirror clearly showing flat-foot contact areas.',
      },
      {
        label: '8. [KARTKA NA STOLE] Czytelna notatka „wkładki Orthomax StepMax” na stole obok okularów',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo at a wooden Polish kitchen table: reading glasses, tea mug, and a small notebook slip reading clearly "wkładki Orthomax StepMax".',
      },
      {
        label: '9. [MAŚCI I ŻELE] Tubki żeli przeciwbólowych i plastry odłożone na szafce',
        includeProductRef: false,
        scenePrompt:
          'Clean iPhone 15 photo on a bathroom shelf: several half-used foot pain gel tubes, heel pads, and blister packs set aside neatly.',
      },
      {
        label: '10. [ULGA WIECZOREM] Moczenie zmęczonych stóp w misce z ciepłą wodą w domu',
        includeProductRef: false,
        scenePrompt:
          'Clean, warm indoor iPhone 15 photo in a tidy Polish bathroom: a 58-year-old woman sitting on the bathtub edge soaking her feet in a clean basin of warm water with a folded towel.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Swobodny spacer po polskim parku w słoneczny dzień',
        includeProductRef: false,
        scenePrompt:
          'Clean, bright daytime iPhone 15 photo on a sunny Polish park path: an ordinary smiling 60-year-old Polish woman in a casual jacket walking comfortably.',
      },
      {
        label: '12. [PRODUKT W DOMU] Dłoń wsuwająca pomarańczową wkładkę Orthomax StepMax do buta',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish hallway: a hand sliding a bright orange contoured Orthomax StepMax insole into a clean everyday sneaker, second shoe beside it.',
      },
    ];
  } else if (resolvedMarket === 'uk') {
    baseTwelve = [
      {
        label: '1. [HOOK SCENE] Candid everyday UK home scene matching opening paragraph',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp modern iPhone 15 photo in a bright lived-in British kitchen: an ordinary British parent standing by the kitchen counter during a busy school morning, natural daylight.',
      },
      {
        label: '2. [HOOK DETAIL] Everyday detail from the opening conflict of the story',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a tidy British living room showing an untouched school backpack and shoes by the front door in morning light.',
      },
      {
        label: '3. [SPECIALIST] Friendly British clinician in plain navy scrubs in a bright room',
        includeProductRef: false,
        scenePrompt:
          'Clean, natural iPhone 15 portrait of a 52-year-old British specialist in plain navy scrubs in a bright consultation room, warm trustworthy expression.',
      },
      {
        label: '4. [CONSULTATION] Calm conversation across a consultation desk with notes',
        includeProductRef: false,
        scenePrompt:
          'Clean iPhone 15 photo across a tidy desk with a pen and notepad during a calm consultation, natural window light.',
      },
      {
        label: '5. [OLD SUPPLEMENTS] Half-used supplement tubs and syrups set aside on counter',
        includeProductRef: false,
        scenePrompt:
          'Clean iPhone 15 photo on a British kitchen worktop showing several generic half-used supplement bottles pushed aside next to a kettle.',
      },
      {
        label: '6. [STORY OBJECT] Concrete everyday object from the turning point of the script',
        includeProductRef: false,
        scenePrompt:
          'Clean close-up iPhone 15 photo on a wooden British kitchen table showing reading glasses, car keys, and a mug of tea in natural light.',
      },
      {
        label: '7. [HOME ROUTINE] Quiet evening homework moment at the dining table',
        includeProductRef: false,
        scenePrompt:
          'Clean warm indoor iPhone 15 photo in a British dining room with an open school workbook and pencils on the wooden table.',
      },
      {
        label: '8. [HANDWRITTEN SLIP] Small neat notepad slip next to a mug of tea',
        includeProductRef: false,
        scenePrompt:
          'Clean iPhone 15 POV photo on a kitchen worktop showing a mug of tea, glasses, and a small neat handwritten note.',
      },
      {
        label: '9. [MORNING KITCHEN] Peaceful morning breakfast table in natural UK daylight',
        includeProductRef: false,
        scenePrompt:
          'Clean bright morning iPhone 15 photo of a tidy British kitchen breakfast table with toast and orange juice.',
      },
      {
        label: '10. [FAMILY MOMENT] Relaxed British parent and child walking outdoors on a park path',
        includeProductRef: false,
        scenePrompt:
          'Clean natural daylight iPhone 15 photo on a leafy British footpath showing a parent and child walking calmly side by side.',
      },
      {
        label: '11. [EVERYDAY PAYOFF] Calm smiling protagonist in bright natural garden light',
        includeProductRef: false,
        scenePrompt:
          'Clean sunny daytime iPhone 15 photo in a British back garden showing a relieved, happy parent holding a mug of tea.',
      },
      {
        label: '12. [PRODUCT IN USE] Candid home iPhone photo of the product on a clean British kitchen counter',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo on a bright British kitchen worktop next to a kettle and mug: an ordinary hand holding the product naturally at home.',
      },
    ];
  } else {
    const isFemaleNarrator = /zrobiłam|poszłam|miałam|męża|córka zarezerwowała|tańczyłam|wannie|toalety|babcia/i.test(lower);
    baseTwelve = [
      {
        label: '1. [HOOK LUDZKI] Senior trzymający się za bolące kolano przy domowych schodach',
        includeProductRef: false,
        scenePrompt: `Clean, sharp iPhone 15 photo in a bright Polish home hallway staircase: an ordinary ${
          isFemaleNarrator ? '66-year-old Polish woman in cardigan and trousers' : '65-year-old Polish man in sweater and trousers'
        } pausing on wooden stairs with one hand on the banister and the other gently pressing below their aching kneecap.`,
      },
      {
        label: '2. [HOOK OBJAW] Zbliżenie na kolano z odgnieceniami po grubej opasce z apteki',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp indoor iPhone 15 photo in a Polish living room: rolled-up trouser leg of a 65-year-old person sitting on a chair showing red elastic pressure marks left by a thick beige pharmacy knee sleeve resting beside them.',
      },
      {
        label: '3. [EKSPERT] Polski fizjoterapeuta 56 lat w granatowym stroju w jasnym gabinecie',
        includeProductRef: false,
        scenePrompt:
          'Clean, natural iPhone 15 portrait in a bright rehabilitation room: a 56-year-old Polish male orthopedic physiotherapist in plain navy scrubs and glasses, calm trustworthy expression, plain clean wall.',
      },
      {
        label: '4. [PUNKT 2 PALCÓW] Dłoń wskazująca punkt 2 palce poniżej rzepki na kolanie',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp close-up iPhone 15 photo in natural window light: an older person sitting on a sofa with trouser leg rolled up, placing two fingers horizontally just below the kneecap on the patellar tendon.',
      },
      {
        label: '5. [STARE OPASKI] Rozciągnięte grube ortezy i tubki żeli odłożone na ławę',
        includeProductRef: false,
        scenePrompt:
          'Clean iPhone 15 photo on a Polish home table: two stretched-out beige elastic knee sleeves, a bulky hinged brace, and half-used joint gel tubes laid aside.',
      },
      {
        label: '6. [FOTEL KIEROWCY] Dłoń na kolanie przy wysiadaniu z samochodu na parkingu',
        includeProductRef: false,
        scenePrompt:
          'Clean daytime iPhone 15 photo by an open left-hand-drive car door: a 64-year-old Polish man stepping out onto a parking lot while supporting his right knee.',
      },
      {
        label: '7. [DZIAŁKA / OGRÓD] Chwila odpoczynku na ławce na zadbanej polskiej działce ROD',
        includeProductRef: false,
        scenePrompt:
          'Clean sunny iPhone 15 photo on a green Polish garden allotment (ROD): a 66-year-old Polish person sitting on a wooden bench beside garden beds.',
      },
      {
        label: '8. [KARTKA NA STOLE] Czytelna notatka „pasek podrzepkowy SARDIAN” obok okularów',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a wooden Polish kitchen table: reading glasses, tea glass, and a small notebook slip clearly reading "pasek podrzepkowy SARDIAN".',
      },
      {
        label: '9. [SZAFKA PRÓB] Puszki kolagenu i maści odstawione na kuchennym blacie',
        includeProductRef: false,
        scenePrompt:
          'Clean iPhone 15 photo on a tidy Polish kitchen counter next to a kettle: opened collagen powder tubs and green horse-balm jars pushed aside.',
      },
      {
        label: '10. [ROZMOWA W DOMU] Para 60+ przy herbacie w jasnej polskiej kuchni',
        includeProductRef: false,
        scenePrompt:
          'Clean warm natural-light iPhone 15 photo in a cozy Polish kitchen: an ordinary 64-year-old Polish couple talking warmly across the table over mugs of tea.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Uśmiechnięty 66-latek schodzący swobodnie ze schodów w słońcu',
        includeProductRef: false,
        scenePrompt:
          'Clean bright daytime iPhone 15 photo: a smiling 66-year-old Polish person walking comfortably down home steps in natural sunlight.',
      },
      {
        label: '12. [PRODUKT W DOMU] Wąski czarny pasek zapięty 2 palce pod rzepką w domowym świetle',
        includeProductRef: true,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish living room: a 65-year-old person sitting on a chair with trouser leg rolled up, wearing a slim matte-black patellar strap fastened 2 fingers below the kneecap (strictly zero text or logos on strap).',
      },
    ];
  }

  if (targetCount <= 12) return baseTwelve;

  const extraThree: NativeIphoneSceneSpec[] = [
    {
      label: '13. [SCENA Z HISTORII #2] Dodatkowe czyste ujęcie codziennej sytuacji z połowy historii',
      includeProductRef: false,
      scenePrompt:
        resolvedMarket === 'uk'
          ? 'Clean natural daylight iPhone 15 photo of a lived-in British hallway with coats and shoes neatly arranged.'
          : 'Clean natural daylight iPhone 15 photo of a bright lived-in Polish apartment living room matching the story.',
    },
    {
      label: '14. [BOHATER W DOMU] Naturalny portret bohatera historii w jasnym świetle dziennym',
      includeProductRef: false,
      scenePrompt:
        resolvedMarket === 'uk'
          ? 'Clean, sharp natural-light iPhone 15 photo of an ordinary British homeowner smiling calmly in their living room.'
          : 'Clean, sharp natural-light iPhone 15 photo of an ordinary Polish homeowner in their bright living room.',
    },
    {
      label: '15. [WIECZÓR W KUCHNI] Kubek herbaty, okulary i telefon na czystym stole kuchennym',
      includeProductRef: false,
      scenePrompt:
        resolvedMarket === 'uk'
          ? 'Clean warm evening iPhone 15 photo on a wooden British kitchen table: a mug of tea, reading glasses, and a smartphone.'
          : 'Clean warm evening iPhone 15 photo on a wooden Polish kitchen table: a mug of tea, reading glasses, and a smartphone.',
    },
  ];

  return [...baseTwelve.slice(0, 11), ...extraThree, { ...baseTwelve[11], label: baseTwelve[11].label.replace(/^12\./, '15.') }];
}

/**
 * Main LLM Visual Scene Director:
 * Generates 12 (or 15) CLEAN, CRISP, COPY-DRIVEN modern iPhone 15 native photo prompts
 * matched 1:1 to the exact Hook, props, pets/people, and scenes of THIS specific copy.
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
      ? `MARKET SETTING: UNITED KINGDOM (clean, authentic everyday British homes, hallways, kitchens, gardens, right-hand-drive UK cars taken strictly from THIS script).`
      : `MARKET SETTING: POLAND (clean, authentic everyday Polish apartments, block-of-flats hallways, деревянные/walnut front doors, oak laminate panels, kitchens, bathrooms, vet consultation rooms, left-hand-drive cars taken strictly from THIS script).`;

  const lastSceneNum = targetCount;

  try {
    const client = brainClient(brainOptions(45_000));

    const systemPrompt = `You are an elite Direct-Response Native Ad Creative Director creating CLEAN, CRISP, HIGH-CLARITY iPhone 15 photo prompts (modelled on real viral photos from Reddit r/dogs, r/cats, r/Apartmentliving, Wykop, and Polish Facebook groups) that match the ad copy 1:1.

${buildBrandDirectorContext(params.brand, resolvedMarket, params.segment, params.instructionText)}
${localeRules}

CRITICAL RULE #1 — 100% LITERAL MATCH TO THE HOOK & COPY:
Every photo MUST come directly from the specific scenes, objects, threats, and symptoms written in THIS exact script!
- Read the FIRST 3 PARAGRAPHS (the Hook) word for word.
- Scenes 1, 2, 3, and 4 MUST be 4 distinct, scroll-stopping, literal visual angles of the EXACT HOOK of THIS copy:
  * Example A: If the hook mentions an anonymous/angry neighbor's note taped to the apartment door (e.g. "Zróbcie coś z tym psem, wyje od 8:00 do 16:00, dzwonimy na straż miejską"), Scene 1 MUST be a crisp close-up of a realistic Polish apartment front door with a squared notebook sheet taped to it reading clearly in bold black Polish marker the exact short threat (e.g. "ZRÓBCIE COŚ Z TYM PSEM! WYJE TU OD 8:00 DO 16:00. DZWONIMY NA STRAŻ MIEJSKĄ!"), and Scene 2 MUST show the owner's hand with keys in front of that note on the door!
  * Example B: If the hook mentions scratched MDF doors / torn rubber seals / chewed sofa foam / untouched Kong, Scene 1 & 2 MUST show the real dog sitting guiltily/anxiously right next to that exact scratched door or chewed sofa + untouched Kong!
  * Example C: If the hook mentions checking a live home Wi-Fi camera in a car/office, Scene 1 & 2 MUST show a crisp smartphone screen in hand displaying the live pet-cam view of the dog howling at the front door!
  * Example D: If the hook mentions a 28 kg dog wedged behind a washing machine or trembling in a dry bathtub, or a cat with a stress-licked pink belly, or 2 cats staring through a door crack, or a sofa wrapped in painter's plastic foil — Scene 1 & 2 MUST show that exact visual clearly!

CRITICAL RULE #2 — CLEAN, CRISP MODERN iPHONE 15 QUALITY (ZERO "SHIT QUALITY"):
- Every image must look like a clean, sharp, well-lit photo taken on a modern iPhone 15 in balanced daylight or clean warm indoor lighting.
- Clear focal subject, readable in 0.3 seconds on a mobile feed, natural true-to-life colors, pleasant clean framing.
- STRICTLY FORBIDDEN QUALITY DEFECTS: NEVER use words like "greasy lens", "blown-out highlights", "overexposed glare", "harsh flash", "blurry", "grainy", "dirty", "crooked horizon", "awkward chin-down selfie", or "unflattering"!

CRITICAL RULE #3 — ZERO DINOSAUR SKULLS, ZERO BURNT STICKS, ZERO GARBAGE BINS:
- NEVER generate plastic anatomical skulls, animal skeletons, bone models, or weird medical props ("canine skull model" looks like a dinosaur skeleton — 100% BANNED!).
- NEVER generate burnt/charred black diffuser wicks ("burnt blackened wick" looks like unrecognizable burnt filth — 100% BANNED!).
- NEVER generate open trash/garbage bins full of rubbish!
- NEVER invent random clinic/NFZ wall signs that are not in the story. ONLY render Polish text on a note when the story itself features that note (e.g. neighbor's note on the door, or vet's small handwritten slip on a table — keep handwritten text short, bold, and 100% accurately spelled in Polish!).

SCENE STRUCTURE (EXACTLY ${targetCount} SCENES):
- Scenes 1–4: 4 crisp, literal visual Hook variations of Paragraphs 1–4 of THIS copy (highest scroll-stop power!).
- Scenes 5–8: 4 concrete story scenes from the middle of THIS copy (e.g. live pet-cam screen, untouched Kong/toys, calm real veterinarian examining a real live dog/cat on the table, or neat handwritten product slip on kitchen table if in the script).
- Scenes 9–${lastSceneNum - 1}: Clean relatable home moments & emotional payoff from THIS copy (e.g. peaceful dog/cat sleeping belly-up on a clean uncovered sofa in bright natural window light).
- Scene ${lastSceneNum}: [PRODUCT IN HOME] (includeProductRef: true — ONLY scene #${lastSceneNum} has includeProductRef: true; all earlier scenes MUST have includeProductRef: false!) Crisp everyday home photo of the product plugged neatly into a clean wall socket / used naturally with a calm pet/owner nearby.

Return ONLY valid JSON:
{
  "scenes": [
    {
      "label": "1. [HOOK] Krótki polski opis sceny z tego copy (max 70 znaków)",
      "scenePrompt": "Detailed English prompt for a clean, sharp modern iPhone 15 photo matching the exact scene...",
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
        temperature: 0.65,
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
        temperature: 0.65,
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
      const scenePrompt = stripClinicSignTokens(candidate?.scenePrompt || fb.scenePrompt, resolvedMarket);
      const wantsSardianRef =
        params.brand === 'sardian-shampoo' &&
        (Boolean(candidate?.includeProductRef) || /sardian|bottle|butelk|szampon/i.test(`${numberedLabel} ${scenePrompt}`));
      return {
        label: numberedLabel,
        scenePrompt,
        includeProductRef: idx === lastIdx || wantsSardianRef ? true : false,
      };
    });
  } catch {
    return fallback;
  }
}
