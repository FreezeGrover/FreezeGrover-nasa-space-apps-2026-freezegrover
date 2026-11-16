"use client";
import { selectRankingCandidates } from "@/lib/ranking/selection";
import { assessRankingCandidate } from "@/lib/ranking/assessment";
import { rankingFrameworkGroups } from "@/lib/ranking/framework";
import { RankingAssessmentPanel } from "@/components/RankingAssessmentPanel";
import { useResearchActions } from "@/components/ResearchActions";
import { rankingReviewRequest } from "@/lib/qa/handoff";
import { ResearchDialog } from "@/components/ResearchDialog";
import { InvestigationDetail } from "@/components/InvestigationDetail";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ChartBar,
  Wrench,
  Globe,
  Flask,
  Gear,
  CheckCircle,
} from "@phosphor-icons/react";
import type { ResearchGoal, Environment } from "@/types/research";
import { investigations } from "@/lib/research/catalog";
import { explainRankingReason } from "@/lib/ranking/rank";
import { MissionContext } from "@/components/MissionContext";
import { Expandable, Notice, Status, SourceLink } from "@/components/ui";
const goals: {
  name: ResearchGoal;
  description: string;
  icon: typeof ShieldCheck;
}[] = [
  {
    name: "Crew Safety",
    description: "Fire safety for habitable environments in space.",
    icon: ShieldCheck,
  },
  {
    name: "Predictive Models",
    description: "Research for modeling combustion and fire behavior.",
    icon: ChartBar,
  },
  {
    name: "Safety Equipment",
    description: "Detection and suppression research.",
    icon: Wrench,
  },
  {
    name: "Earth Applications",
    description: "Potential terrestrial fire-safety applications.",
    icon: Globe,
  },
];
export interface RankingSetup {
  environment: Environment;
  environmentChosen: boolean;
  goal: ResearchGoal | null;
  questionDraft: string;
  question: string;
  submitted: boolean;
}
export function Rankings({
  environment,
  setEnvironment,
  onContextChange,
  initialSetup,
  onSetupChange,
}: {
  initialSetup?: RankingSetup;
  onSetupChange?: (setup: RankingSetup) => void;
  environment: Environment;
  setEnvironment: (v: Environment) => void;
  onContextChange?: (ids: string[], goal?: string) => void;
}) {
  const [browse, setBrowse] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [goal, setGoal] = useState<ResearchGoal | null>(
    initialSetup?.goal ?? null,
  );
  const [environmentChosen, setEnvironmentChosen] = useState(
    initialSetup?.environment === environment && initialSetup.environmentChosen,
  );
  const [submitted, setSubmitted] = useState(
    initialSetup?.environment === environment && initialSetup.submitted,
  );
  const actions = useResearchActions();
  const [questionDraft, setQuestionDraft] = useState(
    initialSetup?.questionDraft ?? "",
  );
  const [question, setQuestion] = useState(initialSetup?.question ?? "");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  useEffect(() => {
    onSetupChange?.({
      environment,
      environmentChosen,
      goal,
      questionDraft,
      question,
      submitted,
    });
  }, [
    environment,
    environmentChosen,
    goal,
    questionDraft,
    question,
    submitted,
    onSetupChange,
  ]);
  const activeGoal = goal ?? "Crew Safety";
  const relevant = submitted
    ? selectRankingCandidates(investigations, activeGoal, environment, question)
    : [];
  const assessment = assessmentId
    ? assessRankingCandidate(assessmentId, activeGoal, environment, question)
    : null;
  useEffect(() => {
    onContextChange?.(
      assessmentId ? [assessmentId] : detail ? [detail] : [],
      goal ?? undefined,
    );
  }, [assessmentId, detail, goal, onContextChange]);
  function renderRankings(expanded: boolean) {
    return (
      <div className="ranking-list">
        {(expanded ? relevant : relevant.slice(0, 2)).map((item) => (
          <article className="ranking-row" key={item.id}>
            <button
              className="ranking-detail-button"
              onClick={() => {
                setBrowse(false);
                setDetail(item.id);
              }}
              aria-label={`Open ${item.name} details`}
            >
              <Flask />
              Details ↗
            </button>
            <div className="ranking-name">
              <strong>{item.name}</strong>
              <small>NASA investigation</small>
              <small>
                Evidence:{" "}
                {assessRankingCandidate(
                  item.id,
                  activeGoal,
                  environment,
                  question,
                ).provenance.tables.length
                  ? "tables available"
                  : "narrative coverage"}
              </small>
              <button
                className="research-open-button"
                aria-label={`Assess ${item.name} evidence and confidence`}
                onClick={() => {
                  setBrowse(false);
                  setAssessmentId(item.id);
                }}
              >
                Evidence &amp; confidence ↗
              </button>
            </div>
            <p>
              <strong>Why relevant? </strong>
              {explainRankingReason(item, activeGoal, environment)}
            </p>
            <Status label="Confidence: not established" />
            <SourceLink href={item.source} label="Source" />
          </article>
        ))}
      </div>
    );
  }
  return (
    <div className="rankings-page">
      <Notice>
        Choose an environment and a research goal, then show matching
        investigations.
      </Notice>
      <h2 className="section-bar">1. Choose an environment</h2>
      <MissionContext
        value={environment}
        unselected={!environmentChosen}
        onChange={(value) => {
          setEnvironment(value);
          setEnvironmentChosen(true);
          setSubmitted(false);
        }}
        compact
      />
      <h2 className="section-bar">2. What are you researching?</h2>
      <div className="goal-options">
        {goals.map(({ name, description, icon: Icon }) => (
          <button
            key={name}
            className={goal === name ? "selected" : ""}
            aria-pressed={goal === name}
            onClick={() => {
              setGoal(name);
              setSubmitted(false);
            }}
          >
            <Icon size={45} />
            <span>
              <strong>{name}</strong>
              <small>{description}</small>
            </span>
            {goal === name && (
              <CheckCircle className="goal-check" weight="fill" />
            )}
          </button>
        ))}
      </div>
      <form
        className="ranking-question"
        onSubmit={(event) => {
          event.preventDefault();
          if (!environmentChosen || !goal) return;
          setQuestion(questionDraft.trim());
          setSubmitted(true);
        }}
      >
        <label htmlFor="ranking-question">3. Add a question (optional)</label>
        <div>
          <input
            id="ranking-question"
            value={questionDraft}
            maxLength={600}
            onChange={(event) => {
              setQuestionDraft(event.target.value);
              setSubmitted(false);
            }}
            placeholder="e.g., oxygen and pressure effects on droplet extinction"
          />
          <button
            className="research-open-button"
            type="submit"
            disabled={!environmentChosen || !goal}
          >
            Show investigations
          </button>
          {questionDraft && (
            <button
              className="research-open-button"
              type="button"
              onClick={() => {
                setQuestion("");
                setQuestionDraft("");
                setSubmitted(false);
              }}
            >
              Clear question
            </button>
          )}
        </div>
      </form>
      {!submitted && (
        <p className="ranking-next-step" role="status">
          {!environmentChosen
            ? "Start by choosing an environment. You can also choose All to explore every environment."
            : !goal
              ? "Now choose a research goal above."
              : "Ready. Select Show investigations to see your results."}
        </p>
      )}
      {submitted && (
        <section
          className="ranking-results"
          aria-label="Matching investigations"
          aria-live="polite"
        >
          <h2 className="section-bar">
            Matching investigations{" "}
            <small>
              {question
                ? "Question relevance"
                : environment === "All"
                  ? "Catalog order"
                  : "Prioritized for " + environment}{" "}
              · review pending
            </small>
          </h2>
          <p className="ranking-results-context">
            <strong>
              {goal} ·{" "}
              {environment === "All" ? "All environments" : environment}
            </strong>
          </p>
          {question && (
            <p className="ranking-question-scope">
              Question topic matches for “{question}” · exact matches take
              precedence; goal and environment refine the order. Relevance is
              separate from confidence.
            </p>
          )}
          {!relevant.length && (
            <Notice>
              No imported investigations match this goal and question. Change or
              clear the question, then show investigations again; related
              research is not direct evidence.
            </Notice>
          )}
          {renderRankings(false)}
          <button
            className="research-open-button"
            onClick={() => setBrowse(true)}
          >
            Browse all {relevant.length} relevant investigations ↗
          </button>
        </section>
      )}
      <ResearchDialog
        open={browse}
        onClose={() => setBrowse(false)}
        title={`${goal} · Relevant Investigations`}
      >
        <p>
          Environment: {environment}.{" "}
          {question
            ? "Question matches take precedence; goal and environment factors refine ties."
            : environment === "All"
              ? "Topic matches retain catalog order."
              : "Topic matches are prioritized using documented conditions relevant to this environment."}{" "}
          Suitability is unverified.
        </p>
        {renderRankings(true)}
      </ResearchDialog>
      <ResearchDialog
        open={detail !== null}
        onClose={() => setDetail(null)}
        title="Selected Investigation"
      >
        {detail && (
          <InvestigationDetail
            onResearchAction={() => setDetail(null)}
            item={investigations.find((item) => item.id === detail)!}
          />
        )}
      </ResearchDialog>
      <ResearchDialog
        open={!!assessment}
        onClose={() => setAssessmentId(null)}
        title={
          assessmentId
            ? `${investigations.find((item) => item.id === assessmentId)?.name} · Evidence & Confidence`
            : "Evidence & Confidence"
        }
      >
        {assessment && (
          <RankingAssessmentPanel
            assessment={assessment}
            pending={actions?.pending}
            onReview={() => {
              setAssessmentId(null);
              actions?.review(rankingReviewRequest(assessment));
            }}
            onInvestigate={() => {
              setAssessmentId(null);
              actions?.ask(
                `Investigate the scientific relevance and evidence gaps of ${investigations.find((item) => item.id === assessment.recordId)?.name} for ${goal} in ${environment}. ${question ? "Question: " + question : ""} Distinguish relevance, evidence quality, confidence and applicability; investigate original context before drawing conclusions.`,
                { recordIds: [assessment.recordId], goal: activeGoal },
              );
            }}
          />
        )}
      </ResearchDialog>
      <Expandable
        title="Advanced Research Details"
        subtitle="Criteria, evidence quality, uncertainty, and sources"
        icon={<Gear />}
      >
        <p>
          Research is grouped by a local topic match derived from retrieved NASA
          metadata to your goal. A specific question searches the full catalog
          so local goal tags cannot hide an exact investigation. Without a
          specific question, All environments retains catalog order. A specific
          environment prioritizes documented oxygen/pressure, material, smoke,
          airflow and gravity factors. This orders research attention, not
          evidence quality or validated habitat suitability. No numerical safety
          score is asserted.
        </p>
        <p>
          High relevance earns attention. Strong evidence earns confidence.
          Background articles, incident history and technology-transfer
          descriptions do not add experimental scores or change this PSI
          ordering.
        </p>
        <details>
          <summary>How the original 20-point framework is applied</summary>
          <p>
            These are project reasoning and engineering principles, not an
            official NASA rubric or twenty mandatory response headings.
          </p>
          {rankingFrameworkGroups.map((group) => (
            <p key={group.label}>
              <strong>
                {group.label} (points {group.points.join(", ")}):
              </strong>{" "}
              {group.implementation}
            </p>
          ))}
        </details>
      </Expandable>
    </div>
  );
}
