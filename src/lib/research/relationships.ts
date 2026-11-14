import { investigations, getInvestigationEvidence } from "./catalog";
import { getExperimentMetadata } from "./metadata";
const fuelTerms = [
  "methanol",
  "heptane",
  "propane",
  "ethylene",
  "methane",
  "butane",
  "pentane",
  "cotton",
  "fiberglass",
  "PMMA",
  "Nomex",
  "Ultem",
  "Pyrell",
];
export function findDocumentedRelationships(id: string) {
  const selected = investigations.find((item) => item.id === id)!;
  const meta = getExperimentMetadata(id);
  return investigations
    .filter((item) => item.id !== id)
    .flatMap((item) => {
      const other = getExperimentMetadata(item.id);
      const fuels = fuelTerms.filter(
        (term) =>
          new RegExp(`\\b${term}\\b`, "i").test(selected.fuel) &&
          new RegExp(`\\b${term}\\b`, "i").test(item.fuel),
      );
      const gravity =
        meta.gravity.includes("microgravity") &&
        other.gravity.includes("microgravity");
      const oxygen = meta.oxygenVariation && other.oxygenVariation;
      if (!fuels.length && !gravity && !oxygen) return [];
      return [
        {
          item,
          fuels,
          gravity,
          oxygen,
          source: getInvestigationEvidence(item.id).accession,
        },
      ];
    });
}
