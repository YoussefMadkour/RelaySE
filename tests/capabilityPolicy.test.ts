import { describe, expect, it } from "vitest";
import { runAllScenarios } from "@/evals/runner";

describe("capability policy evals", () => {
  const results = runAllScenarios();

  it.each(results)("$id: $description", ({ passed, expected, actual }) => {
    expect(actual.decision, `expected ${expected.decision}, got ${actual.decision}`).toBe(expected.decision);
    expect(actual.includeInDemo).toBe(expected.includeInDemo);
    expect(passed).toBe(true);
  });
});
