import type { ResearchAnswer } from "./domain";

export const researchStages = [
  "understand-question",
  "clarify-if-needed",
  "retrieve-nasa-evidence",
  "compare-conditions",
  "cross-check-findings",
  "interpret-evidence",
  "surface-limitations",
  "report-sources",
] as const;

export type ResearchStage = (typeof researchStages)[number];

export interface ResearchRequest {
  question: string;
}

export interface ResearchPipelineResult {
  stages: ResearchStage[];
  answer: ResearchAnswer;
}

export function createEvidenceUnavailableResult(question: string): ResearchPipelineResult {
  return {
    stages: [...researchStages],
    answer: {
      question,
      status: "insufficient-evidence",
      finding: "Verified NASA evidence has not been connected to this build yet.",
      relevantEvidence: [],
      reasonableConclusion:
        "FREEZGROVER will not invent a scientific conclusion when the evidence layer is empty.",
      limitations: [
        "NASA source ingestion has not been completed.",
        "No experiment-level evidence is available for condition-aware comparison yet.",
      ],
      sourceIds: [],
    },
  };
}
