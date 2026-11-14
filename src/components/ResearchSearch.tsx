"use client";
import { MagnifyingGlass } from "@phosphor-icons/react";
export function ResearchSearch({
  value,
  onChange,
  onSearch,
  pending=false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  pending?:boolean;
}) {
  return (
    <section className="research-search">
      <div className="search-heading">
        <h1>Ask a Research Question</h1>
        <span className="research-source-badge">NASA PSI · Combustion Science</span>
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
            maxLength={1200}
            placeholder="e.g., How does microgravity affect flame spread, materials or smoke?"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        <button className="search-button" type="submit" disabled={pending} aria-busy={pending}>
          <MagnifyingGlass />
          {pending?"Fetching…":"Search"}
        </button>
      </form>
    </section>
  );
}
