import type { EvidenceQuery } from "./evidence-ranking";
import type { InterpretationAssessment } from "./interpretation-gate";

export interface QuestionUnderstandingResult {
  interpretationAssessment: InterpretationAssessment;
  evidenceQuery: EvidenceQuery;
  resolvedQuestion: string;
  clarificationQuestion?: string;
}

export interface QuestionContextMessage {
  role: "user" | "assistant";
  content: string;
}

interface ResponsesApiContentItem {
  type?: string;
  text?: string;
}

interface ResponsesApiOutputItem {
  type?: string;
  content?: ResponsesApiContentItem[];
}

interface ResponsesApiResult {
  output_text?: string;
  output?: ResponsesApiOutputItem[];
}

const SYSTEM_PROMPT = `You are the scientific question-understanding layer for FREEZGROVER, a conversational NASA microgravity-combustion research assistant.

Your job is NOT to answer the scientific question. Your job is to understand what the user means well enough for the evidence system to retrieve the right experiments.

Quality bar:
- Reason like a strong conversational assistant, not like a form or menu.
- Read the conversation as a dialogue. A short user reply often answers the assistant's previous clarification.
- Carry forward details that were already established in the conversation instead of asking for them again.
- Resolve terse follow-ups into a complete scientific question when the meaning is clear from context.
- Do not repeatedly subdivide a concept merely because more distinctions are theoretically possible.
- Ask one clarification only when two or more genuinely plausible readings remain and choosing between them would materially change the evidence or conclusion.
- Phrase clarification naturally, in plain language, as a helpful conversational question rather than a checklist.
- If the user's latest wording plus the prior conversation is sufficient, mark materiallyDifferent false and proceed.

Interpretation Gate rules:
- Identify whether a word, scientific term, condition, comparison target, measurement, or requested scope permits more than one reasonable interpretation.
- Do not assume the most common interpretation must be the intended one.
- Do not manufacture alternatives merely because a question is broad.
- Keep scientific dimensions separate when they matter: material, airflow/flow, oxygen, pressure, gravity, geometry, ignition, measurement, phenomenon, experiment, and comparison scope.
- Do not invent experimental conditions the user never supplied or established.
- Do not provide scientific findings, causal claims, or safety recommendations here.

Conversation examples:
1. USER: "How does flow affect the flame?"
   FREEZGROVER previously asks whether the user means flow speed, flow direction, or broader ventilation.
   USER: "flow direction"
   -> Treat flow direction as established. Do not ask what "flow" means again.

2. If FREEZGROVER then asks what outcome the user cares about and USER says "flame speed", resolve the research question to something like: "How does flow direction affect flame-spread speed?" and proceed if no material uncertainty remains.

Return only the requested structured data.`;

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    resolvedQuestion: { type: "string" },
    materiallyDifferent: { type: "boolean" },
    clarificationQuestion: { type: ["string", "null"] },
    interpretations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          description: { type: "string" },
        },
        required: ["id", "label", "description"],
      },
    },
    evidenceQuery: {
      type: "object",
      additionalProperties: false,
      properties: {
        topic: { type: ["string", "null"] },
        material: { type: ["string", "null"] },
        measurement: { type: ["string", "null"] },
        conditions: {
          type: "object",
          additionalProperties: false,
          properties: {
            gravity: { type: ["string", "null"] },
            material: { type: ["string", "null"] },
            fuel: { type: ["string", "null"] },
            geometry: { type: ["string", "null"] },
            ignition: { type: ["string", "null"] },
            oxygenPercent: { type: ["number", "null"] },
            pressureKPa: { type: ["number", "null"] },
            airflowCmPerS: { type: ["number", "null"] },
            thicknessMm: { type: ["number", "null"] },
          },
          required: [
            "gravity",
            "material",
            "fuel",
            "geometry",
            "ignition",
            "oxygenPercent",
            "pressureKPa",
            "airflowCmPerS",
            "thicknessMm"
          ],
        },
      },
      required: ["topic", "material", "measurement", "conditions"],
    },
  },
  required: ["resolvedQuestion", "materiallyDifferent", "clarificationQuestion", "interpretations", "evidenceQuery"],
};

function cleanNullableString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function cleanNullableNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function extractResponseText(result: ResponsesApiResult): string | null {
  if (typeof result.output_text === "string" && result.output_text.trim()) return result.output_text;
  for (const item of result.output ?? []) {
    for (const content of item.content ?? []) {
      if ((content.type === "output_text" || content.type === "text") && typeof content.text === "string" && content.text.trim()) return content.text;
    }
  }
  return null;
}

function buildConversationContext(question: string, messages?: QuestionContextMessage[]): string {
  if (!messages?.length) return `LATEST USER MESSAGE:\n${question}`;
  const transcript = messages
    .slice(-10)
    .map((message) => `${message.role === "assistant" ? "FREEZGROVER" : "USER"}: ${message.content}`)
    .join("\n\n");
  return `CONVERSATION:\n${transcript}\n\nLATEST USER MESSAGE:\n${question}`;
}

export async function understandQuestion(
  question: string,
  messages?: QuestionContextMessage[],
): Promise<QuestionUnderstandingResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("FREEZGROVER question understanding skipped: OPENAI_API_KEY is missing.");
    return null;
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      reasoning: { effort: "medium" },
      instructions: SYSTEM_PROMPT,
      input: buildConversationContext(question, messages),
      text: {
        format: {
          type: "json_schema",
          name: "freezegrover_question_understanding",
          strict: true,
          schema: OUTPUT_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    console.error("FREEZGROVER question understanding failed:", response.status, await response.text());
    return null;
  }

  const responseText = extractResponseText((await response.json()) as ResponsesApiResult);
  if (!responseText) {
    console.error("FREEZGROVER question understanding returned no readable output text.");
    return null;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    console.error("FREEZGROVER question understanding returned non-JSON output.");
    return null;
  }

  const resolvedQuestion = cleanNullableString(parsed.resolvedQuestion) ?? question;
  const rawInterpretations = Array.isArray(parsed.interpretations) ? parsed.interpretations : [];
  const interpretations = rawInterpretations
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, index) => ({
      id: cleanNullableString(item.id) ?? `interpretation-${index + 1}`,
      label: cleanNullableString(item.label) ?? "",
      description: cleanNullableString(item.description),
    }))
    .filter((item) => item.label.length > 0);

  const rawQuery = typeof parsed.evidenceQuery === "object" && parsed.evidenceQuery !== null
    ? (parsed.evidenceQuery as Record<string, unknown>)
    : {};
  const rawConditions = typeof rawQuery.conditions === "object" && rawQuery.conditions !== null
    ? (rawQuery.conditions as Record<string, unknown>)
    : {};

  const evidenceQuery: EvidenceQuery = {
    topic: cleanNullableString(rawQuery.topic) ?? resolvedQuestion,
    material: cleanNullableString(rawQuery.material),
    measurement: cleanNullableString(rawQuery.measurement),
    conditions: {
      gravity: cleanNullableString(rawConditions.gravity),
      material: cleanNullableString(rawConditions.material),
      fuel: cleanNullableString(rawConditions.fuel),
      geometry: cleanNullableString(rawConditions.geometry),
      ignition: cleanNullableString(rawConditions.ignition),
      oxygenPercent: cleanNullableNumber(rawConditions.oxygenPercent),
      pressureKPa: cleanNullableNumber(rawConditions.pressureKPa),
      airflowCmPerS: cleanNullableNumber(rawConditions.airflowCmPerS),
      thicknessMm: cleanNullableNumber(rawConditions.thicknessMm),
    },
  };

  return {
    resolvedQuestion,
    clarificationQuestion: cleanNullableString(parsed.clarificationQuestion),
    interpretationAssessment: {
      question: resolvedQuestion,
      interpretations,
      materiallyDifferent: parsed.materiallyDifferent === true,
    },
    evidenceQuery,
  };
}
