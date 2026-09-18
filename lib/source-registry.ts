import type { SourceDocument } from "./domain";

export interface RegisteredSource extends SourceDocument {
  organization: "NASA" | "NASA NTRS";
  sourceKind: "overview" | "experiment" | "technical-report" | "mission-article";
  verificationStatus: "verified-official" | "pending-review";
  relevanceTags: string[];
  notes?: string[];
}

/**
 * Official-source seed registry.
 *
 * These records only identify trustworthy source documents. They do NOT encode
 * scientific findings. Findings are added separately after source-level review
 * so FREEZGROVER never treats a source title or summary as experimental fact.
 */
export const sourceRegistry: RegisteredSource[] = [
  {
    id: "nasa-combustion-fire-safety-overview",
    title: "Studying Combustion and Fire Safety",
    url: "https://www.nasa.gov/missions/station/iss-research/studying-combustion-and-fire-safety/",
    organization: "NASA",
    sourceKind: "overview",
    verificationStatus: "verified-official",
    nasaProgram: "International Space Station Research",
    relevanceTags: ["CIR", "FLEX", "ACME", "SoFIE", "fire-safety", "microgravity"],
  },
  {
    id: "nasa-saffire-i-2016",
    title: "NASA Glenn Successfully Ignites Largest Fire Experiment in Space",
    url: "https://www.nasa.gov/news-release/nasa-glenn-successfully-ignites-largest-fire-experiment-in-space/",
    organization: "NASA",
    sourceKind: "mission-article",
    verificationStatus: "verified-official",
    year: 2016,
    nasaProgram: "Spacecraft Fire Safety Demonstration (Saffire)",
    relevanceTags: ["Saffire-I", "large-scale-fire", "flame-spread", "materials", "microgravity"],
  },
  {
    id: "nasa-saffire-iii-2017",
    title: "NASA Prepares to Ignite Third SAFFIRE Experiment",
    url: "https://www.nasa.gov/news-release/nasa-prepares-to-ignite-third-saffire-experiment/",
    organization: "NASA",
    sourceKind: "mission-article",
    verificationStatus: "verified-official",
    year: 2017,
    nasaProgram: "Spacecraft Fire Safety Demonstration (Saffire)",
    relevanceTags: ["Saffire-III", "flammability-limits", "flame-growth", "microgravity"],
  },
  {
    id: "nasa-saffire-iv-2020",
    title: "The Flame of Discovery Grows as Saffire Sets New Fires in Space",
    url: "https://www.nasa.gov/humans-in-space/the-flame-of-discovery-grows-as-saffire-sets-new-fires-in-space/",
    organization: "NASA",
    sourceKind: "mission-article",
    verificationStatus: "verified-official",
    year: 2020,
    nasaProgram: "Spacecraft Fire Safety Demonstration (Saffire)",
    relevanceTags: ["Saffire-IV", "PMMA", "airflow", "flame-spread", "microgravity"],
  },
  {
    id: "nasa-saffire-v-2021",
    title: "Saffire Ignites New Discoveries in Space",
    url: "https://www.nasa.gov/humans-in-space/saffire-ignites-new-discoveries-in-space/",
    organization: "NASA",
    sourceKind: "mission-article",
    verificationStatus: "verified-official",
    year: 2021,
    nasaProgram: "Spacecraft Fire Safety Demonstration (Saffire)",
    relevanceTags: ["Saffire-V", "PMMA", "material-thickness", "flame-behavior", "microgravity"],
  },
  {
    id: "ntrs-sofie-2020",
    title: "Solid Fuel Ignition and Extinction (SoFIE) Project on ISS",
    url: "https://ntrs.nasa.gov/citations/20200000361",
    organization: "NASA NTRS",
    sourceKind: "technical-report",
    verificationStatus: "verified-official",
    year: 2020,
    nasaProgram: "Solid Fuel Ignition and Extinction (SoFIE)",
    relevanceTags: ["SoFIE", "solid-fuel", "ignition", "extinction", "oxygen", "pressure", "flammability"],
  },
  {
    id: "nasa-acme-overview",
    title: "Advanced Combustion Microgravity Experiment (ACME) Facility",
    url: "https://science.nasa.gov/biological-physical/investigations/acme/",
    organization: "NASA",
    sourceKind: "experiment",
    verificationStatus: "verified-official",
    nasaProgram: "Advanced Combustion via Microgravity Experiments (ACME)",
    relevanceTags: ["ACME", "CIR", "gaseous-flames", "materials-flammability", "microgravity"],
  },
  {
    id: "nasa-cld-flame",
    title: "Coflow Laminar Diffusion Flame (CLD Flame)",
    url: "https://science.nasa.gov/biological-physical/investigations/cld-flame/",
    organization: "NASA",
    sourceKind: "experiment",
    verificationStatus: "verified-official",
    nasaProgram: "Advanced Combustion via Microgravity Experiments (ACME)",
    relevanceTags: ["CLD-Flame", "gaseous-fuel", "airflow", "temperature", "soot", "stability"],
  },
];

export function getSourceById(sourceId: string): RegisteredSource | undefined {
  return sourceRegistry.find((source) => source.id === sourceId);
}

export function getVerifiedSources(): RegisteredSource[] {
  return sourceRegistry.filter((source) => source.verificationStatus === "verified-official");
}

export function findSourcesByTag(tag: string): RegisteredSource[] {
  const normalized = tag.trim().toLowerCase();
  return sourceRegistry.filter((source) =>
    source.relevanceTags.some((candidate) => candidate.toLowerCase() === normalized),
  );
}
