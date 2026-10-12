# Szekspir audit — 6 October 2026

Scope: UK/PL Szekspir uploads, saved jobs, localisation, VMake legacy video processing, ElevenLabs recordings, editor delivery, cancellation, recovery and production operation. Existing accepted provider tasks and approved files must be preserved. No VMake migration, account change, new paid test generation, or unrelated Sheet mutation.

## Findings and repairs

| Area | Finding | Repair / verification |
| --- | --- | --- |
| Database outages | Status/checkpoint failures stopped otherwise recoverable work; saved provider tasks continued independently. | Durable retries with bounded cooldown; restore old non-paid failures only with task/brief evidence; pending/uncertain/stopped guards. |
| Regional network | Supabase reports intermittent latency for Eastern-US clients. The queue used iad1; observed database timeouts match this failure mode. Exact attribution of every timeout is unproven. | Production functions and new queue messages in fra1, verified deployment output; bounded 20-second database requests, identical-CAS reconciliation retained. [Supabase incident](https://status.supabase.com/), [Vercel regions](https://vercel.com/docs/functions/configuring-functions/region). |
| Lost paid response checkpoint | A provider can accept a request before the job database records its ID. | Encrypted immutable private receipts outside Supabase, scoped to job/stage/part/operation/nonce; recovery never submits a replacement. Unknown acceptance without evidence remains guarded. |
| Pending-marker acknowledgement | A pending marker may commit while its acknowledgement fails, before the provider is called. | The still-running attempt records acknowledgement state and can safely clear that marker if no provider call began. Offline test injects this exact failure. |
| Archive/status pressure | Unbounded archive reads and frequent broad client polling create unnecessary database traffic. | Six concurrent archive reads; compact landing status; complete single-job detail; visible/hidden polling cadence. |
| Legacy status query | SDK read retries could exceed the status endpoint's 60-second lifetime. Transport failure was indistinguishable from a processing response. | Keep the same legacy strategy, signer and task query; bound its read timeout; return sanitized status-unavailable state while retaining the task. |
| Long VMake queue | Elapsed time alone does not prove failure. | Continue status-only checks at slower cadence after an hour; no automatic paid resubmission. Explicit provider terminal errors stay visible. |
| Video downloading | DNS/body completion did not share a reliable total deadline; request close could cancel a deadline before body completion. | Bound DNS, redirects and body; reject interrupted streams; deadline and timer cleanup regression tests. |
| Video output semantics | Combo requires two distinct permanent outputs and correct editor labels. | Tests cover source enhancement and clean-first enhancement, multi-part 20-minute work, partial checkpoints, independent failures and final links. Real existing completed outputs recovered and delivered. |
| Localisation depth | Own-brand adaptation was confused with creative rewrite; a selected Full job rewrote the main opening. | Product/reference selection resets Close; explicit Creative rewrite label; sentence-level light-edit instruction and retained-wording guard. Requested manual correction keeps its source opening/order. |
| Naming and formulation | Competitor counts persisted; canonical-name replacement could damage domains/emails. | Use target foundation ingredients without unsupported count; protect URLs/emails; visible product labels canonical while legacy storage identifiers remain compatible. |
| ElevenLabs v4 | Obsolete pause/breath controls obscured delivery choices. | Native delivery, one preview, no injected breaths; tone/reaction/background retained; old recordings/checkpoints preserved. Offline cache/dual-voice/hook tests. |
| Hooks / recording races | Concurrent hooks and late callbacks must not duplicate requests or publish after a stop. | Claims, durable originals, revision/selection gates and cancellation checks; concurrency and late-response tests. |
| Sheets / assignment | Brief IDs, sorted rows, manual editor changes and delayed exports need protection. | Exact-ID matching, stable per-ad/workspace locks, reusable formulas, durable briefSaved checkpoint and sync-only resume. Real readback compares requested scripts/files with assigned editor rows. |
| Cancellation | Previously stopping a job left its Sheet records. | Stop/capacity revocation, retired IDs, encrypted backups, exact record cleanup, export drainage and visible partial-failure retry. Owner-requested removals verified across configured workspaces. |
| Upload recovery | Browser interruption, duplicate clicks/files and lost registration acknowledgements must preserve drafts and checkpoints. | IndexedDB/Web Locks recovery, deduplication, bounded progress stall detection, completion confirmation and idempotent registration tests. |
| Preparation vs delivery | A preparation-complete job could imply all delivery was ready while a chosen VO remained unapproved. | Explicit script/voice review title and waiting row; the delivery checklist still requires the recording. No unreviewed recording or force-finish override. |
| Access / URLs | State and receipt data must stay private; user-supplied media URLs must not reach internal services. | Server-only credentials, encrypted state/receipts, fail-closed auth, DNS-pinned public downloads, size/redirect limits. Static review and offline checks; no access-policy weakening. |

## Observed VMake output limitation

Actual original-subtitle and cleaned output frames were compared. The large spoken-caption overlay is removed, but legacy automatic text removal also erases some diagram labels and leaves small inpainting traces. This is a real provider-output limitation, not a database or delivery success signal. The enhanced original-subtitle copy remains separately available for the editor. No model migration or promise of lossless/pixel-perfect text removal was made. The live videos checked here are short ads; the multi-part >10-minute path is covered offline, not by a newly paid live trial. The documented 450 MB temporary joining budget and 2 GB storage/file cap still constrain large enhanced outputs.

## Operational readback

The complete index of 116 saved jobs was inspected. Two additional current failures from the same database outage were discovered and resumed using their existing paid checkpoints. Three older finishing/quota failures were reconciled only after exact editor readback confirmed complete existing delivery, with scripts/recordings/media unchanged. Other historical records with ambiguous paid requests, provider failures, manual/missing hook/video contents or a missing master row are retained for an explicit decision; cancelled tombstones and prior paid-retry approval blocks are not blindly replayed.

Voice-enabled jobs whose scripts have not been sent for recording intentionally require script approval. Preparation and video export can finish first; the editor delivery checklist remains incomplete for those planned recordings until approval. This is now explicit in the progress card, waiting stage, Saved jobs label and tab title.

## Validation

The final full offline suite includes 83 independently run suites across the repository. Six failures were stale test harnesses (old function extraction/import mappings/cache or version assumptions), repaired while retaining their original behavior assertions. A new media deadline regression is included. Typecheck and production builds pass. Python tests cover legacy terminal status, missing output, sanitized transport failure, bounded query policy, multipart upload ordering, abort and stream cleanup. The native Chrome uploader recovery fixture also passed: a synthetic file persisted through page reload, resumed successfully, then removed its completed backup. No production API or paid provider was involved.

Live verification uses only existing user-requested tasks. Application Complete status is additionally checked against permanent saved assets and the actual assigned editor rows. Provider status 0 is reported as pending, never as a completed file. No provider migration or duplicate processing is justified by an application database error.

The maintenance evidence, exact ad/task identifiers, signed provider URLs and backups are private outside this repository. Production deployment and final check totals are recorded in HANDOFF.md when verification completes.
