import type { RankingAssessment } from "../ranking/assessment";
import { evidenceText } from "./grounding";
import type { ResearchAnswer, CitedStatement } from "@/types/answer";
import type {
  ResourceStatement,
  ScientificReviewRequest,
} from "@/types/resources";

export function answerReviewRequest(
  answer: ResearchAnswer & {
    reply?: string;
    audit?: import("@/types/conversation").ConversationAnswer["audit"];
  },
  selected?: CitedStatement | ResourceStatement,
): ScientificReviewRequest | undefined {
  const citation =
    selected ??
    [...answer.statements, ...(answer.resourceStatements ?? [])].sort(
      (a, b) => (a.citationNumber ?? Infinity) - (b.citationNumber ?? Infinity),
    )[0];
  if (!citation) return;
  // Carry the selected passage with its statement. Navigation must not replace
  // it with the first citation from another answer or a previous QA session.
  const context = {
    citations: [
      ...answer.statements,
      ...(answer.resourceStatements ?? []),
    ].sort(
      (a, b) => (a.citationNumber ?? Infinity) - (b.citationNumber ?? Infinity),
    ),
    audit: answer.audit,
    question: answer.query,
    answerText: answer.reply,
    statement: citation.interpretation,
    quote: citation.quote,
  };
  return "recordId" in citation
    ? { ...context, recordId: citation.recordId, field: citation.field }
    : {
        ...context,
        sourceId: citation.sourceId,
        excerptId: citation.excerptId,
      };
}

export function rankingReviewRequest(
  assessment: RankingAssessment,
): ScientificReviewRequest {
  return {
    recordId: assessment.recordId,
    field: "objective",
    quote: evidenceText(assessment.recordId, "objective"),
    question:
      assessment.question || `${assessment.goal} · ${assessment.environment}`,
    statement: assessment.reviewStatement,
    reviewContext: [
      `Assessment: ${assessment.version}. Goal: ${assessment.goal}. Environment: ${assessment.environment}.`,
      `${assessment.provenance.accession} v${assessment.provenance.version}; recorded metadata SHA-256: ${assessment.provenance.hash}`,
      ...assessment.dimensions.map(
        (dimension) =>
          dimension.label +
          ": " +
          dimension.status +
          ". " +
          [...dimension.basis, ...dimension.limits].join(" "),
      ),
      ...assessment.conflicts.map(
        (conflict) =>
          `${conflict.field} reports “${conflict.quote}”. Check the test subset and definition before resolving the difference.`,
      ),
      ...assessment.conditions.map(
        (condition) =>
          `${condition.label} (${condition.status}): ${condition.text}`,
      ),
    ].join("\n\n"),
  };
}
