# Example: Claude Code + Effect-First (HttpApi)

A minimal HttpApi server built by Claude Code using the effect-first.coey.dev reference.

## What this demonstrates

1. **CLAUDE.md** — tells Claude Code to fetch the Effect reference before writing code.
2. **HttpApi server** — a bookmarks CRUD API showing Effect-first server patterns:
   - `HttpApi`, `HttpApiGroup`, `HttpApiEndpoint` for declarative API definitions
   - `HttpApiBuilder.group` for typed handlers
   - `HttpApiClient.make` for end-to-end tests
   - `NodeHttpServer.layerTest` for integration tests without a real port
   - `Context.Tag` + `Layer` for repository services

## Run the server

```bash
npm install
npm run build
npm run server
# Server starts on http://localhost:3001

curl http://localhost:3001/api/bookmarks
curl -X POST http://localhost:3001/api/bookmarks \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://effect.website","title":"Effect"}'
```

## Run the tests

```bash
npm test
```

## How it was made

Claude Code was given the CLAUDE.md in this directory and asked to build a minimal HttpApi server.
The reference at effect-first.coey.dev provided all the patterns.

## Wiring

Claude Code reads `CLAUDE.md` from the project root automatically.
Place it at the repo root, or in any subdirectory — Claude Code walks up to find it.

The file tells Claude Code to `curl` the reference endpoints before writing Effect code.
No extension, no plugin — just a markdown file.

## How Claude Code discovers this file

Claude Code searches for `CLAUDE.md` in the repo root (and parent directories). This README documents the resulting project.
