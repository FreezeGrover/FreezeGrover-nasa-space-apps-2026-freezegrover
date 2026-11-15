import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { Window } from "happy-dom";
import { investigations } from "../src/lib/research/catalog";
import type { Environment } from "../src/types/research";

test("Rankings applies every goal/environment pair, shows the selected value and opens the matching investigation", async () => {
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
    { Rankings } = await import("../src/screens/Rankings");
  function Harness() {
    const [environment, setEnvironment] = React.useState<Environment>("All");
    return React.createElement(Rankings, { environment, setEnvironment });
  }
  const container = window.document.createElement("div");
  window.document.body.append(container);
  const root = createRoot(container as unknown as Element);
  const click = async (el: unknown) =>
    act(async () => {
      assert.ok(el);
      (el as { click: () => void }).click();
    });
  const button = (label: string) =>
    [...window.document.querySelectorAll("button")].find(
      (el) => el.textContent.trim() === label,
    )!;
  const close = async () =>
    click(
      window.document.querySelector(
        'dialog[open] button[aria-label="Close research popup"]',
      ),
    );
  try {
    await act(async () => root.render(React.createElement(Harness)));
    assert.equal(window.document.querySelectorAll(".ranking-row").length, 0);
    assert.equal(button("Show investigations").disabled, true);
    assert.equal(
      window.document.querySelectorAll('.goal-options [aria-pressed="true"]')
        .length,
      0,
    );
    for (const goal of [
      "Crew Safety",
      "Predictive Models",
      "Safety Equipment",
      "Earth Applications",
    ]) {
      await click(
        [...window.document.querySelectorAll(".goal-options button")].find(
          (el) => el.querySelector("strong")?.textContent === goal,
        ),
      );
      for (const environment of [
        "All",
        "Spacecraft",
        "Space Stations",
        "Lunar Bases",
        "Martian Bases",
        "Pressurized Rovers",
      ]) {
        await click(
          window.document.querySelector(
            'button[aria-label="Change mission context"]',
          ),
        );
        await click(button(environment));
        assert.equal(
          window.document.querySelectorAll(".ranking-row").length,
          0,
          "Changing criteria hides old results",
        );
        await click(button("Show investigations"));
        const picker = window.document.querySelector(
          'button[aria-label="Change mission context"]',
        )!;
        assert.equal(picker.textContent, `Environment: ${environment} ⌄`);
        assert.doesNotMatch(picker.textContent, /Choose/);
        await click(
          [...window.document.querySelectorAll("button")].find((el) =>
            el.textContent.startsWith("Browse all "),
          ),
        );
        const dialog = window.document.querySelector("dialog[open]")!,
          names = [...dialog.querySelectorAll(".ranking-name strong")].map(
            (el) => el.textContent,
          );
        const expected = investigations.filter((item) =>
          item.goals.includes(goal as (typeof item.goals)[number]),
        );
        assert.deepEqual(
          [...names].sort(),
          expected.map((item) => item.name).sort(),
        );
        assert.match(dialog.textContent, new RegExp(environment));
        if (environment === "All")
          assert.match(dialog.textContent, /retain catalog order/);
        else assert.doesNotMatch(dialog.textContent, /retain catalog order/);
        await close();
      }
    }
    const name = window.document.querySelector(
      ".ranking-name strong",
    )!.textContent;
    await click(window.document.querySelector(".ranking-detail-button"));
    assert.match(
      window.document.querySelector("dialog[open]")!.textContent,
      new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  } finally {
    await act(async () => root.unmount());
    await window.happyDOM.close();
  }
});
