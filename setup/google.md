# Google Setup (Drive + Gmail + Calendar)

**Status: DONE.** Drive, Gmail, Calendar all verified live, folder created and populated, full PDF download+extraction path confirmed end-to-end.

## What it's for

- **Drive**: authoritative product-truth source — the capability matrix and demo policy docs the agent verifies buyer requests against.
- **Gmail**: sends the approved personalized follow-up.
- **Calendar**: creates the agreed technical-demo meeting.

All three live under one Google Cloud project, using two separate OAuth clients (see gotchas below for why).

## Setup steps (as they actually went)

1. [console.cloud.google.com](https://console.cloud.google.com) → new project.
2. **APIs & Services → Library** — enable Drive API, Gmail API, Calendar API individually.
3. **OAuth consent screen** ("Google Auth Platform" in the newer console): External user type, app name/support email, add yourself as a **Test user** (keeps it in Testing mode, no Google verification review needed).
4. **Scopes**: use the picker's filter box to add exactly 3 — `drive.readonly`, `gmail.send`, `calendar.events`. (See gotcha below — this is easy to get wrong.)
5. **Credentials → Create OAuth client ID.**

## Gotchas (found live, cost real time)

- **The scope picker will silently over-select.** Searching "drive" or "gmail" and clicking a row can pull in adjacent scopes; browsing the "MCP Servers" feature page auto-adds `mcp:connect`-equivalent extras. Always check the final "N rows selected" count before saving — we caught an 11-scope selection when we wanted 3.
- **You need TWO different OAuth client types for two different jobs:**
  - A **Desktop app** client is what you'd normally reach for, but it does **not** support a custom registered redirect URI — which the OAuth 2.0 Playground requires. Using a Desktop app client with the Playground fails with `Error 400: redirect_uri_mismatch`.
  - Fix: create a second client as **Web application** type, with `https://developers.google.com/oauthplayground` added under **Authorized redirect URIs**. Use *this* client's ID/secret in the Playground's "Use your own OAuth credentials" panel — not the Desktop one.
  - The Desktop app client we created first is unused/dead; harmless to leave or delete.
- **If you don't configure your own credentials correctly, the Playground silently falls back to Google's own public client** (`client_id=407408718192.apps.googleusercontent.com`). Refresh tokens issued to that public client **auto-revoke after 24 hours** — useless for anything beyond a quick test. Always check the redirect URL in Step 3 shows *your* client ID before exchanging the code.
- **Consent-screen checkboxes can also over-grant even after fixing the scope request.** Two rounds of unchecking extra boxes on the actual Google sign-in consent screen still left `gmail.readonly` and full `drive` (not just `drive.readonly`) in the final granted scope set. Not worth a 4th redo cycle — the extra scopes are a superset of what we need and don't block anything, they're just broader than strictly minimal.
- **`calendarList.list` needs a different (broader) scope than `calendar.events` grants.** Don't worry about this — we don't need to enumerate calendars; `GOOGLE_CALENDAR_ID=primary` plus `calendar.events` is enough to read/create events on the primary calendar, which is all the agent needs. Confirmed working directly against `GET /calendar/v3/calendars/primary/events`.
- **Refresh tokens for apps in "Testing" publish status expire after 7 days** (`refresh_token_expires_in: 604799` in the token response — exactly one week). Fine for same-day hackathon use; if this project continues past a week, either re-run the Playground exchange for a fresh token or publish the OAuth consent screen out of Testing mode.

## Credentials (in `.env.local`)

```
GOOGLE_CLIENT_ID=<Web application client — the Playground-compatible one, NOT the Desktop app client>
GOOGLE_CLIENT_SECRET=<its secret>
GOOGLE_REFRESH_TOKEN=<from the Playground's Step 2 exchange>
GOOGLE_DRIVE_FOLDER_ID=      # still empty — see remaining step below
GOOGLE_CALENDAR_ID=primary
DEMO_PROSPECT_EMAIL=madkour.youssef+jane@gmail.com
DEMO_STAKEHOLDER_EMAIL=madkour.youssef+maya@gmail.com
```

`DEMO_PROSPECT_EMAIL`/`DEMO_STAKEHOLDER_EMAIL` use Gmail `+` aliasing — all mail lands in the same real inbox (`madkour.youssef@gmail.com`) you control, but each contact gets a visually distinct address. This also let us backfill the 3 HubSpot contacts (Jane, Alex, Maya) that were created without an email earlier — using one flat identical email across all three would've risked a HubSpot duplicate-email conflict, since email is treated as a dedup key there.

## Verified live

- Drive: `GET /drive/v3/about` → returns the authorized account.
- Gmail: `GET /gmail/v1/users/me/profile` → returns mailbox info.
- Calendar: `GET /calendar/v3/calendars/primary/events` → returns events.
- Full refresh-token → access-token → API call round trip confirmed working (not just the one-time Playground-issued access token).

## Product Knowledge folder — done

Folder: "Northstar Product Knowledge" (`GOOGLE_DRIVE_FOLDER_ID` set). Contains two branded PDFs (generated locally via headless Chrome print-to-PDF from styled HTML — not just the plain `.txt` source, so they read as real Flowboard-branded internal documents):

```
data/docs/pdf/Product Capability Matrix.pdf   (Drive file id 13pCZ-DtA5P8CT_CrmUgbDsPb6yWxJ0hM)
data/docs/pdf/Customer Demo Policy.pdf        (Drive file id 1BvK0FQHS3Dw22vsRjfABrDBZgOazn1Ox)
```

Uploaded manually via the browser (our `drive.readonly` scope can't write). Confirmed both are visible via `GET /drive/v3/files?q='{folder_id}'+in+parents`.

**Build note (verified, not just anticipated):** since these are real PDFs rather than native Google Docs, the Drive connector must download the binary (`GET /drive/v3/files/{id}?alt=media`) and extract text from it — Drive's `files.export` endpoint only converts native Google Docs format, it won't touch an uploaded PDF. Tested the full path locally: downloaded via the API, piped through `pdftotext` (poppler-utils, already installed at `/opt/homebrew/bin/pdftotext`), got back clean structured text. The real connector can shell out to `pdftotext`, or use a Node PDF-parsing library (e.g. `pdf-parse`) for the same result in-process.
