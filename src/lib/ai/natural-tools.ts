import { retrievePsiRows } from "./psi-rows";
import { mentionedInvestigations } from "../research/identities";
import { investigations, findInvestigationById } from "../research/catalog";
import { retrieveInvestigations } from "../research/search";
import { nasaResources, retrieveNasaResources } from "../resources/catalog";
import { evidenceText } from "../qa/grounding";
import { buildEvidenceReferences } from "../research/evidence-references";
export const researchTools = [
  {
    type: "function",
    name: "search_nasa_research",
    description:
      "Search inspected local NASA PSI investigations and official background, historical and technology sources. Reformulate a query using conversation context. Not live web search.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "retrieve_psi_csv_rows",
    description: "Retrieve actual locally downloaded NASA PSI CSV rows by investigation ID and search terms (e.g. bass2, B3). Returns exact column names, original values, CSV row number, file identity and original URL. Never infer units or claim a field is a measured flame-spread rate without evidence.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        query: { type: "string" },
      },
      required: ["id", "query"],
    },
  },
  {
    type: "function",
    name: "open_nasa_source",
    description:
      "Open all imported source fields or all curated excerpts and limitations for a source ID from search. Imported text may be incomplete; no full-dataset inference.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
];
export function runResearchTool(name: string, args: Record<string, unknown>) {
  if (name === "retrieve_psi_csv_rows") {
    if (typeof args.id !== "string" || typeof args.query !== "string")
      throw new Error("INVALID_CSV_LOOKUP");
    return retrievePsiRows(args.id, args.query);
  }
  if (name === "search_nasa_research") {
    if (typeof args.query !== "string" || args.query.length > 1200)
      throw new Error("INVALID_TOOL_QUERY");
    return {
      investigations: [
        ...new Set([
          ...mentionedInvestigations(args.query),
          ...retrieveInvestigations(investigations, args.query).map(
            ({ item }) => item.id,
          ),
        ]),
      ]
        .slice(0, 8)
        .map((id) => {
          const item = findInvestigationById(id)!;
          return { id: item.id, name: item.name, title: item.title };
        }),
      sources: retrieveNasaResources(args.query).map((source) => ({
        id: source.id,
        title: source.title,
        role: source.role,
        limitations: source.limitations,
      })),
      coverage:
        "Inspected snapshots only. Open a source for citation passages.",
    };
  }
  if (name === "open_nasa_source" && typeof args.id === "string") {
    const source = nasaResources.find((item) => item.id === args.id),
      record = findInvestigationById(args.id);
    if (source)
      return {
        references: buildEvidenceReferences({
          missionContext: "",
          records: [],
          resources: [source],
        }),
        source,
      };
    if (record)
      return {
        references: buildEvidenceReferences({
          missionContext: "",
          records: [
            {
              id: record.id,
              name: record.name,
              objective: evidenceText(record.id, "objective"),
              approach: evidenceText(record.id, "approach"),
              measurements: record.measurements,
              conditions: record.conditions,
              table: evidenceText(record.id, "table"),
            },
          ],
        }),
        source: record.source,
      };
    return {
      error: "Source not present in inspected catalog. Do not invent a source.",
    };
  }
  throw new Error("UNKNOWN_RESEARCH_TOOL");
}
