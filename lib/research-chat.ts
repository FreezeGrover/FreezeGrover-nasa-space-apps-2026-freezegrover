import type { RankedEvidence } from "./domain";
import type { CrossCheckResult } from "./evidence-comparison";
import type {
  EvidenceSummary,
  EvidenceInterpretation,
  SafetyInsightDraft,
} from "./research-capabilities";
import { getSourceById } from "./source-registry";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type ConversationIntent = "casual" | "general" | "research";

export interface ConversationalResearchContext {
  question: string;
  rankedEvidence: RankedEvidence[];
  summary: EvidenceSummary;
  interpretations: EvidenceInterpretation[];
  safetyInsight: SafetyInsightDraft;
  crossCheck: CrossCheckResult;
  sourceIds: string[];
  limitations: string[];
}

interface ResponsesApiContentItem {
  type?: string;
  text?: string;
}

interface ResponsesApiOutputItem {
  content?: ResponsesApiContentItem[];
}

interface ResponsesApiResult {
  output_text?: string;
  output?: ResponsesApiOutputItem[];
}

function extractResponseText(result: ResponsesApiResult): string | null {
  if (typeof result.output_text === "string" && result.output_text.trim()) {
    return result.output_text.trim();
  }

  for (const item of result.output ?? []) {
    for (const content of item.content ?? []) {
      if ((content.type === "output_text" || content.type === "text") && typeof content.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  return null;
}

function getApiConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";
  return { apiKey, model };
}

function conversationTranscript(messages: ChatMessage[]): string {
  return messages
    .slice(-12)
    .map((message) => `${message.role === "assistant" ? "FREEZGROVER" : "USER"}: ${message.content}`)
    .join("\n\n");
}

const INTENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    intent: { type: "string", enum: ["casual", "general", "research"] },
  },
  required: ["intent"],
};

const INTENT_INSTRUCTIONS = `Classify the intent of the USER'S LATEST MESSAGE in a conversation with FREEZGROVER.

Use earlier turns only to understand context. Do not classify an earlier topic instead of the latest message.

Choose exactly one:
- casual: greetings, thanks, jokes, social conversation, small talk, conversational remarks, questions like how the assistant is doing, or questions about FREEZGROVER itself that do not require scientific evidence.
- general: a genuine question or task that is not about NASA microgravity combustion research and does not require FREEZGROVER's scientific evidence pipeline.
- research: a question, comparison, follow-up, clarification, or task about combustion, flames, fire safety, microgravity experiments, Saffire, NASA combustion evidence, experimental conditions, materials, oxygen, airflow, pressure, measurements, findings, or the current scientific research thread.

Important examples:
- "hey" -> casual
- "how are you doing?" -> casual
- "that's interesting, thanks" -> casual
- "what can you do?" -> casual
- "what is the capital of Spain?" -> general
- "how does airflow affect flame spread?" -> research
- after discussing Saffire, "what about Saffire III?" -> research

Do not answer the user. Return only the requested structured classification.`;

export async function classifyConversationIntent(messages: ChatMessage[]): Promise<ConversationIntent> {
  const { apiKey, model } = getApiConfig();
  if (!apiKey) return "research";

  const transcript = conversationTranscript(messages);
  const latest = messages[messages.length - 1]?.content ?? "";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      instructions: INTENT_INSTRUCTIONS,
      input: `CONVERSATION:\n${transcript}\n\nLATEST USER MESSAGE TO CLASSIFY:\n${latest}`,
      text: {
        format: {
          type: "json_schema",
          name: "freezegrover_conversation_intent",
          strict: true,
          schema: INTENT_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    console.error("FREEZGROVER intent classification failed:", response.status, await response.text());
    return "research";
  }

  const text = extractResponseText((await response.json()) as ResponsesApiResult);
  if (!text) return "research";

  try {
    const parsed = JSON.parse(text) as { intent?: unknown };
    if (parsed.intent === "casual" || parsed.intent === "general" || parsed.intent === "research") return parsed.intent;
  } catch {
    // Safe fallback keeps scientific questions on the evidence-grounded path.
  }

  return "research";
}

const GENERAL_CHAT_INSTRUCTIONS = `You are FREEZGROVER. You are intelligent, natural, warm, and conversational.

Talk like a capable assistant rather than a scientific report. You can greet the user, respond to thanks, hold ordinary conversation, explain ideas, ask relevant follow-up questions, and understand recent conversational context.

For this response, the system has already determined that the user's latest message does not need the NASA combustion evidence pipeline. Do not pretend to have retrieved scientific evidence. Do not force the conversation into a rigid research template.

Keep responses natural and proportionate to the user's latest message. A simple greeting deserves a simple greeting. A social question such as "how are you doing?" should receive a natural social response. A substantive general question deserves a useful answer.

Do not artificially redirect every casual message back to NASA research. Separate guardrails can add gentle research nudges later.`;

export async function generateGeneralConversationalReply(messages: ChatMessage[]): Promise<string | null> {
  const { apiKey, model } = getApiConfig();
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "medium" },
      instructions: GENERAL_CHAT_INSTRUCTIONS,
      input: `Continue this conversation naturally. Respond to the latest USER message.\n\n${conversationTranscript(messages)}`,
    }),
  });

  if (!response.ok) {
    console.error("FREEZGROVER general conversation failed:", response.status, await response.text());
    return null;
  }

  return extractResponseText((await response.json()) as ResponsesApiResult);
}

const CHAT_INSTRUCTIONS = `You are FREEZGROVER, an intelligent conversational research assistant for NASA microgravity combustion evidence.

Your voice should feel like a knowledgeable researcher talking with another person, not like a database, compliance report, or templated scientific summary. The evidence engine is underneath the conversation; do not make the user feel as though they are reading its internal output.

Scientific discipline:
- Base scientific claims only on the supplied verified evidence context.
- Never invent a NASA result, source, experimental condition, causal relationship, or safety recommendation.
- Distinguish direct observations from interpretation and broader implications.
- Keep important condition differences visible when they matter.
- If evidence is mixed, incomplete, or not directly comparable, say so plainly.
- A likely interpretation is not automatically certain.
- Do not turn an experimental result into operational safety guidance unless the supplied safety evidence explicitly supports it.

Natural answer style:
- Begin with the answer or main scientific point in ordinary conversational language.
- Let the wording emerge naturally from the specific question and evidence. Do not imitate a stock phrase, canned transition, or repeated rhetorical pattern.
- Do not use a memorized set of transitions. Vary the way ideas connect according to what the reasoning actually requires.
- Vary sentence structure and response shape according to the question. Do not force every answer into the same sequence of finding, evidence, limitation, conclusion.
- Use paragraphs by default. Use bullets only when they genuinely make several distinct items easier to compare or scan.
- Avoid report-like labels such as "What is documented", "Observation", "Interpretation", "Conclusion", or "Limitations" unless the user asks for a structured analysis or those headings materially improve a complex answer.
- Prefer clear human wording over formal or procedural language when both are equally accurate.
- Preserve scientific precision while using contractions and natural phrasing where appropriate.
- If the answer has an important limitation, weave it into the explanation where it becomes relevant instead of attaching a generic disclaimer.
- When evidence is insufficient, explain why the evidence cannot support a stronger conclusion and what additional evidence would resolve the question.
- Do not pad the ending with a generic recap if the point is already clear.

Sources and traceability:
- Do not finish with a bare list of internal source IDs.
- If sources are useful for the answer, introduce them naturally with wording such as "Sources used" or another context-appropriate phrase; do not use the same phrase mechanically every time.
- Prefer the human-readable source title over the internal ID. The ID may appear secondarily for traceability.
- For each source, briefly state what part of the answer it supports.
- When a source locator is supplied with a finding, include that locator so the user can see where in the source the evidence comes from.
- If no page, section, table, figure, or other locator is supplied, do not invent one and do not imply that an exact location was verified.
- Include the source URL when available so the researcher can open the original NASA/NTRS source.
- Keep the source section compact enough that it supports the conversation rather than overwhelming it.

Conversation behavior:
- Answer the user's actual latest question first.
- Be concise when the question is simple and more detailed when the question requires it.
- Understand follow-up questions in light of recent conversation.
- You may end with one genuinely useful follow-up question when that helps the research goal, but do not add one automatically.
- Do not mechanically repeat every capability (summary, ranking, interpretation, safety insights) in every answer. Use them internally to produce a coherent response.
- If the available evidence cannot answer the question, say what is missing and suggest the most useful next research step naturally.`;

export async function generateConversationalReply(
  messages: ChatMessage[],
  context: ConversationalResearchContext,
): Promise<string | null> {
  const { apiKey, model } = getApiConfig();
  if (!apiKey) return null;

  const sourceDetails = context.sourceIds
    .map((sourceId) => getSourceById(sourceId))
    .filter((source): source is NonNullable<ReturnType<typeof getSourceById>> => Boolean(source))
    .map((source) => ({
      id: source.id,
      title: source.title,
      url: source.url,
      organization: source.organization,
      year: source.year,
      sourceKind: source.sourceKind,
    }));

  const evidencePacket = {
    question: context.question,
    summary: context.summary,
    rankedEvidence: context.rankedEvidence.slice(0, 6).map((item) => ({
      finding: item.finding,
      sourceLocator: item.finding.sourceLocator,
      whyRanked: item.whyRanked,
      conditionMatch: item.conditionMatch,
      materialMatch: item.materialMatch,
      measurementRelevance: item.measurementRelevance,
      evidenceStrength: item.evidenceStrength,
    })),
    interpretations: context.interpretations,
    crossCheck: context.crossCheck,
    safetyInsight: context.safetyInsight,
    limitations: context.limitations,
    sourceIds: context.sourceIds,
    sourceDetails,
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "medium" },
      instructions: CHAT_INSTRUCTIONS,
      input: `CONVERSATION:\n${conversationTranscript(messages)}\n\nVERIFIED RESEARCH CONTEXT:\n${JSON.stringify(evidencePacket, null, 2)}\n\nRespond conversationally to the latest USER message using only the verified scientific context for scientific claims.`,
    }),
  });

  if (!response.ok) {
    console.error("FREEZGROVER conversational response failed:", response.status, await response.text());
    return null;
  }

  return extractResponseText((await response.json()) as ResponsesApiResult);
}
