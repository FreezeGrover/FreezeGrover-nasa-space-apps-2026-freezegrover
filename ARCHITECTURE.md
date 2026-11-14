# Architecture and development policy

The approved five-tab Next.js/React UI is retained. The earlier requirement to make every frontend, styling, state-management and infrastructure change deliberately modular is withdrawn. Ordinary React components and straightforward framework conventions remain appropriate. No working UI module was dismantled and no new Python service was introduced.

Deliberate modularity belongs in the scientific engine. Explanatory code comments belong there and in NASA ingestion, not in presentation code. Comments explain inputs, decisions and limitations in plain language. AI assistance is disclosed in the application and documentation.

## Scientific modules

| Module | Inputs → outputs | Dependencies | Tests and limitations |
|---|---|---|---|
| scripts/ingest_psi.py / compile_psi.py | NASA category search, records and inventories → original records, CSV bytes, normalized snapshot | Python standard library, observed NASA website endpoints | Python ingestion tests; restricted files never bypassed; endpoints are not a promised public API |
| lib/research/search.ts / filters.ts | Question, catalog, five filters → source-linked matches | Imported metadata | Search/filter regression tests; deterministic synonyms and spelling normalization are lexical retrieval, not AI understanding |
| lib/research/briefing.ts | Question and optional filtered records → up to three original objective excerpts | Catalog and retrieval | Empty and query-specific briefing tests; objectives are not measured findings |
| lib/research/answer.ts | Question, environment and replaceable provider function → accepted cited interpretations | Catalog, context, independent grounding | Provider-substitution and fabricated-citation tests; OpenAI adapter implemented, Google deferred |
| lib/qa/grounding.ts | Provider statements → accepted quotes and explicit rejection reasons | Original source fields and downloaded CSV preview | Rejects invalid identities, invented quotes, unsupported numeric text and objective-as-proven-result wording; does NOT establish semantic entailment |
| lib/comparison/compare.ts | Two record identities → attribute table, actual similarities, differences and limitations | Metadata and downloaded table inventory | Same-record and mixed-record tests; no quantitative cross-experiment result without matched conditions |
| lib/ranking/rank.ts | Goal and environment → source-ordered topic matches and record-specific explanation | Goal tags, metadata, mission context | Goal/context tests; no numerical scientific rank or certified habitat suitability |
| lib/research/relationships.ts / metadata.ts | Selected record → documented links and shared apparatus/fuel/condition labels | Catalog | Hardware and relationship tests; metadata similarity does not imply equal experiments |
| lib/qa/review.ts | Draft and record identity → four independent deterministic review checks | Narrative, conditions, table columns | Unsupported numbers, missing baselines and record-specific conditions tested; nothing is automatically scientifically Verified |
| lib/qa/notes.ts | Draft and record identity → session note | Source identity/version | Notes tests; temporary drafts are not approvals |

Scientific calculations and unit conversion beyond existing source preservation are NOT implemented. Ambiguous original units remain unchanged. No formula or operating limit is invented to fill this gap.

## OpenAI and future Google integration

POST /api/research validates a question and environment. With a server-side OPENAI_API_KEY, OPENAI_MODEL and positive AI_MAX_REQUESTS, it requests structured output from the OpenAI Responses API. The provider sees public NASA objective/approach/condition/measurement excerpts and original downloaded CSV headers plus the first imported sample rows. This is NOT complete document or full-dataset analysis. No external search, autonomous file downloads or AI numerical calculations are enabled.

The server uses store:false, a 45-second timeout and max_output_tokens:2400. It counts at most AI_MAX_REQUESTS attempts per server process (clamped to 100); failures count too. A restart/module reload resets this counter. It is not a billing-account dollar limit. The supplied launcher asks the user to approve the attempt count before enabling calls; defaults to one attempt. No paid API request was made during development.

The answer provider is an injected function, so a future Google adapter can replace OpenAI without changing deterministic scientific checks. An independent AI scientific reviewer is NOT connected. Deterministic quote checks run separately from generation regardless of provider. They check provenance and basic constraints, not scientific truth or claim entailment.

Missing credentials, expired quota, authentication failures, malformed output and timeouts keep catalog retrieval usable and identify the fallback explicitly. The UI says configured only when server configuration is present; that status does not prove model access. Live OpenAI verification remains pending until the user's existing key is supplied locally and a real request succeeds.

## Frontend behavior

All five approved tabs, blue/white styles and popup layout remain. Search visibility is owned by Dashboard: an explicit Search opens results; dismissal and navigation do not replay an earlier request. Research briefings track the submitted question; filter changes update briefing records and results. Results show AI statements only for currently visible records, and can send a statement to the independent QA tab. Compare and Rankings remain deterministic instead of creating unnecessary paid calls. QA responds to the statement and selected source rather than showing fixed generic text.

## Verification boundaries

Node tests cover the scientific modules, API failure paths with a fake transport and a Happy DOM interaction workflow across all five tabs. Happy DOM is a DOM simulation, not a visual browser or proof of real OpenAI connectivity. Production build and typecheck are required. Windows browser review of the updated package and live AI success are separate post-install checks. GitHub publication requires a verified remote commit SHA; local commits must be identified as local.


## Search response lifecycle

Pending searches render a fetching state only; provisional catalog results are not presented as final results. Duplicate requests are blocked while a request is active. Exhausted local AI allowance is an unavailable state, not a scientific zero-result outcome. Catalog fallback after an exhausted allowance requires an explicit user choice. The cap is not increased or removed by this change.
