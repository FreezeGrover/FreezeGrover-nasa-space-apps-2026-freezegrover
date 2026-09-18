"use client";

import { FormEvent, useState } from "react";

type AnyRecord = Record<string, any>;

function asRecord(value: unknown): AnyRecord | null {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : null;
}

function HumanReadableResponse({ result }: { result: unknown }) {
  const data = asRecord(result);
  if (!data) return <div className="answer-box">No readable response was returned.</div>;

  const answer = asRecord(data.answer);
  const capabilities = asRecord(data.capabilities);

  if (answer?.status === "needs-clarification") {
    return (
      <div className="answer-box clarification">
        <span className="answer-kicker">FREEZGROVER NEEDS CLARIFICATION</span>
        <h2>{answer.clarificationQuestion ?? "Please clarify the intended scope."}</h2>
        <p>
          FREEZGROVER stopped before retrieving evidence because the plausible scopes could lead to materially different evidence or conclusions.
        </p>
      </div>
    );
  }

  if (answer?.status === "insufficient-evidence") {
    return (
      <div className="answer-box">
        <span className="answer-kicker">EVIDENCE STATUS</span>
        <h2>{answer.finding ?? "The connected evidence is not sufficient for a reliable answer."}</h2>
        {answer.reasonableConclusion && <p>{answer.reasonableConclusion}</p>}
      </div>
    );
  }

  if (capabilities) {
    const summary = asRecord(capabilities.summarize);
    const ranked = Array.isArray(capabilities.rank) ? capabilities.rank : [];
    const interpretations = Array.isArray(capabilities.interpret) ? capabilities.interpret : [];
    const safety = asRecord(capabilities.safetyInsights);

    return (
      <div className="answer-stack">
        <section className="answer-box">
          <span className="answer-kicker">SUMMARY</span>
          <h2>{summary?.findingCount ?? 0} relevant findings across {summary?.experimentIds?.length ?? 0} experiments</h2>
          {Array.isArray(summary?.statements) && summary.statements.map((statement: string, index: number) => (
            <p key={index}>{statement}</p>
          ))}
        </section>

        <section className="answer-box">
          <span className="answer-kicker">RANKED EVIDENCE</span>
          {ranked.length === 0 ? <p>No ranked evidence returned.</p> : ranked.slice(0, 6).map((item: AnyRecord, index: number) => (
            <div className="evidence-row" key={item?.finding?.id ?? index}>
              <b>#{index + 1} {item?.finding?.id ?? "finding"}</b>
              <span>{item?.finding?.statement ?? "No statement"}</span>
              {Array.isArray(item?.whyRanked) && <small>{item.whyRanked.join(" · ")}</small>}
            </div>
          ))}
        </section>

        <section className="answer-box">
          <span className="answer-kicker">INTERPRETATION</span>
          {interpretations.length === 0 ? <p>No interpretation returned.</p> : interpretations.map((item: AnyRecord, index: number) => (
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
          {Array.isArray(safety?.limitations) && safety.limitations.map((limitation: string, index: number) => (
            <p key={index}>{limitation}</p>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="answer-box">
      <span className="answer-kicker">FREEZGROVER RESPONSE</span>
      <p>The API returned data, but it did not match the expected research-response shape. Open the raw response below for debugging.</p>
    </div>
  );
}

export default function ResearchTestPage() {
  const [question, setQuestion] = useState("How does flow affect the flame?");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed with status ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="test-shell">
      <section className="test-card">
        <div className="kicker">FREEZGROVER · RESEARCH API TEST</div>
        <h1>Interpretation Gate test console</h1>
        <p>
          This page sends a question through the live local research API so we can verify question understanding,
          clarification behavior, evidence retrieval, ranking, comparison, summarization, interpretation and safety-insight guards.
        </p>

        <form onSubmit={submit}>
          <label htmlFor="question">Scientific question</label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
          />
          <button disabled={loading || !question.trim()} type="submit">
            {loading ? "Running…" : "Run FREEZGROVER"}
          </button>
        </form>

        <div className="examples">
          <button type="button" onClick={() => setQuestion("How does flow affect the flame?")}>Multi-scope example</button>
          <button
            type="button"
            onClick={() => setQuestion("How did airflow speed affect flame behavior in Saffire-III?")}
          >
            Clearer example
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {result !== null && (
          <section className="result">
            <HumanReadableResponse result={result} />
            <details className="raw-response">
              <summary>Show raw API response</summary>
              <pre>{JSON.stringify(result, null, 2) || "No serializable response body."}</pre>
            </details>
          </section>
        )}
      </section>

      <style jsx>{`
        .test-shell { min-height:100vh; padding:48px 20px; background:#030712; color:#edf8ff; font-family:Inter,ui-sans-serif,system-ui,sans-serif; }
        .test-card { max-width:980px; margin:0 auto; border:1px solid rgba(91,204,255,.16); background:linear-gradient(180deg,rgba(8,21,39,.94),rgba(4,13,27,.96)); border-radius:18px; padding:28px; }
        .kicker,.answer-kicker { color:#55d8ff; font-size:11px; letter-spacing:.16em; font-weight:700; }
        h1 { margin:10px 0 8px; font-size:30px; }
        p { color:#89a2b7; line-height:1.7; font-size:13px; }
        form { margin-top:24px; display:grid; gap:10px; }
        label { color:#89a2b7; font-size:12px; }
        textarea { width:100%; resize:vertical; border:1px solid rgba(72,219,255,.22); background:rgba(5,19,34,.9); color:#edf8ff; border-radius:12px; padding:14px; font:inherit; line-height:1.5; }
        button { border:1px solid rgba(84,220,255,.22); background:linear-gradient(135deg,#0d8db8,#075875); color:white; border-radius:9px; padding:11px 14px; cursor:pointer; }
        button:disabled { opacity:.5; cursor:default; }
        .examples { margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; }
        .examples button { background:rgba(6,20,34,.8); color:#bcecff; }
        .error { margin-top:18px; border:1px solid rgba(255,100,100,.3); background:rgba(120,20,20,.16); color:#ffc4c4; padding:12px; border-radius:10px; }
        .result { margin-top:24px; border-top:1px solid rgba(91,204,255,.12); padding-top:18px; }
        .answer-stack { display:grid; gap:12px; }
        .answer-box { border:1px solid rgba(72,219,255,.14); background:rgba(5,19,34,.72); border-radius:12px; padding:16px; }
        .answer-box.clarification { border-color:rgba(255,190,90,.25); background:rgba(69,42,10,.2); }
        .answer-box h2 { margin:8px 0; font-size:19px; line-height:1.4; }
        .evidence-row { display:grid; gap:5px; padding:11px 0; border-top:1px solid rgba(255,255,255,.06); }
        .evidence-row:first-of-type { margin-top:8px; }
        .evidence-row b { color:#dff8ff; font-size:12px; }
        .evidence-row span { color:#9eb5c7; font-size:12px; line-height:1.55; }
        .evidence-row small { color:#607b90; font-size:10px; line-height:1.5; }
        .raw-response { margin-top:16px; color:#7fdfff; font-size:11px; }
        .raw-response summary { cursor:pointer; }
        pre { margin-top:10px; overflow:auto; background:#02050c; border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:16px; color:#bcecff; font-size:12px; line-height:1.55; white-space:pre-wrap; }
      `}</style>
    </main>
  );
}
