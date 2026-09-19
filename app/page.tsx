"use client";

import {
  Activity,
  BarChart3,
  BookOpenText,
  BrainCircuit,
  ChevronRight,
  CircleDot,
  Database,
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

const capabilities = [
  {
    title: "SUMMARIZE",
    eyebrow: "SYNTHESIS",
    body: "Condense complex combustion research into structured findings without losing experimental context.",
    icon: BookOpenText,
    accent: "cyan",
  },
  {
    title: "RANK",
    eyebrow: "RELEVANCE",
    body: "Surface the strongest evidence for a question by comparing conditions, measurements and experimental fit.",
    icon: BarChart3,
    accent: "violet",
  },
  {
    title: "INTERPRET",
    eyebrow: "MEANING",
    body: "Separate direct observation from interpretation, limitations and possible scientific implications.",
    icon: BrainCircuit,
    accent: "blue",
  },
  {
    title: "SAFETY INSIGHTS",
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
      <div className="core-label">
        <span>MICROGRAVITY</span>
        <strong>COMBUSTION</strong>
        <small>Evidence environment</small>
      </div>
      {researchNodes.map(({ label, value, icon: Icon, className }) => (
        <div className={className} key={label}>
          <Icon size={14} />
          <div>
            <span>{label}</span>
            <small>{value}</small>
          </div>
        </div>
      ))}
      <div className="telemetry left-telemetry">
        <span>THERMAL SIGNATURE</span>
        <div className="micro-chart">
          <i style={{ height: "34%" }} />
          <i style={{ height: "50%" }} />
          <i style={{ height: "43%" }} />
          <i style={{ height: "72%" }} />
          <i style={{ height: "61%" }} />
          <i style={{ height: "86%" }} />
          <i style={{ height: "68%" }} />
        </div>
      </div>
      <div className="telemetry right-telemetry">
        <span>RESEARCH TRACE</span>
        <b>Evidence linked</b>
        <small>Source-aware analysis</small>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="brand-orb"><Flame size={20} /></div>
          <div>
            <strong>FREEZGROVER</strong>
            <span>From Questions to Discovery</span>
          </div>
        </div>

        <div className="mission-chip"><span className="status-dot" /> NASA SPACE APPS 2026</div>

        <nav>
          {nav.map(([label, Icon], index) => (
            <button className={index === 0 ? "nav-item active" : "nav-item"} key={label}>
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {index === 0 && <span className="nav-pulse" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="signal-line"><Activity size={15} /><span>Research system</span><b>ONLINE</b></div>
          <div className="signal-line"><Database size={15} /><span>Evidence layer</span><b>READY</b></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="section-kicker">MICROGRAVITY COMBUSTION RESEARCH</span>
            <h1>Discover what the evidence actually supports.</h1>
          </div>
          <div className="topbar-actions">
            <span className="connected"><i /> RESEARCH MODE</span>
            <button className="ghost-button">Evidence map <ChevronRight size={15} /></button>
          </div>
        </header>

        <section className="hero-grid">
          <div className="hero-copy panel">
            <div className="eyebrow"><Sparkles size={14} /> AI-POWERED RESEARCH CONSOLE</div>
            <h2>From decades of experiments to <span>traceable fire-safety insight.</span></h2>
            <p>
              Explore, compare and interpret NASA microgravity combustion research through an interface designed around evidence, conditions and scientific uncertainty.
            </p>
            <div className="workflow-strip">
              {['DATA', 'EXPERIMENTS', 'MODELS', 'INSIGHTS', 'SAFER SPACEFLIGHT'].map((item, i) => (
                <div className="workflow-item" key={item}>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <span>{item}</span>
                  {i < 4 && <ChevronRight size={13} />}
                </div>
              ))}
            </div>
            <div className="hero-actions">
              <button className="primary-button"><Search size={16} /> Explore evidence</button>
              <button className="secondary-button"><Sparkles size={16} /> Ask FREEZGROVER</button>
            </div>
          </div>

          <div className="visual-panel panel">
            <div className="panel-label"><span>LIVE RESEARCH VIEW</span><b>CONCEPT MODE</b></div>
            <FlameCore />
          </div>
        </section>

        <section className="metrics-row">
          {[
            ['Experiments indexed', '—', 'Waiting for verified NASA data'],
            ['Scientific findings', '—', 'Structured evidence layer'],
            ['Materials studied', '—', 'Condition-aware comparison'],
            ['Environment profiles', '—', 'O₂ · airflow · pressure'],
          ].map(([label, value, note]) => (
            <article className="metric-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </article>
          ))}
        </section>

        <section className="section-heading">
          <div>
            <span className="section-kicker">CORE RESEARCH CAPABILITIES</span>
            <h3>Four ways to move from evidence to understanding</h3>
          </div>
          <span className="section-note">Each capability remains independent of chat.</span>
        </section>

        <section className="capability-grid">
          {capabilities.map(({ title, eyebrow, body, icon: Icon, accent }, index) => (
            <article className={`capability-card accent-${accent}`} key={title}>
              <div className="cap-top">
                <div className="cap-icon"><Icon size={21} /></div>
                <span>0{index + 1}</span>
              </div>
              <small>{eyebrow}</small>
              <h4>{title}</h4>
              <p>{body}</p>
              <button>Open workspace <ChevronRight size={15} /></button>
            </article>
          ))}
        </section>

        <section className="lower-grid">
          <article className="research-panel panel">
            <div className="panel-label"><span>ASK FREEZGROVER</span><b>EVIDENCE-FIRST</b></div>
            <h3>Start with a scientific question.</h3>
            <p>FREEZGROVER will clarify when needed, find relevant evidence, compare conditions and surface limitations before presenting a conclusion.</p>
            <div className="query-box">
              <Search size={18} />
              <span>How does airflow affect flame spread in microgravity?</span>
              <button><ChevronRight size={18} /></button>
            </div>
            <div className="research-steps">
              {['Understand', 'Find evidence', 'Compare', 'Cross-check', 'Explain'].map((step, i) => (
                <div key={step}><b>{i + 1}</b><span>{step}</span></div>
              ))}
            </div>
          </article>

          <article className="insight-panel panel">
            <div className="panel-label"><span>SAFETY INSIGHT LENS</span><b>TRACEABLE</b></div>
            <div className="insight-item"><span className="mini-icon orange"><Flame size={16} /></span><div><b>Fire propagation</b><small>Separate observed behavior from extrapolation.</small></div></div>
            <div className="insight-item"><span className="mini-icon cyan"><Wind size={16} /></span><div><b>Airflow & oxygen</b><small>Compare only under compatible conditions.</small></div></div>
            <div className="insight-item"><span className="mini-icon blue"><ShieldCheck size={16} /></span><div><b>Human spaceflight</b><small>Keep safety significance linked to evidence.</small></div></div>
          </article>
        </section>

        <footer className="footer-banner">
          <div className="earth-glow" />
          <div>
            <span>FREEZGROVER · FROM QUESTIONS TO DISCOVERY</span>
            <strong>Evidence made clearer. Decisions made safer.</strong>
          </div>
          <span className="footer-badge">NASA SPACE APPS 2026 · CONCEPT BUILD</span>
        </footer>
      </section>
    </main>
  );
}
