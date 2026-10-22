import type { Finding, RankedEvidence } from "./domain";

export interface EvidenceSummary {
  findingCount: number;
  experimentIds: string[];
  statements: string[];
  limitations: string[];
}

export interface EvidenceInterpretation {
  observation: string;
  interpretation: string | null;
  limitations: string[];
  implication: string | null;
}

export interface SafetyInsightDraft {
  status: "supported" | "insufficient-evidence";
  statement?: string;
  basis: string[];
  limitations: string[];
}

/**
 * SUMMARIZE
 * Preserve experimental context instead of flattening findings into one claim.
 */
export function summarizeEvidence(evidence: RankedEvidence[]): EvidenceSummary {
  const experimentIds = [...new Set(evidence.map((item) => item.finding.experimentId))];

  return {
    findingCount: evidence.length,
    experimentIds,
    statements: evidence.map((item) => item.finding.statement),
    limitations: [
      ...new Set(evidence.flatMap((item) => item.finding.limitations ?? [])),
    ],
  };
}

/**
 * INTERPRET
 * Keep reported observation separate from any later interpretation or broader
 * implication. This baseline does not generate new scientific meaning on its
 * own; model-assisted interpretation will be added only with explicit evidence
 * grounding and source traceability.
 */
export function interpretFinding(finding: Finding): EvidenceInterpretation {
  return {
    observation: finding.statement,
    interpretation:
      finding.evidenceType === "author-interpretation" ||
      finding.evidenceType === "derived-interpretation"
        ? finding.statement
        : null,
    limitations: finding.limitations ?? [],
    implication: null,
  };
}

/**
 * SAFETY INSIGHTS
 * A safety insight must not be generated merely because a finding sounds
 * relevant to spacecraft safety. Until an explicitly supported safety statement
 * is present in the verified evidence set, return insufficient-evidence.
 */
export function deriveSafetyInsight(evidence: RankedEvidence[]): SafetyInsightDraft {
  const explicitSafetyEvidence = evidence.filter(
    (item) => item.finding.evidenceType === "safety-extrapolation",
  );

  if (explicitSafetyEvidence.length === 0) {
    return {
      status: "insufficient-evidence",
      basis: evidence.map((item) => item.finding.id),
      limitations: [
        "The current evidence set does not contain an explicitly supported safety extrapolation for this scope.",
        "Experimental findings must not be converted into operational safety guidance without supporting evidence.",
      ],
    };
  }

  return {
    status: "supported",
    statement: explicitSafetyEvidence.map((item) => item.finding.statement).join(" "),
    basis: explicitSafetyEvidence.map((item) => item.finding.id),
    limitations: [
      ...new Set(explicitSafetyEvidence.flatMap((item) => item.finding.limitations ?? [])),
    ],
  };
}
