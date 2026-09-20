"use client";

import { useMemo, useState } from "react";
import {
  Activity, BarChart3, BookOpenText, BrainCircuit, ChevronRight, Database,
  Download, ExternalLink, FileText, Filter, Flame, Image as ImageIcon,
  Layers3, Orbit, Search, ShieldCheck, Sparkles, Telescope, X
} from "lucide-react";
import { saffireExperiments, saffireFindings } from "../lib/data/saffire";
import { sourceRegistry } from "../lib/source-registry";

const nav = [
  ["Overview", Orbit],
  ["Summarize", BookOpenText],
  ["Ranking", BarChart3],
  ["Interpretation", BrainCircuit],
  ["Safety Insights", ShieldCheck],
  ["Experiments", Telescope],
  ["Evidence", Database],
  ["Ask FREEZGROVER", Sparkles],
] as const;

type TabName = (typeof nav)[number][0];

const criteria = [
  "Date range", "Experiment", "Mission / program", "Material / fuel", "Airflow",
  "Oxygen", "Pressure", "Gravity", "Geometry", "Ignition", "Measurement",
  "Phenomenon", "Evidence type", "Source type", "Finding", "Keyword / topic"
];

function PageHeader({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return <header className="workspace-head">
    <div><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div>
    <span className="connected"><i /> RESEARCH SYSTEM ONLINE</span>
  </header>;
}

function SelectCard({ index, title, description, Icon, selected, onClick }: { index: number; title: string; description: string; Icon: React.ElementType; selected?: boolean; onClick?: () => void }) {
  return <button className={selected ? "select-card selected" : "select-card"} onClick={onClick}>
    <div className="select-card-top"><span>0{index}</span><div className="select-icon"><Icon size={19} /></div></div>
    <strong>{title}</strong><small>{description}</small><div className="select-footer">SELECT <ChevronRight size={14} /></div>
  </button>;
}

function CriteriaLab({ selected, setSelected, placeholder }: { selected: string[]; setSelected: (value: string[]) => void; placeholder: string }) {
  return <section className="criteria-lab">
    <div className="lab-heading"><div><span className="section-kicker">CRITERIA & CONSTRAINTS</span><h3>Define exactly what belongs in the scope.</h3><p>Use one criterion or combine many. FREEZGROVER should adapt to the research question rather than force a fixed template.</p></div><Filter size={20} /></div>
    <div className="criteria-cloud">{criteria.map(item => <button key={item} className={selected.includes(item) ? "criteria-pill active" : "criteria-pill"} onClick={() => setSelected(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item])}>{item}{selected.includes(item) && <b>✓</b>}</button>)}</div>
    <div className="scope-search"><Search size={18} /><input placeholder={placeholder} /><button>Apply scope</button></div>
  </section>;
}

function Overview({ openTab }: { openTab: (tab: TabName) => void }) {
  const layers: Array<{ title: string; text: string; target: TabName }> = [
    { title: "SAFETY INSIGHTS", text: "Connect supported understanding to fire-safety significance for human spaceflight.", target: "Safety Insights" },
    { title: "INTERPRETATION", text: "Understand what findings mean, what they support and where certainty ends.", target: "Interpretation" },
    { title: "SUMMARIZE + RANK", text: "Condense the knowledge base or prioritize information for a defined purpose.", target: "Summarize" },
    { title: "RESEARCH LANDSCAPE", text: "Experiments, publications, measurements, imagery, findings and datasets.", target: "Experiments" },
    { title: "EVIDENCE FOUNDATION", text: "Verified NASA and NTRS material with traceable provenance.", target: "Evidence" },
  ];

  return <>
    <PageHeader kicker="FREEZGROVER · RESEARCH OVERVIEW" title="From research evidence to defensible fire-safety understanding." description="A connected view of the knowledge, tools and reasoning used to explore NASA microgravity-combustion research." />
    <section className="overview-grid">
      <article className="architecture-panel panel">
        <div className="panel-label"><span>RESEARCH ARCHITECTURE</span><b>INTERACTIVE OVERVIEW</b></div>
        <h2>The system at a glance</h2><p className="lead">Not a rigid pipeline. Different forms of research feed a connected intelligence layer.</p>
        <div className="knowledge-stack">{layers.map((layer, i) => <button key={layer.title} className={`stack-layer layer-${i}`} onClick={() => openTab(layer.target)}><span>{String(layers.length - i).padStart(2, "0")}</span><div><strong>{layer.title}</strong><small>{layer.text}</small></div><ChevronRight size={17} /></button>)}</div>
      </article>
      <article className="knowledge-panel panel">
        <div className="panel-label"><span>KNOWLEDGE BASE</span><b>CONNECTED SOURCES</b></div>
        <div className="research-orbit"><div className="orbit-core"><Flame size={25} /><strong>FREEZGROVER</strong><small>Research intelligence</small></div>{["Experiments", "Publications", "Findings", "Measurements", "Imagery", "Datasets"].map((name, i) => <span key={name} className={`satellite sat-${i}`}>{name}</span>)}</div>
        <div className="overview-actions"><button onClick={() => openTab("Evidence")}><Database size={16} /> Explore evidence</button><button onClick={() => openTab("Ask FREEZGROVER")}><Sparkles size={16} /> Ask FREEZGROVER</button></div>
      </article>
    </section>
    <section className="metric-strip"><div><b>{saffireExperiments.length}</b><span>Structured experiments</span></div><div><b>{saffireFindings.length}</b><span>Traceable findings</span></div><div><b>{sourceRegistry.length}</b><span>Registered sources</span></div><div><b>{criteria.length}</b><span>Research criteria available</span></div></section>
    <section className="overview-bottom"><div><span className="section-kicker">ONE CONNECTED ENVIRONMENT</span><h2>Explore the research from whichever direction makes sense.</h2></div><p>Experiments are one important part of the knowledge base—not the only foundation. Publications, observations, measurements, imagery, findings and future datasets can all contribute to summarization, ranking, interpretation and safety insight.</p></section>
  </>;
}

function SummarizeView() {
  const options = [
    ["All current research", "Build a synthesis across the verified knowledge base.", Layers3],
    ["Experiment", "Summarize one experiment or a selected comparison.", Telescope],
    ["Document or chapter", "Focus on a NASA report, article, section or chapter.", FileText],
    ["Topic or question", "Bring together evidence around a scientific question.", Search],
    ["Image or figure", "Summarize and explain a selected scientific visual.", ImageIcon],
    ["Custom selection", "Combine sources, dates, conditions and constraints.", Filter],
  ] as const;
  const [scope, setScope] = useState(options[0][0]);
  const [filters, setFilters] = useState<string[]>([]);
  return <>
    <PageHeader kicker="SUMMARIZE · AI SYNTHESIS" title="What would you like to summarize?" description="Create a focused synthesis from the whole knowledge base or only the material matching your criteria. The output keeps important context, limitations and sources attached." />
    <section className="research-builder">
      <div className="builder-intro"><span className="section-kicker">CHOOSE A STARTING POINT</span><h2>Start broad. Narrow only when you need to.</h2><p>A summary could cover everything currently known, one experiment, one report, a date range, a topic, an image, or a highly specific combination of conditions.</p></div>
      <div className="select-card-grid">{options.map(([title, description, Icon], i) => <SelectCard key={title} index={i + 1} title={title} description={description} Icon={Icon} selected={scope === title} onClick={() => setScope(title)} />)}</div>
      <CriteriaLab selected={filters} setSelected={setFilters} placeholder="Describe the scope naturally — e.g. summarize Saffire airflow findings between selected years…" />
      <section className="report-composer"><div><span className="section-kicker">SUMMARY REQUEST</span><h3>{scope}</h3><p>{filters.length ? `Active criteria: ${filters.join(" · ")}` : "No additional criteria selected. The full chosen scope will be considered."}</p></div><textarea placeholder="Add instructions: What should the summary focus on? How detailed should it be? Who is it for?" /><div className="report-actions"><button className="format active">Research brief</button><button className="format">Detailed report</button><button className="format">Executive summary</button><button className="format">Technical synthesis</button><button className="generate"><Sparkles size={15} /> Generate summary</button></div></section>
      <section className="output-preview"><div><span className="section-kicker">REPORT OUTPUT</span><h2>Your evidence-linked summary will appear here.</h2><p>The generated report should organize findings, scope, conditions, limitations and source provenance into a readable document rather than exposing internal database labels.</p></div><button className="pdf-button" onClick={() => window.print()}><Download size={16} /> Create PDF</button></section>
    </section>
  </>;
}

function RankingView() {
  const options = [
    ["Evidence for a question", "Prioritize the evidence most relevant to a research question."],
    ["Experiments", "Compare experiments against selected scientific conditions."],
    ["Sources", "Rank reports and articles by relevance to a chosen topic."],
    ["Findings", "Prioritize findings using explicit constraints and evidence strength."],
  ];
  const [scope, setScope] = useState(options[0][0]);
  const [filters, setFilters] = useState<string[]>([]);
  return <>
    <PageHeader kicker="RANKING · PURPOSE-DRIVEN RELEVANCE" title="What do you want to rank—and for what purpose?" description="There is no universal number one. FREEZGROVER builds a ranking only after the target, question and scientific criteria are clear, then explains why each item sits where it does." />
    <section className="research-builder">
      <div className="builder-intro"><span className="section-kicker">DEFINE THE RANKING</span><h2>A ranking needs a question before it needs numbers.</h2><p>Select what is being ranked and which constraints matter. Changing the question or criteria can legitimately change the order.</p></div>
      <div className="select-card-grid four">{options.map(([title, description], i) => <SelectCard key={title} index={i + 1} title={title} description={description} Icon={BarChart3} selected={scope === title} onClick={() => setScope(title)} />)}</div>
      <CriteriaLab selected={filters} setSelected={setFilters} placeholder="e.g. Rank evidence most relevant to airflow velocity and flame spread in microgravity…" />
      <section className="ranking-logic"><div><span className="section-kicker">VISIBLE RANKING LOGIC</span><h3>Users should always know why something ranks where it does.</h3><p>Each result will state the ranking question, active criteria, condition match, measurement relevance, evidence strength, source traceability and a plain-language explanation.</p></div><div className="logic-bars">{["Condition match", "Question relevance", "Material / fuel match", "Measurement relevance", "Evidence strength", "Source traceability"].map((x, i) => <div key={x}><span>{x}</span><i style={{ width: `${88 - i * 7}%` }} /></div>)}</div></section>
      <section className="output-preview"><div><span className="section-kicker">RANKED RESULT</span><h2>A ranking with reasons—not unexplained numbers.</h2><p>The order will only be produced after the target and criteria are defined.</p></div><button className="pdf-button" onClick={() => window.print()}><Download size={16} /> Export ranking PDF</button></section>
    </section>
  </>;
}

function InterpretationView() {
  return <>
    <PageHeader kicker="INTERPRETATION · FROM FINDING TO MEANING" title="Understand what the research actually means." description="Interpretation goes beyond repeating a finding. It explains what the evidence supports, what context changes its meaning, what remains uncertain and which conclusions would go too far." />
    <section className="research-builder">
      <div className="builder-intro"><span className="section-kicker">WHAT THIS WORKSPACE DOES</span><h2>Move from observation to meaning without crossing the evidence boundary.</h2><p>Interpret a finding, graph, image, dataset, report, experiment, comparison or group of sources.</p></div>
      <div className="interpret-path">{[["01","OBSERVATION","What was actually reported or measured"],["02","CONTEXT","Conditions, source and comparison set"],["03","MEANING","What the evidence reasonably supports"],["04","BOUNDARY","Uncertainty and unsupported conclusions"]].map(([n, t, d], i) => <div className="interpret-step" key={t}><span>{n}</span><strong>{t}</strong><small>{d}</small>{i < 3 && <ChevronRight size={16} />}</div>)}</div>
      <div className="select-card-grid four"><SelectCard index={1} title="Finding or claim" description="Understand a reported result in its experimental context." Icon={FileText} /><SelectCard index={2} title="Graph, image or figure" description="Interpret a scientific visual while keeping provenance visible." Icon={ImageIcon} /><SelectCard index={3} title="Experiment or comparison" description="Explain what similarities and differences actually imply." Icon={Telescope} /><SelectCard index={4} title="Multiple sources" description="Examine supporting, differing or conflicting evidence together." Icon={Database} /></div>
      <div className="scope-search interpretation-search"><BrainCircuit size={18} /><input placeholder="What would you like FREEZGROVER to help you understand?" /><button>Interpret</button></div>
    </section>
  </>;
}

function SafetyView() {
  const domains = ["Materials & flammability", "Ignition & extinction", "Flame spread", "Airflow & ventilation", "Atmosphere & oxygen", "Pressure & environment", "Detection & observation", "Spacecraft fire risk"];
  return <>
    <PageHeader kicker="SAFETY INSIGHTS · HUMAN SPACEFLIGHT" title="Connect evidence to fire-safety significance—without overstating it." description="Explore safety questions by domain. Every insight should keep its supporting evidence, conditions, interpretation and uncertainty visible." />
    <section className="research-builder"><div className="safety-grid">{domains.map((domain, i) => <button key={domain} className="safety-card"><div><ShieldCheck size={20} /><span>0{i + 1}</span></div><strong>{domain}</strong><small>Explore supported findings, relevant evidence and important gaps.</small><div className="select-footer">EXPLORE <ChevronRight size={14} /></div></button>)}</div><div className="safety-chain"><span>VERIFIED EVIDENCE</span><ChevronRight size={15} /><span>SUPPORTED FINDING</span><ChevronRight size={15} /><span>INTERPRETATION</span><ChevronRight size={15} /><strong>SAFETY SIGNIFICANCE</strong></div></section>
  </>;
}

function ExperimentsView() {
  return <>
    <PageHeader kicker="EXPERIMENT EXPLORER" title="Explore the experimental landscape, not a wall of fields." description="Browse by experiment, date, material, conditions, phenomenon or measurement. Open a record to understand its purpose, setup, findings and relationship to other research." />
    <section className="research-builder"><div className="scope-search"><Search size={18} /><input placeholder="Search experiments, materials, measurements or conditions…" /><button>Search</button></div><div className="quick-filters">{["Timeline", "Material", "Airflow", "Oxygen", "Pressure", "Geometry", "Measurement"].map(x => <button key={x}>{x}</button>)}</div><div className="experiment-timeline">{saffireExperiments.map((experiment, i) => <article className="experiment-card" key={experiment.id}><div className="timeline-dot" /><span className="section-kicker">EXPERIMENT 0{i + 1}</span><h2>{experiment.name}</h2><p>{experiment.objective}</p><div className="experiment-meta"><span>Microgravity</span>{experiment.conditions.airflowCmPerS && <span>{experiment.conditions.airflowCmPerS} cm/s airflow</span>}<span>{experiment.measurements.length} measurements</span><span>{experiment.sourceIds.length} sources</span></div><button>Open experiment profile <ChevronRight size={14} /></button></article>)}</div></section>
  </>;
}

function EvidenceView() {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => sourceRegistry.filter(source => `${source.title} ${source.relevanceTags.join(" ")} ${source.nasaProgram}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <>
    <PageHeader kicker="EVIDENCE LIBRARY" title="The research foundation behind every answer." description="Browse verified NASA and NTRS material as a scientific library. See what a source is, why it matters, which research it connects to and where it supports a finding." />
    <section className="research-builder"><div className="scope-search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the evidence library…" /><button>Search</button></div><div className="quick-filters">{["All sources", "Technical reports", "Mission articles", "Saffire", "Combustion", "Fire safety"].map(x => <button key={x}>{x}</button>)}</div><div className="evidence-grid">{visible.map(source => <article className="source-card" key={source.id}><div className="source-top"><span>{source.organization}</span><b>{source.year ?? "NASA"}</b></div><div className="source-icon"><FileText size={22} /></div><h3>{source.title}</h3><p>{source.sourceKind.replaceAll("-", " ")} · {source.nasaProgram}</p><div className="source-tags">{source.relevanceTags.slice(0, 4).map(tag => <span key={tag}>{tag}</span>)}</div><a href={source.url} target="_blank" rel="noreferrer">Open official source <ExternalLink size={13} /></a></article>)}</div></section>
  </>;
}

function ChatModal({ close }: { close: () => void }) {
  return <div className="chat-backdrop"><section className="chat-modal"><header><div className="chat-brand"><div className="brand-orb"><Sparkles size={18} /></div><div><strong>FREEZGROVER</strong><span>Research intelligence</span></div></div><button onClick={close}><X size={19} /></button></header><iframe title="FREEZGROVER chat" src="/test" /></section></div>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [chatOpen, setChatOpen] = useState(false);
  const openTab = (tab: TabName) => { if (tab === "Ask FREEZGROVER") { setChatOpen(true); return; } setActiveTab(tab); };
  const view = activeTab === "Overview" ? <Overview openTab={openTab} /> : activeTab === "Summarize" ? <SummarizeView /> : activeTab === "Ranking" ? <RankingView /> : activeTab === "Interpretation" ? <InterpretationView /> : activeTab === "Safety Insights" ? <SafetyView /> : activeTab === "Experiments" ? <ExperimentsView /> : <EvidenceView />;
  return <main className="app-shell"><aside className="sidebar"><div className="brand-mark"><div className="brand-orb"><Flame size={20} /></div><div><strong>FREEZGROVER</strong><span>From Questions to Discovery</span></div></div><div className="mission-chip"><span className="status-dot" /> NASA SPACE APPS 2026</div><nav>{nav.map(([label, Icon]) => <button className={activeTab === label ? "nav-item active" : "nav-item"} key={label} onClick={() => openTab(label)}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{activeTab === label && <span className="nav-pulse" />}</button>)}</nav><div className="sidebar-footer"><div className="signal-line"><Activity size={15} /><span>Research system</span><b>ONLINE</b></div><div className="signal-line"><Database size={15} /><span>Evidence layer</span><b>READY</b></div></div></aside><section className="workspace">{view}</section>{chatOpen && <ChatModal close={() => setChatOpen(false)} />}</main>;
}
