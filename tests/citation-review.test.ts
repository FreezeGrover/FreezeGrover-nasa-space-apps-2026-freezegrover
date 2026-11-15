import test from "node:test";
import assert from "node:assert/strict";
import { reviewCitation } from "../src/lib/qa/citation-review";
import { evidenceText } from "../src/lib/qa/grounding";
import { findNasaResource } from "../src/lib/resources/catalog";

test("citation checks preserve source identity and do not treat quotation matching as scientific approval", () => {
  const source = findNasaResource("nasa-fire-detector")!;
  const excerpt = source.excerpts[0];
  const request = {
    sourceId: source.id,
    excerptId: excerpt.id,
    quote: excerpt.text,
    statement: "A detector engineering statement.",
  };
  const checks = reviewCitation(request);
  assert.equal(checks[0].status, "Passage found");
  assert.match(checks[0].detail, new RegExp(source.role));
  assert.equal(checks[1].status, "Background context");
  assert.equal(checks[3].status, "Human review needed");
  assert.ok(checks.every((check) => check.status !== "Verified"));
  assert.equal(
    reviewCitation({ ...request, quote: "An invented passage." })[0].status,
    "Select a passage",
  );
  assert.equal(
    reviewCitation({ ...request, statement: "The result was 999999%." })[2]
      .status,
    "Values need checking",
  );
  const primary = reviewCitation({
    recordId: "flex2",
    field: "objective",
    quote: evidenceText("flex2", "objective"),
    statement: "FLEX-2 describes droplet research objectives.",
  });
  assert.equal(primary[0].status, "Passage found");
  assert.equal(primary[1].status, "Conditions available");
  assert.equal(primary[2].status, "Interpretation needs review");
});
