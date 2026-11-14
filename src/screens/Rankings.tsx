"use client";
import {ResearchDialog} from "@/components/ResearchDialog";
import {InvestigationDetail} from "@/components/InvestigationDetail";
import { useState } from "react";
import {
  ShieldCheck,
  ChartBar,
  Wrench,
  Globe,
  Flask,
  Gear,
  CheckCircle,
} from "@phosphor-icons/react";
import type { ResearchGoal, Environment } from "@/types/research";
import { investigations } from "@/lib/research/catalog";
import {
  findRelevantInvestigations,
  explainRankingReason,
} from "@/lib/ranking/rank";
import { MissionContext } from "@/components/MissionContext";
import { Expandable, Notice, Status, SourceLink } from "@/components/ui";
const goals: {
  name: ResearchGoal;
  description: string;
  icon: typeof ShieldCheck;
}[] = [
  {
    name: "Crew Safety",
    description: "Fire safety for habitable environments in space.",
    icon: ShieldCheck,
  },
  {
    name: "Predictive Models",
    description: "Research for modeling combustion and fire behavior.",
    icon: ChartBar,
  },
  {
    name: "Safety Equipment",
    description: "Detection and suppression research.",
    icon: Wrench,
  },
  {
    name: "Earth Applications",
    description: "Potential terrestrial fire-safety applications.",
    icon: Globe,
  },
];
export function Rankings({
  environment,
  setEnvironment,
}: {
  environment: Environment;
  setEnvironment: (v: Environment) => void;
}) {
  const [browse,setBrowse]=useState(false);
  const [detail,setDetail]=useState<string|null>(null);
  const [goal, setGoal] = useState<ResearchGoal>("Crew Safety");
  const relevant = findRelevantInvestigations(investigations, goal);
  function renderRankings(expanded:boolean){return (      <div className="ranking-list">
        {(expanded?relevant:relevant.slice(0,2)).map((item) => (
          <article className="ranking-row" key={item.id}>
            <button className="ranking-detail-button" onClick={()=>{setBrowse(false);setDetail(item.id);}} aria-label={`Open ${item.name} details`}><Flask/>Details ↗</button>
            <div className="ranking-name">
              <strong>{item.name}</strong>
              <small>NASA investigation</small>
            </div>
            <p>
              <strong>Why relevant? </strong>
              {explainRankingReason(item, goal, environment)}
            </p>
            <Status label="Candidate — Review Pending" />
            <SourceLink href={item.source} label="Source" />
          </article>
        ))}
      </div>
);}
  return (
    <div className="rankings-page">
      <Notice>
        Find NASA investigations relevant to your fire-safety research needs.
      </Notice>
      <h2 className="section-bar">1. Choose your research goal</h2>
      <div className="goal-options">
        {goals.map(({ name, description, icon: Icon }) => (
          <button
            key={name}
            className={goal === name ? "selected" : ""}
            aria-pressed={goal === name}
            onClick={() => setGoal(name)}
          >
            <Icon size={45} />
            <span>
              <strong>{name}</strong>
              <small>{description}</small>
            </span>
            {goal === name && (
              <CheckCircle className="goal-check" weight="fill" />
            )}
          </button>
        ))}
      </div>
      <h2 className="section-bar">2. Select environment</h2>
      <MissionContext value={environment} onChange={setEnvironment} compact />
      <h2 className="section-bar">
        Relevant Investigations{" "}
        <small>Topic matches · no numerical scores or verified ordering</small>
      </h2>
      {renderRankings(false)}
      <button className="research-open-button" onClick={()=>setBrowse(true)}>Browse all {relevant.length} relevant investigations ↗</button>
      <ResearchDialog open={browse} onClose={()=>setBrowse(false)} title={`${goal} · Relevant Investigations`}><p>Environment: {environment}. Topic matches retain catalog order; suitability is unverified.</p>{renderRankings(true)}</ResearchDialog>
      <ResearchDialog open={detail!==null} onClose={()=>setDetail(null)} title="Selected Investigation">{detail&&<InvestigationDetail item={investigations.find(item=>item.id===detail)!}/>}</ResearchDialog>
      <Expandable
        title="Advanced Research Details"
        subtitle="Criteria, evidence quality, uncertainty, and sources"
        icon={<Gear />}
      >
        <p>
          Research is grouped by a local topic match derived from retrieved NASA
          metadata to your goal. Records retain catalog order; no scientific
          rank or numerical score is asserted. Mission context adds a transfer
          limitation, not a validated suitability rating.
        </p>
      </Expandable>
      <Notice>
        <ShieldCheck />
        Scientific QA: Verification pending. Original evidence must be reviewed
        before final relevance conclusions.
      </Notice>
    </div>
  );
}
