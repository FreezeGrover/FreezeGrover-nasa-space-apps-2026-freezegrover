import type { EvidenceLink, Experiment, Finding } from "./domain";
import { saffireExperiments, saffireFindings } from "./data/saffire";
import { getSourceById } from "./source-registry";

/**
 * Evidence is only added here after review against official NASA/NTRS source
 * material. This store is therefore intentionally conservative: unverified
 * summaries, inferred claims, and unsupported safety extrapolations stay out.
 */
export const experiments: Experiment[] = [...saffireExperiments];
export const findings: Finding[] = [...saffireFindings];
export const evidenceLinks: EvidenceLink[] = [];

export interface EvidenceValidationIssue {
  code:
    | "missing-source"
    | "unknown-source"
    | "missing-experiment"
    | "unsupported-evidence-type";
  message: string;
}

export function validateFinding(finding: Finding): EvidenceValidationIssue[] {
  const issues: EvidenceValidationIssue[] = [];

  if (finding.sourceIds.length === 0) {
    issues.push({
      code: "missing-source",
      message: `Finding ${finding.id} has no source provenance.`,
    });
  }

  for (const sourceId of finding.sourceIds) {
    if (!getSourceById(sourceId)) {
      issues.push({
        code: "unknown-source",
        message: `Finding ${finding.id} references unknown source ${sourceId}.`,
      });
    }
  }

  if (!experiments.some((experiment) => experiment.id === finding.experimentId)) {
    issues.push({
      code: "missing-experiment",
      message: `Finding ${finding.id} references unknown experiment ${finding.experimentId}.`,
    });
  }

  return issues;
}

export function getFindingsForExperiment(experimentId: string): Finding[] {
  return findings.filter((finding) => finding.experimentId === experimentId);
}

export function getLinksForFinding(findingId: string): EvidenceLink[] {
  return evidenceLinks.filter(
    (link) => link.fromFindingId === findingId || link.toFindingId === findingId,
  );
}
