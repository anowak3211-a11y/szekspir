# SZEKSPIR v2 operations

Local source is Next.js 16.3.5. The old handoff's Next.js 15 description is obsolete.

## Before deploying
- Existing provider keys remain unchanged. Do not put secrets in handoffs.
- Set APP_PASSWORD in every deployed environment. Production fails closed without it; development can run without it.
- Set CRON_SECRET to a strong independent random value in Vercel. On Hobby, the checked-in daily cron is a recovery sweep. Active jobs are processed by the native Vercel Queues topic szekspir-jobs. The private queue consumer handles one durable step and schedules the next; polling is delayed by 20 seconds. This does not depend on an open browser or recursive HTTP calls. Queue delivery retries infrastructure failures; ambiguous paid requests still require an explicit retry. The daily cron recovers saved jobs whose initial queue publication failed.
- APP_ORIGIN is the trusted deployment origin used for internal VMake calls. Alternatively VERCEL_PROJECT_PRODUCTION_URL is used. Never derive it from an incoming Host header.
- BLOB_READ_WRITE_TOKEN is required for public media. STATE_READ_WRITE_TOKEN is required for private job state. Job state is additionally AES-256-GCM encrypted. Private reads use useCache:false for consistent origin reads; public Blob does not support that guarantee and must not be used for mutable queue state. JOB_ENCRYPTION_KEY can supply a separate stable key; configure it before creating jobs. Changing the encryption key (including a fallback Blob token rotation) requires migration of existing state. Back up before rotation.
- Media remains in the existing public Blob store so editors/VMake can open the links. These media links are bearer-style public access; page authentication does not protect them. State blobs contain ciphertext, not readable scripts or product records.
- Do not remove state-v2/sheet-allocations.bin: it preserves ID reservations and idempotency. Take encrypted backups along with the key-management plan.

## What changed
- Minimal-change localisation, no automatic understatement and no ASA/CAP rewriting pass. Source-only mode preserves source assertions for internal review; brand mode uses actual product data and records missing values explicitly.
- Schema validation with one bounded retry. Critic changes are limited to known spelling/vocabulary pairs; whole-script rewrites and numbers are rejected.
- JSON/ZIP import separates facts, evidence, research and examples. README and operational prompts are excluded, with an import report. Existing older files with those roles are also excluded when context is assembled.
- Script, spoken narration and duration are distinct. Voice choice is explicit and saved locally. Auto-VO has its own toggle. Source duration comes from transcription or uploaded media metadata; actual VO duration is measured by the audio player for comparison.
- Durable encrypted job records, leased steps, existing provider task IDs and resumable progress. No browser-held VMake polling state. Each private queue delivery advances one leased step. VMake task IDs are reused when polling or retrying, without re-submitting the video.
- Interrupted paid requests with uncertain provider acceptance are not automatically repeated. The UI asks for an explicit retry after checking provider history. Successful exported rows and media are reused.
- CAS ID reservations prevent two app exports from selecting the same ID/row. Repeated saves use the same job reservation and preserve editor-owned columns. Manual external writes into a reserved row produce an error instead of overwrite. Other external systems allocating IDs must use the same allocator or a distinct namespace.
- New rows receive a status formula based on Approval text, Your work, Editor ID and Signed by. Approved → Launched; rejected/changes requested/red → Changes requested; work link → Ready for review; signature → Editing; otherwise To do. Colour alone is not a value. Existing status automation is not overwritten.
- Python endpoints enforce authentication independently. Downloads pin public DNS addresses, recheck redirects and enforce size/time limits. Debug output no longer returns provider response bodies or signed input URLs.

## Verification after configuration
1. Import the conversion-first ZIP; confirm the JSON profile is facts and both master prompts are excluded.
2. Run one short link and one local video with your chosen British voice. Confirm clean video + VO + reference links and measured durations.
3. Close the page after queueing. Reopen after background processing; the same job and Ad ID should remain.
4. Edit its script and save; confirm the same row changes and editor feedback stays intact.
5. Simulate a rejected provider request and check Failed/retry state rather than Complete.
6. Confirm unauthenticated Next and Python routes return 401; missing production APP_PASSWORD must not expose the app.
7. Confirm active jobs finish without browser polling, and the daily recovery cron and private queue trigger are registered. Offline regression tests use mocked providers; production checks are recorded below.

## Limits deliberately visible
The file downloader still uses HTML extraction for public ad pages; JavaScript/login-only pages need an uploaded file. Local files are uploaded directly to Blob; extracted transcription audio is capped at 24MB. Research documents are capped at the Sheets cell limit. This is not automatic video editing or a guarantee of voiceover timing: differences are measured and shown for the editor. App can resume and retry work; external provider APIs do not guarantee exactly-once billing after an ambiguous network interruption.

## Production verification — 14 September 2026
- Production: https://szekspir.vercel.app ; runtime deployment dpl_AL6U85nnhNh7xSsWnAgAKECzjBnz.
- 33 offline regression checks passed, TypeScript and production build passed. Native queue tests cover advancing and scheduling the next durable step.
- Anthropic models endpoint and British ElevenLabs voices verified on the server. Mellow's missing structured product profile imported into Products alongside its existing research.
- Two synthetic short videos completed the link and uploaded-file paths: transcription, US→UK localisation, Sheets export, ElevenLabs narration, VMake text removal, saved video and final reference links. Only read-only inspection was used while the native queue ran.
- Daily Briefs rows 3 and 4 are explicitly marked SYSTEM TEST: MEL-00002 and MEL-00003. Both have source, VO and clean-video links and production status To do. This status describes editor work, independently of the app pipeline's Complete status.
- MEL-00003 was edited and completed again with its original Ad ID, original VMake task and original clean video, plus a new r1 narration. No repeat video submission occurred.
- Initial test voices measured 4.88s and 5.44s; clean videos measured 4.923s at the fixture's 360×640 resolution. A sampled output frame confirmed text removal. These are synthetic integration fixtures, not a quality benchmark for real advertisements.
- Unauthenticated page, jobs, Python status, worker and queue-consumer routes reject access. The queue consumer is registered as a private queue trigger. Existing app password and provider keys were not changed.
- Production issues fixed during testing: weak HTTP ETag normalisation; generic Blob CAS conflicts; stale public-Blob reads (migrated all four encrypted state records to private storage); missing-blob detection; recursive HTTP worker handoffs (replaced with native Vercel Queues).
- No hosting-plan upgrade or Google Cloud billing activation was made. Private state token and encryption/recovery configuration are retained in owner-only .env.local, excluded from deployments. The encrypted pre-migration backup is retained outside the deployed project.

## Editor Workspace synchronisation
- Active editor workbook: 1zi8uoLMsuRTK5cTpBNOiAkKXjEZs1MhNHqbyK5u5zk4, My Tasks. EDITOR_SHEET_ID can explicitly select another workbook; it must be shared with the bot and have the same headers. This configuration connects this one workspace; it does not automatically connect copies.
- The native private topic szekspir-editor-sync checks about once per minute independently of browsers. The daily worker cron is a recovery bootstrap. POST /api/jobs/worker with the existing machine credential and action sync-editors can bootstrap it manually.
- Ad ID is the join key, never row position. Headers are resolved by name. Admin owns Adapted script, HOOK OG, Hook 1–3, Reference file, Feedback and Approval. Ad name, desire, angle, mechanism, funnel, LP, likes and Editor ID are never sent to the editor workbook.
- Your work, Hours spent and Signed by use a persisted three-way baseline. A change made on only one side is copied to the other, including clearing a value. If both sides changed differently between checks, the editor's value is retained and the admin dashboard reports the conflict count. Duplicate/invalid IDs and a full workspace stop the sync rather than overwrite rows.
- Existing rows, formatting, status formulas and editor work are retained. Orphan editor rows are not deleted automatically. The initial unassigned instructions in My Tasks B2 were preserved in Instructions & Assets B2.
- Dashboard B7 (admin) and B4:C4 (editor) show connection state and last successful sync. The private encrypted state contains the last shared-field baseline and a lease to prevent simultaneous sync runs.

### Sync production verification — 14 September 2026
- Deployment dpl_3cneZ7FgpmqBcSGqu6iY4tfae3ks is live at https://szekspir.vercel.app. All 39 regression checks, typecheck and production build passed.
- Native recurring queue propagated an admin Hook 1 change to the editor and editor work link, hours and signature back to admin without a manual sync call. Both status formulas changed to Ready for review.
- All temporary test values were restored; the following automatic check propagated their removal and returned both statuses to To do. All 13 mapped fields match for MEL-00001 through MEL-00004. Dashboards confirmed successful recurrence at 00:30:05 and 00:32:08 Europe/London.
- Visual inspection confirmed compact 60px task rows and populated scripts/hooks. Owner-only brief/status protection is retained, with the existing service account authorised for sync; private strategy columns are absent from the editor sheet.

## Product reveal and source intent — 18 September 2026
- Preserve the source's level and timing of product disclosure throughout the body, hooks and narration. Brand adaptation is substitution, not permission to insert a product reveal.
- If the source says “a specific form of magnesium”, “a small company”, or describes an ingredient/mechanism without a brand, keep it generic. Do not insert MELLOW, a full product name, gummies, an offer, or a purchase CTA simply because these appear in the product profile.
- Replace a competitor identity only where the source explicitly names that branded product. If the reveal comes later, do not move it earlier or add it to alternative hooks.
- Preserve curiosity-led/article-led intent, personification and reverse psychology, including “So don't click the link”.
- Concrete counterexample: MEL-00025 added “MELLOW Magnesium Bisglycinate Gummies” before “a specific form of magnesium”. This is an unwanted reveal; the source wording should remain generic.
- Runtime prompt: uk-faithful-2026-09-18-v10. These rules take precedence over brand insertion examples in product documents. Existing generated scripts are not silently regenerated by a prompt update.

### Mandatory brand gate — v11
If the US source does not name SP/SP Nutrition (or already MELLOW), never insert MELLOW or its full product name. “Magnesium bisglycinate” and “S tier” do not qualify. Runtime checks both body and hooks, retries one invalid output, then fails without saving if the reveal persists. Narration derives from the validated script. Do not retroactively overwrite user-corrected advertisements.

### Confirmed sung competitor alias — v12
The user confirmed “Spenatrician” is SP Nutrition mis-transcribed from singing. Recognise it case-insensitively, including a missing leading space such as “againSpenatrician”. This qualifies as an explicit competitor mention: substitute the target brand at that location only, preserving the preceding word and spacing. Do not extend this exception to arbitrary unknown words.

### Confirmed competitor alias — v13
P-nutrition is a user-confirmed variant of SP Nutrition. Recognise case-insensitively, including spacing around the hyphen. Replace the brand only at that explicit mention; do not add brand reveals elsewhere.

## Singing ad
Upload offers an opt-in Singing ad tile. It persists on the job and applies to script regeneration. The main script is the source transcript verbatim except confirmed SP Nutrition aliases replaced in place with the selected brand. No British rewriting, punctuation cleanup, offer replacement or added product reveal. Two optional alternative hooks remain separate from the preserved main lyrics. Voiceover is deselected when enabling this mode; this mode does not synthesise singing.
