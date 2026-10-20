# Dashboard visual verification

Base: e7a4b714693b695ae5b5145c1383b5fc76b21569 on ui/dashboard-v1.

The supplied Microgravity Flame Research Dashboard reference guides proportions. This is the actual Next.js page rendered locally with the repository data and unchanged artwork, not a regenerated mockup.

## Changes

- Move homepage styles into app/dashboard.css; remove the accumulated dashboard override blocks from globals.css.
- Give hero, statistic row, pipeline, illustrations and sidebars one viewport-aware sizing system.
- Keep all four cards, descriptions, CTA buttons and right panels visible at tested desktop sizes without overflow hiding or browser zoom.
- Preserve actual source/experiment/finding counts and existing research/chat behavior.
- Correct the narrow inferred summary scope state type found by TypeScript.

## Checks

| CSS viewport | Horizontal overflow | Card text clipped | Desktop buttons below viewport | Broken images |
| --- | --- | --- | --- | --- |
| 1536×864 | no | no | no | 0 |
| 1280×600 | no | no | no | 0 |
| 1366×768 | no | no | no | 0 |
| 1536×1024 | no | no | no | 0 |
| 1536×700 | no | no | no | 0 |
| 1920×880 | no | no | no | 0 |
| 390×844 | no | no | mobile page scrolls | 0 |

Screenshots at 1536×864, 1280×600, 1536×1024 and 1536×700 were visually inspected. At 1536×1024, cards end at y=885, close to the supplied reference bottom at approximately y=874.

Summary and ranking card navigation passed browser interaction checks. No browser page errors were captured. TypeScript no-emit checking passed.

This verifies a local reproduction of the pushed repository. The user’s Windows localhost must still pull the commit before its rendered result can be confirmed. Existing API behavior and external AI responses were outside this visual change and were not exercised.
