"use client";

import { FormEvent, useState } from "react";

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
            <div className="result-label">API RESPONSE</div>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </section>
        )}
      </section>

      <style jsx>{`
        .test-shell {
          min-height: 100vh;
          padding: 48px 20px;
          background: #030712;
          color: #edf8ff;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }
        .test-card {
          max-width: 980px;
          margin: 0 auto;
          border: 1px solid rgba(91, 204, 255, .16);
          background: linear-gradient(180deg, rgba(8, 21, 39, .94), rgba(4, 13, 27, .96));
          border-radius: 18px;
          padding: 28px;
        }
        .kicker, .result-label {
          color: #55d8ff;
          font-size: 11px;
          letter-spacing: .16em;
          font-weight: 700;
        }
        h1 { margin: 10px 0 8px; font-size: 30px; }
        p { color: #89a2b7; line-height: 1.7; font-size: 13px; }
        form { margin-top: 24px; display: grid; gap: 10px; }
        label { color: #89a2b7; font-size: 12px; }
        textarea {
          width: 100%;
          resize: vertical;
          border: 1px solid rgba(72, 219, 255, .22);
          background: rgba(5, 19, 34, .9);
          color: #edf8ff;
          border-radius: 12px;
          padding: 14px;
          font: inherit;
          line-height: 1.5;
        }
        button {
          border: 1px solid rgba(84, 220, 255, .22);
          background: linear-gradient(135deg, #0d8db8, #075875);
          color: white;
          border-radius: 9px;
          padding: 11px 14px;
          cursor: pointer;
        }
        button:disabled { opacity: .5; cursor: default; }
        .examples { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
        .examples button { background: rgba(6, 20, 34, .8); color: #bcecff; }
        .error {
          margin-top: 18px;
          border: 1px solid rgba(255, 100, 100, .3);
          background: rgba(120, 20, 20, .16);
          color: #ffc4c4;
          padding: 12px;
          border-radius: 10px;
        }
        .result {
          margin-top: 24px;
          border-top: 1px solid rgba(91, 204, 255, .12);
          padding-top: 18px;
        }
        pre {
          margin-top: 10px;
          overflow: auto;
          background: #02050c;
          border: 1px solid rgba(255, 255, 255, .08);
          border-radius: 12px;
          padding: 16px;
          color: #bcecff;
          font-size: 12px;
          line-height: 1.55;
          white-space: pre-wrap;
        }
      `}</style>
    </main>
  );
}
