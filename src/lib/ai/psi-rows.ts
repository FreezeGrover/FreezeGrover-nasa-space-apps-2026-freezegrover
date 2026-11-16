import { readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { getInvestigationEvidence } from "../research/catalog";

// Read only imported, locally present NASA PSI tables; no arbitrary filesystem paths.
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (quoted && ch === '"' && csv[i + 1] === '"') { cell += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === ',') { row.push(cell); cell = ""; }
    else if (!quoted && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && csv[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (quoted) throw new Error("INVALID_CSV_QUOTING");
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export function retrievePsiRows(id: string, query: string, limit = 5) {
  if (!/^[a-z0-9-]{1,40}$/i.test(id) || query.length > 120 || limit < 1 || limit > 10)
    return { error: "Invalid investigation, query, or limit." };
  let evidence;
  try { evidence = getInvestigationEvidence(id); }
  catch { return { error: "Unknown investigation." }; }
  if (!evidence) return { error: "Unknown investigation." };
  const root = resolve(process.cwd(), "public", "psi");
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const tables = [];
  for (const table of evidence.tables) {
    if (!table.localUrl || !table.localUrl.startsWith("/psi/")) continue;
    const file = resolve(join(process.cwd(), "public"), "." + table.localUrl);
    if (!file.startsWith(root + sep)) continue;
    let data: string;
    try { data = readFileSync(file, "utf8"); }
    catch { continue; }
    if (data.length > 3_000_000) continue;
    const rows = parseCsv(data.replace(/^\uFEFF/, ""));
    const header = rows[0] ?? [];
    if (!header.length) continue;
    const matches = rows.slice(1).map((cells, i) => ({
      csvRow: i + 2,
      cells,
      score: tokens.filter((token) => cells.some((v) => v.toLowerCase().includes(token))).length,
    })).filter((row) => !tokens.length || row.score > 0)
      .sort((a, b) => b.score - a.score || a.csvRow - b.csvRow)
      .slice(0, limit);
    tables.push({
      name: table.name, originalUrl: table.url, localUrl: table.localUrl,
      sha256: table.sha256 ?? null, columns: header,
      totalDataRows: rows.length - 1,
      rows: matches.map(({ csvRow, cells }) => ({
        csvRow, values: Object.fromEntries(header.map((h, i) => [h || `Column ${i + 1}`, cells[i] ?? ""])),
      })),
    });
  }
  return {
    investigation: id, query, tables,
    status: "Locally imported CSV rows; values transcribed without unit inference or experimental interpretation. Empty cells are missing data. CSV line numbers include the header. Verify original NASA file, column definitions and units before scientific conclusions.",
  };
}
