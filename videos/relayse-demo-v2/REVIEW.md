# Export review

- Duration: 93.000 seconds; 1920×1080; 30 fps; H.264 + AAC; about 11.4 MiB.
- HyperFrames 0.8.37. Version probe confirmed latest; no upgrade needed.
- Full composition check passed: no runtime, layout, or motion errors; 45/45 contrast checks passed.
- Reviewed all six scene midpoints, both approval states, the embedded clip, and exported ending.
- Nested video starts at 5.5 seconds LOCAL to scene s04, as intended. The CLI emits an informational timing warning; placement was confirmed in the export.
- Embedded source has sparse keyframes. Renderer extracted all 305 required frames; exported clip advances from intake to sprint planning. No visual treatment or color correction was needed for these UI captures.
- Audio mean -22.4 dBFS, peak -1.8 dBFS; no sample clipping. Local Kokoro af_heart, generated speed 1.04, playback rate 1.08.
- All 12 capability policy tests passed during this revision.
- `keyframes-review.json` records authored motion for all six sub-compositions; explicit transition hard stops prevent stale headers over the walkthrough.
- No new application runs or customer-facing actions were triggered. The pending controls and approved results come from separate saved states and are labeled as such.
- Prior canonical export retained locally at `renders/previous-demo.mp4`.

## Rebuild

`npm run check`

`npm run render -- --output renders/relayse-demo-v2.mp4 --quality high`

Narration source: `audio_request.json`; measured timing: `audio_meta.json` and `timing.json`; editable captions: `captions.srt`.
