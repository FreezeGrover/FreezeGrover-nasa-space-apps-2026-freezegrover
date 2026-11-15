"use client";
import type { InvestigationFilters as Filters } from "@/types/research";
import { emptyFilters, filterDefinitions } from "@/lib/research/filters";
export function InvestigationFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (filters: Filters) => void;
}) {
  return (
    <section
      className="investigation-filters"
      aria-label="Investigation filters"
    >
      <div className="filter-dropdowns">
        {filterDefinitions.map((filter) => (
          <label key={filter.key}>
            <span>{filter.label}</span>
            <select
              aria-label={filter.label}
              value={value[filter.key]}
              onChange={(e) =>
                onChange({ ...value, [filter.key]: e.target.value })
              }
            >
              {filter.options.map(([key, label]) => (
                <option value={key} key={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <button
        className="reset-filters"
        onClick={() => onChange({ ...emptyFilters })}
        disabled={Object.values(value).every((v) => !v)}
      >
        Reset filters
      </button>
    </section>
  );
}
