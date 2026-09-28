# Supabase cutover — SZEKSPIR

## Approved scope (14 September 2026)

Start a new empty job list. **Do not migrate old ads, transcripts, histories or media.** Existing Google Sheets rows and old Blob objects stay untouched. Keep the Ad ID sequence above all existing IDs (at least MEL-00007). The former copy script `scripts/migrate-state.cjs` must NOT be run for this cutover.

## Prepared and tested

- Project `mhanrmumnogrmwkkmarc`, region eu-west-1.
- SQL in `supabase/migrations/20260914_state.sql` applied. Service role only; RLS enabled. Anonymous clients cannot read state.
- Existing AES-GCM encryption retained. Database revisions support atomic compare-and-swap and retry without lost concurrent updates.
- New `jobs` index is empty. `sheet-allocations` seeded with maximum existing ID and occupied row, no old job reservations copied.
- `szekspir-media` bucket created PRIVATE for testing, 50 MiB maximum, only video/audio MIME types. User explicitly approved public links; bucket now permits public reads. Upload permissions remain restricted.
- Signed resumable upload uses `/storage/v1/upload/resumable/sign`, a per-path `x-signature` token plus the publishable API key. No server key reaches the browser. Live 7 MiB two-chunk upload and byte-for-byte download passed; synthetic fixture removed.
- Live state encryption, read/write, concurrent writes, stale revision rejection passed. Public-key RPC attempt rejected with 401.
- Supabase URL/keys stored in local private environment and production environment; never commit them.

## Final cutover after approval

1. Update only `szekspir-media` to public read if explicitly approved. Upload remains restricted to signed paths. Otherwise implement private delivery before cutover.
2. Check an uploaded synthetic media file through its final public URL, including CORS preflight for signed TUS. Delete only that test object.
3. Set production `STATE_BACKEND=supabase`, `MEDIA_BACKEND=supabase`, `STATE_MAINTENANCE=0`. Retain original encryption and Blob keys. Deploy.
4. Verify production job list is empty, upload configuration returns the 50 MiB limit, authentication remains enforced, and existing Sheets rows are intact.
5. Bootstrap `/api/jobs/worker` with existing machine authentication to restart job/editor-sync queues. Old queued job IDs should return no job and do nothing. No AI/VMake calls needed for this check.
6. Verify a new test upload, but do not create paid localisation jobs or publish test rows unnecessarily.
7. Record deployment URL and checks here.

## Limits / behaviour

The Free storage limit is 50 MiB per file. Browser checks size before extracting audio; server enforces it before signing and bucket enforces it on upload. VMake output and saved voiceover also use Supabase and are checked against the same limit. Existing stored URLs remain unchanged. Vercel continues hosting the application and queue workers; this removes new Blob reads/writes, not all Vercel usage.

No silent fallback on Supabase failures. Rolling back to Blob after new jobs exist would hide them and requires a deliberate data reconciliation. Keep all old objects; do not delete the Blob stores as part of this change.

Validation: `npm test`, `node tests/supabase-state.cjs`, `node tests/media-storage.cjs`, `npm run typecheck`, `npm run build`.

## Completed cutover

- User approved public media links. Bucket public retrieval and browser TUS CORS passed.
- Production deployment `dpl_DBTARhGiMvUyQ1Fno98EpS8282PT` is READY at https://szekspir.vercel.app (deployment https://szekspir-fzobvw4sb-anowak3211-3031.vercel.app).
- Both production backends set to `supabase`; maintenance off. Local configuration matches.
- Authenticated production worker read returned 200 and no old MEL-00007 job, confirming new state transport works. New index has zero ads; allocation max remains 7, next ID 8.
- Queue bootstrap returned 202. Editor sync completed at 2026-09-14T11:44:15.875Z without error or outstanding lease.
- Prior tests: all 39 regressions, separate database/media tests, production build, live DB CAS/encryption/anonymous denial, 7 MiB signed multi-chunk upload with matching downloaded bytes, public retrieval/CORS.
- No paid AI or VMake job created for validation. Full browser/UI submission was not tested: the local password differs from production and production password is intentionally unavailable through env pull. Authentication was preserved; production checks used the existing machine credential. Temporary env pull file was removed.
- No old ads migrated or old Blob objects/Sheets rows deleted. Private sync metadata is rebuilt from the existing Sheets, preserving continued workflow.
