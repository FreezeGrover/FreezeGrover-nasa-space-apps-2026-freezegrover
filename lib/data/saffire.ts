import type { Experiment, Finding } from "../domain";

/**
 * Verified experiment-level evidence seed for FREEZGROVER.
 *
 * Scope remains conservative: only claims supported by reviewed official
 * NASA/NTRS sources are encoded. Safety extrapolations are deliberately
 * excluded from this dataset.
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
  {
    id: "saffire-ii",
    name: "Spacecraft Fire Experiment II (Saffire-II)",
    objective:
      "Measure flame spread and flammability behavior across multiple spacecraft-relevant materials in microgravity.",
    conditions: {
      gravity: "microgravity",
      airflowCmPerS: 20,
      material: "Multiple spacecraft-relevant materials, including SIBAL, PMMA, silicone, Nomex, and other coupon samples",
      geometry: "Nine smaller material coupons mounted in the Saffire flow duct",
      ignition: "electrical/hot-wire igniters",
      notes: [
        "Saffire-II used multiple smaller coupons rather than one large panel.",
        "Individual samples differed in material, thickness, orientation, and burn response; those conditions must be compared sample by sample rather than treated as one homogeneous test.",
      ],
    },
    measurements: [
      "flame imagery",
      "flame spread behavior",
      "sample ignition and extinction behavior",
      "temperature",
      "gas concentrations",
      "flow velocity",
    ],
    sourceIds: [
      "ntrs-saffire-results-2017",
      "ntrs-saffire-operations-2017",
      "ntrs-saffire-i-iii-results-2018",
    ],
  },
  {
    id: "saffire-iii",
    name: "Spacecraft Fire Experiment III (Saffire-III)",
    objective:
      "Repeat a large-scale SIBAL flame-spread experiment under a different forced-flow condition to extend the Saffire-I comparison set.",
    conditions: {
      gravity: "microgravity",
      airflowCmPerS: 25,
      material: "SIBAL cotton-fiberglass composite (75% cotton, 25% fiberglass by mass)",
      thicknessMm: 0.37,
      geometry: "approximately 40 cm wide × 94 cm long fabric sample in a forced-flow duct",
      ignition: "hot-wire ignition",
      notes: [
        "Saffire-III reused the large thin SIBAL configuration from Saffire-I with a higher commanded flow velocity.",
        "The Saffire I-III consolidated NASA report is used as the primary source for executed conditions and comparison context.",
      ],
    },
    measurements: [
      "flame imagery",
      "flame spread behavior",
      "temperature",
      "gas concentrations",
      "flow velocity",
    ],
    sourceIds: [
      "nasa-saffire-iii-2017",
      "ntrs-saffire-operations-2017",
      "ntrs-saffire-i-iii-results-2018",
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
  {
    id: "saffire-ii-material-dependent-response",
    experimentId: "saffire-ii",
    statement:
      "Saffire-II showed that the tested material coupons did not behave uniformly: some samples sustained flame spread while others self-extinguished or showed limited propagation under the common spacecraft flow environment.",
    evidenceType: "reported-result",
    conditions: {
      gravity: "microgravity",
      airflowCmPerS: 20,
      material: "Multiple spacecraft-relevant coupon materials",
      geometry: "nine individual coupon tests",
    },
    measurement: "ignition, flame spread, and extinction behavior across material coupons",
    sourceIds: ["ntrs-saffire-results-2017", "ntrs-saffire-i-iii-results-2018"],
    sourceLocator: "Saffire-II results tables and material-by-material discussion",
    limitations: [
      "This is a cross-sample finding. It must not be interpreted as meaning that all Saffire-II materials had the same thickness, geometry, or ignition response.",
      "Material-specific questions should be answered from the corresponding coupon record once the individual Saffire-II samples are ingested separately.",
    ],
  },
  {
    id: "saffire-iii-higher-flow-comparison",
    experimentId: "saffire-iii",
    statement:
      "Saffire-III repeated the large SIBAL configuration used in Saffire-I at a higher forced-flow condition, creating a direct microgravity comparison for evaluating the effect of flow velocity on large-scale flame spread.",
    evidenceType: "reported-result",
    conditions: {
      gravity: "microgravity",
      airflowCmPerS: 25,
      material: "SIBAL cotton-fiberglass composite (75% cotton, 25% fiberglass by mass)",
      thicknessMm: 0.37,
      geometry: "approximately 40 cm wide × 94 cm long fabric sample",
    },
    measurement: "large-scale flame-spread comparison under different flow velocity",
    sourceIds: ["ntrs-saffire-i-iii-results-2018"],
    sourceLocator: "Consolidated Saffire I-III conditions/results table and comparison discussion",
    limitations: [
      "This record establishes the comparative test design and executed condition. It does not by itself encode a quantitative causal relationship between airflow and flame-spread rate.",
      "A quantitative airflow effect should only be stated after the relevant spread-rate values are extracted and cross-checked from the technical results.",
    ],
  },
];
