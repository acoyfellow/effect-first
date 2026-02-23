Below is one way to implement Task 03 with the requested constraints (service methods require no environment, layers provided only at the entry point, globally-qualified tag id).

---

## `src/Clock.ts`

```ts
import { Context, Effect, Layer } from "effect"

export interface Clock {
  readonly now: Effect.Effect<number, never, never>
}

export const Clock = Context.Tag<Clock>("@app/Clock")

export const layer = Layer.succeed(Clock, {
  now: Effect.sync(() => Date.now())
} satisfies Clock)

export const testLayer = Layer.succeed(Clock, {
  now: Effect.succeed(1700000000000)
} satisfies Clock)
```

---

## `src/main.ts`

```ts
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import * as Clock from "./Clock.js"

const main = Effect.gen(function* () {
  const clock = yield* Clock.Clock
  const ts = yield* clock.now
  yield* Effect.log(`now = ${ts}`)
})

NodeRuntime.runMain(main.pipe(Effect.provide(Clock.layer)))
```

---

## `test/clock.test.ts`

```ts
import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"
import * as Clock from "../src/Clock.js"

describe("Clock", () => {
  it.effect("now returns the fixed timestamp", () =>
    Effect.gen(function* () {
      const clock = yield* Clock.Clock
      const ts = yield* clock.now
      expect(ts).toBe(1700000000000)
    }).pipe(Effect.provide(Clock.testLayer))
  )
})
```

This satisfies:
- Tag id is globally qualified: `@app/Clock`
- `Clock.now` has `R = never`
- `Clock.layer` uses `Date.now()`; `Clock.testLayer` is fixed
- `main` uses `Effect.gen`, yields the service, logs, and provides the layer only at the entry point
- test uses `@effect/vitest` and provides `Clock.testLayer` to assert the fixed value
