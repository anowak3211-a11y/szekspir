# Additional Files

Main hub tile → `/additional-files`. Reuses ElevenLabs, voice filters, pause processing and media storage. Select editor/Ad ID; create and listen to drafts; approve to append a link in the existing Additional files column. Main VO and script remain unchanged. Private per-ad recording state includes history and deterministic media paths. Generation request IDs prevent duplicate requests; approval retries reuse saved files. Existing sheet links are preserved and merged by line. No real ElevenLabs generation is performed by automated tests.

Run `node tests/additional-files.cjs` and `npm run typecheck`. Master range extends through AC; editor range through Q to accommodate existing layouts. Headers, not column positions, determine the Additional files cell.

## Media options
Additional Files supports ElevenLabs (existing voice generation), VMake (enhance, remove subtitles, or enhance then remove), and no processing (uploaded original). Every result remains a draft until approval. VMake work runs on the `szekspir-additional-video` durable queue. Persisted submission markers prevent repeating an uncertain paid request; status polling and saving can retry. Source URLs are resolved from validated storage paths on the server.

Voiceover pace is visible as Storytelling / Normal / VSL, mapped to the same gentle / standard / aggressive pause settings as Szekspir. The shared PausePreview component reuses the saved up-to-10-second voice sample and existing preview backend.
