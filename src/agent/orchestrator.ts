import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { extractRequirements } from "@/agent/extractRequirements";
import { verifyCapabilities } from "@/agent/verifyCapabilities";
import { planDemo } from "@/agent/planDemo";
import { getCRMConnector } from "@/connectors/hubspot";
import { getDriveConnector } from "@/connectors/drive";
import { connectorMode } from "@/connectors/types";
import { saveRunTrace } from "@/trace/store";
import type { RunTrace, TraceStep } from "@/trace/schema";

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

  const extraction = await extractRequirements(transcript);
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

  const drive = getDriveConnector();
  const matrix = await drive.getCapabilityMatrix();
  record("capability_matrix_loaded", { entries: matrix.length });

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
    steps,
    actions: [],
  };

  await saveRunTrace(trace);
  return trace;
}
