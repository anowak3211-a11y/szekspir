# Editor video quality alerts

The automated check compares **pixel counts**, not subjective quality, file sizes or bitrate. A submission is red when `submitted.width * submitted.height <= reference.width * reference.height * 0.70`. Exactly 30% loss is included. Larger exports are not certified as visually better.

- `lib/video-quality.ts`: pure comparison and bounded MP4 metadata reader, with no re-encoding or full video downloads.
- `lib/editor-quality.ts`: Drive metadata/folder and smart-chip resolution, reference probing, persisted workspace results, cell notes, and narrowly owned conditional-format rules. Links, chips, values, review text, statuses and manual notes remain intact.
- `GET /api/editors/quality`: authenticated result read; cron authentication triggers a scan.
- `POST /api/editors/quality`: authenticated manual scan.
- Cron: every five minutes, offset by two minutes from editor synchronization.
- The Szekspir / Additional Files / admin notification prioritizes Your Revised Work over Your work. Original low-resolution cells remain marked as historical submissions; a good revised file removes that task from the notification.
- Admin Ad ID shows the latest assigned editor's alert even if its manually preserved work link differs; work links themselves are marked only when their comparison matches the inspected cell.
- Unavailable links, missing dimensions, unsupported hosts and unreadable containers are unknown, never passed. Temporary scan errors retain previous results and surface stale-state warnings.

The remote reader allows only the configured Szekspir Supabase public-media origin, disallows redirects and credentials in URLs, and bounds byte ranges / metadata sizes. Drive folders and shortcuts have depth and file-count limits. Changing an upload under the same Drive ID is rechecked each scan.

Verification: `node tests/video-quality.cjs`, `node tests/review-sync.cjs`, `node tests/deleted-editor-rows.cjs`, `npm run typecheck`, `npm run build`. Production UI and live Sheets were checked on 2026-09-25: threshold alerts include MEL-26, 41, 50, 54, 58, 63 and 65. This is an in-app notification, not an email or desktop push subscription.
