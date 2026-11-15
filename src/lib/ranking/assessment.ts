import {
  findInvestigationById,
  getInvestigationEvidence,
} from "../research/catalog";
import { getExperimentMetadata } from "../research/metadata";
import { environmentRelevance } from "../research/environment-relevance";
import { describeMissionContext } from "../research/context";
import { retrieveInvestigations } from "../research/search";
import type {
  Environment,
  ResearchGoal,
  Investigation,
  PsiEvidenceRecord,
  ExperimentMetadata,
} from "@/types/research";

export const rankingAssessmentVersion = "ranking-assessment-1.0.0";
export interface AssessmentDimension {
  label: string;
  status: string;
  basis: string[];
  limits: string[];
  principles: number[];
}
export interface RankingAssessment {
  recordId: string;
  goal: ResearchGoal;
  environment: Environment;
  question: string;
  version: string;
  dimensions: AssessmentDimension[];
  conflicts: { field: string; quote: string; unit: string; range: string }[];
  conditions: {
    label: string;
    status: "Documented" | "Not identified";
    text: string;
  }[];
  provenance: {
    accession: string;
    version: number;
    url: string;
    retrievedAt: string;
    hash: string;
    tables: {
      name: string;
      url: string;
      localUrl?: string;
      sha256?: string;
      rows?: number;
      columns: string[];
    }[];
  };
  nextSteps: string[];
  reviewStatement: string;
}
const known = (value: string | null | undefined) =>
  Boolean(
    value?.trim() &&
    !/not (?:specified|identified|reported|imported|available)|unknown|unclassified|none imported/i.test(
      value,
    ),
  );

export function pressureRangeDifferences(
  fields: { field: string; text: string }[],
) {
  const found: { field: string; quote: string; unit: string; range: string }[] =
    [];
  // Only compare explicitly labelled pressure ranges in the same unit. Different
  // ranges may be test subsets; report a question for QA, not a contradiction.
  const pattern =
    /(?<![\w.])([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*(atm|kPa|MPa|psi|mmHg|bar)?\s*(?:to|through|[−–-])\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*(atm|kPa|MPa|psi|mmHg|bar)\b/gi;
  for (const { field, text } of fields)
    for (const match of text.matchAll(pattern)) {
      const unit = match[4].toLowerCase();
      if (match[2] && match[2].toLowerCase() !== unit) continue;
      const range = Number(match[1]) + "…" + Number(match[3]);
      if (
        !found.some(
          (item) =>
            item.field === field && item.range === range && item.unit === unit,
        )
      )
        found.push({ field, quote: match[0], unit, range });
    }
  return found.filter(
    (item) =>
      new Set(
        found
          .filter((other) => other.unit === item.unit)
          .map((other) => other.range),
      ).size > 1,
  );
}

export function assessEvidence(input: {
  item: Investigation;
  evidence: PsiEvidenceRecord;
  metadata: ExperimentMetadata;
  goal: ResearchGoal;
  environment: Environment;
  question?: string;
}): RankingAssessment {
  const { item, evidence, metadata, goal, environment } = input,
    question = input.question?.trim() ?? "";
  const tables = evidence.tables.filter(
      (table) => table.status === "downloaded",
    ),
    factor = environmentRelevance(item, environment);
  const match = question
    ? retrieveInvestigations([item], question)[0]
    : undefined;
  const conditions: RankingAssessment["conditions"] = [
    {
      label: "Fuel/material",
      status: known(item.fuel) ? "Documented" : "Not identified",
      text: item.fuel,
    },
    {
      label: "Geometry",
      status: known(metadata.geometry) ? "Documented" : "Not identified",
      text: metadata.geometry,
    },
    {
      label: "Oxygen",
      status: metadata.oxygenVariation ? "Documented" : "Not identified",
      text: metadata.oxygenVariation
        ? "Oxygen variation is described; per-test composition and dilution still require inspection."
        : "No oxygen variation identified by the imported metadata; this is not proof oxygen was uncontrolled.",
    },
    {
      label: "Pressure",
      status: known(metadata.pressureProtocol)
        ? "Documented"
        : "Not identified",
      text:
        metadata.pressureProtocol ??
        "No pressure protocol identified in imported narrative.",
    },
    {
      label: "Airflow",
      status: /flow|ventilat/i.test(metadata.variations)
        ? "Documented"
        : "Not identified",
      text: metadata.variations,
    },
    {
      label: "Sensors/measurements",
      status: known(metadata.sensors) ? "Documented" : "Not identified",
      text: metadata.sensors,
    },
  ];
  const missing = conditions
    .filter((condition) => condition.status === "Not identified")
    .map((condition) => condition.label);
  const conflicts = pressureRangeDifferences([
    { field: "NASA objective", text: evidence.objective },
    { field: "NASA approach", text: evidence.approach },
  ]);
  const unclearUnits = tables.flatMap((table) =>
    (table.columns ?? []).filter(
      (column) =>
        /pressure|oxygen|velocity|diameter|temperature/i.test(column) &&
        !/mmhg|\batm\b|\bkpa\b|\bmpa\b|\bpsi\b|\bbar\b|mole fraction|%|cm\/s|mm\/s|m\/s|;\s*(?:mm|cm|m|k|c)\b|°/i.test(
          column,
        ),
    ),
  );
  const criticalGaps = [
    ...(!/^[a-f0-9]{64}$/i.test(evidence.recordSha256)
      ? ["Original metadata snapshot hash is missing or malformed."]
      : []),
    ...(tables.some(
      (table) => !table.localUrl || !table.columns?.length || !table.sha256,
    )
      ? [
          "A downloaded-table entry has incomplete provenance or column context.",
        ]
      : []),
    ...(!tables.length
      ? ["No experimental table downloaded for this record."]
      : []),
    ...(missing.length
      ? [
          "Conditions not identified in imported context: " +
            missing.join(", ") +
            ".",
        ]
      : []),
    ...(unclearUnits.length
      ? [
          "Units or concentration basis need documentation for headers: " +
            [...new Set(unclearUnits)].join("; ") +
            ".",
        ]
      : []),
    ...(conflicts.length
      ? [
          "Different pressure ranges appear across source fields; resolve whether they describe different test subsets.",
        ]
      : []),
  ];
  const dimension = (
    label: string,
    status: string,
    basis: string[],
    limits: string[],
    principles: number[],
  ): AssessmentDimension => ({ label, status, basis, limits, principles });
  const dimensions = [
    dimension(
      "Research relevance",
      question
        ? match
          ? "Question topic match"
          : "No question match identified"
        : "Goal topic match",
      [
        item.goals.includes(goal)
          ? "Imported goal tag matches: " + goal + "."
          : "Selected goal is not classified by this record’s local topic tags; assess the question-to-goal relationship separately.",
        ...(match?.reasons ?? []),
        ...factor.reasons,
      ],
      [
        (question ? "Lexical question matching" : "Goal tags") +
          " orders research attention; it does not measure evidence quality.",
      ],
      [1, 6, 10],
    ),
    dimension(
      "Evidence quality",
      tables.length
        ? "Data available; quality unassessed"
        : "Narrative only in local coverage",
      [
        "Original PSI metadata and " +
          tables.length +
          " downloaded table(s) available.",
        "Methods context: " +
          (known(evidence.approach)
            ? "approach text available"
            : "approach text missing") +
          ". Findings status: " +
          evidence.findingsStatus +
          ".",
      ],
      [
        "Download availability is not evidence of reproducibility, calibration, completeness or independent replication.",
        ...(!known(evidence.approach)
          ? ["Obtain full methods before interpreting results."]
          : []),
      ],
      [7, 9, 10, 18],
    ),
    dimension(
      "Conclusion confidence",
      criticalGaps.length
        ? "Withheld — material gaps"
        : "Not established — review required",
      [
        "Provenance is recorded separately from confidence in an interpretation.",
      ],
      [
        ...(criticalGaps.length
          ? [
              "Resolve the material gaps listed under Uncertainty and conflicts before relying on a conclusion.",
            ]
          : []),
        "No calibrated uncertainty, independent scientific approval or validated spacecraft safety conclusion is recorded.",
      ],
      [9, 10, 11, 12, 18, 20],
    ),
    dimension(
      "Applicability",
      environment === "All"
        ? "Environment not specified"
        : /Lunar|Martian/.test(environment)
          ? "Partial-gravity transfer unvalidated"
          : environment === "Pressurized Rovers"
            ? "Destination and enclosure matching required"
            : !metadata.gravity.includes("microgravity")
              ? "Ground/modeling transfer unvalidated"
              : "Condition matching required",
      [
        describeMissionContext(environment),
        "Imported gravity classification: " + metadata.gravity.join(", ") + ".",
      ],
      [
        metadata.gravityGap,
        "Match material, sample geometry, oxygen, pressure, airflow, ignition source and apparatus before transferring findings.",
      ],
      [1, 2, 3, 8, 12, 17],
    ),
    dimension(
      "Uncertainty and conflicts",
      conflicts.length
        ? "Potential condition mismatch"
        : criticalGaps.length
          ? "Evidence gaps identified"
          : "No automatic mismatch flagged",
      [...criticalGaps],
      [
        conflicts.length
          ? "Different reported ranges can both be valid; examine original methods and test subsets."
          : "This check is not a full-text or cross-study conflict review.",
        item.limitation.replace(
          /\bambiguous units\b/gi,
          "units with multiple plausible interpretations",
        ),
      ],
      [3, 4, 7, 8, 11, 12],
    ),
    dimension(
      "Hazard severity",
      "Not assessed",
      ["Research focus: " + metadata.topics.join(", ") + "."],
      [
        "Study relevance and laboratory burning do not establish operational consequence severity. Define material, enclosure, exposure, escape constraints and credible scenarios first.",
      ],
      [2, 14, 15, 17],
    ),
    dimension(
      "Hazard likelihood",
      "Not estimated",
      [],
      [
        "No operational event-frequency or exposure model is assessed. A laboratory demonstration cannot supply a spacecraft fire probability.",
      ],
      [3, 9, 15],
    ),
    dimension(
      "Prediction readiness",
      goal === "Predictive Models"
        ? "Not ready for validated prediction"
        : "Validation not assessed",
      [
        tables.length
          ? "Source tables may support data extraction after units and conditions are checked."
          : "Only imported narrative is available locally.",
      ],
      [
        ...(criticalGaps.length
          ? [
              "Resolve the reported condition and unit gaps before fitting a model.",
            ]
          : []),
        "A study's model-development objective is not model validation. Select a justified model, establish comparability, distinguish interpolation/extrapolation, validate on independent data and quantify uncertainty.",
      ],
      [7, 8, 9, 16],
    ),
    dimension(
      "Safety applications",
      "Research candidate",
      ["Goal context: " + goal + "."],
      [
        "Separate observed findings, research possibilities and qualified applications. No experiment-to-product lineage, equipment effectiveness or spacecraft operating change is inferred from shared topics.",
      ],
      [2, 8, 14, 17],
    ),
    dimension(
      "Independent review",
      "Scientific QA pending",
      [
        "This deterministic evidence assessment is separate from relevance ordering.",
      ],
      [
        "Use independent cross-checks, communicate gaps, challenge assumptions and escalate unresolved interpretation. Research triage does not replace approved crew or mission-control procedures.",
      ],
      [14, 18, 20],
    ),
  ];
  return {
    recordId: item.id,
    goal,
    environment,
    question,
    version: rankingAssessmentVersion,
    dimensions,
    conflicts,
    conditions,
    provenance: {
      accession: evidence.accession,
      version: evidence.version,
      url: item.source,
      retrievedAt: evidence.retrievedAt,
      hash: evidence.recordSha256,
      tables: tables.map((table) => ({
        name: table.name,
        url: table.url,
        localUrl: table.localUrl,
        sha256: table.sha256,
        rows: table.rows,
        columns: table.columns ?? [],
      })),
    },
    nextSteps: [
      ...criticalGaps,
      "Inspect the original source beyond the excerpt, including methods and limitations.",
      "Compare matched conditions and measurement definitions before combining studies.",
      "Request independent Scientific QA; recheck affected rankings after a correction.",
    ],
    reviewStatement: `Assess whether ${item.name} supports ${goal.toLowerCase()} for ${environment === "All" ? "a specified habitable environment" : environment}. Its relevance is based on imported research metadata; confidence in a safety or prediction conclusion is not established.`,
  };
}
export function assessRankingCandidate(
  recordId: string,
  goal: ResearchGoal,
  environment: Environment,
  question = "",
) {
  const item = findInvestigationById(recordId);
  if (!item) throw new Error("Unknown investigation");
  return assessEvidence({
    item,
    evidence: getInvestigationEvidence(recordId),
    metadata: getExperimentMetadata(recordId),
    goal,
    environment,
    question,
  });
}
