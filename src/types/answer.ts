export type EvidenceField = "objective" | "approach" | "measurements" | "conditions" | "table";
export interface CitedStatement {
  citationNumber?:number;
  recordId: string;
  field: EvidenceField;
  quote: string;
  interpretation: string;
}
export interface ResearchAnswer {
  resourceStatements?:import("./resources").ResourceStatement[];
  sourceIds?:string[];
  query: string;
  mode: "openai" | "catalog" | "unavailable";
  recordIds: string[];
  statements: CitedStatement[];
  notice: string;
  groundingIssues: string[];
}
