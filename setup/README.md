# External App Setup

Status and setup notes for each of the 7 external apps used by the Verified Discovery-to-Demo Agent (Northstar Labs scenario). Each app has its own doc with exact click-paths, the credentials it needs, and every gotcha discovered while wiring it up live (not just what the docs say — what actually happened when we hit the real API).

| App | Status | Doc |
|---|---|---|
| Plane | ✅ Seeded & verified idempotent | [plane.md](./plane.md) |
| HubSpot | ✅ Seeded & verified idempotent | [hubspot.md](./hubspot.md) |
| Slack | ✅ Bot installed & channel verified | [slack.md](./slack.md) |
| Google (Drive + Gmail + Calendar) | 🟡 Credentials verified live; one manual step left | [google.md](./google.md) |
| HyperFrames | ✅ Nothing to set up (built into this environment) | [hyperframes.md](./hyperframes.md) |

## Env var map

All credentials live in `.env.local` at the repo root (gitignored, never committed). See `.env.example` for the full template.

| Var | App | Status |
|---|---|---|
| `PLANE_BASE_URL`, `PLANE_API_KEY`, `PLANE_WORKSPACE_SLUG`, `PLANE_WORKSPACE_ID` | Plane | ✅ set |
| `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_BASE_URL` | HubSpot | ✅ set |
| `ANTHROPIC_API_KEY` | LLM extraction/reasoning | ⬜ empty |
| `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID` | Slack | ✅ set (`SLACK_APP_TOKEN` intentionally unused) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` | Google | ✅ set & verified live |
| `GOOGLE_DRIVE_FOLDER_ID` | Google Drive | ⬜ empty — needs the "Product Knowledge" folder created manually |
| `DEMO_PROSPECT_EMAIL`, `DEMO_STAKEHOLDER_EMAIL` | Gmail/Calendar recipients | ✅ set (Gmail `+` aliases on one real inbox) |
| `HYPERFRAMES_CONFIG` | HyperFrames | not needed (see hyperframes.md) |

## General pattern used for each app

1. Get the credential through the app's own dashboard (steps in each doc below).
2. Verify it with a single live API call before writing any code against it — cheaper to discover a wrong base URL/auth header/scope now than after a seed script is half-written.
3. Write an idempotent seed script (`scripts/seed-<app>.mjs`) that matches existing records by name/title before creating anything, so it's safe to re-run.
4. Run it against the real service, verify the result, re-run once more to confirm idempotency.

## What's left

1. **Create the "Product Knowledge" Drive folder** with the 2 docs from `data/docs/`, grab its folder ID, set `GOOGLE_DRIVE_FOLDER_ID` (see `setup/google.md`, "Remaining manual step").
2. **`ANTHROPIC_API_KEY`** still needs to be set for the extraction/reasoning logic once app scaffolding starts.

## Resolved follow-up

`DEMO_PROSPECT_EMAIL`/`DEMO_STAKEHOLDER_EMAIL` are now set (Gmail `+` aliases), and the 3 HubSpot contacts (Jane Miller, Alex Morgan, Maya Chen) have been backfilled with real email addresses accordingly.

## Known limitation

The Google refresh token is for an OAuth app in **Testing** publish status — Google auto-revokes those refresh tokens after 7 days. Fine for same-day hackathon use; flag it if this project continues past a week (see `setup/google.md` for the fix).
