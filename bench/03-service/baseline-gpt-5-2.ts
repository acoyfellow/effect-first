Below is a complete implementation that satisfies all requirements and constraints.

---

## `src/Clock.ts`

```ts
import { Context, Effect, Layer } from "effect"

export interface Clock {
  readonly now: Effect.Effect<number>
}

export const Clock = Context.Tag("@app/Clock")<Clock>()

export const layer = Layer.succeed(Clock, {
  now: Effect.sync(() => Date.now())
})

export const testLayer = Layer.succeed(Clock, {
  now: Effect.succeed(1700000000000)
})
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
  yield* Effect.log(ts)
})

NodeRuntime.runMain(Effect.provide(main, Clock.layer))
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

---

### Notes (how this meets constraints)
- `Clock.now` is `Effect.Effect<number>` (so `R = never`).
- No `Effect.provide` inside the service implementation—only at the entry point (`main`) and in the test.
- Tag id is globally qualified: `@app/Clock`.
