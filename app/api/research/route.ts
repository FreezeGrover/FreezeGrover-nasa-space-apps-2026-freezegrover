import { NextResponse } from "next/server";
import { retrieveEvidence } from "../../../lib/evidence-retrieval";
import { crossCheckEvidence } from "../../../lib/evidence-comparison";
import {
  summarizeEvidence,
  interpretFinding,
  deriveSafetyInsight,
} from "../../../lib/research-capabilities";
import {
  runInterpretationGate,
  createEvidenceUnavailableResult,
} from "../../../lib/research-pipeline";
import { understandQuestion } from "../../../lib/question-understanding";
import type { EvidenceQuery } from "../../../lib/evidence-ranking";
import type { InterpretationAssessment } from "../../../lib/interpretation-gate";

interface ResearchBody {
  question?: unknown;
  query?: unknown;
  interpretationAssessment?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseEvidenceQuery(value: unknown): EvidenceQuery {
  if (!isRecord(value)) return {};

  const query: EvidenceQuery = {};
  if (typeof value.topic === "string") query.topic = value.topic;
  if (typeof value.material === "string") query.material = value.material;
  if (typeof value.measurement === "string") query.measurement = value.measurement;

  if (isRecord(value.conditions)) {
    query.conditions = {
      gravity: typeof value.conditions.gravity === "string" ? value.conditions.gravity : undefined,
      material: typeof value.conditions.material === "string" ? value.conditions.material : undefined,
      fuel: typeof value.conditions.fuel === "string" ? value.conditions.fuel : undefined,
      geometry: typeof value.conditions.geometry === "string" ? value.conditions.geometry : undefined,
      ignition: typeof value.conditions.ignition === "string" ? value.conditions.ignition : undefined,
      oxygenPercent:
        typeof value.conditions.oxygenPercent === "number" ? value.conditions.oxygenPercent : undefined,
      pressureKPa:
        typeof value.conditions.pressureKPa === "number" ? value.conditions.pressureKPa : undefined,
      airflowCmPerS:
        typeof value.conditions.airflowCmPerS === "number" ? value.conditions.airflowCmPerS : undefined,
      thicknessMm:
        typeof value.conditions.thicknessMm === "number" ? value.conditions.thicknessMm : undefined,
    };
  }

  return query;
}

function parseInterpretationAssessment(value: unknown): InterpretationAssessment | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.question !== "string") return undefined;
  if (typeof value.materiallyDifferent !== "boolean") return undefined;
  if (!Array.isArray(value.interpretations)) return undefined;

  const interpretations = value.interpretations
    .filter(isRecord)
    .map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `interpretation-${index + 1}`,
      label: typeof item.label === "string" ? item.label : "",
      description: typeof item.description === "string" ? item.description : undefined,
    }))
    .filter((item) => item.label.trim().length > 0);

  return {
    question: value.question,
    materiallyDifferent: value.materiallyDifferent,
    interpretations,
  };
}

function hasMeaningfulQuery(query: EvidenceQuery): boolean {
  return Boolean(
    query.topic ||
      query.material ||
      query.measurement ||
      (query.conditions && Object.values(query.conditions).some((value) => value !== undefined)),
  );
}

export async function POST(request: Request) {
  let body: ResearchBody;

  try {
    body = (await request.json()) as ResearchBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";

  if (!question) {
    return NextResponse.json({ error: "A scientific question is required." }, { status: 400 });
  }

  let interpretationAssessment = parseInterpretationAssessment(body.interpretationAssessment);
  let evidenceQuery = parseEvidenceQuery(body.query);
  let understandingMode: "model-assisted" | "caller-supplied" | "fallback" =
    interpretationAssessment || hasMeaningfulQuery(evidenceQuery) ? "caller-supplied" : "fallback";

  // Automatically determine plausible scientific scopes and retrieval dimensions
  // when the caller has not already supplied them.
  if (!interpretationAssessment || !hasMeaningfulQuery(evidenceQuery)) {
    const understood = await understandQuestion(question);
    if (understood) {
      interpretationAssessment ??= understood.interpretationAssessment;
      if (!hasMeaningfulQuery(evidenceQuery)) evidenceQuery = understood.evidenceQuery;
      understandingMode = "model-assisted";
    }
  }

  // 1. Interpretation Gate: do not retrieve evidence until the intended scope
  // is sufficiently clear.
  const gateResult = runInterpretationGate(question, interpretationAssessment);
  if (gateResult) {
    return NextResponse.json({
      ...gateResult,
      understandingMode,
    });
  }

  // 2. Retrieve and rank verified evidence.
  if (!evidenceQuery.topic) evidenceQuery.topic = question;
  const retrieval = retrieveEvidence(evidenceQuery);

  if (retrieval.candidates.length === 0) {
    return NextResponse.json({
      ...createEvidenceUnavailableResult(question),
      understandingMode,
      evidenceQuery,
    });
  }

  // For this baseline, keep the evidence set intentionally small and inspectable.
  const rankedEvidence = retrieval.candidates.slice(0, 6);

  // 3. Compare/cross-check before synthesis.
  const crossCheck = crossCheckEvidence(rankedEvidence);

  // 4. Challenge capabilities.
  const summary = summarizeEvidence(rankedEvidence);
  const interpretations = rankedEvidence.map((item) => interpretFinding(item.finding));
  const safetyInsight = deriveSafetyInsight(rankedEvidence);

  const sourceIds = [...new Set(rankedEvidence.flatMap((item) => item.finding.sourceIds))];
  const limitations = [
    ...new Set([
      ...summary.limitations,
      ...crossCheck.cautions,
      ...safetyInsight.limitations,
    ]),
  ];

  return NextResponse.json({
    stages: [
      "understand-question",
      "interpretation-gate",
      "retrieve-nasa-evidence",
      "rank-evidence",
      "compare-conditions",
      "cross-check-findings",
      "summarize-evidence",
      "interpret-evidence",
      "derive-safety-insights",
      "surface-limitations",
      "report-sources",
    ],
    understandingMode,
    question,
    evidenceQuery,
    capabilities: {
      summarize: summary,
      rank: rankedEvidence,
      interpret: interpretations,
      safetyInsights: safetyInsight,
    },
    crossCheck,
    retrievalNotes: retrieval.notes,
    limitations,
    sourceIds,
  });
}
