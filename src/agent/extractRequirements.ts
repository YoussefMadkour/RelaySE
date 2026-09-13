import OpenAI from "openai";
import { z } from "zod";
import type { ExtractionResult } from "@/domain/schema";

// Local schemas for validating the RAW model response, distinct from the
// domain EvidenceSchema/NextStepSchema: OpenAI structured-output strict mode
// requires every optional field to be present-but-nullable rather than
// omittable, so these accept `null` where the domain schema expects
// `undefined`. Converted via nullToUndefined() after parsing.
const LLMEvidenceSchema = z.object({
  source: z.literal("transcript"),
  quote: z.string(),
  timestamp: z.string().nullable(),
});

const LLMRequirementSchema = z.object({
  name: z.string(),
  normalizedCapability: z.string(),
  importance: z.enum(["low", "medium", "high"]),
  explicit: z.boolean(),
  deprioritized: z.boolean().default(false),
  requiresVerification: z.boolean().default(false),
  evidence: LLMEvidenceSchema,
});

const LLMExtractionSchema = z.object({
  requirements: z.array(LLMRequirementSchema),
  deferredTopics: z.array(
    z.object({
      name: z.string(),
      evidence: LLMEvidenceSchema,
      note: z.string(),
    })
  ),
  nextSteps: z.array(
    z.object({
      type: z.enum(["send_tailored_walkthrough", "technical_demo", "verify_sap_status"]),
      stakeholder: z.string().nullable(),
      timeframe: z.string().nullable(),
      scope: z.string().nullable(),
      explicit: z.boolean(),
      evidence: LLMEvidenceSchema,
    })
  ),
});

function buildSystemPrompt(knownCapabilities: string[]): string {
  return `You are extracting structured buyer requirements from a B2B discovery-call transcript for a Solutions Engineering agent.

Rules:
1. Every requirement, deferred topic, and next step MUST include an exact quote from the transcript as evidence, plus its timestamp if the transcript has one (format like [MM:SS]).
2. A "requirement" is something the buyer explicitly asked about, cares about, or wants to see - not general conversational filler.
3. If the buyer explicitly defers or punts on a topic ("we can deal with that separately", "that's not a priority right now"), it goes in deferredTopics, NOT requirements. It must never block anything downstream.
4. If the buyer explicitly says not to spend much time on something (e.g. "I wouldn't spend half the demo on X"), still extract it as a requirement but set deprioritized: true.
5. If the buyer asks you to verify something rather than assume it (e.g. "I want to know if you actually support X, don't guess"), set requiresVerification: true.
6. importance should reflect how central the requirement is to the buyer's stated evaluation criteria, not how often it's mentioned.
7. CRITICAL - normalizedCapability must use a controlled vocabulary, not free-form paraphrasing. The product's capability matrix uses these EXACT canonical names:
${knownCapabilities.map((c) => `   - "${c}"`).join("\n")}
   If a requirement clearly refers to one of these capabilities (even if the buyer used different words), set normalizedCapability to that EXACT string, character-for-character. Downstream verification does an exact string match against the matrix - a close paraphrase ("sprint planning" instead of "sprint / cycle planning") will incorrectly fail to match and be treated as unverifiable, even though the capability is actually supported. Only invent a new lowercase slug-style name when the requirement genuinely does not correspond to any capability in the list above.
8. Multiple distinct buyer statements can support the same capability - that's fine and expected, do not force artificial distinctions just to avoid repeats. Downstream deduplication is handled separately.
9. Do not invent requirements, evidence, or next steps that are not grounded in the transcript text.`;
}

// Hand-written JSON Schema for OpenAI structured outputs (strict mode requires
// every property listed as required; genuinely optional fields are modeled as
// nullable instead and converted back to `undefined` after parsing).
const EVIDENCE_JSON_SCHEMA = {
  type: "object",
  properties: {
    source: { type: "string", enum: ["transcript"] },
    quote: { type: "string" },
    timestamp: { type: ["string", "null"] },
  },
  required: ["source", "quote", "timestamp"],
  additionalProperties: false,
} as const;

const EXTRACTION_JSON_SCHEMA = {
  type: "object",
  properties: {
    requirements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          normalizedCapability: { type: "string" },
          importance: { type: "string", enum: ["low", "medium", "high"] },
          explicit: { type: "boolean" },
          deprioritized: { type: "boolean" },
          requiresVerification: { type: "boolean" },
          evidence: EVIDENCE_JSON_SCHEMA,
        },
        required: [
          "name",
          "normalizedCapability",
          "importance",
          "explicit",
          "deprioritized",
          "requiresVerification",
          "evidence",
        ],
        additionalProperties: false,
      },
    },
    deferredTopics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          evidence: EVIDENCE_JSON_SCHEMA,
          note: { type: "string" },
        },
        required: ["name", "evidence", "note"],
        additionalProperties: false,
      },
    },
    nextSteps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["send_tailored_walkthrough", "technical_demo", "verify_sap_status"],
          },
          stakeholder: { type: ["string", "null"] },
          timeframe: { type: ["string", "null"] },
          scope: { type: ["string", "null"] },
          explicit: { type: "boolean" },
          evidence: EVIDENCE_JSON_SCHEMA,
        },
        required: ["type", "stakeholder", "timeframe", "scope", "explicit", "evidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["requirements", "deferredTopics", "nextSteps"],
  additionalProperties: false,
} as const;

function generateId(normalizedCapability: string, index: number): string {
  // Always suffix with the index - multiple distinct requirements legitimately
  // map to the same capability, and ids must stay unique per requirement, not
  // per capability.
  const slug = normalizedCapability
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `req-${slug || "item"}-${index}`;
}

function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value === null ? undefined : value;
}

export async function extractRequirements(
  transcript: string,
  knownCapabilities: string[]
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Extraction requires a live model call - this is not something mock mode can fake, since it's core agent reasoning, not an external app side-effect."
    );
  }

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-5.6-luna",
    messages: [
      { role: "system", content: buildSystemPrompt(knownCapabilities) },
      { role: "user", content: `Extract requirements from this discovery-call transcript:\n\n${transcript}` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "extraction_result",
        schema: EXTRACTION_JSON_SCHEMA,
        strict: true,
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("gpt-5.6-luna did not return a response for requirement extraction.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Extraction response was not valid JSON: ${(err as Error).message}\n\nRaw response:\n${raw}`);
  }

  const result = LLMExtractionSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Extraction response did not match the expected schema: ${result.error.message}`);
  }

  return {
    requirements: result.data.requirements.map((r, i) => ({
      ...r,
      evidence: { ...r.evidence, timestamp: nullToUndefined(r.evidence.timestamp) },
      id: generateId(r.normalizedCapability, i),
    })),
    deferredTopics: result.data.deferredTopics.map((t) => ({
      ...t,
      evidence: { ...t.evidence, timestamp: nullToUndefined(t.evidence.timestamp) },
    })),
    nextSteps: result.data.nextSteps.map((s) => ({
      ...s,
      stakeholder: nullToUndefined(s.stakeholder),
      timeframe: nullToUndefined(s.timeframe),
      scope: nullToUndefined(s.scope),
      evidence: { ...s.evidence, timestamp: nullToUndefined(s.evidence.timestamp) },
    })),
  };
}
