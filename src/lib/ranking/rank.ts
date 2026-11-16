import { environmentRelevance } from "../research/environment-relevance";
import { getExperimentMetadata } from "../research/metadata";
import { getInvestigationEvidence } from "../research/catalog";
import { describeMissionContext } from "../research/context";
import type {
  Investigation,
  ResearchGoal,
  Environment,
} from "@/types/research";
export function findRelevantInvestigations(
  items: Investigation[],
  goal: ResearchGoal,
) {
  // Goal matches group the research; they are not numerical safety ratings.
  return items.filter((item) => item.goals.includes(goal));
}
export function explainRankingReason(
  item: Investigation,
  goal: ResearchGoal,
  environment: Environment,
) {
  // Explain the inclusion using the selected record, not a fixed stock answer.
  const meta = getExperimentMetadata(item.id),
    evidence = getInvestigationEvidence(item.id);
  const tables = evidence.tables.filter(
    (table) => table.status === "downloaded",
  );
  return (
    item.name +
    " covers " +
    (meta.topics.join(", ") || "unclassified combustion topics") +
    (item.goals.includes(goal)
      ? ". Relevant to " + goal.toLowerCase() + " by imported topic tags. "
      : ". This question matched the record, but the selected goal is not classified by its local topic tags. ") +
    tables.length +
    " downloaded table(s); hardware: " +
    (meta.hardware.join(", ") || "not imported") +
    ". " +
    (environment !== "All"
      ? "Priority factors: " +
        (environmentRelevance(item, environment).reasons.join(", ") ||
          "no additional matching factors") +
        ". "
      : "") +
    describeMissionContext(environment)
  );
}
