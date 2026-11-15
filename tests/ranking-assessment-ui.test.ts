import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { Window } from "happy-dom";
import { getInvestigationEvidence } from "../src/lib/research/catalog";
import type { ConversationInput } from "../src/types/conversation";
test("question relevance, assessment dimensions, exact QA context and evidence-gap research actions work together", async () => {
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
  const previousFetch = globalThis.fetch,
    requests: ConversationInput[] = [];
  globalThis.fetch = async (_url, options) => {
    if (options?.method !== "POST") return Response.json({ configured: false });
    const input = JSON.parse(options.body as string);
    requests.push(input);
    return new Response(
      JSON.stringify({
        type: "result",
        answer: {
          query: input.message,
          mode: "catalog",
          recordIds: input.context.recordIds,
          statements: [],
          groundingIssues: [],
          notice: "No AI explanation in this test.",
        },
      }) + "\n",
    );
  };
  const { createRoot } = await import("react-dom/client"),
    { Dashboard } = await import("../src/components/Dashboard");
  const container = window.document.createElement("div");
  window.document.body.append(container);
  const root = createRoot(container as unknown as Element);
  const button = (label: string) =>
    [...window.document.querySelectorAll("button")].find(
      (el) => el.textContent.trim() === label,
    )!;
  const click = async (el: unknown) =>
    act(async () => {
      assert.ok(el);
      (el as { click: () => void }).click();
    });
  const refine = async (text: string) => {
    const input = window.document.querySelector("#ranking-question")!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, text);
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await click(button("Show investigations"));
  };
  const chooseModels = async () =>
    click(
      [...window.document.querySelectorAll(".goal-options button")].find(
        (el) => el.querySelector("strong")?.textContent === "Predictive Models",
      ),
    );
  try {
    await act(async () => root.render(React.createElement(Dashboard)));
    await click(button("Rankings"));
    await click(
      window.document.querySelector(
        'button[aria-label="Change mission context"]',
      ),
    );
    await click(button("Lunar Bases"));
    await chooseModels();
    await refine("PMMA");
    assert.equal(
      requests.length,
      0,
      "Local assessment does not make a paid AI call",
    );
    await click(
      window.document.querySelector(
        'button[aria-label="Assess PSI-62 evidence and confidence"]',
      ),
    );
    const dialog = window.document.querySelector("dialog[open]")!;
    assert.equal(
      dialog.querySelectorAll(".ranking-assessment-dimensions dt").length,
      10,
    );
    assert.match(dialog.textContent, /Narrative only in local coverage/);
    assert.match(dialog.textContent, /Withheld/);
    assert.match(dialog.textContent, /Not estimated/);
    await click(button("Review this assessment in Scientific QA ↗"));
    assert.equal(
      window.document.querySelector(".page-title")!.textContent,
      "Scientific QA",
    );
    assert.match(
      (
        window.document.querySelector(
          "#qa-statement",
        ) as unknown as HTMLTextAreaElement
      ).value,
      /PSI-62/,
    );
    assert.match(
      window.document.querySelector(".qa-assessment-context")!.textContent!,
      /Evidence quality: Narrative only in local coverage/,
    );
    assert.match(
      window.document.querySelector(".qa-handoff-question")!.textContent!,
      /PMMA/,
    );
    assert.equal(
      window.document.querySelector(".qa-handoff-evidence blockquote")!
        .textContent,
      getInvestigationEvidence("psi-62").objective,
    );
    await click(button("Rankings"));
    assert.ok(window.document.querySelector('button[aria-label="Assess PSI-62 evidence and confidence"]'), "Returning from QA preserves the submitted ranking");
    assert.equal((window.document.querySelector("#ranking-question") as unknown as HTMLInputElement).value, "PMMA");

    await click(
      window.document.querySelector(
        'button[aria-label="Change mission context"]',
      ),
    );
    await click(button("Lunar Bases"));
    await chooseModels();
    await refine("unobtainium plasma crystal");
    assert.equal(window.document.querySelectorAll(".ranking-row").length, 0);
    await click(button("Clear question"));
    assert.equal(window.document.querySelectorAll(".ranking-row").length, 0);
    await click(button("Show investigations"));
    assert.ok(window.document.querySelectorAll(".ranking-row").length);
    await refine("PMMA");
    await click(
      window.document.querySelector(
        'button[aria-label="Assess PSI-62 evidence and confidence"]',
      ),
    );
    await click(button("Investigate evidence gaps ↗"));
    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0].context.recordIds, ["psi-62"]);
    assert.equal(requests[0].context.goal, "Predictive Models");
    assert.match(requests[0].message, /PMMA/);
    assert.ok(window.document.querySelector(".conversation-log"));
  } finally {
    await act(async () => root.unmount());
    globalThis.fetch = previousFetch;
    await window.happyDOM.close();
  }
});
