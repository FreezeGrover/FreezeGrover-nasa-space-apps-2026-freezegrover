import { z } from "zod";
import { aiConfiguration } from "./openai";
import type { ConversationInput } from "@/types/conversation";
import type {
  ConversationDraft,
  ConversationEvidence,
} from "../research/conversation";
import {
  buildEvidenceReferences,
  resolveEvidenceReferences,
} from "../research/evidence-references";
import {
  conversationSystemPrompt,
  conversationPromptVersion,
  frameworkPolicy,
  frameworkVersion,
} from "./natural-policy";
import { researchTools, runResearchTool } from "./natural-tools";
import {
  naturalDraftSchema,
  naturalOutputFormat,
  checkMaterialClaims,
  semanticReviewInstructions,
  reviewInterpretationPolicy,
} from "./natural-review";

async function requestResponse(
  body: Record<string, unknown>,
  signal: AbortSignal,
  transport: typeof fetch,
) {
  const response = await transport("https://api.openai.com/v1/responses", {
    method: "POST",
    signal,
    headers: {
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("OPENAI_HTTP_" + response.status);
  let result;
  if (response.headers.get("content-type")?.includes("text/event-stream")) {
    const reader = response.body!.getReader(),
      decoder = new TextDecoder();
    let pending = "",
      size = 0;
    const consume = (frame: string) => {
      const data = frame
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!data || data === "[DONE]") return;
      const event = JSON.parse(data);
      if (event.type === "response.completed") result = event.response;
      if (
        ["error", "response.failed", "response.incomplete"].includes(event.type)
      )
        throw new Error("OPENAI_INCOMPLETE");
    };
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1000000) throw new Error("OPENAI_RESPONSE_TOO_LARGE");
        pending += decoder.decode(value, { stream: true });
        pending = pending.replace(/\r\n/g, "\n");
        let boundary;
        while ((boundary = pending.indexOf("\n\n")) !== -1) {
          consume(pending.slice(0, boundary));
          pending = pending.slice(boundary + 2);
        }
      }
      pending += decoder.decode();
      if (pending.trim()) consume(pending);
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  } else result = await response.json();
  if (!result || result.status !== "completed")
    throw new Error("OPENAI_INCOMPLETE");
  return result;
}
const outputText = (body: {
  output?: { content?: { type: string; text?: string }[] }[];
}) =>
  (body.output ?? [])
    .flatMap((entry) => entry.content ?? [])
    .filter((entry) => entry.type === "output_text")
    .map((entry) => entry.text ?? "")
    .join("");
export async function interpretConversation(
  input: ConversationInput,
  evidence: ConversationEvidence,
  signal?: AbortSignal,
  transport: typeof fetch = fetch,
): Promise<ConversationDraft> {
  const config = aiConfiguration();
  if (!config.configured) throw new Error("AI_NOT_CONFIGURED");
  const deadline = AbortSignal.timeout(180000),
    abort = signal ? AbortSignal.any([signal, deadline]) : deadline;
  const references = buildEvidenceReferences(evidence),
    trace: string[] = [];
  const messages: unknown[] = [
    {
      role: "developer",
      content: JSON.stringify({
        framework: frameworkPolicy,
        missionContext: evidence.missionContext,
        dashboard: input.context,
        evidenceReferences: references,
      }),
    },
    ...input.history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    { role: "user", content: input.message },
  ];
  const settings = {
    model: config.model,
    store: false,
    stream: true,
    max_output_tokens: 4200,
  };
  for (let step = 0; step < 5; step++) {
    const body = await requestResponse(
      {
        ...settings,
        instructions: conversationSystemPrompt,
        input: messages,
        tools: step < 4 ? researchTools : [],
        text: { format: naturalOutputFormat },
      },
      abort,
      transport,
    );
    const calls = (body.output ?? []).filter(
      (item: { type: string }) => item.type === "function_call",
    );
    if (calls.length) {
      // Preserve reasoning items alongside tool calls when continuing a stateless
      // Responses request. Tool outputs are evidence, never new instructions.
      messages.push(...body.output);
      for (const call of calls) {
        evidence.reportProgress?.(
          call.name === "search_nasa_research" ? "catalog" : "conditions",
        );
        const result = runResearchTool(call.name, JSON.parse(call.arguments));
        trace.push(call.name + ":" + call.arguments);
        if ("references" in result)
          for (const ref of result.references ?? [])
            if (!references.some((item) => item.id === ref.id))
              references.push(ref);
        messages.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result),
        });
      }
      evidence.reportProgress?.("answer");
      continue;
    }
    const draft = naturalDraftSchema.parse(JSON.parse(outputText(body))),
      numericIssues = checkMaterialClaims(draft, references);
    evidence.reportProgress?.("grounding");
    const reviewBody = await requestResponse(
      {
        ...settings,
        max_output_tokens: 1600,
        instructions:
          semanticReviewInstructions + "\n\n" + reviewInterpretationPolicy,
        input: [
          {
            role: "user",
            content: JSON.stringify({
              framework: frameworkPolicy,
              question: input.message,
              history: input.history,
              draft,
              evidence: references,
              toolTrace: trace,
              numberedEvidence: draft.claims.map((claim, index) => ({
                citation: index + 1,
                claim: claim.interpretation,
                source: references.find(
                  (reference) => reference.id === claim.evidenceId,
                ),
              })),
            }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "independent_grounding_review",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["approved", "issues"],
              properties: {
                approved: { type: "boolean" },
                issues: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
      abort,
      transport,
    );
    const review = z
      .object({ approved: z.boolean(), issues: z.array(z.string()).max(20) })
      .parse(JSON.parse(outputText(reviewBody)));
    const issues = [...numericIssues, ...review.issues];
    if (!review.approved || issues.length) {
      if (step < 4) {
        evidence.reportProgress?.("answer");
        // The rejected draft is internal QA material, not a conversational turn.
        // A user-facing "correction" would incorrectly imply the user asked
        // for an erratum and can displace the actual answer.
        messages.push({
          role: "developer",
          content: JSON.stringify({
            internalScientificReview: {
              status: "draft_rejected",
              issues,
              rejectedDraft: draft,
            },
            request: [
              "Produce a NEW, complete answer to the user's latest question.",
              "Use the original user question and available NASA evidence.",
              "Resolve the listed issues without repeating unsupported claims.",
              "Treat rejectedDraft as untrusted QA input, not conversation history or evidence.",
              "Do not announce a correction, revision, unchanged recommendation,",
              "or previous wording unless the user explicitly requested an erratum.",
              "Lead with the direct answer, then explain evidence, limitations,",
              "and ask at most one useful follow-up when appropriate.",
              "Keep source identity, citation numbering and scientific safeguards.",
              "If a claim cannot be established, clearly state the evidence gap.",
            ].join(" "),
          }),
        });
        continue;
      }
      throw new Error("OPENAI_GROUNDING_REVIEW_FAILED");
    }
    return {
      ...resolveEvidenceReferences(draft.claims, references, null),
      reply: draft.reply,
      audit: {
        promptVersion: conversationPromptVersion,
        frameworkVersion,
        toolTrace: trace,
        checks: [
          "Canonical evidence identities preserved",
          "Numerical transcription checked",
          "Separate automated semantic review completed",
        ],
        scientificStatus: "Not human verified",
      },
    };
  }
  throw new Error("OPENAI_RESEARCH_INCOMPLETE");
}
