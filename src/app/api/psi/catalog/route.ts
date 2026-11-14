import {
  catalogSummary,
  investigations,
  getInvestigationEvidence,
} from "@/lib/research/catalog";
import { retrieveInvestigations } from "@/lib/research/search";
export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  return Response.json({
    summary: catalogSummary,
    results: retrieveInvestigations(investigations, query).map((match) => ({
      investigation: match.item,
      reasons: match.reasons,
      evidence: getInvestigationEvidence(match.item.id),
    })),
  });
}
