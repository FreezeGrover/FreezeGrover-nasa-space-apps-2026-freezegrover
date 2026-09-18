import type { Finding, RankedEvidence } from "./domain";
import { findings } from "./evidence-store";
import { rankEvidence, type EvidenceQuery } from "./evidence-ranking";

export interface RetrievalResult {
  query: EvidenceQuery;
  candidates: RankedEvidence[];
  totalAvailableFindings: number;
  notes: string[];
}

/**
 * Evidence retrieval happens only after the Interpretation Gate has allowed the
 * research pipeline to continue.
 *
 * This baseline retrieves from the structured, verified evidence store and then
 * applies condition-aware ranking. Semantic retrieval can be added later, but it
 * must never bypass provenance, condition matching, or evidence-type checks.
 */
export function retrieveEvidence(
  query: EvidenceQuery,
  sourceFindings: Finding[] = findings,
): RetrievalResult {
  const ranked = rankEvidence(sourceFindings, query);

  return {
    query,
    candidates: ranked,
    totalAvailableFindings: sourceFindings.length,
    notes: [
      "Candidates come only from verified structured findings currently connected to FREEZGROVER.",
      "Ranking is condition-aware and evidence-aware; semantic topic retrieval is not yet active.",
      "A high rank indicates relevance to the requested scope, not proof of a causal relationship.",
    ],
  };
}
