# SZEKSPIR — AI handoff
Current source snapshot: 18 September 2026. Next.js App Router + React, Python VMake endpoints.
Start with AGENTS.md, docs/OPERATIONS.md and package.json. Current code supersedes older handoff notes.
Setup: npm ci; configure .env.local with the owner's credentials; npm run dev.
Check: npm run typecheck; npm run build. Tests are in tests/; editor-live-check can write to live Sheets.
Main UI: app/szekspir/page.tsx. Upload basket: app/szekspir/components/file-drop.tsx.
Admin tools: app/admin/check-script; history: app/szekspir/history.
Pipeline/state: lib/jobs.ts, lib/parallel-pipeline.ts, lib/store.ts. Sheets: lib/editor-sync*.ts.
Preserve concurrent uploads, cancellation protection, existing manual edits and generated voiceovers.
Use exactly TWO alternative hooks; original hook is already included in main voiceover.
Do not add a product reveal or brand when absent in source. Preserve CTA intent.
Recognise SP Nutrition, Spenatrician and P-nutrition as competitor aliases.
Singing ad preserves original lyrics except confirmed brand replacement.
Send to Drive defaults on. Ready for review is editor-controlled beside Your work.
Duplicate checker compares transcripts with saved history without creating a production job.
Deployment uses Vercel. Link the correct project and configure environment before deploying.
No credentials, node_modules, build output, live database/media or deployment tokens are included.
.env.example lists detected variable names only; not every variable is required. Consult docs.
