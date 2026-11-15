import snapshot from "@/data/psi-catalog.json";
import { retrieveInvestigations } from "./search";
import type { Investigation, PsiEvidenceRecord } from "@/types/research";
export const catalogSummary = snapshot.summary;
export const investigations: Investigation[] = snapshot.records.map(
  (record) => record.item as Investigation,
);
export function findInvestigationById(id: string) {
  return investigations.find((item) => item.id === id);
}
export function getInvestigationEvidence(id: string) {
  return snapshot.records.find((record) => record.item.id === id)!.evidence as PsiEvidenceRecord;
}
export function searchInvestigations(query: string) {
  return retrieveInvestigations(investigations, query).map(
    (match) => match.item,
  );
}
