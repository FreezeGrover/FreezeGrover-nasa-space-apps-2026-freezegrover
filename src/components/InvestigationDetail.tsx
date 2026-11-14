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
import {
  ObjectiveAndFuel,
  VariationsAndMeasurements,
  HardwareAndRelated,
  GravityAndApplications,
} from "./ExperimentSections";
import { getExperimentMetadata } from "@/lib/research/metadata";
export function InvestigationDetail({
  item,
  onSelectRelated,
  availableIds = [],
}: {
  item: Investigation;
  onSelectRelated?: (id: string) => void;
  availableIds?: string[];
}) {
  const meta = getExperimentMetadata(item.id);
  return (
    <Panel
      title={`Selected Investigation — ${item.name}`}
      icon={<BookOpen />}
      className="investigation-detail"
    >
      <div className="selected-summary">
        <div className="science-symbol">
          {meta.fuelCategory === "liquid" ? (
            <img
              src="/assets/illustrative-flame.png"
              alt="Illustrative droplet flame from the design reference; not experimental data"
            />
          ) : (
            <Flask size={50} aria-label="Non-droplet investigation" />
          )}
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
      <ObjectiveAndFuel item={item} />
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
          <strong>Oxygen:</strong>{" "}
          {meta.oxygenVariation
            ? "Variation described; exact per-run concentrations are not imported."
            : "Not imported; no concentration is assumed."}
        </p>
        <p>
          <strong>Pressure:</strong>{" "}
          {meta.pressureProtocol ??
            "Not imported; no pressure value is assumed."}
        </p>
        <p>
          <strong>Fuel & sample:</strong> {item.fuel}
        </p>
        <p>
          <strong>Facility:</strong> {item.facility}
        </p>
      </Expandable>
      <VariationsAndMeasurements item={item} />
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
      <HardwareAndRelated
        item={item}
        onSelectRelated={onSelectRelated}
        availableIds={availableIds}
      />
      <GravityAndApplications item={item} />
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
