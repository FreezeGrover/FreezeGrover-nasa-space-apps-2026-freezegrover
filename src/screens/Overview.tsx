"use client";
import { CatalogBriefing } from "@/components/CatalogBriefing";
import { Sparkle } from "@phosphor-icons/react";
import type { Environment, Tab } from "@/types/research";
import { Panel } from "@/components/ui";
import { MissionContext } from "@/components/MissionContext";
import { Applications } from "@/components/Applications";
export function Overview({
  environment,
  setEnvironment,
  navigate,
  mode,
}: {
  environment: Environment;
  setEnvironment: (v: Environment) => void;
  navigate: (v: Tab) => void;
  mode: string;
}) {
  return (
    <div className="overview-page">
      <div className="overview-top">
        <Panel title="Research Briefing — NASA PSI" icon={<Sparkle />}>
          <CatalogBriefing />
        </Panel>
        <MissionContext value={environment} onChange={setEnvironment} />
      </div>
      <Applications expanded />
    </div>
  );
}
