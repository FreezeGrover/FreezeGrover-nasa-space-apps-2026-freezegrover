"use client";
import { answerReviewRequest } from "@/lib/qa/handoff";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  FileMagnifyingGlass,
  Flask,
  Stack,
  Users,
  ArrowSquareOut,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import {
  investigations,
  getInvestigationEvidence,
} from "@/lib/research/catalog";

import { InvestigationPicker } from "@/components/InvestigationPicker";
import { ResearchDialog } from "@/components/ResearchDialog";
import { PsiEvidence } from "@/components/PsiEvidence";
import { SourceLink, Status } from "@/components/ui";
import { createReviewNote, type ReviewNote } from "@/lib/qa/notes";
import { findNasaResource } from "@/lib/resources/catalog";
import {
  createResourceReviewNote,
  type ResourceReviewNote,
} from "@/lib/qa/resources";
import { FormattedResearchText } from "@/components/FormattedResearchText";
import { OfficialResource } from "@/components/OfficialResources";
import type { ScientificReviewRequest } from "@/types/resources";
const reviewAreas = [
  {
    label: "Source match",
    description: "Trace statements to original NASA evidence.",
    icon: FileMagnifyingGlass,
  },
  {
    label: "Test conditions",
    description: "Check fuel, atmosphere, gravity and units.",
    icon: Flask,
  },
  {
    label: "Limits and missing information",
    description: "Identify missing evidence and comparison baselines.",
    icon: Stack,
  },
  {
    label: "Independent review",
    description: "Keep scientific review separate from generated answers.",
    icon: Users,
  },
];
export function ScientificQA({
  review: incomingReview,
  onContextChange,
}: {
  review?: ScientificReviewRequest;
  onContextChange?: (
    ids: string[],
    goal?: string,
    sourceIds?: string[],
  ) => void;
} = {}) {
  const [selection, setSelection] = useState<
    ScientificReviewRequest | undefined
  >();
  useEffect(() => setSelection(undefined), [incomingReview]);
  const review = selection ?? incomingReview;
  const [recordId, setRecordId] = useState(review?.recordId ?? "bass2");
  const record = investigations.find((item) => item.id === recordId)!;
  const [activeSource, setActiveSource] = useState(review?.sourceId);
  const resource = findNasaResource(activeSource ?? "");
  const sourceKey = resource?.id ?? recordId;
  const sourceName = resource?.title ?? record.name;
  const selectedReview =
    (review?.sourceId ?? review?.recordId) === sourceKey ? review : undefined;
  useEffect(() => {
    onContextChange?.(
      resource ? [] : [recordId],
      undefined,
      resource ? [resource.id] : undefined,
    );
  }, [recordId, resource?.id, onContextChange]);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    review
      ? { [review.sourceId ?? review.recordId ?? "bass2"]: review.statement }
      : {},
  );
  const statement =
    drafts[sourceKey] ??
    ((review?.sourceId ?? review?.recordId) === sourceKey
      ? review?.statement
      : "") ??
    "";
  const [dialog, setDialog] = useState<"evidence" | "history" | number | null>(
    null,
  );
  const [notes, setNotes] = useState<(ReviewNote | ResourceReviewNote)[]>([]);
  const [saved, setSaved] = useState("");
  useEffect(() => {
    if (review) {
      setActiveSource(review.sourceId);
      if (review.recordId) setRecordId(review.recordId);
      setDrafts((previous) => ({
        ...previous,
        [review.sourceId ?? review.recordId ?? "bass2"]: review.statement,
      }));
      setSaved("");
    }
  }, [review]);
  const evidence = getInvestigationEvidence(recordId);
  type Check = {title:string;question:string;status:string;detail:string};
  const [privateChecks,setPrivateChecks]=useState<Check[]>([]);
  const [checkPending,setCheckPending]=useState(false);
  const [checkError,setCheckError]=useState("");
  const citationPayload = selectedReview?.quote ? JSON.stringify(selectedReview) : "";
  const sourceId = resource?.id ?? "";
  const excerptId = review?.excerptId ?? "";
  useEffect(()=>{
    const controller=new AbortController();
    setPrivateChecks([]);setCheckPending(true);setCheckError("");
    let action:Record<string,unknown>;
    if(citationPayload) {
      action={action:"qa-citation",review:JSON.parse(citationPayload),statement};
    } else if(sourceId) {
      action={action:"qa-resource",sourceId,excerptId:excerptId||undefined,statement};
    } else {
      action={action:"qa-claim",id:recordId,statement};
    }
    void fetch("/api/analysis",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(action),signal:controller.signal})
      .then(async response=>{
        if(!response.ok) throw new Error("Protected scientific review unavailable");
        return response.json() as Promise<{checks:Check[]}>;
      }).then(payload=>{if(!controller.signal.aborted)setPrivateChecks(payload.checks);})
      .catch(()=>{if(!controller.signal.aborted)setCheckError("Scientific QA is unavailable. No checks were completed.");})
      .finally(()=>{if(!controller.signal.aborted)setCheckPending(false);});
    return ()=>controller.abort();
  },[citationPayload,sourceId,excerptId,statement,recordId]);
  const checks=reviewAreas.map((area,index)=>privateChecks[index]??{
    title:area.label,question:area.description,
    status:checkPending?"Checking…":"Not reviewed",
    detail:checkError||"No protected scientific assessment available.",
  });
  function saveNote() {
    const note = resource
      ? createResourceReviewNote(resource.id, statement)
      : createReviewNote(recordId, statement);
    if (!note) return;
    setNotes((previous) => [note, ...previous]);
    setSaved(
      "Review note saved for this session. No scientific verification was performed.",
    );
  }
  const title =
    dialog === "history"
      ? "Review History"
      : dialog === "evidence"
        ? `${sourceName} · Original Evidence`
        : typeof dialog === "number"
          ? reviewAreas[dialog].label
          : "Scientific Review";
  return (
    <div className="qa-page qa-workspace">
      <section className="qa-introduction">
        <span className="qa-eyebrow">EVIDENCE BEFORE CONFIDENCE</span>
        <h2>Review the science, independently.</h2>
        <p>Read the answer, choose a statement, then check its source.</p>
      </section>
      {review?.answerText && (
        <section className="qa-answer-context">
          <h3>1. Your answer</h3>
          <p className="qa-handoff-question">
            <strong>Your question:</strong> {review.question}
          </p>
          <FormattedResearchText text={review.answerText} />
        </section>
      )}
      {review?.citations && review.citations.length > 0 && (
        <div className="qa-statement-choice">
          <label htmlFor="qa-citation">2. Statement to check</label>
          <select
            id="qa-citation"
            aria-label="Cited statement"
            value={review.citations.findIndex(
              (citation) =>
                citation.quote === review.quote &&
                citation.interpretation === review.statement,
            )}
            onChange={(event) => {
              const citation = review.citations![Number(event.target.value)];
              if (citation)
                setSelection(
                  answerReviewRequest(
                    {
                      query: review.question ?? "",
                      mode: "openai",
                      reply: review.answerText,
                      audit: review.audit,
                      statements: review.citations!.filter(
                        (citation) => "recordId" in citation,
                      ),
                      resourceStatements: review.citations!.filter(
                        (citation) => "sourceId" in citation,
                      ),
                      recordIds: [],
                      notice: "",
                      groundingIssues: [],
                    },
                    citation,
                  ),
                );
            }}
          >
            {review.citations.map((citation, index) => (
              <option key={index} value={index}>
                {index + 1}. {citation.interpretation.slice(0, 120)}
                {citation.interpretation.length > 120 ? "…" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="qa-record-toolbar">
        {review?.citations?.length ? (
          <>
            <SourceLink
              href={resource?.url ?? record.source}
              label={sourceName}
            />
            <span className="qa-source-role">
              {resource?.role ?? "NASA PSI investigation"}
            </span>
          </>
        ) : resource ? (
          <>
            <SourceLink href={resource.url} label={resource.title} />
            <button onClick={() => setActiveSource(undefined)}>
              Review a PSI investigation
            </button>
          </>
        ) : (
          <>
            <InvestigationPicker
              label="investigation for QA"
              value={recordId}
              onChange={(id) => {
                setRecordId(id);
                setSaved("");
              }}
            />
            <SourceLink href={record.source} label={evidence.accession} />
          </>
        )}
        <span className="qa-session-label">Local review session</span>
      </div>
      <section className="qa-review-card">
        {selectedReview?.question && !review?.answerText && (
          <p className="qa-handoff-question">
            <strong>Research question:</strong> {selectedReview.question}
          </p>
        )}
        <div className="qa-review-card-heading">
          <div>
            <span className="qa-eyebrow">STATEMENT TO REVIEW</span>
            <h3>{sourceName}</h3>
          </div>
          <Status label="Scientific review pending" />
        </div>
        <label htmlFor="qa-statement" className="qa-draft-label">
          Draft statement · not a verified finding
        </label>
        <textarea
          id="qa-statement"
          value={statement}
          onChange={(e) => {
            setDrafts((previous) => ({
              ...previous,
              [sourceKey]: e.target.value,
            }));
            setSaved("");
          }}
          placeholder="Choose a cited statement from a research answer, or enter a draft to review…"
          rows={3}
        />
        {selectedReview?.quote && (
          <details open className="qa-handoff-evidence">
            <summary>
              {review?.answerText
                ? "3. Cited NASA passage"
                : "Cited NASA passage"}
              {selectedReview.field ? " · " + selectedReview.field : ""}
            </summary>
            <blockquote>{selectedReview.quote}</blockquote>
          </details>
        )}
        {selectedReview?.reviewContext && (
          <details className="qa-handoff-evidence">
            <summary>Ranking assessment context</summary>
            <p className="qa-assessment-context">
              {selectedReview.reviewContext}
            </p>
          </details>
        )}
        <div className="qa-review-actions">
          <button
            className="qa-primary-action"
            onClick={() => setDialog("evidence")}
          >
            <FileMagnifyingGlass />
            Show cited passage
          </button>
          <button onClick={() => setDialog("history")}>
            <ClockCounterClockwise />
            Review history <span>{notes.length}</span>
          </button>
          <button disabled={!statement.trim()} onClick={saveNote}>
            Save review note
          </button>
        </div>
        <p role="status" className="qa-save-status">
          {saved ||
            "Notes are temporary and reset when leaving Scientific QA or reloading the page."}
        </p>
      </section>
      <h3 className="qa-checks-title">
        {review?.answerText ? "4. Check summary" : "Check summary"}
      </h3>
      {checkPending && <p role="status">Checking claims using the protected scientific QA service…</p>}
      {checkError && <p role="alert">{checkError}</p>}
      <div className="qa-review-grid">
        {reviewAreas.map(({ label, icon: Icon }, index) => (
          <button
            className="qa-area-card"
            key={label}
            onClick={() => setDialog(index)}
          >
            <div className="qa-area-icon">
              <Icon />
            </div>
            <div>
              <h3>{label}</h3>
              <p className="qa-check-preview">{checks[index].detail}</p>
              <span className="qa-area-status">{checks[index].status}</span>
            </div>
            <ArrowSquareOut className="qa-card-arrow" />
          </button>
        ))}
      </div>
      <div className="qa-integrity-note">
        <ShieldCheck />
        <p>
          <strong>No verified conclusion yet.</strong> Claim support,
          experimental comparability, uncertainty and independent review remain
          pending. This workflow does not trust an AI provider as scientific
          evidence.
        </p>
      </div>
      <ResearchDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={title}
      >
        {dialog === "evidence" && (
          <>
            <p>This is the passage linked to the selected statement.</p>
            <div className="qa-popup-draft">
              <strong>Draft statement</strong>
              <p>{statement || "No statement entered."}</p>
            </div>
            {selectedReview?.quote ? (
              <div className="qa-exact-passage">
                <h3>Cited NASA passage</h3>
                <blockquote>{selectedReview.quote}</blockquote>
                <p>
                  {resource
                    ? `${resource.role} · ${resource.excerpts.find((item) => item.id === selectedReview.excerptId)?.locator ?? "Selected excerpt"}`
                    : `${record.name} · ${selectedReview.field ?? "selected source field"}`}
                </p>
                <SourceLink
                  href={resource?.url ?? record.source}
                  label="Open original NASA source"
                />
              </div>
            ) : (
              <p>
                No exact passage selected. Choose a cited statement from the
                answer or inspect the full source context.
              </p>
            )}
            <details className="qa-full-context">
              <summary>Full source context (other passages and data)</summary>
              {resource ? (
                <OfficialResource source={resource} interactive={false} />
              ) : (
                <>
                  <PsiEvidence id={recordId} />
                  <SourceLink href={record.source} label={record.sourceLabel} />
                </>
              )}
            </details>
          </>
        )}
        {typeof dialog === "number" && (
          <div className="qa-check-detail">
            <Status label={checks[dialog].status} />
            <h3>{checks[dialog].question}</h3>
            <p>{checks[dialog].detail}</p>
            {dialog === 2 && (
              <ul>
                <li>
                  Name the comparison baseline before asserting an increase or
                  decrease.
                </li>
                <li>
                  Match material, geometry, oxygen, pressure, ventilation and
                  gravity.
                </li>
                <li>
                  Keep hypotheses, intended benefits and measurements distinct.
                </li>
              </ul>
            )}
            {dialog === 3 && (
              <p>
                Automated conversational review does not replace human
                scientific review. Saving a note does not approve a claim or a
                relevance ranking.
              </p>
            )}
            <button
              className="research-open-button"
              onClick={() => setDialog("evidence")}
            >
              Open original evidence ↗
            </button>
          </div>
        )}
        {dialog === "history" && (
          <>
            <p>
              Session notes across investigations. These are saved drafts, not
              completed scientific checks.
            </p>
            {notes.length === 0 ? (
              <div className="qa-empty-history">
                <ClockCounterClockwise />
                <h3>No review notes yet</h3>
                <p>
                  Write a statement and choose “Save review note” to keep a
                  session snapshot.
                </p>
              </div>
            ) : (
              notes.map((note, index) => (
                <article className="qa-history-note" key={index}>
                  <small>
                    {"sourceId" in note
                      ? findNasaResource(note.sourceId)?.title
                      : investigations.find((item) => item.id === note.recordId)
                          ?.name}{" "}
                    ·{" "}
                    {"sourceId" in note
                      ? "Snapshot " + note.sourceHash.slice(0, 12)
                      : note.accession + " v" + note.version}{" "}
                    · {new Date(note.time).toLocaleString()}
                  </small>
                  <p>{note.statement}</p>
                  <Status label="Not scientifically verified" />
                </article>
              ))
            )}
          </>
        )}
      </ResearchDialog>
    </div>
  );
}
