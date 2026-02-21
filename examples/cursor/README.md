# Example: Cursor + Effect-First

A Schema validation CLI built by Cursor using the effect-first.coey.dev reference.
Validates JSON input against Effect Schemas with typed errors and a registry service.

## What this demonstrates

1. **.cursor/rules/effect-first.mdc** — tells Cursor to fetch the Effect reference before writing code
2. **The CLI** — a schema validation tool showing core + intermediate patterns:
   - `Effect.fn` for named functions
   - `Schema.TaggedError` for typed errors (`SchemaNotFoundError`, `JsonParseError`, `ValidationFailedError`)
   - `Context.Tag` + `Layer` for services (`SchemaRegistry`, `Validator`)
   - `Schema.Class` + branded types for data (`User`, `Product`, `Address`)
   - `Schema.pattern` / `Schema.brand` for domain validation (`Email`, `Sku`, `ZipCode`, `Age`, `Price`)
   - Multi-service composition with `Layer.provide`
   - `@effect/vitest` for testing

## Try it

```bash
npm install
npm run build

# List available schemas
node dist/cli.js list

# Validate valid JSON
node dist/cli.js validate --schema user --json '{"name":"Alice","email":"alice@example.com","age":30}'
node dist/cli.js validate --schema product --json '{"sku":"AB-123","title":"Widget","price":9.99,"inStock":true}'
node dist/cli.js validate --schema address --json '{"street":"123 Main St","city":"Springfield","state":"IL","zip":"62701"}'

# Validation failures
node dist/cli.js validate --schema user --json '{"name":"Alice","email":"bad","age":-5}'
node dist/cli.js validate --schema product --json '{"sku":"bad","title":"","price":0,"inStock":true}'

# Run tests
npm test
```

## How it was made

Cursor was given the .cursor/rules/effect-first.mdc in this directory and asked to build a schema validation CLI.
The reference at effect-first.coey.dev provided all the patterns.

## How the agent discovers this file

Cursor reads `.cursor/rules/effect-first.mdc`. This README documents the resulting project.
