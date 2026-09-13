import type { CapabilityEvidence, CapabilityDecision, Requirement } from "@/domain/schema";
import { applyCapabilityPolicy } from "@/policies/capabilityPolicy";

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

export function verifyCapabilities(
  requirements: Requirement[],
  matrix: CapabilityEvidence[]
): CapabilityDecision[] {
  return requirements.map((requirement) => {
    const matches = matrix.filter(
      (entry) => normalize(entry.capability) === normalize(requirement.normalizedCapability)
    );
    return applyCapabilityPolicy(requirement, matches);
  });
}
