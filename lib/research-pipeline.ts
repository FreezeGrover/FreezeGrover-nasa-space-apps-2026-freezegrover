import type { ResearchAnswer } from "./domain";
import type { InterpretationAssessment } from "./interpretation-gate";
import { evaluateInterpretationGate } from "./interpretation-gate";

/**
 * Public challenge capability order.
 * Keep this order consistent in the dashboard, documentation, and capability
 * navigation because it mirrors the challenge framing:
 * Summarize → Rank → Interpret → Safety Insights.
 *
 * These are user-facing capabilities, not a claim that the internal engine must
 * execute them in this same order for every question.
 */
export const capabilityOrder = [
  "summarize",
  "rank",
  "interpret",
  "safety-insights",
] as const;

/**
 * Internal research execution order.
 *
 * Ranking occurs before synthesis because the engine must first determine which
 * evidence is most relevant before it can responsibly summarize or interpret
 * that evidence. Comparison and cross-checking then test whether the retrieved
 * findings are actually comparable before synthesis or safety significance is
 * produced.
 */
export const researchStages = [
  "understand-question",
  "interpretation-gate",
  "retrieve-nasa-evidence",
  "rank-evidence",
  "compare-conditions",
  "cross-check-findings",
  "summarize-evidence",
  "interpret-evidence",
  "derive-safety-insights",
  "surface-limitations",
  "report-sources",
] as const;

export type ResearchStage = (typeof researchStages)[number];
export type CapabilityName = (typeof capabilityOrder)[number];

export interface ResearchRequest {
  question: string;
  interpretationAssessment?: InterpretationAssessment;
}

export interface ResearchPipelineResult {
  stages: ResearchStage[];
  answer: ResearchAnswer;
}

export function runInterpretationGate(
  question: string,
  assessment?: InterpretationAssessment,
): ResearchPipelineResult | null {
  if (!assessment) return null;

  const gate = evaluateInterpretationGate(assessment);
  if (gate.status === "clear") return null;

  return {
    stages: ["understand-question", "interpretation-gate"],
    answer: {
      question,
      status: "needs-clarification",
      clarificationQuestion: gate.clarificationQuestion,
      relevantEvidence: [],
      limitations: [
        "Evidence retrieval has not started because multiple plausible scopes could materially change the evidence or conclusion.",
      ],
      sourceIds: [],
    },
  };
}

export function createEvidenceUnavailableResult(question: string): ResearchPipelineResult {
  return {
    stages: [...researchStages],
    answer: {
      question,
      status: "insufficient-evidence",
      finding: "Verified NASA evidence is not yet sufficient to answer this question reliably.",
      relevantEvidence: [],
      reasonableConclusion:
        "FREEZGROVER will not invent a scientific conclusion when the evidence layer cannot support one.",
      limitations: [
        "The verified evidence set is still being expanded.",
        "No conclusion should be generalized beyond the conditions represented by the connected evidence.",
      ],
      sourceIds: [],
    },
  };
}
