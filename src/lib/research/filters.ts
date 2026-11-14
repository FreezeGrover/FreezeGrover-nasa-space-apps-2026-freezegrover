import type { Investigation, InvestigationFilters } from "@/types/research";
import { getExperimentMetadata } from "./metadata";
export const emptyFilters: InvestigationFilters = {
  fuel: "",
  conditions: "",
  gravity: "",
  hardware: "",
  related: "",
};
export const filterDefinitions = [
  {
    key: "fuel",
    label: "Fuel / Material",
    options: [
      ["", "All materials"],
      ["liquid", "Liquid droplets"],
      ["solid", "Solid fuels"],
      ["smoke", "Smoke / foam samples"],
    ],
  },
  {
    key: "conditions",
    label: "Oxygen & Pressure",
    options: [
      ["", "All conditions"],
      ["oxygen", "Oxygen variation described"],
      ["pressure", "Pressure protocol reported"],
      ["unknown", "Numerical conditions unavailable"],
    ],
  },
  {
    key: "gravity",
    label: "Gravity",
    options: [
      ["", "All gravity conditions"],
      ["microgravity", "Microgravity"],
      ["normal-comparison", "Normal-gravity comparisons"],
      ["partial", "Partial gravity — no imported records"],
    ],
  },
  {
    key: "hardware",
    label: "Hardware",
    options: [
      ["", "All hardware"],
      ["MDCA", "MDCA"],
      ["CIR", "Combustion Integrated Rack"],
      ["SAME", "SAME hardware"],
      ["unknown", "Hardware not imported"],
    ],
  },
  {
    key: "related",
    label: "Related PSI",
    options: [
      ["", "All relationships"],
      ["linked", "Has related investigations"],
      ["droplets", "FLEX / FLEX-2 / CFI"],
      ["PSI-62", "PSI-62 · BASS modeling"],
      ["PSI-102", "PSI-102 · SAME"],
    ],
  },
] as const;
export function filterInvestigations(
  items: Investigation[],
  filters: InvestigationFilters,
) {
  return items.filter((item) => {
    const m = getExperimentMetadata(item.id);
    if (filters.fuel && m.fuelCategory !== filters.fuel) return false;
    if (filters.conditions === "oxygen" && !m.oxygenVariation) return false;
    if (filters.conditions === "pressure" && !m.pressureProtocol) return false;
    if (filters.conditions === "unknown" && m.pressureProtocol) return false;
    if (filters.gravity && !m.gravity.includes(filters.gravity)) return false;
    if (filters.hardware === "unknown" && m.hardware.length) return false;
    if (
      filters.hardware &&
      filters.hardware !== "unknown" &&
      !m.hardware.includes(filters.hardware)
    )
      return false;
    if (filters.related === "linked" && !m.related.length) return false;
    if (filters.related === "droplets" && !m.hardware.includes("MDCA"))
      return false;
    if (
      filters.related.startsWith("PSI-") &&
      !m.related.some((r) => r.url.endsWith(filters.related))
    )
      return false;
    return true;
  });
}
