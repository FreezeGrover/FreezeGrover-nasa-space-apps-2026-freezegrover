# Flames in Free Fall

A private combustion research dashboard for NASA Space Apps. This milestone implements the five-screen white-and-blue interface from the supplied references.

## Run locally on Windows

Install Node.js 22 or newer from https://nodejs.org if needed. Extract this project, then double-click `start-local.cmd`. Open **http://localhost:3020** after the terminal says Ready. Keep the terminal open. Stop with Ctrl+C.

Or use PowerShell inside the project folder:

```powershell
npm ci
npm run dev -- --port 3020
```

No Sites hosting or public deployment is used. No API key is needed for the shipped public PSI snapshot.

## Current behavior

- Overview, Investigations, Compare, Rankings, and Scientific QA navigation.
- White panels, blue borders, blue hover and selected states; clean sans-serif interface text with a Kalam brand wordmark.
- Search over 24 retrieved NASA PSI combustion records, five metadata filters, source-linked details, and original downloaded CSV previews.
- Side-by-side comparison and additional attributes.
- Goal-based relevance filtering with explicit limitations for partial-gravity habitats.
- Local review controls and recheck history. No claim is marked Verified.
- AI disclosure modal explains actual connection status.

NASA PSI metadata and selected original experimental CSV retrieval are connected through a verified local snapshot. The OpenAI adapter is implemented and enabled only with a server-side key, model and approved request limit. Without that configuration, search explicitly falls back to catalog retrieval. Independent scientific claim verification remains pending. See ARCHITECTURE.md and SCIENTIFIC_QA.md. NASA authentication and AI-provider credentials are separate concerns.

## Checks

```text
npm test
npm run typecheck
npm run build
```

The default development server binds to 0.0.0.0 for preview compatibility. For strict computer-only access, run `npx next dev --hostname 127.0.0.1 --port 3020` instead.

## Project files

`src/components/` contains reusable function components. `src/screens/` contains the five screens. `src/lib/` holds separate research, comparison, ranking, and QA functions. `src/types/` defines shared data. See ARCHITECTURE.md for how they connect.

## Repository status

Canonical repository: https://github.com/FreezeGrover/flames-in-freefall (private).
Initial remote commit: 7e47a2f2f123ee61b31a260c95910da39973dfe7.
The connected GitHub app currently returns 404 for this new private repository, so this UI milestone has not been pushed. The downloadable source preserves the work while repository access is resolved.

No open-source license has been added. Design assets are extracted from user-provided mockups; the flame image is illustrative, not experimental imagery.

See PSI_CONNECTION.md for verified counts, refresh commands, access limits and scientific evidence boundaries.


## Local OpenAI startup

Use PowerShell from the extracted project folder: `& .\start-openai-local.ps1`. The launcher accepts your existing key with hidden input and keeps it in the server process environment, not a file. It asks you to approve a maximum paid Search attempt count (default one). Failed requests count too; a restart resets the count. This is not a billing-account dollar cap. Stop an existing server on port 3022 first. No key belongs in chat, Git, the ZIP or browser source. `.env.example` contains only non-secret examples and disables calls by default.

The model ID is configurable (launcher default `gpt-5.4-mini`, documented by OpenAI as supporting Responses and structured output). Your account's model access and billing are not verified until a real request succeeds. Official references: https://developers.openai.com/api/docs/models/gpt-5.4-mini and https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses . Google Cloud integration remains deferred.
