### `src/Clock.ts`

```ts
import { Context, Effect, Layer } from "effect"

class Clock extends Context.Tag("@app/Clock")<
  Clock,
  {
    readonly now: Effect.Effect<number>
  }
>() {
  static readonly layer = Layer.succeed(
    Clock,
    Clock.of({
      now: Effect.fn("Clock.now")(function* () {
        return Date.now()
      })
    })
  )

  static readonly testLayer = Layer.succeed(
    Clock,
    Clock.of({
      now: Effect.fn("Clock.now")(function* () {
        return 1700000000000
      })
    })
  )
}

export { Clock }
```

### `src/main.ts`

```ts
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { Clock } from "./Clock.js"

const main = Effect.gen(function* () {
  const clock = yield* Clock
  const ts = yield* clock.now
  yield* Effect.logInfo(`now=${ts}`)
})

NodeRuntime.runMain(main.pipe(Effect.provide(Clock.layer)))
```

### `test/clock.test.ts`

```ts
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { Clock } from "../src/Clock.js"

describe("Clock", () => {
  it.effect("now returns fixed timestamp in testLayer", () =>
    Effect.gen(function* () {
      const clock = yield* Clock
      const ts = yield* clock.now
      expect(ts).toBe(1700000000000)
    }).pipe(Effect.provide(Clock.testLayer))
  )
})
```
