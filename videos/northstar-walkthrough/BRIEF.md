---
workflow: general-video
flow: automation
storyboard: no
message: "Your discovery-call requirements, shown working in the real product"
destination: website
aspect: 1920x1080
language: en
length: 35s
audience: "Northstar Labs buying team (Jane Miller, Alex Morgan, forwarded to Maya Chen)"
narration: minimal
---

## Intent

A personalized B2B sales follow-up video for the "Verified Discovery-to-Demo Agent" hackathon
project. Northstar Labs (the prospect) just finished a discovery call with Flowboard (the
vendor). This video is the walkthrough Flowboard sends back afterward: proof that their
specific requirements - intake/triage, sprint planning, linked documentation - already work in
the real product, using real captured screens of their own seeded workspace, not a generic
product tour. Tone: confident, calm, consultative - a Solutions Engineer's screen-share
narration, not a marketing sizzle reel.

## Assets

- public/media/plane-captures/scene-1-intake.png — real screenshot, Customer Requests project
  work-items list (Enterprise SSO access request, Bulk user import). Use for the intake/triage scene.
- public/media/plane-captures/scene-2-cycle.png — real screenshot, Q4 Sprint 3 cycle with both
  issues planned into it. Use for the sprint-planning scene.
- public/media/plane-captures/scene-3-docs.png — real screenshot, "Intake & Triage Playbook"
  documentation page. Use for the documentation scene.

## Customizations

- Exact scene order and captions (already confirmed, do not re-derive):
  1. Cold open / intro title card (2-3s): "Northstar Labs mentioned that incoming engineering
     requests are difficult to prioritize."
  2. Scene 1 (~9s): title "Capture and triage incoming work" over scene-1-intake.png. Caption:
     "Here's how a request gets captured and triaged in one place."
  3. Scene 2 (~9s): title "Plan approved work in the next cycle" over scene-2-cycle.png. Caption:
     "Once triaged, approved work moves directly into the next cycle - no re-typing into
     another system."
  4. Scene 3 (~9s): title "Keep product context connected" over scene-3-docs.png. Caption:
     "Documentation stays linked to the work itself."
  5. Closing CTA (~4-5s): "Looking forward to the technical walkthrough with Maya this week."
- Subtle Ken Burns pan/zoom on each real screenshot rather than a static hold - this is a
  screen-recording-style walkthrough, not a slideshow.
- Clean sans-serif caption/title treatment, simple crossfade or slide transitions between scenes.

## Notes

- Do NOT mention SAP integration anywhere in this video, in any form. It is a Roadmap-status
  capability per the product's capability policy (`src/policies/capabilityPolicy.ts`) and must
  never be presented as available or even referenced - this is a deliberate reliability
  requirement from the surrounding project, not a stylistic preference.
- This is a fully specified/formed request (exact script, exact assets, exact structure already
  given) - no open creative/message discovery needed.
- flow/storyboard were decided by the invoking agent (not the end user directly) given a
  same-day hackathon time constraint and an already-complete brief: automation + no storyboard,
  to move straight to build or a fast one-shot render.
