import { evidenceText } from "./grounding";
import { unsupportedNumericValues } from "./numbers";
import { unsupportedQuantities } from "./quantities";
import { findNasaResource } from "../resources/catalog";
import { findInvestigationById } from "../research/catalog";
import type { ConversationDraft } from "../research/conversation";
export function checkConversationProvenance(draft: ConversationDraft) {
  const issues: string[] = [];
  // Re-read originals at the orchestration boundary too: a replacement provider
  // cannot make its own quote or category authoritative by attaching an audit.
  for (const statement of draft.statements) {
    const original = evidenceText(statement.recordId, statement.field),
      record = findInvestigationById(statement.recordId);
    if (
      !record ||
      statement.quote.length < 20 ||
      !original.includes(statement.quote)
    ) {
      issues.push("A PSI citation did not match its original field.");
      continue;
    }
    const prose = statement.interpretation.replaceAll(record.name, "");
    if (
      unsupportedNumericValues(prose, statement.quote).length ||
      unsupportedQuantities(prose, statement.quote).length
    )
      issues.push("A PSI claim changed a value or unit.");
  }
  for (const statement of draft.resourceStatements ?? []) {
    const source = findNasaResource(statement.sourceId),
      excerpt = source?.excerpts.find(
        (item) => item.id === statement.excerptId,
      );
    if (
      !excerpt ||
      statement.quote.length < 20 ||
      !excerpt.text.includes(statement.quote) ||
      excerpt.kind !== statement.claimType
    ) {
      issues.push(
        "An official citation changed its source, quote or category.",
      );
      continue;
    }
    if (
      unsupportedNumericValues(statement.interpretation, statement.quote)
        .length ||
      unsupportedQuantities(statement.interpretation, statement.quote).length
    )
      issues.push("An official-source claim changed a value or unit.");
  }
  return issues;
}
