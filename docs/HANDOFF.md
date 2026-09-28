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
