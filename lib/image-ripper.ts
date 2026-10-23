import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { accountEnv, requiredAccountEnv } from './account-context';
import { brainClient, brainOptions, assertBrain } from './account-brain';
import { getProducts, type Product } from './products';
import { isMellowSaffronTarget, canonicalMellowSaffronName } from './mellow-saffron-brand';
import { copyReferenceLabel } from './product-reference';

export type RipperAspectRatio = '1:1' | '3:4' | '4:5' | '9:16' | '16:9' | 'auto';
export type KieRipperModel =
  | 'nano-banana-pro'
  | 'gpt-image-2-image-to-image'
  | 'recraft/crisp-upscale';

export interface RipperVisionAnalysis {
  headline?: string;
  subheadline?: string;
  layoutType?: string;
  visualHook?: string;
  backgroundMode?: 'light-ice-blue' | 'dark-navy' | 'lifestyle';
  textReplacements?: string[];
  tailoredPrompt?: string;
}

export const DEFAULT_MELLOW_REFERENCES = [
  {
    id: 'mellow-packshot-front-uk',
    label: 'Packshot Front UK — Pouch + Żelki',
    path: '/brand-references/mellow-packshot-front-uk.jpg',
  },
  {
    id: 'mellow-packshot-30-servings',
    label: 'Packshot Studio — 30 Servings | 60 Gummies',
    path: '/brand-references/mellow-packshot-30-servings.jpg',
  },
  {
    id: 'mellow-packshot-spilling-gummies',
    label: 'Packshot Pochylony — Wysypujące się żelki-kwiatki',
    path: '/brand-references/mellow-packshot-spilling-gummies.jpg',
  },
] as const;

export const MELLOW_RIPPER_BRAND_BOOK = `
=== MELLOW — MOOD MUNCHIES (UK SAFFRON GUMMIES) OFFICIAL BRAND BOOK & PDP SPEC ===
Source PDP: https://try-mellow.co/products/mellow-happy-chews-saffron-gummies

1. BRAND & PRODUCT IDENTITY:
- Brand Wordmark: "mellow" in lowercase, rounded bold dark-navy (#102D46) typography with a curved smile line beneath the double "ll".
- Product Name: "Mood munchies" — Saffron Gummies for Mood & Focus.
- Regulatory Category (UK): "Food Supplement" (NEVER use US "Dietary Supplement").

2. PACKAGING / STAND-UP POUCH (EXACT MATCH TO REFERENCE IMAGE):
- Pouch Body: Matte light sky-blue (#B5E2FA / #BCE3FA) stand-up resealable pouch.
- Top Center: "mellow" dark-navy wordmark with the signature smile curve beneath "ll".
- Top Right Pill Text (in soft pink #F6A4C7): "30 SERVINGS | 60 GUMMIES".
- Center Title: Bold dark-navy (#102D46) "Mood munchies".
- Center Mascot: Cute round pink character with glasses giving a thumbs-up, flanked by two pink 4-point sparkles.
- Flavour Badge: Circular badge reading "NATURAL BERRIES FLAVOUR" (UK spelling).
- Bottom Band: "SAFFRON GUMMIES FOR MOOD & FOCUS*" and "Food Supplement".
- NEVER render purple pouches, dark violet pouches, "Vitamood", "Moodi", "Magic Stix" stick packs, or generic bottles.

3. GUMMY SHAPE & STUDIO PROPS:
- Gummies: Glossy vibrant red / berry-red 5-petal flower-shaped gummies.
  * NEVER render gummy bears.
  * NEVER render orange sugar-coated bears.
  * NEVER render powder stick packs ("Magic Stix") or red liquid drink glasses.
- Botanical & Fruit Props: Fresh purple saffron crocus flower (Crocus sativus) resting on vibrant crimson-red saffron stigmas/threads, paired with fresh raspberries, blueberries, and blackberries.

4. STRICT COLOUR PALETTE & TYPOGRAPHY:
- Light Studio Mode: Clean matte pale ice-blue studio gradient (#DCECF5 to #EDF7FA) or warm cream/sky split.
- Dark Dramatic Mode: Deep Mellow navy (#102D46 to #0D2336) with warm golden rim-lighting around the pouch and saffron threads.
- Typography & CTA Buttons: Deep navy (#102D46) bold sans-serif headlines; rounded pill CTA buttons in #102D46 with crisp white text ("Try Mood Munchies" or "Shop Mood Munchies"); soft pink (#F6A4C7) secondary badge accents; coral (#FF6B6B) or gold (#F5B849) review stars.
- FORBIDDEN COMPETITOR COLOURS: Zero competitor purple/violet/lavender (#DBD3FF, #6F42C1, purple studio backgrounds, or purple lighting).

5. OFFERS & BUNDLES (FROM UK PDP):
- 1 Pack (30 servings / 60 gummies) — £29.99
- Buy 2 Get 1 Free (3 Packs — Most Popular)
- Buy 3 Get 2 Free (5 Packs — Best Value)
- Trust Badges: "30-Day Money-Back Guarantee" & "Free UK Shipping"
- FORBIDDEN OFFERS: Never use Australian "EOFY Clearance Sale", never use "Buy 1 Get 1 Free / Buy 2 Get 2 Free", never use "$" or "AUD/USD" — always use "£" if currency is shown.

6. 100-DAY ROUTINE TIMELINE (WHEN AD IS A TIMELINE / PROGRESSION GRAPHIC):
- Day 7: Calmer mornings, smoother transitions, and fewer daily meltdowns.
- Day 30: Noticeably steadier focus, emotional balance, and calmer after-school hours.
- Day 100: Thriving daily routine — calm without sedation, the everyday version of your child.

7. FORMULA & UK COMPLIANCE:
- Active Formula: 30mg pure saffron extract (Crocus sativus) per 2-gummy serving + Vitamin D3, Vitamin B6, Vitamin B12, and Zinc.
- Clean Label Claims: Sugar-free, pectin-based, 100% vegan, gluten-free, non-GMO, no artificial colours or flavours, no melatonin, no stimulants, no crash.
- Strict British English: Always spell "colour", "flavour", "mum", "behaviour", "centre", "calmer", "Food Supplement", "Packed & dispatched in the UK". Strip all "Australia", "US", "FDA", or "Walmart" references.
`.trim();

export const MELLOW_SAFFRON_BRAND_FACTS = MELLOW_RIPPER_BRAND_BOOK;

export function detectAspectRatio(width?: number, height?: number): RipperAspectRatio {
  if (!width || !height || width <= 0 || height <= 0) return 'auto';
  const ratio = width / height;
  if (ratio <= 0.62) return '9:16';
  if (ratio >= 1.4) return '16:9';
  if (Math.abs(ratio - 1) <= 0.08) return '1:1';
  if (Math.abs(ratio - 0.8) <= 0.04) return '4:5';
  if (Math.abs(ratio - 0.75) <= 0.05) return '3:4';
  return ratio < 0.78 ? '3:4' : ratio < 0.92 ? '4:5' : '1:1';
}

export function isMellowProductSelection(productName: string, productContext = ''): boolean {
  if (!productName || /mellow|mood\s*munchies|saffron|kids\s*gummies/i.test(productName)) {
    return true;
  }
  return isMellowSaffronTarget(productName, productContext);
}

export function buildImageRipperPrompt(params: {
  productName: string;
  productContext?: string;
  visionAnalysis?: RipperVisionAnalysis;
  customInstructions?: string;
  aspectRatio?: string;
}): string {
  const rawName = params.productName?.trim() || 'Mellow Mood Munchies';
  const displayLabel = copyReferenceLabel(canonicalMellowSaffronName(rawName));
  const useMellowBook = isMellowProductSelection(rawName, params.productContext);
  const aspect = params.aspectRatio && params.aspectRatio !== 'auto' ? params.aspectRatio : 'source aspect ratio';
  const v = params.visionAnalysis;

  const sections: string[] = [
    `TASK: High-converting 2K direct-response ad creative rebranding (1:1 structural adaptation from Image #1 into our target brand "${displayLabel}").`,
    `HOW TO USE THE INPUT REFERENCE IMAGES (image_input):
- IMAGE #1 (FIRST IMAGE): This is the COMPETITOR SOURCE AD. Keep its exact visual hierarchy, layout structure, camera angle, grid/split-screen composition, callout arrow positions, and headline placement (${aspect}).
- IMAGES #2–#4 (SUBSEQUENT IMAGES): These are PURE, TEXT-FREE STUDIO PRODUCT PACKSHOTS of our "${displayLabel}" stand-up pouch and glossy red 5-petal flower-shaped gummies. Use Images #2–#4 strictly as the exact 3D/photographic reference for our pouch artwork, wordmark logo, pink mascot, and flower-shaped gummies. NEVER copy the plain studio podium/background from Images #2–#4 if Image #1 has a different scene or layout.
- Replace 100% of competitor branding, competitor logos ("Vitamood", "Moodi", "Magic Stix", "Olly", etc.), competitor packaging, and competitor product forms from Image #1 with our product packshot from Images #2–#4.`,
  ];

  if (useMellowBook) {
    sections.push(MELLOW_RIPPER_BRAND_BOOK);
    sections.push(
      `CRITICAL MELLOW VISUAL REPLACEMENT RULES:
- POUCH: Replace any product bottle, box, stick-pack, or purple pouch with the exact matte light sky-blue (#B5E2FA) "mellow Mood munchies" stand-up pouch from Images #2–#4 (dark navy #102D46 "mellow" logo with smile under "ll", pink "30 SERVINGS | 60 GUMMIES" top-right, cute pink mascot with glasses giving a thumbs up, "NATURAL BERRIES FLAVOUR" badge, "SAFFRON GUMMIES FOR MOOD & FOCUS*" and "Food Supplement").
- GUMMIES & PROPS: Replace any gummy bears, orange sugar-coated gummies, powder sticks, capsules, or red drink glasses with glossy vibrant berry-red 5-petal flower-shaped gummies (as shown in Images #2–#4), accompanied by a fresh purple saffron crocus flower (Crocus sativus) on crimson saffron threads and fresh berries (raspberries, blueberries, blackberries).
- COLOUR PALETTE: Eliminate all competitor purple/lavender/violet backgrounds (#DBD3FF, #6F42C1). Use either Mellow Pale Ice-Blue Studio (#DCECF5 to #EDF7FA) or Deep Mellow Navy (#102D46 to #0D2336) with #102D46 pill CTA buttons and #F6A4C7 soft pink accents.
- COPY & OFFERS: Use strict UK English ("colour", "flavour", "mum", "behaviour", "Food Supplement"). If an offer/sale badge appears, replace it with "BUY 2 GET 1 FREE" or "BUY 3 GET 2 FREE" (never "EOFY Clearance Sale" or "Buy 1 Get 1 Free"). If a Day timeline appears, use Day 7 / Day 30 / Day 100.`
    );
  }

  if (params.productContext?.trim()) {
    sections.push(`ADDITIONAL PRODUCT BRIEF CONTEXT:\n${params.productContext.trim().slice(0, 3500)}`);
  }

  if (v) {
    const visionLines: string[] = [];
    if (v.layoutType) visionLines.push(`- Detected Layout Type: ${v.layoutType}`);
    if (v.visualHook) visionLines.push(`- Visual Hook & Scene Structure: ${v.visualHook}`);
    if (v.backgroundMode) visionLines.push(`- Recommended Mellow Background Mode: ${v.backgroundMode}`);
    if (v.headline) visionLines.push(`- Primary Headline on Graphic (render crisply): "${v.headline}"`);
    if (v.subheadline) visionLines.push(`- Subheadline / Supporting Copy: "${v.subheadline}"`);
    if (v.textReplacements?.length) {
      visionLines.push(`- Specific Callout / Badge Text Replacements:\n  * ${v.textReplacements.join('\n  * ')}`);
    }
    if (v.tailoredPrompt) {
      visionLines.push(`- Scene-Specific Rebranding Directives: ${v.tailoredPrompt}`);
    }
    if (visionLines.length > 0) {
      sections.push(`VISION AI SCENE & COPY ADAPTATION:\n${visionLines.join('\n')}`);
    }
  }

  if (params.customInstructions?.trim()) {
    sections.push(`USER PRIORITY INSTRUCTIONS (OVERRIDE IF CONFLICTING):\n${params.customInstructions.trim()}`);
  }

  sections.push(
    `TYPOGRAPHY & RENDERING QUALITY:
- Render all English text on the graphic with razor-sharp, studio-grade 2K commercial typography, zero spelling errors, zero gibberish letters, and clean kerning.
- Photorealistic studio lighting, crisp pouch label text matching the attached Mellow packshot reference.`
  );

  return sections.join('\n\n');
}

export async function analyzeCompetitorAdWithVision(
  dataUrl: string,
  productName: string,
  productContext: string,
  customInstructions?: string,
  aspectRatio?: string
): Promise<{ prompt: string; visionAnalysis?: RipperVisionAnalysis }> {
  try {
    assertBrain();
    const client = brainClient(brainOptions(45000));
    const useMellow = isMellowProductSelection(productName, productContext);

    const systemPrompt = `You are an elite UK Direct-Response Creative Director & Visual Ad Cloner.
Your job is to inspect a competitor static ad image and plan a 1:1 structural rebrand for our target product: "${productName}".
${useMellow ? MELLOW_RIPPER_BRAND_BOOK : `Product Context:\n${productContext.slice(0, 4000)}`}

Return ONLY valid JSON with this exact shape:
{
  "headline": "Adapted main headline in British English tailored to our product (keep competitor hook structure)",
  "subheadline": "Adapted subheadline or secondary hook in British English (or empty string)",
  "layoutType": "Short description of layout (e.g. 'Split Us vs Them Comparison', 'Hero Packshot with 4 Benefit Callouts', 'Day 7/30/100 Timeline', 'Bundle Offer Showcase')",
  "visualHook": "Precise description of camera angle, subject placement, props, and visual hierarchy to preserve",
  "backgroundMode": "light-ice-blue" | "dark-navy" | "lifestyle",
  "textReplacements": ["Competitor text -> Our UK Mellow text", "..."],
  "tailoredPrompt": "Detailed paragraph explaining exactly how to recreate this specific ad layout with our light sky-blue Mellow Mood Munchies pouch, glossy red 5-petal flower gummies, saffron crocus flower on crimson threads, fresh berries, #DCECF5 pale ice-blue or #102D46 deep navy palette, and exact English copy on every badge/button."
}`;

    const userText = [
      `Analyze this competitor ad image and prepare the 1:1 rebranding specification for "${productName}".`,
      aspectRatio ? `Target aspect ratio: ${aspectRatio}.` : '',
      customInstructions?.trim() ? `Additional user instructions: ${customInstructions.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_completion_tokens: 1800,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned) as RipperVisionAnalysis;

    const prompt = buildImageRipperPrompt({
      productName,
      productContext,
      visionAnalysis: parsed,
      customInstructions,
      aspectRatio,
    });
    return { prompt, visionAnalysis: parsed };
  } catch {
    // Graceful fallback when no AI Brain key is configured or vision call fails
    const prompt = buildImageRipperPrompt({
      productName,
      productContext,
      customInstructions,
      aspectRatio,
    });
    return { prompt };
  }
}

const referenceUploadCache = new Map<string, string>();

export async function resolveKieApiKey(explicitKey?: string): Promise<string> {
  if (explicitKey?.trim()) return explicitKey.trim();
  const direct = accountEnv('KIE_API_KEY') || process.env.KIE_API_KEY;
  if (direct?.trim()) return direct.trim();
  try {
    const { accountRegistry } = await import('./account-repository');
    const reg = await accountRegistry();
    for (const u of Object.values(reg.users || {})) {
      const k = u?.values?.KIE_API_KEY;
      if (k && k.trim()) return k.trim();
    }
  } catch {
    // ignore registry lookup failure
  }
  return requiredAccountEnv('KIE_API_KEY');
}

export async function uploadBufferToKie(
  buffer: Buffer,
  fileName: string,
  mimeType = 'image/jpeg',
  apiKey?: string
): Promise<string> {
  const key = await resolveKieApiKey(apiKey);
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  form.append('file', blob, fileName);
  form.append('uploadPath', 'images/user-uploads');
  form.append('fileName', fileName);

  const res = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
    },
    body: form,
  });

  const json = (await res.json().catch(() => null)) as {
    code?: number;
    msg?: string;
    data?: { downloadUrl?: string; fileUrl?: string; url?: string };
  } | null;

  const downloadUrl = json?.data?.downloadUrl || json?.data?.fileUrl || json?.data?.url;
  if (!res.ok || !downloadUrl) {
    throw new Error(json?.msg || `Kie.ai file upload failed (HTTP ${res.status})`);
  }
  return downloadUrl;
}

export async function uploadPublicReferenceToKie(publicRelPath: string, apiKey?: string): Promise<string> {
  const key = await resolveKieApiKey(apiKey);
  const keyHash = createHash('sha256').update(key).digest('hex').slice(0, 12);
  const normalizedRel = publicRelPath.replace(/^\/+/, '');
  const cacheKey = `${keyHash}:${normalizedRel}`;
  const cached = referenceUploadCache.get(cacheKey);
  if (cached) return cached;

  const absPath = path.join(process.cwd(), 'public', normalizedRel);
  const buffer = await fs.readFile(absPath);
  const ext = path.extname(normalizedRel).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const uploadedUrl = await uploadBufferToKie(buffer, path.basename(normalizedRel), mimeType, key);
  referenceUploadCache.set(cacheKey, uploadedUrl);
  return uploadedUrl;
}

export function parseDataUrlToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string; ext: string } {
  const match = /^data:(image\/(jpeg|jpg|png|webp|gif));base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) {
    throw new Error('Nieprawidłowy format obrazu (wymagany data:image/jpeg|png|webp;base64,...)');
  }
  const mimeType = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
  const ext = match[2].toLowerCase() === 'jpg' ? 'jpg' : match[2].toLowerCase();
  const buffer = Buffer.from(match[3], 'base64');
  return { buffer, mimeType, ext };
}

export function buildKieCreateTaskPayload(params: {
  model: KieRipperModel;
  prompt?: string;
  imageUrls: string[];
  aspectRatio?: string;
  resolution?: '1K' | '2K' | '4K';
}) {
  const { model, prompt = '', imageUrls, aspectRatio, resolution } = params;
  if (model === 'recraft/crisp-upscale') {
    return {
      model: 'recraft/crisp-upscale' as const,
      input: {
        image: imageUrls[0],
      },
    };
  }
  if (model === 'gpt-image-2-image-to-image') {
    return {
      model: 'gpt-image-2-image-to-image' as const,
      input: {
        prompt,
        input_urls: imageUrls.slice(0, 4),
        aspect_ratio: 'auto' as const,
        resolution: '4K' as const,
      },
    };
  }
  const mappedRatio = aspectRatio === '4:5' ? '3:4' : aspectRatio || 'auto';
  return {
    model: 'nano-banana-pro' as const,
    input: {
      prompt,
      image_input: imageUrls.slice(0, 4),
      aspect_ratio: mappedRatio,
      resolution: resolution || '2K',
      output_format: 'jpg' as const,
    },
  };
}

export async function submitKieRipperTask(
  payload: ReturnType<typeof buildKieCreateTaskPayload>,
  apiKey?: string
): Promise<string> {
  const key = await resolveKieApiKey(apiKey);
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as {
    code?: number;
    msg?: string;
    data?: { taskId?: string };
  } | null;

  const taskId = json?.data?.taskId;
  if (!res.ok || !taskId) {
    throw new Error(json?.msg || `Kie.ai createTask failed (HTTP ${res.status})`);
  }
  return taskId;
}

export async function pollKieRipperTask(
  taskId: string,
  apiKey?: string
): Promise<{
  state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
  resultUrl?: string;
  error?: string;
}> {
  const key = await resolveKieApiKey(apiKey);
  const res = await fetch(
    `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    }
  );

  const json = (await res.json().catch(() => null)) as {
    code?: number;
    msg?: string;
    data?: {
      state?: string;
      resultJson?: string;
      failMsg?: string;
      failCode?: string;
    };
  } | null;

  if (!res.ok || !json?.data) {
    throw new Error(json?.msg || `Kie.ai recordInfo failed (HTTP ${res.status})`);
  }

  const rawState = (json.data.state || 'waiting').toLowerCase();
  if (rawState === 'success') {
    let resultUrl: string | undefined;
    if (json.data.resultJson) {
      try {
        const parsed = JSON.parse(json.data.resultJson) as {
          resultUrls?: string[];
          resultObject?: { url?: string };
          url?: string;
        };
        resultUrl = parsed.resultUrls?.[0] || parsed.resultObject?.url || parsed.url;
      } catch {
        // ignore malformed resultJson
      }
    }
    if (!resultUrl) {
      return { state: 'fail', error: 'Kie.ai zwróciło sukces, ale brak URL wygenerowanego obrazu.' };
    }
    return { state: 'success', resultUrl };
  }

  if (rawState === 'fail' || rawState === 'failed' || rawState === 'error') {
    return {
      state: 'fail',
      error: json.data.failMsg || json.msg || 'Zadanie Kie.ai zakończyło się błędem.',
    };
  }

  if (rawState === 'queuing' || rawState === 'generating' || rawState === 'waiting') {
    return { state: rawState };
  }

  return { state: 'generating' };
}

export async function loadRipperInitData(): Promise<{
  kieConfigured: boolean;
  products: Product[];
  defaultReferences: typeof DEFAULT_MELLOW_REFERENCES;
  mellowBrandBook: string;
}> {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch {
    products = [];
  }
  let kieConfigured = Boolean(accountEnv('KIE_API_KEY') || process.env.KIE_API_KEY);
  if (!kieConfigured) {
    try {
      const k = await resolveKieApiKey();
      kieConfigured = Boolean(k);
    } catch {
      kieConfigured = false;
    }
  }
  return {
    kieConfigured,
    products,
    defaultReferences: DEFAULT_MELLOW_REFERENCES,
    mellowBrandBook: MELLOW_RIPPER_BRAND_BOOK,
  };
}
