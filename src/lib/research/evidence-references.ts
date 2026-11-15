import { findInvestigationById } from "./catalog";
import type { ConversationEvidence, ConversationDraft } from "./conversation";
import type { EvidenceField } from "@/types/answer";
import type { ResourceClaimKind } from "@/types/resources";

export type EvidenceReference = {
  id: string;
  text: string;
  title: string;
  studyTitle?: string;
  sourceType: string;
  locator: string;
  limitations?: string;
} & (
  | { kind: "psi"; recordId: string; field: EvidenceField }
  | {
      kind: "resource";
      sourceId: string;
      excerptId: string;
      claimType: ResourceClaimKind;
    }
);
export function buildEvidenceReferences(
  evidence: ConversationEvidence,
): EvidenceReference[] {
  const references: EvidenceReference[] = [];
  for (const record of evidence.records) {
    for (const field of [
      "objective",
      "approach",
      "measurements",
      "conditions",
      "table",
    ] as const) {
      if (record[field].trim().length >= 20)
        references.push({
          id: `psi:${record.id}:${field}`,
          kind: "psi",
          recordId: record.id,
          field,
          text: record[field],
          title: record.name,
          studyTitle: findInvestigationById(record.id)?.title,
          sourceType: "Experimental evidence · PSI metadata or table preview",
          locator: field,
        });
    }
  }
  for (const source of evidence.resources ?? []) {
    for (const excerpt of source.excerpts)
      references.push({
        id: `official:${source.id}:${excerpt.id}`,
        kind: "resource",
        sourceId: source.id,
        excerptId: excerpt.id,
        claimType: excerpt.kind,
        text: excerpt.text,
        title: source.title,
        sourceType: source.role,
        locator: excerpt.locator,
        limitations: source.limitations,
      });
  }
  return references;
}

export function resolveEvidenceReferences(
  paragraphs: { evidenceId: string; interpretation: string }[],
  references: EvidenceReference[],
  clarification: string | null,
): ConversationDraft {
  const result: ConversationDraft = {
    statements: [],
    resourceStatements: [],
    clarification,
  };
  for (const [index, paragraph] of paragraphs.entries()) {
    const reference = references.find(
      (item) => item.id === paragraph.evidenceId,
    );
    if (!reference) throw new Error("OPENAI_UNKNOWN_EVIDENCE_REFERENCE");
    // Quotations and source categories come from the inspected corpus, not from
    // a model's reconstruction. The prose still goes through independent QA.
    if (reference.kind === "psi")
      result.statements.push({
        recordId: reference.recordId,
        field: reference.field,
        quote: reference.text,
        interpretation: paragraph.interpretation,
        citationNumber: index + 1,
      });
    else
      result.resourceStatements!.push({
        sourceId: reference.sourceId,
        excerptId: reference.excerptId,
        claimType: reference.claimType,
        quote: reference.text,
        interpretation: paragraph.interpretation,
        citationNumber: index + 1,
      });
  }
  return result;
}
