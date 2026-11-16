import { z } from "zod";
import type { ResearchAnswer } from "./answer";

export const conversationInputSchema = z
  .object({
    message: z.string().trim().min(1).max(1200),
    environment: z.enum([
      "All",
      "Spacecraft",
      "Space Stations",
      "Lunar Bases",
      "Martian Bases",
      "Pressurized Rovers",
    ]),
    history: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().min(1).max(12000),
            recordIds: z.array(z.string().max(80)).max(24),
            sourceIds: z.array(z.string().max(80)).max(24).optional(),
          })
          .strict(),
      )
      .max(20),
    context: z
      .object({
        tab: z.enum([
          "Overview",
          "Investigations",
          "Compare",
          "Rankings",
          "Scientific QA",
        ]),
        recordIds: z.array(z.string().max(80)).max(24),
        goal: z.string().max(100).optional(),
        sourceIds: z.array(z.string().max(80)).max(24).optional(),
      })
      .strict(),
  })
  .strict();

export type ConversationInput = z.infer<typeof conversationInputSchema>;
export type ResearchContext = ConversationInput["context"];
export type HistoryMessage = ConversationInput["history"][number];
export interface ConversationAnswer extends ResearchAnswer {
  reply?: string;
  audit?: {
    promptVersion: string;
    frameworkVersion: string;
    toolTrace: string[];
    checks: string[];
    scientificStatus: string;
  };
  clarification?: string;
  retryable?: boolean;
}
export type ResearchPhase = "catalog" | "conditions" | "answer" | "grounding";
export type ConversationEvent =
  | { type: "phase"; phase: ResearchPhase }
  | { type: "result"; answer: ConversationAnswer };
export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  answer?: ConversationAnswer;
  status?: "complete" | "failed" | "cancelled";
  elapsed?: number;
  request?: ConversationInput;
}
