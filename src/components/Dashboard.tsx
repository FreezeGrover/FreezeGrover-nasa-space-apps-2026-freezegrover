"use client";
import { catalogSummary } from "@/lib/research/catalog";
import { useCallback, useEffect, useState } from "react";
import type { ResearchContext } from "@/types/conversation";
import { useResearchConversation } from "./useResearchConversation";
import { ResearchConversation } from "./ResearchConversation";
import { ResearchActions } from "./ResearchActions";
import type { ScientificReviewRequest } from "@/types/resources";
import { answerReviewRequest } from "@/lib/qa/handoff";
import { catalogAnswer } from "@/lib/research/answer";
import {
  Flame,
  House,
  Flask,
  SquaresFour,
  ChartBar,
  ShieldCheck,
  Info,
  X,
  Plugs,
  ChatCircle,
} from "@phosphor-icons/react";
import type { Tab, Environment } from "@/types/research";
import { Overview } from "@/screens/Overview";
import { Investigations } from "@/screens/Investigations";
import { Compare } from "@/screens/Compare";
import { Rankings, type RankingSetup } from "@/screens/Rankings";
import { ScientificQA } from "@/screens/ScientificQA";
import { ResearchSearch } from "./ResearchSearch";
import { EvidenceFooter } from "./ui";
const navigation: { name: Tab; icon: typeof House }[] = [
  { name: "Overview", icon: House },
  { name: "Investigations", icon: Flask },
  { name: "Compare", icon: SquaresFour },
  { name: "Rankings", icon: ChartBar },
  { name: "Scientific QA", icon: ShieldCheck },
];
export function Dashboard() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [environment, setEnvironment] = useState<Environment>("All");
  const [query, setQuery] = useState("");
  const [rankingSetup, setRankingSetup] = useState<RankingSetup>();
  const [chatOpen, setChatOpen] = useState(false);
  const [contexts, setContexts] = useState<
    Partial<
      Record<Tab, { recordIds: string[]; goal?: string; sourceIds?: string[] }>
    >
  >({ Compare: { recordIds: ["flex", "flex2"] } });
  const [comparePair, setComparePair] = useState<string[] | undefined>();
  const researchContext: ResearchContext = {
    tab,
    ...(contexts[tab] ?? { recordIds: [] }),
  };
  const conversation = useResearchConversation(environment, researchContext);
  const { answer, submitted, pending: searching } = conversation;
  const updateContext = useCallback(
    (recordIds: string[], goal?: string, sourceIds?: string[]) =>
      setContexts((previous) => {
        if (
          JSON.stringify(previous[tab]) ===
          JSON.stringify({
            recordIds,
            ...(goal ? { goal } : {}),
            ...(sourceIds ? { sourceIds } : {}),
          })
        )
          return previous;
        return {
          ...previous,
          [tab]: {
            recordIds,
            ...(goal ? { goal } : {}),
            ...(sourceIds ? { sourceIds } : {}),
          },
        };
      }),
    [tab],
  );
  const [aiConfigured, setAiConfigured] = useState(false);
  const [qaReview, setQaReview] = useState<
    ScientificReviewRequest | undefined
  >();
  useEffect(() => {
    fetch("/api/research")
      .then((response) => response.json())
      .then((status) => setAiConfigured(status.configured === true))
      .catch(() => setAiConfigured(false));
  }, []);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [disclosure, setDisclosure] = useState(false);
  function searchResearch() {
    if (searching || !conversation.ready || !query.trim()) return;
    void conversation.send(query);
    setQuery("");
    setShowSearchResults(false);
    setChatOpen(true);
  }
  function reviewStatement(recordId: string, statement: string) {
    const citation = answer?.statements.find(
      (item) => item.recordId === recordId && item.interpretation === statement,
    );
    const request =
      answer && citation
        ? answerReviewRequest(answer, citation)
        : { recordId, statement };
    setChatOpen(false);
    navigate("Scientific QA", request);
  }
  function navigate(nextTab: Tab, reviewOverride?: ScientificReviewRequest) {
    setShowSearchResults(false);
    if (nextTab === "Scientific QA") {
      if (reviewOverride) setQaReview(reviewOverride);
      else if (answer) {
        const latest = answerReviewRequest(answer);
        if (
          latest &&
          (!qaReview ||
            qaReview.question !== latest.question ||
            qaReview.answerText !== latest.answerText)
        )
          setQaReview(latest);
      }
    }
    setTab(nextTab);
  }

  return (
    <ResearchActions.Provider
      value={{
        pending: searching,
        ask: (question, context) => {
          setShowSearchResults(false);
          setChatOpen(true);
          void conversation.send(question, undefined, context);
        },
        review: (request) => {
          setChatOpen(false);
          navigate("Scientific QA", request);
        },
      }}
    >
      <div className="app-frame">
        <header className="app-header">
          <div className="brand">
            <img
              src="/assets/flame-logo.png"
              alt="Flames in Free Fall"
              className="brand-logo"
            />
            <div>
              <strong>Flames in Free Fall</strong>
              <span>Combustion Research Dashboard</span>
            </div>
          </div>
          {
            <h1 className="page-title">
              {tab === "Compare"
                ? "Compare Investigations"
                : tab === "Rankings"
                  ? "Research Rankings"
                  : tab}
            </h1>
          }
          <button
            className="disclosure-button"
            onClick={() => setDisclosure(true)}
          >
            <Info />
            AI Usage & Disclosure
          </button>
        </header>
        <div className="app-body">
          <aside className="sidebar">
            <nav aria-label="Main navigation">
              {navigation.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => navigate(name)}
                  className={tab === name ? "selected" : ""}
                  aria-current={tab === name ? "page" : undefined}
                >
                  <Icon />
                  {name}
                </button>
              ))}
            </nav>
            <button
              className="conversation-launcher"
              onClick={() => setChatOpen(true)}
            >
              <ChatCircle />
              {searching
                ? `Researching · ${conversation.elapsed}s`
                : conversation.messages.length
                  ? "Continue research"
                  : "Research conversation"}
            </button>
            <div className="connection-state">
              <Plugs />
              <strong>NASA PSI snapshot loaded</strong>
              <small>
                {catalogSummary.verifiedCombustionRecords} combustion records
                <br />
                {aiConfigured
                  ? "OpenAI configured"
                  : "Catalog mode · AI not configured"}
              </small>
            </div>
          </aside>
          <main>
            {(tab === "Overview" || tab === "Investigations") && (
              <ResearchSearch
                value={query}
                onChange={setQuery}
                onSearch={searchResearch}
                pending={searching || !conversation.ready}
              />
            )}
            <div className="screen-content" key={tab}>
              {tab === "Overview" && (
                <Overview
                  environment={environment}
                  setEnvironment={setEnvironment}
                  navigate={navigate}
                  query={submitted}
                  answer={answer}
                  searching={searching}
                />
              )}{" "}
              {tab === "Investigations" && (
                <Investigations
                  query={submitted}
                  answer={answer}
                  searching={searching}
                  onReview={reviewStatement}
                  onBrowseCatalog={() =>
                    conversation.setAnswer(
                      catalogAnswer(
                        submitted,
                        "Catalog matches selected explicitly. No AI explanation was generated.",
                      ),
                    )
                  }
                  onContextChange={updateContext}
                  showResults={showSearchResults}
                  onResultsChange={setShowSearchResults}
                  environment={environment}
                  setEnvironment={setEnvironment}
                />
              )}{" "}
              {tab === "Compare" && (
                <Compare
                  initialPair={comparePair}
                  onContextChange={updateContext}
                />
              )}{" "}
              {tab === "Rankings" && (
                <Rankings
                  initialSetup={rankingSetup}
                  onSetupChange={setRankingSetup}
                  onContextChange={updateContext}
                  environment={environment}
                  setEnvironment={setEnvironment}
                />
              )}{" "}
              {tab === "Scientific QA" && (
                <ScientificQA
                  review={qaReview}
                  onContextChange={updateContext}
                />
              )}
            </div>
            <EvidenceFooter />
          </main>
        </div>
        <ResearchConversation
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          conversation={conversation}
          context={researchContext}
          environment={environment}
          onReview={reviewStatement}
          onBrowse={() => {
            if (!answer || answer.mode === "unavailable")
              conversation.setAnswer(
                catalogAnswer(
                  submitted,
                  "Catalog browsing selected. No additional AI request was made.",
                ),
              );
            setChatOpen(false);
            navigate("Investigations");
            setShowSearchResults(true);
          }}
          onCompare={(ids) => {
            setComparePair(ids);
            setChatOpen(false);
            navigate("Compare");
          }}
        />
        {disclosure && (
          <div className="modal-backdrop" onClick={() => setDisclosure(false)}>
            <section
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="disclosure-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                aria-label="Close disclosure"
                onClick={() => setDisclosure(false)}
              >
                <X />
              </button>
              <Info size={38} />
              <h2 id="disclosure-title">AI Usage & Disclosure</h2>
              <p>
                This interface is a research prototype. The current
                investigation catalog is a retrieved NASA PSI snapshot with
                original metadata and selected downloaded CSV files. It is not a
                continuous live NASA feed.
              </p>
              <p>
                {aiConfigured
                  ? "OpenAI is configured server-side. Sending a message sends your question, recent conversation, dashboard context and public NASA excerpts to OpenAI for interpretation. The conversation is kept in this browser tab for the session. Source quotes are checked separately; AI interpretations remain unverified."
                  : "OpenAI is not configured. Searching retrieves local catalog records without generating an AI answer."}
              </p>
              <p>
                Evidence strength, research ranking, habitat suitability, and
                fire-safety recommendations are not verified. The Scientific QA
                screen keeps claim verification pending until source support,
                units and experimental conditions are independently checked.
              </p>
              <button
                className="search-button"
                onClick={() => setDisclosure(false)}
              >
                Understood
              </button>
            </section>
          </div>
        )}
      </div>
    </ResearchActions.Provider>
  );
}
