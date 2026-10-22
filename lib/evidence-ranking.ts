import type { ExperimentalConditions, Finding, RankedEvidence } from "./domain";

export interface EvidenceQuery {
  topic?: string;
  material?: string;
  measurement?: string;
  conditions?: ExperimentalConditions;
}

function exactTextMatch(a?: string, b?: string): number {
  if (!a || !b) return 0.5;
  return a.trim().toLowerCase() === b.trim().toLowerCase() ? 1 : 0;
}

function numericCloseness(a?: number, b?: number, tolerance = 1): number {
  if (a === undefined || b === undefined) return 0.5;
  const distance = Math.abs(a - b);
  return Math.max(0, 1 - distance / Math.max(tolerance, Math.abs(b) || 1));
}

export function scoreConditionMatch(
  findingConditions: ExperimentalConditions,
  queryConditions: ExperimentalConditions = {},
): number {
  const scores = [
    exactTextMatch(findingConditions.gravity, queryConditions.gravity),
    exactTextMatch(findingConditions.material, queryConditions.material),
    exactTextMatch(findingConditions.fuel, queryConditions.fuel),
    exactTextMatch(findingConditions.geometry, queryConditions.geometry),
    numericCloseness(findingConditions.oxygenPercent, queryConditions.oxygenPercent, 5),
    numericCloseness(findingConditions.pressureKPa, queryConditions.pressureKPa, 20),
    numericCloseness(findingConditions.airflowCmPerS, queryConditions.airflowCmPerS, 10),
    numericCloseness(findingConditions.thicknessMm, queryConditions.thicknessMm, 2),
  ];

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function scoreEvidenceStrength(finding: Finding): number {
  switch (finding.evidenceType) {
    case "direct-observation":
      return 1;
    case "reported-result":
      return 0.9;
    case "author-interpretation":
      return 0.7;
    case "derived-interpretation":
      return 0.5;
    case "safety-extrapolation":
      return 0.3;
  }
}

export function rankFinding(finding: Finding, query: EvidenceQuery): RankedEvidence {
  const conditionMatch = scoreConditionMatch(finding.conditions, query.conditions);
  const materialMatch = exactTextMatch(finding.conditions.material, query.material ?? query.conditions?.material);
  const measurementRelevance = exactTextMatch(finding.measurement, query.measurement);
  const evidenceStrength = scoreEvidenceStrength(finding);

  // Topic relevance remains neutral until semantic retrieval is connected.
  const experimentRelevance = query.topic ? 0.5 : 0.5;

  const whyRanked: string[] = [
    `Condition match: ${conditionMatch.toFixed(2)}`,
    `Material match: ${materialMatch.toFixed(2)}`,
    `Measurement relevance: ${measurementRelevance.toFixed(2)}`,
    `Evidence strength: ${evidenceStrength.toFixed(2)}`,
  ];

  return {
    finding,
    conditionMatch,
    experimentRelevance,
    materialMatch,
    measurementRelevance,
    evidenceStrength,
    whyRanked,
  };
}

export function rankEvidence(findings: Finding[], query: EvidenceQuery): RankedEvidence[] {
  return findings
    .map((finding) => rankFinding(finding, query))
    .sort((a, b) => {
      const scoreA =
        a.conditionMatch * 0.35 +
        a.experimentRelevance * 0.2 +
        a.materialMatch * 0.15 +
        a.measurementRelevance * 0.15 +
        a.evidenceStrength * 0.15;
      const scoreB =
        b.conditionMatch * 0.35 +
        b.experimentRelevance * 0.2 +
        b.materialMatch * 0.15 +
        b.measurementRelevance * 0.15 +
        b.evidenceStrength * 0.15;

      return scoreB - scoreA;
    });
}
