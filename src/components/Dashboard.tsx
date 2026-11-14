"use client";
import { catalogSummary } from "@/lib/research/catalog";
import { useEffect, useRef, useState } from "react";
import type {ResearchAnswer} from "@/types/answer";
import {catalogAnswer} from "@/lib/research/answer";
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
} from "@phosphor-icons/react";
import type { Tab, Environment } from "@/types/research";
import { Overview } from "@/screens/Overview";
import { Investigations } from "@/screens/Investigations";
import { Compare } from "@/screens/Compare";
import { Rankings } from "@/screens/Rankings";
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
  const [submitted, setSubmitted] = useState("");
  const [answer,setAnswer]=useState<ResearchAnswer|null>(null);
  const [searching,setSearching]=useState(false);
  const [aiConfigured,setAiConfigured]=useState(false);
  const [qaReview,setQaReview]=useState<{recordId:string;statement:string}|undefined>();
  const searchSequence=useRef(0);
  useEffect(()=>{fetch("/api/research").then(response=>response.json()).then(status=>setAiConfigured(status.configured===true)).catch(()=>setAiConfigured(false));},[]);
  const [showSearchResults,setShowSearchResults]=useState(false);
  const [disclosure, setDisclosure] = useState(false);
  async function searchResearch() {
    const sequence=++searchSequence.current;
    setSubmitted(query);
    setAnswer(null);
    setSearching(true);
    setShowSearchResults(true);
    setTab("Investigations");
    try {
      const response=await fetch("/api/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query,environment})});
      if(!response.ok) throw new Error("Research request failed");
      const result:ResearchAnswer=await response.json();
      if(sequence===searchSequence.current) setAnswer(result);
    }catch{
      if(sequence===searchSequence.current) setAnswer(catalogAnswer(query,"Research service unavailable. Showing local catalog matches only."));
    }finally{if(sequence===searchSequence.current) setSearching(false);}
  }
  function reviewStatement(recordId:string,statement:string){
    setQaReview({recordId,statement});
    navigate("Scientific QA");
  }
  function navigate(nextTab: Tab) {
    setShowSearchResults(false);
    setTab(nextTab);
  }
  return (
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
        {(
          <h1 className="page-title">
            {tab === "Compare"
              ? "Compare Investigations"
              : tab === "Rankings"
                ? "Research Rankings"
                : tab}
          </h1>
        )}
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
          <div className="connection-state">
            <Plugs />
            <strong>NASA PSI snapshot loaded</strong>
            <small>
              {catalogSummary.verifiedCombustionRecords} combustion records
              <br />
              {aiConfigured?"OpenAI configured":"Catalog mode · AI not configured"}
            </small>
          </div>
        </aside>
        <main>
          {(tab === "Overview" || tab === "Investigations") && (
            <ResearchSearch
              value={query}
              onChange={setQuery}
              onSearch={searchResearch}
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
              />
            )}{" "}
            {tab === "Investigations" && (
              <Investigations
                query={submitted}
                answer={answer}
                searching={searching}
                onReview={reviewStatement}
                showResults={showSearchResults}
                onResultsChange={setShowSearchResults}
                environment={environment}
                setEnvironment={setEnvironment}
              />
            )}{" "}
            {tab === "Compare" && <Compare />}{" "}
            {tab === "Rankings" && (
              <Rankings
                environment={environment}
                setEnvironment={setEnvironment}
              />
            )}{" "}
            {tab === "Scientific QA" && <ScientificQA review={qaReview}/>}
          </div>
          <EvidenceFooter />
        </main>
      </div>
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
              This interface is a research prototype. The current investigation
              catalog is a retrieved NASA PSI snapshot with original metadata
              and selected downloaded CSV files. It is not a continuous live
              NASA feed.
            </p>
            <p>
              {aiConfigured ? "OpenAI is configured server-side. An explicit Search sends your question and public NASA excerpts to OpenAI for interpretation. Source quotes are checked separately; AI interpretations remain unverified." : "OpenAI is not configured. Searching retrieves local catalog records without generating an AI answer."}
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
  );
}
