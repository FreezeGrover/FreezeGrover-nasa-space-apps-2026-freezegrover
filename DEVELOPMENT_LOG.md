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
