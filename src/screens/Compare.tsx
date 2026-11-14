"use client";
import { useState } from "react";
import {
  ArrowsLeftRight,
  MagnifyingGlass,
  CheckCircle,
  Scales,
  Flame,
  ShareNetwork,
  FileText,
} from "@phosphor-icons/react";
import { getExperimentMetadata } from "@/lib/research/metadata";
import { investigations } from "@/lib/research/catalog";
import { compareExperimentalConditions } from "@/lib/comparison/compare";
import { Notice, Panel, Expandable, Status, SourceLink } from "@/components/ui";
export function Compare() {
  const [a, setA] = useState("flex");
  const [b, setB] = useState("flex2");
  const [all, setAll] = useState(false);
  const [pair, setPair] = useState(["flex", "flex2"]);
  const left = investigations.find((i) => i.id === pair[0])!;
  const right = investigations.find((i) => i.id === pair[1])!;
  const rows = compareExperimentalConditions(left, right);
  function selectInvestigation(
    label: string,
    value: string,
    setValue: (v: string) => void,
  ) {
    return (
      <label className="comparison-picker">
        <strong>{label}:</strong>
        <select
          aria-label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          {investigations.map((i) => (
            <option value={i.id} key={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <div className="compare-page">
      <div className="compare-controls">
        {selectInvestigation("Investigation A", a, setA)}
        <button
          aria-label="Swap investigations"
          onClick={() => {
            setA(b);
            setB(a);
            setPair([pair[1], pair[0]]);
          }}
        >
          <ArrowsLeftRight />
        </button>
        {selectInvestigation("Investigation B", b, setB)}
        <button className="search-button" onClick={() => setPair([a, b])}>
          <MagnifyingGlass />
          Compare
        </button>
      </div>
      <Notice>
        Compare NASA investigations side by side. Retrieved NASA metadata;
        downloaded tables remain separate from matched quantitative comparisons.
      </Notice>
      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>
                Experimental Attribute<small>Key comparison aspects</small>
              </th>
              <th>
                <Flame />
                {left.name}
                <small>NASA investigation</small>
              </th>
              <th>
                <Flame />
                {right.name}
                <small>NASA investigation</small>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, all ? rows.length : 4).map((row) => (
              <tr key={row[0]}>
                <th>{row[0]}</th>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="show-all" onClick={() => setAll(!all)}>
        {all ? "Show fewer attributes" : "Show all attributes"}{" "}
        <span>Test variations, measurements, findings, and limitations</span>
      </button>
      <div className="two-panels">
        <Panel title="Key Similarities" icon={<CheckCircle />}>
          <ul>
            <li>Both belong to NASA combustion research.</li>
            <li>
              Matched test conditions must be checked before comparing outcomes.
            </li>
          </ul>
        </Panel>
        <Panel title="Key Differences" icon={<Scales />}>
          <p>
            {left.name}: {left.purpose}
          </p>
          <p>
            {right.name}: {right.purpose}
          </p>
        </Panel>
      </div>
      <Expandable
        title="Scientific Interpretation & Fire-Safety Relevance"
        subtitle="What the evidence may suggest"
        icon={<Flame />}
      >
        <p>
          Interpretation withheld until the original test conditions and results
          are independently reviewed.
        </p>
      </Expandable>
      <Expandable
        title="Related Investigations"
        subtitle="Other relevant NASA research"
        icon={<ShareNetwork />}
      >
        <p>
          {[
            ...getExperimentMetadata(left.id).related,
            ...getExperimentMetadata(right.id).related,
          ].map((relation, index) => (
            <SourceLink key={index} href={relation.url} label={relation.name} />
          ))}
        </p>
      </Expandable>
      <Expandable
        title="Sources, Evidence & Uncertainty"
        subtitle="Citations, evidence status, and limitations"
        icon={<FileText />}
        open
      >
        <div className="source-grid">
          <div>
            <strong>{left.name}</strong>
            <Status label="Not Assessed" />
            <SourceLink href={left.source} label={left.sourceLabel} />
          </div>
          <div>
            <strong>{right.name}</strong>
            <Status label="Not Assessed" />
            <SourceLink href={right.source} label={right.sourceLabel} />
          </div>
          <p>
            Source links are available. Original test files, cross-source
            consistency, and quantitative comparisons have not been verified.
          </p>
        </div>
      </Expandable>
      <Notice>
        Scientific QA: Verification pending. Research relevance does not
        establish hazard probability.
      </Notice>
    </div>
  );
}
