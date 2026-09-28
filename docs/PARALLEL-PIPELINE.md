# Parallel production, engine 2

New jobs use engine 2. Existing jobs keep the previous engine to avoid reissuing provider requests during rollout. `PIPELINE_V2=0` disables engine 2 for newly created jobs only.

For uploaded files/direct video links, transcription and VMake submission start in the same batch. For ad-library pages the video URL must first be resolved. Once the UK script exists, brief export and voice generation run in the same batch. VMake processes externally while text/voice stages run; status checks are queued at 20-second intervals when no other work is ready. Final links are written only after all required branches complete.

A shared CAS-protected capacity record limits engine-2 jobs to three active workers across deployments/instances. Each job has a six-minute lease; production workers have a five-minute runtime. Duplicate messages cannot claim an active job. Capacity wait requeues after ten seconds. Lease expiry recovers abandoned slots.

Each stage stores completion, outputs, attempts, request-pending flags and timings. Failures preserve completed branches. Interrupted paid calls require explicit confirmation before retry; successful task IDs, transcripts, scripts and VO URLs are reused. VMake output URLs are checkpointed before downloading so a storage retry never resubmits the video. Raw VO is still temporary only and deleted by the existing cleanup helper.

The UI's Production times section shows stage elapsed times and time since the job was saved. Parallel durations overlap and cannot be summed. Video cleanup elapsed time begins at VMake submission; `ms` separately stores active worker duration. These are measured timings, not a promised speedup percentage.

Tests: `npm test` (39 legacy regression cases), `node tests/parallel-pipeline.cjs` (overlap, branch retry preservation, global capacity, uncertain paid-call recovery, persisted timing), TypeScript, production build. Authenticated worker action `pipeline-health` is a pure readiness-graph check; it never calls paid providers or writes Sheets.
