import type { Investigation } from "@/types/research";
export function compareExperimentalConditions(
  a: Investigation,
  b: Investigation,
) {
  return [
    ["Experimental Objective", a.purpose, b.purpose],
    ["Fuel & Sample", a.fuel, b.fuel],
    ["Test Conditions", a.conditions, b.conditions],
    ["Apparatus / Facility", a.facility, b.facility],
    ["Sensors & Measurements", a.measurements, b.measurements],
    ["Reported Findings", a.finding, b.finding],
    ["Limitations & Uncertainty", a.limitation, b.limitation],
  ];
}
