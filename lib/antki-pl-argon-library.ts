import { ANTKI_PL_COPY_PART1 } from './antki-pl-copy-part1';
import { ANTKI_PL_COPY_PART2 } from './antki-pl-copy-part2';
import { ANTKI_PL_COPY_PART3 } from './antki-pl-copy-part3';
import { ANTKI_PL_COPY_PART4 } from './antki-pl-copy-part4';
import { ANTKI_PL_COPY_PART5 } from './antki-pl-copy-part5';
import { ANTKI_PL_COPY_PART6 } from './antki-pl-copy-part6';
import {
  ANTKI_PL_PRESET_ANGLES,
  ORTHOMAX_PL_DEFAULT_URL,
  getDefaultImageForAngle,
  sanitizeAndAuditAntkiPl,
  type AntkiPlGeneratedAd,
} from './antki-pl';

export const ANTKI_PL_ARGON_AUTHORED_COPY: Record<
  string,
  { headline: string; description: string; primaryText: string }
> = {
  ...ANTKI_PL_COPY_PART1,
  ...ANTKI_PL_COPY_PART2,
  ...ANTKI_PL_COPY_PART3,
  ...ANTKI_PL_COPY_PART4,
  ...ANTKI_PL_COPY_PART5,
  ...ANTKI_PL_COPY_PART6,
};

export function buildAllArgonPrewrittenAds(
  destinationUrl = ORTHOMAX_PL_DEFAULT_URL,
  pageName = 'Porady Mamy Gosi',
): AntkiPlGeneratedAd[] {
  const baseTime = 1792355000000;
  return ANTKI_PL_PRESET_ANGLES.map((angle, index) => {
    const raw = ANTKI_PL_ARGON_AUTHORED_COPY[angle.id];
    if (!raw) {
      throw new Error(`Brak napisanego przez Argona tekstu dla kąta: ${angle.id}`);
    }
    const audited = sanitizeAndAuditAntkiPl(
      raw.primaryText,
      raw.headline || angle.defaultHeadline,
      raw.description,
      angle.defaultHeadline,
    );
    const defaultImg = getDefaultImageForAngle(angle.number);
    return {
      id: `antek-pl-argon-${angle.code}`,
      angleId: angle.id,
      code: angle.code,
      title: angle.title,
      segment: angle.segment,
      funnelStage: angle.funnelStage,
      pageName,
      headline: audited.headline,
      description: audited.description,
      primaryText: audited.primaryText,
      destinationUrl,
      cta: 'LEARN_MORE',
      imageUrl: angle.defaultImageUrl || defaultImg.url,
      imageHash: angle.defaultImageHash || defaultImg.imageHash,
      wordCount: audited.wordCount,
      characterCount: audited.characterCount,
      auditPassed: audited.auditPassed,
      auditWarnings: audited.auditWarnings,
      auditFixesApplied: audited.auditFixesApplied,
      createdAt: baseTime + index * 1000,
      updatedAt: baseTime + index * 1000,
    };
  });
}
