import test from "node:test";
import assert from "node:assert/strict";
import {
  investigations,
  searchInvestigations,
  findInvestigationById,
} from "../src/lib/research/catalog";
import { compareExperimentalConditions } from "../src/lib/comparison/compare";
import {
  findRelevantInvestigations,
  explainRankingReason,
} from "../src/lib/ranking/rank";
import { reviewScientificClaim } from "../src/lib/qa/review";
test("search finds smoke research and handles missing records", () => {
  assert.ok(searchInvestigations("smoke").some((i) => i.id === "samer"));
  assert.equal(searchInvestigations("unobtainium").length, 0);
  assert.equal(findInvestigationById("missing"), undefined);
});
test("comparison keeps missing experimental data explicit", () => {
  const rows = compareExperimentalConditions(
    investigations[0],
    investigations[1],
  );
  assert.equal(rows.length, 7);
  assert.match(rows[2][1], /not imported/);
});
test("relevance preserves source order and does not imply a validated habitat ranking", () => {
  const list = findRelevantInvestigations(investigations, "Crew Safety");
  assert.deepEqual(
    list.map((i) => i.id),
    ["flex", "bass2", "samer"],
  );
  assert.match(
    explainRankingReason(list[0], "Crew Safety", "Lunar Bases"),
    /separate validation/,
  );
});
test("QA never verifies claims without original evidence", () => {
  for (const text of [
    "",
    "Flame spread increased 50%",
    "Sources contradict one another",
  ]) {
    const checks = reviewScientificClaim(text);
    assert.equal(
      checks.some((c) => c.status === "Verified"),
      false,
    );
    assert.ok(checks.some((c) => c.status === "Pending Evidence"));
  }
});
