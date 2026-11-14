"use client";
import {
  Target,
  Drop,
  Sliders,
  ChartLine,
  Gear,
  Moon,
  ShieldCheck,
} from "@phosphor-icons/react";
import type { Investigation } from "@/types/research";
import {
  getExperimentMetadata,
  findSharedHardware,
} from "@/lib/research/metadata";
import { findDocumentedRelationships } from "@/lib/research/relationships";
import { getInvestigationEvidence } from "@/lib/research/catalog";
import { findInvestigationById } from "@/lib/research/catalog";
import { Expandable, SourceLink } from "./ui";
export function ObjectiveAndFuel({ item }: { item: Investigation }) {
  const meta = getExperimentMetadata(item.id);
  return (
    <>
      <Expandable title="Experimental Objectives" icon={<Target />}>
        <p className="psi-source-text">
          {getInvestigationEvidence(item.id).objective}
        </p>
      </Expandable>
      <Expandable title="Fuels & Sample Geometry" icon={<Drop />}>
        <p>{item.fuel}</p>
        <p>{meta.geometry}</p>
      </Expandable>
    </>
  );
}
export function VariationsAndMeasurements({ item }: { item: Investigation }) {
  const meta = getExperimentMetadata(item.id);
  return (
    <>
      <Expandable title="Test Variations" icon={<Sliders />}>
        <p>{meta.variations}</p>
      </Expandable>
      <Expandable title="Sensors & Measurements" icon={<ChartLine />}>
        <p>{meta.sensors}</p>
        <p>{item.measurements}</p>
      </Expandable>
    </>
  );
}
export function HardwareAndRelated({
  item,
  onSelectRelated,
  availableIds,
}: {
  item: Investigation;
  onSelectRelated?: (id: string) => void;
  availableIds: string[];
}) {
  const meta = getExperimentMetadata(item.id);
  const shared = findSharedHardware(item.id);
  return (
    <Expandable
      title="Shared Hardware & Related PSI Investigations"
      icon={<Gear />}
      open
    >
      <p>
        <strong>Apparatus & facility:</strong>{" "}
        {meta.hardware.length
          ? meta.hardware.join(" · ")
          : "Hardware not imported; shared-apparatus claims withheld."}
      </p>
      {shared.map((other) => (
        <p key={other.id}>
          <strong>{findInvestigationById(other.id)?.name}:</strong> shared{" "}
          {other.hardware.join(" / ")}. Shared apparatus/facility labels do not
          establish identical conditions.{" "}
          <SourceLink
            href={findInvestigationById(other.id)!.source}
            label="Other NASA record"
          />
        </p>
      ))}
      {!meta.related.length&&<p>No explicit related PSI investigations are listed in the imported record.</p>}
      <ul className="related-research">
        {meta.related.map((related) => (
          <li key={related.name}>
            <strong>{related.name}</strong> — {related.reason}{" "}
            <SourceLink href={related.url} label="NASA source" />
            {related.localId &&
              onSelectRelated &&
              availableIds.includes(related.localId) && (
                <button onClick={() => onSelectRelated(related.localId!)}>
                  View {related.name}
                </button>
              )}
          </li>
        ))}
      </ul>
      <details>
        <summary>Fuel & condition context relationships</summary>
        <p>
          These are metadata similarities, not matched experiments or
          interchangeable measurements.
        </p>
        {findDocumentedRelationships(item.id).map((relation) => (
          <p key={relation.item.id}>
            <strong>{relation.item.name}</strong>:{" "}
            {relation.fuels.length
              ? `Fuel names in both source narratives: ${relation.fuels.join(", ")}. `
              : ""}
            {relation.gravity
              ? "Both classified as microgravity investigations. "
              : ""}
            {relation.oxygen
              ? "Both narratives mention oxygen; equal concentration/pressure is not established. "
              : ""}
            <SourceLink href={relation.item.source} label={relation.source} />
          </p>
        ))}
      </details>
      {meta.sources.map((source) => (
        <SourceLink key={source.url} href={source.url} label={source.label} />
      ))}
    </Expandable>
  );
}
export function GravityAndApplications({ item }: { item: Investigation }) {
  const meta = getExperimentMetadata(item.id);
  return (
    <>
      <Expandable
        title="Fire Safety Applications — Spacesuits & Oxygen"
        icon={<ShieldCheck />}
      >
        <p>
          Application context only, not a direct test or certified safety limit.
          Suit and habitat oxygen concentration, total pressure, ventilation,
          materials, and gravity must be compared with the original experimental
          conditions.
        </p>
        <p>
          No spacesuit or lunar-habitat numerical operating limits are imported
          in this catalog. Do not infer safe limits from a topic match.
        </p>
      </Expandable>
      <Expandable title="Gravity & Evidence Gaps" icon={<Moon />} open>
        <p>
          <strong>Gravity coverage:</strong>{" "}
          {meta.gravity
            .map((g) =>
              g === "modeled-microgravity"
                ? "Microgravity modeling context (not flight data)"
                : g === "ground"
                  ? "Ground investigation / modeling"
                  : g === "microgravity"
                    ? "Microgravity"
                    : "Normal-gravity comparisons described",
            )
            .join(" · ")}
        </p>
        <p>{meta.gravityGap}</p>
        <p>
          <strong>Missing evidence:</strong> calibration and matched-test
          interpretation, original data files and sample dimensions may remain
          incomplete. Downloaded tables above retain original values; Hypotheses
          and application context are not experimental observations.
        </p>
      </Expandable>
    </>
  );
}
