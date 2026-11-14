"use client";
import { MagnifyingGlass } from "@phosphor-icons/react";
export function ResearchSearch({
  value,
  onChange,
  onSearch,
  mode,
  setMode,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  mode: string;
  setMode: (v: string) => void;
}) {
  return (
    <section className="research-search">
      <div className="search-heading">
        <h1>Ask a Research Question</h1>
        <div className="mode-switch">
          <span>View:</span>
          <div>
            {["Simple", "Scientific"].map((item) => (
              <button
                className={mode === item ? "selected" : ""}
                key={item}
                aria-pressed={mode === item}
                onClick={() => setMode(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <label className="search-input">
          <MagnifyingGlass />
          <input
            aria-label="Research question"
            placeholder="e.g., How does microgravity affect flame spread, materials or smoke?"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        <button className="search-button" type="submit">
          <MagnifyingGlass />
          Search
        </button>
      </form>
    </section>
  );
}
