import { retrieveInvestigations } from "./search";
import type { Investigation } from "@/types/research";
// These are short, curated descriptions from NASA's public pages, not a live feed.
// Missing test-level data stays missing until the original files are imported.
const nasaOverview =
  "https://www.nasa.gov/missions/station/studying-combustion-and-fire-safety/";
export const investigations: Investigation[] = [
  {
    id: "flex",
    name: "FLEX",
    title: "Flame Extinguishment Experiment",
    purpose:
      "Assess the effectiveness of gaseous fire suppressants in microgravity.",
    fuel: "Liquid-fuel droplets",
    conditions:
      "Microgravity. Test-by-test oxygen, pressure, and airflow: not imported.",
    facility:
      "Multi-user Droplet Combustion Apparatus in the Combustion Integrated Rack",
    measurements:
      "Droplet burning and extinction; detailed measurements not imported.",
    finding:
      "NASA reports that FLEX led to the discovery of cool flames under certain conditions.",
    limitation:
      "Visible flame extinction does not always establish complete cessation of combustion. Original test files still require review.",
    source: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-69",
    sourceLabel: "NASA PSI-69 · DOI: 10.60555/mbq8-0451",
    goals: [
      "Crew Safety",
      "Predictive Models",
      "Safety Equipment",
      "Earth Applications",
    ],
  },
  {
    id: "flex2",
    name: "FLEX-2",
    title: "Flame Extinguishment Experiment-2",
    purpose:
      "Study droplet burning rates, soot formation, and evaporation of liquid-fuel mixtures.",
    fuel: "Liquid-fuel droplets and mixtures",
    conditions: "Microgravity. Exact conditions: not imported.",
    facility: "Combustion Integrated Rack",
    measurements:
      "Burning rates, soot formation, and fuel evaporation; raw data not imported.",
    finding:
      "NASA describes potential relevance to spacecraft safety and liquid-fuel engine efficiency.",
    limitation:
      "Potential applications are not validated equipment recommendations or habitat safety limits.",
    source: nasaOverview,
    sourceLabel: "NASA · Studying Combustion and Fire Safety",
    goals: ["Predictive Models", "Earth Applications"],
  },
  {
    id: "bass2",
    name: "BASS-II",
    title: "Burning and Suppression of Solids-II",
    purpose:
      "Examine how solid-fuel samples burn in microgravity compared with normal gravity under appropriate conditions.",
    fuel: "Solid-fuel samples; exact materials and dimensions not imported.",
    conditions:
      "Microgravity and normal-gravity comparisons. Matched conditions require original records.",
    facility: "Not imported from the original investigation record.",
    measurements:
      "Flame spread and fuel regression; quantitative results not imported.",
    finding:
      "NASA cites published studies of flame spread and fuel regression from BASS-II.",
    limitation:
      "No universal increase in flame spread can be inferred without matching fuel, oxygen, flow, and geometry.",
    source: nasaOverview,
    sourceLabel: "NASA · Studying Combustion and Fire Safety",
    goals: ["Crew Safety", "Predictive Models"],
  },
  {
    id: "samer",
    name: "SAME-R",
    title: "Smoke Aerosol Measurement Experiment-Reflight",
    purpose:
      "Characterize smoke particle size in low gravity and its relationship to smoke generation and transport.",
    fuel: "Smoke-generating samples; Pyrell foam introduced for the reflight.",
    conditions: "ISS microgravity. Original per-test conditions not imported.",
    facility: "SAME hardware with modified diagnostics",
    measurements:
      "Smoke particle size distributions; original data not imported.",
    finding:
      "The PSI record describes diagnostic changes following contamination of the original SAME TEM grids.",
    limitation:
      "Particle-size hypotheses must not be presented as measured outcomes. Detector performance needs original results.",
    source: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-101",
    sourceLabel: "NASA PSI-101 · DOI: 10.60555/2np7-jv14",
    goals: ["Crew Safety", "Safety Equipment"],
  },
];
export function findInvestigationById(id: string) {
  return investigations.find((item) => item.id === id);
}
export function searchInvestigations(query: string) {
  return retrieveInvestigations(investigations, query).map(
    (match) => match.item,
  );
}
