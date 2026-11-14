"use client";
import {useState} from "react";
import {ResearchDialog} from "./ResearchDialog";
import {
  Rocket,
  Planet,
  Moon,
  Mountains,
  Jeep,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";
import type { Environment } from "@/types/research";
import {describeMissionContext} from "@/lib/research/context";
import { Panel } from "./ui";
export const environments: Environment[] = [
  "All",
  "Spacecraft",
  "Space Stations",
  "Lunar Bases",
  "Martian Bases",
  "Pressurized Rovers",
];
export function MissionContext({
  value,
  onChange,
  compact = false,
}: {
  value: Environment;
  onChange: (value: Environment) => void;
  compact?: boolean;
}) {
  const [open,setOpen]=useState(false);
  const icons = [GlobeHemisphereWest, Rocket, Planet, Moon, Mountains, Jeep];
  function renderOptions(){return (      <div className={`environment-options ${compact ? "compact" : ""}`}>
        {environments.map((item, index) => {
          const Icon = icons[index];
          return (
            <button
              key={item}
              onClick={() => {onChange(item);setOpen(false);}}
              className={value === item ? "selected" : ""}
              aria-pressed={value === item}
            >
              <Icon />
              {item}
            </button>
          );
        })}
      </div>);}
  return (
    <Panel title="Mission Context" icon={<Rocket />} className="mission">
      <span className="panel-caption">Habitable environments</span>
      {compact ? <button className="research-open-button environment-picker" onClick={()=>setOpen(true)}>Environment: {value} · Choose ↗</button> : renderOptions()}
      <ResearchDialog open={open} onClose={()=>setOpen(false)} title="Choose Mission Context"><p>Select an environment to show the transfer checks for your research. This is not a suitability filter.</p>{renderOptions()}<p className="mission-context-explanation">{describeMissionContext(value)}</p></ResearchDialog>
      <p className="mission-context-explanation" role="status">{describeMissionContext(value)}</p>
    </Panel>
  );
}
