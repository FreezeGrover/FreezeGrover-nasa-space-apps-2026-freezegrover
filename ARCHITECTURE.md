# Architecture

Each module has one job and exports named functions. React components are functions too: they take inputs and render the matching view.

- `components/Dashboard.tsx`: selected screen, shared mission context, search state, and disclosure.
- `components/ui.tsx`: panels, expandable sections, status labels, citations, and footer.
- `components/MissionContext.tsx`: environment choices shared by screens.
- `components/ResearchSearch.tsx`: question input and explanation-mode control.
- `components/InvestigationDetail.tsx`: selected record and expandable evidence details.
- `components/Applications.tsx`: reusable research-theme panels and scope note.
- `screens/`: one function component per main screen.
- `lib/research/catalog.ts`: curated source records, `findInvestigationById`, and `searchInvestigations`.
- `lib/comparison/compare.ts`: `compareExperimentalConditions` returns aligned attributes.
- `lib/ranking/rank.ts`: `findRelevantInvestigations` and `explainRankingReason` provide topic matches without invented scores.
- `lib/qa/review.ts`: `reviewScientificClaim` keeps evidence-dependent checks pending.
- `types/research.ts`: shared record and selection types.
- `tests/research.test.ts`: meaningful data and scientific-integrity checks.

UI components import the functions; the functions do not depend on React. This allows the source catalog to be replaced later without rewriting every screen.

The planned live pipeline is NASA documents → source registry → retrieval → answer provider → independent evidence reviewer → dashboard. Only curated registry/retrieval and the interface are implemented in this milestone. Empty future API directories contain no server functionality.

No API keys are stored or requested by the interface. Live AI integration is deferred by the project lead.
