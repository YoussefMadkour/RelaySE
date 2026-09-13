import type { CapabilityDecision, CapabilityEvidence, CapabilityStatus, Requirement } from "@/domain/schema";

const STATUS_POLICY: Record<
  CapabilityStatus,
  { decision: CapabilityDecision["decision"]; includeInDemo: boolean; reason: string }
> = {
  GA: { decision: "ALLOW", includeInDemo: true, reason: "Capability is generally available." },
  BETA: {
    decision: "ALLOW_WITH_WARNING",
    includeInDemo: true,
    reason: "Capability is in beta; must be labeled as beta and requires human approval before demonstrating.",
  },
  ROADMAP: {
    decision: "BLOCK",
    includeInDemo: false,
    reason: "Capability is roadmap and must not be presented as currently available.",
  },
  UNSUPPORTED: {
    decision: "BLOCK",
    includeInDemo: false,
    reason: "Capability is not supported and must not be demonstrated.",
  },
  UNKNOWN: {
    decision: "REQUIRE_HUMAN_REVIEW",
    includeInDemo: false,
    reason: "Capability status could not be verified against product documentation.",
  },
};

/**
 * Deterministic allow/block policy. The LLM may map buyer language to a
 * canonical capability name, but this function - not the model - decides
 * whether it can be shown. Buyer transcript, CRM notes, Slack messages, and
 * email can never override authoritative product-capability documentation.
 */
export function applyCapabilityPolicy(
  requirement: Requirement,
  evidence: CapabilityEvidence[]
): CapabilityDecision {
  if (evidence.length === 0) {
    const policy = STATUS_POLICY.UNKNOWN;
    return {
      requirementId: requirement.id,
      capability: requirement.normalizedCapability,
      decision: policy.decision,
      reason: `No product documentation found for "${requirement.normalizedCapability}". ${policy.reason}`,
      buyerEvidence: requirement.evidence,
      productEvidence: [],
      includeInDemo: policy.includeInDemo,
    };
  }

  const maxAuthority = Math.max(...evidence.map((e) => e.authority));
  const mostAuthoritative = evidence.filter((e) => e.authority === maxAuthority);
  const distinctStatuses = new Set(mostAuthoritative.map((e) => e.status));

  if (distinctStatuses.size > 1) {
    const policy = STATUS_POLICY.UNKNOWN;
    return {
      requirementId: requirement.id,
      capability: requirement.normalizedCapability,
      decision: "REQUIRE_HUMAN_REVIEW",
      reason: `Equally authoritative sources disagree on status (${[...distinctStatuses].join(
        ", "
      )}). ${policy.reason}`,
      buyerEvidence: requirement.evidence,
      productEvidence: evidence,
      includeInDemo: false,
    };
  }

  const status = mostAuthoritative[0].status;
  const policy = STATUS_POLICY[status];

  return {
    requirementId: requirement.id,
    capability: requirement.normalizedCapability,
    decision: policy.decision,
    reason: policy.reason,
    buyerEvidence: requirement.evidence,
    productEvidence: evidence,
    includeInDemo: policy.includeInDemo,
  };
}
