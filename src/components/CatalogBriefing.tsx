import {catalogSummary,findInvestigationById} from "@/lib/research/catalog";
import {buildCatalogBriefing} from "@/lib/research/briefing";
import type {Investigation} from "@/types/research";
import type {ResearchAnswer} from "@/types/answer";
import {SourceLink} from "./ui";
export function CatalogBriefing({compact=false,query="",records,answer}:{compact?:boolean;query?:string;records?:Investigation[];answer?:ResearchAnswer|null}) {
 const topics=buildCatalogBriefing(query,records??(answer?answer.recordIds.flatMap(id=>{const item=findInvestigationById(id);return item?[item]:[];}):undefined));
 return <div className={"research-briefing "+(compact?"research-briefing--compact":"")}>
  <div className="briefing-topline"><span className="briefing-eyebrow">{query?"YOUR RESEARCH CONTEXT":"RESEARCH AT A GLANCE"}</span><span className="briefing-count">{catalogSummary.verifiedCombustionRecords} NASA records</span></div>
  <div className="briefing-topics">{topics.map(({item,excerpt})=><article className="briefing-topic" key={item.id}><span className="briefing-marker" aria-hidden="true"/><div className="briefing-topic-copy"><h3>{item.name}</h3>{!compact&&<p>{excerpt}</p>}<div className="briefing-topic-source"><span>NASA objective excerpt</span><SourceLink href={item.source} label={item.sourceLabel.split(" · ")[0]}/></div></div></article>)}{!topics.length&&<p>No matching NASA records. Refine the question or reset filters.</p>}</div>
  <p className="briefing-footnote">Original NASA objectives · not independently verified findings.</p>
 </div>;
}
