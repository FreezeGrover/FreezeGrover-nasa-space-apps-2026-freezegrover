# Project instructions

- Preserve the supplied white-and-blue five-screen design. Blue marks hover and selection.
- Use small named functions and function components, one responsibility per module.
- Keep comments natural, explaining the reason for non-obvious code.
- Keep data separate from UI. Never copy mockup measurements, scores, or verified counts into the research inventory.
- NASA source links are not evidence of successful data ingestion. Mark missing information explicitly.
- No scientific claim may be Verified without completed evidence checks.
- Keep QA logically independent of answer generation when it is connected.
- Keep secrets on the server and outside Git. No paid requests without approved limits.
- Localhost only. Do not use Sites or deploy without a new explicit request.
- Run npm test, npm run typecheck, and npm run build for meaningful changes; inspect affected UI in a browser.
- Update documentation and development log. GitHub is canonical; do not claim a push succeeded without remote evidence.
- Private repository only. No public exposure, deletion of existing work, or license addition without approval.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
