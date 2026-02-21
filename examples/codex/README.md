# Example: Codex + Effect-First

A minimal Effect-first CLI built by Codex using the effect-first.coey.dev reference.

## What this demonstrates

1. **AGENTS.md** — tells Codex to fetch the Effect reference before writing code
2. **The CLI** — a small but complete Effect program showing all core patterns:
   - `Effect.fn` for named functions
   - `Schema.TaggedError` for typed errors
   - `Context.Tag` + `Layer` for services
   - `Schema.Class` + branded types for data
   - `Layer.mergeAll` for composing multiple services
   - `@effect/vitest` for testing
3. **Two services** — `Greeter` (original) and `TodoRepo` (database-style CRUD):
   - `TodoRepo` — in-memory repository with `create`, `findById`, `complete`, `list`
   - Branded `TodoId`, `Schema.Class` for `Todo`, and two `TaggedError` types
   - Separate `testLayer` with deterministic "test-N" IDs

## Try it

```bash
npm install
npm run build

# Greeter
node dist/cli.js greet --name Alice
node dist/cli.js greet --name Alice --shout

# Todo CRUD
node dist/cli.js todo add --title "Buy milk"
node dist/cli.js todo add --title "Read a book"
node dist/cli.js todo list
node dist/cli.js todo done 1
node dist/cli.js todo list

# Tests
npm test
```

## How it was made

Codex was given the AGENTS.md in this directory and asked to build a minimal CLI.
The reference at effect-first.coey.dev provided all the patterns.
