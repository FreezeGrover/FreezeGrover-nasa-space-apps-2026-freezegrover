import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  investigations,
  searchInvestigations,
  getInvestigationEvidence,
  catalogSummary,
} from "../src/lib/research/catalog";
import { retrieveInvestigations } from "../src/lib/research/search";
import {
  emptyFilters,
  filterInvestigations,
  filterDefinitions,
} from "../src/lib/research/filters";
import {
  findSharedHardware,
  getExperimentMetadata,
} from "../src/lib/research/metadata";
const ids = (items: typeof investigations) => items.map((item) => item.id);
test("NASA combustion count is derived from retrieved records with unique verified PSI identities", () => {
  assert.equal(investigations.length, 24);
  assert.equal(catalogSummary.verifiedCombustionRecords, investigations.length);
  assert.equal(
    new Set(investigations.map((i) => getInvestigationEvidence(i.id).accession))
      .size,
    24,
  );
  for (const item of investigations) {
    const e = getInvestigationEvidence(item.id);
    assert.equal(e.researchArea, "Combustion Science");
    assert.ok(item.source.endsWith(e.accession));
    assert.equal(
      crypto
        .createHash("sha256")
        .update(
          fs.readFileSync(path.join("data/psi/raw", e.accession + ".json")),
        )
        .digest("hex"),
      e.recordSha256,
    );
  }
  assert.equal(getInvestigationEvidence("bass2").accession, "PSI-25");
  assert.equal(
    investigations.find((item) => item.source.endsWith("PSI-26"))!.name,
    "BASS",
  );
  assert.equal(
    investigations.filter((item) => item.name.includes("DAFT")).length,
    1,
  );
});
test("natural question retrieves documented flame-spread investigations with source reasons", () => {
  for (const q of [
    "how does microgravity affect flame spread",
    "how does microgravity affect flame propagation",
  ]) {
    const found = retrieveInvestigations(investigations, q);
    assert.ok(found.some((m) => m.item.id === "bass2"));
    assert.ok(found.some((m) => m.item.name === "BASS"));
    assert.ok(found.some((m) => m.item.name === "SAFFIRE-I"));
    const ground=found.find(m=>m.item.source.endsWith("PSI-62"));
    assert.ok(ground);assert.ok(ground.reasons.includes("Ground research: microgravity modeling context"));
    assert.ok(!getExperimentMetadata(ground.item.id).gravity.includes("microgravity"));
    assert.ok(found.every((m) => m.reasons.includes("Topic: spread")));
  }
});
test("unknown subjects and unsupported partial-gravity measurements do not receive fabricated results", () => {
  for (const q of [
    "how does microgravity affect banana growth",
    "unobtainium",
    "how does lunar gravity affect flame spread",
    "how does microgravity affect",
  ])
    assert.deepEqual(searchInvestigations(q), [], q);
});
test("scientific terms, exact names and PSI identifiers retrieve the documented records", () => {
  assert.ok(searchInvestigations("FLEX-2").some((i) => i.id === "flex2"));
  assert.deepEqual(ids(searchInvestigations("PSI-69")), ["flex"]);
  assert.ok(searchInvestigations("soot").some((i) => i.name === "SPICE"));
  assert.ok(
    searchInvestigations("how do smoke particles behave in microgravity").some(
      (i) => i.id === "samer",
    ),
  );
  assert.equal(searchInvestigations("").length, 24);
});
test("five filters cover every published dropdown option without losing source identity", () => {
  assert.equal(filterDefinitions.length, 5);
  for (const def of filterDefinitions)
    for (const [value] of def.options) {
      const list = filterInvestigations(investigations, {
        ...emptyFilters,
        [def.key]: value,
      });
      assert.ok(list.every((item) => investigations.includes(item)));
      if (value === "") assert.equal(list.length, 24);
    }
  assert.deepEqual(
    filterInvestigations(investigations, {
      ...emptyFilters,
      gravity: "partial",
    }),
    [],
  );
  assert.ok(
    filterInvestigations(investigations, {
      ...emptyFilters,
      gravity: "ground",
    }).some((i) => i.source.endsWith("PSI-62")),
  );
  assert.deepEqual(
    ids(
      filterInvestigations(investigations, {
        ...emptyFilters,
        hardware: "MDCA",
      }),
    ).sort(),
    ["flex", "flex2", "psi-39"].sort(),
  );
  assert.ok(
    filterInvestigations(investigations, { ...emptyFilters, fuel: "gas" }).some(
      (i) => i.name === "ACME CFI-G",
    ),
  );
  assert.ok(
    filterInvestigations(investigations, {
      ...emptyFilters,
      related: "PSI-102",
    }).some((i) => i.id === "samer"),
  );
  assert.ok(
    filterInvestigations(investigations, {
      ...emptyFilters,
      conditions: "pressure",
    }).some((i) => i.id === "flex"),
  );
});
test("intersecting filters and reset operate on real search results", () => {
  const found = searchInvestigations(
    "how does microgravity affect flame spread",
  );
  assert.ok(
    filterInvestigations(found, {
      ...emptyFilters,
      fuel: "solid",
      hardware: "MSG",
    }).some((i) => i.id === "bass2"),
  );
  assert.deepEqual(
    filterInvestigations(found, {
      ...emptyFilters,
      fuel: "liquid",
      hardware: "SAME",
    }),
    [],
  );
  assert.equal(filterInvestigations(investigations, emptyFilters).length, 24);
});
test("shared hardware uses imported hardware, not fuel similarity or related-name guesses", () => {
  assert.ok(findSharedHardware("flex").some((r) => r.id === "flex2"));
  assert.ok(
    findSharedHardware("bass2").some(
      (r) => r.id === "psi-26" && r.hardware.includes("MSG"),
    ),
  );
  assert.ok(!findSharedHardware("flex").some((r) => r.id === "bass2"));
  assert.ok(
    getExperimentMetadata("samer").related.some((r) =>
      r.url.endsWith("PSI-102"),
    ),
  );
});
test("downloaded data bytes and table previews preserve original sources; missing data stays explicit", () => {
  let tables = 0,
    records = 0;
  for (const item of investigations) {
    const e = getInvestigationEvidence(item.id);
    let downloaded = false;
    for (const table of e.tables) {
      if (table.status !== "downloaded") continue;
      tables++;
      downloaded = true;
      const bytes = fs.readFileSync(path.join("public", table.localUrl!));
      assert.equal(
        crypto.createHash("sha256").update(bytes).digest("hex"),
        table.sha256,
      );
      assert.ok(table.rows! > 0);
      assert.ok(table.columns!.length > 1);
      assert.ok(!table.url.includes("X-Amz-"));
    }
    if (downloaded) records++;
    assert.match(e.findingsStatus, /not independently verified/);
  }
  assert.equal(tables, catalogSummary.downloadedTables);
  assert.equal(records, catalogSummary.recordsWithDownloadedTables);
  const flex = getInvestigationEvidence("flex").tables.find(
    (t) => t.status === "downloaded",
  )!;
  assert.ok(flex.columns!.includes("Ambient pressure; mmHg"));
  assert.ok(flex.columns!.includes("Visible flame extinction diameter; mm"));
});
