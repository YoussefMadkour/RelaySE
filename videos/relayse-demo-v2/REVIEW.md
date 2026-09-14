# Export review

- Duration: 112.800 seconds (1:53); 1920×1080; 30 fps; H.264 + AAC; see current export for file size.
- HyperFrames 0.8.37. Version probe confirmed latest; no upgrade needed.
- Full composition check passed: no runtime, layout, or motion errors; 48/48 contrast checks passed.
- Reviewed all seven scene midpoints, both approval states, the embedded clip, and exported ending.
- Nested video starts at 5.5 seconds LOCAL to scene s04, as intended. The CLI emits an informational timing warning; placement was confirmed in the export.
- Embedded source has sparse keyframes. Renderer extracted all 305 required frames; exported clip advances from intake to sprint planning. No visual treatment or color correction was needed for these UI captures.
- Audio mean -22.4 dBFS, peak -1.8 dBFS; no sample clipping. Local Kokoro af_heart, generated speed 1.04, playback rate 1.08.
- All 12 capability policy tests passed during this revision.
- `keyframes-review.json` records authored motion for all seven sub-compositions; explicit transition hard stops prevent stale headers over the walkthrough.
- No new application runs or customer-facing actions were triggered. The pending controls and approved results come from separate saved states and are labeled as such.
- Prior canonical export retained locally at `renders/previous-demo.mp4`.

## Rebuild

`npm run check`

`npm run render -- --output renders/relayse-with-architecture.mp4 --quality high`

Narration source: `audio_request.json`; measured timing: `audio_meta.json` and `timing.json`; editable captions: `captions.srt`.

## Orchestrator slide

Inserted at 29.667 seconds for 19.8 seconds. Reveals saved inputs, central orchestration, Plane capture / separate HyperFrames render, Slack review, and approval-gated Gmail/Calendar/HubSpot actions. Narrated and captioned in the original voice. Complete diagram inspected at 47 seconds; layout and contrast checks passed. The preceding 93-second cut is retained at `renders/relayse-before-architecture.mp4`.

Final cut timings are aligned to exact 30fps frame boundaries to avoid rounding gaps between scenes.
