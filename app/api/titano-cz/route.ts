import path from 'path';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { accountRoute } from '@/lib/account-route';
import { mutate, readState } from '@/lib/store';
import {
  TITANO_CZ_DEFAULT_URL,
  TITANO_CZ_FANPAGES,
  TITANO_CZ_IMAGE_LIBRARY,
  TITANO_CZ_META_ACCOUNT_ID,
  TITANO_CZ_META_PIXEL_ID,
  TITANO_CZ_PDP_URL,
  TITANO_CZ_PRESET_ANGLES,
  TITANO_CZ_STAGES,
  buildAllTitanoCzPrewrittenAds,
  sanitizeAndAuditTitanoCz,
  type TitanoCzImageAsset,
  type TitanoCzGeneratedAd,
} from '@/lib/titano-cz';

export const maxDuration = 300;

const STATE_KEY = 'titano-cz-antki-v1-40-complete-ads';

interface TitanoCzLibraryState {
  ads: TitanoCzGeneratedAd[];
  customImages?: TitanoCzImageAsset[];
}

async function readTitanoCzLibraryState(): Promise<{
  ads: TitanoCzGeneratedAd[];
  customImages: TitanoCzImageAsset[];
}> {
  const defaultAds = buildAllTitanoCzPrewrittenAds();
  try {
    const { value } = await readState<TitanoCzLibraryState>(STATE_KEY, {
      ads: defaultAds,
      customImages: [],
    });
    const stored = Array.isArray(value?.ads) ? value.ads : [];
    const customImages = Array.isArray(value?.customImages) ? value.customImages : [];
    if (stored.length === 0) {
      return { ads: defaultAds, customImages };
    }
    const byAngle = new Map<string, TitanoCzGeneratedAd>();
    for (const ad of defaultAds) {
      byAngle.set(ad.angleId, ad);
    }
    for (const ad of stored) {
      const baseAd = byAngle.get(ad.angleId);
      if (!baseAd) continue;
      const audited = sanitizeAndAuditTitanoCz(
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
      });
    }
    return { ads: Array.from(byAngle.values()), customImages };
  } catch {
    return { ads: defaultAds, customImages: [] };
  }
}

export const GET = accountRoute(async () => {
  try {
    const { ads, customImages } = await readTitanoCzLibraryState();
    return NextResponse.json({
      presets: TITANO_CZ_PRESET_ANGLES,
      awarenessStages: TITANO_CZ_STAGES,
      fanpages: TITANO_CZ_FANPAGES,
      savedAds: ads,
      imageLibrary: [...customImages, ...TITANO_CZ_IMAGE_LIBRARY],
      metaConfig: {
        accountId: TITANO_CZ_META_ACCOUNT_ID,
        nativeCampaignId: '',
        mainCampaignId: '',
        pixelId: TITANO_CZ_META_PIXEL_ID,
        advertorialUrl: TITANO_CZ_PDP_URL,
        pdpUrl: TITANO_CZ_PDP_URL,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd ładowania biblioteki Titano Česko.' },
      { status: 500 },
    );
  }
});

export const POST = accountRoute(async (req: Request) => {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      ad?: TitanoCzGeneratedAd;
      angleId?: string;
      imageUrl?: string;
      imageHash?: string;
      dataUrl?: string;
      fileName?: string;
      label?: string;
    };

    const action = body.action || 'save';

    if (action === 'save' && body.ad) {
      const incoming = body.ad;
      const audited = sanitizeAndAuditTitanoCz(
        incoming.primaryText,
        incoming.headline,
        incoming.description,
      );
      const updatedAd: TitanoCzGeneratedAd = {
        ...incoming,
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
      const { ads } = await mutate<TitanoCzLibraryState, { ads: TitanoCzGeneratedAd[] }>(
        STATE_KEY,
        { ads: buildAllTitanoCzPrewrittenAds(), customImages: [] },
        draft => {
          const list = Array.isArray(draft.ads) ? draft.ads : buildAllTitanoCzPrewrittenAds();
          const idx = list.findIndex(a => a.angleId === updatedAd.angleId);
          if (idx >= 0) {
            list[idx] = updatedAd;
          } else {
            list.push(updatedAd);
          }
          draft.ads = list;
          return { ads: list };
        },
      );
      return NextResponse.json({ ok: true, ad: updatedAd, savedAds: ads });
    }

    if ((action === 'assign_image' || action === 'set_image') && body.angleId && body.imageUrl) {
      const { ads } = await mutate<TitanoCzLibraryState, { ads: TitanoCzGeneratedAd[] }>(
        STATE_KEY,
        { ads: buildAllTitanoCzPrewrittenAds(), customImages: [] },
        draft => {
          const list = Array.isArray(draft.ads) ? draft.ads : buildAllTitanoCzPrewrittenAds();
          const idx = list.findIndex(a => a.angleId === body.angleId);
          if (idx >= 0) {
            list[idx] = {
              ...list[idx],
              imageUrl: body.imageUrl!,
              imageHash: body.imageHash || list[idx].imageHash,
              updatedAt: Date.now(),
            };
          }
          draft.ads = list;
          return { ads: list };
        },
      );
      return NextResponse.json({ ok: true, savedAds: ads });
    }

    if (action === 'upload_custom_image' && body.dataUrl) {
      const m = body.dataUrl.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!m) {
        return NextResponse.json({ error: 'Nieprawidłowy format dataUrl.' }, { status: 400 });
      }
      const ext = m[1] === 'png' ? 'png' : 'jpg';
      const safeName = `custom_${Date.now()}.${ext}`;
      const relUrl = `/titano-cz-images/${safeName}`;
      const absPath = path.join(process.cwd(), 'public', 'titano-cz-images', safeName);
      await fs.writeFile(absPath, Buffer.from(m[2], 'base64'));
      const newAsset: TitanoCzImageAsset = {
        id: `custom-${Date.now()}`,
        url: relUrl,
        imageHash: '',
        label: body.label || body.fileName || safeName,
        adsetOrigin: 'Własny upload',
        adOrigin: safeName,
        aspectRatio: '1:1',
        source: 'ai',
        angleId: body.angleId,
      };
      const { ads, customImages } = await mutate<
        TitanoCzLibraryState,
        { ads: TitanoCzGeneratedAd[]; customImages: TitanoCzImageAsset[] }
      >(
        STATE_KEY,
        { ads: buildAllTitanoCzPrewrittenAds(), customImages: [] },
        draft => {
          const imgs = Array.isArray(draft.customImages) ? draft.customImages : [];
          imgs.unshift(newAsset);
          draft.customImages = imgs;
          const list = Array.isArray(draft.ads) ? draft.ads : buildAllTitanoCzPrewrittenAds();
          if (body.angleId) {
            const idx = list.findIndex(a => a.angleId === body.angleId);
            if (idx >= 0) {
              list[idx] = {
                ...list[idx],
                imageUrl: newAsset.url,
                updatedAt: Date.now(),
              };
            }
          }
          draft.ads = list;
          return { ads: list, customImages: imgs };
        },
      );
      return NextResponse.json({
        ok: true,
        asset: newAsset,
        savedAds: ads,
        imageLibrary: [...customImages, ...TITANO_CZ_IMAGE_LIBRARY],
      });
    }

    return NextResponse.json({ error: `Nieznana akcja: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd zapisu Titano Česko.' },
      { status: 500 },
    );
  }
});
