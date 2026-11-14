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
  const transfer =
    environment === "Lunar Bases" ||
    environment === "Martian Bases" ||
    environment === "Pressurized Rovers";
  return `${item.purpose} Selected for ${goal.toLowerCase()} by topic match.${transfer ? " Transfer to partial-gravity habitats requires separate validation." : " Applicability depends on the experimental conditions."}`;
}
