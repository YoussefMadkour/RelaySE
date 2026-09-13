import { z } from "zod";

export const EvidenceSchema = z.object({
  source: z.literal("transcript"),
  quote: z.string(),
  timestamp: z.string().optional(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const RequirementSchema = z.object({
  id: z.string(),
  name: z.string(),
  normalizedCapability: z.string(),
  importance: z.enum(["low", "medium", "high"]),
  explicit: z.boolean(),
  deprioritized: z.boolean().default(false),
  requiresVerification: z.boolean().default(false),
  evidence: EvidenceSchema,
});
export type Requirement = z.infer<typeof RequirementSchema>;

export const DeferredTopicSchema = z.object({
  name: z.string(),
  evidence: EvidenceSchema,
  note: z.string(),
});
export type DeferredTopic = z.infer<typeof DeferredTopicSchema>;

export const NextStepSchema = z.object({
  type: z.enum(["send_tailored_walkthrough", "technical_demo", "verify_sap_status"]),
  stakeholder: z.string().optional(),
  timeframe: z.string().optional(),
  scope: z.string().optional(),
  explicit: z.boolean(),
  evidence: EvidenceSchema,
});
export type NextStep = z.infer<typeof NextStepSchema>;

export const ExtractionResultSchema = z.object({
  requirements: z.array(RequirementSchema),
  deferredTopics: z.array(DeferredTopicSchema),
  nextSteps: z.array(NextStepSchema),
});
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

export const CapabilityStatusSchema = z.enum(["GA", "BETA", "ROADMAP", "UNSUPPORTED", "UNKNOWN"]);
export type CapabilityStatus = z.infer<typeof CapabilityStatusSchema>;

export const CapabilityEvidenceSchema = z.object({
  capability: z.string(),
  status: CapabilityStatusSchema,
  sourceDocument: z.string(),
  sourceSection: z.string().optional(),
  evidenceText: z.string(),
  authority: z.number(),
});
export type CapabilityEvidence = z.infer<typeof CapabilityEvidenceSchema>;

export const CapabilityDecisionSchema = z.object({
  requirementId: z.string(),
  capability: z.string(),
  decision: z.enum(["ALLOW", "ALLOW_WITH_WARNING", "BLOCK", "REQUIRE_HUMAN_REVIEW"]),
  reason: z.string(),
  buyerEvidence: EvidenceSchema,
  productEvidence: z.array(CapabilityEvidenceSchema),
  includeInDemo: z.boolean(),
});
export type CapabilityDecision = z.infer<typeof CapabilityDecisionSchema>;

export const DemoSceneSchema = z.object({
  id: z.string(),
  title: z.string(),
  capability: z.string(),
  objective: z.string(),
  productRoute: z.string(),
  narration: z.string(),
  buyerEvidence: EvidenceSchema,
  productEvidence: z.array(CapabilityEvidenceSchema),
});
export type DemoScene = z.infer<typeof DemoSceneSchema>;

export const DemoPlanSchema = z.object({
  prospect: z.string(),
  opportunityValue: z.number(),
  allowedCapabilities: z.array(z.string()),
  blockedCapabilities: z.array(z.object({ name: z.string(), reason: z.string() })),
  reviewCapabilities: z.array(z.object({ name: z.string(), reason: z.string() })),
  scenes: z.array(DemoSceneSchema),
});
export type DemoPlan = z.infer<typeof DemoPlanSchema>;

export const ExternalActionSchema = z.object({
  app: z.enum(["slack", "gmail", "calendar", "hubspot"]),
  action: z.string(),
  status: z.enum(["pending", "success", "failed", "blocked"]),
  externalId: z.string().optional(),
  error: z.string().optional(),
});
export type ExternalAction = z.infer<typeof ExternalActionSchema>;
