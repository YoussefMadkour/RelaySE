import { applyCapabilityPolicy } from "@/policies/capabilityPolicy";
import { POLICY_SCENARIOS, type PolicyScenario } from "@/evals/scenarios";

export type EvalResult = {
  id: string;
  description: string;
  passed: boolean;
  expected: { decision: string; includeInDemo: boolean };
  actual: { decision: string; includeInDemo: boolean; reason: string };
};

export function runScenario(scenario: PolicyScenario): EvalResult {
  const decision = applyCapabilityPolicy(scenario.requirement, scenario.evidence);
  const passed =
    decision.decision === scenario.expectedDecision && decision.includeInDemo === scenario.expectedIncludeInDemo;
  return {
    id: scenario.id,
    description: scenario.description,
    passed,
    expected: { decision: scenario.expectedDecision, includeInDemo: scenario.expectedIncludeInDemo },
    actual: { decision: decision.decision, includeInDemo: decision.includeInDemo, reason: decision.reason },
  };
}

export function runAllScenarios(): EvalResult[] {
  return POLICY_SCENARIOS.map(runScenario);
}
