import { NextResponse } from "next/server";
import { createEvidenceUnavailableResult } from "../../../lib/research-pipeline";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const question =
    typeof body === "object" && body !== null && "question" in body
      ? String((body as { question?: unknown }).question ?? "").trim()
      : "";

  if (!question) {
    return NextResponse.json({ error: "A scientific question is required." }, { status: 400 });
  }

  // Safe baseline: until verified NASA sources are ingested, the API refuses
  // to fabricate evidence, citations, comparisons, or safety conclusions.
  return NextResponse.json(createEvidenceUnavailableResult(question));
}
