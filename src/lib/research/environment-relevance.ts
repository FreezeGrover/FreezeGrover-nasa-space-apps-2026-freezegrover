import type { Environment, Investigation } from "@/types/research";
import { getExperimentMetadata } from "./metadata";

export function environmentRelevance(
  item: Investigation,
  environment: Environment,
) {
  const meta = getExperimentMetadata(item.id),
    reasons: string[] = [];
  if (environment === "All") return { priority: 0, reasons };
  let priority = 0;
  const atmosphere =
    environment === "Lunar Bases" ||
    environment === "Martian Bases" ||
    environment === "Pressurized Rovers";
  // These weights order research attention, not habitat suitability or safety.
  // Keep every matching record: absent lunar measurements are an evidence gap.
  if (meta.oxygenVariation) {
    priority += atmosphere ? 5 : 1;
    reasons.push("oxygen variation documented");
  }
  if (meta.pressureProtocol) {
    priority += atmosphere ? 4 : 1;
    reasons.push("pressure protocol available");
  }
  if (meta.fuelCategory === "solid") {
    priority += environment === "Spacecraft" ? 5 : 2;
    reasons.push("solid-material research");
  }
  if (meta.fuelCategory === "smoke") {
    priority +=
      environment === "Space Stations"
        ? 7
        : environment === "Spacecraft"
          ? 4
          : 1;
    reasons.push("smoke/detection research");
  }
  if (
    environment === "Pressurized Rovers" &&
    /flow|ventilat/i.test(meta.variations)
  ) {
    priority += 5;
    reasons.push("airflow variations documented");
  }
  if (
    environment === "Space Stations" &&
    meta.gravity.includes("microgravity")
  ) {
    priority += 3;
    reasons.push("microgravity flight context");
  }
  return { priority, reasons };
}
export function prioritizeForEnvironment(
  items: Investigation[],
  environment: Environment,
) {
  return items
    .map((item, index) => ({
      item,
      index,
      ...environmentRelevance(item, environment),
    }))
    .sort((a, b) => b.priority - a.priority || a.index - b.index)
    .map(({ item }) => item);
}
