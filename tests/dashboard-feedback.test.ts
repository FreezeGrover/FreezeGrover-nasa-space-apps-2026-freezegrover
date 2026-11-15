import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { Window } from "happy-dom";
import { investigations } from "../src/lib/research/catalog";
import { prioritizeForEnvironment } from "../src/lib/research/environment-relevance";
import { findNasaResource } from "../src/lib/resources/catalog";
import { buildEvidenceReferences } from "../src/lib/research/evidence-references";
import { checkMaterialClaims } from "../src/lib/ai/natural-review";

test("environment selection changes research order without changing catalog membership or claiming direct lunar data", () => {
  const all = prioritizeForEnvironment(investigations, "All"),
    lunar = prioritizeForEnvironment(investigations, "Lunar Bases"),
    station = prioritizeForEnvironment(investigations, "Space Stations");
  assert.deepEqual(all, investigations);
  assert.notDeepEqual(
    lunar.map((item) => item.id),
    all.map((item) => item.id),
  );
  assert.notDeepEqual(
    station.map((item) => item.id),
    lunar.map((item) => item.id),
  );
  assert.deepEqual(
    lunar.map((item) => item.id).sort(),
    all.map((item) => item.id).sort(),
  );
  const source = findNasaResource("nasa-challenge-2026")!;
  for (const id of [
    "dashboard-objectives",
    "scope",
    "research-attributes",
    "shared-instrument",
    "bre",
    "acme-hardware",
    "mdca-hardware",
    "msg-hardware",
    "spacesuits",
    "habitat-atmosphere",
    "cfi-g-oxygen",
    "partial-gravity",
    "e-field",
    "gravity-bounds",
  ])
    assert.ok(
      source.excerpts.some((excerpt) => excerpt.id === id),
      id,
    );
  assert.match(
    source.excerpts.find((excerpt) => excerpt.id === "partial-gravity")!.text,
    /no partial-gravity combustion data/,
  );
  const refs = buildEvidenceReferences({
      missionContext: "",
      records: [],
      resources: [source],
    }),
    ref = refs.find((item) => item.id.endsWith(":oxygen"))!;
  assert.deepEqual(
    checkMaterialClaims(
      {
        reply: "1. Oxygen matters. [1]\n2. Conditions matter. [1]",
        claims: [
          {
            evidenceId: ref.id,
            interpretation: "Oxygen and conditions matter.",
          },
        ],
      },
      refs,
    ),
    [],
    "List numbering is not an experimental measurement",
  );
});
test("structured replies render safely and QA sidebar opens a visible cited statement", async () => {
  const window = new Window({ url: "http://localhost:3022" });
  for (const name of [
    "window",
    "document",
    "sessionStorage",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLTextAreaElement",
    "HTMLSelectElement",
    "HTMLDialogElement",
    "Event",
    "KeyboardEvent",
    "MouseEvent",
    "Node",
  ])
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: (window as unknown as Record<string, unknown>)[name],
    });
  (globalThis as unknown as Record<string, unknown>).React = React;
  (globalThis as unknown as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT =
    true;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({ matches: true }),
  });
  const originalFetch = globalThis.fetch,
    source = findNasaResource("nasa-fire-detector")!,
    excerpt = source.excerpts[0],
    claim =
      "The source describes discrimination between combustion particles and dust.";
  const answer = {
    query: "Explain detection",
    mode: "openai",
    reply:
      "**Detection**\n\n- Smoke particles matter. [1]\n- Dust discrimination matters. [1]\n\n<script>alert('x')</script>",
    statements: [],
    recordIds: [],
    sourceIds: [source.id],
    resourceStatements: [
      {
        sourceId: source.id,
        excerptId: excerpt.id,
        quote: excerpt.text,
        interpretation: claim,
        claimType: excerpt.kind,
      },
    ],
    notice: "Review pending",
    groundingIssues: [],
  };
  globalThis.fetch = async (_url, options) =>
    options?.method === "POST"
      ? new Response(JSON.stringify({ type: "result", answer }) + "\n")
      : Response.json({ configured: true });
  const { createRoot } = await import("react-dom/client"),
    { Dashboard } = await import("../src/components/Dashboard");
  const el = window.document.createElement("div");
  window.document.body.append(el);
  const root = createRoot(el as unknown as Element);
  const button = (label: string) =>
    [...window.document.querySelectorAll("button")].find(
      (node) => node.textContent.trim() === label,
    )!;
  try {
    await act(async () => root.render(React.createElement(Dashboard)));
    const input = window.document.querySelector(
      'textarea[aria-label="Research question"]',
    )!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )!.set!.call(input, "Explain detection");
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await act(async () => {
      input.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    assert.ok(window.document.querySelector(".formatted-research-text strong"));
    assert.equal(
      window.document.querySelectorAll(".formatted-research-text li").length,
      2,
    );
    assert.equal(window.document.querySelectorAll("script").length, 0);
    await act(async () =>
      window.document
        .querySelector('button[aria-label="Close research popup"]')!
        .dispatchEvent(new window.MouseEvent("click", { bubbles: true })),
    );
    await act(async () => button("Scientific QA").click());
    const draft = window.document.querySelector(
      "#qa-statement",
    ) as unknown as HTMLTextAreaElement;
    assert.equal(draft.value, claim);
    await act(async () => button("Investigations").click());
    assert.match(
      window.document.body.textContent,
      /Showing studies from your last question/,
    );
    await act(async () => button("Browse all investigations").click());
    assert.ok(button("Browse investigations · 24 ↗"));
    assert.doesNotMatch(
      window.document.body.textContent,
      /Showing studies from your last question/,
    );
    await act(async () => button("Continue research").click());
    assert.match(
      window.document.querySelector(".conversation-log")!.textContent,
      /Smoke particles matter/,
    );

    assert.match(
      window.document.body.textContent,
      /NASA.*Detector|Fire Detector/i,
    );
  } finally {
    await act(async () => root.unmount());
    globalThis.fetch = originalFetch;
    await window.happyDOM.close();
  }
});

test("every partial Markdown prefix advances while the response is being revealed", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server"),
    { FormattedResearchText } =
      await import("../src/components/FormattedResearchText");
  for (const prefix of [
    "- ",
    "* ",
    "# ",
    "## ",
    "1. ",
    "2) ",
    "- **",
    "\n- ",
  ]) {
    assert.ok(
      renderToStaticMarkup(
        React.createElement(FormattedResearchText, { text: prefix }),
      ).includes("formatted-research-text"),
    );
  }
});
