export type Tab =
  "Overview" | "Investigations" | "Compare" | "Rankings" | "Scientific QA";
export type Environment =
  | "All"
  | "Spacecraft"
  | "Space Stations"
  | "Lunar Bases"
  | "Martian Bases"
  | "Pressurized Rovers";
export type ResearchGoal =
  | "Crew Safety"
  | "Predictive Models"
  | "Safety Equipment"
  | "Earth Applications";
export interface Investigation {
  id: string;
  name: string;
  title: string;
  purpose: string;
  fuel: string;
  conditions: string;
  facility: string;
  measurements: string;
  finding: string;
  limitation: string;
  source: string;
  sourceLabel: string;
  goals: ResearchGoal[];
}
