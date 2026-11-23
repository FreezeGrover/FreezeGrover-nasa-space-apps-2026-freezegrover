# Protected scientific engine boundary — staging acceptance contract

## Owner requirement
The public NASA Space Apps repository must be an interface, **not a distributable copy of the scientific engine**. The private `FreezeGrover/flames-in-freefall` repository is canonical for proprietary algorithms, interpretation instructions, all tab operations, and scientific QA implementations.

## Public repository: allowed
- Five-tab presentation (navigation, layout, styling, accessibility, loading/error states).
- Browser-side rendering and request DTO/types that reveal no proprietary methods.
- A server-side proxy that authenticates individual users, enforces the complimentary allowance, and calls authenticated private endpoints without sending tokens to the browser.
- Public citations and NASA material already licensed for redistribution, as needed for visible references.

## Private repository: required
- Investigation retrieval, indexing, filters, enrichment and research orchestration.
- Comparison functions, numerical CSV processing and interpretation of compatible measurements.
- Ranking formulas, weights, evidence scoring and decision rules.
- Scientific QA logic, supporting/conflicting evidence assessment, units and uncertainty checks.
- AI prompts, policies, tool calling, and **multiple plausible scientific interpretations**.
- OpenAI provider integration, secrets, per-user usage ledger, ten-question free allowance, cost/budget enforcement and permissions.
- Versioned private endpoints for each workflow used by public tabs, not just research and conversation.

## Hard release gates
1. Inventory ALL public imports, dynamic imports, API routes, worker scripts, bundled assets and exports that expose protected logic. Inspect all five tabs and their dependencies; don't assume proxying two API routes removes remaining logic.
2. Implement equivalent private operations, enforce auth/authorization and atomic usage-cost limits, and integrate all public tabs via authenticated server-side requests.
3. Confirm the 10-question complimentary policy applies to AI interpretation only; browsing and numeric evidence lookup do not consume credits. Advanced interpretations ALWAYS use AI, with grounded evidence and independent QA.
4. Verify unauthorized requests fail, authorized requests work, provider keys never enter browser output, client bundles do not contain protected source, and API calls cannot bypass quotas.
5. Run comparison, ranking, interpretation, QA and full UI end-to-end regression checks against existing known-good outputs.
6. Only after successful verification remove protected logic from the public working tree; consider historical Git commits, existing clones, forks, and previously deployed assets separately. Removing files from a branch does not erase historical access.
7. No production merge or deployment until the private backend is live, protected, and the public UI works fully through it.

## Current status
Staging has an authenticated server-to-server proxy for research and conversation. This does **not** yet cover all tab dependencies; private API hosting, user identity, metering, and end-to-end verification are not complete. Do not delete public implementations prematurely.
