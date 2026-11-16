import { checkConversationProvenance } from "../qa/conversation-provenance";
import { mentionedInvestigations } from "./identities";
import { investigations, findInvestigationById } from "./catalog";
import { retrieveInvestigations } from "./search";
import { describeMissionContext } from "./context";
import { evidenceText, validateGrounding } from "../qa/grounding";
import type { CitedStatement } from "@/types/answer";
import type {
  ConversationAnswer,
  ConversationInput,
  ResearchPhase,
} from "@/types/conversation";
import { retrieveNasaResources } from "../resources/catalog";
import { validateResourceStatements } from "../qa/resources";
import type { NasaResource, ResourceStatement } from "@/types/resources";

export interface ConversationDraft {
  statements: CitedStatement[];
  clarification: string | null;
  resourceStatements?: ResourceStatement[];
  reply?: string;
  audit?: ConversationAnswer["audit"];
}
export interface ConversationEvidence {
  reportProgress?: (phase: ResearchPhase) => void;
  missionContext: string;
  resources?: NasaResource[];
  records: {
    id: string;
    name: string;
    objective: string;
    approach: string;
    measurements: string;
    conditions: string;
    table: string;
  }[];
}
export type ConversationProvider = (
  input: ConversationInput,
  evidence: ConversationEvidence,
  signal?: AbortSignal,
) => Promise<ConversationDraft>;

export { mentionedInvestigations } from "./identities";

export function conversationRecords(input: ConversationInput): string[] {
  const explicit = mentionedInvestigations(input.message);
  const previous =
    [...input.history]
      .reverse()
      .find(
        (message) => message.role === "assistant" && message.recordIds.length,
      )?.recordIds ?? [];
  const contextual = input.context.recordIds.length
    ? input.context.recordIds
    : previous;
  const subject = input.message.replace(
    /\b(that|this|it|its|them|those|these|other|one|ones|matter|matters|selected)\b/gi,
    " ",
  );
  const retrieved = retrieveInvestigations(investigations, subject).map(
    (match) => match.item.id,
  );
  // Prior assistant text is conversational context, never scientific evidence.
  // Follow-ups like “Why does pressure matter?” still carry the earlier records.
  return [...new Set([...explicit, ...contextual, ...previous, ...retrieved])]
    .filter((id) => findInvestigationById(id))
    .slice(0, 8);
}

export async function converseResearch(
  input: ConversationInput,
  options: {
    provider?: ConversationProvider;
    signal?: AbortSignal;
    progress?: (phase: ResearchPhase) => void;
  },
): Promise<ConversationAnswer> {
  const progress = (phase: ResearchPhase) => {
    options.signal?.throwIfAborted();
    options.progress?.(phase);
  };
  progress("catalog");
  const recordIds = conversationRecords(input);
  const previousSources =
    [...input.history]
      .reverse()
      .find(
        (message) => message.role === "assistant" && message.sourceIds?.length,
      )?.sourceIds ?? [];
  const resources = retrieveNasaResources(input.message, recordIds, [
    ...(input.context.sourceIds ?? []),
    ...previousSources,
  ]);
  const base = {
    query: input.message,
    recordIds,
    statements: [],
    groundingIssues: [],
  } satisfies Omit<ConversationAnswer, "mode" | "notice">;
  progress("conditions");
  const evidence: ConversationEvidence = {
    reportProgress: progress,
    resources,
    missionContext: describeMissionContext(input.environment),
    records: recordIds.map((id) => {
      const item = findInvestigationById(id)!;
      return {
        id,
        name: item.name,
        objective: evidenceText(id, "objective").slice(0, 3200),
        approach: evidenceText(id, "approach").slice(0, 3200),
        measurements: item.measurements,
        conditions: item.conditions,
        table: evidenceText(id, "table").slice(0, 4800),
      };
    }),
  };
  if (!options.provider)
    return {
      ...base,
      sourceIds: resources.map((source) => source.id),
      mode: "catalog",
      notice:
        "AI is not configured. Local PSI matches and inspected official resources are available; no AI explanation was generated.",
    };
  progress("answer");
  const draft = await options.provider(input, evidence, options.signal);
  progress("grounding");
  // Recheck the model's prose against the original named fields. A previous
  // answer cannot license an invented quote, value or experiment identity.
  if (draft.reply && draft.audit) {
    const issues = checkConversationProvenance(draft);
    if (issues.length)
      return {
        ...base,
        mode: "unavailable",
        retryable: true,
        groundingIssues: issues,
        notice:
          "The answer did not retain its original source attribution or numerical evidence. You can retry; no partial conclusion was accepted.",
      };
    return {
      query: input.message,
      mode: "openai",
      reply: draft.reply,
      audit: draft.audit,
      recordIds: [
        ...new Set(draft.statements.map((statement) => statement.recordId)),
      ],
      sourceIds: [
        ...new Set(
          (draft.resourceStatements ?? []).map(
            (statement) => statement.sourceId,
          ),
        ),
      ],
      statements: draft.statements,
      resourceStatements: draft.resourceStatements ?? [],
      groundingIssues: [],
      notice:
        "Automated grounding review completed. Human scientific review remains available in Scientific QA.",
    };
  }
  const attributed = {
    statements: draft.statements,
    resourceStatements: [] as ResourceStatement[],
  };
  const { accepted, issues } = validateGrounding(attributed.statements);
  const scoped = accepted.filter((statement) =>
    recordIds.includes(statement.recordId),
  );
  const resourceChecks = validateResourceStatements(
    [...attributed.resourceStatements, ...(draft.resourceStatements ?? [])],
    resources.map((source) => source.id),
  );
  issues.push(...resourceChecks.issues);
  if (scoped.length !== accepted.length)
    issues.push(
      "A statement was withheld because its investigation was outside the supplied evidence context.",
    );
  const clarification = draft.clarification?.trim();
  return {
    query: input.message,
    mode: "openai",
    recordIds: [...new Set(scoped.map((statement) => statement.recordId))],
    statements: scoped,
    groundingIssues: issues,
    sourceIds: [
      ...new Set(
        resourceChecks.accepted.map((statement) => statement.sourceId),
      ),
    ],
    resourceStatements: resourceChecks.accepted,
    ...(clarification && clarification.endsWith("?") ? { clarification } : {}),
    notice:
      scoped.length || resourceChecks.accepted.length
        ? "AI interpretation · NASA quotes, numeric text and source roles checked. Scientific interpretation and experimental comparability still require independent review."
        : "The supplied NASA excerpts do not establish an answer to this question. No scientific conclusion has been verified.",
  };
}
