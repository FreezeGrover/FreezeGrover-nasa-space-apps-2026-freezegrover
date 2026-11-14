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
