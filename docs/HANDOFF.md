# Current development handoff — 28 September 2026

## Source provenance

This repository was converted from an 18 September ZIP snapshot into directly editable source files. Application files were copied from the owner's local `ad-localizer` checkout on 28 September. The local checkout had uncommitted changes; this import gives them a shared Git history. The older ZIP remains accessible in Git history only.

This establishes the current local source baseline, not proof that every file matches the running Vercel deployment. Verify deployments separately. Historical documents describe earlier checkpoints and may be outdated; current code and focused tests take precedence.

## Map

- `app/szekspir`: main UI, upload and job progress.
- `app/additional-files`: additional VO/hooks/video and approval.
- `lib/jobs.ts`, `lib/parallel-pipeline.ts`, `lib/store.ts`: durable jobs and state.
- `lib/editor-sync*.ts`, `lib/editor-workspaces.ts`: Sheets synchronisation.
- `lib/elevenlabs.ts`, `lib/vo-cleanup.ts`: voice generation and pause processing.
- `api/`, `sdk/`: Python VMake integration.
- `lib/editor-quality.ts`, `lib/video-quality.ts`: editor export quality checks.
- `vercel.json`: functions, queues and cron configuration.

## Requirements to preserve

- Manual changes and deletions in editor sheets must not be silently restored from admin data.
- Preserve user-corrected scripts, approved recordings, provider task IDs and existing job state.
- Alternative hooks are optional; support two, with independent editor inclusion.
- Do not introduce a brand/product reveal where the source does not have one.
- Preserve original ElevenLabs files; no volume normalisation/compression added. Pause processing remains intentional; storytelling should preserve breaths and natural speech.
- Keep editor-facing quality alerts in English. File size alone is not a reliable measurement of visual quality.
- Do not retry an ambiguous paid request blindly, overwrite production data, or run live migration/test scripts during onboarding.

These are requirements, not claims that every edge case has been verified. Read focused feature documents and tests before changes.

## Configuration and remaining verification

See `.env.example` for names only. Production credentials remain outside Git. Google/Drive access, state backend, provider keys and Vercel project permissions must be configured separately. Historical setup notes must not be treated as proof that OAuth tokens or permissions are still valid.

Use the README checks. Before production changes, verify the linked Vercel project, environment and deployment branch. No new paid generation or production Sheet mutation was needed for this source import.

## Import validation

- TypeScript check passed.
- Offline `npm test`: 28 checks passed, then `tests/regression.cjs:56` failed: expected step `references`, actual step `export`. This is an unresolved baseline failure, not a green test suite. Investigate the fixture versus current job steps before relying on this regression check.
- The initial default build attempt could not use dependencies symlinked outside the temporary checkout (Turbopack restriction); this is a validation-environment issue.
- Production build with `next build --webpack` passed (including TypeScript and page generation). Existing middleware deprecation/Edge Runtime warnings remain.

## Polish workspace — separate tile

- Home now links to `/szekspir-pl`; `/szekspir` remains the UK workspace. Both use the shared client in `app/szekspir/workspace.tsx`.
- New jobs persist `market: uk | pl`; old jobs without it remain UK. Workspace job lists and direct job reads are market-filtered. Regeneration and all job voiceover paths preserve the saved market.
- Polish localisation uses `lib/polish-localization.ts` with the Orthomax default described below, no Mellow product or UK retail/offer substitutions. Only confirmed Polish-market product facts should be selected. The existing `uk_script` storage key also holds Polish scripts for compatibility; no state migration is required.
- Polish narration leaves numeric notation intact for multilingual TTS instead of expanding it into English. Polish-labelled, owned and favourite voices are available with a separate saved selection. Singing-ad adaptation and the English pause-comparison sample are not offered in the PL workspace. There is no separate Polish critic; the British critic and its badge apply only to UK jobs.
- This is a workspace in the existing application, not a separate account/backend: products, providers, Drive and editor sheets remain shared. Market labels appear in script history. Additional recordings inherit the saved ad's market.
- Offline validation: TypeScript and focused Polish/UK localisation, voice, job pipeline, regeneration, delivery and additional-file tests pass. The existing regression baseline still fails at `tests/regression.cjs:56` (`references` expected, `export` actual). No production data or paid provider requests were used.

## Orthomax PL copy profile

- PL now defaults to Orthomax StepMax insoles in generation and regeneration, with the reveal at the source product reveal. The default job metadata names the product; UK is unchanged. Optional selected product documents provide additional target facts, not a different target brand.
- Polish rules cover natural direct-response language, source length, narrator continuity, 2-3 sentence alternative openings, dialogue register, number formatting and no em dashes. Three internal checks review one draft; there is no separate paid Polish critic or verified quality badge.
- Historical promotions are not a current offer configuration. The basic profile confirms no offer; missing target offer terms become data gaps. Clinical timelines, testimonials and unrelated source-product mechanisms must not become target-product facts.
- Only distilled application rules were added. Private source chats, attachments, identifiers and operational access discussions are not committed. No production product records were changed.

## Storytelling delivery — 29 September 2026

- Keep the name **Storytelling**, stored as `mode: gentle` for backward compatibility. New recordings use Eleven v3 Natural stability (0.5), conversational direction when subtle emotion is enabled, and at most three sparse `[exhales]` cues after longer complete thoughts. `breaths: false` disables inserted cues. Approved spoken words and Polish number handling remain unchanged. Voice choice and listening review still matter; synthetic tests do not establish subjective realism.
- Storytelling WAV conversion preserves every decoded sample, including silence, breaths and endings. Other profiles keep their pause shortening. Hooks retain the extra 0.5-second tail. Existing recordings are not regenerated or replaced by deployment.
- Main Storytelling VO can opt into `ambience: car | room | outdoors`; absent/`none` stays off. This makes one additional paid ElevenLabs Sound Effects v2 request for a 10-second loop. Hooks never request background sound. Fixed prompts request no speech/music. The background is mixed quietly (0.025 gain), without normalising/compressing the voice; clean WAV and original background loop links are saved in timing metadata. Original provider MP3 remains preserved.
- Optional ambience failure returns clean narration with a visible warning and never retries the paid request. UI exposes the same controls in the shared UK/PL workspace and Additional Files. The pause preview is only a processing comparison, not a preview of new delivery or ambience.
- Focused offline checks cover words/cues, provider request selection, original preservation, sample-exact Storytelling, hook tails, optional ambience mixing/duration and failure fallback. No paid generations or production Sheet mutations are part of verification.
- Existing unrelated `tests/notes-emotion.cjs` sheet-note assertion fails (after its voice assertions pass); the unchanged editor sync implementation is outside this delivery change. The regression baseline above remains unresolved.
