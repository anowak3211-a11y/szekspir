export type LocalizationMode = 'close' | 'full' | 'gemini';

export function parseLocalizationMode(value: unknown): LocalizationMode {
  if (value === undefined || value === null || value === '') return 'close';
  if (value === 'close' || value === 'full' || value === 'gemini') return value;
  throw new Error('Invalid localisation mode');
}

export function localizationInstruction(mode: LocalizationMode): string {
  const common = `LOCALISATION DEPTH is independent of FAITHFUL_SOURCE / BRAND_ADAPTATION and the manual CTA choice. Keep display script and narration free of legal-review labels, editorial placeholders and unsolicited commentary. Localise incidental everyday references and generic institutional roles where appropriate. Do not invent research, approvals, regulatory actions or historical events: an action attributed to FDA must not become an action by MHRA without supplied supporting evidence. Keep the original attribution or use a truthful general formulation. These rules do not authorise new medical claims or advice to stop prescribed treatment.`;
  if (mode === 'full') {
    return common + `\nFULL LOCALISATION — NEW VIDEO FROM SCRATCH. Write a new target-market script from the source concept and supplied target-product facts. You may substantially rewrite sentence structure, idiom, opening hook, transitions, examples and scene order. Make it sound originally written for the target audience, not sentence-by-sentence translation. Preserve the core desire, argument, factual meaning, product-disclosure level and CTA intent; do not invent proof or stronger outcomes. Aim for comparable depth and spoken length, not a summary. This depth choice overrides earlier instructions to preserve exact sentences, sentence count, original opening wording and scene order; factual, brand-disclosure, market and selected CTA constraints still apply. The main opening belongs in the main script; alternative hooks remain separate. The editor will create new visuals and montage; do not claim that video generation has already happened. Singing-ad lyrics remain subject to the separate exact-lyrics rule.`;
  }
  if (mode === 'gemini') {
    return common + `\nGEMINI RIP — DIRECT-RESPONSE ADAPTATION WITH BUY 2, GET 1 FREE OFFER. Keep 100% of the Direct-Response punch, emotional weight, urgency and vivid language from the source script (never soften phrases like "literally shrinks them" or "zero protection"). Adapt phrasing naturally into target-market British English (or Polish for PL) while preserving the source scene flow, spoken rhythm and argument. Replace any competitor brand or product name (such as Bloom & Bond, Bloom and Bond, Bloomwise, Saphire, etc.) with the canonical target brand from the supplied productContext (for example, Bennett & Seed — never use raw folder slugs or unrelated products like Magnesium). Always end the script with a clear, natural mention of the Buy 2, Get 1 Free offer alongside the link CTA. Alternative hooks, when requested, belong only in the separate hooks array. Singing-ad lyrics remain subject to the separate exact-lyrics rule.`;
  }
  return common + `\nCLOSE LOCALISATION — VMAKE RIP / DIRECT RIP. Own-brand adaptation means a light edit of the source, not writing new copy. Do not replace words such as kids with children, change the hook, simplify the argument or recast sentences merely to make them sound polished. Edit the supplied script; do not write a replacement advert. Preserve its original hook, argument, emotional strength, sentence order, scene beats, repetitions, rhythm and approximate spoken length. Make only necessary language, spelling, explicitly instructed brand/product facts, confirmed offer and incidental cultural-reference substitutions for the target market, in their original positions. Keep already-natural phrases unchanged. Correct genuine grammar errors or unintelligible literal translation with the smallest possible edit, but do not polish, restructure, merge or rewrite sentences just for style. Do not add an introduction, conclusion, new hook or explanatory bridge to the main script. Alternative hooks, when requested, belong only in the separate hooks array. Missing target facts go in data_gaps, not inserted review labels or a rewritten body. Before returning, compare sentence by sentence with the source and undo stylistic changes that were not necessary. More extensive syntax and creative rewriting belong only in FULL LOCALISATION. Singing-ad lyrics remain subject to the separate exact-lyrics rule.`;
}

export function localizationProductionNote(mode: LocalizationMode): string {
  if (mode === 'full') {
    return 'Full localisation — create the video from scratch. Use the adapted script for new visuals, scenes and montage; the source video is a reference, not a shot-for-shot edit.';
  }
  if (mode === 'gemini') {
    return 'Gemini rip — Direct-Response adaptation (or pasted Gemini script) with Buy 2, Get 1 Free CTA. Preserve source scenes or adapt montage to match the script.';
  }
  return 'Close localisation — VMake rip. Preserve the source scenes and pacing; adapt language, product and local references.';
}

