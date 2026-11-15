"use client";
import { CatalogBriefing } from "@/components/CatalogBriefing";
import { Sparkle } from "@phosphor-icons/react";
import type { Environment, Tab } from "@/types/research";
import { Panel } from "@/components/ui";
import { MissionContext } from "@/components/MissionContext";
import { Applications } from "@/components/Applications";
import type { ResearchAnswer } from "@/types/answer";
import { FetchingResearch } from "@/components/FetchingResearch";

const criteria = [
  { number: "01", name: "Impact", label: "Better decisions start with better questions", description: "Help people investigate unexplained flame behavior rather than accept a premature answer. The goal is to make complex NASA combustion evidence usable for research, learning and future fire-safety analysis." },
  { number: "02", name: "Creativity", label: "Multiple hypotheses, one conversation", description: "An observation can support several interpretations. Our conversational research approach explores competing explanations, asks what would distinguish them and connects each to relevant NASA evidence." },
  { number: "03", name: "Validity", label: "Evidence before confidence", description: "Separate direct observations, plausible mechanisms and unknowns. Check test conditions and measurement limits; do not turn an AI hypothesis into a verified NASA finding." },
  { number: "04", name: "Relevance", label: "NASA data drives the investigation", description: "Ground the reasoning in NASA PSI investigations, original experiment conditions and source passages—including the limits of transferring microgravity results to lunar gravity." },
  { number: "05", name: "Presentation", label: "Show the reasoning, not just the answer", description: "Lead judges through one memorable disappearing-flame mystery, the alternatives it raises, the evidence needed and the honest conclusion: what we know, and what we still need to test." },
];

const hypotheses = [
  { number: "01", name: "Flame extinction", explanation: "The reaction may have stopped if oxygen transport or heat feedback became insufficient." },
  { number: "02", name: "A flame too faint to see", explanation: "Combustion might continue with luminosity below the camera or observer's detection limit." },
  { number: "03", name: "Changed experimental conditions", explanation: "Oxygen, ventilation, fuel geometry or other conditions may have altered flame behavior." },
  { number: "04", name: "Observation limitation", explanation: "Exposure, spectral sensitivity or viewing geometry could make the flame appear to vanish." },
];

const questions = [
  { question: "What does it do?", answer: "Turn an ambiguous microgravity combustion observation into an evidence-led scientific investigation—not a one-answer chatbot response." },
  { question: "How does it work?", answer: "Explore alternative interpretations, retrieve relevant NASA PSI investigations, compare experimental conditions and review source-linked claims. The conversational reasoning workflow is being developed and evaluated." },
  { question: "Who benefits?", answer: "Researchers and learners can ask better questions and recognize uncertainty; future spacecraft fire-safety analysis may benefit from more transparent interpretation of experimental findings." },
  { question: "What tools were used?", answer: "A Next.js and TypeScript interface, NASA PSI source material, research comparisons and an OpenAI-powered conversational assistant when configured." },
  { question: "What makes it creative?", answer: "The assistant is designed to challenge the first plausible explanation, consider alternatives and show which measurements could actually resolve the ambiguity." },
  { question: "What did we consider?", answer: "Oxygen, pressure, airflow, fuel geometry, gravity, flame luminosity, detector limits, source quality and the difference between a research hypothesis and a verified result." },
];

export function Overview({
  environment,
  setEnvironment,
  navigate,
  query = "", answer, searching = false,
}: {
  environment: Environment;
  setEnvironment: (v: Environment) => void;
  navigate: (v: Tab) => void;
  query?: string;
  answer?: ResearchAnswer | null;
  searching?: boolean;
}) {
  return (
    <div className="overview-page">
      <section className="overview-story" aria-labelledby="overview-story-title">
        <div className="overview-story-content">
          <span className="overview-eyebrow"><span className="overview-eyebrow-dot" /> NASA SPACE APPS 2026 · FLAME IN FREEFALL</span>
          <h1 id="overview-story-title">Understand fire <span>where gravity changes.</span></h1>
          <p>Combustion behaves differently in free fall. Flames in Free Fall turns NASA microgravity research into an explorable, evidence-grounded scientific conversation—without mistaking promising findings for proven spacecraft safety.</p>
          <div className="overview-story-actions">
            <button type="button" onClick={() => navigate("Investigations")}>Explore investigations <span aria-hidden="true">↗</span></button>
            <a href="https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/?tab=resources" target="_blank" rel="noopener noreferrer">NASA challenge brief <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="overview-story-visual" aria-hidden="true">
          <div className="overview-orbit overview-orbit-one" />
          <div className="overview-orbit overview-orbit-two" />
          <div className="overview-flame-halo"><img src="/assets/illustrative-flame.png" alt="" /></div>
          <span className="overview-visual-caption">MICROGRAVITY · COMBUSTION · EVIDENCE</span>
        </div>
      </section>

      <div className="overview-top">
        <Panel title="Research Briefing — NASA PSI" icon={<Sparkle />}>
          {searching ? <FetchingResearch /> : answer?.mode === "unavailable" ? <p>AI search paused. Open Investigations to review the search status or browse the catalog.</p> : <CatalogBriefing query={query} answer={answer} />}
        </Panel>
        <MissionContext value={environment} onChange={setEnvironment} />
      </div>

      <Applications expanded environment={environment} />

      <section className="overview-mystery" aria-labelledby="overview-mystery-title">
        <div className="overview-section-heading">
          <div>
            <span className="overview-section-kicker">OUR DIFFERENTIATOR · SCIENTIFIC REASONING</span>
            <h2 id="overview-mystery-title">One disappearing flame. Several possible explanations.</h2>
            <p>Instead of guessing, the research conversation should investigate what the observation actually supports.</p>
          </div>
          <span className="overview-mystery-stage">Illustrative reasoning scenario · not a verified experiment finding</span>
        </div>
        <div className="overview-mystery-question"><span>RESEARCHER ASKS</span><p>“We were observing a small flame during a microgravity combustion experiment. After a while, the flame became very faint and disappeared. What happened?”</p></div>
        <div className="overview-mystery-transition"><span>NOT ONE AUTOMATIC ANSWER</span><span aria-hidden="true">↓</span><span>EXPLORE PLAUSIBLE INTERPRETATIONS</span></div>
        <div className="overview-hypothesis-grid">
          {hypotheses.map((item) => (
            <article className="overview-hypothesis" key={item.number}>
              <span className="overview-hypothesis-id">HYPOTHESIS {item.number}</span>
              <h3>{item.name}</h3>
              <p>{item.explanation}</p>
            </article>
          ))}
        </div>
        <div className="overview-evidence-line">
          <div><strong>Then investigate the evidence</strong><p>Check NASA PSI experiments and original conditions: oxygen, airflow, pressure, fuel, timing, camera observations and measurement uncertainty.</p></div>
          <div><strong>State what remains unknown</strong><p>Fading visibility alone does not establish extinction. Distinguish supported findings from hypotheses and ask the next useful question.</p></div>
        </div>
        <p className="overview-mystery-principle">High relevance earns attention. <strong>Strong evidence earns confidence.</strong></p>
      </section>

      <section className="overview-judging" aria-labelledby="overview-judging-title">
        <div className="overview-section-heading">
          <div>
            <span className="overview-section-kicker">THE EVALUATION FRAMEWORK</span>
            <h2 id="overview-judging-title">Why our scientific approach stands out</h2>
            <p>The five NASA Space Apps judging criteria, through the lens of our distinguishing idea: reason about ambiguity, trace the evidence and acknowledge uncertainty. These are project aims, not awarded scores.</p>
          </div>
          <a href="https://www.spaceappschallenge.org/resources/judging-awards-guide/" target="_blank" rel="noopener noreferrer">Official judging guide ↗</a>
        </div>
        <div className="overview-criteria-grid">
          {criteria.map((criterion) => (
            <article className="overview-criterion" key={criterion.name}>
              <span className="overview-criterion-number">{criterion.number}</span>
              <span className="overview-criterion-tag">{criterion.label}</span>
              <h3>{criterion.name}</h3>
              <p>{criterion.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="overview-narrative" aria-labelledby="overview-narrative-title">
        <div className="overview-section-heading">
          <div>
            <span className="overview-section-kicker">PROJECT STORY</span>
            <h2 id="overview-narrative-title">Six questions. One scientific mission.</h2>
            <p>A concise guide for visitors and judges, from the problem we address to the limits of what the evidence can say.</p>
          </div>
        </div>
        <div className="overview-question-grid">
          {questions.map((item, index) => (
            <article className="overview-question" key={item.question}>
              <span className="overview-question-index">{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{item.question}</h3><p>{item.answer}</p></div>
            </article>
          ))}
        </div>
        <div className="overview-integrity-note">
          <strong>Our scientific promise</strong>
          <span>NASA evidence is the starting point, not a guarantee. Claims depend on their original test conditions; independent scientific review and human validation remain essential.</span>
        </div>
      </section>
    </div>
  );
}
