# Slack Setup

**Status: DONE.** Bot installed, channel created, posting verified live.

## What it's for

Slack is the human-approval boundary — no customer-facing action (Gmail, Calendar, HubSpot update) happens until a human approves the agent's proposed follow-up posted here.

## Setup steps

1. If you don't already have a personal/sandbox Slack workspace, create a free one at [slack.com/get-started](https://slack.com/get-started) — cleaner than a real company workspace since you need full admin rights to install a custom app.
2. Go to [api.slack.com/apps → Create New App → From scratch](https://api.slack.com/apps) (use "Blank app", not the AI-agent/Starter templates — they pull in features we don't need). Name it `RelaySE Agent`, pick your workspace.
3. **OAuth & Permissions → Scopes → Bot Token Scopes**, add:
   - `chat:write`
   - `chat:write.public` (lets the bot post to a public channel without being manually invited — simpler for a demo)
   - `channels:read`
4. Scroll up, **Install to Workspace → Allow**. Copy the **Bot User OAuth Token** (starts with `xoxb-`).
5. Create the channel `demo-approvals` (public).

## What actually happened (gotchas)

- **The app UI can silently add extra scopes you didn't ask for.** Visiting the "MCP Servers" feature page auto-added `mcp:connect`; a stray click added `chat:write.customize`. Worth reviewing the final Bot Token Scopes list before installing, not just adding the ones you meant to.
- **`conversations.list` needs a scope per channel type you query.** Asking for `public_channel,private_channel` in one call demanded `groups:read` even though we only wanted public channels — narrowing the `types` param to `public_channel` only avoided needing that extra scope.
- **Creating a channel via API needs `channels:manage`**, which wasn't requested initially (deliberately, to keep the token minimal) — so the first `conversations.create` attempt failed with `missing_scope`. The scope got added afterward and the app reinstalled, which is required for scope changes to take effect — after that, `conversations.create` succeeded via API.
- **A reinstall doesn't necessarily change the token string** — the same `xoxb-...` value worked before and after, once the new scope was actually granted.
- **App Configuration Tokens are a different thing entirely.** Early on, the "Your Apps" dashboard's config-token section (`xoxe.xoxp-1-...` / `xoxe-1-...`, expiring in 12h) was mistaken for the bot token. Those manage app config via the App Manifest API — not usable for posting messages. Don't confuse the two.

## Credentials (in `.env.local`)

```
SLACK_BOT_TOKEN=<xoxb-...>
SLACK_APP_TOKEN=          # only needed if we do the Socket Mode stretch goal (not planned)
SLACK_CHANNEL_ID=<channel id from conversations.list/create>
```

## What got created

Run via `node --env-file=.env.local scripts/seed-slack.mjs` — verifies the bot token (`auth.test`) and looks up the `demo-approvals` channel by name (`conversations.list`, paginated). Channel creation itself was a one-off `conversations.create` call rather than baked into the idempotent script, since it's a single object that only needs to exist once.

- Bot: `relayse_agent` in workspace "Northstar Demo"
- Channel: `#demo-approvals` (`C0C1LA8260H`)
- Verified `chat.postMessage` works end-to-end with a live test post to the channel.

## Deliberately skipped

**Socket Mode / interactive Approve-Reject buttons** — this is explicitly a stretch goal in `CLAUDE_BUILD_SPEC.md` with a required fallback (approve in the local web UI instead). Not worth the setup time (App-Level Token, Socket Mode toggle, Interactivity payload subscription) unless everything else is already working with time to spare before the 4pm submission deadline.

The actual approval message content lives in `data/seed/slack.json` — it gets posted via `chat.postMessage` at runtime by the agent, not as a one-time seed step (it's the live agent's output, not fixture data).
