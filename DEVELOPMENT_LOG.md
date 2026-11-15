## Clear Rankings and Scientific QA flows — 15 November 2026

Baseline: 8bdbfa618c0fddcf165ef65f39b22cc5ba3d6082. This entry supersedes the earlier immediate-results ranking behavior and collapsed-answer QA layout.

Rankings now requires an explicit environment choice (including All) and research goal. No goal is preselected and no investigation results appear before Show investigations. An optional question is part of that same submission, replacing Refine relevance. Each goal has its existing short description visible. Changing the environment, goal or question clears the visible results until a new submission; clearing a question follows the same rule. Submitted goal, question and environment are shown with results. Ranking setup is held in Dashboard so returning from QA restores it within the current page session. A different environment selected on another tab invalidates restored results and requires an explicit choice again. Refresh starts a fresh ranking setup. Scientific ranking criteria, all ten assessment dimensions and the twenty-point framework remain unchanged.

Scientific QA now shows the full original answer and question, then a selector for all cited statements, the selected statement and exact original passage, and source-specific check summaries. Selecting another statement updates its original source/field, quote, conditions and checks together. Show cited passage opens only the linked passage by default. Other passages and imported data remain under a separate Full source context disclosure. Source match, Test conditions, Limits and missing information, and Independent review use plain labels. Detailed checks, original source links and temporary draft notes remain available.

The new citation-review module checks exact attribution and numerical/unit transcription against the selected quotation. A positive passage match is not a semantic entailment verdict or scientific certification. The original model audit is carried separately; editing a statement does not rerun that model review. No human approval is implied. Source roles remain intact, and broader NASA articles are not presented as matched PSI experimental tests. Existing free-form/manual claim checks remain available when no cited passage is supplied.

Validation: 69 Node tests, four Python ingestion tests, TypeScript and production build passed. Regressions cover no unsolicited ranking results, all 24 goal/environment pairs, submission and invalidation, question clearing, return from QA, multi-source statement switching, exact passage display, collapsed broader context, source identity and unsupported numerical claims. Official source checks passed for 11 snapshots and 43 excerpts. PSI catalog SHA-256 remains AE01806DB3F4A6EF6679E7EAB290727B66DCBEBF0531116EC01977A23482284F.

Live browser: verified the empty Rankings state, disabled submission until choices are complete, Lunar Bases/Crew Safety submission and retained results after visiting QA. Goal descriptions are visible and the environment label has no trailing Choose. One authorized live question, How does microgravity affect flame propagation?, completed in six seconds of actual request time. QA displayed its full response, four cited statements and correct background roles. Selecting BASS-II changed the source to PSI-25, selected measurements passage and actual condition checks. Show cited passage displayed only that quotation; full source context remained collapsed. The source-match card opened its relevant check. Existing white/blue visual language and all five tabs remain.

The final production server was restarted on localhost:3022 (HTTP 200). Proof screenshots: rankings-clear-flow.png and qa-exact-cited-passage.png. Original approved sketches are unavailable; exact fidelity to them remains unverified. Browser inspection here was desktop only; existing narrow Compare overflow is unchanged. No GitHub push or deployment.

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

# Development log

## 14 November 2026 — local interface milestone

Created private repository FreezeGrover/flames-in-freefall in the signed-in GitHub browser. Confirmed initial main commit 7e47a2f2f123ee61b31a260c95910da39973dfe7. GitHub connector returns 404 for this new repository, so source synchronization remains blocked.

Implemented named functions and reusable function components across separate research, comparison, ranking, QA, and screen modules. Added local Kalam fonts and source-derived design illustrations. No NASA logo is used.

Created five white-and-blue screens and tested interactive navigation, selection, search, comparison attributes, goal filtering, mission context, disclosure, and manual recheck history in a local browser preview. Corrected Next.js reserved pages-directory conflict, desktop density, clipped sidebar labels, local development origins, and a filtered-selection inconsistency found during QA.

Production build and four scientific/data tests passed before final visual refinements; final verification is recorded in design-qa.md. Live NASA data and AI integration were explicitly deferred while organizers arrange access. No deployment or paid API calls occurred.

## Typography revision

At the project lead's request, replaced cursive interface text with Segoe UI / Arial. Preserved the Kalam brand wordmark and the supplied flame logo. Reduced desktop navigation text to 20px to avoid clipping with wider sans-serif letters. Inspected all five local screens; Compare and QA had no horizontal viewport overflow. Added an idempotent PowerShell helper to apply the same change to the Windows copy without re-extracting the project.

## 2026-11-14: Investigation restoration
Restored metadata filters and experiment sections, conservative natural-question retrieval, explicit source/missing-data boundaries, related navigation and viewport fit. See RESTORATION_VERIFICATION.md.

## 2026-11-14: NASA PSI combustion ingestion
Retrieved and validated all 24 combustion records (19 flight-category, five ground-category), 24 inventories and 22 original experimental CSVs across 20 records. Connected the shared snapshot across all five tabs, source provenance, original previews and relationships; retained provider-independent pending scientific QA. Added bounded read-only ingestion, compilation and validation. See PSI_CONNECTION.md for evidence and limitations. GitHub still returns 404.

## Compact typography across all tabs
Reduced oversized internal headings, body text, table labels, ranking cards and QA controls across all five tabs. The brand wordmark and research logic are unchanged. Added a final compact CSS layer, with further spacing adjustments for short desktop viewports.

## Research Briefing presentation
Replaced truncated bullet excerpts with short source-based topic cards, refined Segoe UI typography and compact citation links. Overview and Investigations share the presentation; original PSI records are unchanged. Typecheck/build passed; preview and three citations inspected.

## Research browsing popups
Compact inline results and selected-record cards now open native modal dialogs. Results use a 24-record card grid; selection updates the dashboard. Details retain evidence/CSV/source links. Compare has searchable A/B pickers and seven expandable attribute cards in a full-comparison popup. Escape/Close and source navigation checked in browser. Typecheck, 12 tests and production build passed. No GitHub publication is claimed.

## Mission context, applications and compact Rankings
Mission Context now explains environment-specific transfer checks without filtering or asserting suitability. Application panels open source-linked topic browsers with explicit potential-relevance limitations. Selected investigation popup styling and comparison borders strengthened. Rankings goal buttons reduced, environment selector moved to popup, result previews open the full result list and investigation details. Rover gravity is destination-dependent. Automated context tests, typecheck and build passed. Latest visual verification remains pending: automatic approval review rejected the preview tool as conflicting with localhost-only authorization; no bypass attempted.

## Scientific QA visual and wording alignment
Replaced legacy large banner and inline expanded checklist with compact draft/review cards. Review evidence opens original PSI provenance and CSVs; Review history opens session note snapshots. Save review note records the exact draft with PSI identity/version, never a completed check. Removed fake manual recheck messages and fixed hypothetical uncertainty example. Notes reset when leaving QA or reloading. Independent QA remains provider-neutral and pending; no automated reviewer is claimed. 15 tests, SSR render checks, typecheck and build passed. Browser visual verification remains pending due the previously rejected preview launch.

## QA borders, Title Case and desktop screen fit
QA review areas now use Title Case, larger readable labels, blue card outlines and blue accents. Added Overview and Investigations header titles. Final CSS layer sizes Overview and QA workspaces to available desktop height, compacts mission choices and spacing, and retains full evidence in popups. 15 tests, Title Case/header SSR checks, typecheck and production build passed. Final browser screen-fit verification is pending; no unsupported visual-completion claim is made.

## Shared blue research cards and honest source label
Extended QA soft-blue backgrounds and borders to relevant overview, investigation, comparison and ranking cards. Kept long evidence/table reading surfaces white. Removed the unused Simple/Scientific switch and its state; search header now displays NASA PSI · Combustion Science. 15 tests, typecheck and production build passed. Latest visual verification remains pending under the existing preview restriction.

## Visible research search output
Each explicit Search submission increments a request signal and opens the results dialog, including repeated identical queries. The output popup displays the submitted question, current filtered NASA records and a clear-filter action. Selecting a result opens full details. The always-visible result launcher precedes the compact inline preview; only one preview row is retained on desktop. Search retrieval and source catalog are unchanged. 15 tests, typecheck, build and six-result SSR/launcher-order check passed. Interactive browser verification remains pending under the existing preview restriction.

## Prevent clipped investigation launcher buttons
Removed inline result rows and long selected-record preview from the compact dashboard panels. Results/detail actions precede optional copy; minimum panel height reserves space. Briefing and context spacing reduce on shorter desktop viewports. Full data remains in popups. 15 tests, launcher-order/no-inline-list SSR checks, typecheck and build passed. Final visual verification on the user viewport remains pending.


## Search popup navigation and compact empty previews — 2026-11-14
- Reproduced on the user's Edge localhost:3022 page: returning to Investigations replayed the previous search popup; an empty result preview had scrollHeight 127 versus clientHeight 96.
- Dashboard now owns results visibility. Explicit Search opens it, dismissal closes it, and tab navigation closes it without submitting again. The shared question and submitted search remain intact. No remount effect replays an old request.
- Empty results use one compact status line. The unselected investigation keeps a matching bordered card and action to review search/filters; full explanations remain in the popup. Preview children cannot shrink into one another.
- Inspected the existing Overview, Compare and Scientific QA: no measured container overflow at 1272x588. Rankings had outer content overflow (721 vs 621 CSS layout units); compacted short-screen preview to one row with the complete list still in its popup. Added long-text containment for preview headings.
- Validation: 15 tests pass, typecheck passes; server-rendered all-record, flame-propagation and unsupported-query previews pass. Production build passes. The corrected package is not yet installed in the Windows browser, so post-install interactive and visual verification remains pending.
- GitHub publication has not been performed or verified. Scientific retrieval and QA semantics were not changed.

### Post-install regression checklist
1. Search from Overview; close results; visit another tab, then Investigations. No automatic popup should appear; the same submitted question remains.
2. Press Search again (including the identical question) or View search results: popup opens.
3. Choose liquid droplets with a flame-propagation question: zero results, compact status and both bordered preview cards remain visible without overlapping the application buttons.
4. Reset filters and verify results and details actions align.
5. At 1272x588 inspect all five tabs; short Rankings preview shows one candidate and Browse all exposes the full list.


## Scientific responses and revised architecture — 15 November 2026 (Pakistan)

Withdrew mandatory modularity for frontend/infrastructure; retained normal React conventions and the approved design. Deliberate modules remain in scientific and NASA-retrieval functions. Removed explanatory UI/CSS comments and added natural comments in retrieval/reasoning/QA code. All 20 CSS files retain their prior declarations.

Replaced fixed research-briefing examples with submitted-question/filtered-record excerpts. Compare now derives similarities and differences from the selected records. Rankings/application explanations use actual topics, hardware, table availability and mission transfer context. QA reacts to the draft and chosen source, detects unsupported narrative numbers and missing baselines, and keeps scientific verification pending. Empty related-investigation sections explain missing imported links.

Implemented server-side OpenAI Responses adapter behind an injected provider boundary and separate grounding checks. No secret is shipped; the PowerShell launcher accepts an existing key through hidden input, asks for a paid-attempt cap and keeps the credential in the server environment only. Google integration is deferred. No live OpenAI test was possible without a local key; all adapter contract tests use a fake transport. This is not autonomous scientific verification.

24 Node tests, four Python tests, typecheck, production build and loopback HTTP checks passed. Two challenging HTTP search cases returned four and six documented matches; all 22 CSV downloads matched their saved hashes. Live NASA PSI-69 and PSI-25 returned HTTP 200 and correct categories/versions. Updated Windows visual review and real OpenAI success remain pending. Connected GitHub access returned 404; only a local commit is claimed. See VERIFICATION.md.


## Search loading and exhausted-budget behavior — 15 November 2026

The user observed catalog results appearing before the slower AI response replaced them. Investigations now hides provisional matches, briefings and selection until the request finishes. Overview uses the same fetching state if revisited while a request is pending. The popup says “Fetching information… Please wait.” No artificial delay was added.

Search is disabled while pending and a synchronous in-flight guard prevents repeat submissions from consuming more attempts. The configured AI cap remains unchanged. Exhaustion returns an explicit unavailable state without pretending to have no scientific evidence or silently replacing AI output with catalog results. The user can choose catalog browsing explicitly without a paid call.

25 tests, typecheck and production build pass. A deferred-response DOM test checks the loading state, absence of provisional cards, duplicate-submission guard, final display and explicit catalog choice. The exhausted-budget API test makes no external request. Updated Windows visual verification remains pending installation; no live paid API request was made in this task.


## Remove artificial request-count cap — 15 November 2026

After receiving model pricing estimates, the user explicitly authorized removal of the two-request cap. Removed the request counter, AI_LIMIT_REACHED branch, count-dependent configuration and launcher prompt. Existing AI_MAX_REQUESTS environment values are ignored, so old startup commands setting 2 no longer cap searches. Retained duplicate-submission protection, the fetching state, output-length/timeout constraints and independent NASA grounding.

25 tests, typecheck and production build pass. A fake-transport regression makes five calls while AI_MAX_REQUESTS is set to 2, confirming there is no local request-count enforcement. No live paid requests were made. The user's reported 10-million-token offer has not been independently verified for project/model eligibility or expiration; no free-usage guarantee is made.

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
