import test from "node:test";
import assert from "node:assert/strict";
import {numericEvidenceTokens, unsupportedNumericValues} from "../src/lib/qa/numbers";
import {reviewScientificClaim} from "../src/lib/qa/review";
import {evidenceText, validateGrounding} from "../src/lib/qa/grounding";

test("numeric evidence preserves whole values, signs, exponents and percentages", () => {
  for (const source of ["15", "0.5", "-5", "+5", "5%", "5e3"])
    assert.deepEqual(unsupportedNumericValues("5", source), ["5"], source);
  assert.deepEqual(unsupportedNumericValues("5%", "5"), ["5%"]);
  assert.deepEqual(unsupportedNumericValues("5 % and -0.5 and 1e-3", "5% -0.5 1e-3"), []);
  assert.deepEqual(numericEvidenceTokens("15.2, -3.0, .5, 2e+4, 5 %"), ["15.2", "-3.0", ".5", "2e+4", "5%"]);
  assert.deepEqual(unsupportedNumericValues("5 and 5", "15"), ["5"]);
});

test("grounding rejects a percentage invented from a bare source number", () => {
  const quote = evidenceText("flex", "table");
  const bare = numericEvidenceTokens(quote).find(value => !value.endsWith("%") && !numericEvidenceTokens(quote).includes(value + "%"));
  assert.ok(bare, "The downloaded FLEX table should contain a bare numeric value");
  const result = validateGrounding([{recordId:"flex", field:"table", quote, interpretation:`The improvement was ${bare}%.`}]);
  assert.equal(result.accepted.length, 0);
  assert.match(result.issues.join(" "), /unsupported numerical value/);
});

test("QA keeps signed and percentage values explicit and never verifies them", () => {
  const checks = reviewScientificClaim("A change of -999999% was observed.", "bass2");
  assert.match(checks[0].detail, /-999999%/);
  assert.equal(checks[0].status, "Needs Review");
  assert.ok(checks.every(check => check.status !== "Verified"));
});
