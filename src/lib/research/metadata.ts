import snapshot from "@/data/psi-catalog.json";
import type { ExperimentMetadata } from "@/types/research";
export const experimentMetadata: Record<string, ExperimentMetadata> =
  Object.fromEntries(
    snapshot.records.map((record) => [
      record.item.id,
      record.metadata as ExperimentMetadata,
    ]),
  );
export function getExperimentMetadata(id: string) {
  return experimentMetadata[id];
}
export function findSharedHardware(id: string) {
  const selected = getExperimentMetadata(id);
  return Object.entries(experimentMetadata)
    .filter(
      ([otherId, other]) =>
        otherId !== id &&
        other.hardware.some((h) => selected.hardware.includes(h)),
    )
    .map(([otherId, other]) => ({
      id: otherId,
      hardware: other.hardware.filter((h) => selected.hardware.includes(h)),
    }));
}
