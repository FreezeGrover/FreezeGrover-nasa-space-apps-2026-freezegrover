"use client";
import type { RankingAssessment } from "@/lib/ranking/assessment";
import { SourceLink, Status } from "./ui";
export function RankingAssessmentPanel({
  assessment,
  onReview,
  onInvestigate,
  pending = false,
}: {
  assessment: RankingAssessment;
  onReview: () => void;
  onInvestigate: () => void;
  pending?: boolean;
}) {
  return (
    <div className="ranking-assessment">
      <p>
        <strong>Research question:</strong>{" "}
        {assessment.question || assessment.goal} · {assessment.environment}
      </p>
      <p>
        Research relevance orders attention. Evidence quality and confidence
        require their own checks.
      </p>
      <div className="ranking-assessment-actions">
        <button className="research-open-button" onClick={onReview}>
          Review this assessment in Scientific QA ↗
        </button>
        <button
          className="research-open-button"
          disabled={pending}
          onClick={onInvestigate}
        >
          Investigate evidence gaps ↗
        </button>
      </div>
      <dl className="ranking-assessment-dimensions">
        {assessment.dimensions.map((dimension) => (
          <div key={dimension.label}>
            <dt>{dimension.label}</dt>
            <dd>
              <Status label={dimension.status} />
              {dimension.basis.map((text, index) => (
                <p key={index}>{text}</p>
              ))}
              {dimension.limits.length > 0 && (
                <ul>
                  {dimension.limits.map((text, index) => (
                    <li key={index}>{text}</li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <details>
        <summary>Experimental conditions and measurement context</summary>
        {assessment.conditions.map((condition) => (
          <div className="qa-check-detail" key={condition.label}>
            <h4>
              {condition.label} · {condition.status}
            </h4>
            <p>{condition.text}</p>
          </div>
        ))}
      </details>
      {assessment.conflicts.length > 0 && (
        <details open>
          <summary>Pressure ranges needing context review</summary>
          <p>
            Different ranges may describe different tests. They are not
            automatically contradictory findings.
          </p>
          {assessment.conflicts.map((conflict, index) => (
            <p key={index}>
              <strong>{conflict.field}:</strong> “{conflict.quote}”
            </p>
          ))}
        </details>
      )}
      <details>
        <summary>Source and data provenance</summary>
        <p>
          {assessment.provenance.accession} · version{" "}
          {assessment.provenance.version} · retrieved{" "}
          {assessment.provenance.retrievedAt.slice(0, 10)}
        </p>
        <SourceLink
          href={assessment.provenance.url}
          label="Inspect original NASA PSI source"
        />
        <p className="tiny">
          Recorded metadata SHA-256: {assessment.provenance.hash}. Recorded
          hashes identify snapshots; this assessment does not certify scientific
          validity.
        </p>
        {assessment.provenance.tables.map((table) => (
          <article className="qa-check-detail" key={table.name}>
            <h4>{table.name}</h4>
            <p>
              {table.rows ?? "Unknown"} rows · Original columns:{" "}
              {table.columns.join("; ") || "Not imported"}
            </p>
            {table.localUrl && (
              <SourceLink
                href={table.localUrl}
                label="Open downloaded original CSV"
              />
            )}
            <SourceLink href={table.url} label="Original NASA table" />
            <p className="tiny">
              Recorded table SHA-256: {table.sha256 ?? "Not recorded"}
            </p>
          </article>
        ))}
      </details>
      <details>
        <summary>Next scientific checks</summary>
        <ul>
          {assessment.nextSteps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </details>
      <small>
        {assessment.version} · Original project framework; not an official NASA
        evaluation rubric. Independent scientific review remains pending.
      </small>
    </div>
  );
}
