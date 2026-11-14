"use client";
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
  const [goal, setGoal] = useState<ResearchGoal>("Crew Safety");
  const relevant = findRelevantInvestigations(investigations, goal);
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
      <div className="ranking-list">
        {relevant.map((item) => (
          <article className="ranking-row" key={item.id}>
            <Flask />
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
      <Expandable
        title="Advanced Research Details"
        subtitle="Criteria, evidence quality, uncertainty, and sources"
        icon={<Gear />}
      >
        <p>
          Research is grouped by a manually curated topic match to your goal.
          Records retain catalog order; no scientific rank or numerical score is
          asserted. Mission context adds a transfer limitation, not a validated
          suitability rating.
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
