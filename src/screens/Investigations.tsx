"use client";
import { useState } from "react";
import { FileText, Flask, CaretRight, Sparkle } from "@phosphor-icons/react";
import type { Environment } from "@/types/research";
import { searchInvestigations, investigations } from "@/lib/research/catalog";
import { Panel, Status, Notice } from "@/components/ui";
import { InvestigationDetail } from "@/components/InvestigationDetail";
import { MissionContext } from "@/components/MissionContext";
import { Applications } from "@/components/Applications";
export function Investigations({
  query,
  environment,
  setEnvironment,
}: {
  query: string;
  environment: Environment;
  setEnvironment: (v: Environment) => void;
}) {
  const [selected, setSelected] = useState("flex");
  const results = searchInvestigations(query);
  const item = results.find((i) => i.id === selected) ?? results[0];
  return (
    <div className="investigations-page">
      <div className="investigation-top">
        <Panel title="Research Briefing" icon={<Sparkle />}>
          <ul>
            <li>Explore original NASA research sources.</li>
            <li>Compare evidence in its experimental context.</li>
            <li>Review uncertainty before drawing conclusions.</li>
          </ul>
        </Panel>
        <MissionContext value={environment} onChange={setEnvironment} compact />
      </div>
      <div className="investigation-columns">
        <Panel title="Research Results" icon={<FileText />}>
          <div className="muted tiny">
            {results.length} curated records · original test data pending
          </div>
          <div className="result-list">
            {results.map((record, index) => (
              <button
                key={record.id}
                className={`result-row ${record.id === selected ? "active" : ""}`}
                onClick={() => setSelected(record.id)}
              >
                <span className="result-index">{index + 1}</span>
                <Flask />
                <span className="result-title">
                  <strong>{record.name}</strong>
                  <small>{record.title}</small>
                </span>
                <Status label="Not Assessed" />
                <CaretRight />
              </button>
            ))}
          </div>
          {results.length === 0 && (
            <Notice>
              No matching investigations. Try “smoke”, “droplet”, or “FLEX”.
            </Notice>
          )}
          <div className="list-note">Showing the curated starter inventory</div>
        </Panel>
        {item ? (
          <InvestigationDetail item={item} />
        ) : (
          <Notice>
            Select a matching investigation after clearing or changing your
            search.
          </Notice>
        )}
      </div>
      <Applications />
    </div>
  );
}
