"use client";

import { FormEvent, useState } from "react";

type AnyRecord = Record<string, any>;
type ChatMessage = { role: "user" | "assistant"; content: string };

function asRecord(value: unknown): AnyRecord | null {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : null;
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
      <summary>Show evidence analysis</summary>
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
  const [question, setQuestion] = useState("How does flow affect the flame?");
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
        : "I received the research result, but no conversational reply was returned.";

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
      <section className="test-card">
        <div className="kicker">FREEZGROVER · CONVERSATIONAL RESEARCH TEST</div>
        <h1>Talk to FREEZGROVER</h1>
        <p>
          Chat naturally. FREEZGROVER will clarify scope when needed, use verified evidence when it can, and keep the structured analysis available underneath.
        </p>

        <div className="chat-window">
          {messages.length === 0 && <div className="empty-chat">Ask a question to start the research conversation.</div>}
          {messages.map((message, index) => (
            <div className={`bubble ${message.role}`} key={`${message.role}-${index}`}>
              <span>{message.role === "assistant" ? "FREEZGROVER" : "YOU"}</span>
              <p>{message.content}</p>
            </div>
          ))}
          {loading && <div className="bubble assistant"><span>FREEZGROVER</span><p>Thinking through the evidence…</p></div>}
        </div>

        <form onSubmit={submit}>
          <textarea
            aria-label="Message FREEZGROVER"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a scientific question or reply to FREEZGROVER…"
            rows={3}
          />
          <button disabled={loading || !question.trim()} type="submit">{loading ? "Running…" : "Send"}</button>
        </form>

        <div className="examples">
          <button type="button" onClick={() => setQuestion("How does flow affect the flame?")}>Multi-scope example</button>
          <button type="button" onClick={() => setQuestion("How did airflow speed affect flame behavior in Saffire-III?")}>Clearer example</button>
          <button type="button" onClick={() => setQuestion("Can you compare Saffire-I and Saffire-III for me?")}>Follow-up example</button>
        </div>

        {error && <div className="error">{error}</div>}

        {lastResult !== null && (
          <section className="result">
            <EvidenceDetails result={lastResult} />
            <details className="raw-response">
              <summary>Show raw API response</summary>
              <pre>{JSON.stringify(lastResult, null, 2)}</pre>
            </details>
          </section>
        )}
      </section>

      <style jsx>{`
        .test-shell{min-height:100vh;padding:48px 20px;background:#030712;color:#edf8ff;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.test-card{max-width:980px;margin:0 auto;border:1px solid rgba(91,204,255,.16);background:linear-gradient(180deg,rgba(8,21,39,.94),rgba(4,13,27,.96));border-radius:18px;padding:28px}.kicker,.answer-kicker{color:#55d8ff;font-size:11px;letter-spacing:.16em;font-weight:700}h1{margin:10px 0 8px;font-size:30px}p{color:#89a2b7;line-height:1.7;font-size:13px}.chat-window{margin-top:24px;min-height:280px;max-height:520px;overflow:auto;border:1px solid rgba(72,219,255,.14);background:#020711;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:12px}.empty-chat{margin:auto;color:#557086;font-size:12px}.bubble{max-width:78%;padding:12px 14px;border-radius:14px}.bubble span{display:block;font-size:9px;letter-spacing:.14em;margin-bottom:5px}.bubble p{margin:0;white-space:pre-wrap}.bubble.user{align-self:flex-end;background:linear-gradient(135deg,#0c7094,#07516d)}.bubble.user span,.bubble.user p{color:white}.bubble.assistant{align-self:flex-start;background:rgba(8,27,45,.95);border:1px solid rgba(72,219,255,.14)}.bubble.assistant span{color:#55d8ff}form{margin-top:14px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}textarea{width:100%;resize:vertical;border:1px solid rgba(72,219,255,.22);background:rgba(5,19,34,.9);color:#edf8ff;border-radius:12px;padding:14px;font:inherit;line-height:1.5}button{border:1px solid rgba(84,220,255,.22);background:linear-gradient(135deg,#0d8db8,#075875);color:white;border-radius:9px;padding:11px 14px;cursor:pointer}button:disabled{opacity:.5;cursor:default}.examples{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}.examples button{background:rgba(6,20,34,.8);color:#bcecff}.error{margin-top:18px;border:1px solid rgba(255,100,100,.3);background:rgba(120,20,20,.16);color:#ffc4c4;padding:12px;border-radius:10px}.result{margin-top:20px}.evidence-details,.raw-response{margin-top:12px;color:#7fdfff;font-size:11px}.evidence-details summary,.raw-response summary{cursor:pointer}.answer-stack{display:grid;gap:12px;margin-top:12px}.answer-box{border:1px solid rgba(72,219,255,.14);background:rgba(5,19,34,.72);border-radius:12px;padding:16px}.answer-box h2{margin:8px 0;font-size:19px;line-height:1.4}.evidence-row{display:grid;gap:5px;padding:11px 0;border-top:1px solid rgba(255,255,255,.06)}.evidence-row b{color:#dff8ff;font-size:12px}.evidence-row span{color:#9eb5c7;font-size:12px;line-height:1.55}.evidence-row small{color:#607b90;font-size:10px;line-height:1.5}pre{margin-top:10px;overflow:auto;background:#02050c;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;color:#bcecff;font-size:12px;line-height:1.55;white-space:pre-wrap}@media(max-width:700px){form{grid-template-columns:1fr}.bubble{max-width:92%}}
      `}</style>
    </main>
  );
}
