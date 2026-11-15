import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { Window } from "happy-dom";
import { evidenceText } from "../src/lib/qa/grounding";
import { findNasaResource } from "../src/lib/resources/catalog";
import { answerReviewRequest } from "../src/lib/qa/handoff";
import type { ConversationAnswer } from "../src/types/conversation";

const second = {
  recordId: "flex2",
  field: "objective" as const,
  quote: evidenceText("flex2", "objective").slice(0, 180),
  interpretation: "Selected second statement about FLEX-2 objectives.",
  citationNumber: 2,
};
const first = {
  recordId: "flex",
  field: "objective" as const,
  quote: evidenceText("flex", "objective").slice(0, 180),
  interpretation: "First statement about FLEX objectives.",
  citationNumber: 1,
};
const source = findNasaResource("nasa-fire-detector")!,
  excerpt = source.excerpts[0];
const resource = {
  sourceId: source.id,
  excerptId: excerpt.id,
  quote: excerpt.text,
  interpretation: "A detector engineering statement.",
  claimType: excerpt.kind,
  citationNumber: 3,
};
const answer: ConversationAnswer = {
  query: "Compare these research objectives",
  mode: "openai",
  reply:
    "A completed research explanation.\n\n- The first study describes its objectives. [1]\n- The second has a separate objective. [2]",
  statements: [first, second],
  resourceStatements: [resource],
  recordIds: ["flex", "flex2"],
  sourceIds: [source.id],
  notice: "Review pending",
  groundingIssues: [],
};

test("QA handoff carries the selected citation without changing its source or quote", () => {
  const request = answerReviewRequest(answer, second)!;
  assert.equal(request.recordId, "flex2");
  assert.equal(request.quote, second.quote);
  assert.equal(request.question, answer.query);
  assert.equal(request.answerText, answer.reply);
  assert.equal(request.citations?.length, 3);
  const official = answerReviewRequest(answer, resource)!;
  assert.equal(official.sourceId, source.id);
  assert.equal(official.excerptId, excerpt.id);
  assert.equal(official.quote, excerpt.text);
  assert.equal(official.recordId, undefined);
});
test("answer finishes before actions; reopening does not replay; explicit QA selections retain full context", async () => {
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
  Object.defineProperty(window.HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      return this.classList.contains("conversation-log") ? 1200 : 0;
    },
  });
  Object.defineProperty(window.HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return this.classList.contains("conversation-log") ? 300 : 0;
    },
  });
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) =>
    options?.method === "POST"
      ? new Response(JSON.stringify({ type: "result", answer }) + "\n")
      : Response.json({ configured: true });
  const { createRoot } = await import("react-dom/client"),
    { Dashboard } = await import("../src/components/Dashboard");
  const container = window.document.createElement("div");
  window.document.body.append(container);
  const root = createRoot(container as unknown as Element);
  const buttons = (label: string) =>
    [...window.document.querySelectorAll("button")].filter(
      (button) => button.textContent.trim() === label,
    );
  const click = async (button: unknown) =>
    act(async () => {
      assert.ok(button);
      (button as { click: () => void }).click();
    });
  try {
    await act(async () => root.render(React.createElement(Dashboard)));
    const input = window.document.querySelector(
      'textarea[aria-label="Research question"]',
    )!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )!.set!.call(input, answer.query);
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await act(async () =>
      input.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    assert.equal(
      buttons("Review cited statement in Scientific QA ↗").length,
      0,
    );
    assert.equal(
      window.document.querySelectorAll(".conversation-paragraph summary")
        .length,
      0,
    );
    for (
      let attempt = 0;
      attempt < 35 &&
      !buttons("Review cited statement in Scientific QA ↗").length;
      attempt++
    ) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
    }
    assert.ok(buttons("Review cited statement in Scientific QA ↗").length);
    assert.equal(
      window.document
        .querySelector(".formatted-research-text")!
        .textContent!.includes("separate objective"),
      true,
    );
    const oldLog = window.document.querySelector(
      ".conversation-log",
    )! as unknown as HTMLElement;
    oldLog.scrollTop = 0;
    await act(async () =>
      oldLog.dispatchEvent(new window.Event("scroll") as unknown as Event),
    );
    await click(
      window.document.querySelector(
        'button[aria-label="Close research popup"]',
      ),
    );
    await click(buttons("Continue research")[0]);
    assert.equal(
      window.document.querySelectorAll('[aria-label="Writing response"]')
        .length,
      0,
    );
    assert.equal(
      (
        window.document.querySelector(
          ".conversation-log",
        ) as unknown as HTMLElement
      ).scrollTop,
      1200,
    );
    assert.match(
      window.document.querySelector(".conversation-log")!.textContent!,
      /separate objective/,
    );
    await click(buttons("Review statement in Scientific QA ↗")[1]);
    assert.equal(
      (
        window.document.querySelector(
          "#qa-statement",
        ) as unknown as HTMLTextAreaElement
      ).value,
      second.interpretation,
    );
    assert.match(
      window.document.querySelector(".qa-record-toolbar")!.textContent!,
      /FLEX-2/,
    );
    assert.match(
      window.document.querySelector(".qa-handoff-question")!.textContent!,
      /Compare these research objectives/,
    );
    assert.equal(
      window.document.querySelector(".qa-handoff-evidence blockquote")!
        .textContent,
      second.quote,
    );
    assert.match(
      window.document.querySelector(".qa-answer-context")!.textContent!,
      /A completed research explanation/,
    );
    const picker = window.document.querySelector("#qa-citation")!;
    assert.equal(picker.querySelectorAll("option").length, 3);
    await act(async () => {
      (picker as unknown as HTMLSelectElement).value = "2";
      picker.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
    assert.equal(
      window.document.querySelector(".qa-handoff-evidence blockquote")!
        .textContent,
      resource.quote,
    );
    assert.match(
      window.document.querySelector(".qa-record-toolbar")!.textContent!,
      /Fire Detector/i,
    );
    assert.match(
      window.document.querySelector(".qa-review-grid")!.textContent!,
      /Background context/,
    );
    await click(buttons("Show cited passage")[0]);
    assert.equal(
      window.document.querySelector(
        "dialog[open] .qa-exact-passage blockquote",
      )!.textContent,
      resource.quote,
    );
    assert.equal(
      window.document
        .querySelector("dialog[open] .qa-full-context")!
        .hasAttribute("open"),
      false,
      "Other passages stay collapsed",
    );
    await click(
      window.document.querySelector(
        'dialog[open] button[aria-label="Close research popup"]',
      ),
    );
    await act(async () => {
      (picker as unknown as HTMLSelectElement).value = "0";
      picker.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
    assert.equal(
      window.document.querySelector(".qa-handoff-evidence blockquote")!
        .textContent,
      first.quote,
    );
    assert.equal(
      (
        window.document.querySelector(
          "#qa-statement",
        ) as unknown as HTMLTextAreaElement
      ).value,
      first.interpretation,
    );
    assert.match(
      window.document.querySelector(".qa-answer-context")!.textContent!,
      /A completed research explanation/,
    );
    await click(buttons("Continue research")[0]);
    await click(buttons("Review official source in Scientific QA ↗")[0]);
    assert.equal(
      (
        window.document.querySelector(
          "#qa-statement",
        ) as unknown as HTMLTextAreaElement
      ).value,
      resource.interpretation,
    );
    assert.match(
      window.document.querySelector(".qa-record-toolbar")!.textContent!,
      /Fire Detector/i,
    );
    assert.equal(
      window.document.querySelector(".qa-handoff-evidence blockquote")!
        .textContent,
      resource.quote,
    );
  } finally {
    await act(async () => root.unmount());
    globalThis.fetch = previousFetch;
    await window.happyDOM.close();
  }
});
