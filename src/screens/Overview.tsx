"use client";
import { CatalogBriefing } from "@/components/CatalogBriefing";
import { Sparkle } from "@phosphor-icons/react";
import type { Environment, Tab } from "@/types/research";
import { Panel } from "@/components/ui";
import { MissionContext } from "@/components/MissionContext";
import { Applications } from "@/components/Applications";
import type {ResearchAnswer} from "@/types/answer";
export function Overview({
  environment,
  setEnvironment,
  navigate,
  query="",answer,
}: {
  environment: Environment;
  setEnvironment: (v: Environment) => void;
  navigate: (v: Tab) => void;
  query?:string;answer?:ResearchAnswer|null;
}) {
  return (
    <div className="overview-page">
      <div className="overview-top">
        <Panel title="Research Briefing — NASA PSI" icon={<Sparkle />}>
          <CatalogBriefing query={query} answer={answer}/>
        </Panel>
        <MissionContext value={environment} onChange={setEnvironment} />
      </div>
      <Applications expanded environment={environment}/>
    </div>
  );
}
