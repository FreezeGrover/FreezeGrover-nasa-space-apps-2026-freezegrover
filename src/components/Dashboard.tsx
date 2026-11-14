"use client";
import { useState } from "react";
import {
  Flame,
  House,
  Flask,
  SquaresFour,
  ChartBar,
  ShieldCheck,
  Info,
  X,
  Plugs,
} from "@phosphor-icons/react";
import type { Tab, Environment } from "@/types/research";
import { Overview } from "@/screens/Overview";
import { Investigations } from "@/screens/Investigations";
import { Compare } from "@/screens/Compare";
import { Rankings } from "@/screens/Rankings";
import { ScientificQA } from "@/screens/ScientificQA";
import { ResearchSearch } from "./ResearchSearch";
import { EvidenceFooter } from "./ui";
const navigation: { name: Tab; icon: typeof House }[] = [
  { name: "Overview", icon: House },
  { name: "Investigations", icon: Flask },
  { name: "Compare", icon: SquaresFour },
  { name: "Rankings", icon: ChartBar },
  { name: "Scientific QA", icon: ShieldCheck },
];
export function Dashboard() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [environment, setEnvironment] = useState<Environment>("All");
  const [mode, setMode] = useState("Simple");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [disclosure, setDisclosure] = useState(false);
  function searchResearch() {
    setSubmitted(query);
    setTab("Investigations");
  }
  return (
    <div className="app-frame">
      <header className="app-header">
        <div className="brand">
          <img
            src="/assets/flame-logo.png"
            alt="Flames in Free Fall"
            className="brand-logo"
          />
          <div>
            <strong>Flames in Free Fall</strong>
            <span>Combustion Research Dashboard</span>
          </div>
        </div>
        {tab !== "Overview" && tab !== "Investigations" && (
          <h1 className="page-title">
            {tab === "Compare"
              ? "Compare Investigations"
              : tab === "Rankings"
                ? "Research Rankings"
                : tab}
          </h1>
        )}
        <button
          className="disclosure-button"
          onClick={() => setDisclosure(true)}
        >
          <Info />
          AI Usage & Disclosure
        </button>
      </header>
      <div className="app-body">
        <aside className="sidebar">
          <nav aria-label="Main navigation">
            {navigation.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setTab(name)}
                className={tab === name ? "selected" : ""}
                aria-current={tab === name ? "page" : undefined}
              >
                <Icon />
                {name}
              </button>
            ))}
          </nav>
          <div className="connection-state">
            <Plugs />
            <strong>Data connection pending</strong>
            <small>
              Curated NASA source summaries
              <br />
              Live AI unavailable
            </small>
          </div>
        </aside>
        <main>
          {(tab === "Overview" || tab === "Investigations") && (
            <ResearchSearch
              value={query}
              onChange={setQuery}
              onSearch={searchResearch}
              mode={mode}
              setMode={setMode}
            />
          )}
          <div className="screen-content" key={tab}>
            {tab === "Overview" && (
              <Overview
                environment={environment}
                setEnvironment={setEnvironment}
                navigate={setTab}
                mode={mode}
              />
            )}{" "}
            {tab === "Investigations" && (
              <Investigations
                query={submitted}
                environment={environment}
                setEnvironment={setEnvironment}
              />
            )}{" "}
            {tab === "Compare" && <Compare />}{" "}
            {tab === "Rankings" && (
              <Rankings
                environment={environment}
                setEnvironment={setEnvironment}
              />
            )}{" "}
            {tab === "Scientific QA" && <ScientificQA />}
          </div>
          <EvidenceFooter />
        </main>
      </div>
      {disclosure && (
        <div className="modal-backdrop" onClick={() => setDisclosure(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="disclosure-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close disclosure"
              onClick={() => setDisclosure(false)}
            >
              <X />
            </button>
            <Info size={38} />
            <h2 id="disclosure-title">AI Usage & Disclosure</h2>
            <p>
              This interface is a research prototype. The current investigation
              descriptions are curated summaries of public NASA sources, not a
              live NASA API feed.
            </p>
            <p>
              No live AI provider or automatic scientific reviewer is connected.
              Searching retrieves catalog records; it does not generate an AI
              answer.
            </p>
            <p>
              Evidence strength, research ranking, habitat suitability, and
              fire-safety recommendations are not verified. The Scientific QA
              screen withholds conclusions until original evidence is available.
            </p>
            <button
              className="search-button"
              onClick={() => setDisclosure(false)}
            >
              Understood
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
