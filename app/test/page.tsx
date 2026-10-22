"use client";

import { FormEvent, ReactNode, useState } from "react";

type AnyRecord = Record<string, any>;
type ChatMessage = { role: "user" | "assistant"; content: string };

function asRecord(value: unknown): AnyRecord | null {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : null;
}

function renderInline(text: string): ReactNode[] {
  const tokenPattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;
  const parts = text.split(tokenPattern);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="inline-link">
          {link[1]} ↗
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function RichMessage({ content }: { content: string }) {
  const normalized = content.replace(/\\\((https?:\/\/[^)]+)\\\)/g, "($1)");
  const lines = normalized.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul className="rich-list" key={`list-${blocks.length}`}>
        {items.map((item, index) => (
          <li key={index}><span className="bullet-mark">◆</span><span>{renderInline(item)}</span></li>
        ))}
      </ul>,
    );
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      blocks.push(<div className="rich-space" key={`space-${index}`} />);
      return;
    }

    if (/^[-•]\s+/.test(line)) {
      bullets.push(line.replace(/^[-•]\s+/, ""));
      return;
    }

    flushBullets();

    if (/^###\s+/.test(line)) {
      blocks.push(<h4 key={index}>{renderInline(line.replace(/^###\s+/, ""))}</h4>);
      return;
    }

    if (/^##\s+/.test(line)) {
      blocks.push(<h3 key={index}>{renderInline(line.replace(/^##\s+/, ""))}</h3>);
      return;
    }

    if (/^#\s+/.test(line)) {
      blocks.push(<h2 key={index}>{renderInline(line.replace(/^#\s+/, ""))}</h2>);
      return;
    }

    blocks.push(<p key={index}>{renderInline(line)}</p>);
  });

  flushBullets();
  return <div className="rich-message">{blocks}</div>;
}

function SourceEvidenceDetails({ result }: { result: unknown }) {
  const data = asRecord(result);
  const sources = Array.isArray(data?.sourceDetails) ? data.sourceDetails : [];
  if (!sources.length) return null;

  return (
    <details className="source-details">
      <summary><span>◎</span> View evidence details</summary>
      <div className="source-stack">
        {sources.map((source: AnyRecord, index: number) => {
          const supports = Array.isArray(source?.supports) ? source.supports : [];
          const locators = Array.isArray(source?.locators) ? source.locators : [];
          return (
            <article className="source-card" key={source?.id ?? index}>
              <div className="source-card-top">
                <div>
                  <span className="source-meta">
                    {[source?.organization, source?.year].filter(Boolean).join(" · ")}
                  </span>
                  <h3>{source?.title ?? source?.id ?? "NASA source"}</h3>
                </div>
                {typeof source?.url === "string" && (
                  <a href={source.url} target="_blank" rel="noreferrer" className="source-link">
                    Open source ↗
                  </a>
                )}
              </div>

              {supports.length > 0 && (
                <div className="source-support">
                  <b>Supports this answer</b>
                  {supports.map((statement: string, supportIndex: number) => (
                    <p key={supportIndex}>{statement}</p>
                  ))}
                </div>
              )}

              <div className="source-locator">
                <b>Exact location</b>
                {locators.length > 0 ? (
                  <span>{locators.join(" · ")}</span>
                ) : (
                  <span>Page, table, or section locator has not been verified in the current evidence record yet.</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </details>
  );
}

function EvidenceDetails({ result }: { result: unknown }) {
  const data = asRecord(result);
  const capabilities = asRecord(data?.capabilities);
  if (!capabilities) return null;

  const summary = asRecord(capabilities.summarize);
  const ranked = Array.isArray(capabilities.rank) ? capabilities.rank : [];
  const interpretations = Array.isArray(capabilities.interpret) ? capabilities.interpret : [];
  const safety = asRecord(capabilities.safetyInsights);

  return (
    <details className="evidence-details">
      <summary><span>◇</span> Show full analysis</summary>
      <div className="answer-stack">
        <section className="answer-box">
          <span className="answer-kicker">SUMMARY</span>
          <h2>{summary?.findingCount ?? 0} relevant findings across {summary?.experimentIds?.length ?? 0} experiments</h2>
          {Array.isArray(summary?.statements) && summary.statements.map((statement: string, index: number) => <p key={index}>{statement}</p>)}
        </section>

        <section className="answer-box">
          <span className="answer-kicker">RANKED EVIDENCE</span>
          {ranked.slice(0, 6).map((item: AnyRecord, index: number) => (
            <div className="evidence-row" key={item?.finding?.id ?? index}>
              <b>#{index + 1} {item?.finding?.id ?? "finding"}</b>
              <span>{item?.finding?.statement ?? "No statement"}</span>
              {Array.isArray(item?.whyRanked) && <small>{item.whyRanked.join(" · ")}</small>}
            </div>
          ))}
        </section>

        <section className="answer-box">
          <span className="answer-kicker">INTERPRETATION</span>
          {interpretations.map((item: AnyRecord, index: number) => (
            <div className="evidence-row" key={index}>
              <b>Observation</b>
              <span>{item.observation ?? "—"}</span>
              <small>{item.interpretation ? `Interpretation: ${item.interpretation}` : "No broader interpretation asserted from this finding alone."}</small>
            </div>
          ))}
        </section>

        <section className="answer-box">
          <span className="answer-kicker">SAFETY INSIGHTS</span>
          <h2>{safety?.status === "supported" ? safety.statement : "No supported safety extrapolation yet."}</h2>
          {Array.isArray(safety?.limitations) && safety.limitations.map((limitation: string, index: number) => <p key={index}>{limitation}</p>)}
        </section>
      </div>
    </details>
  );
}

export default function ResearchTestPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastResult, setLastResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, messages: nextMessages }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? `Request failed with status ${response.status}`);

      const reply = typeof data?.conversationalReply === "string"
        ? data.conversationalReply
        : "I received your message, but I couldn't generate a conversational reply.";

      setMessages([...nextMessages, { role: "assistant", content: reply }]);
      setLastResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="test-shell">
      <section className="chat-card">
        <header className="chat-header">
          <div className="brand-lockup">
            <div className="brand-orb">FG</div>
            <div>
              <div className="kicker">FREEZGROVER · CONVERSATION TEST</div>
              <h1>Talk to FREEZGROVER</h1>
              <p>Natural conversation on the surface. Evidence-grounded research underneath.</p>
            </div>
          </div>
          <div className="status-pill"><span className="status-dot" /> Online</div>
        </header>

        <div className="chat-window">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-orb">✦</div>
              <h2>Ask anything</h2>
              <p>Start casually, ask a general question, or move straight into NASA combustion research.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}>
              {message.role === "assistant" && <div className="avatar assistant-avatar">FG</div>}
              <div className={`bubble ${message.role}`}>
                <div className="message-label">{message.role === "assistant" ? "FREEZGROVER" : "YOU"}</div>
                {message.role === "assistant" ? <RichMessage content={message.content} /> : <p className="user-text">{message.content}</p>}
              </div>
              {message.role === "user" && <div className="avatar user-avatar">YOU</div>}
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="avatar assistant-avatar">FG</div>
              <div className="bubble assistant thinking-bubble">
                <div className="message-label">FREEZGROVER</div>
                <div className="thinking"><span /><span /><span /><em>Thinking</em></div>
              </div>
            </div>
          )}
        </div>

        <form className="composer" onSubmit={submit}>
          <textarea
            aria-label="Message FREEZGROVER"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Message FREEZGROVER…"
            rows={3}
          />
          <button className="send-button" disabled={loading || !question.trim()} type="submit" aria-label="Send message">
            <span>Send</span><b>↗</b>
          </button>
        </form>

        <div className="examples">
          <button type="button" onClick={() => setQuestion("Hey, how are you?")}><span>✦</span> Casual conversation</button>
          <button type="button" onClick={() => setQuestion("How does flow affect the flame?")}><span>⌁</span> Research question</button>
          <button type="button" onClick={() => setQuestion("Can you compare Saffire-I and Saffire-III for me?")}><span>⇄</span> Research follow-up</button>
        </div>

        {error && <div className="error">{error}</div>}

        {lastResult !== null && (
          <section className="result">
            <SourceEvidenceDetails result={lastResult} />
            <EvidenceDetails result={lastResult} />
            <details className="raw-response">
              <summary><span>⌘</span> Show raw API response</summary>
              <pre>{JSON.stringify(lastResult, null, 2)}</pre>
            </details>
          </section>
        )}
      </section>

      <style jsx>{`
        *{box-sizing:border-box}.test-shell{min-height:100vh;padding:38px 18px;background:radial-gradient(circle at 50% -10%,rgba(13,104,145,.18),transparent 36%),#020611;color:#edf8ff;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.chat-card{max-width:1050px;margin:0 auto;border:1px solid rgba(90,213,255,.13);background:linear-gradient(180deg,rgba(7,20,36,.97),rgba(3,11,23,.99));border-radius:22px;box-shadow:0 28px 90px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.025);overflow:hidden}.chat-header{padding:24px 26px 20px;border-bottom:1px solid rgba(103,210,255,.09);display:flex;align-items:center;justify-content:space-between;gap:20px;background:linear-gradient(180deg,rgba(14,36,57,.38),rgba(4,14,27,.1))}.brand-lockup{display:flex;gap:15px;align-items:center}.brand-orb,.avatar{display:grid;place-items:center;border:1px solid rgba(91,220,255,.23);background:radial-gradient(circle at 35% 30%,rgba(79,217,255,.25),rgba(5,43,64,.72));box-shadow:0 0 24px rgba(47,193,239,.1);font-weight:800;color:#c9f5ff}.brand-orb{width:48px;height:48px;border-radius:15px;font-size:13px}.kicker{color:#55d8ff;font-size:10px;letter-spacing:.18em;font-weight:800}.chat-header h1{margin:6px 0 2px;font-size:25px;letter-spacing:-.02em}.chat-header p{margin:0;color:#6f8ba0;font-size:12px}.status-pill{display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(97,230,179,.13);background:rgba(39,124,88,.08);border-radius:999px;color:#8cdcbc;font-size:10px}.status-dot{width:6px;height:6px;border-radius:50%;background:#7ce2ba;box-shadow:0 0 10px #7ce2ba}.chat-window{min-height:430px;max-height:620px;overflow:auto;padding:30px 24px;background:radial-gradient(circle at 50% 0%,rgba(14,74,104,.07),transparent 32%),#020711;display:flex;flex-direction:column;gap:18px;scrollbar-width:thin;scrollbar-color:#173348 transparent}.empty-state{margin:auto;text-align:center;max-width:430px;padding:50px 20px}.empty-orb{width:54px;height:54px;margin:0 auto 14px;display:grid;place-items:center;border:1px solid rgba(76,214,255,.16);border-radius:18px;background:rgba(13,75,105,.16);color:#72dfff;font-size:22px;box-shadow:0 0 40px rgba(55,203,247,.08)}.empty-state h2{margin:0 0 7px;font-size:20px}.empty-state p{margin:0;color:#59758a;font-size:12px;line-height:1.65}.message-row{display:flex;align-items:flex-start;gap:10px;width:100%}.message-row.user{justify-content:flex-end}.avatar{width:34px;height:34px;border-radius:11px;flex:0 0 34px;font-size:8px;letter-spacing:.06em}.user-avatar{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.045);color:#9bb0c1;box-shadow:none}.bubble{max-width:min(790px,80%);padding:13px 16px;border-radius:16px;position:relative}.bubble.assistant{background:linear-gradient(145deg,rgba(8,28,47,.96),rgba(5,20,35,.96));border:1px solid rgba(75,208,255,.14);border-top-left-radius:5px;box-shadow:0 12px 28px rgba(0,0,0,.16)}.bubble.user{background:linear-gradient(135deg,#0b789f,#075d7c);border:1px solid rgba(125,231,255,.14);border-top-right-radius:5px;box-shadow:0 10px 26px rgba(5,83,111,.16)}.message-label{margin-bottom:7px;color:#50d8ff;font-size:8px;letter-spacing:.16em;font-weight:800}.bubble.user .message-label{color:rgba(255,255,255,.7);text-align:right}.user-text{margin:0;color:#fff;font-size:13px;line-height:1.65;white-space:pre-wrap}.rich-message{color:#c4d7e4;font-size:13px;line-height:1.72}.rich-message p{margin:0 0 9px}.rich-message p:last-child{margin-bottom:0}.rich-message strong{color:#f0fbff;font-weight:700}.inline-link{color:#65ddff;text-decoration:none;border-bottom:1px solid rgba(101,221,255,.28)}.inline-link:hover{color:#b8f2ff;border-bottom-color:#b8f2ff}.rich-message h2,.rich-message h3,.rich-message h4{color:#ecfaff;margin:8px 0 7px;letter-spacing:-.01em}.rich-message h2{font-size:17px}.rich-message h3{font-size:15px}.rich-message h4{font-size:13px}.rich-space{height:3px}.rich-list{list-style:none;padding:2px 0 2px;margin:5px 0 8px;display:grid;gap:7px}.rich-list li{display:grid;grid-template-columns:14px 1fr;gap:6px;align-items:start}.bullet-mark{color:#45d8ff;font-size:7px;padding-top:6px}.thinking-bubble{min-width:138px}.thinking{display:flex;align-items:center;gap:4px;color:#7898ac;font-size:11px}.thinking span{width:5px;height:5px;border-radius:50%;background:#58d8ff;animation:pulse 1.25s infinite ease-in-out}.thinking span:nth-child(2){animation-delay:.16s}.thinking span:nth-child(3){animation-delay:.32s}.thinking em{font-style:normal;margin-left:4px}@keyframes pulse{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}.composer{margin:0;padding:17px 20px 10px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end;border-top:1px solid rgba(95,211,255,.08);background:rgba(4,14,27,.96)}textarea{width:100%;min-height:62px;max-height:170px;resize:vertical;border:1px solid rgba(72,219,255,.16);outline:none;background:rgba(3,13,25,.95);color:#edf8ff;border-radius:14px;padding:14px 15px;font:inherit;font-size:13px;line-height:1.55;transition:.2s}textarea:focus{border-color:rgba(73,218,255,.38);box-shadow:0 0 0 3px rgba(44,175,221,.055)}textarea::placeholder{color:#446176}.send-button{height:46px;display:flex;align-items:center;gap:9px;border:1px solid rgba(96,223,255,.22);background:linear-gradient(135deg,#0f8eb9,#086181);color:white;border-radius:12px;padding:0 15px;cursor:pointer;font-weight:700;box-shadow:0 8px 24px rgba(7,102,137,.18);transition:.18s}.send-button:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08)}.send-button:disabled{opacity:.4;cursor:default}.send-button b{font-size:15px}.examples{padding:0 20px 16px;display:flex;gap:8px;flex-wrap:wrap;background:rgba(4,14,27,.96)}.examples button{display:flex;align-items:center;gap:7px;border:1px solid rgba(86,205,245,.1);background:rgba(7,24,40,.7);color:#8cb8cb;border-radius:999px;padding:7px 10px;font-size:10px;cursor:pointer;transition:.18s}.examples button:hover{border-color:rgba(81,214,255,.24);color:#c7f2ff;background:rgba(10,38,58,.78)}.examples button span{color:#4ed8ff}.error{margin:12px 20px 0;border:1px solid rgba(255,100,100,.24);background:rgba(120,20,20,.12);color:#ffc4c4;padding:11px 13px;border-radius:10px;font-size:11px}.result{padding:0 20px 18px;background:rgba(4,14,27,.96)}.source-details,.evidence-details,.raw-response{margin-top:9px;color:#7fdfff;font-size:10px}.source-details summary,.evidence-details summary,.raw-response summary{cursor:pointer;padding:9px 0;color:#769aae;display:flex;align-items:center;gap:7px}.source-details summary{color:#70dfff}.source-stack{display:grid;gap:9px;margin-top:7px}.source-card{border:1px solid rgba(80,215,255,.13);background:linear-gradient(145deg,rgba(7,25,42,.82),rgba(4,17,31,.82));border-radius:13px;padding:13px}.source-card-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.source-meta{color:#4fcdeb;font-size:8px;letter-spacing:.11em;text-transform:uppercase}.source-card h3{margin:5px 0 0;color:#e7f8ff;font-size:12px;line-height:1.45}.source-link{flex:0 0 auto;color:#62dcff;text-decoration:none;border:1px solid rgba(98,220,255,.16);border-radius:999px;padding:6px 8px;font-size:9px}.source-link:hover{background:rgba(98,220,255,.08);border-color:rgba(98,220,255,.32)}.source-support,.source-locator{margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,.05);display:grid;gap:5px}.source-support b,.source-locator b{color:#bfefff;font-size:9px}.source-support p{margin:0;color:#819dad;font-size:10px;line-height:1.55}.source-locator span{color:#668398;font-size:9px;line-height:1.5}.answer-stack{display:grid;gap:10px;margin-top:8px}.answer-box{border:1px solid rgba(72,219,255,.1);background:rgba(5,19,34,.72);border-radius:12px;padding:14px}.answer-kicker{color:#55d8ff;font-size:9px;letter-spacing:.15em;font-weight:800}.answer-box h2{margin:7px 0;font-size:16px;line-height:1.4}.answer-box p{color:#7895a8;font-size:11px;line-height:1.6}.evidence-row{display:grid;gap:5px;padding:10px 0;border-top:1px solid rgba(255,255,255,.05)}.evidence-row b{color:#dff8ff;font-size:11px}.evidence-row span{color:#91aabb;font-size:11px;line-height:1.55}.evidence-row small{color:#587589;font-size:9px;line-height:1.5}pre{margin-top:8px;overflow:auto;background:#01050b;border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:13px;color:#9fdced;font-size:10px;line-height:1.5;white-space:pre-wrap}@media(max-width:700px){.test-shell{padding:0}.chat-card{min-height:100vh;border-radius:0;border-left:0;border-right:0}.chat-header{padding:18px}.brand-orb{display:none}.status-pill{display:none}.chat-window{padding:22px 14px;min-height:420px}.bubble{max-width:88%}.composer{grid-template-columns:1fr;padding:14px}.send-button{justify-content:center}.examples{padding:0 14px 14px}.result{padding:0 14px 14px}.avatar{width:30px;height:30px;flex-basis:30px}.source-card-top{display:grid}.source-link{justify-self:start}}
      `}</style>
    </main>
  );
}
