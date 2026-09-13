import type { CapabilityDecision, DemoPlan, DemoScene } from "@/domain/schema";

function dedupeByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Capabilities eligible for a filmed walkthrough scene. Being ALLOWED is not
 * sufficient on its own - the buyer explicitly scoped the next demo to the
 * core intake -> triage -> sprint -> docs workflow, so capabilities like SSO
 * or permissions can be ALLOW in the requirements table without getting a
 * scene. A capability only becomes a scene if we have an actual product
 * route to show for it.
 */
// Product routes point at the real, live-seeded Plane workspace
// (app.plane.so/northstar-demo) - verified by authenticated Playwright
// capture, not placeholder paths. See setup/plane.md for the underlying
// project/cycle/page IDs.
const CUSTOMER_REQUESTS_PROJECT = "7b9d1648-be2e-40c6-986a-4738a86ac839";
const Q4_SPRINT_3_CYCLE = "6eb06f70-82f6-477b-9016-53c282281e7d";
const INTAKE_TRIAGE_PLAYBOOK_PAGE = "0eb40c70-62a9-4793-a495-811d81ae209f";

const SCENE_CONFIG: Record<
  string,
  { title: string; productRoute: string; objective: string; narration: string }
> = {
  "work intake / triage": {
    title: "Capture and triage incoming work",
    productRoute: `/northstar-demo/projects/${CUSTOMER_REQUESTS_PROJECT}/issues/`,
    objective: "Show a request entering one consistent front door and getting triaged.",
    narration:
      "Northstar mentioned that incoming engineering requests are hard to triage. Here is how a request gets captured and triaged in one place.",
  },
  "sprint / cycle planning": {
    title: "Plan approved work in the next cycle",
    productRoute: `/northstar-demo/projects/${CUSTOMER_REQUESTS_PROJECT}/cycles/${Q4_SPRINT_3_CYCLE}/`,
    objective: "Show an approved request moving into a planned cycle without losing its context.",
    narration:
      "Once triaged, approved work moves directly into the next cycle - no re-typing the request into another system.",
  },
  "product documentation": {
    title: "Keep product context connected",
    productRoute: `/northstar-demo/projects/${CUSTOMER_REQUESTS_PROJECT}/pages/${INTAKE_TRIAGE_PLAYBOOK_PAGE}/`,
    objective: "Show documentation linked directly to the execution work it describes.",
    narration:
      "The documentation an engineer needs stays linked to the work itself, instead of living in a separate system.",
  },
};

export function planDemo(params: {
  prospect: string;
  opportunityValue: number;
  decisions: CapabilityDecision[];
}): DemoPlan {
  const { prospect, opportunityValue, decisions } = params;

  const allowedCapabilities = decisions
    .filter((d) => d.decision === "ALLOW" || d.decision === "ALLOW_WITH_WARNING")
    .map((d) => d.capability);
  const dedupedAllowedCapabilities = [...new Set(allowedCapabilities)];

  const blockedCapabilities = dedupeByName(
    decisions.filter((d) => d.decision === "BLOCK").map((d) => ({ name: d.capability, reason: d.reason }))
  );

  const reviewCapabilities = dedupeByName(
    decisions
      .filter((d) => d.decision === "REQUIRE_HUMAN_REVIEW")
      .map((d) => ({ name: d.capability, reason: d.reason }))
  );

  // Multiple distinct buyer statements often map to the same capability (e.g.
  // three separate remarks all about intake/triage) - that's fine for the
  // requirements table, but must collapse to ONE demo scene per capability,
  // not one per requirement, otherwise the walkthrough repeats the same scene.
  const seenSceneCapabilities = new Set<string>();
  const scenes: DemoScene[] = decisions
    .filter((d) => d.includeInDemo)
    .map((d, i) => {
      const key = d.capability.toLowerCase();
      if (seenSceneCapabilities.has(key)) return null;
      const config = SCENE_CONFIG[key];
      if (!config) return null;
      seenSceneCapabilities.add(key);
      return {
        id: `scene-${i + 1}`,
        title: config.title,
        capability: d.capability,
        objective: config.objective,
        productRoute: config.productRoute,
        narration: config.narration,
        buyerEvidence: d.buyerEvidence,
        productEvidence: d.productEvidence,
      } satisfies DemoScene;
    })
    .filter((scene): scene is DemoScene => scene !== null)
    .map((scene, idx) => ({ ...scene, id: `scene-${idx + 1}` }));

  return {
    prospect,
    opportunityValue,
    allowedCapabilities: dedupedAllowedCapabilities,
    blockedCapabilities,
    reviewCapabilities,
    scenes,
  };
}
