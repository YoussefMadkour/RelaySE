import { readFile } from "node:fs/promises";
import path from "node:path";
import { getGoogleAccessToken } from "@/connectors/googleAuth";

export interface GmailConnector {
  sendEmail(params: {
    to: string;
    subject: string;
    body: string;
    attachmentPath?: string;
    attachmentName?: string;
  }): Promise<{ messageId: string }>;
}

function base64Chunks(buffer: Buffer): string {
  const b64 = buffer.toString("base64");
  return b64.match(/.{1,76}/g)?.join("\r\n") ?? b64;
}

async function buildRawMessage(params: {
  from: string;
  to: string;
  subject: string;
  body: string;
  attachmentPath?: string;
  attachmentName?: string;
}): Promise<string> {
  const boundary = `relayse_boundary_${Date.now()}`;
  const lines: string[] = [
    `From: ${params.from}`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    params.body,
    "",
  ];

  if (params.attachmentPath) {
    const fileBuffer = await readFile(params.attachmentPath);
    const name = params.attachmentName ?? path.basename(params.attachmentPath);
    lines.push(
      `--${boundary}`,
      `Content-Type: video/mp4; name="${name}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${name}"`,
      "",
      base64Chunks(fileBuffer),
      ""
    );
  }

  lines.push(`--${boundary}--`);

  const raw = lines.join("\r\n");
  return Buffer.from(raw).toString("base64url");
}

class GmailLiveConnector implements GmailConnector {
  async sendEmail(params: {
    to: string;
    subject: string;
    body: string;
    attachmentPath?: string;
    attachmentName?: string;
  }): Promise<{ messageId: string }> {
    // The authenticated Google account IS the sender - Gmail's API sends as
    // whichever account owns the OAuth token, this is just the header value.
    const from = "madkour.youssef@gmail.com";
    const accessToken = await getGoogleAccessToken();
    const raw = await buildRawMessage({ from, ...params });

    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(`Gmail send failed: ${JSON.stringify(body)}`);
    }
    return { messageId: body.id };
  }
}

export function getGmailConnector(): GmailConnector {
  return new GmailLiveConnector();
}
