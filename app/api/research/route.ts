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
import {
  classifyConversationIntent,
  generateConversationalReply,
  generateGeneralConversationalReply,
  type ChatMessage,
} from "../../../lib/research-chat";
import { getSourceById } from "../../../lib/source-registry";
import type { EvidenceQuery } from "../../../lib/evidence-ranking";
import type { InterpretationAssessment } from "../../../lib/interpretation-gate";

interface ResearchBody {
  question?: unknown;
  query?: unknown;
  interpretationAssessment?: unknown;
  messages?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseMessages(value: unknown, question: string): ChatMessage[] {
  if (!Array.isArray(value)) return [{ role: "user", content: question }];

  const messages = value
    .filter(isRecord)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" as const : "user" as const,
      content: typeof item.content === "string" ? item.content.trim() : "",
    }))
    .filter((item) => item.content.length > 0)
    .slice(-12);

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || last.content !== question) {
    messages.push({ role: "user", content: question });
  }

  return messages;
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
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  const messages = parseMessages(body.messages, question);
  const conversationIntent = await classifyConversationIntent(messages);

  if (conversationIntent !== "research") {
    const conversationalReply = await generateGeneralConversationalReply(messages);
    return NextResponse.json({
      conversationIntent,
      understandingMode: "conversation",
      question,
      conversationalReply: conversationalReply ?? "I’m here. What would you like to talk about?",
      capabilities: null,
      evidenceQuery: null,
      sourceIds: [],
      sourceDetails: [],
      limitations: [],
    });
  }

  let interpretationAssessment = parseInterpretationAssessment(body.interpretationAssessment);
  let evidenceQuery = parseEvidenceQuery(body.query);
  let resolvedQuestion = question;
  let naturalClarification: string | undefined;
  let understandingMode: "model-assisted" | "caller-supplied" | "fallback" =
    interpretationAssessment || hasMeaningfulQuery(evidenceQuery) ? "caller-supplied" : "fallback";

  if (!interpretationAssessment || !hasMeaningfulQuery(evidenceQuery)) {
    const understood = await understandQuestion(question, messages);
    if (understood) {
      resolvedQuestion = understood.resolvedQuestion;
      naturalClarification = understood.clarificationQuestion;
      interpretationAssessment ??= understood.interpretationAssessment;
      if (!hasMeaningfulQuery(evidenceQuery)) evidenceQuery = understood.evidenceQuery;
      understandingMode = "model-assisted";
    }
  }

  const gateResult = runInterpretationGate(resolvedQuestion, interpretationAssessment);
  if (gateResult) {
    return NextResponse.json({
      ...gateResult,
      conversationIntent,
      understandingMode,
      question,
      resolvedQuestion,
      conversationalReply:
        naturalClarification ??
        gateResult.answer.clarificationQuestion ??
        "Could you clarify what you mean so I can use the right evidence?",
      sourceDetails: [],
    });
  }

  if (!evidenceQuery.topic) evidenceQuery.topic = resolvedQuestion;
  const retrieval = retrieveEvidence(evidenceQuery);

  if (retrieval.candidates.length === 0) {
    const unavailable = createEvidenceUnavailableResult(resolvedQuestion);
    return NextResponse.json({
      ...unavailable,
      conversationIntent,
      understandingMode,
      question,
      resolvedQuestion,
      evidenceQuery,
      conversationalReply:
        "I don’t have enough verified NASA evidence connected yet to answer that confidently. I can still tell you exactly what evidence is missing, or we can narrow the question to the closest supported comparison.",
      sourceDetails: [],
    });
  }

  const rankedEvidence = retrieval.candidates.slice(0, 6);
  const crossCheck = crossCheckEvidence(rankedEvidence);
  const summary = summarizeEvidence(rankedEvidence);
  const interpretations = rankedEvidence.map((item) => interpretFinding(item.finding));
  const safetyInsight = deriveSafetyInsight(rankedEvidence);

  const sourceIds = [...new Set(rankedEvidence.flatMap((item) => item.finding.sourceIds))];
  const sourceDetails = sourceIds
    .map((sourceId) => getSourceById(sourceId))
    .filter((source): source is NonNullable<ReturnType<typeof getSourceById>> => Boolean(source))
    .map((source) => ({
      id: source.id,
      title: source.title,
      url: source.url,
      organization: source.organization,
      year: source.year,
      sourceKind: source.sourceKind,
      locators: [
        ...new Set(
          rankedEvidence
            .filter((item) => item.finding.sourceIds.includes(source.id))
            .map((item) => item.finding.sourceLocator)
            .filter((locator): locator is string => Boolean(locator)),
        ),
      ],
      supports: rankedEvidence
        .filter((item) => item.finding.sourceIds.includes(source.id))
        .slice(0, 2)
        .map((item) => item.finding.statement),
    }));

  const limitations = [
    ...new Set([
      ...summary.limitations,
      ...crossCheck.cautions,
      ...safetyInsight.limitations,
    ]),
  ];

  const conversationalReply = await generateConversationalReply(messages, {
    question: resolvedQuestion,
    rankedEvidence,
    summary,
    interpretations,
    safetyInsight,
    crossCheck,
    sourceIds,
    limitations,
  });

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
      "conversational-response",
    ],
    conversationIntent,
    understandingMode,
    question,
    resolvedQuestion,
    evidenceQuery,
    conversationalReply:
      conversationalReply ??
      "I found relevant evidence, but I couldn’t turn it into a reliable conversational answer on this pass. The structured evidence is still available below.",
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
    sourceDetails,
  });
}
