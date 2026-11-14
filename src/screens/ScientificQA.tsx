"use client";
import { investigations } from "@/lib/research/catalog";
import { SourceLink } from "@/components/ui";
import { useState } from "react";
import {
  ShieldCheck,
  Target,
  ArrowsClockwise,
  List,
  FileMagnifyingGlass,
  Flask,
  Stack,
  Users,
  Question,
  ChartBar,
  ClipboardText,
} from "@phosphor-icons/react";
import { reviewScientificClaim } from "@/lib/qa/review";
import { Notice, Status, Expandable } from "@/components/ui";
const defaultClaim =
  "BASS-II provides insights into solid-fuel combustion in microgravity, relevant to crew safety and material flammability.";
export function ScientificQA() {
  const [recordId, setRecordId] = useState("bass2");
  const record = investigations.find((item) => item.id === recordId)!;
  const [claim, setClaim] = useState(defaultClaim);
  const [history, setHistory] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const checks = reviewScientificClaim(claim, recordId);
  const icons = [FileMagnifyingGlass, Flask, Stack, Users];
  function recheck() {
    setHistory((previous) => [
      `Manual check ${previous.length + 1}: metadata provenance checked; scientific conclusion remains pending independent review.`,
      ...previous,
    ]);
  }
  return (
    <div className="qa-page">
      <Notice>
        Independent verification of findings, interpretations, and rankings
        using original NASA evidence.
      </Notice>
      <label>
        Investigation for independent review{" "}
        <select
          aria-label="QA investigation"
          value={recordId}
          onChange={(e) => {
            setRecordId(e.target.value);
            setClaim(
              investigations.find((item) => item.id === e.target.value)!
                .purpose,
            );
          }}
        >
          {investigations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>{" "}
        <SourceLink href={record.source} label={record.sourceLabel} />
      </label>
      <div className="qa-head">
        <div className="qa-banner">
          <ShieldCheck />
          <strong>Scientific QA: Awaiting Evidence</strong>
          <small>Current item: {record.name}</small>
        </div>
        <div className="qa-count">
          <strong>0</strong>
          <span>Verified</span>
        </div>
        <div className="qa-count warning">
          <strong>
            {checks.filter((c) => c.status === "Needs Review").length}
          </strong>
          <span>Needs Review</span>
        </div>
        <div className="qa-count">
          <strong>
            {checks.filter((c) => c.status.startsWith("Pending")).length}
          </strong>
          <span>Pending</span>
        </div>
      </div>
      <div className="current-review">
        <h2>
          <Target />
          Currently Reviewing
        </h2>
        <label>
          <strong>Finding for review</strong>
          <textarea
            aria-label="Finding for review"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
          />
        </label>
        <button onClick={recheck}>
          <ArrowsClockwise />
          Recheck Now<small>Manual</small>
        </button>
        <button onClick={() => setShowAll(!showAll)}>
          <List />
          {showAll ? "Current Finding" : "View All Findings"}
        </button>
      </div>
      {showAll && (
        <Notice>
          One finding in this local review session. No live AI-generated
          findings have been received.
        </Notice>
      )}
      <div className="qa-checks">
        {checks.map((check, index) => {
          const Icon = icons[index];
          return (
            <Expandable
              key={check.title}
              title={`${index + 1}. ${check.title}`}
              subtitle={check.question}
              icon={<Icon />}
              open={index === 2}
              status={check.status}
            >
              {index === 2 ? (
                <div className="uncertainty-grid">
                  <div>
                    <h3>
                      <Question />
                      What is Unclear?
                    </h3>
                    <p>
                      Any claim of “increased flame propagation” needs a named
                      comparison condition.
                    </p>
                  </div>
                  <div>
                    <h3>
                      <Stack />
                      Plausible Interpretations
                    </h3>
                    <p>A · Compared with Earth gravity.</p>
                    <p>B · Different oxygen concentration.</p>
                    <p>C · Different material or test configuration.</p>
                  </div>
                  <div>
                    <h3>
                      <ChartBar />
                      Impact on Conclusion
                    </h3>
                    <p>
                      Each interpretation could imply a different cause. No
                      final ranking is supported yet.
                    </p>
                  </div>
                  <div>
                    <h3>
                      <ClipboardText />
                      Additional Evidence Needed
                    </h3>
                    <ul>
                      <li>Explicit comparison baseline</li>
                      <li>Measurements and units</li>
                      <li>Original experiment documentation</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p>{check.detail}</p>
              )}
            </Expandable>
          );
        })}
      </div>
      <div className="qa-outcome">
        <ShieldCheck />
        <h2>
          QA Outcome <small>Current item</small>
        </h2>
        <Status label="Needs Review" />
        <p>
          Conclusion withheld until the original evidence and comparison
          conditions can be checked.
        </p>
      </div>
      <Expandable title="Verification Notes & History" icon={<ClipboardText />}>
        <p>
          Metadata retrieval is connected. Independent scientific claim
          verification remains pending and is separate from answer generation.
        </p>
        {history.length === 0 ? (
          <p>No manual checks yet.</p>
        ) : (
          history.map((line) => <p key={line}>{line}</p>)
        )}
      </Expandable>
    </div>
  );
}
