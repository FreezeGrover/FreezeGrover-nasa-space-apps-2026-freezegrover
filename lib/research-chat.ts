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
- You may end with one genuinely useful follow-up question or an offer such as "Would you like me to compare Saffire-I and Saffire-III directly?" when that helps the research goal.
- Do not mechanically repeat every capability (summary, ranking, interpretation, safety insights) in every answer. Use them internally to produce a coherent response.
- If the available evidence cannot answer the question, say what is missing and suggest the most useful next research step.`;

export async function generateConversationalReply(
  messages: ChatMessage[],
  context: ConversationalResearchContext,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";
  const recentHistory = messages.slice(-10);

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
    ...recentHistory.map((message) => ({
      role: message.role,
      content: [{ type: "input_text", text: message.content }],
    })),
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
