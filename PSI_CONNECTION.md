# NASA PSI Combustion Science connection

## Verified scope and data availability — 14 November 2026

The NASA PSI website's own search endpoint returned 24 unique records under Research Area = Combustion Science. Each full record was then retrieved and checked for matching accession, research area and public visibility. This confirms 24 repository records, not 24 distinct flight experiments: 19 are classified as Microgravity Investigation and five as Ground Investigation. DAFT / DAFT-2 is one combined record. NASA's narrative research-area overview is not an exhaustive current inventory.

| Evidence | Verified count | Meaning |
| --- | ---: | --- |
| Combustion investigation metadata | 24 | Full official records retrieved, identity and category checked |
| Official file inventories | 24 | Unauthenticated read access succeeded |
| Records listing unrestricted raw-data files | 18 | Listing verified; the complete raw archives were not downloaded |
| Records with downloaded original experimental CSVs | 20 | Includes test indexes and condition tables, not necessarily outcome measurements |
| Original experimental CSV files downloaded | 22 | Original bytes, SHA-256, columns, sample rows and download provenance retained |
| Ground records without downloaded experimental CSV | 4 | PSI-60, PSI-62, PSI-115, PSI-117; missing CSV does not establish absence of other data |

FLEX PSI-69's downloaded table contains 274 data rows, including original columns for droplet size, ambient pressure, composition, visible extinction diameter and burning time/rate. Its original `Burning rate; mm` label is ambiguous and is retained without inferring a corrected unit. Other CSVs may contain only run schedules, conditions or publication/file references. Do not treat all 20 as independently reviewed measurement datasets.

## Retrieval and refresh

The app ships a successfully retrieved snapshot so NASA downtime does not turn local results into fabricated fallback records. It explicitly says snapshot, not continuous live feed. No NASA API key was required for these public reads. No supported public API contract was found. The observed endpoints may change:

- `https://psi.nasa.gov/geode-py/ws/repo/search`: source=psi, type=investigation, ffield=Research Area, fvalue=combustion science; paginate from/size until total is reached.
- `/geode-py/ws/repo/investigations/{accession}`: official full metadata used by the PSI website.
- POST `/geode-py/ws/files/v2`: read-only file listing, with the investigation ID and version. This does not create or modify NASA records.
- `/geode-py/ws/studies/{accession}/download`: resolve an unrestricted file ID and recorded file/study version. Temporary signed URLs are not persisted.

These paths were found in the public PSI web application's JavaScript and tested successfully against actual NASA records. They are isolated in `scripts/ingest_psi.py`, not assumed to be a stable external API.

To refresh, install Python 3.10+ and run from the project folder:

```text
python scripts/ingest_psi.py --refresh
python scripts/compile_psi.py
npm test
python -m unittest discover -s tests -p "test_psi*.py"
npm run typecheck
npm run build
```

The ingester uses standard-library Python, three concurrent workers, finite timeouts, bounded retries, full pagination and identity/category checks. It does not retry 401/403 restrictions, sign agreements, authenticate, scrape private records, or download enormous raw archives. Experimental CSV downloads are limited to 2 MB per file. Original bytes are preserved; UTF-8 and legacy Windows-1252 parsing are supported. Publication of the aggregate occurs only after required record retrieval completes. Failed optional file inventories/downloads are explicitly recorded. Restart the application after compiling a refreshed snapshot.

`data/psi/raw/` preserves original record responses and discovery evidence. `data/psi/inventories/` preserves the official file listings. `src/data/psi-catalog.json` is the compact normalized UI snapshot; `public/psi/` contains downloaded originals. Intermediate `data/psi/ingestion.json` can be regenerated and is not committed. GET `/api/psi/catalog?q=...` exposes the same snapshot and source-linked retrieval results locally.

## Scientific integrity

- Objective, approach, hardware, related IDs, DOI, version and project type originate in the retrieved records.
- Fuel, geometry, oxygen/pressure, sensors and measurement descriptions are matching source passages, with full objective/approach retained for context. Missing descriptions stay missing.
- Fuel categories, research topics and goal tags are local retrieval aids, not NASA relevance rankings or confidence ratings.
- Related IDs use NASA's explicit field. Reverse links are labeled as reverse lookup. Shared facility labels, fuel names and oxygen mentions establish context only; they do not establish matching hardware configuration, concentrations or outcomes.
- Ground models are distinct from flight experiments. No lunar or Mars measurement coverage is asserted.
- NASA hypotheses and intended impacts are separate from measured results. Finding extraction and independent scientific verification remain incomplete; no record is assigned fabricated confidence or Verified status.
- PSI-98 contains a platform inconsistency (project field ISS versus Cygnus in the approach), explicitly flagged for review. Original records and ambiguous CSV headers are retained rather than silently corrected.
- Scientific QA imports the same source catalog but runs separately from retrieval/answer generation, accepts no AI provider as evidence, and withholds source-dependent conclusions pending claim support, unit and condition review. No paid AI requests were made.

## Verification

12 TypeScript tests and four ingestion tests passed; TypeScript checking and optimized production build passed. Browser checks covered all 24 non-default filter options, all 24 investigation detail panels, exact PSI/name and terminology retrieval, the natural flame-spread question, unsupported questions, Compare, Rankings, and Scientific QA. The question returned BASS-II, BASS, PSI-62 ground modeling and Saffire I–III. Ground modeling is labeled separately from flight context. The tested 1363 × 936 screen had no document overflow; result and detail panels scroll internally. Smaller screen sizes were not visually verified.

All 22 original CSVs were also served by the production server and checked against their retained SHA-256 values. The local catalog API passed exact-ID and natural-language question checks. Browser extension logs contained extension-origin metadata errors; no application-origin runtime error was observed during the checked flows.

GitHub publication remains blocked: the connected app returned 404 for FreezeGrover/flames-in-freefall. A local commit is not reported as a remote GitHub commit. Windows localhost requires applying the updated package.
