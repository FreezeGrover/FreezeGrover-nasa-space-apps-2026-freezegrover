"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Home as HomeIcon, FlaskConical, MessageCircle, Bookmark, Info, Activity, BarChart3, BookOpenText, BrainCircuit, ChevronRight, Database,
  Download, ExternalLink, FileText, Filter, Flame, Image as ImageIcon,
  Layers3, Orbit, Search, ShieldCheck, Sparkles, Telescope, X
} from "lucide-react";
import { saffireExperiments, saffireFindings } from "../lib/data/saffire";
import { sourceRegistry } from "../lib/source-registry";

const nav = [
  ["Overview", HomeIcon, "Home"],
  ["Ask FREEZGROVER", MessageCircle, "Ask FREEZGROVER"],
  ["Experiments", FlaskConical, "Experiments"],
  ["Evidence", Database, "Evidence Library"],
  ["Datasets & Data", BarChart3, "Datasets & Data"],
  ["Saved Results", Bookmark, "Saved Results"],
  ["About", Info, "About"],
] as const;

type TabName = (typeof nav)[number][0] | "Summarize" | "Ranking" | "Interpretation" | "Safety Insights";

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

function ResearchStatIcon({ kind }: { kind: "sources" | "experiments" | "findings" }) {
  return <svg className="fg-stat-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    {kind === "sources" ? <><path d="M12 5h17l10 10v29H12z" fill="#0371ef" fillOpacity=".3" stroke="#27caff" strokeWidth="3" strokeLinejoin="round"/><path d="M29 5v12h10M19 24h13M19 30h13M19 36h9" stroke="#74e8ff" strokeWidth="3" strokeLinejoin="round"/></> : kind === "experiments" ? <><path d="M19 5h10M21 5v15L8 40q-2 4 3 4h26q5 0 3-4L27 20V5" stroke="#8ce5ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 28h16l8 12q2 4-3 4H11q-5 0-3-4z" fill="#8ce5ff"/><circle cx="22" cy="32" r="2" fill="#168cdb"/></> : <><rect x="7" y="27" width="8" height="17" rx="3" fill="#25b4ff"/><rect x="21" y="16" width="8" height="28" rx="3" fill="#49ceff"/><rect x="35" y="6" width="8" height="38" rx="3" fill="#80e4ff"/><path d="m10 19 14-9 14-7" stroke="#26c8ff" strokeWidth="2"/><circle cx="38" cy="3" r="3" fill="#80e4ff"/></>}
  </svg>;
}

function Overview({ openTab, ask, saveQuestion }: { openTab: (tab: TabName) => void; ask: (question: string) => void; saveQuestion: (question: string) => void }) {
  const [question, setQuestion] = useState("");
  const steps: Array<{ title: string; text: string; action: string; target: TabName }> = [
    { title: "Summarize Findings", text: "Distill key information from NASA’s research, experiments and data on microgravity combustion.", action: "Explore Summaries", target: "Summarize" },
    { title: "Rank Findings", text: "Prioritize experiments, findings or factors by relevance, impact and confidence for specific research questions.", action: "View Rankings", target: "Ranking" },
    { title: "Interpret Findings", text: "Analyze what the summarized and ranked results mean — with context, certainty and real-world boundaries.", action: "See Interpretation", target: "Interpretation" },
    { title: "Fire Safety Insights", text: "Explore evidence and considerations for safer spacecraft, habitats and operations.", action: "View Insights", target: "Safety Insights" }
  ];
  const examples = ["Summarize key findings on flame spread in microgravity", "Rank the most relevant experiments on solid fuel combustion", "What do these results mean for spacecraft fire safety?", "Recommend fire safety considerations for lunar habitats"];
  const asset = "/freezegrover-dashboard/";
  return <div className="fg-dashboard"><div className="fg-main">
    <section className="fg-hero"><div className="fg-hero-copy"><h1>Flame and <span>Free Fall</span></h1><p>Exploring combustion in microgravity using NASA’s research, experiments and data — with research analysis to explore fire safety insights for human space exploration.</p></div>
      <div className="fg-stats">{[{ label: "Registered Sources", value: sourceRegistry.length, detail: "NASA research · Evidence", target: "Evidence" as TabName, kind: "sources" as const }, { label: "Experiments", value: saffireExperiments.length, detail: "Microgravity combustion", target: "Experiments" as TabName, kind: "experiments" as const }, { label: "Traceable Findings", value: saffireFindings.length, detail: "Evidence-linked records", target: "Datasets & Data" as TabName, kind: "findings" as const }].map(({label,value,detail,target,kind}) => <button key={label} onClick={() => openTab(target)}><ResearchStatIcon kind={kind}/><span><small>{label}</small><strong>{value.toLocaleString()}</strong><small>{detail}</small></span></button>)}</div>
    </section>
    <section className="fg-pipeline"><header><h2>From NASA Research to Fire Safety Insights</h2><p><span>A step-by-step</span> research analysis workflow.</p></header><div className="fg-steps">{steps.map((step,i) => <button className={`fg-step fg-step-${i}`} key={step.title} onClick={() => openTab(step.target)}><div className="fg-step-heading"><span>{i+1}</span><h3>{step.title}</h3></div><div className="fg-art"><img src={`${asset}card-complete-art${i}.png`} alt=""/></div><p>{step.text}</p><div className="fg-cta">{step.action}<ChevronRight size={20}/></div>{i<3 && <span className="fg-connector" aria-hidden="true"><ChevronRight size={20}/></span>}</button>)}</div></section>
  </div><aside className="fg-right"><div className="fg-event"><span className="fg-nasa-crop"><img src={`${asset}nasa.png`} alt="NASA"/></span><p>NASA<br/>SPACE APPS<br/>CHALLENGE 2026</p></div>
    <section className="fg-why"><h2><img src={`${asset}impact3.png`} alt=""/>Why It Matters</h2><p>Understanding how flames behave in microgravity helps make space missions safer and advances cleaner, more efficient combustion technologies on Earth.</p></section>
    <section className="fg-ask"><h2><img src={`${asset}ask-icon.png`} alt=""/>Ask FREEZGROVER</h2><form onSubmit={e => {e.preventDefault(); ask(question);}}><textarea aria-label="Your research question" placeholder="Ask a question about microgravity combustion, experiments, data, or fire safety insights…" value={question} onChange={e => setQuestion(e.target.value)}/><div className="fg-ask-actions"><button type="button" disabled={!question.trim()} onClick={() => saveQuestion(question)}>Save question</button><button type="submit">Open chat <ChevronRight size={15}/></button></div></form><p className="fg-examples-label">Try these examples:</p><div className="fg-examples">{examples.map(example => <button key={example} onClick={() => setQuestion(example)}>{example}<ChevronRight size={16}/></button>)}</div></section>
  </aside></div>;
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
  const [scope, setScope] = useState<string>(options[0][0]);
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
  const [scope, setScope] = useState<string>(options[0][0]);
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
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  useEffect(() => { try { const value = JSON.parse(localStorage.getItem("freezegrover-saved-questions") || "[]"); if (Array.isArray(value)) setSaved(value.filter((x): x is string => typeof x === "string")); } catch { setNotice("Saved questions could not be loaded from this browser."); } }, []);
  const persist = (next: string[]) => { setSaved(next); try { localStorage.setItem("freezegrover-saved-questions", JSON.stringify(next)); setNotice("Saved questions updated in this browser."); } catch { setNotice("Browser storage is unavailable; these questions will last only for this session."); } };
  const ask = (question: string) => {setDraft(question.trim()); setChatOpen(true);};
  const openTab = (tab: TabName) => { if (tab === "Ask FREEZGROVER") { ask(""); return; } setActiveTab(tab); setNotice(""); };
  const saveQuestion = (question: string) => { if (question.trim()) persist(Array.from(new Set([...saved,question.trim()]))); };
  const download = (name: string, data: unknown) => { const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})); const link = document.createElement("a"); link.href=url; link.download=name; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000); };
  const extra = activeTab === "Datasets & Data" ? <><PageHeader kicker="DATASETS & DATA" title="Explore the project’s structured research records." description="Download the experiment records, traceable findings and source registry currently included in this project."/><div className="fg-data-grid">{[{title:"Experiment records",data:saffireExperiments},{title:"Traceable findings",data:saffireFindings},{title:"Source registry",data:sourceRegistry}].map(item => <article className="panel fg-data-card" key={item.title}><Database size={24}/><h2>{item.title}</h2><p>{item.data.length} records in this knowledge base.</p><button onClick={() => download(item.title.toLowerCase().replaceAll(" ","-")+".json",item.data)}><Download size={16}/> Download JSON</button></article>)}</div></> : activeTab === "Saved Results" ? <><PageHeader kicker="SAVED RESULTS" title="Your saved research questions." description="Questions saved here stay in this browser. Open a question to continue in the existing research chat."/>{saved.length ? <div className="fg-saved-list">{saved.map(question => <article className="panel fg-data-card" key={question}><h3>{question}</h3><button onClick={() => ask(question)}>Open in chat</button><button onClick={() => persist(saved.filter(x => x !== question))}>Remove</button></article>)}</div> : <div className="panel fg-data-card"><p>No saved questions yet. Write a question on Home and select Save question.</p><button onClick={() => openTab("Overview")}>Back to Home</button></div>}</> : <><PageHeader kicker="ABOUT FREEZGROVER" title="From questions to discovery." description="An independent research interface exploring NASA microgravity combustion and spacecraft fire safety."/><article className="panel fg-data-card"><h2>Research with traceable evidence</h2><p>Explore experiments, inspect source records, and use the summarization, ranking, interpretation and safety workspaces to investigate research questions.</p><p>Homepage counts reflect the records included in this project. The artwork is illustrative. This project is independent of NASA; it is not an official NASA service.</p><button onClick={() => openTab("Evidence")}>Explore the evidence library</button></article></>;
  const view = activeTab === "Overview" ? <Overview openTab={openTab} ask={ask} saveQuestion={saveQuestion}/> : activeTab === "Summarize" ? <SummarizeView/> : activeTab === "Ranking" ? <RankingView/> : activeTab === "Interpretation" ? <InterpretationView/> : activeTab === "Safety Insights" ? <SafetyView/> : activeTab === "Experiments" ? <ExperimentsView/> : activeTab === "Evidence" ? <EvidenceView/> : extra;
  return <main className={`app-shell fg-shell ${activeTab === "Overview" ? "fg-home" : ""}`}><aside className="sidebar"><button className="fg-brand" onClick={() => openTab("Overview")} aria-label="FreezeGrover home"><img src="/freezegrover-dashboard/brand.png" alt="FreezeGrover — NASA Space Apps 2026"/></button><nav>{nav.map(([tab,Icon,label]) => <button className={activeTab===tab ? "nav-item active" : "nav-item"} key={tab} onClick={() => openTab(tab)} aria-current={activeTab===tab ? "page" : undefined}><Icon size={22} strokeWidth={1.8}/><span>{label}</span></button>)}</nav></aside><section className="workspace">{notice && <div className="fg-notice" role="status">{notice}</div>}{view}</section>{chatOpen && <div className="chat-backdrop" onKeyDown={e => {if(e.key === "Escape")setChatOpen(false);}}><section className="chat-modal fg-chat" role="dialog" aria-modal="true" aria-label="FREEZGROVER research chat"><header><div className="chat-brand"><Sparkles size={20}/><strong>Ask FREEZGROVER</strong></div><button autoFocus aria-label="Close research chat" onClick={() => setChatOpen(false)}><X size={19}/></button></header>{draft && <label className="fg-draft">Your question — select and copy it into the chat below.<textarea readOnly value={draft} onFocus={e => e.target.select()} aria-label="Question to copy into research chat"/></label>}<iframe title="FREEZGROVER chat" src="/test"/></section></div>}</main>;
}


