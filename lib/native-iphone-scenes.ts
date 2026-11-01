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
      : 'HOOK-CONGRUENT REAL-LIFE PHOTO (ZERO PRODUCT PACKSHOT): Do NOT show any knee strap, box, or commercial product in this shot. Depict ONLY the literal real-world Hook artifact, document, place, or moment from the prompt (e.g. orthopedic diagram "PUNKT 2 PALCE POD RZEPKĄ", red elastic marks from an old thick beige pharmacy sleeve, basket of used joint gel tubes + receipt, car door / stairs knee pain moment). All visible Polish text on documents must be 100% accurately spelled.';
  } else if (brand === 'sardian-shampoo') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference SARDIAN shampoo bottle (tall rectangular matte-black bottle with smooth chamfered edges, matte-black pump dispenser, bold white "SARDIAN" at top, warm copper-gold "SZAMPON" and bold white "AKTYWUJĄCY KORZENIE", and warm-gold bar reading "DLA GĘSTYCH I MOCNYCH WŁOSÓW"). Avoid close-up AI human faces; focus on crisp first-person POV bathroom, shower, barbershop, or trichologist desk scenes.'
      : 'HOOK-CONGRUENT REAL-LIFE PHOTO (ZERO SHAMPOO BOTTLE PACKSHOT): Do NOT place the SARDIAN bottle or any commercial product packshot in this shot. Depict ONLY the literal real-world Hook artifact, place, document, label, gadget, or moment described in the prompt (e.g. Hagia Sophia / Istanbul hair clinic brochure, cancelled flight booking + passport, unfolded pharmacy side-effect leaflet, back INCI ingredient label showing Sodium Laureth Sulfate, 1.5 cm vs 6 cm hair comparison, USB microscope on laptop, 2-finger scalp test diagram, or shower drain). All visible Polish text on documents/labels must be 100% accurately spelled.';
  } else if (brand === 'feliora') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Feliora diffuser (compact spherical white duck-head top with tiny yellow beak and pin-dot eyes screwed directly onto a short round amber glass vial, plugged neatly into a wall socket).'
      : 'HOOK-CONGRUENT REAL-LIFE PHOTO (ZERO DIFFUSER PRODUCT PACKSHOT): Do NOT place any plug-in diffuser bottle or commercial product box in this shot. Depict ONLY the literal real-world Hook scene, expressive real cat, or story artifact described in the prompt (e.g. sofa wrapped in clear painter plastic foil with cat on top, damp stain on white duvet, cat with clean smooth hairless pink belly patch from stress licking, 2 tense cats separated by a 10 cm door crack or mesh frame, frightened cat behind washing machine, or vet urinalysis sheet "BADANIE MOCZU KOTA: Brak bakterii — FIC / stres"). All visible Polish text must be 100% accurately spelled.';
  } else if (brand === 'feliora-dog') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Feliora Dog diffuser (compact spherical matte-white duck-head top with a small orange-yellow beak screwed upright onto a short round clear-greenish 48 mL glass vial with a sage-green label, plugged vertically into a Polish Type-E wall socket - strictly ZERO cats anywhere in frame).'
      : 'HOOK-CONGRUENT REAL-LIFE PHOTO (ZERO DIFFUSER PRODUCT PACKSHOT & ZERO CATS): Do NOT place any plug-in diffuser or commercial product box in this shot, and strictly ZERO cats anywhere in frame. Depict ONLY the literal real-world Hook artifact, expressive real dog, or story prop described in the prompt (e.g. angry neighbor note taped to modern apartment door "ZRÓBCIE COŚ Z TYM PSEM! WYJE TU OD 8:00 DO 16:00. DZWONIMY NA STRAŻ MIEJSKĄ!", hand in parked car holding smartphone with live home Wi-Fi camera feed of dog howling at front door, scratched door frame + pulled rubber seal + untouched red Kong, bent kennel crate bars, or large dog trembling in dry white bathtub). All visible Polish text must be 100% accurately spelled.';
  } else if (brand === 'orthomax') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference bright orange contoured Orthomax StepMax shoe insole (orange breathable mesh top with raised arch support domes) held cleanly in hand or inside everyday shoes.'
      : 'HOOK-CONGRUENT REAL-LIFE PHOTO (ZERO ORANGE INSOLE PACKSHOT): Do NOT place any orange Orthomax insoles or commercial product boxes in this shot. Depict ONLY the literal real-world Hook artifact, physical proof, document, or moment described in the prompt (e.g. everyday shoe held upside down showing unevenly worn inner heel edge, 3 pairs of child/adult shoes tilted inward from behind, wet flat footprint "stopa jak żelazko" on matte bathroom tiles, barefoot valgus ankles "odwrócone V" on oak panels, podoscope green arch scan, orthopedic diagnostic diagram, or basket of failed foot gel tubes + Polish pharmacy receipt "PARAGON FISKALNY"). All visible Polish text must be 100% accurately spelled.';
  } else if (brand === 'mellow-uk') {
    productDirective = includeProductRef
      ? 'PRODUCT ACCURACY: Match the reference Mellow Mood Munchies UK pouch (matte light sky-blue stand-up resealable pouch with dark-navy lowercase "mellow" wordmark and glossy berry-red 5-petal flower-shaped gummies - NEVER gummy bears, NEVER purple pouches).'
      : 'HOOK-CONGRUENT REAL-LIFE PHOTO (ZERO PRODUCT POUCH PACKSHOT): Do NOT place commercial studio packaging or graphic ad banners in the shot. Depict ONLY the literal real-world Hook artifact, school email, or UK home moment described in the prompt.';
  } else {
    const customTrimmed = customProductInstruction.trim().slice(0, 450);
    productDirective = includeProductRef
      ? customTrimmed
        ? `PRODUCT ACCURACY: Match the supplied product naturally in a real home setting (${customTrimmed}).`
        : 'PRODUCT ACCURACY: Match the supplied reference product naturally held in hand or on a clean home table without studio lighting.'
      : 'HOOK-CONGRUENT REAL-LIFE PHOTO (ZERO COMMERCIAL PACKSHOT): Do NOT place commercial studio product boxes or graphic ad overlays in the shot. Depict ONLY the literal real-world Hook artifact, document, or scene from the copy.';
  }

  const localeLine =
    market === 'uk'
      ? 'Bright, clean, tidy, contemporary modern British home interior with soft natural daylight. Any person or pet in frame must look 100% real and natural (candid angle or first-person POV hands/pets/objects - NEVER awkward passport-style close-up AI human faces staring at the lens, NEVER glossy CGI, NEVER split-screen Before/After collages).'
      : 'Bright, clean, tidy, contemporary modern Polish apartment or modern clinic interior (clean white/warm-beige walls, light oak flooring, spotless modern furniture, soft natural window daylight or warm balanced home lighting - strictly NEVER gloomy Eastern-European/Soviet "block-of-flats" corridors, NEVER peeling paint, NEVER stained mugs, NEVER dirty clutter). Any person or pet in frame must look 100% real and natural (prefer crisp first-person POV hands, expressive real pets, and story objects or candid medium shots - NEVER awkward close-up passport-style AI human faces staring into a wide-angle lens).';

  const opticalSignature = [
    'Clean, bright, razor-sharp 1:1 square everyday photograph taken on an iPhone 15 Pro in soft natural daylight or warm, bright modern home lighting (Sardian clean native style).',
    'Crisp focus, spotless clean surfaces, true-to-life warm natural colors, level framing like a top viral post on Reddit or a modern Polish group.',
    'STRICTLY NO dark gloomy shadows, NO grimy/shabby backgrounds, NO harsh direct flash or mirror glare, NO blur, NO grain, NO camera date/time stamps in corners, NO phone/tablet screenshot UI bars ("Edit", battery/Wi-Fi icons), NO split-screen collages.',
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
    return `BRAND & AUDIENCE: SARDIAN Opaska Podrzepkowa (narrow matte-black patellar tendon strap worn 2 fingers below the kneecap).
CRITICAL "HAGIA SOPHIA / BROSZURA" HOOK-CONGRUENCE RULE FOR SARDIAN OPASKA (ZERO PRODUCT SHOEHORNING):
NEVER force the black knee strap into every photo! All 12 scenes MUST have includeProductRef: false and MUST literally visualize the exact concrete Hook artifact, document, number, place, or physical proof from the first 3 sentences of the copy:
- If the Hook mentions knee surgery / NFZ orthopedic queue / injection cost: show a clean printed Polish orthopedic sheet ("SKIEROWANIE DO PORADNI ORTOPEDYCZNEJ" or "KWALIFIKACJA DO ENDOPROTEZOPLASTYKI KOLANA") or a pharmacy receipt for hyaluronic acid injections on a wooden table!
- If the Hook mentions thick pharmacy sleeves rolling down or cutting off circulation: show a rolled-up trouser leg with red elastic pressure indentations on the skin next to a stretched-out thick beige pharmacy knee sleeve!
- If the Hook mentions the physiotherapist's 2-finger patellar tendon test: show a clean clinical diagram "TEST 2 PALCÓW POD RZEPKĄ — ODCIĄŻENIE WIĘZADŁA RZEPKI" or two fingers placed horizontally 2 fingers below the kneecap!
- If the Hook mentions stairs, getting out of a car on a parking lot, or a garden allotment (działka ROD): show that exact candid first-person POV / medium moment in bright natural light!${extra}`;
  }
  if (brand === 'sardian-shampoo') {
    return `BRAND & AUDIENCE: Szampon SARDIAN Aktywujący Korzenie.
CRITICAL "HAGIA SOPHIA / BROSZURA" HOOK-CONGRUENCE RULE FOR SARDIAN (ZERO PRODUCT SHOEHORNING):
NEVER generate boring, generic photos of a shampoo bottle sitting on a bathroom shelf! All 12 scenes MUST have includeProductRef: false and MUST literally visualize the exact concrete Hook artifact, location, document, number, or physical proof from the first 3 sentences of the copy:
- If the Hook mentions Turkey / Istanbul / 17 000 zł hair transplant ("Stambuł", "Turcja", "17 000 zł", "przeszczep"): show Hagia Sophia in Istanbul with a Turkish hair clinic brochure ("STAMBUŁ HAIR CLINIC — 17 000 ZŁ") on a cafe table, or a printed flight booking "WARSZAWA (WAW) -> STAMBUŁ (IST) — REZERWACJA ANULOWANA" next to a maroon Polish passport!
- If the Hook mentions throwing away a dermatologist prescription or reading side effects ("recepta", "ulotka", "skutki uboczne", "libido"): show a man's hand in a parked car holding an unfolded Polish pharmacy leaflet ("ULOTKA DLA PACJENTA — Częste działania niepożądane: spadek libido, zaburzenia erekcji") circled in red pen next to a crumpled prescription!
- If the Hook mentions checking the shampoo ingredient list for SLS ("Sodium Laureth Sulfate", "2. słowo po Aqua", "SLS"): show a close-up POV hand holding a generic plastic supermarket shampoo bottle turned to its back INCI label, pointing a finger directly at "INGREDIENTS: Aqua, Sodium Laureth Sulfate (SLS)" circled in red!
- If the Hook mentions short 1-2 cm hairs in the sink or shortened 21-day anagen ("mniej niż 2 cm", "8 na 10 włosów", "21 dni", "anagen"): show a crisp macro comparison on white porcelain/card of 6 tiny 1.5 cm hairs ("21 DNI — SKRÓCONY ANAGEN") next to 3 long thick 6 cm hairs ("4 LATA — PEŁNY CYKL")!
- If the Hook mentions a 79 zł USB microscope ("mikroskop USB za 79 zł", "1-2 mm włoski na zakolach"): show a small black handheld USB digital microscope plugged into a laptop displaying 200x tiny 1-2 mm sprouting hairs on scalp skin!
- If the Hook mentions the 2-finger scalp test or waxy sebum-DHT plug ("test 2 palców", "nad uchem vs czubek głowy", "woskowy czop"): show a trichologist diagnostic sheet "TEST 2 PALCÓW: 1. Nad uchem (miękka skóra) vs 2. Czubek głowy (napięty czepiec + woskowy czop DHT)" or a 200x trichoscope monitor!
- If the Hook mentions pouring out 320 zł hair serums/wcierki ("wcierki za 320 zł", "wylałem do zlewu"): show 4 half-used pharmacy dropper bottles and ampoules tossed in a basket by the sink with a "320 ZŁ" receipt while a dropper is poured into the drain!
- If the Hook mentions catching the wife cleaning the shower drain ("przyłapałem żonę", "na kolanach przy kabinie", "sitko odpływu"): show a candid doorway shot of a Polish wife kneeling by the OPEN walk-in glass shower door, reaching her hand with a tissue INSIDE the white shower tray (brodzik) to clean dark hair from the shower drain (strictly NO floor drain on the dry tiles outside the shower!).${extra}`;
  }
  if (brand === 'feliora') {
    return `BRAND & AUDIENCE: Dyfuzor feromonowy Feliora dla Kotów (M.A.P. + F3 cat pheromones).
CRITICAL "HAGIA SOPHIA / BROSZURA" HOOK-CONGRUENCE RULE FOR FELIORA KOT (ZERO PRODUCT SHOEHORNING):
NEVER force the Feliora plug-in diffuser bottle into the photo! All 12 scenes MUST have includeProductRef: false and MUST literally visualize the exact concrete Hook artifact, cat behavior, document, or physical proof from the first 3 sentences of the copy in a bright, spotless modern Polish apartment:
- If the Hook mentions wrapping the living room sofa in painter's foil ("folia malarska na kanapie", "kanapa za 4500 zł") or peeing on the duvet/shoes: show a grey modern sofa covered with clear crinkly painter's foil with an expressive domestic cat sitting right on top of the foil, or a damp stain on a white duvet with the cat sitting on the headboard!
- If the Hook mentions a stress-licked bald pink belly ("wylizany do gołej różowej skóry brzuch", "alopecia psychogenna"): show owner hands gently holding a tabby cat upright on their lap, clearly showing a clean, smooth pale-pink hairless belly patch (healthy smooth pink skin, strictly no blood or sores)!
- If the Hook mentions 2 cats fighting / failed cat introduction ("dokocenie", "2 koty", "szpara w drzwiach", "siatka w futrynie", "krew na futrze"): show a white bedroom door cracked open 10 cm with one cat peering out with dilated pupils and airplane ears while the second cat stands arched with a puffed tail in the hallway, or a wooden mesh frame in the doorway separating the 2 cats!
- If the Hook mentions vet bills / sterile urine test ("badanie moczu", "680 zł u weterynarza", "idiopatyczne zapalenie pęcherza FIC"): show a vet consultation table with a clear urine specimen cup and a printed Polish vet lab sheet reading "BADANIE MOCZU KOTA: Brak bakterii — Idiopatyczne zapalenie pęcherza (FIC / stres)"!
- If the Hook mentions a terrified cat hiding behind the washing machine ("za pralką", "spłaszczony jak naleśnik"): show a frightened cat huddled tightly in the narrow 20 cm gap beside a clean white washing machine with huge black pupils!${extra}`;
  }
  if (brand === 'feliora-dog') {
    return `BRAND & AUDIENCE: Dyfuzor feromonowy Feliora dla Psów (canine D.A.P. appeasing pheromones - strictly ZERO cats!).
CRITICAL "HAGIA SOPHIA / BROSZURA" HOOK-CONGRUENCE RULE FOR FELIORA PIES (ZERO PRODUCT SHOEHORNING):
NEVER force the Feliora plug-in diffuser into the photo, and strictly ZERO cats anywhere in frame! All 12 scenes MUST have includeProductRef: false and MUST literally visualize the exact concrete Hook artifact, note, gadget, or dog behavior from the first 3 sentences of the copy in a bright, spotless modern Polish apartment:
- If the Hook mentions an angry neighbor's note taped to the apartment door ("kartka na drzwiach", "Straż Miejska", "Art. 51 KW", "wyje od 8:00 do 16:00"): show a crisp straight-on iPhone 15 close-up of a sleek walnut apartment door where a squared notebook sheet taped with grey tape reads in bold black Polish marker: "ZRÓBCIE COŚ Z TYM PSEM! WYJE TU OD 8:00 DO 16:00. DZWONIMY NA STRAŻ MIEJSKĄ!" (or a hand holding house keys in front of that note)!
- If the Hook mentions watching the dog howl on a live home Wi-Fi camera from a car or office ("kamerka Wi-Fi", "aplikacja w telefonie", "w korku"): show a real hand inside a parked car or at an office desk holding a smartphone displaying a crisp live home camera view ("LIVE") of the dog sitting right against the closed front door with head tilted upward howling (NEVER a raw full-screen phone UI screenshot)!
- If the Hook mentions scratched door frames, chewed sofa corners, or an untouched Kong ("wydrapana futryna", "uszczelka", "rozdarta kanapa", "nietknięty Kong"): show a sweet anxious dog sitting on a clean oak floor right beside the scratched lower doorframe / pulled black rubber seal or torn sofa cushion with a peanut-butter-stuffed red Kong lying completely untouched in front of it!
- If the Hook mentions a dog kennel crate with bent bars ("klatka kennelowa", "wygięte pręty") or a large dog trembling in a dry bathtub/beside a washing machine during fireworks/storm ("burza", "petardy", "wanna", "za pralką"): show that exact literal scene in a bright, clean Polish home!${extra}`;
  }
  if (brand === 'orthomax') {
    return `BRAND & AUDIENCE: Wkładki ortopedyczne Orthomax StepMax. Segment: ${
      segment === 'dzieci'
        ? 'Polish mothers of children aged 4-12 (valgus ankles "odwrócone V", flat feet "stopa jak żelazko", unevenly worn inner shoe heels, PE pain)'
        : 'Polish adults/seniors aged 45-70 (bunions/haluksy, heel spurs/ostroga piętowa, collapsed arches, knee/hip/back compensation, long shifts on feet)'
    }.
CRITICAL "HAGIA SOPHIA / BROSZURA" HOOK-CONGRUENCE RULE FOR ORTHOMAX (ZERO PRODUCT SHOEHORNING):
NEVER force the bright orange Orthomax insole or product box into every photo! All 12 scenes MUST have includeProductRef: false and MUST literally visualize the exact concrete Hook artifact, physical proof, shoe detail, diagnostic test, or receipt from the first 3 sentences of the copy in a bright, clean modern Polish home or clinic:
- If the Hook mentions unevenly worn shoe heels ("zdarte od wewnątrz obcasy", "podeszwa starta pod skosem", "3 pary butów wykrzywione do środka", "halówki z WF-u"): show a crisp first-person POV hand holding the everyday shoe or child's sneaker upside down clearly showing the inner heel edge ground down at a slant, or 3 pairs of shoes lined up from behind on a clean hallway floor all tilting inward!
- If the Hook mentions the wet footprint test on bathroom tiles ("mokry ślad stopy", "stopa płaska jak żelazko", "test mokrej stopy"): show a crisp iPhone 15 photo of wet bare footprints on matte grey bathroom tiles comparing a flat "iron-shaped" footprint with zero arch curve!
- If the Hook mentions a child's valgus ankles ("koślawe kostki", "odwrócone V", "uciekanie pięt do środka") or an adult's bunion/collapsed arch: show a crisp floor-level iPhone 15 shot from behind of bare feet standing on light oak panels clearly showing the ankles rolling inward!
- If the Hook mentions wasted money on pharmacy gels, heel pads, or rigid insoles ("wydałam 340 zł / 480 zł w aptece", "paragon", "maści i podpiętki w koszu") or an X-ray / orthopedic referral ("ostroga piętowa", "RTG", "skierowanie"): show a basket of half-used foot pain gel tubes and flat foam insoles next to a crisp Polish receipt ("PARAGON FISKALNY — RAZEM: 340,00 ZŁ") or a printed Polish orthopedic diagnostic card ("DIAGNOSTYKA STOPY: Koślawość pięty i zapadnięty łuk podłużny") on a wooden table!${extra}`;
  }
  if (brand === 'mellow-uk') {
    return `BRAND & AUDIENCE: Mellow Mood Munchies UK (saffron gummies for calm, focus & emotional balance).
CRITICAL "HAGIA SOPHIA / BROSZURA" HOOK-CONGRUENCE RULE FOR MELLOW UK (ZERO PRODUCT SHOEHORNING):
NEVER force the Mellow pouch into every photo! All 12 scenes MUST have includeProductRef: false and MUST literally visualize the exact concrete Hook artifact, school email, note, or UK home moment from the first 3 sentences of the copy.${extra}`;
  }
  return `MARKET & AUDIENCE: ${
    market === 'uk'
      ? 'United Kingdom (bright, clean, contemporary everyday British homes, kitchens, stairs, gardens, right-hand-drive UK cars)'
      : 'Poland (bright, clean, contemporary modern Polish apartments, houses, kitchens, gardens, modern clinics, left-hand-drive cars - strictly NO gloomy Soviet-era grime)'
  }. Infer the exact product, target demographic, symptoms, and real locations directly from skrypt.txt and instruction.txt. NEVER force the commercial product packshot into the photo (includeProductRef: false on all scenes).${extra}`;
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
    const isTurkey = /stambuł|turcj|17\s*000|przeszczep|lot\s+do|zalicz/i.test(lower);
    const isLeaflet = /ulotk|recept|skutki uboczne|libido|erekcj|tabletk/i.test(lower);
    const isSls = /laureth|lauryl|\bsls\b|2\.\s*słowo|drugie słowo|skład|7:00 rano|14:00/i.test(lower);
    const isShortAnagen = /2\s*cm|1,5\s*cm|8 na 10|21 dni|anagen|krótkie włos/i.test(lower);
    const isUsbMicroscope = /mikroskop\s*usb|79\s*zł|1-2\s*mm|pajęczyn/i.test(lower);
    const isTwoFingers = /test\s*2\s*palc|nad uchem|czepiec|paznokcie|woskowy czop/i.test(lower);
    const isWcierki = /wcierk|320\s*zł|serum|pipet|chodnik/i.test(lower);
    const isBarber = /fryzjer|barber|strzygę|1991|myjk|maszynk|3\s*mm/i.test(lower);

    const hookScene1: NativeIphoneSceneSpec = isTurkey
      ? {
          label: '1. [HOOK TURCJA] Hagia Sophia w Stambule i broszura kliniki przeszczepu „17 000 ZŁ” na stoliku',
          includeProductRef: false,
          scenePrompt:
            'Clean, sharp first-person iPhone 15 photo at an outdoor cafe table in Istanbul with the famous Hagia Sophia clearly visible in the background under natural daylight: on the wooden table next to a glass of Turkish tea lies a glossy clinic folder reading clearly in Polish "STAMBUŁ HAIR CLINIC — PAKIET 17 000 ZŁ" with a hair graft diagram.',
        }
      : isLeaflet
      ? {
          label: '1. [HOOK ULOTKA] Rozłożona ulotka z apteki w aucie z zakreślonymi skutkami ubocznymi + recepta',
          includeProductRef: false,
          scenePrompt:
            'Clean, sharp first-person iPhone 15 POV photo inside a parked car: a man’s hand holding an unfolded white Polish pharmacy medication leaflet reading "ULOTKA DLA PACJENTA — Częste działania niepożądane: spadek libido, zaburzenia erekcji" circled in red pen, next to a crumpled prescription slip.',
        }
      : isSls
      ? {
          label: '1. [HOOK SKŁAD INCI] Palec wskazujący „Sodium Laureth Sulfate (SLS)” na tyle drogeryjnego szamponu',
          includeProductRef: false,
          scenePrompt:
            'Clean, sharp first-person iPhone 15 close-up POV photo in a bright bathroom: a hand holding a generic plastic supermarket shampoo bottle turned to its back label, pointing a finger directly at "INGREDIENTS (INCI): Aqua, Sodium Laureth Sulfate (SLS)" circled in red marker.',
        }
      : isUsbMicroscope
      ? {
          label: '1. [HOOK MIKROSKOP USB] Ręczny mikroskop USB za 79 zł podłączony do laptopa z obrazem 1-2 mm włosków',
          includeProductRef: false,
          scenePrompt:
            'Clean, sharp iPhone 15 photo on a wooden home desk: a small black handheld digital USB microscope connected by cable to a laptop screen displaying 200x scalp skin with dozens of tiny 1-2 mm sprouting hairs, next to a small box labeled "MIKROSKOP USB 200X — 79 ZŁ".',
        }
      : isShortAnagen
      ? {
          label: '1. [HOOK 2 CM VS DŁUGI] Porównanie 1,5 cm krótkich włosków (21 dni) vs grubych włosów (4 lata)',
          includeProductRef: false,
          scenePrompt:
            'Clean, sharp first-person iPhone 15 macro photo on a white bathroom card: on the left 6 tiny thin 1.5 cm hairs labeled "21 DNI (SKRÓCONY ANAGEN < 2 CM)" vs on the right 3 long thick dark 6 cm hairs labeled "4 LATA (PEŁNY CYKL)".',
        }
      : isWcierki
      ? {
          label: '1. [HOOK WCIERKI 320 ZŁ] 4 apteczne buteleczki z pipetą i paragon 320 zł wyrzucone przy umywalce',
          includeProductRef: false,
          scenePrompt:
            'Clean, sharp first-person iPhone 15 POV photo by a white bathroom sink: 4 half-used pharmacy hair-growth dropper bottles and glass ampoules tossed into a small basket with a pharmacy receipt showing "RAZEM: 320,00 ZŁ" while a dropper is poured into the sink drain.',
        }
      : isTwoFingers
      ? {
          label: '1. [HOOK TEST 2 PALCÓW] Karta diagnostyczna trychologa „Nad uchem vs Czubek głowy (czop DHT)”',
          includeProductRef: false,
          scenePrompt:
            'Clean, sharp first-person iPhone 15 photo on a trichologist desk: a printed Polish diagnostic sheet titled "TEST 2 PALCÓW — DIAGNOSTYKA SKÓRY GŁOWY" comparing "1. NAD UCHEM: Miękka skóra + otwarty mieszek" vs "2. CZUBEK GŁOWY: Napięty czepiec + woskowy czop DHT" pointed at with a silver pen.',
        }
      : isBarber
      ? {
          label: '1. [HOOK BARBERSHOP] Wyłączona maszynka do golenia na konsoli fryzjerskiej i dłoń starego fryzjera',
          includeProductRef: false,
          scenePrompt:
            'Clean, sharp first-person iPhone 15 POV photo from a barber chair in a traditional Polish men’s barbershop: a switched-off metal hair clipper with a 3 mm guard lying on the wooden counter next to steel barber shears and a comb.',
        }
      : {
          label: '1. [HOOK PRYSZNIC] Żona przy otwartej kabinie prysznicowej czyszcząca chusteczką odpływ w brodziku',
          includeProductRef: false,
          scenePrompt:
            'Clean, sharp candid iPhone 15 photo from a Polish bathroom doorway: a 37-year-old woman kneeling beside the slid-open glass door of a walk-in shower, reaching her hand with a white paper tissue inside the white shower tray (brodzik) to clean dark wet hair from the chrome shower drain inside the cabin (no drain on the dry floor outside).',
        };

    baseTwelve = [
      hookScene1,
      {
        label: '2. [HOOK REZERWACJA / DOKUMENT] Anulowana rezerwacja lotu WAW -> STAMBUŁ (17 000 zł) i polski paszport',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 photo on a home desk: a printed booking sheet reading "WARSZAWA (WAW) -> STAMBUŁ (IST) — PAKIET 17 000 ZŁ" with a red stamp "REZERWACJA ANULOWANA" lying next to a maroon Polish passport.',
      },
      {
        label: '3. [HOOK TRICHOSCOPE 200X] Ekran mikrokamery 200x u trychologa: żółty czop łojowy DHT vs otwarty mieszek',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 photo in a Polish trichologist office: a computer monitor displaying a 200x trichoscope view of scalp hair follicles (left: follicles blocked by yellowish waxy sebum-DHT plugs; right: clean open follicles with thick dark hair shafts) pointed at with a doctor pen.',
      },
      {
        label: '4. [HOOK SKŁAD SLS] Zbliżenie na etykietę INCI szamponu z drogerii z zakreślonym Sodium Laureth Sulfate',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 macro POV photo in a bathroom: a hand holding a plastic supermarket shampoo bottle turned to the back ingredient list and pointing a finger at "INGREDIENTS: Aqua, Sodium Laureth Sulfate (SLS)" circled in red.',
      },
      {
        label: '5. [HOOK KRÓTKIE WŁOSKI] 2-centymetrowe zminiaturyzowane włoski na brzegu białej umywalki',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 close-up photo of a white porcelain bathroom sink edge showing several short 1.5-2 cm thin hairs next to a clean chrome faucet in morning light.',
      },
      {
        label: '6. [HOOK ULOTKA APTECZNA] Ulotka tabletek na łysienie z podkreślonymi skutkami ubocznymi',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 POV photo holding an unfolded Polish medication leaflet reading "ULOTKA DLA PACJENTA — Częste działania niepożądane: spadek libido, zaburzenia erekcji" underlined in red pen.',
      },
      {
        label: '7. [HOOK WCIERKI 320 ZŁ] Apteczne wcierki i pipety odstawione do koszyka przy umywalce',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a bathroom counter: 4 small glass dropper hair-serum bottles and ampoules gathered inside a small wire basket next to a pharmacy receipt reading "320,00 ZŁ".',
      },
      {
        label: '8. [KARTKA OD TRYCHOLOGA] Odręczna notatka lekarza „Szampon SARDIAN (żeń-szeń + rdest + Biota Orientalis)”',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a wooden consultation desk: a small white notepad slip with natural blue ballpoint Polish handwriting reading ONLY "Szampon SARDIAN (żeń-szeń + rdest wielokwiatowy + Biota Orientalis)" next to reading glasses and a silver pen.',
      },
      {
        label: '9. [CZYSTE SITKO BRODZIKA] Czyste stalowe sitko odpływu w dłoni po prysznicu (zero wypadających włosów)',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 POV photo inside a modern walk-in shower: a man’s wet hand holding up a completely clean stainless-steel shower drain strainer with zero hair on it under warm bathroom light.',
      },
      {
        label: '10. [CZYSTY GRZEBIEŃ PO MYCIU] Czarny męski grzebień bez ani jednego włosa na ręczniku po kąpieli',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 POV photo on a bathroom countertop right after a shower: a dark men’s hair comb (completely clean with zero fallen hairs) resting on a folded dark-grey towel.',
      },
      {
        label: '11. [HOOK HAGIA SOPHIA WIDOK] Zdjęcie Hagia Sophia w Stambule z perspektywy turysty (kąt tureckiej kliniki)',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 travel photograph of Hagia Sophia in Istanbul from Sultanahmet square in warm afternoon daylight, looking 100% like a real smartphone photo snapped by a Polish tourist.',
      },
      {
        label: '12. [HOOK MIKROSKOP USB] Domowy mikroskop USB za 79 zł podłączony do laptopa z obrazem 1-2 mm włosków',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo on a wooden home desk: a small black handheld digital USB microscope connected by cable to a laptop screen displaying 200x scalp skin with dozens of tiny 1-2 mm sprouting vellus hairs, next to a small courier box labeled "MIKROSKOP CYFROWY USB 200X - 79 ZŁ".',
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
        label: '12. [KOT NA KANAPIE BEZ FOLII] Spokojny kot leżący na czystej kanapie w słonecznym polskim salonie',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish living room: a relaxed tabby cat resting peacefully on a clean grey fabric sofa in warm afternoon daylight.',
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
          ? 'Clean, bright, sharp first-person POV iPhone 15 Pro photo in a newly renovated modern Polish apartment corridor with clean white walls: a woman hand holding house keys in front of her sleek walnut apartment door where a squared notebook sheet taped with grey tape reads in bold black marker: "ZRÓBCIE COŚ Z TYM PSEM! WYJE OD 8:00 DO 16:00".'
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
        label: '12. [SPOKOJNY PIES W PRZEDPOKOJU] Pies śpiący spokojnie na legowisku przy czystych drzwiach',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish apartment hallway: a calm dog sleeping peacefully on its soft bed near the front door in warm daylight (strictly ZERO cats).',
      },
    ];
  } else if (brand === 'orthomax') {
    const isDzieci = segment === 'dzieci' || /dziec|syn|córk|szkoł|wf|przedszkol|halówk|kapci/i.test(lower);
    const hasWetFoot = /mokr|żelazk|łazien|ślad|kafelk/i.test(lower);
    const hasReceipt = /paragon|aptek|wydałam|wydałem|\d+\s*zł|rachunek/i.test(lower);
    const hasSorOrXray = /sor|rtg|prześwietlen|ostrog|haluks|operacj|skierowan/i.test(lower);
    const amountMatch = params.primaryText.match(/(\d[\d\s]{1,5})\s*zł/i);
    const detectedPln = amountMatch?.[1]?.trim() || '340';
    baseTwelve = [
      {
        label: isDzieci
          ? '1. [HOOK OBRAZ #1] Podeszwy dziecięcych butów starte pod skosem od wewnętrznej strony'
          : '1. [HOOK OBRAZ #1] Podeszwy codziennych butów starte pod skosem od wewnątrz w przedpokoju',
        includeProductRef: false,
        scenePrompt: isDzieci
          ? 'Clean, sharp first-person iPhone 15 POV photo in a bright Polish apartment hallway: a mother’s hands holding her 9-year-old child’s indoor school sneakers (halówki) upside down, clearly showing the inner rubber heel edge worn down at a sharp diagonal slant.'
          : 'Clean, sharp first-person iPhone 15 POV photo in a bright Polish hallway: a hand holding a pair of everyday leather walking shoes upside down, clearly showing the inner heel rubber edge unevenly ground down at a slant.',
      },
      {
        label: hasWetFoot
          ? '2. [HOOK OBRAZ #2] Mokry ślad stopy płaski jak żelazko na płytkach w łazience'
          : isDzieci
            ? '2. [HOOK OBRAZ #2] Kostki dziecka uciekające do środka („odwrócone V”) na jasnych panelach'
            : '2. [HOOK OBRAZ #2] Bose stopy z zapadniętym łukiem i zaczerwienieniem na płytkach',
        includeProductRef: false,
        scenePrompt: hasWetFoot
          ? 'Clean, sharp top-down iPhone 15 photo on matte grey Polish bathroom floor tiles right after a bath: two wet footprints side by side showing a completely flat, wide imprint ("stopa jak żelazko") with zero medial arch curve.'
          : isDzieci
            ? 'Clean floor-level iPhone 15 photo in a bright Polish room: a 9-year-old child standing barefoot on oak laminate panels seen from behind from calves down, ankles visibly rolling inward ("odwrócone V" / valgus tilt).'
            : 'Clean, sharp iPhone 15 POV photo looking down in a bright Polish bathroom: bare feet standing on beige ceramic tiles showing a flattened medial arch and mild redness at the heel and bunion joint.',
      },
      {
        label: hasReceipt
          ? `3. [DOWÓD Z HOOKA] Paragon z apteki i bezużyteczne żelowe podpiętki (${detectedPln} zł w błoto)`
          : '3. [DOWÓD Z HOOKA] Spłaszczone cienkie wkładki z apteki obok zwykłych butów',
        includeProductRef: false,
        scenePrompt: hasReceipt
          ? `Clean, sharp first-person iPhone 15 photo on a wooden Polish home table: 3 flattened pharmacy gel heel pads and a half-used foot pain ointment tube lying next to a Polish thermal receipt with ONLY 2 large bold lines reading "PARAGON FISKALNY" and "RAZEM: ${detectedPln},00 ZŁ" (zero small-print text, zero insoles product box).`
          : 'Clean, sharp iPhone 15 photo in a Polish hallway: worn-out flat foam pharmacy insoles pulled out of everyday shoes resting on a wooden bench, compressed paper-thin under the heel.',
      },
      {
        label: hasSorOrXray
          ? '4. [DIAGNOSTYKA Z HOOKA] Karta informacyjna badania stóp / RTG pięty na biurku'
          : '4. [DIAGNOSTYKA Z HOOKA] Bose stopy na podświetlanym podoskopie diagnostycznym w gabinecie',
        includeProductRef: false,
        scenePrompt: hasSorOrXray
          ? 'Clean, sharp first-person iPhone 15 photo on a wooden consultation desk: a printed Polish orthopedic sheet with ONLY 3 large bold lines reading "BADANIE BIOMECHANICZNE STOPY", "ROZPOZNANIE: PRONACJA / PRZECIĄŻENIE PIĘTY", and "ZALECENIE: KOREKCJA OSI PIĘTY" next to reading glasses and a pen (zero small print).'
          : 'Clean, sharp iPhone 15 photo in a bright Polish rehabilitation room: bare feet standing on a glowing green glass diagnostic podoscope mirror clearly showing flat-foot pressure distribution.',
      },
      {
        label: '5. [TEST 3 PAR BUTÓW] 3 pary butów ustawione w rzędzie od tyłu z przekrzywionymi zapiętkami',
        includeProductRef: false,
        scenePrompt:
          'Clean floor-level iPhone 15 photo in a bright Polish apartment hallway: 3 pairs of everyday shoes lined up from behind on oak flooring, all showing the exact same inward tilt of the heel counters.',
      },
      {
        label: '6. [EKSPERT FIZJOTERAPEUTA] Polski fizjoterapeuta tłumaczący biomechanikę stopy w gabinecie',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish physiotherapy office: physiotherapist hands in navy scrubs holding a clean everyday shoe and pointing with a pen at the heel counter to demonstrate how heel axis collapse affects the knee.',
      },
      {
        label: '7. [SZAFKA PRÓB] Odstawione maści przeciwbólowe, wałek do stóp i cienkie żelowe podpiętki',
        includeProductRef: false,
        scenePrompt:
          'Clean iPhone 15 photo on a tidy bathroom shelf: several half-used foot pain gel tubes, silicone toe separators, and flat gel heel pads pushed aside into a small basket.',
      },
      {
        label: '8. [KARTKA OD FIZJOTERAPEUTY] Notatka „wkładki Orthomax StepMax” na stole obok herbaty',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 POV photo at a wooden Polish kitchen table: reading glasses, a mug of tea, and a small white doctor notepad slip with ONLY 2 large clear handwritten Polish lines reading "wkładki Orthomax StepMax" and "(podparcie łuku + stabilizacja pięty)".',
      },
      {
        label: isDzieci
          ? '9. [MOMENT Z HISTORII] Dziecko siedzące na ławce w szatni obok butów na zmianę'
          : '9. [MOMENT Z HISTORII] Moczenie zmęczonych stóp w misce z ciepłą wodą wieczorem',
        includeProductRef: false,
        scenePrompt: isDzieci
          ? 'Clean, sharp iPhone 15 photo in a bright school hallway bench: a 9-year-old Polish child sitting in tracksuits holding his heel next to his indoor gym shoes.'
          : 'Clean, warm indoor iPhone 15 photo in a tidy Polish bathroom: bare feet soaking in a clean white basin of warm water with a folded grey towel beside it.',
      },
      {
        label: '10. [BADANIE W GABINECIE] Fizjoterapeuta pokazujący dłonią prawidłowe wysklepienie łuku stopy',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a Polish physiotherapy room: physiotherapist hands gently supporting a patient’s bare foot above a treatment couch to demonstrate natural medial arch alignment.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Swobodny spacer po słonecznej alejce w polskim parku',
        includeProductRef: false,
        scenePrompt:
          'Clean, bright daytime iPhone 15 photo on a sunny Polish park path: seen from a natural candid angle, comfortable walking in everyday sneakers on a leafy footpath.',
      },
      {
        label: '12. [PRZEDPOKÓJ PO ZMIANIE] 2 pary prostych, zadbanych butów gotowych do wyjścia w przedpokoju',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright Polish hallway: two pairs of comfortable everyday walking shoes standing straight and neatly by the front door in warm morning light.',
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
        label: '12. [CALM AFTERNOON] Peaceful British living room in warm afternoon light',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo in a bright British kitchen worktop next to a kettle and mug in warm afternoon daylight.',
      },
    ];
  } else {
    const isFemaleNarrator = /zrobiłam|poszłam|miałam|męża|córka zarezerwowała|tańczyłam|wannie|toalety|babcia/i.test(lower);
    const hasNfzOrSurgery = /nfz|skierowan|operacj|endoprotez|ortoped|szpital|kolejk/i.test(lower);
    const amountMatch = params.primaryText.match(/(\d[\d\s]{1,5})\s*zł/i);
    const detectedPln = amountMatch?.[1]?.trim() || '280';
    baseTwelve = [
      {
        label: '1. [HOOK OBRAZ #1] Zatrzymanie się w połowie domowych schodów z dłonią na bolącym kolanie',
        includeProductRef: false,
        scenePrompt: `Clean, sharp first-person/candid iPhone 15 photo on a bright Polish home wooden staircase: an ordinary ${
          isFemaleNarrator ? '66-year-old Polish woman in cardigan and trousers' : '65-year-old Polish man in sweater and trousers'
        } pausing mid-step with one hand gripping the wooden banister and the other pressing just below their aching kneecap.`,
      },
      {
        label: '2. [HOOK OBRAZ #2] Czerwone odgniecenia na kolanie po grubej opasce uciskowej z apteki',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp indoor iPhone 15 POV photo in a bright Polish living room: rolled-up trouser leg of a 65-year-old person sitting on a sofa showing red elastic pressure marks around the knee left by a thick, stretched-out beige pharmacy knee sleeve lying discarded beside them.',
      },
      {
        label: hasNfzOrSurgery
          ? '3. [DOKUMENT Z HOOKA] Skierowanie do poradni ortopedycznej / kolejka NFZ na stole'
          : `3. [DOWÓD Z HOOKA] Tubki maści końskich, żeli i paragon z apteki (${detectedPln} zł)`,
        includeProductRef: false,
        scenePrompt: hasNfzOrSurgery
          ? 'Clean, sharp first-person iPhone 15 photo on a wooden Polish kitchen table next to reading glasses: a printed Polish medical referral sheet with ONLY 3 large bold lines reading "SKIEROWANIE DO PORADNI ORTOPEDYCZNEJ", "ROZPOZNANIE: PRZECIĄŻENIE STAWU KOLANOWEGO", and "TERMIN NFZ: ZA 14 MIESIĘCY" (zero small-print text).'
          : `Clean, sharp first-person iPhone 15 photo on a wooden Polish table: 3 half-squeezed joint pain gel tubes, a green horse-balm jar, and a Polish thermal receipt with ONLY 2 large bold lines reading "PARAGON FISKALNY - APTEKA" and "RAZEM: ${detectedPln},00 ZŁ" (zero small-print text).`,
      },
      {
        label: '4. [MECHANIZM 2 PALCÓW] Dłoń wskazująca punkt 2 palce poniżej rzepki na więzadle',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp close-up iPhone 15 photo in natural window light: an older person sitting on a sofa with trouser leg rolled up, placing two fingers horizontally just below the kneecap on the patellar tendon (zero brace on the knee).',
      },
      {
        label: '5. [STARE ORTEZY W KĄCIE] Rozciągnięte opaski z apteki i zsuwające się rękawy uciskowe',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp iPhone 15 photo on a Polish home table: three stretched-out beige and grey pharmacy elastic knee sleeves and half-used joint ointment tubes laid aside.',
      },
      {
        label: '6. [FOTEL KIEROWCY] Dłoń podtrzymująca kolano przy wysiadaniu z samochodu na parkingu',
        includeProductRef: false,
        scenePrompt:
          'Clean daytime iPhone 15 photo by an open left-hand-drive car door: a 64-year-old Polish person stepping out onto a parking lot while supporting their right knee with their hand.',
      },
      {
        label: '7. [EKSPERT FIZJOTERAPEUTA] Polski fizjoterapeuta 56 lat w granatowym stroju w jasnym gabinecie',
        includeProductRef: false,
        scenePrompt:
          'Clean, natural iPhone 15 photo in a bright Polish rehabilitation room: a 56-year-old Polish male orthopedic physiotherapist in plain navy scrubs and glasses sitting by a consultation desk, calm trustworthy expression, plain clean wall.',
      },
      {
        label: '8. [KARTKA OD FIZJOTERAPEUTY] Czytelna notatka „pasek podrzepkowy SARDIAN” obok okularów',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp first-person iPhone 15 POV photo on a wooden Polish kitchen table: reading glasses, tea glass, and a small white notebook slip with ONLY 2 large clear handwritten Polish lines reading "pasek podrzepkowy SARDIAN" and "(punkt 2 palce pod rzepką)".',
      },
      {
        label: '9. [SZAFKA PRÓB] Puszki kolagenu do picia i maści odstawione na kuchennym blacie',
        includeProductRef: false,
        scenePrompt:
          'Clean iPhone 15 photo on a tidy Polish kitchen counter next to a kettle: two opened collagen powder tubs, glucosamine blister packs, and green horse-balm jars pushed aside.',
      },
      {
        label: '10. [DZIAŁKA / OGRÓD] Chwila odpoczynku na ławce na zadbanej polskiej działce ROD',
        includeProductRef: false,
        scenePrompt:
          'Clean sunny iPhone 15 photo on a green Polish garden allotment (ROD): a 66-year-old Polish person sitting on a wooden bench beside garden beds in natural daylight.',
      },
      {
        label: '11. [EFEKT CODZIENNY] Swobodne schodzenie ze schodów w domu w słoneczny dzień',
        includeProductRef: false,
        scenePrompt:
          'Clean bright daytime iPhone 15 photo: a smiling 66-year-old Polish person walking comfortably down wooden home stairs in natural sunlight.',
      },
      {
        label: '12. [SPACER W SŁOŃCU] Swobodny spacer po słonecznej alejce parkowej bez bólu kolana',
        includeProductRef: false,
        scenePrompt:
          'Clean, sharp daytime iPhone 15 photo on a sunny Polish footpath: a smiling 65-year-old Polish person walking comfortably outdoors.',
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
      ? `MARKET SETTING: UNITED KINGDOM (bright, clean, tidy, contemporary modern British homes, kitchens, hallways, gardens, right-hand-drive UK cars taken strictly from THIS script).`
      : `MARKET SETTING: POLAND (bright, clean, tidy, newly renovated contemporary modern Polish apartments — clean white/warm-beige walls, light oak flooring, sleek modern front doors, sunlit Scandinavian-style Polish living rooms, spotless white bathrooms, modern bright veterinary clinics, left-hand-drive cars — STRICTLY NEVER write "block-of-flats", "post-Soviet", "Eastern European", "modest", "cluttered", "stained", or "peeling"!).`;

  const lastSceneNum = targetCount;

  try {
    const client = brainClient(brainOptions(45_000));

    const systemPrompt = `You are the Direct-Response Native Creative Director creating BRIGHT, SPOTLESS, RAZOR-SHARP 1:1 square iPhone 15 Pro photo prompts (matching top viral Reddit/Wykop/Facebook group posts) that match the ad copy Hook 1:1 ("Hagia Sophia / Broszura Method").

${buildBrandDirectorContext(params.brand, resolvedMarket, params.segment, params.instructionText)}
${localeRules}

CRITICAL RULE #0 — ZERO PRODUCT SHOEHORNING ("NIE WPYCHAJ PRODUKTU DO NATYWÓW"):
- NEVER put the advertised product bottle/box/packshot into the photo! Putting a product bottle in a Native Ad photo immediately screams "commercial ad" and kills CTR.
- ALL ${targetCount} scenes MUST have "includeProductRef": false and MUST depict 100% real-world Hook artifacts, locations, documents, labels, gadgets, or everyday moments from the story WITHOUT the product!

CRITICAL RULE #1 — 100% LITERAL MATCH TO THE HOOK & COPY ("HAGIA SOPHIA / BROSZURA METHOD"):
Every photo MUST come directly from the specific nouns, places, numbers, documents, threats, and symptoms written in the FIRST 3 SENTENCES (the Hook) of THIS exact script!
- Read the FIRST 3 PARAGRAPHS (the Hook) word for word.
- Scenes 1, 2, 3, 4, 5, and 6 MUST be 6 distinct, scroll-stopping, literal visual angles of the EXACT HOOK of THIS copy:
  * Example A (Turkey / 17 000 zł transplant / cancelled flight): Show Hagia Sophia in Istanbul with a Turkish hair clinic brochure ("STAMBUŁ HAIR CLINIC — 17 000 ZŁ") on a cafe table, OR a printed flight reservation "WARSZAWA (WAW) -> STAMBUŁ (IST)" stamped "REZERWACJA ANULOWANA" next to a Polish passport!
  * Example B (Pharmacy leaflet / dermatologist prescription thrown away): Show a hand in a parked car holding an unfolded Polish medication leaflet ("ULOTKA DLA PACJENTA — Częste działania niepożądane: spadek libido, zaburzenia erekcji") circled in red pen next to a crumpled prescription!
  * Example C (SLS / Sodium Laureth Sulfate on back of shampoo): Show a close-up POV hand holding a generic supermarket shampoo bottle turned to its back INCI ingredient label, pointing a finger directly at "Aqua, Sodium Laureth Sulfate (SLS)" circled in red!
  * Example D (Short 1.5-2 cm hairs / 21-day anagen vs 4-year cycle, or 79 zł USB microscope, or 2-finger scalp test, or 320 zł serums poured down sink): Show the exact physical comparison card, the USB digital microscope connected to a laptop showing 200x sprouting hairs, the trichologist "TEST 2 PALCÓW" diagram sheet, or the dropper being poured into the sink drain next to a 320 zł receipt!
  * Example E (Wife cleaning shower drain / angry neighbor note on door / pet anxiety): Show the exact real-world scene (e.g. wife kneeling by the open walk-in shower door reaching her hand with a tissue INSIDE the white shower tray/brodzik to clean hair from the shower drain; or the neighbor's note taped to the apartment door).

CRITICAL RULE #2 — BRIGHT & CLEAN MODERN iPHONE 15 PRO ENGINE (ZERO "OBSKURNE" / SHABBY ROOMS):
- Every image MUST be set in a BRIGHT, CLEAN, TIDY, CONTEMPORARY MODERN environment with soft natural daylight or warm balanced home lighting.
- Prefer first-person POV shots (hands, documents, labels, gadgets, real expressive pets, story props) or natural candid medium shots — AVOID awkward passport-style close-up AI human faces staring straight into a wide-angle lens!
- STRICTLY FORBIDDEN: NEVER use words like "block-of-flats", "post-Soviet", "grimy", "shabby", "cluttered", "stained mug", "peeling paint", "greasy lens", "blown-out highlights", "harsh flash", "mirror flash glare", "blurry", "grainy", "dark", "dim", or "crooked"!
- STRICTLY NO UI ARTIFACTS OR TIMESTAMPS: NEVER include camera date/time stamps and NEVER generate fake tablet/phone screenshot UI bars!

CRITICAL RULE #3 — ZERO DINOSAUR SKULLS, ZERO BURNT STICKS, ZERO GARBAGE BINS, ZERO SMALL-PRINT GIBBERISH:
- NEVER generate plastic anatomical skulls, animal skeletons, or bone models (100% BANNED!).
- NEVER generate burnt/charred black diffuser wicks (100% BANNED!).
- NEVER generate open trash/garbage bins!
- When a scene includes a document, brochure, leaflet, or label with Polish text, specify ONLY 2 to 4 large, bold, crystal-clear Polish lines and explicitly instruct: "strictly NO tiny unreadable small-print paragraphs or gibberish text".

SCENE STRUCTURE (EXACTLY ${targetCount} SCENES — ALL WITH includeProductRef: false):
- Scenes 1–6: 6 bright, crisp, literal visual Hook variations of Paragraphs 1–3 of THIS copy (highest scroll-stop power, 100% Hook-congruent!).
- Scenes 7–10: 4 concrete discovery / mechanism scenes from the middle of THIS copy (e.g. 200x trichoscope screen, diagnostic diagram, handwritten doctor slip on a wooden table, ingredient comparison).
- Scenes 11–${lastSceneNum}: Clean, authentic everyday payoff moments from THIS copy (all with includeProductRef: false — ZERO commercial product packshots!).

Return ONLY valid JSON:
{
  "scenes": [
    {
      "label": "1. [HOOK] Krótki polski opis sceny z tego copy (max 70 znaków)",
      "scenePrompt": "Detailed English prompt for a clean, sharp modern iPhone 15 photo matching the exact scene (strictly NO product bottle/packshot)...",
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

    return Array.from({ length: targetCount }, (_, idx) => {
      const candidate = parsed.scenes?.[idx];
      const fb = fallback[idx];
      const rawLabel = stripClinicSignTokens(candidate?.label || fb.label || `${idx + 1}. Native scene`, resolvedMarket);
      const numberedLabel = /^\d+\./.test(rawLabel) ? rawLabel : `${idx + 1}. ${rawLabel}`;
      const scenePrompt = stripClinicSignTokens(candidate?.scenePrompt || fb.scenePrompt, resolvedMarket);
      return {
        label: numberedLabel,
        scenePrompt,
        includeProductRef: false,
      };
    });
  } catch {
    return fallback;
  }
}
