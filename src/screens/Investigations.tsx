"use client";
import { CatalogBriefing } from "@/components/CatalogBriefing";
import { useState } from "react";
import { FileText, Flask, CaretRight, Sparkle } from "@phosphor-icons/react";
import type { Environment } from "@/types/research";
import { investigations } from "@/lib/research/catalog";
import { retrieveInvestigations } from "@/lib/research/search";
import { emptyFilters, filterInvestigations } from "@/lib/research/filters";
import { InvestigationFilters } from "@/components/InvestigationFilters";
import { ResearchDialog } from "@/components/ResearchDialog";
import { Panel, Status, Notice, SourceLink } from "@/components/ui";
import { InvestigationDetail } from "@/components/InvestigationDetail";
import { MissionContext } from "@/components/MissionContext";
import { Applications } from "@/components/Applications";
import type {ResearchAnswer as Answer} from "@/types/answer";
import {ResearchAnswer} from "@/components/ResearchAnswer";
export function Investigations({
  query,
  answer=null,searching=false,onReview=()=>{},
  showResults,
  onResultsChange: setShowResults,
  environment,
  setEnvironment,
}: {
  query: string;
  answer?:Answer|null;searching?:boolean;onReview?:(id:string,statement:string)=>void;
  showResults: boolean;
  onResultsChange: (open: boolean) => void;
  environment: Environment;
  setEnvironment: (v: Environment) => void;
}) {
  const [showDetail,setShowDetail]=useState(false);
  const [selected, setSelected] = useState("flex");
  const [filters, setFilters] = useState({ ...emptyFilters });
  const matches = answer && answer.query===query ? answer.recordIds.flatMap(id=>{
    const item=investigations.find(record=>record.id===id);
    return item?[{item,reasons:[answer.mode==="openai"?"AI-selected · NASA quote checked":"Catalog match"],relevance:0}]:[];
  }) : retrieveInvestigations(investigations, query);
  const results = filterInvestigations(
    matches.map((match) => match.item),
    filters,
  );
  const item = results.find((i) => i.id === selected) ?? results[0];
  function renderResults(expanded:boolean) { return (          <div className="result-list">
            {(expanded ? results : results.slice(0,2)).map((record, index) => (
              <button
                key={record.id}
                className={`result-row ${record.id === item?.id ? "active" : ""}`}
                onClick={() => {setSelected(record.id);if(expanded){setShowResults(false);setShowDetail(true);}}}
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
); }
  return (
    <div className="investigations-page">
      <InvestigationFilters value={filters} onChange={setFilters} />
      <div className="retrieval-summary" role="status">
        {results.length} relevant investigations{query ? ` for “${query}”` : ""}{" "}
        · {searching?"Searching NASA catalog…":answer?.mode==="openai"?"source-linked AI interpretation · review pending":"catalog retrieval"}
      </div>
      <div className="investigation-top">
        <Panel title="Research Briefing" icon={<Sparkle />}>
          <CatalogBriefing compact query={query} records={results} answer={answer}/>
        </Panel>
        <MissionContext value={environment} onChange={setEnvironment} compact />
      </div>
      <div className="investigation-columns">
        <Panel title="Research Results" icon={<FileText />}>
          <div className="muted tiny">
            {results.length ? `${results.length} retrieved NASA PSI records · review pending` : "No matches · Reset filters or refine your question"}
          </div>
          <button className="research-open-button" onClick={()=>setShowResults(true)}>View search results · {results.length} ↗</button>
          {results.length > 0 && <p className="results-preview-note">Browse matching records in the popup.</p>}
          <div className="list-note">
            Showing the retrieved Combustion Science catalog
          </div>
        </Panel>
        {item ? (
          <Panel title={`Selected Investigation — ${item.name}`}>
            <div className="selected-investigation-launcher"><button className="research-open-button" onClick={()=>setShowDetail(true)}>Open investigation details ↗</button><div className="selected-record-source"><span>{item.sourceLabel.split(" · ")[0]}</span><SourceLink href={item.source} label="NASA source"/></div><p className="selected-record-title">{item.title}</p></div>
          </Panel>
        ) : (
          <Panel title="Selected Investigation">
            <div className="empty-investigation-preview">
              <span className="muted tiny">No matching investigation selected</span>
              <button className="research-open-button" onClick={()=>setShowResults(true)}>Review search and filters ↗</button>
            </div>
          </Panel>
        )}
      </div>
      <ResearchDialog open={showResults} onClose={()=>setShowResults(false)} title={`Research Results · ${results.length} investigations`}><div className="search-output-summary"><strong>{query ? `Results for “${query}”` : "All Combustion Science Investigations"}</strong><p>Documented NASA records · select a card to open its full investigation.</p>{Object.values(filters).some(Boolean)&&<div><span>Active filters narrow these results.</span><button className="research-open-button" onClick={()=>setFilters({...emptyFilters})}>Clear filters</button></div>}</div>{searching&&<p role="status">Interpreting your question against the NASA catalog…</p>}{answer&&<ResearchAnswer answer={answer} availableIds={results.map(record=>record.id)} onReview={onReview}/>}{renderResults(true)}{!searching&&!results.length&&<Notice>No documented records match these filters.</Notice>}</ResearchDialog>
      <ResearchDialog open={showDetail && !!item} onClose={()=>setShowDetail(false)} title={item ? `${item.name} · Investigation Details` : "Investigation Details"}>{item&&<InvestigationDetail item={item} onSelectRelated={setSelected} availableIds={results.map(record=>record.id)}/>}</ResearchDialog>
      <Applications environment={environment}/>
    </div>
  );
}
