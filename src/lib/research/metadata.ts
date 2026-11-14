import type { ExperimentMetadata } from "@/types/research";
const psi = "https://psi.nasa.gov/physci/repo/data/investigations/";
const overview =
  "https://www.nasa.gov/missions/station/studying-combustion-and-fire-safety/";
const mdca = "https://gipoc.grc.nasa.gov/wp/fcf-cir/mdca/";
const hardwareSource = {
  label: "NASA Glenn · MDCA / CIR experiments",
  url: mdca,
};
const partialGravityGap =
  "This starter catalog has no direct lunar- or Martian-gravity test records. Microgravity results cannot establish partial-gravity fire behavior without validation. This is a catalog coverage gap, not a claim that NASA has no partial-gravity research.";
// Relationships record what a NASA source establishes, not just similar names.
// The wireframe is layout guidance; its illustrative scientific claims are not evidence.
export const experimentMetadata: Record<string, ExperimentMetadata> = {
  flex: {
    topics: ["droplet", "suppression", "cool", "oxygen", "pressure"],
    fuelCategory: "liquid",
    gravity: ["microgravity"],
    hardware: ["MDCA", "CIR"],
    oxygenVariation: true,
    pressureProtocol:
      "0.5–1.5 atm in the PSI-69 limiting-oxygen-index test procedure. This is a described protocol range, not an imported per-run measurement.",
    geometry:
      "Liquid droplets. The PSI-69 procedure describes an approximately 3 mm starting droplet for one test sequence; exact per-run dimensions are not imported.",
    variations:
      "The PSI-69 approach varies droplet size, ambient oxygen fraction, pressure, and suppressant. Slow-flow tests examine extinction; a matched test matrix is not imported.",
    sensors:
      "Burning/extinction diagnostics are described in the source. A test-specific sensor inventory, calibration, and measurement files are not imported.",
    gravityGap: partialGravityGap,
    related: [
      {
        name: "FLEX-2",
        localId: "flex2",
        reason:
          "Shares the MDCA apparatus in CIR; shared hardware does not mean identical conditions.",
        url: mdca,
      },
      {
        name: "CFI",
        reason:
          "NASA lists CFI under MDCA together with FLEX. CFI studies cool-flame droplet combustion; it is not a solid-fuel experiment.",
        url: mdca,
      },
    ],
    sources: [
      { label: "NASA PSI-69 · Approach", url: psi + "PSI-69" },
      hardwareSource,
    ],
  },
  flex2: {
    topics: ["droplet", "soot"],
    fuelCategory: "liquid",
    gravity: ["microgravity"],
    hardware: ["MDCA", "CIR"],
    oxygenVariation: false,
    pressureProtocol: null,
    geometry:
      "Liquid-fuel droplets and mixtures. Exact shape, size distribution, and individual test dimensions are not imported.",
    variations:
      "NASA describes burning rates, soot formation, and evaporation of fuel mixtures. The detailed test matrix and matched comparison conditions are not imported.",
    sensors:
      "Raw measurement channels, instrument configuration, and calibration are not imported. Do not assume FLEX sensor settings apply unchanged.",
    gravityGap: partialGravityGap,
    related: [
      {
        name: "FLEX",
        localId: "flex",
        reason:
          "Shares MDCA in CIR; predecessor research provides context, not interchangeable data.",
        url: mdca,
      },
      {
        name: "CFI",
        reason:
          "Another MDCA investigation. NASA lists this hardware relationship; outcome comparability remains unassessed.",
        url: mdca,
      },
    ],
    sources: [
      hardwareSource,
      { label: "NASA · Combustion and fire safety", url: overview },
    ],
  },
  bass2: {
    topics: ["spread", "solid"],
    fuelCategory: "solid",
    gravity: ["microgravity", "normal-comparison"],
    hardware: [],
    oxygenVariation: false,
    pressureProtocol: null,
    geometry:
      "Solid-fuel samples. Original sample geometry, dimensions, and material-by-test records are not imported.",
    variations:
      "NASA describes microgravity and normal-gravity material-burning comparisons. Matched oxygen, airflow, pressure, and geometry must be checked in original records.",
    sensors:
      "Flame-spread and fuel-regression research is reported by NASA. Exact sensors, calibrations, and measurement time series are not imported.",
    gravityGap:
      partialGravityGap +
      " Normal-gravity comparisons are mentioned by NASA; they are not direct lunar or Mars tests.",
    related: [
      {
        name: "PSI-62",
        reason:
          "NASA PSI-62 describes modeling using BASS and BASS-II experimental benchmarks. This is a modeling/data relationship; shared hardware is not established here.",
        url: psi + "PSI-62",
      },
    ],
    sources: [
      { label: "NASA · BASS-II research context", url: overview },
      { label: "NASA PSI-62 · BASS benchmark modeling", url: psi + "PSI-62" },
    ],
  },
  samer: {
    topics: ["smoke"],
    fuelCategory: "smoke",
    gravity: ["microgravity", "normal-comparison"],
    hardware: ["SAME"],
    oxygenVariation: false,
    pressureProtocol: null,
    geometry:
      "Smoke-generating samples including Pyrell foam. Individual sample dimensions are not imported.",
    variations:
      "NASA describes replacing DBP with Pyrell, broader heating conditions, and no-flow intervals during heating. Per-test temperatures and flow values are not imported.",
    sensors:
      "PSI-101 describes an M-pass diagnostic replacing one commercial diagnostic enclosure and discusses thermal-precipitator/TEM-grid contamination in the earlier SAME experiment. Raw sensor outputs and calibration remain unavailable here.",
    gravityGap:
      partialGravityGap +
      " PSI-101 discusses post-flight ground tests. The particle-growth hypothesis is not treated as a measured result.",
    related: [
      {
        name: "SAME · PSI-102",
        reason:
          "Explicit related investigation in NASA PSI-101. SAME-R reused SAME hardware with documented modifications.",
        url: psi + "PSI-102",
      },
    ],
    sources: [
      { label: "NASA PSI-101 · Objectives and Approach", url: psi + "PSI-101" },
    ],
  },
};
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
