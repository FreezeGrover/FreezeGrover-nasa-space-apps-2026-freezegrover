"use client";

import { useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpenText,
  BrainCircuit,
  ChevronRight,
  CircleDot,
  Database,
  ExternalLink,
  Flame,
  Gauge,
  Layers3,
  Orbit,
  Search,
  ShieldCheck,
  Sparkles,
  Telescope,
  Wind,
} from "lucide-react";
import { saffireExperiments, saffireFindings } from "../lib/data/saffire";
import { sourceRegistry } from "../lib/source-registry";

const nav = [
  ["Overview", Orbit],
  ["Summarize", BookOpenText],
  ["Rank", BarChart3],
  ["Interpret", BrainCircuit],
  ["Safety Insights", ShieldCheck],
  ["Experiments", Telescope],
  ["Evidence", Database],
  ["Ask FREEZGROVER", Sparkles],
] as const;

type TabName = (typeof nav)[number][0];

const capabilities = [
  {
    title: "SUMMARIZE" as TabName,
    eyebrow: "SYNTHESIS",
    body: "Condense complex combustion research into structured findings without losing experimental context.",
    icon: BookOpenText,
    accent: "cyan",
  },
  {
    title: "RANK" as TabName,
    eyebrow: "RELEVANCE",
    body: "Surface the strongest evidence for a question by comparing conditions, measurements and experimental fit.",
    icon: BarChart3,
    accent: "violet",
  },
  {
    title: "INTERPRET" as TabName,
    eyebrow: "MEANING",
    body: "Separate direct observation from interpretation, limitations and possible scientific implications.",
    icon: BrainCircuit,
    accent: "blue",
  },
  {
    title: "SAFETY INSIGHTS" as TabName,
    eyebrow: "HUMAN SPACEFLIGHT",
    body: "Connect traceable findings to fire-safety questions while preserving uncertainty and source provenance.",
    icon: ShieldCheck,
    accent: "orange",
  },
];

const researchNodes = [
  { label: "Material", value: "Surface & fuel", icon: Layers3, className: "node n1" },
  { label: "Oxygen", value: "Atmosphere", icon: CircleDot, className: "node n2" },
  { label: "Airflow", value: "Forced flow", icon: Wind, className: "node n3" },
  { label: "Pressure", value: "Cabin state", icon: Gauge, className: "node n4" },
];

const sectionStyle = { paddingTop: 22 } as const;
const gridStyle = { display: "grid", gap: 12 } as const;
const cardStyle = {
  border: "1px solid rgba(91,204,255,.11)",
  background: "linear-gradient(180deg,rgba(8,21,39,.74),rgba(4,13,27,.77))",
  borderRadius: 14,
  padding: 18,
} as const;
const mutedStyle = { color: "#7890a3", fontSize: 11, lineHeight: 1.65 } as const;
const labelStyle = { color: "#55d8ff", fontSize: 9, letterSpacing: ".14em", fontWeight: 800 } as const;

function sourceFor(id: string) {
  return sourceRegistry.find((source) => source.id === id);
}

function formatCondition(label: string, value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const unit = label === "Airflow" ? " cm/s" : label === "Thickness" ? " mm" : label === "Pressure" ? " kPa" : "";
  return `${label}: ${String(value)}${unit}`;
}

function ConditionChips({ conditions }: { conditions: Record<string, unknown> }) {
  const chips = [
    formatCondition("Gravity", conditions.gravity),
    formatCondition("Airflow", conditions.airflowCmPerS),
    formatCondition("Oxygen", conditions.oxygenPercent),
    formatCondition("Pressure", conditions.pressureKPa),
    formatCondition("Material", conditions.material),
    formatCondition("Thickness", conditions.thicknessMm),
    formatCondition("Geometry", conditions.geometry),
    formatCondition("Ignition", conditions.ignition),
  ].filter(Boolean) as string[];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {chips.map((chip) => (
        <span key={chip} style={{ border: "1px solid rgba(82,211,255,.12)", background: "rgba(10,50,70,.28)", color: "#91c9d8", borderRadius: 999, padding: "5px 8px", fontSize: 9 }}>
          {chip}
        </span>
      ))}
    </div>
  );
}

function SourceLinks({ ids }: { ids: string[] }) {
  return (
    <div style={{ display: "grid", gap: 7, marginTop: 12 }}>
      {ids.map((id) => {
        const source = sourceFor(id);
        if (!source) return null;
        return (
          <a key={id} href={source.url} target="_blank" rel="noreferrer" style={{ color: "#7edfff", textDecoration: "none", fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <ExternalLink size={12} /> {source.title}
          </a>
        );
      })}
    </div>
  );
}

function FlameCore() {
  return (
    <div className="flame-stage" aria-label="Microgravity combustion research visualization">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <div className="crosshair horizontal" />
      <div className="crosshair vertical" />
      <div className="flame-halo" />
      <div className="flame-shell shell-a" />
      <div className="flame-shell shell-b" />
      <div className="flame-core" />
      <div className="core-label"><span>MICROGRAVITY</span><strong>COMBUSTION</strong><small>Evidence environment</small></div>
      {researchNodes.map(({ label, value, icon: Icon, className }) => (
        <div className={className} key={label}><Icon size={14} /><div><span>{label}</span><small>{value}</small></div></div>
      ))}
      <div className="telemetry left-telemetry"><span>THERMAL SIGNATURE</span><div className="micro-chart">{[34,50,43,72,61,86,68].map((h) => <i key={h} style={{ height: `${h}%` }} />)}</div></div>
      <div className="telemetry right-telemetry"><span>RESEARCH TRACE</span><b>Evidence linked</b><small>Source-aware analysis</small></div>
    </div>
  );
}

function PageHeader({ kicker, title, note }: { kicker: string; title: string; note: string }) {
  return (
    <header className="topbar">
      <div><span className="section-kicker">{kicker}</span><h1>{title}</h1></div>
      <div className="topbar-actions"><span className="connected"><i /> VERIFIED EVIDENCE</span><span style={{ color: "#60778c", fontSize: 9 }}>{note}</span></div>
    </header>
  );
}

function Overview({ openTab }: { openTab: (tab: TabName) => void }) {
  return <>
    <PageHeader kicker="MICROGRAVITY COMBUSTION RESEARCH" title="Discover what the evidence actually supports." note="Saffire evidence seed" />
    <section className="hero-grid">
      <div className="hero-copy panel">
        <div className="eyebrow"><Sparkles size={14} /> AI-POWERED RESEARCH CONSOLE</div>
        <h2>From decades of experiments to <span>traceable fire-safety insight.</span></h2>
        <p>Explore, compare and interpret NASA microgravity combustion research through an interface designed around evidence, conditions and scientific uncertainty.</p>
        <div className="workflow-strip">{['DATA','EXPERIMENTS','MODELS','INSIGHTS','SAFER SPACEFLIGHT'].map((item,i)=><div className="workflow-item" key={item}><b>{String(i+1).padStart(2,'0')}</b><span>{item}</span>{i<4&&<ChevronRight size={13}/>}</div>)}</div>
        <div className="hero-actions"><button className="primary-button" onClick={() => openTab("Evidence")}><Search size={16}/> Explore evidence</button><button className="secondary-button" onClick={() => openTab("Ask FREEZGROVER")}><Sparkles size={16}/> Ask FREEZGROVER</button></div>
      </div>
      <div className="visual-panel panel"><div className="panel-label"><span>LIVE RESEARCH VIEW</span><b>VERIFIED SEED DATA</b></div><FlameCore/></div>
    </section>
    <section className="metrics-row">
      <article className="metric-card"><span>Experiments indexed</span><strong>{saffireExperiments.length}</strong><small>Saffire I–III currently structured</small></article>
      <article className="metric-card"><span>Scientific findings</span><strong>{saffireFindings.length}</strong><small>Traceable evidence records</small></article>
      <article className="metric-card"><span>Official sources</span><strong>{sourceRegistry.filter(s=>s.verificationStatus === "verified-official").length}</strong><small>NASA & NASA NTRS registry</small></article>
      <article className="metric-card"><span>Condition fields</span><strong>8</strong><small>Material · flow · pressure · geometry…</small></article>
    </section>
    <section className="section-heading"><div><span className="section-kicker">CORE RESEARCH CAPABILITIES</span><h3>Four ways to move from evidence to understanding</h3></div><span className="section-note">Open any capability to inspect the current evidence.</span></section>
    <section className="capability-grid">{capabilities.map(({title,eyebrow,body,icon:Icon,accent},index)=><article className={`capability-card accent-${accent}`} key={title}><div className="cap-top"><div className="cap-icon"><Icon size={21}/></div><span>0{index+1}</span></div><small>{eyebrow}</small><h4>{title}</h4><p>{body}</p><button onClick={()=>openTab(title)}>Open workspace <ChevronRight size={15}/></button></article>)}</section>
  </>;
}

function SummarizeView() {
  return <><PageHeader kicker="SUMMARIZE · SYNTHESIS" title="See the findings without losing the experimental context." note={`${saffireFindings.length} findings currently indexed`} />
    <section style={{ ...sectionStyle, ...gridStyle }}>
      {saffireFindings.map((finding) => {
        const experiment = saffireExperiments.find(e => e.id === finding.experimentId);
        return <article key={finding.id} style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start" }}><div><span style={labelStyle}>{experiment?.name.toUpperCase()}</span><h3 style={{ margin: "7px 0 8px", fontSize: 18 }}>{finding.measurement ?? "Research finding"}</h3></div><span style={{ color: "#83e7c4", fontSize: 9 }}>{finding.evidenceType.replaceAll("-", " ").toUpperCase()}</span></div>
          <p style={{ ...mutedStyle, color: "#b7cbd8", fontSize: 12 }}>{finding.statement}</p>
          <ConditionChips conditions={finding.conditions as Record<string, unknown>} />
          {finding.limitations?.length ? <details style={{ marginTop: 13 }}><summary style={{ color: "#7fa8ba", fontSize: 10, cursor: "pointer" }}>View limitations</summary><div style={{ marginTop: 8 }}>{finding.limitations.map(l => <p key={l} style={mutedStyle}>{l}</p>)}</div></details> : null}
          <SourceLinks ids={finding.sourceIds} />
        </article>;
      })}
    </section>
  </>;
}

function RankView() {
  return <><PageHeader kicker="RANK · RELEVANCE" title="Understand why one piece of evidence should be considered before another." note="No opaque relevance score" />
    <section style={sectionStyle}>
      <div style={{ ...cardStyle, marginBottom: 12 }}><span style={labelStyle}>HOW RANKING WORKS</span><h3 style={{ margin: "8px 0" }}>Scientific relevance, not similarity alone</h3><p style={mutedStyle}>FREEZGROVER considers condition match, experiment relevance, material match, measurement relevance and evidence strength. A high textual match is not enough if the experimental conditions do not fit the question.</p></div>
      <div style={{ ...gridStyle }}>
        {saffireFindings.map((finding,index) => {
          const exp = saffireExperiments.find(e=>e.id===finding.experimentId);
          const conditionCount = Object.values(finding.conditions).filter(v=>v!==undefined).length;
          return <article key={finding.id} style={cardStyle}>
            <div style={{ display:"grid", gridTemplateColumns:"56px 1fr auto", gap:14, alignItems:"start" }}><div style={{ fontSize:28, color:"#4fdcff", fontWeight:800 }}>#{index+1}</div><div><span style={labelStyle}>{exp?.name}</span><h3 style={{ margin:"7px 0 6px", fontSize:16 }}>{finding.statement}</h3><p style={mutedStyle}>{finding.measurement}</p></div><span style={{ color:"#7d93a6", fontSize:9 }}>{finding.evidenceType}</span></div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:8, marginTop:14 }}>
              {[['Conditions',`${conditionCount} fields`],['Material',finding.conditions.material ? 'specified' : 'not specified'],['Measurement',finding.measurement ? 'specified' : 'not specified'],['Evidence',finding.evidenceType]].map(([a,b])=><div key={a} style={{ border:"1px solid rgba(255,255,255,.05)", borderRadius:9, padding:9 }}><span style={{ ...labelStyle, color:"#607f91", fontSize:8 }}>{a}</span><b style={{ display:"block", marginTop:5, color:"#c3d9e4", fontSize:10 }}>{b}</b></div>)}
            </div>
            <p style={{ ...mutedStyle, marginTop:12 }}><b style={{ color:"#93dff1" }}>Why it can rank highly:</b> it carries explicit experimental conditions, a traceable source record and a defined measurement. Final order should change with the user’s actual question.</p>
          </article>;
        })}
      </div>
    </section>
  </>;
}

function InterpretView() {
  return <><PageHeader kicker="INTERPRET · MEANING" title="Move from observation to meaning without crossing the evidence boundary." note="Observation ≠ extrapolation" />
    <section style={{ ...sectionStyle, ...gridStyle }}>
      {saffireFindings.map((finding) => <article key={finding.id} style={cardStyle}>
        <span style={labelStyle}>{finding.id.replaceAll("-"," ").toUpperCase()}</span>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:14, alignItems:"stretch", marginTop:12 }}>
          <div style={{ border:"1px solid rgba(68,220,255,.1)", borderRadius:12, padding:14 }}><span style={labelStyle}>OBSERVATION</span><p style={{ ...mutedStyle, color:"#c1d4df", marginBottom:0 }}>{finding.statement}</p></div>
          <ChevronRight size={18} style={{ alignSelf:"center", color:"#36586a" }}/>
          <div style={{ border:"1px solid rgba(127,106,255,.1)", borderRadius:12, padding:14 }}><span style={{ ...labelStyle, color:"#9389ff" }}>INTERPRETATION BOUNDARY</span><p style={{ ...mutedStyle, marginBottom:0 }}>{finding.limitations?.[0] ?? "No broader interpretation should be asserted beyond the recorded conditions without additional evidence."}</p></div>
        </div>
        <ConditionChips conditions={finding.conditions as Record<string, unknown>} />
      </article>)}
    </section>
  </>;
}

function SafetyView() {
  const insightCards = [
    ["Material response is configuration-dependent", "Saffire-II shows that samples can sustain, limit, or extinguish flame spread under the same nominal spacecraft flow. That supports treating material/configuration as part of the safety question rather than assuming one universal behavior.", "saffire-ii-material-dependent-response"],
    ["Flow comparisons need matched conditions", "Saffire-I and Saffire-III provide a closely related large-SIBAL comparison at different forced-flow conditions, but the current structured record does not yet encode a quantitative causal spread-rate relationship.", "saffire-iii-higher-flow-comparison"],
    ["Large microgravity flames can remain constrained", "The Saffire-I record reports a constrained concurrent flame after the ignition transient for that specific configuration. This is useful evidence, but not a universal spacecraft rule.", "saffire-i-concurrent-flame-constrained"],
  ];
  return <><PageHeader kicker="SAFETY INSIGHTS · HUMAN SPACEFLIGHT" title="See what the evidence may mean for fire safety—and where it stops." note="No unsupported operational guidance" />
    <section style={{ ...sectionStyle, ...gridStyle }}>
      {insightCards.map(([title,text,id]) => {
        const f=saffireFindings.find(x=>x.id===id)!;
        return <article key={id} style={cardStyle}><div style={{ display:"flex", gap:12, alignItems:"start" }}><div className="cap-icon"><ShieldCheck size={20}/></div><div><span style={{ ...labelStyle, color:"#ff9d72" }}>TRACEABLE SAFETY SIGNIFICANCE</span><h3 style={{ margin:"7px 0 8px" }}>{title}</h3><p style={{ ...mutedStyle, color:"#b6cbd6" }}>{text}</p></div></div><details style={{ marginTop:12 }}><summary style={{ color:"#7fa8ba",fontSize:10,cursor:"pointer" }}>View supporting evidence</summary><div style={{ marginTop:10 }}><p style={mutedStyle}>{f.statement}</p><SourceLinks ids={f.sourceIds}/></div></details></article>;
      })}
      <article style={{ ...cardStyle, borderColor:"rgba(255,135,76,.15)" }}><span style={{ ...labelStyle, color:"#ff9d72" }}>IMPORTANT</span><p style={{ ...mutedStyle, marginBottom:0 }}>FREEZGROVER should distinguish research significance from operational safety recommendations. The current dataset contains experimental findings and limitations; it does not contain enough verified evidence to issue spacecraft operational procedures.</p></article>
    </section>
  </>;
}

function ExperimentsView() {
  return <><PageHeader kicker="EXPERIMENT EXPLORER" title="Inspect each experiment as a complete condition-aware record." note={`${saffireExperiments.length} structured experiments`} />
    <section style={{ ...sectionStyle, ...gridStyle }}>
      {saffireExperiments.map((exp) => <article key={exp.id} style={cardStyle}><div style={{ display:"flex",justifyContent:"space-between",gap:16 }}><div><span style={labelStyle}>{exp.id.toUpperCase()}</span><h2 style={{ margin:"7px 0 8px",fontSize:20 }}>{exp.name}</h2><p style={{ ...mutedStyle, color:"#aec5d2" }}>{exp.objective}</p></div><Telescope size={24} style={{ color:"#55d8ff" }}/></div><ConditionChips conditions={exp.conditions as Record<string, unknown>}/><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:14 }}><div><span style={labelStyle}>MEASUREMENTS</span>{exp.measurements.map(m=><p key={m} style={{ ...mutedStyle, margin:"6px 0" }}>• {m}</p>)}</div><div><span style={labelStyle}>EXPERIMENT NOTES</span>{exp.conditions.notes?.map(n=><p key={n} style={{ ...mutedStyle, margin:"6px 0" }}>• {n}</p>)}</div></div><SourceLinks ids={exp.sourceIds}/></article>)}
    </section>
  </>;
}

function EvidenceView() {
  return <><PageHeader kicker="EVIDENCE LIBRARY" title="Trace every structured finding back to NASA or NASA NTRS." note={`${sourceRegistry.length} registered sources`} />
    <section style={sectionStyle}>
      <div style={{ ...gridStyle, gridTemplateColumns:"repeat(2,minmax(0,1fr))" }}>
        {sourceRegistry.map(source => {
          const related = saffireFindings.filter(f=>f.sourceIds.includes(source.id));
          return <article key={source.id} style={cardStyle}><div style={{ display:"flex",justifyContent:"space-between",gap:12 }}><div><span style={labelStyle}>{source.organization} · {source.sourceKind.replaceAll("-"," ").toUpperCase()}</span><h3 style={{ margin:"7px 0 5px",fontSize:15 }}>{source.title}</h3><p style={{ ...mutedStyle, margin:"0" }}>{source.nasaProgram}{source.year ? ` · ${source.year}` : ""}</p></div><span style={{ color:source.verificationStatus === "verified-official" ? "#83e7c4":"#d8ba72",fontSize:8 }}>{source.verificationStatus.toUpperCase()}</span></div><div style={{ display:"flex",gap:5,flexWrap:"wrap",marginTop:10 }}>{source.relevanceTags.slice(0,7).map(tag=><span key={tag} style={{ border:"1px solid rgba(255,255,255,.06)",borderRadius:999,padding:"4px 7px",color:"#6f91a3",fontSize:8 }}>{tag}</span>)}</div>{related.length>0&&<details style={{ marginTop:12 }}><summary style={{ color:"#7fa8ba",fontSize:10,cursor:"pointer" }}>{related.length} structured finding{related.length===1?'':'s'} linked</summary><div style={{ marginTop:8 }}>{related.map(f=><p key={f.id} style={mutedStyle}>{f.statement}{f.sourceLocator ? <><br/><span style={{ color:"#5f8294" }}>Location: {f.sourceLocator}</span></> : null}</p>)}</div></details>}<a href={source.url} target="_blank" rel="noreferrer" style={{ display:"inline-flex",alignItems:"center",gap:6,marginTop:12,color:"#7edfff",fontSize:10,textDecoration:"none" }}><ExternalLink size={12}/> Open official source</a></article>;
        })}
      </div>
    </section>
  </>;
}

function AskView() {
  return <><PageHeader kicker="ASK FREEZGROVER" title="Natural conversation on the surface. Evidence-grounded research underneath." note="Interpretation Gate enabled" />
    <section style={sectionStyle}><article style={{ ...cardStyle, minHeight:320,display:"grid",placeItems:"center",textAlign:"center" }}><div style={{ maxWidth:620 }}><div className="brand-orb" style={{ margin:"0 auto 16px" }}><Sparkles size={18}/></div><span style={labelStyle}>CONVERSATIONAL RESEARCH ASSISTANT</span><h2 style={{ fontSize:28,margin:"10px 0" }}>Ask a scientific question.</h2><p style={{ ...mutedStyle,fontSize:12 }}>FREEZGROVER can clarify the experimental variable when needed, retrieve the relevant evidence, compare conditions, surface limitations and show where the answer comes from.</p><a href="/test" className="primary-button" style={{ textDecoration:"none",marginTop:14 }}><Sparkles size={16}/> Open conversation test</a></div></article></section>
  </>;
}

export default function Home() {
  const [activeTab,setActiveTab] = useState<TabName>("Overview");

  const view = activeTab === "Overview" ? <Overview openTab={setActiveTab}/> :
    activeTab === "Summarize" ? <SummarizeView/> :
    activeTab === "Rank" ? <RankView/> :
    activeTab === "Interpret" ? <InterpretView/> :
    activeTab === "Safety Insights" ? <SafetyView/> :
    activeTab === "Experiments" ? <ExperimentsView/> :
    activeTab === "Evidence" ? <EvidenceView/> : <AskView/>;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark"><div className="brand-orb"><Flame size={20}/></div><div><strong>FREEZGROVER</strong><span>From Questions to Discovery</span></div></div>
        <div className="mission-chip"><span className="status-dot"/> NASA SPACE APPS 2026</div>
        <nav>{nav.map(([label,Icon])=><button className={activeTab===label?"nav-item active":"nav-item"} key={label} onClick={()=>setActiveTab(label)}><Icon size={17} strokeWidth={1.8}/><span>{label}</span>{activeTab===label&&<span className="nav-pulse"/>}</button>)}</nav>
        <div className="sidebar-footer"><div className="signal-line"><Activity size={15}/><span>Research system</span><b>ONLINE</b></div><div className="signal-line"><Database size={15}/><span>Evidence layer</span><b>READY</b></div></div>
      </aside>
      <section className="workspace">{view}<footer className="footer-banner" style={{ marginTop:28 }}><div className="earth-glow"/><div><span>FREEZGROVER · FROM QUESTIONS TO DISCOVERY</span><strong>Evidence made clearer. Decisions made safer.</strong></div><span className="footer-badge">NASA SPACE APPS 2026 · RESEARCH BUILD</span></footer></section>
    </main>
  );
}
