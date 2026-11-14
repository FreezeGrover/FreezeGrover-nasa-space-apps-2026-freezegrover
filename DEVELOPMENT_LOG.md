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
