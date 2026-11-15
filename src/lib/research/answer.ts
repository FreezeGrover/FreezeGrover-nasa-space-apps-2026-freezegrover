import {investigations} from "./catalog";
import {retrieveInvestigations} from "./search";
import {describeMissionContext} from "./context";
import {validateGrounding} from "../qa/grounding";
import type {Environment} from "@/types/research";
import type {ResearchAnswer,CitedStatement} from "@/types/answer";
export function catalogAnswer(query:string,notice="Catalog retrieval only; AI is not configured."):ResearchAnswer {
  return {query,mode:"catalog",recordIds:retrieveInvestigations(investigations,query).map(match=>match.item.id),
    statements:[],notice,groundingIssues:[]};
}
export async function answerResearchQuestion(query:string,environment:Environment,
  provider:(query:string,context:string)=>Promise<CitedStatement[]>):Promise<ResearchAnswer>{
  // A future Google adapter must pass the same independent source checks.
  const proposed=await provider(query,describeMissionContext(environment));
  const {accepted,issues}=validateGrounding(proposed);
  return {query,mode:"openai",recordIds:[...new Set(accepted.map(statement=>statement.recordId))],
    statements:accepted,groundingIssues:issues,
    notice:accepted.length ? "AI interpretation of cited NASA excerpts · quote checks passed; scientific review pending."
      : "No source-grounded AI answer could be established from the supplied catalog. No results were invented."};
}
