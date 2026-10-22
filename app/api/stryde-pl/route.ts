import { NextResponse } from 'next/server';
import { accountRoute } from '@/lib/account-route';
import { mutate, readState } from '@/lib/store';
import {
  STRYDE_ADVERTORIAL_URLS,
  STRYDE_FANPAGES,
  STRYDE_IMAGE_LIBRARY,
  STRYDE_LISTICLE_URL,
  STRYDE_PDP_URL,
  STRYDE_PRESET_ANGLES,
  STRYDE_STAGES,
  buildAllStrydePrewrittenAds,
  sanitizeAndAuditStrydePl,
  type StrydeImageAsset,
  type StrydePlGeneratedAd,
} from '@/lib/stryde-pl';

export const maxDuration = 300;

const STATE_KEY = 'stryde-pl-library-v1-all15-localized';

interface StrydePlLibraryState {
  ads: StrydePlGeneratedAd[];
  customImages?: StrydeImageAsset[];
}

async function readStrydeLibraryState(): Promise<{
  ads: StrydePlGeneratedAd[];
  customImages: StrydeImageAsset[];
}> {
  const defaultAds = buildAllStrydePrewrittenAds();
  try {
    const { value } = await readState<StrydePlLibraryState>(STATE_KEY, {
      ads: defaultAds,
      customImages: [],
    });
    const stored = Array.isArray(value?.ads) ? value.ads : [];
    const customImages = Array.isArray(value?.customImages) ? value.customImages : [];
    if (stored.length === 0) {
      return { ads: defaultAds, customImages };
    }
    const byAngle = new Map<string, StrydePlGeneratedAd>();
    for (const ad of defaultAds) {
      byAngle.set(ad.angleId, ad);
    }
    for (const ad of stored) {
      const baseAd = byAngle.get(ad.angleId);
      if (!baseAd) continue;
      const audited = sanitizeAndAuditStrydePl(
        ad.primaryText || baseAd.primaryText,
        ad.headline || baseAd.headline,
        ad.description || baseAd.description,
      );
      byAngle.set(ad.angleId, {
        ...baseAd,
        ...ad,
        primaryText: audited.primaryText,
        headline: audited.headline,
        description: audited.description,
        wordCount: audited.wordCount,
        characterCount: audited.characterCount,
        auditPassed: audited.auditPassed,
        auditWarnings: audited.auditWarnings,
        auditFixesApplied: audited.auditFixesApplied,
        imageUrl: ad.imageUrl || baseAd.imageUrl,
        imageHash: ad.imageHash || baseAd.imageHash,
        secondImageUrl: ad.secondImageUrl || baseAd.secondImageUrl,
        secondImageHash: ad.secondImageHash || baseAd.secondImageHash,
      });
    }
    return { ads: Array.from(byAngle.values()), customImages };
  } catch {
    return { ads: defaultAds, customImages: [] };
  }
}

export const GET = accountRoute(async () => {
  try {
    const { ads, customImages } = await readStrydeLibraryState();
    return NextResponse.json({
      presets: STRYDE_PRESET_ANGLES,
      awarenessStages: STRYDE_STAGES,
      fanpages: STRYDE_FANPAGES,
      advertorialUrls: STRYDE_ADVERTORIAL_URLS,
      savedAds: ads,
      imageLibrary: [...customImages, ...STRYDE_IMAGE_LIBRARY],
      metaConfig: {
        advertorialUrl: STRYDE_LISTICLE_URL,
        pdpUrl: STRYDE_PDP_URL,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd ładowania biblioteki Stryde PL.' },
      { status: 500 },
    );
  }
});

export const POST = accountRoute(async (req: Request) => {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      ad?: StrydePlGeneratedAd;
      angleId?: string;
      angleIds?: string[];
      imageUrl?: string;
      imageHash?: string;
      secondImageUrl?: string | null;
      secondImageHash?: string | null;
      dataUrl?: string;
      fileName?: string;
      label?: string;
      taskId?: string;
      prompt?: string;
      primaryText?: string;
      headline?: string;
      title?: string;
    };

    const action = body.action || 'save';

    if (action === 'generate_5_kie_images') {
      const {
        buildKieCreateTaskPayload,
        submitKieRipperTask,
        uploadPublicReferenceToKie,
      } = await import('@/lib/image-ripper');
      const { brainClient, brainOptions, brainSettings } = await import('@/lib/account-brain');

      const angleId = (body.angleId || '').trim();
      const preset = STRYDE_PRESET_ANGLES.find(a => a.id === angleId);
      const primaryText = (body.primaryText || '').trim();
      const headline = (body.headline || preset?.title || '').trim();
      const title = (body.title || preset?.shortTitle || angleId || 'Stryde PL').trim();

      let scenes: Array<{ label: string; scenePrompt: string; includeProductRef: boolean }> = [
        {
          label: 'Ujęcie #1 · Schody / Poręcz z perspektywy pierwszej osoby (POV)',
          scenePrompt:
            'First-person POV smartphone photo looking down a steep wooden staircase in an older Polish house or apartment hallway under dim indoor lighting, an older weathered hand gripping the wooden banister tightly.',
          includeProductRef: false,
        },
        {
          label: 'Ujęcie #2 · Szuflada pełna bezużytecznych ortez i ściągaczy z apteki',
          scenePrompt:
            'Ugly hasty top-down smartphone snapshot of an open wooden hallway drawer overflowing with 9 tangled elastic pharmacy knee sleeves, bulky hinged neoprene braces, and empty painkiller blister packs.',
          includeProductRef: false,
        },
        {
          label: 'Ujęcie #3 · Fotel w salonie / Punkt załamania z historii',
          scenePrompt:
            'Unstaged amateur phone photo of a worn fabric armchair in a Polish living room at night with a folded blanket and pillow on the seat, facing a dark staircase in the hallway.',
          includeProductRef: false,
        },
        {
          label: 'Ujęcie #4 · Senior / Seniorka pokazująca kolano z paskiem pod rzepką',
          scenePrompt:
            'Authentic amateur smartphone photo taken in a Polish kitchen: a 64-year-old Polish person sitting on a chair with one trouser leg rolled up above the knee, wearing a narrow matte-black patellar knee strap fastened just below the kneecap (zero logos or text on the strap).',
          includeProductRef: true,
        },
        {
          label: 'Ujęcie #5 · Dwa paski (Pakiet 1+1) na stole kuchennym lub w dłoni',
          scenePrompt:
            'Amateur smartphone photo of an older weathered hand holding a narrow matte-black silicone-core patellar knee strap with silver metal buckles over a wooden Polish kitchen table next to a mug of tea (zero text or logos on the strap).',
          includeProductRef: true,
        },
      ];

      try {
        const s = brainSettings();
        const opts = brainOptions(45000);
        const client = brainClient(opts);
        const completion = await client.chat.completions.create({
          model: s?.model || 'gpt-5.4',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You extract 5 ultra-raw, ugly, amateur Polish smartphone photo prompts ("shit quality", slight blur, high ISO grain, zero AI glow, zero text overlays, zero logos on the strap) matching a Polish native Facebook story ad about knee pain and a narrow black patellar knee strap (Stryde). Shots 1-3 MUST have includeProductRef: false (pure story/problem scenes: stairs, armchair, drawer of old braces, garden center parking, ladder, etc.). Shots 4-5 MUST have includeProductRef: true (a narrow matte-black patellar strap worn two fingers below the kneecap or held in an older Polish person hand, with ZERO text/letters on the strap). Return JSON: { "scenes": [ { "label": "Ujęcie #1 · ...", "scenePrompt": "...", "includeProductRef": false }, ... ] }',
            },
            {
              role: 'user',
              content: `Tytuł kąta: ${title}\nNagłówek: ${headline}\nTekst reklamy:\n${primaryText.slice(0, 3800)}`,
            },
          ],
        });
        const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
        if (Array.isArray(parsed.scenes) && parsed.scenes.length >= 5) {
          scenes = parsed.scenes.slice(0, 5).map((item: Record<string, unknown>, i: number) => ({
            label: String(item.label || `Ujęcie #${i + 1}`),
            scenePrompt: String(item.scenePrompt || scenes[i].scenePrompt),
            includeProductRef: Boolean(item.includeProductRef ?? i >= 3),
          }));
        }
      } catch {
        // Fallback to default 5 Stryde scenes
      }

      let productRefKieUrl: string | undefined;
      try {
        productRefKieUrl = await uploadPublicReferenceToKie('/stryde-pl-images/stryde-pl-08-senior-trzyma-opaske.jpg');
      } catch {
        productRefKieUrl = undefined;
      }

      const tasks = await Promise.all(
        scenes.map(async (scene, idx) => {
          const fullPrompt = `${scene.scenePrompt} Raw, ugly, amateur smartphone snapshot, slight motion blur, visible high-ISO sensor grain, crooked framing, natural Polish home lighting. STRICT BAN: zero AI glow, zero studio lighting, zero text overlays, zero letters or logos on the black knee strap.`;
          const payload = buildKieCreateTaskPayload({
            model: 'nano-banana-pro',
            prompt: fullPrompt,
            imageUrls: scene.includeProductRef && productRefKieUrl ? [productRefKieUrl] : [],
            aspectRatio: '1:1',
            resolution: '1K',
          });
          const taskId = await submitKieRipperTask(payload);
          return {
            index: idx + 1,
            label: scene.label,
            prompt: fullPrompt,
            includeProductRef: scene.includeProductRef,
            taskId,
          };
        }),
      );

      return NextResponse.json({
        ok: true,
        angleId,
        tasks,
      });
    }

    if (action === 'poll_kie_image') {
      const { pollKieRipperTask } = await import('@/lib/image-ripper');
      const taskId = (body.taskId || '').trim();
      if (!taskId) {
        return NextResponse.json({ error: 'Brak taskId.' }, { status: 400 });
      }
      const status = await pollKieRipperTask(taskId);
      if (status.state !== 'success' || !status.resultUrl) {
        return NextResponse.json(status);
      }

      const angleId = (body.angleId || '').trim();
      const preset = STRYDE_PRESET_ANGLES.find(a => a.id === angleId);
      const label = (body.label || `Kie.ai Raw #${preset?.number || ''}`).trim();
      const assetId = `kie-stryde-raw-${taskId}`;

      const newAsset: StrydeImageAsset = {
        id: assetId,
        url: status.resultUrl,
        imageHash: '',
        label: preset ? `#${preset.number} · ${label}` : label,
        adsetOrigin: 'Kie.ai Raw Native (Opaska PL)',
        adOrigin: preset?.code || 'KIE-RAW',
        aspectRatio: '1:1',
        source: 'ai',
        angleId: angleId || undefined,
        kiePrompt: body.prompt || undefined,
      };

      const defaultAds = buildAllStrydePrewrittenAds();
      const updatedState = await mutate<
        StrydePlLibraryState,
        { customImages: StrydeImageAsset[]; ads: StrydePlGeneratedAd[] }
      >(STATE_KEY, { ads: defaultAds, customImages: [] }, state => {
        const customList = Array.isArray(state.customImages) ? [...state.customImages] : [];
        const existingIdx = customList.findIndex(item => item.id === assetId);
        if (existingIdx >= 0) {
          customList[existingIdx] = newAsset;
        } else {
          customList.unshift(newAsset);
        }
        state.customImages = customList.slice(0, 80);
        return { customImages: state.customImages, ads: state.ads || defaultAds };
      });

      return NextResponse.json({
        state: 'success',
        resultUrl: status.resultUrl,
        asset: newAsset,
        imageLibrary: [...updatedState.customImages, ...STRYDE_IMAGE_LIBRARY],
      });
    }

    if (action === 'save' && body.ad) {
      const defaultAds = buildAllStrydePrewrittenAds();
      const audited = sanitizeAndAuditStrydePl(body.ad.primaryText, body.ad.headline, body.ad.description);
      const updatedAd: StrydePlGeneratedAd = {
        ...body.ad,
        primaryText: audited.primaryText,
        headline: audited.headline,
        description: audited.description,
        wordCount: audited.wordCount,
        characterCount: audited.characterCount,
        auditPassed: audited.auditPassed,
        auditWarnings: audited.auditWarnings,
        auditFixesApplied: audited.auditFixesApplied,
        updatedAt: Date.now(),
      };
      const savedAds = await mutate<StrydePlLibraryState, StrydePlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultAds, customImages: [] },
        state => {
          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
          const idx = list.findIndex(item => item.angleId === updatedAd.angleId || item.id === updatedAd.id);
          if (idx >= 0) {
            list[idx] = updatedAd;
          } else {
            list.push(updatedAd);
          }
          state.ads = list;
          return state.ads;
        },
      );
      return NextResponse.json({ ok: true, ad: updatedAd, savedAds });
    }

    if (action === 'set_image') {
      const targetAngleIds =
        Array.isArray(body.angleIds) && body.angleIds.length > 0
          ? body.angleIds
          : body.angleId
          ? [body.angleId]
          : [];
      if (!targetAngleIds.length) {
        return NextResponse.json({ error: 'Brak angleId.' }, { status: 400 });
      }
      const defaultAds = buildAllStrydePrewrittenAds();
      const now = Date.now();
      const savedAds = await mutate<StrydePlLibraryState, StrydePlGeneratedAd[]>(
        STATE_KEY,
        { ads: defaultAds, customImages: [] },
        state => {
          const list = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
          for (const targetAngleId of targetAngleIds) {
            const idx = list.findIndex(item => item.angleId === targetAngleId);
            const baseItem = idx >= 0 ? list[idx] : defaultAds.find(a => a.angleId === targetAngleId);
            if (!baseItem) continue;
            const nextSecondUrl =
              body.secondImageUrl === null || body.secondImageUrl === ''
                ? undefined
                : body.secondImageUrl !== undefined
                ? body.secondImageUrl
                : baseItem.secondImageUrl;
            const nextSecondHash =
              body.secondImageUrl === null || body.secondImageUrl === ''
                ? undefined
                : body.secondImageHash !== undefined
                ? body.secondImageHash || undefined
                : baseItem.secondImageHash;
            const updatedEntry: StrydePlGeneratedAd = {
              ...baseItem,
              ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
              ...(body.imageUrl ? { imageHash: body.imageHash || '' } : {}),
              secondImageUrl: nextSecondUrl,
              secondImageHash: nextSecondHash,
              updatedAt: now,
            };
            if (idx >= 0) {
              list[idx] = updatedEntry;
            } else {
              list.push(updatedEntry);
            }
          }
          state.ads = list;
          return state.ads;
        },
      );
      return NextResponse.json({ ok: true, savedAds });
    }

    if (action === 'upload_custom_image') {
      const dataUrl = (body.dataUrl || '').trim();
      const fileName = (body.fileName || `stryde-custom-${Date.now()}.jpg`).trim();
      const label = (body.label || fileName).trim();
      const angleId = (body.angleId || '').trim();
      if (!dataUrl.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Nieprawidłowy plik obrazu.' }, { status: 400 });
      }
      const newAsset: StrydeImageAsset = {
        id: `custom-stryde-${Date.now()}`,
        url: dataUrl,
        imageHash: '',
        label,
        adsetOrigin: 'Custom Upload',
        adOrigin: fileName,
        aspectRatio: '1:1',
        source: 'ai',
        angleId: angleId || undefined,
      };
      const defaultAds = buildAllStrydePrewrittenAds();
      const updated = await mutate<
        StrydePlLibraryState,
        { customImages: StrydeImageAsset[]; savedAds: StrydePlGeneratedAd[] }
      >(STATE_KEY, { ads: defaultAds, customImages: [] }, state => {
        const customList = Array.isArray(state.customImages) ? [...state.customImages] : [];
        customList.unshift(newAsset);
        state.customImages = customList.slice(0, 80);
        const adsList = Array.isArray(state.ads) && state.ads.length > 0 ? [...state.ads] : [...defaultAds];
        if (angleId) {
          const idx = adsList.findIndex(item => item.angleId === angleId);
          if (idx >= 0) {
            adsList[idx] = {
              ...adsList[idx],
              imageUrl: newAsset.url,
              imageHash: newAsset.imageHash,
              updatedAt: Date.now(),
            };
          }
        }
        state.ads = adsList;
        return { customImages: state.customImages, savedAds: state.ads };
      });

      return NextResponse.json({
        ok: true,
        asset: newAsset,
        imageLibrary: [...updated.customImages, ...STRYDE_IMAGE_LIBRARY],
        savedAds: updated.savedAds,
      });
    }

    return NextResponse.json({ error: `Nieznana akcja: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd zapisu w Stryde PL.' },
      { status: 500 },
    );
  }
});
