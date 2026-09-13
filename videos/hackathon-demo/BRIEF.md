---
workflow: general-video
flow: automation
storyboard: no
message: "A working AI Solutions Engineer that verifies before it personalizes, and never acts without human approval"
destination: website
aspect: 1920x1080
language: en
length: 120s
audience: "Multi-App AI Agent Hackathon judges"
narration: minimal
---

## Intent

The hackathon submission's required 2-minute demo video (distinct from the in-app "northstar-walkthrough.mp4" personalized product video, which is a deliverable the agent itself produces for a prospect). This video is about the hackathon PROJECT - it must show judges exactly what the agent does, using REAL screenshots of the actual working app and a real clip of the actual generated walkthrough, not mockups. Tone: confident, technical, calm - a builder walking judges through a real system, not a marketing reel. Branded as "RelaySE Agent" (the project name), not "Flowboard" (the in-universe fictional vendor the walkthrough video is for).

## Assets

- docs/screenshots/01-home.png — real app home page
- docs/screenshots/02-requirements.png — real requirements/verification table (SAP correctly BLOCKed, others ALLOWed)
- docs/screenshots/03-demo-plan.png — real demo plan with real Plane screenshots captured live via Playwright
- docs/screenshots/05-approval-actions.png — real Slack approval message + real Gmail/Calendar/HubSpot SUCCESS actions from an actual run
- public/media/northstar-walkthrough.mp4 — the real rendered personalized walkthrough video (silent, no audio track) - embed roughly the first 15-18s as a clip inside this video

## Customizations

Exact structure and timing (already fully specified, do not re-derive):

1. **0:00-0:14 Problem + real transcript quote.** Open on the problem statement, show a real quote from the actual discovery transcript: "I definitely want to understand whether you integrate with SAP... I just need to know rather than seeing something in a demo that turns out to be roadmap." — Jane, discovery call. Then title card: "Verified Discovery-to-Demo Agent".
2. **0:14-0:34 Requirements verification.** Show docs/screenshots/02-requirements.png (or a close crop of it emphasizing the SAP BLOCK row alongside the ALLOW rows). Caption: "The agent extracts requirements, then verifies each one against real product documentation - before generating anything."
3. **0:34-0:54 Demo plan + live capture.** Show docs/screenshots/03-demo-plan.png. Caption: "Only verified capabilities become scenes - captured live, in real time, from the real seeded product."
4. **0:54-1:14 The walkthrough itself.** Embed ~18s from public/media/northstar-walkthrough.mp4 (its own scene content, already narrated via on-screen captions in that video - no need to re-caption here, just a brief label "The generated walkthrough" at the top).
5. **1:14-1:34 Approval + real side effects.** Show docs/screenshots/05-approval-actions.png. Caption: "Nothing customer-facing happens without human approval. Once approved: a real email sends, a real calendar invite is created, a real CRM record updates."
6. **1:34-1:50 Reliability (the differentiator).** Stylized text card, no screenshot: "12/12 deterministic policy evals passing" plus "3 real bugs found and fixed by testing against the live LLM and live services, not just mocks."
7. **1:50-2:00 Closing.** "A Solutions Engineer that never claims what it can't verify - and never acts without approval." Project name close.

Visual style: dark navy background (~#1c232e), coral accent (~#ee6c4d), Montserrat (headlines, 700/900) + JetBrains Mono (captions/labels) - same design language as the in-app walkthrough video for consistency, but labeled "RelaySE Agent" throughout, not "Flowboard". Screenshots shown in a clean browser-chrome frame like the previous video. Subtle Ken Burns drift on static screenshots; the embedded video clip plays natively.

## Notes

- This is a fully specified/formed request - no open creative/message discovery needed.
- flow/storyboard decided by the invoking agent (not the end user directly), same as the prior video project, given hackathon time constraints and an already-complete brief: automation + no storyboard.
- Keep total length at or under 2:00 - this is a hard submission constraint, not a suggestion.
- Do not fabricate any screen or number not actually produced by the real system - every screenshot and clip must be the real captured asset, and every stat (12/12 evals, 3 bugs) must match what's documented in README.md.
