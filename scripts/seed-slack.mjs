#!/usr/bin/env node
// Slack verify/lookup script. Run with:
//   node --env-file=.env.local scripts/seed-slack.mjs
//
// Verifies the bot token, then finds the #demo-approvals channel and
// prints its ID for .env.local. Channel creation is manual (see
// setup/slack.md) since we deliberately didn't grant channels:manage.

const TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_NAME = "demo-approvals";

if (!TOKEN) {
  console.error("Missing SLACK_BOT_TOKEN. Set it in .env.local and run with --env-file=.env.local");
  process.exit(1);
}

async function slackFetch(method, params = {}) {
  const url = new URL(`https://slack.com/api/${method}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const body = await res.json();
  if (!body.ok) {
    throw new Error(`${method} -> ${body.error}${body.needed ? ` (needed: ${body.needed})` : ""}`);
  }
  return body;
}

async function main() {
  const auth = await slackFetch("auth.test");
  console.log(`[auth] ok - bot "${auth.user}" in workspace "${auth.team}"`);

  let cursor;
  let found;
  do {
    const res = await slackFetch("conversations.list", {
      types: "public_channel",
      limit: 200,
      ...(cursor ? { cursor } : {}),
    });
    found = res.channels.find((c) => c.name === CHANNEL_NAME);
    cursor = res.response_metadata?.next_cursor || undefined;
  } while (!found && cursor);

  if (!found) {
    console.log(`\n[channel] "#${CHANNEL_NAME}" not found yet.`);
    console.log(`Create it manually in Slack (public channel, name: "${CHANNEL_NAME}"), then re-run this script.`);
    process.exit(1);
  }

  console.log(`\n[channel] found: #${CHANNEL_NAME} (${found.id})`);
  console.log(`\nAdd to .env.local:`);
  console.log(`SLACK_CHANNEL_ID=${found.id}`);
}

main().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
