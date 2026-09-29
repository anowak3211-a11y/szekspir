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

## Standard voice options

- Standard also exposes breathing and optional scene background in the shared voice controls (UK/PL and Additional Files). Standard breathing is opt-in for backward compatibility; background remains off by default. When enabled, breathing uses sparse cues, Natural stability and breath-safe silence detection while retaining the Standard pause profile. Storytelling still preserves full pauses. VSL remains unchanged. Preview cache keys include breath protection.
- The owner authorised committing, pushing and deploying this fix without another confirmation.

## Sheets quota recovery

- Background tabs no longer read editor Sheets for delivery badges. Visible tabs check once per minute, backing off to five minutes after failures. Previously every tab read both admin and editor ranges every 30 seconds.
- Export checkpoints a successfully saved brief before editor sync. Retrying sync reuses the checkpoint instead of rewriting the brief. Edits reset the export stage as before.
- Explicit Google Sheets quota errors in export, final links, or VO sheet updates defer the stage for 60/120/240/300/300 seconds, with an explanatory progress message. Never auto-retry when a paid request is pending. Manual retry resets this budget; other errors keep the existing behavior.
- Offline pipeline tests verify cooldown, checkpoint reuse and no extra paid calls.
- Current workflow: edit locally and deploy directly to Vercel. Do not commit/push to GitHub until the owner explicitly ends the session and asks for upload.

## Drive video links with remembered VMake settings

- Drive-only jobs export their saved Drive URL regardless of a remembered VMake combo selection. Combo output labels apply only outside the Drive destination. Offline pipeline coverage includes Drive upload with combo selected.

## Native source-pace preview and checks

- Main VO requests derive a duration target from source duration and source/adapted word counts. A prior take with the same voice and pause mode calibrates ElevenLabs native `voice_settings.speed` (1.0–1.2, never slowdown). With no matching take, use 1.0 and measure; no fabricated universal voice speed. Singing and missing speech references are excluded. No digital time stretching, no automatic paid regeneration loop.
- Timing records retain the target and synthesis speed; UI flags deviations beyond 5%. This compares average duration/word rate, not word-level lip sync; source silence/music can affect the estimate. Existing finished files are not altered by deployment.
- `Preview source pace` records a short complete-sentence opening with the same voice/settings, without ambience. It is cached by inputs, protected by a durable paid-request claim, and does not change job recordings or editor links. An interrupted paid sample is not automatically repeated. Full VO regeneration remains explicit.
- Tests cover measured calibration, voice/mode mismatch, limits, no slowdown, missing source, sample boundaries and provider speed propagation. Listening to real samples is still necessary to assess naturalness.

- V3 additionally receives one `[rushed]` cue when a matching measured prior take needs over 10% acceleration. Numeric speed and delivery cues are approximate, not guarantees. Real auditions showed that a stronger cue can even produce a longer take; always inspect the result and listen.
- Faster-delivery and ~30s breathing auditions have separate caches and never change the full VO. The breathing audition uses a longer complete-sentence excerpt, Storytelling and breath cues on, with ambience off.
- Accepted preference: source-paced Storytelling without added breath cues; preserve naturally generated pauses and quiet sounds. Keep optional breaths available. User authorised full regeneration using this combination and publishing this session's changes to GitHub. Future sessions still require an explicit request before pushing.

## Full-length PL adaptation correction

- PL adapts source scenes and argument beats at comparable depth, including cross-category source adverts. Incompatible product explanations are replaced by developed insole explanations rather than deleted. Unsupported factual attribution is not invented.
- A conservative guard rejects PL results below 65% of source lexical word count for sources of 300+ words. It does not automatically retry paid generation or mutate existing scripts. This catches drastic collapse, not semantic omissions; manual learn-more still must preserve the body. The prompt targets comparable length and full scene coverage.
- Validation uses mocked generation, including rejection of a collapsed long script and no automatic retry; no live paid generation.
