import { z } from "zod";
import {
  CapabilityDecisionSchema,
  DemoPlanSchema,
  ExternalActionSchema,
  RequirementSchema,
  DeferredTopicSchema,
  NextStepSchema,
} from "@/domain/schema";

export const TraceStepSchema = z.object({
  type: z.string(),
  at: z.string(),
  detail: z.record(z.string(), z.unknown()),
});
export type TraceStep = z.infer<typeof TraceStepSchema>;

export const RunTraceSchema = z.object({
  runId: z.string(),
  prospect: z.string(),
  mode: z.enum(["mock", "live"]),
  createdAt: z.string(),
  requirements: z.array(RequirementSchema),
  deferredTopics: z.array(DeferredTopicSchema),
  nextSteps: z.array(NextStepSchema),
  decisions: z.array(CapabilityDecisionSchema),
  demoPlan: DemoPlanSchema.nullable(),
  steps: z.array(TraceStepSchema),
  actions: z.array(ExternalActionSchema),
});
export type RunTrace = z.infer<typeof RunTraceSchema>;
