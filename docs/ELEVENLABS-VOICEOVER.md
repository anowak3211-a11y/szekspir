# ElevenLabs v3 voiceover direction

Use eleven_v3. Generate only after the user clicks Send to ElevenLabs.

## Delivery

Keep every approved spoken word. Use a naturally paced, connected, conversational British read. Avoid dramatic sentence-ending pauses, audible inhalations, sighs, gasps and theatrical breath effects. Do not insert breath, sigh, pause or sound-effect tags. Keep punctuation intact rather than replacing full stops with commas.

The runtime applies a delivery cue to each sentence, without forcing fast-paced delivery: curious for the opening or questions, excited for the offer/CTA, reassuring for gentle/rest-related sentences, confident otherwise. These are delivery cues, not guarantees of timing. The exact voice script is visible before generation. Source production cues are removed before inserting these cues.

## Automatic audio processing

After every generation, run pause-cleanup-v5-more-breathing-room, leaving about 300 ms more room in longer pauses with two successive passes at -34 dB:
1. Detect internal quiet gaps of at least 480 ms; remove up to 300 ms from the centre while retaining at least 420 ms.
2. Re-analyse the result for internal gaps of at least 180 ms; remove up to 200 ms from the centre while retaining at least 380 ms.
Keep leading/trailing gaps within 100 ms of the recording edges untouched. These are acoustic quiet-gap cuts, not forced alignment to full stops. Retain spoken audio at its original speed. Each pass uses MP3 192 kbps, matching the audition workflow.

Measure decoded original and processed durations. Retain both recordings for comparison. Display Original and Shortened side by side, with a completion notice and actual seconds removed. Apply to main VO and each hook. Google Sheets continues to receive the shortened files.

These rules replace the earlier instruction to delete the original. No existing paid recording is regenerated automatically.

Reference: https://elevenlabs.io/blog/v3-audiotags

Superseded balanced revision (15 September 2026): preserve brief hesitations and sentence rhythm. Do not remove every breath or force the shortest possible runtime. Original and shortened files remain available for listening comparison.
