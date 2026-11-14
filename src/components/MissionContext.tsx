"use client";
import {
  Rocket,
  Planet,
  Moon,
  Mountains,
  Jeep,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";
import type { Environment } from "@/types/research";
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
  const icons = [GlobeHemisphereWest, Rocket, Planet, Moon, Mountains, Jeep];
  return (
    <Panel title="Mission Context" icon={<Rocket />} className="mission">
      <span className="panel-caption">Habitable environments</span>
      <div className={`environment-options ${compact ? "compact" : ""}`}>
        {environments.map((item, index) => {
          const Icon = icons[index];
          return (
            <button
              key={item}
              onClick={() => onChange(item)}
              className={value === item ? "selected" : ""}
              aria-pressed={value === item}
            >
              <Icon />
              {item}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
