interface SlackConnector {
  postMessage(text: string): Promise<{ channel: string; ts: string }>;
}

class SlackLiveConnector implements SlackConnector {
  async postMessage(text: string): Promise<{ channel: string; ts: string }> {
    const token = process.env.SLACK_BOT_TOKEN;
    const channel = process.env.SLACK_CHANNEL_ID;
    if (!token || !channel) {
      throw new Error("SLACK_BOT_TOKEN or SLACK_CHANNEL_ID is not set.");
    }
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ channel, text }),
    });
    const body = await res.json();
    if (!body.ok) {
      throw new Error(`Slack chat.postMessage failed: ${body.error}`);
    }
    return { channel: body.channel, ts: body.ts };
  }
}

export function getSlackConnector(): SlackConnector {
  return new SlackLiveConnector();
}
