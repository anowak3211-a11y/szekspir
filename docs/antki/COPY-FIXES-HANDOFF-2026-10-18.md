# Mellow UK copy fixes — handoff, 18 October 2026

## Scope and source

Owner explicitly requested implementing and remembering `/Users/jakubcabanowski/Desktop/mellow_copy_fixes_for_agent.md`. Unmodified source copy is retained in `owner-feedback/mellow-copy-fixes-2026-10-18.md`. Read this handoff alongside it: the source contains two factual conflicts described below. It is not a medical evidence source.

Canonical product name: **Mellow Mood Munchies**. Destination: `https://try-mellow.co/products/mellow-happy-chews-saffron-gummies`. Do not use the optional older Happy Chews name mentioned in the imported file; the owner's exact current project name takes precedence.

## Concrete edits

| Story | Records | Edits |
| --- | --- | --- |
| Oliver, 14 | ANT-00061 / facebook_3572186736282930 | Restored quoted FB question and comment, the specific one-pathway/four-pathway passage, and Week 6 history dialogue/short emotional beats. Kept coworker ending and P.S. Numeric examples retained. Both UK variants receive current guarantee correction. |
| Daughter, Sophie and Megan | ANT-00057 / facebook_2944596099207751 | Replaced promoted Bryte name, Year 5 reference, seasonal phrases, dining-hall scene, quoted Megan dialogue and complete EDIT. Close-localised version keeps existing dialogue and receives the same technical brand/school/season corrections. |
| Borrowing vs earning | ANT-00051 / facebook_1954166325276879; ANT-00054 / facebook_1338787198313351 | Removed both Bryte Saffron mentions, added actual Mellow link to EDIT and current money-back guarantee. Rest of existing prose preserved. Both UK variants corrected. |
| 1am alarm / sleepover | ANT-00033 / facebook_1398871585505286; ANT-00042 / facebook_1087866423929969 | Birthday moved from next month to a couple of months in both UK variants. Existing medical passage was not replaced with an invented mechanism. |

These are point edits of saved versions, not paid regeneration. USA originals and images stay unchanged. Saving a corrected draft does not approve it, create a new ad or update an existing Meta ad. Existing approvals are invalidated through the normal draft-edit flow where applicable.

## Explicit exceptions, not completed claims

1. **Guarantee:** the actual Mellow LP read on 18 October shows **100-Day Money-Back Guarantee**, not the file's stale 60 days. Use 100 in these edits. Do not change store policy to fit copied advert language or add unconditional “completely risk-free” return terms. Recheck the offer when next editing: it can change.
2. **Formula:** the actual LP and project label list vitamin D2 along with saffron, passion flower, St John's wort and GABA. The imported file's assertion that Mellow has no vitamin D is incorrect. Ingredient presence does not establish efficacy for bedwetting.
3. **No invented clinical mechanism:** the proposed “clinical research” asserting that saffron/GABA changes sleep architecture and repairs the brain–bladder signal was not inserted. No supporting study was supplied or verified. This is an unresolved evidence-dependent replacement, not a finished factual correction. Do not silently invent a study, physician recommendation or treatment claim.
4. **Relative chronology:** “since half-term” / “last month” are the explicitly requested wording changes, not a guarantee of evergreen consistency. Do not invent event dates based only on the publication month. Source examples and the Oliver chronology audit remain available for later substantive review.

## Durable implementation

- `lib/antki-model.ts`: shared prompt preserves dialogue, short beats and claim force; Mellow-only `antkiTargetCopy` canonicalises stale promoted names and target URLs without changing raw US sources or another workspace's chosen product.
- `lib/antki-providers.ts`: body and headline pass through target-copy adaptation after existing factual validation.
- `lib/antki-work.ts`: manual saves, restored close localisations and completed generated versions use the same adaptation.
- `docs/antki/copywriting-uk-2026-10-17.md`, `rewrite-uk-v2.md`, `kompendium-uk-us-ads.md`: owner's accumulated numeric, dialogue and point-edit rules.
- Workspace root `COPYWRITING-MEMORY.md`: next-agent entry point and factual conflicts. These files are local/project memory, not ChatGPT account memory.

## Evidence and recovery

Local copies before/after, plans, and unified diffs: `/Users/jakubcabanowski/Documents/ChatGPT/UK/output/antki-copy-fixes-2026-10-17/`. They are private working material outside the Szekspir repo. Re-read final saved versions from the application before reporting completion. Keep originals and compare unchanged image URLs, headlines, and relevant source text.

Verification: Antki model/work, localisation-guide and rewrite-fact tests; TypeScript check and production build. All generation/provider calls in tests are mocked. No paid text/image request is needed for these edits.

Live readback before deployment: all six listed records are `ready` / `done`; rewritten and close-localised texts exactly match the saved edit plans; generated image URLs are unchanged; no item error. Source IDs and untouched primary originals were retained in the local before snapshots.

The library action “Popraw nazwy produktu i linki UK” now repairs both UK versions and schedules ordinary paced Sheet delivery. It invalidates an approved rewritten draft only when its target copy actually changes; it never alters already-created Meta ads, creates paid generations, or changes source originals. Active/pending operations are refused. Repeated repair is idempotent.
