# Current development handoff — 28 September 2026

## UK prompt v18 guidance deployment — 5 October 2026

- Owner requested deploying the edited localisation guidance except the parts that would automatically invent target-brand evidence or mechanically rename attributed institutions. UK prompt version is now `uk-faithful-2026-10-05-v18-product-guidance-safe`.
- Product guidance, master prompts, brand voice and research examples remain usable as copywriting guidance within the selected mode. Automatic target-brand testimonials, medical studies, customer counts, retailer availability/certifications, FDA-to-MHRA regulatory swaps and renamed attributed studies remain disallowed unless a supplied target source supports the replacement.
- Existing jobs retain their captured prompt/context. New localisations use the updated prompt after deployment. No live Sheet mutations or paid provider calls are required for validation.
- Validation: TypeScript, focused localisation/model/guidance tests, Bloomwise naming, 40 offline core regressions, `git diff --check` and local webpack production build pass. Vercel production deployment `dpl_5hub5wHU5tmMvosGErCL85HZxiLQ` is READY and aliased to `https://szekspir.vercel.app`. No GitHub commit/push.

## Better UK critic and product copy guidance — 5 October 2026

- OpenAI UK language checking (including the existing custom-provider OpenAI checker path) now requests gpt-6-sol with low effort and the existing strict fixes schema. The bounded spelling/retail edit allowlist, retry/refusal handling and critic prompt are unchanged; Anthropic remains Haiku. Saved language-check metadata names the actual new model; historical results are not rewritten.
- Product imports/context no longer exclude master prompts, README, AGENTS or other instruction files by filename. Master prompts and brand_voice are guidance; offer_brief is facts. Copy guidance is explicitly used by UK and PL generation rather than ignored wholesale, within the selected application mode/market/CTA/hook choices and JSON contract. Prompt versions change to UK v17-product-guidance and PL v4.
- ZIP and individual-file imports, saved-file editing and context assembly all include these files. Already stored files participate in new contexts; files skipped by old imports must be re-imported. Existing jobs retain their captured productContext and are not silently migrated or regenerated. No live product-sheet mutations are made by this update.
- Owner requested opening localization-rules.ts for direct code editing; file-open request was queued to the current Codex thread. Changing a local source file requires a subsequent deployment to affect production.
- Validation: TypeScript, 40 offline core regressions, model-request/critic, guidance context/import/editing, localisation-depth, CTA, Bloomwise and UK/PL tests pass. Requests and Sheet writes were mocked; no live paid generation or production Sheet mutation. Local webpack and production Turbopack builds pass. Deployment `dpl_7EgqWeQ5wHtyXUAx6sGbHz8fGMTa` is READY and aliased to `https://szekspir.vercel.app`. No GitHub commit/push. Native file-open does not establish whether the user wants an additional in-app Szekspir rules editor; clarification was requested.

## Direct-rip fidelity and saffron naming — 5 October 2026

- Close mode explicitly edits the supplied advert rather than writing a replacement: original hook, sentence/scene order, rhythm, repetitions and emotional strength stay; only necessary local and target-product substitutions are made. Requested alternative hooks remain separate. Full mode retains creative rewriting. Depth version is now v2; UK base prompt is v16-direct-rip.
- With a selected saffron product context and source brand disclosure, a deterministic final naming pass normalises existing Mellow-prefixed Kids/Saffon aliases and bare Mellow to MELLOW SAFFRON GUMMIES in the script and alternative hooks, before deriving narration. It does not brand generic kids-gummies category mentions, add a reveal, change faithful-source/no-context jobs or rename explicitly named magnesium products.
- The current owner-supplied saffron money-back duration is 90 days, overriding old context that says 100, only at an existing guarantee. Ingredient/serving/dose/customer quantities remain target-specific: use explicit target data or retain source wording for comparison and report the gap separately, without inline review labels. Do not infer a full formulation from a partial list or another brand's label.
- The saved private medical-ad draft is not imported as verified product data or a universal FDA-to-MHRA substitution rule. Existing saved scripts, recordings and jobs are not automatically regenerated; VMake legacy integration is unchanged.
- Validation: TypeScript, 40 core offline regressions, depth, Bloomwise/naming, disclosure, singing, critic, regeneration, UK/PL market, CTA and model-request tests pass. Local webpack and production Turbopack builds pass. Provider outputs were mocked; no paid generation or live Sheet writes. Final deployment `dpl_FFfXXzPZ3gPoaLwYFdsbJx8WLbEw` is READY and aliased to `https://szekspir.vercel.app`. No GitHub commit/push.

## GitHub source sync — 5 October 2026

- Owner explicitly requested uploading the accumulated deployed changes to GitHub. This checkpoint supersedes earlier no-commit/no-push notes for these changes only; it does not grant ongoing permission for future pushes.
- Includes localisation depth, upload recovery/deduplication, clean-first legacy VMake, Drive OAuth recovery, product editing/labels and their tests. Production remains the already verified deployment below. Typecheck, 40 core offline regressions and focused localisation/OAuth/dedup/clean-first checks pass. Environment files and private credentials remain excluded.

## Global localisation depth — 5 October 2026

- Shared UK/PL workspace now offers Close localisation — VMake rip (default) and Full localisation — video from scratch. Close preserves scene order and sentence structure with necessary local substitutions; Full permits a new hook, syntax and scene order while retaining factual meaning, disclosure and selected CTA constraints. Neither mode invents regulatory history or target-brand evidence. Scripts remain free of legal-review annotations.
- Mode is captured for every text/media/link upload, retained by durable recovery, validated and saved on each new job. Both worker paths and script regeneration use the saved mode; legacy jobs default to Close. Compatibility `/api/process` accepts market and localisation mode too. Prompt versions identify the depth. Existing scripts/recordings are not migrated or regenerated.
- Full sends an English production instruction in the editor notes for new scenes/visuals/montage. This is an editor-led new-video workflow, not a newly added automated video-generation provider. VMake processing/destination stays independently selected; legacy API remains unchanged. Singing ads retain exact-lyrics mode and reject Full.
- Validation: new mocked depth/UK/PL/job/idempotency/UI-render tests, regeneration, Bloomwise, CTA, Polish-market, model-selection, parallel-pipeline, upload-resume, VMake-mode checks and 40 core offline regressions pass. Typecheck and production webpack build pass. No paid generation or live Sheet mutation used for tests.
- Deployed as `dpl_49gjmqrCZ2ztj6yHdeddRTKtir9u`, READY, production alias `https://szekspir.vercel.app`. Authenticated Chrome confirmed both choices and Close default on UK and PL pages. No paid submission was made. No GitHub commit/push.

## VMake legacy API — explicit owner prohibition

- Owner instruction: NEVER switch to the new VMake API. Preserve legacy account access and integration. This applies to troubleshooting, SDK updates, deployments and upload-limit work; generic fix/deploy authorisation does not override it.
- The authenticated provider panel warns migration permanently ends legacy access. Observed legacy experiment usage was 0 credits; new API pricing showed 2 credits/second for Subtitle removal and 2 credits/second for Fast-2K enhancement. No confirmation that migration increases the 300 MB limit was found. No migration was performed.

## VMake clean-first experiment — 5 October 2026

- Final checkpoint: deployed to production as `dpl_2KSLsJamZei2478smkYfdbwmGqvx`, READY, alias `https://szekspir.vercel.app`. Authenticated live UI verified remove-first wording and two-output mode's three-operation disclosure. No paid job created by UI verification. No GitHub commit/push.
- Final video downloaded completely and decoded without errors. SSIM versus previous enhanced master, top half outside subtitle band, all 2,800 frames aligned by frame index at timebase 1/30: 0.983574. Visual checks at 10/35/70 seconds show no obvious global blur outside the erased area, but visible inpainting artifacts remain inside it (especially classroom faces). Do not promise lossless AI cleanup. Private report and evidence: `../vmake-audit-20261005/REPORT.txt` and `final-comparison-*.png`.
- Confirmed deletion completed: MEL-115 cancelled/hidden in Szekspir and Cedrick My Tasks row 24 removed; MEL-116 cancelled/hidden and Kashieca My Tasks row 19 removed. Exact IDs verified before deletion and sheet ranges re-read afterward. Media retained. Private record/row backups stored beside report; do not commit them. Earlier pending statements below are historical checkpoints.
- Owner requested an actual reverse-order test, evidence, implementation of the successful solution, no extra quality-reducing compression, then computer shutdown. New standalone provider experiment does not resume or recreate the ads previously requested for deletion.
- Actual input: 16,917,346 bytes, H.264 720×1280, 30 fps, 2,800 video frames. Existing enhancement: 331,364,237 bytes, H.264 1440×2560, 30 fps, 2,800 frames. The original cleanup request returned `[10101] Please upload a video file within 300M.` This is evidence about this API path, not a universal claim about all VMake plans/interfaces.
- Reverse test succeeded at both provider stages. Cleaned original: 32,445,519 bytes, 720×1280, 30 fps, 2,800 frames. Subsequent enhancement: 342,457,768 bytes, 1440×2560, 30 fps, 2,800 frames; provider video duration 93.390658s. No intermediary transcoding/resizing/frame-rate change was performed by Szekspir. Provider AI processing is not mathematically lossless; subtitle inpainting modifies the erased region.
- The optional extra paid 15-second enhance-then-clean comparison was denied by approval review. Do not submit it or route around that denial without new user approval. Therefore do not claim a completed head-to-head visual A/B against a successful enhance-then-clean output. Existing original enhancement and source remain available as visual references. Download/visual verification of the final reverse-order result is pending in this checkpoint.
- The proposed 280 MB H.264 recompression helper and its tests were withdrawn, not deployed. New jobs persist `vmakeOrder: clean-first`; both-mode runs remove→enhance with two operations. Combo retains an independently enhanced original-subtitle copy and runs remove→enhance for the clean copy (three operations; disclosed in UI). New Additional Files both-mode uses the same order. Existing jobs/files without the marker retain their old order and paid checkpoints; no automatic historical migration/retry.
- New clean-first stage checkpoints each part, operation, task ID and result, polls existing tasks, preserves completed cleanup on explicit enhancer retry, and waits for all outputs before reference export. Legacy parallel tests remain dedicated legacy fixtures; clean-first/mode/additional-file tests separately cover the new default and interrupted/independent work. Typecheck, production webpack build and all 40 main offline regressions passed. Deployment remains pending in this checkpoint; no GitHub commit/push.

## Product naming correction — 5 October 2026

- Owner's canonical saffron product name is always **MELLOW SAFFRON GUMMIES**. Never generate Mellow Kids Gummies, Kids Gummies or Saffon as its product name, including hooks and narration. Magnesium is a separate product. Old saved product aliases can remain identifiers but must not become generated copy names.
- Both local saffron foundation document sets and profiles now contain this naming rule. This does not itself update uploaded production product documents or previously saved job scripts.
- Exact-file dedup deployed in dpl_2hJGgK9hWmreGWFX3dpds8d6Wp93; historical indexing UI completed with 94 indexed and 11 unavailable out of 105 entries. No original job deleted.
- Superseded by the clean-first experiment above: lossy cleanup-size preparation was withdrawn. Historical failed jobs were not automatically retried.

## Durable upload recovery and audit follow-up — 5 October 2026

- Supersedes the memory-only recovery limitation below for NEW submissions. Before uploads begin, IndexedDB atomically saves the batch metadata, captured job settings and original files. Audio and completed media URLs are checkpointed. Text/link submissions also retain their original UUID/payload. If local storage fails/quota is exceeded, submission stops before transfer and selected inputs remain; no false persistence promise.
- Unfinished uploads are listed in the same browser/market, including job pages. Resume is explicit, never automatic. Web Locks prevent two tabs from resuming the same job simultaneously. Same-tab/cross-tab recovery/status updates are propagated. Success removes local metadata/file/audio backups; cancellation removes backups too. Browser data clearing/eviction/private-session closure can still remove recovery data. Old uploads created before this feature cannot acquire a missing local file retroactively.
- TUS sessions now retain job/path-specific fingerprints and resume a matching same-origin upload session with a newly signed token; expired sessions fall back through the client's existing new-upload handling. Completed files remain verified after ambiguous errors. No credentials are stored in draft payloads. Blob fallback may restart an incomplete file.
- Database transport now retries interrupted/malformed RESPONSE BODIES as well as failed requests, with 8-second per-attempt deadlines. Conditional writes repeat the identical encrypted payload/CAS, not paid calls. Sanitised operation/attempt/status/reason diagnostics contain no credentials, state keys or payload. Original outage cause remains unproven; external service/network availability is not guaranteed.
- Fixed the parallel-hook test's missing alias dependencies. Legacy regression fixtures now isolate editor synchronisation (covered separately), omit delivery of the retired third hook, and supply historical baselines when testing propagation rather than manual deletions. Notes/combo fixtures reflect current editor ownership and VMake destination semantics. Production code was not weakened to satisfy old fixtures.
- Next pinned to 16.3.8 and transitive brace-expansion updated to address npm-reported advisories; install audit reports zero vulnerabilities. fake-indexeddb is a dev-only dependency. Local ffmpeg-static binary rebuilt after dependency refresh.
- Validation: 40 main offline regressions; focused upload, IndexedDB recovery, interrupted database-response, hook, editor checklist, notes, manual-edit and parallel pipeline checks; typecheck. Local-only Chrome smoke test exercised real IndexedDB/Web Locks with a synthetic file, page reload, explicit resume, and successful cleanup. Storage/job/provider calls in that browser test were mocked; no production job was retried and no paid generation or live Sheet mutation was performed. `node tests/upload-browser.cjs` serves this fixture at 127.0.0.1:3219.

## Drive web reconnect — 4 October 2026

- Owner completed JSON import and Google consent after the origin fix deployment `dpl_Ha7osPXjmRPkLVWoLo2jQgZp8uRr`. Verified authenticated live workspace: Send to Drive is enabled and selected, with normal Original video wording and no connection error. This confirms the folder-access preflight passed; no actual video upload or paid job was triggered.

- Follow-up: native setup form POST failed with Invalid origin before saving anything. Changed only the setup document Referrer-Policy from no-referrer to same-origin, so browser form submissions retain the Origin header. Strict origin check remains; foreign/missing/null origins still fail. OAuth redirect/callback retain no-referrer. Added route regression coverage.

- Production diagnosis confirmed expired/revoked Google authorisation. The historical OAuth client was Desktop, not Web. Owner approved creating a Web client in the same Google project, with callback `https://szekspir.vercel.app/api/drive/callback`; no scope expansion or public publishing requested.
- `/api/drive/connect` provides admin-only one-time web client JSON import and explicit Google sign-in. Configuration and tokens use existing encrypted private state. State cookie, single-use ten-minute attempts, PKCE, same-origin POST checks and application authentication protect the flow. Old active credentials are retained until Google grants offline access and the existing upload folder passes a write-capability check. No live upload is used for verification.
- The workspace opens reconnect in a separate tab to preserve selected media. After consent, return and use Check Drive connection again. No paid or failed jobs resume automatically.
- Google project is still in Testing; seven-day refresh expiry can recur. Publishing to Production is a separate access-duration change and has not been authorised or performed. Web-client JSON import and user consent are pending; do not claim reconnection complete until preflight succeeds.
- Deployed successfully as `dpl_FSHwR5yFn7TUMNqT5EKZiPpeBssR` to `szekspir.vercel.app`. Offline OAuth/status tests, typecheck and production build pass. Verified the live authenticated setup form in Chrome. New client JSON was downloaded locally; the owner must import the new credential and approve Google sign-in. No secrets are included in the repository. The live token exchange is not yet verified.

## GPT-6 Sol localisation default — 4 October 2026 (deployed)

- New workspace selections and the OpenAI backend fallback now use gpt-6-sol. Requests for that model explicitly use reasoning_effort low. Pinned GPT-5.6 models retain none; the separate British-English critic, custom endpoints, transcription and historical saved jobs are unchanged.
- Offline request-capture tests (tests/localize-model.cjs) and typecheck pass. User authorised deployment; production build succeeded and the live workspace shows gpt-6-sol. No paid model generation performed.

## Drive connection recovery — 3 October 2026 (deployed 4 October)

- Drive preflight now maps provider errors to fixed, actionable messages without returning raw provider details. Distinguishes expired/revoked authorisation, folder access/configuration and temporary failures. Upload remains disabled until preflight succeeds.
- Workspace displays the error and offers a bounded read-only recheck without reloading the page or discarding the selected media. App-session expiry is distinguished from Google authorisation failure.
- Offline drive-status tests and TypeScript check cover this patch. Authenticated live workspace confirmed expired/revoked Google authorisation after deployment. Broad production environment download was denied by the approval gate and must not be worked around. No live uploads or paid generations used for diagnosis.

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

## Force finish — 30 September 2026

- A separate Force finish button saves the current script/hooks and available material links, then closes the task even when delivery checks report missing assets. The receipt retains failed checks and explicitly marks the override; it does not claim complete delivery.
- The operation holds a job lease, preserves media and provider state, and never queues generation. Active/pending recordings, processing and hook-selection writes must finish first. A Sheets/save error does not mark the task force-finished. Changed scripts still mark old recordings as needing regeneration.
- Offline validation: typecheck, force-finish and finish-route tests pass. Existing editor-checklist combo fixture fails because it specifies Drive destination with VMake combo expectations; this unrelated fixture is unchanged.
- Changes are local and deployed directly; no GitHub push until the owner requests the end-of-session upload.

## Two speakers in one script — 30 September 2026

- The script-review step now has opt-in Two voices controls: main voice reads the introduction, a different selected voice reads from a selected sentence to the end. A preview shows both text portions; changing the text invalidates a stale split until reselected. Hooks retain the main voice.
- Optional start time is the exact start of the second audio segment in the final VO. The full first take is preserved when it fits, with silence added as needed. A slightly longer intro uses pitch-preserving tempo adjustment capped at 1.15×; if it cannot fit, fail visibly without publishing a mistimed combined VO or cutting words. Both per-speaker recordings remain saved for inspection. No time stretching is applied when time is omitted.
- Each completed speaker take is checkpointed independently. Interrupted paid requests retain the existing uncertain-request protection. Main recording is a combined uncompressed WAV, originals and separate parts are retained, optional ambience is applied once to the combined track. Single-speaker source-pace calibration/previews are not applied to dual-speaker generation.
- Settings persist when recording or finishing. Recordings are never created merely by enabling the checkbox. Legacy jobs using two voices use the parallel pipeline. Normal one-voice workflows are unchanged.
- Offline checks: exact timing with generated tones, natural concatenation/padding, bounded pitch-preserving acceleration, invalid/stale split rejection, checkpoint reuse after second-provider failure, original preservation, existing pipeline/voice tests and typecheck. These validate mechanics; no paid two-voice audition was run as a test.

## Compact quality alerts — 30 September 2026

- Quality alerts are collapsed by default with the warning count visible in the summary. Expand to see comparisons and run Check now.
- Mounted only on the UK/PL Szekspir landing/upload view after route initialization, never on job tabs, Additional Files or admin working pages. Background quality checks are unchanged; client summary polling only runs while the landing panel is mounted.

- Once a durable job is loaded, production progress uses its current errors/status and ignores stale browser upload errors. This avoids a false Needs attention banner after a recovered database/save timeout.

## Collapsible ad preview — 30 September 2026

- Job progress cards include an initially expanded original-video preview identified by Ad ID. Direct uploaded/resolved videos use native controls; saved Drive-only references can use the Drive preview. No autoplay.
- The preview is open by default (user correction); media mounts only when expanded and unmounts on collapse to stop playback and avoid downloading videos in every working tab. Audio/text-only sources without video do not show a misleading player.

## Additional editor comments — 30 September 2026

- Job pages now let the user append an Additional comment after upload/recording. Saves only Notes in the current assigned editor and admin row, preserving existing notes from both. Exact retries do not duplicate the paragraph. No regeneration or completion action is triggered.
- Uses assignment/workspace locks, resolves current assignment and headers by Ad ID, refuses missing/deleted/ambiguous rows rather than recreating them. Updates saved job notes to retain the additions in subsequent exports.

## VMake videos up to 20 minutes — 1 October 2026

- VMake itself still accepts at most 10 minutes per request. For source videos over 10 and at most 20 minutes, Szekspir makes keyframe-aligned parts roughly 500 seconds long, submits each part separately for the selected VMake mode, and joins the completed outputs in order. Two or three provider submissions per operation consume correspondingly more credits. Source parts, task IDs and output URLs are durable checkpoints; retries preserve successful paid parts. `enhance`, `remove`, `both` and `combo` retain their distinct output semantics.
- Long-video splitting and joining use bounded temporary server storage (450 MB combined; source and provider parts have tighter per-phase limits). Oversized high-bitrate sources fail with a clear lower-bitrate instruction rather than exhausting server memory. Browser uploads still have the existing overall 2 GB limit. A real 12:33, 86 MB source was split into 505.1s and 248.6s parts and recombined to within one millisecond of source duration without calling VMake. Provider output stitching still needs a live audition; do not claim it is proven by the source-only test.
- Localisation now ignores unsolicited hooks when the user disabled them. If two requested hooks are still invalid after the existing retry, it preserves the valid main script with zero hooks and an explicit note instead of failing the whole job. Focused offline localisation, pipeline/retry/mode tests, typecheck and production build pass. No live paid generation was used for verification.
- Production deployment is ready on the existing `szekspir.vercel.app` alias. The previously failed 12:33 job was **not** retried: the approval gate blocked the action because it would trigger two new paid VMake enhancement requests. Await the owner's explicit confirmation of credit usage before resuming it. Do not work around that gate through another interface.

## Eleven v4 voice direction — 1 October 2026

- New ElevenLabs TTS requests use `eleven_v4` in the main UK/PL voiceover, selected alternative hooks, dual-voice segments, additional files, and voice previews. Existing recorded media is not regenerated or changed. Saved takes include the model ID in timing metadata.
- The recording UI offers explicit emotion/tone and one optional opening reaction, including experimental `[yawns]`. The default is no emotion or reaction tag. Legacy `subtle` selections remain valid. Tags guide delivery but cannot guarantee the sound; review the generated take before approval. The voice setting omits the old native `speed` parameter because v4 does not offer that control. Source-duration preview now measures natural v4 delivery only; old faster-preview requests are rejected before any paid request.
- Focused offline provider and preview tests plus TypeScript and a webpack production build passed. The default Turbopack build could not start in this workspace because `node_modules` is symlinked outside its filesystem root. The full legacy regression test currently stops at a pre-existing job-stage expectation (`export` versus `references`); no live ElevenLabs generation was used.

## Editor product labels — 1 October 2026

- UK upload/text jobs offer a Product label: Magnesium Bisglycine Gummies or Kids Gummies. It is separate from the existing Copy reference and does not change localisation prompts or product claims. PL is unchanged. Legacy jobs have no inferred label.
- New briefs persist sheetProduct into the admin Product column on creation; retries/finish preserve subsequent sheet edits. Editor sync resolves Product by header, preserving manual changes/deletions and deleted rows. Editor Product is column A; Ad ID and existing columns shift right with native Sheets insertion. Admin Product is appended at AD to keep existing mappings stable.
- Expanded editor read bounds cover shifted final columns. Offline product-sync, manual-edit, review-sync checks and typecheck validate the change; no paid generation is used as a test.

## Product reference editing — 2 October 2026

- `/product` now lets an admin rename the selected product folder and edit the text of any existing research file. Rename updates every matching row in the Products sheet while retaining its files; duplicate names are refused. File edits overwrite only that file's content and update timestamp, with JSON/size validation and a stale-content check to avoid silently replacing a newer version.
- Existing jobs keep their saved product context and name; new jobs read the updated product and its new context version. The UI provides Save/Cancel and visible success/error feedback. No production product rows or live Google Sheets were changed during verification.
## Upload interruption recovery — 5 October 2026

- Browser upload now detects two minutes without increasing bytes (Supabase TUS and Vercel Blob). TUS checks stored file completeness before reporting interruption; progress at 100% is not by itself proof of a saved file. The active request is aborted on timeout. Browser suspension can delay timers until the browser resumes.
- Failed media/link tasks offer Retry upload in the original upload tab. Retry retains the same UUID, captured settings, extracted audio and completed media URLs; a save-only retry does not re-upload media. Per-task locks prevent concurrent double clicks. No paid-stage retry action is called. Existing createJob returns the existing job and preserves checkpoints on duplicate UUID.
- beforeunload warns while upload/save is active. Files and retry closures are held only in memory; closing/refreshing the original tab still requires file reselection. This is not persistent chunk-level resume. Preflight errors keep selected files.
- A stale browser upload no longer displays an active stage or endlessly increasing timer. It shows last reported progress and recovery instructions. Poll failures clear upon successful status reads without clearing unrelated submission errors.
- Offline audit covers 74% stall, repeated unchanged progress, ambiguous successful upload, Blob abort, audio/save retries, partial job registration, preserved job checkpoints, stale rendered UI and saved-job precedence. No paid providers, live sheet writes or retries of the user's stalled job were used. Full browser/network end-to-end upload remains untested; existing large VMake output-size limits are a separate issue.
- Relevant upload/progress tests, parallel pipeline suite and typecheck pass. The separate `parallel-hooks.cjs` harness cannot load `@/lib/hook-delivery` (alias resolution), so do not report the entire test suite green.
- Production deploy `dpl_Hdd1x1GxZmn2L8vtgbVFGYWrE3M6` is READY and aliased to `szekspir.vercel.app`. Browser verification on the user's original stalled job shows Needs attention, last-reported 74%, frozen timer and recovery guidance; latest status read succeeds. No new saved job/result was recovered. The underlying cause of the original transport interruption/database outage remains unproven; this fix addresses detection and recovery, not a guarantee against service/network failure.

## Durable upload recovery and audit follow-up — 5 October 2026

- Supersedes the in-memory-only limitation above for new submissions: files, extracted audio, captured settings, UUID and completed URLs are saved in IndexedDB before transfer. Explicit Resume upload works after reopening the same browser. Browser data clearing/eviction can remove the backup. Confirmed server saves and cancellation remove it; missing drafts fail visibly rather than pretending to succeed.
- Web Locks prevent simultaneous recovery of the same draft across tabs. Supabase TUS resumes matching same-origin sessions; Blob may restart unfinished transfers. Same-tab and cross-tab status notifications keep recovery controls current. No automatic paid generation is initiated merely by reopening a tab.
- Database retries now cover interrupted/invalid response bodies, with bounded eight-second attempts and sanitised diagnostics. The original outage cause remains unproven.
- Fixed stale test fixtures and hook aliases without weakening manual Sheet deletion protection. All 40 main regression checks, focused upload/state/hook/editor tests, parallel pipeline tests and typecheck pass. Real Chrome IndexedDB/Web Locks smoke test preserved a synthetic file across reload, resumed it with mocked network transfers, then removed its backup. This is not a live paid end-to-end provider test or the entire repository test suite.
- Next.js updated to 16.3.8 and vulnerable transitive dependency patched; install audit reports zero known vulnerabilities. fake-indexeddb added as a development test dependency. node_modules is now locally installed (not the earlier symlink); ffmpeg-static rebuilt locally.
- Final production deployment `dpl_AGz1Wi9iqWRYNf12c6efoV2Sed3L` is READY, aliased to `https://szekspir.vercel.app`; production build and TypeScript passed. No commit or GitHub push this turn.
- Original job `a7ff7e21-14fa-4562-80b9-0f37779d22e3` predates persistent backups and remains unsaved at last-reported 74%; original file must be selected again. No user job was retried, no production Sheet rows were edited, and no paid generation was used for verification. Large VMake output-size handling remains a separate issue.
