// Public response contracts only. Ranking logic lives in the private scientific engine.
import type { Environment, ResearchGoal } from "@/types/research";
export const rankingAssessmentVersion = "ranking-assessment-1.0.0";
export interface AssessmentDimension {
  label: string;
  status: string;
  basis: string[];
  limits: string[];
  principles: number[];
}
export interface RankingAssessment {
  recordId: string;
  goal: ResearchGoal;
  environment: Environment;
  question: string;
  version: string;
  dimensions: AssessmentDimension[];
  conflicts: { field: string; quote: string; unit: string; range: string }[];
  conditions: {
    label: string;
    status: "Documented" | "Not identified";
    text: string;
  }[];
  provenance: {
    accession: string;
    version: number;
    url: string;
    retrievedAt: string;
    hash: string;
    tables: {
      name: string;
      url: string;
      localUrl?: string;
      sha256?: string;
      rows?: number;
      columns: string[];
    }[];
  };
  nextSteps: string[];
  reviewStatement: string;
}
