import type { EvidenceQuery } from "./evidence-ranking";
import type { InterpretationAssessment } from "./interpretation-gate";

export interface QuestionUnderstandingResult {
  interpretationAssessment: InterpretationAssessment;
  evidenceQuery: EvidenceQuery;
}

interface ResponsesApiResult {
  output_text?: string;
}

const SYSTEM_PROMPT = `You are the scientific question-understanding layer for FREEZGROVER, a NASA Space Apps research dashboard for microgravity combustion evidence.

Your job is NOT to answer the scientific question. Your job is to determine what the user is asking so the evidence pipeline can retrieve the right experiments.

Interpretation Gate rules:
- Identify whether a word, scientific term, condition, comparison target, or requested scope permits more than one reasonable interpretation.
- Do not assume the most common interpretation must be the user's intended one.
- Ask for clarification only when the competing interpretations would materially change which evidence should be retrieved, compared, or used in the conclusion.
- Do not manufacture alternatives merely because a question is broad. If the question can be answered responsibly across the broader scope, mark materiallyDifferent false.
- Keep scientific dimensions separate: material, airflow/flow, oxygen, pressure, gravity, geometry, ignition, measurement, phenomenon, experiment, and comparison scope.
- Do not infer conditions the user did not provide.
- Do not provide scientific findings, causal claims, or safety recommendations here.

Example:
Question: "How does flow affect the flame?"
The term "flow" could reasonably refer to forced-airflow speed, flow direction relative to flame spread, or a broader ventilation condition. If those scopes would retrieve or compare different evidence, materiallyDifferent should be true and the interpretations should state those scopes clearly.

Return only the requested structured data.`;

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    materiallyDifferent: { type: "boolean" },
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
  required: ["materiallyDifferent", "interpretations", "evidenceQuery"],
};

function cleanNullableString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function cleanNullableNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export async function understandQuestion(question: string): Promise<QuestionUnderstandingResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      instructions: SYSTEM_PROMPT,
      input: question,
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
    const errorText = await response.text();
    console.error("FREEZGROVER question understanding failed:", response.status, errorText);
    return null;
  }

  const result = (await response.json()) as ResponsesApiResult;
  if (!result.output_text) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(result.output_text) as Record<string, unknown>;
  } catch {
    return null;
  }

  const rawInterpretations = Array.isArray(parsed.interpretations) ? parsed.interpretations : [];
  const interpretations = rawInterpretations
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, index) => ({
      id: cleanNullableString(item.id) ?? `interpretation-${index + 1}`,
      label: cleanNullableString(item.label) ?? "",
      description: cleanNullableString(item.description),
    }))
    .filter((item) => item.label.length > 0);

  const rawQuery =
    typeof parsed.evidenceQuery === "object" && parsed.evidenceQuery !== null
      ? (parsed.evidenceQuery as Record<string, unknown>)
      : {};
  const rawConditions =
    typeof rawQuery.conditions === "object" && rawQuery.conditions !== null
      ? (rawQuery.conditions as Record<string, unknown>)
      : {};

  const evidenceQuery: EvidenceQuery = {
    topic: cleanNullableString(rawQuery.topic) ?? question,
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
    interpretationAssessment: {
      question,
      interpretations,
      materiallyDifferent: parsed.materiallyDifferent === true,
    },
    evidenceQuery,
  };
}
