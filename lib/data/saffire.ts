import type { Experiment, Finding } from "../domain";

/**
 * First verified experiment-level evidence seed for FREEZGROVER.
 *
 * Scope is intentionally narrow: only claims directly supported by official
 * NASA/NTRS sources reviewed for Saffire-I are encoded here. Safety
 * extrapolations are deliberately excluded at this stage.
 */
export const saffireExperiments: Experiment[] = [
  {
    id: "saffire-i",
    name: "Spacecraft Fire Experiment I (Saffire-I)",
    objective:
      "Study large-scale flame spread over a spacecraft-relevant solid fuel sample in microgravity.",
    conditions: {
      gravity: "microgravity",
      airflowCmPerS: 20,
      material: "SIBAL cotton-fiberglass composite (75% cotton, 25% fiberglass by mass)",
      thicknessMm: 0.37,
      geometry: "40.6 cm wide × 94 cm long fabric sample in a forced-flow duct",
      ignition: "hot-wire ignition",
      notes: [
        "Concurrent and opposed flame-spread regions were examined.",
        "The large-scale sample was approximately an order of magnitude larger than earlier microgravity samples described in the NASA technical report.",
      ],
    },
    measurements: [
      "flame imagery",
      "flame spread behavior",
      "temperature",
      "radiation",
      "oxygen concentration",
      "carbon dioxide concentration",
      "flow velocity",
    ],
    sourceIds: [
      "nasa-saffire-i-2016",
      "nasa-saffire-i-ignition-2016",
      "ntrs-saffire-results-2017",
    ],
  },
];

export const saffireFindings: Finding[] = [
  {
    id: "saffire-i-burn-duration",
    experimentId: "saffire-i",
    statement:
      "NASA reported that the Saffire-I cotton-fiberglass sample burned for about eight minutes, with video showing a slow-moving flame progressing across the sample.",
    evidenceType: "reported-result",
    conditions: {
      gravity: "microgravity",
      airflowCmPerS: 20,
      material: "SIBAL cotton-fiberglass composite (75% cotton, 25% fiberglass by mass)",
      thicknessMm: 0.37,
      geometry: "40.6 cm wide × 94 cm long fabric sample",
    },
    measurement: "flame imagery / burn duration",
    sourceIds: ["nasa-saffire-i-ignition-2016"],
    sourceLocator: "NASA mission article, June 14, 2016 experiment updates",
    limitations: [
      "The approximately eight-minute duration is reported in NASA's mission update and should not be treated as a universal burn duration for other materials or flow conditions.",
    ],
  },
  {
    id: "saffire-i-concurrent-flame-constrained",
    experimentId: "saffire-i",
    statement:
      "For the Saffire-I concurrent flame-spread test, the flame size remained constrained after the ignition transient; the NASA technical report states that this behavior differed qualitatively from normal-gravity upward flame spread on a sample of this size, where the flame accelerates and grows.",
    evidenceType: "reported-result",
    conditions: {
      gravity: "microgravity",
      airflowCmPerS: 20,
      material: "SIBAL cotton-fiberglass composite (75% cotton, 25% fiberglass by mass)",
      thicknessMm: 0.37,
      geometry: "94 cm × 40.6 cm thin charring solid sample",
    },
    measurement: "concurrent flame-spread behavior",
    sourceIds: ["ntrs-saffire-results-2017"],
    sourceLocator: "Results of Large-Scale Spacecraft Flammability Tests, Saffire-I results discussion",
    limitations: [
      "This comparison applies to the reported Saffire-I configuration and does not establish the same behavior for other fuels, oxygen levels, pressures, or flow speeds.",
    ],
  },
];
