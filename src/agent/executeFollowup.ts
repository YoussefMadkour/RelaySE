import path from "node:path";
import { getGmailConnector } from "@/connectors/gmail";
import { getCalendarConnector } from "@/connectors/calendar";
import { getHubSpotFollowupWriter } from "@/connectors/hubspot";
import type { DemoPlan, NextStep } from "@/domain/schema";
import type { ExternalAction } from "@/domain/schema";

const MEETING_TITLE = "Northstar Labs Technical Workflow Demo";

function findNextStep(nextSteps: NextStep[], type: NextStep["type"]): NextStep | undefined {
  return nextSteps.find((s) => s.type === type);
}

export function buildFollowupEmail(params: { demoPlan: DemoPlan; nextSteps: NextStep[] }): {
  subject: string;
  body: string;
} {
  const { demoPlan, nextSteps } = params;
  const workflowNames = demoPlan.scenes.map((s) => s.capability).join(", ");
  const sapBlocked = demoPlan.blockedCapabilities.find((b) => b.name.toLowerCase().includes("sap"));
  const demoStep = findNextStep(nextSteps, "technical_demo");

  const sapParagraph = sapBlocked
    ? `\nYou also asked about SAP integration. I have not included that in the walkthrough because I could not verify it as currently available, so I've flagged it for our team rather than make an assumption. We'll follow up with a confirmed answer before your next technical session.\n`
    : "";

  const meetingParagraph = demoStep
    ? `\nI've also prepared the technical follow-up with ${demoStep.stakeholder ?? "your team"} for ${
        demoStep.timeframe ?? "next week"
      }.\n`
    : "";

  const body = `Hi Jane,

Thanks again for the conversation today.

Based on what you shared, I put together a short walkthrough focused on the workflows you highlighted: ${workflowNames}.

The walkthrough video is attached to this email.
${sapParagraph}${meetingParagraph}
Best,
Sarah`;

  return {
    subject: "Northstar Labs - Personalized Product Walkthrough",
    body,
  };
}

export async function executeFollowup(params: {
  demoPlan: DemoPlan;
  nextSteps: NextStep[];
}): Promise<ExternalAction[]> {
  const { demoPlan, nextSteps } = params;
  const actions: ExternalAction[] = [];

  const prospectEmail = process.env.DEMO_PROSPECT_EMAIL;
  const stakeholderEmail = process.env.DEMO_STAKEHOLDER_EMAIL;
  if (!prospectEmail || !stakeholderEmail) {
    throw new Error("DEMO_PROSPECT_EMAIL or DEMO_STAKEHOLDER_EMAIL is not set - refusing to send to an unverified recipient.");
  }

  // 1. Gmail - the personalized follow-up, walkthrough video attached directly
  //    (no hosting/URL needed - the recipient gets a real playable file).
  let gmailSucceeded = false;
  try {
    const { subject, body } = buildFollowupEmail({ demoPlan, nextSteps });
    const gmail = getGmailConnector();
    const attachmentPath = path.join(process.cwd(), "public", "media", "northstar-walkthrough.mp4");
    const { messageId } = await gmail.sendEmail({
      to: prospectEmail,
      subject,
      body,
      attachmentPath,
      attachmentName: "northstar-walkthrough.mp4",
    });
    actions.push({ app: "gmail", action: "send_followup", status: "success", externalId: messageId });
    gmailSucceeded = true;
  } catch (err) {
    actions.push({ app: "gmail", action: "send_followup", status: "failed", error: (err as Error).message });
  }

  // 2. Calendar - only if there's an explicit meeting commitment, and never a duplicate.
  const demoStep = findNextStep(nextSteps, "technical_demo");
  let calendarEventId: string | null = null;
  if (demoStep) {
    try {
      const calendar = getCalendarConnector();
      const existing = await calendar.findEventByTitle(MEETING_TITLE);
      if (existing) {
        calendarEventId = existing.id;
        actions.push({ app: "calendar", action: "create_meeting", status: "success", externalId: existing.id });
      } else {
        const startIso = "2026-09-16T14:00:00";
        const endIso = "2026-09-16T14:30:00";
        const created = await calendar.createEvent({
          summary: MEETING_TITLE,
          description:
            "Technical workflow walkthrough covering intake, triage, sprint planning, and linked documentation for Northstar Labs.",
          attendees: [prospectEmail, stakeholderEmail],
          startIso,
          endIso,
          timeZone: "America/Los_Angeles",
        });
        calendarEventId = created.id;
        actions.push({ app: "calendar", action: "create_meeting", status: "success", externalId: created.id });
      }
    } catch (err) {
      actions.push({ app: "calendar", action: "create_meeting", status: "failed", error: (err as Error).message });
    }
  }

  // 3. HubSpot - only after the above, so the CRM record reflects what actually happened.
  try {
    const writer = getHubSpotFollowupWriter();
    await writer.updateFollowup({
      verifiedRequirements: demoPlan.allowedCapabilities.join(", "),
      blockedRequirements: demoPlan.blockedCapabilities.map((b) => `${b.name} (${b.reason})`).join("; "),
      walkthroughUrl: gmailSucceeded ? "Sent as email attachment (northstar-walkthrough.mp4)" : "Not sent - email failed",
      nextTechnicalStep: calendarEventId
        ? `${MEETING_TITLE} (event ${calendarEventId})`
        : demoStep
          ? "Meeting commitment identified but not yet scheduled"
          : "No explicit meeting commitment",
    });
    actions.push({ app: "hubspot", action: "update_followup", status: "success" });
  } catch (err) {
    actions.push({ app: "hubspot", action: "update_followup", status: "failed", error: (err as Error).message });
  }

  return actions;
}
