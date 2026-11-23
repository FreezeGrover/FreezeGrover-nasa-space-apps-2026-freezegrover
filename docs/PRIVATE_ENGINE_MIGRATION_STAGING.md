# Public/private scientific engine migration — verified staging gates

**Status: NOT READY FOR DELETION OR MERGE.** This branch is a safety checkpoint. No scientific logic has been removed and the live app remains unchanged.

## Verified observations (22 November 2026)

- The public dashboard directly imports scientific algorithms in client components:
  - `src/screens/Compare.tsx` imports `@/lib/comparison/compare`, plus experimental metadata.
  - `src/screens/Rankings.tsx` imports `@/lib/ranking/selection`, `@/lib/ranking/assessment`, and `@/lib/ranking/rank`.
  - `src/screens/ScientificQA.tsx` imports `@/lib/qa/citation-review`, `@/lib/qa/review` and `@/lib/qa/resources`.
  - `src/components/Dashboard.tsx` imports research/catalog and answer utilities.
- Public `src/app/api/research/route.ts` and `src/app/api/conversation/route.ts` invoke server-side OpenAI reasoning directly. Origin checks are not user authentication.
- The full AI prompt/policy/tool/review implementation remains under public `src/lib/ai/`; portions may be accessible in commit history and earlier clones even after removal.
- The separate private repository `FreezeGrover/flames-in-freefall` contains the five-tab research app and enhanced FLEX comparisons. Private Vercel project `flames-in-free-fall-private` has a READY production deployment and all-deployments SSO protection enabled, but application-level external researcher auth and a public-to-private service connection have not been verified.
- The proposed **three-question allowance** has not been established by reviewing the current public API routes; do not claim it exists or rely on client-only counters.

## Required implementation before removing any public code

1. **Preserve the public research experience:** enumerate every Overview, Investigations, Compare, Rankings, and Scientific QA action and capture regression fixtures and screenshots. Decide which publicly reproducible NASA data and UI may legitimately remain on the public frontend.
2. **Create explicit private API contracts:** versioned endpoints for comparison, rankings, QA, and conversational interpretation. Keep all proprietary scientific algorithms, prompts and OpenAI provider keys exclusively on the private server. Avoid duplicating calculation code in the public browser bundle.
3. **Authenticate and authorize every protected endpoint:** establish a server-to-server credential mechanism distinct from Vercel SSO/browser sign-in, identity-bound researcher permissions and revocation, and rate/abuse limits. Never put a service token in `NEXT_PUBLIC_*` or browser code. Deny unauthenticated calls before any paid model invocation.
4. **Specify the three-question policy exactly:** what qualifies as a question, free catalog-only behavior versus actual paid AI use, cross-device persistence, concurrent requests, reset/upgrade behavior, and owner override. Implement durable server-side metering and a deny-by-default spending guard; do not promise free requests if they trigger paid models.
5. **Switch public frontend to a compatible, authenticated backend-for-frontend:** use relative public routes that validate permissions and forward *server-to-server* only. Preserve current output schemas, source attribution, abort/cancel handling, uncertainty disclosures and independent scientific QA.
6. **Regression and security tests before the cutover:** run Node tests, TypeScript check, production build, browser screenshots, public/private comparison fixtures, accurate CSV source and units, multiple plausible interpretations, no unsupported risk claims, SSO deny/allow checks, API access and quota tests, and browser bundle inspection.
7. **Only then remove proprietary files and historical exposure:** ensure no remaining public imports, dynamic bundles, static files, or deployed source maps contain private logic. Note that Git history and previously cloned Apache-licensed code cannot be made secret retroactively. Preserve legally required copyright, license, NOTICE, NASA and third-party credits.
8. **Stage and review deployment:** verify protected private deployment first, then public preview, then merge and deploy only with green tests, verified authorization and no regression. Prepare rollback.

## Stop conditions

Do not delete modules, merge this staging PR, weaken SSO, expose private server routes or send paid OpenAI calls until the above checks are completed. Never equate a working local prototype with a secure external service.
