"use client";
import { getInvestigationEvidence } from "@/lib/research/catalog";
import { Expandable, SourceLink } from "./ui";
export function PsiEvidence({ id }: { id: string }) {
  const evidence = getInvestigationEvidence(id);
  return (
    <Expandable title="NASA PSI Provenance & Downloaded Data" open>
      <p>
        <strong>
          {evidence.accession} · Version {evidence.version}
        </strong>{" "}
        · {evidence.projectType} · {evidence.license}
      </p>
      <p>
        Retrieved {evidence.retrievedAt.slice(0, 10)}. {evidence.fileCount}{" "}
        files listed; {evidence.rawFileCount} unrestricted raw-data files
        listed. A file listing alone is not a completed download or scientific
        validation.
      </p>
      {evidence.inventoryStatus !== "retrieved" && (
        <p>File inventory unavailable: {evidence.inventoryError}</p>
      )}
      {evidence.tables.map((table) => (
        <div key={table.name} className="psi-table-evidence">
          <strong>{table.name}</strong>
          {table.status === "downloaded" ? (
            <>
              <p>
                Downloaded original experimental CSV · {table.rows} rows ·{" "}
                {table.bytes} bytes. May contain conditions, measurements, model
                outputs or file references; inspect column semantics before
                interpreting.
              </p>
              <SourceLink
                href={table.localUrl!}
                label="Open downloaded original CSV"
              />
              <SourceLink
                href={table.url}
                label="Retrieve original from NASA"
              />
              <details>
                <summary>Original columns & sample rows</summary>
                <div className="psi-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        {table.columns?.map((column, index) => (
                          <th key={index}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.preview?.map((row, index) => (
                        <tr key={index}>
                          {row.map((cell, i) => (
                            <td key={i}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Original labels and units preserved. Blank cells stay blank;
                  units have not been corrected or inferred.
                </p>
                <p className="tiny">SHA-256: {table.sha256}</p>
              </details>
            </>
          ) : (
            <p>Download unavailable. {table.error}</p>
          )}
        </div>
      ))}
      {!evidence.tables.length && (
        <p>
          No small unrestricted experimental CSV was downloaded for this record.
          Larger files and documents remain available through NASA subject to
          their access rules.
        </p>
      )}
      <details>
        <summary>NASA file inventory — metadata, documents & raw files</summary>
        <p>
          Links resolve the listed NASA file at its recorded version. These
          files are not downloaded locally; large files may take substantial
          bandwidth.
        </p>
        {evidence.fileExamples.map((file, index) => (
          <p key={index}>
            {file.category} · {file.bytes} bytes ·{" "}
            <SourceLink href={file.url} label={file.name} />
          </p>
        ))}
      </details>
      <details>
        <summary>Original NASA objective, approach & field provenance</summary>
        <h4>Objective — NASA metadata</h4>
        <p className="psi-source-text">{evidence.objective}</p>
        <h4>Approach — NASA metadata</h4>
        <p className="psi-source-text">{evidence.approach}</p>
        <h4>Hypothesis — not a measured result</h4>
        <p>{evidence.hypothesis || "Not supplied."}</p>
        <h4>Intended impacts — not verified findings</h4>
        <p>{evidence.impacts || "Not supplied."}</p>
        <p>
          Fuel, conditions, geometry and sensors: matching objective/approach
          passages. Hardware: experimentHardware. Related records: related_glds.
          Tags and topic grouping are local retrieval aids.
        </p>
        <p className="tiny">
          Original metadata SHA-256: {evidence.recordSha256}
        </p>
      </details>
    </Expandable>
  );
}
