# Task 04: Schema Classes

Build a small Effect program that defines schema-based types and encodes/decodes JSON.

Requirements:
- Define a `Schema.Class` model.
- Use branded types (e.g., `Schema.brand`).
- Use `Effect.gen` for sequencing.
- Use `Effect.fn` for named functions.
- Entry point uses `NodeRuntime.runMain`.
- Keep everything in one file named `main.ts`.

Behavior:
- Parse a JSON string into the schema, log a field, and re-encode it.
