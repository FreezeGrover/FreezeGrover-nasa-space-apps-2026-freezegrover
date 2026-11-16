import test from "node:test";
import { rankingReviewRequest } from "../src/lib/qa/handoff";
import assert from "node:assert/strict";
import {
  assessEvidence,
  assessRankingCandidate,
  pressureRangeDifferences,
} from "../src/lib/ranking/assessment";
import { selectRankingCandidates } from "../src/lib/ranking/selection";
import { rankingFrameworkGroups } from "../src/lib/ranking/framework";
import {
  investigations,
  findInvestigationById,
  getInvestigationEvidence,
} from "../src/lib/research/catalog";
import { getExperimentMetadata } from "../src/lib/research/metadata";
const dimension = (
  assessment: ReturnType<typeof assessRankingCandidate>,
  label: string,
) => assessment.dimensions.find((item) => item.label === label)!;
test("all twenty original principles have explicit reasoning or engineering coverage", () => {
  assert.deepEqual(
    [
      ...new Set(rankingFrameworkGroups.flatMap((group) => [...group.points])),
    ].sort((a, b) => a - b),
    Array.from({ length: 20 }, (_, index) => index + 1),
  );
  assert.ok(
    rankingFrameworkGroups.some(
      (group) =>
        (group.points as readonly number[]).includes(5) &&
        (group.points as readonly number[]).includes(13) &&
        (group.points as readonly number[]).includes(19),
    ),
  );
});
test("high question relevance does not upgrade narrative-only coverage into strong evidence or confidence", () => {
  const candidates = selectRankingCandidates(
    investigations,
    "Predictive Models",
    "Lunar Bases",
    "PMMA",
  );
  assert.ok(candidates.some((item) => item.id === "psi-62"));
  const assessment = assessRankingCandidate(
    "psi-62",
    "Predictive Models",
    "Lunar Bases",
    "PMMA",
  );
  assert.equal(
    dimension(assessment, "Research relevance").status,
    "Question topic match",
  );
  assert.equal(
    dimension(assessment, "Evidence quality").status,
    "Narrative only in local coverage",
  );
  assert.match(
    dimension(assessment, "Conclusion confidence").status,
    /Withheld/,
  );
  assert.equal(
    dimension(assessment, "Applicability").status,
    "Partial-gravity transfer unvalidated",
  );
  assert.equal(
    dimension(assessment, "Hazard likelihood").status,
    "Not estimated",
  );
  assert.equal(dimension(assessment, "Hazard severity").status, "Not assessed");
  assert.equal(
    selectRankingCandidates(
      investigations,
      "Predictive Models",
      "All",
      "unobtainium plasma crystal",
    ).length,
    0,
  );
});
test("CFI's differing pressure ranges preserve exact source fields and require context instead of a forced contradiction", () => {
  const assessment = assessRankingCandidate(
    "psi-39",
    "Predictive Models",
    "Space Stations",
  );
  assert.ok(assessment.conflicts.some((item) => item.range === "0.25…5"));
  assert.ok(assessment.conflicts.some((item) => item.range === "0.25…0.5"));
  assert.equal(
    dimension(assessment, "Uncertainty and conflicts").status,
    "Potential condition mismatch",
  );
  assert.match(
    dimension(assessment, "Uncertainty and conflicts").limits.join(" "),
    /can both be valid/,
  );
  assert.ok(
    dimension(assessment, "Uncertainty and conflicts").basis.some((text) =>
      text.includes("Units or concentration basis"),
    ),
  );
  assert.equal(
    dimension(assessment, "Prediction readiness").status,
    "Not ready for validated prediction",
  );
  assert.equal(
    pressureRangeDifferences([
      { field: "a", text: ".25 to 5 atm" },
      { field: "b", text: "0.250 atm to 5.0 atm" },
    ]).length,
    0,
  );
  assert.equal(
    pressureRangeDifferences([
      { field: "a", text: "0.25 to 5 atm" },
      { field: "b", text: "1 to 2 kPa" },
    ]).length,
    0,
    "No silent unit conversion or cross-unit range comparison",
  );
});
test("complete-looking metadata and more files still cannot certify a scientific prediction", () => {
  const item = findInvestigationById("flex")!,
    evidence = structuredClone(getInvestigationEvidence(item.id)),
    metadata = structuredClone(getExperimentMetadata(item.id));
  evidence.objective = "Study liquid-fuel combustion.";
  evidence.approach = "Controlled droplets observed with cameras.";
  metadata.geometry = "Spherical droplets";
  metadata.sensors = "Cameras";
  metadata.oxygenVariation = true;
  metadata.pressureProtocol = "0.5 to 1.5 atm";
  metadata.variations = "Airflow varied";
  const result = assessEvidence({
    item,
    evidence,
    metadata,
    goal: "Predictive Models",
    environment: "Spacecraft",
  });
  assert.ok(
    !result.dimensions.some((entry) =>
      /^Verified$|^High confidence$|\d+%/.test(entry.status),
    ),
  );
  assert.match(
    dimension(result, "Prediction readiness").limits.join(" "),
    /independent data/,
  );
  assert.equal(result.provenance.hash, evidence.recordSha256);
  assert.equal(result.provenance.tables[0].sha256, evidence.tables[0].sha256);
});
test("all goal/environment combinations keep assessment dimensions separate and catalog provenance stable", () => {
  for (const goal of [
    "Crew Safety",
    "Predictive Models",
    "Safety Equipment",
    "Earth Applications",
  ] as const)
    for (const environment of [
      "All",
      "Spacecraft",
      "Space Stations",
      "Lunar Bases",
      "Martian Bases",
      "Pressurized Rovers",
    ] as const) {
      const candidates = selectRankingCandidates(
        investigations,
        goal,
        environment,
      );
      assert.ok(candidates.every((item) => item.goals.includes(goal)));
      for (const item of candidates) {
        const assessment = assessRankingCandidate(item.id, goal, environment);
        assert.equal(
          new Set(assessment.dimensions.map((entry) => entry.label)).size,
          10,
        );
        assert.equal(assessment.provenance.url, item.source);
        assert.equal(
          dimension(assessment, "Hazard likelihood").status,
          "Not estimated",
        );
        assert.doesNotMatch(
          JSON.stringify(assessment.dimensions),
          /\bambiguous\b/i,
        );
      }
    }
});

test("a missing local goal tag never replaces CFI with the different CFI-G investigation", () => {
  const result = selectRankingCandidates(
    investigations,
    "Predictive Models",
    "Lunar Bases",
    "CFI",
  );
  assert.deepEqual(
    result.map((item) => item.id),
    ["psi-39"],
  );
  assert.match(
    dimension(
      assessRankingCandidate(
        "psi-39",
        "Predictive Models",
        "Lunar Bases",
        "CFI",
      ),
      "Research relevance",
    ).basis.join(" "),
    /not classified/,
  );
});

test("ranking QA preserves both reported ranges, conditions and the versioned source context", () => {
  const assessment = assessRankingCandidate(
      "psi-39",
      "Predictive Models",
      "Lunar Bases",
      "CFI",
    ),
    request = rankingReviewRequest(assessment);
  assert.equal(request.recordId, "psi-39");
  assert.equal(request.quote, getInvestigationEvidence("psi-39").objective);
  assert.match(
    request.reviewContext!,
    /NASA objective reports “0.25 atm to 5 atm”/,
  );
  assert.match(
    request.reviewContext!,
    /NASA approach reports “0.25 to 0.5 atm”/,
  );
  assert.ok(request.reviewContext!.includes(assessment.provenance.hash));
  assert.match(request.reviewContext!, /Lunar Bases/);
});
