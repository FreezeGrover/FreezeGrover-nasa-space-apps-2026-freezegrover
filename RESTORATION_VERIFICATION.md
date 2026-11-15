# Investigations restoration — 2026-11-14

Restored Fuel / Material, Oxygen & Pressure, Gravity, Hardware and Related PSI directly beneath search. Filters intersect the query. Restored objectives, sample geometry, variations, measurements, hardware relationships, related investigations and gravity/evidence gaps.

Root cause: literal search required every word of a question. Retrieval now removes question stop words and maps supported concepts to explicit catalog topics. Unknown substantive terms still yield no results. Retrieval remains independent of answer generation and scientific QA.

Four curated NASA summaries are available, not a live NASA feed. Shared hardware does not establish equivalent outcomes. Protocol pressure ranges are not per-run measurements. Partial-gravity coverage is missing in this starter catalog; this is not a claim about all NASA research. Metadata contains source links.

Verification:
- 14 automated tests passed; typecheck and production build passed.
- Browser verified all 17 non-default dropdown options, reset, combined filters, and related-record navigation.
- Exact question "how does microgravity affect flame spread" retrieved BASS-II.
- Liquid-fuel restriction on that question and unsupported banana-growth question correctly returned zero.
- Visually inspected all filters, shared relationships and gravity gaps.
- Desktop viewport 1363 x 936; document scroll dimensions identical. Search, filters, navigation and footer remain visible; result/detail panels scroll internally.
- Smaller desktop/mobile sizes were not visually verified.

GitHub access returned repository-not-found. Changes are committed locally; remote publication remains unverified. Windows localhost requires applying this update.
