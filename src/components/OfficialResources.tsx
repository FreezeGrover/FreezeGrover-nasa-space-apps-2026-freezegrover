"use client";
import {findNasaResource} from "@/lib/resources/catalog";
import {findInvestigationById} from "@/lib/research/catalog";
import type {NasaResource,ResourceStatement} from "@/types/resources";
import {SourceLink,Status} from "./ui";
import {useResearchActions} from "./ResearchActions";

export function OfficialResource({source,onAction=()=>{},interactive=true}:{source:NasaResource;onAction?:()=>void;interactive?:boolean}){
  const actions=useResearchActions();
  const ask=(question:string,recordIds:string[]=[])=>{onAction();actions?.ask(question,{sourceIds:[source.id],recordIds});};
  const linked=[...new Set(source.links.map(link=>link.recordId))];
  return <article className="qa-check-detail"><h3>{source.title}</h3><Status label={source.role}/><p>{source.limitations}</p>
    {source.excerpts.map(excerpt=><details key={excerpt.id}><summary>{excerpt.locator} · {excerpt.kind}</summary><blockquote>{excerpt.text}</blockquote>
      {interactive&&actions&&<button className="research-open-button" onClick={()=>{onAction();actions.review({sourceId:source.id,excerptId:excerpt.id,statement:excerpt.text,quote:excerpt.text});}}>Review official source in Scientific QA ↗</button>}
    </details>)}
    <SourceLink href={source.url} label="Open original NASA source"/>
    <p className="muted tiny">Inspected {source.retrievedAt.slice(0,10)} · saved snapshot · scientific interpretation unverified</p>
    {interactive&&actions&&<div><button className="research-open-button" disabled={actions.pending} onClick={()=>ask(`Explain what NASA documents in “${source.title}” and distinguish the evidence from uncertainty.`)}>Explain this NASA source ↗</button>
      {linked.length>0&&<button className="research-open-button" disabled={actions.pending} onClick={()=>ask(`Explain the experimental conditions of ${linked.map(id=>findInvestigationById(id)?.name).join(" and ")} using the PSI evidence. Keep the linked background source separate.`,linked)}>Explain linked experimental conditions ↗</button>}
      {source.role==="Technology transfer"&&<button className="research-open-button" disabled={actions.pending} onClick={()=>ask(`What Earth application does “${source.title}” document, and what performance or technology lineage is not established?`)}>Explore documented Earth application ↗</button>}
      {source.role==="Historical safety evidence"&&<button className="research-open-button" disabled={actions.pending} onClick={()=>ask(`Explain the operational fire-safety lessons in “${source.title}”. Treat the incident as historical context, not a controlled experiment.`)}>Explore spacecraft safety context ↗</button>}
    </div>}
  </article>;
}

export function ResourceStatementView({statement,onAction=()=>{},question,answerText}:{statement:ResourceStatement;onAction?:()=>void;question?:string;answerText?:string}){
  const source=findNasaResource(statement.sourceId),actions=useResearchActions();
  const excerpt=source?.excerpts.find(item=>item.id===statement.excerptId);
  if(!source||!excerpt)return null;
  return <div className="conversation-paragraph"><p>{statement.citationNumber?`[${statement.citationNumber}] `:""}{statement.interpretation}</p><details><summary>Evidence · {source.title} · {source.role}</summary>
    <blockquote>{statement.quote}</blockquote><small>{excerpt.locator} · {statement.claimType} · interpretation unverified</small><p>{source.limitations}</p><SourceLink href={source.url} label="Original NASA source"/>
    {actions&&<><button className="research-open-button" onClick={()=>{onAction();actions.review({sourceId:source.id,excerptId:excerpt.id,statement:statement.interpretation,quote:statement.quote,question,answerText});}}>Review official source in Scientific QA ↗</button><button className="research-open-button" disabled={actions.pending} onClick={()=>{onAction();actions.ask(`Explain the uncertainty and applicability of this passage from “${source.title}”: ${statement.quote.slice(0,600)}`,{sourceIds:[source.id],recordIds:[]});}}>Explore scientific uncertainty ↗</button></>}
  </details></div>;
}
