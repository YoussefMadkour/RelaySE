import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { extractRequirements } from "@/agent/extractRequirements";
import { verifyCapabilities } from "@/agent/verifyCapabilities";
import { planDemo } from "@/agent/planDemo";
import { requestApproval } from "@/agent/requestApproval";
import { getCRMConnector } from "@/connectors/hubspot";
import { getDriveConnector } from "@/connectors/drive";
import { connectorMode } from "@/connectors/types";
import { captureScenes } from "@/capture/playwright";
import { saveRunTrace } from "@/trace/store";
import type { RunTrace, TraceStep, CaptureResultTrace } from "@/trace/schema";

export async function runDiscoveryToDemoAgent(params: {
  accountName: string;
  transcriptRelativePath: string;
  crmFixture?: string;
}): Promise<RunTrace> {
  const { accountName, transcriptRelativePath, crmFixture } = params;
  const runId = randomUUID();
  const steps: TraceStep[] = [];
  const mode = connectorMode();

  const record = (type: string, detail: Record<string, unknown>) => {
    steps.push({ type, at: new Date().toISOString(), detail });
  };

  const transcriptPath = path.join(process.cwd(), transcriptRelativePath);
  const transcript = await readFile(transcriptPath, "utf8");
  record("transcript_loaded", { path: transcriptRelativePath, length: transcript.length });

  // Load product truth BEFORE extraction: the model needs the matrix's exact
  // capability names as a controlled vocabulary, otherwise its own paraphrases
  // ("sprint planning" vs. our "sprint / cycle planning") silently fail the
  // downstream exact-match verification and get treated as unverifiable.
  const drive = getDriveConnector();
  const matrix = await drive.getCapabilityMatrix();
  record("capability_matrix_loaded", { entries: matrix.length });
  const knownCapabilities = [...new Set(matrix.map((m) => m.capability))];

  const extraction = await extractRequirements(transcript, knownCapabilities);
  record("requirements_extracted", {
    count: extraction.requirements.length,
    requirements: extraction.requirements.map((r) => ({
      capability: r.normalizedCapability,
      importance: r.importance,
    })),
  });

  const crm = getCRMConnector(crmFixture);
  const opportunity = await crm.getOpportunity(accountName);
  record("commercial_context_resolved", {
    accountName,
    opportunityValue: opportunity.opportunity.amount,
    stage: opportunity.opportunity.stage,
  });

  const decisions = verifyCapabilities(extraction.requirements, matrix);
  for (const decision of decisions) {
    record("capability_verified", {
      capability: decision.capability,
      decision: decision.decision,
      reason: decision.reason,
    });
  }

  const demoPlan = planDemo({
    prospect: opportunity.accountName,
    opportunityValue: opportunity.opportunity.amount,
    decisions,
  });
  record("demo_plan_generated", {
    allowed: demoPlan.allowedCapabilities,
    blocked: demoPlan.blockedCapabilities,
    reviewNeeded: demoPlan.reviewCapabilities,
    scenes: demoPlan.scenes.length,
  });

  let captures: CaptureResultTrace[] = [];
  if (demoPlan.scenes.length > 0) {
    const storageStatePath = path.join(process.cwd(), "data", ".auth", "plane.json");
    if (!existsSync(storageStatePath)) {
      throw new Error(
        `No saved Plane session at ${storageStatePath}. Run "node --env-file=.env.local scripts/plane-login.mjs" first - ` +
          "capture must not proceed without a real authenticated session, and must not fall back to a fake screenshot."
      );
    }
    const publicDir = path.join(process.cwd(), "public", "screenshots", runId);
    const results = await captureScenes(demoPlan.scenes, {
      baseUrl: "https://app.plane.so",
      storageStatePath,
      outputDir: publicDir,
    });
    captures = results.map((r) => ({
      ...r,
      publicUrl: `/screenshots/${runId}/${path.basename(r.screenshotPath)}`,
    }));
    record("scenes_captured", { count: captures.length });
  }

  // Posting the approval request IS the approval gate, not a customer-facing
  // action - safe to do automatically. Nothing that reaches the prospect
  // (Gmail, Calendar, HubSpot) happens until a human approves via the UI.
  const approvalRequest = await requestApproval({
    prospect: opportunity.accountName,
    demoPlan,
    nextSteps: extraction.nextSteps,
  });
  record("approval_requested", { channel: approvalRequest.channel, ts: approvalRequest.ts });

  const trace: RunTrace = {
    runId,
    prospect: opportunity.accountName,
    mode,
    createdAt: new Date().toISOString(),
    requirements: extraction.requirements,
    deferredTopics: extraction.deferredTopics,
    nextSteps: extraction.nextSteps,
    decisions,
    demoPlan,
    captures,
    approvalStatus: "pending",
    approvalRequest,
    steps,
    actions: [],
  };

  await saveRunTrace(trace);
  return trace;
}
