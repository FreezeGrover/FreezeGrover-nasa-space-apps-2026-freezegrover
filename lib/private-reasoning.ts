import type { EvidenceQuery } from "./evidence-ranking";
import type { InterpretationAssessment } from "./interpretation-gate";
import type { QuestionContextMessage, QuestionUnderstandingResult } from "./question-understanding";

interface PrivateReasoningResponse {
  resolvedQuestion?: unknown;
  clarificationQuestion?: unknown;
  materiallyDifferent?: unknown;
  interpretations?: unknown;
  evidenceQuery?: unknown;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

export async function understandQuestionWithPrivateReasoner(
  question: string,
  messages: QuestionContextMessage[],
): Promise<QuestionUnderstandingResult | null> {
  const endpoint = process.env.CLARITY_REASONING_URL?.trim();
  if (!endpoint) return null;

  const token = process.env.CLARITY_REASONING_TOKEN?.trim();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        question,
        messages: messages.slice(-12),
        task: "question-understanding",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Private Clarity reasoner failed:", response.status);
      return null;
    }

    const data = await response.json() as PrivateReasoningResponse;
    const resolvedQuestion = stringValue(data.resolvedQuestion) ?? question;

    const rawInterpretations = Array.isArray(data.interpretations) ? data.interpretations : [];
    const interpretations: InterpretationAssessment["interpretations"] = rawInterpretations
      .map((value, index) => {
        const item = recordValue(value);
        return {
          id: stringValue(item.id) ?? `interpretation-${index + 1}`,
          label: stringValue(item.label) ?? "",
          description: stringValue(item.description),
        };
      })
      .filter((item) => item.label.length > 0);

    const rawQuery = recordValue(data.evidenceQuery);
    const rawConditions = recordValue(rawQuery.conditions);

    const evidenceQuery: EvidenceQuery = {
      topic: stringValue(rawQuery.topic) ?? resolvedQuestion,
      material: stringValue(rawQuery.material),
      measurement: stringValue(rawQuery.measurement),
      conditions: {
        gravity: stringValue(rawConditions.gravity),
        material: stringValue(rawConditions.material),
        fuel: stringValue(rawConditions.fuel),
        geometry: stringValue(rawConditions.geometry),
        ignition: stringValue(rawConditions.ignition),
        oxygenPercent: numberValue(rawConditions.oxygenPercent),
        pressureKPa: numberValue(rawConditions.pressureKPa),
        airflowCmPerS: numberValue(rawConditions.airflowCmPerS),
        thicknessMm: numberValue(rawConditions.thicknessMm),
      },
    };

    return {
      resolvedQuestion,
      clarificationQuestion: stringValue(data.clarificationQuestion),
      interpretationAssessment: {
        question: resolvedQuestion,
        materiallyDifferent: data.materiallyDifferent === true,
        interpretations,
      },
      evidenceQuery,
    };
  } catch (error) {
    console.error("Private Clarity reasoner unavailable:", error);
    return null;
  }
}
