"use client";
import {
  ShieldCheck,
  GlobeHemisphereWest,
  Stack,
  Info,
} from "@phosphor-icons/react";
import { Expandable } from "./ui";
import {useState} from "react";
import {ResearchDialog} from "./ResearchDialog";
import {investigations} from "@/lib/research/catalog";
import {getExperimentMetadata} from "@/lib/research/metadata";
import {SourceLink} from "./ui";
import {explainRankingReason} from "@/lib/ranking/rank";
import type {Environment,ResearchGoal} from "@/types/research";
import {nasaResources} from "@/lib/resources/catalog";
import {OfficialResource} from "./OfficialResources";
const applicationThemes=[
 {title:"Fire-Safety Applications",subtitle:"Detection, suppression & materials",icon:ShieldCheck,goal:"Crew Safety",description:"Explore documented combustion research that may inform material screening, detection and suppression. A topic match is not a certified safety recommendation."},
 {title:"From Space to Earth",subtitle:"Potential terrestrial relevance",icon:GlobeHemisphereWest,goal:"Earth Applications",description:"Explore investigations tagged for potential terrestrial relevance from NASA metadata. Technology transfer and equipment effectiveness require separate validation."},
 {title:"Future Fire-Safety Innovations",subtitle:"Models & research opportunities",icon:Stack,goal:"Predictive Models",description:"Explore modeling and experimental research as starting points for future work. These are research opportunities, not demonstrated future products."},
];
export function Applications({expanded=false,environment="All"}:{expanded?:boolean;environment?:Environment}) {
 const [active,setActive]=useState<number|null>(null);const theme=active===null?null:applicationThemes[active];
 const records=theme?investigations.filter(item=>item.goals.some(goal=>goal===theme.goal)):[];
 return <><div className="applications application-launchers">{applicationThemes.map((theme,index)=><button key={theme.title} className="application-launcher" onClick={()=>setActive(index)}><theme.icon/><span><strong>{theme.title}</strong><small>{theme.subtitle}</small></span><span aria-hidden="true">↗</span></button>)}</div><ResearchDialog open={theme!==null} onClose={()=>setActive(null)} title={theme?.title??"Research Applications"}>{theme&&<><p>{theme.description}</p><h3>Official NASA context and applications</h3><p>These source roles are separate from PSI experimental evidence. A shared topic is not technology lineage.</p>{nasaResources.filter(source=>active===1?source.role==="Technology transfer":active===0?source.role==="Historical safety evidence"||source.id==="nasa-combustion-guide":source.role==="Scientific background").map(source=><OfficialResource key={source.id} source={source} onAction={()=>setActive(null)}/>)}<h3>Primary PSI investigation topic matches</h3><p className="muted">{records.length} source-linked topic matches · not a scientific ranking</p><div className="application-research-grid">{records.map(item=><article key={item.id}><h3>{item.name}</h3><p>{item.title}</p><p>{explainRankingReason(item,theme.goal as ResearchGoal,environment)}</p><small>Documented topics: {getExperimentMetadata(item.id).topics.join(', ')||'Not classified'}</small><SourceLink href={item.source} label={item.sourceLabel.split(' · ')[0]}/></article>)}</div></>}</ResearchDialog><div className="scope"><Info/><strong>Scope:</strong><span>Habitable-environment fire-safety research. Application browsers show potential relevance, not verified equipment performance or habitat safety limits.</span></div></>;
}
