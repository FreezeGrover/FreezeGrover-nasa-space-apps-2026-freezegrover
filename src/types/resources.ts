export type ResourceRole =
  | "Scientific background"
  | "Historical safety evidence"
  | "Technology transfer";
export type ResourceClaimKind =
  "background" | "observation" | "history" | "application" | "prospect";
export interface ResourceExcerpt {
  id: string;
  text: string;
  locator: string;
  kind: ResourceClaimKind;
  sha256: string;
}
export interface NasaResource {
  id: string;
  title: string;
  role: ResourceRole;
  url: string;
  retrievedAt: string;
  sha256: string;
  snapshotPath: string;
  tags: string[];
  limitations: string;
  excerpts: ResourceExcerpt[];
  links: { recordId: string; excerptId: string; basis: string }[];
}
export interface ResourceStatement {
  citationNumber?: number;
  sourceId: string;
  excerptId: string;
  quote: string;
  interpretation: string;
  claimType: ResourceClaimKind;
}
export interface ScientificReviewRequest {
  citations?: Array<import("./answer").CitedStatement | ResourceStatement>;
  audit?: import("./conversation").ConversationAnswer["audit"];
  reviewContext?: string;
  question?: string;
  answerText?: string;
  quote?: string;
  field?: import("./answer").EvidenceField;
  recordId?: string;
  sourceId?: string;
  excerptId?: string;
  statement: string;
}
