# Multi-App AI Agent Hackathon — Context Notes

**Event:** Virtual, Sunday, September 13, 2026
**Hosts:** Lemma AI (Jerry, co-founder/CEO) + Comma Capital
**Judges:**
- Philip Lee — co-founder/CEO, Arga Labs
- Akira Tong — co-founder/CTO, Arga Labs
- Ankar — co-founder/CEO, Userlens
- Hai — co-founder, Userlens

Arga Labs builds infra for testing AI agents across external apps — directly relevant to judging.

---

## The Brief

Build **one useful, multi-step AI agent** that connects to **at least three external apps** and takes real action across them (not a black box). Example given: agent takes a customer request from email → updates a CRM → coordinates next steps in Slack.

- No fixed vertical/theme. General theme: agent does **real, economically useful work**.
- Business/B2B and consumer/personal use cases are equally welcome.
- Data source is up to you (live data, existing datasets, dummy data, LLM-generated data) — does not need to be live production data.
- If you have multiple sub-agents, there should be **one main orchestrator agent** tying them together (not 10 disconnected agents/projects).
- Connecting apps can be via MCP, API, whatever — method doesn't matter, only that it's a real integration doing real actions.

## Schedule (Pacific time)

| Time | Activity |
|---|---|
| 9:00 AM | Opening, briefing & Q&A |
| 9:30 AM – 4:00 PM | Build |
| 4:00 PM | Submissions close (sharp) |
| 4:00 – 5:00 PM (aiming ~4:40) | Judging & selection |
| 5:00 PM | Awards (same event link) |
| By 5:30 PM | Event concludes |

Judging/award timing may slip since turnout was larger than expected (400+ participants) — watch email for updates on when to rejoin the call.

## Submission Requirements

- **One submission per team** — do not submit duplicates. If truly substantial changes happen later, a second submission is tolerated but discouraged.
- Submit via the Google Form linked in the event's calendar invite (also pasted in event chat).
- Form asks for:
  1. Email address(es) of every team member (1–4 people per team; if a teammate drops, just use your own email)
  2. GitHub repository link
- **Everything must live in one GitHub repo.** No separate write-up or extra artifacts — just the repo with a README.
- Repo must be **public** (or otherwise accessible) so judges can view it.

### README must include:
1. **Project overview** — what you built and the problem it solves
2. **External apps used** — must name at least 3
3. **Setup instructions** — clear steps to run the project
4. **Reliability testing** — how you tested/verified it works, where its limitations are
5. **Demo video link** — max 2 minutes, linked inside the README

## Demo Video Notes

- Max length: **2 minutes**. Keep it short/concise — long videos are harder to review.
- Editing/cuts are fine — doesn't need to be a continuous recording.
- Should include a product explanation/walkthrough, not just raw footage.
- Deployment isn't required — a local demo is fine, especially if the app can't be deployed (e.g., regional restrictions). If not deployed, the demo video carries more weight for evaluation.

## Judging Criteria (weights)

| Criterion | Weight |
|---|---|
| Technical execution | 30% |
| Reliability & evaluation | 25% |
| Usefulness | 20% |
| Originality | 15% |
| Demo clarity | 10% |

Notes from Q&A:
- "Technical execution" = complexity/interestingness of the solution toward something genuinely useful.
- "Usefulness" = real economic/practical value, not just an impressive demo.
- No preference between a single vertical, tightly-scoped workflow vs. a broader multi-workflow agent — either can score well.
- Judges want you to explain how you tested reliability and where the agent's limitations are — this is a distinct, heavily-weighted criterion, not an afterthought.

## Prizes

- 1st: $10,000
- 2nd: $4,000
- 3rd: $1,000
- All top-3 teams get a guaranteed interview with Arga Labs or Lemma AI (winner's choice of which).

## Q&A Highlights

- **No official Discord** for this event — ignore unofficial invite links.
- **No sponsor credits** provided (no Lemma, Arga, Claude Code, Cursor, or cloud credits) — this is a one-day hackathon, BYO tooling/budget.
- **No requirement to use Lemma or Arga products/APIs** in your build.
- **IP ownership**: belongs entirely to the participants/team, not the hosts.
- **Confidentiality**: submissions are shared with judges only, not made public or shared with other participants.
- **Using an existing/prior project**: allowed, but will be weighed less heavily than something built fresh today. Hosts prefer to reward what you can build in the single day. Prep work (specs, test cases written ahead of time) is fine as long as the actual code is written during the build window.
- **Using your own previously-built app** as one of the three external integrations: allowed.
- **Using open-source boilerplate/starter repos**: allowed.
- **Private/beta apps**: okay to use as one of the 3 apps even if judges don't have access — explain clearly in the demo video what the app does, and optionally send a magic link so judges can try it themselves.
- **Deployment**: not required. A deployed/public link is a bonus ("bounty points") but a local build + strong demo video is acceptable, especially given regional app restrictions.
- **Team changes**: if a teammate can't participate, just list your own email in the form; you don't need to remove them or ask permission.
- **Solo participation**: fine.
- Multiple ideas/submissions from the same team: **not allowed** — one submission per team only.
- Consumer AND B2B/vertical use cases are equally valid — usefulness/impact is what matters, not the market segment.
- "Multi-app" can be implemented via MCP, computer-use style automation, or direct APIs — the mechanism doesn't matter, only that the agent performs real actions across 3+ external apps.
- Winners are announced live on the call after judging, and also via email afterward; you don't strictly have to be present, but hosts encourage attending to celebrate.

## Contact

Questions: **events@uselemma.ai**, cc **contact@argalabs.com**
