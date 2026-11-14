"use client";
import { CatalogBriefing } from "@/components/CatalogBriefing";
import { useState } from "react";
import { FileText, Flask, CaretRight, Sparkle } from "@phosphor-icons/react";
import type { Environment } from "@/types/research";
import { investigations } from "@/lib/research/catalog";
import { retrieveInvestigations } from "@/lib/research/search";
import { emptyFilters, filterInvestigations } from "@/lib/research/filters";
import { InvestigationFilters } from "@/components/InvestigationFilters";
import { Panel, Status, Notice } from "@/components/ui";
import { InvestigationDetail } from "@/components/InvestigationDetail";
import { MissionContext } from "@/components/MissionContext";
import { Applications } from "@/components/Applications";
export function Investigations({
  query,
  environment,
  setEnvironment,
}: {
  query: string;
  environment: Environment;
  setEnvironment: (v: Environment) => void;
}) {
  const [selected, setSelected] = useState("flex");
  const [filters, setFilters] = useState({ ...emptyFilters });
  const matches = retrieveInvestigations(investigations, query);
  const results = filterInvestigations(
    matches.map((match) => match.item),
    filters,
  );
  const item = results.find((i) => i.id === selected) ?? results[0];
  return (
    <div className="investigations-page">
      <InvestigationFilters value={filters} onChange={setFilters} />
      <div className="retrieval-summary" role="status">
        {results.length} relevant investigations{query ? ` for “${query}”` : ""}{" "}
        · catalog retrieval, not an AI answer
      </div>
      <div className="investigation-top">
        <Panel title="Research Briefing" icon={<Sparkle />}>
          <CatalogBriefing compact />
        </Panel>
        <MissionContext value={environment} onChange={setEnvironment} compact />
      </div>
      <div className="investigation-columns">
        <Panel title="Research Results" icon={<FileText />}>
          <div className="muted tiny">
            {results.length} retrieved NASA PSI records · scientific review
            pending
          </div>
          <div className="result-list">
            {results.map((record, index) => (
              <button
                key={record.id}
                className={`result-row ${record.id === item?.id ? "active" : ""}`}
                onClick={() => setSelected(record.id)}
                aria-pressed={record.id === item?.id}
              >
                <span className="result-index">{index + 1}</span>
                <Flask />
                <span className="result-title">
                  <strong>{record.name}</strong>
                  <small>{record.title}</small>
                  <small>{record.sourceLabel.split(" · ")[0]}</small>
                  {query && (
                    <small className="match-reason">
                      {matches
                        .find((match) => match.item.id === record.id)
                        ?.reasons.join(" · ")}
                    </small>
                  )}
                </span>
                <Status label="Not Assessed" />
                <CaretRight />
              </button>
            ))}
          </div>
          {results.length === 0 && (
            <Notice>
              No relevant records in this retrieved catalog for the current
              question and filters. Clear filters or refine the question. No
              results have been invented.
            </Notice>
          )}
          <div className="list-note">
            Showing the retrieved Combustion Science catalog
          </div>
        </Panel>
        {item ? (
          <InvestigationDetail
            item={item}
            onSelectRelated={setSelected}
            availableIds={results.map((record) => record.id)}
          />
        ) : (
          <Notice>
            Select a matching investigation after clearing or changing your
            search.
          </Notice>
        )}
      </div>
      <Applications />
    </div>
  );
}
