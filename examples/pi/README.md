# Example: Pi + Effect-First

A minimal Effect-first CLI built by Pi using the effect-first.coey.dev reference.

## What this demonstrates

1. **.ai/instructions.md** — tells Pi to fetch the Effect reference before writing code
2. **The CLI** — a small but complete Effect program showing all core patterns:
   - `Effect.fn` for named functions
   - `Schema.TaggedError` for typed errors
   - `Context.Tag` + `Layer` for services
   - `Schema.Class` + branded types for data
   - `Schema.Config` for configuration
   - `@effect/vitest` for testing

## Try it

```bash
npm install
npm run build
node dist/cli.js greet --name Alice
node dist/cli.js greet --name Alice --shout
npm test
```

## How it was made

Pi was given the .ai/instructions.md in this directory and asked to build a minimal CLI.
The reference at effect-first.coey.dev provided all the patterns.
