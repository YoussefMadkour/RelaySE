import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { EvidenceSchema, type ExtractionResult } from "@/domain/schema";

const LLMRequirementSchema = z.object({
  name: z.string(),
  normalizedCapability: z.string(),
  importance: z.enum(["low", "medium", "high"]),
  explicit: z.boolean(),
  deprioritized: z.boolean().default(false),
  requiresVerification: z.boolean().default(false),
  evidence: EvidenceSchema,
});

const LLMExtractionSchema = z.object({
  requirements: z.array(LLMRequirementSchema),
  deferredTopics: z.array(
    z.object({
      name: z.string(),
      evidence: EvidenceSchema,
      note: z.string(),
    })
  ),
  nextSteps: z.array(
    z.object({
      type: z.enum(["send_tailored_walkthrough", "technical_demo", "verify_sap_status"]),
      stakeholder: z.string().optional(),
      timeframe: z.string().optional(),
      scope: z.string().optional(),
      explicit: z.boolean(),
      evidence: EvidenceSchema,
    })
  ),
});

const SYSTEM_PROMPT = `You are extracting structured buyer requirements from a B2B discovery-call transcript for a Solutions Engineering agent.

Rules:
1. Every requirement, deferred topic, and next step MUST include an exact quote from the transcript as evidence, plus its timestamp if the transcript has one (format like [MM:SS]).
2. A "requirement" is something the buyer explicitly asked about, cares about, or wants to see - not general conversational filler.
3. If the buyer explicitly defers or punts on a topic ("we can deal with that separately", "that's not a priority right now"), it goes in deferredTopics, NOT requirements. It must never block anything downstream.
4. If the buyer explicitly says not to spend much time on something (e.g. "I wouldn't spend half the demo on X"), still extract it as a requirement but set deprioritized: true.
5. If the buyer asks you to verify something rather than assume it (e.g. "I want to know if you actually support X, don't guess"), set requiresVerification: true.
6. importance should reflect how central the requirement is to the buyer's stated evaluation criteria, not how often it's mentioned.
7. normalizedCapability should be a short, canonical lowercase capability name suitable for looking up in a product capability matrix (e.g. "work intake / triage", "sap integration", "enterprise sso").
8. Do not invent requirements, evidence, or next steps that are not grounded in the transcript text.
9. Output ONLY valid JSON matching the provided schema. No prose, no markdown fences.`;

function generateId(normalizedCapability: string, index: number): string {
  const slug = normalizedCapability
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `req-${slug || index}`;
}

export async function extractRequirements(transcript: string): Promise<ExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Extraction requires a live Claude API call - this is not something mock mode can fake, since it's core agent reasoning, not an external app side-effect."
    );
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Extract requirements from this discovery-call transcript:\n\n${transcript}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude did not return a text response for requirement extraction.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch (err) {
    throw new Error(`Claude's extraction response was not valid JSON: ${(err as Error).message}\n\nRaw response:\n${textBlock.text}`);
  }

  const result = LLMExtractionSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Claude's extraction response did not match the expected schema: ${result.error.message}`);
  }

  return {
    requirements: result.data.requirements.map((r, i) => ({
      ...r,
      id: generateId(r.normalizedCapability, i),
    })),
    deferredTopics: result.data.deferredTopics,
    nextSteps: result.data.nextSteps,
  };
}
