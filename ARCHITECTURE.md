# Architecture

Each module has one job and exports named functions. React components are functions too: they take inputs and render the matching view.

- `components/Dashboard.tsx`: selected screen, shared mission context, search state, and disclosure.
- `components/ui.tsx`: panels, expandable sections, status labels, citations, and footer.
- `components/MissionContext.tsx`: environment choices shared by screens.
- `components/ResearchSearch.tsx`: question input and explanation-mode control.
- `components/InvestigationDetail.tsx`: selected record and expandable evidence details.
- `components/Applications.tsx`: reusable research-theme panels and scope note.
- `screens/`: one function component per main screen.
- `lib/research/catalog.ts`: the retrieved PSI snapshot, `findInvestigationById`, and `searchInvestigations`.
- `lib/comparison/compare.ts`: `compareExperimentalConditions` returns aligned attributes.
- `lib/ranking/rank.ts`: `findRelevantInvestigations` and `explainRankingReason` provide topic matches without invented scores.
- `lib/qa/review.ts`: `reviewScientificClaim` keeps evidence-dependent checks pending.
- `types/research.ts`: shared record and selection types.
- `tests/research.test.ts`: meaningful data and scientific-integrity checks.

UI components import the functions; the functions do not depend on React. This allows the source catalog to be replaced later without rewriting every screen.

The current pipeline is NASA PSI public records/files → validated ingestion → normalized snapshot → source-linked retrieval → dashboard. GET /api/psi/catalog exposes that snapshot. Future answer generation must send claims to a separate evidence reviewer; no answer provider is currently configured.

No API keys are stored or requested by the interface. Live AI integration is not configured in this milestone.

## PSI source pipeline (current)
`ingest_psi.py` discovers category-filtered NASA records, validates identities, reads official file inventories, resolves unrestricted experimental CSVs and preserves original bytes. `compile_psi.py` creates the shared snapshot used by catalog, metadata, comparison, ranking, briefing and independent QA modules. PsiEvidence renders provenance, original narrative, sample rows and links. GET /api/psi/catalog uses the same retrieval functions. PSI_CONNECTION.md documents the current ingestion contract.
