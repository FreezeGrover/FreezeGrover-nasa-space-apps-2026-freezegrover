import { investigations, catalogSummary } from "@/lib/research/catalog";
import { SourceLink } from "./ui";
export function CatalogBriefing({ compact = false }: { compact?: boolean }) {
  const featured = ["bass2", "flex", "samer"].map((id) =>
    investigations.find((item) => item.id === id)!,
  );
  return (
    <>
      <ul className={compact ? "" : "briefing"}>
        {featured.map((item) => (
          <li key={item.id}>
            <strong>{item.name}:</strong>{" "}
            {compact
              ? item.title
              : item.purpose.length > 180
                ? item.purpose.slice(0, 180).replace(/\s+\S*$/, "") + "…"
                : item.purpose}{" "}
            <SourceLink
              href={item.source}
              label={item.sourceLabel.split(" · ")[0]}
            />
          </li>
        ))}
      </ul>
      <span className="muted tiny">
        {catalogSummary.verifiedCombustionRecords} retrieved combustion records
        · source excerpts, not an AI answer or safety recommendation
      </span>
    </>
  );
}
