export type EvidenceType =
  | "direct-observation"
  | "reported-result"
  | "author-interpretation"
  | "derived-interpretation"
  | "safety-extrapolation";

export type EvidenceRelation = "supports" | "conflicts" | "differs" | "related";

export interface ExperimentalConditions {
  oxygenPercent?: number;
  pressureKPa?: number;
  airflowCmPerS?: number;
  gravity?: "microgravity" | "partial-gravity" | "earth-gravity" | string;
  material?: string;
  fuel?: string;
  thicknessMm?: number;
  geometry?: string;
  ignition?: string;
  notes?: string[];
}

export interface SourceDocument {
  id: string;
  title: string;
  url: string;
  authors?: string[];
  year?: number;
  nasaProgram?: string;
  publicationType?: string;
}

export interface Experiment {
  id: string;
  name: string;
  objective?: string;
  conditions: ExperimentalConditions;
  measurements: string[];
  sourceIds: string[];
}

export interface Finding {
  id: string;
  experimentId: string;
  statement: string;
  evidenceType: EvidenceType;
  conditions: ExperimentalConditions;
  measurement?: string;
  sourceIds: string[];
  sourceLocator?: string;
  limitations?: string[];
}

export interface EvidenceLink {
  fromFindingId: string;
  toFindingId: string;
  relation: EvidenceRelation;
  explanation: string;
}

export interface RankedEvidence {
  finding: Finding;
  conditionMatch: number;
  experimentRelevance: number;
  materialMatch: number;
  measurementRelevance: number;
  evidenceStrength: number;
  whyRanked: string[];
}

export interface ResearchAnswer {
  question: string;
  status: "needs-clarification" | "ready" | "insufficient-evidence";
  clarificationQuestion?: string;
  finding?: string;
  relevantEvidence: RankedEvidence[];
  comparison?: string;
  reasonableConclusion?: string;
  limitations: string[];
  safetySignificance?: string;
  sourceIds: string[];
}
