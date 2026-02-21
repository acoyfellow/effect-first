# Task 03 — Service & Layer

Build a `Clock` service that provides the current timestamp.

## Requirements

1. **`Clock` tag** — `Context.Tag("@app/Clock")` with interface `{ readonly now: Effect.Effect<number> }`.
2. **`Clock.layer`** — a `Layer.succeed` that returns `Date.now()`.
3. **`Clock.testLayer`** — a `Layer.succeed` that always returns `1700000000000`.
4. **`main`** — an `Effect.gen` that yields `Clock`, calls `now`, logs it, runs via `NodeRuntime.runMain` with `Effect.provide(Clock.layer)`.
5. **`clock.test.ts`** — an `@effect/vitest` test using `Clock.testLayer` that asserts `now` returns the fixed timestamp.

## Constraints

- Service methods must have `R = never`.
- Layer composed and provided at entry point only — no `Effect.provide` inside services.
- Tag ID must be globally qualified (`@scope/Name`).
