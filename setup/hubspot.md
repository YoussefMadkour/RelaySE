# HubSpot Setup

**Status: DONE.** Company, custom Deal properties, Deal, and 3 Contacts seeded and verified idempotent.

## What it's for

HubSpot plays the CRM: account/opportunity/contact context going in, and the final activity/next-step update coming out after the agreed follow-up executes.

## The credential maze (read this before clicking around)

HubSpot's developer console has three different secrets that all look plausible but only one is right for us. In order of "looks right but isn't":

1. **Developer API Key** (`Development → Domain → Developer API Key`) — manages the *developer account itself* (app configs, webhook subscriptions). **No access to CRM records.** Don't use this.
2. **Legacy Private App** (`Development → Legacy Apps`) — HubSpot actively steers you away from this now ("Service Keys are the better path... full platform support going forward"). Don't use this either unless Service Keys are unavailable on your account.
3. **Service Key** (`Development → Domain → Service Keys`) — the current recommended path for single-account, system-to-system API access. **This is the one we want.**

## Setup steps

1. Sign up at [app.hubspot.com/signup](https://app.hubspot.com/signup) (or use the Developer Account's **Test Accounts** feature to spin up a sandbox CRM portal — either works, a Test Account is what we actually used).
2. Make sure the account switcher (top-left) is pointed at the account that should hold the CRM data — not the parent developer account.
3. `Development → Domain → Service Keys → Create service key`.
4. Name it (`RelaySE Agent`).
5. Add scopes via the search bar. **Minimal working set:**
   - `crm.objects.companies.read` / `.write`
   - `crm.objects.contacts.read` / `.write`
   - `crm.objects.deals.read` / `.write`
   - `crm.schemas.deals.read` / `.write`
6. Create the key, copy it (starts with `pat-eu1-...` or `pat-na1-...` depending on data residency — the prefix doesn't affect API routing, see below).

## Known gotchas (found live, not in docs)

- **`crm.objects.notes.read`/`.write` does not appear in the scope picker.** This is a widely-reported, long-standing HubSpot bug/limitation across many portals, not something wrong with this setup. Workaround: skip Notes entirely and use **custom Deal properties** instead (`crm.schemas.deals.write` lets us define them) — this was already the build spec's preferred approach; Notes was only ever the fallback.
- **Auth is `Authorization: Bearer <key>`**, not a custom header like Plane's `X-API-Key`.
- **API host is always `https://api.hubapi.com`**, even for an `eu1`-prefixed key/EU-hosted account. Tried `api.hubapi.eu` first as a hedge — it doesn't resolve. The `eu1`/`na1` prefix is just an account identifier baked into the key string, not a routing signal.
- The account's only real "user" is whoever signed up — there's no second HubSpot user to assign as a genuine CRM "Deal owner" for Sarah Lee. We store `Owner: Sarah Lee` as text in the custom deal properties instead of wiring up a real owner assignment.
- **`industry` is a closed enum, not free text.** `"B2B SaaS / Engineering Tools"` gets rejected outright — HubSpot returns the full valid list in the error body. Used `COMPUTER_SOFTWARE`. (`data/seed/hubspot.json` reflects this.)
- **The default "Deals pipeline" has no "Discovery" stage.** Out of the box it's: Appointment Scheduled → Qualified To Buy → Presentation Scheduled → Decision Maker Bought-In → Contract Sent → Closed Won/Lost. Renaming/adding a stage needs pipeline-management scopes we deliberately didn't request. We map our conceptual "Discovery" stage onto `appointmentscheduled` (the closest default stage) and note the mapping in the seed script's log output — the UI will show "Appointment Scheduled" as the literal stage label.
- Contacts were created **without an email** since `DEMO_PROSPECT_EMAIL`/`DEMO_STAKEHOLDER_EMAIL` aren't set yet (Google setup is still pending) — HubSpot allows this. Once those env vars are filled in from the Google setup step, re-run the seed script; it will find the existing contacts by name and simply skip re-creating them, so you'll need a small follow-up `PATCH` (not yet scripted) to backfill the email once it's known, or just add it manually in the HubSpot UI.

## Planned custom Deal properties (via `crm.schemas.deals`)

- `verified_requirements` (text)
- `blocked_requirements` (text)
- `walkthrough_url` (text)
- `next_technical_step` (text)

## Credentials (in `.env.local`)

```
HUBSPOT_ACCESS_TOKEN=<service key>
HUBSPOT_BASE_URL=https://api.hubapi.com
```

## What got created

Run via `node --env-file=.env.local scripts/seed-hubspot.mjs` (idempotent, safe to re-run — matches by name/dealname/firstname+lastname before creating anything):

- Company "Northstar Labs" (447799575784)
- 4 custom Deal properties (schema, one-time)
- Deal "Northstar Labs Platform Evaluation" (521436910788), $250,000, stage `appointmentscheduled`
- 3 Contacts: Jane Miller, Alex Morgan, Maya Chen — all associated to both the Company and the Deal
- Company↔Deal and Company/Deal↔Contact associations via the v4 default-association endpoint (`PUT /crm/v4/objects/{fromType}/{fromId}/associations/default/{toType}/{toId}`)

Source data: `data/seed/hubspot.json`.
