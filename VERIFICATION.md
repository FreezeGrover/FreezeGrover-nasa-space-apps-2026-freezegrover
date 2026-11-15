## Framework-informed Rankings assessment — 15 November 2026

Baseline: bf21966d9fafd005320b17090a7dedb35738f10c. The original 20-point framework archive and PSI catalog are preserved.

Rankings now has a separate, deterministic evidence-assessment module, candidate-selection module and native assessment dialog. Relevance, evidence quality, conclusion confidence, applicability, uncertainty/conflicts, hazard severity, hazard likelihood, prediction readiness, safety applications and independent review are distinct dimensions. Source coverage is assessed from the imported narrative, methods, conditions and downloaded-table inventory. Intrinsic scientific quality and calibrated conclusion confidence are not inferred from a NASA domain, file count or matching topic. Confidence and validated prediction conclusions remain withheld where material gaps or independent validation are missing. Severity and likelihood remain unassessed rather than invented from laboratory observations.

The assessment identifies missing material/geometry/oxygen/pressure/airflow/sensor context, headers requiring unit or concentration-basis documentation, and differing same-unit pressure ranges across original objective/approach fields. Differing ranges are questions for context review, not automatically contradictory findings. Original quantities and quotes are retained; no unit conversion is performed. The check is not a complete full-paper or cross-study interpretation. Conditions, table columns/rows, snapshot/version/hash provenance and next checks are expandable. Recorded hashes are labelled as recorded, not represented as runtime scientific certification.

An optional specific question refines relevance through lexical retrieval. With a question, retrieval searches the full imported PSI catalog so a missing local goal tag cannot replace the exact requested investigation with a similarly named one. Question relevance is primary; local goal and environment factors refine ties. Without a question, goal grouping and environment prioritization retain their existing behavior. Quality, confidence, historical incidents and technology-transfer articles never inflate the ranking order. Unknown questions can return no matches. Exact CFI remains PSI-39 instead of being substituted with CFI-G; a missing local goal classification is disclosed.

The original twenty points are mapped to mission/applicability, evidence/interpretation, separate assessment dimensions, independent review/traceability, and engineering/delivery. They guide modules, tests, gap handling and QA rather than appearing as twenty compulsory answer headings. The full original text remains in ORIGINAL_SCIENTIFIC_FRAMEWORK.md. Derived policy and new explanations use the owner's requested “multiple plausible interpretations” wording, preserving verbatim NASA quotations. The conversational prompt version is 2.3.0; the ranking assessment version is 1.0.0. This remains the project's proposed framework, not an official NASA rubric.

Every candidate has an Evidence & confidence action. Review this assessment in Scientific QA carries the exact record, objective quote, question, goal/environment, assessment version, recorded source hash, all dimension results, conditions and original-field pressure-range quotations. That context is explicitly labelled Ranking assessment context, not mislabeled as a conversational answer or a primary measurement. Investigate evidence gaps opens the existing conversational research flow with the selected record and question. Selecting a ranking or opening an assessment performs no paid AI call; the research action is explicit.

Validation: 68 Node tests, four Python ingestion tests, TypeScript and Next.js production build passed. Tests cover all twenty principle mappings, high relevance with narrative-only local coverage, missing conditions, same-unit range differences, equivalent decimal transcription, cross-unit abstention, no fabricated confidence/probabilities, source provenance, all goal/environment combinations, exact CFI/CFI-G identity, question clearing, QA payload and research-action transport. AI transport tests are mocked; no new paid provider request was needed for this local assessment implementation. Source integrity checks passed for 11 snapshots and 43 excerpts.

Live browser inspection verified CFI exact matching under Predictive Models, all ten independent dimensions, both original pressure ranges, lunar transfer limitations, the requested terminology and the Scientific QA context. At a 390 × 844 test viewport, the assessment dialog client width and scroll width were both 365px. The viewport override was reset. Screenshot: ranking-framework-assessment.png. Existing white/blue styling, five-tab navigation and source roles are retained. Original approved sketches are unavailable, so exact pixel fidelity is unverified.

The server was restarted on localhost:3022 and returned HTTP 200. No GitHub push, deployment, public exposure, validated predictor or operational risk probability was introduced.

## Conversation flow, QA handoff and Rankings — 15 November 2026

Baseline: d3d64fc806913bb6bbb2bde38c71e9d0541118ce.

New assistant replies finish their typewriter reveal before showing Sources, the cited-statement QA action and browse/compare actions. Reveal completion is acknowledged in the shared conversation hook, rather than kept only in the dialog. Reopening an already completed conversation shows the full text immediately and scrolls to the latest message. Closing during reveal also finishes that presentation state, so it cannot replay on reopening. Reloaded history remains complete; scientific drafts still pass server checks before presentation.

The QA navigation bug was competing state updates: a selected citation was set immediately before navigation, then the sidebar's default initialization could replace it with the first citation. Navigation now accepts an explicit review request that takes precedence. A small QA handoff module preserves the selected statement, exact quotation, source record/field or official source/excerpt, original question and full assistant answer. The QA page displays the question and statement, with expandable cited evidence and original answer. Long provenance content scrolls inside the existing page/card design, avoiding clipped review panels. QA remains scientifically pending, never automatically certified by navigation or a saved note.

The shared environment selector displays “Environment: [selected value] ⌄”, with an accessible Change mission context label and no trailing Choose instruction. Rankings retains goal filtering and documented-condition prioritization; descriptions now correctly distinguish catalog order under All from environment-specific ordering. Priority explanations list the actual imported factors. No numerical safety score or evidence-quality rating is introduced.

Verification: 60 Node tests, TypeScript and Next.js production build passed. Tests cover delayed source/actions, completed-text reopening and scroll position, exact second-citation and official-resource QA handoffs, all 24 goal/environment combinations, result membership and matching details. Source integrity checks passed for 11 snapshots / 43 passages.

Live browser: all four ranking goals changed relevant lists (Crew Safety 16, Predictive Models 14, Safety Equipment 19, Earth Applications 24 in this imported catalog), Space Stations selected without a dangling Choose label, full result browsing and SAME-R details worked. A real FLEX reply completed in seven seconds actual request time. On reopening, the full text was immediately identical, Writing response indicators were zero, and scroll position was at the bottom (approximately 93 + 260 = 353px). The QA action populated the exact guide-sourced statement, original question, quotation and full answer; the source remained Scientific background rather than being relabeled a PSI measurement. Screenshot: research-flow-qa.png.

The verified build runs only on localhost port 3022 and returned HTTP 200. All five tabs, primary PSI data and source roles are preserved. Original approved sketches remain unavailable; no exact pixel-fidelity claim is made. No GitHub push or deployment.

## Dashboard feedback fixes — 15 November 2026

Baseline: 27ede33ee52a400acb1a0c9ff4fb4aeadbed7899. The previous source and 24-record PSI catalog are preserved; Overview remains unchanged.

The investigation count can refer to a previous conversational question even when the composer is empty. Investigations now explicitly labels that scope, provides “Browse all investigations”, and labels a full-catalog launcher “Browse investigations” rather than “View search results”. The reset clears view filters while retaining the selected mission environment and conversation. A new submitted question restores its answer-specific view. Mission prioritization has a distinct, higher-contrast badge below the filters instead of relying on the faint provenance line.

The cumulative feedback changes also add safe React rendering for bold text, headings, bullets, numbered lists and scientific Unicode symbols. Incomplete Markdown prefixes are consumed safely during typewriter reveal; a regression test covers the formerly stalling marker case. Numeric evidence checks exclude structural list numbering while retaining measurement and unit checks. The versioned conversational prompt encourages useful structure without mandatory response headings. A direct cited-statement QA action is available beside the answer; the sidebar initializes a review from the latest cited statement when none is selected. The QA text area shows more of the draft. Mission selections reorder attention using documented oxygen/pressure, material, smoke, airflow and gravity metadata in Investigations and Rankings. These are relevance heuristics, not safety scores, direct destination measurements, or evidence-quality ratings.

The challenge objectives and potential considerations are now indexed as 19 passages within the challenge brief, for a total of 11 official-source snapshots and 43 passages. This covers the requested spacesuit atmosphere context, prospective habitat atmospheres, CFI-G, hardware, instrument reuse, BRE, audience/attributes, scope and partial-gravity limitations. Prospect versus observation roles remain explicit. No validated predictor, new operational limit or emergency procedure is introduced. PDF coverage remains selected reviewed pages, not full-book ingestion.

Verification: 57 Node tests, 4 Python ingestion tests, TypeScript and the production build passed. All 11 snapshot / 43 excerpt integrity checks passed. In the live browser, Lunar Bases visibly reordered the catalog and selected SAFFIRE-I. A real FLEX question produced four formatted bullets and completed without a rendering stall. After closing the conversation, the previous-question scope was visible. “Browse all investigations” returned from one cited PSI record to all 24, kept Lunar Bases selected and retained the conversation. The resulting screenshot is investigation-scope.png. Automated DOM tests cover QA initialization and preservation of dialogue when browsing all.

The localhost production server was restarted and returned HTTP 200. Existing approved sketches are unavailable, so exact sketch fidelity is not claimed. No GitHub push or deployment was performed.

### Final verification — conversational policy 2.1.0

- Node regression suite: **54 passed**, including model-led clarification, source-role preservation, unsupported quantities/units, canonical evidence identities, tool-selected retrieval, correction after a failed review, interrupted streams, failures/cancellation/retry, session history, keyboard behavior, progressive reveal and scroll-to-latest.
- Python ingestion suite: **4 passed**. TypeScript and Next.js production build passed. Snapshot verifier passed **11 sources / 28 excerpts**.
- Live browser conversation: “Why do flames behave differently in space?” → “Can you explain that more simply?” → “What about oxygen?” All produced substantive, cited, context-aware explanations. Elapsed times were actual request times. Sources remained expandable.
- An additional tool-assisted CFI follow-up initially failed grounding review. Investigation found missing explicit citation numbering, study-name metadata and tool-operation history in the reviewer context, plus broad search burying an exact identity. Those contracts were corrected without removing the independent review. A subsequent live browser retry with the existing multi-turn context passed, explained CFI with NASA citations and declined to treat the experiment as a validated spacecraft fire prediction (13 seconds actual request duration).
- Manually scrolling upward exposed the down-arrow; activating it returned to the latest text. The automated DOM test also checks that progressive writing does not override manual reading position. Reduced-motion support remains available.
- Mobile conversation at 390 × 844: dialog client width and scroll width both **365px**, top 58px and bottom 786px. Temporary viewport override was reset. Short-window chat uses a scoped height/spacing adjustment. Other dashboard CSS files and the original PSI JSON are byte-identical to the local baseline.
- Live CFI evidence → Scientific QA carried the correct PSI-39 identity and statement. Saving a note advanced review history to one while keeping scientific status pending. Automated tests cover official-resource QA identity/hashes and article-specific follow-up actions.
- Known discrepancies: approved original sketches were unavailable, so exact visual fidelity is unverified. Existing narrow-screen Compare overflow remains. Screenshots and the source audit accompany the deliverable. Automated model review may still miss errors; nothing is represented as human scientific certification.
- No GitHub push, public exposure or deployment. The localhost production server remains on port 3022.

## Current implementation — 15 November 2026

This section supersedes historical status statements below. Continue from the ZIP-delivered local application; GitHub synchronization is unverified. Local Git baseline before official-resource integration: `5fc4b292c3dd537b875cc618fe8958b5a531b03a`. The imported history bundle's earlier commit is historical, not the current ZIP source.

The five-tab dashboard, primary 24-investigation PSI catalog, existing navigation and scientific modules remain. Official resources supplement PSI instead of replacing it or changing experimental rankings. Eleven inspected source snapshots and 28 curated passages cover the Glenn overview, guide landing page and selected PDF pages, NASA ScienceCasts captions, Apollo 1, Apollo 13, Mir and three Spinoff articles, plus the challenge brief. `scripts/verify_nasa_resources.mjs` checks saved-source, extracted-text and excerpt hashes. The PDF contains reviewed transcriptions of printed pages 12–13; this is not full-book ingestion. The challenge source is program/planning context. Archived prospective mission and equipment statements are not current status feeds.

`lib/ai/natural-policy.ts` maintains a concise versioned conversational instruction and all 20 project principles. The owner's full original framework is preserved in `ORIGINAL_SCIENTIFIC_FRAMEWORK.md`. It is a project-proposed framework, not a NASA evaluation rubric. Principles guide investigation and review without prescribing headings or restricting the assistant to twenty questions.

The model receives dialogue history, dashboard context and source passages. It writes a free-form reply and selects canonical evidence IDs for material claims. `natural-tools.ts` exposes model-selected search and source-opening tools over inspected local NASA material. Tools do not browse the live internet or ingest full research papers. Metadata, methods excerpts and imported table previews remain bounded context; missing full-document or data coverage must be disclosed. Model-led follow-ups and clarification replace fixed comparison-response branches.

`research/evidence-references.ts` constructs citations directly from originals: the model never retypes, promotes or silently relabels a quote. `ai/natural-review.ts` checks numerical transcription, value-unit pairs and citation indices. A separate model request reviews the entire reply for material factual support, units, roles, relationships, uncertainty and applicable framework principles. Review failures permit bounded correction within the same request deadline; an unresolved failure produces a retryable error with no partial conclusion. `qa/conversation-provenance.ts` rechecks original quotes, source categories, values and units at the orchestration boundary. This is automated grounding review, not independent human scientific validation, a calibrated confidence measure, or a validated predictor. The same configured model is used in separate generation and review calls.

Provider streaming is buffered until a completed response passes checks. The browser then progressively reveals the checked reply with a typewriter effect; this is presentation, not simulated research or live unchecked scientific streaming. The elapsed counter measures actual request duration and stops before presentation animation. Real operation events cover local retrieval, context examination, provider waiting and automated review. Scroll position is preserved while reading older messages; the down-arrow returns to the latest text. Reduced-motion preference shows complete text immediately. Existing Enter/Shift+Enter/send, cancellation, timeout, retry and session restoration remain. History is tab-local, not permanent account storage. The latest 20 eligible messages and 48,000 history characters bound each request; older visible context is disclosed. A per-turn tool/repair budget and 60-second provider deadline bound work; there is no app request-count cap.

Scientific details are expandable beneath natural answers, with source and QA actions. Source actions use actual article identities and hashes in Scientific QA. Manual QA drafts receive deterministic checks and remain pending human review. Incidents do not become experimental measurements, and technology transfer does not establish lineage to PSI studies. Relevance, evidence quality, hazard severity, likelihood and applicability remain distinct. No emergency procedure, fire probability or unvalidated quantitative prediction is invented.

Existing API credentials were reused with prior user authorization, without writing or exposing secrets. The existing configured model remains supported; the local verification launcher uses `gpt-5.4-mini` when no explicit model is supplied. `store:false` remains set. Each successful natural answer includes a separate review request, which adds latency and API usage. Failures and cancelled work may still incur upstream usage.

Visual changes are confined to native evidence disclosures and chat behavior. Existing dashboard styles are retained; a scoped short-height conversation rule increases room for reading, and the jump button overlays the log instead of shrinking it. Original approved sketches are unavailable, so exact pixel fidelity remains unverified. Existing narrow-screen Compare overflow remains a known limitation. No deployment, public exposure or GitHub push was performed.

# Verification — 15 November 2026 (Pakistan)

## Passed locally

- 24 Node tests, including one DOM interaction test spanning all five tabs.
- Four Python NASA-ingestion tests.
- TypeScript check and optimized Next.js production build.
- CSS comparison with the prior approved ZIP: all 20 stylesheets preserve every declaration; explanatory comments alone were removed.
- Production server started on loopback. Home page, status endpoint and 24-record catalog returned successfully.
- All 22 downloaded CSVs were served over HTTP and matched their saved SHA-256 hashes.
- Live NASA record retrieval: PSI-69 returned HTTP 200, Combustion Science, version 5; PSI-25 returned HTTP 200, Combustion Science, version 4.

## Two challenging search cases (actual local HTTP requests, no AI key)

1. "How do oxygen and pressure affect droplet extinction in microgravity?" → four source-linked catalog matches, including FLEX. These are relevant investigations, not an answer asserting a measured effect.
2. "Which experiments show whether changing ventilation and oxygen concentration alters flame propagation over solid materials in weightlessness?" → six source-linked catalog matches, including BASS-II. Flight investigations and ground modeling retain separate gravity labels.

Unknown banana-growth queries return no records. The common spelling "propogation" retrieves the documented flame-propagation context. These improvements are explicit lexical rules, not a claim of universal semantic understanding.

## Five-tab interaction coverage (simulated DOM)

- Overview Search opens Investigations results; question remains shared.
- Closing results, visiting another tab and returning does not reopen the popup.
- Every dropdown changes without opening a popup; reset restores the results.
- Empty matches retain both bordered preview cards. Selected records open actual details.
- Compare shows actual shared MDCA hardware for FLEX/FLEX-2 and fuel-category differences for FLEX/BASS-II.
- Rankings changes with the selected research goal, preserves source order and includes Lunar transfer limitations when selected.
- QA reacts to unsupported numeric claims, displays actual source conditions, saves temporary notes and accepts a cited statement from an AI-style response.

Happy DOM does not render pixels. This is not screenshot verification of the installed Windows version.

## OpenAI test boundary

The Responses adapter, schema handling, incomplete responses, authentication failures, provider replacement and grounding rejection paths were tested using a fake transport. NO paid or real OpenAI request was made. No usable credential was present in this workspace. Live success must be verified after installation and secure local entry of the user's existing key.

Configured status is not proof of successful authentication, billing or model access. No independent AI scientific reviewer is connected. Quote checks do not establish scientific entailment, validated numerical rankings or safe operating limits. Full CSV/document analysis beyond imported excerpts/sample rows remains pending.

## GitHub boundary

The existing repository URL is https://github.com/FreezeGrover/flames-in-freefall . Connected access returned 404. The local branch and commit are recorded in BUILD_INFO.json when the ZIP is packaged; remote publication is unverified.


## Loading-state regression update

25 Node tests now pass. The five-tab DOM test deliberately holds a request unresolved, verifies that no result rows or BASS-II placeholders appear, checks that repeat form submission makes only one request, then resolves the response and checks the final results. It also checks that an exhausted allowance shows AI Search Paused and that choosing catalog matches makes no additional request. Typecheck and production build passed. This remains simulated DOM verification, not a Windows screenshot check.


## Request-cap removal update

25 tests, typecheck and production build passed after cap removal. Five fake-transport calls succeed despite an old AI_MAX_REQUESTS=2 environment value. No live API request was made. Existing fetching, duplicate-request and scientific grounding checks remain covered.

## 15 November 2026 — numeric evidence checks

Continued from the supplied local ZIP application. Baseline history bundle contains commit cbf1bd112c66375ba586a1eac3b9efba1d8381ae; the application folder has no .git directory. No new commit or GitHub push is claimed.

Replaced numeric substring checks in AI grounding and deterministic QA with shared whole-token checks in src/lib/qa/numbers.ts. Signs, decimal values, scientific notation, grouped thousands and percent markers remain part of the numeric text. Only whitespace before a percent marker is normalized. Values are not converted or rounded. A matching token still does not establish correct units, scientific entailment or experimental comparability.

Baseline: 25 tests and TypeScript check passed. After changes: 28 tests, npm run typecheck and npm run build passed. The initial unprivileged incremental typecheck could not write its cache; the authorized rerun passed. No live paid AI requests were made.

Browser verification on localhost:3022: Scientific QA showed -999999% in the unsupported-value finding and Needs Review status. The existing draft was restored afterward. Reviewed the current Investigations and QA screens; no presentation or catalog files were edited. No new visual discrepancy observed on the affected QA screen. Original sketch paths in design-qa.md are from the earlier environment and unavailable here; exact pixel identity remains unverified. Existing compact/truncated text behavior was preserved.

Regression coverage includes substring collisions, signs, decimals, exponents, percentage markers, repeated values, rejection of an invented percentage from a real downloaded FLEX table, and continued pending scientific verification.


## Conversational research — 15 November 2026

The dashboard now uses POST /api/conversation for multi-turn research. The previous /api/research single-question endpoint remains available for compatibility and configuration status. All five tabs, existing presentation styles and NASA catalog are retained. A small sidebar action reopens the shared conversation; the existing research dialog hosts the discussion.

The composer supports Enter, Shift+Enter and an up-arrow send button. User messages appear immediately. A monotonic elapsed clock runs only during active work. Newline-delimited server events report actual local catalog retrieval, evidence-context construction, provider work and independent grounding checks. OpenAI Responses streaming is received server-side; unfinished prose is never published. Only a completed provider response that passes the deterministic source checks becomes an answer.

Research context includes the selected investigation, comparison pair, Rankings goal, QA source and mission environment. Follow-ups carry prior dialogue; prior assistant text is never scientific evidence. Ambiguous comparison references ask for clarification without spending a provider call. Sources can be opened in Investigations, sent to Compare, or handed to Scientific QA. Same-tab handoffs also refresh their selection/draft.

Conversation history lives in sessionStorage for this browser tab, with an in-memory fallback and an explicit storage notice. The full transcript remains visible; each request sends at most the latest 20 eligible messages and 48,000 history characters, with a visible notice when older context is omitted. Reload interruption is reported and can be retried. Cancellation aborts the local request and propagates to the provider transport; it does not establish that already-started provider work was unbilled. Retries use the original request snapshot and do not duplicate the user message. No app request-count cap was introduced.

The scientific engine reuses the imported NASA snapshot and downloaded table previews, selecting up to eight records. Original field excerpts are bounded (objectives/approaches 3,200 characters, table text 4,800 characters per selected record). This is not fresh NASA downloading, full-document analysis, a scientific prediction service, or independent semantic verification. Quotes and numeric text are checked against original named fields; exact source identities such as FLEX-2 are distinguished from measured values. Scientific verification remains pending.

The existing server-side key was reused after user confirmation. The final localhost production server uses the existing launcher's default model, gpt-5.4-mini. Provider settings retain store:false; conversation requests use a 60-second provider timeout, a 75-second client deadline and max_output_tokens:4200. Secrets are not stored in the transcript, sent to the browser or included in deliverables.

Verification: independently rechecked the 28-test baseline and TypeScript. Final npm test: 36 passed; npm run typecheck and npm run build passed. Automated tests use fake transports and cover follow-up context, ambiguity, numeric safeguards, identifiers, streamed completion, interrupted streams, timeout, API failure, upstream cancellation, keyboard behavior, elapsed time, retry, reload restoration, and the five-tab workflow. Three live browser provider requests were made: the initial droplet-extinction question, its pressure follow-up, and an explicit FLEX/FLEX-2 comparison. The final comparison used provider streaming and retained four checked paragraphs. An ambiguous comparison returned clarification without a provider call. Earlier live responses withheld paragraphs with mismatched quotes rather than presenting them as supported findings.

Browser review verified source expansion and handoffs to Investigations, Compare and Scientific QA, Rankings context, reload persistence and multiline input. The chat dialog fit a 390 x 844 viewport (client width and scroll width both 365px), with viewport settings restored afterward. The existing Compare page still overflows horizontally at that narrow width; this remains a known issue. Original approved sketches are unavailable at their recorded paths, so exact pixel fidelity is unverified. No existing screen styling was replaced; new chat styles reuse the blue/white dialog language.

The source folder has no .git directory. The supplied history bundle contains cbf1bd112c66375ba586a1eac3b9efba1d8381ae, verified as a commit object. That historical SHA is not represented as a commit of the current source. A source/test snapshot was retained before implementation. No new Git commit, push, public exposure or deployment was performed.

Implementation references: manually managed conversation input follows [OpenAI conversation-state guidance](https://developers.openai.com/api/docs/guides/conversation-state); completed provider events follow [OpenAI streaming guidance](https://developers.openai.com/api/docs/guides/streaming-responses). Structured source paragraphs use the existing Responses JSON-schema approach described in [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
