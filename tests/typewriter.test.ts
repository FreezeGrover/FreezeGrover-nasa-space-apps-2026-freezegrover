import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { Window } from "happy-dom";
test("checked replies reveal progressively, respect manual scrolling and jump to the latest text", async () => {
  const window = new Window({ url: "http://localhost:3022" });
  for (const name of [
    "window",
    "document",
    "HTMLElement",
    "HTMLDialogElement",
    "Event",
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
  const { createRoot } = await import("react-dom/client"),
    { ResearchConversation } =
      await import("../src/components/ResearchConversation");
  const element = window.document.createElement("div");
  window.document.body.append(element);
  const root = createRoot(element as unknown as Element);
  const reply = "The checked response grows progressively. ".repeat(20),
    answer = {
      query: "question",
      mode: "openai" as const,
      reply,
      statements: [],
      recordIds: [],
      notice: "Review",
      groundingIssues: [],
    };
  const conversation = {
    messages: [
      {
        id: "a",
        role: "assistant" as const,
        content: reply,
        answer,
        status: "complete" as const,
        elapsed: 3,
      },
    ],
    revealId: "a",
    finishReveal:()=>{},
    answer,
    submitted: "question",
    pending: false,
    phase: null,
    elapsed: 3,
    ready: true,
    storageNotice: "",
    send: async () => {},
    cancel: () => {},
    clear: () => {},
    setAnswer: () => {},
  };
  try {
    await act(async () =>
      root.render(
        React.createElement(ResearchConversation, {
          open: true,
          onClose: () => {},
          conversation,
          context: { tab: "Overview", recordIds: [] },
          environment: "All",
          onReview: () => {},
          onBrowse: () => {},
          onCompare: () => {},
        }),
      ),
    );
    const paragraph = window.document.querySelector(".conversation-text")!;
    assert.ok(paragraph.textContent.length < reply.length);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 85));
    });
    assert.ok(paragraph.textContent.length > 0);
    assert.ok(paragraph.textContent.length < reply.length);
    const log = window.document.querySelector(
      ".conversation-log",
    )! as unknown as HTMLElement;
    Object.defineProperty(log, "scrollHeight", {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(log, "clientHeight", {
      configurable: true,
      value: 300,
    });
    log.scrollTop = 0;
    await act(async () => {
      log.dispatchEvent(new window.Event("scroll") as unknown as Event);
    });
    const arrow = window.document.querySelector(
      'button[aria-label="Scroll to latest message"]',
    );
    assert.ok(arrow);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 45));
    });
    assert.equal(
      log.scrollTop,
      0,
      "Typing does not pull a reader away from older messages",
    );
    await act(async () => {
      (arrow as unknown as HTMLButtonElement).click();
    });
    assert.equal(log.scrollTop, 2000);
    await act(async () => root.unmount());
  } finally {
    await window.happyDOM.close();
  }
});
