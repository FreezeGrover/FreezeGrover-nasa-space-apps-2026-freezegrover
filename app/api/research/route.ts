import { NextResponse } from "next/server";
import {
  createEvidenceUnavailableResult,
  runInterpretationGate,
} from "../../../lib/research-pipeline";
import type { InterpretationAssessment } from "../../../lib/interpretation-gate";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const question = String(record.question ?? "").trim();

  if (!question) {
    return NextResponse.json({ error: "A scientific question is required." }, { status: 400 });
  }

  const interpretationAssessment =
    record.interpretationAssessment && typeof record.interpretationAssessment === "object"
      ? (record.interpretationAssessment as InterpretationAssessment)
      : undefined;

  const gateResult = runInterpretationGate(question, interpretationAssessment);
  if (gateResult) {
    return NextResponse.json(gateResult);
  }

  // Safe baseline: until the full retrieval/reasoning layer is connected,
  // FREEZGROVER refuses to fabricate evidence, citations, comparisons, or
  // safety conclusions.
  return NextResponse.json(createEvidenceUnavailableResult(question));
}
