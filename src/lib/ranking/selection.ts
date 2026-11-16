import { retrieveInvestigations } from "../research/search";
import { environmentRelevance } from "../research/environment-relevance";
import type {
  Investigation,
  ResearchGoal,
  Environment,
} from "@/types/research";
export function selectRankingCandidates(
  items: Investigation[],
  goal: ResearchGoal,
  environment: Environment,
  question = "",
) {
  const candidates = question.trim()
    ? items
    : items.filter((item) => item.goals.includes(goal));
  // An explicit question searches the full catalog so a missing goal tag cannot
  // hide an exact investigation. Goal and environment factors break ties. Confidence,
  // file counts and historical articles never inflate this ordering.
  return retrieveInvestigations(candidates, question)
    .map((match, index) => ({
      ...match,
      index,
      goalPriority: match.item.goals.includes(goal) ? 1 : 0,
      environmentPriority: environmentRelevance(match.item, environment)
        .priority,
    }))
    .sort(
      (a, b) =>
        (question.trim() ? b.relevance - a.relevance : 0) ||
        b.goalPriority - a.goalPriority ||
        b.environmentPriority - a.environmentPriority ||
        a.index - b.index,
    )
    .map((match) => match.item);
}
