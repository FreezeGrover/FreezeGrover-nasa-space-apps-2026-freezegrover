import type {ResearchAnswer as Answer} from "@/types/answer";
import {findInvestigationById} from "@/lib/research/catalog";
import {SourceLink} from "./ui";
export function ResearchAnswer({answer,availableIds,onReview}:{answer:Answer;availableIds:string[];onReview:(id:string,statement:string)=>void}){
 const statements=answer.statements.filter(statement=>availableIds.includes(statement.recordId));
 return <section className="search-output-summary"><strong>{answer.mode==="openai"?"Source-Linked Research Explanation":answer.mode==="unavailable"?"AI Search Paused":"Catalog Search"}</strong><p>{answer.notice}</p>
 {statements.map((statement,index)=>{const item=findInvestigationById(statement.recordId)!;return <article className="qa-check-detail" key={index}><h3>{item.name}</h3><p>{statement.interpretation}</p><details><summary>Inspect NASA source excerpt</summary><blockquote>{statement.quote}</blockquote><small>Source field: {statement.field} · quote presence checked; interpretation not scientifically verified</small></details><SourceLink href={item.source} label={item.sourceLabel}/><button className="research-open-button" onClick={()=>onReview(item.id,statement.interpretation)}>Review statement in Scientific QA ↗</button></article>;})}
 {answer.groundingIssues.map((issue,index)=><p key={index}>{issue}</p>)}
 </section>;
}
