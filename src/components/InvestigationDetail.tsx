"use client";
import {
  BookOpen,
  Flask,
  FileText,
  Gauge,
  ListChecks,
  Warning,
} from "@phosphor-icons/react";
import type { Investigation } from "@/types/research";
import { Panel, Expandable, Status, SourceLink } from "./ui";
export function InvestigationDetail({ item }: { item: Investigation }) {
  return (
    <Panel
      title={`Selected Investigation — ${item.name}`}
      icon={<BookOpen />}
      className="investigation-detail"
    >
      <div className="selected-summary">
        <div className="science-symbol">
          <img
            src="/assets/illustrative-flame.png"
            alt="Illustrative droplet flame from the design reference; not experimental data"
          />
        </div>
        <div>
          <h3>
            {item.name} — {item.title}
          </h3>
          <p>
            <strong>Purpose:</strong> {item.purpose}
          </p>
        </div>
      </div>
      <div className="assessment-row">
        <Status label="Evidence: Not Assessed" />
        <Status label="Mission Relevance: Not Assessed" />
      </div>
      <Expandable
        title="Evidence & Data"
        subtitle="Measurements, sources, and findings"
        icon={<FileText />}
      >
        <p>{item.measurements}</p>
        <SourceLink href={item.source} label={item.sourceLabel} />
      </Expandable>
      <Expandable
        title="Test Conditions"
        subtitle="Oxygen, pressure, size, airflow, gravity"
        icon={<Gauge />}
      >
        <p>{item.conditions}</p>
        <p>
          <strong>Fuel & sample:</strong> {item.fuel}
        </p>
        <p>
          <strong>Facility:</strong> {item.facility}
        </p>
      </Expandable>
      <Expandable
        title="Key Findings"
        subtitle="Reported results and context"
        icon={<ListChecks />}
      >
        <p>{item.finding}</p>
        <p className="muted">
          Curated NASA summary. Original results require independent review.
        </p>
      </Expandable>
      <Expandable
        title="Limitations & Uncertainty"
        subtitle="What is still unknown"
        icon={<Warning />}
      >
        <p>{item.limitation}</p>
      </Expandable>
    </Panel>
  );
}
