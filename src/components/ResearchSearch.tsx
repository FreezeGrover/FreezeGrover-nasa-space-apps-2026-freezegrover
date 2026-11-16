"use client";
import { MagnifyingGlass, ArrowUp } from "@phosphor-icons/react";
export function ResearchSearch({
  value,
  onChange,
  onSearch,
  pending=false,title="Ask a Research Question",compact=false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  pending?:boolean;
  title?:string;compact?:boolean;
}) {
  return (
    <section className="research-search">
      <div className="search-heading">
        <h1>{title}</h1>
        {!compact&&<span className="research-source-badge">NASA PSI · Combustion Science</span>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <label className="search-input">
          <MagnifyingGlass />
          <textarea
            aria-label="Research question"
            rows={compact?2:1}
            maxLength={1200}
            placeholder="e.g., How does microgravity affect flame spread, materials or smoke?"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();if(!pending&&value.trim())e.currentTarget.form?.requestSubmit();}}}
          />
        </label>
        <button className="search-button" type="submit" disabled={pending} aria-busy={pending} aria-label="Send message">
          <ArrowUp />
          {pending?"Fetching…":compact?"Send":"Search"}
        </button>
      </form>
      {compact&&<p className="conversation-keyboard-hint">Enter to send · Shift+Enter for a new line</p>}
    </section>
  );
}
