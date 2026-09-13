import { getSlackConnector } from "@/connectors/slack";
import type { DemoPlan, NextStep } from "@/domain/schema";
import type { ApprovalRequest } from "@/trace/schema";

function findNextStep(nextSteps: NextStep[], type: NextStep["type"]): NextStep | undefined {
  return nextSteps.find((s) => s.type === type);
}

export function buildApprovalMessage(params: { prospect: string; demoPlan: DemoPlan; nextSteps: NextStep[] }): string {
  const { prospect, demoPlan, nextSteps } = params;

  const verifiedLines = demoPlan.scenes.map((s) => `✓ ${s.capability}`).join("\n") || "(none)";

  const blockedLines =
    demoPlan.blockedCapabilities.map((b) => `⚠ ${b.name}\n   Reason: ${b.reason}`).join("\n") || "(none)";

  const reviewLines =
    demoPlan.reviewCapabilities.length > 0
      ? demoPlan.reviewCapabilities.map((r) => `⚠ ${r.name}`).join("\n")
      : null;

  const demoStep = findNextStep(nextSteps, "technical_demo");
  const meetingLine = demoStep
    ? `✓ Technical meeting (${demoStep.stakeholder ?? "stakeholder"}, ${demoStep.timeframe ?? "TBD"})`
    : null;

  const lines = [
    `${prospect.toUpperCase()} FOLLOW-UP READY`,
    "",
    `Opportunity: $${demoPlan.opportunityValue.toLocaleString()}`,
    "",
    "Verified (in walkthrough):",
    verifiedLines,
    "",
    "Excluded:",
    blockedLines,
  ];

  if (reviewLines) {
    lines.push("", "Needs human review (not in product docs):", reviewLines);
  }

  lines.push(
    "",
    "Prepared:",
    "✓ Personalized walkthrough video",
    "✓ Follow-up email (draft)",
    meetingLine ?? "✓ Next meeting (see next steps)",
    "",
    "Approve customer-facing actions (send email, create calendar invite, update CRM)?"
  );

  return lines.join("\n");
}

export async function requestApproval(params: {
  prospect: string;
  demoPlan: DemoPlan;
  nextSteps: NextStep[];
}): Promise<ApprovalRequest> {
  const message = buildApprovalMessage(params);
  const slack = getSlackConnector();
  const { channel, ts } = await slack.postMessage(message);
  return { channel, ts, message };
}
