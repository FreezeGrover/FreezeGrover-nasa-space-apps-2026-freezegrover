import type { ExperimentalConditions, Finding, RankedEvidence } from "./domain";

export interface ConditionDifference {
  field: keyof ExperimentalConditions;
  left: string | number | string[] | undefined;
  right: string | number | string[] | undefined;
  comparable: boolean;
  note: string;
}

export interface EvidenceComparison {
  leftFindingId: string;
  rightFindingId: string;
  sharedConditions: string[];
  differingConditions: ConditionDifference[];
  comparisonStatus: "directly-comparable" | "partially-comparable" | "not-directly-comparable";
  cautions: string[];
}

export interface CrossCheckResult {
  findingIds: string[];
  status: "consistent" | "mixed" | "insufficient-overlap";
  supporting: string[];
  differing: string[];
  cautions: string[];
}

const CONDITION_FIELDS: (keyof ExperimentalConditions)[] = [
  "gravity",
  "oxygenPercent",
  "pressureKPa",
  "airflowCmPerS",
  "material",
  "fuel",
  "thicknessMm",
  "geometry",
  "ignition",
];

function normalize(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(" | ").trim().toLowerCase();
  return String(value ?? "").trim().toLowerCase();
}

function valuesMatch(a: unknown, b: unknown): boolean {
  if (a === undefined || b === undefined) return false;
  if (typeof a === "number" && typeof b === "number") return a === b;
  return normalize(a) === normalize(b);
}

function fieldNote(field: keyof ExperimentalConditions, a: unknown, b: unknown): string {
  if (a === undefined || b === undefined) {
    return `${field} is not fully reported for both findings, so FREEZGROVER should not assume the conditions match.`;
  }

  if (valuesMatch(a, b)) {
    return `${field} matches across the two findings.`;
  }

  return `${field} differs and may affect whether the findings can be compared directly.`;
}

export function compareFindingConditions(
  left: Finding,
  right: Finding,
): EvidenceComparison {
  const sharedConditions: string[] = [];
  const differingConditions: ConditionDifference[] = [];
  let reportedPairs = 0;
  let matchedPairs = 0;

  for (const field of CONDITION_FIELDS) {
    const leftValue = left.conditions[field] as string | number | string[] | undefined;
    const rightValue = right.conditions[field] as string | number | string[] | undefined;

    if (leftValue !== undefined && rightValue !== undefined) {
      reportedPairs += 1;
      if (valuesMatch(leftValue, rightValue)) {
        matchedPairs += 1;
        sharedConditions.push(field);
      } else {
        differingConditions.push({
          field,
          left: leftValue,
          right: rightValue,
          comparable: true,
          note: fieldNote(field, leftValue, rightValue),
        });
      }
      continue;
    }

    if (leftValue !== undefined || rightValue !== undefined) {
      differingConditions.push({
        field,
        left: leftValue,
        right: rightValue,
        comparable: false,
        note: fieldNote(field, leftValue, rightValue),
      });
    }
  }

  const ratio = reportedPairs === 0 ? 0 : matchedPairs / reportedPairs;
  const hasCriticalDifference = differingConditions.some((item) =>
    ["gravity", "material", "oxygenPercent", "pressureKPa", "airflowCmPerS", "geometry"].includes(
      item.field,
    ),
  );

  let comparisonStatus: EvidenceComparison["comparisonStatus"] = "partially-comparable";
  if (reportedPairs === 0) comparisonStatus = "not-directly-comparable";
  else if (!hasCriticalDifference && ratio >= 0.75) comparisonStatus = "directly-comparable";
  else if (ratio < 0.35) comparisonStatus = "not-directly-comparable";

  const cautions: string[] = [];
  if (differingConditions.length > 0) {
    cautions.push(
      "Differences in experimental conditions must be kept visible; they should not be collapsed into a single causal explanation.",
    );
  }
  if (differingConditions.some((item) => !item.comparable)) {
    cautions.push(
      "At least one condition is only reported for one finding, so missing information must not be treated as a match.",
    );
  }

  return {
    leftFindingId: left.id,
    rightFindingId: right.id,
    sharedConditions,
    differingConditions,
    comparisonStatus,
    cautions,
  };
}

function statementsPointSameWay(a: Finding, b: Finding): boolean {
  const left = normalize(a.statement);
  const right = normalize(b.statement);

  const sharedTerms = left
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 5 && right.includes(term));

  return sharedTerms.length >= 2;
}

/**
 * Cross-check findings only after checking their experimental overlap.
 * A different result under different conditions is not automatically a
 * contradiction. FREEZGROVER should label it as differing evidence unless the
 * compared conditions are sufficiently aligned.
 */
export function crossCheckEvidence(evidence: RankedEvidence[]): CrossCheckResult {
  const findingIds = evidence.map((item) => item.finding.id);
  const supporting: string[] = [];
  const differing: string[] = [];
  const cautions: string[] = [];

  for (let i = 0; i < evidence.length; i += 1) {
    for (let j = i + 1; j < evidence.length; j += 1) {
      const left = evidence[i].finding;
      const right = evidence[j].finding;
      const comparison = compareFindingConditions(left, right);

      if (comparison.comparisonStatus === "not-directly-comparable") {
        differing.push(
          `${left.id} and ${right.id} should not be treated as direct confirmation or contradiction because their reported conditions do not overlap enough.`,
        );
        continue;
      }

      if (statementsPointSameWay(left, right)) {
        supporting.push(`${left.id} and ${right.id} provide mutually compatible evidence within their reported conditions.`);
      } else {
        differing.push(
          `${left.id} and ${right.id} report different outcomes or emphases; inspect condition differences before drawing a conclusion.`,
        );
      }
    }
  }

  if (evidence.length < 2) {
    cautions.push("Cross-checking requires at least two verified findings.");
  }

  const status: CrossCheckResult["status"] =
    evidence.length < 2
      ? "insufficient-overlap"
      : supporting.length > 0 && differing.length === 0
        ? "consistent"
        : supporting.length > 0 || differing.length > 0
          ? "mixed"
          : "insufficient-overlap";

  return {
    findingIds,
    status,
    supporting,
    differing,
    cautions,
  };
}
