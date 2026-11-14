"use client";
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
        <Panel title="AI Research Briefing — Key Takeaways" icon={<Sparkle />}>
          <ul className="briefing">
            <li>
              <strong>What we know:</strong> NASA studies combustion, flame
              spread, and smoke in microgravity.
            </li>
            <li>
              <strong>Why it matters:</strong> Research can inform fire safety
              for crews, habitats, and equipment.
            </li>
            <li>
              <strong>Opportunities:</strong> Explore detection, suppression,
              and material flammability.
            </li>
            <li>
              <strong>Research gaps:</strong> Test conditions and habitat
              applicability need careful review.
            </li>
          </ul>
          <span className="muted tiny">
            Curated introduction · live AI briefing not connected
          </span>
        </Panel>
        <MissionContext value={environment} onChange={setEnvironment} />
      </div>
      <Applications expanded />
    </div>
  );
}
