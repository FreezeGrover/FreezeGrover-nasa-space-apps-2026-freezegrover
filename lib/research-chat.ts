import type { RankedEvidence } from "./domain";
import type { CrossCheckResult } from "./evidence-comparison";
import type {
  EvidenceSummary,
  EvidenceInterpretation,
  SafetyInsightDraft,
} from "./research-capabilities";

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

function recentInput(messages: ChatMessage[]) {
  return messages.slice(-12).map((message) => ({
    role: message.role,
    content: [{ type: "input_text", text: message.content }],
  }));
}

const INTENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    intent: { type: "string", enum: ["casual", "general", "research"] },
  },
  required: ["intent"],
};

const INTENT_INSTRUCTIONS = `Classify the user's latest conversational intent for FREEZGROVER.

Use the conversation context, not only isolated keywords.

Choose exactly one:
- casual: greetings, thanks, jokes, social conversation, small talk, conversational remarks, or questions about FREEZGROVER itself that do not require scientific evidence.
- general: a genuine question or task that is not about NASA microgravity combustion research and does not require FREEZGROVER's scientific evidence pipeline.
- research: a question, comparison, follow-up, clarification, or task about combustion, flames, fire safety, microgravity experiments, Saffire, NASA combustion evidence, experimental conditions, materials, oxygen, airflow, pressure, measurements, findings, or the current scientific research thread.

A short follow-up such as "what about Saffire III?" can be research because of conversation context. A greeting such as "hey, how are you?" is casual even though FREEZGROVER is a research assistant.

Do not answer the user. Return only the requested structured classification.`;

export async function classifyConversationIntent(messages: ChatMessage[]): Promise<ConversationIntent> {
  const { apiKey, model } = getApiConfig();
  if (!apiKey) return "research";

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
      input: recentInput(messages),
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

Talk like a capable assistant rather than a scientific report. You can greet the user, respond to thanks, hold ordinary conversation, explain ideas, ask relevant follow-up questions, and understand conversational context.

For this response, the system has already determined that the user is not asking for the NASA combustion evidence pipeline. Do not pretend to have retrieved scientific evidence. Do not force the conversation into a rigid research template.

Keep responses natural and proportionate to the user's message. A simple greeting deserves a simple greeting. A substantive general question deserves a useful answer.

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
      input: recentInput(messages),
    }),
  });

  if (!response.ok) {
    console.error("FREEZGROVER general conversation failed:", response.status, await response.text());
    return null;
  }

  return extractResponseText((await response.json()) as ResponsesApiResult);
}

const CHAT_INSTRUCTIONS = `You are FREEZGROVER, an intelligent conversational research assistant for NASA microgravity combustion evidence.

Speak naturally. You can chat, explain, ask follow-up questions, and adapt to what the researcher is trying to understand. Do not sound like a JSON report or a fixed template unless structure genuinely helps.

Scientific discipline:
- Base scientific claims only on the supplied verified evidence context.
- Never invent a NASA result, source, experimental condition, causal relationship, or safety recommendation.
- Distinguish direct observations from interpretation and broader implications.
- Keep important condition differences visible when they matter.
- If evidence is mixed, incomplete, or not directly comparable, say so plainly.
- A likely interpretation is not automatically certain.
- Do not turn an experimental result into operational safety guidance unless the supplied safety evidence explicitly supports it.
- Source IDs are traceability references. Mention the relevant source IDs naturally at the end of claims or in a short Sources section when useful.

Conversation behavior:
- Answer the user's actual question first.
- Be concise when the question is simple and more detailed when the question requires it.
- Understand follow-up questions in light of recent conversation.
- You may end with one genuinely useful follow-up question when that helps the research goal.
- Do not mechanically repeat every capability (summary, ranking, interpretation, safety insights) in every answer. Use them internally to produce a coherent response.
- If the available evidence cannot answer the question, say what is missing and suggest the most useful next research step.`;

export async function generateConversationalReply(
  messages: ChatMessage[],
  context: ConversationalResearchContext,
): Promise<string | null> {
  const { apiKey, model } = getApiConfig();
  if (!apiKey) return null;

  const evidencePacket = {
    question: context.question,
    summary: context.summary,
    rankedEvidence: context.rankedEvidence.slice(0, 6).map((item) => ({
      finding: item.finding,
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
  };

  const input = [
    ...recentInput(messages),
    {
      role: "user" as const,
      content: [
        {
          type: "input_text" as const,
          text: `Use the verified research context below to answer the latest user request conversationally.\n\nVERIFIED RESEARCH CONTEXT\n${JSON.stringify(evidencePacket, null, 2)}`,
        },
      ],
    },
  ];

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
      input,
    }),
  });

  if (!response.ok) {
    console.error("FREEZGROVER conversational response failed:", response.status, await response.text());
    return null;
  }

  return extractResponseText((await response.json()) as ResponsesApiResult);
}
