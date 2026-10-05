export type LocalizationMode = 'close' | 'full';

export function parseLocalizationMode(value: unknown): LocalizationMode {
  if (value === undefined || value === null || value === '') return 'close';
  if (value === 'close' || value === 'full') return value;
  throw new Error('Invalid localisation mode');
}

export function localizationInstruction(mode: LocalizationMode): string {
  const common = `LOCALISATION DEPTH is independent of FAITHFUL_SOURCE / BRAND_ADAPTATION and the manual CTA choice. Keep display script and narration free of legal-review labels, editorial placeholders and unsolicited commentary. Localise incidental everyday references and generic institutional roles where appropriate. Do not invent research, approvals, regulatory actions or historical events: an action attributed to FDA must not become an action by MHRA without supplied supporting evidence. Keep the original attribution or use a truthful general formulation. These rules do not authorise new medical claims or advice to stop prescribed treatment.`;
  return common + (mode === 'full'
    ? `\nFULL LOCALISATION — NEW VIDEO FROM SCRATCH. Write a new target-market script from the source concept and supplied target-product facts. You may substantially rewrite sentence structure, idiom, opening hook, transitions, examples and scene order. Make it sound originally written for the target audience, not sentence-by-sentence translation. Preserve the core desire, argument, factual meaning, product-disclosure level and CTA intent; do not invent proof or stronger outcomes. Aim for comparable depth and spoken length, not a summary. This depth choice overrides earlier instructions to preserve exact sentences, sentence count, original opening wording and scene order; factual, brand-disclosure, market and selected CTA constraints still apply. The main opening belongs in the main script; alternative hooks remain separate. The editor will create new visuals and montage; do not claim that video generation has already happened. Singing-ad lyrics remain subject to the separate exact-lyrics rule.`
    : `\nCLOSE LOCALISATION — VMAKE RIP. Preserve the original video beats, opening, scene order, argument, sentence structure and approximate timing. Make only necessary language, spelling, brand, confirmed offer and incidental cultural-reference substitutions for the target market. Keep already-natural phrases unchanged. Correct genuine grammar errors or unintelligible literal translation with the smallest possible edit, but do not polish, restructure, merge or rewrite sentences just for style. More extensive syntax and creative rewriting belong only in FULL LOCALISATION. Singing-ad lyrics remain subject to the separate exact-lyrics rule.`);
}

export function localizationProductionNote(mode: LocalizationMode): string {
  return mode === 'full'
    ? 'Full localisation — create the video from scratch. Use the adapted script for new visuals, scenes and montage; the source video is a reference, not a shot-for-shot edit.'
    : 'Close localisation — VMake rip. Preserve the source scenes and pacing; adapt language, product and local references.';
}
