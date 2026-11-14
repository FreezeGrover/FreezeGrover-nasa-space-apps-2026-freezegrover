"use client";
import {
  ShieldCheck,
  GlobeHemisphereWest,
  Stack,
  Info,
} from "@phosphor-icons/react";
import { Expandable } from "./ui";
export function Applications({ expanded = false }: { expanded?: boolean }) {
  return (
    <>
      <div className="applications">
        <Expandable
          title="Fire-Safety Applications"
          subtitle="Space"
          icon={<ShieldCheck />}
          open={expanded}
        >
          <ul>
            <li>Detection & early warning</li>
            <li>Fire suppression research</li>
            <li>Fire-resistant materials</li>
            <li>Crew safety & protective gear</li>
          </ul>
        </Expandable>
        <Expandable
          title="From Space to Earth"
          subtitle="Terrestrial applications"
          icon={<GlobeHemisphereWest />}
          open={expanded}
        >
          <ul>
            <li>Smoke detection research</li>
            <li>Combustion modeling</li>
            <li>Firefighter protective equipment</li>
            <li>Potential technology transfer</li>
          </ul>
        </Expandable>
        <Expandable
          title="Future Fire-Safety Innovations"
          subtitle="Next generation"
          icon={<Stack />}
          open={expanded}
        >
          <ul>
            <li>Environment-aware detection</li>
            <li>Lower-resource suppression</li>
            <li>Heat-resistant materials</li>
            <li>Integrated habitat safety systems</li>
          </ul>
        </Expandable>
      </div>
      <div className="scope">
        <Info />
        <strong>Scope Note:</strong>
        <span>
          Fire safety in habitable environments: spacecraft, stations, lunar &
          Martian bases, and pressurized rovers. Applications shown are research
          themes, not verified safety recommendations.
        </span>
      </div>
    </>
  );
}
