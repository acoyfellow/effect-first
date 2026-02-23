Below is an idiomatic Effect solution that matches all requirements and constraints.

## `src/clock.ts`

```ts
import { Context, Effect, Layer } from "effect"

export class Clock extends Context.Tag("@app/Clock")<
  Clock,
  {
    readonly now: Effect.Effect<number>
  }
>() {
  static readonly layer = Layer.succeed(Clock, {
    now: Effect.sync(() => Date.now()),
  })

  static readonly testLayer = Layer.succeed(Clock, {
    now: Effect.succeed(1700000000000),
  })
}
```

## `src/main.ts`

```ts
import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { Clock } from "./clock.js"

const main = Effect.gen(function* () {
  const clock = yield* Clock
  const now = yield* clock.now
  yield* Effect.logInfo(`now=${now}`)
})

NodeRuntime.runMain(main.pipe(Effect.provide(Clock.layer)))
```

## `tests/clock.test.ts`

```ts
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { Clock } from "../src/clock.js"

describe("Clock", () => {
  it.effect("now returns the fixed timestamp in testLayer", () =>
    Effect.gen(function* () {
      const clock = yield* Clock
      const now = yield* clock.now
      expect(now).toBe(1700000000000)
    }).pipe(Effect.provide(Clock.testLayer))
  )
})
```

This satisfies:
- `Clock` is a `Context.Tag("@app/Clock")` with `{ now: Effect.Effect<number> }`
- `Clock.layer` uses `Date.now()` (via `Effect.sync`)
- `Clock.testLayer` always returns `1700000000000`
- `main` uses `Effect.gen`, logs the timestamp, and is run with `NodeRuntime.runMain` while providing `Clock.layer` at the entry point
- test uses `@effect/vitest` and provides `Clock.testLayer` to assert the fixed value
