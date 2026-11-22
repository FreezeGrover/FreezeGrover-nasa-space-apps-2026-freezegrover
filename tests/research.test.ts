import test from "node:test";
import assert from "node:assert/strict";
import { searchInvestigations, findInvestigationById, investigations } from "../src/lib/research/catalog";
import { nasaResources } from "../src/lib/resources/catalog";

test("public NASA catalog retrieval remains accessible without private reasoning", () => {
  assert.ok(investigations.length > 0);
  assert.ok(searchInvestigations("smoke").some(record => record.id === "samer"));
  assert.equal(searchInvestigations("unobtainium").length, 0);
  assert.equal(findInvestigationById("missing"), undefined);
  assert.ok(nasaResources.length > 0);
});
