import { evidenceText } from "./grounding";
import { unsupportedNumericValues } from "./numbers";
import { unsupportedQuantities } from "./quantities";
import {
  findInvestigationById,
  getInvestigationEvidence,
} from "../research/catalog";
import { getExperimentMetadata } from "../research/metadata";
import { findNasaResource } from "../resources/catalog";
import type { ScientificReviewRequest } from "@/types/resources";
import type { ReviewCheck } from "./review";

export function reviewCitation(
  request: ScientificReviewRequest,
  statement = request.statement,
): ReviewCheck[] {
  const source = request.sourceId
      ? findNasaResource(request.sourceId)
      : undefined,
    record = request.recordId
      ? findInvestigationById(request.recordId)
      : undefined;
  const excerpt = source?.excerpts.find(
    (item) => item.id === request.excerptId,
  );
  const original = source
    ? (excerpt?.text ?? "")
    : record && request.field
      ? evidenceText(record.id, request.field)
      : "";
  const matched = Boolean(request.quote && original.includes(request.quote));
  let prose = statement;
  if (record) prose = prose.replaceAll(record.name, "");
  const unsupported = request.quote
    ? [
        ...unsupportedNumericValues(prose, request.quote),
        ...unsupportedQuantities(prose, request.quote),
      ]
    : [];
  const role = source?.role ?? "PSI investigation metadata and imported data";
  const conditions = record ? getExperimentMetadata(record.id) : undefined;
  // Finding the passage and preserving values are separate from deciding whether
  // the scientific interpretation follows. A positive source check is not approval.
  return [
    {
      title: "Source Grounding",
      question: "Does this statement point to the cited NASA passage?",
      status: matched ? "Passage found" : "Select a passage",
      detail: matched
        ? `The quoted passage matches ${source?.title ?? record?.name}. ${role}. This confirms attribution, not the interpretation.`
        : "No exact cited passage is selected or the quote no longer matches its named source. Choose a cited statement or inspect the original source.",
    },
    {
      title: "Experimental Conditions",
      question: "What conditions does this source actually establish?",
      status: source
        ? "Background context"
        : conditions
          ? "Conditions available"
          : "Needs context",
      detail: source
        ? `${role}: this passage supplies ${excerpt?.kind ?? "source"} context. It does not supply a matched experimental test by itself. ${source.limitations}`
        : record
          ? `${record.name}: ${record.conditions} Gravity: ${conditions?.gravity.join(", ")}. ${getInvestigationEvidence(record.id).tables.filter((table) => table.status === "downloaded").length} downloaded table(s) are available for checking individual tests.`
          : "Choose a source to examine its conditions.",
    },
    {
      title: "Uncertainty & Gaps",
      question: "What still needs scientific review?",
      status: unsupported.length
        ? "Values need checking"
        : "Interpretation needs review",
      detail: unsupported.length
        ? `Values or units not found in the selected passage: ${[...new Set(unsupported)].join(", ")}. Check the original data before using them.`
        : source
          ? "No unsupported numerical text was detected in this statement. Review whether the explanation follows from this passage; background information does not establish flame-spread rates, universal behavior or spacecraft safety limits."
          : "No unsupported numerical text was detected in this statement. Check the measurement definitions, comparison baseline and matched oxygen, pressure, airflow, material and geometry before generalizing.",
    },
    {
      title: "Independent Assessment",
      question: "Has this interpretation been independently approved?",
      status: "Human review needed",
      detail: request.audit
        ? "The original answer completed a separate automated grounding review. The selected statement still needs independent scientific review; editing it does not re-run that model review. No human approval is recorded."
        : "Source checks have been run for this selected passage. No human scientific approval is recorded. Saving a note keeps a draft; it does not approve the statement.",
    },
  ];
}
