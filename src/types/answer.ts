export type EvidenceField = "objective" | "approach" | "measurements" | "conditions" | "table";
export interface CitedStatement {
  recordId: string;
  field: EvidenceField;
  quote: string;
  interpretation: string;
}
export interface ResearchAnswer {
  query: string;
  mode: "openai" | "catalog" | "unavailable";
  recordIds: string[];
  statements: CitedStatement[];
  notice: string;
  groundingIssues: string[];
}
